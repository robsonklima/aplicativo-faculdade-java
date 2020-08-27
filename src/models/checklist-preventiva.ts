import { ChecklistPreventivaItem } from "./checklist-preventiva-item";
import { Foto } from "./foto";

export class ChecklistPreventiva {
    codChecklistPreventiva: number;
    codOS: number;
    TensaoSemCarga: number;
    tensaoComCarga: number;
    tensaoEntreTerraENeutro: number;
    redeEstabilizada: number;
    possuiNoBreak: number;
    possuiArCondicionado: number;
    temperatura: number;
    justificativa: string;
    indAtivo: number;
    itens: ChecklistPreventivaItem[] = [];
    fotos: Foto[] = [];
}