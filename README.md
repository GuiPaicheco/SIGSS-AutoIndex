# SIGSS-AutoIndex - Pipeline Inteligente de Impressão de Prontuários (FAA)

> Extensão para Google Chrome desenvolvida por Guilherme Paicheco Ferreira para automatizar de maneira 100% transparente a enumeração dos prontuários emitidos pelo sistema SIGSS da Prefeitura de Betim.

---

## 🛠️ Correção Arquitetural do Bootstrap (v0.4.4 - RC-1.3)

A versão **v0.4.4** reestrutura completamente a injeção dos scripts da extensão. A solução anterior baseada em `chrome.runtime.getURL` em `document.createElement('script')` executando dentro do contexto `world: "MAIN"` dependia de APIs de extensão indisponíveis para scripts de páginas nativas no Google Chrome.

Na v0.4.4, a injeção passa a ser realizada **diretamente pelo Manifest V3 do Chrome** declarando a sequência ordenada de scripts no array `content_scripts.js` com `"world": "MAIN"` e `"run_at": "document_start"`:

```
Chrome Manifest V3 (document_start em MAIN world)
       │
       ├── 1. lib/pdf-lib.min.js
       ├── 2. src/constants.js
       ├── 3. src/logger.js
       ├── 4. src/equipes.js
       ├── 5. src/utils.js
       ├── 6. src/imovel.js
       ├── 7. src/formatter.js
       ├── 8. src/pdf.js
       ├── 9. src/pipeline.js
       ├── 10. src/interceptor.js  (Instala hooks transparentes e registrador)
       └── 11. src/main.js         (Registra handler e expõe window.executarFluxoImpressao)
```

Essa arquitetura é 100% determinística, funciona nativamente sem requisições de rede para a extensão e garante que a variável `callbackImpressaoInterceptada` receba a referência da função `executarFluxoImpressao`.

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

---

## 📝 Licença

Este projeto é de propriedade da Prefeitura Municipal de Betim / Uso Interno de Saúde Pública.
