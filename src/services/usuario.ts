import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';

import { Config } from '../models/config';
import { Observable } from "rxjs/Observable";
import { Usuario } from '../models/usuario';
import { UsuarioPonto } from '../models/usuario-ponto';
import { Login } from '../models/login';
import { LogService } from './log';


@Injectable()
export class UsuarioService {
  private usuario: Usuario;

  constructor(
    private http: Http,
    private logService: LogService
  ) { }

  public obterUsuario(): Promise<Usuario> {
    return new Promise((resolve, reject) => {
      resolve(this.usuario)
    });
  }

  public salvarCredenciais(usuario: Usuario) {
    this.usuario = usuario;
  }

  public login(login: Login): Observable<Login> {
    return this.http.post(Config.API_URL + 'UsuarioLogin', login)
      .map((res: Response) => {
        this.logService.adicionarLog({
          tipo: Config.LOG.TIPOS.SUCCESS, 
          mensagem: `${res.status} ${res.statusText} - POST ${res.url.replace(Config.API_URL, '')}`
        });
        return res.json()
      })
      .catch((error: Error) => {
        this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
        return Observable.throw(error);
      });
  }

  public recuperarSenha(usuario: string): Observable<any> {
    return this.http.get(Config.API_URL + 'SenhaRecuperacao/' + usuario)
      .map((res: Response) => {
        this.logService.adicionarLog({
          tipo: Config.LOG.TIPOS.SUCCESS, 
          mensagem: `${res.status} ${res.statusText} - GET ${res.url.replace(Config.API_URL, '')}`
        });
        return res.json()
      })
      .catch((error: Error) => {
        this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
        return Observable.throw(error);
      });
  }

  public alterarSenha(usuario: Usuario, senhaAntiga: string, 
    novaSenha: string): Observable<string> {
    let dados = {
      usuario: usuario,
      senhaAntiga: senhaAntiga,
      novaSenha: novaSenha
    }

    return this.http.post(Config.API_URL + 'SenhaAlteracao/', dados)
      .map((res: Response) => {
        this.logService.adicionarLog({
          tipo: Config.LOG.TIPOS.SUCCESS, 
          mensagem: `${res.status} ${res.statusText} - POST ${res.url.replace(Config.API_URL, '')}`
        });
        return res.json()
      })
      .catch((error: Error) => {
        this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
        return Observable.throw(error);
      });
  }

  public verificarSenhaExpirada(): Observable<boolean> {
    return this.http.get(Config.API_URL + 'SenhaExpiracao/' + this.usuario.codUsuario)
      .map((res: Response) => {
        this.logService.adicionarLog({
          tipo: Config.LOG.TIPOS.SUCCESS, 
          mensagem: `${res.status} ${res.statusText} - GET ${res.url.replace(Config.API_URL, '')}`
        });
        return res.json()
      })
      .catch((error: Error) => {
        this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
        return Observable.throw(error);
      });
  }

  public buscarRegistrosPonto(codUsuario: string): Observable<UsuarioPonto> {
    return this.http.get(Config.API_URL + 'UsuarioPonto/' + codUsuario)
      .map((res: Response) => {
        this.logService.adicionarLog({
          tipo: Config.LOG.TIPOS.SUCCESS, 
          mensagem: `${res.status} ${res.statusText} - GET ${res.url.replace(Config.API_URL, '')}`
        });
        return res.json()
      })
      .catch((error: Error) => {
        this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
        return Observable.throw(error);
      });
  }
}