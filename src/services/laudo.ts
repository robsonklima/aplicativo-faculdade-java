import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';

import { Config } from './../config/config';
import { Observable } from "rxjs/Observable";

@Injectable()
export class LaudoService {
  constructor(
    private http: Http
  ) { }

  buscarLaudosControleApi(codTecnico: number): Observable<any[]> {
    return this.http.get(Config.API_URL + 'LaudoControle/' + codTecnico)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json())
    );
  }
}