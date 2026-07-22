console.info("[SIGSS] 15 - pipeline carregado");

import { obterCodigoSIGSS } from './utils.js';
import { pesquisarImovelEGerarEnumeracao } from './imovel.js';
import { formatarEnumeracao } from './formatter.js';
import { baixarPdf, editarPdf, abrirPdf } from './pdf.js';

export async function executarFluxoImpressao(reportUrl, windowName, windowSpecs, windowOpenOriginal) {
    console.info("[SIGSS] 16 - pipeline iniciado");
    const fnOpen = windowOpenOriginal || window.open;

    const fnObterCodigo = (typeof window !== 'undefined' && window.obterCodigoSIGSS) || obterCodigoSIGSS;
    const fnPesquisarImovel = (typeof window !== 'undefined' && window.pesquisarImovelEGerarEnumeracao) || pesquisarImovelEGerarEnumeracao;
    const fnFormatar = (typeof window !== 'undefined' && window.formatarEnumeracao) || formatarEnumeracao;
    const fnBaixarPdf = (typeof window !== 'undefined' && window.baixarPdf) || baixarPdf;
    const fnEditarPdf = (typeof window !== 'undefined' && window.editarPdf) || editarPdf;
    const fnAbrirPdf = (typeof window !== 'undefined' && window.abrirPdf) || abrirPdf;

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
