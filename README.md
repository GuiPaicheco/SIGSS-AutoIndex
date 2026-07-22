# SIGSS-AutoIndex - Pipeline Inteligente de Impressão de Prontuários (FAA)

> Extensão para Google Chrome desenvolvida para automatizar de maneira 100% transparente a enumeração dos prontuários emitidos pelo sistema SIGSS da Prefeitura de Betim.

---

## 🛠️ Correção da Consulta Imobiliária (v0.4.5)

A versão **v0.4.5** corrige o erro **HTTP 400 (Bad Request)** observado na homologação em campo durante a consulta ao endpoint `imobiliarioFamiliar2/lista`.

### Análise Técnica da Causa Raiz
O endpoint `imobiliarioFamiliar2/lista` do SIGSS é um controlador de grid Java (jqGrid). Quando a requisição continha apenas `?searchField=isen.isenCod&searchString=<codigo>`, o binding de dados do backend falhava por falta dos parâmetros estritos de paginação e estado do jqGrid (`_search`, `rows`, `page`, `sidx`, `sord`).

### Solução Aplicada
1. Reconstrução completa da URL de busca utilizando a API `URLSearchParams` com todos os parâmetros obrigatórios e opcionais do jqGrid.
2. Inclusão dos cabeçalhos HTTP de requisição AJAX (`X-Requested-With: XMLHttpRequest`, `Accept: application/json, text/javascript, */*; q=0.01`).
3. Adição de instrumentação de diagnósticos HTTP (`[SIGSS] URL completa:`, `[SIGSS] Status HTTP:`, `[SIGSS] Body:`).

---

## 🎯 Objetivo

O **SIGSS-AutoIndex** insere automaticamente no topo dos prontuários impressos (FAA) a identificação completa da equipe, microárea, número de família e sufixo de equipe (ex: `086_03_018_03`), eliminando qualquer necessidade de preenchimento manual ou alteração na rotina dos médicos e profissionais de saúde.

### Princípios Inegociáveis

- **Zero armazenamento**: Não cria banco de dados, não cria cache e não salva arquivos locais.
- **Zero interferência na UI**: Nenhum botão adicionado, nenhuma tela modificada, nenhuma caixa de confirmação.
- **Zero alteração de fluxo**: O médico continua realizando a mesma sequência habitual (Abrir atendimento → Finalizar atendimento → Imprimir).
- **Execução 100% em memória**: Toda informação existe apenas em memória durante o processo de impressão e é totalmente descartada ao finalizar.
- **Resiliência Crítica (Fallback Garantido)**: Se ocorrer qualquer falha no pipeline, o PDF original sem modificações é aberto automaticamente para o médico.

---

## 💻 Instalação

1. Clone o repositório oficial:
   ```bash
   git clone https://github.com/GuiPaicheco/SIGSS-AutoIndex.git
   ```
2. Abra o Google Chrome e navegue até `chrome://extensions/`.
3. Ative o **Modo do desenvolvedor** no canto superior direito.
4. Clique em **Carregar sem compactação** (*Load unpacked*).
5. Selecione a pasta raiz do projeto `SIGSS-AutoIndex`.

---

## 🚀 Versões

- [x] **v0.1.0**: Estrutura base do projeto, Manifest V3 e Módulo Interceptor de Impressão (`interceptor.js`).
- [x] **v0.2.0**: Leitura automática do Código SIGSS com prioridade estrita (Input → Documento/PDF).
- [x] **v0.3.0**: Integração imobiliária do SIGSS através da cadeia validada (`lista → visualizar → getIsad`).
- [x] **v0.4.0**: Pipeline de Impressão Inteligente com carimbo de PDF em memória e política de fallback.
- [x] **v0.4.1 (RC-1)**: Primeira versão Release Candidate destinada à homologação.
- [x] **v0.4.2 (RC-1.1)**: Correção do bootstrap de inicialização.
- [x] **v0.4.3-debug (RC-1.2)**: Instrumentação completa de execução linha a linha.
- [x] **v0.4.4 (RC-1.3)**: Reestruturação arquitetural do Bootstrap via injeção direta no `manifest.json`.
- [x] **v0.4.5**: Correção da consulta imobiliária (`imobiliarioFamiliar2/lista`) com suporte completo aos parâmetros jqGrid e eliminação do HTTP 400.

---

## 📝 Licença

Este projeto é de propriedade da Prefeitura Municipal de Betim / Uso Interno de Saúde Pública.
