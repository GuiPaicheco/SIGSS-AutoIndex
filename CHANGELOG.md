# Registro de Alterações (Changelog) - SIGSS-AutoIndex

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

## [0.5.1] - 2026-07-22

### Adicionado
- Instrumentação de auditoria completa em 10 etapas no módulo `src/imovel.js` cobrindo toda a cadeia `visualizar()` → `getIsad()` → `formatter()`.
- Emissão de logs sem mascaramento para captura integral do JSON retornado por `imobiliarioFamiliar/visualizar` e `imobiliarioFamiliar/getIsad`.
- Mecanismo automático de varredura recursiva de chaves `Object.keys()` caso o `isadPK` não seja localizado no formato padrão.
- Criação do documento de auditoria [`docs/AUDITORIA_ISAD.md`](docs/AUDITORIA_ISAD.md).
- Preservados integralmente os módulos Bootstrap, Interceptor, Pipeline, Formatter e PDF.

## [0.5.0] - 2026-07-22

### Adicionado
- Implementada nova estratégia de localização do imóvel através de 13 consultas paralelas simultâneas via `Promise.all()`.
