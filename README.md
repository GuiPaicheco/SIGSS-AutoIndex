# SIGSS-AutoIndex - Pipeline Inteligente de Impressão de Prontuários (FAA)

> Extensão para Google Chrome desenvolvida para automatizar de maneira 100% transparente a enumeração dos prontuários emitidos pelo sistema SIGSS da Prefeitura de Betim.

---

## 🔬 Versão de Diagnóstico de Campo (v0.4.3-debug - RC-1.2)

A versão **v0.4.3-debug** introduz **instrumentação completa linha a linha** com mensagens explícitas de `console.info` (01 a 22) para rastreamento exato do ponto de execução no ambiente real do SIGSS.

### Sequência Rastreável de Logs no DevTools Console:

```
[SIGSS] 01 - interceptor.js carregado
[SIGSS] 02 - window.open interceptado
[SIGSS] 03 - registrador criado
[SIGSS] 04 - iniciando bootstrap
[SIGSS] 05 - script module criado
[SIGSS] 06 - script anexado à DOM
[SIGSS] 07 - main.js carregado
[SIGSS] 08 - entrou em main.js
[SIGSS] 09 - pipeline importado
[SIGSS] 10 - inicializando
[SIGSS] 11 - registrando handler
[SIGSS] Handler recebido
[SIGSS] 12 - handler registrado
[SIGSS] 13 - window.executarFluxoImpressao definido
[SIGSS] 14 - main.js finalizado
[SIGSS] OPEN chamado <URL>
[SIGSS] callback = function
[SIGSS] entrando no Pipeline
[SIGSS] 15 - pipeline carregado
[SIGSS] 16 - pipeline iniciado
[SIGSS] 17 - obtendo código SIGSS
[SIGSS] 18 - pesquisando imóvel
[SIGSS] 19 - formatando enumeração
[SIGSS] 20 - editando PDF
[SIGSS] 21 - abrindo PDF
[SIGSS] 22 - pipeline concluído
```

---

## 🎯 Objetivo

O **SIGSS-AutoIndex** insere automaticamente no topo dos prontuários impressos (FAA) a identificação completa da equipe, microárea, número de família e sufixo de equipe (ex: `086_03_018_03`), eliminando qualquer necessidade de preenchimento manual ou alteração na rotina dos médicos e profissionais de saúde.

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
- [x] **v0.4.2 (RC-1.1)**: Correção do bootstrap de inicialização dos módulos ES6.
- [x] **v0.4.3-debug (RC-1.2)**: Instrumentação completa de execução linha a linha para diagnóstico de campo.

---

## 📝 Licença

Este projeto é de propriedade da Prefeitura Municipal de Betim / Uso Interno de Saúde Pública.
