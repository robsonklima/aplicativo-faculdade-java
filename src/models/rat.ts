import { Tecnico } from './tecnico';
import { RatDetalhe } from "./rat-detalhe";

export class Rat {
	codRat?: number;
	codOs?: number;
	numRat: string;
	tecnico: Tecnico;
	dataInicio: string;
	dataSolucao: string;
	horaInicio: string;
	horaSolucao: string;
	dataHoraSolucao?: string;
	nomeAcompanhante: string;
	relatoSolucao: string;
	obsRAT: string;
	ratDetalhes: RatDetalhe[];
	codUsuarioCad: string;
	horarioInicioIntervalo: string;
	horarioTerminoIntervalo: string;
}