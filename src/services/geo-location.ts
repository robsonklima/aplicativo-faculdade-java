import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Config } from './../config/config';
import { Observable } from "rxjs/Observable";

@Injectable()
export class GeolocationService {

  constructor(
    private http: Http
  ) { }

  buscarCoordenadasPorEndereco(endereco: string): Observable<any> {
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' 
      + endereco + '&key=' + Config.GOOGLE_KEY)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarDistanciaDuracao(latOrigem, lngOrigem, latDestino, lngDestino): Observable<any> {
    return this.http.get('https://maps.googleapis.com/maps/api/distancematrix/json?'
      + 'origins=' + latOrigem + ',' + lngOrigem + '&destinations=' + latDestino + ',' + lngDestino
      + '&mode=driving&language=en-EN&key=' + Config.GOOGLE_KEY)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarCoordenadasPorIp(): Observable<any> {
    return this.http.get('http://ip-api.com/json/')
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }
}