/**
 * SIGSS-AutoIndex
 *
 * Sistema de enumeração automática de prontuários (FAA)
 * para o SIGSS da Prefeitura Municipal de Betim.
 *
 * Desenvolvido por:
 * Guilherme Paicheco Ferreira
 *
 * Projeto iniciado em 2026.
 *
 * Versão:
 * 1.0.0
 *
 * Licença:
 * MIT
 */

/**
 * Orquestrador principal do Pipeline Inteligente de Impressão.
 * Sequencia as chamadas de obtenção do Código SIGSS, busca cadastral do imóvel,
 * formatação da enumeração, edição do PDF em memória e exibição ao usuário.
 * Em caso de falha em qualquer etapa, dispara a política de fallback abrindo o PDF original.
 *
 * @param {string} reportUrl URL do relatório PDF do SIGSS
 * @param {string} windowName Nome da janela de destino
 * @param {string} windowSpecs Especificações da janela
 * @param {Function} windowOpenOriginal Referência da função window.open nativa
 */
async function executarFluxoImpressao(reportUrl, windowName, windowSpecs, windowOpenOriginal) {
    const logger = (typeof window !== 'undefined' && window.Logger) || null;
    if (logger) {
        logger.info('Pipeline de impressão iniciado:', reportUrl);
    }

    const fnOpen = windowOpenOriginal || window.open;

    const fnObterCodigo = (typeof window !== 'undefined' && window.obterCodigoSIGSS) || (typeof obterCodigoSIGSS !== 'undefined' ? obterCodigoSIGSS : null);
    const fnPesquisarImovel = (typeof window !== 'undefined' && window.pesquisarImovelEGerarEnumeracao) || (typeof pesquisarImovelEGerarEnumeracao !== 'undefined' ? pesquisarImovelEGerarEnumeracao : null);
    const fnFormatar = (typeof window !== 'undefined' && window.formatarEnumeracao) || (typeof formatarEnumeracao !== 'undefined' ? formatarEnumeracao : null);
    const fnBaixarPdf = (typeof window !== 'undefined' && window.baixarPdf) || (typeof baixarPdf !== 'undefined' ? baixarPdf : null);
    const fnEditarPdf = (typeof window !== 'undefined' && window.editarPdf) || (typeof editarPdf !== 'undefined' ? editarPdf : null);
    const fnAbrirPdf = (typeof window !== 'undefined' && window.abrirPdf) || (typeof abrirPdf !== 'undefined' ? abrirPdf : null);

    try {
        const codigoSigss = await fnObterCodigo(reportUrl);
        const resultadoImovel = await fnPesquisarImovel(codigoSigss);
        const textoEnumeracao = fnFormatar(resultadoImovel);

        const pdfArrayBuffer = await fnBaixarPdf(reportUrl);
        const pdfModificadoArrayBuffer = await fnEditarPdf(pdfArrayBuffer, textoEnumeracao);

        fnAbrirPdf(pdfModificadoArrayBuffer, fnOpen);

        if (logger) {
            logger.info('Pipeline concluído com sucesso. Enumeração gravada:', textoEnumeracao);
        }

    } catch (erro) {
        if (logger) {
            logger.error('Falha no pipeline. Ativando fallback para PDF original:', erro);
        }
        try {
            fnOpen(reportUrl, windowName || '_blank', windowSpecs);
        } catch (eFallback) {
            if (logger) {
                logger.error('Erro ao executar fallback:', eFallback);
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.executarFluxoImpressao = executarFluxoImpressao;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { executarFluxoImpressao };
}
