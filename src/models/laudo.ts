import { Foto } from "./foto";

export class Laudo {
    codOS: number;
    codTecnico: number;
    indAtivo: number;
    dataHoraCad: string;
    observacoes: string;
    testeFuncional: string;
    eventosErro: string;
    acoes: string;
    conclusao: string;
    fotos: Foto[];
  }