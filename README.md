# SIGSS+ - Extensão para Enumeração Automática de Prontuários (FAA)

> Extensão para Google Chrome desenvolvida para automatizar de maneira 100% transparente a enumeração dos prontuários emitidos pelo sistema SIGSS da Prefeitura de Betim.

---

## 🎯 Objetivo

O **SIGSS+** tem como objetivo inserir automaticamente no topo dos prontuários impressos (FAA) a identificação da equipe, microárea, número de família e sufixo de equipe (ex: `086_03_018_03`), eliminando qualquer necessidade de preenchimento manual ou alteração no fluxo de trabalho dos médicos e profissionais de saúde.

### Princípios Inegociáveis

A extensão opera sob estritos princípios de transparência e privacidade:
- **Zero armazenamento**: Não cria banco de dados, não cria cache e não salva arquivos locais.
- **Zero interferência na UI**: Nenhum botão adicionado, nenhuma tela modificada, nenhuma caixa de confirmação.
- **Zero alteração de fluxo**: O médico continua realizando a mesma sequência habitual (Abrir atendimento → Finalizar atendimento → Imprimir).
- **Execução estritamente em memória**: Toda informação existe apenas em memória durante o processo de impressão e é totalmente descartada ao finalizar.

---

## 🔄 Funcionamento

Quando o profissional de saúde clica no botão de impressão do SIGSS:

```
Médico clica em "Imprimir" no SIGSS
              ↓
SIGSS executa: POST atendimentoConsulta/imprimirFAA
              ↓
SIGSS+ intercepta a resposta json.report
              ↓
Baixar PDF original em memória
              ↓
Obter Código SIGSS (Leitura do prontuário ou input)
              ↓
Pesquisar imóvel via API imobiliarioFamiliar2/lista (Busca paralela por microárea)
              ↓
Gerar string de enumeração (ex: 086_03_018_03)
              ↓
Inserir enumeração no topo centralizado da página
              ↓
Abrir janela com o PDF modificado para impressão
```

---

## 🏗️ Arquitetura do Sistema

O projeto adota uma arquitetura modular em JavaScript moderno (ES2022+), utilizando as APIs do **Chrome Extension Manifest V3**.

```
SIGSS+/
├── manifest.json       # Configuração do Manifest V3 da extensão Chrome
├── README.md           # Documentação técnica e guia de uso
├── CHANGELOG.md        # Registro de alterações e histórico de versões
├── lib/
│   └── pdf-lib.min.js  # Biblioteca pdf-lib para edição de PDF em memória
└── src/
    ├── constants.js    # Mapeamento de equipes, microáreas e endpoints
    ├── equipes.js      # Utilitários de busca de equipes e microáreas
    ├── utils.js        # Utilitários para extração do Código SIGSS
    ├── imovel.js       # Consulta paralela de imóvel (Promise.all)
    ├── pdf.js          # Manipulação e carimbo de PDF em memória
    ├── interceptor.js  # Hook nas chamadas de impressão do SIGSS
    └── main.js         # Orquestrador do fluxo transparente
```

### Mapeamento de Equipes e Microáreas

| Equipe | Código ESF | Área | Sufixo Equipe | Microáreas |
| :--- | :--- | :--- | :--- | :--- |
| **Equipe 01** | `085` | `97-1` | `01` | `05` (35267-1), `07` (35268-1), `08` (35269-1), `13` (35270-1) |
| **Equipe 02** | `087` | `91-1` | `02` | `01` (35234-1), `02` (35235-1), `10` (36694-1), `11` (35236-1), `12` (35237-1) |
| **Equipe 03** | `086` | `103-1` | `03` | `03` (35296-1), `04` (35297-1), `06` (35298-1), `09` (35299-1) |

### Interpretação dos Resultados de Imóvel

- **1 Imóvel Encontrado**: Formato `CódigoEquipe_Micro_NúmeroFamília_NúmeroEquipe` (ex: `086_03_018_03`).
- **Nenhum Imóvel Encontrado**: Escreve `"Não encontrado em imóvel"`.
- **Múltiplos Imóveis Encontrados**: Escreve `"Múltiplos imóveis encontrados"`.

---

## 💻 Instalação

1. Clone este repositório ou faça o download do ZIP:
   ```bash
   git clone https://github.com/GuiPaicheco/SIGSS.git
   ```
2. Abra o Google Chrome e navegue até `chrome://extensions/`.
3. Ative o **Modo do desenvolvedor** no canto superior direito.
4. Clique em **Carregar sem compactação** (*Load unpacked*).
5. Selecione a pasta raiz do projeto `SIGSS+`.

---

## 🛠️ Desenvolvimento

Para contribuir ou realizar alterações no código:

1. Modifique apenas o módulo correspondente dentro da pasta `src/`.
2. Mantenha as funções pequenas, modulares e legíveis.
3. Nunca altere o fluxo ou adicione elementos gráficos visíveis na UI.
4. Teste recarregando a extensão em `chrome://extensions/`.

---

## ⚠️ Limitações

- A extensão requer conectividade com a rede interna/servidor do SIGSS da Prefeitura de Betim.
- A chave primária de pesquisa é **exclusivamente o Código SIGSS** (nunca realiza buscas por CPF, Nome ou CNS).

---

## 🚀 Roadmap / Versões

- [x] **v0.1.0**: Estrutura base do projeto, Manifest V3 e Módulo Interceptor de Impressão (`interceptor.js`).
- [ ] **v0.2.0**: Leitura automática do Código SIGSS do prontuário e input da tela (`utils.js`).
- [ ] **v0.3.0**: Pesquisa automática do imóvel em paralelo com Promise.all() (`imovel.js`).
- [ ] **v0.4.0**: Inserção automática da linha de enumeração no PDF em memória (`pdf.js`).

---

## 📝 Licença

Este projeto é de propriedade da Prefeitura Municipal de Betim / Uso Interno de Saúde Pública.

---

## 🤝 Contribuição

Contribuições devem seguir rigorosamente a arquitetura pré-definida e a metodologia de desenvolvimento modular em etapas com aprovação prévia.
