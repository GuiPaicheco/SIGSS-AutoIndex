# SIGSS-AutoIndex — Pipeline Inteligente de Impressão de Prontuários (FAA)

[![Release](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/GuiPaicheco/SIGSS-AutoIndex/releases/tag/v1.0.0)
[![Manifest](https://img.shields.io/badge/chrome-Manifest_V3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Homologado_%2F_Est%C3%A1vel-success.svg)](#-créditos)

> Extensão oficial de automação para o sistema SIGSS (Prefeitura Municipal de Betim) desenvolvida para realizar a enumeração automática, transparente e centralizada dos prontuários médicos impresso (Ficha de Atendimento Ambulatorial - FAA).

---

## 📖 Apresentação

O **SIGSS-AutoIndex** é uma solução de engenharia de software desenvolvida para otimizar os processos de atendimento nas Unidades Básicas de Saúde (UBS) do município de Betim/MG. A extensão intercepta transparentemente o momento de impressão da FAA, identifica a localização cadastral do imóvel do paciente e carimba no topo do documento PDF o identificador padronizado da equipe e domicílio.

---

## 🎯 Objetivo

Eliminar o preenchimento manual do número da equipe, microárea e família nos prontuários físicos impressos, garantindo 100% de precisão nos registros de saúde pública sem adicionar cliques ou alterar a rotina dos profissionais de saúde.

### Princípios Inegociáveis

- **Zero Armazenamento**: Processamento exclusivamente em memória RAM. Não cria banco de dados, cache local ou salvamento em disco.
- **Zero Interferência na UI**: Nenhum botão, modal, caixa de confirmação ou alteração visual na interface do SIGSS.
- **Zero Alteração no Fluxo Médico**: O médico continua executando o fluxo habitual (*Abrir atendimento ──► Finalizar atendimento ──► Imprimir*).
- **Resiliência Crítica (Fallback Garantido)**: Se ocorrer qualquer indisponibilidade de rede ou ausência de cadastro, o PDF original sem modificações é exibido imediatamente ao profissional.

---

## 💡 Motivação

Nas Unidades Básicas de Saúde, o preenchimento manual da numeração da família e microárea no topo dos prontuários físicos gerava tempo substancial de retrabalho e risco de erros operacionais na organização dos arquivos. O **SIGSS-AutoIndex** automatiza essa etapa em menos de 200 milissegundos, permitindo que a equipe de saúde foque no atendimento ao cidadão.

---

## ⚙️ Funcionamento e Fluxo de Execução

```
                    Profissional de Saúde clica em "Imprimir" no SIGSS
                                          │
                                          ▼
                      Requisição POST atendimentoConsulta/imprimirFAA
                                          │
                                          ▼
                     interceptor.js captura reportUrl e cancela window.open
                                          │
                                          ▼
                     pipeline.js inicia o processamento em background:
    ┌─────────────────────────────────────┴─────────────────────────────────────┐
    │                                                                           │
    ▼                                                                           ▼
1. Obter Código SIGSS                                              2. Busca Paralela (Promise.all)
   - Input HTML na tela (1ª op)                                       - 13 consultas em microáreas
   - Stream do PDF (2ª op)                                            - Localiza o imóvel do paciente
    │                                                                           │
    └─────────────────────────────────────┬─────────────────────────────────────┘
                                          │
                                          ▼
                     3. Consulta Detalhada visualizar() → getIsad()
                                          │
                                          ▼
                     4. Formatador (formatter.js)
                        - Gera string ex: "086_03_018_03"
                                          │
                                          ▼
                     5. Edição em Memória (pdf.js + pdf-lib)
                        - Carimba topo centralizado da 1ª página
                                          │
                                          ▼
                     6. Exibição Transparente (abrirPdf)
                        - Abre PDF modificado via Blob URL no navegador
```

---

## 🏛️ Arquitetura e Estrutura de Pastas

```
SIGSS-AutoIndex/
├── manifest.json              # Configuração e injeção declarativa Manifest V3 (world: MAIN)
├── README.md                  # Documentação principal da release
├── CHANGELOG.md               # Histórico de alterações por versão
├── CONFIG.md                  # Guia de parametrização de seletores e equipes
├── LICENSE                    # Licença MIT
├── AUTHORS                    # Créditos de autoria principal
├── CONTRIBUTING.md            # Guia para novos contribuidores
├── CODE_OF_CONDUCT.md         # Código de conduta de desenvolvimento
├── SECURITY.md                # Política de relatórios de segurança
├── RELEASE.md                 # Procedimentos para geração de novas versões
├── ROADMAP.md                 # Histórico de conquistas e planejamento futuro
├── docs/                      # Documentação técnica detalhada
│   ├── arquitetura.md         # Arquitetura modular e injeção de scripts
│   ├── fluxo.md               # Detalhamento do pipeline e fallback
│   ├── depuracao.md           # Guia de diagnóstico DevTools Logger
│   ├── TESTE_REAL.md          # Protocolo de homologação em UBS
│   └── AUDITORIA_ISAD.md      # Resolução de estruturas JSON do SIGSS
├── lib/
│   └── pdf-lib.min.js         # Biblioteca para manipulação de PDF em memória
└── src/
    ├── constants.js           # Endpoints, seletores CSS e configurações de equipes
    ├── logger.js              # Abstração centralizada de logging (DEBUG_MODE)
    ├── equipes.js             # Mapeamento de microáreas das Equipes ESF
    ├── utils.js               # Extração do Código SIGSS (Input / PDF)
    ├── imovel.js              # Busca paralela em 13 microáreas e consultas imobiliárias
    ├── formatter.js           # Formatador da enumeração oficial
    ├── pdf.js                 # Download, manipulação via pdf-lib e exibição do Blob
    ├── pipeline.js            # Orquestrador do fluxo e mecanismo de fallback
    ├── interceptor.js         # Hook em window.open, XMLHttpRequest e fetch
    └── main.js                # Ponto de entrada e conexão com window
```

---

## 🖼️ Demonstrativo de Interface (Screenshots)

| Prontuário Original SIGSS | Prontuário Enumerado pelo AutoIndex |
| :---: | :---: |
| *(Imagem da FAA Original sem alteração)* <br> `[ Localizador de Imagem: docs/assets/faa_original.png ]` | *(Imagem da FAA com carimbo `086_03_018_03` no topo)* <br> `[ Localizador de Imagem: docs/assets/faa_enumerado.png ]` |

---

## 💻 Instalação e Atualização

### Instalação em Ambiente de Produção / UBS

1. Clone ou baixe o repositório oficial:
   ```bash
   git clone https://github.com/GuiPaicheco/SIGSS-AutoIndex.git
   ```
2. Abra o Google Chrome no computador da unidade e navegue até:
   `chrome://extensions/`
3. Ative o **Modo do desenvolvedor** no canto superior direito.
4. Clique no botão **Carregar sem compactação** (*Load unpacked*).
5. Selecione a pasta raiz do projeto `SIGSS-AutoIndex`.

### Atualização

Para aplicar novas atualizações, basta atualizar o repositório local (`git pull`) e clicar no botão de recarregar (🔄) na página de extensões do Chrome.

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem**: JavaScript Moderno (ES2022+).
- **Platform**: Google Chrome Extension Manifest V3 (`world: "MAIN"`).
- **Manipulação de PDF**: `pdf-lib` (execução 100% client-side em ArrayBuffer).
- **Comunicação Nativa**: Interceptação de `XMLHttpRequest`, `fetch` e `window.open`.
- **Concorrência**: `Promise.all` para requisições paralelas.

---

## 📑 Registros de Alterações (Changelog Resumido)

### [1.0.0] - 2026-07-23 (Release Oficial Estável)
- **Revisão e Estabilização**: Limpeza geral de logs de depuração e congelamento da arquitetura aprovada.
- **Documentação Profissional**: Adição dos arquivos de governança (`LICENSE`, `AUTHORS`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `RELEASE`, `ROADMAP`).
- **JSDoc e Logger**: Padronização completa do código-fonte com cabeçalhos estruturados e documentação JSDoc em todos os módulos.

Para o histórico completo de versões anteriores (v0.1.0 a v0.5.3), consulte o [**CHANGELOG.md**](CHANGELOG.md).

---

## 👥 Créditos

- **Autor Principal**: Guilherme Paicheco Ferreira
- **Cargo**: Servidor Público Municipal
- **Instituição**: Prefeitura Municipal de Betim / Secretaria Municipal de Saúde
- **Atuação**: Arquitetura, Desenvolvimento, Testes e Homologação.

---

## 📝 Licença

Este projeto está licenciado sob a **Licença MIT** — consulte o arquivo [**LICENSE**](LICENSE) para mais detalhes.
