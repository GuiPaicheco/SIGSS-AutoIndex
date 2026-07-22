import { DEBUG_MODE } from './constants.js';

/**
 * Módulo de Log Centralizado - SIGSS-AutoIndex (RC-1)
 * 
 * Substitui o uso direto de console.log, controlando a emissão de logs pelo DEBUG_MODE.
 */
export const Logger = {
    debug: (...args) => {
        if (DEBUG_MODE) {
            console.log('[SIGSS-AutoIndex][DEBUG]', ...args);
        }
    },
    info: (...args) => {
        if (DEBUG_MODE) {
            console.info('[SIGSS-AutoIndex][INFO]', ...args);
        }
    },
    warn: (...args) => {
        if (DEBUG_MODE) {
            console.warn('[SIGSS-AutoIndex][WARN]', ...args);
        }
    },
    error: (...args) => {
        // Erros críticos são sempre mantidos no console para diagnósticos no DevTools
        console.error('[SIGSS-AutoIndex][ERROR]', ...args);
    }
};
