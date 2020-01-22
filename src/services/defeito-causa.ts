import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';

import { Observable } from "rxjs/Observable";
import { DefeitoCausa } from '../models/defeito-causa';


@Injectable()
export class DefeitoCausaService {
  constructor(
    private http: Http
  ) { }

  buscarDefeitosCausasArquivo(): Observable<DefeitoCausa[]> {
    return this.http.get('assets/data/defeitos-causas.json')
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }
}