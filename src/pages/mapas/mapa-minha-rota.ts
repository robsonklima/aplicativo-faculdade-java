import { Component } from '@angular/core';
import { LoadingController, Platform, ActionSheetController } from 'ionic-angular';

import moment from 'moment';

import { Map, tileLayer, marker } from 'leaflet';
import { DadosGlobais } from '../../models/dados-globais';
import { DadosGlobaisService } from '../../services/dados-globais';
import { LocalizacaoService } from '../../services/localizacao';
import { Localizacao } from '../../models/localizacao';


@Component({
  selector: 'mapa-minha-rota',
  template: `
    <ion-header>
      <ion-navbar>
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
    let minhaLat = this.localizacoes[this.localizacoes.length-1].latitude;
    let minhaLng = this.localizacoes[this.localizacoes.length-1].longitude;

    this.map = new Map('minha-rota').setView([minhaLat, minhaLng], 10);
    tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'edupala.com © ionic LeafLet',
    }).addTo(this.map);

    this.localizacoes.forEach(loc => {
      marker([ loc.latitude, loc.longitude ]).addTo(this.map)
        .bindPopup(moment(loc.dataHoraCad).format('DD/MM HH:mm'))
        .openPopup();
    });
  }
}