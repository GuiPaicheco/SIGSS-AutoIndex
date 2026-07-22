import { Logger } from './logger.js';

/**
 * Módulo Interceptor do SIGSS-AutoIndex (v0.4.1)
 * 
 * Monitora e intercepta a requisição de impressão da FAA (imprimirFaaSemPin / POST atendimentoConsulta/imprimirFAA)
 * e a abertura da janela do relatório sem alterar a interface nem o fluxo do usuário.
 */

(function () {
    'use strict';

    if (window.__SIGSS_PLUS_INTERCEPTOR_LOADED__) {
        return;
    }
    window.__SIGSS_PLUS_INTERCEPTOR_LOADED__ = true;

    const ENDPOINT_IMPRESSAO = 'atendimentoConsulta/imprimirFAA';
    const ORIGINAL_OPEN = window.open;

    let capturarProximoReport = false;
    let callbackImpressaoInterceptada = null;

    /**
     * Define o handler que será executado quando uma impressão for capturada.
     * @param {Function} handler 
     */
    window.__SIGSS_PLUS_REGISTRAR_HANDLER__ = function (handler) {
        callbackImpressaoInterceptada = handler;
    };

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
                        Logger.debug('XHR do relatório capturado:', responseJson.report);
                    }
                } catch (e) {
                    Logger.error('Erro ao processar resposta XHR do servidor:', e);
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
                        Logger.debug('Fetch do relatório capturado:', data.report);
                    }
                } catch (e) {
                    Logger.error('Erro ao processar resposta Fetch do servidor:', e);
                }
            }

            return response;
        };
    }

    /**
     * Intercepta window.open para desviar a abertura do PDF original para o fluxo do SIGSS-AutoIndex
     */
    window.open = function (url, name, specs) {
        const isReportPdf = (typeof url === 'string') && (url.includes('/sigss/arquivo/') || url.endsWith('.pdf'));

        if ((capturarProximoReport || isReportPdf) && callbackImpressaoInterceptada) {
            capturarProximoReport = false;
            Logger.info('Abertura de janela capturada. Desviando para o pipeline...');
            // Executa o processamento do SIGSS-AutoIndex em segundo plano e abre o PDF processado
            callbackImpressaoInterceptada(url, name, specs, ORIGINAL_OPEN);
            return null; // Bloqueia a abertura imediata do PDF não enumerado
        }

        return ORIGINAL_OPEN.apply(window, arguments);
    };

    Logger.info('Interceptor ativado com sucesso.');
})();
