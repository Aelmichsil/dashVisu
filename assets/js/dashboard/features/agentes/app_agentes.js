(function () {
    "use strict";

    const STORAGE_KEY = "dashboard-agentes-equipes-v1";
    const TEAM_OPTIONS = ["Não atribuído", "Suporte Interno", "Comercial", "Financeiro"];
    const modal = document.getElementById("settingsModal");
    const list = document.getElementById("teamAssignmentsList");
    const personSelect = document.getElementById("agentsPersonSelect");
    const periodSelect = document.getElementById("agentsPeriodSelect");
    const kpis = document.getElementById("agentsKpis");
    const statusEl = document.getElementById("agentsStatus");
    if (!modal || !list || !personSelect || !kpis) return;

    let assignments = readAssignments();
    let selectedTeam = "todos";
    let selectedPerson = "";
    let infoPanels = {};

    function readAssignments() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {}; } catch (_) { return {}; }
    }
    function saveAssignments() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments)); } catch (_) {} }
    function esc(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
    function norm(value) { return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim(); }
    // A gestão de equipes e os indicadores operacionais são baseados
    // exclusivamente na coluna usuario_abertura.
    function agentName(row) { return String(row?.usuarioAbertura || "").trim(); }
    function uniqueNames(records) {
        const map = new Map();
        (records || []).forEach(row => { const name = agentName(row); if (name && name !== "-") { const key = norm(name); if (!map.has(key)) map.set(key, name); } });
        return [...map.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
    }
    function records() { return window.DashboardDataProvider?.getRecords?.() || []; }
    function parseDate(value) {
        if (!value) return null;
        const text = String(value).trim();
        if (!text) return null;
        const br = text.match(/^(\d{1,2})[\\/](\d{1,2})[\\/](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
        if (br) return new Date(Number(br[3].length === 2 ? `20${br[3]}` : br[3]), Number(br[2]) - 1, Number(br[1]), Number(br[4] || 0), Number(br[5] || 0), Number(br[6] || 0));
        const date = new Date(text);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    function inPeriod(row) {
        const date = parseDate(row.dataAbertura || row.dataFechamento);
        if (!date) return true;
        const days = Number(periodSelect.value) || Number(window.DashboardDataProvider?.getPeriodDays?.()) || 30;
        return date.getTime() >= Date.now() - days * 86400000;
    }
    function status(row) {
        const text = norm(row.status || row.resolucao);
        if (/(aguard|analise|triagem)/.test(text)) return "aguardando";
        if (/(pend|abert|andament|retorno|sem conclu|nao conclu|sem resol|nao resol)/.test(text) || !text) return "pendente";
        if (/(resolvido|concluido|finalizado|fechado|encerrado|concluso)/.test(text)) return "finalizado";
        return "pendente";
    }
    function osQty(row) { const value = Number(String(row.quantidade ?? 0).replace(",", ".")); return Number.isFinite(value) ? value : 0; }
    function getVisibleNames() {
        return uniqueNames(records().filter(inPeriod)).filter(name => selectedTeam === "todos" || (assignments[norm(name)] || "Não atribuído") === selectedTeam);
    }
    function renderSettings() {
        const names = uniqueNames(records());
        if (!names.length) { list.innerHTML = '<div class="agents-empty">Nenhum usuário encontrado nos dados importados.</div>'; return; }
        list.innerHTML = names.map(name => `<label class="team-assignment-row"><span class="team-assignment-name">${esc(name)}<span class="team-assignment-meta">${esc(assignments[norm(name)] || "Não atribuído")}</span></span><select data-agent-assignment="${esc(norm(name))}" aria-label="Equipe de ${esc(name)}">${TEAM_OPTIONS.map(team => `<option value="${esc(team)}" ${(assignments[norm(name)] || "Não atribuído") === team ? "selected" : ""}>${esc(team)}</option>`).join("")}</select></label>`).join("");
        list.querySelectorAll("select[data-agent-assignment]").forEach(select => select.addEventListener("change", () => {
            assignments[select.dataset.agentAssignment] = select.value; saveAssignments();
            const meta = select.closest(".team-assignment-row")?.querySelector(".team-assignment-meta"); if (meta) meta.textContent = select.value;
            document.getElementById("settingsSaveStatus").textContent = "Atribuição salva.";
            renderAgents();
        }));
    }
    function openSettings() { renderSettings(); modal.hidden = false; modal.style.display = "flex"; }
    function closeSettings() { modal.hidden = true; modal.style.display = "none"; }
    document.getElementById("openSettingsButton")?.addEventListener("click", openSettings);
    document.getElementById("closeSettingsButton")?.addEventListener("click", closeSettings);
    modal.addEventListener("click", event => { if (event.target === modal) closeSettings(); });
    document.getElementById("clearAssignmentsButton")?.addEventListener("click", () => { assignments = {}; saveAssignments(); renderSettings(); renderAgents(); document.getElementById("settingsSaveStatus").textContent = "Atribuições limpas."; });

    function renderPersonOptions() {
        const names = getVisibleNames();
        if (!names.some(n => norm(n) === norm(selectedPerson))) selectedPerson = names[0] || "";
        personSelect.innerHTML = names.length ? names.map(name => `<option value="${esc(name)}" ${norm(name) === norm(selectedPerson) ? "selected" : ""}>${esc(name)}</option>`).join("") : '<option value="">Nenhum atendente vinculado</option>';
    }
    function pct(value, total) { return total ? `${((value / total) * 100).toFixed(1).replace(".", ",")}%` : "—"; }
    function elapsedSince(value) {
        const date = parseDate(value);
        if (!date) return "Sem data";
        const diff = Math.max(0, Date.now() - date.getTime());
        const minutes = Math.floor(diff / 60000);
        const days = Math.floor(minutes / 1440);
        const hours = Math.floor((minutes % 1440) / 60);
        const rest = minutes % 60;
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${rest}min`;
        return `${rest}min`;
    }
    function minutesBetween(a, b) { const x = parseDate(a), y = parseDate(b); return x && y && y >= x ? (y - x) / 60000 : null; }
    function metricCard(label, value, hint, infoKey) { return `<div class="agents-kpi-card"><span class="agents-kpi-card__label">${label}${infoKey ? `<button type="button" class="agents-info-button" data-agents-info="${infoKey}" aria-label="Ver tipos de atendimento de ${label}">i</button>` : ""}</span><strong class="agents-kpi-card__value">${value}</strong>${hint ? `<span class="agents-kpi-card__hint">${hint}</span>` : ""}</div>`; }
    function renderTypeBreakdown(title, rows) {
        const map = new Map();
        rows.forEach(row => {
            const type = String(row.tipoAtendimento || "Não informado").trim() || "Não informado";
            const key = norm(type);
            const current = map.get(key);
            if (current) current.total += 1;
            else map.set(key, { name: type, total: 1 });
        });
        const items = [...map.values()].sort((a, b) => b.total - a.total);
        const total = rows.length;
        const body = items.length
            ? items.map(item => `<tr><td>${esc(item.name)}</td><td>${item.total}</td><td>${pct(item.total, total)}</td></tr>`).join("")
            : '<tr><td colspan="3">Nenhum registro no período.</td></tr>';
        const details = rows.length
            ? rows.map(row => `<tr><td>${esc(String(row.tipoAtendimento || "Não informado").trim() || "Não informado")}</td><td>${esc(row.codigoCliente || "Não informado")}</td><td>${elapsedSince(row.dataAbertura)}</td></tr>`).join("")
            : '<tr><td colspan="3">Nenhum registro no período.</td></tr>';
        return `<div class="agents-breakdown"><h4>${title}</h4><table><thead><tr><th>Tipo de atendimento</th><th>Qtd.</th><th>%</th></tr></thead><tbody>${body}</tbody></table><h5 class="agents-breakdown__details-title">Detalhamento por atendimento</h5><table class="agents-breakdown__details"><thead><tr><th>Tipo</th><th>Código cliente</th><th>Tempo desde abertura</th></tr></thead><tbody>${details}</tbody></table></div>`;
    }
    function renderTypeEfficiency(title, rows, matcher) {
        const typeRows = rows.filter(row => matcher(norm(row.tipoAtendimento || "")));
        const remote = typeRows.filter(row => status(row) === "finalizado" && osQty(row) === 0).length;
        const os = typeRows.filter(row => osQty(row) > 0).length;
        return `<div class="agents-type-efficiency"><h4>${title}</h4><div class="agents-type-efficiency__total">${typeRows.length} atendimento(s)</div><div class="agents-type-efficiency__metrics"><span><strong>${pct(remote, typeRows.length)}</strong><small>Resolvidos remotamente</small></span><span><strong>${pct(os, typeRows.length)}</strong><small>OS abertas</small></span></div></div>`;
    }
    const infoModal = document.createElement("div");
    infoModal.className = "agents-info-modal";
    infoModal.hidden = true;
    infoModal.innerHTML = `<div class="agents-info-modal__card" role="dialog" aria-modal="true" aria-labelledby="agentsInfoTitle"><header><h3 id="agentsInfoTitle">Tipos de atendimento</h3><button type="button" class="agents-info-modal__close" aria-label="Fechar">×</button></header><div class="agents-info-modal__body"></div></div>`;
    document.body.appendChild(infoModal);
    function closeInfo() { infoModal.hidden = true; }
    function openInfo(key) { const body = infoModal.querySelector(".agents-info-modal__body"); if (body) body.innerHTML = infoPanels[key] || '<div class="agents-empty">Nenhum tipo de atendimento encontrado.</div>'; infoModal.hidden = false; }
    infoModal.addEventListener("click", event => { if (event.target === infoModal || event.target.closest(".agents-info-modal__close")) closeInfo(); });
    function renderAgents() {
        renderPersonOptions();
        const all = records().filter(inPeriod);
        const selected = all.filter(row => norm(agentName(row)) === norm(selectedPerson));
        if (!selectedPerson || !selected.length) {
            statusEl.textContent = all.length ? "Selecione um atendente vinculado para visualizar seus indicadores." : "Importe os atendimentos para visualizar os indicadores dos agentes.";
            kpis.innerHTML = '<div class="agents-empty">Nenhum atendimento encontrado para os filtros atuais.</div>';
            return;
        }
        const total = selected.length;
        const finalizados = selected.filter(row => status(row) === "finalizado").length;
        const pendentes = selected.filter(row => status(row) === "pendente").length;
        const aguardando = selected.filter(row => status(row) === "aguardando").length;
        const remotos = selected.filter(row => status(row) === "finalizado" && osQty(row) === 0).length;
        const osAbertas = selected.filter(row => osQty(row) > 0).length;
        const remotosRows = selected.filter(row => status(row) === "finalizado" && osQty(row) === 0);
        const osRows = selected.filter(row => osQty(row) > 0);
        const backlog = pendentes + aguardando;
        const dates = new Set(selected.map(row => parseDate(row.dataAbertura || row.dataFechamento)).filter(Boolean).map(date => date.toISOString().slice(0, 10)));
        const tmAs = selected.map(row => minutesBetween(row.dataAbertura, row.dataFechamento)).filter(v => v !== null);
        const tma = tmAs.length ? `${Math.round(tmAs.reduce((a, b) => a + b, 0) / tmAs.length)} min` : "—";
        const mediaDia = dates.size ? (total / dates.size).toFixed(1).replace(".", ",") : "—";
        const team = assignments[norm(selectedPerson)] || "Não atribuído";
        statusEl.textContent = `${selectedPerson} · ${team} · ${total} atendimento(s) no período.`;
        const teamKpi = team === "Suporte Interno" ? "Taxa de Reincidência (7 dias)" : team === "Comercial" ? "Conversão / Viabilidade" : team === "Financeiro" ? "Retenção / Desbloqueio" : "KPI específico da equipe";
        infoPanels = {
            remote: renderTypeBreakdown("Resolvidos remotamente por tipo", remotosRows),
            os: renderTypeBreakdown("OS abertas por tipo", osRows),
            pending: renderTypeBreakdown("Atendimentos em pendência por tipo", selected.filter(row => status(row) === "pendente")),
            analysis: renderTypeBreakdown("Atendimentos aguardando análise por tipo", selected.filter(row => status(row) === "aguardando"))
        };
        kpis.innerHTML = `<section class="agents-kpi-group"><h3>Volume e status</h3><div class="agents-kpi-grid">${metricCard("Total de Atendimentos", total)}${metricCard("Finalizados", finalizados)}${metricCard("Em Pendência", pendentes, "", "pending")}${metricCard("Aguardando Análise", aguardando, "", "analysis")}</div></section><section class="agents-kpi-group"><h3>Eficiência técnica</h3><div class="agents-kpi-grid">${metricCard("Resolvidos Remotamente", `${remotos} · ${pct(remotos, finalizados)}`, "FCR sobre finalizados", "remote")}${metricCard("OS Abertas", `${osAbertas} · ${pct(osAbertas, total)}`, "Taxa de escalonamento", "os")}${metricCard("Retenção / Pendência", pct(backlog, total), "Pendência + Aguardando análise")}${metricCard(teamKpi, "—", "Campo não disponível na importação")}</div><div class="agents-type-efficiency-grid">${renderTypeEfficiency("Conexão lenta", selected, value => value.includes("conexao lenta"))}${renderTypeEfficiency("Suporte técnico", selected, value => value.includes("suporte tecnico"))}</div></section><section class="agents-kpi-group"><h3>Ritmo e qualidade</h3><div class="agents-kpi-grid">${metricCard("Média de Atendimentos / Dia", mediaDia, dates.size ? `${dates.size} dia(s) ativo(s)` : "Sem timestamps")}${metricCard("TMA Médio", tma, tmAs.length ? "Abertura até encerramento" : "Mapeie as datas")}${metricCard("TME / 1ª Resposta", "—", "Sem timestamp de primeira resposta")}${metricCard("CSAT", "—", "Sem pesquisa vinculada")}</div></section>`;
        kpis.querySelectorAll("[data-agents-info]").forEach(button => button.addEventListener("click", () => openInfo(button.dataset.agentsInfo)));
    }
    document.querySelectorAll("[data-agents-team]").forEach(button => button.addEventListener("click", () => { selectedTeam = button.dataset.agentsTeam; document.querySelectorAll("[data-agents-team]").forEach(item => { const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", String(active)); }); renderAgents(); }));
    personSelect.addEventListener("change", () => { selectedPerson = personSelect.value; renderAgents(); });
    periodSelect?.addEventListener("change", () => { const main = document.getElementById("filterPeriodoDias"); if (main) main.value = periodSelect.value; renderAgents(); });
    document.getElementById("filterPeriodoDias")?.addEventListener("change", () => { if (periodSelect) periodSelect.value = document.getElementById("filterPeriodoDias").value; renderAgents(); });
    window.addEventListener("dashboardRecordsUpdated", () => { renderAgents(); if (!modal.hidden) renderSettings(); });
    renderAgents();
    window.addEventListener("load", () => { renderAgents(); });
})();
