import { UsuarioPerfil } from "./usuario-perfil";

export class Usuario {
	codUsuario?: string;
	senha: string;
    codTecnico: number;
    nome: string;
    email: string;
    usuarioPerfil: UsuarioPerfil;
}