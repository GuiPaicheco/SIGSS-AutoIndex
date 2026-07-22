import { MENSAGENS_ENUMERACAO } from './constants.js';
import { getSufixoEquipePorESF } from './equipes.js';
import { Logger } from './logger.js';

/**
 * Módulo de Formatação de Enumeração - SIGSS-AutoIndex (v0.4.1)
 * 
 * Responsabilidade Única: Transformar os dados cadastrais do imóvel na string oficial de enumeração.
 */

/**
 * Formata os dados do imóvel na enumeração oficial do SIGSS-AutoIndex.
 * 
 * Exemplo de Entrada: { areaCod: "0086", miarCod: "03", isadNumFamiliaSiab: "018" } ou "Não encontrado em imóvel"
 * Exemplo de Saída: "086_03_018_03" ou "Não encontrado em imóvel"
 * 
 * @param {Object|string} dados 
 * @returns {string}
 */
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

        // 1. Código da Equipe/ESF formatado com 3 dígitos (ex: "0086" ou "86" -> "086")
        const areaNumerica = String(areaRaw).replace(/\D/g, '');
        const codigoEquipeFormatado = areaNumerica.slice(-3).padStart(3, '0');

        // 2. Microárea formatada com 2 dígitos (ex: "3" -> "03")
        const microAreaFormatada = String(miarRaw).replace(/\D/g, '').padStart(2, '0');

        // 3. Número da família formatado com 3 dígitos (ex: "18" -> "018")
        const numeroFamiliaFormatado = String(familiaRaw).replace(/\D/g, '').padStart(3, '0');

        // 4. Sufixo da Equipe obtido pelo mapeamento (ex: "086" -> "03")
        const sufixoEquipe = getSufixoEquipePorESF(codigoEquipeFormatado) || '01';

        const enumeracaoFinal = `${codigoEquipeFormatado}_${microAreaFormatada}_${numeroFamiliaFormatado}_${sufixoEquipe}`;
        Logger.debug(`Formatação concluída: areaCod=${areaRaw}, miarCod=${miarRaw}, familia=${familiaRaw} => ${enumeracaoFinal}`);
        
        return enumeracaoFinal;

    } catch (e) {
        Logger.error('Erro ao formatar enumeração:', e);
        return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
    }
}
