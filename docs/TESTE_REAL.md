# Guia de Homologação e Teste Real em UBS — SIGSS-AutoIndex (v1.0.0)

Este documento orienta a equipe de saúde e TI sobre como realizar o teste funcional do **SIGSS-AutoIndex** no ambiente real de produção do SIGSS em uma Unidade Básica de Saúde (UBS) da Prefeitura de Betim.

---

## 🎯 Objetivo do Teste Real

Validar que a extensão executa a enumeração automática no topo do prontuário (FAA) de forma **100% transparente**, sem alterar o fluxo do médico, sem adicionar botões na tela e garantindo o fallback imediato para o PDF original caso ocorra qualquer indisponibilidade de rede ou cadastro.

---

## 📋 Checklist de Homologação em Campo

Utilize o checklist abaixo durante o teste prático no computador da UBS:

- [ ] **1. Instalar extensão**:
  - Acessar `chrome://extensions/` no Google Chrome.
  - Ativar o **Modo do desenvolvedor** (canto superior direito).
  - Clicar em **Carregar sem compactação** (*Load unpacked*) e selecionar a pasta raiz do `SIGSS-AutoIndex`.
- [ ] **2. Abrir SIGSS**:
  - Acessar o sistema SIGSS normalmente no navegador.
- [ ] **3. Abrir atendimento**:
  - Iniciar o atendimento médico/ambulatorial de um paciente teste.
- [ ] **4. Imprimir FAA**:
  - Concluir o atendimento e clicar no botão habitual de impressão da FAA (`imprimirFaaSemPin`).
- [ ] **5. Conferir enumeração**:
  - Verificar se a linha de enumeração no formato `CódigoEquipe_Micro_NúmeroFamília_SufixoEquipe` (ex: `086_03_018_03`) foi gerada.
- [ ] **6. Conferir posição**:
  - Confirmar se a enumeração aparece **no topo da primeira página, centralizada horizontalmente**, sem sobrepor a logomarca ou cabeçalho original do SIGSS.
- [ ] **7. Conferir impressão**:
  - Enviar o documento para a impressora física da unidade e confirmar se a enumeração está visível e legível no papel impresso.
- [ ] **8. Conferir fallback**:
  - Testar a impressão de um paciente sem cadastro de imóvel e confirmar que o PDF original abre normalmente exibindo `"Não encontrado em imóvel"`, sem travar a tela do médico.
- [ ] **9. Conferir console**:
  - Pressionar `F12` no Chrome, ativar `DEBUG_MODE = true` em `src/constants.js` (se desejado) e verificar os logs com o prefixo `[SIGSS-AutoIndex]`.
- [ ] **10. Conferir tempo**:
  - Garantir que o tempo total entre o clique em "Imprimir" e a exibição do PDF seja imperceptível (abaixo de 200 milissegundos).
