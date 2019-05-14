import { LaudoSituacao } from "./laudo-situacao";

export class Laudo {
    relatoCliente: string;
    conclusao: string;
    situacoes: LaudoSituacao[];
    codOS: number;
    codRAT: number;
    codTecnico: number;
    assinatura: string;
    indAtivo: number;
    dataHoraCad: string;
  }