import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';

import { Config } from './../config/config';
import { Observable } from "rxjs/Observable";
import { Problema } from '../models/problema';

@Injectable()
export class ProblemaService {
  constructor(
    private http: Http
  ) { }

  public reportarProblema(problema: Problema): Observable<any> {
    return this.http.post(Config.API_URL + 'Problema', problema)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }
}