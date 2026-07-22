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
