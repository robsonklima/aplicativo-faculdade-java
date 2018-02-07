import { Component } from '@angular/core';
import { Platform, LoadingController, NavController, AlertController, 
  ToastController, Events } from 'ionic-angular';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Geolocation } from '@ionic-native/geolocation';
import { Badge } from '@ionic-native/badge';

import { Config } from "../../config/config";

import { ChamadoPage } from "../chamado/chamado";

import { Chamado } from '../../models/chamado';

import { ChamadoService } from "../../services/chamado";

@Component({
  selector: 'chamados-page',
  templateUrl: 'chamados.html'
})
export class ChamadosPage {
  chamados: Chamado[];

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private platform: Platform,
    private events: Events,
    private badge: Badge,
    private geolocation: Geolocation,
    private inAppBrowser: InAppBrowser,
    private chamadoService: ChamadoService,
    private loadingCtrl: LoadingController
  ) {
    this.events.subscribe('sincronizacao:efetuada', () => {
      setTimeout(() => {
        this.carregarChamadosStorage();
      }, 3500);
    });
  }

  ionViewWillEnter() { 
    this.carregarChamadosStorage();
  }

  public telaChamado(chamado: Chamado) {
    this.navCtrl.push(ChamadoPage, { chamado: chamado });
  }

  public atualizarChamados(refresher) {
    setTimeout(() => {
      this.events.publish('sincronizacao:solicitada');

      setTimeout(() => {
        refresher.complete();
      }, 7500);
    }, 7500);
  }

  public abrirMapaNavegador(chamado: Chamado) {
    const loader = this.loadingCtrl.create({
      content: 'Obtendo sua localização...',
      enableBackdropDismiss: true,
      dismissOnPageChange: true
    });
    loader.present();

    this.platform.ready().then(() => {
      this.geolocation.getCurrentPosition(Config.POS_CONFIG)
        .then((localizacao) => {
          loader.dismiss().then(() => {
            this.inAppBrowser.create('https://www.google.com.br/maps/dir/' 
              + localizacao.coords.latitude + ',+' 
              + localizacao.coords.longitude + '/' 
              + chamado.localAtendimento.localizacao.latitude + ',+' 
              + chamado.localAtendimento.localizacao.longitude);
          }).catch();
        })
        .catch((err) => {
          loader.dismiss().then(() => {
            this.exibirToast("Não foi possível obter sua localização");
          }).catch();
        });
    })
    .catch(() => {
      loader.dismiss();
    });
  }

  private carregarChamadosStorage(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.chamadoService.buscarChamadosStorage().then((chamados: Chamado[]) => { 
        this.chamados = chamados.sort(function(a, b) { 
          return ((a.codOs < b.codOs) ? -1 : ((a.codOs > b.codOs) ? 1 : 0));
        });

        this.atualizarBadge();
      })  
      .catch(() => {
        reject(false);
      });
    });
  }

  private atualizarBadge() {
    this.badge.set(
      this.chamados.filter((c) => {
        return (!c.dataHoraFechamento);
      }).filter((c) => {
        return (!c.dataHoraOSMobileLida);
      }).length
    );
  }

  public limparChamadosDispositivo() {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja remover os chamados do dispositivo?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            const loading = this.loadingCtrl.create({ 
              content: 'Removendo chamados do banco de dados do dispositivo...' 
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
}