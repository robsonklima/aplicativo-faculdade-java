import { Usuario } from './usuario';
import { Localizacao } from './localizacao';

export class DadosGlobais {
    usuario: Usuario;
    senhaExpirada: boolean;
    dataHoraCadastro: string;
    localizacao: Localizacao;
}