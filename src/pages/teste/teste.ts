import { Component } from '@angular/core';
import { GeolocationService } from '../../services/geo-location';

import leaflet from 'leaflet';
import 'leaflet-routing-machine';
declare var L: any;


@Component({
  selector: 'teste-page',
  templateUrl: 'teste.html'
})
export class TestePage {
  mapa: any;
  
  constructor(
    private geolocation: GeolocationService
  ) {}

  ionViewWillEnter() {
    this.atualizarMapa([-29.952476, -51.102448]).then(r => { console.log(r) });
  }

  private atualizarMapa(destino: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.geolocation.buscarUltimaLocalizacao().then((loc) => {
        if (!loc) return;

        if (this.mapa != undefined) this.mapa.remove();
      
        this.mapa = leaflet.map('mapa');
        let wps: any = [];
        
        wps.push(L.latLng([loc.latitude, loc.longitude]));
        wps.push(L.latLng(destino));
        
        let route = L.Routing.control({ waypoints: wps }).addTo(this.mapa);
        var bounds = L.latLngBounds(wps);
        this.mapa.fitBounds(bounds);

        route.on('routesfound', (e) => {
          var routes = e.routes;
          var summary = routes[0].summary;
          let distancia = (summary.totalDistance / 1000).toFixed(2);
          let tempo = Math.round(summary.totalTime % 3600 / 60).toFixed(0);

          resolve(`Distância: ${distancia} km, tempo: ${tempo} min`);
        });
      }).catch(() => {
        reject();
      });
   });
  }
}