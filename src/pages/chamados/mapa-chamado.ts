import { Component } from '@angular/core';
import { LoadingController, Platform, NavParams, NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import { Config } from '../../models/config';
import { Chamado } from '../../models/chamado';

import leaflet from 'leaflet';
import 'leaflet-routing-machine';
import { DadosGlobaisService } from '../../services/dados-globais';
import { DadosGlobais } from '../../models/dados-globais';
import { MapaMarkerPage } from './mapa-marker';

declare var L: any;


@Component({
  selector: 'mapa-chamado',
  template: `
    <ion-header>
      <ion-navbar>
        <ion-title>
            Mapa do Chamado {{ chamado?.codOs }}
        </ion-title>
      </ion-navbar>
    </ion-header>

    <ion-content>
      <div class="map-container"> 
        <div id="mapId" style="width: 100%; height: 100%"> 
        </div> 
      </div>

      <button *ngIf='false' class="ion-button" ion-button color="dark" clear (click)='telaCorrecaoEndereco()'>Endereço Incorreto?</button>
    </ion-content>
  `
})

export class MapaChamadoPage {
  dg: DadosGlobais;
  chamado: Chamado;
  map: any;
  minhaPosicao: leaflet.PointTuple;
  posicaoB: leaflet.PointTuple;
  distancia: string;
  tempo: string;

  constructor(
    private plt: Platform,
    private navCtrl: NavController,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private dadosGlobaisService: DadosGlobaisService,
    private geolocation: Geolocation,
  ) {
    this.chamado = this.navParams.get('chamado');
  }

  ionViewDidEnter() {
    this.carregarDadosGlobais()
      .then(() => {
        this.plt.ready().then(() => {
          const loader = this.loadingCtrl.create({ 
            content: Config.MSG.OBTENDO_LOCALIZACAO,
            enableBackdropDismiss: true, 
            dismissOnPageChange: true 
          });
          
          loader.present();
    
          this.geolocation.getCurrentPosition(Config.POS_CONFIG).then((loc) => {
            loader.dismiss().then(() => {
              this.minhaPosicao = [loc.coords.latitude, loc.coords.longitude];
              
              this.carregarMapa();
            }).catch(() => { loader.dismiss() });
          }).catch(() => { loader.dismiss() });
        }).catch(() => {});
      })
      .catch(() => {});
  }

  public telaCorrecaoEndereco() {
    this.navCtrl.push(MapaMarkerPage);
  }

  private carregarDadosGlobais(): Promise<DadosGlobais> {
    return new Promise((resolve, reject) => {
      this.dadosGlobaisService.buscarDadosGlobaisStorage()
        .then((dados) => {
          if (dados)
            this.dg = dados;
            resolve(dados);
        })
        .catch((err) => {
          reject(new Error(err.message))
        });
    });
  }

  private carregarMapa() {
    this.map = leaflet.map('mapId', {
      center: this.minhaPosicao,
      zoom: 12
    });

    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: Config.NOME_APP }).addTo(this.map);

    let popups: any = [];
    let icons: any = [];
    let wps: any = [];

    popups.push(this.dg.usuario.nome);
    icons.push(L.icon({
      iconUrl: Config.L.ICONES.VERDE,
      shadowUrl: Config.L.SOMBRA,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      shadowSize: [41, 41],
      shadowAnchor:  [12, 41],
      popupAnchor: [0, -41]
    }));
    wps.push(L.latLng( this.minhaPosicao ));

    popups.push(this.chamado.codOs.toString() + ' - ' + this.chamado.localAtendimento.nomeLocalAtendimento);
    icons.push(L.icon({
      iconUrl: Config.L.ICONES.VERMELHO,
      shadowUrl: Config.L.SOMBRA,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      shadowSize: [41, 41],
      shadowAnchor:  [12, 41],
      popupAnchor: [0, -41]
    }));
    wps.push(L.latLng([ this.chamado.localAtendimento.localizacao.latitude, this.chamado.localAtendimento.localizacao.longitude ]));
    
    L.Routing.control({
      createMarker: function (i: number, waypoint: any) {
        const marker = L.marker(waypoint.latLng, {
          draggable: false,
          bounceOnAdd: false,
          bounceOnAddOptions: {
            duration: 1000,
            height: 800
          },
          icon: icons[i]
        }).bindPopup((i + 1) + ': ' + (popups[i] ? popups[i] : ''));
        return marker;
      },
      waypoints: wps,
      show: false,
      language: 'pt-BR',
      lineOptions: {
        styles: [{ color: 'green', opacity: 1, weight: 4 }]
      }
    }).addTo(this.map)
    
    var bounds = L.latLngBounds(wps);
    this.map.fitBounds(bounds);
  }
}