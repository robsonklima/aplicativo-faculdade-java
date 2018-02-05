import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/Rx';

import { Config } from './../config/config';

@Injectable()
export class FotoService {
  constructor(
    private http: Http
  ) { }
  
  public saveImage(imagemNome: string, imagemStr: string): Observable<any> {
    let imagem = { imagemNome: imagemNome, imagemStr: imagemStr }

    return this.http.post(Config.API_URL + 'RatImagemUpload', imagem)
      .timeout(20000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }
}