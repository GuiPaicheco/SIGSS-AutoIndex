import { obterCodigoSigss } from './utils.js';
import { pesquisarImovelEGerarEnumeracao } from './imovel.js';
import { processarEExibirPdf } from './pdf.js';

/**
 * Módulo Principal (Orquestrador do SIGSS+)
 * 
 * Conecta a interceptação do fluxo de impressão às etapas de busca de imóvel,
 * geração da enumeração e renderização do PDF modificado em memória.
 */
export function inicializarSigssPlus() {
    if (typeof window.__SIGSS_PLUS_REGISTRAR_HANDLER__ === 'function') {
        window.__SIGSS_PLUS_REGISTRAR_HANDLER__(executarFluxoImpressao);
        console.log('[SIGSS+] Módulo principal ativado.');
    }
}

/**
 * Fluxo executado quando o médico clica em imprimir e a resposta do relatório é recebida.
 * 
 * Flow:
 * SIGSS -> POST atendimentoConsulta/imprimirFAA -> Receber json.report -> Obter Código SIGSS -> Pesquisar imóvel -> Gerar enumeração -> Inserir enumeração no PDF -> Abrir PDF modificado
 * 
 * @param {string} urlReport 
 * @param {string} windowName 
 * @param {string} windowSpecs 
 * @param {Function} windowOpenOriginal 
 */
async function executarFluxoImpressao(urlReport, windowName, windowSpecs, windowOpenOriginal) {
    try {
        console.log('[SIGSS+] Iniciando fluxo de automação transparente...');

        // 1. Obter Código SIGSS (Prontuário ou campo input da tela)
        const codigoSigss = obterCodigoSigss();
        console.log('[SIGSS+] Código SIGSS identificado:', codigoSigss);

        // 2. Pesquisar imóvel e gerar a linha de enumeração
        const enumeracao = await pesquisarImovelEGerarEnumeracao(codigoSigss);
        console.log('[SIGSS+] Enumeração gerada:', enumeracao);

        // 3. Baixar PDF, inserir enumeração no topo centralizado em memória e abrir PDF modificado
        await processarEExibirPdf(urlReport, enumeracao, windowOpenOriginal);

    } catch (erro) {
        console.error('[SIGSS+] Erro no fluxo de automação. Executando fallback:', erro);
        // Em caso de qualquer imprevisto, garante que o PDF original é aberto normalmente
        windowOpenOriginal(urlReport, windowName || '_blank', windowSpecs);
    }
}

// Inicializa a extensão
inicializarSigssPlus();
