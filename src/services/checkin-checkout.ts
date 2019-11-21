import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';

import { Config } from '../models/config';
import { Observable } from "rxjs/Observable";

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
}