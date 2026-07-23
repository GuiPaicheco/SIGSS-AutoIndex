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
 * Ponto de entrada da aplicação SIGSS-AutoIndex.
 * Registra o manipulador de impressão e expõe a função de pipeline no objeto window.
 */
function inicializarSigssAutoIndex() {
    const targetWindow = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);

    const fnPipeline = (targetWindow && targetWindow.executarFluxoImpressao) || (typeof executarFluxoImpressao !== 'undefined' ? executarFluxoImpressao : null);

    if (targetWindow) {
        if (typeof targetWindow.__SIGSS_PLUS_REGISTRAR_HANDLER__ === 'function') {
            targetWindow.__SIGSS_PLUS_REGISTRAR_HANDLER__(fnPipeline);
        }

        targetWindow.executarFluxoImpressao = fnPipeline;
    }
}

inicializarSigssAutoIndex();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { inicializarSigssAutoIndex };
}
