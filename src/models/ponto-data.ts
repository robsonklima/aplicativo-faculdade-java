import { PontoPeriodo } from "./ponto-periodo";
import { PontoDataStatus } from "./ponto-data-status";
import { PontoUsuario } from "./ponto-usuario";

export class PontoData {
    dataRegistro: string;
    pontoPeriodo: PontoPeriodo;
    pontosUsuario: PontoUsuario[] = [];
    pontoDataStatus: PontoDataStatus;
}