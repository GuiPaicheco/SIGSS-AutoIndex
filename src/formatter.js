import { MENSAGENS_ENUMERACAO } from './constants.js';
import { getSufixoEquipePorESF } from './equipes.js';

/**
 * Módulo de Formatação de Enumeração - Sprint v0.4.0
 * 
 * Responsabilidade Única: Transformar os dados cadastrais do imóvel na string oficial de enumeração.
 */

/**
 * Formata os dados do imóvel na enumeração oficial do SIGSS-AutoIndex.
 * 
 * Exemplo de Entrada: { areaCod: "0086", miarCod: "03", familia: "018" } ou { status: "NAO_ENCONTRADO" }
 * Exemplo de Saída: "086_03_018_03" ou "Não encontrado em imóvel"
 * 
 * @param {Object} dados - Objeto contendo os dados do imóvel ou status
 * @returns {string} String formatada da enumeração
 */
export function formatarEnumeracao(dados) {
    if (!dados) {
        return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
    }

    // Se for uma mensagem ou status de resultado pré-definido
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

        // Formato oficial: CódigoEquipe_Micro_NúmeroFamília_NúmeroEquipe
        return `${codigoEquipeFormatado}_${microAreaFormatada}_${numeroFamiliaFormatado}_${sufixoEquipe}`;

    } catch (e) {
        console.error('[SIGSS-AutoIndex] Erro ao formatar enumeração:', e);
        return MENSAGENS_ENUMERACAO.NAO_ENCONTRADO;
    }
}
