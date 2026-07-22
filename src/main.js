console.info("[SIGSS] 08 - entrou em main.js");

import { executarFluxoImpressao } from './pipeline.js';
console.info("[SIGSS] 09 - pipeline importado");

export function inicializarSigssAutoIndex() {
    console.info("[SIGSS] 10 - inicializando");
    const targetWindow = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);

    if (targetWindow) {
        console.info("[SIGSS] 11 - registrando handler");
        if (typeof targetWindow.__SIGSS_PLUS_REGISTRAR_HANDLER__ === 'function') {
            targetWindow.__SIGSS_PLUS_REGISTRAR_HANDLER__(executarFluxoImpressao);
            console.info("[SIGSS] 12 - handler registrado");
        }

        targetWindow.executarFluxoImpressao = executarFluxoImpressao;
        console.info("[SIGSS] 13 - window.executarFluxoImpressao definido");
    }
}

inicializarSigssAutoIndex();
console.info("[SIGSS] 14 - main.js finalizado");
