# 📊 Guia de Exportação - Dashboard de Atendimentos

## 🎯 Visão Geral

O dashboard agora possui dois botões de exportação no header para gerar relatórios em **PDF** e **PowerPoint (PPTX)**, organizados por seções temáticas.

---

## 📥 Botões de Exportação

### 1. **Botão "⬇ PDF"**
- Exporta o dashboard em formato **PDF** (Portable Document Format)
- Ideal para: distribuição, impressão, arquivamento
- Organização: gráficos dispostos sequencialmente em páginas

### 2. **Botão "⬇ PPTX"**
- Exporta o dashboard em formato **PowerPoint** (PPTX)
- Ideal para: apresentações, slides editáveis, reuniões
- Organização: um gráfico por slide, fácil de editar

---

## 📋 Seções Incluídas na Exportação

Ambas as exportações incluem **12 seções** com gráficos principais:

1. ✅ **Curva de Atendimentos por Mês** - Tendência temporal
2. ✅ **Top Atendentes** - Ranking dos 4 principais
3. ✅ **Resolvidos: Internos vs Externos** - Distribuição por tipo
4. ✅ **Distribuição SLA** - Status de cumprimento
5. ✅ **SLA por Tipo de Atendimento** - SLA por categoria
6. ✅ **Motivos de Fechamento** - Análise de razões
7. ✅ **Tipos de Atendimento** - Distribuição por tipo
8. ✅ **Plano de Serviço** - Quantidade por plano
9. ✅ **Atendimentos por Cidade** - Análise geográfica
10. ✅ **Atendimentos por Bairro** - Detalhamento por bairro
11. ✅ **Recorrentes** - Casos repetentes
12. ✅ **Status de Atendimentos** - Estado geral dos atendimentos

---

## 🚀 Como Usar

### Para Exportar para PDF:
1. Clique no botão **"⬇ PDF"** no header do dashboard
2. Aguarde a mensagem de sucesso: `✅ PDF exportado com sucesso`
3. O arquivo será baixado com o nome: `Dashboard_Atendimentos_YYYY-MM-DD.pdf`

### Para Exportar para PPTX:
1. Clique no botão **"⬇ PPTX"** no header do dashboard
2. Aguarde a mensagem de sucesso: `✅ PPTX exportado com sucesso`
3. O arquivo será baixado com o nome: `Dashboard_Atendimentos_YYYY-MM-DD.pptx`
4. Abra no PowerPoint e customize conforme necessário

---

## ⚙️ Detalhes Técnicos

### Bibliotecas Utilizadas:
- **html2canvas**: Captura de elementos DOM para imagem
- **jsPDF**: Geração de arquivos PDF
- **PptxGenJS**: Geração de apresentações PowerPoint

### Características:
- ✨ Alta resolução das imagens capturadas (2x escala)
- 📱 Responsivo - funciona em diferentes tamanhos de tela
- 🎨 Mantém cores originais dos gráficos
- 📅 Data de geração incluída automaticamente
- 🔄 Status em tempo real durante a exportação

---

## ⚠️ Notas Importantes

1. **Recursos Necessários**: Os gráficos devem estar renderizados no dashboard antes da exportação
2. **Tempo de Processamento**: Exportações podem levar alguns segundos dependendo da quantidade de gráficos
3. **Navegador**: Certifique-se de ter JavaScript habilitado e as bibliotecas CDN acessíveis
4. **Dados Vagos**: Se nenhum dado foi importado, os gráficos podem estar vazios (isso é normal)

---

## 🛠️ Solução de Problemas

### PDF não é gerado
- Verifique se a página carregou completamente
- Atualize a página e tente novamente
- Verifique o console do navegador (F12 → Console) para erros

### PPTX não é gerado
- Certifique-se de ter a biblioteca PptxGenJS carregada
- Tente novamente ou atualize o navegador
- Verifique se tem espaço disponível no disco

### Arquivo gerado, mas vazio
- Certifique-se de que os dados foram importados
- Aguarde o carregamento completo dos gráficos antes de exportar

---

## 📞 Suporte

Para mais informações ou relatórios de problemas, entre em contato com o suporte técnico.

---

**Última atualização**: 2026-04-10
