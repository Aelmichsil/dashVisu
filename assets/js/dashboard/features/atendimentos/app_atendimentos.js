// ============================================================
// app_atendimentos.js — Aba Atendimentos
// Cruzamento: relatório de portas do Libre (erros de interface)
// x Ordens de Serviço de Manutenção, agrupado por OLT, porta e
// localidade (cidade/bairro), para saber se um pico de chamados
// de manutenção coincide com uma interface reportando erro.
// ============================================================

(function () {
    "use strict";

    // ── Elementos de UI ──────────────────────────────────────
    const elFileInput = document.getElementById("libreArquivoInput");
    const elImportBtn = document.getElementById("libreImportButton");
    const elLimparBtn = document.getElementById("libreLimparButton");
    const elFileStatus = document.getElementById("libreFileStatus");
    const elStatus = document.getElementById("libreStatus");
    const elResumo = document.getElementById("libreResumo");
    const elSearch = document.getElementById("libreSearch");
    const elTableBody = document.getElementById("libreTableBody");

    // Se o HTML desta seção ainda não foi adicionado à página, não faz nada.
    if (!elTableBody) return;

    // ── Estado ───────────────────────────────────────────────
    const STORAGE_KEY = "libre-portas-v1";
    const STORAGE_META = "libre-portas-meta-v1";

    let libreRegistros = []; // portas normalizadas do relatório Libre

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
    function escapeHtml(str) {
        return String(str ?? "").replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    function normalizarNumero(valor) {
        const n = Number(String(valor ?? "").replace(/[^\d.-]/g, ""));
        return isNaN(n) ? 0 : n;
    }

    function normalizarChave(v) {
        return String(v || "").trim().toUpperCase();
    }

    // Uma OS é considerada "de manutenção" pelo tipo de OS (ex.:
    // "MANUTENÇÃO", "S - MANUTENÇÃO PROGRAMADA"), igual ao padrão de
    // classificação já usado no diagnóstico de rede do painel OS.
    function ehManutencao(tipo) {
        return String(tipo || "").toLowerCase().indexOf("manuten") !== -1;
    }

    // ── Parsing do relatório Libre (ports_controller) ─────────
    function normalizarLibreRegistro(raw) {
        const k = (nome) => {
            const chave = Object.keys(raw).find(c =>
                c.toLowerCase().replace(/[\s_]/g, "") === nome.toLowerCase().replace(/[\s_]/g, "")
            );
            return chave ? String(raw[chave] ?? "").trim() : "";
        };

        const hostname = k("Hostname");
        const port = k("Port");
        const status = k("Status").toLowerCase();
        const adminStatus = k("AdminStatus").toLowerCase();
        const inErrors = normalizarNumero(k("InErrors"));
        const outErrors = normalizarNumero(k("OutErrors"));
        const descricao = k("Description");

        // Extrai o padrão quadro/placa/porta (3 números) do campo Port,
        // ex.: "gpon_1/4/1" -> "1/4/1" — mesmo padrão usado no cruzamento
        // OLT/PON do painel de Ordens de Serviço, para que as chaves batam.
        const m = port.match(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/);
        const pon = m ? `${m[1]}/${m[2]}/${m[3]}` : (port || "Sem porta identificada");

        return {
            hostname: hostname || "Sem hostname",
            porta: port || "—",
            pon,
            status,
            adminStatus,
            inErrors,
            outErrors,
            descricao,
            temErro: inErrors > 0 || outErrors > 0
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

    async function importar() {
        const file = elFileInput?.files?.[0];
        if (!file) { alert("Selecione o arquivo CSV exportado do Libre (ports_controller)."); return; }

        elStatus.textContent = "Importando…";
        elFileStatus.textContent = file.name;

        try {
            const rows = await lerArquivo(file);
            libreRegistros = rows.map(normalizarLibreRegistro).filter(r => r.hostname !== "Sem hostname" || r.porta !== "—");
            salvar(libreRegistros, file.name);
            renderTudo();
        } catch (err) {
            console.error("[Atendimentos/Libre] Erro ao importar:", err);
            elStatus.textContent = "Erro ao importar o arquivo. Verifique se é o CSV exportado do Libre.";
        }
    }

    function limpar() {
        limparStorage();
        libreRegistros = [];
        elFileStatus && (elFileStatus.textContent = "Nenhum arquivo selecionado");
        renderTudo();
    }

    // ── Cruzamento: portas do Libre x OS de manutenção ────────
    function montarCruzamento() {
        const osRegistros = window.osRegistrosImportados || [];
        const extrair = window.extrairOltEPonOs; // exposto pelo app_os.js

        const mapa = new Map();
        libreRegistros.forEach(r => {
            const chave = `${normalizarChave(r.hostname)}||${r.pon}`;
            mapa.set(chave, {
                hostname: r.hostname,
                porta: r.porta,
                status: r.status,
                adminStatus: r.adminStatus,
                inErrors: r.inErrors,
                outErrors: r.outErrors,
                temErro: r.temErro,
                qtdManutencao: 0,
                localidades: new Map() // "Cidade — Bairro" -> qtd
            });
        });

        if (typeof extrair === "function") {
            osRegistros.forEach(os => {
                if (!ehManutencao(os.tipo)) return;
                const { olt, pon } = extrair(os);
                const chave = `${normalizarChave(olt)}||${pon}`;
                const linha = mapa.get(chave);
                if (!linha) return; // interface não está no relatório Libre importado
                linha.qtdManutencao += 1;
                const local = `${os.cidade || "Cidade não informada"}${os.bairro ? " — " + os.bairro : ""}`;
                linha.localidades.set(local, (linha.localidades.get(local) || 0) + 1);
            });
        }

        return Array.from(mapa.values());
    }

    // ── Renderização ───────────────────────────────────────────
    function renderResumo(linhas) {
        if (!elResumo) return;

        if (!linhas.length) {
            elResumo.innerHTML = "";
            return;
        }

        const comErro = linhas.filter(l => l.temErro).length;
        const comManutencao = linhas.filter(l => l.qtdManutencao > 0).length;
        const comErroEManutencao = linhas.filter(l => l.temErro && l.qtdManutencao > 0).length;
        const totalManutencaoVinculados = linhas.reduce((s, l) => s + l.qtdManutencao, 0);

        elResumo.innerHTML = `
            <div class="bairro-summary__cards">
                <div class="bairro-summary__card"><span class="bairro-summary__value">${linhas.length}</span><span class="bairro-summary__label">Portas no relatório Libre</span></div>
                <div class="bairro-summary__card"><span class="bairro-summary__value">${comErro}</span><span class="bairro-summary__label">Portas com erro (In/Out)</span></div>
                <div class="bairro-summary__card"><span class="bairro-summary__value">${comManutencao}</span><span class="bairro-summary__label">Portas com OS de manutenção</span></div>
                <div class="bairro-summary__card bairro-summary__card--highlight"><span class="bairro-summary__value">${comErroEManutencao}</span><span class="bairro-summary__label">Portas com erro E manutenção</span></div>
                <div class="bairro-summary__card"><span class="bairro-summary__value">${totalManutencaoVinculados}</span><span class="bairro-summary__label">Atendimentos de manutenção vinculados</span></div>
            </div>`;
    }

    function formatarLocalidades(mapaLocalidades) {
        const entradas = Array.from(mapaLocalidades.entries()).sort((a, b) => b[1] - a[1]);
        if (!entradas.length) return "—";
        const top = entradas.slice(0, 3).map(([local, qtd]) => `${escapeHtml(local)} (${qtd})`);
        const resto = entradas.length - 3;
        return top.join("<br>") + (resto > 0 ? `<br><span style="color: var(--ui-muted); font-size: 0.72rem;">+${resto} outra(s)</span>` : "");
    }

    function renderTabela(linhas, busca) {
        if (!elTableBody) return;

        if (!libreRegistros.length) {
            elStatus.textContent = "Importe o relatório de portas exportado do Libre (ports_controller) para começar.";
            elTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px;">Nenhum relatório do Libre importado ainda.</td></tr>`;
            return;
        }

        let filtradas = linhas;
        const termo = (busca || "").toLowerCase().trim();
        if (termo) {
            filtradas = filtradas.filter(l =>
                l.hostname.toLowerCase().includes(termo) || l.porta.toLowerCase().includes(termo)
            );
        }

        filtradas = [...filtradas].sort((a, b) => {
            if (b.qtdManutencao !== a.qtdManutencao) return b.qtdManutencao - a.qtdManutencao;
            return (b.inErrors + b.outErrors) - (a.inErrors + a.outErrors);
        });

        const semOsCarregada = !(window.osRegistrosImportados || []).length;
        elStatus.textContent = semOsCarregada
            ? `${libreRegistros.length} porta(s) do Libre importadas. Importe também o relatório de OS na aba Ordens de Serviço para cruzar com os atendimentos de manutenção.`
            : `${filtradas.length} porta(s) exibidas. Ordenado por quantidade de atendimentos de manutenção — se a porta com mais chamados também aparece com erros de In/Out, o problema provavelmente está na interface.`;

        if (!filtradas.length) {
            elTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px;">Nenhuma porta encontrada para a busca.</td></tr>`;
            return;
        }

        elTableBody.innerHTML = filtradas.map(l => {
            const destaque = l.temErro && l.qtdManutencao > 0;
            const statusBadge = l.status === "up" ? "badge--green" : "badge--red";
            return `
                <tr${destaque ? ' style="background: rgba(255, 126, 141, 0.07);"' : ""}>
                    <td style="font-size:0.8rem;">${escapeHtml(l.hostname)}</td>
                    <td style="font-size:0.8rem;">${escapeHtml(l.porta)}</td>
                    <td><span class="badge ${statusBadge}">${escapeHtml(l.status || "—")}</span></td>
                    <td style="text-align:center; ${l.inErrors > 0 ? 'color: var(--ui-danger); font-weight:700;' : ''}">${l.inErrors.toLocaleString("pt-BR")}</td>
                    <td style="text-align:center; ${l.outErrors > 0 ? 'color: var(--ui-danger); font-weight:700;' : ''}">${l.outErrors.toLocaleString("pt-BR")}</td>
                    <td style="text-align:center; font-weight:700;">${l.qtdManutencao || "—"}</td>
                    <td style="font-size:0.78rem;">${formatarLocalidades(l.localidades)}</td>
                </tr>`;
        }).join("");
    }

    function renderTudo() {
        const linhas = montarCruzamento();
        renderResumo(linhas);
        renderTabela(linhas, elSearch?.value || "");
    }

    // ── Inicialização ─────────────────────────────────────────
    function init() {
        const salvos = carregar();
        if (salvos.length > 0) {
            libreRegistros = salvos;
            try {
                const meta = JSON.parse(localStorage.getItem(STORAGE_META) || "{}");
                elFileStatus && (elFileStatus.textContent = meta.fileName || "cache");
            } catch (_) { }
        }
        renderTudo();

        elFileInput?.addEventListener("change", () => {
            elFileStatus && (elFileStatus.textContent = elFileInput.files?.[0]?.name || "Nenhum arquivo selecionado");
        });
        elImportBtn?.addEventListener("click", importar);
        elLimparBtn?.addEventListener("click", limpar);
        elSearch?.addEventListener("input", () => renderTudo());

        // Recalcula sempre que o painel de OS publicar dados novos
        // (import, limpeza, ou carregamento inicial a partir do cache).
        document.addEventListener("os-dados-atualizados", () => renderTudo());
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
