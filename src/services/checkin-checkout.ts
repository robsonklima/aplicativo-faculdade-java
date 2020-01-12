import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';

import { Config } from '../models/config';
import { Observable } from "rxjs/Observable";
import { Checkin } from '../models/checkin';

@Injectable()
export class CheckinCheckoutService {
  constructor(
    private http: Http
  ) { }

  buscarCheckinApi(codOs: number): Observable<any> {
    return this.http.get(Config.API_URL + 'Checkin/' + codOs)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarCheckoutApi(codOs: number): Observable<any> {
    return this.http.get(Config.API_URL + 'Checkout/' + codOs)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  enviarCheckinApi(checkin: Checkin): Observable<any> {
    return this.http.post(Config.API_URL + 'Checkin', checkin)
      .timeout(60000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }
}