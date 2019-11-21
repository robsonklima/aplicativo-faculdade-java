import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Storage } from "@ionic/storage";
import 'rxjs/Rx';

import { Config } from './../config/config';
import { Observable } from "rxjs/Observable";
import { EquipamentoCausa } from '../models/equipamento-causa';


@Injectable()
export class EquipamentoCausaService {
  private equipamentosCausas: EquipamentoCausa[] = [];

  constructor(
    private http: Http,
    private storage: Storage
  ) { }

  buscarEquipamentosCausasApi(): Observable<EquipamentoCausa[]> {
    return this.http.get(Config.API_URL + 'EquipamentoCausa')
      .map((res: Response) => { this.storage.set('EquipamentosCausas', res.json()).catch() })
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarEquipamentosCausasStorage() {
    return this.storage.get('EquipamentosCausas').then((eCausas: EquipamentoCausa[]) => {
      this.equipamentosCausas = eCausas != null ? eCausas : [];
      return this.equipamentosCausas.slice();
    }).catch();
  }

  buscarCausasPorEquipamento(codEquip: number): Promise<EquipamentoCausa[]> {
    return new Promise((resolve, reject) => {
      this.buscarEquipamentosCausasStorage().then((eCausas: EquipamentoCausa[]) => { 
        let equipamentosCausas: EquipamentoCausa[] = eCausas.filter(equipamentosCausas => {
          return Number(equipamentosCausas.equipamento.codEquip) === codEquip;
        });
        
        resolve(equipamentosCausas);
      }).catch(() => {
        reject();
      });
    });
  }
}