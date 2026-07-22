import { executarFluxoImpressao } from './pipeline.js';

/**
 * Ponto de Entrada da Extensão SIGSS-AutoIndex
 * 
 * Registra o Pipeline de Impressão Inteligente no módulo interceptor.
 */
export function inicializarSigssAutoIndex() {
    if (typeof window.__SIGSS_PLUS_REGISTRAR_HANDLER__ === 'function') {
        window.__SIGSS_PLUS_REGISTRAR_HANDLER__(executarFluxoImpressao);
        console.log('[SIGSS-AutoIndex] Pipeline Inteligente registrado com sucesso.');
    }
}

// Inicializa a extensão
inicializarSigssAutoIndex();
