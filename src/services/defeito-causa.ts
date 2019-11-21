import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Storage } from "@ionic/storage";
import 'rxjs/Rx';

import { Config } from './../config/config';
import { Observable } from "rxjs/Observable";
import { DefeitoCausa } from '../models/defeito-causa';


@Injectable()
export class DefeitoCausaService {
  private defeitosCausas: DefeitoCausa[] = [];

  constructor(
    private http: Http,
    private storage: Storage
  ) { }

  buscarDefeitosCausasApi(): Observable<DefeitoCausa[]> {
    return this.http.get(Config.API_URL + 'DefeitoCausa')
      .map((res: Response) => { this.storage.set('DefeitosCausas', res.json()).catch() })
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarDefeitosCausasStorage() {
    return this.storage.get('DefeitosCausas').then((dCausas: DefeitoCausa[]) => {
      this.defeitosCausas = dCausas != null ? dCausas : [];
      return this.defeitosCausas.slice();
    })
    .catch();
  }
}