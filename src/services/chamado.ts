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

import moment from 'moment';

@Injectable()
export class ChamadoService {
  private chamados: Chamado[] = [];

  constructor(
    private http: Http,
    private storage: Storage
  ) { }

  buscarChamadosApi(codTecnico: number): Observable<Chamado[]> {
    return this.http.get(Config.API_URL + 'OsTecnico/' + codTecnico)
      .timeout(15000)
      .delay(500)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  fecharChamadoApi(chamado: Chamado): Observable<any> {
    return this.http.post(Config.API_URL + 'OsTecnico', chamado)
      .timeout(15000)
      .delay(500)
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

        console.log(moment().format('HH:mm:ss'), 'Chamados Storage Carregados');

        resolve (this.chamados.slice());
      })
      .catch(() => {
        console.log(moment().format('HH:mm:ss'), 'Erro ao Carregar Chamados Storage');

        reject();
      });
    });
  }

  atualizarChamadosStorage(chamados: Chamado[]): Promise<boolean> {
    this.chamados = chamados;

    return new Promise((resolve, reject) => {
      this.storage.set('Chamados', this.chamados)
        .then((res) => {
          console.log(moment().format('HH:mm:ss'), 'Chamados Storage Atualizados');

          resolve(true);
        })
        .catch(() => {
          console.log(moment().format('HH:mm:ss'), 'Erro ao Atualizar Chamados Storage');

          reject(false);
        });
    });
  }

  verificarExisteCheckinEmOutroChamado(): boolean {
    return (this.chamados.filter((c) => {
      return ((c.checkin.localizacao.latitude || c.checkin.localizacao.longitude) 
        && !c.dataHoraFechamento);
    }).length > 0);
  }
  
  apagarChamadoStorage(chamado: Chamado): Promise<boolean> {
    this.chamados = this.chamados.filter((c) => {
      return (c.codOs.toString().indexOf(chamado.codOs.toString()) < 0);
    });

    return new Promise((resolve, reject) => {
      this.storage.set('Chamados', this.chamados)
        .then(() => {
          console.log(moment().format('HH:mm:ss'), 'Chamado Storage Apagado');

          resolve(true);
        })
        .catch(() => {
          console.log(moment().format('HH:mm:ss'), 'Erro ao Apagar Chamado Storage');

          reject(false);
        });
    });
  }

  apagarChamadosStorage(): Promise<boolean> {
    this.chamados = [];

    return new Promise((resolve, reject) => {
      this.storage.set('Chamados', this.chamados)
        .then(() => {
          console.log(moment().format('HH:mm:ss'), 'Chamados Storage Apagados');

          resolve(true);
        })
        .catch(() => {
          console.log(moment().format('HH:mm:ss'), 'Erro ao Apagar Chamados Storage');

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