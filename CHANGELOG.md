# Registro de Alterações (Changelog) - SIGSS-AutoIndex

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

## [0.4.0] - 2026-07-22

### Adicionado
- Pipeline completo de impressão implementado (`src/pipeline.js`).
- Enumeração automática do prontuário em formato oficial no topo centralizado do PDF.
- Criação do módulo `src/formatter.js` para formatação isolada da string de enumeração.
- Integração completa entre interceptação, leitura do Código SIGSS, pesquisa imobiliária e edição do PDF em memória.
- Processamento integralmente em memória sem criação de cache, banco de dados ou arquivos em disco.
- Tratamento de falhas resiliente com abertura automática do PDF original sem travar o médico ou o navegador.
- Inclusão da documentação técnica em `docs/arquitetura.md`, `docs/fluxo.md`, `docs/depuracao.md` e `CONFIG.md`.

## [0.3.0] - 2026-07-22

### Adicionado
- Implementada a integração imobiliária do SIGSS.
- Fluxo validado e encadeado: `imobiliarioFamiliar2/lista` → `imobiliarioFamiliar/visualizar` → `imobiliarioFamiliar/getIsad`.
- Funções dedicadas em `src/imovel.js`: `buscarImovelPorCodigoSigss`, `visualizarImovel`, `obterDadosIsad` e `montarCodigoFinal`.
- Tratamento de cenários de resposta: `0` resultados (`"Não encontrado em imóvel"`), `1` resultado (enumeração exata ex: `086_03_018_03`) e `> 1` resultados (`"Múltiplos imóveis encontrados"`).
- Sem cache, sem armazenamento local e sem alteração do fluxo do usuário.

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
