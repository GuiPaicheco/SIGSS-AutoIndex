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
 * Utilitário centralizado de logging desacoplado.
 * Respeita a constante DEBUG_MODE para emissão de logs em desenvolvimento e produção.
 */
const Logger = {
    /**
     * Emite log de depuração (DEBUG).
     * @param {...*} args
     */
    debug: (...args) => {
        const isDebug = typeof window !== 'undefined' && typeof window.DEBUG_MODE !== 'undefined' ? window.DEBUG_MODE : false;
        if (isDebug) {
            console.info('[SIGSS-AutoIndex][DEBUG]', ...args);
        }
    },
    /**
     * Emite log informativo (INFO).
     * @param {...*} args
     */
    info: (...args) => {
        const isDebug = typeof window !== 'undefined' && typeof window.DEBUG_MODE !== 'undefined' ? window.DEBUG_MODE : false;
        if (isDebug) {
            console.info('[SIGSS-AutoIndex][INFO]', ...args);
        }
    },
    /**
     * Emite aviso (WARN).
     * @param {...*} args
     */
    warn: (...args) => {
        const isDebug = typeof window !== 'undefined' && typeof window.DEBUG_MODE !== 'undefined' ? window.DEBUG_MODE : false;
        if (isDebug) {
            console.warn('[SIGSS-AutoIndex][WARN]', ...args);
        }
    },
    /**
     * Emite log de erro crítico (ERROR).
     * @param {...*} args
     */
    error: (...args) => {
        console.error('[SIGSS-AutoIndex][ERROR]', ...args);
    }
};

if (typeof window !== 'undefined') {
    window.Logger = Logger;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Logger };
}
