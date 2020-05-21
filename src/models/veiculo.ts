import { Foto } from "./foto";
import { AcessorioVeiculo } from "./acessorio-veiculo";

export class Veiculo {
  placa: string;
  odometro: string;
  fotos: Foto[];
  acessorios: AcessorioVeiculo[];
}