import { Foto } from "./foto";
import { AcessorioVeiculo } from "./acessorio-veiculo";

export class Veiculo {
  placa: string;
  odometro: string;
  nivelCombustivel: number;
  fotos: Foto[];
  acessorios: AcessorioVeiculo[];
}