// ============================================================
// app_os.js — Painel de Ordens de Serviço
// Importação XLSX/CSV, filtros, produtividade por técnico,
// dashboard de SLA e tabela detalhada com paginação.
// ============================================================

(function () {
    "use strict";

    // ── Elementos de UI ──────────────────────────────────────
    const elFileInput = document.getElementById("osFileInput");
    const elImportBtn = document.getElementById("osImportBtn");
    const elLimparBtn = document.getElementById("osLimparBtn");
    const elFileStatusText = document.getElementById("osFileStatusText");
    const elImportStatus = document.getElementById("osImportStatus");

    // Filtros
    const elLimparFiltros = document.getElementById("osLimparFiltros");
    const elAplicarFiltros = document.getElementById("osAplicarFiltros");

    // KPIs
    const elKpiTotal = document.getElementById("osKpiTotal");
    const elKpiFinalizadas = document.getElementById("osKpiFinalizadas");
    const elKpiPendentes = document.getElementById("osKpiPendentes");
    const elKpiTaxa = document.getElementById("osKpiTaxaConclusao");
    const elKpiTempo = document.getElementById("osKpiTempoMedio");
    const elKpiSlaOk = document.getElementById("osKpiSlaOk");

    // Tabela produtividade
    const elProdBody = document.getElementById("osProdutividadeTableBody");
    const elProdStatus = document.getElementById("osProdutividadeStatus");
    const elPodium = document.getElementById("osPodiumContainer");

    // SLA
    const elSlaStatus = document.getElementById("osSlaStatus");
    const elSlaResumo = document.getElementById("osSlaResumo");
    const elSlaTableBody = document.getElementById("osSlaTableBody");
    const elSlaSearch = document.getElementById("osSlaSearch");
    const elSlaFiltroStatus = document.getElementById("osSlaFiltroStatus");
    const elSlaPageInfo = document.getElementById("osSlaPageInfo");
    const elSlaTamanho = document.getElementById("osSlaTamanhoPagina");
    const elSlaAnterior = document.getElementById("osSlaAnterior");
    const elSlaProxima = document.getElementById("osSlaProxima");

    // Diagnostico de rede (OLT / PON)
    const elRedeStatus = document.getElementById("osRedeStatus");
    const elRedeResumo = document.getElementById("osRedeResumo");
    const elRedeOltTableBody = document.getElementById("osRedeOltTableBody");
    const elRedeTableBody = document.getElementById("osRedeTableBody");
    const elRedeSearch = document.getElementById("osRedeSearch");

    // ── Estado ───────────────────────────────────────────────
    const STORAGE_KEY = "os-registros-v1";
    const STORAGE_META = "os-meta-v1";

    let registrosBase = [];  // todos os registros importados
    let registrosAtuais = [];  // após filtros
    let slaTableFiltered = [];  // após busca/status na tabela SLA
    let slaPagina = 0;

    // Gráficos Chart.js
    let chartStatus, chartTipo, chartCidade,
        chartProd, chartTempo, chartTaxa, chartTipoTecnico,
        chartSlaDist, chartSlaTipo, chartSlaAtend,
        chartSlaDurFaixa, chartDiaSemana;

    // Paleta compartilhada (igual ao app.js para consistência visual)
    const PALETTE = [
        "#14b8a6", "#0ea5e9", "#6366f1", "#22c55e", "#f59e0b",
        "#a855f7", "#f97316", "#84cc16", "#ec4899", "#64748b",
        "#06b6d4", "#ef4444", "#fb923c", "#34d399", "#818cf8"
    ];

    let chartTempoMedioOs = null;
    // ── Persistência ─────────────────────────────────────────
    function salvar(registros, nomeArquivo) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
            localStorage.setItem(STORAGE_META, JSON.stringify({
                fileName: nomeArquivo,
                importedAt: new Date().toISOString(),
                total: registros.length
            }));
        } catch (_) { }
    }

    function carregar() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (_) { return []; }
    }

    function limparStorage() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_META);
        } catch (_) { }
    }

    // ── Utilitários ──────────────────────────────────────────
    function parseDateBR(str) {
        if (!str || typeof str !== "string") return null;
        const m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!m) return null;
        return new Date(`${m[3]}-${m[2]}-${m[1]}`);
    }

    function parseTimestamp(dateStr, timeStr) {
        if (!dateStr || !timeStr) return null;
        const d = parseDateBR(String(dateStr).trim());
        if (!d) return null;
        const t = String(timeStr).trim();
        const [h, mi, s] = t.split(":").map(Number);
        d.setHours(h || 0, mi || 0, s || 0, 0);
        return d;
    }

    function duracaoMin(ini, fim) {
        if (!ini || !fim) return null;
        const diff = (fim - ini) / 60000;
        return diff >= 0 ? Math.round(diff) : null;
    }

    function media(arr) {
        const v = arr.filter(x => x !== null && x !== undefined);
        return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
    }

    function diaSemana(d) {
        const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        return d ? dias[d.getDay()] : null;
    }

    function periodoMes(dateStr) {
        if (!dateStr) return null;
        const d = parseDateBR(String(dateStr).trim());
        if (!d) return null;
        return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    }

    // ─── Renderizar Gráfico de Tempo Médio de Execução ───────────────────────────
    function renderizarGraficoTempoMedio(registros) {
        const ctx = document.getElementById("osTempoMedioChart");
        if (!ctx) return;

        // Destrói gráfico existente para evitar sobreposição de render base
        if (chartTempoMedioOs) {
            chartTempoMedioOs.destroy();
        }

        // Função auxiliar interna para parsing manual de data BR (DD/MM/YYYY HH:mm:ss)
        function parseDataBr(stringData) {
            if (!stringData || typeof stringData !== "string") return null;
            const partes = stringData.trim().split(" ");
            if (!partes[0]) return null;

            const dataPartes = partes[0].split("/");
            if (dataPartes.length !== 3) return null;

            const dia = parseInt(dataPartes[0], 10);
            const mes = parseInt(dataPartes[1], 10) - 1;
            const ano = parseInt(dataPartes[2], 10);

            let hora = 0, min = 0, seg = 0;
            if (partes[1]) {
                const horaPartes = partes[1].split(":");
                hora = parseInt(horaPartes[0] || 0, 10);
                min = parseInt(horaPartes[1] || 0, 10);
                seg = parseInt(horaPartes[2] || 0, 10);
            }
            return new Date(ano, mes, dia, hora, min, seg);
        }

        // Agrupamento de tempos por Tipo de OS
        const dadosAgrupados = {};

        // Usa data_cadastro (abertura real da OS) até data_termino_executado
        registros.forEach(reg => {
            const tipoOs = reg.tipo || "NÃO INFORMADO";
            const dataAbertura = reg.ts_abertura ? new Date(reg.ts_abertura) : null;
            const dataFechamento = reg.ts_termino ? new Date(reg.ts_termino) : null;

            // Apenas processa se tiver ambas as pontas da timeline preenchidas
            if (dataAbertura && dataFechamento) {
                const diffMs = dataFechamento - dataAbertura;
                if (diffMs >= 0) {
                    const diffHoras = diffMs / (1000 * 60 * 60); // Conversão direta para horas

                    if (!dadosAgrupados[tipoOs]) {
                        dadosAgrupados[tipoOs] = { totalHoras: 0, qtd: 0 };
                    }
                    dadosAgrupados[tipoOs].totalHoras += diffHoras;
                    dadosAgrupados[tipoOs].qtd += 1;
                }
            }
        });

        // Ordena do maior tempo médio para o menor (melhor visualização)
        const listaOrdenada = Object.entries(dadosAgrupados)
            .map(([label, info]) => ({
                label,
                media: info.totalHoras / info.qtd,
                totalHoras: info.totalHoras,
                qtd: info.qtd
            }))
            .sort((a, b) => b.media - a.media);

        // Remover limite top 10
        const finalLabels = listaOrdenada.map(i => i.label);
        const finalData = listaOrdenada.map(i => parseFloat(i.media.toFixed(1)));

        // Todos os tipos agora aparecem

        // Helper: formata horas como 'Xh' ou 'Nd Mh' quando >= 24h
        function formatHoursToDaysHours(hours) {
            if (hours === null || hours === undefined || isNaN(hours)) return "—";
            const h = Number(hours);
            if (h >= 24) {
                const days = Math.floor(h / 24);
                let rem = Math.round(h - days * 24);
                if (rem === 24) { // caso raro após arredondamento
                    return `${days + 1}d 0h`;
                }
                return `${days}d ${rem}h`;
            }
            return `${parseFloat(h.toFixed(1))}h`;
        }

        // Renderização do gráfico via Chart.js (Gráfico de Barras Horizontal)
        chartTempoMedioOs = new Chart(ctx, {
            type: "bar",
            data: {
                labels: finalLabels,
                datasets: [{
                    label: "Média em Horas",
                    data: finalData,
                    backgroundColor: "rgba(14, 165, 233, 0.75)",
                    borderColor: "#0ea5e9",
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: "x", // Barras verticais
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { left: 96, right: 28, top: 12, bottom: 8 } },
                // Reduz a ocupação vertical das barras para aumentar espaçamento
                datasets: {
                    bar: {
                        barThickness: 18,
                        maxBarThickness: 20,
                        categoryPercentage: 0.7,
                        barPercentage: 0.9
                    }
                },
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: "end",
                        align: "end",
                        color: "#f8fbff",
                        formatter: (val) => formatHoursToDaysHours(val),
                        font: { weight: "bold" }
                    }
                },
                scales: {
                    x: {
                        grid: { color: "rgba(147, 169, 255, 0.11)" },
                        ticks: { color: "#dbe6ff",
                            callback: function(value) { return formatHoursToDaysHours(value); }
                        },
                        title: { display: true, text: "Tempo decorrido", color: "#dbe6ff" }
                    },
                    y: {
                        grid: { display: false },
                        ticks: {
                            color: "#dbe6ff",
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0,
                            padding: 10,
                            font: { size: 11 },
                            callback: function(value, index, ticks) {
                                try {
                                    const labels = this && this.chart && this.chart.data && this.chart.data.labels ? this.chart.data.labels : null;
                                    if (labels && labels[index] !== undefined) return labels[index];
                                } catch (_) {}
                                return typeof value === 'string' ? value : String(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // ── Parsing do arquivo ───────────────────────────────────
    function normalizarRegistro(raw) {
        const k = (nome) => {
            const chave = Object.keys(raw).find(c =>
                c.toLowerCase().replace(/[\s_]/g, "") === nome.toLowerCase().replace(/[\s_]/g, "")
            );
            return chave ? String(raw[chave] ?? "").trim() : "";
        };

        const dataInicioProg = k("data_inicio_programado");
        const dataInicioExec = k("data_inicio_executado");
        const horaInicio = k("hora_inicio_executado");
        const dataTermino = k("data_termino_executado");
        const horaTermino = k("hora_termino_executado");
        const dataCadastroRaw = k("data_cadastro"); // Ex: "01/06/2026 07:11:48"

        const tsInicio = parseTimestamp(dataInicioExec, horaInicio);
        const tsTermino = parseTimestamp(dataTermino, horaTermino);
        const duracao = duracaoMin(tsInicio, tsTermino);

        // Parse data_cadastro (formato DD/MM/YYYY HH:mm:ss)
        let tsAbertura = null;
        if (dataCadastroRaw) {
            const partes = dataCadastroRaw.trim().split(" ");
            const dp = (partes[0] || "").split("/");
            if (dp.length === 3) {
                const [h, mi, s] = (partes[1] || "0:0:0").split(":").map(Number);
                tsAbertura = new Date(+dp[2], +dp[1] - 1, +dp[0], h || 0, mi || 0, s || 0);
                if (isNaN(tsAbertura.getTime())) tsAbertura = null;
            }
        }

        return {
            codigo_cliente: k("codigo_cliente"),
            nome: k("nome_razaosocial"),
            status: k("status").toLowerCase(),
            data_programada: dataInicioProg,
            data_inicio_exec: dataInicioExec,
            hora_inicio: horaInicio,
            data_termino: dataTermino,
            hora_termino: horaTermino,
            tecnico: k("tecnicos"),
            descricao: k("descricao_fechamento"),
            numero_os: k("numero_ordem_servico"),
            tipo: k("tipo_ordem_servico"),
            endereco: k("endereco"),
            numero: k("numero"),
            bairro: k("bairro"),
            cidade: k("cidade"),
            pop_cliente: k("pop_cliente"),
            equipamento_conexao: k("equipamento_conexao"),
            interface_conexao: k("interface"),
            coordenadas: k("coordenadas"),
            ts_inicio: tsInicio ? tsInicio.toISOString() : null,
            ts_termino: tsTermino ? tsTermino.toISOString() : null,
            ts_abertura: tsAbertura ? tsAbertura.toISOString() : null,
            duracao_min: duracao,
            periodo: periodoMes(dataInicioExec || dataInicioProg),
            dia_semana: tsInicio ? diaSemana(tsInicio) : null
        };
    }

    async function lerArquivo(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const XLSX = window.XLSX;
                    const wb = XLSX.read(e.target.result, { type: "binary" });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
                    resolve(rows);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsBinaryString(file);
        });
    }

    // ── Filtros UI (tipo checkbox/tags visual) ────────────────
    const filtrosDef = [
        { id: "osFiltroTecnico", searchId: "osFiltroTecnicoSearch", optionsId: "osFiltroTecnicoOptions", campo: "tecnico" },
        { id: "osFiltroTipo", searchId: "osFiltroTipoSearch", optionsId: "osFiltroTipoOptions", campo: "tipo" },
        { id: "osFiltroStatus", searchId: "osFiltroStatusSearch", optionsId: "osFiltroStatusOptions", campo: "status" },
        { id: "osFiltroCidade", searchId: "osFiltroCidadeSearch", optionsId: "osFiltroCidadeOptions", campo: "cidade" },
        { id: "osFiltroBairro", searchId: "osFiltroBairroSearch", optionsId: "osFiltroBairroOptions", campo: "bairro" },
        { id: "osFiltroPeriodo", searchId: "osFiltroPeriodoSearch", optionsId: "osFiltroPeriodoOptions", campo: "periodo" },
    ];

    const filtroSelecoes = {};
    filtrosDef.forEach(f => { filtroSelecoes[f.campo] = new Set(); });

    function popularFiltros(dados) {
        filtrosDef.forEach(({ id, searchId, optionsId, campo }) => {
            const valores = [...new Set(dados.map(r => r[campo]).filter(Boolean))].sort();
            const select = document.getElementById(id);
            const optDiv = document.getElementById(optionsId);
            const search = document.getElementById(searchId);

            // Limpa seleções anteriores que não existem mais
            filtroSelecoes[campo].forEach(v => { if (!valores.includes(v)) filtroSelecoes[campo].delete(v); });

            function renderOptions(filtro) {
                optDiv.innerHTML = "";
                valores.filter(v => !filtro || v.toLowerCase().includes(filtro.toLowerCase())).forEach(v => {
                    const label = document.createElement("label");
                    label.className = "filter-option-label";
                    label.style.cssText = "display:flex; align-items:center; gap:6px; cursor:pointer; padding:3px 0; font-size:0.85rem;";
                    const cb = document.createElement("input");
                    cb.type = "checkbox";
                    cb.value = v;
                    cb.checked = filtroSelecoes[campo].has(v);
                    cb.addEventListener("change", () => {
                        if (cb.checked) filtroSelecoes[campo].add(v);
                        else filtroSelecoes[campo].delete(v);
                    });
                    label.appendChild(cb);
                    label.appendChild(document.createTextNode(v));
                    optDiv.appendChild(label);
                });
            }

            renderOptions("");
            search.addEventListener("input", () => renderOptions(search.value));
        });
    }

    function aplicarFiltros() {
        registrosAtuais = registrosBase.filter(r => {
            for (const { campo } of filtrosDef) {
                if (filtroSelecoes[campo].size > 0 && !filtroSelecoes[campo].has(r[campo])) return false;
            }
            return true;
        });
        renderTudo();
    }

    function limparFiltros() {
        filtrosDef.forEach(({ searchId, campo }) => {
            filtroSelecoes[campo].clear();
            const el = document.getElementById(searchId);
            if (el) el.value = "";
        });
        popularFiltros(registrosBase);
        registrosAtuais = [...registrosBase];
        renderTudo();
    }

    // ── Gráficos ─────────────────────────────────────────────
    function tema() {
        const dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        return {
            text: dark ? "#cbd5e1" : "#4b5563",
            grid: dark ? "rgba(148,163,184,0.24)" : "rgba(17,24,39,0.08)",
            border: dark ? "#e2e8f0" : "#ffffff"
        };
    }

    function destroiGrafico(chart) {
        if (chart && typeof chart.destroy === "function") chart.destroy();
        return null;
    }

    function barChart(id, labels, datasets, opts = {}) {
        const ctx = document.getElementById(id);
        if (!ctx) return null;
        const t = tema();
        return new Chart(ctx, {
            type: "bar",
            data: { labels, datasets },
            options: {
                responsive: true,
                indexAxis: opts.horizontal ? "y" : "x",
                plugins: {
                    legend: { display: !!opts.legend, labels: { color: t.text } },
                    datalabels: { display: false }
                },
                scales: {
                    x: { ticks: { color: t.text }, grid: { color: t.grid }, stacked: !!opts.stacked },
                    y: {
                        ticks: { color: t.text }, grid: { color: t.grid }, stacked: !!opts.stacked,
                        beginAtZero: true
                    }
                },
                ...opts.extra
            }
        });
    }

    function pieChart(id, labels, data, opts = {}) {
        const ctx = document.getElementById(id);
        if (!ctx) return null;
        const t = tema();
        return new Chart(ctx, {
            type: opts.doughnut ? "doughnut" : "pie",
            data: {
                labels,
                datasets: [{ data, backgroundColor: PALETTE, borderColor: t.border, borderWidth: 2 }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "right", labels: { color: t.text, boxWidth: 14 } },
                    datalabels: {
                        display: true,
                        formatter: (v, ctx2) => {
                            const tot = ctx2.dataset.data.reduce((a, b) => a + b, 0);
                            return tot > 0 ? Math.round(v / tot * 100) + "%" : "";
                        },
                        color: "#fff", font: { weight: "bold", size: 11 }
                    }
                }
            }
        });
    }

    // ── KPIs ─────────────────────────────────────────────────
    function renderKpis(dados) {
        const total = dados.length;
        const finalizadas = dados.filter(r => r.status === "finalizado").length;
        const pendentes = dados.filter(r => r.status !== "finalizado").length;
        const taxa = total > 0 ? (finalizadas / total * 100).toFixed(1) : "0.0";
        const durList = dados.map(r => r.duracao_min).filter(v => v !== null && v >= 0);
        const medDur = durList.length ? Math.round(media(durList)) : null;

        // SLA: OS onde o início foi no prazo (mesma data do programado ou antes)
        const comProg = dados.filter(r => r.data_programada && r.data_inicio_exec);
        const noPrazo = comProg.filter(r => {
            const prog = parseDateBR(r.data_programada);
            const exec = parseDateBR(r.data_inicio_exec);
            return prog && exec && exec <= prog;
        });
        const slaOkPct = comProg.length > 0 ? (noPrazo.length / comProg.length * 100).toFixed(1) + "%" : "—";

        elKpiTotal.textContent = total;
        elKpiFinalizadas.textContent = finalizadas;
        elKpiPendentes.textContent = pendentes;
        elKpiTaxa.textContent = taxa + "%";
        elKpiTempo.textContent = medDur !== null ? medDur + " min" : "—";
        elKpiSlaOk.textContent = slaOkPct;
    }

    // ── Gráficos Gerais ──────────────────────────────────────
    function renderGerais(dados) {
        // Status
        chartStatus = destroiGrafico(chartStatus);
        const statusMap = {};
        dados.forEach(r => {
            let s = r.status && r.status.trim() ? r.status.trim() : "";
            // Numéricos ou datas deslocadas = viabilidade de prospecto
            if (!s || /^\d+$/.test(s) || /^\d{2}\/\d{2}\/\d{4}/.test(s)) {
                s = "viabilidade";
            }
            statusMap[s] = (statusMap[s] || 0) + 1;
        });
        chartStatus = pieChart("osStatusChart",
            Object.keys(statusMap), Object.values(statusMap), { doughnut: true });

        // Tipo
        chartTipo = destroiGrafico(chartTipo);
        const tipoMap = {};
        dados.forEach(r => { if (r.tipo) tipoMap[r.tipo] = (tipoMap[r.tipo] || 0) + 1; });
        const tipoSort = Object.entries(tipoMap).sort((a, b) => b[1] - a[1]).slice(0, 12);
        chartTipo = barChart("osTipoChart",
            tipoSort.map(e => e[0].length > 28 ? e[0].slice(0, 26) + "…" : e[0]),
            [{
                label: "OS", data: tipoSort.map(e => e[1]),
                backgroundColor: tipoSort.map((_, i) => PALETTE[i % PALETTE.length])
            }],
            { horizontal: true });

        // Cidade
        chartCidade = destroiGrafico(chartCidade);
        const cidMap = {};
        dados.forEach(r => { if (r.cidade) cidMap[r.cidade] = (cidMap[r.cidade] || 0) + 1; });
        const cidSort = Object.entries(cidMap).sort((a, b) => b[1] - a[1]);
        chartCidade = barChart("osCidadeChart",
            cidSort.map(e => e[0]),
            [{
                label: "OS por Cidade", data: cidSort.map(e => e[1]),
                backgroundColor: PALETTE[2]
            }]);
    }

    // ── Produtividade por Técnico ─────────────────────────────
    function renderProdutividade(dados) {
        const tecnicos = [...new Set(dados.map(r => r.tecnico).filter(t => t && t !== "-"))];

        const stats = tecnicos.map(tec => {
            const rows = dados.filter(r => r.tecnico === tec);
            const fin = rows.filter(r => r.status === "finalizado").length;
            const pend = rows.length - fin;
            const taxa = rows.length > 0 ? (fin / rows.length * 100).toFixed(1) : "0.0";
            const durs = rows.map(r => r.duracao_min).filter(v => v !== null && v >= 0);
            const medD = durs.length ? Math.round(media(durs)) : null;
            const minD = durs.length ? Math.min(...durs) : null;
            const maxD = durs.length ? Math.max(...durs) : null;
            return { tec, total: rows.length, fin, pend, taxa: parseFloat(taxa), medD, minD, maxD };
        }).sort((a, b) => b.total - a.total);

        elProdStatus.textContent = `${stats.length} técnico(s) | ${dados.length} OS no período filtrado`;

        // Pódio
        renderPodium(stats.slice(0, 3));

        // Tabela
        elProdBody.innerHTML = stats.length === 0
            ? "<tr><td colspan='8'>Nenhum dado.</td></tr>"
            : stats.map((s, i) => `
                <tr>
                    <td>${i + 1}. ${s.tec}</td>
                    <td style="text-align:center;">${s.total}</td>
                    <td style="text-align:center; color:var(--color-success,#22c55e);">${s.fin}</td>
                    <td style="text-align:center; color:var(--color-warn,#f59e0b);">${s.pend}</td>
                    <td style="text-align:center;">${s.taxa}%</td>
                    <td style="text-align:center;">${s.medD !== null ? s.medD : "—"}</td>
                    <td style="text-align:center;">${s.minD !== null ? s.minD : "—"}</td>
                    <td style="text-align:center;">${s.maxD !== null ? s.maxD : "—"}</td>
                </tr>`).join("");

        // Gráfico barras total
        chartProd = destroiGrafico(chartProd);
        chartProd = barChart("osProdutividadeChart",
            stats.map(s => s.tec.split(" ").slice(0, 2).join(" ")),
            [{ label: "Finalizadas", data: stats.map(s => s.fin), backgroundColor: "#22c55e" },
            { label: "Pendentes", data: stats.map(s => s.pend), backgroundColor: "#f59e0b" }],
            { legend: true, stacked: true });

        // Tempo médio por técnico
        chartTempo = destroiGrafico(chartTempo);
        chartTempo = barChart("osTempoMedioTecnicoChart",
            stats.map(s => s.tec.split(" ").slice(0, 2).join(" ")),
            [{
                label: "Tempo médio (min)", data: stats.map(s => s.medD ?? 0),
                backgroundColor: stats.map((_, i) => PALETTE[i % PALETTE.length])
            }]);

        // Taxa conclusão
        chartTaxa = destroiGrafico(chartTaxa);
        chartTaxa = barChart("osTaxaConclusaoTecnicoChart",
            stats.map(s => s.tec.split(" ").slice(0, 2).join(" ")),
            [{
                label: "Taxa Conclusão (%)", data: stats.map(s => s.taxa),
                backgroundColor: stats.map(s => s.taxa >= 80 ? "#22c55e" : s.taxa >= 50 ? "#f59e0b" : "#ef4444")
            }]);

        // Tipo por técnico (stacked)
        const tipos = [...new Set(dados.map(r => r.tipo).filter(Boolean))].slice(0, 8);
        const tecLabels = stats.map(s => s.tec.split(" ").slice(0, 2).join(" "));
        const datasets = tipos.map((tipo, i) => ({
            label: tipo.length > 22 ? tipo.slice(0, 20) + "…" : tipo,
            data: stats.map(s => dados.filter(r => r.tecnico === s.tec && r.tipo === tipo).length),
            backgroundColor: PALETTE[i % PALETTE.length]
        }));
        chartTipoTecnico = destroiGrafico(chartTipoTecnico);
        chartTipoTecnico = barChart("osTipoTecnicoChart", tecLabels, datasets,
            { legend: true, stacked: true });
    }

    function renderPodium(stats) {
        if (!elPodium) return;
        const ordem = [1, 0, 2]; // Pódio: 2º, 1º, 3º
        elPodium.innerHTML = "";
        const cores = ["#f59e0b", "#14b8a6", "#f97316"];
        const medalhas = ["🥇", "🥈", "🥉"];
        const alturasOrd = [70, 100, 50];
        ordem.forEach((idx, pos) => {
            if (!stats[idx]) return;
            const s = stats[idx];
            const div = document.createElement("div");
            div.className = "podium__item";
            div.style.cssText = `
                display:flex; flex-direction:column; align-items:center; gap:6px;
                flex:1; min-width:0;
            `;
            div.innerHTML = `
                <span style="font-size:1.5rem;">${medalhas[idx]}</span>
                <strong style="font-size:0.82rem; text-align:center; word-break:break-word;">
                    ${s.tec.split(" ").slice(0, 2).join(" ")}
                </strong>
                <div style="
                    width:100%; background:${cores[idx]}; border-radius:8px 8px 0 0;
                    height:${alturasOrd[pos]}px; display:flex; align-items:center;
                    justify-content:center; color:#fff; font-weight:700; font-size:1.2rem;
                ">${s.total}</div>
                <small style="font-size:0.75rem; opacity:.8;">${s.taxa}% concluído</small>
            `;
            elPodium.appendChild(div);
        });
    }

    // ── SLA ───────────────────────────────────────────────────
    function renderSla(dados) {
        const comDur = dados.filter(r => r.duracao_min !== null && r.duracao_min >= 0);

        if (comDur.length === 0) {
            elSlaStatus.textContent = "Nenhuma OS com horário de execução para calcular SLA.";
            elSlaResumo.innerHTML = "";
            return;
        }

        elSlaStatus.textContent = `${comDur.length} OS com duração calculada.`;

        const durs = comDur.map(r => r.duracao_min);
        const medD = Math.round(media(durs));
        const minD = Math.min(...durs);
        const maxD = Math.max(...durs);
        const rapidas = comDur.filter(r => r.duracao_min <= 30).length;
        const normais = comDur.filter(r => r.duracao_min > 30 && r.duracao_min <= 120).length;
        const longas = comDur.filter(r => r.duracao_min > 120).length;

        elSlaResumo.innerHTML = `
            <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:12px;">
                <div class="status-card" style="flex:1; min-width:120px;">
                    <span class="status-card__label">Tempo Médio</span>
                    <span class="status-card__value">${medD} min</span>
                </div>
                <div class="status-card" style="flex:1; min-width:120px;">
                    <span class="status-card__label">Mais Rápida</span>
                    <span class="status-card__value status-card__value--success">${minD} min</span>
                </div>
                <div class="status-card" style="flex:1; min-width:120px;">
                    <span class="status-card__label">Mais Longa</span>
                    <span class="status-card__value status-card__value--danger">${maxD} min</span>
                </div>
                <div class="status-card" style="flex:1; min-width:120px;">
                    <span class="status-card__label">Rápidas (≤30min)</span>
                    <span class="status-card__value">${rapidas}</span>
                </div>
                <div class="status-card" style="flex:1; min-width:120px;">
                    <span class="status-card__label">Normais (31-120min)</span>
                    <span class="status-card__value">${normais}</span>
                </div>
                <div class="status-card" style="flex:1; min-width:120px;">
                    <span class="status-card__label">Longas (&gt;120min)</span>
                    <span class="status-card__value status-card__value--warning">${longas}</span>
                </div>
            </div>`;

        // Distribuição SLA (pizza)
        chartSlaDist = destroiGrafico(chartSlaDist);
        chartSlaDist = pieChart("osSlaDistChart",
            ["≤30 min (rápido)", "31-120 min (normal)", ">120 min (longo)"],
            [rapidas, normais, longas], { doughnut: true });

        // SLA médio por tipo
        chartSlaTipo = destroiGrafico(chartSlaTipo);
        const tipos = [...new Set(comDur.map(r => r.tipo).filter(Boolean))];
        const slaTipoData = tipos.map(tipo => {
            const rows = comDur.filter(r => r.tipo === tipo);
            return { tipo, med: Math.round(media(rows.map(r => r.duracao_min))) };
        }).sort((a, b) => b.med - a.med).slice(0, 10);
        chartSlaTipo = barChart("osSlaTipoChart",
            slaTipoData.map(e => e.tipo.length > 24 ? e.tipo.slice(0, 22) + "…" : e.tipo),
            [{
                label: "Média (min)", data: slaTipoData.map(e => e.med),
                backgroundColor: slaTipoData.map((_, i) => PALETTE[i % PALETTE.length])
            }],
            { horizontal: true });

        // SLA por técnico
        chartSlaAtend = destroiGrafico(chartSlaAtend);
        const tecUnicos = [...new Set(comDur.map(r => r.tecnico).filter(t => t && t !== "-"))];
        const slaTecData = tecUnicos.map(tec => {
            const rows = comDur.filter(r => r.tecnico === tec);
            return { tec, med: Math.round(media(rows.map(r => r.duracao_min))) };
        }).sort((a, b) => a.med - b.med);
        chartSlaAtend = barChart("osSlaAtendentesChart",
            slaTecData.map(s => s.tec.split(" ").slice(0, 2).join(" ")),
            [{
                label: "Tempo Médio (min)", data: slaTecData.map(s => s.med),
                backgroundColor: slaTecData.map((_, i) => PALETTE[i % PALETTE.length])
            }]);

        // Distribuição por faixa de duração (histograma)
        chartSlaDurFaixa = destroiGrafico(chartSlaDurFaixa);
        const faixas = [
            { label: "0-15", fn: d => d <= 15 },
            { label: "16-30", fn: d => d > 15 && d <= 30 },
            { label: "31-60", fn: d => d > 30 && d <= 60 },
            { label: "61-120", fn: d => d > 60 && d <= 120 },
            { label: "121-240", fn: d => d > 120 && d <= 240 },
            { label: ">240", fn: d => d > 240 }
        ];
        chartSlaDurFaixa = barChart("osSlaDuracaoFaixaChart",
            faixas.map(f => f.label + " min"),
            [{
                label: "Quantidade", data: faixas.map(f => durs.filter(f.fn).length),
                backgroundColor: ["#22c55e", "#14b8a6", "#0ea5e9", "#f59e0b", "#f97316", "#ef4444"]
            }]);

        // OS por dia da semana
        chartDiaSemana = destroiGrafico(chartDiaSemana);
        const diasOrdem = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
        const diasMap = {};
        dados.forEach(r => { if (r.dia_semana) diasMap[r.dia_semana] = (diasMap[r.dia_semana] || 0) + 1; });
        chartDiaSemana = barChart("osDiaSemanaChart",
            diasOrdem,
            [{
                label: "OS por dia", data: diasOrdem.map(d => diasMap[d] || 0),
                backgroundColor: diasOrdem.map((_, i) => PALETTE[i % PALETTE.length])
            }]);
    }

    // ── Tabela SLA com busca e paginação ─────────────────────
    function renderSlaTabela(dados) {
        const busca = (elSlaSearch?.value || "").toLowerCase();
        const status = elSlaFiltroStatus?.value || "";

        slaTableFiltered = dados.filter(r => {
            if (status && r.status !== status) return false;
            if (busca && !r.nome.toLowerCase().includes(busca) && !r.tecnico.toLowerCase().includes(busca)) return false;
            return true;
        });

        const tam = parseInt(elSlaTamanho?.value || "25");
        const total = slaTableFiltered.length;
        const paginas = Math.max(1, Math.ceil(total / tam));
        if (slaPagina >= paginas) slaPagina = paginas - 1;

        const ini = slaPagina * tam;
        const slice = slaTableFiltered.slice(ini, ini + tam);

        elSlaPageInfo && (elSlaPageInfo.textContent = `Página ${paginas > 0 ? slaPagina + 1 : 0} de ${paginas} (${total} registros)`);
        if (elSlaAnterior) elSlaAnterior.disabled = slaPagina === 0;
        if (elSlaProxima) elSlaProxima.disabled = slaPagina >= paginas - 1;

        elSlaTableBody.innerHTML = slice.length === 0
            ? "<tr><td colspan='10'>Nenhum dado encontrado.</td></tr>"
            : slice.map(r => {
                const cor = r.duracao_min === null ? "" :
                    r.duracao_min <= 30 ? "color:#22c55e" :
                        r.duracao_min <= 120 ? "color:#f59e0b" : "color:#ef4444";
                return `
                <tr>
                    <td style="font-size:0.78rem;">${r.numero_os || "—"}</td>
                    <td>${r.nome || "—"}</td>
                    <td>${r.tecnico || "—"}</td>
                    <td style="font-size:0.8rem;">${r.tipo || "—"}</td>
                    <td><span style="
                        background:${r.status === "finalizado" ? "#22c55e22" : "#f59e0b22"};
                        color:${r.status === "finalizado" ? "#22c55e" : "#f59e0b"};
                        border-radius:4px; padding:2px 7px; font-size:0.78rem; font-weight:600;
                    ">${r.status}</span></td>
                    <td>${r.data_programada || "—"}</td>
                    <td>${r.data_inicio_exec ? r.data_inicio_exec + " " + r.hora_inicio : "—"}</td>
                    <td>${r.data_termino ? r.data_termino + " " + r.hora_termino : "—"}</td>
                    <td style="text-align:center; font-weight:600; ${cor}">
                        ${r.duracao_min !== null ? r.duracao_min : "—"}
                    </td>
                    <td>${r.cidade || "—"}</td>
                </tr>`;
            }).join("");
    }

    // ── Render principal ─────────────────────────────────────
    // ── Diagnostico de Rede (OLT / PON) ─────────────────────
    // Classifica o tipo da OS num dos 3 grupos de problema de rede.
    // Usa palavras-chave para funcionar mesmo com pequenas variacoes de nomenclatura
    // entre arquivos/periodos diferentes (ex.: "S - LENTIDÃO FIBRA", "S - SEM ACESSO LOS").
    function classificarProblemaRede(tipo) {
        const t = String(tipo || "").toLowerCase();
        if (!t) return null;

        if (t.indexOf("lentid") !== -1) return "lentidao";
        if (t.indexOf("desconex") !== -1) return "desconexao";
        if (t.indexOf("sem acesso") !== -1 || t.indexOf("sem conex") !== -1 || t.indexOf(" los") !== -1 || t.indexOf("los ") !== -1) return "semConexao";

        return null;
    }

    // Extrai a OLT (equipamento_conexao, com fallback para pop_cliente) e a PON
    // (identificador completo da porta GPON: quadro/placa/porta, ex.: "0/1/4").
    // Os 3 numeros juntos identificam a porta PON fisica - nao ha um 4o numero de ONU
    // nesses dados, entao usar so os 2 primeiros nao seria a porta, e sim tudo os
    // dados de PONs diferentes ficarem misturados numa unica linha.
    function extrairOltEPon(registro) {
        const olt = (registro.equipamento_conexao || registro.pop_cliente || "").trim() || "Sem OLT identificada";
        const iface = String(registro.interface_conexao || "").trim();
        const m = iface.match(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/);
        const pon = m ? `${m[1]}/${m[2]}/${m[3]}` : (iface || "Sem PON identificada");

        return { olt, pon };
    }

    function montarResumoPorOlt(registros) {
        const mapa = new Map();

        (registros || []).forEach((registro) => {
            const categoria = classificarProblemaRede(registro.tipo);
            if (!categoria) return;

            const { olt } = extrairOltEPon(registro);

            if (!mapa.has(olt)) {
                mapa.set(olt, { olt, lentidao: 0, desconexao: 0, semConexao: 0, total: 0, pons: new Set() });
            }

            const { pon } = extrairOltEPon(registro);
            const linha = mapa.get(olt);
            linha[categoria] += 1;
            linha.total += 1;
            linha.pons.add(pon);
        });

        return Array.from(mapa.values())
            .map(linha => ({ ...linha, qtdPons: linha.pons.size }))
            .sort((a, b) => b.total - a.total);
    }

    function montarDiagnosticoRede(registros) {
        const mapa = new Map();

        (registros || []).forEach((registro) => {
            const categoria = classificarProblemaRede(registro.tipo);
            if (!categoria) return;

            const { olt, pon } = extrairOltEPon(registro);
            const chave = `${olt}||${pon}`;

            if (!mapa.has(chave)) {
                mapa.set(chave, { olt, pon, lentidao: 0, desconexao: 0, semConexao: 0, total: 0 });
            }

            const linha = mapa.get(chave);
            linha[categoria] += 1;
            linha.total += 1;
        });

        return Array.from(mapa.values()).sort((a, b) => b.total - a.total);
    }

    function renderDiagnosticoRede(dados) {
        if (!elRedeTableBody) return;

        const classificados = (dados || []).filter(r => classificarProblemaRede(r.tipo));
        const totalLentidao = classificados.filter(r => classificarProblemaRede(r.tipo) === "lentidao").length;
        const totalDesconexao = classificados.filter(r => classificarProblemaRede(r.tipo) === "desconexao").length;
        const totalSemConexao = classificados.filter(r => classificarProblemaRede(r.tipo) === "semConexao").length;

        if (elRedeResumo) {
            elRedeResumo.innerHTML = !classificados.length ? "" : `
                <div class="bairro-summary__cards">
                    <div class="bairro-summary__card"><span class="bairro-summary__value">${totalLentidao}</span><span class="bairro-summary__label">Lentidão Fibra</span></div>
                    <div class="bairro-summary__card"><span class="bairro-summary__value">${totalDesconexao}</span><span class="bairro-summary__label">Desconexões</span></div>
                    <div class="bairro-summary__card"><span class="bairro-summary__value">${totalSemConexao}</span><span class="bairro-summary__label">Sem Conexão</span></div>
                    <div class="bairro-summary__card bairro-summary__card--highlight"><span class="bairro-summary__value">${classificados.length}</span><span class="bairro-summary__label">Total nas 3 categorias</span></div>
                </div>`;
        }

        if (!classificados.length) {
            if (elRedeStatus) elRedeStatus.textContent = "Nenhuma OS de lentidão, desconexão ou sem conexão encontrada nos dados importados.";
            elRedeTableBody.innerHTML = '<tr><td colspan="6">Nenhum dado disponível.</td></tr>';
            if (elRedeOltTableBody) elRedeOltTableBody.innerHTML = '<tr><td colspan="6">Nenhum dado disponível.</td></tr>';
            return;
        }

        let linhas = montarDiagnosticoRede(dados);

        const busca = (elRedeSearch?.value || "").toLowerCase().trim();
        if (busca) {
            linhas = linhas.filter(l => l.olt.toLowerCase().includes(busca) || l.pon.toLowerCase().includes(busca));
        }

        if (elRedeStatus) {
            elRedeStatus.textContent = `${classificados.length} ocorrência(s) em ${linhas.length} combinação(ões) de OLT/PON. Primeiro veja o resumo por OLT: se poucas OLTs concentram quase tudo, é infraestrutura daquela OLT. Depois olhe a tabela por PON: problema numa unica porta = PON/splitter; espalhado por varias portas da mesma OLT = provavel problema da propria OLT/placa; espalhado entre varias OLTs = mais provavel ser do lado do cliente (CPE/Wi-Fi).`;
        }

        if (elRedeOltTableBody) {
            const linhasOlt = montarResumoPorOlt(dados);
            elRedeOltTableBody.innerHTML = !linhasOlt.length
                ? '<tr><td colspan="6">Nenhuma OLT encontrada.</td></tr>'
                : linhasOlt.map(l => `
                    <tr>
                        <td style="font-size:0.8rem;">${l.olt}</td>
                        <td style="text-align:center;">${l.lentidao || "—"}</td>
                        <td style="text-align:center;">${l.desconexao || "—"}</td>
                        <td style="text-align:center;">${l.semConexao || "—"}</td>
                        <td style="text-align:center; font-weight:600;">${l.total}</td>
                        <td style="text-align:center;">${l.qtdPons}</td>
                    </tr>`).join("");
        }

        elRedeTableBody.innerHTML = !linhas.length
            ? '<tr><td colspan="6">Nenhuma OLT/PON encontrada para a busca.</td></tr>'
            : linhas.map(l => `
                <tr>
                    <td style="font-size:0.8rem;">${l.olt}</td>
                    <td style="font-size:0.8rem;">${l.pon}</td>
                    <td style="text-align:center;">${l.lentidao || "—"}</td>
                    <td style="text-align:center;">${l.desconexao || "—"}</td>
                    <td style="text-align:center;">${l.semConexao || "—"}</td>
                    <td style="text-align:center; font-weight:600;">${l.total}</td>
                </tr>`).join("");
    }

    function renderTudo() {
        const dados = registrosAtuais;
        renderKpis(dados);
        renderGerais(dados);
        renderProdutividade(dados);
        renderSla(dados);
        renderDiagnosticoRede(dados);
        renderizarGraficoTempoMedio(dados);
        slaPagina = 0;
        renderSlaTabela(dados);
    }

    // ── Importação ────────────────────────────────────────────
    async function importar() {
        const file = elFileInput?.files?.[0];
        if (!file) { alert("Selecione um arquivo XLSX ou CSV."); return; }

        elImportStatus.textContent = "Importando…";
        elFileStatusText.textContent = file.name;

        try {
            const rows = await lerArquivo(file);
            registrosBase = rows.map(normalizarRegistro).filter(r => r.numero_os || r.nome);
            registrosAtuais = [...registrosBase];
            salvar(registrosBase, file.name);
            popularFiltros(registrosBase);
            renderTudo();
            elImportStatus.textContent = `${registrosBase.length} ordens importadas com sucesso.`;
        } catch (err) {
            console.error("[OS] Erro ao importar:", err);
            elImportStatus.textContent = "Erro ao importar o arquivo. Verifique o formato.";
        }
    }

    function limpar() {
        limparStorage();
        registrosBase = [];
        registrosAtuais = [];
        filtrosDef.forEach(({ campo }) => filtroSelecoes[campo].clear());
        popularFiltros([]);

        // ⏱️ Destrói a instância do gráfico de tempo médio para liberar a memória do Canvas
        if (chartTempoMedioOs) {
            chartTempoMedioOs.destroy();
            chartTempoMedioOs = null;
        }

        elFileStatusText && (elFileStatusText.textContent = "Nenhum arquivo selecionado");
        elImportStatus && (elImportStatus.textContent = "Dados limpos.");
        renderTudo();
    }

    // ── Inicialização ─────────────────────────────────────────
    function init() {
        // Carrega do localStorage se existir
        const salvos = carregar();
        if (salvos.length > 0) {
            registrosBase = salvos;
            registrosAtuais = [...salvos];
            popularFiltros(salvos);
            renderTudo();
            try {
                const meta = JSON.parse(localStorage.getItem(STORAGE_META) || "{}");
                elImportStatus.textContent = `${salvos.length} OS carregadas (${meta.fileName || "cache"}).`;
            } catch (_) { }
        }

        // Eventos importação
        elFileInput?.addEventListener("change", () => {
            elFileStatusText && (elFileStatusText.textContent = elFileInput.files?.[0]?.name || "");
        });
        elImportBtn?.addEventListener("click", importar);
        elLimparBtn?.addEventListener("click", limpar);

        // Eventos filtros
        elAplicarFiltros?.addEventListener("click", aplicarFiltros);
        elLimparFiltros?.addEventListener("click", limparFiltros);

        // Eventos tabela SLA
        elSlaSearch?.addEventListener("input", () => { slaPagina = 0; renderSlaTabela(registrosAtuais); });
        elRedeSearch?.addEventListener("input", () => { renderDiagnosticoRede(registrosAtuais); });
        elSlaFiltroStatus?.addEventListener("change", () => { slaPagina = 0; renderSlaTabela(registrosAtuais); });
        elSlaTamanho?.addEventListener("change", () => { slaPagina = 0; renderSlaTabela(registrosAtuais); });
        elSlaAnterior?.addEventListener("click", () => { slaPagina--; renderSlaTabela(registrosAtuais); });
        elSlaProxima?.addEventListener("click", () => { slaPagina++; renderSlaTabela(registrosAtuais); });
    }

    // Aguarda DOM pronto
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
