import { Component, ChangeDetectorRef } from '@angular/core';
import { LoadingController, NavController, AlertController, Events, Platform } from 'ionic-angular';

import { Badge } from '@ionic-native/badge';

import moment from 'moment';
import leaflet from 'leaflet';
import 'leaflet-routing-machine';
declare var L: any;

import { DadosGlobais } from '../../models/dados-globais';
import { Localizacao } from '../../models/localizacao';
import { Chamado } from '../../models/chamado';

import { DadosGlobaisService } from '../../services/dados-globais';
import { ChamadoService } from "../../services/chamado";

import { ChamadoPage } from "../chamados/chamado";
import { MapaChamadoPage } from '../mapas/mapa-chamado';
import { MapaChamadosPage } from '../mapas/mapa-chamados';
import { Config } from '../../models/config';
import { GeolocationService } from '../../services/geo-location';
import { ChamadosFechadosPage } from './chamados-fechados';
import { ChamadoFechadoPage } from './chamado-fechado';


@Component({
  selector: 'chamados-page',
  templateUrl: 'chamados.html'
})
export class ChamadosPage {
  chamados: Chamado[];
  chamadosAbertos: Chamado[];
  chamadosFechados: Chamado[];
  qtdChamadosFechadosAExibir: Number = 20;
  dg: DadosGlobais;
  status: string = "abertos";
  minhaLocalizacao: Localizacao;
  mapa: any;

  constructor(
    private platform: Platform,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private changeDetector: ChangeDetectorRef,
    private loadingCtrl: LoadingController,
    private badge: Badge,
    private events: Events,
    private geolocationService: GeolocationService,
    private chamadoService: ChamadoService,
    private dadosGlobaisService: DadosGlobaisService
  ) {}

  
  ionViewWillEnter() {
    this.carregarDadosGlobais().then(() => {
      this.geolocationService.buscarUltimaLocalizacao().then((minhaLocalizacao) => {
        this.minhaLocalizacao = minhaLocalizacao;

        this.carregarChamadosStorage().then(() => {
          this.carregarChamadosFechadosApi();
        }).catch();
      }).catch();
    });
   
    this.geolocationService.verificarSeGPSEstaAtivoEDirecionarParaConfiguracoes();
  }

  ionViewDidLoad() {
    this.events.subscribe('sincronizacao:efetuada', () => {
      this.carregarChamadosStorage();
    });
  }

  public telaChamado(chamado: Chamado) {
    this.navCtrl.push(ChamadoPage, { chamado: chamado });
  }

  public telaMapaChamado(chamado: Chamado) {
    this.navCtrl.push(MapaChamadoPage, { chamado: chamado });
  }

  public telaChamadoFechado(chamado: Chamado) {
    this.navCtrl.push(ChamadoFechadoPage, { chamado: chamado });
  }

  public telaChamadosFechados() {
    this.navCtrl.push(ChamadosFechadosPage);
  }

  public telaMapaChamados() {
    this.navCtrl.push(MapaChamadosPage);
  }

  public pushAtualizarChamados(refresher) {
    this.sincronizarChamados(true).then(() => {
      if (refresher) refresher.complete();
    }).catch(() => {
      setTimeout(() => { if (refresher) refresher.complete() }, 2000);
    });
  }

  public limparChamadosDispositivo() {
    const confirmacao = this.alertCtrl.create({
      title: Config.MSG.CONFIRMACAO,
      message: Config.MSG.REMOVER_OS_CHAMADOS,
      buttons: [
        {
          text: Config.MSG.CANCELAR,
          handler: () => {}
        },
        {
          text: Config.MSG.CONFIRMAR,
          handler: () => {
            const loading = this.loadingCtrl.create({ content: Config.MSG.AGUARDE });
            loading.present();
        
            this.chamadoService.apagarChamadosStorage().then((res) => {
                this.chamadosAbertos = [];
                loading.dismiss();

                this.chamadoService.buscarChamadosStorage().then((chamados) => {
                  this.chamados = chamados;
                }).catch();
              })
              .catch(() => {
                loading.dismiss();
              });
          }
        }
      ]
    });

    confirmacao.present();
  } 

  public sincronizarChamados(verbose: boolean=false): Promise<any> {
    return new Promise((resolve, reject) => {
      this.chamadoService.sincronizarChamados(verbose, this.dg.usuario.codTecnico).then((cs) => {
        this.chamados = cs.sort(function(a, b) { 
          return ((a.codOs < b.codOs) ? -1 : ((a.codOs > b.codOs) ? 1 : 0));
        });

        resolve();
      }).catch(() => { reject() });
    });
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
      this.chamadoService.buscarChamadosStorage().then((chamados) => {
        this.chamados = chamados.sort(function(a, b) { 
          return ((a.codOs < b.codOs) ? -1 : ((a.codOs > b.codOs) ? 1 : 0))
        });
  
        this.chamadosAbertos = chamados
          .filter((c) => { return (!c.dataHoraFechamento) })
          .sort((a, b) => { return ((a.codOs < b.codOs) ? -1 : ((a.codOs > b.codOs) ? 1 : 0))
        });

        this.chamados.map((chamado, chamadoIndex) => {
          this.obterDistanciaETempoDoDestino(chamado, chamadoIndex);
        });
        
        this.changeDetector.markForCheck();
        this.atualizarBadge();
        resolve();
      }).catch();
    });
  }

  private carregarChamadosFechadosApi() {
    this.chamadoService.buscarChamadosFechadosApi(this.dg.usuario.codTecnico).subscribe((cs: Chamado[]) => {
      this.chamadosFechados = cs.sort(function(a, b) { 
        return (moment(a.dataHoraFechamento, 'YYYY-MM-DD HH:mm').isBefore(moment(b.dataHoraFechamento, 'YYYY-MM-DD HH:mm')) ? -1 : (moment(a.dataHoraFechamento, 'YYYY-MM-DD HH:mm').isAfter(moment(b.dataHoraFechamento, 'YYYY-MM-DD HH:mm')) ? 1 : 0));
      });
    },
    err => {});
  }

  private obterDistanciaETempoDoDestino(chamado: Chamado, chamadoIndex: number): string {
    if (!this.minhaLocalizacao || !this.platform.is('cordova')) return;

    if (this.mapa != undefined) this.mapa.remove();  

    this.mapa = leaflet.map('mapa');
    let wps: any = [];
    
    wps.push(L.latLng([this.minhaLocalizacao.latitude, this.minhaLocalizacao.longitude]));
    wps.push(L.latLng([chamado.localAtendimento.localizacao.latitude, chamado.localAtendimento.localizacao.longitude]));
    
    let route = L.Routing.control({ waypoints: wps }).addTo(this.mapa);
    var bounds = L.latLngBounds(wps);
    this.mapa.fitBounds(bounds);

    route.on('routesfound', (e) => {
      var routes = e.routes;
      var summary = routes[0].summary;
      let distancia = (summary.totalDistance / 1000).toFixed(0);
      var tempo = moment().startOf('day').seconds(summary.totalTime).format('H:mm')

      this.chamados[chamadoIndex].localAtendimento.distancia = `${distancia} km (${tempo})`;
    });
  }

  private atualizarBadge() {
    this.badge.set( this.chamados.filter((c) => { return (!c.dataHoraFechamento) }).length );
  }
}