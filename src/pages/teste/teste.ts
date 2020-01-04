import { Component } from '@angular/core';
import { GeolocationService } from '../../services/geo-location';
import { ToastFactory } from '../../factories/toast-factory';

declare var L: any;
import leaflet from 'leaflet';
import 'leaflet-routing-machine';


@Component({
  selector: 'teste-page',
  templateUrl: 'teste.html'
})
export class TestePage {
  wps: any = [];
  distancia: any;
  map: any;

  constructor(
    private geolocation: GeolocationService,
    private toast: ToastFactory
  ) {}

  ionViewWillEnter() {
    // this.geolocation.buscarUltimaLocalizacao().then((u) => {
    //   //this.wps.push(L.latLng([u.latitude, u.longitude]));




    //   this.carregarMapa();
    // }).catch();

    this.wps.push(L.latLng([-29.913801, -50.906105]));
    this.wps.push(L.latLng([-29.932212, -50.935889]));

    this.carregarMapa();
  }

  private carregarMapa() {
    this.map = leaflet.map('mapa-chamado', { center: [this.wps[0].latitude, this.wps[0].longitude], zoom: 12 });
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '<a href="https://maps.google.com/?q=-29.918437,%20-50.914832">Abrir no Maps</a>' }).addTo(this.map);
    let wps: any = [];

    
    let route = L.Routing.control({
      waypoints: wps,
      show: false,
      language: 'pt-BR',
      lineOptions: {
        styles: [{ color: 'green', opacity: 0.8, weight: 4 }]
      }
    }).addTo(this.map);
    
    var bounds = L.latLngBounds(wps);
    this.map.fitBounds(bounds);

    route.on('routesfound', (e) => {
      var routes = e.routes;
      var summary = routes[0].summary;
      this.distancia = (summary.totalDistance / 1000).toFixed(2).replace('.', ',');
      //this.tempo = Math.round(summary.totalTime % 3600 / 60).toFixed(0);
   });
  }
}