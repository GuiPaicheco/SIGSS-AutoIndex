console.info("[SIGSS] 01 - interceptor.js carregado");

(function () {
    'use strict';

    if (window.__SIGSS_AUTOINDEX_INTERCEPTOR_LOADED__) {
        return;
    }
    window.__SIGSS_AUTOINDEX_INTERCEPTOR_LOADED__ = true;

    const ENDPOINT_IMPRESSAO = 'atendimentoConsulta/imprimirFAA';
    const ORIGINAL_OPEN = window.open;

    let capturarProximoReport = false;
    let callbackImpressaoInterceptada = null;

    /**
     * Registrador do Handler (Etapa 5)
     */
    window.__SIGSS_PLUS_REGISTRAR_HANDLER__ = function (handler) {
        console.info("[SIGSS] Handler recebido");
        console.info(handler);
        console.info(typeof handler);
        callbackImpressaoInterceptada = handler;
    };
    console.info("[SIGSS] 03 - registrador criado");

    /**
     * Instala a sobrescrita do window.open (Etapa 4)
     */
    const interceptedOpen = function (url, name, specs) {
        console.info("[SIGSS] OPEN chamado", url);
        console.info("[SIGSS] callback =", callbackImpressaoInterceptada);
        console.info("[SIGSS] typeof callback =", typeof callbackImpressaoInterceptada);

        const isReportPdf = (typeof url === 'string') && (url.includes('/sigss/arquivo/') || url.endsWith('.pdf'));

        if ((capturarProximoReport || isReportPdf) && typeof callbackImpressaoInterceptada === 'function') {
            console.info("[SIGSS] entrando no Pipeline");
            capturarProximoReport = false;
            callbackImpressaoInterceptada(url, name, specs, ORIGINAL_OPEN);
            return null;
        }

        console.info("[SIGSS] abrindo PDF original");
        return ORIGINAL_OPEN.apply(window, arguments);
    };

    interceptedOpen.toString = function () {
        return 'function open() { [SIGSS-AutoIndex Interceptor Active] }';
    };

    window.open = interceptedOpen;
    console.info("[SIGSS] 02 - window.open interceptado");

    /**
     * Intercepta XMLHttpRequest
     */
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this._sigss_url = url;
        return originalXhrOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function () {
        if (this._sigss_url && this._sigss_url.includes(ENDPOINT_IMPRESSAO)) {
            capturarProximoReport = true;
            this.addEventListener('load', function () {
                try {
                    const responseJson = JSON.parse(this.responseText);
                    if (responseJson && responseJson.report) {
                        window.__SIGSS_ULTIMO_REPORT__ = responseJson.report;
                    }
                } catch (e) {}
            });
        }
        return originalXhrSend.apply(this, arguments);
    };

    /**
     * Intercepta Fetch API
     */
    const originalFetch = window.fetch;
    if (typeof originalFetch === 'function') {
        window.fetch = async function (...args) {
            const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url);
            const isImpressao = url && url.includes(ENDPOINT_IMPRESSAO);

            const response = await originalFetch.apply(this, args);

            if (isImpressao) {
                try {
                    const clone = response.clone();
                    const data = await clone.json();
                    if (data && data.report) {
                        capturarProximoReport = true;
                        window.__SIGSS_ULTIMO_REPORT__ = data.report;
                    }
                } catch (e) {}
            }

            return response;
        };
    }

    console.info("[SIGSS] 04 - iniciando bootstrap");
})();
