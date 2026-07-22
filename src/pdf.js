console.info("[SIGSS] pdf carregado");

async function baixarPdf(urlPdfOriginal) {
    const response = await fetch(urlPdfOriginal);
    if (!response.ok) {
        throw new Error(`Falha ao baixar PDF: HTTP ${response.status}`);
    }
    return await response.arrayBuffer();
}

async function editarPdf(arrayBuffer, textoEnumeracao) {
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
        const x = (width - textWidth) / 2;
        const y = height - 18;

        primeiraPagina.drawText(textoEnumeracao, {
            x: x,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0.1, 0.4)
        });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes.buffer;
}

function abrirPdf(arrayBufferModificado, windowOpenOriginal) {
    const blob = new Blob([arrayBufferModificado], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    const openFn = windowOpenOriginal || (typeof window !== 'undefined' ? window.open : null);
    const novaJanela = openFn ? openFn(blobUrl, '_blank') : null;

    setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
    }, 60000);

    return novaJanela;
}

if (typeof window !== 'undefined') {
    window.baixarPdf = baixarPdf;
    window.editarPdf = editarPdf;
    window.abrirPdf = abrirPdf;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { baixarPdf, editarPdf, abrirPdf };
}
