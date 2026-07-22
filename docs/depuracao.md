# Guia de Depuração e Diagnóstico - SIGSS-AutoIndex

Este guia descreve as técnicas para localizar erros, inspecionar logs e depurar a extensão **SIGSS-AutoIndex**.

---

## 🔍 Como Visualizar os Logs de Execução

Como a extensão é executada no contexto da página principal (`world: "MAIN"`), todos os logs são emitidos diretamente no **DevTools Console** da aba do SIGSS.

### Passos para Acessar os Logs:

1. Abra a página do SIGSS no Google Chrome.
2. Pressione `F12` ou `Ctrl + Shift + I` para abrir o **Ferramentas do Desenvolvedor** (DevTools).
3. Selecione a aba **Console**.
4. No campo de filtro do console, digite: `[SIGSS-AutoIndex]` ou `[SIGSS+]`.

---

## 📋 Prefixos de Log Padrão

| Prefixo | Significado | Exemplo |
| :--- | :--- | :--- |
| `[SIGSS-AutoIndex] Iniciando...` | Início do pipeline de impressão. | `[SIGSS-AutoIndex] Iniciando Pipeline de Impressão Inteligente...` |
| `[SIGSS-AutoIndex] Código SIGSS:` | Valor do código obtido (Input ou PDF). | `[SIGSS-AutoIndex] Código SIGSS: 82828-1` |
| `[SIGSS-AutoIndex] Enumeração gerada:` | String de enumeração calculada. | `[SIGSS-AutoIndex] Enumeração gerada: 086_03_018_03` |
| `[SIGSS-AutoIndex] Falha no pipeline...` | Ocorreu um erro e o fallback foi ativado. | `[SIGSS-AutoIndex] Falha no pipeline. Ativando fallback para PDF original: TypeError...` |

---

## 🛠️ Resolução de Problemas Frequentes

### 1. O PDF original está abrindo sem a enumeração no topo
- **Causa Possível**: O paciente não está cadastrado em nenhuma microárea (`records == 0`), possui múltiplos imóveis (`records > 1`) ou ocorreu falha de rede na consulta imobiliária.
- **Como Verificar**: Observe no console se a mensagem gerada é `"Não encontrado em imóvel"` ou `"Múltiplos imóveis encontrados"`.

### 2. O código do prontuário não foi localizado
- **Causa Possível**: O seletor HTML do input mudou ou o texto do PDF não contém a máscara esperada.
- **Solução**: Adicione o seletor HTML correspondente no array `SELETORES_INPUT_SIGSS` em `src/constants.js`.

### 3. A biblioteca `pdf-lib` não foi encontrada
- **Causa Possível**: O arquivo `lib/pdf-lib.min.js` não foi carregado corretamente antes dos scripts da extensão.
- **Solução**: Verifique a ordem do array `js` no `manifest.json`.
