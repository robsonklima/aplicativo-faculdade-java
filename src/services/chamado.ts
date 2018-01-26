import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Storage } from "@ionic/storage";
import 'rxjs/Rx';
import { Observable } from "rxjs/Observable";

import { Config } from './../config/config';
import { Chamado } from "../models/chamado";

@Injectable()
export class ChamadoService {
  private chamados: Chamado[] = [];

  constructor(
    private http: Http,
    private storage: Storage
  ) { }

  buscarChamadosApi(codTecnico: number): Observable<Chamado[]> {
    return this.http.get(Config.API_URL + 'OsTecnico/' + codTecnico)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  atualizarChamadosStorage(chamados: Chamado[]): Promise<any> {
    this.chamados = chamados;

    return new Promise((resolve, reject) => {
      this.storage.set('Chamados', this.chamados)
        .then((res) => {
          resolve(res);
        })
        .catch(err => console.log(err));
    });
  }

  fecharChamadoApi(chamado: Chamado): Observable<any> {
    return this.http.post(Config.API_URL + 'OsTecnico', chamado)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  registrarLeituraChamadoApi(chamado: Chamado): Observable<any> {
    return this.http.post(Config.API_URL + 'OsTecnicoLeitura', chamado)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarChamadosStorage(): Promise<Chamado[]> {
    return new Promise((resolve, reject) => {
      resolve(
        this.storage.get('Chamados')
          .then(
          (chamados: Chamado[]) => {
            this.chamados = chamados != null ? chamados : [];
            
            return this.chamados.slice();
          })
          .catch()
        )
    });
  }

  verificarExisteCheckinEmOutroChamado(): boolean {
    let checkinEncontrado: boolean = false;

    this.chamados.forEach(chamado => {
      if ((chamado.checkin.localizacao.latitude !== null 
            && chamado.checkin.localizacao.longitude !== null)
            && (chamado.checkout.localizacao.latitude === null 
            && chamado.checkout.localizacao.longitude === null)) {
        checkinEncontrado = true;
      }
    });

    return checkinEncontrado;
  }
  
  apagarChamadoStorage(chamado: Chamado): Promise<any> {
    return new Promise((resolve, reject) => {
      for (var i = 0; i < this.chamados.length; i++) {
        if (this.chamados[i].codOs == chamado.codOs)
          this.chamados.splice(i, 1);
      }

      this.storage.set('Chamados', this.chamados)
        .then((res) => {
          resolve(res);
        })
        .catch(err => console.log(err));
    });
  }

  apagarChamadosStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      for (var i = 0; i < this.chamados.length; i++) {
        this.chamados.splice(i, 100);
      }

      this.storage.set('Chamados', this.chamados)
        .then((res) => {
          resolve(res);
        })
        .catch(err => console.log(err));
    });
  }

  atualizarChamado(chamado: Chamado): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(
        this.storage.get('Chamados')
          .then((chamados: Chamado[]) => {
            chamados.forEach((ch, i) => {
              if (chamado.codOs == ch.codOs) {
                this.chamados.splice(i, 1);
                this.chamados.push(chamado);
                this.storage.set('Chamados', this.chamados)
                  .then(() => {})
                  .catch();
              }
            });
          })
          .catch())
    });
  }
}