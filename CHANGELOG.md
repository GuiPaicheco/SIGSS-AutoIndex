# Registro de Alterações (Changelog) - SIGSS+

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

## [0.2.0] - 2026-07-22

### Adicionado
- Implementada leitura automática do Código SIGSS.
- Prioridade de leitura estrita: Input da tela -> Documento/PDF.
- Centralização dos seletores de input HTML no arquivo `src/constants.js`.
- Função resiliente `obterCodigoSIGSS` retornando estritamente string ou `null` sem lançar exceções.
- Garantia de que nenhuma alteração foi feita no fluxo do usuário, sem cache e sem armazenamento local.

## [0.1.0] - 2026-07-22

### Adicionado
- Estrutura base modular do projeto (`manifest.json`, `README.md`, `CHANGELOG.md`).
- Módulo `src/constants.js` com URLs de endpoints, mensagens padrão e tabela completa de Equipes, ESF e Microáreas.
- Módulo `src/interceptor.js` com hooks transparentes para `XMLHttpRequest`, `fetch` e `window.open` interceptando a resposta do endpoint `atendimentoConsulta/imprimirFAA`.
- Módulo `src/equipes.js` para consolidação e consulta de microáreas.
- Módulos base `src/utils.js`, `src/imovel.js`, `src/pdf.js` e `src/main.js`.
- Inclusão da biblioteca `lib/pdf-lib.min.js` para processamento de PDF em memória.
