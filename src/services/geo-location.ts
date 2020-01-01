import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Platform, AlertController } from 'ionic-angular';

import { Localizacao } from '../models/localizacao';
import { Config } from '../models/config';
import { Observable } from "rxjs/Observable";
import { Diagnostic } from '@ionic-native/diagnostic';


@Injectable()
export class GeolocationService {

  constructor(
    private http: Http,
    private platform: Platform,
    private diagnostic: Diagnostic,
    private alertCtrl: AlertController
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

  enviarLocalizacao(localizacao: Localizacao): Observable<any> {
    return this.http.post(Config.API_URL + 'LocalizacaoTecnico/', localizacao)
      .timeout(20000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  verificarSeGPSEstaAtivoEDirecionarParaConfiguracoes() {
    if (!this.platform.is('cordova')) return;

    this.diagnostic.isLocationEnabled().then((isEnabled) => {
      if(!isEnabled){
        const confirmacao = this.alertCtrl.create({
          title: 'GPS Desativado',
          message: 'Favor ativar o GPS do seu smartphone para que o aplicativo possa sincronizar seus chamados',
          buttons: [
            {
              text: 'Ok',
              handler: () => {
                this.diagnostic.switchToLocationSettings();
              }
            }
          ]
        });
    
        confirmacao.present();
      }
    })
  }
}