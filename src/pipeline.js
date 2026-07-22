import { obterCodigoSIGSS } from './utils.js';
import { pesquisarImovelEGerarEnumeracao } from './imovel.js';
import { formatarEnumeracao } from './formatter.js';
import { baixarPdf, editarPdf, abrirPdf } from './pdf.js';

/**
 * Pipeline de Impressão Inteligente - Sprint v0.4.0
 * 
 * Módulo Orquestrador Único: Responsável por conectar todos os componentes
 * de forma isolada, controlando a sequência do processamento de impressão em memória.
 */

/**
 * Executa o fluxo completo do Pipeline Inteligente de Impressão.
 * 
 * Sequência Obrigatória:
 * Interceptação -> Receber URL do PDF -> Obter Código SIGSS -> Pesquisar Imóvel -> Gerar Enumeração -> Baixar PDF -> Editar PDF -> Abrir PDF Modificado
 * 
 * @param {string} reportUrl - URL do relatório PDF retornado pelo SIGSS
 * @param {string} [windowName='_blank'] - Nome da janela para window.open
 * @param {string} [windowSpecs=''] - Especificações para window.open
 * @param {Function} [windowOpenOriginal=window.open] - Referência da função window.open original
 */
export async function executarFluxoImpressao(reportUrl, windowName, windowSpecs, windowOpenOriginal) {
    const fnOpen = windowOpenOriginal || window.open;

    try {
        console.log('[SIGSS-AutoIndex] Iniciando Pipeline de Impressão Inteligente...');

        // 1. Obter Código SIGSS (Input da tela -> Documento/PDF)
        const codigoSigss = await obterCodigoSIGSS(reportUrl);
        console.log('[SIGSS-AutoIndex] Código SIGSS:', codigoSigss);

        // 2. Pesquisar imóvel e obter dados do domicílio
        const resultadoImovel = await pesquisarImovelEGerarEnumeracao(codigoSigss);
        
        // 3. Formatar a string de enumeração oficial
        const textoEnumeracao = formatarEnumeracao(resultadoImovel);
        console.log('[SIGSS-AutoIndex] Enumeração gerada:', textoEnumeracao);

        // 4. Baixar o PDF original em memória
        const pdfArrayBuffer = await baixarPdf(reportUrl);

        // 5. Editar o PDF em memória (inserir enumeração no topo centralizado)
        const pdfModificadoArrayBuffer = await editarPdf(pdfArrayBuffer, textoEnumeracao);

        // 6. Abrir o PDF modificado em memória
        abrirPdf(pdfModificadoArrayBuffer, fnOpen);
        console.log('[SIGSS-AutoIndex] PDF modificado aberto com sucesso em memória.');

    } catch (erro) {
        console.error('[SIGSS-AutoIndex] Falha no pipeline. Ativando fallback para PDF original:', erro);
        
        // REQUISITO CRÍTICO: Em qualquer falha, o PDF original é aberto automaticamente sem prejudicar o médico
        try {
            fnOpen(reportUrl, windowName || '_blank', windowSpecs);
        } catch (eFallback) {
            console.error('[SIGSS-AutoIndex] Erro no fallback de abertura:', eFallback);
        }
    }
}
