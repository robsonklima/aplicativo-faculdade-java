import { Component } from '@angular/core';
import { NavParams, ViewController} from 'ionic-angular';
import { Map, tileLayer, marker } from 'leaflet';
import { Localizacao } from '../../models/localizacao';


@Component({
  selector: 'mapa-page',
  template: `
    <ion-header>
      <ion-navbar>
        <ion-buttons end>
          <button ion-button icon-only (click)="fecharModal()">
            <ion-icon name="close"></ion-icon>
          </button>
        </ion-buttons>

        <ion-title>{{ popup }}</ion-title>
      </ion-navbar>
    </ion-header>

    <ion-content>
      <div class="map-container"> 
        <div id="mapa"></div> 
      </div>
    </ion-content>
  `
})

export class MapaPage {
  localizacao: Localizacao;
  popup: string;
  map: any;
  
  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams
  ) {
    this.popup = this.navParams.get('popup');
    this.localizacao = this.navParams.get('localizacao');
  }

  ngOnInit() {
    this.carregarMapa();
  }

  private carregarMapa() {
    if (this.map != undefined) this.map.remove();

    this.map = new Map('mapa').setView([this.localizacao.latitude, this.localizacao.longitude], 10);
    tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    marker([ this.localizacao.latitude, this.localizacao.longitude ]).addTo(this.map).bindPopup(this.popup).openPopup();
  }

  public fecharModal() {
    this.viewCtrl.dismiss();
  }
}