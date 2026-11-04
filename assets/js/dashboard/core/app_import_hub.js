// ============================================================
// app_import_hub.js — Central de Importação Inteligente de Dados
// Unifica o upload de relatórios Excel/CSV e distribui para todas as abas.
// ============================================================

(function () {
    "use strict";

    const STORAGE_KEY = "nossanet_dashboard_global_data_v1";
    const FILE_DB_NAME = "nossanet_dashboard_files_v1";
    const FILE_DB_VERSION = 1;
    const FILE_STORE_NAME = "imported_files";
    const MODULE_IMPORT_STORAGE_KEYS = [
        "atendimentos-importados-v1",
        "atendimentos-os-v1",
        "atendimentos-os-meta-v1",
        "os-registros-v1",
        "os-registros-meta-v1",
        "chat-registros-v1",
        "chat-estatisticas-v1",
        "chat-arquivo-meta-v1",
        "nps-cancelamentos-v1",
        "nps-arquivo-meta-v1",
        "pesquisa-registros-v1",
        "pesquisa-registros-meta-v1",
        "prospecto-registros-v1",
        "prospecto-registros-meta-v1"
    ];

    // Armazenamento global em memória das fontes de dados
    window.GlobalDashboardHub = window.GlobalDashboardHub || {
        hubsoft: null,
        os: null,
        chat: null,
        nps: null,
        pesquisa: null,
        prospectos: null
    };

    // Função utilitária para obter elementos atualizados do DOM
    function getEl(id) {
        return document.getElementById(id);
    }

    // ------------------------------------------------------------
    // INICIALIZAÇÃO
    // ------------------------------------------------------------
    async function init() {
        vincularEventos();
        await carregarCacheSalvo();
        verificarAberturaAutomatica();
    }

    function vincularEventos() {
        const btnOpenModal = getEl("btnOpenGlobalImport");
        const btnCloseModal = getEl("btnCloseGlobalImport");
        const modal = getEl("globalImportModal");
        const fileInput = getEl("globalFileInput");
        const dropZone = getEl("globalDropZone");
        const btnProcess = getEl("btnProcessGlobalData");
        const btnClear = getEl("btnClearGlobalData");

        if (btnOpenModal) {
            btnOpenModal.onclick = abrirModal;
        }

        if (btnCloseModal) {
            btnCloseModal.onclick = fecharModal;
        }

        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) fecharModal();
            };
        }

        if (fileInput) {
            fileInput.onchange = (e) => {
                const files = Array.from(e.target.files || []);
                processarArquivosSelecionados(files);
            };
        }

        if (dropZone) {
            dropZone.ondragover = (e) => {
                e.preventDefault();
                dropZone.classList.add("global-dropzone--active");
            };

            dropZone.ondragleave = () => {
                dropZone.classList.remove("global-dropzone--active");
            };

            dropZone.ondrop = (e) => {
                e.preventDefault();
                dropZone.classList.remove("global-dropzone--active");
                const files = Array.from(e.dataTransfer.files || []);
                processarArquivosSelecionados(files);
            };
        }

        if (btnProcess) {
            btnProcess.onclick = aplicarEAtualizarDashboard;
        }

        if (btnClear) {
            btnClear.onclick = limparTodosDados;
        }
    }

    function abrirModal() {
        const modal = getEl("globalImportModal");
        if (modal) {
            modal.style.display = "flex";
        }
    }

    function fecharModal() {
        const modal = getEl("globalImportModal");
        if (modal) {
            modal.style.display = "none";
        }
    }

    function verificarAberturaAutomatica() {
        const possuiDados = Object.values(window.GlobalDashboardHub).some(val => val !== null);
        if (!possuiDados) {
            setTimeout(() => {
                abrirModal();
            }, 600);
        }
    }

    // Expoe abrirModal globalmente
    window.abrirCentralImportacao = abrirModal;

    // ------------------------------------------------------------
    // PROCESSAMENTO E DETECÇÃO INTELIGENTE DE ARQUIVOS
    // ------------------------------------------------------------
    async function processarArquivosSelecionados(files) {
        if (!files || files.length === 0) return;

        for (const file of files) {
            const data = await lerArquivoExcelOuCsv(file);
            if (!data || data.length === 0) continue;

            const identificacao = identificarTipoRelatorio(data, file.name);
            const tipoDetectado = identificacao.tipo;

            if (identificacao.baixaConfianca && !confirmarTipoRelatorio(file.name, identificacao)) {
                console.warn("[Import Hub] Arquivo ignorado após confirmação manual:", file.name);
                continue;
            }

            if (tipoDetectado) {
                window.GlobalDashboardHub[tipoDetectado] = {
                    nomeArquivo: file.name,
                    linhas: data,
                    rawFile: file
                };

                await salvarArquivoPersistido(tipoDetectado, file, data);

                atualizarBadgeStatus(tipoDetectado, true, file.name, data.length);
            }
        }

        verificarBotaoProcessar();
    }

    function normalizarIdentificador(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "");
    }

    function identificarTipoRelatorio(linhas, nomeArquivo) {
        const primeiraLinha = linhas[0] || {};
        const cabecalhos = new Set(Object.keys(primeiraLinha).map(normalizarIdentificador));
        const nome = normalizarIdentificador(String(nomeArquivo || "").replace(/\.[^.]+$/, ""));
        const pontuacao = {
            hubsoft: 0,
            os: 0,
            chat: 0,
            nps: 0,
            pesquisa: 0,
            prospectos: 0
        };

        const possui = (...nomes) => nomes.some(nomeColuna => cabecalhos.has(normalizarIdentificador(nomeColuna)));
        const soma = (tipo, pontos, ...nomes) => {
            if (possui(...nomes)) pontuacao[tipo] += pontos;
        };

        // Assinaturas fortes e específicas dos relatórios reais.
        soma("hubsoft", 7, "id_atendimento");
        soma("hubsoft", 4, "data_abertura");
        soma("hubsoft", 3, "tipo_atendimento");
        soma("hubsoft", 2, "protocolo");
        soma("hubsoft", 2, "status_fechamento");

        soma("os", 7, "id_ordem_servico");
        soma("os", 7, "numero_ordem_servico");
        soma("os", 4, "tipo_ordem_servico");
        soma("os", 3, "data_termino_executado");
        soma("os", 3, "tecnicos");
        soma("os", 2, "olt");
        soma("os", 2, "pon");

        soma("chat", 5, "fila");
        soma("chat", 5, "tempo_resposta");
        soma("chat", 4, "mensagens");

        soma("nps", 7, "data_cancelamento");
        soma("nps", 7, "motivo_cancelamento");
        soma("nps", 3, "usuario_cancelamento");
        soma("nps", 4, "nps");
        soma("nps", 3, "avaliacao");
        soma("nps", 3, "detrator");

        soma("pesquisa", 6, "questionario");
        soma("pesquisa", 6, "resposta_pesquisa");

        soma("prospectos", 7, "id_prospecto");
        soma("prospectos", 6, "prospecto");
        soma("prospectos", 4, "crm");
        soma("prospectos", 2, "origem");

        // O nome do arquivo é apenas uma evidência auxiliar, nunca uma busca parcial.
        if (/(^|_)ordens?_de_servico($|_)/.test(nome) || /(^|_)ordem($|_)/.test(nome)) pontuacao.os += 2;
        if (/(^|_)atendimentos?($|_)/.test(nome)) pontuacao.hubsoft += 2;
        if (/(^|_)(chat)($|_)/.test(nome)) pontuacao.chat += 2;
        if (/(^|_)relatorio_atendimento_analitico(_|$)/.test(nome)) pontuacao.chat += 8;
        if (/(^|_)(nps|cancelamento|cancelamentos)($|_)/.test(nome)) pontuacao.nps += 2;
        if (/(^|_)(pesquisa)($|_)/.test(nome)) pontuacao.pesquisa += 2;
        if (/(^|_)detalhamento_de_pesquisa(_|$)/.test(nome)) pontuacao.pesquisa += 8;
        if (/(^|_)(prospecto|prospectos|lead|leads)($|_)/.test(nome)) pontuacao.prospectos += 2;

        const ranking = Object.entries(pontuacao).sort((a, b) => b[1] - a[1]);
        const [tipo, pontos] = ranking[0];
        const segundoPontos = ranking[1][1];
        const baixaConfianca = pontos < 7 || pontos - segundoPontos < 2;

        return {
            tipo: pontos > 0 ? tipo : "hubsoft",
            pontuacao: pontos,
            segundoPontos,
            baixaConfianca,
            ranking
        };
    }

    function confirmarTipoRelatorio(nomeArquivo, identificacao) {
        const rotulos = {
            hubsoft: "Atendimentos / Hubsoft",
            os: "Ordens de Serviço",
            chat: "Chat",
            nps: "NPS / Cancelamentos",
            pesquisa: "Pesquisa de Satisfação",
            prospectos: "Prospectos"
        };
        const tipo = rotulos[identificacao.tipo] || identificacao.tipo;
        return window.confirm(
            `Não foi possível identificar este arquivo com alta confiança:\n\n${nomeArquivo}\n\n` +
            `A melhor correspondência foi “${tipo}” (pontuação ${identificacao.pontuacao}).\n\n` +
            "Deseja importar usando essa categoria?"
        );
    }

    function lerArquivoExcelOuCsv(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                    resolve(json);
                } catch (err) {
                    console.error("Erro ao ler arquivo:", err);
                    resolve([]);
                }
            };
            reader.onerror = () => resolve([]);
            reader.readAsArrayBuffer(file);
        });
    }

    function atualizarBadgeStatus(tipo, carregado, nomeArquivo, totalLinhas) {
        const badge = document.querySelector(`.report-badge[data-type="${tipo}"]`);
        if (!badge) return;

        const statusEl = badge.querySelector(".badge-status");
        if (carregado) {
            badge.classList.add("report-badge--loaded");
            if (statusEl) {
                statusEl.className = "badge-status status-success";
                statusEl.textContent = `${totalLinhas} registros (${nomeArquivo})`;
            }
        } else {
            badge.classList.remove("report-badge--loaded");
            if (statusEl) {
                statusEl.className = "badge-status status-pending";
                statusEl.textContent = "Pendente";
            }
        }
    }

    function verificarBotaoProcessar() {
        const btnProcess = getEl("btnProcessGlobalData");
        const possuiDados = Object.values(window.GlobalDashboardHub).some(val => val !== null);
        if (btnProcess) {
            btnProcess.disabled = !possuiDados;
        }
    }

    // ------------------------------------------------------------
    // DISPARO GLOBAL E ATUALIZAÇÃO DAS ABAS
    // ------------------------------------------------------------
    function aplicarEAtualizarDashboard() {
        const hubData = window.GlobalDashboardHub;

        distribuirParaModulos(hubData);
        salvarCache(hubData);

        fecharModal();
        exibirNotificacaoSucesso("Dados importados e distribuídos com sucesso para todas as abas!");
    }

    function distribuirParaModulos(hubData) {
        window.dispatchEvent(new CustomEvent("dashboardDataUpdated", { detail: hubData }));

        if (hubData.hubsoft && hubData.hubsoft.rawFile) {
            injetarArquivoNoInput("arquivoInput", hubData.hubsoft.rawFile);
        }
        if (hubData.os && hubData.os.rawFile) {
            injetarArquivoNoInput("arquivoOsInput", hubData.os.rawFile);
            injetarArquivoNoInput("osFileInput", hubData.os.rawFile);
        }
        if (hubData.chat && hubData.chat.rawFile) {
            injetarArquivoNoInput("chatArquivoInput", hubData.chat.rawFile);
        }
        if (hubData.nps && hubData.nps.rawFile) {
            injetarArquivoNoInput("npsArquivoInput", hubData.nps.rawFile);
        }
        if (hubData.pesquisa && hubData.pesquisa.rawFile) {
            injetarArquivoNoInput("pesquisaArquivoInput", hubData.pesquisa.rawFile);
        }
        if (hubData.prospectos && hubData.prospectos.rawFile) {
            injetarArquivoNoInput("prospectoInput", hubData.prospectos.rawFile);
        }
    }

    function injetarArquivoNoInput(idInput, file) {
        const input = getEl(idInput);
        if (!input) return;

        try {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;
            input.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (e) {
            console.log(`Injeção nativa em ${idInput} usando fallback.`);
        }
    }

    function salvarCache(hubData) {
        try {
            const cacheSimplificado = {};
            Object.keys(hubData).forEach(key => {
                if (hubData[key]) {
                    cacheSimplificado[key] = {
                        nomeArquivo: hubData[key].nomeArquivo,
                        linhas: hubData[key].linhas
                    };
                }
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheSimplificado));
        } catch (e) {
            console.warn("Não foi possível salvar cache no LocalStorage:", e);
        }
    }

    function abrirBancoArquivos() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                resolve(null);
                return;
            }

            const request = window.indexedDB.open(FILE_DB_NAME, FILE_DB_VERSION);
            request.onupgradeneeded = () => {
                const banco = request.result;
                if (!banco.objectStoreNames.contains(FILE_STORE_NAME)) {
                    banco.createObjectStore(FILE_STORE_NAME, { keyPath: "tipo" });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function salvarArquivoPersistido(tipo, file, linhas) {
        try {
            const banco = await abrirBancoArquivos();
            if (!banco) return;

            const buffer = await file.arrayBuffer();
            await new Promise((resolve, reject) => {
                const transacao = banco.transaction(FILE_STORE_NAME, "readwrite");
                transacao.objectStore(FILE_STORE_NAME).put({
                    tipo,
                    nomeArquivo: file.name,
                    mimeType: file.type || "application/octet-stream",
                    lastModified: file.lastModified || Date.now(),
                    buffer,
                    linhas,
                    salvoEm: new Date().toISOString()
                });
                transacao.oncomplete = resolve;
                transacao.onerror = () => reject(transacao.error);
            });
            banco.close();
        } catch (error) {
            console.warn("Não foi possível persistir o arquivo no IndexedDB:", error);
        }
    }

    async function carregarArquivosPersistidos() {
        try {
            const banco = await abrirBancoArquivos();
            if (!banco) return [];

            const registros = await new Promise((resolve, reject) => {
                const transacao = banco.transaction(FILE_STORE_NAME, "readonly");
                const request = transacao.objectStore(FILE_STORE_NAME).getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });
            banco.close();
            return registros;
        } catch (error) {
            console.warn("Não foi possível restaurar arquivos do IndexedDB:", error);
            return [];
        }
    }

    async function limparArquivosPersistidos() {
        try {
            const banco = await abrirBancoArquivos();
            if (!banco) return;

            await new Promise((resolve, reject) => {
                const transacao = banco.transaction(FILE_STORE_NAME, "readwrite");
                transacao.objectStore(FILE_STORE_NAME).clear();
                transacao.oncomplete = resolve;
                transacao.onerror = () => reject(transacao.error);
            });
            banco.close();
        } catch (error) {
            console.warn("Não foi possível limpar arquivos do IndexedDB:", error);
        }
    }

    async function carregarCacheSalvo() {
        try {
            const cacheStr = localStorage.getItem(STORAGE_KEY);
            if (cacheStr) {
                const cacheData = JSON.parse(cacheStr);
                Object.keys(cacheData).forEach(tipo => {
                    if (cacheData[tipo]) {
                        window.GlobalDashboardHub[tipo] = cacheData[tipo];
                        atualizarBadgeStatus(tipo, true, cacheData[tipo].nomeArquivo, cacheData[tipo].linhas.length);
                    }
                });
            }

            const arquivosPersistidos = await carregarArquivosPersistidos();
            arquivosPersistidos.forEach((registro) => {
                if (!registro || !registro.tipo || !registro.buffer) return;

                const linhasCache = window.GlobalDashboardHub[registro.tipo]
                    && window.GlobalDashboardHub[registro.tipo].linhas;
                const linhas = Array.isArray(registro.linhas) && registro.linhas.length
                    ? registro.linhas
                    : (linhasCache || []);
                const arquivo = new File([registro.buffer], registro.nomeArquivo, {
                    type: registro.mimeType || "application/octet-stream",
                    lastModified: registro.lastModified || Date.now()
                });

                window.GlobalDashboardHub[registro.tipo] = {
                    nomeArquivo: registro.nomeArquivo,
                    linhas,
                    rawFile: arquivo
                };
                atualizarBadgeStatus(registro.tipo, true, registro.nomeArquivo, linhas.length);
            });

            verificarBotaoProcessar();
            distribuirParaModulos(window.GlobalDashboardHub);
        } catch (e) {
            console.error("Erro ao carregar cache salvo:", e);
        }
    }

    async function limparTodosDados() {
        if (!confirm("Deseja realmente limpar todos os relatórios carregados?")) return;

        Object.keys(window.GlobalDashboardHub).forEach(key => {
            window.GlobalDashboardHub[key] = null;
            atualizarBadgeStatus(key, false);
        });

        localStorage.removeItem(STORAGE_KEY);
        MODULE_IMPORT_STORAGE_KEYS.forEach((chave) => localStorage.removeItem(chave));
        await limparArquivosPersistidos();
        verificarBotaoProcessar();
        window.location.reload();
    }

    function exibirNotificacaoSucesso(mensagem) {
        const toast = document.createElement("div");
        toast.className = "toast-notification toast-success";
        toast.innerHTML = `<span>✅ ${mensagem}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("toast-show");
        }, 100);

        setTimeout(() => {
            toast.classList.remove("toast-show");
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
