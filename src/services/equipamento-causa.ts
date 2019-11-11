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
      .map((res: Response) => {
        this.insereEquipamentosCausasStorage(res.json());
      })
      .catch((error: any) => Observable.throw(error.json()));
  }

  insereEquipamentosCausasStorage(eCausas: EquipamentoCausa[]) {
    eCausas.forEach(e => {
      if (!this.equipamentoAcaoEstaNoStorage(e.equipamento.codEquip)) {
        this.equipamentosCausas.push(e);
      }
    });

    this.storage.set('EquipamentosCausas', eCausas).then().catch();
  }

  buscarEquipamentosCausasStorage() {
    return this.storage.get('EquipamentosCausas').then((eCausas: EquipamentoCausa[]) => {
      this.equipamentosCausas = eCausas != null ? eCausas : [];
      return this.equipamentosCausas.slice();
    })
    .catch();
  }

  equipamentoAcaoEstaNoStorage(codEquip: number): boolean {
    let found: boolean = false;

    this.equipamentosCausas.forEach(e => {
      if (e.equipamento.codEquip === codEquip) {
        found = true;
      }
    });

    return found;
  }
}