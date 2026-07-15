// ============================================================
// app_atendimentos.js — Painel de Atendimentos Reagendados
// Regra: OS com status "aguardando_agendamento" e data_inicio_programado < atual
// ============================================================

(function () {
    "use strict";

    // Elementos do DOM
    const elTableBody = document.getElementById("atendimentosReagendadosTableBody");
    const elStatusText = document.getElementById("atendimentosReagendadosStatus");
    const elCardsContainer = document.getElementById("atendimentosReagendadosCards");

    /**
     * Converte string de data padrão Hubsoft/OS para objeto Date formal
     */
    function parsarDataProgramada(valor) {
        if (!valor) return null;
        // Se já for Date
        if (Object.prototype.toString.call(valor) === "[object Date]") return valor;

        const texto = String(valor).trim();
        // dd/mm/yyyy
        const match = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (match) {
            return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 0, 0, 0);
        }

        const iso = new Date(texto);
        return isNaN(iso.getTime()) ? null : iso;
    }

    /**
     * Executa o cruzamento inteligente de dados entre Atendimentos e OS
     */
    function processarAtendimentosReagendados() {
        // Puxa as variáveis globais populadas pelo app.js através da aba Hubsoft
        const atendimentos = window.registrosImportados || [];
        const osRegistros = window.osRegistrosImportados || [];

        if (atendimentos.length === 0 || osRegistros.length === 0) {
            elStatusText.textContent = "Aguardando importação dos arquivos de Atendimentos e OS na aba Hubsoft.";
            return;
        }

        const dataAtual = new Date();
        dataAtual.setHours(0, 0, 0, 0); // Zera horas para comparação puramente por data

        // Filtrar e cruzar dados
        const reagendados = [];

        atendimentos.forEach(atend => {
            // Localiza a OS vinculada ao atendimento (via descrição ou número de OS mapeado)
            const descricaoFechamento = atend.descricaoFechamento || "";

            // Reutiliza a inteligência de busca aproximada do ecossistema
            let vinculoOs = null;
            if (typeof window.obterOsPorDescricaoFechamento === "function") {
                vinculoOs = window.obterOsPorDescricaoFechamento(descricaoFechamento);
            }

            // Se achou a OS indexada, aplica as regras de negócio solicitadas
            if (vinculoOs && vinculoOs.registro) {
                const os = vinculoOs.registro;
                const statusOs = String(os.status || "").toLowerCase().trim();
                const dataProg = parsarDataProgramada(os.dataProgramada || os.data_programada);
                
                // Regra de Ouro: status === aguardando_agendamento E data_programada < atual
                if (statusOs === "aguardando_agendamento" && dataProg && dataProg < dataAtual) {
                    reagendados.push({
                        atendimento: atend,
                        os: os,
                        dataProgFormatada: os.dataRealizada || "—"
                    });
                }
            }
        });

        renderizarCardsKPI(reagendados.length);
        renderizarTabela(reagendados);
    }

    function renderizarCardsKPI(total) {
        if (!elCardsContainer) return;
        elCardsContainer.innerHTML = `
            <div class="status-card status-card--pending">
                <span class="status-card__label">OS Reagendadas em Atraso</span>
                <span class="status-card__value">${total}</span>
            </div>
        `;
    }

    function renderizarTabela(dados) {
        if (!elTableBody) return;

        if (dados.length === 0) {
            elStatusText.textContent = "Nenhuma ordem de serviço reagendada antes da data atual encontrada.";
            elTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px;">Nenhum atendimento retido na regra operacional.</td></tr>`;
            return;
        }

        elStatusText.textContent = `${dados.length} caso(s) retido(s) que necessitam de intervenção técnica imediata.`;

        elTableBody.innerHTML = dados.map(item => {
            const a = item.atendimento;
            const o = item.os;

            return `
                <tr>
                    <td style="font-weight: 600; font-size: 0.85rem;">
                        OS: #${o.numeroOs || "—"}<br>
                        <span style="color: var(--ui-muted); font-size: 0.75rem;">Prot: ${a.codigoCliente || "—"}</span>
                    </td>
                    <td>${a.nomeCliente || "—"}</td>
                    <td>
                        <span class="recorrente-pagina-badge">${a.numeroPlano || "—"}</span>
                    </td>
                    <td style="font-size: 0.8rem;">
                        ${a.cidade || "—"}<br>
                        <span style="color: var(--ui-muted); font-size: 0.75rem;">${a.bairro || "—"}</span>
                    </td>
                    <td style="color: var(--ui-danger); font-weight: 700;">${item.dataProgFormatada}</td>
                    <td>
                        <span class="badge badge--yellow">${o.status || "aguardando_agendamento"}</span>
                    </td>
                    <td style="font-size: 0.8rem;">${a.usuarioAbertura || "—"}</td>
                </tr>
            `;
        }).join("");
    }

    // Registra a função de atualização no escopo global para o app.js invocá-la ao carregar arquivos
    window.atualizarAbaAtendimentosReagendados = processarAtendimentosReagendados;

    // Monitora a ativação da aba para recalcular em real-time
    document.getElementById("tabAtendimentos")?.addEventListener("click", () => {
        processarAtendimentosReagendados();
    });

})();