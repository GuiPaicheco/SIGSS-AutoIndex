console.info("[SIGSS] formatter carregado");

import { MENSAGENS_ENUMERACAO } from './constants.js';
import { getSufixoEquipePorESF } from './equipes.js';

export function formatarEnumeracao(dados) {
    if (!dados) {
        return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
    }

    if (typeof dados === 'string') {
        return dados;
    }

    if (dados.status === 'NAO_ENCONTRADO') {
        return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
    }

    if (dados.status === 'MULTIPLOS_ENCONTRADOS') {
        return MENSAGENS_ENUMERACAO.MULTIPLOS_ENCONTRADOS;
    }

    try {
        const areaRaw = dados.areaCod || dados.codigoESF || '';
        const miarRaw = dados.miarCod || dados.microNumero || '';
        const familiaRaw = dados.familia || dados.isadNumFamiliaSiab || dados.numeroFamilia || '';

        if (!areaRaw || !miarRaw || !familiaRaw) {
            return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
        }

        const areaNumerica = String(areaRaw).replace(/\D/g, '');
        const codigoEquipeFormatado = areaNumerica.slice(-3).padStart(3, '0');
        const microAreaFormatada = String(miarRaw).replace(/\D/g, '').padStart(2, '0');
        const numeroFamiliaFormatado = String(familiaRaw).replace(/\D/g, '').padStart(3, '0');
        const sufixoEquipe = getSufixoEquipePorESF(codigoEquipeFormatado) || '01';

        return `${codigoEquipeFormatado}_${microAreaFormatada}_${numeroFamiliaFormatado}_${sufixoEquipe}`;

    } catch (e) {
        console.error('[SIGSS] Erro em formatarEnumeracao:', e);
        return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
    }
}
