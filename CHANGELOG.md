# Registro de Alterações (Changelog) - SIGSS-AutoIndex

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

## [0.4.4] - 2026-07-22 (RC-1.3)

### Corrigido
- Reestruturado o Bootstrap da extensão para eliminação definitiva de APIs `chrome.runtime` incompatíveis com o contexto `world: "MAIN"`.
- Configurada injeção sequencial determinística no `manifest.json` para todos os módulos da extensão no contexto `MAIN` no `document_start`.
- Garantido o registro imediato do handler de impressão com `typeof callbackImpressaoInterceptada === "function"`.
- Preservadas todas as regras de negócio, algoritmos de busca e funcionalidades do pipeline sem alterações.

## [0.4.3-debug] - 2026-07-22 (RC-1.2)

### Adicionado
- Versão de diagnóstico de campo com instrumentação completa de 01 a 22 via `console.info()`.

## [0.4.2] - 2026-07-22

### Corrigido
- Corrigida falha de inicialização em ambiente real.

## [0.4.1] - 2026-07-22 (RC-1)

### Adicionado
- Primeira versão Release Candidate (RC-1) destinada aos testes e homologação.
