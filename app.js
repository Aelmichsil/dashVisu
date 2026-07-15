// ============================================================
// Dashboard de Atendimentos Hubsoft - app.js
// Responsavel pelo painel Hubsoft na pagina unica (index.html):
// importacao, filtros, indicadores, graficos e exportacoes.
// ============================================================


const statusElement = document.getElementById("status");
const fileStatusElement = document.getElementById("fileStatus");
const canvas = document.getElementById("atendimentosChart");
const manualForm = document.getElementById("manualForm");
const openManualFormButton = document.getElementById("openManualForm");
const mesInput = document.getElementById("mesInput");
const quantidadeInput = document.getElementById("quantidadeInput");
const arquivoInput = document.getElementById("arquivoInput");
const arquivoOsInput = document.getElementById("arquivoOsInput");
const importButton = document.getElementById("importButton");
const clearImportButton = document.getElementById("clearImportButton");
const previewSummaryElement = document.getElementById("previewSummary");
const previewTableBody = document.getElementById("previewTableBody");
const previewPanel = document.getElementById("previewPanel");
const togglePreviewPanelButton = document.getElementById("togglePreviewPanelButton");
const pivotSummaryElement = document.getElementById("pivotSummary");
const pivotTableHead = document.getElementById("pivotTableHead");
const pivotTableBody = document.getElementById("pivotTableBody");
const monthColumnSelect = document.getElementById("monthColumnSelect");
const quantityColumnSelect = document.getElementById("quantityColumnSelect");
const openingUserColumnSelect = document.getElementById("openingUserColumnSelect");
const userColumnSelect = document.getElementById("userColumnSelect");
const resolutionColumnSelect = document.getElementById("resolutionColumnSelect");
const statusColumnSelect = document.getElementById("statusColumnSelect");
const autoAdjustMappingButton = document.getElementById("autoAdjustMappingButton");
const applyMappingButton = document.getElementById("applyMappingButton");
const filterSection = document.getElementById("filterSection");
const toggleFilterSectionButton = document.getElementById("toggleFilterSectionButton");
const filterOpeningUser = document.getElementById("filterOpeningUser");
const filterResponsibleUser = document.getElementById("filterResponsibleUser");
const filterOpeningUserSearch = document.getElementById("filterOpeningUserSearch");
const filterResponsibleUserSearch = document.getElementById("filterResponsibleUserSearch");
const filterServiceTypeSearch = document.getElementById("filterServiceTypeSearch");
const filterCitySearch = document.getElementById("filterCitySearch");
const filterBairroSearch = document.getElementById("filterBairroSearch");
const filterMonth = document.getElementById("filterMonth");
const filterMonthSearch = document.getElementById("filterMonthSearch");
const filterOpeningUserOptions = document.getElementById("filterOpeningUserOptions");
const filterResponsibleUserOptions = document.getElementById("filterResponsibleUserOptions");
const filterServiceTypeOptions = document.getElementById("filterServiceTypeOptions");
const filterCityOptions = document.getElementById("filterCityOptions");
const filterBairroOptions = document.getElementById("filterBairroOptions");
const filterMonthOptions = document.getElementById("filterMonthOptions");
const filterServiceType = document.getElementById("filterServiceType");
const filterCity = document.getElementById("filterCity");
const filterBairro = document.getElementById("filterBairro");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const topUsersStatusElement = document.getElementById("topUsersStatus");
const resolutionStatusElement = document.getElementById("resolutionStatus");
const podiumContainer = document.getElementById("podiumContainer");
const topUsersCanvas = document.getElementById("topUsersChart");
const resolutionCanvas = document.getElementById("resolutionChart");
const resolutionTopListElement = document.getElementById("resolutionTopList");
const mesN1N2StatusElement = document.getElementById("mesN1N2Status");
const mesN1N2TableBody = document.getElementById("mesN1N2TableBody");
const atendimentosDiaStatusElement = document.getElementById("atendimentosDiaStatus");
const atendimentosHorarioStatusElement = document.getElementById("atendimentosHorarioStatus");
const atendimentosDiaCanvas = document.getElementById("atendimentosDiaChart");
const atendimentosHorarioCanvas = document.getElementById("atendimentosHorarioChart");
const filterHorarioFaixaSelect = document.getElementById("filterHorarioFaixa");
const filterPeriodoDiasSelect = document.getElementById("filterPeriodoDias");

// SLA e Motivo
const slaStatusElement = document.getElementById("slaStatus");
// Mapeamento central dos elementos de interface usados ao longo do dashboard.
// A estratégia aqui é declarar tudo no topo para evitar buscas repetidas no DOM.
const slaTipoStatusElement = document.getElementById("slaTipoStatus");
const motivoStatusElement = document.getElementById("motivoStatus");
const baseClientesInput = document.getElementById("baseClientesInput");
const calcLentidaoKpiBtn = document.getElementById("calcLentidaoKpiBtn");
const incidenciaLentidaoValueElement = document.getElementById("incidenciaLentidaoValue");
const incidenciaLentidaoDetailElement = document.getElementById("incidenciaLentidaoDetail");
const tipoStatusElement = document.getElementById("tipoStatus");
// Lista de referência para normalização e ordenação de meses no idioma local.
const planoServicoStatusElement = document.getElementById("planoServicoStatus");
const planoServicoSummaryElement = document.getElementById("planoServicoSummary");
const cidadeStatusElement = document.getElementById("cidadeStatus");
const bairroStatusElement = document.getElementById("bairroStatus");
const bairroSummaryElement = document.getElementById("bairroSummary");
const recorrenteStatusElement = document.getElementById("recorrenteStatus");
const recorrenteSummaryElement = document.getElementById("recorrenteSummary");
const recorrenteSearchElement = document.getElementById("recorrenteSearch");
const recorrenteSortElement = document.getElementById("recorrenteSort");
const recorrenteTableBody = document.getElementById("recorrenteTableBody");
const cidadeHeatmapStatusElement = document.getElementById("cidadeHeatmapStatus");
const slaSummaryEl = document.getElementById("slaSummary");
const slaDistCanvas = document.getElementById("slaDistChart");
const slaTipoCanvas = document.getElementById("slaTipoChart");
const motivoCanvas = document.getElementById("motivoChart");
const tipoCanvas = document.getElementById("tipoChart");
const planoServicoCanvas = document.getElementById("planoServicoChart");
const cidadeCanvas = document.getElementById("cidadeChart");
const bairroCanvas = document.getElementById("bairroChart");
const recorrenteCanvas = document.getElementById("recorrentesChart");
const cidadeHeatmapElement = document.getElementById("cidadeHeatmap");
const atendimentoStatusElement = document.getElementById("atendimentoStatusSummary");
const atendimentoStatusCardsElement = document.getElementById("atendimentoStatusCards");
const atendimentoStatusCanvas = document.getElementById("atendimentoStatusChart");
const slaFilterGroup = document.getElementById("slaFilterGroup");
const slaFilterPanel = document.getElementById("slaFilterPanel");
const dataAberturaColumnSelect = document.getElementById("dataAberturaColumnSelect");
const dataFechamentoColumnSelect = document.getElementById("dataFechamentoColumnSelect");
const descricaoAberturaColumnSelect = document.getElementById("descricaoAberturaColumnSelect");
const descricaoFechamentoColumnSelect = document.getElementById("descricaoFechamentoColumnSelect");
const motivoFechamentoColumnSelect = document.getElementById("motivoFechamentoColumnSelect");
const tipoAtendimentoColumnSelect = document.getElementById("tipoAtendimentoColumnSelect");
const cidadeColumnSelect = document.getElementById("cidadeColumnSelect");
const bairroColumnSelect = document.getElementById("bairroColumnSelect");
const numeroPlanoColumnSelect = document.getElementById("numeroPlanoColumnSelect");
const usuarioFechamentoColumnSelect = document.getElementById("usuarioFechamentoColumnSelect");
const nomeClienteColumnSelect = document.getElementById("nomeClienteColumnSelect");
const codigoClienteColumnSelect = document.getElementById("codigoClienteColumnSelect");
const protocoloAtendimentoColumnSelect = document.getElementById("protocoloAtendimentoColumnSelect");
const fileOsStatusElement = document.getElementById("fileOsStatus");
// Membros da equipe Suporte (todos em minúsculo para bater com normalizarTextoBusca)
const EQUIPE_SUPORTE_PREFIXOS = ["michael", "israel", "arthur", "richard", "pedro", "jobert"];
const manualStorageKey = "atendimentos-manual-v1";
const importStorageKey = "atendimentos-importados-v1";
const osStorageKey = "atendimentos-os-v1";
const osMetaStorageKey = "atendimentos-os-meta-v1";

// Credenciais lidas das meta tags do HTML para não ficarem no código-fonte.
// Edite as tags <meta name="supabase-url"> e <meta name="supabase-key"> no index.html.
const supabaseUrl = (document.querySelector('meta[name="supabase-url"]') || {}).content || "";
const supabaseKey = (document.querySelector('meta[name="supabase-key"]') || {}).content || "";
const supabaseTableName = "dashboard_atendimentos";
const executandoComoArquivoLocal = window.location.protocol === "file:";

const supabaseSdk = window.supabase || window.Supabase || window.supabase_js;

if (!supabaseSdk || typeof supabaseSdk.createClient !== "function") {
    console.warn("[Dashboard] SDK do Supabase não encontrado. Verifique se o script foi carregado corretamente. O sistema funcionará apenas com armazenamento local.");
}

const supabaseClient = supabaseSdk && typeof supabaseSdk.createClient === "function" && supabaseUrl && supabaseKey
    ? supabaseSdk.createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: !executandoComoArquivoLocal,
            autoRefreshToken: !executandoComoArquivoLocal,
            detectSessionInUrl: !executandoComoArquivoLocal
        }
    })
    : null;

if (executandoComoArquivoLocal) {
    console.warn("[Dashboard] Rodando em file://. Alguns recursos web (storage/session) podem ser limitados pelo navegador.");
}

if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

if (window.ChartDataLabels && window.Chart && typeof window.Chart.register === "function") {
    window.Chart.register(window.ChartDataLabels);
}

if (window.Chart) {
    // Otimizacoes globais para deixar a UI mais fluida em dashboards com muitos graficos.
    window.Chart.defaults.animation = false;
    window.Chart.defaults.responsiveAnimationDuration = 0;
    window.Chart.defaults.transitions = window.Chart.defaults.transitions || {};
    window.Chart.defaults.transitions.active = window.Chart.defaults.transitions.active || {};
    window.Chart.defaults.transitions.active.animation = { duration: 0 };
}

let chart;
let topUsersChart;
let resolutionChart;
let slaDistChart;
let slaTipoChart;
let motivoChart;
let tipoChart;
let planoServicoChart;
let cidadeChart;
let bairroChart;
let recorrentesChart;
let atendimentoStatusChart;
let produtividadeChart;
let slaAtendentesChart;
let atendimentosDiaChart;
let atendimentosHorarioChart;
let recorrentesTabelaBase = [];
let osRegistrosImportados = [];
let osRegistrosPorNumero = new Map();
let osRegistrosPorChaveAproximada = new Map();
let osRegistrosPorProtocolo = new Map();
let registrosBase = [];
let registrosAtuais = [];
let registrosImportados = [];
let registrosManuais = [];
let registrosPreviaImportacao = [];
let arquivoPreviaImportacao = "";
let arquivoPreviaAtual = null;
let supabaseDisponivel = Boolean(supabaseClient);
let filtroTipoAtraso = "todos";
let filtroModalidadeResolucao = "todos";
let filtroModalidadeSla = "todos";
let filtroHorarioFaixa = "todos";
let filtroPeriodoDias = 30;
let filtrosAnaliseDisponiveis = false;
let statusAbertosCache = {
    aguardando: [],
    pendentes: []
};
let atendimentosGeraisCache = {
    reagendamento: [],
    finalizados: []
};
const mesesReferencia = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

const CHART_PALETTE = {
    resolved: "rgba(34, 197, 94, 0.85)",
    info: "rgba(14, 165, 233, 0.85)",
    warn: "rgba(245, 158, 11, 0.84)",
    critical: "rgba(239, 68, 68, 0.82)",
    teal: "rgba(20, 184, 166, 0.82)",
    cyan: "rgba(6, 182, 212, 0.82)",
    blue: "rgba(59, 130, 246, 0.82)",
    emerald: "rgba(16, 185, 129, 0.82)",
    violet: "rgba(168, 85, 247, 0.8)",
    indigo: "rgba(99, 102, 241, 0.8)",
    orange: "rgba(249, 115, 22, 0.82)",
    slate: "rgba(100, 116, 139, 0.8)",
    categorical: [
        "#14b8a6",
        "#0ea5e9",
        "#6366f1",
        "#22c55e",
        "#f59e0b",
        "#a855f7",
        "#f97316",
        "#84cc16",
        "#ec4899",
        "#64748b",
        "#06b6d4",
        "#ef4444"
    ]
};

// Define cores de texto, grade e borda conforme tema claro/escuro do sistema.
function obterTemaGrafico() {
    const temaEscuroAtivo = Boolean(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);

    return {
        dark: temaEscuroAtivo,
        text: temaEscuroAtivo ? "#cbd5e1" : "#4b5563",
        border: temaEscuroAtivo ? "#e2e8f0" : "#ffffff",
        grid: temaEscuroAtivo ? "rgba(148, 163, 184, 0.24)" : "rgba(17, 24, 39, 0.08)"
    };
}

// Busca dados de uma API quando disponível; em falha, o fluxo segue com importação local.
async function getAtendimentosPorMes() {
    try {
        // Endpoint pronto para futura integracao com backend + banco de dados.
        const response = await fetch("/api/atendimentos/mensal");

        if (!response.ok) {
            throw new Error(`Falha HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Retorno da API vazio ou invalido.");
        }

        statusElement.textContent = "Dados carregados da API.";
        return data;
    } catch (error) {
        statusElement.textContent = "Sem API ativa. Aguardando importacao ou cadastro manual.";
        return [];
    }
}

function atualizarStatus(texto) {
    statusElement.textContent = texto;
}

function atualizarStatusArquivo(texto) {
    fileStatusElement.textContent = texto;
}

function atualizarStatusArquivoOs(texto) {
    if (fileOsStatusElement) {
        fileOsStatusElement.textContent = texto;
    }
}

function salvarRegistrosOsPersistidos(registros, nomeArquivo) {
    try {
        localStorage.setItem(osStorageKey, JSON.stringify(Array.isArray(registros) ? registros : []));
        localStorage.setItem(osMetaStorageKey, JSON.stringify({
            fileName: String(nomeArquivo || "").trim(),
            importedAt: new Date().toISOString(),
            total: Array.isArray(registros) ? registros.length : 0
        }));
    } catch (_) {
        atualizarStatusArquivoOs("Nao foi possivel salvar o arquivo OS neste navegador.");
    }
}

function obterRegistrosOsPersistidos() {
    try {
        const raw = localStorage.getItem(osStorageKey);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
        return [];
    }
}

function obterMetaOsPersistida() {
    try {
        const raw = localStorage.getItem(osMetaStorageKey);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (_) {
        return null;
    }
}

function limparPersistenciaOs() {
    try {
        localStorage.removeItem(osStorageKey);
        localStorage.removeItem(osMetaStorageKey);
    } catch (_) { }
}

function obterChavesUnicasDeObjetos(objetos) {
    const mapa = {};

    (objetos || []).forEach((objeto) => {
        Object.keys(objeto || {}).forEach((chave) => {
            if (!mapa[chave]) {
                mapa[chave] = true;
            }
        });
    });

    return Object.keys(mapa);
}

function preencherSelectDeColunas(select, colunas, colunaSelecionada, rotuloPadrao) {
    select.innerHTML = "";

    const opcaoPadrao = document.createElement("option");
    opcaoPadrao.value = "";
    opcaoPadrao.textContent = rotuloPadrao;
    select.appendChild(opcaoPadrao);

    colunas.forEach((coluna, indice) => {
        const opcao = document.createElement("option");
        opcao.value = coluna;
        opcao.textContent = coluna;
        select.appendChild(opcao);

        if (colunaSelecionada && colunaSelecionada === coluna) {
            select.value = coluna;
        } else if (!colunaSelecionada && indice === 0) {
            select.value = coluna;
        }
    });
}

function atualizarSelectsDeMapeamento(colunas, registrosBrutos) {
    // Primeiro tenta inferir por conteúdo real do arquivo, depois aplica sinônimos conhecidos.
    const colunaMesPorConteudo = escolherColunaPorConteudoMes(colunas, registrosBrutos);
    const colunasDataPorConteudo = obterColunasDataPorConteudo(colunas, registrosBrutos);

    const colunaMesPadrao = escolherColunaPorSinonimos(colunas, ["data_cadastro", "data cadastro"])
        || escolherColunaPorSinonimos(colunas, ["mes", "mês", "month", "competencia", "competência", "periodo", "período", "referencia", "referência"])
        || colunaMesPorConteudo
        || colunas[0]
        || "";
const colunaQuantidadePadrao = escolherColunaPorSinonimos(colunas, ["quantidade_os", "qtd_os", "quantidade", "qtd", "qtde", "atendimentos", "atendimento", "total", "count", "volume"])        || ""
        || "";
    const colunaAberturaPadrao = escolherColunaPorSinonimos(colunas, ["usuario_abertura", "usuário_abertura", "usuario abertura", "usuário abertura", "aberto por", "opened by", "criado por", "solicitante abertura"]) || colunas[2] || "";
    const colunaUsuarioPadrao = escolherColunaPorSinonimos(colunas, ["usuarios_responsaveis", "usuários_responsaveis", "usuario_fechamento", "usuario fechamento", "usuarios responsaveis", "responsavel", "responsável", "atendente", "analista", "executor"]) || colunas[3] || "";
    const colunaResolucaoPadrao = escolherColunaPorSinonimos(colunas, ["status_fechamento", "status fechamento"])
        || escolherColunaPorSinonimos(colunas, ["resolucao", "resolução", "solucao", "solução", "resolucao_final", "resultado"])
        || colunas[3]
        || "";
    const colunaStatusPadrao = escolherColunaPorSinonimos(colunas, ["status", "status_atendimento", "status atendimento", "status chamado", "situacao", "situação", "estado"]) || "";

    preencherSelectDeColunas(monthColumnSelect, colunas, colunaMesPadrao, "Escolha a coluna do mes");
    preencherSelectDeColunas(quantityColumnSelect, colunas, colunaQuantidadePadrao, "Nao mapeada (cada linha = 1 atendimento)");
    preencherSelectDeColunas(openingUserColumnSelect, colunas, colunaAberturaPadrao, "Escolha a coluna da abertura");
    preencherSelectDeColunas(userColumnSelect, colunas, colunaUsuarioPadrao, "Escolha a coluna do usuario");
    preencherSelectDeColunas(resolutionColumnSelect, colunas, colunaResolucaoPadrao, "Escolha a coluna da resolucao");
    if (statusColumnSelect) preencherSelectDeColunas(statusColumnSelect, colunas, colunaStatusPadrao, "Nao mapeada");

    const colunaDataAberturaPadrao = escolherColunaPorNomeExato(colunas, ["data_cadastro"])
        || escolherColunaPorSinonimos(colunas, ["data_cadastro", "data cadastro", "data_abertura", "data abertura", "abertura", "data de abertura", "created_at", "data criacao", "aberto em", "abertura em"])
        || (colunasDataPorConteudo[0] ? colunasDataPorConteudo[0].coluna : "")
        || "";
    const colunaDataFechamentoPadrao = escolherColunaPorSinonimos(colunas, ["data_fechamento", "data fechamento", "fechamento", "data de fechamento", "closed_at", "data encerramento", "data conclusao", "data conclusão", "encerrado em", "finalizado em"])
        || (colunasDataPorConteudo.find((item) => item.coluna !== colunaDataAberturaPadrao) || colunasDataPorConteudo[0] || { coluna: "" }).coluna
        || "";
    const colunaDescricaoAberturaPadrao = escolherColunaPorSinonimos(colunas, ["descricao_abertura", "descricao abertura", "descricao_da_abertura", "observacao_abertura", "observacao abertura", "observação abertura", "descricao da abertura"])
        || "";
    const colunaDescricaoFechamentoPadrao = escolherColunaPorSinonimos(colunas, ["descricao_fechamento", "descricao fechamento", "descricao_do_fechamento", "observacao_fechamento", "observacao fechamento", "observação fechamento", "descricao do fechamento"])
        || "";
    const colunaMotivoPadrao = escolherColunaPorSinonimos(colunas, ["motivo_fechamento", "motivo fechamento", "motivo", "motivo de fechamento", "reason", "descricao fechamento"]) || "";
    const colunaTipoPadrao = escolherColunaPorNomeExato(colunas, ["tipo_atendimento", "tipo atendimento"])
        || escolherColunaPorSinonimos(colunas, ["tipo_atendimento", "tipo atendimento", "tipo de atendimento", "categoria", "assunto", "classificacao", "classificação"])
        || "";
    const colunaCidadePadrao = escolherColunaPorSinonimos(colunas, ["cidade", "cidade_cliente", "municipio", "município", "localidade", "cidade atendimento", "cidade_atendimento"]) || "";
    const colunaBairroPadrao = escolherColunaPorSinonimos(colunas, ["bairro", "bairro_cliente", "distrito", "regiao", "região", "setor", "zona", "bairro atendimento", "bairro_atendimento"]) || "";
    const colunaNumeroPlanoPadrao = escolherColunaPorNomeExato(colunas, ["serviço", "servico", "nome_servico", "nome serviço"])
        || escolherColunaPorSinonimos(colunas, ["servico", "serviço", "nome_servico", "nome serviço"])
        || escolherColunaPorSinonimos(colunas, ["plano", "nome_plano", "nome plano", "plano_servico", "servico_plano", "descricao_servico", "descrição_serviço", "descricao plano", "descrição plano", "id_plano", "codigo_plano", "código_plano", "numero_plano", "número_plano", "numero plano", "número plano"])
        || "";

    if (dataAberturaColumnSelect) preencherSelectDeColunas(dataAberturaColumnSelect, colunas, colunaDataAberturaPadrao, "Nao mapeada");
    if (dataFechamentoColumnSelect) preencherSelectDeColunas(dataFechamentoColumnSelect, colunas, colunaDataFechamentoPadrao, "Nao mapeada");
    if (descricaoAberturaColumnSelect) preencherSelectDeColunas(descricaoAberturaColumnSelect, colunas, colunaDescricaoAberturaPadrao, "Nao mapeada");
    if (descricaoFechamentoColumnSelect) preencherSelectDeColunas(descricaoFechamentoColumnSelect, colunas, colunaDescricaoFechamentoPadrao, "Nao mapeada");
    if (motivoFechamentoColumnSelect) preencherSelectDeColunas(motivoFechamentoColumnSelect, colunas, colunaMotivoPadrao, "Nao mapeada");
    if (tipoAtendimentoColumnSelect) preencherSelectDeColunas(tipoAtendimentoColumnSelect, colunas, colunaTipoPadrao, "Nao mapeada");
    if (cidadeColumnSelect) preencherSelectDeColunas(cidadeColumnSelect, colunas, colunaCidadePadrao, "Nao mapeada");
    if (bairroColumnSelect) preencherSelectDeColunas(bairroColumnSelect, colunas, colunaBairroPadrao, "Nao mapeada");
    if (numeroPlanoColumnSelect) preencherSelectDeColunas(numeroPlanoColumnSelect, colunas, colunaNumeroPlanoPadrao, "Nao mapeada");

    const colunaUsuarioFechamentoPadrao = escolherColunaPorSinonimos(colunas, ["usuario_fechamento", "usuario fechamento", "fechado por", "encerrado por", "closed by"]) || "";
    if (usuarioFechamentoColumnSelect) preencherSelectDeColunas(usuarioFechamentoColumnSelect, colunas, colunaUsuarioFechamentoPadrao, "Nao mapeada");

    const colunaNomeClientePadrao = escolherColunaPorSinonimos(colunas, ["nome_razaosocial", "nome razao social", "nome_cliente", "nome cliente", "cliente", "razao_social", "razao social", "nome"]) || "";
    const colunaCodigoClientePadrao = escolherColunaPorSinonimos(colunas, ["codigo_cliente", "codigo cliente", "cod_cliente", "cod cliente", "id_cliente", "id cliente", "codigo"]) || "";
    if (nomeClienteColumnSelect) preencherSelectDeColunas(nomeClienteColumnSelect, colunas, colunaNomeClientePadrao, "Nao mapeada");
    if (codigoClienteColumnSelect) preencherSelectDeColunas(codigoClienteColumnSelect, colunas, colunaCodigoClientePadrao, "Nao mapeada");

    const colunaProtocoloAtendimentoPadrao = escolherColunaPorNomeExato(colunas, ["protocolo_atendimento", "protocolo atendimento"])
        || escolherColunaPorSinonimos(colunas, ["protocolo_atendimento", "protocolo atendimento", "protocolo do atendimento", "protocolo", "codigo_atendimento", "codigo atendimento", "id_atendimento", "id atendimento", "numero_atendimento", "numero atendimento", "numero_protocolo", "numero protocolo"])
        || "";
    if (protocoloAtendimentoColumnSelect) preencherSelectDeColunas(protocoloAtendimentoColumnSelect, colunas, colunaProtocoloAtendimentoPadrao, "Nao mapeada");
}

function obterRegistrosImportacaoBase() {
    return registrosPreviaImportacao.length > 0 ? registrosPreviaImportacao : registrosImportados;
}

// --- Bloco de filtros dinâmicos da análise ---
function obterQuantidadeFiltrosAtivos() {
    const filtros = obterConfiguracaoFiltrosAtual();

    return (filtros.aberturas || []).length
        + (filtros.responsaveis || []).length
        + (filtros.tiposAtendimento || []).length
        + (filtros.cidades || []).length
        + (filtros.bairros || []).length
        + (filtros.meses || []).length;
}

function atualizarRotuloBotaoFiltrosAnalise() {
    if (!toggleFilterSectionButton) {
        return;
    }

    const painelAberto = filterSection && !filterSection.classList.contains("filter-section--hidden");
    const prefixo = painelAberto ? "Editar Filtros de Análise" : "Filtros de Análise";
    const quantidadeAtiva = filtrosAnaliseDisponiveis ? obterQuantidadeFiltrosAtivos() : 0;
    const sufixo = quantidadeAtiva > 0 ? ` (${quantidadeAtiva})` : "";

    toggleFilterSectionButton.textContent = `${prefixo}${sufixo}`;
}

function definirVisibilidadeFiltrosAnalise(visivel) {
    if (!filterSection) {
        return;
    }

    if (visivel) {
        filterSection.classList.remove("filter-section--hidden");
    } else {
        filterSection.classList.add("filter-section--hidden");
    }

    if (toggleFilterSectionButton) {
        toggleFilterSectionButton.setAttribute("aria-expanded", String(visivel));
        atualizarRotuloBotaoFiltrosAnalise();
    }
}

function atualizarBotaoFiltrosAnalise(disponivel) {
    filtrosAnaliseDisponiveis = Boolean(disponivel);

    if (!toggleFilterSectionButton) {
        return;
    }

    toggleFilterSectionButton.disabled = !filtrosAnaliseDisponiveis;

    if (!filtrosAnaliseDisponiveis) {
        toggleFilterSectionButton.setAttribute("aria-expanded", "false");
    }

    atualizarRotuloBotaoFiltrosAnalise();
}

function obterValoresSelecionadosDoFiltro(select) {
    if (!select) {
        return [];
    }

    return Array.from(select.selectedOptions || [])
        .map((opcao) => String(opcao.value || "").trim())
        .filter(Boolean);
}

function selecionarValoresNoFiltro(select, valoresSelecionados) {
    if (!select) {
        return;
    }

    const mapaValores = new Set((valoresSelecionados || []).map((valor) => normalizarTextoBusca(valor)));

    Array.from(select.options || []).forEach((opcao) => {
        const chave = normalizarTextoBusca(opcao.value);
        opcao.selected = mapaValores.has(chave);
    });
}

function renderizarOpcoesFiltro(select, inputBusca, containerOpcoes) {
    if (!select || !containerOpcoes) {
        return;
    }

    const termoBusca = normalizarTextoBusca(inputBusca ? inputBusca.value : "");
    const selecionados = new Set(obterValoresSelecionadosDoFiltro(select).map((valor) => normalizarTextoBusca(valor)));

    const opcoes = Array.from(select.options || []).filter((opcao) => {
        const valor = String(opcao.value || "").trim();

        if (!valor) {
            return false;
        }

        const texto = String(opcao.textContent || valor);
        const chave = normalizarTextoBusca(texto);

        return !termoBusca || chave.indexOf(termoBusca) !== -1;
    });

    if (opcoes.length === 0) {
        containerOpcoes.innerHTML = "";
        containerOpcoes.style.display = "none";
        return;
    }

    containerOpcoes.style.display = "";

    containerOpcoes.innerHTML = opcoes.map((opcao, indice) => {
        const valor = String(opcao.value || "");
        const texto = String(opcao.textContent || valor);
        const chave = normalizarTextoBusca(valor);
        const checked = selecionados.has(chave) ? " checked" : "";
        const id = `${select.id}-opt-${indice}`;

        return `<label class="filter-option" for="${id}"><input id="${id}" type="checkbox" data-value="${escaparHtml(valor)}"${checked} /><span>${escaparHtml(texto)}</span></label>`;
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
    renderizarOpcoesFiltro(filterOpeningUser, filterOpeningUserSearch, filterOpeningUserOptions);
    renderizarOpcoesFiltro(filterResponsibleUser, filterResponsibleUserSearch, filterResponsibleUserOptions);
    renderizarOpcoesFiltro(filterServiceType, filterServiceTypeSearch, filterServiceTypeOptions);
    renderizarOpcoesFiltro(filterCity, filterCitySearch, filterCityOptions);
    renderizarOpcoesFiltro(filterBairro, filterBairroSearch, filterBairroOptions);
    renderizarOpcoesFiltro(filterMonth, filterMonthSearch, filterMonthOptions);
}

function obterConfiguracaoFiltrosAtual() {
    return {
        aberturas: obterValoresSelecionadosDoFiltro(filterOpeningUser),
        responsaveis: obterValoresSelecionadosDoFiltro(filterResponsibleUser),
        tiposAtendimento: obterValoresSelecionadosDoFiltro(filterServiceType),
        cidades: obterValoresSelecionadosDoFiltro(filterCity),
        bairros: obterValoresSelecionadosDoFiltro(filterBairro),
        meses: obterValoresSelecionadosDoFiltro(filterMonth)
    };
}

function preencherSelectDeFiltros(select, valores, valoresSelecionados, rotuloPadrao) {
    if (!select) {
        return;
    }

    select.innerHTML = "";

    if (!select.multiple) {
        const opcaoPadrao = document.createElement("option");
        opcaoPadrao.value = "";
        opcaoPadrao.textContent = rotuloPadrao;
        select.appendChild(opcaoPadrao);
    }

    valores.forEach((valor) => {
        const opcao = document.createElement("option");
        opcao.value = valor;
        opcao.textContent = valor;
        select.appendChild(opcao);
    });

    if (select.multiple) {
        selecionarValoresNoFiltro(select, valoresSelecionados);
        return;
    }

    if (Array.isArray(valoresSelecionados) && valoresSelecionados.length > 0 && valores.indexOf(valoresSelecionados[0]) !== -1) {
        select.value = valoresSelecionados[0];
        return;
    }

    select.value = "";
}

function obterValoresUnicosOrdenados(registros, extrairValor) {
    const mapa = new Map();

    (registros || []).forEach((registro) => {
        const valor = normalizarMes(String(extrairValor(registro) || ""));
        const chave = normalizarTextoBusca(valor);

        if (!chave) {
            return;
        }

        if (!mapa.has(chave)) {
            mapa.set(chave, valor);
        }
    });

    return Array.from(mapa.values()).sort((itemA, itemB) => itemA.localeCompare(itemB, "pt-BR"));
}

function obterAmostrasDeColuna(registrosBrutos, coluna, limite) {
    const amostras = [];
    const maximo = Number.isInteger(limite) && limite > 0 ? limite : 10;

    (registrosBrutos || []).some((registroBruto) => {
        const valor = obterValorDaLinha(registroBruto, coluna, 0);

        if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
            amostras.push(valor);
        }

        return amostras.length >= maximo;
    });

    return amostras;
}

function escolherColunaPorConteudoMes(colunas, registrosBrutos) {
    let melhorColuna = "";
    let melhorPontuacao = 0;

    (colunas || []).forEach((coluna) => {
        const amostras = obterAmostrasDeColuna(registrosBrutos, coluna, 12);

        if (amostras.length === 0) {
            return;
        }

        const pontuacao = amostras.reduce((acumulado, valor) => {
            return acumulado + (formatarMesReferencia(String(valor)).length > 0 ? 1 : 0);
        }, 0);

        if (pontuacao > melhorPontuacao) {
            melhorPontuacao = pontuacao;
            melhorColuna = coluna;
        }
    });

    return melhorPontuacao > 0 ? melhorColuna : "";
}

function escolherColunaPorConteudoQuantidade(colunas, registrosBrutos) {
    let melhorColuna = "";
    let melhorPontuacao = 0;

    (colunas || []).forEach((coluna) => {
        const amostras = obterAmostrasDeColuna(registrosBrutos, coluna, 12);

        if (amostras.length === 0) {
            return;
        }

        const pontuacao = amostras.reduce((acumulado, valor) => {
            const numero = converterQuantidade(valor);
            return acumulado + (Number.isFinite(numero) ? 1 : 0);
        }, 0);

        if (pontuacao > melhorPontuacao) {
            melhorPontuacao = pontuacao;
            melhorColuna = coluna;
        }
    });

    return melhorPontuacao > 0 ? melhorColuna : "";
}

function obterColunasDataPorConteudo(colunas, registrosBrutos) {
    return (colunas || [])
        .map((coluna) => {
            const amostras = obterAmostrasDeColuna(registrosBrutos, coluna, 16);
            const pontuacao = amostras.reduce((acumulado, valor) => {
                return acumulado + (parsarDataRegistro(valor) ? 1 : 0);
            }, 0);

            return { coluna, pontuacao };
        })
        .filter((item) => item.pontuacao > 0)
        .sort((itemA, itemB) => itemB.pontuacao - itemA.pontuacao);
}

function atualizarOpcoesFiltros() {
    if (!filterSection || !filterOpeningUser || !filterResponsibleUser || !filterServiceType || !filterCity || !filterBairro || !filterMonth) {
        return;
    }

    const registrosBaseFiltro = obterRegistrosImportacaoBase();

    if (registrosBaseFiltro.length === 0) {
        definirVisibilidadeFiltrosAnalise(false);
        atualizarBotaoFiltrosAnalise(false);
        preencherSelectDeFiltros(filterOpeningUser, [], obterValoresSelecionadosDoFiltro(filterOpeningUser), "Todos");
        preencherSelectDeFiltros(filterResponsibleUser, [], obterValoresSelecionadosDoFiltro(filterResponsibleUser), "Todos");
        preencherSelectDeFiltros(filterServiceType, [], obterValoresSelecionadosDoFiltro(filterServiceType), "Todos");
        preencherSelectDeFiltros(filterCity, [], obterValoresSelecionadosDoFiltro(filterCity), "Todos");
        preencherSelectDeFiltros(filterBairro, [], obterValoresSelecionadosDoFiltro(filterBairro), "Todos");
        preencherSelectDeFiltros(filterMonth, [], obterValoresSelecionadosDoFiltro(filterMonth), "Todos");
        atualizarInterfaceFiltrosMultiplos();
        return;
    }

    atualizarBotaoFiltrosAnalise(true);

    const aberturaSelecionada = obterValoresSelecionadosDoFiltro(filterOpeningUser);
    const responsavelSelecionado = obterValoresSelecionadosDoFiltro(filterResponsibleUser);
    const tiposSelecionados = obterValoresSelecionadosDoFiltro(filterServiceType);
    const cidadesSelecionadas = obterValoresSelecionadosDoFiltro(filterCity);
    const bairrosSelecionados = obterValoresSelecionadosDoFiltro(filterBairro);
    const mesesSelecionados = obterValoresSelecionadosDoFiltro(filterMonth);

    preencherSelectDeFiltros(
        filterOpeningUser,
        obterValoresUnicosOrdenados(registrosBaseFiltro, (registro) => registro && registro.usuarioAbertura),
        aberturaSelecionada,
        "Todos"
    );

    preencherSelectDeFiltros(
        filterResponsibleUser,
        obterValoresUnicosOrdenados(registrosBaseFiltro, (registro) => registro && registro.usuario),
        responsavelSelecionado,
        "Todos"
    );

    preencherSelectDeFiltros(
        filterServiceType,
        obterValoresUnicosOrdenados(registrosBaseFiltro, (registro) => registro && registro.tipoAtendimento),
        tiposSelecionados,
        "Todos"
    );

    preencherSelectDeFiltros(
        filterCity,
        obterValoresUnicosOrdenados(registrosBaseFiltro, (registro) => registro && registro.cidade),
        cidadesSelecionadas,
        "Todos"
    );

    preencherSelectDeFiltros(
        filterBairro,
        obterValoresUnicosOrdenados(registrosBaseFiltro, (registro) => registro && registro.bairro),
        bairrosSelecionados,
        "Todos"
    );

    preencherSelectDeFiltros(
        filterMonth,
        obterValoresUnicosOrdenados(registrosBaseFiltro, (registro) => registro && registro.mes),
        mesesSelecionados,
        "Todos"
    );

    atualizarInterfaceFiltrosMultiplos();
}

function popularFiltrosDeUsuarios(registros) {
    if (!filterSection || !filterOpeningUser || !filterResponsibleUser || !filterServiceType || !filterCity || !filterBairro || !filterMonth) {
        return;
    }

    const registrosBaseFiltro = Array.isArray(registros) ? registros : [];

    if (registrosBaseFiltro.length === 0) {
        definirVisibilidadeFiltrosAnalise(false);
        atualizarBotaoFiltrosAnalise(false);
        preencherSelectDeFiltros(filterOpeningUser, [], obterValoresSelecionadosDoFiltro(filterOpeningUser), "Todos");
        preencherSelectDeFiltros(filterResponsibleUser, [], obterValoresSelecionadosDoFiltro(filterResponsibleUser), "Todos");
        preencherSelectDeFiltros(filterServiceType, [], obterValoresSelecionadosDoFiltro(filterServiceType), "Todos");
        preencherSelectDeFiltros(filterCity, [], obterValoresSelecionadosDoFiltro(filterCity), "Todos");
        preencherSelectDeFiltros(filterBairro, [], obterValoresSelecionadosDoFiltro(filterBairro), "Todos");
        preencherSelectDeFiltros(filterMonth, [], obterValoresSelecionadosDoFiltro(filterMonth), "Todos");
        atualizarInterfaceFiltrosMultiplos();
        return;
    }

    atualizarBotaoFiltrosAnalise(true);

    const aberturaSelecionada = obterValoresSelecionadosDoFiltro(filterOpeningUser);
    const responsavelSelecionado = obterValoresSelecionadosDoFiltro(filterResponsibleUser);
    const tiposSelecionados = obterValoresSelecionadosDoFiltro(filterServiceType);
    const cidadesSelecionadas = obterValoresSelecionadosDoFiltro(filterCity);
    const bairrosSelecionados = obterValoresSelecionadosDoFiltro(filterBairro);
    const mesesSelecionados = obterValoresSelecionadosDoFiltro(filterMonth);

    preencherSelectDeFiltros(
        filterOpeningUser,
        obterValoresUnicosOrdenados(registrosBaseFiltro, (registro) => registro && registro.usuarioAbertura),
        aberturaSelecionada,
        "Todos"
    );

    preencherSelectDeFiltros(
        filterResponsibleUser,
        obterValoresUnicosOrdenados(registrosBaseFiltro, (registro) => registro && registro.usuario),
        responsavelSelecionado,
        "Todos"
    );

    preencherSelectDeFiltros(
        filterServiceType,
        obterValoresUnicosOrdenados(registrosBaseFiltro, (registro) => registro && registro.tipoAtendimento),
        tiposSelecionados,
        "Todos"
    );

    preencherSelectDeFiltros(
        filterCity,
        obterValoresUnicosOrdenados(registrosBaseFiltro, (registro) => registro && registro.cidade),
        cidadesSelecionadas,
        "Todos"
    );

    preencherSelectDeFiltros(
        filterBairro,
        obterValoresUnicosOrdenados(registrosBaseFiltro, (registro) => registro && registro.bairro),
        bairrosSelecionados,
        "Todos"
    );

    preencherSelectDeFiltros(
        filterMonth,
        obterValoresUnicosOrdenados(registrosBaseFiltro, (registro) => registro && registro.mes),
        mesesSelecionados,
        "Todos"
    );

    atualizarInterfaceFiltrosMultiplos();
}

function filtrarRegistrosImportados(registros) {
    // Sem filtros aplicados: retorna cópia rasa para preservar imutabilidade da origem.
    const filtros = obterConfiguracaoFiltrosAtual();

    if ((!filtros.aberturas || filtros.aberturas.length === 0) && (!filtros.responsaveis || filtros.responsaveis.length === 0) && (!filtros.tiposAtendimento || filtros.tiposAtendimento.length === 0) && (!filtros.cidades || filtros.cidades.length === 0) && (!filtros.bairros || filtros.bairros.length === 0) && (!filtros.meses || filtros.meses.length === 0)) {
        return (registros || []).slice();
    }

    const aberturasNormalizadas = new Set((filtros.aberturas || []).map((valor) => normalizarTextoBusca(valor)).filter(Boolean));
    const responsaveisNormalizados = new Set((filtros.responsaveis || []).map((valor) => normalizarTextoBusca(valor)).filter(Boolean));
    const tiposNormalizados = new Set((filtros.tiposAtendimento || []).map((valor) => normalizarTextoBusca(valor)).filter(Boolean));
    const cidadesNormalizadas = new Set((filtros.cidades || []).map((valor) => normalizarTextoBusca(valor)).filter(Boolean));
    const bairrosNormalizados = new Set((filtros.bairros || []).map((valor) => normalizarTextoBusca(valor)).filter(Boolean));
    const mesesNormalizados = new Set((filtros.meses || []).map((valor) => normalizarMesParaFiltro(valor)).filter(Boolean));
    const mesesNumericos = new Set((filtros.meses || []).map((valor) => extrairNumeroMesParaFiltro(valor)).filter((valor) => valor >= 1 && valor <= 12));

    return (registros || []).filter((registro) => {
        const aberturaRegistro = normalizarTextoBusca(registro && registro.usuarioAbertura);
        const responsavelRegistro = normalizarTextoBusca(registro && registro.usuario);
        const tipoRegistro = normalizarTextoBusca(registro && registro.tipoAtendimento);
        const cidadeRegistro = normalizarTextoBusca(registro && registro.cidade);
        const bairroRegistro = normalizarTextoBusca(registro && registro.bairro);
        const mesRegistro = normalizarMesParaFiltro(registro && registro.mes);
        const numeroMesRegistro = extrairNumeroMesParaFiltro(registro && registro.mes);
        if (aberturasNormalizadas.size > 0 && !aberturasNormalizadas.has(aberturaRegistro)) {
            return false;
        }

        if (responsaveisNormalizados.size > 0 && !responsaveisNormalizados.has(responsavelRegistro)) {
            return false;
        }

        if (tiposNormalizados.size > 0 && !tiposNormalizados.has(tipoRegistro)) {
            return false;
        }

        if (cidadesNormalizadas.size > 0 && !cidadesNormalizadas.has(cidadeRegistro)) {
            return false;
        }

        if (bairrosNormalizados.size > 0 && !bairrosNormalizados.has(bairroRegistro)) {
            return false;
        }

        if (mesesNormalizados.size > 0 || mesesNumericos.size > 0) {
            const correspondePorNumero = numeroMesRegistro >= 1 && numeroMesRegistro <= 12 && mesesNumericos.has(numeroMesRegistro);
            const correspondePorTexto = mesesNormalizados.has(mesRegistro);

            if (!correspondePorNumero && !correspondePorTexto) {
                return false;
            }
        }

        return true;
    });
}

function normalizarMesParaFiltro(valor) {
    const mesNormalizado = formatarMesReferencia(String(valor || "")) || normalizarMes(String(valor || ""));

    return normalizarTextoBusca(mesNormalizado)
        .replace(/\s+/g, " ")
        .trim();
}

function extrairNumeroMesParaFiltro(valor) {
    const texto = String(valor || "").trim();

    if (!texto) {
        return 0;
    }

    const mesFormatado = formatarMesReferencia(texto);

    if (mesFormatado) {
        const numero = Number(String(mesFormatado).slice(0, 2));
        if (Number.isInteger(numero) && numero >= 1 && numero <= 12) {
            return numero;
        }
    }

    const numeroMes = obterNumeroMes(texto);
    return Number.isInteger(numeroMes) ? numeroMes : 0;
}

function obterRegistrosFiltrados() {
    const baseAnalise = obterRegistrosImportacaoBase();
    return filtrarRegistrosImportados(baseAnalise);
}

function autoAjustarMapeamentoAtual() {
    if (!arquivoPreviaAtual || !Array.isArray(arquivoPreviaAtual.colunas) || arquivoPreviaAtual.colunas.length === 0) {
        atualizarStatusArquivo("Selecione um arquivo para autoajustar as colunas.");
        return;
    }

    atualizarSelectsDeMapeamento(arquivoPreviaAtual.colunas, arquivoPreviaAtual.registrosBrutos);
    registrosPreviaImportacao = mapearRegistrosBrutos(arquivoPreviaAtual.registrosBrutos, obterConfiguracaoMapeamentoAtual());
    atualizarOpcoesFiltros();
    atualizarPreviaImportacao(registrosPreviaImportacao, arquivoPreviaAtual.nomeArquivo, arquivoPreviaAtual.tipoArquivo, arquivoPreviaAtual.colunas, "Autoajuste aplicado com base nas colunas do arquivo.");
    atualizarGraficoComDadosAtuais();
    atualizarAnalisesImportacao();
    atualizarStatusArquivo("Autoajuste aplicado.");
}

// Captura a configuração de mapeamento vigente para reaproveitar em prévia/importação.
function obterConfiguracaoMapeamentoAtual() {
    return {
        colunaMes: monthColumnSelect.value,
        colunaQuantidade: quantityColumnSelect.value,
        colunaAbertura: openingUserColumnSelect ? openingUserColumnSelect.value : "",
        colunaUsuario: userColumnSelect.value,
        colunaResolucao: resolutionColumnSelect.value,
        colunaStatus: statusColumnSelect ? statusColumnSelect.value : "",
        colunaDataAbertura: dataAberturaColumnSelect ? dataAberturaColumnSelect.value : "",
        colunaDataFechamento: dataFechamentoColumnSelect ? dataFechamentoColumnSelect.value : "",
        colunaDescricaoAbertura: descricaoAberturaColumnSelect ? descricaoAberturaColumnSelect.value : "",
        colunaDescricaoFechamento: descricaoFechamentoColumnSelect ? descricaoFechamentoColumnSelect.value : "",
        colunaMotivo: motivoFechamentoColumnSelect ? motivoFechamentoColumnSelect.value : "",
        colunaTipo: tipoAtendimentoColumnSelect ? tipoAtendimentoColumnSelect.value : "",
        colunaCidade: cidadeColumnSelect ? cidadeColumnSelect.value : "",
        colunaBairro: bairroColumnSelect ? bairroColumnSelect.value : "",
        colunaNumeroPlano: numeroPlanoColumnSelect ? numeroPlanoColumnSelect.value : "",
        colunaUsuarioFechamento: usuarioFechamentoColumnSelect ? usuarioFechamentoColumnSelect.value : "",
        colunaNomeCliente: nomeClienteColumnSelect ? nomeClienteColumnSelect.value : "",
        colunaCodigoCliente: codigoClienteColumnSelect ? codigoClienteColumnSelect.value : "",
        colunaProtocoloAtendimento: protocoloAtendimentoColumnSelect ? protocoloAtendimentoColumnSelect.value : ""
    };
}

// Soma quantidades agrupando por uma chave normalizada para reduzir duplicidades textuais.
function somarPorChave(registros, extrairChave, filtrar) {
    const mapa = new Map();

    (registros || []).forEach((registro) => {
        if (!registro) {
            return;
        }

        if (typeof filtrar === "function" && !filtrar(registro)) {
            return;
        }

        const chave = normalizarTextoBusca(extrairChave(registro));

        if (!chave) {
            return;
        }

        const nome = String(extrairChave(registro) || "").trim();
        const quantidade = Number(registro.quantidade) || 0;
        const existente = mapa.get(chave);

        if (existente) {
            existente.quantidade += quantidade;
            return;
        }

        mapa.set(chave, {
            nome: nome,
            quantidade: quantidade
        });
    });

    return Array.from(mapa.values()).sort((itemA, itemB) => itemB.quantidade - itemA.quantidade);
}

function classificarResolucaoPorQuantidade(quantidade) {
    const valor = Number(quantidade);

    if (!Number.isFinite(valor)) {
        return "desconhecido";
    }

    if (valor === 0) {
        return "interno";
    }

    if (valor > 0) {
        return "externo";
    }

    return "desconhecido";
}

function normalizarChaveUsuario(usuario) {
    return normalizarTextoBusca(usuario)
        .replace(/[-_/\\]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizarNomeUsuarioExibicao(usuario) {
    return normalizarMes(String(usuario || ""))
        .replace(/[-_/\\]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function obterTopUsuarios(registros) {
    const mapa = new Map();

    (registros || []).forEach((registro) => {
        const incremento = 1;
        const nomeOriginal = normalizarNomeUsuarioExibicao(registro && registro.usuarioAbertura);
        const chave = normalizarChaveUsuario(nomeOriginal);

        if (!chave) {
            return;
        }

        const existente = mapa.get(chave);

        if (existente) {
            existente.quantidade += incremento;
            return;
        }

        mapa.set(chave, {
            nome: nomeOriginal,
            quantidade: incremento
        });
    });

    return Array.from(mapa.values())
        .sort((itemA, itemB) => itemB.quantidade - itemA.quantidade)
        .slice(0, 4);
}

function obterResumoResolucao(registros) {
    const resumo = {
        interno: 0,
        externo: 0,
        desconhecido: 0
    };

    (registros || []).forEach((registro) => {
        const quantidade = Number(registro.quantidade) || 0;

        const categoria = classificarResolucaoPorQuantidade(quantidade);
        resumo[categoria] += 1;
    });

    return resumo;
}

function obterMotivoRegistro(registro) {
    const texto = normalizarMes(String((registro && registro.resolucao) || ""));
    return texto || "Sem motivo";
}

function pivotearPorMesEMotivo(registros) {
    const mapaMes = new Map();
    const mapaMotivos = new Map();

    (registros || []).forEach((registro) => {
        if (!registro || typeof registro.mes !== "string") {
            return;
        }

        const mes = formatarMesReferencia(registro.mes);

        if (!mes) {
            return;
        }

        const chaveMes = normalizarTextoBusca(mes);
        const motivo = obterMotivoRegistro(registro);
        const chaveMotivo = normalizarTextoBusca(motivo);

        if (!mapaMotivos.has(chaveMotivo)) {
            mapaMotivos.set(chaveMotivo, motivo);
        }

        if (!mapaMes.has(chaveMes)) {
            mapaMes.set(chaveMes, {
                mes: mes,
                total: 0,
                motivos: {}
            });
        }

        const linha = mapaMes.get(chaveMes);
        linha.total += 1;
        linha.motivos[chaveMotivo] = (linha.motivos[chaveMotivo] || 0) + 1;
    });

    const motivos = Array.from(mapaMotivos.entries())
        .map((entrada) => ({
            chave: entrada[0],
            nome: entrada[1]
        }))
        .sort((itemA, itemB) => itemA.nome.localeCompare(itemB.nome, "pt-BR"));

    const linhas = Array.from(mapaMes.values()).sort((itemA, itemB) => {
        const numeroA = obterNumeroMes(itemA.mes) || 13;
        const numeroB = obterNumeroMes(itemB.mes) || 13;

        if (numeroA !== numeroB) {
            return numeroA - numeroB;
        }

        return normalizarTextoBusca(itemA.mes).localeCompare(normalizarTextoBusca(itemB.mes));
    });

    return {
        motivos: motivos,
        linhas: linhas
    };
}

function atualizarTabelaPivo(registros, temImportacaoAtiva) {
    if (!pivotSummaryElement || !pivotTableHead || !pivotTableBody) {
        return;
    }

    if (temImportacaoAtiva && (!registros || registros.length === 0)) {
        pivotSummaryElement.textContent = "Nenhum registro encontrado para os filtros atuais.";
        pivotTableHead.innerHTML = "<tr><th>Mes</th><th>Total</th></tr>";
        pivotTableBody.innerHTML = '<tr><td colspan="2">Nenhum registro encontrado para os filtros atuais.</td></tr>';
        return;
    }

    const resultado = pivotearPorMesEMotivo(registros);
    const motivos = resultado.motivos;
    const linhas = resultado.linhas;

    if (!linhas.length) {
        pivotSummaryElement.textContent = "Aguardando dados para gerar o pivoteamento.";
        pivotTableHead.innerHTML = "<tr><th>Mes</th><th>Total</th></tr>";
        pivotTableBody.innerHTML = '<tr><td colspan="2">Nenhum dado pivoteado ainda.</td></tr>';
        return;
    }

    pivotSummaryElement.textContent = `Pivoteamento aplicado: ${linhas.length} mes(es) e ${motivos.length} motivo(s).`;

    const cabecalho = ["<tr><th>Mes</th>"];
    motivos.forEach((motivo) => {
        cabecalho.push(`<th>${escaparHtml(motivo.nome)}</th>`);
    });
    cabecalho.push("<th>Total</th></tr>");
    pivotTableHead.innerHTML = cabecalho.join("");

    const linhasHtml = linhas.map((linha) => {
        const celulas = [`<td>${escaparHtml(obterRotuloMesEixo(linha.mes))}</td>`];

        motivos.forEach((motivo) => {
            const valor = linha.motivos[motivo.chave] || 0;
            celulas.push(`<td>${escaparHtml(String(valor))}</td>`);
        });

        celulas.push(`<td>${escaparHtml(String(linha.total))}</td>`);

        return `<tr>${celulas.join("")}</tr>`;
    }).join("");

    pivotTableBody.innerHTML = linhasHtml;
}

// Agrupa os registros por mes, separando em N1 (suporte interno, quantidade = 0)
// e N2 (externo / tecnicos, quantidade > 0), com total de atendimentos e SLA medio de cada grupo.
function montarResumoMesN1N2(registros) {
    const mapaMes = new Map();

    (registros || []).forEach((registro) => {
        if (!registro || typeof registro.mes !== "string") {
            return;
        }

        const mes = formatarMesReferencia(registro.mes);

        if (!mes) {
            return;
        }

        const chaveMes = normalizarTextoBusca(mes);
        const categoria = classificarResolucaoPorQuantidade(registro.quantidade);
        const horas = calcularSlaHoras(registro);

        if (!mapaMes.has(chaveMes)) {
            mapaMes.set(chaveMes, {
                mes: mes,
                n1Total: 0,
                n1SlaSoma: 0,
                n1SlaQtd: 0,
                n2Total: 0,
                n2SlaSoma: 0,
                n2SlaQtd: 0
            });
        }

        const linha = mapaMes.get(chaveMes);

        if (categoria === "interno") {
            linha.n1Total += 1;
            if (horas !== null) {
                linha.n1SlaSoma += horas;
                linha.n1SlaQtd += 1;
            }
        } else if (categoria === "externo") {
            linha.n2Total += 1;
            if (horas !== null) {
                linha.n2SlaSoma += horas;
                linha.n2SlaQtd += 1;
            }
        }
    });

    const linhas = Array.from(mapaMes.values()).sort((itemA, itemB) => {
        const numeroA = obterNumeroMes(itemA.mes) || 13;
        const numeroB = obterNumeroMes(itemB.mes) || 13;

        if (numeroA !== numeroB) {
            return numeroA - numeroB;
        }

        return normalizarTextoBusca(itemA.mes).localeCompare(normalizarTextoBusca(itemB.mes));
    });

    return linhas.map((linha) => ({
        mes: linha.mes,
        n1Total: linha.n1Total,
        n1Sla: linha.n1SlaQtd > 0 ? (linha.n1SlaSoma / linha.n1SlaQtd) : null,
        n2Total: linha.n2Total,
        n2Sla: linha.n2SlaQtd > 0 ? (linha.n2SlaSoma / linha.n2SlaQtd) : null
    }));
}

function atualizarTabelaMesN1N2(registros) {
    if (!mesN1N2TableBody) {
        return;
    }

    const linhas = montarResumoMesN1N2(registros);

    if (!linhas.length) {
        if (mesN1N2StatusElement) {
            mesN1N2StatusElement.textContent = "Aguardando importacao com as colunas de mes e quantidade.";
        }
        mesN1N2TableBody.innerHTML = '<tr><td colspan="5">Nenhum dado disponivel.</td></tr>';
        return;
    }

    if (mesN1N2StatusElement) {
        mesN1N2StatusElement.textContent = `${linhas.length} mes(es) encontrados. N1 = suporte interno (quantidade = 0) | N2 = externo/tecnicos (quantidade acima de 0).`;
    }

    mesN1N2TableBody.innerHTML = linhas.map((linha) => `
        <tr>
            <td>${escaparHtml(linha.mes)}</td>
            <td style="text-align:center;">${linha.n1Total}</td>
            <td style="text-align:center;">${linha.n1Sla !== null ? formatarHoras(linha.n1Sla) : "—"}</td>
            <td style="text-align:center;">${linha.n2Total}</td>
            <td style="text-align:center;">${linha.n2Sla !== null ? formatarHoras(linha.n2Sla) : "—"}</td>
        </tr>`).join("");
}

function consolidarProtocolosPorMes(registros) {
    const resultado = pivotearPorMesEMotivo(registros);
    const nomesMotivoPorChave = {};

    resultado.motivos.forEach((motivo) => {
        nomesMotivoPorChave[motivo.chave] = motivo.nome;
    });

    return resultado.linhas.map((linha) => {
        const detalhesMotivos = Object.keys(linha.motivos || {})
            .map((chaveMotivo) => ({
                motivo: nomesMotivoPorChave[chaveMotivo] || chaveMotivo,
                quantidade: Number(linha.motivos[chaveMotivo]) || 0
            }))
            .filter((item) => item.quantidade > 0)
            .sort((itemA, itemB) => itemB.quantidade - itemA.quantidade);

        return {
            mes: linha.mes,
            quantidade: linha.total,
            detalhesMotivos: detalhesMotivos
        };
    });
}

function renderizarPodium(topUsuarios, totalBase) {
    if (!podiumContainer) {
        return;
    }

    if (!topUsuarios || topUsuarios.length === 0) {
        podiumContainer.innerHTML = '<div class="podium-empty">Nenhum usuario de abertura identificado no arquivo importado.</div>';
        return;
    }

    const classesPosicao = ["podium-item--first", "podium-item--second", "podium-item--third", "podium-item--fourth"];
    const total = Number(totalBase) || 0;

    podiumContainer.innerHTML = topUsuarios.map((item, indice) => {
        const posicao = indice + 1;
        const classe = classesPosicao[indice] || "";
        const percentual = total > 0 ? Math.round(((Number(item.quantidade) || 0) / total) * 100) : 0;
        return `<article class="podium-item ${classe}"><span class="podium-rank">${posicao}</span><span class="podium-name">${escaparHtml(item.nome || "Sem nome")}</span><span class="podium-value">${escaparHtml(String(item.quantidade))} atendimento(s) • ${percentual}%</span></article>`;
    }).join("");
}

function montarTopUsersChart(topUsuarios, totalBase) {
    if (!topUsersCanvas) {
        return;
    }

    if (topUsersChart) {
        topUsersChart.destroy();
    }

    const labels = topUsuarios.map((item) => item.nome || "Sem nome");
    const valores = topUsuarios.map((item) => item.quantidade);
    const total = Number(totalBase) || valores.reduce((acumulado, valor) => acumulado + (Number(valor) || 0), 0);

    topUsersChart = new Chart(topUsersCanvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Aberturas geradas",
                data: valores,
                backgroundColor: ["rgba(14, 165, 233, 0.85)", "rgba(34, 197, 94, 0.82)", "rgba(245, 158, 11, 0.82)", "rgba(239, 68, 68, 0.8)"],
                borderRadius: 12,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: "#ffffff",
                    anchor: "center",
                    align: "center",
                    clamp: true,
                    font: {
                        weight: "700",
                        size: 12
                    },
                    formatter: (value) => {
                        const quantidade = Number(value) || 0;

                        if (!quantidade) {
                            return "";
                        }

                        if (!total) {
                            return String(quantidade);
                        }

                        const percentual = Math.round((quantidade / total) * 100);
                        return `${quantidade}\n${percentual}%`;
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(17, 24, 39, 0.08)"
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        callback: (valor, indice) => {
                            const rotulo = labels[indice] || "";
                            const limite = 22;

                            if (rotulo.length <= limite) {
                                return rotulo;
                            }

                            return `${rotulo.slice(0, limite - 3)}...`;
                        }
                    }
                }
            }
        }
    });
}

function montarResolutionChart(resumo) {
    if (!resolutionCanvas) {
        return;
    }

    if (resolutionChart) {
        resolutionChart.destroy();
    }

    const internos = resumo.interno || 0;
    const externos = resumo.externo || 0;
    const desconhecido = resumo.desconhecido || 0;
    const total = internos + externos + desconhecido;
    const tema = obterTemaGrafico();

    resolutionChart = new Chart(resolutionCanvas, {
        type: "doughnut",
        data: {
            labels: ["Interno", "Externo", "Desconhecido"],
            datasets: [{
                data: [internos, externos, desconhecido],
                backgroundColor: [CHART_PALETTE.resolved, CHART_PALETTE.info, CHART_PALETTE.warn],
                borderColor: tema.border,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: tema.text
                    }
                },
                datalabels: {
                    color: "#ffffff",
                    font: {
                        weight: "700",
                        size: 12
                    },
                    textAlign: "center",
                    formatter: (value) => {
                        if (!total || value === 0) {
                            return "";
                        }

                        const percentual = Math.round((value / total) * 100);
                        return `${value}\n${percentual}%`;
                    }
                }
            }
        }
    });
}

function filtrarRegistrosPorModalidadeResolucao(registros) {
    if (filtroModalidadeResolucao === "todos") {
        return (registros || []).slice();
    }

    return (registros || []).filter((registro) => {
        const modalidade = obterModalidadeAtendimentoRegistro(registro);
        return modalidade && modalidade.chave === filtroModalidadeResolucao;
    });
}

function obterTop3ResolvidosPorModalidade(registros) {
    const base = {
        remoto: { total: 0, mapa: {} },
        externo: { total: 0, mapa: {} }
    };

    (registros || []).forEach((registro) => {
        const modalidade = obterModalidadeAtendimentoRegistro(registro);
        const chaveModalidade = modalidade && modalidade.chave === "externo" ? "externo" : "remoto";
        const tipo = String((registro && registro.tipoAtendimento) || "").trim() || "Sem tipo";

        base[chaveModalidade].total += 1;
        base[chaveModalidade].mapa[tipo] = (base[chaveModalidade].mapa[tipo] || 0) + 1;
    });

    const formatarGrupo = (grupo) => {
        const total = grupo.total || 0;
        const itens = Object.entries(grupo.mapa || {})
            .sort((itemA, itemB) => itemB[1] - itemA[1])
            .slice(0, 3)
            .map(([nome, quantidade]) => ({
                nome,
                quantidade,
                percentual: total > 0 ? Math.round((quantidade / total) * 100) : 0
            }));

        return {
            total,
            itens
        };
    };

    return {
        remoto: formatarGrupo(base.remoto),
        externo: formatarGrupo(base.externo)
    };
}

function montarResolutionTopList(registros) {
    if (!resolutionTopListElement) {
        return;
    }

    const dados = obterTop3ResolvidosPorModalidade(registros);

    const montarBloco = (titulo, grupo, classe, modalidade) => {
        const ativo = filtroModalidadeResolucao === modalidade;

        if (!grupo || grupo.total === 0 || !grupo.itens || grupo.itens.length === 0) {
            return `<section class="resolution-top-list__block ${classe}${ativo ? " is-active" : ""}" data-modalidade="${modalidade}" role="button" tabindex="0" aria-pressed="${ativo ? "true" : "false"}">
                <h3>${titulo}</h3>
                <p class="resolution-top-list__empty">Sem dados para este grupo.</p>
            </section>`;
        }

        const linhas = grupo.itens.map((item, indice) => {
            return `<li><span class="resolution-top-list__rank">${indice + 1}.</span><span class="resolution-top-list__name" title="${escaparHtml(item.nome)}">${escaparHtml(item.nome)}</span><span class="resolution-top-list__value">${item.percentual}% (${item.quantidade})</span></li>`;
        }).join("");

        return `<section class="resolution-top-list__block ${classe}${ativo ? " is-active" : ""}" data-modalidade="${modalidade}" role="button" tabindex="0" aria-pressed="${ativo ? "true" : "false"}">
            <h3>${titulo}</h3>
            <p class="resolution-top-list__total">Total do grupo: ${grupo.total}</p>
            <ol>${linhas}</ol>
        </section>`;
    };

    resolutionTopListElement.innerHTML = `
        <div class="resolution-top-list__grid">
            ${montarBloco("Resolvido Remoto", dados.remoto, "resolution-top-list__block--remoto", "remoto")}
            ${montarBloco("Resolvido Externo", dados.externo, "resolution-top-list__block--externo", "externo")}
        </div>`;
}

// ─── SLA ───────────────────────────────────────────────────────────────────

// Converte diferentes formatos de data (Date, serial Excel, BR e ISO) para Date válido.
function parsarDataRegistro(valor) {
    if (valor === null || valor === undefined) return null;

    // Já é um objeto Date
    if (Object.prototype.toString.call(valor) === "[object Date]") {
        return isNaN(valor.getTime()) ? null : valor;
    }

    // Número serial do Excel (ex: 46063.43)
    const num = Number(valor);
    if (Number.isFinite(num) && num > 59 && num < 60000) {
        if (window.XLSX && window.XLSX.SSF && typeof window.XLSX.SSF.parse_date_code === "function") {
            const d = window.XLSX.SSF.parse_date_code(num);
            if (d && Number.isFinite(d.y)) {
                const dt = new Date(d.y, d.m - 1, d.d, d.H || 0, d.M || 0, d.S || 0);
                if (!isNaN(dt.getTime())) return dt;
            }
        }
        // Fallback manual para serial sem biblioteca
        const base = new Date(1899, 11, 30);
        const dias = Math.floor(num);
        const frac = num - dias;
        const dt = new Date(base.getTime() + dias * 86400000 + Math.round(frac * 86400000));
        return isNaN(dt.getTime()) ? null : dt;
    }

    const texto = String(valor).trim();
    if (!texto || texto === "-") return null;

    // dd/MM/yyyy HH:mm ou dd/MM/yyyy HH:mm:ss (separador / - .)
    const br = texto.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (br) {
        const dt = new Date(
            Number(br[3]),
            Number(br[2]) - 1,
            Number(br[1]),
            Number(br[4] || 0),
            Number(br[5] || 0),
            Number(br[6] || 0)
        );
        return isNaN(dt.getTime()) ? null : dt;
    }

    // ISO 8601 (yyyy-MM-dd...)
    const iso = new Date(texto);
    return isNaN(iso.getTime()) ? null : iso;
}

function formatarDataBR(data) {
    if (!data || !(data instanceof Date)) return "N/A";
    return data.toLocaleDateString("pt-BR");
}

function calcularSlaHoras(registro) {
    // SLA estrito: considera somente as colunas mapeadas de abertura e fechamento.
    const dtAbertura = parsarDataRegistro(registro.dataAbertura);
    const dtFechamento = parsarDataRegistro(registro.dataFechamento);
    if (!dtAbertura || !dtFechamento) return null;
    const diff = (dtFechamento - dtAbertura) / 3600000;
    return diff >= 0 ? diff : null;
}

function classificarFaixaSla(horas) {
    if (horas === null) return null;
    if (horas <= 24) return "Ate 24h";
    if (horas <= 72) return "24h - 72h";
    if (horas <= 168) return "3 - 7 dias";
    return "Acima de 7 dias";
}

function obterResumoSla(registros) {
    // Consolida métricas de SLA para os painéis: média, mediana, faixas e recorte por tipo.
    const slas = [];
    const faixas = { "Ate 24h": 0, "24h - 72h": 0, "3 - 7 dias": 0, "Acima de 7 dias": 0 };
    const porTipo = {};

    (registros || []).forEach((r) => {
        const h = calcularSlaHoras(r);
        if (h === null) return;
        slas.push(h);
        const faixa = classificarFaixaSla(h);
        faixas[faixa] = (faixas[faixa] || 0) + 1;
        const tipo = String(r.tipoAtendimento || "").trim() || "Sem tipo";
        if (!porTipo[tipo]) porTipo[tipo] = [];
        porTipo[tipo].push(h);
    });

    if (slas.length === 0) return null;

    const soma = slas.reduce((a, b) => a + b, 0);
    const media = soma / slas.length;
    const sorted = slas.slice().sort((a, b) => a - b);
    const mediana = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    const mediaPorTipo = Object.entries(porTipo)
        .map(([tipo, arr]) => ({ tipo, media: arr.reduce((a, b) => a + b, 0) / arr.length, total: arr.length }))
        .sort((a, b) => b.media - a.media)
        .slice(0, 10);

    return { total: slas.length, media, mediana, faixas, mediaPorTipo };
}

function formatarHoras(h) {
    if (h < 24) return Math.round(h) + "h";
    const dias = Math.floor(h / 24);
    const horasRest = Math.round(h % 24);
    if (horasRest === 0) return `${dias}d`;
    return `${dias}d ${horasRest}h`;
}

function montarSlaSummary(resumo) {
    if (!slaSummaryEl) return;
    if (!resumo) {
        slaSummaryEl.innerHTML = "";
        return;
    }
    slaSummaryEl.innerHTML = `
        <div class="sla-cards">
            <div class="sla-card"><span class="sla-card__label">Total com SLA</span><span class="sla-card__value">${resumo.total}</span></div>
            <div class="sla-card"><span class="sla-card__label">Media</span><span class="sla-card__value">${formatarHoras(resumo.media)}</span></div>
            <div class="sla-card"><span class="sla-card__label">Mediana</span><span class="sla-card__value">${formatarHoras(resumo.mediana)}</span></div>
            <div class="sla-card sla-card--ok"><span class="sla-card__label">Ate 24h</span><span class="sla-card__value">${resumo.faixas["Ate 24h"]}</span></div>
            <div class="sla-card sla-card--warn"><span class="sla-card__label">24h - 72h</span><span class="sla-card__value">${resumo.faixas["24h - 72h"]}</span></div>
            <div class="sla-card sla-card--late"><span class="sla-card__label">Acima de 72h</span><span class="sla-card__value">${(resumo.faixas["3 - 7 dias"] || 0) + (resumo.faixas["Acima de 7 dias"] || 0)}</span></div>
        </div>`;
}

function montarSlaDistChart(resumo) {
    if (!slaDistCanvas) return;
    if (slaDistChart) { slaDistChart.destroy(); slaDistChart = null; }
    if (!resumo) return;

    const labels = Object.keys(resumo.faixas);
    const valores = labels.map((l) => resumo.faixas[l]);
    const cores = [CHART_PALETTE.resolved, CHART_PALETTE.info, CHART_PALETTE.warn, CHART_PALETTE.critical];
    const tema = obterTemaGrafico();

    slaDistChart = new Chart(slaDistCanvas, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{ data: valores, backgroundColor: cores, borderWidth: 2, borderColor: tema.border }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        color: tema.text
                    }
                },
                datalabels: {
                    color: "#ffffff",
                    font: { weight: "bold", size: 12 },
                    formatter: (v, ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        if (!total) return "";
                        const pct = Math.round((v / total) * 100);
                        return pct > 4 ? pct + "%" : "";
                    }
                }
            }
        },
        plugins: [window.ChartDataLabels].filter(Boolean)
    });
}

function montarSlaTipoChart(resumo) {
    if (!slaTipoCanvas) return;
    if (slaTipoChart) { slaTipoChart.destroy(); slaTipoChart = null; }
    if (!resumo || !resumo.mediaPorTipo || resumo.mediaPorTipo.length === 0) return;

    const labels = resumo.mediaPorTipo.map((i) => i.tipo);
    const valores = resumo.mediaPorTipo.map((i) => Math.round(i.media));
    const tema = obterTemaGrafico();

    slaTipoChart = new Chart(slaTipoCanvas, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "SLA medio (horas)",
                data: valores,
                backgroundColor: CHART_PALETTE.violet,
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
                    color: tema.text,
                    font: { size: 11 },
                    formatter: (v) => formatarHoras(v)
                }
            },
            scales: {
                x: { grid: { color: tema.grid }, ticks: { color: tema.text, callback: (v) => formatarHoras(v) } },
                y: { grid: { display: false }, ticks: { color: tema.text } }
            }
        },
        plugins: [window.ChartDataLabels].filter(Boolean)
    });
}

// ─── Motivo fechamento e Tipo atendimento ──────────────────────────────────

function obterContagemPorCampo(registros, campo, topN) {
    const mapa = {};
    (registros || []).forEach((r) => {
        const val = String(r[campo] || "").trim().replace(/\\n/g, " ").replace(/\s+/g, " ");
        if (!val || val === "-") return;
        mapa[val] = (mapa[val] || 0) + 1;
    });
    return Object.entries(mapa)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN || 10)
        .map(([label, count]) => ({ label, count }));
}

function obterBaseClientesManual() {
    if (!baseClientesInput) {
        return null;
    }

    const valor = Number(baseClientesInput.value);
    return Number.isFinite(valor) && valor > 0 ? valor : null;
}

function formatarPercentualIncidencia(valor) {
    return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "%";
}

function obterTicketsLentidao(registros) {
    return (registros || []).reduce((acumulado, registro) => {
        const motivo = normalizarTextoBusca(String((registro && registro.motivoFechamento) || ""));

        if (!motivo) {
            return acumulado;
        }

        const ehLentidao = motivo.indexOf("conexao lenta") !== -1
            || motivo.indexOf("conexao ruim") !== -1
            || motivo.indexOf("internet lenta") !== -1
            || motivo.indexOf("lentidao") !== -1
            || motivo.indexOf("lento") !== -1;

        if (!ehLentidao) {
            return acumulado;
        }

        return acumulado + obterQuantidadeRegistro(registro);
    }, 0);
}

function atualizarKpiIncidenciaLentidao(registros) {
    if (!incidenciaLentidaoValueElement || !incidenciaLentidaoDetailElement) {
        return;
    }

    const ticketsLentidao = obterTicketsLentidao(registros);
    const baseClientes = obterBaseClientesManual();

    if (!baseClientes) {
        incidenciaLentidaoValueElement.textContent = "—";
        incidenciaLentidaoDetailElement.textContent = `Tickets de lentidão identificados: ${ticketsLentidao}. Informe a base total de clientes para calcular.`;
        return;
    }

    const incidencia = (ticketsLentidao / baseClientes) * 100;
    incidenciaLentidaoValueElement.textContent = formatarPercentualIncidencia(incidencia);
    incidenciaLentidaoDetailElement.textContent = `${ticketsLentidao} ticket(s) de lentidão em uma base de ${baseClientes.toLocaleString("pt-BR")} cliente(s).`;
}

function obterNomePlanoDaColunaServico(registro) {
    const nomePorServico = String((registro && registro.numeroPlano) || "").trim().replace(/\n/g, " ").replace(/\s+/g, " ");
    const nomePorPlano = String((registro && registro.tipoAtendimento) || "").trim().replace(/\n/g, " ").replace(/\s+/g, " ");

    return nomePorServico || nomePorPlano || "";
}

function obterResumoPlanoPorServico(registros, topN) {
    const mapa = {};

    (registros || []).forEach((registro) => {
        const nomePlano = obterNomePlanoDaColunaServico(registro);

        if (!nomePlano || nomePlano === "-") {
            return;
        }

        const quantidade = Number(registro && registro.quantidade);
        const incremento = Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 1;
        mapa[nomePlano] = (mapa[nomePlano] || 0) + incremento;
    });

    const rankingCompleto = Object.entries(mapa)
        .sort((itemA, itemB) => itemB[1] - itemA[1])
        .map(([label, count]) => ({ label, count }));

    return {
        lista: typeof topN === "number" ? rankingCompleto.slice(0, topN) : rankingCompleto,
        totalAtendimentos: rankingCompleto.reduce((acumulado, item) => acumulado + item.count, 0),
        totalPlanos: rankingCompleto.length,
        planoLider: rankingCompleto[0] || null
    };
}

function montarResumoPlanoPorServico(resumo) {
    if (!planoServicoSummaryElement) {
        return;
    }

    if (!resumo || !resumo.totalPlanos) {
        planoServicoSummaryElement.innerHTML = "";
        return;
    }

    const nomeLider = resumo.planoLider ? resumo.planoLider.label : "N/A";
    const qtdLider = resumo.planoLider ? resumo.planoLider.count : 0;

    planoServicoSummaryElement.innerHTML = `
        <div class="bairro-summary__cards">
            <div class="bairro-summary__card bairro-summary__card--highlight">
                <span class="bairro-summary__label">Plano Lider</span>
                <span class="bairro-summary__value" title="${escaparHtml(nomeLider)}">${escaparHtml(nomeLider)}</span>
                <span class="bairro-summary__sub">${qtdLider} atendimento(s)</span>
            </div>
            <div class="bairro-summary__card">
                <span class="bairro-summary__label">Atendimentos</span>
                <span class="bairro-summary__value">${resumo.totalAtendimentos}</span>
                <span class="bairro-summary__sub">somatorio por nome do plano</span>
            </div>
            <div class="bairro-summary__card">
                <span class="bairro-summary__label">Planos Identificados</span>
                <span class="bairro-summary__value">${resumo.totalPlanos}</span>
                <span class="bairro-summary__sub">na coluna servico</span>
            </div>
        </div>`;
}

function montarPlanoServicoChart(registros) {
    if (!planoServicoCanvas) {
        return;
    }

    if (planoServicoChart) {
        planoServicoChart.destroy();
        planoServicoChart = null;
    }

    const resumo = obterResumoPlanoPorServico(registros);
    montarResumoPlanoPorServico(resumo);

    if (!resumo.lista.length) {
        return;
    }

    const tema = obterTemaGrafico();

    planoServicoChart = new Chart(planoServicoCanvas, {
        type: "bar",
        data: {
            labels: resumo.lista.map((item) => item.label),
            datasets: [{
                label: "Quantidade de atendimentos",
                data: resumo.lista.map((item) => item.count),
                backgroundColor: CHART_PALETTE.indigo,
                borderRadius: 8,
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
                    color: tema.text,
                    font: { size: 11, weight: "bold" },
                    formatter: (v) => v
                }
            },
            scales: {
                x: { beginAtZero: true, grid: { color: tema.grid }, ticks: { color: tema.text } },
                y: {
                    grid: { display: false },
                    ticks: {
                        color: tema.text,
                        font: { size: 11 },
                        callback: (valor, indice) => {
                            const rotulo = resumo.lista[indice] ? resumo.lista[indice].label : "";
                            const limite = 28;
                            return rotulo.length <= limite ? rotulo : `${rotulo.slice(0, limite - 3)}...`;
                        }
                    }
                }
            }
        },
        plugins: [window.ChartDataLabels].filter(Boolean)
    });
}

function montarMotivoChart(registros) {
    if (!motivoCanvas) return;
    if (motivoChart) { motivoChart.destroy(); motivoChart = null; }
    const dados = obterContagemPorCampo(registros, "motivoFechamento", 8);
    if (dados.length === 0) return;

    const tema = obterTemaGrafico();
    const paleta = CHART_PALETTE.categorical;

    motivoChart = new Chart(motivoCanvas, {
        type: "bar",
        data: {
            labels: dados.map((d) => d.label),
            datasets: [{
                label: "Atendimentos",
                data: dados.map((d) => d.count),
                backgroundColor: paleta,
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
                    color: tema.text,
                    font: { size: 11 },
                    formatter: (v) => v
                }
            },
            scales: {
                x: { grid: { color: tema.grid }, ticks: { color: tema.text } },
                y: { grid: { display: false }, ticks: { color: tema.text, font: { size: 11 } } }
            }
        },
        plugins: [window.ChartDataLabels].filter(Boolean)
    });
}

function montarTipoChart(registros) {
    if (!tipoCanvas) return;
    if (tipoChart) { tipoChart.destroy(); tipoChart = null; }
    const dados = obterContagemPorCampo(registros, "tipoAtendimento", 12);
    if (dados.length === 0) return;

    const tema = obterTemaGrafico();
    const paleta = CHART_PALETTE.categorical;

    tipoChart = new Chart(tipoCanvas, {
        type: "doughnut",
        data: {
            labels: dados.map((d) => d.label),
            datasets: [{
                data: dados.map((d) => d.count),
                backgroundColor: paleta,
                borderWidth: 2,
                borderColor: tema.border
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "right", labels: { color: tema.text, font: { size: 11 }, boxWidth: 14 } },
                datalabels: {
                    color: "#ffffff",
                    font: { weight: "bold", size: 11 },
                    formatter: (v, ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const pct = Math.round((v / total) * 100);
                        return pct > 5 ? pct + "%" : "";
                    }
                }
            }
        },
        plugins: [window.ChartDataLabels].filter(Boolean)
    });
}

function montarCidadeChart(registros) {
    if (!cidadeCanvas) return;
    if (cidadeChart) { cidadeChart.destroy(); cidadeChart = null; }

    const dados = obterContagemPorCampo(registros, "cidade", 10);
    const tema = obterTemaGrafico();

    if (dados.length === 0) return;

    cidadeChart = new Chart(cidadeCanvas, {
        type: "bar",
        data: {
            labels: dados.map((d) => d.label),
            datasets: [{
                label: "Atendimentos por cidade",
                data: dados.map((d) => d.count),
                backgroundColor: CHART_PALETTE.blue,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: "end",
                    align: "end",
                    color: tema.text,
                    font: { size: 11, weight: "bold" },
                    formatter: (v) => v
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: tema.text, maxRotation: 45, minRotation: 0 }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: tema.text },
                    grid: { color: tema.grid }
                }
            }
        },
        plugins: [window.ChartDataLabels].filter(Boolean)
    });
}

function montarBairroChart(registros) {
    if (!bairroCanvas) return;
    if (bairroChart) { bairroChart.destroy(); bairroChart = null; }

    const mapa = {};
    const tema = obterTemaGrafico();

    (registros || []).forEach((registro) => {
        const bairro = String((registro && registro.bairro) || "").trim();

        if (!bairro || bairro === "-") {
            return;
        }

        const cidade = String((registro && registro.cidade) || "").trim() || "Sem cidade";
        const rotulo = `${bairro} (${cidade})`;
        mapa[rotulo] = (mapa[rotulo] || 0) + 1;
    });

    const dados = Object.entries(mapa)
        .sort((itemA, itemB) => itemB[1] - itemA[1])
        .slice(0, 12)
        .map(([label, count]) => ({ label, count }));

    if (dados.length === 0) return;

    bairroChart = new Chart(bairroCanvas, {
        type: "bar",
        data: {
            labels: dados.map((d) => d.label),
            datasets: [{
                label: "Atendimentos por bairro",
                data: dados.map((d) => d.count),
                backgroundColor: CHART_PALETTE.emerald,
                borderRadius: 8,
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
                    color: tema.text,
                    font: { size: 11, weight: "bold" },
                    formatter: (v) => v
                }
            },
            scales: {
                x: { beginAtZero: true, grid: { color: tema.grid }, ticks: { color: tema.text } },
                y: { grid: { display: false }, ticks: { color: tema.text, font: { size: 11 } } }
            }
        },
        plugins: [window.ChartDataLabels].filter(Boolean)
    });
}

function montarResumoBairro(registros) {
    if (!bairroSummaryElement) {
        return;
    }

    const mapa = {};

    (registros || []).forEach((registro) => {
        const bairro = String((registro && registro.bairro) || "").trim();

        if (!bairro || bairro === "-") {
            return;
        }

        mapa[bairro] = (mapa[bairro] || 0) + 1;
    });

    const ranking = Object.entries(mapa).sort((itemA, itemB) => itemB[1] - itemA[1]);
    const totalComBairro = ranking.reduce((acumulado, item) => acumulado + item[1], 0);

    if (!ranking.length || totalComBairro === 0) {
        bairroSummaryElement.innerHTML = "";
        return;
    }

    const topBairro = ranking[0];
    const percentualTop = Math.round((topBairro[1] / totalComBairro) * 100);
    const coberturaTop3 = ranking.slice(0, 3).reduce((acumulado, item) => acumulado + item[1], 0);
    const percentualTop3 = Math.round((coberturaTop3 / totalComBairro) * 100);

    bairroSummaryElement.innerHTML = `
        <div class="bairro-summary__cards">
            <div class="bairro-summary__card bairro-summary__card--highlight">
                <span class="bairro-summary__label">Top Bairro</span>
                <span class="bairro-summary__value" title="${escaparHtml(topBairro[0])}">${escaparHtml(topBairro[0])}</span>
                <span class="bairro-summary__sub">${topBairro[1]} atendimento(s) · ${percentualTop}%</span>
            </div>
            <div class="bairro-summary__card">
                <span class="bairro-summary__label">Bairros Mapeados</span>
                <span class="bairro-summary__value">${ranking.length}</span>
                <span class="bairro-summary__sub">com pelo menos 1 atendimento</span>
            </div>
            <div class="bairro-summary__card">
                <span class="bairro-summary__label">Cobertura Top 3</span>
                <span class="bairro-summary__value">${percentualTop3}%</span>
                <span class="bairro-summary__sub">${coberturaTop3} de ${totalComBairro} atendimentos</span>
            </div>
        </div>`;
}

function obterClientesRecorrentes(registros) {
    const mapa = new Map();

    (registros || []).forEach((registro) => {
        const cliente = String((registro && registro.nomeCliente) || "").trim();
        const plano = String((registro && registro.numeroPlano) || "").trim();
        const tipo = String((registro && registro.tipoAtendimento) || "").trim();
        const abertura = String((registro && registro.usuarioAbertura) || "").trim();
        const descricaoAbertura = String((registro && (registro.descricaoAbertura || registro.descricao_abertura)) || "").trim();
        const descricaoFechamento = String((registro && (registro.descricaoFechamento || registro.descricao_fechamento)) || "").trim();
        const osAssociada = obterOsPorDescricaoFechamento(descricaoFechamento);
        const dataAbertura = registro && registro.dataAbertura;

        if (!cliente || !plano || cliente === "-" || plano === "-") {
            return;
        }

        const chave = `${normalizarTextoBusca(cliente)}::${normalizarTextoBusca(plano)}`;

        if (!mapa.has(chave)) {
            mapa.set(chave, {
                cliente,
                plano,
                quantidade: 0,
                tipos: {},
                usuariosAbertura: {},
                descricoesAbertura: {},
                descricoesFechamento: {},
                datasAbertura: [],
                atendimentos: []
            });
        }

        const item = mapa.get(chave);
        item.quantidade += 1;

        if (tipo && tipo !== "-") {
            item.tipos[tipo] = (item.tipos[tipo] || 0) + 1;
        }

        if (abertura && abertura !== "-") {
            item.usuariosAbertura[abertura] = (item.usuariosAbertura[abertura] || 0) + 1;
        }

        if (descricaoAbertura && descricaoAbertura !== "-") {
            item.descricoesAbertura[descricaoAbertura] = (item.descricoesAbertura[descricaoAbertura] || 0) + 1;
        }

        if (descricaoFechamento && descricaoFechamento !== "-") {
            item.descricoesFechamento[descricaoFechamento] = (item.descricoesFechamento[descricaoFechamento] || 0) + 1;
        }

        if (dataAbertura) {
            item.datasAbertura.push(dataAbertura);
        }

        item.atendimentos.push({
            dataAbertura: dataAbertura || "",
            tipoAtendimento: tipo || "N/A",
            usuarioAbertura: abertura || "N/A",
            descricaoAbertura: descricaoAbertura || "N/A",
            descricaoFechamento: descricaoFechamento || "N/A",
            numeroOs: osAssociada ? osAssociada.numeroOs : "",
            osTecnico: osAssociada && osAssociada.registro ? osAssociada.registro.tecnico : "",
            osDataRealizada: osAssociada && osAssociada.registro ? osAssociada.registro.dataRealizada : "",
            osDescricaoFechamento: osAssociada && osAssociada.registro ? osAssociada.registro.descricaoFechamento : "",
            osEncontrada: Boolean(osAssociada && osAssociada.registro)
        });
    });

    return Array.from(mapa.values())
        .filter((item) => item.quantidade > 2)
        .map((item) => {
            const tiposOrdenados = Object.entries(item.tipos)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map((entrada) => entrada[0]);
            const usuariosOrdenados = Object.entries(item.usuariosAbertura)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map((entrada) => entrada[0]);
            const descricoesAberturaOrdenadas = Object.entries(item.descricoesAbertura)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 1)
                .map((entrada) => entrada[0]);
            const descricoesFechamentoOrdenadas = Object.entries(item.descricoesFechamento)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 1)
                .map((entrada) => entrada[0]);

            // Pegar a primeira data de abertura (a mais antiga)
            const primeiraDataAbertura = item.datasAbertura.length > 0 ? item.datasAbertura[0] : "";

            return {
                cliente: item.cliente,
                plano: item.plano,
                quantidade: item.quantidade,
                tiposAtendimento: tiposOrdenados,
                usuariosAbertura: usuariosOrdenados,
                descricaoAbertura: descricoesAberturaOrdenadas[0] || "N/A",
                descricaoFechamento: descricoesFechamentoOrdenadas[0] || "N/A",
                dataAbertura: primeiraDataAbertura,
                atendimentos: item.atendimentos
            };
        })
        .sort((itemA, itemB) => itemB.quantidade - itemA.quantidade);
}

function obterRecorrentesFiltradosEOrdenados(recorrentes) {
    const termo = normalizarTextoBusca(recorrenteSearchElement ? recorrenteSearchElement.value : "");
    const ordenacao = recorrenteSortElement ? String(recorrenteSortElement.value || "quantidade-desc") : "quantidade-desc";

    const filtrados = (recorrentes || []).filter((item) => {
        if (!termo) {
            return true;
        }

        const textoBase = [
            item.cliente,
            item.plano,
            (item.tiposAtendimento || []).join(" "),
            (item.usuariosAbertura || []).join(" "),
            item.descricaoAbertura,
            item.descricaoFechamento
        ].join(" ");

        return normalizarTextoBusca(textoBase).indexOf(termo) !== -1;
    });

    const lista = filtrados.slice();

    if (ordenacao === "quantidade-asc") {
        lista.sort((a, b) => a.quantidade - b.quantidade);
    } else if (ordenacao === "cliente-asc") {
        lista.sort((a, b) => String(a.cliente).localeCompare(String(b.cliente), "pt-BR"));
    } else if (ordenacao === "cliente-desc") {
        lista.sort((a, b) => String(b.cliente).localeCompare(String(a.cliente), "pt-BR"));
    } else {
        lista.sort((a, b) => b.quantidade - a.quantidade);
    }

    return lista;
}

// Paginação de clientes recorrentes: 1 cliente por página.
let recorrentesPaginaAtual = 0;
let recorrentesListaPaginada = [];

function renderizarPaginaClienteRecorrente(lista, indice) {
    const wrapper = recorrenteTableBody ? recorrenteTableBody.closest("table") : null;
    const container = wrapper ? wrapper.parentElement : null;
    if (!container) return;

    // Remove páginas anteriores e controles de paginação injetados
    const paginaAnterior = container.querySelector(".recorrente-pagina-cliente");
    if (paginaAnterior) paginaAnterior.remove();
    const controleAnterior = container.querySelector(".recorrente-paginacao-controle");
    if (controleAnterior) controleAnterior.remove();
    // Oculta a tabela original — a página do cliente substitui visualmente
    if (wrapper) wrapper.style.display = "none";

    if (!lista.length) {
        const vazio = document.createElement("div");
        vazio.className = "recorrente-pagina-cliente";
        vazio.innerHTML = '<p class="recorrente-pagina-vazio">Nenhum cliente recorrente encontrado para os filtros atuais.</p>';
        container.appendChild(vazio);
        return;
    }

    const item = lista[indice];
    const tipos = (item.tiposAtendimento || []).length > 0 ? item.tiposAtendimento.join(", ") : "N/A";
    const usuarios = (item.usuariosAbertura || []).length > 0 ? item.usuariosAbertura.join(", ") : "N/A";
    const dataAberturaFormatada = item.dataAbertura ? formatarDataBR(parsarDataRegistro(item.dataAbertura)) : "N/A";
    const atendimentos = Array.isArray(item.atendimentos) ? item.atendimentos : [];

    const atendimentosHtml = atendimentos.length > 0
        ? atendimentos.map((atendimento, idx) => {
            const dataItem = atendimento && atendimento.dataAbertura ? formatarDataBR(parsarDataRegistro(atendimento.dataAbertura)) : "N/A";
            const tipoItem = atendimento && atendimento.tipoAtendimento ? atendimento.tipoAtendimento : "N/A";
            const usuarioItem = atendimento && atendimento.usuarioAbertura ? atendimento.usuarioAbertura : "N/A";
            const descAbItem = atendimento && atendimento.descricaoAbertura ? atendimento.descricaoAbertura : "N/A";
            const descFechItem = atendimento && atendimento.descricaoFechamento ? atendimento.descricaoFechamento : "N/A";
            const numeroOsItem = atendimento && atendimento.numeroOs ? atendimento.numeroOs : "";
            const osTecnicoItem = atendimento && atendimento.osTecnico ? atendimento.osTecnico : "N/A";
            const osDataItem = atendimento && atendimento.osDataRealizada ? atendimento.osDataRealizada : "N/A";
            const osDescricaoItem = atendimento && atendimento.osDescricaoFechamento ? atendimento.osDescricaoFechamento : "N/A";
            const osEncontrada = Boolean(atendimento && atendimento.osEncontrada);
            const blocoOs = numeroOsItem
                ? `<div class="recorrente-attendance-list__os">
                    <span class="recorrente-attendance-list__os-title">OS N${String.fromCharCode(186)} ${escaparHtml(numeroOsItem)}${osEncontrada ? "" : " (nao encontrada no arquivo OS)"}</span>
                    <span><strong>Tecnico:</strong> ${escaparHtml(osTecnicoItem)}</span>
                    <span><strong>Data Realizada:</strong> ${escaparHtml(osDataItem)}</span>
                    <span><strong>Descricao OS:</strong> ${escaparHtml(osDescricaoItem)}</span>
                </div>`
                : "";
            return `<li class="recorrente-attendance-list__item">
                <span class="recorrente-attendance-list__index">#${idx + 1}</span>
                <span><strong>Data:</strong> ${escaparHtml(dataItem)}</span>
                <span><strong>Tipo:</strong> ${escaparHtml(tipoItem)}</span>
                <span><strong>Usuário:</strong> ${escaparHtml(usuarioItem)}</span>
                <span><strong>Descrição Abertura:</strong> ${escaparHtml(descAbItem)}</span>
                <span><strong>Descrição Fechamento:</strong> ${escaparHtml(descFechItem)}</span>
                ${blocoOs}
            </li>`;
        }).join("")
        : '<li class="recorrente-attendance-list__empty">Nenhum atendimento detalhado disponível.</li>';

    const pagina = document.createElement("div");
    pagina.className = "recorrente-pagina-cliente";
    pagina.innerHTML = `
        <div class="recorrente-pagina-header">
            <div class="recorrente-pagina-info-cliente">
                <h3 class="recorrente-pagina-nome" title="${escaparHtml(item.cliente)}">${escaparHtml(item.cliente)}</h3>
                <span class="recorrente-pagina-badge">Plano: ${escaparHtml(item.plano)}</span>
                <span class="recorrente-pagina-badge recorrente-pagina-badge--warn">${escaparHtml(String(item.quantidade))} atendimento(s)</span>
            </div>
            <div class="recorrente-pagina-meta">
                <span><strong>Primeiro Atendimento:</strong> ${escaparHtml(dataAberturaFormatada)}</span>
                <span><strong>Tipos:</strong> ${escaparHtml(tipos)}</span>
                <span><strong>Usuários:</strong> ${escaparHtml(usuarios)}</span>
            </div>
        </div>
        <div class="recorrente-attendance-list-wrap">
            <h4 class="recorrente-attendance-list__title">Histórico de Atendimentos (${atendimentos.length})</h4>
            <ul class="recorrente-attendance-list">${atendimentosHtml}</ul>
        </div>`;
    container.appendChild(pagina);

    // Controles de paginação
    const controle = document.createElement("div");
    controle.className = "recorrente-paginacao-controle";
    controle.innerHTML = `
        <button class="recorrente-pag-btn" id="recPagAnterior" ${indice === 0 ? "disabled" : ""}>&#8592; Anterior</button>
        <span class="recorrente-pag-indicador">Cliente ${indice + 1} de ${lista.length}</span>
        <button class="recorrente-pag-btn" id="recPagProximo" ${indice >= lista.length - 1 ? "disabled" : ""}>Próximo &#8594;</button>`;
    container.appendChild(controle);

    controle.querySelector("#recPagAnterior").addEventListener("click", () => {
        if (recorrentesPaginaAtual > 0) {
            recorrentesPaginaAtual--;
            renderizarPaginaClienteRecorrente(recorrentesListaPaginada, recorrentesPaginaAtual);
        }
    });
    controle.querySelector("#recPagProximo").addEventListener("click", () => {
        if (recorrentesPaginaAtual < lista.length - 1) {
            recorrentesPaginaAtual++;
            renderizarPaginaClienteRecorrente(recorrentesListaPaginada, recorrentesPaginaAtual);
        }
    });
}

function montarTabelaRecorrentes(recorrentes) {
    recorrentesListaPaginada = obterRecorrentesFiltradosEOrdenados(recorrentes);
    recorrentesPaginaAtual = 0;
    renderizarPaginaClienteRecorrente(recorrentesListaPaginada, recorrentesPaginaAtual);
}

function montarResumoRecorrentes(recorrentes) {
    if (!recorrenteSummaryElement) {
        return;
    }

    if (!recorrentes || recorrentes.length === 0) {
        recorrenteSummaryElement.innerHTML = "";
        return;
    }

    const top = recorrentes[0];
    const totalAtendimentosRecorrentes = recorrentes.reduce((acumulado, item) => acumulado + item.quantidade, 0);

    recorrenteSummaryElement.innerHTML = `
        <div class="bairro-summary__cards">
            <div class="bairro-summary__card bairro-summary__card--highlight">
                <span class="bairro-summary__label">Cliente Mais Recorrente</span>
                <span class="bairro-summary__value" title="${escaparHtml(top.cliente)}">${escaparHtml(top.cliente)}</span>
                <span class="bairro-summary__sub">Plano ${escaparHtml(top.plano)} · ${top.quantidade} atendimento(s)</span>
            </div>
            <div class="bairro-summary__card">
                <span class="bairro-summary__label">Clientes Recorrentes</span>
                <span class="bairro-summary__value">${recorrentes.length}</span>
                <span class="bairro-summary__sub">com mais de 2 atendimentos por plano</span>
            </div>
            <div class="bairro-summary__card">
                <span class="bairro-summary__label">Atendimentos Recorrentes</span>
                <span class="bairro-summary__value">${totalAtendimentosRecorrentes}</span>
                <span class="bairro-summary__sub">somatorio das combinacoes cliente + plano</span>
            </div>
        </div>`;
}

function montarRecorrentesChart(recorrentes) {
    if (!recorrenteCanvas) return;
    if (recorrentesChart) { recorrentesChart.destroy(); recorrentesChart = null; }

    if (!recorrentes || recorrentes.length === 0) return;
    const tema = obterTemaGrafico();

    const dados = recorrentes.slice(0, 10);

    recorrentesChart = new Chart(recorrenteCanvas, {
        type: "bar",
        data: {
            labels: dados.map((item) => {
                const clienteCurto = item.cliente.length > 30 ? `${item.cliente.slice(0, 30)}...` : item.cliente;
                return `${clienteCurto} | Plano ${item.plano}`;
            }),
            datasets: [{
                label: "Qtde de atendimentos",
                data: dados.map((item) => item.quantidade),
                backgroundColor: CHART_PALETTE.warn,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            const item = dados[items[0].dataIndex];
                            return `${item.cliente} | Plano ${item.plano}`;
                        }
                    }
                },
                datalabels: {
                    anchor: "end",
                    align: "end",
                    color: tema.text,
                    font: { size: 11, weight: "bold" },
                    formatter: (v) => v
                }
            },
            scales: {
                x: { beginAtZero: true, grid: { color: tema.grid }, ticks: { color: tema.text } },
                y: { grid: { display: false }, ticks: { color: tema.text, font: { size: 10 } } }
            }
        },
        plugins: [window.ChartDataLabels].filter(Boolean)
    });
}

function atualizarDashboardRecorrentes(registros) {
    const recorrentes = obterClientesRecorrentes(registros);
    const temCamposBase = (registros || []).some((r) => {
        const cliente = String((r && r.nomeCliente) || "").trim();
        const plano = String((r && r.numeroPlano) || "").trim();
        return Boolean(cliente && plano && cliente !== "-" && plano !== "-");
    });

    recorrentesTabelaBase = recorrentes.slice();
    montarResumoRecorrentes(recorrentes);
    montarRecorrentesChart(recorrentes);
    montarTabelaRecorrentes(recorrentesTabelaBase);

    if (recorrenteStatusElement) {
        if (!temCamposBase) {
            recorrenteStatusElement.textContent = "Mapeie nome_razaosocial e numero_plano para calcular recorrencia.";
        } else if (recorrentes.length === 0) {
            recorrenteStatusElement.textContent = "Nenhum cliente recorrente encontrado com a regra atual (>2 atendimentos no mesmo plano).";
        } else {
            const avisoOs = osRegistrosImportados.length === 0
                ? " Atencao: nenhum arquivo OS importado no campo \"Arquivo OS\" desta aba (Curva de Atendimentos por Mes) - por isso as OS do historico aparecem como \"nao encontrada no arquivo OS\". A importacao feita na aba Ordens de Servico nao alimenta esta tabela."
                : "";
            recorrenteStatusElement.textContent = `${recorrentes.length} cliente(s) recorrente(s) encontrado(s) com mais de 2 atendimentos no mesmo plano.${avisoOs}`;
        }
    }
}

function obterMatrizCidadeMes(registros) {
    const mapaMes = new Map();
    const mapaCidades = new Map();

    (registros || []).forEach((registro) => {
        const cidade = String((registro && registro.cidade) || "").trim();
        const mes = formatarMesReferencia(String((registro && registro.mes) || ""));

        if (!cidade || cidade === "-" || !mes) {
            return;
        }

        const chaveCidade = normalizarTextoBusca(cidade);
        const chaveMes = normalizarTextoBusca(mes);
        const chaveComposta = `${chaveCidade}::${chaveMes}`;

        mapaMes.set(chaveMes, mes);

        if (!mapaCidades.has(chaveCidade)) {
            mapaCidades.set(chaveCidade, {
                cidade,
                total: 0,
                meses: {}
            });
        }

        const itemCidade = mapaCidades.get(chaveCidade);
        itemCidade.total += 1;
        itemCidade.meses[chaveComposta] = (itemCidade.meses[chaveComposta] || 0) + 1;
    });

    const meses = Array.from(mapaMes.values()).sort((mesA, mesB) => {
        const numeroA = obterNumeroMes(mesA) || 13;
        const numeroB = obterNumeroMes(mesB) || 13;

        if (numeroA !== numeroB) {
            return numeroA - numeroB;
        }

        return normalizarTextoBusca(mesA).localeCompare(normalizarTextoBusca(mesB), "pt-BR");
    });

    const cidades = Array.from(mapaCidades.values())
        .sort((cidadeA, cidadeB) => cidadeB.total - cidadeA.total)
        .slice(0, 12);

    let maximo = 0;
    cidades.forEach((cidadeItem) => {
        meses.forEach((mes) => {
            const chave = `${normalizarTextoBusca(cidadeItem.cidade)}::${normalizarTextoBusca(mes)}`;
            const valor = Number(cidadeItem.meses[chave]) || 0;

            if (valor > maximo) {
                maximo = valor;
            }
        });
    });

    return {
        meses,
        cidades,
        maximo
    };
}

function montarCidadeHeatmap(registros) {
    if (!cidadeHeatmapElement) {
        return;
    }

    const matriz = obterMatrizCidadeMes(registros);

    if (!matriz.cidades.length || !matriz.meses.length) {
        cidadeHeatmapElement.innerHTML = '<p class="cidade-heatmap__empty">Mapeie a coluna cidade e importe registros com mes para visualizar o mapa de calor.</p>';
        return;
    }

    const cabecalho = matriz.meses.map((mes) => `<th>${escaparHtml(obterRotuloMesEixo(mes))}</th>`).join("");

    const linhas = matriz.cidades.map((cidadeItem) => {
        const linhaMeses = matriz.meses.map((mes) => {
            const chave = `${normalizarTextoBusca(cidadeItem.cidade)}::${normalizarTextoBusca(mes)}`;
            const valor = Number(cidadeItem.meses[chave]) || 0;
            const intensidade = matriz.maximo > 0 ? (valor / matriz.maximo) : 0;
            const alpha = (0.12 + (intensidade * 0.75)).toFixed(3);
            return `<td class="cidade-heatmap__cell" style="background-color: rgba(14, 165, 233, ${alpha});">${valor > 0 ? valor : ""}</td>`;
        }).join("");

        return `<tr><th>${escaparHtml(cidadeItem.cidade)}</th>${linhaMeses}<td class="cidade-heatmap__total">${cidadeItem.total}</td></tr>`;
    }).join("");

    cidadeHeatmapElement.innerHTML = `
        <div class="cidade-heatmap__table-wrap">
            <table class="cidade-heatmap__table" aria-label="Mapa de calor de atendimentos por cidade e mes">
                <thead>
                    <tr>
                        <th>Cidade</th>
                        ${cabecalho}
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhas}
                </tbody>
            </table>
        </div>`;
}

function atualizarDashboardsServicoECidade(registros) {
    montarPlanoServicoChart(registros);
    montarCidadeChart(registros);
    montarBairroChart(registros);
    montarResumoBairro(registros);
    montarCidadeHeatmap(registros);

    const temCidade = (registros || []).some((r) => r && r.cidade && String(r.cidade).trim() && String(r.cidade).trim() !== "-");
    const temBairro = (registros || []).some((r) => r && r.bairro && String(r.bairro).trim() && String(r.bairro).trim() !== "-");

    if (planoServicoStatusElement) {
        const resumoPlanos = obterResumoPlanoPorServico(registros);
        planoServicoStatusElement.textContent = resumoPlanos.totalPlanos > 0
            ? `${resumoPlanos.totalAtendimentos} atendimento(s) em ${resumoPlanos.totalPlanos} nome(s) de plano na coluna servico.`
            : "Mapeie a coluna servico para ver este dashboard.";
    }

    if (cidadeStatusElement) {
        cidadeStatusElement.textContent = temCidade
            ? "Distribuicao dos atendimentos por cidade."
            : "Mapeie a coluna cidade para ver este dashboard.";
    }

    if (bairroStatusElement) {
        bairroStatusElement.textContent = temBairro
            ? "Distribuicao dos atendimentos por bairro."
            : "Mapeie a coluna bairro para ver este dashboard.";
    }

    if (cidadeHeatmapStatusElement) {
        cidadeHeatmapStatusElement.textContent = temCidade
            ? "Intensidade de atendimentos por cidade ao longo dos meses."
            : "Mapeie a coluna cidade para habilitar o mapa de calor.";
    }

    atualizarDashboardRecorrentes(registros);
}

function classificarStatusAtendimento(registro) {
    const fonteStatus = (registro && registro.status) || (registro && registro.resolucao) || "";
    const texto = normalizarTextoBusca(fonteStatus)
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!texto) {
        return "pendente";
    }

    // Prioriza aguardando analise para evitar conflitos com textos mistos.
    if (/(aguard|analise|analis|triagem)/.test(texto)) {
        return "aguardando_analise";
    }

    if (/(pend|abert|andament|retorno)/.test(texto)) {
        return "pendente";
    }

    // Frases de negacao de conclusao devem permanecer como pendente.
    if (/(sem\s+conclu|nao\s+conclu|sem\s+resol|nao\s+resol)/.test(texto)) {
        return "pendente";
    }

    if (/\b(resolvido|concluido|finalizado|fechado|encerrado|concluso)\b/.test(texto)) {
        return "resolvido";
    }

    return "pendente";
}

function obterResumoStatusAtendimentos(registros) {
    const resumo = {
        resolvido: 0,
        aguardando_analise: 0,
        pendente: 0,
        total: 0
    };

    (registros || []).forEach((registro) => {
        const quantidade = Number(registro && registro.quantidade);
        const incremento = Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 1;
        const status = classificarStatusAtendimento(registro);

        resumo[status] += incremento;
        resumo.total += incremento;
    });

    return resumo;
}

function montarCardsStatusAtendimentos(resumo) {
    if (!atendimentoStatusCardsElement) {
        return;
    }

    if (!resumo || !resumo.total) {
        atendimentoStatusCardsElement.innerHTML = "";
        return;
    }

    atendimentoStatusCardsElement.innerHTML = `
        <div class="status-card status-card--resolved"><span class="status-card__label">Resolvidos</span><span class="status-card__value">${Math.round(resumo.resolvido)}</span></div>
        <div class="status-card status-card--analysis"><span class="status-card__label">Aguardando Analise</span><span class="status-card__value">${Math.round(resumo.aguardando_analise)}</span></div>
        <div class="status-card status-card--pending"><span class="status-card__label">Pendentes</span><span class="status-card__value">${Math.round(resumo.pendente)}</span></div>
    `;
}

function montarStatusAtendimentosChart(resumo) {
    if (!atendimentoStatusCanvas) {
        return;
    }

    if (atendimentoStatusChart) {
        atendimentoStatusChart.destroy();
        atendimentoStatusChart = null;
    }

    if (!resumo || !resumo.total) {
        return;
    }

    const labels = ["Resolvidos", "Aguardando Analise", "Pendentes"];
    const valores = [resumo.resolvido, resumo.aguardando_analise, resumo.pendente];
    const tema = obterTemaGrafico();
    const corTexto = tema.dark ? "#e2e8f0" : "#111827";

    atendimentoStatusChart = new Chart(atendimentoStatusCanvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Atendimentos",
                data: valores,
                backgroundColor: [CHART_PALETTE.resolved, CHART_PALETTE.info, CHART_PALETTE.warn],
                borderRadius: 10,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    color: corTexto,
                    anchor: "end",
                    align: "end",
                    font: { weight: "700", size: 11 },
                    formatter: (valor) => Number(valor) || 0
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: corTexto }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: corTexto },
                    grid: { color: tema.grid }
                }
            }
        },
        plugins: [window.ChartDataLabels].filter(Boolean)
    });
}

function formatarTempoDesdeAbertura(dataAbertura) {
    const data = parsarDataRegistro(dataAbertura);

    if (!data) {
        return "N/A";
    }

    const diffMs = Date.now() - data.getTime();

    if (!Number.isFinite(diffMs) || diffMs < 0) {
        return "N/A";
    }

    const horasTotais = Math.floor(diffMs / 3600000);
    const dias = Math.floor(horasTotais / 24);
    const horas = horasTotais % 24;

    if (dias > 0) {
        return `${dias}d ${horas}h`;
    }

    return `${horas}h`;
}

function obterHorasDesdeAbertura(dataAbertura) {
    const data = parsarDataRegistro(dataAbertura);

    if (!data) {
        return null;
    }

    const diffMs = Date.now() - data.getTime();

    if (!Number.isFinite(diffMs) || diffMs < 0) {
        return null;
    }

    return diffMs / 3600000;
}

function montarListaStatusAbertos(registros) {
    const el = document.getElementById("statusAbertosLista");

    if (!el) {
        statusAbertosCache = { aguardando: [], pendentes: [] };
        return;
    }

    const base = (registros || []).map((registro) => {
        return {
            registro: registro,
            status: classificarStatusAtendimento(registro)
        };
    }).filter((item) => item.status === "aguardando_analise" || item.status === "pendente");

    if (base.length === 0) {
        el.innerHTML = '<p class="status-abertos__vazio">Nenhum atendimento aguardando analise ou pendente.</p>';
        statusAbertosCache = { aguardando: [], pendentes: [] };
        return;
    }

    const aguardando = base.filter((item) => item.status === "aguardando_analise");
    const pendentes = base.filter((item) => item.status === "pendente");

    aguardando.sort((itemA, itemB) => {
        const tempoA = parsarDataRegistro(itemA.registro && itemA.registro.dataAbertura);
        const tempoB = parsarDataRegistro(itemB.registro && itemB.registro.dataAbertura);

        const diffA = tempoA ? Date.now() - tempoA.getTime() : -1;
        const diffB = tempoB ? Date.now() - tempoB.getTime() : -1;

        return diffB - diffA;
    });

    pendentes.sort((itemA, itemB) => {
        const tempoA = parsarDataRegistro(itemA.registro && itemA.registro.dataAbertura);
        const tempoB = parsarDataRegistro(itemB.registro && itemB.registro.dataAbertura);

        const diffA = tempoA ? Date.now() - tempoA.getTime() : -1;
        const diffB = tempoB ? Date.now() - tempoB.getTime() : -1;

        return diffB - diffA;
    });

    statusAbertosCache = {
        aguardando: aguardando.slice(),
        pendentes: pendentes.slice()
    };

    const criarItem = (item) => {
        const r = item.registro || {};
        const nome = String(r.nomeCliente || "").trim() || "—";
        const codigo = String(r.codigoCliente || "").trim() || "N/A";
        const usuarioAbertura = String(r.usuarioAbertura || "").trim() || "N/A";
        const tipoAtendimento = String(r.tipoAtendimento || "").trim() || "N/A";
        const horasDesdeAbertura = obterHorasDesdeAbertura(r.dataAbertura);
        const tempoDesdeAbertura = formatarTempoDesdeAbertura(r.dataAbertura);

        let tempoClasse = "status-abertos-item__tempo--ok";
        let tempoEtiqueta = "No prazo";

        if (horasDesdeAbertura === null) {
            tempoClasse = "status-abertos-item__tempo--unknown";
            tempoEtiqueta = "Sem data";
        } else if (horasDesdeAbertura > 72) {
            tempoClasse = "status-abertos-item__tempo--critical";
            tempoEtiqueta = "Critico";
        } else if (horasDesdeAbertura > 24) {
            tempoClasse = "status-abertos-item__tempo--warn";
            tempoEtiqueta = "Atencao";
        }

        return `<article class="status-abertos-item status-abertos-item--${item.status}">
            <div class="status-abertos-item__top">
                <span class="status-abertos-item__nome" title="${escaparHtml(nome)}">${escaparHtml(nome)}</span>
                <span class="status-abertos-item__badge status-abertos-item__badge--${item.status}">${item.status === "aguardando_analise" ? "Aguardando analise" : "Pendente"}</span>
            </div>
            <div class="status-abertos-item__meta">Codigo: #${escaparHtml(codigo)}</div>
            <div class="status-abertos-item__meta">Abertura por: ${escaparHtml(usuarioAbertura)}</div>
            <div class="status-abertos-item__meta">Tipo atendimento: ${escaparHtml(tipoAtendimento)}</div>
            <div class="status-abertos-item__tempo ${tempoClasse}">Tempo desde abertura: ${escaparHtml(tempoDesdeAbertura)} · ${escaparHtml(tempoEtiqueta)}</div>
        </article>`;
    };

    const htmlAguardando = aguardando.length > 0
        ? aguardando.map(criarItem).join("")
        : '<p class="status-abertos__vazio">Nenhum atendimento aguardando analise.</p>';

    const htmlPendentes = pendentes.length > 0
        ? pendentes.map(criarItem).join("")
        : '<p class="status-abertos__vazio">Nenhum atendimento pendente.</p>';

    el.innerHTML = `
        <section class="status-abertos-grupo status-abertos-grupo--analise" aria-label="Atendimentos aguardando analise">
            <header class="status-abertos-grupo__header">
                <h4 class="status-abertos-grupo__titulo"><span>Aguardando Analise</span><span class="status-abertos-grupo__count">${aguardando.length}</span></h4>
                <button id="exportAguardandoPdfBtn" class="status-abertos-export-btn" type="button" title="Exportar PDF de Aguardando Analise" data-status-export="aguardando_analise">PDF</button>
            </header>
            <div class="status-abertos-grupo__lista">${htmlAguardando}</div>
        </section>
        <section class="status-abertos-grupo status-abertos-grupo--pendente" aria-label="Atendimentos pendentes">
            <header class="status-abertos-grupo__header">
                <h4 class="status-abertos-grupo__titulo"><span>Pendentes</span><span class="status-abertos-grupo__count">${pendentes.length}</span></h4>
                <button id="exportPendentesPdfBtn" class="status-abertos-export-btn" type="button" title="Exportar PDF de Pendentes" data-status-export="pendente">PDF</button>
            </header>
            <div class="status-abertos-grupo__lista">${htmlPendentes}</div>
        </section>`;
}

// ─── Aba Atendimentos: OS aguardando reagendamento e finalizados ─────────

function normalizarStatusOsTexto(status) {
    return normalizarTextoBusca(String(status || ""))
        .replace(/[_\-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function obterOsAssociadaAoRegistro(registro) {
    if (!registro) {
        return null;
    }

    const protocolo = normalizarProtocoloAtendimento(registro.protocoloAtendimento);

    if (protocolo) {
        const registroPorProtocolo = osRegistrosPorProtocolo.get(protocolo);

        if (registroPorProtocolo) {
            return { numeroOs: registroPorProtocolo.numeroOs, registro: registroPorProtocolo };
        }
    }

    if (registro.numeroOs) {
        const numeroDireto = normalizarNumeroOs(registro.numeroOs);
        const registroDireto = numeroDireto ? osRegistrosPorNumero.get(numeroDireto) : null;

        if (registroDireto) {
            return { numeroOs: numeroDireto, registro: registroDireto };
        }
    }

    const descricaoFechamento = String(registro.descricaoFechamento || registro.descricao_fechamento || "");

    return obterOsPorDescricaoFechamento(descricaoFechamento);
}

function obterAtendimentosAguardandoReagendamento(registros) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const itens = [];

    (registros || []).forEach((registro) => {
        const osInfo = obterOsAssociadaAoRegistro(registro);

        if (!osInfo || !osInfo.registro) {
            return;
        }

        const osRegistro = osInfo.registro;
        const statusNormalizado = normalizarStatusOsTexto(osRegistro.statusOs);

        if (statusNormalizado !== "aguardando agendamento") {
            return;
        }

        const dataProgramada = parsarDataRegistro(osRegistro.dataInicioProgramado);

        if (!dataProgramada || dataProgramada >= hoje) {
            return;
        }

        itens.push({
            registro,
            osRegistro,
            numeroOs: osInfo.numeroOs,
            dataProgramada
        });
    });

    itens.sort((itemA, itemB) => itemA.dataProgramada - itemB.dataProgramada);

    return itens;
}

function obterAtendimentosFinalizados(registros) {
    const itens = [];

    (registros || []).forEach((registro) => {
        if (classificarStatusAtendimento(registro) !== "resolvido") {
            return;
        }

        const osInfo = obterOsAssociadaAoRegistro(registro);

        itens.push({
            registro,
            osRegistro: osInfo ? osInfo.registro : null,
            numeroOs: osInfo ? osInfo.numeroOs : ""
        });
    });

    itens.sort((itemA, itemB) => {
        const dataA = parsarDataRegistro(itemA.registro && (itemA.registro.dataFechamento || itemA.registro.dataAbertura));
        const dataB = parsarDataRegistro(itemB.registro && (itemB.registro.dataFechamento || itemB.registro.dataAbertura));

        const tempoA = dataA ? dataA.getTime() : 0;
        const tempoB = dataB ? dataB.getTime() : 0;

        return tempoB - tempoA;
    });

    return itens;
}

function montarListaReagendamentoOs(registros) {
    const el = document.getElementById("reagendamentoLista");
    const statusEl = document.getElementById("reagendamentoStatus");

    if (!el) {
        atendimentosGeraisCache.reagendamento = [];
        return;
    }

    const itens = obterAtendimentosAguardandoReagendamento(registros);
    atendimentosGeraisCache.reagendamento = itens.slice();

    if (statusEl) {
        statusEl.textContent = itens.length > 0
            ? `${itens.length} atendimento(s) com OS agendada antes de hoje e ainda aguardando reagendamento.`
            : "Nenhum atendimento com OS aguardando reagendamento no momento.";
    }

    if (itens.length === 0) {
        el.innerHTML = '<p class="status-abertos__vazio">Nenhum atendimento com OS aguardando reagendamento.</p>';
        return;
    }

    el.innerHTML = itens.map((item) => {
        const r = item.registro || {};
        const nome = String(r.nomeCliente || "").trim() || "—";
        const codigo = String(r.codigoCliente || "").trim() || "N/A";
        const usuarioAbertura = String(r.usuarioAbertura || "").trim() || "N/A";
        const tipoAtendimento = String(r.tipoAtendimento || "").trim() || "N/A";
        const dataAbertura = String(r.dataAbertura || "").trim() || "N/A";
        const numeroOs = String(item.numeroOs || "").trim() || "N/A";
        const dataProgramadaTexto = formatarDataBR(item.dataProgramada);
        const diasAtraso = Math.floor((new Date().setHours(0, 0, 0, 0) - item.dataProgramada.getTime()) / 86400000);

        return `<article class="status-abertos-item status-abertos-item--reagendamento">
            <div class="status-abertos-item__top">
                <span class="status-abertos-item__nome" title="${escaparHtml(nome)}">${escaparHtml(nome)}</span>
                <span class="status-abertos-item__badge status-abertos-item__badge--reagendamento">Aguardando reagendamento</span>
            </div>
            <div class="status-abertos-item__meta">Codigo cliente: #${escaparHtml(codigo)}</div>
            <div class="status-abertos-item__meta">Atendimento aberto em: ${escaparHtml(dataAbertura)} · por ${escaparHtml(usuarioAbertura)}</div>
            <div class="status-abertos-item__meta">Tipo atendimento: ${escaparHtml(tipoAtendimento)}</div>
            <div class="status-abertos-item__meta">Ordem de servico: #${escaparHtml(numeroOs)}</div>
            <div class="status-abertos-item__tempo status-abertos-item__tempo--critical">Agendada para ${escaparHtml(dataProgramadaTexto)} · ${diasAtraso} dia(s) em atraso</div>
        </article>`;
    }).join("");
}

function montarListaAtendimentosFinalizados(registros) {
    const el = document.getElementById("atendimentosFinalizadosLista");
    const statusEl = document.getElementById("atendimentosFinalizadosStatus");

    if (!el) {
        atendimentosGeraisCache.finalizados = [];
        return;
    }

    const itens = obterAtendimentosFinalizados(registros);
    atendimentosGeraisCache.finalizados = itens.slice();

    if (statusEl) {
        statusEl.textContent = itens.length > 0
            ? `${itens.length} atendimento(s) finalizado(s).`
            : "Nenhum atendimento finalizado encontrado.";
    }

    if (itens.length === 0) {
        el.innerHTML = '<p class="status-abertos__vazio">Nenhum atendimento finalizado.</p>';
        return;
    }

    el.innerHTML = itens.map((item) => {
        const r = item.registro || {};
        const nome = String(r.nomeCliente || "").trim() || "—";
        const codigo = String(r.codigoCliente || "").trim() || "N/A";
        const dataFechamento = String(r.dataFechamento || "").trim() || "N/A";
        const descricaoFechamento = String(r.descricaoFechamento || "").trim() || "N/A";
        const numeroOs = String(item.numeroOs || "").trim();
        const osDescricaoFechamento = item.osRegistro ? String(item.osRegistro.descricaoFechamento || "").trim() : "";

        const blocoOs = numeroOs && item.osRegistro
            ? `<div class="status-abertos-item__meta">Ordem de servico #${escaparHtml(numeroOs)} — finalizacao: ${escaparHtml(osDescricaoFechamento || "N/A")}</div>`
            : `<div class="status-abertos-item__meta">Sem ordem de servico vinculada.</div>`;

        return `<article class="status-abertos-item status-abertos-item--finalizado">
            <div class="status-abertos-item__top">
                <span class="status-abertos-item__nome" title="${escaparHtml(nome)}">${escaparHtml(nome)}</span>
                <span class="status-abertos-item__badge status-abertos-item__badge--finalizado">Finalizado</span>
            </div>
            <div class="status-abertos-item__meta">Codigo cliente: #${escaparHtml(codigo)}</div>
            <div class="status-abertos-item__meta">Fechado em: ${escaparHtml(dataFechamento)}</div>
            <div class="status-abertos-item__meta">Descricao da finalizacao: ${escaparHtml(descricaoFechamento)}</div>
            ${blocoOs}
        </article>`;
    }).join("");
}

function atualizarPainelAbaAtendimentos(registros) {
    montarListaReagendamentoOs(registros);
    montarListaAtendimentosFinalizados(registros);
}

// ─── Produtividade por Atendente ──────────────────────────────────────────

function obterProdutividadePorAtendente(registros) {
    const mapa = new Map();

    (registros || []).forEach((r) => {
        const nome = String(r.usuarioFechamento || r.usuario || "").trim();
        if (!nome || nome === "-") return;

        const sla = calcularSlaHoras(r);

        if (!mapa.has(nome)) {
            mapa.set(nome, { nome, volume: 0, slas: [] });
        }

        const entrada = mapa.get(nome);
        entrada.volume += 1;
        if (sla !== null) entrada.slas.push(sla);
    });

    return Array.from(mapa.values())
        .map((entrada) => ({
            nome: entrada.nome,
            volume: entrada.volume,
            slaMedia: entrada.slas.length > 0
                ? entrada.slas.reduce((a, b) => a + b, 0) / entrada.slas.length
                : null,
            slaTotal: entrada.slas.length
        }))
        .sort((a, b) => b.volume - a.volume);
}

function primeiroNome(nomeCompleto) {
    const partes = String(nomeCompleto || "").trim().split(/\s+/);
    if (partes.length <= 2) return nomeCompleto;
    return partes[0] + " " + partes[1];
}

function montarProdutividadeSummary(atendentes) {
    const el = document.getElementById("produtividadeSummary");
    if (!el) return;
    if (!atendentes || atendentes.length === 0) { el.innerHTML = ""; return; }

    const maior = atendentes[0];
    const comSla = atendentes.filter((a) => a.slaMedia !== null);
    const maisRapido = comSla.length > 0 ? comSla.slice().sort((a, b) => a.slaMedia - b.slaMedia)[0] : null;
    const maisLento = comSla.length > 0 ? comSla.slice().sort((a, b) => b.slaMedia - a.slaMedia)[0] : null;
    const mediaGeral = comSla.length > 0
        ? comSla.reduce((s, a) => s + a.slaMedia, 0) / comSla.length
        : null;

    el.innerHTML = `<div class="produtividade-cards">
        <div class="produtividade-card produtividade-card--destaque">
            <span class="produtividade-card__label">Maior volume</span>
            <span class="produtividade-card__nome" title="${maior.nome}">${primeiroNome(maior.nome)}</span>
            <span class="produtividade-card__valor">${maior.volume}</span>
            <span class="produtividade-card__sub">atendimentos</span>
        </div>
        ${maisRapido ? `<div class="produtividade-card produtividade-card--rapido">
            <span class="produtividade-card__label">SLA mais rapido</span>
            <span class="produtividade-card__nome" title="${maisRapido.nome}">${primeiroNome(maisRapido.nome)}</span>
            <span class="produtividade-card__valor">${formatarHoras(maisRapido.slaMedia)}</span>
            <span class="produtividade-card__sub">media</span>
        </div>` : ""}
        ${maisLento ? `<div class="produtividade-card produtividade-card--lento">
            <span class="produtividade-card__label">SLA mais lento</span>
            <span class="produtividade-card__nome" title="${maisLento.nome}">${primeiroNome(maisLento.nome)}</span>
            <span class="produtividade-card__valor">${formatarHoras(maisLento.slaMedia)}</span>
            <span class="produtividade-card__sub">media</span>
        </div>` : ""}
        ${mediaGeral !== null ? `<div class="produtividade-card">
            <span class="produtividade-card__label">SLA geral da equipe</span>
            <span class="produtividade-card__valor">${formatarHoras(mediaGeral)}</span>
            <span class="produtividade-card__sub">${comSla.length} atendente(s) com dado</span>
        </div>` : ""}
    </div>`;
}

function montarProdutividadeChart(atendentes) {
    const canvas = document.getElementById("produtividadeChart");
    if (!canvas) return;
    if (produtividadeChart) { produtividadeChart.destroy(); produtividadeChart = null; }
    if (!atendentes || atendentes.length === 0) return;

    const labels = atendentes.map((a) => primeiroNome(a.nome));
    const volumes = atendentes.map((a) => a.volume);
    const tema = obterTemaGrafico();

    produtividadeChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Atendimentos fechados",
                data: volumes,
                backgroundColor: atendentes.map((_, i) =>
                    i === 0 ? CHART_PALETTE.orange : CHART_PALETTE.teal
                ),
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
                tooltip: {
                    callbacks: {
                        title: (items) => atendentes[items[0].dataIndex].nome
                    }
                },
                datalabels: {
                    anchor: "end",
                    align: "end",
                    color: tema.text,
                    font: { size: 11, weight: "bold" },
                    formatter: (v) => v
                }
            },
            scales: {
                x: { grid: { color: tema.grid }, ticks: { color: tema.text, stepSize: 1 } },
                y: { grid: { display: false }, ticks: { color: tema.text, font: { size: 11 } } }
            }
        },
        plugins: [window.ChartDataLabels].filter(Boolean)
    });
}

function montarSlaAtendentesChart(atendentes) {
    const canvas = document.getElementById("slaAtendentesChart");
    if (!canvas) return;
    if (slaAtendentesChart) { slaAtendentesChart.destroy(); slaAtendentesChart = null; }

    const comSla = (atendentes || [])
        .filter((a) => a.slaMedia !== null)
        .sort((a, b) => a.slaMedia - b.slaMedia);

    if (comSla.length === 0) return;

    const mediaGeral = comSla.reduce((s, a) => s + a.slaMedia, 0) / comSla.length;
    const tema = obterTemaGrafico();

    slaAtendentesChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: comSla.map((a) => primeiroNome(a.nome)),
            datasets: [{
                label: "SLA medio (horas)",
                data: comSla.map((a) => Math.round(a.slaMedia)),
                backgroundColor: comSla.map((a) =>
                    a.slaMedia <= 24 ? CHART_PALETTE.emerald
                        : a.slaMedia <= 72 ? CHART_PALETTE.warn
                            : CHART_PALETTE.critical
                ),
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
                tooltip: {
                    callbacks: {
                        title: (items) => comSla[items[0].dataIndex].nome,
                        afterLabel: (item) => {
                            const a = comSla[item.dataIndex];
                            return `${a.slaTotal} registro(s) com SLA`;
                        }
                    }
                },
                datalabels: {
                    anchor: "end",
                    align: "end",
                    color: tema.text,
                    font: { size: 11 },
                    formatter: (v) => formatarHoras(v)
                },
                annotation: {}
            },
            scales: {
                x: {
                    grid: { color: tema.grid },
                    ticks: { color: tema.text, callback: (v) => formatarHoras(v) }
                },
                y: { grid: { display: false }, ticks: { color: tema.text, font: { size: 11 } } }
            }
        },
        plugins: [window.ChartDataLabels].filter(Boolean)
    });

    // linha de media da equipe desenhada como dataset extra
    slaAtendentesChart.data.datasets.push({
        label: "Media da equipe",
        data: comSla.map(() => Math.round(mediaGeral)),
        type: "line",
        borderColor: CHART_PALETTE.indigo,
        borderWidth: 1.5,
        borderDash: [5, 4],
        pointRadius: 0,
        datalabels: { display: false }
    });
    slaAtendentesChart.update();
}

function atualizarDashboardProdutividade(registros) {
    const atendentes = obterProdutividadePorAtendente(registros);
    const produtividadeStatusEl = document.getElementById("produtividadeStatus");
    const slaAtendentesStatusEl = document.getElementById("slaAtendentesStatus");

    montarProdutividadeSummary(atendentes);
    montarProdutividadeChart(atendentes);
    montarSlaAtendentesChart(atendentes);

    if (produtividadeStatusEl) {
        produtividadeStatusEl.textContent = atendentes.length > 0
            ? `${atendentes.length} atendente(s) encontrado(s). Ordenado por volume de fechamentos.`
            : "Mapeie a coluna usuario_fechamento para ver a produtividade.";
    }
    if (slaAtendentesStatusEl) {
        const comSla = atendentes.filter((a) => a.slaMedia !== null);
        slaAtendentesStatusEl.textContent = comSla.length > 0
            ? `SLA calculado para ${comSla.length} atendente(s). Verde ≤24h · Laranja ≤72h · Vermelho >72h.`
            : "Mapeie usuario_fechamento + datas para ver o SLA por atendente.";
    }
}

function obterModalidadeAtendimentoRegistro(registro) {
    const tipoTexto = normalizarTextoBusca(registro && registro.tipoAtendimento);

    if (/(extern|ordem\s*de\s*servico|\bos\b)/.test(tipoTexto)) {
        return { chave: "externo", rotulo: "Externo (com OS)" };
    }

    if (/(remot|intern)/.test(tipoTexto)) {
        return { chave: "remoto", rotulo: "Remoto" };
    }

    const quantidade = Number(registro && registro.quantidade);
    if (Number.isFinite(quantidade) && quantidade > 0) {
        return { chave: "externo", rotulo: "Externo (com OS)" };
    }

    return { chave: "remoto", rotulo: "Remoto" };
}

function montarClientesPendentesLista(registros) {
    const el = document.getElementById("clientesPendentesLista");
    if (!el) return;

    const atrasadosBase = (registros || []).map((registro) => {
        const horas = calcularSlaHoras(registro);

        if (horas === null || horas <= 24) {
            return null;
        }

        const modalidade = obterModalidadeAtendimentoRegistro(registro);

        return {
            registro: registro,
            horas: horas,
            faixa: horas <= 72 ? "24h - 72h" : "Acima de 72h",
            modalidadeChave: modalidade.chave
        };
    }).filter(Boolean).sort((itemA, itemB) => itemB.horas - itemA.horas);

    if (atrasadosBase.length === 0) {
        el.innerHTML = "<p class=\"clientes-pendentes__vazio\">Nenhum atendimento com SLA acima de 24h nos dados filtrados.</p>";
        return;
    }

    const filtroAtivo = ["todos", "externo", "remoto"].indexOf(filtroTipoAtraso) !== -1 ? filtroTipoAtraso : "todos";
    const atrasados = filtroAtivo === "todos"
        ? atrasadosBase
        : atrasadosBase.filter((item) => item.modalidadeChave === filtroAtivo);

    if (atrasados.length === 0) {
        el.innerHTML = `
            <div class="clientes-pendentes-filtros" role="group" aria-label="Filtrar por tipo de atendimento">
                <button type="button" class="clientes-pendentes-filtro-btn${filtroAtivo === "todos" ? " is-active" : ""}" data-tipo-atraso="todos" aria-pressed="${filtroAtivo === "todos" ? "true" : "false"}">Todos</button>
                <button type="button" class="clientes-pendentes-filtro-btn${filtroAtivo === "externo" ? " is-active" : ""}" data-tipo-atraso="externo" aria-pressed="${filtroAtivo === "externo" ? "true" : "false"}">Externo</button>
                <button type="button" class="clientes-pendentes-filtro-btn${filtroAtivo === "remoto" ? " is-active" : ""}" data-tipo-atraso="remoto" aria-pressed="${filtroAtivo === "remoto" ? "true" : "false"}">Remoto</button>
            </div>
            <p class="clientes-pendentes__vazio">Nenhum atendimento encontrado para o filtro selecionado.</p>`;
        return;
    }

    const limparTextoCard = (valor, fallback) => {
        const texto = String(valor == null ? "" : valor).replace(/\s+/g, " ").trim();
        return texto || String(fallback || "");
    };

    const criarCard = (item, indiceGrupo) => {
        const r = item.registro;
        const nome = limparTextoCard(r.nomeCliente, "—");
        const posicao = `${indiceGrupo + 1}º`;
        const codigoLimpo = limparTextoCard(r.codigoCliente, "");
        const aberturaLimpa = limparTextoCard(r.usuarioAbertura, "");
        const codigo = codigoLimpo ? `<span class="clientes-pendentes__codigo">Codigo: #${escaparHtml(codigoLimpo)}</span>` : "<span class=\"clientes-pendentes__codigo\">Codigo: N/A</span>";
        const usuarioAbertura = aberturaLimpa
            ? `<span class="clientes-pendentes__abertura">Abertura: ${escaparHtml(aberturaLimpa)}</span>`
            : "<span class=\"clientes-pendentes__abertura clientes-pendentes__abertura--vazio\">Abertura: N/A</span>";
        const tipo = limparTextoCard(r.tipoAtendimento, "Sem tipo");
        const modalidade = obterModalidadeAtendimentoRegistro(r);
        const clsFaixa = item.faixa === "24h - 72h" ? "alerta" : "critico";

        return `<div class="clientes-pendentes__item clientes-pendentes__item--sla-${clsFaixa}">
            <div class="clientes-pendentes__info">
                <div class="clientes-pendentes__nome-linha">
                    <span class="clientes-pendentes__rank">${escaparHtml(posicao)}</span>
                    <span class="clientes-pendentes__nome">${escaparHtml(nome)}</span>
                </div>
                ${codigo}
                ${usuarioAbertura}
            </div>
            <div class="clientes-pendentes__meta">
                <span class="clientes-pendentes__tipo">${escaparHtml(tipo)}</span>
                <span class="clientes-pendentes__status clientes-pendentes__status--sla-${clsFaixa}">${escaparHtml(item.faixa)} · ${escaparHtml(formatarHoras(item.horas))}</span>
                <span class="clientes-pendentes__modalidade clientes-pendentes__modalidade--${escaparHtml(modalidade.chave)}">${escaparHtml(modalidade.rotulo)}</span>
            </div>
        </div>`;
    };

    const grupo2472 = atrasados.filter((item) => item.horas <= 72);
    const grupo72mais = atrasados.filter((item) => item.horas > 72);

    const html2472 = grupo2472.length > 0
        ? grupo2472.map((item, indice) => criarCard(item, indice)).join("")
        : '<p class="clientes-pendentes__vazio">Nenhum atendimento nesta faixa.</p>';

    const html72mais = grupo72mais.length > 0
        ? grupo72mais.map((item, indice) => criarCard(item, indice)).join("")
        : '<p class="clientes-pendentes__vazio">Nenhum atendimento nesta faixa.</p>';

    el.innerHTML = `
        <div class="clientes-pendentes-filtros" role="group" aria-label="Filtrar por tipo de atendimento">
            <button type="button" class="clientes-pendentes-filtro-btn${filtroAtivo === "todos" ? " is-active" : ""}" data-tipo-atraso="todos" aria-pressed="${filtroAtivo === "todos" ? "true" : "false"}">Todos</button>
            <button type="button" class="clientes-pendentes-filtro-btn${filtroAtivo === "externo" ? " is-active" : ""}" data-tipo-atraso="externo" aria-pressed="${filtroAtivo === "externo" ? "true" : "false"}">Externo</button>
            <button type="button" class="clientes-pendentes-filtro-btn${filtroAtivo === "remoto" ? " is-active" : ""}" data-tipo-atraso="remoto" aria-pressed="${filtroAtivo === "remoto" ? "true" : "false"}">Remoto</button>
        </div>
        <div class="clientes-pendentes-grid">
            <section class="clientes-pendentes-grupo clientes-pendentes-grupo--alerta" aria-label="Atendimentos com SLA de 24h a 72h">
                <header class="clientes-pendentes-grupo__header">
                    <h4 class="clientes-pendentes-grupo__titulo"><span>24h - 72h</span><span class="clientes-pendentes-grupo__count">${grupo2472.length}</span></h4>
                </header>
                <div class="clientes-pendentes-grupo__lista">
                    ${html2472}
                </div>
            </section>
            <section class="clientes-pendentes-grupo clientes-pendentes-grupo--critico" aria-label="Atendimentos com SLA acima de 72h">
                <header class="clientes-pendentes-grupo__header">
                    <h4 class="clientes-pendentes-grupo__titulo"><span>Acima de 72h</span><span class="clientes-pendentes-grupo__count">${grupo72mais.length}</span></h4>
                </header>
                <div class="clientes-pendentes-grupo__lista">
                    ${html72mais}
                </div>
            </section>
        </div>`;
}

function atualizarDashboardsSlaEMotivo(registros) {
    // Aplica filtro de modalidade específico para os cálculos de SLA (todos / remoto / externo)
    const registrosSla = (filtroModalidadeSla === "todos")
        ? (registros || []).slice()
        : (registros || []).filter((registro) => {
            const modalidade = obterModalidadeAtendimentoRegistro(registro);
            return modalidade && modalidade.chave === filtroModalidadeSla;
        });

    const resumoSla = obterResumoSla(registrosSla);
    const resumoStatusAtendimentos = obterResumoStatusAtendimentos(registros);

    montarSlaSummary(resumoSla);
    montarSlaDistChart(resumoSla);
    montarSlaTipoChart(resumoSla);
    montarMotivoChart(registrosSla);
    atualizarKpiIncidenciaLentidao(registros);
    montarTipoChart(registrosSla);
    montarCardsStatusAtendimentos(resumoStatusAtendimentos);
    montarStatusAtendimentosChart(resumoStatusAtendimentos);
    montarListaStatusAbertos(registros);
    // Lista de clientes pendentes usa o subconjunto filtrado por modalidade SLA
    montarClientesPendentesLista(registrosSla);

    if (slaStatusElement) {
        const descricaoFiltro = filtroModalidadeSla === "todos"
            ? "todos os atendimentos"
            : (filtroModalidadeSla === "remoto" ? "somente remoto" : "somente externo");

        slaStatusElement.textContent = resumoSla
            ? `${resumoSla.total} registro(s) com SLA calculado (${descricaoFiltro}). Media: ${formatarHoras(resumoSla.media)} | Mediana: ${formatarHoras(resumoSla.mediana)}.`
            : `Mapeie as colunas data_abertura e data_fechamento para calcular o SLA (${descricaoFiltro}).`;
    }
    if (slaTipoStatusElement) {
        slaTipoStatusElement.textContent = resumoSla && resumoSla.mediaPorTipo.length > 0
            ? `Top ${resumoSla.mediaPorTipo.length} tipos por SLA medio.`
            : "Mapeie tipo_atendimento e as colunas de data para ver o SLA por tipo.";
    }
    const temMotivo = (registros || []).some((r) => r.motivoFechamento && r.motivoFechamento !== "-");
    if (motivoStatusElement) {
        motivoStatusElement.textContent = temMotivo
            ? `Distribuicao dos ${(registros || []).length} registro(s) por motivo de fechamento.`
            : "Mapeie a coluna motivo_fechamento para ver este grafico.";
    }
    const temTipo = (registros || []).some((r) => r.tipoAtendimento && r.tipoAtendimento !== "-");
    if (tipoStatusElement) {
        tipoStatusElement.textContent = temTipo
            ? `Distribuicao por tipo de atendimento.`
            : "Mapeie a coluna tipo_atendimento para ver este grafico.";
    }

    if (atendimentoStatusElement) {
        atendimentoStatusElement.textContent = resumoStatusAtendimentos.total > 0
            ? `Resumo de ${Math.round(resumoStatusAtendimentos.total)} atendimento(s): resolvidos, aguardando analise e pendentes.`
            : "Mapeie a coluna status para classificar os status dos atendimentos.";
    }
}

function atualizarAnalisesImportacao() {
    // Este é o ponto de orquestração das análises derivadas da importação atual.
    const registrosImportacaoBase = obterRegistrosImportacaoBase();
    const temImportacao = registrosImportacaoBase.length > 0;
    const registrosAnalise = temImportacao ? obterRegistrosFiltrados() : [];
    const registrosAnaliseResolucao = filtrarRegistrosPorModalidadeResolucao(registrosAnalise);
    const topUsuarios = obterTopUsuarios(registrosAnaliseResolucao);
    const resumoResolucao = obterResumoResolucao(registrosAnaliseResolucao);

    renderizarPodium(topUsuarios, registrosAnaliseResolucao.length);
    montarTopUsersChart(topUsuarios, registrosAnaliseResolucao.length);
    montarResolutionChart(resumoResolucao);
    montarResolutionTopList(registrosAnaliseResolucao);

    if (topUsersStatusElement) {
        if (temImportacao && registrosAnalise.length === 0) {
            topUsersStatusElement.textContent = "Nenhum registro encontrado para os filtros atuais.";
        } else if (topUsuarios.length > 0) {
            const descricaoFiltro = filtroModalidadeResolucao === "todos"
                ? "todos os atendimentos"
                : (filtroModalidadeResolucao === "remoto" ? "somente remoto" : "somente externo");
            topUsersStatusElement.textContent = `Top 4 de usuarios de abertura calculado com ${registrosAnaliseResolucao.length} registro(s) (${descricaoFiltro}).`;
        } else {
            topUsersStatusElement.textContent = "Aguardando importacao com coluna de usuario_abertura.";
        }
    }

    if (resolutionStatusElement) {
        if (temImportacao && registrosAnalise.length === 0) {
            resolutionStatusElement.textContent = "Nenhum registro encontrado para os filtros atuais.";
        } else if ((resumoResolucao.interno + resumoResolucao.externo + resumoResolucao.desconhecido) > 0) {
            const descricaoFiltro = filtroModalidadeResolucao === "todos"
                ? "todos os atendimentos"
                : (filtroModalidadeResolucao === "remoto" ? "somente remoto" : "somente externo");
            resolutionStatusElement.textContent = `Distribuicao calculada pela coluna de quantidade (${descricaoFiltro}): 0 = interno, acima de 0 = externo.`;
        } else {
            resolutionStatusElement.textContent = "Aguardando importacao com coluna de quantidade.";
        }
    }

    atualizarTabelaPivo(registrosAnalise, temImportacao);
    atualizarTabelaMesN1N2(registrosAnalise);
    atualizarDashboardsSlaEMotivo(registrosAnalise);
    atualizarDashboardsServicoECidade(registrosAnalise);
    atualizarDashboardProdutividade(registrosAnalise);
    atualizarPainelAbaAtendimentos(registrosImportacaoBase);
}

function atualizarPreviaImportacao(registros, nomeArquivo, tipoArquivo, colunas, mensagemExtra) {
    const total = registros.length;
    const colunasDetectadas = colunas && colunas.length > 0 ? colunas.join(", ") : "Nenhuma coluna valida detectada";

    previewSummaryElement.textContent = total > 0
        ? `${tipoArquivo} pronto para conferência. ${total} linha(s) detectada(s). Campos: ${colunasDetectadas}.${mensagemExtra ? " " + mensagemExtra : ""}`
        : `${tipoArquivo} lido, mas sem linhas válidas.${mensagemExtra ? " " + mensagemExtra : ""}`;

    if (!total) {
        previewTableBody.innerHTML = '<tr><td colspan="4">Nenhum dado valido encontrado no arquivo.</td></tr>';
        return;
    }

    const linhas = registros.slice(0, 25).map((item) => {
        return `<tr><td>${escaparHtml(item.mes)}</td><td>${escaparHtml(String(item.quantidade))}</td><td>${escaparHtml(item.usuario || "")}</td><td>${escaparHtml(item.resolucao || "")}</td></tr>`;
    }).join("");

    const excedente = total > 25 ? `<tr><td colspan="4">Mostrando 25 de ${total} linha(s) detectada(s).</td></tr>` : "";

    previewTableBody.innerHTML = linhas + excedente;

    atualizarStatusArquivo(`Arquivo selecionado: ${nomeArquivo}`);
}

function escaparHtml(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Persistência local para manter dados entre recarregamentos do navegador.
function obterRegistrosPersistidos(chave) {
    try {
        const dados = localStorage.getItem(chave);

        if (!dados) {
            return [];
        }

        const registros = JSON.parse(dados);

        if (!Array.isArray(registros)) {
            return [];
        }

        return registros.filter((item) => item && typeof item.mes === "string" && Number.isFinite(Number(item.quantidade)));
    } catch (error) {
        return [];
    }
}

function salvarRegistrosPersistidos(chave, registros) {
    try {
        localStorage.setItem(chave, JSON.stringify(registros));
    } catch (error) {
        atualizarStatus("Nao foi possivel salvar os atendimentos manuais neste navegador.");
    }
}

function normalizarRegistrosParaBanco(registros, tipoRegistro) {
    // Normaliza nomes de campos para o schema do Supabase.
    return (registros || []).map((registro) => ({
        mes: String(registro.mes || "").trim(),
        quantidade: Number(registro.quantidade) || 0,
        usuario_abertura: String(registro.usuarioAbertura || "").trim() || null,
        usuario: String(registro.usuario || "").trim() || null,
        resolucao: String(registro.resolucao || "").trim() || null,
        tipo_atendimento: String(registro.tipoAtendimento || "").trim() || null,
        data_abertura: String(registro.dataAbertura || "").trim() || null,
        data_fechamento: String(registro.dataFechamento || "").trim() || null,
        motivo_fechamento: String(registro.motivoFechamento || "").trim() || null,
        tipo_registro: tipoRegistro
    }));
}

async function carregarRegistrosDoSupabase() {
    if (!supabaseClient) {
        return null;
    }

    try {
        const resposta = await supabaseClient
            .from(supabaseTableName)
            .select("*")
            .order("created_at", { ascending: true });

        if (resposta.error) {
            throw resposta.error;
        }

        const registros = Array.isArray(resposta.data) ? resposta.data : [];

        return {
            imported: registros.filter((registro) => registro.tipo_registro === "importado").map((registro) => ({
                mes: registro.mes,
                quantidade: Number(registro.quantidade) || 0,
                usuarioAbertura: registro.usuario_abertura || registro.usuarioAbertura || "",
                usuario: registro.usuario || "",
                resolucao: registro.resolucao || "",
                tipoAtendimento: registro.tipo_atendimento || registro.tipoAtendimento || "",
                cidade: registro.cidade || "",
                bairro: registro.bairro || "",
                numeroPlano: registro.numero_plano || registro.numeroPlano || "",
                dataAbertura: registro.data_abertura || registro.dataAbertura || "",
                dataFechamento: registro.data_fechamento || registro.dataFechamento || "",
                descricaoAbertura: registro.descricao_abertura || registro.descricaoAbertura || "",
                descricaoFechamento: registro.descricao_fechamento || registro.descricaoFechamento || "",
                motivoFechamento: registro.motivo_fechamento || registro.motivoFechamento || ""
            })),
            manual: registros.filter((registro) => registro.tipo_registro === "manual").map((registro) => ({
                mes: registro.mes,
                quantidade: Number(registro.quantidade) || 0,
                usuario: registro.usuario || "",
                resolucao: registro.resolucao || "",
                tipoAtendimento: registro.tipo_atendimento || registro.tipoAtendimento || "",
                cidade: registro.cidade || "",
                bairro: registro.bairro || "",
                numeroPlano: registro.numero_plano || registro.numeroPlano || "",
                dataAbertura: registro.data_abertura || registro.dataAbertura || "",
                dataFechamento: registro.data_fechamento || registro.dataFechamento || "",
                descricaoAbertura: registro.descricao_abertura || registro.descricaoAbertura || "",
                descricaoFechamento: registro.descricao_fechamento || registro.descricaoFechamento || "",
                motivoFechamento: registro.motivo_fechamento || registro.motivoFechamento || ""
            }))
        };
    } catch (error) {
        supabaseDisponivel = false;
        return null;
    }
}

async function sincronizarRegistrosNoSupabase() {
    if (!supabaseClient || !supabaseDisponivel) {
        return;
    }

    try {
        const registrosManual = normalizarRegistrosParaBanco(registrosManuais, "manual");
        const registrosImportado = normalizarRegistrosParaBanco(registrosImportados, "importado");
        const lote = registrosManual.concat(registrosImportado);

        // Estratégia segura: primeiro insere/valida, depois remove o antigo.
        // Isso evita perda de dados se o insert falhar.
        if (lote.length > 0) {
            let resposta = await supabaseClient.from(supabaseTableName).insert(lote);

            // Fallback: tenta versão simplificada sem campos opcionais caso a tabela
            // ainda não tenha todas as colunas aplicadas.
            if (resposta && resposta.error) {
                const loteSemAbertura = lote.map((item) => ({
                    mes: item.mes,
                    quantidade: item.quantidade,
                    usuario: item.usuario,
                    resolucao: item.resolucao,
                    tipo_registro: item.tipo_registro
                }));
                resposta = await supabaseClient.from(supabaseTableName).insert(loteSemAbertura);
            }

            if (resposta && resposta.error) {
                throw resposta.error;
            }

            // Só remove os registros antigos após confirmar que o insert funcionou.
            await supabaseClient
                .from(supabaseTableName)
                .delete()
                .lt("created_at", new Date().toISOString())
                .in("tipo_registro", ["manual", "importado"]);

        } else {
            // Sem registros: limpa normalmente.
            await supabaseClient.from(supabaseTableName).delete().in("tipo_registro", ["manual", "importado"]);
        }
    } catch (error) {
        supabaseDisponivel = false;
    }
}

// Utilitários de normalização textual e temporal usados por toda a pipeline.
function normalizarMes(mes) {
    return mes.trim().replace(/\s+/g, " ");
}

function obterNumeroMes(texto) {
    const valor = normalizarTextoBusca(texto);

    if (!valor) {
        return 0;
    }

    const correspondenciaNumero = valor.match(/^(0?[1-9]|1[0-2])$/);

    if (correspondenciaNumero) {
        return Number(correspondenciaNumero[1]);
    }

    const nomesMeses = [
        [1, ["jan", "janeiro"]],
        [2, ["fev", "fevereiro"]],
        [3, ["mar", "marco", "março"]],
        [4, ["abr", "abril"]],
        [5, ["mai", "maio"]],
        [6, ["jun", "junho"]],
        [7, ["jul", "julho"]],
        [8, ["ago", "agosto"]],
        [9, ["set", "setembro"]],
        [10, ["out", "outubro"]],
        [11, ["nov", "novembro"]],
        [12, ["dez", "dezembro"]]
    ];

    for (let indice = 0; indice < nomesMeses.length; indice += 1) {
        const [numero, sinonimos] = nomesMeses[indice];

        if (sinonimos.some((sinonimo) => valor.indexOf(sinonimo) !== -1)) {
            return numero;
        }
    }

    return 0;
}

function formatarMesReferencia(valor) {
    const texto = normalizarMes(String(valor == null ? "" : valor));

    if (!texto) {
        return "";
    }

    const textoSomenteSeparadores = texto.replace(/\s+/g, "");

    if (/^[-./]+$/.test(textoSomenteSeparadores)) {
        return "";
    }

    const partesData = texto.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);

    if (partesData) {
        const numeroMes = Number(partesData[2]);

        if (numeroMes >= 1 && numeroMes <= 12) {
            return `${String(numeroMes).padStart(2, "0")} ${mesesReferencia[numeroMes - 1]}`;
        }
    }

    const partesIso = texto.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);

    if (partesIso) {
        const numeroMes = Number(partesIso[2]);

        if (numeroMes >= 1 && numeroMes <= 12) {
            return `${String(numeroMes).padStart(2, "0")} ${mesesReferencia[numeroMes - 1]}`;
        }
    }

    const numeroMesDireto = obterNumeroMes(texto);

    if (numeroMesDireto >= 1 && numeroMesDireto <= 12) {
        return `${String(numeroMesDireto).padStart(2, "0")} ${mesesReferencia[numeroMesDireto - 1]}`;
    }

    const valorNumerico = Number(texto.replace(/,/g, "."));

    if (Number.isFinite(valorNumerico) && valorNumerico > 59 && valorNumerico < 60000 && window.XLSX && window.XLSX.SSF && typeof window.XLSX.SSF.parse_date_code === "function") {
        const dataExcel = window.XLSX.SSF.parse_date_code(valorNumerico);

        if (dataExcel && Number.isFinite(dataExcel.m) && dataExcel.m >= 1 && dataExcel.m <= 12) {
            return `${String(dataExcel.m).padStart(2, "0")} ${mesesReferencia[dataExcel.m - 1]}`;
        }
    }

    return "";
}

function obterRotuloMesEixo(mes) {
    const texto = normalizarMes(String(mes == null ? "" : mes));

    if (!texto) {
        return "";
    }

    const correspondencia = texto.match(/^(\d{1,2})\s+/);

    if (correspondencia) {
        return String(Number(correspondencia[1])).padStart(2, "0");
    }

    const numeroMes = obterNumeroMes(texto);

    if (numeroMes >= 1 && numeroMes <= 12) {
        return String(numeroMes).padStart(2, "0");
    }

    return texto;
}

function normalizarTextoBusca(texto) {
    return String(texto || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function pontuarColuna(cabecalho, termos) {
    const texto = normalizarTextoBusca(cabecalho);

    if (!texto) {
        return 0;
    }

    let pontuacao = 0;

    (termos || []).forEach((termo) => {
        const termoNormalizado = normalizarTextoBusca(termo);

        if (!termoNormalizado) {
            return;
        }

        if (texto === termoNormalizado) {
            pontuacao += 6;
            return;
        }

        if (texto.indexOf(termoNormalizado) !== -1) {
            pontuacao += 4;
            return;
        }

        if (termoNormalizado.indexOf(texto) !== -1) {
            pontuacao += 2;
            return;
        }

        const partes = termoNormalizado.split(/\s+/).filter(Boolean);
        if (partes.length > 1 && partes.every((parte) => texto.indexOf(parte) !== -1)) {
            pontuacao += 3;
        }
    });

    return pontuacao;
}

function escolherColunaPorSinonimos(colunas, termos) {
    let melhorColuna = "";
    let melhorPontuacao = 0;

    (colunas || []).forEach((coluna) => {
        const pontuacao = pontuarColuna(coluna, termos);

        if (pontuacao > melhorPontuacao) {
            melhorPontuacao = pontuacao;
            melhorColuna = coluna;
        }
    });

    return melhorColuna;
}

function escolherColunaPorNomeExato(colunas, nomes) {
    const colunasLista = Array.isArray(colunas) ? colunas : [];
    const nomesNormalizados = new Set((nomes || []).map((nome) => normalizarTextoBusca(nome)).filter(Boolean));

    for (let indice = 0; indice < colunasLista.length; indice += 1) {
        const coluna = colunasLista[indice];

        if (nomesNormalizados.has(normalizarTextoBusca(coluna))) {
            return coluna;
        }
    }

    return "";
}

function converterQuantidade(valor) {
    const texto = String(valor == null ? "" : valor).trim();

    if (!texto) {
        return NaN;
    }

    const normalizado = texto
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(/,/g, ".")
        .replace(/[^\d.-]/g, "");

    const numero = Number(normalizado);

    return Number.isFinite(numero) ? numero : NaN;
}

function encontrarChavePorSinonimos(chaves, sinonimos) {
    const chavesNormalizadas = chaves.map((chave) => ({ original: chave, normalizada: normalizarTextoBusca(chave) }));

    for (let indice = 0; indice < sinonimos.length; indice += 1) {
        const sinonimo = normalizarTextoBusca(sinonimos[indice]);

        for (let indiceChave = 0; indiceChave < chavesNormalizadas.length; indiceChave += 1) {
            const candidata = chavesNormalizadas[indiceChave];

            if (candidata.normalizada === sinonimo || candidata.normalizada.indexOf(sinonimo) !== -1 || sinonimo.indexOf(candidata.normalizada) !== -1) {
                return candidata.original;
            }
        }
    }

    return "";
}

function combinarRegistros() {
    const mapa = new Map();

    const listas = Array.prototype.slice.call(arguments);

    listas.forEach((lista) => {
        (lista || []).forEach((item) => {
            if (!item || typeof item.mes !== "string") {
                return;
            }

            const mesFormatado = formatarMesReferencia(item.mes);

            if (!mesFormatado) {
                return;
            }

            const chave = normalizarTextoBusca(mesFormatado);
            const quantidade = Number(item.quantidade) || 0;
            const existente = mapa.get(chave);

            if (existente) {
                existente.quantidade += quantidade;
                return;
            }

            mapa.set(chave, {
                mes: mesFormatado,
                quantidade: quantidade
            });
        });
    });

    return Array.from(mapa.values()).sort((itemA, itemB) => {
        const mesA = obterNumeroMes(itemA.mes) || 13;
        const mesB = obterNumeroMes(itemB.mes) || 13;

        if (mesA !== mesB) {
            return mesA - mesB;
        }

        return normalizarTextoBusca(itemA.mes).localeCompare(normalizarTextoBusca(itemB.mes));
    });
}

function extrairRegistrosBrutosDeXml(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");

    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("XML invalido.");
    }

    const candidatos = extrairObjetosDeElementoXml(xmlDoc.documentElement);
    return candidatos.filter((objeto) => objeto && Object.keys(objeto).length >= 2);
}

function extrairRegistrosBrutosDeTextoTabela(texto) {
    const linhas = String(texto || "")
        .split(/\r?\n/)
        .map(function (linha) { return linha.trim(); })
        .filter(Boolean);

    const registros = [];
    let maiorQuantidadeColunas = 0;

    linhas.forEach((linha, indice) => {
        const colunas = quebrarLinhaEmColunas(linha);

        if (colunas.length < 2) {
            return;
        }

        if (colunas.length > maiorQuantidadeColunas) {
            maiorQuantidadeColunas = colunas.length;
        }

        const registro = {};

        colunas.forEach((valor, colunaIndice) => {
            registro[`coluna_${colunaIndice + 1}`] = valor;
        });

        registro.__linha = indice + 1;
        registros.push(registro);
    });

    const colunas = [];

    for (let indice = 1; indice <= maiorQuantidadeColunas; indice += 1) {
        colunas.push(`coluna_${indice}`);
    }

    return {
        registros: registros,
        colunas: colunas
    };
}

function mapearRegistrosBrutos(registrosBrutos, mapeamento) {
    // Traduz linhas heterogêneas do arquivo para o modelo interno único do dashboard.
    const registros = [];
    const mapa = mapeamento || {};
    const colunaMes = mapa.colunaMes || monthColumnSelect.value;
    const colunaQuantidade = mapa.colunaQuantidade || quantityColumnSelect.value;
    const colunaAbertura = mapa.colunaAbertura || (openingUserColumnSelect ? openingUserColumnSelect.value : "");
    const colunaUsuario = mapa.colunaUsuario || userColumnSelect.value;
    const colunaResolucao = mapa.colunaResolucao || resolutionColumnSelect.value;
    const colunaStatus = mapa.colunaStatus || (statusColumnSelect ? statusColumnSelect.value : "");
    const colunaDataAbertura = mapa.colunaDataAbertura || (dataAberturaColumnSelect ? dataAberturaColumnSelect.value : "");
    const colunaDataFechamento = mapa.colunaDataFechamento || (dataFechamentoColumnSelect ? dataFechamentoColumnSelect.value : "");
    const colunaDescricaoAbertura = mapa.colunaDescricaoAbertura || (descricaoAberturaColumnSelect ? descricaoAberturaColumnSelect.value : "");
    const colunaDescricaoFechamento = mapa.colunaDescricaoFechamento || (descricaoFechamentoColumnSelect ? descricaoFechamentoColumnSelect.value : "");
    const colunaMotivo = mapa.colunaMotivo || (motivoFechamentoColumnSelect ? motivoFechamentoColumnSelect.value : "");
    const colunaTipo = mapa.colunaTipo || (tipoAtendimentoColumnSelect ? tipoAtendimentoColumnSelect.value : "");
    const colunaCidade = mapa.colunaCidade || (cidadeColumnSelect ? cidadeColumnSelect.value : "");
    const colunaBairro = mapa.colunaBairro || (bairroColumnSelect ? bairroColumnSelect.value : "");
    const colunaNumeroPlano = mapa.colunaNumeroPlano || (numeroPlanoColumnSelect ? numeroPlanoColumnSelect.value : "");
    const colunaUsuarioFechamento = mapa.colunaUsuarioFechamento || (usuarioFechamentoColumnSelect ? usuarioFechamentoColumnSelect.value : "");
    const colunaNomeCliente = mapa.colunaNomeCliente || (nomeClienteColumnSelect ? nomeClienteColumnSelect.value : "");
    const colunaCodigoCliente = mapa.colunaCodigoCliente || (codigoClienteColumnSelect ? codigoClienteColumnSelect.value : "");
    const colunaProtocoloAtendimento = mapa.colunaProtocoloAtendimento || (protocoloAtendimentoColumnSelect ? protocoloAtendimentoColumnSelect.value : "");

    (registrosBrutos || []).forEach((registroBruto) => {
        const mesValor = obterValorDaLinha(registroBruto, colunaMes, 0);
        const quantidadeValor = obterValorDaLinha(registroBruto, colunaQuantidade, 1);
        const aberturaValor = obterValorDaLinha(registroBruto, colunaAbertura, 2);
        const usuarioValor = obterValorDaLinha(registroBruto, colunaUsuario, 3);
        const resolucaoValor = obterValorDaLinha(registroBruto, colunaResolucao, 4);
        const statusValor = colunaStatus ? obterValorDaLinha(registroBruto, colunaStatus, -1) : "";
        const dataAberturaValor = colunaDataAbertura ? obterValorDaLinha(registroBruto, colunaDataAbertura, -1) : "";
        const dataFechamentoValor = colunaDataFechamento ? obterValorDaLinha(registroBruto, colunaDataFechamento, -1) : "";
        const descricaoAberturaValor = colunaDescricaoAbertura ? obterValorDaLinha(registroBruto, colunaDescricaoAbertura, -1) : "";
        const descricaoFechamentoValor = colunaDescricaoFechamento ? obterValorDaLinha(registroBruto, colunaDescricaoFechamento, -1) : "";
        const motivoValor = colunaMotivo ? obterValorDaLinha(registroBruto, colunaMotivo, -1) : "";
        const tipoValor = colunaTipo ? obterValorDaLinha(registroBruto, colunaTipo, -1) : "";
        const cidadeValor = colunaCidade ? obterValorDaLinha(registroBruto, colunaCidade, -1) : "";
        const bairroValor = colunaBairro ? obterValorDaLinha(registroBruto, colunaBairro, -1) : "";
        const numeroPlanoValor = obterValorPlanoServicoDoRegistroBruto(registroBruto, colunaNumeroPlano);
        const usuarioFechamentoValor = colunaUsuarioFechamento ? obterValorDaLinha(registroBruto, colunaUsuarioFechamento, -1) : "";
        const nomeClienteValor = colunaNomeCliente ? obterValorDaLinha(registroBruto, colunaNomeCliente, -1) : "";
        const codigoClienteValor = colunaCodigoCliente ? obterValorDaLinha(registroBruto, colunaCodigoCliente, -1) : "";
        const protocoloAtendimentoValor = colunaProtocoloAtendimento ? obterValorDaLinha(registroBruto, colunaProtocoloAtendimento, -1) : "";
        let registro = converterObjetoEmRegistro({ mes: mesValor, quantidade: quantidadeValor });

        if (!registro) {
            registro = converterObjetoEmRegistro({ mes: obterValorDaLinha(registroBruto, null, 0), quantidade: obterValorDaLinha(registroBruto, null, 1) });
        }

        if (!registro) {
            const mesFallback = formatarMesReferencia(String(mesValor || obterValorDaLinha(registroBruto, null, 0) || ""));

            if (mesFallback) {
                registro = {
                    mes: mesFallback,
                    quantidade: 1
                };
            }
        }

        if (registro) {
            const dataAberturaTexto = String(dataAberturaValor || "").trim();
            const dataFechamentoTexto = String(dataFechamentoValor || "").trim();

            registro.usuarioAbertura = normalizarMes(String(aberturaValor || ""));
            registro.usuario = normalizarMes(String(usuarioValor || ""));
            registro.resolucao = normalizarMes(String(resolucaoValor || ""));
            registro.status = normalizarMes(String(statusValor || ""));
            registro.dataAbertura = dataAberturaTexto;
            registro.dataFechamento = dataFechamentoTexto;
            registro.descricaoAbertura = String(descricaoAberturaValor || "").trim();
            registro.descricaoFechamento = String(descricaoFechamentoValor || "").trim();
            registro.motivoFechamento = String(motivoValor || "").trim();
            registro.tipoAtendimento = String(tipoValor || "").trim();
            registro.cidade = String(cidadeValor || "").trim();
            registro.bairro = String(bairroValor || "").trim();
            registro.numeroPlano = String(numeroPlanoValor || "").trim();
            registro.usuarioFechamento = String(usuarioFechamentoValor || "").trim();
            registro.nomeCliente = String(nomeClienteValor || "").trim();
            registro.codigoCliente = String(codigoClienteValor || "").trim();
            registro.protocoloAtendimento = String(protocoloAtendimentoValor || "").trim();
            registros.push(registro);
        }
    });

    return registros;
}

function obterValorDaLinha(registroBruto, coluna, indiceFallback) {
    if (Array.isArray(registroBruto)) {
        if (coluna && /^coluna_\d+$/i.test(String(coluna))) {
            const posicao = Number(String(coluna).replace(/\D/g, "")) - 1;
            if (Number.isInteger(posicao) && posicao >= 0 && posicao < registroBruto.length) {
                return registroBruto[posicao];
            }
        }

        if (coluna && /^\d+$/.test(String(coluna))) {
            const posicaoDireta = Number(coluna);
            if (Number.isInteger(posicaoDireta) && posicaoDireta >= 0 && posicaoDireta < registroBruto.length) {
                return registroBruto[posicaoDireta];
            }
        }

        if (Number.isInteger(indiceFallback) && indiceFallback >= 0 && indiceFallback < registroBruto.length) {
            return registroBruto[indiceFallback];
        }

        return "";
    }

    if (registroBruto && typeof registroBruto === "object") {
        if (coluna && Object.prototype.hasOwnProperty.call(registroBruto, coluna)) {
            return registroBruto[coluna];
        }

        const chaves = Object.keys(registroBruto).filter((chave) => chave !== "__linha");

        if (Number.isInteger(indiceFallback) && indiceFallback >= 0 && indiceFallback < chaves.length) {
            return registroBruto[chaves[indiceFallback]];
        }

        if (chaves.length > 0) {
            return registroBruto[chaves[0]];
        }
    }

    return "";
}

function valorPareceCodigoPlano(valor) {
    const texto = String(valor == null ? "" : valor).trim();

    if (!texto) {
        return true;
    }

    return /^[\d\s.,\-/]+$/.test(texto) && !/[A-Za-zÀ-ÿ]/.test(texto);
}

function obterValorPlanoServicoDoRegistroBruto(registroBruto, colunaNumeroPlano) {
    const valorSelecionado = colunaNumeroPlano ? obterValorDaLinha(registroBruto, colunaNumeroPlano, -1) : "";
    let textoSelecionado = String(valorSelecionado || "").trim().replace(/\n/g, " ").replace(/\s+/g, " ");

    if (textoSelecionado && !valorPareceCodigoPlano(textoSelecionado)) {
        return textoSelecionado;
    }

    if (!registroBruto || typeof registroBruto !== "object" || Array.isArray(registroBruto)) {
        return textoSelecionado;
    }

    const chaves = Object.keys(registroBruto).filter((chave) => chave !== "__linha");
    const termosServico = ["servico", "serviço", "nome_servico", "nome serviço", "plano", "nome_plano", "nome plano", "plano_servico", "servico_plano", "descricao_servico", "descrição_serviço", "descricao plano", "descrição plano"];

    for (let indice = 0; indice < chaves.length; indice += 1) {
        const chave = chaves[indice];

        if (normalizarTextoBusca(chave) === normalizarTextoBusca(colunaNumeroPlano)) {
            continue;
        }

        if (pontuarColuna(chave, termosServico) <= 0) {
            continue;
        }

        const valorCandidato = String(obterValorDaLinha(registroBruto, chave, -1) || "").trim().replace(/\n/g, " ").replace(/\s+/g, " ");

        if (valorCandidato && !valorPareceCodigoPlano(valorCandidato)) {
            return valorCandidato;
        }
    }

    return textoSelecionado;
}

function converterObjetoEmRegistro(objeto) {
    const chaves = Object.keys(objeto || {});

    if (chaves.length < 2) {
        return null;
    }

    const chaveMes = encontrarChavePorSinonimos(chaves, ["mes", "mês", "month", "competencia", "competência", "periodo", "período", "data"]);
    const chaveQuantidade = encontrarChavePorSinonimos(chaves, ["quantidade", "qtd", "qtde", "atendimentos", "atendimento", "total", "valor", "count", "numero", "número"]);

    let mes = chaveMes ? objeto[chaveMes] : objeto[chaves[0]];
    let quantidade = chaveQuantidade ? objeto[chaveQuantidade] : objeto[chaves[1]];

    if ((!mes || !String(mes).trim()) && chaves.length >= 2) {
        mes = objeto[chaves[0]];
        quantidade = objeto[chaves[1]];
    }

    const mesLimpo = formatarMesReferencia(String(mes || ""));
    const quantidadeNumero = converterQuantidade(quantidade);

    if (!mesLimpo || !Number.isFinite(quantidadeNumero)) {
        return null;
    }

    return {
        mes: mesLimpo,
        quantidade: quantidadeNumero
    };
}

function converterObjetosEmRegistros(objetos) {
    const registros = [];

    (objetos || []).forEach((objeto) => {
        const registro = converterObjetoEmRegistro(objeto);

        if (registro) {
            registros.push(registro);
        }
    });

    return registros;
}

function extrairObjetosDeElementoXml(elemento) {
    const filhos = Array.prototype.slice.call(elemento.children || []);

    if (filhos.length === 0) {
        return [];
    }

    const filhosComDados = filhos.filter((filho) => (filho.children && filho.children.length > 0) || (filho.attributes && filho.attributes.length > 0));

    if (filhosComDados.length === 0) {
        const objeto = {};

        filhos.forEach((filho) => {
            const texto = String(filho.textContent || "").trim();

            if (texto) {
                objeto[filho.tagName] = texto;
            }
        });

        Array.prototype.slice.call(elemento.attributes || []).forEach((atributo) => {
            objeto[atributo.name] = atributo.value;
        });

        return Object.keys(objeto).length >= 2 ? [objeto] : [];
    }

    let registros = [];

    filhos.forEach((filho) => {
        registros = registros.concat(extrairObjetosDeElementoXml(filho));
    });

    return registros;
}

function converterElementoXmlEmRegistro(elemento) {
    const objeto = {};

    Array.prototype.slice.call(elemento.attributes || []).forEach((atributo) => {
        objeto[atributo.name] = atributo.value;
    });

    Array.prototype.slice.call(elemento.children || []).forEach((filho) => {
        const texto = String(filho.textContent || "").trim();

        if (filho.children && filho.children.length > 0) {
            objeto[filho.tagName] = texto;
            return;
        }

        if (texto) {
            if (objeto[filho.tagName] === undefined) {
                objeto[filho.tagName] = texto;
            } else if (Array.isArray(objeto[filho.tagName])) {
                objeto[filho.tagName].push(texto);
            } else {
                objeto[filho.tagName] = [objeto[filho.tagName], texto];
            }
        }
    });

    return converterObjetoEmRegistro(objeto);
}

function extrairRegistrosDeXml(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");

    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("XML invalido.");
    }

    const raiz = xmlDoc.documentElement;
    const candidatos = extrairObjetosDeElementoXml(raiz);

    if (candidatos.length > 0) {
        return converterObjetosEmRegistros(candidatos);
    }

    const registrosDiretos = [];

    Array.prototype.slice.call(raiz.children || []).forEach((filho) => {
        const registro = converterElementoXmlEmRegistro(filho);

        if (registro) {
            registrosDiretos.push(registro);
        }
    });

    return registrosDiretos;
}

function quebrarLinhaEmColunas(linha) {
    if (linha.indexOf("|") !== -1) {
        return linha.split("|").map(function (coluna) { return coluna.trim(); }).filter(Boolean);
    }

    if (linha.indexOf(";") !== -1) {
        return linha.split(";").map(function (coluna) { return coluna.trim(); }).filter(Boolean);
    }

    if (linha.indexOf("\t") !== -1) {
        return linha.split("\t").map(function (coluna) { return coluna.trim(); }).filter(Boolean);
    }

    return linha.split(/\s{2,}/).map(function (coluna) { return coluna.trim(); }).filter(Boolean);
}

function extrairRegistroDaLinha(linha, cabecalhos) {
    const textoLinha = String(linha || "").trim();

    if (!textoLinha) {
        return null;
    }

    const colunas = quebrarLinhaEmColunas(textoLinha);

    if (colunas.length >= 2) {
        const objeto = {};

        if (cabecalhos && cabecalhos.length >= 2) {
            cabecalhos.forEach((cabecalho, indice) => {
                if (indice < colunas.length) {
                    objeto[cabecalho] = colunas[indice];
                }
            });
        } else {
            objeto.mes = colunas[0];
            objeto.quantidade = colunas[colunas.length - 1];
        }

        return converterObjetoEmRegistro(objeto);
    }

    const combinacao = textoLinha.match(/^(.+?)\s+([\d.,]+)$/);

    if (combinacao) {
        return converterObjetoEmRegistro({ mes: combinacao[1], quantidade: combinacao[2] });
    }

    return null;
}

function extrairRegistrosDeTextoTabela(texto) {
    const linhas = String(texto || "")
        .split(/\r?\n/)
        .map(function (linha) { return linha.trim(); })
        .filter(Boolean);

    if (linhas.length === 0) {
        return [];
    }

    const cabecalhos = quebrarLinhaEmColunas(linhas[0]);
    const registros = [];

    if (cabecalhos.length >= 2) {
        for (let indice = 1; indice < linhas.length; indice += 1) {
            const registro = extrairRegistroDaLinha(linhas[indice], cabecalhos);

            if (registro) {
                registros.push(registro);
            }
        }

        if (registros.length > 0) {
            return registros;
        }
    }

    linhas.forEach((linha) => {
        const registro = extrairRegistroDaLinha(linha, null);

        if (registro) {
            registros.push(registro);
        }
    });

    return registros;
}

async function extrairTextoPdf(arrayBuffer) {
    if (!window.pdfjsLib) {
        throw new Error("Biblioteca PDF nao disponivel.");
    }

    const documento = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const linhasTotais = [];

    for (let numeroPagina = 1; numeroPagina <= documento.numPages; numeroPagina += 1) {
        const pagina = await documento.getPage(numeroPagina);
        const conteudo = await pagina.getTextContent();
        const itens = conteudo.items.slice().sort((itemA, itemB) => {
            const linhaA = Math.round(itemA.transform[5]);
            const linhaB = Math.round(itemB.transform[5]);

            if (linhaA !== linhaB) {
                return linhaB - linhaA;
            }

            return itemA.transform[4] - itemB.transform[4];
        });

        const linhasPagina = [];

        itens.forEach((item) => {
            const y = Math.round(item.transform[5]);
            let linhaAtual = null;

            for (let indice = 0; indice < linhasPagina.length; indice += 1) {
                if (Math.abs(linhasPagina[indice].y - y) <= 2) {
                    linhaAtual = linhasPagina[indice];
                    break;
                }
            }

            if (!linhaAtual) {
                linhaAtual = { y: y, palavras: [] };
                linhasPagina.push(linhaAtual);
            }

            linhaAtual.palavras.push({ x: item.transform[4], texto: item.str });
        });

        linhasPagina
            .sort((linhaA, linhaB) => linhaB.y - linhaA.y)
            .forEach((linha) => {
                const textoLinha = linha.palavras
                    .sort((palavraA, palavraB) => palavraA.x - palavraB.x)
                    .map((palavra) => String(palavra.texto || "").trim())
                    .filter(Boolean)
                    .join(" ");

                if (textoLinha) {
                    linhasTotais.push(textoLinha);
                }
            });
    }

    return linhasTotais.join("\n");
}

function extrairRegistrosBrutosDePlanilha(arrayBuffer) {
    if (!window.XLSX) {
        throw new Error("Biblioteca de planilha nao disponivel.");
    }

    const workbook = window.XLSX.read(arrayBuffer, { type: "array" });
    const primeiraAba = workbook.SheetNames && workbook.SheetNames[0];

    if (!primeiraAba) {
        throw new Error("Planilha sem abas encontradas.");
    }

    const aba = workbook.Sheets[primeiraAba];
    const registrosEstruturados = window.XLSX.utils.sheet_to_json(aba, { defval: "", raw: false });

    if (Array.isArray(registrosEstruturados) && registrosEstruturados.length > 0) {
        return registrosEstruturados;
    }

    const linhas = window.XLSX.utils.sheet_to_json(aba, { defval: "", raw: false, header: 1, blankrows: false });

    if (!Array.isArray(linhas) || linhas.length === 0) {
        return [];
    }

    return linhas.map((linha, indice) => {
        const registro = {};

        (linha || []).forEach((valor, colunaIndice) => {
            registro[`coluna_${colunaIndice + 1}`] = valor;
        });

        registro.__linha = indice + 1;
        return registro;
    }).filter((registro) => Object.keys(registro).length >= 2);
}

function normalizarNumeroOs(valor) {
    const texto = String(valor == null ? "" : valor).trim();

    if (!texto) {
        return "";
    }

    // Converte notação científica textual (ex.: 9.77261051653107E+17) para string inteira.
    const scientific = texto.match(/^(\d+)(?:[\.,](\d+))?[eE]\+?(\d+)$/);
    if (scientific) {
        const inteiro = scientific[1] || "";
        const fracao = scientific[2] || "";
        const expoente = Number(scientific[3] || 0);
        const base = `${inteiro}${fracao}`;
        const deslocamento = expoente - fracao.length;
        const expandido = deslocamento >= 0
            ? `${base}${"0".repeat(deslocamento)}`
            : base.slice(0, Math.max(0, base.length + deslocamento));
        const normalizadoSci = expandido.replace(/^0+(?=\d)/, "");
        if (normalizadoSci) {
            return normalizadoSci;
        }
    }

    const digitos = texto.replace(/\D/g, "");
    if (!digitos) {
        return "";
    }

    return digitos.replace(/^0+(?=\d)/, "");
}

function obterComprimentoPrefixoComum(valorA, valorB) {
    const textoA = String(valorA || "");
    const textoB = String(valorB || "");
    const limite = Math.min(textoA.length, textoB.length);
    let indice = 0;

    while (indice < limite && textoA[indice] === textoB[indice]) {
        indice += 1;
    }

    return indice;
}

function buscarRegistroOsPorSemelhanca(numeroOs) {
    const alvo = normalizarNumeroOs(numeroOs);

    if (!alvo) {
        return null;
    }

    let melhorRegistro = null;
    let melhorPrefixo = 0;

    osRegistrosPorNumero.forEach((registro, numeroIndexado) => {
        const prefixo = obterComprimentoPrefixoComum(alvo, numeroIndexado);

        if (prefixo > melhorPrefixo) {
            melhorPrefixo = prefixo;
            melhorRegistro = registro;
        }
    });

    // Evita falso-positivo para números curtos; exige match consistente de prefixo.
    if (melhorRegistro && melhorPrefixo >= 11) {
        return melhorRegistro;
    }

    return null;
}

function obterChavesAproximadasNumeroOs(numeroOs) {
    const numero = normalizarNumeroOs(numeroOs);
    const chaves = new Set();

    if (!numero) {
        return [];
    }

    chaves.add(numero);

    if (numero.length >= 12) {
        chaves.add(numero.slice(0, 12));
        chaves.add(numero.slice(-12));
    }

    if (numero.length >= 13) {
        chaves.add(numero.slice(0, 13));
        chaves.add(numero.slice(-13));
    }

    if (numero.length >= 15) {
        chaves.add(numero.slice(0, 15));
        chaves.add(numero.slice(-15));
    }

    return Array.from(chaves);
}

function extrairNumeroOsDaDescricaoFechamento(texto) {
    const valor = String(texto || "");

    if (!valor) {
        return "";
    }

    const padroes = [
        /n[º°o]\s*[:#-]?\s*(\d{2,})/i,
        /\bos\s*[:#-]?\s*(\d{2,})\b/i,
        /ordem\s+de\s+servico\s*[:#-]?\s*(\d{2,})/i
    ];

    for (let indice = 0; indice < padroes.length; indice += 1) {
        const correspondencia = valor.match(padroes[indice]);

        if (correspondencia && correspondencia[1]) {
            return normalizarNumeroOs(correspondencia[1]);
        }
    }

    return "";
}

function obterOsPorDescricaoFechamento(descricaoFechamento) {
    const numeroOs = extrairNumeroOsDaDescricaoFechamento(descricaoFechamento);

    if (!numeroOs) {
        return null;
    }

    const registroExato = osRegistrosPorNumero.get(numeroOs);

    if (registroExato) {
        return {
            numeroOs,
            registro: registroExato
        };
    }

    const chaves = obterChavesAproximadasNumeroOs(numeroOs);

    for (let indice = 0; indice < chaves.length; indice += 1) {
        const registroAproximado = osRegistrosPorChaveAproximada.get(chaves[indice]);

        if (registroAproximado) {
            return {
                numeroOs,
                registro: registroAproximado
            };
        }
    }

    const registroSemelhante = buscarRegistroOsPorSemelhanca(numeroOs);
    if (registroSemelhante) {
        return {
            numeroOs,
            registro: registroSemelhante
        };
    }

    return {
        numeroOs,
        registro: null
    };
}

function identificarColunaNumeroOsPorConteudo(registrosBrutos, colunas) {
    const listaColunas = Array.isArray(colunas) ? colunas : [];
    const linhas = Array.isArray(registrosBrutos) ? registrosBrutos : [];

    if (!listaColunas.length || !linhas.length) {
        return "";
    }

    let melhorColuna = "";
    let melhorPontuacao = -1;

    listaColunas.forEach((coluna) => {
        // Bloqueio construtivo: Ignora colunas que são obviamente dados pessoais do cliente
        const nomeColNorm = normalizarTextoBusca(coluna);
        if (nomeColNorm.includes("nome") || nomeColNorm.includes("cliente") || nomeColNorm.includes("razao") || nomeColNorm.includes("cpf") || nomeColNorm.includes("cnpj") || nomeColNorm.includes("documento")) {
            return;
        }

        let validos = 0;
        let longos = 0;
        const distintos = new Set();

        linhas.forEach((linha) => {
            const numero = normalizarNumeroOs(obterValorDaLinha(linha, coluna, -1));

            if (!numero) {
                return;
            }

            validos += 1;
            if (numero.length >= 12) {
                longos += 1;
            }
            distintos.add(numero);
        });

        const pontuacao = (longos * 3) + (validos * 2) + distintos.size;

        if (pontuacao > melhorPontuacao) {
            melhorPontuacao = pontuacao;
            melhorColuna = coluna;
        }
    });

    return melhorColuna;
}

function extrairCandidatosNumeroOsDeTexto(valor) {
    const texto = String(valor == null ? "" : valor).trim();
    const candidatos = [];

    if (!texto) {
        return candidatos;
    }

    const rotulados = [
        /(?:\bos\b|ordem\s+de\s+servico|n[º°o])\s*[:#-]?\s*(\d{8,})/gi,
        /(?:\bos\b|ordem\s+de\s+servico|n[º°o])\D*(\d{8,})/gi
    ];

    rotulados.forEach((regex) => {
        let match;
        while ((match = regex.exec(texto)) !== null) {
            const numero = normalizarNumeroOs(match[1]);
            if (numero.length >= 8) {
                candidatos.push({ numero, score: 100 + numero.length });
            }
        }
    });

    const genericos = texto.match(/\d{12,}/g) || [];
    genericos.forEach((trecho) => {
        const numero = normalizarNumeroOs(trecho);
        if (numero.length >= 12) {
            candidatos.push({ numero, score: 30 + numero.length });
        }
    });

    return candidatos;
}

function inferirNumeroOsDaLinha(linha) {
    if (!linha || typeof linha !== "object") {
        return "";
    }

    let melhorNumero = "";
    let melhorScore = -1;

    Object.keys(linha).forEach((chave) => {
        if (chave === "__linha") {
            return;
        }

        const valor = linha[chave];
        const candidatos = extrairCandidatosNumeroOsDeTexto(valor);

        candidatos.forEach((candidato) => {
            if (candidato.score > melhorScore) {
                melhorScore = candidato.score;
                melhorNumero = candidato.numero;
            }
        });
    });

    return melhorNumero;
}

function pontuarDetalhesOs(registroOs) {
    if (!registroOs) {
        return 0;
    }

    let pontuacao = 0;

    if (registroOs.tecnico && registroOs.tecnico !== "N/A") pontuacao += 1;
    if (registroOs.dataRealizada && registroOs.dataRealizada !== "N/A") pontuacao += 1;
    if (registroOs.descricaoFechamento && registroOs.descricaoFechamento !== "N/A") pontuacao += 1;
    if (registroOs.statusOs && registroOs.statusOs !== "N/A") pontuacao += 1;
    if (registroOs.dataInicioProgramado && registroOs.dataInicioProgramado !== "N/A") pontuacao += 1;
    if (registroOs.protocoloAtendimento) pontuacao += 1;

    return pontuacao;
}

function normalizarProtocoloAtendimento(valor) {
    return String(valor || "").trim().replace(/\s+/g, "");
}

function atualizarIndiceOs(registrosOs) {
    osRegistrosImportados = Array.isArray(registrosOs) ? registrosOs.slice() : [];
    osRegistrosPorNumero = new Map();
    osRegistrosPorChaveAproximada = new Map();
    osRegistrosPorProtocolo = new Map();

    osRegistrosImportados.forEach((registroOs) => {
        const numeroOs = normalizarNumeroOs(registroOs && registroOs.numeroOs);

        if (!numeroOs) {
            return;
        }

        const atual = osRegistrosPorNumero.get(numeroOs);
        const atualScore = pontuarDetalhesOs(atual);
        const novoScore = pontuarDetalhesOs(registroOs);

        if (!atual || novoScore >= atualScore) {
            const registroNormalizado = {
                numeroOs,
                tecnico: String((registroOs && registroOs.tecnico) || "").trim() || "N/A",
                dataRealizada: String((registroOs && registroOs.dataRealizada) || "").trim() || "N/A",
                descricaoFechamento: String((registroOs && registroOs.descricaoFechamento) || "").trim() || "N/A",
                statusOs: String((registroOs && registroOs.statusOs) || "").trim() || "N/A",
                dataInicioProgramado: String((registroOs && registroOs.dataInicioProgramado) || "").trim() || "N/A",
                protocoloAtendimento: normalizarProtocoloAtendimento(registroOs && registroOs.protocoloAtendimento)
            };

            osRegistrosPorNumero.set(numeroOs, registroNormalizado);

            const chaves = obterChavesAproximadasNumeroOs(numeroOs);

            chaves.forEach((chave) => {
                const registroAtual = osRegistrosPorChaveAproximada.get(chave);
                const scoreAtual = pontuarDetalhesOs(registroAtual);
                const scoreNovo = pontuarDetalhesOs(registroNormalizado);

                if (!registroAtual || scoreNovo >= scoreAtual) {
                    osRegistrosPorChaveAproximada.set(chave, registroNormalizado);
                }
            });

            if (registroNormalizado.protocoloAtendimento) {
                const protocoloAtual = osRegistrosPorProtocolo.get(registroNormalizado.protocoloAtendimento);
                const scoreProtocoloAtual = pontuarDetalhesOs(protocoloAtual);

                if (!protocoloAtual || novoScore >= scoreProtocoloAtual) {
                    osRegistrosPorProtocolo.set(registroNormalizado.protocoloAtendimento, registroNormalizado);
                }
            }
        }
    });
}

async function processarArquivoOrdemServico(arquivo) {
    if (!arquivo) {
        throw new Error("Selecione um arquivo de OS primeiro.");
    }

    const nomeArquivo = String(arquivo.name || "arquivo");
    const extensao = nomeArquivo.split(".").pop().toLowerCase();

    if (extensao !== "xls" && extensao !== "xlsx" && extensao !== "csv") {
        throw new Error("Formato de OS nao suportado. Use XLSX, XLS ou CSV.");
    }

    const registrosBrutos = extrairRegistrosBrutosDePlanilha(await arquivo.arrayBuffer());
    const colunas = obterChavesUnicasDeObjetos(registrosBrutos);

    if (!colunas.length) {
        return {
            registros: [],
            colunas,
            mapeamento: {}
        };
    }

    // Tenta primeiro um nome exato conhecido (evita empate com id_ordem_servico, que e o ID interno
    // auto-incremental e nao o numero de protocolo usado nas descricoes de fechamento).
    let colunaNumeroOs = escolherColunaPorNomeExato(colunas, [
        "numero_ordem_servico", "numero ordem servico", "numero_os", "numero os",
        "num_os", "num os", "n_os", "n os", "protocolo_os", "protocolo os"
    ]) || escolherColunaPorSinonimos(colunas, [
        "numero_ordem_servico", "numero_os", "id_os", "numero os", "n os", "n_os", "num os",
        "ordem servico", "ordem de servico", "ordem_de_servico", "numero da os", "protocolo"
    ]) || "";
    const colunaTecnico = escolherColunaPorSinonimos(colunas, [
        "tecnico", "tecnico responsavel", "responsavel", "executor", "atendente tecnico"
    ]) || "";
    const colunaDataRealizada = escolherColunaPorSinonimos(colunas, [
        "data_termino_executado", "data termino executado", "termino executado", "data realizada", "data_realizada", "data execucao", "data_execucao", "data fechamento", "data conclusao", "concluida em"
    ]) || "";
    const colunaDescricaoFechamento = escolherColunaPorSinonimos(colunas, [
        "descricao fechamento", "descricao_fechamento", "observacao fechamento", "descricao da conclusao", "fechamento"
    ]) || "";
    const colunaStatusOs = escolherColunaPorSinonimos(colunas, [
        "status", "status_ordem_servico", "status ordem servico", "situacao_os", "situacao os", "situacao", "status_os"
    ]) || "";
    const colunaDataInicioProgramado = escolherColunaPorSinonimos(colunas, [
        "data_inicio_programado", "data inicio programado", "data_inicio_programada", "data inicio programada",
        "data programada", "data_programada", "data agendamento", "data_agendamento"
    ]) || "";
    const colunaProtocoloAtendimento = escolherColunaPorNomeExato(colunas, ["protocolo_atendimento", "protocolo atendimento"])
        || escolherColunaPorSinonimos(colunas, [
            "protocolo_atendimento", "protocolo atendimento", "protocolo do atendimento", "protocolo",
            "codigo_atendimento", "codigo atendimento", "id_atendimento", "id atendimento"
        ]) || "";

    if (!colunaNumeroOs) {
        colunaNumeroOs = identificarColunaNumeroOsPorConteudo(registrosBrutos, colunas);
    }

    const registros = [];
    let inferidosPorFallback = 0;

    (registrosBrutos || []).forEach((linha) => {
        let numeroOs = normalizarNumeroOs(colunaNumeroOs ? obterValorDaLinha(linha, colunaNumeroOs, -1) : "");

        if (!numeroOs) {
            numeroOs = inferirNumeroOsDaLinha(linha);
            if (numeroOs) {
                inferidosPorFallback += 1;
            }
        }

        if (!numeroOs) {
            return;
        }

        const tecnico = String(colunaTecnico ? obterValorDaLinha(linha, colunaTecnico, -1) : "").trim() || "N/A";
        const dataRealizadaBruta = colunaDataRealizada ? obterValorDaLinha(linha, colunaDataRealizada, -1) : "";
        const dataRealizadaData = parsarDataRegistro(dataRealizadaBruta);
        const dataRealizada = dataRealizadaData
            ? formatarDataBR(dataRealizadaData)
            : (String(dataRealizadaBruta || "").trim() || "N/A");
        const descricaoFechamento = String(colunaDescricaoFechamento ? obterValorDaLinha(linha, colunaDescricaoFechamento, -1) : "").trim() || "N/A";
        const statusOs = String(colunaStatusOs ? obterValorDaLinha(linha, colunaStatusOs, -1) : "").trim() || "N/A";
        const dataInicioProgramadoBruta = colunaDataInicioProgramado ? obterValorDaLinha(linha, colunaDataInicioProgramado, -1) : "";
        const dataInicioProgramadoData = parsarDataRegistro(dataInicioProgramadoBruta);
        const dataInicioProgramado = dataInicioProgramadoData
            ? formatarDataBR(dataInicioProgramadoData)
            : (String(dataInicioProgramadoBruta || "").trim() || "N/A");
        const protocoloAtendimento = String(colunaProtocoloAtendimento ? obterValorDaLinha(linha, colunaProtocoloAtendimento, -1) : "").trim();

        registros.push({
            numeroOs,
            tecnico,
            dataRealizada,
            descricaoFechamento,
            statusOs,
            dataInicioProgramado,
            protocoloAtendimento
        });
    });

    return {
        registros,
        colunas,
        mapeamento: {
            colunaNumeroOs,
            colunaTecnico,
            colunaDataRealizada,
            colunaDescricaoFechamento,
            colunaStatusOs,
            colunaDataInicioProgramado,
            colunaProtocoloAtendimento
        },
        inferidosPorFallback
    };
}

async function processarArquivoImportacao(arquivo) {
    // Despacha o parser conforme extensão e retorna metadados para prévia e importação.
    if (!arquivo) {
        throw new Error("Selecione um arquivo XML, PDF ou Excel primeiro.");
    }

    const nomeArquivo = arquivo.name || "arquivo";
    const extensao = nomeArquivo.split(".").pop().toLowerCase();
    let registrosBrutos = [];
    let colunas = [];
    let tipoArquivo = "Arquivo";

    if (extensao === "xml") {
        const texto = await arquivo.text();
        registrosBrutos = extrairRegistrosBrutosDeXml(texto);
        colunas = obterChavesUnicasDeObjetos(registrosBrutos);
        tipoArquivo = "XML";
    } else if (extensao === "pdf") {
        const textoPdf = await extrairTextoPdf(await arquivo.arrayBuffer());
        const resultadoTabela = extrairRegistrosBrutosDeTextoTabela(textoPdf);
        registrosBrutos = resultadoTabela.registros;
        colunas = resultadoTabela.colunas;
        tipoArquivo = "PDF";
    } else if (extensao === "xls" || extensao === "xlsx" || extensao === "csv") {
        registrosBrutos = extrairRegistrosBrutosDePlanilha(await arquivo.arrayBuffer());
        colunas = registrosBrutos.length > 0 ? Object.keys(registrosBrutos[0]) : [];
        tipoArquivo = "Planilha Excel";
    } else {
        throw new Error("Formato nao suportado. Use XML, PDF ou Excel.");
    }

    return {
        nomeArquivo,
        tipoArquivo,
        registrosBrutos,
        colunas
    };
}

async function prepararPreviaImportacao(arquivo) {
    const resultado = await processarArquivoImportacao(arquivo);

    arquivoPreviaAtual = resultado;
    arquivoPreviaImportacao = resultado.nomeArquivo;
    atualizarSelectsDeMapeamento(resultado.colunas, resultado.registrosBrutos);
    autoAjustarMapeamentoAtual();

    if (resultado.registrosBrutos.length > 0) {
        atualizarStatus(`Arquivo carregado na previa. Confira os dados e clique em Importar arquivo.`);
    }
}

function atualizarPreviaComMapeamentoSelecionado() {
    if (!arquivoPreviaAtual) {
        atualizarStatusArquivo("Selecione um arquivo para aplicar o mapeamento.");
        return;
    }

    registrosPreviaImportacao = mapearRegistrosBrutos(arquivoPreviaAtual.registrosBrutos, obterConfiguracaoMapeamentoAtual());
    atualizarOpcoesFiltros();
    atualizarPreviaImportacao(registrosPreviaImportacao, arquivoPreviaAtual.nomeArquivo, arquivoPreviaAtual.tipoArquivo, arquivoPreviaAtual.colunas, "Mapeamento atualizado.");
    atualizarGraficoComDadosAtuais();
    atualizarAnalisesImportacao();
}

async function importarArquivo(arquivo) {
    // Confirma a prévia como base oficial da importação e sincroniza toda a interface.
    const arquivoSelecionado = arquivo || (arquivoInput.files && arquivoInput.files[0]);

    if (!arquivoSelecionado) {
        atualizarStatusArquivo("Selecione um arquivo XML ou PDF primeiro.");
        return;
    }

    // Recalcula tudo a partir da combinação de base manual + importada + filtros ativos.
    if (!registrosPreviaImportacao.length || arquivoPreviaImportacao !== arquivoSelecionado.name) {
        atualizarStatusArquivo(`Lendo ${arquivoSelecionado.name}...`);
        await prepararPreviaImportacao(arquivoSelecionado);
    }

    if (registrosPreviaImportacao.length === 0) {
        throw new Error("Nao foi possivel identificar linhas com mes e quantidade.");
    }

    registrosImportados = registrosPreviaImportacao.slice();
    salvarRegistrosPersistidos(importStorageKey, registrosImportados);
    atualizarOpcoesFiltros();
    atualizarGraficoComDadosAtuais();
    atualizarAnalisesImportacao();
    sincronizarRegistrosNoSupabase();
    atualizarStatus(`Arquivo importado com ${registrosImportados.length} registro(s).`);
    atualizarStatusArquivo(`Arquivo confirmado e importado: ${arquivoSelecionado.name}`);
}

function adicionarAtendimentoManual(mes, quantidade) {
    const mesLimpo = normalizarMes(mes);

    if (!mesLimpo) {
        atualizarStatus("Informe um mes valido para adicionar.");
        return;
    }

    const quantidadeNumero = Number(quantidade);

    if (!Number.isFinite(quantidadeNumero) || quantidadeNumero < 0) {
        atualizarStatus("Informe uma quantidade valida.");
        return;
    }

    const mesExistente = registrosManuais.find((item) => normalizarTextoBusca(item.mes) === normalizarTextoBusca(mesLimpo));

    if (mesExistente) {
        mesExistente.quantidade += quantidadeNumero;
    } else {
        registrosManuais.push({
            mes: mesLimpo,
            quantidade: quantidadeNumero
        });
    }

    salvarRegistrosPersistidos(manualStorageKey, registrosManuais);
    atualizarOpcoesFiltros();
    atualizarGraficoComDadosAtuais();
    sincronizarRegistrosNoSupabase();
    atualizarStatus(`Atendimento adicionado manualmente para ${mesLimpo}.`);
}

function atualizarGraficoComDadosAtuais() {
    const baseImportada = obterRegistrosImportacaoBase();

    if (baseImportada.length > 0 || registrosImportados.length > 0 || registrosPreviaImportacao.length > 0) {
        const registrosFiltrados = obterRegistrosFiltrados();
        registrosAtuais = consolidarProtocolosPorMes(registrosFiltrados);
        montarGrafico(registrosAtuais);
        atualizarGraficosAtendimentoPorDiaEHorario(registrosFiltrados);
        return;
    }

    registrosAtuais = combinarRegistros(registrosBase, registrosManuais);
    montarGrafico(registrosAtuais);
    atualizarGraficosAtendimentoPorDiaEHorario([]);
}

function montarGrafico(registros) {
    const registrosConsolidados = Array.isArray(registros) ? registros : [];
    const labels = registrosConsolidados.map((item) => obterRotuloMesEixo(item.mes));
    const valores = registrosConsolidados.map((item) => item.quantidade);
    const total = valores.reduce((acumulado, valor) => acumulado + (Number(valor) || 0), 0);

    const totaisPorTipo = new Map();

    registrosConsolidados.forEach((item) => {
        if (!item || !Array.isArray(item.detalhesMotivos)) {
            return;
        }

        item.detalhesMotivos.forEach((detalhe) => {
            const tipo = String((detalhe && detalhe.motivo) || "").trim();
            const quantidade = Number(detalhe && detalhe.quantidade) || 0;

            if (!tipo || quantidade <= 0) {
                return;
            }

            totaisPorTipo.set(tipo, (totaisPorTipo.get(tipo) || 0) + quantidade);
        });
    });

    const tiposSelecionados = Array.from(totaisPorTipo.entries())
        .sort((tipoA, tipoB) => {
            if (tipoB[1] !== tipoA[1]) {
                return tipoB[1] - tipoA[1];
            }

            return tipoA[0].localeCompare(tipoB[0], "pt-BR");
        })
        .slice(0, 5)
        .map((entrada) => entrada[0]);

    const datasetsTipos = tiposSelecionados.map((tipo, indiceTipo) => {
        const tonalidade = (indiceTipo * 53) % 360;

        return {
            label: `Tipo: ${tipo}`,
            data: registrosConsolidados.map((item) => {
                if (!item || !Array.isArray(item.detalhesMotivos)) {
                    return 0;
                }

                const detalhe = item.detalhesMotivos.find((entrada) => entrada.motivo === tipo);
                return detalhe ? detalhe.quantidade : 0;
            }),
            borderColor: `hsla(${tonalidade}, 72%, 44%, 0.85)`,
            backgroundColor: "transparent",
            borderWidth: 1.2,
            fill: false,
            tension: 0.25,
            pointRadius: 1.5,
            pointHoverRadius: 3,
            pointBackgroundColor: `hsla(${tonalidade}, 72%, 44%, 0.95)`,
            pointBorderWidth: 0
        };
    });

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Protocolos por mês",
                    data: valores,
                    borderColor: "#1d4ed8",
                    backgroundColor: "rgba(37, 99, 235, 0.2)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: "#0ea5e9",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2
                },
                ...datasetsTipos
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    bottom: 20
                }
            },
            interaction: {
                mode: "index",
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    labels: {
                        boxWidth: 14,
                        boxHeight: 8,
                        usePointStyle: true,
                        pointStyle: "line"
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(17, 24, 39, 0.85)",
                    padding: 8,
                    displayColors: false,
                    callbacks: {
                        title: () => "",
                        label: (contexto) => {
                            const label = contexto.dataset.label || "";
                            return label.replace("Tipo: ", "");
                        },
                        afterLabel: () => ""
                    }
                },
                datalabels: {
                    color: "#111827",
                    backgroundColor: "rgba(255, 255, 255, 0.88)",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "rgba(17, 24, 39, 0.08)",
                    clip: false,
                    clamp: true,
                    display: (contexto) => {
                        if (!contexto || contexto.datasetIndex > 0) {
                            return false;
                        }

                        const valor = Number(contexto.dataset.data[contexto.dataIndex]) || 0;
                        return valor > 0;
                    },
                    padding: {
                        top: 4,
                        right: 6,
                        bottom: 4,
                        left: 6
                    },
                    anchor: "end",
                    align: "top",
                    offset: 4,
                    font: {
                        weight: "700",
                        size: 11
                    },
                    formatter: (value, contexto) => {
                        const quantidade = Number(value) || 0;

                        if (!quantidade) {
                            return "";
                        }

                        if (!total) {
                            return String(quantidade);
                        }

                        const percentual = Math.round((quantidade / total) * 100);
                        return `${quantidade}\n${percentual}%`;
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Meses"
                    },
                    grid: {
                        color: "rgba(17, 24, 39, 0.08)"
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Quantidade por mes"
                    },
                    grid: {
                        color: "rgba(17, 24, 39, 0.08)"
                    }
                }
            }
        }
    });
}

function obterQuantidadeRegistro(registro) {
    const quantidade = Number(registro && registro.quantidade);
    return Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 1;
}

function obterDataReferenciaAtendimento(registro) {
    if (!registro) {
        return null;
    }

    return parsarDataRegistro(registro.dataAbertura)
        || parsarDataRegistro(registro.dataFechamento)
        || null;
}

function consolidarAtendimentosPorDia(registros) {
    const mapa = new Map();

    (registros || []).forEach((registro) => {
        const data = obterDataReferenciaAtendimento(registro);

        if (!data) {
            return;
        }

        const chave = [
            data.getFullYear(),
            String(data.getMonth() + 1).padStart(2, "0"),
            String(data.getDate()).padStart(2, "0")
        ].join("-");

        mapa.set(chave, (mapa.get(chave) || 0) + obterQuantidadeRegistro(registro));
    });

    return Array.from(mapa.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map((entrada) => {
            const partes = entrada[0].split("-");
            return {
                chave: entrada[0],
                rotulo: `${partes[2]}/${partes[1]}`,
                quantidade: entrada[1]
            };
        });
}

function obterIntervaloPorDias(registros, quantidadeDias) {
    const datas = (registros || [])
        .map((registro) => obterDataReferenciaAtendimento(registro))
        .filter(Boolean)
        .map((data) => data.getTime())
        .filter((valor) => Number.isFinite(valor));

    if (datas.length === 0) {
        return null;
    }

    const dias = Number.isInteger(quantidadeDias) && quantidadeDias > 0 ? quantidadeDias : 30;
    const fim = new Date(Math.max.apply(null, datas));
    const inicio = new Date(fim);
    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(inicio.getDate() - (dias - 1));

    return {
        inicio: inicio,
        fim: fim
    };
}

function filtrarRegistrosPorPeriodoDias(registros, quantidadeDias) {
    const intervalo = obterIntervaloPorDias(registros, quantidadeDias);

    if (!intervalo) {
        return [];
    }

    return (registros || []).filter((registro) => {
        const data = obterDataReferenciaAtendimento(registro);
        return data && data >= intervalo.inicio && data <= intervalo.fim;
    });
}

function obterRotuloFaixaHorario(faixa) {
    if (faixa === "madrugada") return "Madrugada";
    if (faixa === "manha") return "Manha";
    if (faixa === "tarde") return "Tarde";
    if (faixa === "noite") return "Noite";
    return "Todos os horarios";
}

function pertenceAFaixaHorario(hora, faixa) {
    if (faixa === "madrugada") return hora >= 0 && hora <= 5;
    if (faixa === "manha") return hora >= 6 && hora <= 11;
    if (faixa === "tarde") return hora >= 12 && hora <= 17;
    if (faixa === "noite") return hora >= 18 && hora <= 23;
    return true;
}

function consolidarAtendimentosPorHorario(registros, faixaHorario) {
    const contadores = new Array(24).fill(0);
    const faixa = ["todos", "madrugada", "manha", "tarde", "noite"].indexOf(faixaHorario) !== -1 ? faixaHorario : "todos";

    (registros || []).forEach((registro) => {
        const data = obterDataReferenciaAtendimento(registro);

        if (!data) {
            return;
        }

        const hora = data.getHours();

        if (hora >= 0 && hora <= 23 && pertenceAFaixaHorario(hora, faixa)) {
            contadores[hora] += obterQuantidadeRegistro(registro);
        }
    });

    return contadores;
}

function montarGraficoAtendimentosPorDia(registros) {
    if (!atendimentosDiaCanvas) {
        return;
    }

    if (atendimentosDiaChart) {
        atendimentosDiaChart.destroy();
        atendimentosDiaChart = null;
    }

    const serie = consolidarAtendimentosPorDia(registros);

    if (serie.length === 0) {
        return;
    }

    const tema = obterTemaGrafico();

    atendimentosDiaChart = new Chart(atendimentosDiaCanvas, {
        type: "line",
        data: {
            labels: serie.map((item) => item.rotulo),
            datasets: [{
                label: "Atendimentos por dia",
                data: serie.map((item) => item.quantidade),
                borderColor: CHART_PALETTE.blue,
                backgroundColor: "rgba(59, 130, 246, 0.16)",
                pointBackgroundColor: CHART_PALETTE.blue,
                pointBorderColor: tema.border,
                pointBorderWidth: 1,
                pointRadius: 3,
                pointHoverRadius: 5,
                borderWidth: 2,
                tension: 0.28,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    color: tema.dark ? "#e2e8f0" : "#1f2937",
                    anchor: "end",
                    align: "top",
                    offset: 2,
                    font: { size: 10, weight: "700" },
                    display: serie.length <= 15,
                    formatter: (valor) => (Number(valor) > 0 ? String(valor) : "")
                }
            },
            scales: {
                x: {
                    ticks: { color: tema.text, maxRotation: 45, minRotation: 0 },
                    grid: { color: tema.grid }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: tema.text, precision: 0 },
                    grid: { color: tema.grid },
                    title: { display: true, text: "Quantidade", color: tema.text }
                }
            }
        }
    });
}

function montarGraficoAtendimentosPorHorario(registros) {
    if (!atendimentosHorarioCanvas) {
        return;
    }

    if (atendimentosHorarioChart) {
        atendimentosHorarioChart.destroy();
        atendimentosHorarioChart = null;
    }

    const serie = consolidarAtendimentosPorHorario(registros, filtroHorarioFaixa);
    const total = serie.reduce((acumulado, valor) => acumulado + (Number(valor) || 0), 0);

    if (total <= 0) {
        return;
    }

    const tema = obterTemaGrafico();
    const labels = Array.from({ length: 24 }, (_, indice) => `${String(indice).padStart(2, "0")}:00`);

    atendimentosHorarioChart = new Chart(atendimentosHorarioCanvas, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Atendimentos por horario",
                data: serie,
                borderColor: CHART_PALETTE.warn,
                backgroundColor: "rgba(245, 158, 11, 0.2)",
                pointBackgroundColor: CHART_PALETTE.warn,
                pointRadius: 3,
                pointHoverRadius: 5,
                borderWidth: 2,
                tension: 0.35,
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
                x: {
                    ticks: {
                        color: tema.text,
                        maxTicksLimit: 12,
                        callback: (valor, indice) => (indice % 2 === 0 ? labels[indice] : "")
                    },
                    grid: { color: tema.grid }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: tema.text, precision: 0 },
                    grid: { color: tema.grid },
                    title: { display: true, text: "Quantidade", color: tema.text }
                }
            }
        }
    });
}

function atualizarGraficosAtendimentoPorDiaEHorario(registros) {
    const registrosDetalhados = Array.isArray(registros) ? registros : [];
    const periodoDias = [7, 30, 90].indexOf(Number(filtroPeriodoDias)) !== -1 ? Number(filtroPeriodoDias) : 30;
    const registrosPeriodo = filtrarRegistrosPorPeriodoDias(registrosDetalhados, periodoDias);
    const totalRegistros = registrosPeriodo.length;

    montarGraficoAtendimentosPorDia(registrosPeriodo);
    montarGraficoAtendimentosPorHorario(registrosPeriodo);

    const diasComData = consolidarAtendimentosPorDia(registrosPeriodo).length;
    const totalPorHorario = consolidarAtendimentosPorHorario(registrosPeriodo, filtroHorarioFaixa)
        .reduce((acumulado, valor) => acumulado + (Number(valor) || 0), 0);
    const descricaoFaixa = obterRotuloFaixaHorario(filtroHorarioFaixa);

    if (atendimentosDiaStatusElement) {
        atendimentosDiaStatusElement.textContent = diasComData > 0
            ? `${diasComData} dia(s) com dados nos ultimos ${periodoDias} dias (${totalRegistros} registro(s)).`
            : `Mapeie data_abertura/data_fechamento para visualizar atendimentos por dia (ultimos ${periodoDias} dias).`;
    }

    if (atendimentosHorarioStatusElement) {
        atendimentosHorarioStatusElement.textContent = totalPorHorario > 0
            ? `Distribuicao por horario (${descricaoFaixa}) com ${totalPorHorario} atendimento(s) nos ultimos ${periodoDias} dias.`
            : `Mapeie data_abertura/data_fechamento com hora para visualizar por horario (ultimos ${periodoDias} dias).`;
    }
}

/**
 * Limpa todos os selects de mapeamento de colunas.
 * Centraliza a lógica que antes era duplicada em três lugares.
 */
function limparSelectsMapeamento() {
    monthColumnSelect.innerHTML = "";
    quantityColumnSelect.innerHTML = "";
    userColumnSelect.innerHTML = "";
    resolutionColumnSelect.innerHTML = "";
    if (openingUserColumnSelect) openingUserColumnSelect.innerHTML = "";
    if (cidadeColumnSelect) cidadeColumnSelect.innerHTML = "";
    if (bairroColumnSelect) bairroColumnSelect.innerHTML = "";
    if (numeroPlanoColumnSelect) numeroPlanoColumnSelect.innerHTML = "";
    if (statusColumnSelect) statusColumnSelect.innerHTML = "";
    if (dataAberturaColumnSelect) dataAberturaColumnSelect.innerHTML = "";
    if (dataFechamentoColumnSelect) dataFechamentoColumnSelect.innerHTML = "";
    if (motivoFechamentoColumnSelect) motivoFechamentoColumnSelect.innerHTML = "";
    if (tipoAtendimentoColumnSelect) tipoAtendimentoColumnSelect.innerHTML = "";
    if (usuarioFechamentoColumnSelect) usuarioFechamentoColumnSelect.innerHTML = "";
    if (nomeClienteColumnSelect) nomeClienteColumnSelect.innerHTML = "";
    if (codigoClienteColumnSelect) codigoClienteColumnSelect.innerHTML = "";
}

/**
 * Reseta o painel de prévia para o estado inicial.
 */
function limparPainelPrevia() {
    previewSummaryElement.textContent = "Selecione um arquivo para ver as colunas detectadas.";
    previewTableBody.innerHTML = '<tr><td colspan="4">Nenhum dado carregado ainda.</td></tr>';
    if (pivotSummaryElement) pivotSummaryElement.textContent = "Aguardando dados para gerar o pivoteamento.";
    if (pivotTableHead) pivotTableHead.innerHTML = "<tr><th>Mes</th><th>Total</th></tr>";
    if (pivotTableBody) pivotTableBody.innerHTML = '<tr><td colspan="2">Nenhum dado pivoteado ainda.</td></tr>';
}

// Inicialização principal: hidrata dados, configura tela e gera primeiros gráficos.
async function inicializar() {
    registrosBase = await getAtendimentosPorMes();

    const dadosSupabase = await carregarRegistrosDoSupabase();

    if (dadosSupabase) {
        registrosImportados = dadosSupabase.imported;
        registrosManuais = dadosSupabase.manual;
        salvarRegistrosPersistidos(importStorageKey, registrosImportados);
        salvarRegistrosPersistidos(manualStorageKey, registrosManuais);
        atualizarStatusArquivo("Dados carregados do Supabase.");
    } else {
        registrosImportados = obterRegistrosPersistidos(importStorageKey);
        registrosManuais = obterRegistrosPersistidos(manualStorageKey);
    }

    atualizarOpcoesFiltros();

    const registrosOsPersistidos = obterRegistrosOsPersistidos();
    if (registrosOsPersistidos.length > 0) {
        atualizarIndiceOs(registrosOsPersistidos);
        const metaOs = obterMetaOsPersistida();
        const nomeArquivoOs = String((metaOs && metaOs.fileName) || "").trim();
        atualizarStatusArquivoOs(nomeArquivoOs
            ? `Arquivo OS restaurado: ${nomeArquivoOs} (${registrosOsPersistidos.length} OS).`
            : `Arquivo OS restaurado (${registrosOsPersistidos.length} OS).`);
    } else {
        atualizarStatusArquivoOs("Arquivo OS nao carregado.");
    }

    atualizarGraficoComDadosAtuais();
    atualizarAnalisesImportacao();
    if (!dadosSupabase) {
        atualizarStatusArquivo(registrosImportados.length > 0 ? "Importacao restaurada do navegador." : "Nenhum arquivo selecionado.");
    }
    if (registrosManuais.length > 0) {
        atualizarStatus(`Dados prontos. ${registrosManuais.length} registro(s) manual(is) restaurado(s).`);
    } else {
        atualizarStatus(registrosImportados.length > 0 ? "Dados prontos. Use o + ou importe um novo arquivo." : "Dados prontos. Use o + para adicionar manualmente ou importe um arquivo.");
    }
}

manualForm.addEventListener("submit", (event) => {
    event.preventDefault();
    adicionarAtendimentoManual(mesInput.value, quantidadeInput.value);
    manualForm.reset();
    mesInput.focus();
});

openManualFormButton.addEventListener("click", () => {
    const expanded = manualForm.classList.toggle("is-open");
    openManualFormButton.setAttribute("aria-expanded", String(expanded));

    if (expanded) {
        mesInput.focus();
    }
});

importButton.addEventListener("click", () => {
    const arquivo = arquivoInput.files && arquivoInput.files[0];

    importarArquivo(arquivo).catch((error) => {
        const mensagem = error && error.message ? error.message : "Falha ao importar arquivo.";
        atualizarStatusArquivo(mensagem);
        atualizarStatus(mensagem);
    });
});

applyMappingButton.addEventListener("click", () => {
    atualizarPreviaComMapeamentoSelecionado();
});

autoAdjustMappingButton.addEventListener("click", () => {
    autoAjustarMapeamentoAtual();
});

// ============================================================================
// FUNCOES DE EXPORTACAO - PDF E PPTX
// ============================================================================

/**
 * Aguarda o carregamento de uma biblioteca global
 */
async function aguardarBiblioteca(nomeGlobal, timeout = 10000) {
    const inicio = Date.now();

    while (!window[nomeGlobal] && (Date.now() - inicio) < timeout) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!window[nomeGlobal]) {
        throw new Error(`Biblioteca ${nomeGlobal} não foi carregada após ${timeout}ms`);
    }

    return window[nomeGlobal];
}

/**
 * Captura um canvas ou elemento DOM e converte para imagem
 */
async function capturarElementoComoImagem(elemento) {
    try {
        const html2canvas = await aguardarBiblioteca('html2canvas');
        const canvas = await html2canvas(elemento, {
            scale: 2,
            backgroundColor: "#ffffff",
            logging: false,
            useCORS: true,
            allowTaint: true
        });
        return canvas.toDataURL("image/png");
    } catch (error) {
        console.error("Erro ao capturar elemento:", error);
        return null;
    }
}

async function exportarStatusAbertosParaPDF(tipo) {
    const statusEl = document.getElementById("archivoStatus") || statusElement;
    const isAguardando = tipo === "aguardando_analise";
    const itens = isAguardando ? statusAbertosCache.aguardando : statusAbertosCache.pendentes;
    const titulo = isAguardando ? "Atendimentos Aguardando Analise" : "Atendimentos Pendentes";

    if (!itens || itens.length === 0) {
        statusEl.innerHTML = "❌ Nao ha atendimentos para exportar em PDF.";
        return;
    }

    try {
        statusEl.innerHTML = "🔄 Gerando PDF...";
        const jsPDFLib = await aguardarBiblioteca("jspdf", 10000);

        if (!jsPDFLib || !jsPDFLib.jsPDF) {
            throw new Error("Biblioteca de PDF indisponivel no navegador.");
        }

        const jsPDF = jsPDFLib.jsPDF;
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margem = 10;
        const maxWidth = pageWidth - (margem * 2);
        const linha = 5;
        let y = 16;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.text(titulo, margem, y);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        y += 7;
        doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}`, margem, y);
        y += 5;
        doc.text(`Total: ${itens.length}`, margem, y);
        y += 6;
        doc.setDrawColor(200, 200, 200);
        doc.line(margem, y, pageWidth - margem, y);
        y += 6;

        const garantirEspaco = (linhasNecessarias) => {
            if (y + (linhasNecessarias * linha) > pageHeight - 12) {
                doc.addPage();
                y = 16;
            }
        };

        itens.forEach((item, indice) => {
            const r = item && item.registro ? item.registro : {};
            const nome = String(r.nomeCliente || "-");
            const codigo = String(r.codigoCliente || "-");
            const aberturaPor = String(r.usuarioAbertura || "-");
            const tipoAtendimento = String(r.tipoAtendimento || "-");
            const dataAbertura = String(r.dataAbertura || "-");

            const linhasItem = [
                `${indice + 1}. ${nome}`,
                `Codigo: ${codigo}`,
                `Abertura por: ${aberturaPor}`,
                `Tipo atendimento: ${tipoAtendimento}`,
                `Data abertura: ${dataAbertura}`,
                ""
            ];

            garantirEspaco(linhasItem.length + 1);

            linhasItem.forEach((textoLinha, idx) => {
                if (!textoLinha) {
                    y += 2;
                    return;
                }

                doc.setFont("helvetica", idx === 0 ? "bold" : "normal");
                const quebradas = doc.splitTextToSize(textoLinha, maxWidth);
                doc.text(quebradas, margem, y);
                y += quebradas.length * linha;
            });

            doc.setDrawColor(230, 230, 230);
            doc.line(margem, y - 1, pageWidth - margem, y - 1);
            y += 3;
        });

        const dataArquivo = new Date().toISOString().split("T")[0];
        const nomeArquivo = isAguardando
            ? `Atendimentos_Aguardando_Analise_${dataArquivo}.pdf`
            : `Atendimentos_Pendentes_${dataArquivo}.pdf`;

        doc.save(nomeArquivo);
        statusEl.innerHTML = `✅ PDF exportado: ${nomeArquivo}`;
    } catch (error) {
        console.error("Erro ao exportar PDF de status:", error);
        statusEl.innerHTML = `❌ Erro ao exportar PDF: ${error.message}`;
    }
}

/**
 * Captura um Chart.js canvas como imagem
 */
function capturarChartComoImagem(chartCanvas) {
    try {
        return chartCanvas.toDataURL("image/png", 1);
    } catch (error) {
        console.error("Erro ao capturar gráfico:", error);
        return null;
    }
}

/**
 * Gera PDF com os dashboards organizados por seções
 */
async function exportarParaPDF() {
    const statusEl = document.getElementById("archivoStatus") || statusElement;
    try {
        statusEl.innerHTML = "🔄 Carregando bibliotecas...";
        statusEl.setAttribute("role", "status");

        // Aguardar o carregamento de jsPDF
        const jsPDFLib = await aguardarBiblioteca('jspdf', 10000);

        if (!jsPDFLib || !jsPDFLib.jsPDF) {
            throw new Error("jsPDF não foi carregado corretamente. Verifique sua conexão com a internet.");
        }

        statusEl.innerHTML = "🔄 Gerando PDF, aguarde...";

        const jsPDF = jsPDFLib.jsPDF;
        const doc = new jsPDF("p", "mm", "a4");
        let yPosition = 15;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const contentWidth = pageWidth - 2 * margin;

        // Titulo
        doc.setFontSize(20);
        doc.setTextColor(17, 24, 39);
        doc.text("Dashboard de Atendimentos", margin, yPosition);
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        const dataAtual = new Date().toLocaleDateString("pt-BR");
        doc.text(`Gerado em: ${dataAtual}`, margin, yPosition + 8);
        yPosition += 20;

        // Seccoes de graficos
        const secoes = [
            { titulo: "Curva de Atendimentos por Mês", canvas: document.getElementById("atendimentosChart") },
            { titulo: "Top Atendentes", canvas: document.getElementById("topUsersChart") },
            { titulo: "Resolvidos - Internos x Externos", canvas: document.getElementById("resolutionChart") },
            { titulo: "Distribuição SLA", canvas: document.getElementById("slaDistChart") },
            { titulo: "SLA por Tipo de Atendimento", canvas: document.getElementById("slaTipoChart") },
            { titulo: "Motivos de Fechamento", canvas: document.getElementById("motivoChart") },
            { titulo: "Tipos de Atendimento", canvas: document.getElementById("tipoChart") },
            { titulo: "Plano de Serviço", canvas: document.getElementById("planoServicoChart") },
            { titulo: "Atendimentos por Cidade", canvas: document.getElementById("cidadeChart") },
            { titulo: "Atendimentos por Bairro", canvas: document.getElementById("bairroChart") },
            { titulo: "Recorrentes", canvas: document.getElementById("recorrentesChart") },
            { titulo: "Status de Atendimentos", canvas: document.getElementById("atendimentoStatusChart") }
        ];

        let graficosAdicionados = 0;
        for (const secao of secoes) {
            if (!secao.canvas) continue;

            // Verificar se precisa nova página
            if (yPosition > pageHeight - 80) {
                doc.addPage();
                yPosition = margin;
            }

            // Titulo da seção
            doc.setFontSize(12);
            doc.setTextColor(17, 24, 39);
            doc.text(secao.titulo, margin, yPosition);
            yPosition += 8;

            // Capturar imagem do gráfico
            const imgData = capturarChartComoImagem(secao.canvas);
            if (imgData) {
                const imgWidth = contentWidth;
                const imgHeight = (secao.canvas.height * imgWidth) / secao.canvas.width;

                if (yPosition + imgHeight > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                }

                doc.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 10;
                graficosAdicionados++;
            }
        }

        if (graficosAdicionados === 0) {
            throw new Error("Nenhum gráfico foi encontrado. Carregue dados antes de exportar.");
        }

        // Salvar arquivo
        const nomeArquivo = `Dashboard_Atendimentos_${new Date().toISOString().split("T")[0]}.pdf`;
        doc.save(nomeArquivo);

        statusEl.innerHTML = `✅ PDF exportado com sucesso: ${nomeArquivo}`;
    } catch (error) {
        console.error("Erro na exportação PDF:", error);
        statusEl.innerHTML = `❌ Erro ao exportar PDF: ${error.message}`;
    }
}

/**
 * Gera PPTX (PowerPoint) com os dashboards organizados em slides
 */
async function exportarParaPPTX() {
    const statusEl = document.getElementById("archivoStatus") || statusElement;
    try {
        statusEl.innerHTML = "🔄 Carregando bibliotecas...";
        statusEl.setAttribute("role", "status");

        // Aguardar o carregamento de PptxGenJS
        const PptxGenLib = await aguardarBiblioteca('PptxGenJS', 10000);

        if (!PptxGenLib) {
            throw new Error("PptxGenJS não foi carregado corretamente. Verifique sua conexão com a internet.");
        }

        statusEl.innerHTML = "🔄 Gerando PPTX, aguarde...";

        const PptxGenJS = PptxGenLib;
        const prs = new PptxGenJS();

        // Configurar tema
        prs.defineLayout({ name: "LAYOUT1", width: 10, height: 7.5 });
        prs.defineLayout({ name: "LAYOUT2", width: 10, height: 7.5 });

        // Slide título
        const slideTitle = prs.addSlide();
        slideTitle.background = { color: "1a1f36" };

        slideTitle.addText("Dashboard de Atendimentos", {
            x: 0.5,
            y: 2,
            w: 9,
            h: 1.5,
            fontSize: 44,
            bold: true,
            color: "ffffff",
            align: "center"
        });

        slideTitle.addText(`Relatório Executivo - ${new Date().toLocaleDateString("pt-BR")}`, {
            x: 0.5,
            y: 3.7,
            w: 9,
            h: 0.8,
            fontSize: 18,
            color: "b0b9c6",
            align: "center"
        });

        // Seções de gráficos
        const secoes = [
            { titulo: "Curva de Atendimentos\nPor Mês", canvas: document.getElementById("atendimentosChart") },
            { titulo: "Top Atendentes", canvas: document.getElementById("topUsersChart") },
            { titulo: "Resolvidos: Internos\nvs Externos", canvas: document.getElementById("resolutionChart") },
            { titulo: "Distribuição SLA", canvas: document.getElementById("slaDistChart") },
            { titulo: "SLA por Tipo de\nAtendimento", canvas: document.getElementById("slaTipoChart") },
            { titulo: "Motivos de\nFechamento", canvas: document.getElementById("motivoChart") },
            { titulo: "Tipos de\nAtendimento", canvas: document.getElementById("tipoChart") },
            { titulo: "Plano de Serviço", canvas: document.getElementById("planoServicoChart") },
            { titulo: "Atendimentos por\nCidade", canvas: document.getElementById("cidadeChart") },
            { titulo: "Atendimentos por\nBairro", canvas: document.getElementById("bairroChart") },
            { titulo: "Recorrentes", canvas: document.getElementById("recorrentesChart") },
            { titulo: "Status de\nAtendimentos", canvas: document.getElementById("atendimentoStatusChart") }
        ];

        let slidesAdicionados = 0;
        for (const secao of secoes) {
            if (!secao.canvas) continue;

            const slide = prs.addSlide();
            slide.background = { color: "f3f6f9" };

            // Titulo do slide
            slide.addText(secao.titulo, {
                x: 0.5,
                y: 0.3,
                w: 9,
                h: 0.6,
                fontSize: 24,
                bold: true,
                color: "1a1f36"
            });

            // Capturar e adicionar imagem do gráfico
            const imgData = capturarChartComoImagem(secao.canvas);
            if (imgData) {
                slide.addImage({
                    data: imgData,
                    x: 0.5,
                    y: 1.1,
                    w: 9,
                    h: 6
                });
                slidesAdicionados++;
            } else {
                slide.addText("Gráfico indisponível", {
                    x: 0.5,
                    y: 3,
                    w: 9,
                    h: 1,
                    fontSize: 14,
                    color: "999999",
                    align: "center"
                });
            }
        }

        if (slidesAdicionados === 0) {
            throw new Error("Nenhum gráfico foi encontrado. Carregue dados antes de exportar.");
        }

        // Slide de resumo final
        const slideResume = prs.addSlide();
        slideResume.background = { color: "1a1f36" };
        slideResume.addText("Fim do Relatório", {
            x: 0.5,
            y: 2.5,
            w: 9,
            h: 1,
            fontSize: 32,
            bold: true,
            color: "ffffff",
            align: "center"
        });

        // Salvar arquivo
        const nomeArquivo = `Dashboard_Atendimentos_${new Date().toISOString().split("T")[0]}.pptx`;
        prs.writeFile({ fileName: nomeArquivo });

        statusEl.innerHTML = `✅ PPTX exportado com sucesso: ${nomeArquivo}`;
    } catch (error) {
        console.error("Erro na exportação PPTX:", error);
        statusEl.innerHTML = `❌ Erro ao exportar PPTX: ${error.message}`;
    }
}

// Adicionar event listeners aos botões de exportação
document.addEventListener("DOMContentLoaded", () => {
    const exportPdfBtn = document.getElementById("exportPdfBtn");
    const exportPptxBtn = document.getElementById("exportPptxBtn");
    const statusAbertosLista = document.getElementById("statusAbertosLista");

    if (exportPdfBtn) {
        exportPdfBtn.addEventListener("click", exportarParaPDF);
    }

    if (exportPptxBtn) {
        exportPptxBtn.addEventListener("click", exportarParaPPTX);
    }

    if (statusAbertosLista) {
        statusAbertosLista.addEventListener("click", (event) => {
            const alvo = event.target;
            const botao = alvo && typeof alvo.closest === "function"
                ? alvo.closest("button[data-status-export]")
                : null;

            if (!botao) {
                return;
            }

            const tipo = String(botao.getAttribute("data-status-export") || "").trim();
            if (tipo === "aguardando_analise" || tipo === "pendente") {
                exportarStatusAbertosParaPDF(tipo);
            }
        });
    }
});

if (togglePreviewPanelButton && previewPanel) {
    togglePreviewPanelButton.addEventListener("click", () => {
        const recolhido = previewPanel.classList.toggle("is-collapsed");
        togglePreviewPanelButton.setAttribute("aria-expanded", String(!recolhido));
    });
}

if (toggleFilterSectionButton && filterSection) {
    toggleFilterSectionButton.addEventListener("click", () => {
        if (!filtrosAnaliseDisponiveis) {
            return;
        }

        const estaOculto = filterSection.classList.contains("filter-section--hidden");
        definirVisibilidadeFiltrosAnalise(estaOculto);
    });
}

const clientesPendentesListaElement = document.getElementById("clientesPendentesLista");

if (clientesPendentesListaElement) {
    clientesPendentesListaElement.addEventListener("click", (event) => {
        const alvo = event.target;
        const botao = alvo && typeof alvo.closest === "function"
            ? alvo.closest("button[data-tipo-atraso]")
            : null;

        if (!botao) {
            return;
        }

        const proximoFiltro = String(botao.getAttribute("data-tipo-atraso") || "").trim();

        if (["todos", "externo", "remoto"].indexOf(proximoFiltro) === -1 || proximoFiltro === filtroTipoAtraso) {
            return;
        }

        filtroTipoAtraso = proximoFiltro;
        atualizarAnalisesImportacao();
    });
}

if (resolutionTopListElement) {
    const aplicarFiltroModalidadeResolucao = (alvo) => {
        const bloco = alvo && typeof alvo.closest === "function"
            ? alvo.closest("[data-modalidade]")
            : null;

        if (!bloco) {
            return;
        }

        const modalidade = String(bloco.getAttribute("data-modalidade") || "").trim();

        if (["remoto", "externo"].indexOf(modalidade) === -1) {
            return;
        }

        filtroModalidadeResolucao = filtroModalidadeResolucao === modalidade ? "todos" : modalidade;
        atualizarAnalisesImportacao();
    };

    resolutionTopListElement.addEventListener("click", (event) => {
        aplicarFiltroModalidadeResolucao(event.target);
    });

    resolutionTopListElement.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }

        event.preventDefault();
        aplicarFiltroModalidadeResolucao(event.target);
    });
}

if (slaFilterGroup) {
    const aplicarFiltroModalidadeSla = (alvo) => {
        const botao = alvo && typeof alvo.closest === "function"
            ? alvo.closest("button[data-modalidade-sla]")
            : null;

        if (!botao) return;

        const modalidade = String(botao.getAttribute("data-modalidade-sla") || "").trim();
        if (["todos", "externo", "remoto"].indexOf(modalidade) === -1) return;

        // Alterna: ao clicar novamente no mesmo botão volta para 'todos'
        filtroModalidadeSla = filtroModalidadeSla === modalidade ? "todos" : modalidade;

        // Função utilitária para atualizar um grupo de botões (header ou painel)
        const atualizarGrupo = (grupoEl) => {
            if (!grupoEl) return;
            grupoEl.querySelectorAll("button[data-modalidade-sla]").forEach((b) => {
                const m = String(b.getAttribute("data-modalidade-sla") || "");
                const ativo = m === filtroModalidadeSla;
                b.classList.toggle("is-active", ativo);
                b.setAttribute("aria-pressed", ativo ? "true" : "false");
            });
        };

        // Atualiza ambos os grupos (se existirem)
        atualizarGrupo(slaFilterGroup);
        atualizarGrupo(slaFilterPanel);

        atualizarAnalisesImportacao();
    };

    // Eventos para ambos os grupos
    [slaFilterGroup, slaFilterPanel].forEach((grupo) => {
        if (!grupo) return;
        grupo.addEventListener("click", (event) => aplicarFiltroModalidadeSla(event.target));
        grupo.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            aplicarFiltroModalidadeSla(event.target);
        });
    });
}

if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", () => {
        atualizarGraficoComDadosAtuais();
        atualizarAnalisesImportacao();
        atualizarRotuloBotaoFiltrosAnalise();
    });
}

if (calcLentidaoKpiBtn) {
    calcLentidaoKpiBtn.addEventListener("click", () => {
        const registrosImportacaoBase = obterRegistrosImportacaoBase();
        const registrosAnalise = registrosImportacaoBase.length > 0 ? obterRegistrosFiltrados() : [];
        atualizarKpiIncidenciaLentidao(registrosAnalise);
    });
}

if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
        if (filterOpeningUser) {
            Array.from(filterOpeningUser.options || []).forEach((opcao) => {
                opcao.selected = false;
            });
        }

        if (filterResponsibleUser) {
            Array.from(filterResponsibleUser.options || []).forEach((opcao) => {
                opcao.selected = false;
            });
        }

        if (filterServiceType) {
            Array.from(filterServiceType.options || []).forEach((opcao) => {
                opcao.selected = false;
            });
        }

        if (filterCity) {
            Array.from(filterCity.options || []).forEach((opcao) => {
                opcao.selected = false;
            });
        }

        if (filterBairro) {
            Array.from(filterBairro.options || []).forEach((opcao) => {
                opcao.selected = false;
            });
        }

        if (filterMonth) {
            Array.from(filterMonth.options || []).forEach((opcao) => {
                opcao.selected = false;
            });
        }

        if (filterOpeningUserSearch) {
            filterOpeningUserSearch.value = "";
        }

        if (filterResponsibleUserSearch) {
            filterResponsibleUserSearch.value = "";
        }

        if (filterServiceTypeSearch) {
            filterServiceTypeSearch.value = "";
        }

        if (filterCitySearch) {
            filterCitySearch.value = "";
        }

        if (filterBairroSearch) {
            filterBairroSearch.value = "";
        }

        if (filterMonthSearch) {
            filterMonthSearch.value = "";
        }

        atualizarInterfaceFiltrosMultiplos();

        atualizarGraficoComDadosAtuais();
        atualizarAnalisesImportacao();
        atualizarRotuloBotaoFiltrosAnalise();
    });
}

if (filterOpeningUserSearch) {
    filterOpeningUserSearch.addEventListener("input", () => {
        atualizarInterfaceFiltrosMultiplos();
    });
}

if (filterResponsibleUserSearch) {
    filterResponsibleUserSearch.addEventListener("input", () => {
        atualizarInterfaceFiltrosMultiplos();
    });
}

if (filterServiceTypeSearch) {
    filterServiceTypeSearch.addEventListener("input", () => {
        atualizarInterfaceFiltrosMultiplos();
    });
}

if (filterCitySearch) {
    filterCitySearch.addEventListener("input", () => {
        atualizarInterfaceFiltrosMultiplos();
    });
}

if (filterBairroSearch) {
    filterBairroSearch.addEventListener("input", () => {
        atualizarInterfaceFiltrosMultiplos();
    });
}

if (filterMonthSearch) {
    filterMonthSearch.addEventListener("input", () => {
        atualizarInterfaceFiltrosMultiplos();
    });
}

if (arquivoOsInput) {
    arquivoOsInput.addEventListener("change", () => {
        const arquivo = arquivoOsInput.files && arquivoOsInput.files[0];

        if (!arquivo) {
            atualizarIndiceOs([]);
            atualizarStatusArquivoOs("Arquivo OS nao carregado.");
            atualizarAnalisesImportacao();
            return;
        }

        atualizarStatusArquivoOs(`Lendo arquivo OS: ${arquivo.name}...`);

        processarArquivoOrdemServico(arquivo)
            .then((resultado) => {
                atualizarIndiceOs(resultado.registros);
                salvarRegistrosOsPersistidos(resultado.registros, arquivo.name);
                const mapeamento = resultado && resultado.mapeamento ? resultado.mapeamento : {};
                const colunaOsInfo = mapeamento.colunaNumeroOs ? mapeamento.colunaNumeroOs : "fallback por conteudo";
                const inferidos = Number(resultado && resultado.inferidosPorFallback) || 0;
                atualizarStatusArquivoOs(`Arquivo OS carregado: ${arquivo.name} (${resultado.registros.length} OS mapeadas, coluna OS: ${colunaOsInfo}, fallback: ${inferidos}).`);
                atualizarAnalisesImportacao();
            })
            .catch((error) => {
                atualizarIndiceOs([]);
                limparPersistenciaOs();
                const mensagem = error && error.message ? error.message : "Falha ao ler arquivo OS.";
                atualizarStatusArquivoOs(mensagem);
            });
    });
}

if (recorrenteSearchElement) {
    recorrenteSearchElement.addEventListener("input", () => {
        montarTabelaRecorrentes(recorrentesTabelaBase);
    });
}

if (recorrenteSortElement) {
    recorrenteSortElement.addEventListener("change", () => {
        montarTabelaRecorrentes(recorrentesTabelaBase);
    });
}

if (filterHorarioFaixaSelect) {
    filterHorarioFaixaSelect.addEventListener("change", () => {
        const valor = String(filterHorarioFaixaSelect.value || "todos").trim();
        filtroHorarioFaixa = ["todos", "madrugada", "manha", "tarde", "noite"].indexOf(valor) !== -1 ? valor : "todos";
        atualizarGraficoComDadosAtuais();
    });
}

if (filterPeriodoDiasSelect) {
    filterPeriodoDiasSelect.addEventListener("change", () => {
        const valor = Number(filterPeriodoDiasSelect.value);
        filtroPeriodoDias = [7, 30, 90].indexOf(valor) !== -1 ? valor : 30;
        atualizarGraficoComDadosAtuais();
    });
}

monthColumnSelect.addEventListener("change", () => {
    atualizarPreviaComMapeamentoSelecionado();
});

quantityColumnSelect.addEventListener("change", () => {
    atualizarPreviaComMapeamentoSelecionado();
});

arquivoInput.addEventListener("change", () => {
    const arquivo = arquivoInput.files && arquivoInput.files[0];

    if (arquivo) {
        prepararPreviaImportacao(arquivo).catch((error) => {
            const mensagem = error && error.message ? error.message : "Falha ao ler arquivo.";
            registrosPreviaImportacao = [];
            arquivoPreviaImportacao = "";
            arquivoPreviaAtual = null;
            limparSelectsMapeamento();
            limparPainelPrevia();
            atualizarOpcoesFiltros();
            atualizarGraficoComDadosAtuais();
            atualizarAnalisesImportacao();
            atualizarStatusArquivo(mensagem);
            atualizarStatus(mensagem);
        });
    } else {
        registrosPreviaImportacao = [];
        arquivoPreviaImportacao = "";
        arquivoPreviaAtual = null;
        limparSelectsMapeamento();
        limparPainelPrevia();
        atualizarOpcoesFiltros();
        atualizarGraficoComDadosAtuais();
        atualizarAnalisesImportacao();
        sincronizarRegistrosNoSupabase();
        atualizarStatusArquivo("Nenhum arquivo selecionado.");
    }
});

clearImportButton.addEventListener("click", () => {
    registrosImportados = [];
    registrosPreviaImportacao = [];
    arquivoPreviaImportacao = "";
    arquivoPreviaAtual = null;
    atualizarIndiceOs([]);
    limparPersistenciaOs();
    if (arquivoOsInput) {
        arquivoOsInput.value = "";
    }
    salvarRegistrosPersistidos(importStorageKey, registrosImportados);
    atualizarOpcoesFiltros();
    atualizarGraficoComDadosAtuais();
    atualizarAnalisesImportacao();
    arquivoInput.value = "";
    limparSelectsMapeamento();
    limparPainelPrevia();
    sincronizarRegistrosNoSupabase();
    atualizarStatusArquivo("Importacao removida.");
    atualizarStatusArquivoOs("Arquivo OS nao carregado.");
    atualizarStatus("Importacao limpa. O sistema voltou a usar a base padrao.");
});

// ─── Filtro rápido por equipe ─────────────────────────────────────────────────

function aplicarFiltroEquipe(prefixos) {
    if (!filterOpeningUser) return;

    // Seleciona no <select> todos os nomes que começam com algum dos prefixos
    Array.from(filterOpeningUser.options || []).forEach((opcao) => {
        const nomeNorm = normalizarTextoBusca(opcao.value);
        opcao.selected = prefixos.some((p) => nomeNorm.startsWith(p));
    });

    // Atualiza a interface de checkboxes customizados (se existir)
    atualizarInterfaceFiltrosMultiplos();

    // Dispara o filtro
    atualizarGraficoComDadosAtuais();
    atualizarAnalisesImportacao();
    atualizarRotuloBotaoFiltrosAnalise();
}

const filtroEquipeSuporteBtn = document.getElementById("filtroEquipeSuporte");
const filtroEquipeLimparBtn = document.getElementById("filtroEquipeLimpar");

if (filtroEquipeSuporteBtn) {
    filtroEquipeSuporteBtn.addEventListener("click", () => {
        aplicarFiltroEquipe(EQUIPE_SUPORTE_PREFIXOS);
    });
}

if (filtroEquipeLimparBtn) {
    filtroEquipeLimparBtn.addEventListener("click", () => {
        // Desmarca apenas o filtro de abertura; outros filtros permanecem
        if (filterOpeningUser) {
            Array.from(filterOpeningUser.options || []).forEach((o) => { o.selected = false; });
        }
        if (filterOpeningUserSearch) filterOpeningUserSearch.value = "";
        atualizarInterfaceFiltrosMultiplos();
        atualizarGraficoComDadosAtuais();
        atualizarAnalisesImportacao();
        atualizarRotuloBotaoFiltrosAnalise();
    });
}

inicializar().catch((error) => {
    const mensagem = error && error.message ? error.message : "Falha ao inicializar dashboard.";
    atualizarStatus(mensagem);
});
