import { Component } from '@angular/core';
import { Platform, LoadingController, NavController, AlertController, ToastController,  PopoverController } from 'ionic-angular';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Geolocation } from '@ionic-native/geolocation';
import { Badge } from '@ionic-native/badge';

import { Config } from "../../models/config";
import { DadosGlobaisService } from '../../services/dados-globais';

import { ChamadoPage } from "../chamados/chamado";
import { Chamado } from '../../models/chamado';
import { ChamadosMaisOpcoesPage } from './chamados-mais-opcoes';

import { ChamadoService } from "../../services/chamado";
import { DadosGlobais } from '../../models/dados-globais';


@Component({
  selector: 'chamados-page',
  templateUrl: 'chamados.html'
})
export class ChamadosPage {
  chamados: Chamado[];
  dataHoraUltAtualizacao: Date = new Date();
  dg: DadosGlobais;

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private popoverCtrl: PopoverController,
    private toastCtrl: ToastController,
    private platform: Platform,
    private badge: Badge,
    private geolocation: Geolocation,
    private inAppBrowser: InAppBrowser,
    private chamadoService: ChamadoService,
    private dadosGlobaisService: DadosGlobaisService
  ) {}

  ionViewWillEnter() { 
    this.carregarDadosGlobais().then(() => { this.carregarChamadosStorage().then(() => {
      this.sincronizarChamados().catch(() => { this.exibirToast('Erro ao sincronizar com o servidor') });
    }) }).catch();
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

  public telaChamado(chamado: Chamado) {
    this.navCtrl.push(ChamadoPage, { chamado: chamado });
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

  public abrirPopover(event: MouseEvent) {
    const popover = this.popoverCtrl.create(ChamadosMaisOpcoesPage);

    popover.present({ev: event});

    popover.onDidDismiss(data => {
      if (!data)
        return;
    });
  }


  public sincronizar() {
    if (!this.dg.usuario.codTecnico) return;

    const loading = this.loadingCtrl.create({ content: 'Sincronizando...' });
    loading.present();

    this.sincronizarChamados().then(() => { loading.dismiss(); this.carregarChamadosStorage(); }).catch(() => { loading.dismiss() });
  }

  private sincronizarChamados(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataHoraUltAtualizacao = new Date();

      // console.log(this.dataHoraUltAtualizacao);

      // return;
      

      this.chamadoService.buscarChamadosStorage().then((chamadosStorage) => {
        this.sincronizarChamadosFechados(chamadosStorage.filter((c) => { return (c.dataHoraFechamento !== null) })).then(() => {
          this.chamadoService.buscarChamadosApi(this.dg.usuario.codTecnico).subscribe((chamadosApi) => {
            this.unificarChamadosApiStorage(chamadosStorage, chamadosApi).then((chamadosUnificados) => {
              if (chamadosUnificados.length) {
                this.chamadoService.atualizarChamadosStorage(chamadosUnificados).then(() => {
                  setTimeout(() => {
                    this.chamadoService.buscarChamadosStorage().then(() => this.exibirToast('Chamados sincronizados com o servidor') ).catch();  
                  }, 1500);
                  resolve();
                }).catch(() => {
                  reject();
                });
              }
            })
            .catch(() => { reject() });
          }, err => { reject() });
        }).catch(() => { reject() });
      }).catch(() => { reject() });
    });
  }

  private unificarChamadosApiStorage(chamadosStorage: Chamado[], chamadosApi: Chamado[]): Promise<Chamado[]> {
    return new Promise((resolve, reject) => {
      if (chamadosApi.length == 0) {
        reject();
        return
      }

      let chamados: Chamado[] = [];
      
      // Chamados adicionados
      chamadosApi.forEach((ca) => {
        if (chamadosStorage.filter((cs) => { return ( cs.codOs.toString().indexOf( ca.codOs.toString() ) > -1) }).length == 0) {
          chamados.push(ca);
        }
      });

      // Chamados atualizados
      if (chamadosStorage.length > 0) {
        chamadosStorage.forEach((cs) => {
          let chamadoEncontrado: boolean = false;

          chamadosApi.forEach((ca) => {
            if (cs.codOs == ca.codOs) {
              chamadoEncontrado = true;

              if ((JSON.stringify(ca) !== JSON.stringify(cs))) {
                Object.keys(ca).forEach((atributo) => {
                  if (atributo !== 'codOs' 
                      && atributo !== 'checkin' 
                      && atributo !== 'checkout' 
                      && atributo !== 'rats'
                      && !cs.dataHoraFechamento) {
                    cs[atributo] = ca[atributo]; 
                  }
                });
              }
            }
          });
          
          // Chamados removidos
          if (chamadoEncontrado) {
            chamados.push(cs);
          }
        });
      }
    
      resolve(chamados);
    });
  }

  private sincronizarChamadosFechados(chamados: Chamado[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      chamados.forEach((chamado) => {
        this.chamadoService.fecharChamadoApi(chamado).subscribe(res => {
          if (res) {
            if (res.indexOf('00 - ') > -1) {
              this.chamadoService.apagarChamadoStorage(chamado).then(() => {
                resolve(true);
              }).catch(() => {
                reject(false);
              });
            } else {
              reject(false);
            }
          }
        },
        err => {
          reject(false);
        });
      });

      resolve(true);
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