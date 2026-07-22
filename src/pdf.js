import { Logger } from './logger.js';

/**
 * Módulo de Manipulação de PDF em Memória - SIGSS-AutoIndex (v0.4.1)
 * 
 * Baixa o PDF do relatório SIGSS, adiciona a linha de enumeração no topo centralizado
 * inteiramente em memória sem salvar arquivos locais e abre a janela com o PDF modificado.
 */

export async function baixarPdf(urlPdfOriginal) {
    const response = await fetch(urlPdfOriginal);
    if (!response.ok) {
        throw new Error(`Falha ao baixar PDF: HTTP ${response.status}`);
    }
    return await response.arrayBuffer();
}

export async function editarPdf(arrayBuffer, textoEnumeracao) {
    const pdfLib = (typeof window !== 'undefined' && window.PDFLib) || (typeof global !== 'undefined' && global.PDFLib);
    if (!pdfLib) {
        throw new Error('Biblioteca pdf-lib não carregada no contexto.');
    }

    const { PDFDocument, rgb, StandardFonts } = pdfLib;
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();
    if (pages.length > 0) {
        const primeiraPagina = pages[0];
        const { width, height } = primeiraPagina.getSize();

        const fontSize = 12;
        const textWidth = font.widthOfTextAtSize(textoEnumeracao, fontSize);
        const x = (width - textWidth) / 2; // Centralizado horizontalmente
        const y = height - 18; // Topo da página, acima do cabeçalho original

        primeiraPagina.drawText(textoEnumeracao, {
            x: x,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0.1, 0.4) // Azul escuro destacado
        });
        Logger.debug(`Texto "${textoEnumeracao}" desenhado no PDF na posição x=${x.toFixed(1)}, y=${y.toFixed(1)}.`);
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes.buffer;
}

export function abrirPdf(arrayBufferModificado, windowOpenOriginal) {
    const blob = new Blob([arrayBufferModificado], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    const openFn = windowOpenOriginal || (typeof window !== 'undefined' ? window.open : null);
    const novaJanela = openFn ? openFn(blobUrl, '_blank') : null;

    // Descarte do ObjectURL em memória após 60 segundos
    setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        Logger.debug('ObjectURL revogado da memória:', blobUrl);
    }, 60000);

    return novaJanela;
}
