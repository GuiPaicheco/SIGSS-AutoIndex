console.info("[SIGSS] 15 - pipeline carregado");

async function executarFluxoImpressao(reportUrl, windowName, windowSpecs, windowOpenOriginal) {
    console.info("[SIGSS] 16 - pipeline iniciado");
    const fnOpen = windowOpenOriginal || window.open;

    const fnObterCodigo = (typeof window !== 'undefined' && window.obterCodigoSIGSS) || (typeof obterCodigoSIGSS !== 'undefined' ? obterCodigoSIGSS : null);
    const fnPesquisarImovel = (typeof window !== 'undefined' && window.pesquisarImovelEGerarEnumeracao) || (typeof pesquisarImovelEGerarEnumeracao !== 'undefined' ? pesquisarImovelEGerarEnumeracao : null);
    const fnFormatar = (typeof window !== 'undefined' && window.formatarEnumeracao) || (typeof formatarEnumeracao !== 'undefined' ? formatarEnumeracao : null);
    const fnBaixarPdf = (typeof window !== 'undefined' && window.baixarPdf) || (typeof baixarPdf !== 'undefined' ? baixarPdf : null);
    const fnEditarPdf = (typeof window !== 'undefined' && window.editarPdf) || (typeof editarPdf !== 'undefined' ? editarPdf : null);
    const fnAbrirPdf = (typeof window !== 'undefined' && window.abrirPdf) || (typeof abrirPdf !== 'undefined' ? abrirPdf : null);

    try {
        console.info("[SIGSS] 17 - obtendo código SIGSS");
        const codigoSigss = await fnObterCodigo(reportUrl);

        console.info("[SIGSS] 18 - pesquisando imóvel");
        const resultadoImovel = await fnPesquisarImovel(codigoSigss);

        console.info("[SIGSS] 19 - formatando enumeração");
        const textoEnumeracao = fnFormatar(resultadoImovel);

        const pdfArrayBuffer = await fnBaixarPdf(reportUrl);

        console.info("[SIGSS] 20 - editando PDF");
        const pdfModificadoArrayBuffer = await fnEditarPdf(pdfArrayBuffer, textoEnumeracao);

        console.info("[SIGSS] 21 - abrindo PDF");
        fnAbrirPdf(pdfModificadoArrayBuffer, fnOpen);

        console.info("[SIGSS] 22 - pipeline concluído");

    } catch (erro) {
        console.error('[SIGSS] Erro no pipeline:', erro);
        try {
            fnOpen(reportUrl, windowName || '_blank', windowSpecs);
        } catch (eFallback) {
            console.error('[SIGSS] Erro no fallback:', eFallback);
        }
    }
}

if (typeof window !== 'undefined') {
    window.executarFluxoImpressao = executarFluxoImpressao;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { executarFluxoImpressao };
}
