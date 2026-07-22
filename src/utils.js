console.info("[SIGSS] utils carregado");

import { SELETORES_INPUT_SIGSS } from './constants.js';

export async function obterCodigoSIGSS(urlReport = null) {
    try {
        const codigoDoInput = lerCodigoDoInputTela();
        if (codigoDoInput) {
            return codigoDoInput;
        }

        if (urlReport) {
            const codigoDoPdf = await lerCodigoDoDocumentoPdf(urlReport);
            if (codigoDoPdf) {
                return codigoDoPdf;
            }
        }

        return null;
    } catch (erro) {
        console.error('[SIGSS] Erro em obterCodigoSIGSS:', erro);
        return null;
    }
}

function lerCodigoDoInputTela() {
    try {
        const doc = typeof document !== 'undefined' ? document : null;
        if (!doc) return null;

        const seletores = (typeof window !== 'undefined' && window.SELETORES_INPUT_SIGSS) || SELETORES_INPUT_SIGSS;

        for (const seletor of seletores) {
            const elemento = doc.querySelector(seletor);
            if (elemento && typeof elemento.value === 'string') {
                const valorTratado = elemento.value.trim();
                if (valorTratado.length > 0) {
                    return valorTratado;
                }
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function lerCodigoDoDocumentoPdf(urlReport) {
    try {
        const response = await fetch(urlReport);
        if (!response.ok) {
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const textoDecodificado = new TextDecoder('iso-8859-1').decode(arrayBuffer);

        const padroes = [
            /(?:código\s*sigss|cod\.?\s*sigss|prontuário|faa|isenCod)[\s:]*([0-9]{4,10}(?:-[0-9]{1,2})?)/i,
            /\b([0-9]{5,10}-[0-9]{1,2})\b/,
            /\b([0-9]{5,10})\b/
        ];

        for (const regex of padroes) {
            const match = textoDecodificado.match(regex);
            if (match && match[1]) {
                const codigoEncontrado = match[1].trim();
                if (codigoEncontrado.length > 0) {
                    return codigoEncontrado;
                }
            }
        }

        return null;
    } catch (e) {
        return null;
    }
}

if (typeof window !== 'undefined') {
    window.obterCodigoSIGSS = obterCodigoSIGSS;
}
