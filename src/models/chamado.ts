import { Checkout } from './checkout';
import { Checkin } from './checkin';
import { Tecnico } from './tecnico';
import { Cliente } from './cliente';
import { StatusServico } from "./status-servico";
import { LocalAtendimento } from './local-atendimento';
import { EquipamentoContrato } from './equipamento-contrato';
import { TipoIntervencao } from './tipo-intervencao';
import { Rat } from './rat';

export class Chamado {
	codOs: number;
	dataHoraAberturaOS: string;
	dataHoraSolicitacaoOS: string;
	nomeSolicitante: string;
	numOsCliente: string;
	codTecnico: number;
	tecnico: Tecnico;
	cliente: Cliente;
	statusServico: StatusServico;
	localAtendimento: LocalAtendimento;
	equipamentoContrato: EquipamentoContrato;
	tipoIntervencao: TipoIntervencao;
	rats: Rat[];
	defeitoRelatado: string;
	observacao: string;
	checkin: Checkin;
	checkout: Checkout;
	dataHoraAgendamento: Date;
	dataHoraFechamento: string;
	dataFimSLA: string;
	codUsuarioHoraOSMobileLida: string;
	dataHoraOSMobileLida: string;
	codUsuarioMarcaEspecial: string;
	descMotivoMarcaEspecial: string;
	indBloqueioReincidencia: number;
	indRatEletronica: number;
	indCercaEletronicaLiberada: number;
}