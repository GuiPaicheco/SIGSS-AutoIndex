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
     * Registra o manipulador do pipeline de impressão.
     * @param {Function} handler Função orquestradora do pipeline
     */
    window.__SIGSS_PLUS_REGISTRAR_HANDLER__ = function (handler) {
        const logger = (typeof window !== 'undefined' && window.Logger) || null;
        if (logger) {
            logger.info('Handler de impressão registrado no interceptor.');
        }
        callbackImpressaoInterceptada = handler;
    };

    /**
     * Função substituta transparente para window.open.
     * Intercepta a abertura de relatórios PDF do SIGSS e redireciona para o pipeline.
     */
    const interceptedOpen = function (url, name, specs) {
        const logger = (typeof window !== 'undefined' && window.Logger) || null;
        if (logger) {
            logger.debug('window.open chamado:', url);
        }

        const isReportPdf = (typeof url === 'string') && (url.includes('/sigss/arquivo/') || url.endsWith('.pdf'));

        if ((capturarProximoReport || isReportPdf) && typeof callbackImpressaoInterceptada === 'function') {
            if (logger) {
                logger.info('Impressão interceptada. Redirecionando para o pipeline.');
            }
            capturarProximoReport = false;
            callbackImpressaoInterceptada(url, name, specs, ORIGINAL_OPEN);
            return null;
        }

        return ORIGINAL_OPEN.apply(window, arguments);
    };

    interceptedOpen.toString = function () {
        return 'function open() { [SIGSS-AutoIndex Interceptor Active] }';
    };

    window.open = interceptedOpen;

    /**
     * Intercepta XMLHttpRequest para sinalizar requisições ao endpoint de impressão do FAA.
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
     * Intercepta a Fetch API para garantir sinalização caso o SIGSS utilize fetch.
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
})();
