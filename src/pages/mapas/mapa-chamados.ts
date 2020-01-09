import { Component } from '@angular/core';
import { LoadingController, Platform, ActionSheetController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import { Config } from '../../models/config';
import moment from 'moment';

import leaflet from 'leaflet';
import 'leaflet-routing-machine';
import { DadosGlobais } from '../../models/dados-globais';
import { Chamado } from '../../models/chamado';
import { ChamadoService } from '../../services/chamado';
import { DadosGlobaisService } from '../../services/dados-globais';

declare var L: any;


@Component({
  selector: 'mapa-chamados',
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

        <ion-title>Mapa dos Chamados</ion-title>
      </ion-navbar>
    </ion-header>

    <ion-content>
      <div class="map-container">
        <div id="mapId" style="width: 100%; height: 100%">
        </div>
      </div>
    </ion-content>
  `
})

export class MapaChamadosPage {
  chamados: Chamado[] = [];
  dg: DadosGlobais;
  map: any;
  minhaPosicao: leaflet.PointTuple;
  posicaoB: leaflet.PointTuple;
  distancia: string;

  constructor(
    private plt: Platform,
    private geolocation: Geolocation,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private dadosGlobaisService: DadosGlobaisService,
    private chamadoService: ChamadoService
  ) {}

  ionViewDidEnter() {
    this.carregarDadosGlobais()
      .then(() => this.carregarChamadosStorage())
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

  private carregarChamadosStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.chamadoService.buscarChamadosStorage().then((chamados: Chamado[]) => {
        this.chamados = chamados.sort(function(a, b) {
          return ((a.codOs < b.codOs) ? -1 : ((a.codOs > b.codOs) ? 1 : 0));
        });

        resolve();
      })
      .catch(() => {
        reject(false);
      });
    });
  }

  private carregarMapa(ordem: string = null) {
    if (this.map != undefined) this.map.remove();

    this.map = leaflet.map('mapId', { center: this.minhaPosicao, zoom: 12 });
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    let popups: any = [];
    let icons: any = [];
    let wps: any = [];

    popups.push(this.dg.usuario.nome.replace(/ .*/,''));
    icons.push(L.icon({
      iconUrl: Config.L.ICONES.VERDE,
      shadowUrl: Config.L.SOMBRA,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      shadowSize: [41, 41],
      shadowAnchor: [12, 41],
      popupAnchor: [0, -41]
    }));
    wps.push(L.latLng( this.minhaPosicao ));

    if (ordem && ordem == 'aberturaOS') {
      this.chamados = this.chamados.sort(function(a, b) {
        return moment(a.dataHoraAberturaOS) < moment(b.dataHoraAberturaOS) ? -1 : (moment(a.dataHoraAberturaOS) > moment(b.dataHoraAberturaOS)) ? 1 : 0;
      });
    } else if (ordem && ordem == 'sla') {
      this.chamados = this.chamados.sort(function(a, b) {
        return moment(a.dataFimSLA) < moment(b.dataFimSLA) ? -1 : moment(a.dataFimSLA) > moment(b.dataFimSLA) ? 1 : 0;
      });
    }

    this.chamados.forEach(c => {
      popups.push('<b>' + c.codOs.toString() + '</b><br />' 
        + c.localAtendimento.nomeLocalAtendimento + '<br />'
        + c.cliente.nomeCliente + '<br />'
        + '<a class="rota" href="https://maps.google.com/?q=' + c.localAtendimento.localizacao.latitude + ',' + c.localAtendimento.localizacao.longitude + '"><b>Traçar Rota</b></a>');
      icons.push(L.icon({
        iconUrl: Config.L.ICONES.VERMELHO,
        shadowUrl: Config.L.SOMBRA,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        shadowSize: [41, 41],
        shadowAnchor:  [12, 41],
        popupAnchor: [0, -41]
      }));
      wps.push(L.latLng([ c.localAtendimento.localizacao.latitude, c.localAtendimento.localizacao.longitude ]));
    });

    const route = L.Routing.control({
      createMarker: function (i: number, waypoint: any) {
        const marker = L.marker(waypoint.latLng, {
          draggable: false,
          icon: icons[i]
        }).bindPopup((popups[i] ? popups[i] : ''));
        return marker;
      },
      waypoints: wps,
      autoRoute: true,
      showAlternatives: true,
      draggableWaypoints: false,
      addWaypoints: false,
      show: false,
      language: 'pt-BR',
      lineOptions: {
        styles: [{ color: 'green', opacity: 1, weight: 4 }]
      }
    }).addTo(this.map);

    route.on('routesfound', (e) => {
      var routes = e.routes;
      var summary = routes[0].summary;
      this.distancia = (summary.totalDistance / 1000).toFixed(2).replace('.', ',');
    });

    var bounds = L.latLngBounds(wps);
    this.map.fitBounds(bounds);
  }

  public exibirActionSheet() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Mais Opções',
      buttons: [
        {
          text: 'Reordenar a Rota por SLA',
          handler: () => {
            const loader = this.loadingCtrl.create({ content: 'Reordenando por SLA' });
            loader.present();

            setTimeout(() => {
              this.carregarMapa('sla');

              loader.dismiss();
            }, 1500);
          }
        },{
          text: 'Reordenar a Rota por Data da Abertura',
          handler: () => {
            const loader = this.loadingCtrl.create({ content: 'Reordenando por Data' });
            loader.present();

            setTimeout(() => {
              this.carregarMapa('aberturaOS');

              loader.dismiss();
            }, 1500);
          }
        },{
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