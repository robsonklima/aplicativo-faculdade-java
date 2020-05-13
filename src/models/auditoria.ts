import { Condutor } from "./condutor";
import { Veiculo } from "./veiculo";
import { AuditoriaStatus } from "./auditoria-status";
import { Usuario } from "./usuario";

export class Auditoria {
  usuario: Usuario;
  condutor: Condutor;
  veiculo: Veiculo;
  auditoriaStatus: AuditoriaStatus;
  assinaturaTecnico: string;
}