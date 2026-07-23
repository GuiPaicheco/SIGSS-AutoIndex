# Registro de Alterações (Changelog) - SIGSS-AutoIndex

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

## [0.5.3] - 2026-07-23

### Corrigido
- Corrigida a leitura dos atributos do ISAD retornado por `imobiliarioFamiliar/getIsad` para leitura direta de `response.isad.area.areaCod`, `response.isad.microArea.miarCod` e `response.isad.isadNumFamiliaSiab`.
- Adicionada a emissão sequencial no DevTools dos logs de `response.isad`, suas chaves `Object.keys()`, `response.isad.area`, `response.isad.microArea` e o objeto montado.
- Preservada a responsabilidade do módulo `src/formatter.js` na formatação e normalização de códigos de área de 4 dígitos (ex: `"0086"` -> `"086"`).
- Preservados integralmente os módulos Bootstrap, Interceptor, Pipeline, Formatter e PDF.

## [0.5.2] - 2026-07-23

### Adicionado
- Expansão estrita do caminho `response.imov.domicilioList` → `informacaoDomicilioList` → `isadPK` no módulo `src/imovel.js`.

## [0.5.1] - 2026-07-22

### Adicionado
- Instrumentação de auditoria completa em 10 etapas no módulo `src/imovel.js`.
