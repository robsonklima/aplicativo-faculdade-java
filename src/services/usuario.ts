import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';

import { Config } from './../config/config';
import { Observable } from "rxjs/Observable";
import { Usuario } from '../models/usuario';
import { UsuarioPonto } from '../models/usuario-ponto';
//import { Login } from '../models/login';

@Injectable()
export class UsuarioService {
  private usuario: Usuario;

  constructor(
    private http: Http
  ) { }

  public obterUsuario(): Promise<Usuario> {
    return new Promise((resolve, reject) => {
      resolve(this.usuario)
    });
  }

  public salvarCredenciais(usuario: Usuario) {
    this.usuario = usuario;
  }

  public login(usuario: Usuario): Observable<Usuario> {
    return this.http.post(Config.API_URL + 'Login', usuario)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  public recuperarSenha(usuario: string): Observable<any> {
    return this.http.get(Config.API_URL + 'SenhaRecuperacao/' + usuario)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  public alterarSenha(usuario: Usuario, senhaAntiga: string, 
    novaSenha: string): Observable<string> {
    let dados = {
      usuario: usuario,
      senhaAntiga: senhaAntiga,
      novaSenha: novaSenha
    }

    return this.http.post(Config.API_URL + 'SenhaAlteracao/', dados)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  public verificarSenhaExpirada(): Observable<boolean> {
    return this.http.get(Config.API_URL + 'SenhaExpiracao/' + this.usuario.codUsuario)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  public buscarRegistrosPonto(codUsuario: string): Observable<UsuarioPonto> {
    return this.http.get(Config.API_URL + 'UsuarioPonto/' + codUsuario)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }
}