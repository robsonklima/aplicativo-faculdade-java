import { Tecnico } from './tecnico';
import { RatDetalhe } from "./rat-detalhe";
import { Foto } from './foto';
import { Laudo } from './laudo';

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
	laudos: Laudo[];
	fotos: Foto[];
	codUsuarioCad: string;
	horarioInicioIntervalo: string;
	horarioTerminoIntervalo: string;
}