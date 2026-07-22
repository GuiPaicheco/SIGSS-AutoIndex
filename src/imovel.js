console.info("[SIGSS] imovel carregado");

import { ENDPOINTS, MENSAGENS_ENUMERACAO } from './constants.js';
import { getSufixoEquipePorESF } from './equipes.js';

export async function pesquisarImovelEGerarEnumeracao(codigoSigss) {
    const msgs = (typeof window !== 'undefined' && window.MENSAGENS_ENUMERACAO) || MENSAGENS_ENUMERACAO;

    if (!codigoSigss) {
        return msgs.NAO_ENCONTRADO;
    }

    try {
        const resultadoLista = await buscarImovelPorCodigoSigss(codigoSigss);

        if (resultadoLista.status === 'NAO_ENCONTRADO') {
            return msgs.NAO_ENCONTRADO;
        }

        if (resultadoLista.status === 'MULTIPLOS_ENCONTRADOS') {
            return msgs.MULTIPLOS_ENCONTRADOS;
        }

        if (resultadoLista.status !== 'SUCESSO' || !resultadoLista.imovPK) {
            return msgs.NAO_ENCONTRADO;
        }

        const isadPK = await visualizarImovel(resultadoLista.imovPK);
        if (!isadPK) {
            return msgs.NAO_ENCONTRADO;
        }

        const dadosIsad = await obterDadosIsad(isadPK);
        if (!dadosIsad) {
            return msgs.NAO_ENCONTRADO;
        }

        return dadosIsad;

    } catch (erro) {
        console.error('[SIGSS] Erro em pesquisarImovelEGerarEnumeracao:', erro);
        return msgs.NAO_ENCONTRADO;
    }
}

export async function buscarImovelPorCodigoSigss(codigoSigss) {
    try {
        const endpoints = (typeof window !== 'undefined' && window.ENDPOINTS) || ENDPOINTS;
        const params = new URLSearchParams({
            searchField: 'isen.isenCod',
            searchString: codigoSigss
        });

        const url = `${endpoints.LISTA_IMOVEL}?${params.toString()}`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) {
            return { status: 'NAO_ENCONTRADO' };
        }

        const data = await response.json();

        const totalRecords = typeof data.records !== 'undefined' 
            ? Number(data.records) 
            : (Array.isArray(data.rows) ? data.rows.length : 0);

        if (totalRecords === 0) {
            return { status: 'NAO_ENCONTRADO' };
        }

        if (totalRecords > 1) {
            return { status: 'MULTIPLOS_ENCONTRADOS' };
        }

        const primeiraLinha = data.rows && data.rows[0];
        if (!primeiraLinha) {
            return { status: 'NAO_ENCONTRADO' };
        }

        const imovPK = extrairImovPK(primeiraLinha);
        if (!imovPK) {
            return { status: 'NAO_ENCONTRADO' };
        }

        return { status: 'SUCESSO', imovPK };

    } catch (e) {
        return { status: 'NAO_ENCONTRADO' };
    }
}

export async function visualizarImovel(imovPK) {
    try {
        const endpoints = (typeof window !== 'undefined' && window.ENDPOINTS) || ENDPOINTS;
        const formData = new URLSearchParams();
        formData.append('imovPK.idp', imovPK.idp);
        formData.append('imovPK.ids', imovPK.ids);

        const response = await fetch(endpoints.VISUALIZAR_IMOVEL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: formData.toString()
        });

        if (!response.ok) return null;

        const data = await response.json();
        return extrairIsadPK(data);

    } catch (e) {
        return null;
    }
}

export async function obterDadosIsad(isadPK) {
    try {
        const endpoints = (typeof window !== 'undefined' && window.ENDPOINTS) || ENDPOINTS;
        const formData = new URLSearchParams();
        formData.append('isadPK.idp', isadPK.idp);
        formData.append('isadPK.ids', isadPK.ids);

        const response = await fetch(endpoints.GET_ISAD, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: formData.toString()
        });

        if (!response.ok) return null;

        const data = await response.json();

        const areaCod = data.areaCod || (data.area && data.area.areaCod);
        const miarCod = data.miarCod || (data.microArea && data.microArea.miarCod);
        const isadNumFamiliaSiab = data.isadNumFamiliaSiab || (data.isad && data.isad.isadNumFamiliaSiab);

        if (!areaCod || !miarCod || typeof isadNumFamiliaSiab === 'undefined') {
            return null;
        }

        return {
            areaCod: String(areaCod),
            miarCod: String(miarCod),
            isadNumFamiliaSiab: String(isadNumFamiliaSiab)
        };

    } catch (e) {
        return null;
    }
}

export function montarCodigoFinal(dadosIsad) {
    const fnSufixo = (typeof window !== 'undefined' && window.getSufixoEquipePorESF) || getSufixoEquipePorESF;
    const areaNumerica = dadosIsad.areaCod.replace(/\D/g, '');
    const codigoEquipeFormatado = areaNumerica.slice(-3).padStart(3, '0');
    const microAreaFormatada = dadosIsad.miarCod.padStart(2, '0');
    const numeroFamiliaFormatado = dadosIsad.isadNumFamiliaSiab.padStart(3, '0');
    const sufixoEquipe = fnSufixo(codigoEquipeFormatado) || '01';

    return `${codigoEquipeFormatado}_${microAreaFormatada}_${numeroFamiliaFormatado}_${sufixoEquipe}`;
}

function extrairImovPK(linha) {
    if (linha.imovPK && typeof linha.imovPK.idp !== 'undefined' && typeof linha.imovPK.ids !== 'undefined') {
        return { idp: linha.imovPK.idp, ids: linha.imovPK.ids };
    }
    if (typeof linha.idp !== 'undefined' && typeof linha.ids !== 'undefined') {
        return { idp: linha.idp, ids: linha.ids };
    }
    if (Array.isArray(linha.cell)) {
        return { idp: linha.cell[0], ids: linha.cell[1] };
    }
    if (linha.id) {
        const partes = String(linha.id).split('_');
        if (partes.length >= 2) {
            return { idp: partes[0], ids: partes[1] };
        }
    }
    return null;
}

function extrairIsadPK(data) {
    if (data.isadPK && typeof data.isadPK.idp !== 'undefined' && typeof data.isadPK.ids !== 'undefined') {
        return { idp: data.isadPK.idp, ids: data.isadPK.ids };
    }
    if (data.imov && data.imov.isadPK) {
        return { idp: data.imov.isadPK.idp, ids: data.imov.isadPK.ids };
    }
    if (typeof data.isadIdp !== 'undefined' && typeof data.isadIds !== 'undefined') {
        return { idp: data.isadIdp, ids: data.isadIds };
    }
    return null;
}

if (typeof window !== 'undefined') {
    window.pesquisarImovelEGerarEnumeracao = pesquisarImovelEGerarEnumeracao;
    window.buscarImovelPorCodigoSigss = buscarImovelPorCodigoSigss;
    window.visualizarImovel = visualizarImovel;
    window.obterDadosIsad = obterDadosIsad;
    window.montarCodigoFinal = montarCodigoFinal;
}
