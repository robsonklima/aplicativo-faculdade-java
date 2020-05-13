import { Foto } from "./foto";
import { CondicaoVeiculo } from "./condicao-veiculo";
import { AcessorioVeiculo } from "./acessorio-veiculo";

export class Veiculo {
  placa: string;
  fotos: Foto[];
  acessoriosVeiculo: AcessorioVeiculo[];
}