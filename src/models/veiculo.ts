import { Foto } from "./foto";
import { CondicaoVeiculo } from "./condicao-veiculo";

export class Veiculo {
  placa: string;
  fotos: Foto[];
  condicaoVeiculo: CondicaoVeiculo;
}