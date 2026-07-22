# SIGSS-AutoIndex - Pipeline Inteligente de Impressão de Prontuários (FAA)

> Extensão para Google Chrome desenvolvida para automatizar de maneira 100% transparente a enumeração dos prontuários emitidos pelo sistema SIGSS da Prefeitura de Betim.

---

## 🔬 Correção Crítica de Inicialização (v0.4.2 - BLOCKER Resolvido)

A versão **v0.4.2** corrige a inicialização dos módulos ES6 no Manifest V3 do Google Chrome. O script [src/interceptor.js](file:///c:/Users/guilh/Documents/Programação/SIGSS+/src/interceptor.js) agora realiza o bootstrap dinâmico injetando [src/main.js](file:///c:/Users/guilh/Documents/Programação/SIGSS+/src/main.js) como um módulo ES6 (`<script type="module">`) no contexto principal de execução (`world: "MAIN"`), garantindo:

1. `typeof window.executarFluxoImpressao === "function"`.
2. Interceptação visível em `window.open.toString()`.
3. Presença de todos os módulos (`main.js`, `pipeline.js`, `utils.js`, `imovel.js`, `formatter.js`, `pdf.js`) no painel *Sources* do DevTools.
4. Suporte a URLs com IPs de redes internas da UBS (`http://*/*`).

Para orientações sobre a instalação e execução do teste em campo, consulte o [**Guia de Homologação e Teste Real (docs/TESTE_REAL.md)**](file:///c:/Users/guilh/Documents/Programação/SIGSS+/docs/TESTE_REAL.md).

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

## 🚀 Pipeline Inteligente de Impressão

Toda a orquestração do fluxo de impressão é gerenciada pelo módulo `src/pipeline.js`:

```
1. Médico clica em "Imprimir" no SIGSS
                    ↓
2. SIGSS executa: POST atendimentoConsulta/imprimirFAA
                    ↓
3. interceptor.js captura a resposta JSON com a reportUrl
                    ↓
4. pipeline.js assume a orquestração em segundo plano:
   │
   ├── Obter Código SIGSS (Input → Documento/PDF)
   ├── Consultar Imóvel (Cadeia: lista → visualizar → getIsad)
   ├── Formatar Enumeração (formatter.js ex: "086_03_018_03")
   ├── Baixar PDF em memória (pdf.js)
   ├── Carimbar enumeração no topo centralizado via pdf-lib
   └── Abrir janela com PDF modificado em memória (Blob URL)
```

---

## 📚 Documentação Técnica

Disponível no diretório [`docs/`](file:///c:/Users/guilh/Documents/Programa%C3%A7%C3%A3o/SIGSS+/docs):
- [**docs/TESTE_REAL.md**](file:///c:/Users/guilh/Documents/Programa%C3%A7%C3%A3o/SIGSS+/docs/TESTE_REAL.md): Checklist e guia passo a passo para testes na UBS.
- [**docs/arquitetura.md**](file:///c:/Users/guilh/Documents/Programa%C3%A7%C3%A3o/SIGSS+/docs/arquitetura.md): Visão geral dos módulos e mecanismo de bootstrap em `MAIN` world.
- [**docs/fluxo.md**](file:///c:/Users/guilh/Documents/Programa%C3%A7%C3%A3o/SIGSS+/docs/fluxo.md): Detalhamento passo a passo do fluxo e fallback.
- [**docs/depuracao.md**](file:///c:/Users/guilh/Documents/Programa%C3%A7%C3%A3o/SIGSS+/docs/depuracao.md): Guia de diagnósticos e inspeção de logs no DevTools.
- [**CONFIG.md**](file:///c:/Users/guilh/Documents/Programa%C3%A7%C3%A3o/SIGSS+/CONFIG.md): Guia de configuração de constantes e adaptação para outras UBS.

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
- [x] **v0.4.2**: Correção do bootstrap de inicialização dos módulos ES6 no contexto `MAIN` da página.

---

## 📝 Licença

Este projeto é de propriedade da Prefeitura Municipal de Betim / Uso Interno de Saúde Pública.
