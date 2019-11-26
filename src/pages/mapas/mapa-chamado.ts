import { Component } from '@angular/core';
import { LoadingController, Platform, NavParams, ModalController, ActionSheetController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import { Config } from '../../models/config';
import { Chamado } from '../../models/chamado';

import leaflet from 'leaflet';
import 'leaflet-routing-machine';
import { DadosGlobaisService } from '../../services/dados-globais';
import { DadosGlobais } from '../../models/dados-globais';
import { MapaEnderecoCorrecaoPage } from './mapa-endereco-correcao';
import { ChamadoService } from '../../services/chamado';

declare var L: any;


@Component({
  selector: 'mapa-chamado',
  template: `
    <ion-header>
      <ion-navbar>
        <ion-buttons end>
          <button 
            ion-button 
            icon-only 
            (click)="exibirActionSheet()">
            <ion-icon name="options"></ion-icon>
          </button>
        </ion-buttons>   

        <ion-title>Chamado {{ chamado?.codOs }}</ion-title>
      </ion-navbar>
    </ion-header>

    <ion-content>
      <div class="map-container"> 
        <div id="mapa-chamado" style="width: 100%; height: 100%"> 
        </div> 
      </div>
    </ion-content>

    <ion-footer *ngIf="distancia" color="light">
      <ion-toolbar>
        <ion-title><span class="footer">Distância: {{ distancia }} km</span></ion-title>
      </ion-toolbar>
    </ion-footer>
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
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private dadosGlobaisService: DadosGlobaisService,
    private chamadoService: ChamadoService,
    private geolocation: Geolocation,
  ) {
    this.chamado = this.navParams.get('chamado');
  }

  ionViewWillEnter() {
    this.carregarDadosGlobais()
      .then(() => {
        this.plt.ready().then(() => {
          const loader = this.loadingCtrl.create({ content: Config.MSG.OBTENDO_LOCALIZACAO });
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
    this.map = leaflet.map('mapa-chamado', { center: this.minhaPosicao, zoom: 12 });
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
    wps.push(L.latLng([ 
      this.chamado.localAtendimento.localizacao.latitude, 
      this.chamado.localAtendimento.localizacao.longitude 
    ]));
    
    let route = L.Routing.control({
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

  public exibirActionSheet() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Mais Opções',
      buttons: [
        {
          text: 'Corrigir Endereço',
          handler: () => {
            const modal = this.modalCtrl.create(MapaEnderecoCorrecaoPage, { chamado: this.chamado });

            modal.present();
            modal.onDidDismiss((chamado) => {
              this.chamado = chamado;
              
              this.chamadoService.atualizarChamado(this.chamado).then(() => {
                console.log(this.chamado);
                
              }).catch((e) => {
                console.log(e);
              });
            }); 
          }
        }, {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            
          }
        }
      ]
    });
    actionSheet.present();
  }
}