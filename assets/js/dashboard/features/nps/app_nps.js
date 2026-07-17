// ============================================================
// Dashboard de Cancelamentos - app_nps.js
// Painel de análise de cancelamentos de serviço:
// motivos, serviços, cidades, bairros e longevidade dos clientes.
// Importação via CSV/XLSX com colunas do relatório Hubsoft.
// ============================================================

(function () {
    "use strict";

    if (window.__dashboardNpsInicializado) {
        return;
    }
    window.__dashboardNpsInicializado = true;

    // ─── Paleta de cores ──────────────────────────────────────────────────────
    const CORES = [
        "#38bdf8", "#fbbf24", "#34d399", "#a78bfa", "#fb7185",
        "#22d3ee", "#f97316", "#818cf8", "#f472b6", "#a3e635",
        "#2dd4bf", "#c4b5fd"
    ];
    const COR_TEXTO_GRAFICO = "#dbe6ff";
    const COR_TEXTO_GRAFICO_FORTE = "#f8fbff";
    const COR_GRADE_GRAFICO = "rgba(147, 169, 255, 0.22)";

    // ─── Instâncias de Chart.js ───────────────────────────────────────────────
    let chartMotivo      = null;
    let chartServico     = null;
    let chartCidade      = null;
    let chartLongevidade = null;
    let chartMensal      = null;
    let chartBairro      = null;

    // ─── Dados carregados ─────────────────────────────────────────────────────
    let dadosCarregados = [];
    let npsLinhasFiltradasAtuais = [];
    let npsCancelamentoPaginaAtual = 1;
    let npsCancelamentoSelecionadoChave = "";
    const NPS_CANCELAMENTOS_POR_PAGINA = 10;
    const NPS_STORAGE_KEY = "nps-cancelamentos-v1";
    const NPS_FILE_META_KEY = "nps-cancelamentos-meta-v1";

    // ─── Controles de filtros da análise ─────────────────────────────────────
    let npsToggleFilterSectionButton = null;
    let npsFilterSection = null;
    let npsFilterUsuarioCancelamento = null;
    let npsFilterMotivo = null;
    let npsFilterServico = null;
    let npsFilterCidade = null;
    let npsFilterBairro = null;
    let npsFilterMes = null;
    let npsFilterUsuarioCancelamentoSearch = null;
    let npsFilterMotivoSearch = null;
    let npsFilterServicoSearch = null;
    let npsFilterCidadeSearch = null;
    let npsFilterBairroSearch = null;
    let npsFilterMesSearch = null;
    let npsFilterUsuarioCancelamentoOptions = null;
    let npsFilterMotivoOptions = null;
    let npsFilterServicoOptions = null;
    let npsFilterCidadeOptions = null;
    let npsFilterBairroOptions = null;
    let npsFilterMesOptions = null;
    let filtrosAnaliseDisponiveis = false;

    // ─── Helpers DOM ─────────────────────────────────────────────────────────
    function el(id) { return document.getElementById(id); }

    function setTexto(id, valor) {
        const e = el(id);
        if (e) e.textContent = valor;
    }

    function setStatus(msg, erro) {
        const e = el("npsStatus");
        if (!e) return;
        e.textContent = msg;
        e.style.color = erro ? "#ef4444" : "";
    }

    function salvarDadosLocalNps(fileName) {
        try {
            localStorage.setItem(NPS_STORAGE_KEY, JSON.stringify(dadosCarregados || []));
            localStorage.setItem(NPS_FILE_META_KEY, JSON.stringify({
                fileName: String(fileName || "").trim(),
                importedAt: new Date().toISOString(),
                total: Array.isArray(dadosCarregados) ? dadosCarregados.length : 0
            }));
        } catch (_) {
            // Ignora indisponibilidade de localStorage.
        }
    }

    function removerDadosLocalNps() {
        try {
            localStorage.removeItem(NPS_STORAGE_KEY);
            localStorage.removeItem(NPS_FILE_META_KEY);
        } catch (_) {
            // Ignora indisponibilidade de localStorage.
        }
    }

    function restaurarDadosLocalNps() {
        try {
            const raw = localStorage.getItem(NPS_STORAGE_KEY);
            if (!raw) return false;

            const linhas = JSON.parse(raw);
            if (!Array.isArray(linhas) || !linhas.length) return false;

            dadosCarregados = linhas;
            popularFiltrosAnalise();
            limparFiltrosAnalise(true);
            atualizarBotaoFiltrosAnalise(linhas.length > 0);
            aplicarFiltrosAnalise();

            const metaRaw = localStorage.getItem(NPS_FILE_META_KEY);
            const meta = metaRaw ? JSON.parse(metaRaw) : null;
            const fileName = String((meta && meta.fileName) || "").trim();
            const fs = el("npsFileStatus");
            if (fs && fileName) {
                fs.textContent = "Arquivo restaurado: " + fileName;
            }
            setStatus("📂 " + linhas.length + " cancelamentos restaurados do armazenamento local.");
            return true;
        } catch (_) {
            return false;
        }
    }

    // ─── Destruir gráfico anterior ────────────────────────────────────────────
    function destruirChart(instancia) {
        if (instancia) {
            try { instancia.destroy(); } catch (_) {}
        }
        return null;
    }

    // ─── Criar gráfico de barras horizontal ──────────────────────────────────
    function criarBarraHorizontal(canvasId, labels, valores, titulo, corBase) {
        const canvas = el(canvasId);
        if (!canvas) return null;
        const ctx = canvas.getContext("2d");
        return new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: titulo,
                    data: valores,
                    backgroundColor: corBase || CORES[0],
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: "end",
                        align: "end",
                        color: COR_TEXTO_GRAFICO_FORTE,
                        font: { weight: "700", size: 11 },
                        formatter: v => v
                    }
                },
                scales: {
                    x: { grid: { color: COR_GRADE_GRAFICO }, ticks: { color: COR_TEXTO_GRAFICO } },
                    y: { grid: { display: false }, ticks: { color: COR_TEXTO_GRAFICO_FORTE, font: { weight: "600" } } }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    // ─── Criar gráfico de rosca ───────────────────────────────────────────────
    function criarRosca(canvasId, labels, valores, titulo) {
        const canvas = el(canvasId);
        if (!canvas) return null;
        const ctx = canvas.getContext("2d");
        return new Chart(ctx, {
            type: "doughnut",
            data: {
                labels,
                datasets: [{
                    data: valores,
                    backgroundColor: CORES.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: "rgba(8, 15, 40, 0.9)"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "55%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { color: COR_TEXTO_GRAFICO, font: { size: 11, weight: "600" }, padding: 10 }
                    },
                    datalabels: {
                        color: COR_TEXTO_GRAFICO_FORTE,
                        font: { weight: "700", size: 11 },
                        formatter: (v, ctx2) => {
                            const total = ctx2.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((v / total) * 100).toFixed(0);
                            return pct >= 5 ? pct + "%" : "";
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    // ─── Criar gráfico de linha (cancelamentos por mês) ───────────────────────
    function criarLinha(canvasId, labels, valores) {
        const canvas = el(canvasId);
        if (!canvas) return null;
        const ctx = canvas.getContext("2d");
        return new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Cancelamentos",
                    data: valores,
                    borderColor: "#38bdf8",
                    backgroundColor: "rgba(56, 189, 248, 0.32)",
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: "#38bdf8",
                    pointBorderColor: "#f8fbff",
                    pointBorderWidth: 1.5,
                    fill: true,
                    tension: 0.35
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: "top",
                        align: "top",
                        color: COR_TEXTO_GRAFICO_FORTE,
                        font: { weight: "700", size: 11 },
                        formatter: v => v
                    }
                },
                scales: {
                    x: { grid: { color: COR_GRADE_GRAFICO }, ticks: { color: COR_TEXTO_GRAFICO } },
                    y: { beginAtZero: true, grid: { color: COR_GRADE_GRAFICO }, ticks: { color: COR_TEXTO_GRAFICO } }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    // ─── Normalizar texto (remove acentos, \n, espaços extras) ──────────────
    function normalizar(str) {
        if (!str || str === "-") return "";
        return String(str).replace(/\n/g, "").trim();
    }

    function linhaTemDadosValidos(row) {
        if (!row || typeof row !== "object") return false;

        const valores = Object.values(row);
        if (!valores.length) return false;

        return valores.some((valor) => {
            const texto = String(valor === null || valor === undefined ? "" : valor).trim();
            return texto !== "" && texto !== "-";
        });
    }

    function parseNumeroManual(valor) {
        if (valor === null || valor === undefined || valor === "") return null;
        const numero = Number(String(valor).replace(",", "."));
        return Number.isFinite(numero) ? numero : null;
    }

    function formatarPercentual(valor) {
        return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
    }

    function formatarValorChurn(percentual, quantidade) {
        const quantidadeTexto = quantidade.toLocaleString("pt-BR") + (quantidade === 1 ? " cliente" : " clientes");
        return formatarPercentual(percentual) + " | " + quantidadeTexto;
    }

    function atualizarResultadoChurn(bruto, evitavel, inevitavel, mensagem) {
        setTexto("churnBrutoValue", bruto);
        setTexto("churnEvitavelValue", evitavel);
        setTexto("churnInevitavelValue", inevitavel);
        setTexto("churnCalcStatus", mensagem);
    }

    function calcularChurnManual() {
        const inicio = parseNumeroManual(el("churnInicioInput")?.value);
        const evitavel = parseNumeroManual(el("churnEvitavelInput")?.value);
        const inevitavel = parseNumeroManual(el("churnInevitavelInput")?.value);

        if (inicio === null || evitavel === null || inevitavel === null) {
            atualizarResultadoChurn("—", "—", "—", "Preencha os três valores para calcular os churns.");
            return;
        }

        if (inicio <= 0 || evitavel < 0 || inevitavel < 0) {
            atualizarResultadoChurn("—", "—", "—", "Use valores válidos: início > 0 e cancelamentos >= 0.");
            return;
        }

        const churnBrutoQtd = evitavel + inevitavel;
        const churnBrutoRate = (churnBrutoQtd / inicio) * 100;
        const churnEvitavelRate = (evitavel / inicio) * 100;
        const churnInevitavelRate = (inevitavel / inicio) * 100;

        atualizarResultadoChurn(
            formatarValorChurn(churnBrutoRate, churnBrutoQtd),
            formatarValorChurn(churnEvitavelRate, evitavel),
            formatarValorChurn(churnInevitavelRate, inevitavel),
            "Cálculo aplicado: Churn = (Cancelamentos / Base Inicial) * 100"
        );
    }

    function limparCalculadoraChurn() {
        ["churnInicioInput", "churnEvitavelInput", "churnInevitavelInput"].forEach((id) => {
            const input = el(id);
            if (input) input.value = "";
        });
        atualizarResultadoChurn("—", "—", "—", "Informe os valores manualmente para calcular a Taxa de Evasão de Clientes.");
    }

    function normalizarTextoBusca(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function escaparHtml(valor) {
        return String(valor || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatarMesAno(chaveMes) {
        const partes = String(chaveMes || "").split("-");
        if (partes.length !== 2) return String(chaveMes || "");
        return partes[1] + "/" + partes[0];
    }

    function formatarDataBrasil(valor) {
        const data = parseData(valor);
        if (!data) return "—";
        return data.toLocaleDateString("pt-BR");
    }

    function obterCancelamentoEmDestaque(linhas) {
        if (!Array.isArray(linhas) || linhas.length === 0) return null;

        return linhas.slice().sort((a, b) => {
            const dataA = parseData(a.data_cancelamento) || new Date(0);
            const dataB = parseData(b.data_cancelamento) || new Date(0);
            return dataB - dataA;
        })[0] || linhas[0] || null;
    }

    function obterChaveCancelamento(linha) {
        return [
            normalizar(linha.codigo_cliente || ""),
            normalizar(linha.nome_razaosocial || ""),
            normalizar(linha.data_cancelamento || ""),
            normalizar(linha.motivo_cancelamento || ""),
            normalizar(linha.servico || ""),
        ].join("|");
    }

    function obterListaUltimosCancelamentos(linhas, limite) {
        return (linhas || [])
            .slice()
            .sort((a, b) => {
                const dataA = parseData(a.data_cancelamento) || new Date(0);
                const dataB = parseData(b.data_cancelamento) || new Date(0);
                return dataB - dataA;
            })
            .slice(0, limite || Number.MAX_SAFE_INTEGER);
    }

    function renderizarListaCancelamentos(linhas, linhaSelecionada, preservarPagina) {
        const lista = el("npsCancelamentoLista");
        const status = el("npsCancelamentoListaStatus");
        const paginaLabel = el("npsCancelamentoPaginaLabel");
        const paginaAnterior = el("npsCancelamentoPaginaAnterior");
        const paginaProxima = el("npsCancelamentoPaginaProxima");

        if (!lista || !status || !paginaLabel || !paginaAnterior || !paginaProxima) return;

        const todos = obterListaUltimosCancelamentos(linhas);
        const total = todos.length;
        const totalPaginas = Math.max(1, Math.ceil(total / NPS_CANCELAMENTOS_POR_PAGINA));

        if (!preservarPagina) {
            npsCancelamentoPaginaAtual = 1;
        }

        if (linhaSelecionada) {
            npsCancelamentoSelecionadoChave = obterChaveCancelamento(linhaSelecionada);
        }

        if (npsCancelamentoPaginaAtual > totalPaginas) npsCancelamentoPaginaAtual = totalPaginas;
        if (npsCancelamentoPaginaAtual < 1) npsCancelamentoPaginaAtual = 1;

        const inicio = (npsCancelamentoPaginaAtual - 1) * NPS_CANCELAMENTOS_POR_PAGINA;
        const fim = inicio + NPS_CANCELAMENTOS_POR_PAGINA;
        const ultimos = todos.slice(inicio, fim);

        status.textContent = total + " item(ns)";
        paginaLabel.textContent = "Página " + npsCancelamentoPaginaAtual + " de " + totalPaginas;
        paginaAnterior.disabled = npsCancelamentoPaginaAtual <= 1;
        paginaProxima.disabled = npsCancelamentoPaginaAtual >= totalPaginas;

        if (!total) {
            lista.innerHTML = '<div class="nps-cancelamento-list-empty">Nenhum cancelamento disponível para exibição.</div>';
            paginaLabel.textContent = "Página 0 de 0";
            paginaAnterior.disabled = true;
            paginaProxima.disabled = true;
            return;
        }

        const chaveSelecionada = npsCancelamentoSelecionadoChave;

        lista.innerHTML = ultimos.map((linha, indice) => {
            const chave = obterChaveCancelamento(linha);
            const nomeRazaoSocial = normalizar(linha.nome_razaosocial) || "Não informado";
            const motivoCancelamento = normalizar(linha.motivo_cancelamento) || "Não informado";
            const codigoCliente = normalizar(linha.codigo_cliente || "");
            const servico = normalizar(linha.servico || "");
            const dataCancelamento = formatarDataBrasil(linha.data_cancelamento);
            const dataHabilitacao = formatarDataBrasil(linha.data_habilitacao || linha.data_cadastro || "");
            const ativo = chaveSelecionada && chave === chaveSelecionada ? " is-active" : "";
            const badgeTexto = codigoCliente || servico || "Sem código";

            return (
                '<button type="button" class="nps-cancelamento-list-item' + ativo + '" data-chave="' + escaparHtml(chave) + '">' +
                    '<div class="nps-cancelamento-list-item__top">' +
                        '<div class="nps-cancelamento-list-item__nome">' + escaparHtml(nomeRazaoSocial) + '</div>' +
                        '<div class="nps-cancelamento-list-item__badge">' + escaparHtml(badgeTexto) + '</div>' +
                    '</div>' +
                    '<div class="nps-cancelamento-list-item__meta">Cancelamento: ' + escaparHtml(dataCancelamento) + '</div>' +
                    '<div class="nps-cancelamento-list-item__meta">' +
                        escaparHtml(motivoCancelamento) +
                        ' · Habilitação: ' + escaparHtml(dataHabilitacao) +
                    '</div>' +
                '</button>'
            );
        }).join("");

        Array.from(lista.querySelectorAll(".nps-cancelamento-list-item")).forEach((button) => {
            button.addEventListener("click", () => {
                const chave = String(button.getAttribute("data-chave") || "");
                const selecionado = todos.find((linha) => obterChaveCancelamento(linha) === chave) || null;
                npsCancelamentoSelecionadoChave = chave;
                atualizarBlocoInformacaoCancelamento(selecionado, linhas.length);
                renderizarListaCancelamentos(linhas, selecionado, true);
            });
        });
    }

    function alterarPaginaCancelamentos(delta) {
        npsCancelamentoPaginaAtual += delta;
        renderizarListaCancelamentos(npsLinhasFiltradasAtuais, null, true);
    }

    function atualizarBlocoInformacaoCancelamento(linha, totalFiltrado) {
        const status = el("npsCancelamentoStatus");
        const nome = el("npsCancelamentoNome");
        const motivo = el("npsCancelamentoMotivo");
        const dataHabilitacao = el("npsCancelamentoDataHabilitacao");
        const obs = el("npsCancelamentoObs");

        if (!linha) {
            if (status) status.textContent = "Selecione ou importe os cancelamentos para visualizar o registro em destaque.";
            if (nome) nome.textContent = "—";
            if (motivo) motivo.textContent = "—";
            if (dataHabilitacao) dataHabilitacao.textContent = "—";
            if (obs) obs.textContent = "—";
            return;
        }

        const nomeRazaoSocial = normalizar(linha.nome_razaosocial) || "Não informado";
        const motivoCancelamento = normalizar(linha.motivo_cancelamento) || "Não informado";
        const dataHabilitacaoValor = linha.data_habilitacao || linha.data_cadastro || "";
        const observacao = normalizar(linha.obs_cancelamento) || "Sem observações.";

        if (status) {
            const prefixo = totalFiltrado > 1 ? totalFiltrado + " cancelamentos filtrados. Exibindo o mais recente." : "Cancelamento filtrado.";
            status.textContent = prefixo;
        }
        if (nome) nome.textContent = nomeRazaoSocial;
        if (motivo) motivo.textContent = motivoCancelamento;
        if (dataHabilitacao) dataHabilitacao.textContent = formatarDataBrasil(dataHabilitacaoValor);
        if (obs) obs.textContent = observacao;
    }

    function obterChaveMesCancelamento(row) {
        const dCanc = parseData(row.data_cancelamento);
        if (!dCanc) return "";
        return dCanc.getFullYear() + "-" + String(dCanc.getMonth() + 1).padStart(2, "0");
    }

    // ─── Parsear data no formato dd/MM/yyyy ──────────────────────────────────
    function parseData(str) {
        if (!str || str === "-") return null;
        const s = String(str).trim();
        // formato dd/MM/yyyy
        const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
        // ISO
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
    }

    // ─── Top N de um objeto contagem ─────────────────────────────────────────
    function topN(contagem, n) {
        return Object.entries(contagem)
            .filter(([k]) => k && k !== "-" && k !== "")
            .sort((a, b) => b[1] - a[1])
            .slice(0, n);
    }

    function obterValoresSelecionadosDoFiltro(select) {
        if (!select) return [];
        return Array.from(select.selectedOptions || [])
            .map((opcao) => String(opcao.value || "").trim())
            .filter(Boolean);
    }

    function obterQuantidadeFiltrosAtivos() {
        return obterValoresSelecionadosDoFiltro(npsFilterUsuarioCancelamento).length
            + obterValoresSelecionadosDoFiltro(npsFilterMotivo).length
            + obterValoresSelecionadosDoFiltro(npsFilterServico).length
            + obterValoresSelecionadosDoFiltro(npsFilterCidade).length
            + obterValoresSelecionadosDoFiltro(npsFilterBairro).length
            + obterValoresSelecionadosDoFiltro(npsFilterMes).length;
    }

    function atualizarRotuloBotaoFiltrosAnalise() {
        if (!npsToggleFilterSectionButton) return;

        const painelAberto = npsFilterSection && !npsFilterSection.classList.contains("filter-section--hidden");
        const prefixo = painelAberto ? "Editar Filtros de Análise" : "Filtros de Análise";
        const quantidadeAtiva = filtrosAnaliseDisponiveis ? obterQuantidadeFiltrosAtivos() : 0;
        const sufixo = quantidadeAtiva > 0 ? " (" + quantidadeAtiva + ")" : "";

        npsToggleFilterSectionButton.textContent = prefixo + sufixo;
    }

    function definirVisibilidadeFiltrosAnalise(visivel) {
        if (!npsFilterSection) return;

        if (visivel) {
            npsFilterSection.classList.remove("filter-section--hidden");
        } else {
            npsFilterSection.classList.add("filter-section--hidden");
        }

        if (npsToggleFilterSectionButton) {
            npsToggleFilterSectionButton.setAttribute("aria-expanded", String(visivel));
            atualizarRotuloBotaoFiltrosAnalise();
        }
    }

    function atualizarBotaoFiltrosAnalise(disponivel) {
        filtrosAnaliseDisponiveis = Boolean(disponivel);

        if (!npsToggleFilterSectionButton) return;

        npsToggleFilterSectionButton.disabled = !filtrosAnaliseDisponiveis;

        if (!filtrosAnaliseDisponiveis) {
            npsToggleFilterSectionButton.setAttribute("aria-expanded", "false");
            definirVisibilidadeFiltrosAnalise(false);
        }

        atualizarRotuloBotaoFiltrosAnalise();
    }

    function preencherSelectComValores(select, valores, formatarLabel) {
        if (!select) return;

        select.innerHTML = "";
        valores.forEach((valor) => {
            const option = document.createElement("option");
            option.value = valor;
            option.textContent = formatarLabel ? formatarLabel(valor) : valor;
            select.appendChild(option);
        });
    }

    function renderizarOpcoesFiltro(select, inputBusca, containerOpcoes, mensagemVazia) {
        if (!select || !containerOpcoes) return;

        const termoBusca = normalizarTextoBusca(inputBusca ? inputBusca.value : "");
        const selecionados = new Set(obterValoresSelecionadosDoFiltro(select).map((valor) => normalizarTextoBusca(valor)));

        const opcoes = Array.from(select.options || []).filter((opcao) => {
            const valor = String(opcao.value || "").trim();
            if (!valor) return false;

            const texto = String(opcao.textContent || valor);
            const chave = normalizarTextoBusca(texto);
            return !termoBusca || chave.indexOf(termoBusca) !== -1;
        });

        if (opcoes.length === 0) {
            containerOpcoes.innerHTML = '<div class="filter-options-empty">' + escaparHtml(mensagemVazia || "Nenhuma opção encontrada.") + "</div>";
            return;
        }

        containerOpcoes.innerHTML = opcoes.map((opcao, indice) => {
            const valor = String(opcao.value || "");
            const texto = String(opcao.textContent || valor);
            const chave = normalizarTextoBusca(valor);
            const checked = selecionados.has(chave) ? " checked" : "";
            const id = select.id + "-opt-" + indice;

            return '<label class="filter-option" for="' + id + '"><input id="' + id + '" type="checkbox" data-value="' + escaparHtml(valor) + '"' + checked + ' /><span>' + escaparHtml(texto) + "</span></label>";
        }).join("");

        Array.from(containerOpcoes.querySelectorAll("input[type=checkbox][data-value]")).forEach((checkbox) => {
            checkbox.addEventListener("change", () => {
                const valor = String(checkbox.getAttribute("data-value") || "");

                Array.from(select.options || []).forEach((opcao) => {
                    if (String(opcao.value || "") === valor) {
                        opcao.selected = checkbox.checked;
                    }
                });

                atualizarRotuloBotaoFiltrosAnalise();
            });
        });
    }

    function atualizarInterfaceFiltrosMultiplos() {
        renderizarOpcoesFiltro(npsFilterUsuarioCancelamento, npsFilterUsuarioCancelamentoSearch, npsFilterUsuarioCancelamentoOptions, "Nenhum usuário encontrado.");
        renderizarOpcoesFiltro(npsFilterMotivo, npsFilterMotivoSearch, npsFilterMotivoOptions, "Nenhum motivo encontrado.");
        renderizarOpcoesFiltro(npsFilterServico, npsFilterServicoSearch, npsFilterServicoOptions, "Nenhum serviço encontrado.");
        renderizarOpcoesFiltro(npsFilterCidade, npsFilterCidadeSearch, npsFilterCidadeOptions, "Nenhuma cidade encontrada.");
        renderizarOpcoesFiltro(npsFilterBairro, npsFilterBairroSearch, npsFilterBairroOptions, "Nenhum bairro encontrado.");
        renderizarOpcoesFiltro(npsFilterMes, npsFilterMesSearch, npsFilterMesOptions, "Nenhum mês encontrado.");
    }

    function obterValoresUnicosOrdenados(linhas, extrator) {
        const valores = new Set();

        (linhas || []).forEach((row) => {
            const valor = normalizar(extrator(row));
            if (valor) valores.add(valor);
        });

        return Array.from(valores).sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
    }

    function popularFiltrosAnalise() {
        preencherSelectComValores(npsFilterUsuarioCancelamento, obterValoresUnicosOrdenados(dadosCarregados, (row) => row.usuario_cancelamento || row.usuario_abertura || row.usuario || ""));
        preencherSelectComValores(npsFilterMotivo, obterValoresUnicosOrdenados(dadosCarregados, (row) => row.motivo_cancelamento));
        preencherSelectComValores(npsFilterServico, obterValoresUnicosOrdenados(dadosCarregados, (row) => row.servico));
        preencherSelectComValores(npsFilterCidade, obterValoresUnicosOrdenados(dadosCarregados, (row) => row.cidade));
        preencherSelectComValores(npsFilterBairro, obterValoresUnicosOrdenados(dadosCarregados, (row) => row.bairro));

        const meses = Array.from(new Set((dadosCarregados || [])
            .map((row) => obterChaveMesCancelamento(row))
            .filter(Boolean)))
            .sort();
        preencherSelectComValores(npsFilterMes, meses, formatarMesAno);

        atualizarInterfaceFiltrosMultiplos();
        atualizarRotuloBotaoFiltrosAnalise();
    }

    function limparFiltrosAnalise(resetBusca) {
        [npsFilterUsuarioCancelamento, npsFilterMotivo, npsFilterServico, npsFilterCidade, npsFilterBairro, npsFilterMes].forEach((select) => {
            if (!select) return;
            Array.from(select.options || []).forEach((opcao) => {
                opcao.selected = false;
            });
        });

        if (resetBusca) {
            [npsFilterUsuarioCancelamentoSearch, npsFilterMotivoSearch, npsFilterServicoSearch, npsFilterCidadeSearch, npsFilterBairroSearch, npsFilterMesSearch].forEach((input) => {
                if (input) input.value = "";
            });
        }

        atualizarInterfaceFiltrosMultiplos();
        atualizarRotuloBotaoFiltrosAnalise();
    }

    function aplicarFiltrosAnalise() {
        if (!dadosCarregados.length) {
            setStatus("Nenhum registro válido encontrado no arquivo.", true);
            return;
        }

        const usuarioCancelamentoSelecionados = new Set(obterValoresSelecionadosDoFiltro(npsFilterUsuarioCancelamento).map((v) => normalizarTextoBusca(v)));
        const motivoSelecionados = new Set(obterValoresSelecionadosDoFiltro(npsFilterMotivo).map((v) => normalizarTextoBusca(v)));
        const servicoSelecionados = new Set(obterValoresSelecionadosDoFiltro(npsFilterServico).map((v) => normalizarTextoBusca(v)));
        const cidadeSelecionados = new Set(obterValoresSelecionadosDoFiltro(npsFilterCidade).map((v) => normalizarTextoBusca(v)));
        const bairroSelecionados = new Set(obterValoresSelecionadosDoFiltro(npsFilterBairro).map((v) => normalizarTextoBusca(v)));
        const mesSelecionados = new Set(obterValoresSelecionadosDoFiltro(npsFilterMes));

        const filtrados = dadosCarregados.filter((row) => {
            const usuarioCancelamento = normalizarTextoBusca(normalizar(row.usuario_cancelamento || row.usuario_abertura || row.usuario || "") || "Não informado");
            const motivo = normalizarTextoBusca(normalizar(row.motivo_cancelamento) || "Não informado");
            const servico = normalizarTextoBusca(normalizar(row.servico) || "Não informado");
            const cidade = normalizarTextoBusca(normalizar(row.cidade) || "Não informado");
            const bairro = normalizarTextoBusca(normalizar(row.bairro) || "Não informado");
            const mes = obterChaveMesCancelamento(row);

            if (usuarioCancelamentoSelecionados.size && !usuarioCancelamentoSelecionados.has(usuarioCancelamento)) return false;
            if (motivoSelecionados.size && !motivoSelecionados.has(motivo)) return false;
            if (servicoSelecionados.size && !servicoSelecionados.has(servico)) return false;
            if (cidadeSelecionados.size && !cidadeSelecionados.has(cidade)) return false;
            if (bairroSelecionados.size && !bairroSelecionados.has(bairro)) return false;
            if (mesSelecionados.size && !mesSelecionados.has(mes)) return false;

            return true;
        });

        if (!filtrados.length) {
            limparVisualizacaoDashboard();
            setStatus("Nenhum cancelamento encontrado para os filtros selecionados.");
            atualizarRotuloBotaoFiltrosAnalise();
            return;
        }

        renderizarDashboard(filtrados, dadosCarregados.length);
        atualizarRotuloBotaoFiltrosAnalise();
    }

    // ─── Processar e renderizar dados ─────────────────────────────────────────
    function renderizarDashboard(linhas, totalBase) {
        if (!linhas || linhas.length === 0) {
            atualizarBlocoInformacaoCancelamento(null, 0);
            setStatus("Nenhum registro válido encontrado no arquivo.", true);
            return;
        }

        // ── Contagens ─────────────────────────────────────────────────────────
        const cntMotivo      = {};
        const cntServico     = {};
        const cntCidade      = {};
        const cntBairro      = {};
        const cntBairroCidade = {};
        const cntMes         = {};
        const longevidades   = [];
        let   comDataCadastro = 0;

        linhas.forEach(row => {
            // motivo
            const motivo = normalizar(row.motivo_cancelamento) || "Não informado";
            cntMotivo[motivo] = (cntMotivo[motivo] || 0) + 1;

            // serviço
            const servico = normalizar(row.servico) || "Não informado";
            cntServico[servico] = (cntServico[servico] || 0) + 1;

            // cidade
            const cidade = normalizar(row.cidade) || "Não informado";
            cntCidade[cidade] = (cntCidade[cidade] || 0) + 1;

            // bairro
            const bairro = normalizar(row.bairro) || "Não informado";
            cntBairro[bairro] = (cntBairro[bairro] || 0) + 1;
            const bairroComCidade = bairro + " (" + cidade + ")";
            cntBairroCidade[bairroComCidade] = (cntBairroCidade[bairroComCidade] || 0) + 1;

            // mês de cancelamento
            const dCanc = parseData(row.data_cancelamento);
            if (dCanc) {
                const chave = dCanc.getFullYear() + "-" +
                    String(dCanc.getMonth() + 1).padStart(2, "0");
                cntMes[chave] = (cntMes[chave] || 0) + 1;
            }

            // longevidade
            const dCad = parseData(row.data_cadastro);
            if (dCanc && dCad && dCad.getFullYear() > 2000) {
                comDataCadastro++;
                const meses = Math.round((dCanc - dCad) / (1000 * 60 * 60 * 24 * 30));
                longevidades.push(meses);
            }
        });

        const total = linhas.length;
        const cancelamentoDestaque = obterCancelamentoEmDestaque(linhas);

        npsLinhasFiltradasAtuais = linhas.slice();
        npsCancelamentoPaginaAtual = 1;
        npsCancelamentoSelecionadoChave = cancelamentoDestaque ? obterChaveCancelamento(cancelamentoDestaque) : "";

        atualizarBlocoInformacaoCancelamento(cancelamentoDestaque, total);
        renderizarListaCancelamentos(linhas, cancelamentoDestaque, false);

        // ── KPIs ──────────────────────────────────────────────────────────────
        setTexto("canc-total",     total);
        setTexto("canc-top-motivo", topN(cntMotivo, 1)[0]?.[0] || "—");
        setTexto("canc-top-cidade", topN(cntCidade, 1)[0]?.[0] || "—");
        setTexto("canc-top-servico", topN(cntServico, 1)[0]?.[0] || "—");

        // longevidade média
        const mediaLong = longevidades.length
            ? Math.round(longevidades.reduce((a, b) => a + b, 0) / longevidades.length)
            : null;
        setTexto("canc-long-media", mediaLong !== null ? mediaLong + " meses" : "—");

        // inadimplência %
        const inadimplentes = (cntMotivo["Inadimplência"] || 0);
        const pctInad = ((inadimplentes / total) * 100).toFixed(1);
        setTexto("canc-pct-inadimplencia", pctInad + "%");

        // mudança de cidade %
        const mudancaCidade = Object.entries(cntMotivo)
            .filter(([k]) => k.toLowerCase().includes("cidade"))
            .reduce((s, [, v]) => s + v, 0);
        const pctMudanca = ((mudancaCidade / total) * 100).toFixed(1);
        setTexto("canc-pct-mudanca-cidade", pctMudanca + "%");

        // insatisfação %
        const insatisfeitos = (cntMotivo["Insatisfação"] || 0);
        const pctInsat = ((insatisfeitos / total) * 100).toFixed(1);
        setTexto("canc-pct-insatisfacao", pctInsat + "%");

        // cidades e bairros únicos
        const totalCidades = Object.keys(cntCidade).filter(k => k && k !== "-" && k !== "Não informado").length;
        const totalBairros = Object.keys(cntBairro).filter(k => k && k !== "-" && k !== "Não informado").length;
        setTexto("canc-total-cidades", totalCidades);
        setTexto("canc-total-bairros", totalBairros);

        const quantidadeFiltrosAtivos = obterQuantidadeFiltrosAtivos();
        if (quantidadeFiltrosAtivos > 0 && typeof totalBase === "number") {
            setStatus("✅ " + total + " cancelamentos exibidos de " + totalBase + " carregados.");
        } else {
            setStatus("✅ " + total + " cancelamentos carregados com sucesso.");
        }

        // ── Ranking tabela ────────────────────────────────────────────────────
        renderizarRanking(cntMotivo, total);

        // ── Gráficos ──────────────────────────────────────────────────────────

        // 1. Motivos de cancelamento (barras horizontais)
        chartMotivo = destruirChart(chartMotivo);
        const topMotivos = topN(cntMotivo, 8);
        chartMotivo = criarBarraHorizontal(
            "cancMotivoChart",
            topMotivos.map(([k]) => k),
            topMotivos.map(([, v]) => v),
            "Cancelamentos",
            CORES[0]
        );

        // 2. Distribuição por serviço (rosca)
        chartServico = destruirChart(chartServico);
        const topServicos = topN(cntServico, 8);
        chartServico = criarRosca(
            "cancServicoChart",
            topServicos.map(([k]) => k),
            topServicos.map(([, v]) => v),
            "Serviços"
        );

        // 3. Cancelamentos por cidade (barras horizontais)
        chartCidade = destruirChart(chartCidade);
        const topCidades = topN(cntCidade, 7);
        chartCidade = criarBarraHorizontal(
            "cancCidadeChart",
            topCidades.map(([k]) => k),
            topCidades.map(([, v]) => v),
            "Cancelamentos",
            CORES[1]
        );

        // 4. Longevidade (faixas)
        chartLongevidade = destruirChart(chartLongevidade);
        const faixas = {
            "< 1 ano":    longevidades.filter(m => m < 12).length,
            "1-2 anos":   longevidades.filter(m => m >= 12 && m < 24).length,
            "2-5 anos":   longevidades.filter(m => m >= 24 && m < 60).length,
            "5-10 anos":  longevidades.filter(m => m >= 60 && m < 120).length,
            "10+ anos":   longevidades.filter(m => m >= 120).length
        };
        chartLongevidade = criarRosca(
            "cancLongevidadeChart",
            Object.keys(faixas),
            Object.values(faixas),
            "Longevidade"
        );

        // 5. Cancelamentos por mês (linha)
        chartMensal = destruirChart(chartMensal);
        const mesesOrdenados = Object.keys(cntMes).sort();
        chartMensal = criarLinha(
            "cancMensalChart",
            mesesOrdenados,
            mesesOrdenados.map(m => cntMes[m])
        );

        // 6. Top bairros (barras horizontais)
        chartBairro = destruirChart(chartBairro);
        const topBairros = topN(cntBairroCidade, 8);
        chartBairro = criarBarraHorizontal(
            "cancBairroChart",
            topBairros.map(([k]) => k),
            topBairros.map(([, v]) => v),
            "Cancelamentos",
            CORES[2]
        );
    }

    // ─── Ranking de motivos ───────────────────────────────────────────────────
    function renderizarRanking(cntMotivo, total) {
        const container = el("cancRankingMotivos");
        if (!container) return;
        const lista = topN(cntMotivo, 10);
        container.innerHTML = lista.map(([motivo, qtd], i) => {
            const pct = ((qtd / total) * 100).toFixed(1);
            const largura = ((qtd / (lista[0]?.[1] || 1)) * 100).toFixed(1);
            return `
                <div class="nps-ranking-item">
                    <div class="nps-ranking-item__label">${i + 1}. ${motivo}</div>
                    <div class="nps-ranking-item__value" style="grid-column:2/4">
                        <div style="background:rgba(147,169,255,0.28);border-radius:6px;height:8px;width:100%;margin-bottom:4px">
                            <div style="background:#38bdf8;height:8px;border-radius:6px;width:${largura}%"></div>
                        </div>
                    </div>
                    <div class="nps-ranking-item__value">${qtd} <span style="color:#dbe6ff;font-size:0.8rem">(${pct}%)</span></div>
                </div>`;
        }).join("");
    }

    // ─── Limpar dashboard ────────────────────────────────────────────────────
    function limparVisualizacaoDashboard() {
        npsLinhasFiltradasAtuais = [];
        npsCancelamentoPaginaAtual = 1;
        npsCancelamentoSelecionadoChave = "";

        atualizarBlocoInformacaoCancelamento(null, 0);
        renderizarListaCancelamentos([], null, false);

        [
            "canc-total", "canc-top-motivo", "canc-top-cidade",
            "canc-top-servico", "canc-long-media",
            "canc-pct-inadimplencia", "canc-pct-mudanca-cidade", "canc-pct-insatisfacao",
            "canc-total-cidades", "canc-total-bairros"
        ].forEach(id => setTexto(id, "—"));

        chartMotivo      = destruirChart(chartMotivo);
        chartServico     = destruirChart(chartServico);
        chartCidade      = destruirChart(chartCidade);
        chartLongevidade = destruirChart(chartLongevidade);
        chartMensal      = destruirChart(chartMensal);
        chartBairro      = destruirChart(chartBairro);

        const ranking = el("cancRankingMotivos");
        if (ranking) ranking.innerHTML = "";
    }

    // ─── Limpar dashboard ────────────────────────────────────────────────────
    function limparDashboard() {
        dadosCarregados = [];
        limparVisualizacaoDashboard();
        removerDadosLocalNps();

        limparFiltrosAnalise(true);
        preencherSelectComValores(npsFilterMotivo, []);
        preencherSelectComValores(npsFilterServico, []);
        preencherSelectComValores(npsFilterCidade, []);
        preencherSelectComValores(npsFilterBairro, []);
        preencherSelectComValores(npsFilterMes, []);
        atualizarInterfaceFiltrosMultiplos();
        atualizarBotaoFiltrosAnalise(false);

        setStatus("Dados limpos. Importe um novo arquivo para reiniciar a análise.");
        const fs = el("npsFileStatus");
        if (fs) fs.textContent = "Nenhum arquivo selecionado.";
        const inp = el("npsArquivoInput");
        if (inp) inp.value = "";
    }

    // ─── Ler CSV simples ─────────────────────────────────────────────────────
    function parseCsv(texto) {
        const linhas = texto.split(/\r?\n/).filter(l => l.trim());
        if (linhas.length < 2) return [];
        const sep = linhas[0].includes(";") ? ";" : ",";
        const headers = linhas[0].split(sep).map(h => h.trim().toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_"));
        return linhas.slice(1).map(linha => {
            const vals = linha.split(sep);
            const obj = {};
            headers.forEach((h, i) => { obj[h] = (vals[i] || "").trim(); });
            return obj;
        }).filter(linhaTemDadosValidos);
    }

    // ─── Ler XLSX via SheetJS ────────────────────────────────────────────────
    function lerXlsx(buffer) {
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        // normalizar chaves
        return rows.map(r => {
            const obj = {};
            Object.entries(r).forEach(([k, v]) => {
                const chave = String(k).trim().toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, "_");
                obj[chave] = v;
            });
            return obj;
        }).filter(linhaTemDadosValidos);
    }

    // ─── Inicialização ────────────────────────────────────────────────────────
    document.addEventListener("DOMContentLoaded", function () {
        const importBtn  = el("npsImportButton");
        const clearBtn   = el("npsClearButton");
        const fileInput  = el("npsArquivoInput");
        const fileStatus = el("npsFileStatus");
        const applyFiltersBtn = el("npsApplyFiltersBtn");
        const clearFiltersBtn = el("npsClearFiltersBtn");
        const churnCalcBtn = el("churnCalcBtn");
        const churnClearBtn = el("churnClearBtn");
        const cancelamentoPaginaAnteriorBtn = el("npsCancelamentoPaginaAnterior");
        const cancelamentoPaginaProximaBtn = el("npsCancelamentoPaginaProxima");

        npsToggleFilterSectionButton = el("npsToggleFilterSectionButton");
        npsFilterSection = el("npsFilterSection");
        npsFilterUsuarioCancelamento = el("npsFilterUsuarioCancelamento");
        npsFilterMotivo = el("npsFilterMotivo");
        npsFilterServico = el("npsFilterServico");
        npsFilterCidade = el("npsFilterCidade");
        npsFilterBairro = el("npsFilterBairro");
        npsFilterMes = el("npsFilterMes");
        npsFilterUsuarioCancelamentoSearch = el("npsFilterUsuarioCancelamentoSearch");
        npsFilterMotivoSearch = el("npsFilterMotivoSearch");
        npsFilterServicoSearch = el("npsFilterServicoSearch");
        npsFilterCidadeSearch = el("npsFilterCidadeSearch");
        npsFilterBairroSearch = el("npsFilterBairroSearch");
        npsFilterMesSearch = el("npsFilterMesSearch");
        npsFilterUsuarioCancelamentoOptions = el("npsFilterUsuarioCancelamentoOptions");
        npsFilterMotivoOptions = el("npsFilterMotivoOptions");
        npsFilterServicoOptions = el("npsFilterServicoOptions");
        npsFilterCidadeOptions = el("npsFilterCidadeOptions");
        npsFilterBairroOptions = el("npsFilterBairroOptions");
        npsFilterMesOptions = el("npsFilterMesOptions");

        atualizarBotaoFiltrosAnalise(false);

        if (npsToggleFilterSectionButton) {
            npsToggleFilterSectionButton.addEventListener("click", function () {
                const aberto = npsFilterSection && !npsFilterSection.classList.contains("filter-section--hidden");
                definirVisibilidadeFiltrosAnalise(!aberto);
            });
        }

        [npsFilterUsuarioCancelamentoSearch, npsFilterMotivoSearch, npsFilterServicoSearch, npsFilterCidadeSearch, npsFilterBairroSearch, npsFilterMesSearch].forEach((input) => {
            if (!input) return;
            input.addEventListener("input", atualizarInterfaceFiltrosMultiplos);
        });

        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener("click", aplicarFiltrosAnalise);
        }

        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener("click", function () {
                limparFiltrosAnalise(true);
                aplicarFiltrosAnalise();
            });
        }

        if (churnCalcBtn) {
            churnCalcBtn.addEventListener("click", calcularChurnManual);
        }

        if (churnClearBtn) {
            churnClearBtn.addEventListener("click", limparCalculadoraChurn);
        }

        if (cancelamentoPaginaAnteriorBtn) {
            cancelamentoPaginaAnteriorBtn.addEventListener("click", function () {
                alterarPaginaCancelamentos(-1);
            });
        }

        if (cancelamentoPaginaProximaBtn) {
            cancelamentoPaginaProximaBtn.addEventListener("click", function () {
                alterarPaginaCancelamentos(1);
            });
        }

        if (fileInput && fileStatus) {
            fileInput.addEventListener("change", function () {
                fileStatus.textContent = fileInput.files[0]
                    ? fileInput.files[0].name
                    : "Nenhum arquivo selecionado.";
            });
        }

        if (importBtn && fileInput) {
            importBtn.addEventListener("click", function () {
                const arquivo = fileInput.files[0];
                if (!arquivo) {
                    setStatus("Selecione um arquivo CSV ou XLSX antes de importar.", true);
                    return;
                }
                setStatus("⏳ Processando arquivo…");

                const reader = new FileReader();
                const nome = arquivo.name.toLowerCase();

                if (nome.endsWith(".csv")) {
                    reader.onload = function (e) {
                        try {
                            const linhas = parseCsv(e.target.result);
                            dadosCarregados = linhas;
                            salvarDadosLocalNps(arquivo.name);
                            popularFiltrosAnalise();
                            limparFiltrosAnalise(true);
                            atualizarBotaoFiltrosAnalise(linhas.length > 0);
                            aplicarFiltrosAnalise();
                        } catch (err) {
                            setStatus("Erro ao processar CSV: " + err.message, true);
                        }
                    };
                    reader.readAsText(arquivo, "UTF-8");
                } else {
                    reader.onload = function (e) {
                        try {
                            const linhas = lerXlsx(e.target.result);
                            dadosCarregados = linhas;
                            salvarDadosLocalNps(arquivo.name);
                            popularFiltrosAnalise();
                            limparFiltrosAnalise(true);
                            atualizarBotaoFiltrosAnalise(linhas.length > 0);
                            aplicarFiltrosAnalise();
                        } catch (err) {
                            setStatus("Erro ao processar XLSX: " + err.message, true);
                        }
                    };
                    reader.readAsArrayBuffer(arquivo);
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener("click", limparDashboard);
        }

        restaurarDadosLocalNps();
    });
})();
