# Arquitetura do Sistema - SIGSS-AutoIndex (v0.4.0)

O **SIGSS-AutoIndex** foi projetado sob uma arquitetura modular em **JavaScript Moderno (ES2022+)** utilizando as diretrizes da API de extensões do Chrome em **Manifest V3**.

---

## 🏛️ Visão Geral da Arquitetura

O sistema adota o padrão de **Pipeline Desacoplado**, onde um módulo orquestrador (`pipeline.js`) gerencia a execução dos componentes especializados sem que nenhum deles possua acoplamento direto com os demais.

```
                  ┌──────────────────────┐
                  │    interceptor.js    │ (Hook na impressão)
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
| **Interceptor** | `src/interceptor.js` | Capturar síncronamente chamadas ao endpoint de impressão e redirecionar `window.open` sem interferir na UI. |
| **Pipeline** | `src/pipeline.js` | Orquestrar o sequenciamento do processamento e garantir o fallback imediato para o PDF original em caso de falha. |
| **Utilitários** | `src/utils.js` | Extrair o Código SIGSS com prioridade estrita (Input da tela → Documento PDF). |
| **Integração Imobiliária** | `src/imovel.js` | Executar a cadeia HTTP (`lista` → `visualizar` → `getIsad`) para obter os identificadores do domicílio. |
| **Formatador** | `src/formatter.js` | Converter os dados cadastrais do imóvel na string oficial de enumeração (ex: `086_03_018_03`). |
| **Manipulador PDF** | `src/pdf.js` | Baixar o PDF original, carimbar a linha no topo centralizado via `pdf-lib` em memória e abrir a janela. |
| **Constantes** | `src/constants.js` | Centralizar URLs, seletores CSS dos inputs, mensagens padrão e mapeamentos de equipes/ESF. |
| **Utilitários de Equipe** | `src/equipes.js` | Mapear códigos ESF para sufixos numéricos de equipe. |
| **Ponto de Entrada** | `src/main.js` | Registrar o pipeline no interceptor durante o carregamento da extensão. |

---

## 🔒 Princípios de Segurança e Memória

- **Execução 100% In-Memory**: Nenhum dado é salvo em discos locais, `localStorage`, `sessionStorage`, `IndexedDB` ou Cookies.
- **Descarte de Recursos**: Todos os `ObjectURL` de Blob criados para visualização do PDF são revogados via `URL.revokeObjectURL()` após a exibição.
- **Não-Bloqueante**: Falhas internas nunca travam a interface nem impedem a impressão para o profissional de saúde.
