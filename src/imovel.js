console.info("[SIGSS] imovel carregado");

async function pesquisarImovelEGerarEnumeracao(codigoSigss) {
    const msgs = (typeof window !== 'undefined' && window.MENSAGENS_ENUMERACAO) || {
        NAO_ENCONTRADO: 'Não encontrado em imóvel',
        MULTIPLOS_ENCONTRADOS: 'Múltiplos imóveis encontrados'
    };

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

        console.info("[SIGSS] visualizar()");
        const isadPK = await visualizarImovel(resultadoLista.imovPK);
        if (!isadPK) {
            return msgs.NAO_ENCONTRADO;
        }

        console.info("[SIGSS] getIsad()");
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

async function buscarImovelPorCodigoSigss(codigoSigss) {
    return await buscarEmTodasMicroareas(codigoSigss);
}

async function buscarEmTodasMicroareas(codigoSigss) {
    const fnListaMicroareas = (typeof window !== 'undefined' && window.getListaTodasMicroareas) || (typeof getListaTodasMicroareas !== 'undefined' ? getListaTodasMicroareas : null);
    
    let microareas = [];
    if (typeof fnListaMicroareas === 'function') {
        microareas = fnListaMicroareas();
    } else if (typeof require !== 'undefined') {
        try {
            const equipes = require('./equipes.js');
            microareas = equipes.getListaTodasMicroareas();
        } catch (e) {}
    }

    const promessas = microareas.map(m => buscarEmMicroarea(m, codigoSigss));
    const resultados = await Promise.all(promessas);

    console.info("[SIGSS] Total de microáreas consultadas:", microareas.length);

    const encontrados = resultados.filter(r => r && r.status === 'SUCESSO' && r.imovPK);

    console.info("[SIGSS] Total encontrados:", encontrados.length);

    if (encontrados.length === 0) {
        return { status: 'NAO_ENCONTRADO' };
    }

    if (encontrados.length === 1) {
        const unico = encontrados[0];
        if (unico.microareaInfo) {
            console.info("[SIGSS] Microárea encontrada:", unico.microareaInfo.area, unico.microareaInfo.microCodigo);
        }
        return { status: 'SUCESSO', imovPK: unico.imovPK };
    }

    return { status: 'MULTIPLOS_ENCONTRADOS' };
}

async function buscarEmMicroarea(configuracaoMicroarea, codigoSigss) {
    console.info("[SIGSS] Consultando:", configuracaoMicroarea.codigoESF, configuracaoMicroarea.microNumero, codigoSigss);

    try {
        const endpoints = (typeof window !== 'undefined' && window.ENDPOINTS) || {
            LISTA_IMOVEL: 'imobiliarioFamiliar2/lista',
            VISUALIZAR_IMOVEL: 'imobiliarioFamiliar/visualizar',
            GET_ISAD: 'imobiliarioFamiliar/getIsad'
        };

        const params = new URLSearchParams();
        params.set('_search', 'false');
        params.set('nd', String(Date.now()));
        params.set('rows', '15');
        params.set('page', '1');
        params.set('sidx', 'imov.imovInscricaoImobiliaria');
        params.set('sord', 'asc');
        params.set('searchField', 'isen.isenCod');
        params.set('searchString', codigoSigss);
        params.set('searchOper', 'eq');
        params.set('area', configuracaoMicroarea.area || '');
        params.set('miar', configuracaoMicroarea.microCodigo || '');
        params.set('filtroCondicaoFamiliar', 'todos');
        params.set('outrosFiltros', '');
        params.set('rifa', '');

        const urlCompleta = `${endpoints.LISTA_IMOVEL}?${params.toString()}`;

        const response = await fetch(urlCompleta, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            console.info("[SIGSS] Records:", 0);
            return { status: 'NAO_ENCONTRADO', records: 0, imovPK: null, microareaInfo: configuracaoMicroarea };
        }

        const data = await response.json();
        const totalRecords = typeof data.records !== 'undefined' 
            ? Number(data.records) 
            : (Array.isArray(data.rows) ? data.rows.length : 0);

        console.info("[SIGSS] Records:", totalRecords);

        if (totalRecords === 0) {
            return { status: 'NAO_ENCONTRADO', records: 0, imovPK: null, microareaInfo: configuracaoMicroarea };
        }

        const primeiraLinha = data.rows && data.rows[0];
        if (!primeiraLinha) {
            return { status: 'NAO_ENCONTRADO', records: 0, imovPK: null, microareaInfo: configuracaoMicroarea };
        }

        const imovPK = extrairImovPK(primeiraLinha);
        if (!imovPK) {
            return { status: 'NAO_ENCONTRADO', records: 0, imovPK: null, microareaInfo: configuracaoMicroarea };
        }

        return { status: 'SUCESSO', records: totalRecords, imovPK, microareaInfo: configuracaoMicroarea };

    } catch (e) {
        console.info("[SIGSS] Records:", 0);
        return { status: 'NAO_ENCONTRADO', records: 0, imovPK: null, microareaInfo: configuracaoMicroarea };
    }
}

async function visualizarImovel(imovPK) {
    try {
        const endpoints = (typeof window !== 'undefined' && window.ENDPOINTS) || {
            VISUALIZAR_IMOVEL: 'imobiliarioFamiliar/visualizar'
        };
        const formData = new URLSearchParams();
        formData.append('imovPK.idp', imovPK.idp);
        formData.append('imovPK.ids', imovPK.ids);

        const response = await fetch(endpoints.VISUALIZAR_IMOVEL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData.toString()
        });

        if (!response.ok) return null;

        const data = await response.json();
        return extrairIsadPK(data);

    } catch (e) {
        return null;
    }
}

async function obterDadosIsad(isadPK) {
    try {
        const endpoints = (typeof window !== 'undefined' && window.ENDPOINTS) || {
            GET_ISAD: 'imobiliarioFamiliar/getIsad'
        };
        const formData = new URLSearchParams();
        formData.append('isadPK.idp', isadPK.idp);
        formData.append('isadPK.ids', isadPK.ids);

        const response = await fetch(endpoints.GET_ISAD, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest'
            },
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

function montarCodigoFinal(dadosIsad) {
    const fnSufixo = (typeof window !== 'undefined' && window.getSufixoEquipePorESF) || (() => '01');
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
    window.buscarEmTodasMicroareas = buscarEmTodasMicroareas;
    window.buscarEmMicroarea = buscarEmMicroarea;
    window.visualizarImovel = visualizarImovel;
    window.obterDadosIsad = obterDadosIsad;
    window.montarCodigoFinal = montarCodigoFinal;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        pesquisarImovelEGerarEnumeracao,
        buscarImovelPorCodigoSigss,
        buscarEmTodasMicroareas,
        buscarEmMicroarea,
        visualizarImovel,
        obterDadosIsad,
        montarCodigoFinal
    };
}
