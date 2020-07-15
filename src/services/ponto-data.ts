import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';

import { Config } from '../models/config';

import { Observable } from "rxjs/Observable";
import { PontoData } from '../models/ponto-data';


@Injectable()
export class PontoDataService {
  constructor(
    private http: Http
  ) {}

  buscarPontosDataPorUsuario(codUsuario: string): Observable<PontoData[]> {
    return this.http.get(Config.API_URL + 'PontoData/' + codUsuario)
      .timeout(60000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error));
  }

  enviarPontoDataApi(pontoData: PontoData): Observable<PontoData> {
    return this.http.post(Config.API_URL + 'PontoData', pontoData)
      .timeout(30000)
      .map((res: Response) => {console.log(res.json()); return res.json()})
      .catch((error: any) => {return Observable.throw(error)});
  }
}