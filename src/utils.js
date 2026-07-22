import { SELETORES_INPUT_SIGSS } from './constants.js';

/**
 * Módulo de Utilitários - Sprint v0.2.0
 * 
 * Responsável exclusivamente pela obtenção do Código SIGSS.
 */

/**
 * Obtém o Código SIGSS a ser utilizado como chave única de busca.
 * 
 * Ordem obrigatória de prioridade:
 * PRIORIDADE 1: Ler diretamente do campo INPUT existente na tela do SIGSS.
 * PRIORIDADE 2: Ler através do documento/PDF (caso o input não exista ou esteja vazio).
 * 
 * @param {string|null} [urlReport=null] - URL do relatório PDF retornado pelo SIGSS
 * @returns {Promise<string|null>} Retorna estritamente uma string (ex: "82828-1") ou null em caso de falha.
 */
export async function obterCodigoSIGSS(urlReport = null) {
    try {
        // PRIORIDADE 1: Leitura do campo INPUT da tela do SIGSS
        const codigoDoInput = lerCodigoDoInputTela();
        if (codigoDoInput) {
            return codigoDoInput;
        }

        // PRIORIDADE 2: Leitura do Documento/PDF (somente se input não forneceu valor)
        if (urlReport) {
            const codigoDoPdf = await lerCodigoDoDocumentoPdf(urlReport);
            if (codigoDoPdf) {
                return codigoDoPdf;
            }
        }

        // Retorna null caso nenhum código seja localizado em ambas as tentativas
        return null;
    } catch (erro) {
        console.error('[SIGSS+] Erro silencioso durante obtenção do Código SIGSS:', erro);
        return null;
    }
}

/**
 * Busca o valor do campo input na DOM da tela de impressão do SIGSS.
 * Utiliza os seletores centralizados em constants.js.
 * 
 * @returns {string|null}
 */
function lerCodigoDoInputTela() {
    try {
        for (const seletor of SELETORES_INPUT_SIGSS) {
            const elemento = document.querySelector(seletor);
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
 * Baixa e analisa o documento PDF para extrair o Código SIGSS via expressão regular.
 * 
 * @param {string} urlReport 
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

        // Busca por padrões numéricos típicos do Código SIGSS ou FAA no texto do PDF
        // Exemplos: 82828-1, Prontuário: 82828-1, Código SIGSS: 82828
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
