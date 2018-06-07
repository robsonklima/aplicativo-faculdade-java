import { UsuarioPerfil } from "./usuario-perfil";
import { Filial } from "./filial";

export class Usuario {
	codUsuario?: string;
	senha: string;
    codTecnico: number;
    nome: string;
    email: string;
    usuarioPerfil: UsuarioPerfil;
    filial: Filial;
}