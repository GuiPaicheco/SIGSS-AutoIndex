# Guia de Depuração e Diagnóstico — SIGSS-AutoIndex (v1.0.0)

Este guia descreve as técnicas para localizar erros, inspecionar logs e depurar a extensão **SIGSS-AutoIndex**.

---

## 🔍 Como Habilitar e Visualizar os Logs

Como a extensão é executada no contexto nativo da página (`world: "MAIN"`), todos os logs são gerenciados pela abstração `Logger` e emitidos diretamente no **DevTools Console** da aba do SIGSS quando a constante `DEBUG_MODE` está ativa (`true`).

### Ativação do Modo de Depuração:

No arquivo `src/constants.js`:
```javascript
const DEBUG_MODE = true;
```

### Passos para Acessar os Logs no Navegador:

1. Abra a página do SIGSS no Google Chrome.
2. Pressione `F12` ou `Ctrl + Shift + I` para abrir as **Ferramentas do Desenvolvedor** (DevTools).
3. Selecione a aba **Console**.
4. No campo de filtro do console, digite: `[SIGSS-AutoIndex]`.

---

## 📋 Prefixos de Log Padrão (`Logger`)

| Nível de Log | Exemplo no Console | Significado |
| :--- | :--- | :--- |
| **`Logger.info`** | `[SIGSS-AutoIndex][INFO] Pipeline de impressão iniciado` | Registro do fluxo de eventos principais. |
| **`Logger.debug`** | `[SIGSS-AutoIndex][DEBUG] Consultando microárea: 086 03` | Detalhes internos de execução da busca paralela. |
| **`Logger.warn`** | `[SIGSS-AutoIndex][WARN] Atributo ausente` | Avisos de divergência sem bloqueio de execução. |
| **`Logger.error`** | `[SIGSS-AutoIndex][ERROR] Exceção capturada` | Falhas graves com stacktrace e acionamento de fallback. |

---

## 🛠️ Resolução de Problemas Frequentes

### 1. O PDF original está abrindo sem a enumeração no topo
- **Causa Possível**: O paciente não está cadastrado em nenhuma microárea (`records == 0`), possui múltiplos imóveis (`records > 1`) ou ocorreu falha de rede na consulta imobiliária.
- **Como Verificar**: Observe no console se a mensagem gerada foi `"Não encontrado em imóvel"` ou `"Múltiplos imóveis encontrados"`.

### 2. O código do prontuário não foi localizado
- **Causa Possível**: O seletor HTML do input mudou ou o texto do PDF não contém a máscara esperada.
- **Solução**: Adicione o seletor HTML correspondente no array `SELETORES_INPUT_SIGSS` em `src/constants.js`.

### 3. A biblioteca `pdf-lib` não foi encontrada
- **Causa Possível**: O arquivo `lib/pdf-lib.min.js` não foi carregado corretamente antes dos scripts da extensão.
- **Solução**: Verifique a ordem do array `js` no `manifest.json`.
