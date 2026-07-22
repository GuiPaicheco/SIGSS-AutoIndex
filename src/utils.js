import { SELETORES_INPUT_SIGSS } from './constants.js';
import { Logger } from './logger.js';

/**
 * Módulo de Utilitários - SIGSS-AutoIndex (v0.4.1)
 * 
 * Responsável pela obtenção do Código SIGSS (Prioridade 1: Input -> Prioridade 2: Documento/PDF).
 */

/**
 * Obtém o Código SIGSS a ser utilizado como chave única de busca.
 * 
 * @param {string|null} [urlReport=null] 
 * @returns {Promise<string|null>}
 */
export async function obterCodigoSIGSS(urlReport = null) {
    try {
        // PRIORIDADE 1: Leitura do campo INPUT da tela do SIGSS
        const codigoDoInput = lerCodigoDoInputTela();
        if (codigoDoInput) {
            Logger.debug('Código SIGSS obtido via Input da tela:', codigoDoInput);
            return codigoDoInput;
        }

        // PRIORIDADE 2: Leitura do Documento/PDF (somente se input não forneceu valor)
        if (urlReport) {
            Logger.debug('Input vazio/ausente. Tentando extração do Código SIGSS via PDF...');
            const codigoDoPdf = await lerCodigoDoDocumentoPdf(urlReport);
            if (codigoDoPdf) {
                Logger.debug('Código SIGSS obtido via parse do PDF:', codigoDoPdf);
                return codigoDoPdf;
            }
        }

        Logger.debug('Nenhum Código SIGSS localizado.');
        return null;
    } catch (erro) {
        Logger.error('Erro silencioso durante obtenção do Código SIGSS:', erro);
        return null;
    }
}

function lerCodigoDoInputTela() {
    try {
        const doc = typeof document !== 'undefined' ? document : null;
        if (!doc) return null;

        for (const seletor of SELETORES_INPUT_SIGSS) {
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
