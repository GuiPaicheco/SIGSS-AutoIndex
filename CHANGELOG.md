# Registro de Alterações (Changelog) — SIGSS-AutoIndex

Todas as alterações notáveis deste projeto são documentadas neste arquivo.

## [1.0.0] - 2026-07-23 (Release Oficial Estável)

### Adicionado
- Primeira Release Oficial Estável do projeto SIGSS-AutoIndex.
- Padronização completa do código-fonte com cabeçalho profissional e documentação JSDoc em todos os arquivos de `src/`.
- Abstração centralizada de logging (`src/logger.js`) acoplada ao modo de depuração `DEBUG_MODE`.
- Adicionados arquivos de governança do repositório: `LICENSE` (MIT), `AUTHORS`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `RELEASE.md` e `ROADMAP.md`.
- Documentação técnica atualizada em `docs/` com diagramas ASCII para arquitetura, fluxo de execução, depuração DevTools e protocolos de homologação.

## [0.5.3] - 2026-07-23

### Corrigido
- Corrigida a leitura dos atributos do ISAD retornado por `imobiliarioFamiliar/getIsad` para leitura direta de `response.isad.area.areaCod`, `response.isad.microArea.miarCod` e `response.isad.isadNumFamiliaSiab`.
- Preservada a responsabilidade do módulo `src/formatter.js` na formatação e normalização de códigos de área de 4 dígitos (ex: `"0086"` -> `"086"`).

## [0.5.2] - 2026-07-23

### Adicionado
- Expansão estrita do caminho `response.imov.domicilioList` → `informacaoDomicilioList` → `isadPK` no módulo `src/imovel.js`.

## [0.5.1] - 2026-07-22

### Adicionado
- Instrumentação de auditoria em 10 etapas no módulo `src/imovel.js`.

## [0.5.0] - 2026-07-22

### Adicionado
- Implementada a busca paralela simultânea por microáreas (`Promise.all`).
