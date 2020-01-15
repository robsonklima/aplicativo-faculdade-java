import { Injectable } from '@angular/core';

import { Log } from '../models/log';
import moment from 'moment';


@Injectable()
export class LogService {
  logs: Log[] = [];

  constructor() {}

  adicionarLog(log: Log) {
    log.dataHoraCad = moment().format('DD/MM HH:mm:ss');
    this.logs.push(log);    
  }

  buscarLogs(): Log[] {
    return this.logs.sort((a, b) => { return ((a.dataHoraCad > b.dataHoraCad) ? -1 : ((a.dataHoraCad < b.dataHoraCad) ? 1 : 0))});
  }
}