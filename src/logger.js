console.info("[SIGSS] logger carregado");

import { DEBUG_MODE } from './constants.js';

export const Logger = {
    debug: (...args) => {
        if (DEBUG_MODE) {
            console.info('[SIGSS-AutoIndex][DEBUG]', ...args);
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
        console.error('[SIGSS-AutoIndex][ERROR]', ...args);
    }
};
