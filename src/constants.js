/**
 * Constantes globais do sistema SIGSS-AutoIndex (v0.4.2)
 */

/**
 * Modo de depuração. Quando true, ativa logs detalhados de cada etapa do pipeline.
 */
export const DEBUG_MODE = false;

export const ENDPOINTS = {
    IMPRIMIR_FAA: 'atendimentoConsulta/imprimirFAA',
    LISTA_IMOVEL: 'imobiliarioFamiliar2/lista',
    VISUALIZAR_IMOVEL: 'imobiliarioFamiliar/visualizar',
    GET_ISAD: 'imobiliarioFamiliar/getIsad'
};

export const MENSAGENS_ENUMERACAO = {
    NAO_ENCONTRADO: 'Não encontrado em imóvel',
    MULTIPLOS_ENCONTRADOS: 'Múltiplos imóveis encontrados'
};

/**
 * Centralização dos seletores HTML da tela de impressão do SIGSS.
 */
export const SELETORES_INPUT_SIGSS = [
    'input[name*="codigoSigss"]',
    'input[name*="codSigss"]',
    'input[id*="codigoSigss"]',
    'input[id*="codSigss"]',
    'input[name*="isenCod"]',
    'input[id*="isenCod"]',
    'input[name*="prontuario"]',
    'input[id*="prontuario"]',
    'input[name*="codigoFaa"]',
    'input[id*="codigoFaa"]',
    '#codigoSigss',
    '#codSigss',
    '#isenCod',
    '#prontuario'
];

/**
 * Mapeamento de Código ESF / Código de Área para sufixo de Equipe
 */
export const MAPEAMENTO_EQUIPES = {
    '085': '01',
    '086': '03',
    '087': '02',
    '0085': '01',
    '0086': '03',
    '0087': '02',
    '85': '01',
    '86': '03',
    '87': '02'
};

/**
 * Definição completa das Equipes, Microáreas e seus códigos de busca
 */
export const EQUIPES_CONFIG = [
    {
        equipeNome: 'Equipe 01',
        codigoESF: '085',
        area: '97-1',
        sufixoEquipe: '01',
        micros: [
            { numero: '05', codigo: '35267-1' },
            { numero: '07', codigo: '35268-1' },
            { numero: '08', codigo: '35269-1' },
            { numero: '13', codigo: '35270-1' }
        ]
    },
    {
        equipeNome: 'Equipe 02',
        codigoESF: '087',
        area: '91-1',
        sufixoEquipe: '02',
        micros: [
            { numero: '01', codigo: '35234-1' },
            { numero: '02', codigo: '35235-1' },
            { numero: '10', codigo: '36694-1' },
            { numero: '11', codigo: '35236-1' },
            { numero: '12', codigo: '35237-1' }
        ]
    },
    {
        equipeNome: 'Equipe 03',
        codigoESF: '086',
        area: '103-1',
        sufixoEquipe: '03',
        micros: [
            { numero: '03', codigo: '35296-1' },
            { numero: '04', codigo: '35297-1' },
            { numero: '06', codigo: '35298-1' },
            { numero: '09', codigo: '35299-1' }
        ]
    }
];
