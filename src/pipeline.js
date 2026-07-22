console.info("[SIGSS] 15 - pipeline carregado");

import { obterCodigoSIGSS } from './utils.js';
import { pesquisarImovelEGerarEnumeracao } from './imovel.js';
import { formatarEnumeracao } from './formatter.js';
import { baixarPdf, editarPdf, abrirPdf } from './pdf.js';

export async function executarFluxoImpressao(reportUrl, windowName, windowSpecs, windowOpenOriginal) {
    console.info("[SIGSS] 16 - pipeline iniciado");
    const fnOpen = windowOpenOriginal || window.open;

    try {
        console.info("[SIGSS] 17 - obtendo código SIGSS");
        const codigoSigss = await obterCodigoSIGSS(reportUrl);

        console.info("[SIGSS] 18 - pesquisando imóvel");
        const resultadoImovel = await pesquisarImovelEGerarEnumeracao(codigoSigss);

        console.info("[SIGSS] 19 - formatando enumeração");
        const textoEnumeracao = formatarEnumeracao(resultadoImovel);

        const pdfArrayBuffer = await baixarPdf(reportUrl);

        console.info("[SIGSS] 20 - editando PDF");
        const pdfModificadoArrayBuffer = await editarPdf(pdfArrayBuffer, textoEnumeracao);

        console.info("[SIGSS] 21 - abrindo PDF");
        abrirPdf(pdfModificadoArrayBuffer, fnOpen);

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
