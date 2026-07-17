// ============================================================
// login.js — Autenticação (login / cadastro / recuperação)
// Restrito a e-mails do domínio @nossanet.net.br
// ============================================================

(function () {
    "use strict";

    const DOMINIO_PERMITIDO = "nossanet.net.br";
    const REGEX_DOMINIO = new RegExp("@" + DOMINIO_PERMITIDO.replace(".", "\\.") + "$", "i");

    const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.content;
    const supabaseKey = document.querySelector('meta[name="supabase-key"]')?.content;
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const elMensagem = document.getElementById("authMessage");
    const abas = document.querySelectorAll(".auth-tab");
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
        abas.forEach(a => a.classList.toggle("auth-tab--active", a.dataset.view === idView));
        limparMensagem();
    }

    // Alterna abas/links internos
    document.querySelectorAll("[data-view]").forEach(el => {
        el.addEventListener("click", () => mostrarView(el.dataset.view));
    });

    function traduzirErro(msg) {
        const texto = String(msg || "").toLowerCase();
        if (texto.includes("invalid login credentials")) return "E-mail ou senha inválidos.";
        if (texto.includes("user already registered") || texto.includes("already registered")) return "Este e-mail já possui cadastro.";
        if (texto.includes("password should be at least")) return "A senha deve ter pelo menos 8 caracteres.";
        if (texto.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).";
        if (texto.includes("dominio") || texto.includes("domain")) return "Cadastro permitido apenas para e-mails @" + DOMINIO_PERMITIDO + ".";
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
            mostrarMensagem(traduzirErro(error.message), "erro");
            return;
        }

        window.location.href = "index.html";
    });

    // ------------------------------------------------------------
    // CADASTRO
    // ------------------------------------------------------------
    document.getElementById("viewCadastro").addEventListener("submit", async (ev) => {
        ev.preventDefault();
        limparMensagem();
        const email = document.getElementById("cadastroEmail").value.trim();
        const senha = document.getElementById("cadastroSenha").value;
        const senhaConfirma = document.getElementById("cadastroSenhaConfirma").value;
        const botao = document.getElementById("btnCadastro");

        if (!validarDominio(email)) {
            mostrarMensagem("Cadastro permitido apenas para e-mails @" + DOMINIO_PERMITIDO + ".", "erro");
            return;
        }
        if (senha.length < 8) {
            mostrarMensagem("A senha deve ter pelo menos 8 caracteres.", "erro");
            return;
        }
        if (senha !== senhaConfirma) {
            mostrarMensagem("As senhas não coincidem.", "erro");
            return;
        }

        definirCarregando(botao, true, "Criar conta");
        const { data, error } = await supabase.auth.signUp({
            email,
            password: senha,
            options: { emailRedirectTo: window.location.origin + window.location.pathname.replace("login.html", "") + "login.html" }
        });
        definirCarregando(botao, false, "Criar conta");

        if (error) {
            mostrarMensagem(traduzirErro(error.message), "erro");
            return;
        }

        if (data?.session) {
            // Confirmação de e-mail desativada no projeto: já entra direto
            window.location.href = "index.html";
            return;
        }

        mostrarMensagem("Cadastro criado! Verifique seu e-mail corporativo para confirmar a conta antes de entrar.", "sucesso");
        document.getElementById("viewCadastro").reset();
        setTimeout(() => mostrarView("viewLogin"), 2500);
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
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname
        });
        definirCarregando(botao, false, "Enviar link de recuperação");

        if (error) {
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
            document.querySelectorAll(".auth-tab").forEach(a => a.style.display = "none");
            mostrarView("viewNovaSenha");
            mostrarMensagem("Defina sua nova senha abaixo.", "sucesso");
        }
    });

    (async function verificarSessaoExistente() {
        const hash = window.location.hash || "";
        if (hash.includes("type=recovery")) return; // deixa o listener acima cuidar disso
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
            window.location.href = "index.html";
        }
    })();

})();
