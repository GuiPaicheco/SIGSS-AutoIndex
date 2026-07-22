# Registro de Alterações (Changelog) - SIGSS-AutoIndex

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

## [0.4.2] - 2026-07-22

### Corrigido
- Corrigida falha crítica de inicialização (BLOCKER) em ambiente real.
- Implementado bootstrap no módulo `src/interceptor.js` injetando `src/main.js` como ES Module (`<script type="module">`) na DOM da página.
- Garantida a exposição de `window.executarFluxoImpressao` para diagnósticos no DevTools.
- Sobrescrita customizada de `window.open.toString()` retornando `'function open() { [SIGSS-AutoIndex Interceptor Active] }'`.
- Expansão do padrão de `matches` no `manifest.json` para suportar conexões HTTP de redes internas da UBS (`http://*/*`).
- Exibição de logs visuais de inicialização estritamente quando `DEBUG_MODE = true`.

## [0.4.1] - 2026-07-22 (RC-1)

### Adicionado
- Primeira versão Release Candidate (RC-1) destinada aos testes e homologação em ambiente real na UBS.
- Módulo `src/logger.js` e constante `DEBUG_MODE` em `src/constants.js` para controle centralizado de depuração.
- Documento de homologação em campo [`docs/TESTE_REAL.md`](docs/TESTE_REAL.md) contendo instruções e checklist completo.

## [0.4.0] - 2026-07-22

### Adicionado
- Pipeline completo de impressão implementado (`src/pipeline.js`).
- Enumeração automática do prontuário em formato oficial no topo centralizado do PDF.
- Criação do módulo `src/formatter.js` para formatação isolada da string de enumeração.
- Integração completa entre interceptação, leitura do Código SIGSS, pesquisa imobiliária e edição do PDF em memória.
- Processamento integralmente em memória sem criação de cache, banco de dados ou arquivos em disco.

## [0.3.0] - 2026-07-22

### Adicionado
- Implementada a integração imobiliária do SIGSS.
- Fluxo validado e encadeado: `imobiliarioFamiliar2/lista` → `imobiliarioFamiliar/visualizar` → `imobiliarioFamiliar/getIsad`.

## [0.2.0] - 2026-07-22

### Adicionado
- Implementada leitura automática do Código SIGSS (Input -> Documento/PDF).

## [0.1.0] - 2026-07-22

### Adicionado
- Estrutura base modular do projeto (`manifest.json`, `README.md`, `CHANGELOG.md`).
