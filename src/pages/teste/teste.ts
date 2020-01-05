import { Component } from '@angular/core';
import { GeolocationService } from '../../services/geo-location';
import { ToastFactory } from '../../factories/toast-factory';

declare var L: any;
import { Map, tileLayer, marker, GeometryUtil } from 'leaflet';
import 'leaflet-routing-machine';
import { Localizacao } from '../../models/localizacao';


@Component({
  selector: 'teste-page',
  templateUrl: 'teste.html'
})
export class TestePage {
  wps: any = [];
  
  constructor(
    private geolocation: GeolocationService,
    private toast: ToastFactory
  ) {}

  ionViewWillEnter() {
    this.wps.push([-29.955013, -51.034679]);
    this.wps.push([-29.952476, -51.102448]);


    let localizacao = new Localizacao();
    localizacao.latitude = -29.952476;
    localizacao.longitude = -51.102448;
    
    this.geolocation.buscarDetalhesLocalPorCoordenadasApi(localizacao).subscribe((r) => { 
      console.log(r);
    }, e => {});
  }
}