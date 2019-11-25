import { Localizacao } from './localizacao';

export class LocalAtendimento {
	codPosto: number;
    numAgencia: string;
    dcPosto: string;
    nomeLocalAtendimento: string;
    endereco: string;
    localizacao: Localizacao;
    localizacaoCorrigida: Localizacao;
    distancia: string;
    distanciaEmMetros: number;
    duracao: string;
    duracaoEmSegundos: number;
    enderecoFormatado: string;
}