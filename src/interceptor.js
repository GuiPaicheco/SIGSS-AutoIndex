/**
 * Módulo Interceptor e Bootstrap do SIGSS-AutoIndex (v0.4.2)
 * 
 * Executa no contexto MAIN da página no document_start:
 * 1. Instala os hooks transparentes de window.open, XMLHttpRequest e fetch.
 * 2. Injeta dinamicamente src/main.js como um módulo ES6 na DOM.
 */
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
     * Registra a função do pipeline para receber chamadas de impressão.
     */
    window.__SIGSS_PLUS_REGISTRAR_HANDLER__ = function (handler) {
        callbackImpressaoInterceptada = handler;
    };

    /**
     * Instala a sobrescrita do window.open
     */
    const interceptedOpen = function (url, name, specs) {
        const isReportPdf = (typeof url === 'string') && (url.includes('/sigss/arquivo/') || url.endsWith('.pdf'));

        if ((capturarProximoReport || isReportPdf) && typeof callbackImpressaoInterceptada === 'function') {
            capturarProximoReport = false;
            callbackImpressaoInterceptada(url, name, specs, ORIGINAL_OPEN);
            return null; // Bloqueia a abertura imediata do PDF não enumerado
        }

        return ORIGINAL_OPEN.apply(window, arguments);
    };

    // Evidencia a interceptação no teste window.open.toString()
    interceptedOpen.toString = function () {
        return 'function open() { [SIGSS-AutoIndex Interceptor Active] }';
    };

    window.open = interceptedOpen;

    /**
     * Intercepta o XMLHttpRequest para identificar a chamada ao endpoint de impressão
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
                } catch (e) {
                    // Erro silencioso em produção
                }
            });
        }
        return originalXhrSend.apply(this, arguments);
    };

    /**
     * Intercepta fetch para garantir cobertura caso o SIGSS utilize Fetch API
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
                } catch (e) {
                    // Erro silencioso em produção
                }
            }

            return response;
        };
    }

    /**
     * Bootstrap: Injeta src/main.js como um ES Module na DOM da página
     */
    function injetarMainModule() {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            if (!document.querySelector('script[data-sigss-autoindex-main]')) {
                const script = document.createElement('script');
                script.type = 'module';
                script.src = chrome.runtime.getURL('src/main.js');
                script.setAttribute('data-sigss-autoindex-main', 'true');
                
                const alvo = document.head || document.documentElement;
                if (alvo) {
                    alvo.appendChild(script);
                } else {
                    document.addEventListener('DOMContentLoaded', function () {
                        (document.head || document.documentElement).appendChild(script);
                    });
                }
            }
        }
    }

    injetarMainModule();
})();
