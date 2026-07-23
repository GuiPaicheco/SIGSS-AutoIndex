# Roadmap do Projeto — SIGSS-AutoIndex

Este documento apresenta o histórico de conquistas do projeto **SIGSS-AutoIndex** e o planejamento para evoluções futuras.

---

## 🟢 Concluído (Release v1.0.0)

- [x] **Arquitetura Manifest V3 (`world: "MAIN"`)**: Injeção declarativa sequencial no tempo de carregamento `document_start`.
- [x] **Interceptação Transparente**: Interceptador de `window.open`, `XMLHttpRequest` e `fetch` para o endpoint `atendimentoConsulta/imprimirFAA`.
- [x] **Leitura Automática do Código SIGSS**: Prioridade estrita (1º Input na tela → 2º Regex no stream do PDF).
- [x] **Busca Paralela por Microáreas**: Execução simultânea em 13 microáreas via `Promise.all()` garantindo tempo de resposta mínimo.
- [x] **Navegação Imobiliária SIGSS**: Resolução da cadeia `imobiliarioFamiliar2/lista` → `visualizar` → `getIsad`.
- [x] **Formatador Oficial**: Geração da string de enumeração `CódigoEquipe_MicroArea_NumeroFamilia_SufixoEquipe` (ex: `086_03_018_03`).
- [x] **Edição em Memória via `pdf-lib`**: Carimbo da enumeração centralizado no topo da 1ª página do PDF.
- [x] **Resiliência Crítica (Fallback Garantido)**: Abertura automática do PDF original não modificado em qualquer exceção.
- [x] **Documentação Profissional Open Source**: Arquivos de governança (`LICENSE`, `AUTHORS`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `RELEASE`, `ROADMAP`, `README`).

---

## 🟡 Em Desenvolvimento

- [ ] **Expansão de Mapeamentos de Equipes**: Interface simples de configuração centralizada para adição de novas UBSs do município de Betim.
- [ ] **Métricas de Performance Local**: Monitoramento em modo depuração do tempo total de execução da busca paralela.

---

## 🔵 Ideias Futuras

- [ ] **Suporte a Outros Documentos do SIGSS**: Avaliação de viabilidade para extensão da enumeração automática a guias de encaminhamento e receitas.