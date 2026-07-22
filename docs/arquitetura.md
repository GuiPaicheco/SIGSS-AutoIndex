# Arquitetura do Sistema - SIGSS-AutoIndex (v0.4.2)

O **SIGSS-AutoIndex** adota uma arquitetura modular em **JavaScript Moderno (ES2022+)** construída sob as especificações do **Chrome Extension Manifest V3**.

---

## 🚀 Mecanismo de Inicialização e Bootstrap (`world: "MAIN"`)

No Manifest V3 do Google Chrome, os `content_scripts` declarados no `manifest.json` executam como scripts clássicos do navegador (sem suporte nativo a declarações de `import / export` de módulos ES6 em alto nível).

Para resolver essa limitação e garantir a execução modular no mundo de execução principal (`world: "MAIN"`):

```
Chrome (manifest.json)
       │ (document_start em MAIN world)
       ▼
src/interceptor.js  (Script Clássico - Instala hooks de window.open, XHR e fetch)
       │
       ▼ (Cria e injeta <script type="module" src="chrome-extension://.../src/main.js">)
DOM da Página (head / documentElement)
       │
       ▼ (Resolução recursiva nativa dos imports ES6 pelo Chrome)
src/main.js ──► src/pipeline.js ──► src/utils.js / src/imovel.js / src/formatter.js / src/pdf.js
```

---

## 🏛️ Visão Geral da Arquitetura

O sistema utiliza o padrão de **Pipeline Desacoplado**, em que cada módulo possui responsabilidade única:

```
                  ┌──────────────────────┐
                  │    interceptor.js    │ (Hook na impressão e Bootstrap)
                  └──────────┬───────────┘
                             │ (Injeta <script type="module">)
                             ▼
                  ┌──────────────────────┐
                  │       main.js        │ (Registra Handler & window.executarFluxoImpressao)
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │     pipeline.js      │ (Orquestrador Único)
                  └──────────┬───────────┘
                             │
       ┌─────────────────────┼─────────────────────┬─────────────────────┐
       ▼                     ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   utils.js   │     │  imovel.js   │     │ formatter.js │     │    pdf.js    │
│(Código SIGSS)│     │  (Integração)│     │(Formatação)  │     │(Edição PDF)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 📦 Responsabilidade dos Módulos

| Módulo | Arquivo | Responsabilidade Única |
| :--- | :--- | :--- |
| **Interceptor & Bootstrap** | `src/interceptor.js` | Sobrescrever `window.open`, `XMLHttpRequest`, `fetch` e injetar dinamicamente `src/main.js` como módulo ES6. |
| **Ponto de Entrada** | `src/main.js` | Registrar o pipeline em `window.__SIGSS_PLUS_REGISTRAR_HANDLER__` e expor `window.executarFluxoImpressao`. |
| **Pipeline** | `src/pipeline.js` | Orquestrar o sequenciamento do processamento e garantir o fallback imediato para o PDF original em caso de falha. |
| **Utilitários** | `src/utils.js` | Extrair o Código SIGSS com prioridade estrita (Input da tela → Documento PDF). |
| **Integração Imobiliária** | `src/imovel.js` | Executar a cadeia HTTP (`lista` → `visualizar` → `getIsad`) para obter os identificadores do domicílio. |
| **Formatador** | `src/formatter.js` | Converter os dados cadastrais do imóvel na string oficial de enumeração (ex: `086_03_018_03`). |
| **Manipulador PDF** | `src/pdf.js` | Baixar o PDF original, carimbar a linha no topo centralizado via `pdf-lib` em memória e abrir a janela. |
| **Logger** | `src/logger.js` | Controlar centralizadamente os logs acoplados ao `DEBUG_MODE`. |
| **Constantes** | `src/constants.js` | Centralizar URLs, `DEBUG_MODE`, seletores CSS dos inputs e mapeamentos de equipes/ESF. |

---

## 🔒 Garantias de Segurança e Execução

1. **Evidência de Interceptação**: `window.open.toString()` retorna `'function open() { [SIGSS-AutoIndex Interceptor Active] }'`.
2. **Exposição Controlada no Window**: `typeof window.executarFluxoImpressao` retorna `'function'`.
3. **Múltiplos Módulos Visíveis no DevTools Sources**: Todos os arquivos ES Module (`main.js`, `pipeline.js`, `utils.js`, `imovel.js`, `formatter.js`, `pdf.js`) são visíveis no painel *Sources* sob o domínio da extensão.
