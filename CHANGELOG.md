# Registro de Alterações (Changelog) - SIGSS-AutoIndex

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

## [0.5.0] - 2026-07-22

### Adicionado
- Implementada nova estratégia de localização do imóvel através de 13 consultas paralelas simultâneas via `Promise.all()`.
- Criadas as funções `buscarEmMicroarea()` e `buscarEmTodasMicroareas()` em `src/imovel.js`.
- Adicionada resiliência isolada a falhas de rede em consultas de microáreas individuais sem interromper a execução do `Promise.all()`.
- Adicionados logs temporários detalhados de diagnósticos para homologação em campo.

## [0.4.5] - 2026-07-22

### Corrigido
- Corrigido o erro HTTP 400 (Bad Request) retornado pelo endpoint `imobiliarioFamiliar2/lista`.
- Reconstruída a formação de URLs utilizando `URLSearchParams`.

## [0.4.4] - 2026-07-22 (RC-1.3)

### Corrigido
- Reestruturado o Bootstrap da extensão para eliminação definitiva de APIs `chrome.runtime` incompatíveis com o contexto `world: "MAIN"`.
