// ============================================================
// auth-guard.js — Protege as páginas do dashboard exigindo login
// Inclua este script no <head>, logo após a lib do supabase-js,
// ANTES dos demais scripts (app.js, app_chat.js, etc).
// ============================================================

(function () {
    "use strict";

    const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.content;
    const supabaseKey = document.querySelector('meta[name="supabase-key"]')?.content;

    if (!supabaseUrl || !supabaseKey || !window.supabase) {
        console.error("auth-guard: supabase-js ou meta tags não encontrados.");
        return;
    }

    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    window.dashboardSupabase = supabase; // reaproveitável pelos demais app_*.js, se precisar

    function revelarPagina() {
        document.documentElement.style.visibility = "visible";
        if (document.body) {
            document.body.style.visibility = "visible";
        } else {
            document.addEventListener("DOMContentLoaded", () => {
                document.body.style.visibility = "visible";
            });
        }
    }

    function irParaLogin() {
        window.location.replace("login.html");
    }

    function montarBarraUsuario(email) {
        document.addEventListener("DOMContentLoaded", () => {
            const header = document.querySelector(".dashboard__header");
            if (!header || document.getElementById("authUserBar")) return;

            const barra = document.createElement("div");
            barra.id = "authUserBar";
            barra.style.cssText = "display:flex;align-items:center;gap:12px;justify-content:flex-end;margin-bottom:10px;font-size:0.8rem;color:var(--ui-muted,#96a5cf);";
            barra.innerHTML = `
                <span>${email}</span>
                <button id="btnSair" type="button" class="secondary-button" style="padding:4px 12px;">Sair</button>
            `;
            header.prepend(barra);

            document.getElementById("btnSair").addEventListener("click", async () => {
                await supabase.auth.signOut();
                irParaLogin();
            });
        });
    }

    (async function verificarAcesso() {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
            irParaLogin();
            return;
        }

        montarBarraUsuario(data.session.user.email);
        revelarPagina();
    })();

    supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") {
            irParaLogin();
        }
    });

})();
