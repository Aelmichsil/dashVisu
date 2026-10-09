// ============================================================
// login.js — Autenticação (Apenas Login e Recuperação de Senha)
// Restrito a e-mails do domínio @nossanet.net.br
// ============================================================

(function () {
    "use strict";

    const DOMINIO_PERMITIDO = "nossanet.net.br";
    const REGEX_DOMINIO = new RegExp("@" + DOMINIO_PERMITIDO.replace(/\./g, "\\.") + "$", "i");

    const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.content;
    const supabaseKey = document.querySelector('meta[name="supabase-key"]')?.content;
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const elMensagem = document.getElementById("authMessage");
    const views = document.querySelectorAll(".auth-view");

    function validarDominio(email) {
        return REGEX_DOMINIO.test(String(email || "").trim());
    }

    function mostrarMensagem(texto, tipo) {
        elMensagem.textContent = texto;
        elMensagem.className = "auth-message " + (tipo === "erro" ? "auth-message--error" : "auth-message--success");
    }

    function limparMensagem() {
        elMensagem.textContent = "";
        elMensagem.className = "auth-message";
    }

    function mostrarView(idView) {
        views.forEach(v => v.classList.toggle("auth-view--active", v.id === idView));
        limparMensagem();
    }

    function obterUrlRedirect() {
        if (window.location.protocol === "file:") return undefined;
        return window.location.origin + window.location.pathname;
    }

    // Alterna abas/links internos
    document.querySelectorAll("[data-view]").forEach(el => {
        el.addEventListener("click", () => mostrarView(el.dataset.view));
    });

    function traduzirErro(msg) {
        const texto = String(msg || "").toLowerCase();
        if (texto.includes("invalid login credentials")) return "E-mail ou senha inválidos.";
        if (texto.includes("password should be at least")) return "A senha deve ter pelo menos 8 caracteres.";
        if (texto.includes("email not confirmed")) return "E-mail não confirmado ou pendente de ativação.";
        return msg || "Ocorreu um erro. Tente novamente.";
    }

    function definirCarregando(botao, carregando, textoOriginal) {
        botao.disabled = carregando;
        botao.textContent = carregando ? "Aguarde..." : textoOriginal;
    }

    // ------------------------------------------------------------
    // LOGIN
    // ------------------------------------------------------------
    document.getElementById("viewLogin").addEventListener("submit", async (ev) => {
        ev.preventDefault();
        limparMensagem();
        const email = document.getElementById("loginEmail").value.trim();
        const senha = document.getElementById("loginSenha").value;
        const botao = document.getElementById("btnLogin");

        if (!validarDominio(email)) {
            mostrarMensagem("Use um e-mail do domínio @" + DOMINIO_PERMITIDO + ".", "erro");
            return;
        }

        definirCarregando(botao, true, "Entrar");
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        definirCarregando(botao, false, "Entrar");

        if (error) {
            console.error("Erro Supabase Auth (signIn):", error);
            mostrarMensagem(traduzirErro(error.message), "erro");
            return;
        }

        window.location.href = "index.html";
    });

    // ------------------------------------------------------------
    // RECUPERAR SENHA
    // ------------------------------------------------------------
    document.getElementById("viewRecuperar").addEventListener("submit", async (ev) => {
        ev.preventDefault();
        limparMensagem();
        const email = document.getElementById("recuperarEmail").value.trim();
        const botao = document.getElementById("btnRecuperar");

        if (!validarDominio(email)) {
            mostrarMensagem("Use um e-mail do domínio @" + DOMINIO_PERMITIDO + ".", "erro");
            return;
        }

        definirCarregando(botao, true, "Enviar link de recuperação");
        const redirectUrl = obterUrlRedirect();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            ...(redirectUrl ? { redirectTo: redirectUrl } : {})
        });
        definirCarregando(botao, false, "Enviar link de recuperação");

        if (error) {
            console.error("Erro Supabase Auth (resetPassword):", error);
            mostrarMensagem(traduzirErro(error.message), "erro");
            return;
        }

        mostrarMensagem("Se o e-mail estiver cadastrado, um link de recuperação foi enviado.", "sucesso");
        document.getElementById("viewRecuperar").reset();
    });

    // ------------------------------------------------------------
    // NOVA SENHA (fluxo de recuperação — chega via link do e-mail)
    // ------------------------------------------------------------
    document.getElementById("viewNovaSenha").addEventListener("submit", async (ev) => {
        ev.preventDefault();
        limparMensagem();
        const novaSenha = document.getElementById("novaSenha").value;
        const novaSenhaConfirma = document.getElementById("novaSenhaConfirma").value;
        const botao = document.getElementById("btnNovaSenha");

        if (novaSenha.length < 8) {
            mostrarMensagem("A senha deve ter pelo menos 8 caracteres.", "erro");
            return;
        }
        if (novaSenha !== novaSenhaConfirma) {
            mostrarMensagem("As senhas não coincidem.", "erro");
            return;
        }

        definirCarregando(botao, true, "Salvar nova senha");
        const { error } = await supabase.auth.updateUser({ password: novaSenha });
        definirCarregando(botao, false, "Salvar nova senha");

        if (error) {
            console.error("Erro Supabase Auth (updateUser):", error);
            mostrarMensagem(traduzirErro(error.message), "erro");
            return;
        }

        mostrarMensagem("Senha alterada com sucesso! Redirecionando...", "sucesso");
        setTimeout(() => { window.location.href = "index.html"; }, 1500);
    });

    // ------------------------------------------------------------
    // Detecta se o usuário chegou por um link de recuperação de senha
    // e também redireciona quem já está logado direto pro dashboard.
    // ------------------------------------------------------------
    supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
            mostrarView("viewNovaSenha");
            mostrarMensagem("Defina sua nova senha abaixo.", "sucesso");
        }
    });

    (async function verificarSessaoExistente() {
        const hash = window.location.hash || "";
        if (hash.includes("type=recovery")) return;
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
            window.location.href = "index.html";
        }
    })();

})();
