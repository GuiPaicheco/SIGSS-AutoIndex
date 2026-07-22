/**
 * Módulo de Utilitários
 * 
 * Responsável por auxiliar na obtenção do Código SIGSS e utilitários auxiliares.
 */

/**
 * Obtém o Código SIGSS a ser utilizado como chave única de busca.
 * 
 * Estratégia de Prioridade:
 * 1. Ler o Código SIGSS presente no próprio prontuário (quando disponível no texto/PDF).
 * 2. Ler o código presente no campo input da tela de impressão.
 * 
 * @param {string} [pdfTexto] - Texto extraído do PDF (opcional)
 * @returns {string|null} Código SIGSS ou null se não localizado
 */
export function obterCodigoSigss(pdfTexto = null) {
    // 1. Tentar extrair do texto do prontuário (se fornecido)
    if (pdfTexto) {
        const codigoDoPdf = extrairCodigoDoTextoPdf(pdfTexto);
        if (codigoDoPdf) {
            return codigoDoPdf;
        }
    }

    // 2. Tentar obter do input da tela de impressão
    const codigoDoInput = obterCodigoDoInputTela();
    if (codigoDoInput) {
        return codigoDoInput;
    }

    return null;
}

/**
 * Extrai o Código SIGSS a partir de um padrão Regex no texto do PDF
 * @param {string} texto 
 * @returns {string|null}
 */
function extrairCodigoDoTextoPdf(texto) {
    if (!texto) return null;
    // Exemplo de padrão: Código SIGSS ou Prontuário N: XXXXXX
    const match = texto.match(/(?:código|cod\.?|prontuário|faa)[\s:]*([0-9]{4,12})/i);
    return match ? match[1].trim() : null;
}

/**
 * Busca o valor do campo input correspondente na DOM da tela de impressão
 * @returns {string|null}
 */
function obterCodigoDoInputTela() {
    // Busca inputs por ID, name ou atributos comuns da tela do SIGSS
    const seletores = [
        'input[name*="codigoSigss"]',
        'input[name*="codSigss"]',
        'input[id*="codigoSigss"]',
        'input[id*="codSigss"]',
        'input[name*="isenCod"]',
        'input[id*="isenCod"]',
        '#codigoSigss',
        '#codSigss'
    ];

    for (const seletor of seletores) {
        const el = document.querySelector(seletor);
        if (el && el.value && el.value.trim() !== '') {
            return el.value.trim();
        }
    }

    return null;
}
