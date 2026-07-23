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

        console.info("[SIGSS] Objeto enviado ao formatter:", dadosIsad);
        const fnFormatar = (typeof window !== 'undefined' && window.formatarEnumeracao) || (typeof formatarEnumeracao !== 'undefined' ? formatarEnumeracao : null);
        if (typeof fnFormatar === 'function') {
            const stringFinal = fnFormatar(dadosIsad);
            console.info("[SIGSS] String final produzida pelo formatter:", stringFinal);
        }

        return dadosIsad;

    } catch (erro) {
        console.error('[SIGSS][ERRO] Exceção em pesquisarImovelEGerarEnumeracao:', {
            arquivo: 'src/imovel.js',
            funcao: 'pesquisarImovelEGerarEnumeracao',
            linhaAproximada: 42,
            objetoRecebido: codigoSigss,
            erro: erro
        });
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

        // Etapa 1: Resultado bruto da lista
        console.info("[SIGSS] Resultado bruto da lista:");
        console.info(primeiraLinha);

        const imovPK = extrairImovPK(primeiraLinha);

        // Etapa 2: Exibir imovPK.idp e imovPK.ids
        if (imovPK) {
            console.info("[SIGSS] imovPK.idp =", imovPK.idp);
            console.info("[SIGSS] imovPK.ids =", imovPK.ids);
        } else {
            console.error("[SIGSS][ERRO] imovPK não extraído de primeiraLinha:", {
                arquivo: 'src/imovel.js',
                funcao: 'buscarEmMicroarea',
                linhaAproximada: 147,
                objetoRecebido: primeiraLinha
            });
        }

        return { status: 'SUCESSO', records: totalRecords, imovPK, microareaInfo: configuracaoMicroarea };

    } catch (e) {
        console.info("[SIGSS] Records:", 0);
        return { status: 'NAO_ENCONTRADO', records: 0, imovPK: null, microareaInfo: configuracaoMicroarea };
    }
}

async function visualizarImovel(imovPK) {
    const endpoints = (typeof window !== 'undefined' && window.ENDPOINTS) || {
        VISUALIZAR_IMOVEL: 'imobiliarioFamiliar/visualizar'
    };
    const urlVisualizar = endpoints.VISUALIZAR_IMOVEL;
    const formData = new URLSearchParams();
    formData.append('imovPK.idp', imovPK ? imovPK.idp : '');
    formData.append('imovPK.ids', imovPK ? imovPK.ids : '');

    const headersVisualizar = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest'
    };

    // Etapa 3: Antes da chamada visualizar()
    console.info("[SIGSS] POST visualizar():");
    console.info("URL:", urlVisualizar);
    console.info("Body:", formData.toString());
    console.info("Headers:", headersVisualizar);

    try {
        const response = await fetch(urlVisualizar, {
            method: 'POST',
            headers: headersVisualizar,
            body: formData.toString()
        });

        if (!response.ok) {
            console.error("[SIGSS][ERRO] visualizar() retornou HTTP status:", response.status, {
                arquivo: 'src/imovel.js',
                funcao: 'visualizarImovel',
                linhaAproximada: 185,
                objetoRecebido: imovPK
            });
            return null;
        }

        const textResponse = await response.text();

        // Etapa 4: Log do JSON completo sem resumir
        let data = null;
        try {
            data = JSON.parse(textResponse);
            console.info("[SIGSS] JSON completo do visualizar():", data);
        } catch (eParse) {
            console.error("[SIGSS][ERRO] Falha ao fazer parse do JSON em visualizar():", eParse, {
                arquivo: 'src/imovel.js',
                funcao: 'visualizarImovel',
                linhaAproximada: 198,
                textoBruto: textResponse.substring(0, 500)
            });
            return null;
        }

        // Etapa 5: Localizando isadPK
        console.info("[SIGSS] Tentando localizar isadPK...");
        const isadPK = extrairIsadPK(data);

        if (isadPK) {
            console.info("[SIGSS] isadPK encontrado:", isadPK);
        } else {
            console.error("[SIGSS] isadPK não encontrado");
            
            // Etapa 6: Listar chaves existentes caso não localize isadPK
            if (data && typeof data === 'object') {
                try {
                    const keysNivel1 = Object.keys(data);
                    console.info("[SIGSS] Chaves de nível 1 do JSON de visualizar():", keysNivel1);
                    for (const key of keysNivel1) {
                        if (data[key] && typeof data[key] === 'object') {
                            console.info(`[SIGSS] Chaves do sub-objeto response['${key}']:`, Object.keys(data[key]));
                        }
                    }
                } catch (eKeys) {}
            }
        }

        return isadPK;

    } catch (erro) {
        console.error('[SIGSS][ERRO] Exceção capturada em visualizarImovel:', {
            arquivo: 'src/imovel.js',
            funcao: 'visualizarImovel',
            linhaAproximada: 230,
            objetoRecebido: imovPK,
            erro: erro
        });
        return null;
    }
}

async function obterDadosIsad(isadPK) {
    const endpoints = (typeof window !== 'undefined' && window.ENDPOINTS) || {
        GET_ISAD: 'imobiliarioFamiliar/getIsad'
    };
    const urlGetIsad = endpoints.GET_ISAD;
    const formData = new URLSearchParams();
    formData.append('isadPK.idp', isadPK ? isadPK.idp : '');
    formData.append('isadPK.ids', isadPK ? isadPK.ids : '');

    const headersGetIsad = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest'
    };

    // Etapa 7: Antes da chamada getIsad()
    console.info("[SIGSS] POST getIsad():");
    console.info("URL:", urlGetIsad);
    console.info("Body:", formData.toString());
    console.info("Headers:", headersGetIsad);

    try {
        const response = await fetch(urlGetIsad, {
            method: 'POST',
            headers: headersGetIsad,
            body: formData.toString()
        });

        if (!response.ok) {
            console.error("[SIGSS][ERRO] getIsad() retornou HTTP status:", response.status, {
                arquivo: 'src/imovel.js',
                funcao: 'obterDadosIsad',
                linhaAproximada: 260,
                objetoRecebido: isadPK
            });
            return null;
        }

        const textResponse = await response.text();

        // Etapa 8: Log do JSON completo retornado por getIsad()
        let data = null;
        try {
            data = JSON.parse(textResponse);
            console.info("[SIGSS] JSON completo do getIsad():", data);
        } catch (eParse) {
            console.error("[SIGSS][ERRO] Falha ao fazer parse do JSON em getIsad():", eParse, {
                arquivo: 'src/imovel.js',
                funcao: 'obterDadosIsad',
                linhaAproximada: 275,
                textoBruto: textResponse.substring(0, 500)
            });
            return null;
        }

        // v0.5.3: Inspeção detalhada de response.isad
        const isadObj = (data && data.isad) ? data.isad : data;

        if (isadObj) {
            console.info("[SIGSS] response.isad:", isadObj);
            try {
                console.info("[SIGSS] Object.keys(response.isad):", Object.keys(isadObj));
            } catch (e) {}

            const areaObj = isadObj.area || (data && data.area);
            const microAreaObj = isadObj.microArea || (data && data.microArea);

            console.info("[SIGSS] response.isad.area:", areaObj);
            console.info("[SIGSS] response.isad.microArea:", microAreaObj);

            if (areaObj && typeof areaObj === 'object') {
                try {
                    console.info("[SIGSS] Object.keys(response.isad.area):", Object.keys(areaObj));
                } catch (e) {}
            } else {
                console.info("[SIGSS] Objeto area completo (não-objeto):", areaObj);
            }

            if (microAreaObj && typeof microAreaObj === 'object') {
                try {
                    console.info("[SIGSS] Object.keys(response.isad.microArea):", Object.keys(microAreaObj));
                } catch (e) {}
            } else {
                console.info("[SIGSS] Objeto microArea completo (não-objeto):", microAreaObj);
            }

            const areaCod = (areaObj && areaObj.areaCod) || isadObj.areaCod || (data && data.areaCod);
            const miarCod = (microAreaObj && microAreaObj.miarCod) || isadObj.miarCod || (data && data.miarCod);
            const isadNumFamiliaSiab = isadObj.isadNumFamiliaSiab !== undefined 
                ? isadObj.isadNumFamiliaSiab 
                : (data && data.isadNumFamiliaSiab);

            const objetoResultante = {
                areaCod: areaCod !== undefined ? String(areaCod) : undefined,
                miarCod: miarCod !== undefined ? String(miarCod) : undefined,
                isadNumFamiliaSiab: isadNumFamiliaSiab !== undefined ? String(isadNumFamiliaSiab) : undefined
            };

            console.info("[SIGSS] Objeto ISAD montado:", objetoResultante);

            if (!areaCod || !miarCod || typeof isadNumFamiliaSiab === 'undefined') {
                console.error("[SIGSS][ERRO] Propriedades do ISAD incompletas no JSON de getIsad():", {
                    arquivo: 'src/imovel.js',
                    funcao: 'obterDadosIsad',
                    linhaAproximada: 360,
                    areaCod,
                    miarCod,
                    isadNumFamiliaSiab,
                    isadObj,
                    areaObj,
                    microAreaObj,
                    data
                });
                return null;
            }

            return objetoResultante;
        } else {
            console.error("[SIGSS][ERRO] Objeto response.isad inexistente no JSON retornado por getIsad():", data);
            return null;
        }

    } catch (erro) {
        console.error('[SIGSS][ERRO] Exceção capturada em obterDadosIsad:', {
            arquivo: 'src/imovel.js',
            funcao: 'obterDadosIsad',
            linhaAproximada: 375,
            objetoRecebido: isadPK,
            erro: erro
        });
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
    if (!data) return null;

    // 1. Padrões diretos anteriores
    if (data.isadPK && typeof data.isadPK.idp !== 'undefined' && typeof data.isadPK.ids !== 'undefined') {
        return { idp: data.isadPK.idp, ids: data.isadPK.ids };
    }
    if (data.imov && data.imov.isadPK && typeof data.imov.isadPK.idp !== 'undefined' && typeof data.imov.isadPK.ids !== 'undefined') {
        return { idp: data.imov.isadPK.idp, ids: data.imov.isadPK.ids };
    }
    if (typeof data.isadIdp !== 'undefined' && typeof data.isadIds !== 'undefined') {
        return { idp: data.isadIdp, ids: data.isadIds };
    }

    // 2. Auditoria v0.5.2 - Navegação estrita em imov.domicilioList -> informacaoDomicilioList -> isadPK
    if (data.imov && data.imov.domicilioList !== undefined) {
        const domList = data.imov.domicilioList;
        console.info("[SIGSS] response.imov.domicilioList:", domList);
        if (domList && typeof domList === 'object') {
            try {
                console.info("[SIGSS] Object.keys(response.imov.domicilioList):", Object.keys(domList));
            } catch (e) {}

            const domObj = Array.isArray(domList) ? domList[0] : domList;

            if (domObj && domObj.informacaoDomicilioList !== undefined) {
                const infoDom = domObj.informacaoDomicilioList;
                console.info("[SIGSS] response.imov.domicilioList.informacaoDomicilioList:", infoDom);
                if (infoDom && typeof infoDom === 'object') {
                    try {
                        console.info("[SIGSS] Object.keys(informacaoDomicilioList):", Object.keys(infoDom));
                    } catch (e) {}

                    const infoObj = Array.isArray(infoDom) ? infoDom[0] : infoDom;
                    if (infoObj) {
                        if (infoObj.isadPK && typeof infoObj.isadPK.idp !== 'undefined' && typeof infoObj.isadPK.ids !== 'undefined') {
                            const isadObj = { idp: infoObj.isadPK.idp, ids: infoObj.isadPK.ids };
                            console.info("[SIGSS] ISAD encontrado:", isadObj);
                            return isadObj;
                        } else if (typeof infoObj.isadIdp !== 'undefined' && typeof infoObj.isadIds !== 'undefined') {
                            const isadObj = { idp: infoObj.isadIdp, ids: infoObj.isadIds };
                            console.info("[SIGSS] ISAD encontrado:", isadObj);
                            return isadObj;
                        } else {
                            try {
                                console.info("[SIGSS] Propriedades existentes de informacaoDomicilioList:", Object.keys(infoObj));
                            } catch (e) {}
                        }
                    }
                }
            } else if (domList.informacaoDomicilioList !== undefined) {
                const infoDom = domList.informacaoDomicilioList;
                console.info("[SIGSS] response.imov.domicilioList.informacaoDomicilioList:", infoDom);
                if (infoDom && typeof infoDom === 'object') {
                    try {
                        console.info("[SIGSS] Object.keys(informacaoDomicilioList):", Object.keys(infoDom));
                    } catch (e) {}

                    const infoObj = Array.isArray(infoDom) ? infoDom[0] : infoDom;
                    if (infoObj) {
                        if (infoObj.isadPK && typeof infoObj.isadPK.idp !== 'undefined' && typeof infoObj.isadPK.ids !== 'undefined') {
                            const isadObj = { idp: infoObj.isadPK.idp, ids: infoObj.isadPK.ids };
                            console.info("[SIGSS] ISAD encontrado:", isadObj);
                            return isadObj;
                        } else {
                            try {
                                console.info("[SIGSS] Propriedades existentes de informacaoDomicilioList:", Object.keys(infoObj));
                            } catch (e) {}
                        }
                    }
                }
            }
        }
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
