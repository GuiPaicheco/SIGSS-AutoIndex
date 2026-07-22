console.info("[SIGSS] logger carregado");

import { DEBUG_MODE } from './constants.js';

export const Logger = {
    debug: (...args) => {
        const isDebug = typeof window !== 'undefined' && typeof window.DEBUG_MODE !== 'undefined' ? window.DEBUG_MODE : DEBUG_MODE;
        if (isDebug) {
            console.info('[SIGSS-AutoIndex][DEBUG]', ...args);
        }
    },
    info: (...args) => {
        const isDebug = typeof window !== 'undefined' && typeof window.DEBUG_MODE !== 'undefined' ? window.DEBUG_MODE : DEBUG_MODE;
        if (isDebug) {
            console.info('[SIGSS-AutoIndex][INFO]', ...args);
        }
    },
    warn: (...args) => {
        const isDebug = typeof window !== 'undefined' && typeof window.DEBUG_MODE !== 'undefined' ? window.DEBUG_MODE : DEBUG_MODE;
        if (isDebug) {
            console.warn('[SIGSS-AutoIndex][WARN]', ...args);
        }
    },
    error: (...args) => {
        console.error('[SIGSS-AutoIndex][ERROR]', ...args);
    }
};

if (typeof window !== 'undefined') {
    window.Logger = Logger;
}
