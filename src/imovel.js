import { ENDPOINTS, MENSAGENS_ENUMERACAO } from './constants.js';
import { getSufixoEquipePorESF } from './equipes.js';

/**
 * Módulo de Integração Imobiliária do SIGSS (Sprint v0.3.0)
 * 
 * Implementa a cadeia técnica validada:
 * imobiliarioFamiliar2/lista -> imobiliarioFamiliar/visualizar -> imobiliarioFamiliar/getIsad
 */

/**
 * Função principal que orquestra a cadeia de chamadas imobiliárias.
 * 
 * @param {string} codigoSigss - Código SIGSS obtido do prontuário ou tela
 * @returns {Promise<string>} String formatada da enumeração ou mensagem correspondente
 */
export async function pesquisarImovelEGerarEnumeracao(codigoSigss) {
    if (!codigoSigss) {
        return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
    }

    try {
        // 1. Pesquisa na lista de imóveis pelo Código SIGSS
        const resultadoLista = await buscarImovelPorCodigoSigss(codigoSigss);

        if (resultadoLista.status === 'NAO_ENCONTRADO') {
            return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
        }

        if (resultadoLista.status === 'MULTIPLOS_ENCONTRADOS') {
            return MENSAGENS_ENUMERACAO.MULTIPLOS_ENCONTRADOS;
        }

        if (resultadoLista.status !== 'SUCESSO' || !resultadoLista.imovPK) {
            return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
        }

        // 2. Chama o endpoint de visualização do imóvel para obter isadPK (idp e ids)
        const isadPK = await visualizarImovel(resultadoLista.imovPK);
        if (!isadPK) {
            return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
        }

        // 3. Chama o endpoint getIsad para obter os dados oficiais de área, microárea e número da família
        const dadosIsad = await obterDadosIsad(isadPK);
        if (!dadosIsad) {
            return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
        }

        // 4. Monta e retorna a string de enumeração final (ex: 086_03_018_03)
        return montarCodigoFinal(dadosIsad);

    } catch (erro) {
        console.error('[SIGSS+] Erro na integração imobiliária:', erro);
        return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
    }
}

/**
 * Passo 1: Busca o imóvel pelo Código SIGSS na API imobiliarioFamiliar2/lista.
 * 
 * @param {string} codigoSigss 
 * @returns {Promise<{status: string, imovPK?: {idp: string|number, ids: string|number}}>}
 */
export async function buscarImovelPorCodigoSigss(codigoSigss) {
    try {
        const params = new URLSearchParams({
            searchField: 'isen.isenCod',
            searchString: codigoSigss
        });

        const url = `${ENDPOINTS.LISTA_IMOVEL}?${params.toString()}`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) {
            return { status: 'NAO_ENCONTRADO' };
        }

        const data = await response.json();

        // Quantidade de registros
        const totalRecords = typeof data.records !== 'undefined' 
            ? Number(data.records) 
            : (Array.isArray(data.rows) ? data.rows.length : 0);

        if (totalRecords === 0) {
            return { status: 'NAO_ENCONTRADO' };
        }

        if (totalRecords > 1) {
            return { status: 'MULTIPLOS_ENCONTRADOS' };
        }

        // Registro único encontrado
        const primeiraLinha = data.rows && data.rows[0];
        if (!primeiraLinha) {
            return { status: 'NAO_ENCONTRADO' };
        }

        // Extrai imovPK.idp e imovPK.ids
        const imovPK = extrairImovPK(primeiraLinha);
        if (!imovPK) {
            return { status: 'NAO_ENCONTRADO' };
        }

        return { status: 'SUCESSO', imovPK };

    } catch (e) {
        return { status: 'NAO_ENCONTRADO' };
    }
}

/**
 * Passo 2: Envia requisição POST para imobiliarioFamiliar/visualizar para extrair isadPK.idp e isadPK.ids.
 * 
 * @param {{idp: string|number, ids: string|number}} imovPK 
 * @returns {Promise<{idp: string|number, ids: string|number}|null>}
 */
export async function visualizarImovel(imovPK) {
    try {
        const formData = new URLSearchParams();
        formData.append('imovPK.idp', imovPK.idp);
        formData.append('imovPK.ids', imovPK.ids);

        const response = await fetch(ENDPOINTS.VISUALIZAR_IMOVEL, {
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

/**
 * Passo 3: Envia requisição POST para imobiliarioFamiliar/getIsad usando isadPK.idp e isadPK.ids.
 * 
 * @param {{idp: string|number, ids: string|number}} isadPK 
 * @returns {Promise<{areaCod: string, miarCod: string, isadNumFamiliaSiab: string}|null>}
 */
export async function obterDadosIsad(isadPK) {
    try {
        const formData = new URLSearchParams();
        formData.append('isadPK.idp', isadPK.idp);
        formData.append('isadPK.ids', isadPK.ids);

        const response = await fetch(ENDPOINTS.GET_ISAD, {
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

/**
 * Passo 4: Monta o código final formatado (ex: 086_03_018_03).
 * 
 * @param {{areaCod: string, miarCod: string, isadNumFamiliaSiab: string}} dadosIsad 
 * @returns {string}
 */
export function montarCodigoFinal(dadosIsad) {
    // Trata e padroniza o código da área/ESF para exatamente 3 dígitos (ex: "0086" ou "86" -> "086")
    const areaNumerica = dadosIsad.areaCod.replace(/\D/g, '');
    const codigoEquipeFormatado = areaNumerica.slice(-3).padStart(3, '0');

    // Trata a microárea (ex: "3" -> "03")
    const microAreaFormatada = dadosIsad.miarCod.padStart(2, '0');

    // Trata o número da família (ex: "18" -> "018")
    const numeroFamiliaFormatado = dadosIsad.isadNumFamiliaSiab.padStart(3, '0');

    // Obtém o sufixo numérico da equipe a partir do mapeamento mantido em constants.js
    const sufixoEquipe = getSufixoEquipePorESF(codigoEquipeFormatado) || '01';

    return `${codigoEquipeFormatado}_${microAreaFormatada}_${numeroFamiliaFormatado}_${sufixoEquipe}`;
}

/**
 * Função auxiliar para extrair imovPK (idp e ids) a partir da linha retornada da lista.
 */
function extrairImovPK(linha) {
    if (linha.imovPK && typeof linha.imovPK.idp !== 'undefined' && typeof linha.imovPK.ids !== 'undefined') {
        return { idp: linha.imovPK.idp, ids: linha.imovPK.ids };
    }
    if (typeof linha.idp !== 'undefined' && typeof linha.ids !== 'undefined') {
        return { idp: linha.idp, ids: linha.ids };
    }
    if (Array.isArray(linha.cell)) {
        // Fallback caso venha na estrutura jqGrid clássica do SIGSS
        return { idp: linha.cell[0], ids: linha.cell[1] };
    }
    if (linha.id) {
        // Se id for uma string composta tipo "123_456"
        const partes = String(linha.id).split('_');
        if (partes.length >= 2) {
            return { idp: partes[0], ids: partes[1] };
        }
    }
    return null;
}

/**
 * Função auxiliar para extrair isadPK (idp e ids) do objeto retornado de visualizar.
 */
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
