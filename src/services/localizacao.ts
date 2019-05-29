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

  enviarLocalizacao(localizacao: Localizacao): Observable<any> {
    return this.http.post(Config.API_URL + 'Localizacao/', localizacao)
      .timeout(20000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }
}