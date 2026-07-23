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
 * Pesquisa o imóvel correspondente ao Código SIGSS e retorna os dados cadastrais do ISAD.
 *
 * @param {string} codigoSigss Código SIGSS do paciente
 * @returns {Promise<Object|string>} Objeto com dados do ISAD ou mensagem de status
 */
async function pesquisarImovelEGerarEnumeracao(codigoSigss) {
    const msgs = (typeof window !== 'undefined' && window.MENSAGENS_ENUMERACAO) || {
        NAO_ENCONTRADO: 'Não encontrado em imóvel',
        MULTIPLOS_ENCONTRADOS: 'Múltiplos imóveis encontrados'
    };
    const logger = (typeof window !== 'undefined' && window.Logger) || null;

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

        if (logger) logger.debug('Iniciando visualizarImovel()');
        const isadPK = await visualizarImovel(resultadoLista.imovPK);
        if (!isadPK) {
            return msgs.NAO_ENCONTRADO;
        }

        if (logger) logger.debug('Iniciando obterDadosIsad()');
        const dadosIsad = await obterDadosIsad(isadPK);
        if (!dadosIsad) {
            return msgs.NAO_ENCONTRADO;
        }

        if (logger) {
            logger.debug('Objeto enviado ao formatter:', dadosIsad);
            const fnFormatar = (typeof window !== 'undefined' && window.formatarEnumeracao) || (typeof formatarEnumeracao !== 'undefined' ? formatarEnumeracao : null);
            if (typeof fnFormatar === 'function') {
                const stringFinal = fnFormatar(dadosIsad);
                logger.debug('String final produzida pelo formatter:', stringFinal);
            }
        }

        return dadosIsad;

    } catch (erro) {
        if (logger) {
            logger.error('Exceção em pesquisarImovelEGerarEnumeracao:', {
                arquivo: 'src/imovel.js',
                funcao: 'pesquisarImovelEGerarEnumeracao',
                linhaAproximada: 45,
                objetoRecebido: codigoSigss,
                erro: erro
            });
        }
        return msgs.NAO_ENCONTRADO;
    }
}

/**
 * Ponto de entrada para busca do imóvel por Código SIGSS.
 * Invoca a estratégia de busca paralela em todas as microáreas.
 *
 * @param {string} codigoSigss
 * @returns {Promise<Object>}
 */
async function buscarImovelPorCodigoSigss(codigoSigss) {
    return await buscarEmTodasMicroareas(codigoSigss);
}

/**
 * Executa 13 consultas paralelas simultâneas (Promise.all) em todas as microáreas cadastradas.
 *
 * @param {string} codigoSigss
 * @returns {Promise<{status: string, imovPK?: Object}>}
 */
async function buscarEmTodasMicroareas(codigoSigss) {
    const logger = (typeof window !== 'undefined' && window.Logger) || null;
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

    if (logger) {
        logger.debug('Total de microáreas consultadas:', microareas.length);
    }

    const encontrados = resultados.filter(r => r && r.status === 'SUCESSO' && r.imovPK);

    if (logger) {
        logger.debug('Total de imóveis encontrados:', encontrados.length);
    }

    if (encontrados.length === 0) {
        return { status: 'NAO_ENCONTRADO' };
    }

    if (encontrados.length === 1) {
        const unico = encontrados[0];
        if (logger && unico.microareaInfo) {
            logger.debug('Microárea encontrada:', unico.microareaInfo.area, unico.microareaInfo.microCodigo);
        }
        return { status: 'SUCESSO', imovPK: unico.imovPK };
    }

    return { status: 'MULTIPLOS_ENCONTRADOS' };
}

/**
 * Realiza a consulta HTTP GET em uma microárea específica do SIGSS.
 *
 * @param {Object} configuracaoMicroarea Dados da microárea
 * @param {string} codigoSigss Código SIGSS
 * @returns {Promise<{status: string, records: number, imovPK: Object|null, microareaInfo: Object}>}
 */
async function buscarEmMicroarea(configuracaoMicroarea, codigoSigss) {
    const logger = (typeof window !== 'undefined' && window.Logger) || null;
    if (logger) {
        logger.debug('Consultando microárea:', configuracaoMicroarea.codigoESF, configuracaoMicroarea.microNumero, codigoSigss);
    }

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
            return { status: 'NAO_ENCONTRADO', records: 0, imovPK: null, microareaInfo: configuracaoMicroarea };
        }

        const data = await response.json();
        const totalRecords = typeof data.records !== 'undefined' 
            ? Number(data.records) 
            : (Array.isArray(data.rows) ? data.rows.length : 0);

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
        return { status: 'NAO_ENCONTRADO', records: 0, imovPK: null, microareaInfo: configuracaoMicroarea };
    }
}

/**
 * Executa a requisição HTTP POST para visualizar os detalhes do imóvel e extrair o isadPK.
 *
 * @param {Object} imovPK Objeto identificador da chave do imóvel
 * @returns {Promise<Object|null>} Objeto isadPK extraído ou null
 */
async function visualizarImovel(imovPK) {
    const logger = (typeof window !== 'undefined' && window.Logger) || null;
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

    if (logger) {
        logger.debug('POST visualizar():', urlVisualizar, formData.toString());
    }

    try {
        const response = await fetch(urlVisualizar, {
            method: 'POST',
            headers: headersVisualizar,
            body: formData.toString()
        });

        if (!response.ok) {
            if (logger) {
                logger.error('visualizar() retornou HTTP status:', response.status, imovPK);
            }
            return null;
        }

        const textResponse = await response.text();

        let data = null;
        try {
            data = JSON.parse(textResponse);
            if (logger) logger.debug('JSON completo do visualizar():', data);
        } catch (eParse) {
            if (logger) {
                logger.error('Falha ao fazer parse do JSON em visualizar():', eParse);
            }
            return null;
        }

        const isadPK = extrairIsadPK(data);

        if (isadPK) {
            if (logger) logger.debug('isadPK localizado:', isadPK);
        } else {
            if (logger) logger.error('isadPK não encontrado no JSON de visualizar()');
        }

        return isadPK;

    } catch (erro) {
        if (logger) {
            logger.error('Exceção capturada em visualizarImovel:', erro);
        }
        return null;
    }
}

/**
 * Executa a requisição HTTP POST para obter os dados detalhados do ISAD (área, microárea, família).
 *
 * @param {Object} isadPK Objeto identificador da chave do ISAD
 * @returns {Promise<Object|null>} Objeto com atributos cadastrais ou null
 */
async function obterDadosIsad(isadPK) {
    const logger = (typeof window !== 'undefined' && window.Logger) || null;
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

    if (logger) {
        logger.debug('POST getIsad():', urlGetIsad, formData.toString());
    }

    try {
        const response = await fetch(urlGetIsad, {
            method: 'POST',
            headers: headersGetIsad,
            body: formData.toString()
        });

        if (!response.ok) {
            if (logger) {
                logger.error('getIsad() retornou HTTP status:', response.status, isadPK);
            }
            return null;
        }

        const textResponse = await response.text();

        let data = null;
        try {
            data = JSON.parse(textResponse);
            if (logger) logger.debug('JSON completo do getIsad():', data);
        } catch (eParse) {
            if (logger) {
                logger.error('Falha ao fazer parse do JSON em getIsad():', eParse);
            }
            return null;
        }

        const isadObj = (data && data.isad) ? data.isad : data;

        if (isadObj) {
            const areaObj = isadObj.area || (data && data.area);
            const microAreaObj = isadObj.microArea || (data && data.microArea);

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

            if (logger) {
                logger.debug('Objeto ISAD montado:', objetoResultante);
            }

            if (!areaCod || !miarCod || typeof isadNumFamiliaSiab === 'undefined') {
                if (logger) {
                    logger.error('Propriedades do ISAD incompletas no JSON de getIsad():', {
                        areaCod,
                        miarCod,
                        isadNumFamiliaSiab,
                        data
                    });
                }
                return null;
            }

            return objetoResultante;
        } else {
            if (logger) {
                logger.error('Objeto response.isad inexistente no JSON retornado por getIsad():', data);
            }
            return null;
        }

    } catch (erro) {
        if (logger) {
            logger.error('Exceção capturada em obterDadosIsad:', erro);
        }
        return null;
    }
}

/**
 * Monta a string final de enumeração a partir dos dados do ISAD.
 *
 * @param {Object} dadosIsad Objeto contendo areaCod, miarCod e isadNumFamiliaSiab
 * @returns {string}
 */
function montarCodigoFinal(dadosIsad) {
    const fnSufixo = (typeof window !== 'undefined' && window.getSufixoEquipePorESF) || (() => '01');
    const areaNumerica = dadosIsad.areaCod.replace(/\D/g, '');
    const codigoEquipeFormatado = areaNumerica.slice(-3).padStart(3, '0');
    const microAreaFormatada = dadosIsad.miarCod.padStart(2, '0');
    const numeroFamiliaFormatado = dadosIsad.isadNumFamiliaSiab.padStart(3, '0');
    const sufixoEquipe = fnSufixo(codigoEquipeFormatado) || '01';

    return `${codigoEquipeFormatado}_${microAreaFormatada}_${numeroFamiliaFormatado}_${sufixoEquipe}`;
}

/**
 * Extrai o objeto imovPK ({idp, ids}) da linha de resultado do grid.
 *
 * @param {Object} linha Linha do grid do SIGSS
 * @returns {Object|null} Objeto imovPK ou null
 */
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

/**
 * Extrai a chave isadPK ({idp, ids}) a partir da resposta JSON do endpoint visualizar.
 *
 * @param {Object} data Objeto JSON retornado por visualizar()
 * @returns {Object|null} Objeto isadPK ou null
 */
function extrairIsadPK(data) {
    if (!data) return null;

    if (data.isadPK && typeof data.isadPK.idp !== 'undefined' && typeof data.isadPK.ids !== 'undefined') {
        return { idp: data.isadPK.idp, ids: data.isadPK.ids };
    }
    if (data.imov && data.imov.isadPK && typeof data.imov.isadPK.idp !== 'undefined' && typeof data.imov.isadPK.ids !== 'undefined') {
        return { idp: data.imov.isadPK.idp, ids: data.imov.isadPK.ids };
    }
    if (typeof data.isadIdp !== 'undefined' && typeof data.isadIds !== 'undefined') {
        return { idp: data.isadIdp, ids: data.isadIds };
    }

    if (data.imov && data.imov.domicilioList !== undefined) {
        const domList = data.imov.domicilioList;
        if (domList && typeof domList === 'object') {
            const domObj = Array.isArray(domList) ? domList[0] : domList;

            if (domObj && domObj.informacaoDomicilioList !== undefined) {
                const infoDom = domObj.informacaoDomicilioList;
                if (infoDom && typeof infoDom === 'object') {
                    const infoObj = Array.isArray(infoDom) ? infoDom[0] : infoDom;
                    if (infoObj) {
                        if (infoObj.isadPK && typeof infoObj.isadPK.idp !== 'undefined' && typeof infoObj.isadPK.ids !== 'undefined') {
                            return { idp: infoObj.isadPK.idp, ids: infoObj.isadPK.ids };
                        } else if (typeof infoObj.isadIdp !== 'undefined' && typeof infoObj.isadIds !== 'undefined') {
                            return { idp: infoObj.isadIdp, ids: infoObj.isadIds };
                        }
                    }
                }
            } else if (domList.informacaoDomicilioList !== undefined) {
                const infoDom = domList.informacaoDomicilioList;
                if (infoDom && typeof infoDom === 'object') {
                    const infoObj = Array.isArray(infoDom) ? infoDom[0] : infoDom;
                    if (infoObj && infoObj.isadPK && typeof infoObj.isadPK.idp !== 'undefined' && typeof infoObj.isadPK.ids !== 'undefined') {
                        return { idp: infoObj.isadPK.idp, ids: infoObj.isadPK.ids };
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
