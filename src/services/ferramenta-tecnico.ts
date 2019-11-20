import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Storage } from "@ionic/storage";
import 'rxjs/Rx';

import { Config } from './../config/config';
import { Observable } from "rxjs/Observable";
import { FerramentaTecnico } from '../models/ferramenta-tecnico';


@Injectable()
export class FerramentaTecnicoService {
  private ferramentas: FerramentaTecnico[] = [];

  constructor(
    private http: Http,
    private storage: Storage
  ) { }

  buscarFerramentasTecnicoApi(): Observable<FerramentaTecnico[]> {
    return this.http.get(Config.API_URL + 'FerramentaTecnico')
      .map((res: Response) => { this.storage.set('FerramentasTecnico', res.json()).catch() })
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarFerramentasTecnicoStorage(): Promise<FerramentaTecnico[]> {
    return new Promise((resolve, reject) => {
      this.storage.get('FerramentasTecnico').then((ferramentas: FerramentaTecnico[]) => {
        this.ferramentas = ferramentas != null ? ferramentas : [];
        resolve(this.ferramentas.slice());
      }).catch(() => {
        reject();
      });
    });
  }
}