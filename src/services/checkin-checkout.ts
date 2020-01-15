import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';

import { Config } from '../models/config';
import { Observable } from "rxjs/Observable";
import { Checkin } from '../models/checkin';
import { LogService } from './log';

@Injectable()
export class CheckinCheckoutService {
  constructor(
    private http: Http,
    private logService: LogService
  ) { }

  buscarCheckinApi(codOs: number): Observable<any> {
    return this.http.get(Config.API_URL + 'Checkin/' + codOs)
    .map((res: Response) => {
      this.logService.adicionarLog({
        tipo: Config.LOG.TIPOS.SUCCESS, 
        mensagem: `${res.status} ${res.statusText} - GET ${res.url.replace(Config.API_URL, '')}`
      });
      return res.json()
    })
    .catch((error: Error) => {
      this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
      return Observable.throw(error);
    });
  }

  enviarCheckinApi(checkin: Checkin): Observable<any> {
    return this.http.post(Config.API_URL + 'Checkin', checkin)
    .map((res: Response) => {
      this.logService.adicionarLog({
        tipo: Config.LOG.TIPOS.SUCCESS, 
        mensagem: `${res.status} ${res.statusText} - POST ${res.url.replace(Config.API_URL, '')}`
      });
      return res.json()
    })
    .catch((error: Error) => {
      this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
      return Observable.throw(error);
    });
  }

  buscarCheckoutApi(codOs: number): Observable<any> {
    return this.http.get(Config.API_URL + 'Checkout/' + codOs)
    .map((res: Response) => {
      this.logService.adicionarLog({
        tipo: Config.LOG.TIPOS.SUCCESS, 
        mensagem: `${res.status} ${res.statusText} - GET ${res.url.replace(Config.API_URL, '')}`
      });
      return res.json()
    })
    .catch((error: Error) => {
      this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
      return Observable.throw(error);
    });
  }
}