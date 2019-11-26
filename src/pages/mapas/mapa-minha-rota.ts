import { Component } from '@angular/core';
import { LoadingController, Platform, ActionSheetController } from 'ionic-angular';

import moment from 'moment';

import leaflet from 'leaflet';
import 'leaflet-routing-machine';
import { DadosGlobais } from '../../models/dados-globais';
import { Chamado } from '../../models/chamado';
import { DadosGlobaisService } from '../../services/dados-globais';
import { LocalizacaoService } from '../../services/localizacao';
import { Localizacao } from '../../models/localizacao';
import { Config } from '../../models/config';

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
        
        <ion-title>Minhas Localizações</ion-title>
      </ion-navbar>
    </ion-header>

    <ion-content>
      <div class="map-container"> 
        <div id="minha-rota" style="width: 100%; height: 100%"> 
        </div> 
      </div>
    </ion-content>
  `
})

export class MapaMinhaRotaPage {
  localizacoes: Localizacao[] = [];
  datasSelecao: any[] = [];
  dg: DadosGlobais;
  map: any;
  

  constructor(
    private plt: Platform,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private dadosGlobaisService: DadosGlobaisService,
    private localizacaoService: LocalizacaoService
  ) {}

  ionViewDidEnter() {
    this.carregarDadosGlobais()
      .then(() => {
        const loader = this.loadingCtrl.create({ content: 'Aguarde...' });
        loader.present();

        this.localizacaoService.buscarLocalizacoesApi(this.dg.usuario.codUsuario).subscribe((localizacoes) => {
          this.localizacoes = localizacoes;

          this.carregarMapa();

          loader.dismiss();
        }, err => { loader.dismiss() });
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
    if (this.map) this.map.remove();

    this.map = leaflet.map('minha-rota', { zoom: 12 });
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'Nome da Aplicação' }).addTo(this.map);

    let popups: any = [];
    let icons: any = [];
    let wps: any = [];

    this.localizacoes.forEach(loc => {
      //this.datasSelecao.push(moment(loc.dataHoraCad).format('DD/MM/YYYY'));

      popups.push(loc.dataHoraCad.toString());
      icons.push(L.icon({
        iconUrl: Config.L.ICONES.VERMELHO,
        shadowUrl: Config.L.SOMBRA,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        shadowSize: [41, 41],
        shadowAnchor:  [12, 41],
        popupAnchor: [0, -41]
      }));

      wps.push(L.latLng([ loc.latitude, loc.longitude ]));
    });

    //this.datasSelecao = this.datasSelecao.filter((item, index) => (this.datasSelecao.indexOf(item) !== index));

    this.datasSelecao = this.datasSelecao.filter(function(a, b) { return this.datasSelecao.indexOf(a) == b })

    console.log(this.datasSelecao);
   

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
        }).bindPopup((i + 1) + '&deg; ' + (popups[i] ? popups[i] : ''));
        return marker;
      },
      waypoints: wps,
      show: false,
      language: 'pt-BR',
      lineOptions: {
        styles: [{ color: 'green', opacity: 1, weight: 4 }]
      }
    }).addTo(this.map);

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
              this.carregarMapa();

              loader.dismiss();
            }, 1500);
          }
        },
        {
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