import { obterCodigoSIGSS } from './utils.js';
import { pesquisarImovelEGerarEnumeracao } from './imovel.js';
import { formatarEnumeracao } from './formatter.js';
import { baixarPdf, editarPdf, abrirPdf } from './pdf.js';
import { Logger } from './logger.js';

/**
 * Pipeline de Impressão Inteligente - SIGSS-AutoIndex (v0.4.1 - RC-1)
 * 
 * Módulo Orquestrador Único: Gerencia sequencialmente o processamento de impressão em memória.
 */

/**
 * Executa o fluxo completo do Pipeline Inteligente de Impressão com medição de tempo e controle por Logger.
 * 
 * @param {string} reportUrl 
 * @param {string} [windowName='_blank'] 
 * @param {string} [windowSpecs=''] 
 * @param {Function} [windowOpenOriginal=window.open] 
 */
export async function executarFluxoImpressao(reportUrl, windowName, windowSpecs, windowOpenOriginal) {
    const fnOpen = windowOpenOriginal || window.open;
    const tempoInicio = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    try {
        Logger.info('Iniciando Pipeline Inteligente de Impressão...');
        Logger.debug('Etapa 1/6: URL do relatório recebida:', reportUrl);

        // 1. Obter Código SIGSS (Input da tela -> Documento/PDF)
        const codigoSigss = await obterCodigoSIGSS(reportUrl);
        Logger.debug('Etapa 2/6: Código SIGSS identificado:', codigoSigss);

        // 2. Pesquisar imóvel e obter dados do domicílio
        const resultadoImovel = await pesquisarImovelEGerarEnumeracao(codigoSigss);
        Logger.debug('Etapa 3/6: Resultado da pesquisa imobiliária:', resultadoImovel);

        // 3. Formatar a string de enumeração oficial
        const textoEnumeracao = formatarEnumeracao(resultadoImovel);
        Logger.debug('Etapa 4/6: String de enumeração gerada:', textoEnumeracao);

        // 4. Baixar o PDF original em memória
        Logger.debug('Etapa 5/6: Baixando PDF para memória...');
        const pdfArrayBuffer = await baixarPdf(reportUrl);

        // 5. Editar o PDF em memória (inserir enumeração no topo centralizado)
        Logger.debug('Etapa 6/6: Carimbando enumeração no PDF via pdf-lib...');
        const pdfModificadoArrayBuffer = await editarPdf(pdfArrayBuffer, textoEnumeracao);

        // 6. Abrir o PDF modificado em memória
        abrirPdf(pdfModificadoArrayBuffer, fnOpen);

        const tempoFim = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const tempoTotalMs = (tempoFim - tempoInicio).toFixed(2);
        Logger.info(`Pipeline concluído com sucesso em ${tempoTotalMs}ms. Enumeração: "${textoEnumeracao}"`);

    } catch (erro) {
        Logger.error('Falha no pipeline. Ativando fallback para PDF original:', erro);

        // REQUISITO CRÍTICO: Em qualquer falha, o PDF original é aberto automaticamente sem prejudicar o médico
        try {
            fnOpen(reportUrl, windowName || '_blank', windowSpecs);
        } catch (eFallback) {
            Logger.error('Erro no fallback de abertura:', eFallback);
        }
    }
}
