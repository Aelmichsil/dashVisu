(function () {
    let dadosBrutos = [];
    let arquivoSelecionado = null;
    let importarAposSelecao = false;
    let paginaDetalheAtual = 1;
    let linhasDetalhePorPagina = 25;
    const PROSPECTO_STORAGE_KEY = "prospecto-registros-v1";
    const PROSPECTO_FILE_META_KEY = "prospecto-registros-meta-v1";
    const filtrosLocalizacao = {
        rua: "",
        cidade: "",
        endereco: "",
        bairro: "",
        status: ""
    };
    const charts = {};

    const PALETA = ["#06d6a0", "#3a86ff", "#8338ec", "#ffbe0b", "#ff006e", "#fb5607", "#00b4d8", "#80ed99"];

    function salvarProspectosNoStorage(nomeArquivo) {
        try {
            localStorage.setItem(PROSPECTO_STORAGE_KEY, JSON.stringify(dadosBrutos || []));
            localStorage.setItem(PROSPECTO_FILE_META_KEY, JSON.stringify({
                fileName: String(nomeArquivo || "").trim(),
                importedAt: new Date().toISOString(),
                total: Array.isArray(dadosBrutos) ? dadosBrutos.length : 0
            }));
        } catch (_) {}
    }

    function removerProspectosDoStorage() {
        try {
            localStorage.removeItem(PROSPECTO_STORAGE_KEY);
            localStorage.removeItem(PROSPECTO_FILE_META_KEY);
        } catch (_) {}
    }

    function restaurarProspectosDoStorage() {
        try {
            const raw = localStorage.getItem(PROSPECTO_STORAGE_KEY);
            if (!raw) return false;

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || !parsed.length) return false;

            dadosBrutos = parsed;
            const metaRaw = localStorage.getItem(PROSPECTO_FILE_META_KEY);
            const meta = metaRaw ? JSON.parse(metaRaw) : null;
            const fileName = String((meta && meta.fileName) || "").trim();
            if (fileName) {
                arquivoSelecionado = { name: fileName };
            }
            atualizarStatusArquivo(fileName ? [{ name: fileName }] : null);
            renderizarDashboard();
            return true;
        } catch (_) {
            return false;
        }
    }

    function inicializar() {
        const input = document.getElementById("prospectoInput");
        const btnImportar = document.getElementById("prospectoImportBtn");
        const btnLimpar = document.getElementById("prospectoLimparBtn");
        const tabProspecto = document.getElementById("tabProspecto");
        const filtroRua = document.getElementById("prospectoFiltroRua");
        const filtroCidade = document.getElementById("prospectoFiltroCidade");
        const filtroEndereco = document.getElementById("prospectoFiltroEndereco");
        const filtroBairro = document.getElementById("prospectoFiltroBairro");
        const filtroStatus = document.getElementById("prospectoFiltroStatus");
        const filtroStatusDetalhe = document.getElementById("prospectoDetalheStatusFiltro");
        const btnLimparFiltros = document.getElementById("prospectoLimparFiltros");
        const btnDetalheAnterior = document.getElementById("prospectoDetalheAnterior");
        const btnDetalheProxima = document.getElementById("prospectoDetalheProxima");
        const selectTamanhoPagina = document.getElementById("prospectoDetalheTamanhoPagina");

        function sincronizarFiltroStatus(valor) {
            const valorNormalizado = String(valor || "");
            filtrosLocalizacao.status = valorNormalizado;

            if (filtroStatus && String(filtroStatus.value || "") !== valorNormalizado) {
                filtroStatus.value = valorNormalizado;
            }
            if (filtroStatusDetalhe && String(filtroStatusDetalhe.value || "") !== valorNormalizado) {
                filtroStatusDetalhe.value = valorNormalizado;
            }
        }

        if (input) {
            input.addEventListener("change", function (event) {
                const files = event && event.target ? event.target.files : null;
                arquivoSelecionado = files && files.length ? files[0] : null;
                paginaDetalheAtual = 1;
                atualizarStatusArquivo(files);

                if (importarAposSelecao && arquivoSelecionado) {
                    importarAposSelecao = false;
                    processarArquivo();
                }
            });
        }

        if (btnImportar) {
            btnImportar.addEventListener("click", processarArquivo);
        }
        if (btnLimpar) {
            btnLimpar.addEventListener("click", limparDados);
        }

        if (tabProspecto) {
            tabProspecto.addEventListener("click", function () {
                window.requestAnimationFrame(function () {
                    renderizarDashboard();
                });
            });
        }

        if (filtroRua) {
            filtroRua.addEventListener("change", function () {
                filtrosLocalizacao.rua = String(filtroRua.value || "");
                paginaDetalheAtual = 1;
                renderizarDashboard();
            });
        }

        if (filtroCidade) {
            filtroCidade.addEventListener("change", function () {
                filtrosLocalizacao.cidade = String(filtroCidade.value || "");
                paginaDetalheAtual = 1;
                renderizarDashboard();
            });
        }

        if (filtroEndereco) {
            filtroEndereco.addEventListener("change", function () {
                filtrosLocalizacao.endereco = String(filtroEndereco.value || "");
                paginaDetalheAtual = 1;
                renderizarDashboard();
            });
        }

        if (filtroBairro) {
            filtroBairro.addEventListener("change", function () {
                filtrosLocalizacao.bairro = String(filtroBairro.value || "");
                paginaDetalheAtual = 1;
                renderizarDashboard();
            });
        }

        if (filtroStatus) {
            filtroStatus.addEventListener("change", function () {
                sincronizarFiltroStatus(filtroStatus.value);
                paginaDetalheAtual = 1;
                renderizarDashboard();
            });
        }

        if (filtroStatusDetalhe) {
            filtroStatusDetalhe.addEventListener("change", function () {
                sincronizarFiltroStatus(filtroStatusDetalhe.value);
                paginaDetalheAtual = 1;
                renderizarDashboard();
            });
        }

        if (btnLimparFiltros) {
            btnLimparFiltros.addEventListener("click", function () {
                filtrosLocalizacao.rua = "";
                filtrosLocalizacao.cidade = "";
                filtrosLocalizacao.endereco = "";
                filtrosLocalizacao.bairro = "";
                sincronizarFiltroStatus("");
                paginaDetalheAtual = 1;
                renderizarDashboard();
            });
        }

        if (btnDetalheAnterior) {
            btnDetalheAnterior.addEventListener("click", function () {
                if (paginaDetalheAtual > 1) {
                    paginaDetalheAtual -= 1;
                    renderizarDashboard();
                }
            });
        }

        if (btnDetalheProxima) {
            btnDetalheProxima.addEventListener("click", function () {
                paginaDetalheAtual += 1;
                renderizarDashboard();
            });
        }

        if (selectTamanhoPagina) {
            const valorInicial = Number.parseInt(selectTamanhoPagina.value, 10);
            if (!Number.isNaN(valorInicial) && valorInicial > 0) {
                linhasDetalhePorPagina = valorInicial;
            }

            selectTamanhoPagina.addEventListener("change", function () {
                const valor = Number.parseInt(selectTamanhoPagina.value, 10);
                if (!Number.isNaN(valor) && valor > 0) {
                    linhasDetalhePorPagina = valor;
                    paginaDetalheAtual = 1;
                    renderizarDashboard();
                }
            });
        }

        renderizarDashboard();
    }

    function painelProspectoVisivel() {
        const painel = document.getElementById("panelProspecto");
        return Boolean(painel && !painel.hidden && painel.style.display !== "none");
    }

    async function processarArquivo() {
        const input = document.getElementById("prospectoInput");
        const arquivoDoInput = input && input.files && input.files.length ? input.files[0] : null;
        const arquivo = arquivoSelecionado || arquivoDoInput;

        atualizarStatusArquivo(arquivo ? [arquivo] : null);

        if (!arquivo) {
            // Se nao houver arquivo, usa o proprio botao Importar como atalho para abrir o seletor.
            if (input && typeof input.click === "function") {
                importarAposSelecao = true;
                input.click();
            }
            window.alert("Selecione um arquivo CSV ou XLSX.");
            return;
        }

        const nomeArquivo = String(arquivo.name || "").toLowerCase();

        try {
            if (nomeArquivo.endsWith(".xlsx") || nomeArquivo.endsWith(".xls")) {
                dadosBrutos = await parsePlanilha(arquivo);
            } else {
                const texto = await arquivo.text();
                dadosBrutos = parseCsvTexto(texto);
            }
            salvarProspectosNoStorage(arquivo.name);
        } catch (erro) {
            console.error("Falha ao processar arquivo de prospectos:", erro);
            dadosBrutos = [];
            window.alert("Nao foi possivel ler o arquivo selecionado. Verifique o formato e tente novamente.");
            return;
        }

        renderizarDashboard();
    }

    function atualizarStatusArquivo(files) {
        const arquivo = files && files.length ? files[0] : null;
        const fileName = arquivo && arquivo.name ? arquivo.name : "Nenhum arquivo selecionado";
        const status = document.getElementById("prospectoFileStatus");
        if (status) {
            status.textContent = fileName;
        }
    }

    function parseCsvTexto(texto) {
        const linhas = String(texto || "").split(/\r?\n/).filter(function (linha) {
            return String(linha || "").trim().length > 0;
        });

        if (!linhas.length) {
            return [];
        }

        const separador = detectarSeparador(linhas[0]);
        const cabecalho = parseCsvLine(linhas[0], separador).map(normalizarCabecalho);

        return linhas
            .slice(1)
            .map(function (linha) {
                return parseCsvLine(linha, separador);
            })
            .filter(function (colunas) {
                return colunas.length > 0;
            })
            .map(function (colunas) {
                const obj = {};
                cabecalho.forEach(function (label, i) {
                    obj[label] = (colunas[i] || "").trim();
                });
                return obj;
            });
    }

    async function parsePlanilha(arquivo) {
        if (typeof XLSX === "undefined") {
            window.alert("Biblioteca XLSX nao encontrada para ler planilhas.");
            return [];
        }

        const buffer = await arquivo.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const primeiraAba = workbook && workbook.SheetNames && workbook.SheetNames.length ? workbook.SheetNames[0] : "";
        if (!primeiraAba) {
            return [];
        }

        const sheet = workbook.Sheets[primeiraAba];
        const linhas = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: ""
        });

        if (!linhas || !linhas.length) {
            return [];
        }

        const cabecalho = (linhas[0] || []).map(normalizarCabecalho);
        return linhas
            .slice(1)
            .filter(function (colunas) {
                return Array.isArray(colunas) && colunas.some(function (valor) {
                    return String(valor || "").trim() !== "";
                });
            })
            .map(function (colunas) {
                const obj = {};
                cabecalho.forEach(function (label, i) {
                    obj[label] = String(colunas[i] || "").trim();
                });
                return obj;
            });
    }

    function detectarSeparador(linhaCabecalho) {
        const linha = String(linhaCabecalho || "");
        const qtdVirgula = (linha.match(/,/g) || []).length;
        const qtdPontoVirgula = (linha.match(/;/g) || []).length;
        return qtdPontoVirgula > qtdVirgula ? ";" : ",";
    }

    function parseCsvLine(line, delimiter) {
        const values = [];
        let atual = "";
        let emAspas = false;

        for (let i = 0; i < line.length; i += 1) {
            const ch = line[i];
            if (ch === '"') {
                if (emAspas && line[i + 1] === '"') {
                    atual += '"';
                    i += 1;
                } else {
                    emAspas = !emAspas;
                }
            } else if (ch === delimiter && !emAspas) {
                values.push(atual);
                atual = "";
            } else {
                atual += ch;
            }
        }

        values.push(atual);
        return values;
    }

    function normalizarCabecalho(valor) {
        return String(valor || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
    }

    function obterCampo(item, candidatos) {
        for (let i = 0; i < candidatos.length; i += 1) {
            const chave = candidatos[i];
            if (item[chave] !== undefined && item[chave] !== null) {
                const valorLimpo = limparValorCampo(item[chave]);
                if (valorLimpo !== "") {
                    return valorLimpo;
                }
            }
        }
        return "";
    }

    function normalizarTexto(valor) {
        return String(valor || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function ehValorPlaceholder(valor) {
        const texto = normalizarTexto(valor).replace(/\s+/g, " ");
        return (
            texto === "" ||
            texto === "-" ||
            texto === "--" ||
            texto === "—" ||
            texto === "n/a" ||
            texto === "na" ||
            texto === "null" ||
            texto === "undefined"
        );
    }

    function limparValorCampo(valor) {
        if (ehValorPlaceholder(valor)) {
            return "";
        }
        return String(valor || "").trim();
    }

    function ehLinhaValidaParaTotal(item) {
        if (!item || typeof item !== "object") {
            return false;
        }

        const chaves = Object.keys(item);
        const camposValidos = chaves.reduce(function (acc, chave) {
            const valorLimpo = limparValorCampo(item[chave]);
            return acc + (valorLimpo !== "" ? 1 : 0);
        }, 0);

        return camposValidos > 0;
    }

    function obterCampoPorTrechos(item, trechos) {
        const chaves = Object.keys(item || {});
        for (let i = 0; i < chaves.length; i += 1) {
            const chave = chaves[i];
            const chaveNormalizada = normalizarTexto(chave).replace(/_/g, " ");
            const combina = trechos.some(function (trecho) {
                return chaveNormalizada.includes(trecho);
            });

            if (!combina) {
                continue;
            }

            const valor = item[chave];
            if (valor !== undefined && valor !== null) {
                const valorLimpo = limparValorCampo(valor);
                if (valorLimpo !== "") {
                    return valorLimpo;
                }
            }
        }
        return "";
    }

    function obterStatusBruto(item) {
        return obterCampo(item, [
            "status",
            "situacao",
            "situacao_prospecto",
            "status_prospecto",
            "status_do_prospecto",
            "situacao_do_prospecto",
            "status_funil",
            "situacao_funil",
            "status_lead",
            "situacao_lead",
            "resultado",
            "resultado_final",
            "fase",
            "etapa",
            "etapa_atual"
        ]) || obterCampoPorTrechos(item, ["status", "situacao", "resultado", "etapa", "fase", "funil", "lead"]);
    }

    function obterOrigemBruta(item) {
        return obterCampo(item, [
            "origem_contato",
            "origem",
            "canal",
            "fonte",
            "canal_origem",
            "captacao"
        ]) || obterCampoPorTrechos(item, ["origem", "canal", "fonte", "captacao"]);
    }

    function obterVendedorBruto(item) {
        return obterCampo(item, [
            "vendedor",
            "nome_vendedor",
            "vendedor_nome",
            "consultor",
            "nome_consultor",
            "agente",
            "atendente",
            "representante",
            "executivo",
            "corretor",
            "responsavel",
            "responsavel_venda",
            "vendedor_responsavel"
        ]) || obterCampoPorTrechos(item, ["vendedor", "consultor", "agente", "responsavel", "atendente", "representante", "executivo", "corretor"]);
    }

    function obterPlanoBruto(item) {
        return obterCampo(item, [
            "servico",
            "plano",
            "nome_plano",
            "descricao_plano",
            "produto",
            "plano_servico",
            "servico_contratado"
        ]) || obterCampoPorTrechos(item, ["servico", "plano", "produto"]);
    }

    function obterCidadeBruta(item) {
        return obterCampo(item, [
            "cidade",
            "municipio",
            "cidade_cliente",
            "nome_cidade"
        ]) || obterCampoPorTrechos(item, ["cidade", "municipio"]);
    }

    function obterBairroBruto(item) {
        return obterCampo(item, [
            "bairro",
            "bairro_cliente",
            "nome_bairro"
        ]) || obterCampoPorTrechos(item, ["bairro"]);
    }

    function obterEnderecoBruto(item) {
        return obterCampo(item, [
            "endereco",
            "endereco_cliente",
            "logradouro",
            "rua"
        ]) || obterCampoPorTrechos(item, ["endereco", "logradouro", "rua"]);
    }

    function obterNomeClienteBruto(item) {
        return obterCampo(item, [
            "prospecto",
            "nome_cliente",
            "cliente",
            "nome",
            "razao_social",
            "nome_razaosocial"
        ]) || obterCampoPorTrechos(item, ["prospecto", "cliente", "nome", "razao social"]);
    }

    function extrairRua(enderecoBruto) {
        const endereco = limparValorCampo(enderecoBruto);
        if (!endereco) {
            return "";
        }

        const semNumero = endereco
            .replace(/\b(n(?:\.|\u00ba)?\s*\d+[a-zA-Z-]*)\b/gi, "")
            .trim();
        const partePrincipal = semNumero.split(",")[0] || semNumero;
        return limparValorCampo(partePrincipal);
    }

    function normalizarNomePessoa(nome) {
        const valor = limparValorCampo(nome);
        if (!valor) {
            return "";
        }

        // Remove caracteres de controle/invisiveis que podem vir de planilhas.
        const semInvisiveis = valor
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .replace(/\s+/g, " ")
            .trim();

        if (!semInvisiveis) {
            return "";
        }

        return semInvisiveis
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean)
            .map(function (parte) {
                return parte.charAt(0).toUpperCase() + parte.slice(1);
            })
            .join(" ");
    }

    function classificarStatus(item) {
        const bruto = obterStatusBruto(item);
        const status = normalizarTexto(bruto);

        if (!status) {
            return "nao_informado";
        }

        // Prioriza perdidos antes de convertidos para evitar falso positivo em "nao convertido".
        if (
            status.includes("nao convertido") ||
            status.includes("não convertido") ||
            status.includes("perdid") ||
            status.includes("cancel") ||
            status.includes("descart") ||
            status.includes("reprov") ||
            status.includes("sem interesse") ||
            status.includes("desist")
        ) {
            return "perdido";
        }

        if (
            status.includes("convert") ||
            status.includes("ganho") ||
            status.includes("fechado") ||
            status.includes("venda") ||
            status.includes("concluid") ||
            status.includes("finaliz") ||
            status.includes("ativad") ||
            status.includes("assinad") ||
            status.includes("aprovad") ||
            status.includes("cliente")
        ) {
            return "convertido";
        }

        if (
            status.includes("aguard") ||
            status.includes("andamento") ||
            status.includes("aberto") ||
            status.includes("pendente") ||
            status.includes("analise") ||
            status.includes("analise") ||
            status.includes("novo") ||
            status.includes("contato") ||
            status.includes("prospect") ||
            status.includes("lead")
        ) {
            return "aguardando";
        }

        return "outros";
    }

    function renderizarDashboard() {
        const dadosValidos = dadosBrutos.filter(ehLinhaValidaParaTotal);
        popularSeletoresLocalizacao(dadosValidos);
        const dadosFiltrados = aplicarFiltrosLocalizacao(dadosValidos);
        atualizarStatusResumoImportacao(dadosBrutos.length, dadosValidos.length, dadosFiltrados.length);
        renderizarTabelaDetalhada(dadosFiltrados);

        const total = dadosFiltrados.length;
        const convertidos = dadosFiltrados.filter(function (dado) {
            return classificarStatus(dado) === "convertido";
        }).length;
        const aguardando = dadosFiltrados.filter(function (dado) {
            return classificarStatus(dado) === "aguardando";
        }).length;
        const perdidos = dadosFiltrados.filter(function (dado) {
            return classificarStatus(dado) === "perdido";
        }).length;
        const taxa = total > 0 ? ((convertidos / total) * 100).toFixed(1) : "0.0";

        atualizarTexto("kpiTotalProspectos", String(total));
        atualizarTexto("kpiConversoes", String(convertidos));
        atualizarTexto("kpiAguardando", String(aguardando));
        atualizarTexto("kpiPerdidos", String(perdidos));
        atualizarTexto("kpiTaxaConversao", taxa + "%");

        // Evita instabilidade de dimensao quando o painel ainda esta oculto.
        if (!painelProspectoVisivel()) {
            return;
        }

        const statusMap = agruparPorExtrator(dadosFiltrados, function (item) {
            return obterStatusBruto(item);
        });
        gerarGrafico("chartStatusProspecto", "pie", statusMap);

        const origemMap = agruparPorExtrator(dadosFiltrados, function (item) {
            return obterOrigemBruta(item);
        });
        gerarGrafico("chartOrigemContato", "doughnut", origemMap);

        const apenasConvertidos = dadosFiltrados.filter(function (dado) {
            return classificarStatus(dado) === "convertido";
        });
        const vendedores = agruparPorExtrator(apenasConvertidos, function (item) {
            return normalizarNomePessoa(obterVendedorBruto(item));
        });
        gerarGrafico("chartVendasVendedor", "bar", vendedores, true);

        const totalPorPlano = agruparPorExtrator(dadosFiltrados, function (item) {
            return obterPlanoBruto(item);
        });
        gerarGrafico("chartTotalPlano", "bar", totalPorPlano, true);

        const planosPorCidade = dadosFiltrados.reduce(function (acc, item) {
            const cidade = obterCidadeBruta(item);
            const plano = obterPlanoBruto(item);

            if (!cidade || !plano) {
                return acc;
            }

            acc[cidade] = (acc[cidade] || 0) + 1;
            return acc;
        }, {});
        gerarGrafico("chartPlanosVendedor", "bar", planosPorCidade, true);
    }

    function rotuloStatus(statusClassificado) {
        if (statusClassificado === "convertido") {
            return "Convertido";
        }
        if (statusClassificado === "aguardando") {
            return "Aguardando";
        }
        if (statusClassificado === "perdido") {
            return "Perdido";
        }
        if (statusClassificado === "nao_informado") {
            return "Nao informado";
        }
        return "Outros";
    }

    function escapeHtml(texto) {
        return String(texto || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;");
    }

    function montarLinhasDetalhadas(dados) {
        const agrupado = {};

        (dados || []).forEach(function (item) {
            const cliente = normalizarNomePessoa(obterNomeClienteBruto(item)) || "Nao informado";
            const cidade = obterCidadeBruta(item) || "Nao informado";
            const endereco = obterEnderecoBruto(item) || "Nao informado";
            const bairro = obterBairroBruto(item) || "Nao informado";
            const vendedor = normalizarNomePessoa(obterVendedorBruto(item)) || "Nao informado";
            const servico = obterPlanoBruto(item) || "Nao informado";
            const status = rotuloStatus(classificarStatus(item));

            const chave = [cliente, cidade, endereco, bairro, vendedor, servico, status].join("||");

            if (!agrupado[chave]) {
                agrupado[chave] = {
                    cliente: cliente,
                    cidade: cidade,
                    endereco: endereco,
                    bairro: bairro,
                    vendedor: vendedor,
                    servico: servico,
                    status: status,
                    quantidade: 0
                };
            }

            agrupado[chave].quantidade += 1;
        });

        return Object.keys(agrupado)
            .map(function (chave) {
                return agrupado[chave];
            })
            .sort(function (a, b) {
                if (b.quantidade !== a.quantidade) {
                    return b.quantidade - a.quantidade;
                }
                return a.vendedor.localeCompare(b.vendedor, "pt-BR");
            });
    }

    function renderizarTabelaDetalhada(dadosFiltrados) {
        const corpo = document.getElementById("prospectoDetalheBody");
        const status = document.getElementById("prospectoDetalheStatus");
        const paginacao = document.getElementById("prospectoDetalhePaginacao");
        const btnAnterior = document.getElementById("prospectoDetalheAnterior");
        const btnProxima = document.getElementById("prospectoDetalheProxima");
        const selectTamanhoPagina = document.getElementById("prospectoDetalheTamanhoPagina");
        if (!corpo) {
            return;
        }

        if (selectTamanhoPagina) {
            selectTamanhoPagina.value = String(linhasDetalhePorPagina);
        }

        const linhas = montarLinhasDetalhadas(dadosFiltrados);
        const totalPaginas = Math.max(1, Math.ceil(linhas.length / linhasDetalhePorPagina));
        if (paginaDetalheAtual > totalPaginas) {
            paginaDetalheAtual = totalPaginas;
        }

        const inicio = (paginaDetalheAtual - 1) * linhasDetalhePorPagina;
        const fim = inicio + linhasDetalhePorPagina;
        const linhasPagina = linhas.slice(inicio, fim);

        if (!linhas.length) {
            corpo.innerHTML = "<tr><td colspan=\"8\">Nenhum dado para os filtros selecionados.</td></tr>";
            if (status) {
                status.textContent = "0 combinacoes encontradas.";
            }
            if (paginacao) {
                paginacao.textContent = "Pagina 0 de 0";
            }
            if (btnAnterior) {
                btnAnterior.disabled = true;
            }
            if (btnProxima) {
                btnProxima.disabled = true;
            }
            return;
        }

        corpo.innerHTML = linhasPagina.map(function (linha) {
            return "<tr>" +
                "<td>" + escapeHtml(linha.cliente) + "</td>" +
                "<td>" + escapeHtml(linha.cidade) + "</td>" +
                "<td>" + escapeHtml(linha.endereco) + "</td>" +
                "<td>" + escapeHtml(linha.bairro) + "</td>" +
                "<td>" + escapeHtml(linha.vendedor) + "</td>" +
                "<td>" + escapeHtml(linha.servico) + "</td>" +
                "<td>" + escapeHtml(linha.status) + "</td>" +
                "<td>" + String(linha.quantidade) + "</td>" +
                "</tr>";
        }).join("");

        if (status) {
            status.textContent = String(linhas.length) + " combinacoes encontradas.";
        }

        if (paginacao) {
            paginacao.textContent = "Pagina " + String(paginaDetalheAtual) + " de " + String(totalPaginas);
        }
        if (btnAnterior) {
            btnAnterior.disabled = paginaDetalheAtual <= 1;
        }
        if (btnProxima) {
            btnProxima.disabled = paginaDetalheAtual >= totalPaginas;
        }
    }

    function atualizarStatusResumoImportacao(totalLidas, totalValidas, totalFiltradas) {
        const status = document.getElementById("prospectoFileStatus");
        if (!status) {
            return;
        }

        if (!arquivoSelecionado) {
            status.textContent = "Nenhum arquivo selecionado";
            return;
        }

        const nomeArquivo = arquivoSelecionado && arquivoSelecionado.name ? arquivoSelecionado.name : "Arquivo selecionado";
        let texto = nomeArquivo + " (" + String(totalLidas) + " linhas lidas; " + String(totalValidas) + " linhas validas para KPI";

        if (filtrosLocalizacaoAtivos()) {
            texto += "; " + String(totalFiltradas) + " apos filtros";
        }

        texto += ")";
        status.textContent = texto;
    }

    function filtrosLocalizacaoAtivos() {
        return Boolean(
            filtrosLocalizacao.rua ||
            filtrosLocalizacao.cidade ||
            filtrosLocalizacao.endereco ||
            filtrosLocalizacao.bairro ||
            filtrosLocalizacao.status
        );
    }

    function aplicarFiltrosLocalizacao(dados) {
        return (dados || []).filter(function (item) {
            const rua = extrairRua(obterEnderecoBruto(item));
            const cidade = obterCidadeBruta(item);
            const endereco = obterEnderecoBruto(item);
            const bairro = obterBairroBruto(item);
            const status = rotuloStatus(classificarStatus(item));

            if (filtrosLocalizacao.rua && rua !== filtrosLocalizacao.rua) {
                return false;
            }
            if (filtrosLocalizacao.cidade && cidade !== filtrosLocalizacao.cidade) {
                return false;
            }
            if (filtrosLocalizacao.endereco && endereco !== filtrosLocalizacao.endereco) {
                return false;
            }
            if (filtrosLocalizacao.bairro && bairro !== filtrosLocalizacao.bairro) {
                return false;
            }
            if (filtrosLocalizacao.status && status !== filtrosLocalizacao.status) {
                return false;
            }

            return true;
        });
    }

    function popularSeletoresLocalizacao(dados) {
        const ruas = coletarUnicosOrdenados(dados, function (item) {
            return extrairRua(obterEnderecoBruto(item));
        });
        const cidades = coletarUnicosOrdenados(dados, function (item) {
            return obterCidadeBruta(item);
        });
        const enderecos = coletarUnicosOrdenados(dados, function (item) {
            return obterEnderecoBruto(item);
        });
        const bairros = coletarUnicosOrdenados(dados, function (item) {
            return obterBairroBruto(item);
        });
        const status = coletarUnicosOrdenados(dados, function (item) {
            return rotuloStatus(classificarStatus(item));
        });

        if (filtrosLocalizacao.rua && ruas.indexOf(filtrosLocalizacao.rua) === -1) {
            filtrosLocalizacao.rua = "";
        }
        if (filtrosLocalizacao.cidade && cidades.indexOf(filtrosLocalizacao.cidade) === -1) {
            filtrosLocalizacao.cidade = "";
        }
        if (filtrosLocalizacao.endereco && enderecos.indexOf(filtrosLocalizacao.endereco) === -1) {
            filtrosLocalizacao.endereco = "";
        }
        if (filtrosLocalizacao.bairro && bairros.indexOf(filtrosLocalizacao.bairro) === -1) {
            filtrosLocalizacao.bairro = "";
        }
        if (filtrosLocalizacao.status && status.indexOf(filtrosLocalizacao.status) === -1) {
            filtrosLocalizacao.status = "";
        }

        preencherSelectLocalizacao("prospectoFiltroRua", "Todas as ruas", ruas, filtrosLocalizacao.rua);
        preencherSelectLocalizacao("prospectoFiltroCidade", "Todas as cidades", cidades, filtrosLocalizacao.cidade);
        preencherSelectLocalizacao("prospectoFiltroEndereco", "Todos os enderecos", enderecos, filtrosLocalizacao.endereco);
        preencherSelectLocalizacao("prospectoFiltroBairro", "Todos os bairros", bairros, filtrosLocalizacao.bairro);
        preencherSelectLocalizacao("prospectoFiltroStatus", "Todos os status", status, filtrosLocalizacao.status);
        preencherSelectLocalizacao("prospectoDetalheStatusFiltro", "Todos os status", status, filtrosLocalizacao.status);
    }

    function coletarUnicosOrdenados(dados, extrator) {
        const mapa = {};

        (dados || []).forEach(function (item) {
            const valor = limparValorCampo(extrator ? extrator(item) : "");
            if (!valor) {
                return;
            }
            mapa[valor] = true;
        });

        return Object.keys(mapa).sort(function (a, b) {
            return a.localeCompare(b, "pt-BR");
        });
    }

    function preencherSelectLocalizacao(id, labelPadrao, valores, valorSelecionado) {
        const select = document.getElementById(id);
        if (!select) {
            return;
        }

        const valorAtual = String(valorSelecionado || "");
        const opcoes = [
            "<option value=\"\">" + labelPadrao + "</option>"
        ].concat((valores || []).map(function (valor) {
            const escape = String(valor)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;");
            return "<option value=\"" + escape + "\">" + escape + "</option>";
        }));

        select.innerHTML = opcoes.join("");
        select.value = valorAtual;
    }

    function atualizarTexto(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    function agruparPor(dados, colunas) {
        const mapa = dados.reduce(function (acc, curr) {
            const chave = limparValorCampo(obterCampo(curr, colunas));
            if (!chave) {
                return acc;
            }
            acc[chave] = (acc[chave] || 0) + 1;
            return acc;
        }, {});

        return mapa;
    }

    function agruparPorExtrator(dados, extrator) {
        const mapa = dados.reduce(function (acc, curr) {
            const valorBruto = extrator ? extrator(curr) : "";
            const chave = limparValorCampo(valorBruto);
            if (!chave) {
                return acc;
            }
            acc[chave] = (acc[chave] || 0) + 1;
            return acc;
        }, {});

        return mapa;
    }

    function gerarGrafico(id, tipo, mapa, horizontal) {
        const canvas = document.getElementById(id);
        if (!canvas || typeof Chart === "undefined") {
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        if (charts[id]) {
            charts[id].destroy();
        }

        const labels = Object.keys(mapa);
        const valores = Object.values(mapa);
        const exibirEscalas = horizontal || tipo === "bar";
        const scalesConfig = exibirEscalas ? {
            x: {
                ticks: { color: "#cbd5e1" },
                grid: { color: "rgba(148, 163, 184, 0.16)" }
            },
            y: {
                ticks: { color: "#cbd5e1" },
                grid: { color: "rgba(148, 163, 184, 0.10)" }
            }
        } : undefined;

        const config = {
            type: tipo,
            data: {
                labels: labels,
                datasets: [
                    {
                        data: valores,
                        backgroundColor: labels.map(function (_, idx) {
                            return PALETA[idx % PALETA.length];
                        }),
                        borderColor: "rgba(255,255,255,0.28)",
                        borderWidth: 1
                    }
                ]
            },
            options: {
                indexAxis: horizontal ? "y" : "x",
                responsive: true,
                maintainAspectRatio: !horizontal,
                aspectRatio: horizontal ? 2.1 : 1.8,
                animation: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#e2e8f0",
                            boxWidth: 16,
                            boxHeight: 16,
                            font: {
                                size: 12,
                                weight: "600"
                            }
                        }
                    }
                },
                scales: scalesConfig
            }
        };

        if (horizontal && config.options && config.options.scales && config.options.scales.y && config.options.scales.y.ticks) {
            config.options.scales.y.ticks.autoSkip = false;
        }

        charts[id] = new Chart(ctx, config);
    }

    function limparDados() {
        dadosBrutos = [];
        arquivoSelecionado = null;
        importarAposSelecao = false;
        removerProspectosDoStorage();
        paginaDetalheAtual = 1;
        filtrosLocalizacao.rua = "";
        filtrosLocalizacao.cidade = "";
        filtrosLocalizacao.endereco = "";
        filtrosLocalizacao.bairro = "";
        filtrosLocalizacao.status = "";
        Object.keys(charts).forEach(function (id) {
            if (charts[id]) {
                charts[id].destroy();
            }
            delete charts[id];
        });

        const input = document.getElementById("prospectoInput");
        if (input) {
            input.value = "";
        }

        atualizarTexto("prospectoFileStatus", "Nenhum arquivo selecionado");
        restaurarProspectosDoStorage();
        renderizarDashboard();
    }

    document.addEventListener("DOMContentLoaded", inicializar);
})();
