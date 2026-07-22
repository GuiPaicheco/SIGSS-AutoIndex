# Registro de Alterações (Changelog) - SIGSS-AutoIndex

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

## [0.4.3-debug] - 2026-07-22 (RC-1.2)

### Adicionado
- Versão de diagnóstico de campo com instrumentação completa de 01 a 22 via `console.info()` e `console.error()` diretos.
- Rastreamento explícito em `interceptor.js`, `main.js`, `pipeline.js`, `utils.js`, `imovel.js`, `formatter.js`, `pdf.js`, `logger.js` e `constants.js`.
- Rastreamento dos eventos `script.onload` e `script.onerror` no carregamento dinâmico do módulo principal.
- Rastreamento interno da invocação do `window.open` e do registrador `window.__SIGSS_PLUS_REGISTRAR_HANDLER__`.

## [0.4.2] - 2026-07-22

### Corrigido
- Corrigida falha crítica de inicialização (BLOCKER) em ambiente real.
- Implementado bootstrap no módulo `src/interceptor.js` injetando `src/main.js` como ES Module (`<script type="module">`).

## [0.4.1] - 2026-07-22 (RC-1)

### Adicionado
- Primeira versão Release Candidate (RC-1) destinada aos testes e homologação.

## [0.4.0] - 2026-07-22

### Adicionado
- Pipeline completo de impressão implementado (`src/pipeline.js`).
