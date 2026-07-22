# Fluxo do Pipeline de Impressão Inteligente - SIGSS-AutoIndex

Este documento detalha o fluxo passo a passo executado pelo **SIGSS-AutoIndex** durante a impressão de um prontuário (FAA).

---

## 🔁 Fluxo Completo de Execução

```
1. Médicos clicam no botão "Imprimir" no SIGSS
                    │
                    ▼
2. SIGSS dispara requisição: POST atendimentoConsulta/imprimirFAA
                    │
                    ▼
3. interceptor.js captura a resposta JSON contendo reportUrl
                    │
                    ▼
4. window.open é interceptado pelo SIGSS-AutoIndex (retorna null para a página)
                    │
                    ▼
5. pipeline.js assume a execução em background:
   │
   ├── 5.1. obterCodigoSIGSS(reportUrl)
   │        ├── Prioridade 1: Tenta ler o input HTML na DOM da tela.
   │        └── Prioridade 2: Baixa bytes do PDF e aplica regex (se input estiver vazio).
   │
   ├── 5.2. pesquisarImovelEGerarEnumeracao(codigoSigss)
   │        ├── GET imobiliarioFamiliar2/lista?searchField=isen.isenCod&searchString=<codigo>
   │        ├── POST imobiliarioFamiliar/visualizar (com imovPK.idp/ids) -> extrai isadPK
   │        └── POST imobiliarioFamiliar/getIsad (com isadPK.idp/ids) -> extrai areaCod, miarCod, familia
   │
   ├── 5.3. formatarEnumeracao(dadosImovel)
   │        └── Transforma dados em string ex: "086_03_018_03"
   │
   ├── 5.4. baixarPdf(reportUrl)
   │        └── Baixa o PDF original para um ArrayBuffer em memória.
   │
   ├── 5.5. editarPdf(pdfArrayBuffer, textoEnumeracao)
   │        └── Insere 1 linha no topo centralizado via pdf-lib.
   │
   └── 5.6. abrirPdf(pdfModificadoArrayBuffer, windowOpenOriginal)
            └── Cria Blob/ObjectURL e abre em nova janela do navegador.
```

---

## 🛡️ Fluxo de Tratamento de Falhas (Fallback)

Se **qualquer exceção ou erro de rede** ocorrer durante os passos 5.1 a 5.6:

```
                  Exceção / Erro Detectado
                             │
                             ▼
               Captura no bloco try...catch
                             │
                             ▼
         Registro silencioso no console.error do navegador
                             │
                             ▼
    Execução imediata de windowOpenOriginal(reportUrl, '_blank')
                             │
                             ▼
     PDF original sem alterações é aberto normalmente para o médico
```

O médico **nunca** percebe a falha e o trabalho de atendimento prossegue sem interrupções.
