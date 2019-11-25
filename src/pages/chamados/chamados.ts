import { Component } from '@angular/core';
import { LoadingController, NavController, AlertController, ToastController, ModalController } from 'ionic-angular';

import { Badge } from '@ionic-native/badge';

import moment from 'moment';
import { DadosGlobais } from '../../models/dados-globais';
import { Chamado } from '../../models/chamado';

import { DadosGlobaisService } from '../../services/dados-globais';
import { ChamadoService } from "../../services/chamado";

import { ChamadoPage } from "../chamados/chamado";
import { MapaChamadoPage } from '../mapas/mapa-chamado';
import { MapaChamadosPage } from '../mapas/mapa-chamados';
import { ChamadoFechadoPage } from './chamado-fechado';


@Component({
  selector: 'chamados-page',
  templateUrl: 'chamados.html'
})
export class ChamadosPage {
  chamados: Chamado[];
  chamadosFechados: Chamado[];
  qtdChamadosFechadosAExibir: Number = 20;
  dg: DadosGlobais;
  status: string = "abertos";

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private badge: Badge,
    private chamadoService: ChamadoService,
    private dadosGlobaisService: DadosGlobaisService
  ) {}

  ionViewWillEnter() { 
    this.carregarDadosGlobais().then(() => { 
        this.carregarChamadosStorage().then(() => {
          this.sincronizarChamados(false).then(() => {
            this.carregarChamadosStorage(); 

            this,this.carregarChamadosFechadosApi();
          }).catch(() => { 
            this.exibirToast('Erro ao sincronizar com o servidor');
          }).catch((e) => console.log(e));
        }).catch((e) => console.log(e));
    }).catch((e) => console.log(e));
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

  public telaMapaChamado(chamado: Chamado) {
    this.navCtrl.push(MapaChamadoPage, { chamado: chamado });
  }

  public telaMapaChamados() {
    this.navCtrl.push(MapaChamadosPage);
  }

  private carregarChamadosStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.chamadoService.buscarChamadosStorage().then((chamados: Chamado[]) => { 
        this.chamados = chamados.sort(function(a, b) { 
          return ((a.codOs < b.codOs) ? -1 : ((a.codOs > b.codOs) ? 1 : 0));
        });

        this.atualizarBadge();
        resolve();
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

  public telaChamadoFechado(chamado: Chamado) {
    const modal = this.modalCtrl.create(ChamadoFechadoPage, { chamado: chamado });
    modal.present();
    modal.onDidDismiss(() => {});
  }

  private carregarChamadosFechadosApi() {
    this.chamadoService.buscarChamadosFechadosApi(this.dg.usuario.codTecnico)
      .subscribe((chamados: Chamado[]) => {
        this.chamadosFechados = chamados.sort(function(a, b) { 
          return (moment(a.dataHoraFechamento, 'YYYY-MM-DD HH:mm').isBefore(moment(b.dataHoraFechamento, 'YYYY-MM-DD HH:mm')) ? -1 : (moment(a.dataHoraFechamento, 'YYYY-MM-DD HH:mm').isAfter(moment(b.dataHoraFechamento, 'YYYY-MM-DD HH:mm')) ? 1 : 0));
        });
      },
      err => {});
  }


  public sincronizar() {
    if (!this.dg.usuario.codTecnico) return;

    const loading = this.loadingCtrl.create({ content: 'Sincronizando...' });
    loading.present();

    this.sincronizarChamados(true).then(() => { 
      loading.dismiss(); 

      this.carregarChamadosStorage();
    }).catch(() => { loading.dismiss() });
  }

  private sincronizarChamados(verbose: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      this.chamadoService.buscarChamadosStorage().then((chamadosStorage) => {
        let chamadosFechados = chamadosStorage.filter((c) => { return (c.dataHoraFechamento !== null) });

        this.sincronizarChamadosFechados(chamadosFechados).then(() => {
          if (chamadosFechados.length)
            this.exibirToast('Chamado ' + chamadosFechados[0].codOs + ' fechado junto ao servidor');

          this.chamadoService.buscarChamadosApi(this.dg.usuario.codTecnico).subscribe((chamadosApi) => {
            this.unificarChamadosApiStorage(chamadosStorage, chamadosApi).then((chamadosUnificados) => {
              if (!chamadosUnificados.length) return;

              this.chamadoService.atualizarChamadosStorage(chamadosUnificados).then(() => {
                if (verbose) this.exibirToast('Chamados sincronizados junto ao servidor');
                resolve();
              }).catch(() => { reject()});
            }).catch(() => { reject() });
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