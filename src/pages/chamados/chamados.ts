import { Component, ChangeDetectorRef } from '@angular/core';
import { LoadingController, NavController, AlertController, Events, Platform, ToastController } from 'ionic-angular';

import { Badge } from '@ionic-native/badge';

import moment from 'moment';

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
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private badge: Badge,
    private events: Events,
    private loadingCtrl: LoadingController,
    private geolocationService: GeolocationService,
    private chamadoService: ChamadoService,
    private dadosGlobaisService: DadosGlobaisService
  ) {}

  
  ionViewWillEnter() {
    this.minhaLocalizacao = this.geolocationService.buscarUltimaLocalizacao();

    this.carregarDadosGlobais().then(() => {
      this.carregarChamadosStorage().then(() => {
        this.carregarChamadosFechadosApi();
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

  public informarIntencaoAtendimento(i: number) {
    if (this.chamadoService.verificarExisteCheckinEmOutroChamado()) {
      this.exibirToast(Config.MSG.CHECKIN_EM_ABERTO, Config.TOAST.ERROR)
      return
    }

    this.chamados.forEach((c, i) => {
      this.chamados[i].indIntencaoAtendimento = false;
      this.chamados[i].dataHoraIntencaoAtendimento = null;
    });

    this.chamados[i].indIntencaoAtendimento = true;
    this.chamados[i].dataHoraIntencaoAtendimento = new Date().toLocaleString('pt-BR');;

    this.exibirToast(`Iniciado deslocamento para o chamado ${this.chamados[i].codOs}`, Config.TOAST.SUCCESS)
    this.chamadoService.atualizarChamadosStorage(this.chamados);
  }

  public cancelarIntencaoAtendimento(i: number) {
    if (this.chamadoService.verificarExisteCheckinEmOutroChamado()) {
      this.exibirToast(Config.MSG.CHECKIN_EM_ABERTO, Config.TOAST.ERROR)
      return
    }

    this.chamados.forEach((c, i) => {
      this.chamados[i].indIntencaoAtendimento = false;
      this.chamados[i].dataHoraIntencaoAtendimento = null;
    });

    this.exibirToast(Config.MSG.INTENCAO_CANCELADA, Config.TOAST.INFO)
    this.chamadoService.atualizarChamadosStorage(this.chamados);
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

  private atualizarBadge() {
    this.badge.set( this.chamados.filter((c) => { return (!c.dataHoraFechamento) }).length );
  }

  private exibirToast(mensagem: string, tipo: string='info', posicao: string=null) {
    const toast = this.toastCtrl.create({
      message: mensagem, 
      duration: Config.TOAST.DURACAO, 
      position: posicao || 'bottom', 
      cssClass: 'toast-' + tipo
    });
    
    toast.present();
  }
}