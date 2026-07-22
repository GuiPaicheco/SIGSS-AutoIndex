console.info("[SIGSS] logger carregado");

const Logger = {
    debug: (...args) => {
        const isDebug = typeof window !== 'undefined' && typeof window.DEBUG_MODE !== 'undefined' ? window.DEBUG_MODE : true;
        if (isDebug) {
            console.info('[SIGSS-AutoIndex][DEBUG]', ...args);
        }
    },
    info: (...args) => {
        const isDebug = typeof window !== 'undefined' && typeof window.DEBUG_MODE !== 'undefined' ? window.DEBUG_MODE : true;
        if (isDebug) {
            console.info('[SIGSS-AutoIndex][INFO]', ...args);
        }
    },
    warn: (...args) => {
        const isDebug = typeof window !== 'undefined' && typeof window.DEBUG_MODE !== 'undefined' ? window.DEBUG_MODE : true;
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Logger };
}
