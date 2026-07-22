import { executarFluxoImpressao } from './pipeline.js';
import { DEBUG_MODE } from './constants.js';

/**
 * Ponto de Entrada do SIGSS-AutoIndex (v0.4.2)
 * 
 * Registra o Pipeline de Impressão e expõe executarFluxoImpressao no window.
 */
export function inicializarSigssAutoIndex() {
    const targetWindow = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);

    if (targetWindow) {
        // 1. Expõe a função diretamente em window.executarFluxoImpressao
        targetWindow.executarFluxoImpressao = executarFluxoImpressao;

        // 2. Registra o manipulador no interceptor
        if (typeof targetWindow.__SIGSS_PLUS_REGISTRAR_HANDLER__ === 'function') {
            targetWindow.__SIGSS_PLUS_REGISTRAR_HANDLER__(executarFluxoImpressao);
        }
    }

    // 3. Exibe logs visuais de inicialização estritamente quando DEBUG_MODE = true
    if (DEBUG_MODE) {
        console.info('[SIGSS-AutoIndex] Bootstrap iniciado');
        console.info('[SIGSS-AutoIndex] Main carregado');
        console.info('[SIGSS-AutoIndex] Pipeline registrado');
        console.info('[SIGSS-AutoIndex] Interceptador ativo');
    }
}

// Inicializa a aplicação ao carregar o módulo
inicializarSigssAutoIndex();
