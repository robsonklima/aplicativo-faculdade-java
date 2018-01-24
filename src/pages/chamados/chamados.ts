import { Component } from '@angular/core';
import { Platform, LoadingController, NavController, AlertController, 
  ToastController, Events } from 'ionic-angular';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Geolocation } from '@ionic-native/geolocation';

import { Config } from "../../config/config";

import { ChamadoPage } from "../chamado/chamado";

import { DadosGlobais } from '../../models/dados-globais';
import { Chamado } from "../../models/chamado";
import { Usuario } from "../../models/usuario";

import { DadosGlobaisService } from '../../services/dados-globais';
import { ChamadoService } from "../../services/chamado";

@Component({
  selector: 'chamados-page',
  templateUrl: 'chamados.html'
})
export class ChamadosPage {
  dadosGlobais: DadosGlobais;
  chamados: Chamado[];
  usuario: Usuario;
  task: any;

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private events: Events,
    private platform: Platform,
    private geolocation: Geolocation,
    private inAppBrowser: InAppBrowser,
    private dadosGlobaisService: DadosGlobaisService,
    private chamadoService: ChamadoService,
    private loadingCtrl: LoadingController
  ) { 
    this.events.subscribe('sincronizacao:efetuada', () => {
      setTimeout(() => {
        this.carregarChamadosStorage();
      }, 3000);
    });
  }

  ionViewWillEnter() { 
    

    this.carregarChamadosStorage();
    
    this.dadosGlobaisService.buscarDadosGlobaisStorage()
      .then((dados) => {
        if (dados) {
          this.dadosGlobais = dados;
          if (dados.usuario) {
            this.usuario = dados.usuario;
          }
        }
      })
      .catch((err) => {});
  }

  public pushAtualizarChamados(refresher) {
    setTimeout(() => {
      refresher.complete();
      this.events.publish('sincronizacao:solicitada');
    }, Config.INT_LOADING_CHAMADOS_MILISEG);
  }

  public telaChamado(chamado: Chamado) {
    this.navCtrl.push(ChamadoPage, { chamado: chamado });
  }

  public abrirMapaNavegador (chamado: Chamado) {
    this.platform.ready().then(() => {
      this.geolocation.getCurrentPosition(Config.POS_CONFIG)
        .then((localizacao) => {
          console.log(localizacao);

          this.inAppBrowser.create('https://www.google.com.br/maps/dir/' 
            + localizacao.coords.latitude + ',+' + localizacao.coords.longitude 
            + '/' + chamado.localAtendimento.localizacao.latitude + ',+' 
            + chamado.localAtendimento.localizacao.longitude);
        })
        .catch((err) => {
          this.exibirToast("Não foi possível obter sua localização");
        });
    })
    .catch(() => {});
  }
  

  private carregarChamadosStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(
        this.chamadoService.buscarChamadosStorage()
          .then(
            (chamados: Chamado[]) => { 
              this.chamados = chamados.sort(function(a, b) {
                return ((a.codOs < b.codOs) ? -1 : ((a.codOs > b.codOs) ? 1 : 0));  
              });
            })  
            .catch(err => {})
      );
    });
  }

  public limparChamadosDispositivo() {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Tem certeza que deseja deletar os dados salvos no dispositivo?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            const loading = this.loadingCtrl.create({ 
              content: 'Apagando chamados do banco de dados do dispositivo...' 
            });
            loading.present();
        
            this.chamadoService.apagarChamadosStorage()
              .then((res) => {
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

  public filtrarChamados(ev: any) {
    this.carregarChamadosStorage().then(() => {
      let val = ev.target.value;
      
      if (val && val.trim() != '') {
        this.chamados = this.chamados.filter((chamado) => {
          return (chamado.codOs.toString().toLowerCase()
            .indexOf(val.toLowerCase()) > -1);
        })
      }
    });
  }

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: 3000, position: 'bottom'
      });

      resolve(toast.present());
    });
  }

  ionViewWillLeave() {
    clearInterval(this.task);
  }
}