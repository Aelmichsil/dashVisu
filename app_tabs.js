// ============================================================
// app_tabs.js — Orquestração de Abas Unificadas (Telecom 2026)
// ============================================================

(function () {
    "use strict";

    // Mapeamento exato de Botão -> Painel correspondente no HTML
    const mapeamentoAbas = {
        "tabHubsoft": "panelHubsoft",
        "tabAtendimentos": "panelAtendimentos", // Nova Aba Adicionada!
        "tabChat": "panelChat",
        "tabNps": "panelNps",
        "tabPesquisa": "panelPesquisa",
        "tabProspecto": "panelProspecto",
        "tabOs": "panelOs"
    };

    const botoes = Object.keys(mapeamentoAbas);

    function alternarAba(idBotaoClicado) {
        botoes.forEach(idBotao => {
            const botao = document.getElementById(idBotao);
            const idPainel = mapeamentoAbas[idBotao];
            const painel = document.getElementById(idPainel);

            if (!botao || !painel) return;

            if (idBotao === idBotaoClicado) {
                // Ativa a aba selecionada
                botao.classList.add("nav-tab--active");
                botao.setAttribute("aria-selected", "true");
                painel.removeAttribute("hidden");
                painel.style.display = "block"; // Garante renderização no tema
            } else {
                // Oculta as outras abas
                botao.classList.remove("nav-tab--active");
                botao.setAttribute("aria-selected", "false");
                painel.setAttribute("hidden", "true");
                painel.style.display = "none";
            }
        });
    }

    // Vincula os eventos de clique em todos os botões mapeados
    botoes.forEach(idBotao => {
        const botao = document.getElementById(idBotao);
        if (botao) {
            botao.addEventListener("click", () => {
                alternarAba(idBotao);
            });
        }
    });

})();