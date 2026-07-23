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
 * Formata os dados cadastrais do imóvel no padrão oficial de enumeração SIGSS.
 * Padrão: CódigoEquipe_MicroArea_NumeroFamilia_SufixoEquipe (ex: "086_03_018_03").
 *
 * @param {Object|string} dados Dados cadastrais ou mensagem de estado
 * @returns {string} String formatada de enumeração
 */
function formatarEnumeracao(dados) {
    const msgs = (typeof window !== 'undefined' && window.MENSAGENS_ENUMERACAO) || {
        NAO_ENCONTRADO: 'Não encontrado em imóvel',
        MULTIPLOS_ENCONTRADOS: 'Múltiplos imóveis encontrados'
    };
    const fnSufixo = (typeof window !== 'undefined' && window.getSufixoEquipePorESF) || (() => '01');

    if (!dados) {
        return msgs.NAO_ENCONTRADO;
    }

    if (typeof dados === 'string') {
        return dados;
    }

    if (dados.status === 'NAO_ENCONTRADO') {
        return msgs.NAO_ENCONTRADO;
    }

    if (dados.status === 'MULTIPLOS_ENCONTRADOS') {
        return msgs.MULTIPLOS_ENCONTRADOS;
    }

    try {
        const areaRaw = dados.areaCod || dados.codigoESF || '';
        const miarRaw = dados.miarCod || dados.microNumero || '';
        const familiaRaw = dados.familia || dados.isadNumFamiliaSiab || dados.numeroFamilia || '';

        if (!areaRaw || !miarRaw || !familiaRaw) {
            return msgs.NAO_ENCONTRADO;
        }

        const areaNumerica = String(areaRaw).replace(/\D/g, '');
        const codigoEquipeFormatado = areaNumerica.slice(-3).padStart(3, '0');
        const microAreaFormatada = String(miarRaw).replace(/\D/g, '').padStart(2, '0');
        const numeroFamiliaFormatado = String(familiaRaw).replace(/\D/g, '').padStart(3, '0');
        const sufixoEquipe = fnSufixo(codigoEquipeFormatado) || '01';

        return `${codigoEquipeFormatado}_${microAreaFormatada}_${numeroFamiliaFormatado}_${sufixoEquipe}`;

    } catch (e) {
        const logger = (typeof window !== 'undefined' && window.Logger) || (typeof Logger !== 'undefined' ? Logger : console);
        logger.error('[SIGSS] Erro em formatarEnumeracao:', e);
        return msgs.NAO_ENCONTRADO;
    }
}

if (typeof window !== 'undefined') {
    window.formatarEnumeracao = formatarEnumeracao;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatarEnumeracao };
}
