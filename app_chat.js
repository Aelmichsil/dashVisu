// ============================================================
// Dashboard de Atendimentos via Chat — app_chat.js
// Compatível com o relatório CSV do sistema de chat (separador ;)
// Colunas esperadas: Agente, Serviço, Contato, Protocolo, Canal,
//   Data de Entrada, Data de Atendimento, Data de finalização,
//   Tempo em Fila, Tempo de Atendimento, Tempo em Pendência,
//   TMIC, TMIA, Status, Tipo, Classificação, Recorrância, Ativo/Receptivo?
// ============================================================

if (window.ChartDataLabels && window.Chart && typeof window.Chart.register === 'function') {
    window.Chart.register(window.ChartDataLabels);
}

// ── Estado global ────────────────────────────────────────────
let chatRegistrosBrutos = [];
let chatRegistrosFiltrados = [];
let chatEstatisticasAgentes = new Map();
const CHAT_STORAGE_KEY = 'chat-registros-v1';
const CHAT_STATS_STORAGE_KEY = 'chat-estatisticas-v1';
const CHAT_FILE_META_KEY = 'chat-file-meta-v1';
const RECORRENCIA_CONTATOS_POR_PAGINA = 10;
const recorrenciaPaginaAtual = {
    Reincidente: 1,
    Recorrente: 1,
    Rechamada: 1
};

// ── Instâncias de gráficos ───────────────────────────────────
let chatCurvaChart, chatDiaSemanaChart, chatAgentesChart, chatStatusChart,
    chatTipoChart, chatServicoChart, chatClassifChart, chatModoChart,
    chatRecorrenciaChart, chatTemposChart, chatHorarioChart, chatCanalChart;

// ── Paleta ───────────────────────────────────────────────────
const CAT = ['#14b8a6', '#0ea5e9', '#6366f1', '#22c55e', '#f59e0b', '#a855f7',
    '#f97316', '#84cc16', '#ec4899', '#64748b', '#06b6d4', '#ef4444'];

// ── Helpers ──────────────────────────────────────────────────
function obterElementoPorId(id) { return document.getElementById(id); }

function atualizarTextoPorId(id, texto) {
    const elemento = obterElementoPorId(id);
    if (elemento) elemento.textContent = texto;
}

function obterTema() {
    const dark = Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return {
        text: dark ? '#cbd5e1' : '#4b5563',
        border: dark ? '#e2e8f0' : '#ffffff',
        grid: dark ? 'rgba(148,163,184,.24)' : 'rgba(17,24,39,.08)'
    };
}

function destroyChart(ref) {
    if (ref && typeof ref.destroy === 'function') ref.destroy();
}

/** Converte "HH:MM:SS" em segundos */
function tempoParaSegundos(str) {
    if (!str || str === '-' || str.trim() === '') return null;
    const partes = String(str).trim().split(':');
    if (partes.length !== 3) return null;
    const h = parseInt(partes[0], 10);
    const m = parseInt(partes[1], 10);
    const s = parseInt(partes[2], 10);
    if (isNaN(h) || isNaN(m) || isNaN(s)) return null;
    return h * 3600 + m * 60 + s;
}

/** Formata segundos como "Xm Ys" ou "Xh Ym" */
function formatarTempo(seg) {
    if (seg === null || seg === undefined || isNaN(seg)) return '—';
    const totalSeg = Math.max(0, Math.round(Number(seg)));
    const h = Math.floor(totalSeg / 3600);
    const m = Math.floor((totalSeg % 3600) / 60);
    if (h > 0) return `${h}h ${m}min`;
    if (m > 0) return `${m}min`;
    return '<1min';
}

function formatarMinutosEmHorasMinutos(minutos) {
    if (minutos === null || minutos === undefined || isNaN(minutos)) return '—';
    const totalMin = Math.max(0, Math.round(Number(minutos)));
    const horas = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    if (horas > 0) return `${horas}h ${mins}min`;
    return `${mins}min`;
}

/** Média de um array de números (ignora nulos) */
function mediaArray(arr) {
    const validos = arr.filter(v => v !== null && !isNaN(v));
    if (!validos.length) return null;
    return Math.round(validos.reduce((a, b) => a + b, 0) / validos.length);
}

/** Parse date string "DD/MM/YYYY HH:MM:SS" → Date */
function parsarData(str) {
    if (!str || str === '-') return null;
    const m = String(str).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (!m) return null;
    return new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +m[6]);
}

/** Normaliza cabeçalho de coluna (remove acentos, espaços extras, lower) */
function normalCol(str) {
    return String(str || '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function normalizarRecorrencia(valor) {
    const texto = String(valor || '').trim();
    if (!texto) return '1 vez';
    if (/^[-–—−]+$/.test(texto)) return '1 vez';
    if (texto === '1' || texto === '1x' || texto === '1 vez' || texto === 'uma vez') return '1 vez';
    return texto;
}

/** Obtém valor de uma linha pelo nome da coluna (case-insensitive) */
function getCol(row, name) {
    const key = Object.keys(row).find(k => normalCol(k) === normalCol(name));
    return key !== undefined ? String(row[key] || '').trim() : '';
}

function normalizarChaveAgente(nome) {
    return normalizarTextoBusca(nome || '').replace(/\s+/g, ' ');
}

function numeroPtBr(valor) {
    if (valor === null || valor === undefined || valor === '') return null;
    if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
    const normalizado = String(valor).trim().replace(/\./g, '').replace(',', '.');
    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : null;
}

function linhaVazia(row) {
    return !row || Object.values(row).every(v => String(v || '').trim() === '');
}

const MESES_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function mesNomeFromDate(d) {
    if (!d) return '';
    return MESES_PT[d.getMonth()] + ' ' + d.getFullYear();
}

// ── HELPERS PARA FILTROS COM BUSCA ──────────────────────────
function escaparHtml(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function normalizarTextoBusca(texto) {
    return String(texto || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function obterValoresSelecionadosDoFiltroChat(select) {
    if (!select) return [];
    return Array.from(select.selectedOptions || [])
        .map((opcao) => String(opcao.value || "").trim())
        .filter(Boolean);
}

function renderizarOpcoesFiltroChat(select, inputBusca, containerOpcoes) {
    if (!select || !containerOpcoes) return;

    const termoBusca = normalizarTextoBusca(inputBusca ? inputBusca.value : "");
    const selecionados = new Set(obterValoresSelecionadosDoFiltroChat(select).map((valor) => normalizarTextoBusca(valor)));

    const opcoes = Array.from(select.options || []).filter((opcao) => {
        const valor = String(opcao.value || "").trim();
        if (!valor) return false;
        const texto = String(opcao.textContent || valor);
        const chave = normalizarTextoBusca(texto);
        return !termoBusca || chave.indexOf(termoBusca) !== -1;
    });

    if (opcoes.length === 0) {
        containerOpcoes.innerHTML = '<div class="filter-options-empty">Nenhuma opção encontrada.</div>';
        return;
    }

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
        });
    });
}

// ── PARSING DO CSV ───────────────────────────────────────────
function parsearCSVChat(texto) {
    const SEP = ';';
    const linhas = texto.split(/\r?\n/);
    if (linhas.length < 2) return [];

    // Cabeçalho
    const cabecalho = linhas[0].split(SEP).map(c => c.replace(/^"|"$/g, '').trim());

    const registros = [];

    for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i];
        if (!linha.trim()) continue;

        // Split respeitando aspas
        const colunas = [];
        let inside = false, current = '';
        for (let ci = 0; ci < linha.length; ci++) {
            const ch = linha[ci];
            if (ch === '"') { inside = !inside; }
            else if (ch === SEP && !inside) { colunas.push(current); current = ''; }
            else { current += ch; }
        }
        colunas.push(current);

        const row = {};
        cabecalho.forEach((col, idx) => {
            row[col] = (colunas[idx] || '').replace(/^"|"$/g, '').trim();
        });

        registros.push(row);
    }

    // Mapear para objeto normalizado
    return registros.map(row => {
        const dataEntrada = parsarData(getCol(row, 'Data de Entrada'));
        const dataFin = parsarData(getCol(row, 'Data de finalização') || getCol(row, 'Data de finalizacao'));
        const agente = getCol(row, 'Agente');
        const servico = getCol(row, 'Serviço') || getCol(row, 'Servico');
        const contato = getCol(row, 'Contato');
        const protocolo = getCol(row, 'Protocolo');
        const canal = getCol(row, 'Canal');
        const status = getCol(row, 'Status');
        const tipo = getCol(row, 'Tipo');
        const classif = getCol(row, 'Classificação') || getCol(row, 'Classificacao');
        const recorrencia = getCol(row, 'Recorrância') || getCol(row, 'Recorrencia') || getCol(row, 'Recorrência');
        const modo = getCol(row, 'Ativo/Receptivo?') || getCol(row, 'Ativo/Receptivo');

        return {
            agente: agente || '(sem agente)',
            servico: servico || '(sem serviço)',
            contato,
            protocolo,
            canal: canal || 'Whatsapp',
            dataEntrada,
            dataFin,
            mes: dataEntrada ? mesNomeFromDate(dataEntrada) : '',
            diaSemana: dataEntrada ? dataEntrada.getDay() : null,
            hora: dataEntrada ? dataEntrada.getHours() : null,
            status: status || '',
            tipo: tipo || '',
            classif: classif || 'Padrão',
            recorrencia: normalizarRecorrencia(recorrencia),
            modo: modo || '',
            tmFila: tempoParaSegundos(getCol(row, 'Tempo em Fila')),
            tmAtend: tempoParaSegundos(getCol(row, 'Tempo de Atendimento')),
            tmPend: tempoParaSegundos(getCol(row, 'Tempo em Pendência') || getCol(row, 'Tempo em Pendencia')),
            tmic: tempoParaSegundos(getCol(row, 'TMIC')),
            tmia: tempoParaSegundos(getCol(row, 'TMIA')),
            finalizado: /finaliz/i.test(status)
        };
    }).filter(r => r.dataEntrada || r.agente !== '(sem agente)');
}

function normalizarRegistroEstatistico(row) {
    const agente = getCol(row, 'Agente');
    if (!agente) return null;

    return {
        agente,
        quantidade: numeroPtBr(getCol(row, 'Quantidade')) || 0,
        qma: numeroPtBr(getCol(row, 'QMA')) || 0,
        te: tempoParaSegundos(getCol(row, 'TE')),
        tme: tempoParaSegundos(getCol(row, 'TME')),
        ta: tempoParaSegundos(getCol(row, 'TA')),
        tma: tempoParaSegundos(getCol(row, 'TMA')),
        tp: tempoParaSegundos(getCol(row, 'TP')),
        tmp: tempoParaSegundos(getCol(row, 'TMP')),
        tmic: tempoParaSegundos(getCol(row, 'TMIC')),
        tmia: tempoParaSegundos(getCol(row, 'TMIA')),
        ate20s: numeroPtBr(getCol(row, 'Até 20s') || getCol(row, 'Ate 20s')) || 0,
        ate60s: numeroPtBr(getCol(row, 'Até 60s') || getCol(row, 'Ate 60s')) || 0,
        percentual: numeroPtBr(getCol(row, '%')) || 0
    };
}

function parsearXlsxChatEstatistico(arrayBuffer) {
    if (!window.XLSX || typeof window.XLSX.read !== 'function') {
        throw new Error('Biblioteca XLSX nao carregada. Recarregue a pagina e tente novamente.');
    }

    const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
    const primeiraAba = workbook.SheetNames && workbook.SheetNames[0];
    if (!primeiraAba) return new Map();

    const sheet = workbook.Sheets[primeiraAba];
    const rows = window.XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const mapa = new Map();

    rows.forEach((row) => {
        if (linhaVazia(row)) return;
        const item = normalizarRegistroEstatistico(row);
        if (!item || /^total$/i.test(item.agente)) return;
        mapa.set(normalizarChaveAgente(item.agente), item);
    });

    return mapa;
}

function estatisticasParaArray(mapa) {
    return Array.from((mapa || new Map()).values());
}

function restaurarEstatisticasChat(lista) {
    const mapa = new Map();
    (Array.isArray(lista) ? lista : []).forEach((item) => {
        if (!item || !item.agente) return;
        mapa.set(normalizarChaveAgente(item.agente), item);
    });
    return mapa;
}

function obterEstatisticaAgente(nome) {
    if (!chatEstatisticasAgentes || !chatEstatisticasAgentes.size) return null;
    return chatEstatisticasAgentes.get(normalizarChaveAgente(nome)) || null;
}

function mediaPonderadaEstatistica(campoTempo) {
    const itens = estatisticasParaArray(chatEstatisticasAgentes).filter((item) => {
        return item && item[campoTempo] !== null && item[campoTempo] !== undefined && Number(item.quantidade) > 0;
    });
    const peso = itens.reduce((acc, item) => acc + Number(item.quantidade || 0), 0);
    if (!peso) return null;
    return Math.round(itens.reduce((acc, item) => acc + Number(item[campoTempo] || 0) * Number(item.quantidade || 0), 0) / peso);
}
// ── FILTROS ──────────────────────────────────────────────────
function obterFiltrosAtuais() {
    const selectAgente = obterElementoPorId('chatFiltroAgente');
    const selectServico = obterElementoPorId('chatFiltroServico');
    const selectStatus = obterElementoPorId('chatFiltroStatus');
    const selectTipo = obterElementoPorId('chatFiltroTipo');
    const selectRecorrencia = obterElementoPorId('chatFiltroRecorrencia');
    const selectModo = obterElementoPorId('chatFiltroModo');

    const agentesSelecionados = selectAgente
        ? Array.from(selectAgente.selectedOptions || []).map(opt => opt.value).filter(Boolean)
        : [];
    const servicosSelecionados = selectServico
        ? Array.from(selectServico.selectedOptions || []).map(opt => opt.value).filter(Boolean)
        : [];
    const statusSelecionados = selectStatus
        ? Array.from(selectStatus.selectedOptions || []).map(opt => opt.value).filter(Boolean)
        : [];
    const tiposSelecionados = selectTipo
        ? Array.from(selectTipo.selectedOptions || []).map(opt => opt.value).filter(Boolean)
        : [];
    const recorrenciasSelecionadas = selectRecorrencia
        ? Array.from(selectRecorrencia.selectedOptions || []).map(opt => opt.value).filter(Boolean)
        : [];
    const modosSelecionados = selectModo
        ? Array.from(selectModo.selectedOptions || []).map(opt => opt.value).filter(Boolean)
        : [];

    return {
        agentes: agentesSelecionados,
        servicos: servicosSelecionados,
        status: statusSelecionados,
        tipos: tiposSelecionados,
        recorrencias: recorrenciasSelecionadas,
        modos: modosSelecionados,
        periodo: obterElementoPorId('chatFiltroPeriodo') ? obterElementoPorId('chatFiltroPeriodo').value : 'todos'
    };
}

function aplicarFiltros(registros) {
    const f = obterFiltrosAtuais();
    const agora = new Date();

    return registros.filter(r => {
        if (f.agentes.length && !f.agentes.includes(r.agente)) return false;
        if (f.servicos.length && !f.servicos.includes(r.servico)) return false;
        if (f.status.length && !f.status.includes(r.status)) return false;
        if (f.tipos.length && !f.tipos.includes(r.tipo)) return false;
        if (f.recorrencias.length && !f.recorrencias.includes(normalizarRecorrencia(r.recorrencia))) return false;
        if (f.modos.length && !f.modos.includes(r.modo)) return false;
        if (f.periodo !== 'todos' && r.dataEntrada) {
            const dias = parseInt(f.periodo, 10);
            const limite = new Date(agora - dias * 24 * 3600 * 1000);
            if (r.dataEntrada < limite) return false;
        }
        return true;
    });
}

function popularSelectFiltro(selectId, registros, campo, rotuloTodos) {
    const sel = obterElementoPorId(selectId);
    if (!sel) return;
    const valoresAtuais = sel.multiple
        ? Array.from(sel.selectedOptions || []).map(opt => opt.value).filter(Boolean)
        : [sel.value].filter(Boolean);
    const valores = [...new Set(registros.map(r => r[campo]).filter(Boolean))].sort();
    sel.innerHTML = `<option value="">${rotuloTodos}</option>`;
    valores.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        sel.appendChild(opt);
    });

    if (sel.multiple) {
        Array.from(sel.options).forEach(opt => {
            opt.selected = valoresAtuais.includes(opt.value);
        });
        return;
    }

    const valorAtual = valoresAtuais[0] || '';
    if (valores.includes(valorAtual)) sel.value = valorAtual;
}

function popularTodosFiltros(registros) {
    // Popula os selects ocultos com os valores únicos de cada campo
    popularSelectFiltro('chatFiltroAgente', registros, 'agente', 'Todos os agentes');
    popularSelectFiltro('chatFiltroServico', registros, 'servico', 'Todos os serviços');
    popularSelectFiltro('chatFiltroStatus', registros, 'status', 'Todos os status');
    popularSelectFiltro('chatFiltroTipo', registros, 'tipo', 'Todos os tipos');
    popularSelectFiltro(
        'chatFiltroRecorrencia',
        registros.map(r => ({ ...r, recorrencia: normalizarRecorrencia(r.recorrencia) })),
        'recorrencia',
        'Todas'
    );
    popularSelectFiltro('chatFiltroModo', registros, 'modo', 'Todos');

    // Renderiza as opções de filtro com busca
    renderizarOpcoesFiltroChat(
        obterElementoPorId('chatFiltroAgente'),
        obterElementoPorId('chatFiltroAgenteSearch'),
        obterElementoPorId('chatFiltroAgenteOptions')
    );
    renderizarOpcoesFiltroChat(
        obterElementoPorId('chatFiltroServico'),
        obterElementoPorId('chatFiltroServicoSearch'),
        obterElementoPorId('chatFiltroServicoOptions')
    );
    renderizarOpcoesFiltroChat(
        obterElementoPorId('chatFiltroStatus'),
        obterElementoPorId('chatFiltroStatusSearch'),
        obterElementoPorId('chatFiltroStatusOptions')
    );
    renderizarOpcoesFiltroChat(
        obterElementoPorId('chatFiltroTipo'),
        obterElementoPorId('chatFiltroTipoSearch'),
        obterElementoPorId('chatFiltroTipoOptions')
    );
    renderizarOpcoesFiltroChat(
        obterElementoPorId('chatFiltroRecorrencia'),
        obterElementoPorId('chatFiltroRecorrenciaSearch'),
        obterElementoPorId('chatFiltroRecorrenciaOptions')
    );
    renderizarOpcoesFiltroChat(
        obterElementoPorId('chatFiltroModo'),
        obterElementoPorId('chatFiltroModoSearch'),
        obterElementoPorId('chatFiltroModoOptions')
    );
}

// ── AGRUPAMENTOS ─────────────────────────────────────────────
function contarPorCampo(registros, campo) {
    const map = new Map();
    registros.forEach(r => {
        const v = r[campo] || '—';
        map.set(v, (map.get(v) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function contarPorMes(registros) {
    const map = new Map();
    registros.forEach(r => {
        if (!r.mes) return;
        map.set(r.mes, (map.get(r.mes) || 0) + 1);
    });
    // Ordenar por data
    const ordenado = [...map.entries()].sort((a, b) => {
        const [mA, yA] = a[0].split(' ');
        const [mB, yB] = b[0].split(' ');
        const dA = new Date(`${mA} 1, ${yA}`);
        const dB = new Date(`${mB} 1, ${yB}`);
        return dA - dB;
    });
    return ordenado;
}

function contarPorHora(registros) {
    const arr = new Array(24).fill(0);
    registros.forEach(r => { if (r.hora !== null) arr[r.hora]++; });
    return arr;
}

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
function contarPorDiaSemana(registros) {
    const arr = new Array(7).fill(0);
    registros.forEach(r => { if (r.diaSemana !== null) arr[r.diaSemana]++; });
    return arr;
}

function calcularTemposPorAgente(registros) {
    const map = new Map();
    registros.forEach(r => {
        if (!r.agente || r.agente === '(sem agente)') return;
        if (!map.has(r.agente)) {
            map.set(r.agente, { total: 0, finaliz: 0, tmFila: [], tmAtend: [], tmic: [], tmia: [] });
        }
        const ag = map.get(r.agente);
        ag.total++;
        if (r.finalizado) ag.finaliz++;
        if (r.tmFila !== null) ag.tmFila.push(r.tmFila);
        if (r.tmAtend !== null) ag.tmAtend.push(r.tmAtend);
        if (r.tmic !== null) ag.tmic.push(r.tmic);
        if (r.tmia !== null) ag.tmia.push(r.tmia);
    });

    return [...map.entries()]
        .map(([agente, d]) => {
            const estat = obterEstatisticaAgente(agente);
            const total = estat && estat.quantidade ? Number(estat.quantidade) : d.total;
            const finaliz = d.finaliz;
            return {
                agente,
                total,
                finaliz,
                pctFinaliz: d.total > 0 ? Math.round(finaliz / d.total * 100) : 0,
                tmFila: estat && estat.tme !== null ? estat.tme : mediaArray(d.tmFila),
                tmAtend: estat && estat.tma !== null ? estat.tma : mediaArray(d.tmAtend),
                tmic: estat && estat.tmic !== null ? estat.tmic : mediaArray(d.tmic),
                tmia: estat && estat.tmia !== null ? estat.tmia : mediaArray(d.tmia),
                estatistico: Boolean(estat)
            };
        })
        .sort((a, b) => b.total - a.total);
}

// ── KPIs ─────────────────────────────────────────────────────
function atualizarKPIs(registros) {
    const total = registros.length;
    const finalizados = registros.filter(r => r.finalizado).length;
    const emAtend = registros.filter(r => /em atendimento/i.test(r.status)).length;
    const automatico = registros.filter(r => /autom/i.test(r.status) || /autom/i.test(r.tipo)).length;
    const recorrentes = registros.filter(r => r.recorrencia && r.recorrencia !== '').length;

    const tmFilas = registros.map(r => r.tmFila).filter(v => v !== null);
    const tmAtends = registros.map(r => r.tmAtend).filter(v => v !== null);
    const tmics = registros.map(r => r.tmic).filter(v => v !== null);
    const tmFilaFinal = mediaPonderadaEstatistica('tme') ?? mediaArray(tmFilas);
    const tmAtendFinal = mediaPonderadaEstatistica('tma') ?? mediaArray(tmAtends);
    const tmicFinal = mediaPonderadaEstatistica('tmic') ?? mediaArray(tmics);

    obterElementoPorId('kpiTotal').textContent = total.toLocaleString('pt-BR');
    obterElementoPorId('kpiFinalizados').textContent = finalizados.toLocaleString('pt-BR');
    obterElementoPorId('kpiFinalizadosPct').textContent = total > 0 ? `${Math.round(finalizados / total * 100)}% do total` : '';
    obterElementoPorId('kpiEmAtendimento').textContent = emAtend.toLocaleString('pt-BR');
    obterElementoPorId('kpiAutomatico').textContent = automatico.toLocaleString('pt-BR');
    obterElementoPorId('kpiRecorrentes').textContent = recorrentes.toLocaleString('pt-BR');
    obterElementoPorId('kpiRecorrentesPct').textContent = total > 0 ? `${Math.round(recorrentes / total * 100)}% do total` : '';
    obterElementoPorId('kpiTmFila').textContent = formatarTempo(tmFilaFinal);
    obterElementoPorId('kpiTmAtend').textContent = formatarTempo(tmAtendFinal);
    obterElementoPorId('kpiTmic').textContent = formatarTempo(tmicFinal);

    atualizarTextoPorId('chatKpiStatus', `${total.toLocaleString('pt-BR')} registros carregados`);
}

// ── GRÁFICOS ─────────────────────────────────────────────────
function criarGraficoBarras(canvas, labels, dados, titulo, corBase) {
    const tema = obterTema();
    const cor = corBase || CAT[0];
    return new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{ label: titulo, data: dados, backgroundColor: cor, borderRadius: 6, borderSkipped: false }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: { display: false }
            },
            scales: {
                x: { ticks: { color: tema.text, font: { size: 11 } }, grid: { color: tema.grid } },
                y: { ticks: { color: tema.text }, grid: { color: tema.grid }, beginAtZero: true }
            }
        }
    });
}

function criarGraficoDoughnut(canvas, labels, dados) {
    const tema = obterTema();
    return new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{ data: dados, backgroundColor: CAT, borderColor: tema.border, borderWidth: 2 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: tema.text, font: { size: 11 }, padding: 12, boxWidth: 12 } },
                datalabels: {
                    color: '#fff', font: { weight: 'bold', size: 11 },
                    formatter: (v, ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        return total > 0 ? Math.round(v / total * 100) + '%' : '';
                    }
                }
            }
        }
    });
}

function renderizarCurva(registros) {
    const canvas = obterElementoPorId('chatCurvaChart');
    if (!canvas) return;
    destroyChart(chatCurvaChart);

    const dados = contarPorMes(registros);
    if (!dados.length) { atualizarTextoPorId('chatCurvaStatus', 'Sem dados para o período.'); return; }

    const labels = dados.map(d => d[0]);
    const valores = dados.map(d => d[1]);
    const tema = obterTema();

    chatCurvaChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Chats',
                data: valores,
                borderColor: '#14b8a6',
                backgroundColor: 'rgba(20,184,166,.15)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#14b8a6',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, datalabels: { display: false } },
            scales: {
                x: { ticks: { color: tema.text, font: { size: 11 } }, grid: { color: tema.grid } },
                y: { ticks: { color: tema.text }, grid: { color: tema.grid }, beginAtZero: true }
            }
        }
    });
    atualizarTextoPorId('chatCurvaStatus', `${dados.length} meses`);
}

function renderizarDiaSemana(registros) {
    const canvas = obterElementoPorId('chatDiaSemanaChart');
    if (!canvas) return;
    destroyChart(chatDiaSemanaChart);
    const contagens = contarPorDiaSemana(registros);
    chatDiaSemanaChart = criarGraficoBarras(canvas, DIAS, contagens, 'Chats', CAT[1]);
    atualizarTextoPorId('chatDiaSemanaStatus', 'Distribuição por dia da semana');
}

function renderizarTopAgentes(registros) {
    const canvas = obterElementoPorId('chatAgentesChart');
    const rankEl = obterElementoPorId('chatAgentesRank');
    if (!canvas || !rankEl) return;
    destroyChart(chatAgentesChart);

    const contagens = contarPorCampo(registros, 'agente').filter(([a]) => a !== '(sem agente)');
    if (!contagens.length) {
        rankEl.innerHTML = '<div class="chat-empty"><div class="chat-empty__icon">👤</div>Nenhum agente identificado.</div>';
        atualizarTextoPorId('chatAgentesStatus', 'Sem dados');
        return;
    }

    const top = contagens.slice(0, 10);
    const totalGeral = contagens.reduce((acc, [, v]) => acc + v, 0);
    const maxVal = top[0][1];

    rankEl.innerHTML = top.map(([nome, qtd], i) => `
        <div class="agente-rank-item">
            <span class="agente-rank-item__pos">${i + 1}</span>
            <span class="agente-rank-item__name">${nome}</span>
            <span class="agente-rank-item__bar-wrap">
                <span class="agente-rank-item__bar" style="width:${Math.round(qtd / maxVal * 100)}%;background:${CAT[i % CAT.length]}"></span>
            </span>
            <span class="agente-rank-item__count">${qtd} (${Math.round(qtd / totalGeral * 100)}%)</span>
        </div>`).join('');

    const labels = top.map(d => d[0]);
    const valores = top.map(d => d[1]);
    const tema = obterTema();

    chatAgentesChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{ label: 'Chats', data: valores, backgroundColor: CAT.slice(0, labels.length), borderRadius: 6 }]
        },
        options: {
            indexAxis: 'y',
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, datalabels: { display: false } },
            scales: {
                x: { ticks: { color: tema.text }, grid: { color: tema.grid }, beginAtZero: true },
                y: { ticks: { color: tema.text, font: { size: 11 } }, grid: { display: false } }
            }
        }
    });
    atualizarTextoPorId('chatAgentesStatus', `${contagens.length} agentes`);
}

function renderizarStatus(registros) {
    const canvas = obterElementoPorId('chatStatusChart');
    if (!canvas) return;
    destroyChart(chatStatusChart);
    const dados = contarPorCampo(registros, 'status');
    if (!dados.length) return;
    chatStatusChart = criarGraficoDoughnut(canvas, dados.map(d => d[0]), dados.map(d => d[1]));
    atualizarTextoPorId('chatStatusDistStatus', `${dados.length} status distintos`);
}

function renderizarTipo(registros) {
    const canvas = obterElementoPorId('chatTipoChart');
    if (!canvas) return;
    destroyChart(chatTipoChart);
    const dados = contarPorCampo(registros, 'tipo');
    if (!dados.length) return;
    chatTipoChart = criarGraficoDoughnut(canvas, dados.map(d => d[0]), dados.map(d => d[1]));
    atualizarTextoPorId('chatTipoStatus', `${dados.length} tipos`);
}

function renderizarServico(registros) {
    const canvas = obterElementoPorId('chatServicoChart');
    if (!canvas) return;
    destroyChart(chatServicoChart);
    const dados = contarPorCampo(registros, 'servico').slice(0, 12);
    if (!dados.length) return;
    chatServicoChart = criarGraficoBarras(canvas, dados.map(d => d[0]), dados.map(d => d[1]), 'Chats', CAT[2]);
    atualizarTextoPorId('chatServicoStatus', `${dados.length} serviços`);
}

function renderizarClassificacao(registros) {
    const canvas = obterElementoPorId('chatClassifChart');
    if (!canvas) return;
    destroyChart(chatClassifChart);
    const dados = contarPorCampo(registros, 'classif')
        .filter(([c]) => c && c !== 'Padrão' && c !== '').slice(0, 15);
    if (!dados.length) { atualizarTextoPorId('chatClassifStatus', 'Sem classificações específicas.'); return; }
    chatClassifChart = criarGraficoBarras(canvas, dados.map(d => d[0]), dados.map(d => d[1]), 'Chats', CAT[4]);
    atualizarTextoPorId('chatClassifStatus', `${dados.length} classificações`);
}

function renderizarModo(registros) {
    const canvas = obterElementoPorId('chatModoChart');
    if (!canvas) return;
    destroyChart(chatModoChart);
    const dados = contarPorCampo(registros, 'modo').filter(([v]) => v);
    if (!dados.length) return;
    chatModoChart = criarGraficoDoughnut(canvas, dados.map(d => d[0]), dados.map(d => d[1]));
    atualizarTextoPorId('chatModoStatus', 'Ativo vs Receptivo');
}

function renderizarRecorrencia(registros) {
    const canvas = obterElementoPorId('chatRecorrenciaChart');
    if (!canvas) return;
    destroyChart(chatRecorrenciaChart);
    const mapa = new Map();
    registros.forEach(r => {
        const categoria = normalizarRecorrencia(r.recorrencia);
        mapa.set(categoria, (mapa.get(categoria) || 0) + 1);
    });
    const dados = [...mapa.entries()].sort((a, b) => b[1] - a[1]);
    renderizarContatosRecorrencia(registros);
    if (!dados.length) { atualizarTextoPorId('chatRecorrenciaStatus', 'Sem dados de recorrência.'); return; }
    chatRecorrenciaChart = criarGraficoDoughnut(canvas, dados.map(d => d[0]), dados.map(d => d[1]));
    atualizarTextoPorId('chatRecorrenciaStatus', `${dados.length} categorias`);
}

function obterRankingContatosPorCategoriaRecorrencia(registros, categoria) {
    const categoriaNormalizada = normalCol(categoria);
    const mapa = new Map();

    registros.forEach(r => {
        const categoriaRegistro = normalCol(normalizarRecorrencia(r.recorrencia));
        if (categoriaRegistro !== categoriaNormalizada) return;
        const contato = String(r.contato || '').trim();
        if (!contato) return;
        mapa.set(contato, (mapa.get(contato) || 0) + 1);
    });

    return [...mapa.entries()]
        .map(([nome, qtd]) => ({ nome, qtd }))
        .sort((a, b) => (b.qtd - a.qtd) || a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
}

function alterarPaginaContatosRecorrencia(categoria, delta) {
    const atual = recorrenciaPaginaAtual[categoria] || 1;
    recorrenciaPaginaAtual[categoria] = Math.max(1, atual + delta);
    renderizarContatosRecorrencia(chatRegistrosFiltrados || []);
}

function registrarEventosPaginacaoRecorrencia() {
    const definicoes = [
        { categoria: 'Reincidente', prevId: 'chatRecorrenciaReincidentePrev', nextId: 'chatRecorrenciaReincidenteNext' },
        { categoria: 'Recorrente', prevId: 'chatRecorrenciaRecorrentePrev', nextId: 'chatRecorrenciaRecorrenteNext' },
        { categoria: 'Rechamada', prevId: 'chatRecorrenciaRechamadaPrev', nextId: 'chatRecorrenciaRechamadaNext' }
    ];

    definicoes.forEach(item => {
        const prevEl = obterElementoPorId(item.prevId);
        const nextEl = obterElementoPorId(item.nextId);
        if (prevEl) {
            prevEl.addEventListener('click', () => alterarPaginaContatosRecorrencia(item.categoria, -1));
        }
        if (nextEl) {
            nextEl.addEventListener('click', () => alterarPaginaContatosRecorrencia(item.categoria, 1));
        }
    });
}

function renderizarContatosRecorrencia(registros) {
    const definicoes = [
        {
            categoria: 'Reincidente',
            listaId: 'chatRecorrenciaReincidenteList',
            metaId: 'chatRecorrenciaReincidenteMeta',
            pageId: 'chatRecorrenciaReincidentePage',
            prevId: 'chatRecorrenciaReincidentePrev',
            nextId: 'chatRecorrenciaReincidenteNext'
        },
        {
            categoria: 'Recorrente',
            listaId: 'chatRecorrenciaRecorrenteList',
            metaId: 'chatRecorrenciaRecorrenteMeta',
            pageId: 'chatRecorrenciaRecorrentePage',
            prevId: 'chatRecorrenciaRecorrentePrev',
            nextId: 'chatRecorrenciaRecorrenteNext'
        },
        {
            categoria: 'Rechamada',
            listaId: 'chatRecorrenciaRechamadaList',
            metaId: 'chatRecorrenciaRechamadaMeta',
            pageId: 'chatRecorrenciaRechamadaPage',
            prevId: 'chatRecorrenciaRechamadaPrev',
            nextId: 'chatRecorrenciaRechamadaNext'
        }
    ];

    definicoes.forEach(item => {
        const listaEl = obterElementoPorId(item.listaId);
        const metaEl = obterElementoPorId(item.metaId);
        const pageEl = obterElementoPorId(item.pageId);
        const prevEl = obterElementoPorId(item.prevId);
        const nextEl = obterElementoPorId(item.nextId);
        if (!listaEl || !metaEl || !pageEl || !prevEl || !nextEl) return;

        const ranking = obterRankingContatosPorCategoriaRecorrencia(registros, item.categoria);
        const total = ranking.length;
        const totalPaginas = Math.max(1, Math.ceil(total / RECORRENCIA_CONTATOS_POR_PAGINA));

        let paginaAtual = recorrenciaPaginaAtual[item.categoria] || 1;
        if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
        if (paginaAtual < 1) paginaAtual = 1;
        recorrenciaPaginaAtual[item.categoria] = paginaAtual;

        const inicio = (paginaAtual - 1) * RECORRENCIA_CONTATOS_POR_PAGINA;
        const fim = inicio + RECORRENCIA_CONTATOS_POR_PAGINA;
        const paginaAtualItens = ranking.slice(inicio, fim);

        metaEl.textContent = `${total} contato(s) | Top ${RECORRENCIA_CONTATOS_POR_PAGINA}`;
        pageEl.textContent = `Pagina ${paginaAtual} de ${totalPaginas}`;
        prevEl.disabled = paginaAtual <= 1;
        nextEl.disabled = paginaAtual >= totalPaginas;

        if (!paginaAtualItens.length) {
            listaEl.innerHTML = '<li class="recorrencia-contatos-empty">Sem contatos.</li>';
            return;
        }

        listaEl.innerHTML = paginaAtualItens.map(itemContato => `<li>${itemContato.nome} (${itemContato.qtd})</li>`).join('');
    });
}

function renderizarTemposPorAgente(registros) {
    const canvas = obterElementoPorId('chatTemposChart');
    if (!canvas) return;
    destroyChart(chatTemposChart);

    const agentes = calcularTemposPorAgente(registros).slice(0, 15);
    if (!agentes.length) { atualizarTextoPorId('chatTemposStatus', 'Sem dados.'); return; }

    const labels = agentes.map(a => a.agente);
    const tmAtend = agentes.map(a => a.tmAtend !== null ? Math.round(a.tmAtend / 60) : 0);
    const tmFila = agentes.map(a => a.tmFila !== null ? Math.round(a.tmFila / 60) : 0);
    const tmic = agentes.map(a => a.tmic !== null ? Math.round(a.tmic / 60) : 0);
    const tema = obterTema();

    chatTemposChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'TM Atendimento (h:min)', data: tmAtend, backgroundColor: 'rgba(20,184,166,.85)', borderRadius: 4 },
                { label: 'TM Fila (h:min)', data: tmFila, backgroundColor: 'rgba(14,165,233,.85)', borderRadius: 4 },
                { label: 'TMIC (h:min)', data: tmic, backgroundColor: 'rgba(249,115,22,.85)', borderRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: tema.text } },
                tooltip: {
                    callbacks: {
                        label: function (contexto) {
                            const nomeSerie = contexto.dataset.label || 'Tempo';
                            const valor = contexto.parsed && typeof contexto.parsed.y === 'number' ? contexto.parsed.y : contexto.raw;
                            return `${nomeSerie}: ${formatarMinutosEmHorasMinutos(valor)}`;
                        }
                    }
                },
                datalabels: { display: false }
            },
            scales: {
                x: { ticks: { color: tema.text, font: { size: 10 } }, grid: { color: tema.grid } },
                y: {
                    ticks: {
                        color: tema.text,
                        callback: function (value) {
                            return formatarMinutosEmHorasMinutos(value);
                        }
                    },
                    grid: { color: tema.grid },
                    beginAtZero: true,
                    title: { display: true, text: 'Horas e minutos', color: tema.text }
                }
            }
        }
    });
    atualizarTextoPorId('chatTemposStatus', `${agentes.length} agentes`);
}

function renderizarHorario(registros) {
    const canvas = obterElementoPorId('chatHorarioChart');
    if (!canvas) return;
    destroyChart(chatHorarioChart);
    const contagens = contarPorHora(registros);
    const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`);
    chatHorarioChart = criarGraficoBarras(canvas, labels, contagens, 'Chats', CAT[3]);
    atualizarTextoPorId('chatHorarioStatus', 'Volume por hora do dia');
}

function renderizarCanal(registros) {
    const canvas = obterElementoPorId('chatCanalChart');
    if (!canvas) return;
    destroyChart(chatCanalChart);
    const dados = contarPorCampo(registros, 'canal');
    if (!dados.length) return;
    chatCanalChart = criarGraficoDoughnut(canvas, dados.map(d => d[0]), dados.map(d => d[1]));
    atualizarTextoPorId('chatCanalStatus', `${dados.length} canal(is)`);
}

function renderizarTabelaTempos(registros) {
    const tbody = obterElementoPorId('chatTabelaTemposBody');
    if (!tbody) return;
    const agentes = calcularTemposPorAgente(registros).slice(0, 30);
    if (!agentes.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#94a3b8;">Nenhum dado.</td></tr>';
        atualizarTextoPorId('chatTabelaTemposStatus', 'Sem dados');
        return;
    }

    const badgePct = (pct) => {
        const cls = pct >= 80 ? 'green' : pct >= 50 ? 'yellow' : 'red';
        return `<span class="badge badge--${cls}">${pct}%</span>`;
    };

    tbody.innerHTML = agentes.map(a => `
        <tr>
            <td><strong>${a.agente}</strong></td>
            <td>${a.total.toLocaleString('pt-BR')}</td>
            <td>${formatarTempo(a.tmFila)}</td>
            <td>${formatarTempo(a.tmAtend)}</td>
            <td>${formatarTempo(a.tmic)}</td>
            <td>${formatarTempo(a.tmia)}</td>
            <td>${a.finaliz.toLocaleString('pt-BR')}</td>
            <td>${badgePct(a.pctFinaliz)}</td>
        </tr>`).join('');

    atualizarTextoPorId('chatTabelaTemposStatus', `${agentes.length} agentes`);
}

// ── RENDER COMPLETO ──────────────────────────────────────────
function renderizarTudo(registros) {
    chatRegistrosFiltrados = registros;
    atualizarKPIs(registros);
    renderizarCurva(registros);
    renderizarDiaSemana(registros);
    renderizarTopAgentes(registros);
    renderizarStatus(registros);
    renderizarTipo(registros);
    renderizarServico(registros);
    renderizarClassificacao(registros);
    renderizarModo(registros);
    renderizarRecorrencia(registros);
    renderizarTemposPorAgente(registros);
    renderizarHorario(registros);
    renderizarCanal(registros);
    renderizarTabelaTempos(registros);
    renderizarGraficoTempoMedio(registrosAtuais);
}

// ── IMPORTAÇÃO ───────────────────────────────────────────────
function lerArquivoComoTexto(arquivo, encoding = 'latin1') {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error(`Erro ao ler ${arquivo.name}.`));
        reader.readAsText(arquivo, encoding);
    });
}

function lerArquivoComoArrayBuffer(arquivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error(`Erro ao ler ${arquivo.name}.`));
        reader.readAsArrayBuffer(arquivo);
    });
}

function arquivoEhPlanilha(nome) {
    return /\.(xlsx|xls)$/i.test(String(nome || ''));
}

function arquivoEhCsv(nome) {
    return /\.csv$/i.test(String(nome || ''));
}

async function processarArquivos(arquivos) {
    const lista = Array.from(arquivos || []);
    if (!lista.length) return;

    atualizarTextoPorId('chatFileStatus', `Lendo ${lista.length} arquivo(s)...`);

    try {
        let registrosAnaliticos = [];
        let estatisticas = new Map();
        const nomesAnaliticos = [];
        const nomesEstatisticos = [];

        for (const arquivo of lista) {
            if (arquivoEhCsv(arquivo.name)) {
                const texto = await lerArquivoComoTexto(arquivo, 'latin1');
                const registros = parsearCSVChat(texto);
                if (registros.length) {
                    registrosAnaliticos = registrosAnaliticos.concat(registros);
                    nomesAnaliticos.push(arquivo.name);
                }
                continue;
            }

            if (arquivoEhPlanilha(arquivo.name)) {
                const buffer = await lerArquivoComoArrayBuffer(arquivo);
                const mapa = parsearXlsxChatEstatistico(buffer);
                mapa.forEach((valor, chave) => estatisticas.set(chave, valor));
                if (mapa.size) nomesEstatisticos.push(arquivo.name);
                continue;
            }
        }

        if (!registrosAnaliticos.length && !estatisticas.size) {
            atualizarTextoPorId('chatFileStatus', '⚠️ Nenhum registro encontrado. Selecione o CSV analitico e/ou o XLSX estatistico.');
            return;
        }

        if (!registrosAnaliticos.length) {
            atualizarTextoPorId('chatFileStatus', '⚠️ O relatório estatístico foi lido, mas o CSV analítico ainda é necessário para montar os gráficos principais.');
            chatEstatisticasAgentes = estatisticas;
            try { localStorage.setItem(CHAT_STATS_STORAGE_KEY, JSON.stringify(estatisticasParaArray(chatEstatisticasAgentes))); } catch (_) { }
            return;
        }

        chatRegistrosBrutos = registrosAnaliticos;
        chatEstatisticasAgentes = estatisticas;

        popularTodosFiltros(registrosAnaliticos);
        if (obterElementoPorId('chatFiltrosSection')) obterElementoPorId('chatFiltrosSection').style.display = '';

        const filtrados = aplicarFiltros(registrosAnaliticos);
        renderizarTudo(filtrados);

        try {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(
                registrosAnaliticos.map(r => ({
                    ...r,
                    dataEntrada: r.dataEntrada ? r.dataEntrada.toISOString() : null,
                    dataFin: r.dataFin ? r.dataFin.toISOString() : null
                }))
            ));
            localStorage.setItem(CHAT_STATS_STORAGE_KEY, JSON.stringify(estatisticasParaArray(chatEstatisticasAgentes)));
            localStorage.setItem(CHAT_FILE_META_KEY, JSON.stringify({
                fileName: nomesAnaliticos.concat(nomesEstatisticos).join(' + '),
                analyticFiles: nomesAnaliticos,
                statisticFiles: nomesEstatisticos,
                importedAt: new Date().toISOString(),
                total: registrosAnaliticos.length,
                totalEstatistico: chatEstatisticasAgentes.size
            }));
        } catch (_) { }

        const detalheEstatistico = chatEstatisticasAgentes.size
            ? ` + ${chatEstatisticasAgentes.size.toLocaleString('pt-BR')} agente(s) do estatístico`
            : '';
        atualizarTextoPorId('chatStatus', `✅ ${registrosAnaliticos.length.toLocaleString('pt-BR')} registros importados${detalheEstatistico}.`);
        atualizarTextoPorId('chatFileStatus', `✅ Analítico: ${nomesAnaliticos.join(', ') || 'nenhum'}${chatEstatisticasAgentes.size ? ` | Estatístico: ${nomesEstatisticos.join(', ')}` : ''}`);
    } catch (err) {
        atualizarTextoPorId('chatFileStatus', `❌ Erro ao processar: ${err.message}`);
        console.error('[Chat] Erro parse:', err);
    }
}

function processarArquivo(arquivo) {
    return processarArquivos(arquivo ? [arquivo] : []);
}
function carregarDoLocalStorage() {
    try {
        const raw = localStorage.getItem(CHAT_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        chatRegistrosBrutos = parsed.map(r => ({
            ...r,
            recorrencia: normalizarRecorrencia(r.recorrencia),
            dataEntrada: r.dataEntrada ? new Date(r.dataEntrada) : null,
            dataFin: r.dataFin ? new Date(r.dataFin) : null
        }));
        try {
            chatEstatisticasAgentes = restaurarEstatisticasChat(JSON.parse(localStorage.getItem(CHAT_STATS_STORAGE_KEY) || '[]'));
        } catch (_) {
            chatEstatisticasAgentes = new Map();
        }
        if (!chatRegistrosBrutos.length) return;
        popularTodosFiltros(chatRegistrosBrutos);
        if (obterElementoPorId('chatFiltrosSection')) obterElementoPorId('chatFiltrosSection').style.display = '';
        renderizarTudo(aplicarFiltros(chatRegistrosBrutos));
        try {
            const metaRaw = localStorage.getItem(CHAT_FILE_META_KEY);
            if (metaRaw) {
                const meta = JSON.parse(metaRaw);
                const nome = String((meta && meta.fileName) || '').trim();
                if (nome) {
                    atualizarTextoPorId('chatFileStatus', `Arquivo restaurado: ${nome}`);
                }
            }
        } catch (_) { }
        atualizarTextoPorId('chatStatus', `📂 ${chatRegistrosBrutos.length.toLocaleString('pt-BR')} registros carregados do armazenamento local.`);
    } catch (_) { }
}

// ── EXPORTAÇÃO PDF ───────────────────────────────────────────
async function exportarPDF() {
    if (!window.jspdf || !window.html2canvas) {
        alert('Bibliotecas de exportação ainda carregando. Tente novamente em instantes.');
        return;
    }
    atualizarTextoPorId('chatStatus', '⏳ Gerando PDF…');
    const btn = obterElementoPorId('chatExportPdfBtn');
    if (btn) btn.disabled = true;

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pW = pdf.internal.pageSize.getWidth();
        const pH = pdf.internal.pageSize.getHeight();

        const canvases = [
            { id: 'chatCurvaChart', titulo: 'Curva de Chats por Mês' },
            { id: 'chatAgentesChart', titulo: 'Top Agentes' },
            { id: 'chatStatusChart', titulo: 'Distribuição por Status' },
            { id: 'chatTipoChart', titulo: 'Distribuição por Tipo' },
            { id: 'chatServicoChart', titulo: 'Chats por Serviço' },
            { id: 'chatClassifChart', titulo: 'Classificação' },
            { id: 'chatModoChart', titulo: 'Ativo vs Receptivo' },
            { id: 'chatRecorrenciaChart', titulo: 'Recorrência' },
            { id: 'chatTemposChart', titulo: 'Tempos por Agente' },
            { id: 'chatHorarioChart', titulo: 'Chats por Horário' },
            { id: 'chatCanalChart', titulo: 'Volume por Canal' },
            { id: 'chatDiaSemanaChart', titulo: 'Chats por Dia da Semana' }
        ];

        let primeira = true;
        for (const item of canvases) {
            const c = obterElementoPorId(item.id);
            if (!c) continue;
            const imgData = await html2canvas(c, { scale: 2 }).then(cv => cv.toDataURL('image/png'));
            if (!primeira) pdf.addPage();
            pdf.setFontSize(13);
            pdf.text(item.titulo, 10, 14);
            pdf.addImage(imgData, 'PNG', 10, 20, pW - 20, pH - 30);
            primeira = false;
        }

        const data = new Date().toISOString().split('T')[0];
        pdf.save(`Dashboard_Chat_${data}.pdf`);
        atualizarTextoPorId('chatStatus', '✅ PDF exportado com sucesso');
    } catch (err) {
        atualizarTextoPorId('chatStatus', '❌ Erro ao gerar PDF: ' + err.message);
    } finally {
        if (btn) btn.disabled = false;
    }
}

// ── EXPORTAÇÃO PPTX ──────────────────────────────────────────
async function exportarPPTX() {
    if (!window.PptxGenJS || !window.html2canvas) {
        alert('Bibliotecas de exportação ainda carregando. Tente novamente em instantes.');
        return;
    }
    atualizarTextoPorId('chatStatus', '⏳ Gerando PPTX…');
    const btn = obterElementoPorId('chatExportPptxBtn');
    if (btn) btn.disabled = true;

    try {
        const pptx = new window.PptxGenJS();
        pptx.layout = 'LAYOUT_WIDE';

        const itens = [
            { id: 'chatCurvaChart', titulo: 'Curva de Chats por Mês' },
            { id: 'chatAgentesChart', titulo: 'Top Agentes' },
            { id: 'chatStatusChart', titulo: 'Distribuição por Status' },
            { id: 'chatTipoChart', titulo: 'Distribuição por Tipo' },
            { id: 'chatServicoChart', titulo: 'Chats por Serviço' },
            { id: 'chatClassifChart', titulo: 'Classificação' },
            { id: 'chatModoChart', titulo: 'Ativo vs Receptivo' },
            { id: 'chatRecorrenciaChart', titulo: 'Recorrência' },
            { id: 'chatTemposChart', titulo: 'Tempos por Agente' },
            { id: 'chatHorarioChart', titulo: 'Chats por Horário' },
            { id: 'chatCanalChart', titulo: 'Volume por Canal' },
            { id: 'chatDiaSemanaChart', titulo: 'Chats por Dia da Semana' }
        ];

        for (const item of itens) {
            const c = obterElementoPorId(item.id);
            if (!c) continue;
            const imgData = await html2canvas(c, { scale: 2 }).then(cv => cv.toDataURL('image/png'));
            const slide = pptx.addSlide();
            slide.addText(item.titulo, { x: 0.3, y: 0.15, w: 12, h: 0.5, fontSize: 18, bold: true, color: '0f172a' });
            slide.addImage({ data: imgData, x: 0.3, y: 0.75, w: 12.4, h: 6.2 });
        }

        const data = new Date().toISOString().split('T')[0];
        await pptx.writeFile({ fileName: `Dashboard_Chat_${data}.pptx` });
        atualizarTextoPorId('chatStatus', '✅ PPTX exportado com sucesso');
    } catch (err) {
        atualizarTextoPorId('chatStatus', '❌ Erro ao gerar PPTX: ' + err.message);
    } finally {
        if (btn) btn.disabled = false;
    }
}

// ── INICIALIZAÇÃO ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    registrarEventosPaginacaoRecorrencia();

    // Importar
    const btnImport = obterElementoPorId('chatImportButton');
    const inputFile = obterElementoPorId('chatArquivoInput');
    if (btnImport && inputFile) {
        btnImport.addEventListener('click', () => {
            const arquivos = Array.from(inputFile.files || []);
            if (!arquivos.length) { atualizarTextoPorId('chatFileStatus', '⚠️ Selecione o CSV analitico e/ou o XLSX estatistico.'); return; }
            processarArquivos(arquivos);
        });
        inputFile.addEventListener('change', () => {
            const arquivos = Array.from(inputFile.files || []);
            atualizarTextoPorId('chatFileStatus', arquivos.length ? `Arquivo(s) selecionado(s): ${arquivos.map(f => f.name).join(', ')}` : 'Nenhum arquivo selecionado.');
        });
    }

    // Limpar
    const btnClear = obterElementoPorId('chatClearButton');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            chatRegistrosBrutos = [];
            chatRegistrosFiltrados = [];
            chatEstatisticasAgentes = new Map();
            try {
                localStorage.removeItem(CHAT_STORAGE_KEY);
                localStorage.removeItem(CHAT_STATS_STORAGE_KEY);
                localStorage.removeItem(CHAT_FILE_META_KEY);
            } catch (_) { }
            if (obterElementoPorId('chatFiltrosSection')) obterElementoPorId('chatFiltrosSection').style.display = 'none';
            atualizarTextoPorId('chatStatus', 'Dados limpos.');
            atualizarTextoPorId('chatFileStatus', 'Nenhum arquivo selecionado.');
            if (inputFile) inputFile.value = '';
            [chatCurvaChart, chatDiaSemanaChart, chatAgentesChart, chatStatusChart,
                chatTipoChart, chatServicoChart, chatClassifChart, chatModoChart,
                chatRecorrenciaChart, chatTemposChart, chatHorarioChart, chatCanalChart
            ].forEach(destroyChart);
            ['kpiTotal', 'kpiFinalizados', 'kpiFinalizadosPct', 'kpiEmAtendimento',
                'kpiAutomatico', 'kpiRecorrentes', 'kpiRecorrentesPct', 'kpiTmFila', 'kpiTmAtend', 'kpiTmic'
            ].forEach(id => { const e = obterElementoPorId(id); if (e) e.textContent = '—'; });
            const tbody = obterElementoPorId('chatTabelaTemposBody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#94a3b8;">Nenhum dado carregado.</td></tr>';
            const rankEl = obterElementoPorId('chatAgentesRank');
            if (rankEl) rankEl.innerHTML = '<div class="chat-empty"><div class="chat-empty__icon">👤</div>Nenhum agente carregado ainda.</div>';
            renderizarContatosRecorrencia([]);
        });
    }

    // Filtros
    const btnFiltrar = obterElementoPorId('chatAplicarFiltros');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', () => {
            if (!chatRegistrosBrutos.length) return;
            renderizarTudo(aplicarFiltros(chatRegistrosBrutos));
        });
    }
    const btnLimparFiltros = obterElementoPorId('chatLimparFiltros');
    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener('click', () => {
            ['chatFiltroAgente', 'chatFiltroServico', 'chatFiltroStatus', 'chatFiltroTipo',
                'chatFiltroRecorrencia', 'chatFiltroModo'].forEach(id => {
                    const s = obterElementoPorId(id);
                    if (!s) return;

                    if (s.multiple) {
                        Array.from(s.options).forEach(opt => {
                            opt.selected = false;
                        });
                    } else {
                        s.value = '';
                    }
                });
            const p = obterElementoPorId('chatFiltroPeriodo'); if (p) p.value = 'todos';
            if (chatRegistrosBrutos.length) renderizarTudo(chatRegistrosBrutos);
        });
    }

    // Event listeners para busca em filtros
    const inputsBusca = [
        { input: 'chatFiltroAgenteSearch', select: 'chatFiltroAgente', options: 'chatFiltroAgenteOptions' },
        { input: 'chatFiltroServicoSearch', select: 'chatFiltroServico', options: 'chatFiltroServicoOptions' },
        { input: 'chatFiltroStatusSearch', select: 'chatFiltroStatus', options: 'chatFiltroStatusOptions' },
        { input: 'chatFiltroTipoSearch', select: 'chatFiltroTipo', options: 'chatFiltroTipoOptions' },
        { input: 'chatFiltroRecorrenciaSearch', select: 'chatFiltroRecorrencia', options: 'chatFiltroRecorrenciaOptions' },
        { input: 'chatFiltroModoSearch', select: 'chatFiltroModo', options: 'chatFiltroModoOptions' }
    ];

    inputsBusca.forEach(({ input, select, options }) => {
        const inputEl = obterElementoPorId(input);
        if (inputEl) {
            inputEl.addEventListener('input', () => {
                renderizarOpcoesFiltroChat(
                    obterElementoPorId(select),
                    inputEl,
                    obterElementoPorId(options)
                );
            });
        }
    });

    // Exportações
    const btnPdf = obterElementoPorId('chatExportPdfBtn');
    if (btnPdf) btnPdf.addEventListener('click', exportarPDF);
    const btnPptx = obterElementoPorId('chatExportPptxBtn');
    if (btnPptx) btnPptx.addEventListener('click', exportarPPTX);

    // Carregar dados salvos
    carregarDoLocalStorage();
});










