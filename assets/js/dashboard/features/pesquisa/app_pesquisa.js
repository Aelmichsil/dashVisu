// ============================================================
// Dashboard de Pesquisa - app_pesquisa.js
// Painel de CSAT, performance por agente, operação, eficiência
// e auditoria de notas baixas a partir de arquivo CSV/XLSX.
// ============================================================

(function () {
    "use strict";

    if (window.__dashboardPesquisaInicializado) {
        return;
    }
    window.__dashboardPesquisaInicializado = true;

    const CORES = [
        "#38bdf8", "#fbbf24", "#34d399", "#a78bfa", "#fb7185",
        "#22d3ee", "#f97316", "#818cf8", "#f472b6", "#a3e635",
        "#2dd4bf", "#c4b5fd"
    ];

    let dadosBrutos = [];
    let dadosFiltrados = [];

    let chartDistribuicao = null;
    let chartEvolucao = null;
    let chartAgenteMedia = null;
    let chartAgenteVolume = null;
    let chartSetor = null;
    let chartClassificacao = null;
    let chartCanal = null;
    let chartPico = null;

    const AUDITORIA_ITENS_POR_PAGINA = 10;
    let auditoriaCriticos = [];
    let auditoriaPaginaAtual = 1;

    let pesquisaAuditoriaPrevBtn = null;
    let pesquisaAuditoriaNextBtn = null;
    let pesquisaAuditoriaPageInfo = null;
    let pesquisaAuditoriaNotaFiltro = null;

    let pesquisaToggleFilterSectionButton = null;
    let pesquisaFilterSection = null;

    let pesquisaFilterAgente = null;
    let pesquisaFilterServico = null;
    let pesquisaFilterClassificacao = null;
    let pesquisaFilterCanal = null;
    let pesquisaFilterNota = null;
    let pesquisaFilterData = null;

    let pesquisaFilterAgenteSearch = null;
    let pesquisaFilterServicoSearch = null;
    let pesquisaFilterClassificacaoSearch = null;
    let pesquisaFilterCanalSearch = null;
    let pesquisaFilterNotaSearch = null;
    let pesquisaFilterDataSearch = null;

    let pesquisaFilterAgenteOptions = null;
    let pesquisaFilterServicoOptions = null;
    let pesquisaFilterClassificacaoOptions = null;
    let pesquisaFilterCanalOptions = null;
    let pesquisaFilterNotaOptions = null;
    let pesquisaFilterDataOptions = null;

    let pesquisaEvolucaoAgrupamento = null;
    let pesquisaEvolucaoMes = null;
    let pesquisaEvolucaoMesWrap = null;

    let filtrosDisponiveis = false;
    const PESQUISA_STORAGE_KEY = "pesquisa-registros-v1";
    const PESQUISA_FILE_META_KEY = "pesquisa-registros-meta-v1";

    function el(id) {
        return document.getElementById(id);
    }

    function setTexto(id, valor) {
        const elemento = el(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    function setStatus(msg, erro) {
        const status = el("pesquisaStatus");
        if (!status) return;
        status.textContent = msg;
        status.style.color = erro ? "#ef4444" : "";
    }

    function destruirChart(instancia) {
        if (!instancia) return null;
        try {
            instancia.destroy();
        } catch (_) {}
        return null;
    }

    function serializarRegistroPesquisa(registro) {
        return {
            ...registro,
            dataAvaliacao: registro && registro.dataAvaliacao instanceof Date ? registro.dataAvaliacao.toISOString() : (registro ? registro.dataAvaliacao : null),
            entrada: registro && registro.entrada instanceof Date ? registro.entrada.toISOString() : (registro ? registro.entrada : null)
        };
    }

    function desserializarRegistroPesquisa(registro) {
        const dataAvaliacao = registro && registro.dataAvaliacao ? new Date(registro.dataAvaliacao) : null;
        const entrada = registro && registro.entrada ? new Date(registro.entrada) : null;
        return {
            ...registro,
            dataAvaliacao: dataAvaliacao instanceof Date && !isNaN(dataAvaliacao.getTime()) ? dataAvaliacao : null,
            entrada: entrada instanceof Date && !isNaN(entrada.getTime()) ? entrada : null
        };
    }

    function salvarPesquisaNoStorage(nomeArquivo) {
        try {
            const serializados = (dadosBrutos || []).map(serializarRegistroPesquisa);
            localStorage.setItem(PESQUISA_STORAGE_KEY, JSON.stringify(serializados));
            localStorage.setItem(PESQUISA_FILE_META_KEY, JSON.stringify({
                fileName: String(nomeArquivo || "").trim(),
                importedAt: new Date().toISOString(),
                total: serializados.length
            }));
        } catch (_) {}
    }

    function removerPesquisaDoStorage() {
        try {
            localStorage.removeItem(PESQUISA_STORAGE_KEY);
            localStorage.removeItem(PESQUISA_FILE_META_KEY);
        } catch (_) {}
    }

    function restaurarPesquisaDoStorage() {
        try {
            const raw = localStorage.getItem(PESQUISA_STORAGE_KEY);
            if (!raw) return false;

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || !parsed.length) return false;

            dadosBrutos = parsed.map(desserializarRegistroPesquisa);
            popularFiltros();
            limparFiltros(true);
            atualizarBotaoFiltros(dadosBrutos.length > 0);
            aplicarFiltros();

            const metaRaw = localStorage.getItem(PESQUISA_FILE_META_KEY);
            const meta = metaRaw ? JSON.parse(metaRaw) : null;
            const nome = String((meta && meta.fileName) || "").trim();
            if (nome) {
                setTexto("pesquisaFileStatus", "Arquivo restaurado: " + nome);
            }
            setStatus("Dados restaurados do navegador.");
            return true;
        } catch (_) {
            return false;
        }
    }

    function normalizarTextoBusca(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function normalizar(valor) {
        const texto = String(valor === null || valor === undefined ? "" : valor).trim();
        if (!texto || texto === "-") return "";
        return texto;
    }

    function escaparHtml(valor) {
        return String(valor || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function normalizarCabecalho(valor) {
        return String(valor || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
    }

    function obterValorColuna(linha, chaves) {
        for (const chave of chaves) {
            const valor = linha[chave];
            if (valor !== undefined && normalizar(valor)) {
                return normalizar(valor);
            }
        }
        return "";
    }

    function parseDataHora(valor) {
        if (valor instanceof Date && !isNaN(valor.getTime())) {
            return valor;
        }

        if (typeof valor === "number" && Number.isFinite(valor)) {
            const excelEpoch = new Date(Math.round((valor - 25569) * 86400 * 1000));
            if (!isNaN(excelEpoch.getTime())) {
                return excelEpoch;
            }
        }

        const texto = normalizar(valor);
        if (!texto) return null;

        const m = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
        if (m) {
            const ano = Number(m[3].length === 2 ? "20" + m[3] : m[3]);
            const mes = Number(m[2]) - 1;
            const dia = Number(m[1]);
            const hora = Number(m[4] || 0);
            const min = Number(m[5] || 0);
            const seg = Number(m[6] || 0);
            const data = new Date(ano, mes, dia, hora, min, seg);
            return isNaN(data.getTime()) ? null : data;
        }

        const data = new Date(texto.replace(" ", "T"));
        return isNaN(data.getTime()) ? null : data;
    }

    function formatarDataCurta(data) {
        if (!(data instanceof Date) || isNaN(data.getTime())) return "—";
        return data.toLocaleDateString("pt-BR");
    }

    function formatarMinutos(valor) {
        if (valor === null || valor === undefined || isNaN(valor)) return "—";
        const minutos = Math.max(0, Math.round(Number(valor)));
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        if (horas > 0) return horas + "h " + mins + "min";
        if (mins > 0) return mins + "min";
        return "<1min";
    }

    function parseNota(opcao, resposta) {
        const fromOpcao = String(opcao || "").match(/-?\d+(?:[\.,]\d+)?/);
        if (fromOpcao) {
            const valor = Number(fromOpcao[0].replace(",", "."));
            if (Number.isFinite(valor) && valor >= 1 && valor <= 5) return valor;
        }

        const fromResposta = String(resposta || "").match(/^\s*(\d)/);
        if (fromResposta) {
            const valor = Number(fromResposta[1]);
            if (valor >= 1 && valor <= 5) return valor;
        }

        return null;
    }

    function chaveDia(data) {
        if (!(data instanceof Date) || isNaN(data.getTime())) return "";
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");
        return ano + "-" + mes + "-" + dia;
    }

    function chaveMes(data) {
        if (!(data instanceof Date) || isNaN(data.getTime())) return "";
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        return ano + "-" + mes;
    }

    function formatarMesAno(chave) {
        const m = String(chave || "").match(/^(\d{4})-(\d{2})$/);
        if (!m) return chave;
        const data = new Date(Number(m[1]), Number(m[2]) - 1, 1);
        return data.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    }

    function normalizarRegistro(linha) {
        const dataTexto = obterValorColuna(linha, ["data", "data_avaliacao", "data_finalizacao"]);
        const entradaTexto = obterValorColuna(linha, ["entrada", "data_entrada", "inicio", "data_inicio"]);
        const opcaoTexto = obterValorColuna(linha, ["opcao", "opcao_", "nota"]);
        const resposta = obterValorColuna(linha, ["resposta", "avaliacao", "descricao_resposta"]);
        const agenteOriginal = obterValorColuna(linha, ["agente", "operador", "colaborador"]);
        const servico = obterValorColuna(linha, ["servico", "setor", "fila"]) || "Não informado";
        const classificacao = obterValorColuna(linha, ["classificacao", "classificacao_do_contato", "tema"]) || "Não informado";
        const canal = obterValorColuna(linha, ["canal", "canal_entrada"]) || "Não informado";
        const protocolo = obterValorColuna(linha, ["protocolo", "cod", "codigo", "codigo_atendimento"]);
        const nome = obterValorColuna(linha, ["nome", "nome_razaosocial", "cliente"]) || "Não informado";
        const telefone = obterValorColuna(linha, ["telefone", "celular", "telefone_cliente"]) || "Não informado";

        const nota = parseNota(opcaoTexto, resposta);
        const dataAvaliacao = parseDataHora(dataTexto);
        const entrada = parseDataHora(entradaTexto);

        let tempoAtendimentoMin = null;
        if (dataAvaliacao && entrada) {
            const diff = (dataAvaliacao.getTime() - entrada.getTime()) / 60000;
            if (Number.isFinite(diff) && diff >= 0) {
                tempoAtendimentoMin = diff;
            }
        }

        const semAgente = !normalizar(agenteOriginal);
        const agente = semAgente ? "Sem identificação" : agenteOriginal;

        return {
            nota,
            opcao: opcaoTexto,
            resposta: resposta || (nota !== null ? String(nota) : "Não informado"),
            agente,
            semAgente,
            servico,
            classificacao,
            canal,
            protocolo: protocolo || "Não informado",
            nome,
            telefone,
            dataAvaliacao,
            entrada,
            dataDiaKey: chaveDia(dataAvaliacao),
            tempoAtendimentoMin,
            horaEntrada: entrada ? entrada.getHours() : null
        };
    }

    function linhaTemDadosValidos(row) {
        if (!row || typeof row !== "object") return false;
        return Object.values(row).some((valor) => {
            const texto = String(valor === null || valor === undefined ? "" : valor).trim();
            return texto !== "" && texto !== "-";
        });
    }

    function parseCsv(texto) {
        const linhas = String(texto || "").split(/\r?\n/).filter((l) => l.trim());
        if (linhas.length < 2) return [];

        const separador = linhas[0].includes(";") ? ";" : ",";
        const headers = [];
        let current = "";
        let inside = false;

        for (let i = 0; i < linhas[0].length; i++) {
            const ch = linhas[0][i];
            if (ch === '"') {
                inside = !inside;
            } else if (ch === separador && !inside) {
                headers.push(normalizarCabecalho(current.replace(/^"|"$/g, "").trim()));
                current = "";
            } else {
                current += ch;
            }
        }
        headers.push(normalizarCabecalho(current.replace(/^"|"$/g, "").trim()));

        return linhas.slice(1).map((linha) => {
            const colunas = [];
            let valor = "";
            let emAspas = false;

            for (let i = 0; i < linha.length; i++) {
                const ch = linha[i];
                if (ch === '"') {
                    emAspas = !emAspas;
                } else if (ch === separador && !emAspas) {
                    colunas.push(valor);
                    valor = "";
                } else {
                    valor += ch;
                }
            }
            colunas.push(valor);

            const registro = {};
            headers.forEach((h, idx) => {
                registro[h] = String(colunas[idx] || "").replace(/^"|"$/g, "").trim();
            });
            return registro;
        }).filter(linhaTemDadosValidos);
    }

    function parseXlsx(buffer) {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        return rows.map((row) => {
            const normalizado = {};
            Object.entries(row).forEach(([chave, valor]) => {
                normalizado[normalizarCabecalho(chave)] = valor;
            });
            return normalizado;
        }).filter(linhaTemDadosValidos);
    }

    function topNContagem(contagem, limite) {
        return Object.entries(contagem)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limite || 10);
    }

    function obterQuantidadeFiltrosAtivos() {
        const filtros = [
            pesquisaFilterAgente,
            pesquisaFilterServico,
            pesquisaFilterClassificacao,
            pesquisaFilterCanal,
            pesquisaFilterNota,
            pesquisaFilterData
        ];

        return filtros.reduce((acc, select) => acc + obterValoresSelecionados(select).length, 0);
    }

    function atualizarRotuloBotaoFiltros() {
        if (!pesquisaToggleFilterSectionButton) return;
        const aberto = pesquisaFilterSection && !pesquisaFilterSection.classList.contains("filter-section--hidden");
        const prefixo = aberto ? "Editar Filtros de Análise" : "Filtros de Análise";
        const ativos = filtrosDisponiveis ? obterQuantidadeFiltrosAtivos() : 0;
        pesquisaToggleFilterSectionButton.textContent = prefixo + (ativos > 0 ? " (" + ativos + ")" : "");
    }

    function definirVisibilidadeFiltros(visivel) {
        if (!pesquisaFilterSection) return;
        if (visivel) {
            pesquisaFilterSection.classList.remove("filter-section--hidden");
        } else {
            pesquisaFilterSection.classList.add("filter-section--hidden");
        }
        if (pesquisaToggleFilterSectionButton) {
            pesquisaToggleFilterSectionButton.setAttribute("aria-expanded", String(visivel));
        }
        atualizarRotuloBotaoFiltros();
    }

    function atualizarBotaoFiltros(disponivel) {
        filtrosDisponiveis = Boolean(disponivel);
        if (!pesquisaToggleFilterSectionButton) return;
        pesquisaToggleFilterSectionButton.disabled = !filtrosDisponiveis;
        if (!filtrosDisponiveis) {
            definirVisibilidadeFiltros(false);
        }
        atualizarRotuloBotaoFiltros();
    }

    function obterValoresSelecionados(select) {
        if (!select) return [];
        return Array.from(select.selectedOptions || []).map((op) => String(op.value || "").trim()).filter(Boolean);
    }

    function preencherSelect(select, valores, formatLabel) {
        if (!select) return;
        const valorAtual = new Set(obterValoresSelecionados(select));
        select.innerHTML = "";
        valores.forEach((valor) => {
            const option = document.createElement("option");
            option.value = valor;
            option.textContent = formatLabel ? formatLabel(valor) : valor;
            option.selected = valorAtual.has(valor);
            select.appendChild(option);
        });
    }

    function renderizarOpcoesFiltro(select, input, container, msg) {
        if (!select || !container) return;

        const termo = normalizarTextoBusca(input ? input.value : "");
        const selecionados = new Set(obterValoresSelecionados(select).map((v) => normalizarTextoBusca(v)));

        const opcoes = Array.from(select.options || []).filter((option) => {
            const texto = String(option.textContent || option.value || "");
            return !termo || normalizarTextoBusca(texto).includes(termo);
        });

        if (!opcoes.length) {
            container.innerHTML = '<div class="filter-options-empty">' + escaparHtml(msg || "Nenhuma opção encontrada.") + "</div>";
            return;
        }

        container.innerHTML = opcoes.map((op, i) => {
            const valor = String(op.value || "");
            const texto = String(op.textContent || valor);
            const id = select.id + "-opt-" + i;
            const checked = selecionados.has(normalizarTextoBusca(valor)) ? " checked" : "";
            return '<label class="filter-option" for="' + id + '"><input id="' + id + '" type="checkbox" data-value="' + escaparHtml(valor) + '"' + checked + ' /><span>' + escaparHtml(texto) + "</span></label>";
        }).join("");

        Array.from(container.querySelectorAll("input[type=checkbox][data-value]")).forEach((checkbox) => {
            checkbox.addEventListener("change", () => {
                const valor = String(checkbox.getAttribute("data-value") || "");
                Array.from(select.options || []).forEach((opt) => {
                    if (String(opt.value || "") === valor) {
                        opt.selected = checkbox.checked;
                    }
                });
                atualizarRotuloBotaoFiltros();
            });
        });
    }

    function atualizarInterfaceFiltros() {
        renderizarOpcoesFiltro(pesquisaFilterAgente, pesquisaFilterAgenteSearch, pesquisaFilterAgenteOptions, "Nenhum agente encontrado.");
        renderizarOpcoesFiltro(pesquisaFilterServico, pesquisaFilterServicoSearch, pesquisaFilterServicoOptions, "Nenhum serviço encontrado.");
        renderizarOpcoesFiltro(pesquisaFilterClassificacao, pesquisaFilterClassificacaoSearch, pesquisaFilterClassificacaoOptions, "Nenhuma classificação encontrada.");
        renderizarOpcoesFiltro(pesquisaFilterCanal, pesquisaFilterCanalSearch, pesquisaFilterCanalOptions, "Nenhum canal encontrado.");
        renderizarOpcoesFiltro(pesquisaFilterNota, pesquisaFilterNotaSearch, pesquisaFilterNotaOptions, "Nenhuma nota encontrada.");
        renderizarOpcoesFiltro(pesquisaFilterData, pesquisaFilterDataSearch, pesquisaFilterDataOptions, "Nenhuma data encontrada.");
    }

    function obterValoresUnicosOrdenados(linhas, extrator) {
        const set = new Set();
        (linhas || []).forEach((linha) => {
            const valor = normalizar(extrator(linha));
            if (valor) set.add(valor);
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
    }

    function popularFiltros() {
        preencherSelect(pesquisaFilterAgente, obterValoresUnicosOrdenados(dadosBrutos, (r) => r.agente));
        preencherSelect(pesquisaFilterServico, obterValoresUnicosOrdenados(dadosBrutos, (r) => r.servico));
        preencherSelect(pesquisaFilterClassificacao, obterValoresUnicosOrdenados(dadosBrutos, (r) => r.classificacao));
        preencherSelect(pesquisaFilterCanal, obterValoresUnicosOrdenados(dadosBrutos, (r) => r.canal));

        const notas = Array.from(new Set((dadosBrutos || []).map((r) => r.nota).filter((n) => n !== null))).sort((a, b) => a - b);
        preencherSelect(pesquisaFilterNota, notas.map((n) => String(n)));

        const datas = Array.from(new Set((dadosBrutos || []).map((r) => r.dataDiaKey).filter(Boolean))).sort();
        preencherSelect(pesquisaFilterData, datas, (chave) => {
            const data = parseDataHora(chave + " 00:00:00");
            return formatarDataCurta(data);
        });

        atualizarInterfaceFiltros();
        atualizarRotuloBotaoFiltros();
    }

    function limparFiltros(resetBusca) {
        [
            pesquisaFilterAgente,
            pesquisaFilterServico,
            pesquisaFilterClassificacao,
            pesquisaFilterCanal,
            pesquisaFilterNota,
            pesquisaFilterData
        ].forEach((select) => {
            if (!select) return;
            Array.from(select.options || []).forEach((op) => {
                op.selected = false;
            });
        });

        if (resetBusca) {
            [
                pesquisaFilterAgenteSearch,
                pesquisaFilterServicoSearch,
                pesquisaFilterClassificacaoSearch,
                pesquisaFilterCanalSearch,
                pesquisaFilterNotaSearch,
                pesquisaFilterDataSearch
            ].forEach((input) => {
                if (input) input.value = "";
            });
        }

        atualizarInterfaceFiltros();
        atualizarRotuloBotaoFiltros();
    }

    function criarBarra(canvasId, labels, valores, horizontal, titulo) {
        const canvas = el(canvasId);
        if (!canvas) return null;

        return new Chart(canvas.getContext("2d"), {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: titulo,
                    data: valores,
                    backgroundColor: labels.map((_, i) => CORES[i % CORES.length]),
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: horizontal ? "y" : "x",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: { display: false }
                },
                scales: {
                    x: { ticks: { color: "#dbe6ff" }, grid: { color: "rgba(147,169,255,0.22)" } },
                    y: { ticks: { color: "#dbe6ff" }, grid: { color: "rgba(147,169,255,0.22)" } }
                }
            }
        });
    }

    function criarRosca(canvasId, labels, valores) {
        const canvas = el(canvasId);
        if (!canvas) return null;

        return new Chart(canvas.getContext("2d"), {
            type: "doughnut",
            data: {
                labels,
                datasets: [{
                    data: valores,
                    backgroundColor: labels.map((_, i) => CORES[i % CORES.length]),
                    borderWidth: 2,
                    borderColor: "rgba(8,15,40,0.9)"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom", labels: { color: "#dbe6ff" } },
                    datalabels: {
                        color: "#f8fbff",
                        formatter: (v, ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            if (!total) return "";
                            const pct = Math.round((v / total) * 100);
                            return pct >= 5 ? pct + "%" : "";
                        }
                    }
                }
            },
            plugins: [window.ChartDataLabels].filter(Boolean)
        });
    }

    function criarLinha(canvasId, labels, valores) {
        const canvas = el(canvasId);
        if (!canvas) return null;

        return new Chart(canvas.getContext("2d"), {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Nota média",
                    data: valores,
                    borderColor: "#38bdf8",
                    backgroundColor: "rgba(56,189,248,0.28)",
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: "#38bdf8",
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: { display: false }
                },
                scales: {
                    x: { ticks: { color: "#dbe6ff" }, grid: { color: "rgba(147,169,255,0.22)" } },
                    y: {
                        min: 1,
                        max: 5,
                        ticks: { color: "#dbe6ff" },
                        grid: { color: "rgba(147,169,255,0.22)" }
                    }
                }
            }
        });
    }

    function atualizarStatusGrafico(id, mensagem) {
        setTexto(id, mensagem);
    }

    function obterFiltroAuditoriaNota() {
        if (!pesquisaAuditoriaNotaFiltro) return "todos";
        return String(pesquisaAuditoriaNotaFiltro.value || "todos");
    }

    function popularFiltroMesEvolucao(linhas) {
        if (!pesquisaEvolucaoMes) return;

        const atual = String(pesquisaEvolucaoMes.value || "");
        const meses = Array.from(new Set((linhas || [])
            .map((r) => chaveMes(r.dataAvaliacao))
            .filter(Boolean)))
            .sort();

        pesquisaEvolucaoMes.innerHTML = '<option value="">Todos</option>'
            + meses.map((mes) => '<option value="' + escaparHtml(mes) + '">' + escaparHtml(formatarMesAno(mes)) + '</option>').join("");

        if (meses.includes(atual)) {
            pesquisaEvolucaoMes.value = atual;
        } else if (meses.length) {
            pesquisaEvolucaoMes.value = meses[meses.length - 1];
        } else {
            pesquisaEvolucaoMes.value = "";
        }
    }

    function renderizarEvolucaoPorPeriodo(linhas) {
        const agrupamento = pesquisaEvolucaoAgrupamento ? pesquisaEvolucaoAgrupamento.value : "dia";
        const mesSelecionado = pesquisaEvolucaoMes ? String(pesquisaEvolucaoMes.value || "") : "";

        if (pesquisaEvolucaoMesWrap) {
            pesquisaEvolucaoMesWrap.style.display = agrupamento === "dia" ? "inline-flex" : "none";
        }

        const soma = {};
        const qtd = {};

        (linhas || []).forEach((r) => {
            if (r.nota === null) return;

            if (agrupamento === "mes") {
                const chave = chaveMes(r.dataAvaliacao);
                if (!chave) return;
                soma[chave] = (soma[chave] || 0) + r.nota;
                qtd[chave] = (qtd[chave] || 0) + 1;
                return;
            }

            const dia = r.dataDiaKey;
            if (!dia) return;
            if (mesSelecionado && !dia.startsWith(mesSelecionado + "-")) return;
            soma[dia] = (soma[dia] || 0) + r.nota;
            qtd[dia] = (qtd[dia] || 0) + 1;
        });

        const chaves = Object.keys(soma).sort();
        const valores = chaves.map((chave) => Number((soma[chave] / qtd[chave]).toFixed(2)));

        chartEvolucao = destruirChart(chartEvolucao);
        if (!chaves.length) {
            atualizarStatusGrafico("pesquisaEvolucaoStatus", "Sem dados de evolução para o período selecionado.");
            return;
        }

        const labels = agrupamento === "mes"
            ? chaves.map(formatarMesAno)
            : chaves.map((chave) => chave.slice(-2));

        chartEvolucao = criarLinha("pesquisaEvolucaoChart", labels, valores);

        if (agrupamento === "mes") {
            atualizarStatusGrafico("pesquisaEvolucaoStatus", chaves.length + " mês(es) no período");
        } else if (mesSelecionado) {
            atualizarStatusGrafico("pesquisaEvolucaoStatus", chaves.length + " dia(s) em " + formatarMesAno(mesSelecionado));
        } else {
            atualizarStatusGrafico("pesquisaEvolucaoStatus", chaves.length + " dia(s) no período");
        }
    }

    function atualizarControlesPaginacaoAuditoria() {
        const total = auditoriaCriticos.length;
        const totalPaginas = total ? Math.ceil(total / AUDITORIA_ITENS_POR_PAGINA) : 0;

        if (pesquisaAuditoriaPageInfo) {
            pesquisaAuditoriaPageInfo.textContent = "Página " + (totalPaginas ? auditoriaPaginaAtual : 0) + " de " + totalPaginas;
        }

        if (pesquisaAuditoriaPrevBtn) {
            pesquisaAuditoriaPrevBtn.disabled = !totalPaginas || auditoriaPaginaAtual <= 1;
        }
        if (pesquisaAuditoriaNextBtn) {
            pesquisaAuditoriaNextBtn.disabled = !totalPaginas || auditoriaPaginaAtual >= totalPaginas;
        }
    }

    function renderizarPaginaAuditoria() {
        const tbody = el("pesquisaAuditoriaBody");
        if (!tbody) return;

        if (!auditoriaCriticos.length) {
            tbody.innerHTML = '<tr><td colspan="8">Nenhuma avaliação com a nota selecionada no recorte atual.</td></tr>';
            setTexto("pesquisaAuditoriaStatus", "0 ocorrências críticas.");
            atualizarControlesPaginacaoAuditoria();
            return;
        }

        const inicio = (auditoriaPaginaAtual - 1) * AUDITORIA_ITENS_POR_PAGINA;
        const pagina = auditoriaCriticos.slice(inicio, inicio + AUDITORIA_ITENS_POR_PAGINA);

        tbody.innerHTML = pagina.map((r) => {
            return "<tr>"
                + "<td>" + escaparHtml(String(r.nota)) + "</td>"
                + "<td>" + escaparHtml(r.resposta) + "</td>"
                + "<td>" + escaparHtml(r.protocolo) + "</td>"
                + "<td>" + escaparHtml(r.nome) + "</td>"
                + "<td>" + escaparHtml(r.telefone) + "</td>"
                + "<td>" + escaparHtml(r.agente) + "</td>"
                + "<td>" + escaparHtml(r.servico) + "</td>"
                + "<td>" + escaparHtml(formatarDataCurta(r.dataAvaliacao)) + "</td>"
                + "</tr>";
        }).join("");

        const notaFiltro = obterFiltroAuditoriaNota();
        if (notaFiltro === "todos") {
            setTexto("pesquisaAuditoriaStatus", auditoriaCriticos.length + " avaliação(ões) com nota 1, 2 ou 3.");
        } else {
            setTexto("pesquisaAuditoriaStatus", auditoriaCriticos.length + " avaliação(ões) com nota " + notaFiltro + ".");
        }
        atualizarControlesPaginacaoAuditoria();
    }

    function renderizarTabelaAuditoria(linhas) {
        const notaFiltro = obterFiltroAuditoriaNota();
        auditoriaCriticos = (linhas || [])
            .filter((r) => {
                if (r.nota === null) return false;
                if (notaFiltro === "todos") return r.nota >= 1 && r.nota <= 3;
                return String(r.nota) === notaFiltro;
            })
            .sort((a, b) => {
                const dA = a.dataAvaliacao ? a.dataAvaliacao.getTime() : 0;
                const dB = b.dataAvaliacao ? b.dataAvaliacao.getTime() : 0;
                return dB - dA;
            });
        auditoriaPaginaAtual = 1;
        renderizarPaginaAuditoria();
    }

    function renderizarDashboard(linhas, totalBase) {
        dadosFiltrados = linhas.slice();

        if (!linhas.length) {
            limparVisualizacao();
            setStatus("Nenhum registro encontrado para os filtros selecionados.");
            return;
        }

        const total = linhas.length;
        const notas = linhas.map((r) => r.nota).filter((n) => n !== null);
        const mediaNota = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length) : null;
        const semAgente = linhas.filter((r) => r.semAgente).length;
        const tempos = linhas.map((r) => r.tempoAtendimentoMin).filter((v) => v !== null);
        const tempoMedio = tempos.length ? (tempos.reduce((a, b) => a + b, 0) / tempos.length) : null;

        setTexto("pesquisaKpiNotaMedia", mediaNota !== null ? mediaNota.toFixed(2) : "—");
        setTexto("pesquisaKpiTotal", total.toLocaleString("pt-BR"));
        setTexto("pesquisaKpiSemAgente", semAgente.toLocaleString("pt-BR"));
        setTexto("pesquisaKpiTempoMedio", formatarMinutos(tempoMedio));

        const filtrosAtivos = obterQuantidadeFiltrosAtivos();
        if (filtrosAtivos > 0 && typeof totalBase === "number") {
            setStatus("✅ " + total + " avaliações exibidas de " + totalBase + " importadas.");
        } else {
            setStatus("✅ " + total + " avaliações carregadas com sucesso.");
        }

        // Distribuição de avaliações
        const cntResposta = {};
        linhas.forEach((r) => {
            const chave = normalizar(r.resposta) || (r.nota !== null ? String(r.nota) : "Não informado");
            cntResposta[chave] = (cntResposta[chave] || 0) + 1;
        });
        const dist = topNContagem(cntResposta, 10);
        chartDistribuicao = destruirChart(chartDistribuicao);
        if (dist.length) {
            chartDistribuicao = criarRosca("pesquisaDistribuicaoChart", dist.map((d) => d[0]), dist.map((d) => d[1]));
            atualizarStatusGrafico("pesquisaDistribuicaoStatus", dist.length + " categoria(s)");
        } else {
            atualizarStatusGrafico("pesquisaDistribuicaoStatus", "Sem dados de distribuição.");
        }

        // Evolução por período (dia/mês)
        popularFiltroMesEvolucao(linhas);
        renderizarEvolucaoPorPeriodo(linhas);

        // Desempenho por agente (nota média)
        const somaAgente = {};
        const qtdAgente = {};
        const cntAgente = {};
        linhas.forEach((r) => {
            cntAgente[r.agente] = (cntAgente[r.agente] || 0) + 1;
            if (r.nota !== null) {
                somaAgente[r.agente] = (somaAgente[r.agente] || 0) + r.nota;
                qtdAgente[r.agente] = (qtdAgente[r.agente] || 0) + 1;
            }
        });

        const mediaAgente = Object.keys(somaAgente).map((ag) => [ag, Number((somaAgente[ag] / qtdAgente[ag]).toFixed(2))])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        chartAgenteMedia = destruirChart(chartAgenteMedia);
        if (mediaAgente.length) {
            chartAgenteMedia = criarBarra("pesquisaAgenteMediaChart", mediaAgente.map((d) => d[0]), mediaAgente.map((d) => d[1]), true, "Nota média");
            atualizarStatusGrafico("pesquisaAgenteMediaStatus", mediaAgente.length + " agente(s)");
        } else {
            atualizarStatusGrafico("pesquisaAgenteMediaStatus", "Sem dados de nota por agente.");
        }

        const volumeAgente = topNContagem(cntAgente, 10);
        chartAgenteVolume = destruirChart(chartAgenteVolume);
        if (volumeAgente.length) {
            chartAgenteVolume = criarBarra("pesquisaAgenteVolumeChart", volumeAgente.map((d) => d[0]), volumeAgente.map((d) => d[1]), true, "Avaliações");
            atualizarStatusGrafico("pesquisaAgenteVolumeStatus", volumeAgente.length + " agente(s)");
        } else {
            atualizarStatusGrafico("pesquisaAgenteVolumeStatus", "Sem volume por agente.");
        }

        // Satisfação por setor/serviço
        const somaServico = {};
        const qtdServico = {};
        linhas.forEach((r) => {
            if (r.nota === null) return;
            somaServico[r.servico] = (somaServico[r.servico] || 0) + r.nota;
            qtdServico[r.servico] = (qtdServico[r.servico] || 0) + 1;
        });
        const mediaServico = Object.keys(somaServico)
            .map((s) => [s, Number((somaServico[s] / qtdServico[s]).toFixed(2))])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        chartSetor = destruirChart(chartSetor);
        if (mediaServico.length) {
            chartSetor = criarBarra("pesquisaSetorChart", mediaServico.map((d) => d[0]), mediaServico.map((d) => d[1]), true, "Nota média");
            atualizarStatusGrafico("pesquisaSetorStatus", mediaServico.length + " setor(es)");
        } else {
            atualizarStatusGrafico("pesquisaSetorStatus", "Sem dados por setor.");
        }

        // Classificação (motivos) por nota média
        const somaClass = {};
        const qtdClass = {};
        linhas.forEach((r) => {
            if (r.nota === null) return;
            somaClass[r.classificacao] = (somaClass[r.classificacao] || 0) + r.nota;
            qtdClass[r.classificacao] = (qtdClass[r.classificacao] || 0) + 1;
        });
        const mediaClass = Object.keys(somaClass)
            .map((c) => [c, Number((somaClass[c] / qtdClass[c]).toFixed(2))])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        chartClassificacao = destruirChart(chartClassificacao);
        if (mediaClass.length) {
            chartClassificacao = criarBarra("pesquisaClassificacaoChart", mediaClass.map((d) => d[0]), mediaClass.map((d) => d[1]), true, "Nota média");
            atualizarStatusGrafico("pesquisaClassificacaoStatus", mediaClass.length + " classificação(ões)");
        } else {
            atualizarStatusGrafico("pesquisaClassificacaoStatus", "Sem dados por classificação.");
        }

        // Canal de entrada
        const cntCanal = {};
        linhas.forEach((r) => {
            cntCanal[r.canal] = (cntCanal[r.canal] || 0) + 1;
        });
        const canais = topNContagem(cntCanal, 10);
        chartCanal = destruirChart(chartCanal);
        if (canais.length) {
            chartCanal = criarRosca("pesquisaCanalChart", canais.map((d) => d[0]), canais.map((d) => d[1]));
            atualizarStatusGrafico("pesquisaCanalStatus", canais.length + " canal(is)");
        } else {
            atualizarStatusGrafico("pesquisaCanalStatus", "Sem dados de canal.");
        }

        // Horários de pico
        const horas = new Array(24).fill(0);
        linhas.forEach((r) => {
            if (r.horaEntrada !== null && r.horaEntrada >= 0 && r.horaEntrada <= 23) {
                horas[r.horaEntrada] += 1;
            }
        });
        chartPico = destruirChart(chartPico);
        if (horas.some((v) => v > 0)) {
            const labels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0") + "h");
            chartPico = criarBarra("pesquisaPicoChart", labels, horas, false, "Entradas");
            atualizarStatusGrafico("pesquisaPicoStatus", "Distribuição por hora de entrada");
        } else {
            atualizarStatusGrafico("pesquisaPicoStatus", "Sem horários de pico disponíveis.");
        }

        renderizarTabelaAuditoria(linhas);
    }

    function limparVisualizacao() {
        dadosFiltrados = [];
        setTexto("pesquisaKpiNotaMedia", "—");
        setTexto("pesquisaKpiTotal", "—");
        setTexto("pesquisaKpiSemAgente", "—");
        setTexto("pesquisaKpiTempoMedio", "—");

        chartDistribuicao = destruirChart(chartDistribuicao);
        chartEvolucao = destruirChart(chartEvolucao);
        chartAgenteMedia = destruirChart(chartAgenteMedia);
        chartAgenteVolume = destruirChart(chartAgenteVolume);
        chartSetor = destruirChart(chartSetor);
        chartClassificacao = destruirChart(chartClassificacao);
        chartCanal = destruirChart(chartCanal);
        chartPico = destruirChart(chartPico);

        [
            "pesquisaDistribuicaoStatus",
            "pesquisaEvolucaoStatus",
            "pesquisaAgenteMediaStatus",
            "pesquisaAgenteVolumeStatus",
            "pesquisaSetorStatus",
            "pesquisaClassificacaoStatus",
            "pesquisaCanalStatus",
            "pesquisaPicoStatus",
            "pesquisaAuditoriaStatus"
        ].forEach((id) => setTexto(id, "Aguardando importação."));

        const tbody = el("pesquisaAuditoriaBody");
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8">Nenhum dado carregado ainda.</td></tr>';
        }

        auditoriaCriticos = [];
        auditoriaPaginaAtual = 1;
        atualizarControlesPaginacaoAuditoria();
    }

    function aplicarFiltros() {
        if (!dadosBrutos.length) {
            setStatus("Nenhum registro válido encontrado no arquivo.", true);
            return;
        }

        const filtroAgente = new Set(obterValoresSelecionados(pesquisaFilterAgente));
        const filtroServico = new Set(obterValoresSelecionados(pesquisaFilterServico));
        const filtroClassificacao = new Set(obterValoresSelecionados(pesquisaFilterClassificacao));
        const filtroCanal = new Set(obterValoresSelecionados(pesquisaFilterCanal));
        const filtroNota = new Set(obterValoresSelecionados(pesquisaFilterNota));
        const filtroData = new Set(obterValoresSelecionados(pesquisaFilterData));

        const filtrados = dadosBrutos.filter((r) => {
            if (filtroAgente.size && !filtroAgente.has(r.agente)) return false;
            if (filtroServico.size && !filtroServico.has(r.servico)) return false;
            if (filtroClassificacao.size && !filtroClassificacao.has(r.classificacao)) return false;
            if (filtroCanal.size && !filtroCanal.has(r.canal)) return false;
            if (filtroNota.size && !filtroNota.has(String(r.nota))) return false;
            if (filtroData.size && !filtroData.has(r.dataDiaKey)) return false;
            return true;
        });

        renderizarDashboard(filtrados, dadosBrutos.length);
        atualizarRotuloBotaoFiltros();
    }

    function limparDashboard() {
        dadosBrutos = [];
        dadosFiltrados = [];
        limparVisualizacao();
        removerPesquisaDoStorage();

        limparFiltros(true);
        preencherSelect(pesquisaFilterAgente, []);
        preencherSelect(pesquisaFilterServico, []);
        preencherSelect(pesquisaFilterClassificacao, []);
        preencherSelect(pesquisaFilterCanal, []);
        preencherSelect(pesquisaFilterNota, []);
        preencherSelect(pesquisaFilterData, []);
        atualizarInterfaceFiltros();
        atualizarBotaoFiltros(false);

        const input = el("pesquisaArquivoInput");
        if (input) input.value = "";
        setTexto("pesquisaFileStatus", "Nenhum arquivo selecionado.");
        setStatus("Dados limpos. Importe um novo arquivo para reiniciar a análise.");
    }

    function processarArquivo(arquivo) {
        if (!arquivo) {
            setStatus("Selecione um arquivo CSV ou XLSX antes de importar.", true);
            return;
        }

        setStatus("⏳ Processando arquivo...");

        const reader = new FileReader();
        const nome = String(arquivo.name || "").toLowerCase();

        if (nome.endsWith(".csv")) {
            reader.onload = (e) => {
                try {
                    const rows = parseCsv(e.target.result);
                    const registros = rows.map(normalizarRegistro).filter(linhaTemDadosValidos);
                    dadosBrutos = registros;
                    salvarPesquisaNoStorage(arquivo.name);
                    popularFiltros();
                    limparFiltros(true);
                    atualizarBotaoFiltros(registros.length > 0);
                    aplicarFiltros();
                } catch (err) {
                    setStatus("Erro ao processar CSV: " + err.message, true);
                }
            };
            reader.readAsText(arquivo, "UTF-8");
            return;
        }

        reader.onload = (e) => {
            try {
                const rows = parseXlsx(e.target.result);
                const registros = rows.map(normalizarRegistro).filter(linhaTemDadosValidos);
                dadosBrutos = registros;
                salvarPesquisaNoStorage(arquivo.name);
                popularFiltros();
                limparFiltros(true);
                atualizarBotaoFiltros(registros.length > 0);
                aplicarFiltros();
            } catch (err) {
                setStatus("Erro ao processar XLSX: " + err.message, true);
            }
        };
        reader.readAsArrayBuffer(arquivo);
    }

    document.addEventListener("DOMContentLoaded", function () {
        const importBtn = el("pesquisaImportButton");
        const clearBtn = el("pesquisaClearButton");
        const fileInput = el("pesquisaArquivoInput");
        const fileStatus = el("pesquisaFileStatus");
        const applyFiltersBtn = el("pesquisaApplyFiltersBtn");
        const clearFiltersBtn = el("pesquisaClearFiltersBtn");

        pesquisaAuditoriaNotaFiltro = el("pesquisaAuditoriaNotaFiltro");

        if (pesquisaAuditoriaNotaFiltro) {
            pesquisaAuditoriaNotaFiltro.addEventListener("change", function () {
                renderizarTabelaAuditoria(dadosFiltrados);
            });
        }

        pesquisaToggleFilterSectionButton = el("pesquisaToggleFilterSectionButton");
        pesquisaFilterSection = el("pesquisaFilterSection");

        pesquisaFilterAgente = el("pesquisaFilterAgente");
        pesquisaFilterServico = el("pesquisaFilterServico");
        pesquisaFilterClassificacao = el("pesquisaFilterClassificacao");
        pesquisaFilterCanal = el("pesquisaFilterCanal");
        pesquisaFilterNota = el("pesquisaFilterNota");
        pesquisaFilterData = el("pesquisaFilterData");

        pesquisaFilterAgenteSearch = el("pesquisaFilterAgenteSearch");
        pesquisaFilterServicoSearch = el("pesquisaFilterServicoSearch");
        pesquisaFilterClassificacaoSearch = el("pesquisaFilterClassificacaoSearch");
        pesquisaFilterCanalSearch = el("pesquisaFilterCanalSearch");
        pesquisaFilterNotaSearch = el("pesquisaFilterNotaSearch");
        pesquisaFilterDataSearch = el("pesquisaFilterDataSearch");

        pesquisaFilterAgenteOptions = el("pesquisaFilterAgenteOptions");
        pesquisaFilterServicoOptions = el("pesquisaFilterServicoOptions");
        pesquisaFilterClassificacaoOptions = el("pesquisaFilterClassificacaoOptions");
        pesquisaFilterCanalOptions = el("pesquisaFilterCanalOptions");
        pesquisaFilterNotaOptions = el("pesquisaFilterNotaOptions");
        pesquisaFilterDataOptions = el("pesquisaFilterDataOptions");

        pesquisaEvolucaoAgrupamento = el("pesquisaEvolucaoAgrupamento");
        pesquisaEvolucaoMes = el("pesquisaEvolucaoMes");
        pesquisaEvolucaoMesWrap = el("pesquisaEvolucaoMesWrap");

        pesquisaAuditoriaPrevBtn = el("pesquisaAuditoriaPrevBtn");
        pesquisaAuditoriaNextBtn = el("pesquisaAuditoriaNextBtn");
        pesquisaAuditoriaPageInfo = el("pesquisaAuditoriaPageInfo");

        atualizarBotaoFiltros(false);
        limparVisualizacao();

        if (pesquisaToggleFilterSectionButton) {
            pesquisaToggleFilterSectionButton.addEventListener("click", function () {
                const aberto = pesquisaFilterSection && !pesquisaFilterSection.classList.contains("filter-section--hidden");
                definirVisibilidadeFiltros(!aberto);
            });
        }

        [
            pesquisaFilterAgenteSearch,
            pesquisaFilterServicoSearch,
            pesquisaFilterClassificacaoSearch,
            pesquisaFilterCanalSearch,
            pesquisaFilterNotaSearch,
            pesquisaFilterDataSearch
        ].forEach((input) => {
            if (!input) return;
            input.addEventListener("input", atualizarInterfaceFiltros);
        });

        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener("click", aplicarFiltros);
        }

        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener("click", function () {
                limparFiltros(true);
                aplicarFiltros();
            });
        }

        if (fileInput && fileStatus) {
            fileInput.addEventListener("change", function () {
                fileStatus.textContent = fileInput.files[0] ? fileInput.files[0].name : "Nenhum arquivo selecionado.";
            });
        }

        if (importBtn && fileInput) {
            importBtn.addEventListener("click", function () {
                processarArquivo(fileInput.files[0]);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener("click", limparDashboard);
        }

        restaurarPesquisaDoStorage();

        if (pesquisaEvolucaoAgrupamento) {
            pesquisaEvolucaoAgrupamento.addEventListener("change", function () {
                renderizarEvolucaoPorPeriodo(dadosFiltrados);
            });
        }

        if (pesquisaEvolucaoMes) {
            pesquisaEvolucaoMes.addEventListener("change", function () {
                renderizarEvolucaoPorPeriodo(dadosFiltrados);
            });
        }

        if (pesquisaAuditoriaPrevBtn) {
            pesquisaAuditoriaPrevBtn.addEventListener("click", function () {
                if (auditoriaPaginaAtual <= 1) return;
                auditoriaPaginaAtual -= 1;
                renderizarPaginaAuditoria();
            });
        }

        if (pesquisaAuditoriaNextBtn) {
            pesquisaAuditoriaNextBtn.addEventListener("click", function () {
                const totalPaginas = auditoriaCriticos.length ? Math.ceil(auditoriaCriticos.length / AUDITORIA_ITENS_POR_PAGINA) : 0;
                if (auditoriaPaginaAtual >= totalPaginas) return;
                auditoriaPaginaAtual += 1;
                renderizarPaginaAuditoria();
            });
        }

        atualizarControlesPaginacaoAuditoria();
    });
})();
