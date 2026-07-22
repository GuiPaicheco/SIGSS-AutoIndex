# Registro de Alterações (Changelog) - SIGSS-AutoIndex

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

## [0.4.5] - 2026-07-22

### Corrigido
- Corrigido o erro HTTP 400 (Bad Request) retornado pelo endpoint `imobiliarioFamiliar2/lista` durante a consulta ao imóvel.
- Reconstruída a formação de URLs utilizando `URLSearchParams` com inclusão de todos os parâmetros estritos do jqGrid (`_search`, `nd`, `rows`, `page`, `sidx`, `sord`, `searchField`, `searchString`, `searchOper`, `area`, `miar`, `rifa`, `filtroCondicaoFamiliar`).
- Adicionados os cabeçalhos de requisição AJAX `X-Requested-With` e `Accept`.
- Adicionada instrumentação temporária de diagnósticos de requisição e resposta HTTP no console.

## [0.4.4] - 2026-07-22 (RC-1.3)

### Corrigido
- Reestruturado o Bootstrap da extensão para eliminação definitiva de APIs `chrome.runtime` incompatíveis com o contexto `world: "MAIN"`.
- Configurada injeção sequencial determinística no `manifest.json`.

## [0.4.3-debug] - 2026-07-22 (RC-1.2)

### Adicionado
- Versão de diagnóstico de campo com instrumentação completa de 01 a 22 via `console.info()`.
