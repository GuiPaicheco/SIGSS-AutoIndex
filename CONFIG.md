# Guia de Configuração e Adaptação — CONFIG.md (v1.0.0)

O arquivo `src/constants.js` centraliza todas as configurações, URLs de endpoints, seletores HTML e tabelas de mapeamento de equipes da extensão **SIGSS-AutoIndex**.

---

## ⚙️ Constantes Configuráveis (`src/constants.js`)

### 1. Endpoints do SIGSS (`ENDPOINTS`)
Mapeamento dos servlets e endpoints do backend do SIGSS:

```javascript
const ENDPOINTS = {
    IMPRIMIR_FAA: 'atendimentoConsulta/imprimirFAA',
    LISTA_IMOVEL: 'imobiliarioFamiliar2/lista',
    VISUALIZAR_IMOVEL: 'imobiliarioFamiliar/visualizar',
    GET_ISAD: 'imobiliarioFamiliar/getIsad'
};
```

### 2. Seletores HTML do Código SIGSS (`SELETORES_INPUT_SIGSS`)
Lista de seletores CSS utilizados para capturar o Código SIGSS da tela de impressão:

```javascript
const SELETORES_INPUT_SIGSS = [
    'input[name*="codigoSigss"]',
    'input[name*="codSigss"]',
    'input[id*="codigoSigss"]',
    'input[id*="codSigss"]',
    'input[name*="isenCod"]',
    'input[id*="isenCod"]',
    'input[name*="prontuario"]',
    'input[id*="prontuario"]',
    '#codigoSigss',
    '#codSigss',
    '#isenCod',
    '#prontuario'
];
```
> **Dica de Manutenção**: Se a Prefeitura de Betim ou o SIGSS alterarem o `id` ou `name` do campo de prontuário, adicione o novo seletor a este array. Não é necessário alterar nenhum outro arquivo.

---

## 🏛️ Tabela de Mapeamento de Equipes (`EQUIPES_CONFIG` / `MAPEAMENTO_EQUIPES`)

Associa os códigos das Equipes ESF e microáreas aos seus sufixos numéricos para geração da enumeração:

```javascript
const MAPEAMENTO_EQUIPES = {
    '085': '01',
    '086': '03',
    '087': '02',
    '0085': '01',
    '0086': '03',
    '0087': '02'
};
```

---

## 🔄 Adaptação para Outras UBS ou Municípios

Para adaptar o **SIGSS-AutoIndex** para outras Unidades Básicas de Saúde (UBS):

1. **Adicionar/Editar Equipes**: Edite o objeto `EQUIPES_CONFIG` e `MAPEAMENTO_EQUIPES` em `src/constants.js` inserindo os novos códigos de ESF, microáreas e seus respectivos números de equipe.
2. **Atualizar Domínio no Manifest**: No `manifest.json`, ajuste o campo `matches` para incluir o domínio da nova prefeitura ou servidor local.
