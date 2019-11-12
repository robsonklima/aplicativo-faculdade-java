import { Tecnico } from './tecnico';
import { RatDetalhe } from "./rat-detalhe";
import { Foto } from './foto';
import { Laudo } from './laudo';
import { EquipamentoPOS } from './equipamentoPOS';
import { MotivoComunicacao } from './motivo-comunicacao';
import { TipoComunicacao } from './tipo-comunicacao';
import { OperadoraTelefonia } from './operadora-telefonia';
import { MotivoCancelamento } from './motivo-cancelamento';

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
	equipamentoRetirado: EquipamentoPOS;
	numSerieRetirada: string;
	equipamentoInstalado: EquipamentoPOS;
	numSerieInstalada: string;
	rede: string;
	tipoComunicacao: TipoComunicacao
	motivoComunicacao: MotivoComunicacao;
	motivoCancelamento: MotivoCancelamento;
	operadoraChipRetirado: OperadoraTelefonia;
	nroChipRetirado: string;
	operadoraChipInstalado: OperadoraTelefonia;
	nroChipInstalado: string;
	obsMotivoComunicacao: string;
}