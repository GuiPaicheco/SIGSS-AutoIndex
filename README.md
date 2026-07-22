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
Obter Código SIGSS (Leitura automática: Input → Documento/PDF)
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

## 🔑 Leitura Automática do Código SIGSS (Versão 0.2.0)

A extração do Código SIGSS é a etapa essencial para identificar unicamente o prontuário. A função `obterCodigoSIGSS` opera seguindo uma prioridade estrita:

1. **PRIORIDADE 1 (Campo Input da Tela)**: A extensão lê diretamente o valor presente nos inputs HTML da tela do SIGSS (centralizados em `src/constants.js`). Essa abordagem é instantânea, robusta e evita requisições desnecessárias.
2. **PRIORIDADE 2 (Documento/PDF)**: Caso o campo input não exista ou esteja vazio na DOM, a extensão realiza a leitura e parse do documento PDF em memória via regex.
3. **Tratamento de Erros e Resiliência**: Se nenhuma informação for localizada, a função retorna `null` sem lançar exceções não tratadas, garantindo que o fluxo de impressão original do médico jamais seja bloqueado ou travado.

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
    ├── constants.js    # Seletores HTML, equipes, microáreas e endpoints
    ├── equipes.js      # Utilitários de busca de equipes e microáreas
    ├── utils.js        # Função obterCodigoSIGSS (Prioridade Input → PDF)
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

## 🚀 Roadmap / Versões

- [x] **v0.1.0**: Estrutura base do projeto, Manifest V3 e Módulo Interceptor de Impressão (`interceptor.js`).
- [x] **v0.2.0**: Leitura automática do Código SIGSS com prioridade estrita (Input → Documento/PDF) e tratamento de erros resiliente.
- [ ] **v0.3.0**: Pesquisa automática do imóvel em paralelo com Promise.all() (`imovel.js`).
- [ ] **v0.4.0**: Inserção automática da linha de enumeração no PDF em memória (`pdf.js`).

---

## 📝 Licença

Este projeto é de propriedade da Prefeitura Municipal de Betim / Uso Interno de Saúde Pública.
