import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';

import { Observable } from "rxjs/Observable";
import { AcaoCausa } from '../models/acao-causa';


@Injectable()
export class AcaoCausaService {
  constructor(
    private http: Http
  ) { }

  buscarAcoesCausasArquivo(): Observable<AcaoCausa[]> {
    return this.http.get('assets/data/acoes-causas.json')
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }
}