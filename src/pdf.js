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
 * Baixa o documento PDF original do servidor SIGSS em memória.
 *
 * @param {string} urlPdfOriginal URL do relatório PDF
 * @returns {Promise<ArrayBuffer>} ArrayBuffer contendo os bytes do PDF
 */
async function baixarPdf(urlPdfOriginal) {
    const response = await fetch(urlPdfOriginal);
    if (!response.ok) {
        throw new Error(`Falha ao baixar PDF: HTTP ${response.status}`);
    }
    return await response.arrayBuffer();
}

/**
 * Edita o documento PDF em memória, carimbando a string de enumeração no topo centralizado da 1ª página.
 *
 * @param {ArrayBuffer} arrayBuffer ArrayBuffer do PDF original
 * @param {string} textoEnumeracao String de enumeração a ser gravada
 * @returns {Promise<ArrayBuffer>} ArrayBuffer do PDF modificado
 */
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

/**
 * Abre a janela do navegador exibindo o PDF modificado a partir de uma Blob URL temporária.
 *
 * @param {ArrayBuffer} arrayBufferModificado ArrayBuffer do PDF editado
 * @param {Function} windowOpenOriginal Referência da função window.open original
 * @returns {Window|null} Objeto da janela aberta
 */
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
