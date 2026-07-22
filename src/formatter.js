console.info("[SIGSS] formatter carregado");

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
        console.error('[SIGSS] Erro em formatarEnumeracao:', e);
        return msgs.NAO_ENCONTRADO;
    }
}

if (typeof window !== 'undefined') {
    window.formatarEnumeracao = formatarEnumeracao;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatarEnumeracao };
}
