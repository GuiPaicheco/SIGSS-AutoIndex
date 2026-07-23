# Arquitetura do Sistema — SIGSS-AutoIndex (v1.0.0)

O **SIGSS-AutoIndex** adota uma arquitetura modular em **JavaScript Moderno** construída sob as especificações do **Google Chrome Extension Manifest V3**.

---

## 🚀 Mecanismo de Inicialização e Injeção Declarativa (`world: "MAIN"`)

No Manifest V3 do Google Chrome, a injeção no contexto de execução nativo da página do SIGSS (`world: "MAIN"`) é configurada de forma declarativa e determinística no `manifest.json` com execução no momento `document_start`:

```
Google Chrome Manifest V3 (document_start em MAIN world)
       │
       ├── 1. lib/pdf-lib.min.js     (Biblioteca de edição PDF em memória)
       ├── 2. src/constants.js       (Endpoints, seletores CSS e configurações)
       ├── 3. src/logger.js          (Abstração central de logging)
       ├── 4. src/equipes.js         (Mapeamento de Equipes de Saúde da Família e Microáreas)
       ├── 5. src/utils.js           (Extração do Código SIGSS via Input e PDF)
       ├── 6. src/imovel.js          (Busca paralela por microáreas e consultas imobiliárias)
       ├── 7. src/formatter.js       (Formatador da enumeração oficial)
       ├── 8. src/pdf.js             (Baixar, carimbar via pdf-lib e abrir PDF)
       ├── 9. src/pipeline.js        (Orquestrador do Pipeline de Impressão)
       ├── 10. src/interceptor.js    (Hook transparente em window.open, XHR e fetch)
       └── 11. src/main.js           (Ponto de entrada: registra handler e expõe window)
```

---

## 🏛️ Visão Geral da Arquitetura do Pipeline

O sistema adota o padrão de **Pipeline Desacoplado**, em que cada módulo possui responsabilidade única e isolada:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SIGSS-AutoIndex                               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (Interceptação de window.open no FAA)
                                     ▼
                        ┌─────────────────────────┐
                        │     interceptor.js      │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │        main.js          │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │       pipeline.js       │
                        └────────────┬────────────┘
                                     │
       ┌─────────────────────┼─────────────────────┬─────────────────────┐
       ▼                     ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   utils.js   │     │  imovel.js   │     │ formatter.js │     │    pdf.js    │
│(Código SIGSS)│     │(Busca 13x MS)│     │(Formatação)  │     │ (Carimbo PDF)│
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 📦 Responsabilidade dos Módulos

| Módulo | Arquivo | Responsabilidade Única |
| :--- | :--- | :--- |
| **Constantes** | `src/constants.js` | Centralizar URLs, seletores CSS dos inputs, mensagens padrão e mapeamentos de equipes/ESF. |
| **Logger** | `src/logger.js` | Controlar centralizadamente a emissão de logs (`info`, `debug`, `warn`, `error`) acoplados à flag `DEBUG_MODE`. |
| **Equipes** | `src/equipes.js` | Mapear as 13 microáreas das Equipes de Saúde da Família e resolver sufixos de equipe. |
| **Utilitários** | `src/utils.js` | Extrair o Código SIGSS com prioridade estrita (1º Input da tela → 2º Documento PDF). |
| **Integração Imobiliária** | `src/imovel.js` | Executar a busca paralela em 13 microáreas (`Promise.all`) e a cadeia `visualizar` → `getIsad`. |
| **Formatador** | `src/formatter.js` | Converter os atributos do ISAD na string oficial de enumeração (ex: `086_03_018_03`). |
| **Manipulador PDF** | `src/pdf.js` | Baixar o PDF original, carimbar a linha no topo centralizado via `pdf-lib` em memória e exibir o Blob. |
| **Pipeline** | `src/pipeline.js` | Orquestrar o fluxo de impressão e garantir a execução da política de fallback ao PDF original em qualquer exceção. |
| **Interceptor** | `src/interceptor.js` | Instalar os hooks transparentes sobre `window.open`, `XMLHttpRequest` e `fetch`. |
| **Ponto de Entrada** | `src/main.js` | Conectar o pipeline ao registrador do interceptor e expor `window.executarFluxoImpressao`. |

---

## 🔒 Garantias de Segurança e Execução

1. **Evidência de Interceptação**: `window.open.toString()` retorna `'function open() { [SIGSS-AutoIndex Interceptor Active] }'`.
2. **Exposição Controlada**: `typeof window.executarFluxoImpressao` retorna `'function'`.
3. **Resiliência Crítica (Fallback Garantido)**: Se ocorrer qualquer falha no pipeline, o PDF original não modificado é aberto para o usuário sem interrupção do atendimento.
