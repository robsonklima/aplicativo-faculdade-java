import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from "rxjs/Observable";
import 'rxjs/Rx';

import { Config } from './../config/config';
import { Localizacao } from '../models/localizacao';

@Injectable()
export class LocalizacaoService {
  constructor(
    private http: Http
  ) { }

  enviarLocalizacaoParaFilialApi(localizacao: Localizacao, codOS: Number): Observable<any> {
    let loc = { localizacao: localizacao, codOS: codOS };

    return this.http.post(Config.API_URL + 'LocalizacaoEnvio', loc)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }
}