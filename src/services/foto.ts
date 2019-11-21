import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/Rx';

import { Config } from '../models/config';

import { Foto } from '../models/foto';

@Injectable()
export class FotoService {
  foto: Foto;

  constructor(
    private http: Http
  ) { }
  
  public cadastrarFoto(foto: Foto): Observable<any> {
    return this.http.post(Config.API_URL + 'RatImagemUpload', foto)
      .timeout(20000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }
}