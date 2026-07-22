/**
 * Módulo de Manipulação de PDF em Memória - Sprint v0.4.0
 * 
 * Baixa o PDF do relatório SIGSS, adiciona a linha de enumeração no topo centralizado
 * inteiramente em memória sem salvar arquivos locais e abre a janela com o PDF modificado.
 */

/**
 * Baixa o PDF original como ArrayBuffer em memória.
 * 
 * @param {string} urlPdfOriginal 
 * @returns {Promise<ArrayBuffer>}
 */
export async function baixarPdf(urlPdfOriginal) {
    const response = await fetch(urlPdfOriginal);
    if (!response.ok) {
        throw new Error(`Falha ao baixar PDF: HTTP ${response.status}`);
    }
    return await response.arrayBuffer();
}

/**
 * Edita o PDF em memória inserindo a linha de enumeração no topo centralizado.
 * 
 * @param {ArrayBuffer} arrayBuffer - Conteúdo bruto do PDF original
 * @param {string} textoEnumeracao - String da enumeração (ex: "086_03_018_03")
 * @returns {Promise<ArrayBuffer>} ArrayBuffer do PDF modificado
 */
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

        // Inserção do texto com destaque suficiente
        primeiraPagina.drawText(textoEnumeracao, {
            x: x,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0.1, 0.4) // Azul escuro destacado para organização física
        });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes.buffer;
}

/**
 * Converte o ArrayBuffer do PDF modificado em Blob/ObjectURL em memória e abre em nova janela.
 * 
 * @param {ArrayBuffer} arrayBufferModificado 
 * @param {Function} windowOpenOriginal 
 * @returns {Window|null}
 */
export function abrirPdf(arrayBufferModificado, windowOpenOriginal) {
    const blob = new Blob([arrayBufferModificado], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    const openFn = windowOpenOriginal || window.open;
    const novaJanela = openFn(blobUrl, '_blank');

    // Descarte do ObjectURL em memória após a abertura da janela
    setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
    }, 60000);

    return novaJanela;
}
