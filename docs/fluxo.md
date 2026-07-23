# Fluxo do Pipeline de Impressão Inteligente — SIGSS-AutoIndex (v1.0.0)

Este documento detalha o fluxo passo a passo executado pelo **SIGSS-AutoIndex** durante a impressão de um prontuário (FAA).

---

## 🔁 Fluxo Completo de Execução

```
1. Profissional de Saúde clica no botão "Imprimir" no SIGSS
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
   │        ├── Executa 13 consultas simultâneas em paralelo (Promise.all) por microárea
   │        ├── Se 0 encontrados ──► Retorna "Não encontrado em imóvel"
   │        ├── Se >= 2 encontrados ──► Retorna "Múltiplos imóveis encontrados"
   │        └── Se 1 encontrado ──► Executa POST imobiliarioFamiliar/visualizar (imovPK)
   │                 └── Executa POST imobiliarioFamiliar/getIsad (isadPK) -> extrai atributos
   │
   ├── 5.3. formatarEnumeracao(dadosImovel)
   │        └── Transforma atributos na string oficial ex: "086_03_018_03"
   │
   ├── 5.4. baixarPdf(reportUrl)
   │        └── Baixa os bytes do PDF original para um ArrayBuffer em memória.
   │
   ├── 5.5. editarPdf(pdfArrayBuffer, textoEnumeracao)
   │        └── Carimba 1 linha centralizada no topo da 1ª página via pdf-lib em memória.
   │
   └── 5.6. abrirPdf(pdfModificadoArrayBuffer, windowOpenOriginal)
            └── Cria Blob URL temporária e abre a janela de impressão no navegador.
```

---

## 🛡️ Fluxo de Tratamento de Falhas (Fallback Garantido)

Se **qualquer exceção ou erro de rede** ocorrer durante os passos 5.1 a 5.6:

```
                  Exceção / Erro Detectado
                             │
                             ▼
               Captura no bloco try...catch
                             │
                             ▼
         Registro de erro no Logger (se DEBUG_MODE = true)
                             │
                             ▼
    Execução imediata de windowOpenOriginal(reportUrl, '_blank')
                             │
                             ▼
     PDF original sem alterações é aberto normalmente para o médico
```

O profissional de saúde **nunca** é bloqueado e a impressão do prontuário prossegue sem interrupção do atendimento público.
