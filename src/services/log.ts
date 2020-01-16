import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Log } from '../models/log';
import moment from 'moment';


@Injectable()
export class LogService {
  logs: Log[] = [];

  constructor(private storage: Storage) {}

  buscarLogs(): Promise<Log[]> {
    return new Promise((resolve, reject) => {
      this.storage.get('Logs').then((logs: Log[]) => {
        this.logs = logs != null ? logs
          .sort((a, b) => { return ((a.dataHoraCad > b.dataHoraCad) ? -1 : ((a.dataHoraCad < b.dataHoraCad) ? 1 : 0))}) : [];

        resolve (this.logs);
      })
      .catch(() => {
        reject();
      });
    });
  }

  adicionarLog(tipo: string, mensagem: string) {
    let log = new Log();
    log.tipo = tipo;
    log.dataHoraCad = moment().format('DD/MM HH:mm:ss');
    log.mensagem = mensagem;

    this.buscarLogs().then(logs => {
      this.logs = logs;
      this.logs.push(log);
      this.storage.set('Logs', this.logs).catch();
    }).catch();
  }

  apagarLogs(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logs = [];

      this.storage.set('Logs', this.logs)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          reject(false);
        });
    });
  }
}