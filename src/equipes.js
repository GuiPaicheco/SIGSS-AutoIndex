import { EQUIPES_CONFIG, MAPEAMENTO_EQUIPES } from './constants.js';

/**
 * Obtém a lista consolidada de todas as microáreas de todas as equipes
 * para execução de buscas paralelas.
 * 
 * @returns {Array<{codigoESF: string, sufixoEquipe: string, microNumero: string, microCodigo: string}>}
 */
export function getListaTodasMicroareas() {
    const lista = [];
    for (const eq of EQUIPES_CONFIG) {
        for (const m of eq.micros) {
            lista.push({
                codigoESF: eq.codigoESF,
                sufixoEquipe: eq.sufixoEquipe,
                microNumero: m.numero,
                microCodigo: m.codigo
            });
        }
    }
    return lista;
}

/**
 * Retorna o sufixo numérico da equipe a partir do código ESF
 * @param {string} codigoESF 
 * @returns {string|null}
 */
export function getSufixoEquipePorESF(codigoESF) {
    return MAPEAMENTO_EQUIPES[codigoESF] || null;
}
