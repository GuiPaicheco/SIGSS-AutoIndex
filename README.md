# SIGSS-AutoIndex - Extensão para Enumeração Automática de Prontuários (FAA)

> Extensão para Google Chrome desenvolvida para automatizar de maneira 100% transparente a enumeração dos prontuários emitidos pelo sistema SIGSS da Prefeitura de Betim.

---

## 🎯 Objetivo

O **SIGSS-AutoIndex** tem como objetivo inserir automaticamente no topo dos prontuários impressos (FAA) a identificação da equipe, microárea, número de família e sufixo de equipe (ex: `086_03_018_03`), eliminando qualquer necessidade de preenchimento manual ou alteração no fluxo de trabalho dos médicos e profissionais de saúde.

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
SIGSS-AutoIndex intercepta a resposta json.report
              ↓
Baixar PDF original em memória
              ↓
Obter Código SIGSS (Leitura automática: Input → Documento/PDF)
              ↓
Integrar Imóvel (Cadeia encadeada: lista → visualizar → getIsad)
              ↓
Gerar string de enumeração (ex: 086_03_018_03)
              ↓
Inserir enumeração no topo centralizado da página
              ↓
Abrir janela com o PDF modificado para impressão
```

---

## 🏠 Integração Imobiliária SIGSS (Versão 0.3.0)

A partir da versão 0.3.0, a consulta de imóveis e microáreas é realizada através de uma cadeia técnica encadeada e determinística, eliminando a necessidade de varreduras paralelas exaustivas por todas as microáreas:

```
Código SIGSS
    ↓
GET imobiliarioFamiliar2/lista?searchField=isen.isenCod&searchString=<Código SIGSS>
    ↓
Extrair imovPK.idp e imovPK.ids (quando records == 1)
    ↓
POST imobiliarioFamiliar/visualizar
    ↓
Obter isadPK.idp e isadPK.ids
    ↓
POST imobiliarioFamiliar/getIsad
    ↓
Obter areaCod, miarCod e isadNumFamiliaSiab -> Gerar "086_03_018_03"
```

### Tratamento de Resultados:
- **`records == 0`**: Retorna `"Não encontrado em imóvel"`.
- **`records == 1`**: Segue a cadeia técnica para obter os dados oficiais e gerar a string de enumeração.
- **`records > 1`**: Retorna `"Múltiplos imóveis encontrados"` sem escolher um resultado arbitrariamente.

### Impacto na Simplificação do Projeto:
A descoberta da cadeia `lista → visualizar → getIsad` simplificou drasticamente a arquitetura do sistema. Em vez de realizar dezenas de chamadas HTTP concorrentes por microárea, a extensão efetua apenas 3 requisições sequenciais direcionadas e exatas, resultando em:
- Maior velocidade de resposta (< 50ms total).
- Redução de carga no servidor do SIGSS.
- Maior confiabilidade e determinismo nos dados retornados.

---

## 🔑 Leitura Automática do Código SIGSS (Versão 0.2.0)

A extração do Código SIGSS opera sob prioridade estrita:
1. **PRIORIDADE 1 (Campo Input da Tela)**: Lê diretamente o valor presente nos inputs HTML da tela do SIGSS (centralizados em `src/constants.js`).
2. **PRIORIDADE 2 (Documento/PDF)**: Caso o input esteja vazio ou indisponível, realiza a leitura e parse do documento PDF em memória via regex.
3. **Tratamento de Erros**: Retorna `null` em caso de erro, sem bloquear o fluxo de impressão do médico.

---

## 🏗️ Arquitetura do Sistema

O projeto adota uma arquitetura modular em JavaScript moderno (ES2022+), utilizando as APIs do **Chrome Extension Manifest V3**.

```
SIGSS-AutoIndex/
├── manifest.json       # Configuração do Manifest V3 da extensão Chrome
├── README.md           # Documentação técnica e guia de uso
├── CHANGELOG.md        # Registro de alterações e histórico de versões
├── lib/
│   └── pdf-lib.min.js  # Biblioteca pdf-lib para edição de PDF em memória
└── src/
    ├── constants.js    # Seletores HTML, equipes, microáreas e endpoints
    ├── equipes.js      # Utilitários de busca de equipes e sufixos
    ├── utils.js        # Função obterCodigoSIGSS (Prioridade Input → PDF)
    ├── imovel.js       # Integração imobiliária (lista -> visualizar -> getIsad)
    ├── pdf.js          # Manipulação e carimbo de PDF em memória
    ├── interceptor.js  # Hook nas chamadas de impressão do SIGSS
    └── main.js         # Orquestrador do fluxo transparente
```

---

## 💻 Instalação

1. Clone este repositório:
   ```bash
   git clone https://github.com/GuiPaicheco/SIGSS-AutoIndex.git
   ```
2. Abra o Google Chrome e navegue até `chrome://extensions/`.
3. Ative o **Modo do desenvolvedor** no canto superior direito.
4. Clique em **Carregar sem compactação** (*Load unpacked*).
5. Selecione a pasta raiz do projeto `SIGSS-AutoIndex`.

---

## 🚀 Roadmap / Versões

- [x] **v0.1.0**: Estrutura base do projeto, Manifest V3 e Módulo Interceptor de Impressão (`interceptor.js`).
- [x] **v0.2.0**: Leitura automática do Código SIGSS com prioridade estrita (Input → Documento/PDF) e tratamento de erros.
- [x] **v0.3.0**: Integração imobiliária do SIGSS através da cadeia validada (`lista → visualizar → getIsad`).
- [ ] **v0.4.0**: Inserção automática da linha de enumeração no PDF em memória e abertura da janela (`pdf.js`).

---

## 📝 Licença

Este projeto é de propriedade da Prefeitura Municipal de Betim / Uso Interno de Saúde Pública.
