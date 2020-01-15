import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';

import { Config } from '../models/config';
import { Observable } from "rxjs/Observable";
import { MensagemTecnico } from '../models/mensagem-tecnico';
import { LogService } from './log';


@Injectable()
export class MensagemTecnicoService {
  constructor(
    private http: Http,
    private logService: LogService
  ) { }

  buscarMensagensTecnicoApi(codUsuario: string): Observable<MensagemTecnico[]> {
    return this.http.get(Config.API_URL + 'MensagemTecnico/' + codUsuario)
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

  enviarMensagemTecnicoApi(mensagemTecnico: MensagemTecnico): Observable<any> {
    return this.http.post(Config.API_URL + 'MensagemTecnico', mensagemTecnico)
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
}