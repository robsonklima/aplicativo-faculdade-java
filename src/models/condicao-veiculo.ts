import { AcessorioVeiculo } from "./acessorio-veiculo";

export class CondicaoVeiculo {
  agua: boolean;
  oleo: boolean;
  luzes: boolean;
  pneuDianteiro: string;
  pneuTraseiro: string;
  estepe: string;
  revisao: number;
  acessorios: AcessorioVeiculo[];
}