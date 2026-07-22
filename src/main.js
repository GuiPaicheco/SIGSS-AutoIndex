import { executarFluxoImpressao } from './pipeline.js';
import { Logger } from './logger.js';

/**
 * Ponto de Entrada da Extensão SIGSS-AutoIndex (v0.4.1 - RC-1)
 * 
 * Registra o Pipeline de Impressão Inteligente no módulo interceptor.
 */
export function inicializarSigssAutoIndex() {
    if (typeof window.__SIGSS_PLUS_REGISTRAR_HANDLER__ === 'function') {
        window.__SIGSS_PLUS_REGISTRAR_HANDLER__(executarFluxoImpressao);
        Logger.info('Pipeline Inteligente registrado com sucesso.');
    }
}

// Inicializa a extensão
inicializarSigssAutoIndex();
