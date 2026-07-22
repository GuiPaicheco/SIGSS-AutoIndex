import { ENDPOINTS, MENSAGENS_ENUMERACAO } from './constants.js';
import { getListaTodasMicroareas } from './equipes.js';

/**
 * Módulo de Pesquisa de Imóvel
 * 
 * Executa as consultas paralelas na API imobiliarioFamiliar2/lista
 * utilizando Promise.all() para diminuir o tempo de espera.
 */

/**
 * Realiza a busca concorrente em todas as microáreas utilizando o Código SIGSS como chave única.
 * 
 * @param {string} codigoSigss - Código SIGSS obtido do prontuário ou tela
 * @returns {Promise<string>} Resultado da enumeração ou mensagem correspondente
 */
export async function pesquisarImovelEGerarEnumeracao(codigoSigss) {
    if (!codigoSigss) {
        return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
    }

    const microareas = getListaTodasMicroareas();

    // Constrói e executa todas as requisições em paralelo
    const promessas = microareas.map(micro => consultarMicroarea(codigoSigss, micro));

    try {
        const resultados = await Promise.all(promessas);
        
        // Filtra resultados válidos que retornaram família
        const encontrados = resultados.filter(res => res !== null);

        if (encontrados.length === 0) {
            return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
        }

        if (encontrados.length === 1) {
            const item = encontrados[0];
            // Formato: CódigoEquipe_Micro_NúmeroFamília_NúmeroEquipe
            // Exemplo: 086_03_018_03
            return `${item.codigoESF}_${item.microNumero}_${item.numeroFamilia}_${item.sufixoEquipe}`;
        }

        // 2 ou mais resultados encontrados
        return MENSAGENS_ENUMERACAO.MULTIPLOS_ENCONTRADOS;

    } catch (erro) {
        console.error('[SIGSS+] Erro durante consulta paralela de imóveis:', erro);
        return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
    }
}

/**
 * Executa uma consulta individual a uma microárea específica
 * 
 * @param {string} codigoSigss 
 * @param {Object} micro 
 * @returns {Promise<Object|null>}
 */
async function consultarMicroarea(codigoSigss, micro) {
    // Exemplo de URL dinâmica: imobiliarioFamiliar2/lista?searchField=isen.isenCod&searchString=<Código SIGSS>&micro=<microCodigo>
    const params = new URLSearchParams({
        searchField: 'isen.isenCod',
        searchString: codigoSigss,
        microArea: micro.microCodigo
    });

    const url = `${ENDPOINTS.PESQUISA_IMOVEL}?${params.toString()}`;

    try {
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) return null;

        const data = await response.json();

        // Formato esperado da resposta: { "rows": [ { "cell": [ ..., "018" ] } ] }
        if (data && Array.isArray(data.rows) && data.rows.length > 0) {
            const primeiraLinha = data.rows[0];
            if (primeiraLinha && Array.isArray(primeiraLinha.cell) && primeiraLinha.cell[10]) {
                const numeroFamilia = primeiraLinha.cell[10].toString().padStart(3, '0');
                return {
                    codigoESF: micro.codigoESF,
                    sufixoEquipe: micro.sufixoEquipe,
                    microNumero: micro.microNumero,
                    numeroFamilia: numeroFamilia
                };
            }
        }

        return null;
    } catch (e) {
        return null;
    }
}
