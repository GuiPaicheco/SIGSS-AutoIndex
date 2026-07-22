import { EQUIPES_CONFIG, MAPEAMENTO_EQUIPES } from './constants.js';

export function getListaTodasMicroareas() {
    const config = (typeof window !== 'undefined' && window.EQUIPES_CONFIG) || EQUIPES_CONFIG;
    const lista = [];
    for (const eq of config) {
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

export function getSufixoEquipePorESF(codigoESF) {
    const mapa = (typeof window !== 'undefined' && window.MAPEAMENTO_EQUIPES) || MAPEAMENTO_EQUIPES;
    return mapa[codigoESF] || null;
}

if (typeof window !== 'undefined') {
    window.getListaTodasMicroareas = getListaTodasMicroareas;
    window.getSufixoEquipePorESF = getSufixoEquipePorESF;
}
