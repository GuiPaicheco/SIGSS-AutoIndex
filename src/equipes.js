function getListaTodasMicroareas() {
    const config = (typeof window !== 'undefined' && window.EQUIPES_CONFIG) || [];
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

function getSufixoEquipePorESF(codigoESF) {
    const mapa = (typeof window !== 'undefined' && window.MAPEAMENTO_EQUIPES) || {
        '085': '01', '086': '03', '087': '02',
        '0085': '01', '0086': '03', '0087': '02',
        '85': '01', '86': '03', '87': '02'
    };
    return mapa[codigoESF] || null;
}

if (typeof window !== 'undefined') {
    window.getListaTodasMicroareas = getListaTodasMicroareas;
    window.getSufixoEquipePorESF = getSufixoEquipePorESF;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getListaTodasMicroareas, getSufixoEquipePorESF };
}
