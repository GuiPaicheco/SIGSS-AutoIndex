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
 * Retorna a lista plana de todas as microáreas cadastradas para busca paralela.
 *
 * @returns {Array<{codigoESF: string, area: string, sufixoEquipe: string, microNumero: string, microCodigo: string}>}
 */
function getListaTodasMicroareas() {
    let config = [];
    if (typeof window !== 'undefined' && window.EQUIPES_CONFIG) {
        config = window.EQUIPES_CONFIG;
    } else if (typeof require !== 'undefined') {
        try {
            const constants = require('./constants.js');
            config = constants.EQUIPES_CONFIG || [];
        } catch (e) {}
    }

    const lista = [];
    for (const eq of config) {
        if (!eq || !Array.isArray(eq.micros)) continue;
        for (const m of eq.micros) {
            lista.push({
                codigoESF: eq.codigoESF,
                area: eq.area,
                sufixoEquipe: eq.sufixoEquipe,
                microNumero: m.numero,
                microCodigo: m.codigo
            });
        }
    }
    return lista;
}

/**
 * Retorna o sufixo numérico de equipe associado ao Código ESF/Área.
 *
 * @param {string} codigoESF
 * @returns {string|null}
 */
function getSufixoEquipePorESF(codigoESF) {
    let mapa = null;
    if (typeof window !== 'undefined' && window.MAPEAMENTO_EQUIPES) {
        mapa = window.MAPEAMENTO_EQUIPES;
    } else if (typeof require !== 'undefined') {
        try {
            const constants = require('./constants.js');
            mapa = constants.MAPEAMENTO_EQUIPES;
        } catch (e) {}
    }

    if (!mapa) {
        mapa = {
            '085': '01', '086': '03', '087': '02',
            '0085': '01', '0086': '03', '0087': '02',
            '85': '01', '86': '03', '87': '02'
        };
    }

    return mapa[codigoESF] || null;
}

if (typeof window !== 'undefined') {
    window.getListaTodasMicroareas = getListaTodasMicroareas;
    window.getSufixoEquipePorESF = getSufixoEquipePorESF;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getListaTodasMicroareas, getSufixoEquipePorESF };
}
