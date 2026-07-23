# Auditoria Completa da Cadeia Imobiliária (`visualizar()` → `getIsad()` → `formatter()`) — v1.0.0

Este documento detalha a estrutura de resolução e navegação nos retornos do backend SIGSS para extração do `isadPK` e obtenção dos dados cadastrais do imóvel.

---

## 🔍 Visão Geral da Cadeia de Dados

```
1. lista() (imobiliarioFamiliar2/lista)
      │
      ▼ (Retorna rows[0] com imovPK)
2. visualizar() (imobiliarioFamiliar/visualizar)
      │
      ▼ (Retorna JSON contendo imov.domicilioList.informacaoDomicilioList.isadPK)
3. getIsad() (imobiliarioFamiliar/getIsad)
      │
      ▼ (Retorna JSON envelopado em response.isad: area.areaCod, microArea.miarCod, isadNumFamiliaSiab)
4. formatter() (formatarEnumeracao)
      │
      ▼ (Gera a string final oficial ex: "086_03_018_03")
5. pdf.js (Carimba no PDF original via pdf-lib em memória)
```

---

## 🛠️ Resolução das Estruturas JSON Nativas do SIGSS

- **Cadeia `visualizar()`**: Extração com suporte a envelopamento direto (`data.isadPK`), hierárquico (`data.imov.isadPK`) ou navegar no domicílio (`data.imov.domicilioList.informacaoDomicilioList.isadPK`).
- **Cadeia `getIsad()`**: Extração com leitura primária de `response.isad` (`response.isad.area.areaCod`, `response.isad.microArea.miarCod`, `response.isad.isadNumFamiliaSiab`).
- **Normalização no Formatador**: O módulo `formatter.js` converte códigos de área (ex: `"0086"` para `"086"`) mantendo a separação estrita de responsabilidades entre consulta HTTP e formatação visual.

---

## 🚨 Tratamento de Exceções e Captura de Erros

Se qualquer etapa falhar ou o servidor retornar respostas inesperadas, o módulo de logging (`Logger.error`) captura e registra o objeto estruturado de erro contendo:
- **Arquivo**: `src/imovel.js`
- **Função**: Nome da função onde ocorreu o erro
- **Linha aproximada**: Linha exata da execução
- **Objeto recebido**: Parâmetros de entrada recebidos pela função
- **Erro completo**: Mensagem e stacktrace nativo da exceção
