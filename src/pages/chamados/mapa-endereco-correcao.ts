import { Component } from '@angular/core';
import { LoadingController, Platform, NavParams, AlertController, ViewController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import { Config } from '../../models/config';
import { Chamado } from '../../models/chamado';

import leaflet from 'leaflet';
import 'leaflet-routing-machine';
import { DadosGlobaisService } from '../../services/dados-globais';
import { DadosGlobais } from '../../models/dados-globais';

declare var L: any;


@Component({
  selector: 'mapa-endereco-correcao',
  template: `
    <ion-header>
      <ion-navbar>
        <ion-buttons end>
          <button ion-button icon-only (click)="fecharModal()">
            <ion-icon name="close"></ion-icon>
          </button>
        </ion-buttons>

        <ion-title>Selecione no Mapa</ion-title>
      </ion-navbar>
    </ion-header>

    <ion-content>
      <div class="map-container"> 
        <div id="mapa-correcao" style="width: 100%; height: 100%"> 
        </div> 
      </div>

      <button class="ion-button" ion-button color="secondary" (click)="salvar()">
        Salvar
      </button>
    </ion-content>
  `
})

export class MapaEnderecoCorrecaoPage {
  dg: DadosGlobais;
  chamado: Chamado;
  map: any;
  minhaPosicao: leaflet.PointTuple;
  posicaoB: leaflet.PointTuple;
  distancia: string;
  tempo: string;

  constructor(
    private plt: Platform,
    private alertCtrl: AlertController,
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private dadosGlobaisService: DadosGlobaisService,
    private geolocation: Geolocation
  ) {
    this.chamado = this.navParams.get('chamado');
  }

  ngOnInit() {
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
    this.map = leaflet.map('mapa-correcao', { center: this.minhaPosicao, zoom: 15 });
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: Config.NOME_APP }).addTo(this.map);

    let addedMarker = {};
    addedMarker = L.marker(this.minhaPosicao).addTo(this.map); 
    
    this.map.on('click', (m) => {
      if (addedMarker != undefined) {
        this.map.removeLayer(addedMarker);
      };

      addedMarker = L.marker([m.latlng.lat, m.latlng.lng]).addTo(this.map);

      this.chamado.localAtendimento.localizacaoCorrigida.codUsuario = this.dg.usuario.codUsuario;
      this.chamado.localAtendimento.localizacaoCorrigida.dataHoraCad = new Date().toLocaleString('pt-BR');
      this.chamado.localAtendimento.localizacaoCorrigida.latitude = m.latlng.lat.toString();
      this.chamado.localAtendimento.localizacaoCorrigida.longitude = m.latlng.lng.toString();
    });
  }

  public salvar() {
    this.exibirAlerta('Local atualizado com sucesso! O Pós Vendas deste cliente estará corrigindo o cadastro no SAT.');    

    this.fecharModal();
  }

  private fecharModal() {
    this.viewCtrl.dismiss(this.chamado);
  }

  private exibirAlerta(msg: string) {
    const alerta = this.alertCtrl.create({
      title: 'Obrigado',
      subTitle: msg,
      buttons: ['OK']
    });

    alerta.present();
  }
}