# Auditoria Completa da Cadeia Imobiliária (`visualizar()` → `getIsad()` → `formatter()`)

Este documento detalha o protocolo de auditoria e instrumentação em tempo de execução implementado na versão **v0.5.1** para rastrear e capturar com exatidão a estrutura bruta dos JSONs retornados pelo backend do SIGSS.

---

## 🔍 Visão Geral da Cadeia de Dados

```
1. lista() (imobiliarioFamiliar2/lista)
      │
      ▼ (Retorna rows[0] com imovPK)
2. visualizar() (imobiliarioFamiliar/visualizar)
      │
      ▼ (Retorna JSON com dados do imóvel e isadPK)
3. getIsad() (imobiliarioFamiliar/getIsad)
      │
      ▼ (Retorna JSON com areaCod, miarCod, isadNumFamiliaSiab)
4. formatter() (formatarEnumeracao)
      │
      ▼ (Gera a string final ex: "086_03_018_03")
5. pdf.js (Carimba no PDF original em memória)
```

---

## 🛠️ Etapas da Instrumentação e Rastreio no DevTools

Durante a homologação prática na UBS, cada uma das 10 etapas emite logs detalhados e estruturados no Console do DevTools:

| Etapa | Log Emitido no Console | Objetivo |
| :--- | :--- | :--- |
| **Etapa 1** | `[SIGSS] Resultado bruto da lista:` | Exibe a estrutura completa do objeto `rows[0]` retornado pela busca. |
| **Etapa 2** | `[SIGSS] imovPK.idp = ...` <br> `[SIGSS] imovPK.ids = ...` | Exibe as chaves identificadoras do imóvel extraídas da linha. |
| **Etapa 3** | `[SIGSS] POST visualizar():` | Exibe URL, Body (`imovPK.idp`, `imovPK.ids`) e Headers antes do envio. |
| **Etapa 4** | `[SIGSS] Resposta completa do visualizar() (text):` <br> `[SIGSS] JSON completo do visualizar():` | Imprime o JSON **integral** sem filtro ou mascaramento. |
| **Etapa 5** | `[SIGSS] Tentando localizar isadPK...` <br> `[SIGSS] isadPK encontrado:` | Confirma se o `isadPK` foi localizado com sucesso. |
| **Etapa 6** | `[SIGSS] Chaves de nível 1 do JSON de visualizar():` <br> `[SIGSS] Chaves do sub-objeto response['...']:` | Caso o `isadPK` não seja encontrado, lista recursivamente todas as chaves existentes no JSON. |
| **Etapa 7** | `[SIGSS] POST getIsad():` | Exibe URL, Body (`isadPK.idp`, `isadPK.ids`) e Headers da requisição `getIsad()`. |
| **Etapa 8** | `[SIGSS] JSON completo do getIsad():` | Imprime o JSON **integral** retornado por `getIsad()`. |
| **Etapa 9** | `[SIGSS] Objeto enviado ao formatter:` | Exibe o objeto `{ areaCod, miarCod, isadNumFamiliaSiab }` montado. |
| **Etapa 10** | `[SIGSS] String final produzida pelo formatter:` | Exibe o resultado final da enumeração (ex: `086_03_018_03` ou `Não encontrado`). |

---

## 🚨 Tratamento de Exceções e Captura de Erros

Se qualquer etapa falhar ou o servidor retornar respostas inesperadas, o console exibirá um objeto estruturado de erro contendo:
- **Arquivo**: `src/imovel.js`
- **Função**: Nome da função onde ocorreu o erro
- **Linha aproximada**: Linha exata da execução
- **Objeto recebido**: Parâmetros de entrada recebidos pela função
- **Erro completo**: Mensagem e stacktrace nativo da exceção

Nenhum erro é silenciosamente ignorado antes do registro completo no console.
