import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Storage } from "@ionic/storage";
import { Observable } from "rxjs/Observable";
import 'rxjs/Rx';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';

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
      .timeout(3000)
      //.delay(1000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  fecharChamadoApi(chamado: Chamado): Observable<any> {
    return this.http.post(Config.API_URL + 'OsTecnico', chamado)
      .timeout(3000)
      .delay(1000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  registrarLeituraChamadoApi(chamado: Chamado): Observable<any> {
    return this.http.post(Config.API_URL + 'OsTecnicoLeitura', chamado)
      .timeout(3000)
      //.delay(1000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarChamadosStorage(): Promise<Chamado[]> {
    return new Promise((resolve, reject) => {
      this.storage.get('Chamados').then((chamados: Chamado[]) => {
        this.chamados = chamados != null ? chamados : [];
        
        resolve (this.chamados.slice());
      })
      .catch(() => {
        reject();
      });
    });
  }

  atualizarChamadosStorage(chamados: Chamado[]): Promise<boolean> {
    this.chamados = chamados;

    return new Promise((resolve, reject) => {
      this.storage.set('Chamados', this.chamados)
        .then((res) => {
          resolve(true);
        })
        .catch(() => {
          reject(false);
        });
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
  
  apagarChamadoStorage(chamado: Chamado): Promise<boolean> {
    this.chamados = this.chamados.filter((c) => {
      return (c.codOs.toString().indexOf(chamado.codOs.toString()) < 0);
    });

    return new Promise((resolve, reject) => {
      this.storage.set('Chamados', this.chamados)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          reject(false);
        });
    });
  }

  apagarChamadosStorage(): Promise<boolean> {
    this.chamados = [];

    return new Promise((resolve, reject) => {
      this.storage.set('Chamados', this.chamados)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          reject(false);
        });
    });
  }

  atualizarChamado(chamado: Chamado): Promise<boolean> {
    this.chamados = this.chamados.filter((c) => {
      return (c.codOs.toString().indexOf(chamado.codOs.toString()) < 0);
    });

    return new Promise((resolve, reject) => {
      this.storage.get('Chamados').then((chamados: Chamado[]) => {
        this.chamados.push(chamado);

        this.storage.set('Chamados', this.chamados).then(() => {
          resolve(true);
        }).catch(() => {
          reject(false);
        });
      })
      .catch(() => {
        reject(false);
      })
    });
  }
}