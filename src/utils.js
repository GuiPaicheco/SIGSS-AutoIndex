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
 * Obtém o Código SIGSS utilizando política de prioridade estrita:
 * Prioridade 1: Leitura do valor no input da tela do SIGSS.
 * Prioridade 2: Extração via regex no documento PDF baixado.
 *
 * @param {string|null} urlReport URL opcional do relatório PDF
 * @returns {Promise<string|null>} Código SIGSS localizado ou null
 */
async function obterCodigoSIGSS(urlReport = null) {
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
        const logger = (typeof window !== 'undefined' && window.Logger) || null;
        if (logger) {
            logger.error('Erro em obterCodigoSIGSS:', erro);
        }
        return null;
    }
}

/**
 * Lê o Código SIGSS do input ativo na tela do navegador (Prioridade 1).
 *
 * @returns {string|null}
 */
function lerCodigoDoInputTela() {
    try {
        const doc = typeof document !== 'undefined' ? document : null;
        if (!doc) return null;

        const seletores = (typeof window !== 'undefined' && window.SELETORES_INPUT_SIGSS) || [
            'input[name*="codigoSigss"]',
            'input[name*="codSigss"]',
            'input[id*="codigoSigss"]',
            'input[id*="codSigss"]',
            'input[name*="isenCod"]',
            'input[id*="isenCod"]',
            'input[name*="prontuario"]',
            'input[id*="prontuario"]',
            'input[name*="codigoFaa"]',
            'input[id*="codigoFaa"]',
            '#codigoSigss',
            '#codSigss',
            '#isenCod',
            '#prontuario'
        ];

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

/**
 * Extrai o Código SIGSS analisando o stream de texto do relatório PDF (Prioridade 2).
 *
 * @param {string} urlReport URL do relatório PDF
 * @returns {Promise<string|null>}
 */
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { obterCodigoSIGSS };
}
