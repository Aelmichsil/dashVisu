// ============================================================
// app_import_hub.js — Central de Importação Inteligente de Dados
// Unifica o upload de relatórios Excel/CSV e distribui para todas as abas.
// ============================================================

(function () {
    "use strict";

    const STORAGE_KEY = "nossanet_dashboard_global_data_v1";

    // Armazenamento global em memória das fontes de dados
    window.GlobalDashboardHub = window.GlobalDashboardHub || {
        hubsoft: null,
        os: null,
        chat: null,
        nps: null,
        pesquisa: null,
        prospectos: null
    };

    // Elementos da interface do Modal
    const modal = document.getElementById("globalImportModal");
    const btnOpenModal = document.getElementById("btnOpenGlobalImport");
    const btnCloseModal = document.getElementById("btnCloseGlobalImport");
    const dropZone = document.getElementById("globalDropZone");
    const fileInput = document.getElementById("globalFileInput");
    const btnProcess = document.getElementById("btnProcessGlobalData");
    const btnClear = document.getElementById("btnClearGlobalData");
    const reportBadges = document.querySelectorAll(".report-badge");

    // Arquivos em espera para processamento
    let arquivosPpendentes = [];

    // ------------------------------------------------------------
    // INICIALIZAÇÃO
    // ------------------------------------------------------------
    function init() {
        vincularEventos();
        carregarCacheSalvo();
        verificarAberturaAutomatica();
    }

    function vincularEventos() {
        if (btnOpenModal) btnOpenModal.addEventListener("click", abrirModal);
        if (btnCloseModal) btnCloseModal.addEventListener("click", fecharModal);

        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) fecharModal();
            });
        }

        if (fileInput) {
            fileInput.addEventListener("change", (e) => {
                const files = Array.from(e.target.files || []);
                processarArquivosSelecionados(files);
            });
        }

        if (dropZone) {
            dropZone.addEventListener("dragover", (e) => {
                e.preventDefault();
                dropZone.classList.add("global-dropzone--active");
            });

            dropZone.addEventListener("dragleave", () => {
                dropZone.classList.remove("global-dropzone--active");
            });

            dropZone.addEventListener("drop", (e) => {
                e.preventDefault();
                dropZone.classList.remove("global-dropzone--active");
                const files = Array.from(e.dataTransfer.files || []);
                processarArquivosSelecionados(files);
            });
        }

        if (btnProcess) {
            btnProcess.addEventListener("click", aplicarEAtualizarDashboard);
        }

        if (btnClear) {
            btnClear.addEventListener("click", limparTodosDados);
        }
    }

    function abrirModal() {
        if (modal) modal.style.display = "flex";
    }

    function fecharModal() {
        if (modal) modal.style.display = "none";
    }

    function verificarAberturaAutomatica() {
        // Se nenhum dado estiver carregado na memória ou cache, abre o modal automaticamente
        const possuiDados = Object.values(window.GlobalDashboardHub).some(val => val !== null);
        if (!possuiDados) {
            setTimeout(() => {
                abrirModal();
            }, 800);
        }
    }

    // ------------------------------------------------------------
    // PROCESSAMENTO E DETECÇÃO INTELIGENTE DE ARQUIVOS
    // ------------------------------------------------------------
    async function processarArquivosSelecionados(files) {
        if (!files || files.length === 0) return;

        for (const file of files) {
            const data = await lerArquivoExcelOuCsv(file);
            if (!data || data.length === 0) continue;

            const tipoDetectado = identificarTipoRelatorio(data, file.name);

            if (tipoDetectado) {
                window.GlobalDashboardHub[tipoDetectado] = {
                    nomeArquivo: file.name,
                    linhas: data,
                    rawFile: file
                };

                atualizarBadgeStatus(tipoDetectado, true, file.name, data.length);
            }
        }

        verificarBotaoProcessar();
    }

    function identificarTipoRelatorio(linhas, nomeArquivo) {
        const nomeUpper = String(nomeArquivo || "").toUpperCase();
        const cabecalhos = Object.keys(linhas[0] || {}).map(c => String(c).toUpperCase());
        const cabecalhosStr = cabecalhos.join(" ");

        // 1. Ordens de Serviço (O.S.)
        if (nomeUpper.includes("OS") || nomeUpper.includes("ORDEM") || cabecalhosStr.includes("OLT") || cabecalhosStr.includes("PON") || cabecalhosStr.includes("TIPO_OS")) {
            return "os";
        }

        // 2. Chat
        if (nomeUpper.includes("CHAT") || cabecalhosStr.includes("FILA") || cabecalhosStr.includes("TEMPO_RESPOSTA") || cabecalhosStr.includes("MENSAGENS")) {
            return "chat";
        }

        // 3. NPS
        if (nomeUpper.includes("NPS") || cabecalhosStr.includes("NPS") || cabecalhosStr.includes("AVALIACAO") || cabecalhosStr.includes("DETRATOR")) {
            return "nps";
        }

        // 4. Pesquisa
        if (nomeUpper.includes("PESQUISA") || cabecalhosStr.includes("QUESTIONARIO") || cabecalhosStr.includes("RESPOSTA_PESQUISA")) {
            return "pesquisa";
        }

        // 5. Prospectos
        if (nomeUpper.includes("PROSPECTO") || nomeUpper.includes("LEAD") || cabecalhosStr.includes("VENDEDOR") || cabecalhosStr.includes("PROSPECTO")) {
            return "prospectos";
        }

        // 6. Hubsoft / Atendimentos (Padrão)
        if (cabecalhosStr.includes("PROTOCOLO") || cabecalhosStr.includes("SETOR") || cabecalhosStr.includes("ATENDENTE") || cabecalhosStr.includes("SLA") || cabecalhosStr.includes("CIDADE")) {
            return "hubsoft";
        }

        return "hubsoft"; // Fallback para Hubsoft/Atendimentos
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

        // 1. Injeta os arquivos nos elementos de input das abas originais para disparar a renderização nativa de cada módulo
        distribuirParaModulos(hubData);

        // 2. Salva o estado no LocalStorage para persistir o carregamento
        salvarCache(hubData);

        // 3. Notifica o usuário e fecha o modal
        fecharModal();
        exibirNotificacaoSucesso("Dados importados e distribuídos com sucesso para todas as abas!");
    }

    function distribuirParaModulos(hubData) {
        // Dispara evento customizado para notificar todos os módulos do dashboard
        window.dispatchEvent(new CustomEvent("dashboardDataUpdated", { detail: hubData }));

        // Passa arquivos brutos ou datasets processados para os inputs originais se existirem
        if (hubData.hubsoft && hubData.hubsoft.rawFile) {
            injetarArquivoNoInput("arquivoInput", hubData.hubsoft.rawFile);
        }
        if (hubData.os && hubData.os.rawFile) {
            injetarArquivoNoInput("arquivoOsInput", hubData.os.rawFile);
        }
    }

    function injetarArquivoNoInput(idInput, file) {
        const input = document.getElementById(idInput);
        if (!input) return;

        try {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;
            input.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (e) {
            console.log(`Injeção nativa em ${idInput} usando fallback de evento.`);
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

    function carregarCacheSalvo() {
        try {
            const cacheStr = localStorage.getItem(STORAGE_KEY);
            if (!cacheStr) return;

            const cacheData = JSON.parse(cacheStr);
            Object.keys(cacheData).forEach(tipo => {
                if (cacheData[tipo]) {
                    window.GlobalDashboardHub[tipo] = cacheData[tipo];
                    atualizarBadgeStatus(tipo, true, cacheData[tipo].nomeArquivo, cacheData[tipo].linhas.length);
                }
            });

            verificarBotaoProcessar();
        } catch (e) {
            console.error("Erro ao carregar cache salvo:", e);
        }
    }

    function limparTodosDados() {
        if (!confirm("Deseja realmente limpar todos os relatórios carregados?")) return;

        Object.keys(window.GlobalDashboardHub).forEach(key => {
            window.GlobalDashboardHub[key] = null;
            atualizarBadgeStatus(key, false);
        });

        localStorage.removeItem(STORAGE_KEY);
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

    // Inicializa quando o DOM estiver pronto
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
