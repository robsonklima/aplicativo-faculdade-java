import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';

import { Config } from './../config/config';
import { Observable } from "rxjs/Observable";
import { MensagemTecnico } from '../models/mensagem-tecnico';

@Injectable()
export class MensagemTecnicoService {
  constructor(
    private http: Http
  ) { }

  buscarMensagensTecnicoApi(codUsuario: string): Observable<MensagemTecnico[]> {
    return this.http.get(Config.API_URL + 'MensagemTecnico/' + codUsuario)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  enviarMensagemTecnicoApi(mensagemTecnico: MensagemTecnico): Observable<any> {
    return this.http.post(Config.API_URL + 'MensagemTecnico', mensagemTecnico)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }
}