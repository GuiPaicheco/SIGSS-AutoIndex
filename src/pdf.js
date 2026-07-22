/**
 * Módulo de Manipulação de PDF em Memória
 * 
 * Baixa o PDF original do relatório SIGSS, adiciona a linha de enumeração no topo centralizado
 * inteiramente em memória sem salvar ou sobrescrever nenhum arquivo local, e abre o PDF modificado.
 */

/**
 * Baixa o PDF original, adiciona o texto de enumeração no topo da página e abre a nova janela.
 * 
 * @param {string} urlPdfOriginal - URL do relatório PDF retornado pelo SIGSS
 * @param {string} textoEnumeracao - Texto a ser inserido (ex: "086_03_018_03" ou "Não encontrado em imóvel")
 * @param {Function} windowOpenOriginal - Função window.open original
 */
export async function processarEExibirPdf(urlPdfOriginal, textoEnumeracao, windowOpenOriginal) {
    try {
        // 1. Baixar o PDF original para ArrayBuffer em memória
        const response = await fetch(urlPdfOriginal);
        if (!response.ok) {
            throw new Error(`Falha ao baixar PDF original: HTTP ${response.status}`);
        }
        const pdfArrayBuffer = await response.arrayBuffer();

        // 2. Modificar o PDF em memória (usando pdf-lib se disponível, ou fallback de injeção)
        let pdfModificadoArrayBuffer = pdfArrayBuffer;

        if (window.PDFLib) {
            pdfModificadoArrayBuffer = await adicionarEnumeracaoPdfLib(pdfArrayBuffer, textoEnumeracao);
        }

        // 3. Criar Blob e ObjectURL em memória
        const blob = new Blob([pdfModificadoArrayBuffer], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        // 4. Abrir PDF modificado na janela do navegador
        const novaJanela = windowOpenOriginal(blobUrl, '_blank');

        // 5. Agendar descarte do ObjectURL da memória após abertura
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 60000);

        return novaJanela;

    } catch (erro) {
        console.error('[SIGSS+] Erro ao processar PDF em memória:', erro);
        // Fallback: abre o PDF original se houver falha
        return windowOpenOriginal(urlPdfOriginal, '_blank');
    }
}

/**
 * Adiciona a enumeração no topo centralizado da página utilizando a biblioteca pdf-lib
 * 
 * @param {ArrayBuffer} arrayBuffer 
 * @param {string} texto 
 * @returns {Promise<ArrayBuffer>}
 */
async function adicionarEnumeracaoPdfLib(arrayBuffer, texto) {
    const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();
    if (pages.length > 0) {
        const primeiraPagina = pages[0];
        const { width, height } = primeiraPagina.getSize();
        
        const fontSize = 11;
        const textWidth = font.widthOfTextAtSize(texto, fontSize);
        const x = (width - textWidth) / 2; // Centralizado
        const y = height - 18; // Topo da página, acima do cabeçalho original

        primeiraPagina.drawText(texto, {
            x: x,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0)
        });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes.buffer;
}
