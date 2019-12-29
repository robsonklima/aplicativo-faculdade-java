import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Storage } from "@ionic/storage";
import { Observable } from "rxjs/Observable";
import { NativeAudio } from '@ionic-native/native-audio';
import { Vibration } from '@ionic-native/vibration';
import moment from 'moment';
import 'rxjs/Rx';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';

import { Config } from '../models/config';
import { Chamado } from "../models/chamado";
import { ToastController, Toast, LoadingController, Events } from 'ionic-angular';

@Injectable()
export class ChamadoService {
  toast: Toast;
  private executando: boolean = false;
  private chamados: Chamado[] = [];

  constructor(
    private http: Http,
    private storage: Storage,
    private events: Events,
    private nativeAudio: NativeAudio,
    private vibration: Vibration,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  buscarChamadosApi(codTecnico: number): Observable<Chamado[]> {
    return this.http.get(Config.API_URL + 'OsTecnico/' + codTecnico)
      .timeout(15000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json())
    );
  }

  buscarChamadoApi(codOS: number): Observable<Chamado> {
    return this.http.get(Config.API_URL + 'Os/' + codOS)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json())
    );
  }

  fecharChamadoApi(chamado: Chamado): Observable<any> {
    return this.http.post(Config.API_URL + 'OsTecnico', chamado)
      .timeout(60000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarChamadosFechadosApi(codTecnico: number): Observable<Chamado[]> {
    return this.http.get(Config.API_URL + 'OsTecnicoFechada/' + codTecnico)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json())
    );
  }

  registrarLeituraChamadoApi(chamado: Chamado): Observable<any> {
    return this.http.post(Config.API_URL + 'OsTecnicoLeitura', chamado)
      .timeout(3000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarChamadosStorage(): Promise<Chamado[]> {
    return new Promise((resolve, reject) => {
      this.storage.get('Chamados').then((chamados: Chamado[]) => {
        this.chamados = chamados != null ? chamados : [];

        resolve (this.chamados.slice());
      })
      .catch(() => {
        reject();
      });
    });
  }

  verificarExisteCheckinEmOutroChamado(): boolean {
    return (this.chamados.filter((c) => {
      return ((c.checkin.localizacao.latitude || c.checkin.localizacao.longitude) && !c.dataHoraFechamento);
    }).length > 0);
  }
  
  atualizarChamado(chamado: Chamado): Promise<boolean> {
    this.chamados = this.chamados.filter((c) => {
      return (c.codOs.toString().indexOf(chamado.codOs.toString()) < 0);
    });

    return new Promise((resolve, reject) => {
      this.storage.get('Chamados').then((chamados: Chamado[]) => {
        this.chamados.push(chamado);

        this.storage.set('Chamados', this.chamados).then(() => { resolve(true) }).catch(() => { reject(false) });
      })
      .catch(() => {
        reject(false);
      })
    });
  }

  sincronizarChamados(verbose: boolean=false, codTecnico: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!codTecnico) {
        this.exibirToast(Config.MSG.ERRO_TECNICO_NAO_ENCONTRADO, 'info');
        resolve();
        return;
      }

      if (this.executando) {
        this.exibirToast(Config.MSG.AGUARDE_ALGUNS_INSTANTES, 'info');
        resolve();
        return;
      }
      
      this.executando = true;
      const loading = this.loadingCtrl.create({ content: Config.MSG.SINCRONIZANDO_CHAMDOS });
      if (verbose) loading.present();
        
      this.buscarChamadosStorage().then((chamadosStorage) => {
        let chamadosFechados = chamadosStorage.filter((c) => { 
          return (c.dataHoraFechamento !== null);
        });

        this.sincronizarChamadosFechados(verbose, chamadosFechados).then((res) => {
          this.buscarChamadosApi(codTecnico).subscribe((chamadosApi) => {
            this.unificarChamadosApiStorage(verbose, chamadosStorage, chamadosApi).then((chamadosUnificados) => {
              if (!chamadosUnificados.length) return;

              this.atualizarChamadosStorage(chamadosUnificados).then((chamadosStorageRes) => { 
                this.events.publish('sincronizacao:efetuada');
                this.exibirToast(Config.MSG.CHAMADOS_SINCRONIZADOS, Config.TOAST.SUCCESS);
                this.executando = false;
                loading.dismiss();
                resolve(chamadosStorageRes);
              }).catch(() => { 
                this.executando = false;
                loading.dismiss();
                this.exibirToast(Config.MSG.ERRO_AO_SINCRONIZAR, Config.TOAST.ERROR);
                reject();
              });
            }).catch(() => {
              this.executando = false;
              loading.dismiss();
              this.exibirToast(Config.MSG.ERRO_AO_SINCRONIZAR, Config.TOAST.ERROR);
              reject();
            });
          }, () => { 
            this.executando = false;
            loading.dismiss();
            this.exibirToast(Config.MSG.ERRO_AO_SINCRONIZAR, Config.TOAST.ERROR);
            reject();
          });
        }).catch(() => { 
          this.executando = false;
          loading.dismiss();
          this.exibirToast(Config.MSG.ERRO_AO_ENVIAR_CHAMADO_FECHADO, Config.TOAST.ERROR);
          reject();
        });
      });
    });
  }

  unificarChamadosApiStorage(verbose: boolean=false, chamadosStorage: Chamado[], chamadosApi: Chamado[]): Promise<Chamado[]> {
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

          if (!verbose) {
            this.dispararSinalSonoroComVibracao();
          }
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
                      && atributo !== 'localizacaoCorreta'
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

  sincronizarChamadosFechados(verbose: boolean=false, chamados: Chamado[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!chamados.length) {
        resolve();
        return
      }

      this.fecharChamadoApi(chamados[0]).subscribe(res => {
        if (res) {
          if (res.indexOf('00 - ') > -1) {
            if (verbose) {
              this.exibirToast('Chamado ' + chamados[0].codOs + ' fechado junto ao servidor', Config.TOAST.SUCCESS);
            }
            
            this.apagarChamadoStorage(chamados[0]).then(() => { 
              resolve(true);
            }).catch(() => { reject(false) });
          } else {
            if (verbose) {
              this.exibirToast('Não foi possível sincronizar o chamado ' + chamados[0].codOs + '', Config.TOAST.ERROR);
            }
            
            reject(false);
          }
        }
      },
      err => {
        reject(false);
      });
    });
  }

  atualizarChamadosStorage(chamados: Chamado[]): Promise<Chamado[]> {
    this.chamados = chamados;

    return new Promise((resolve, reject) => {
      this.storage.set('Chamados', this.chamados).then((res) => {
        resolve(this.chamados);
      })
      .catch(() => {
        reject(false);
      });
    });
  }

  apagarChamadosStorage(): Promise<boolean> {
    this.chamados = [];

    return new Promise((resolve, reject) => {
      this.storage.set('Chamados', this.chamados)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          reject(false);
        });
    });
  }

  apagarChamadoStorage(chamado: Chamado): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.chamados = this.chamados.filter((c) => {
        return (c.codOs.toString().indexOf(chamado.codOs.toString()) < 0);
      });

      this.storage.set('Chamados', this.chamados)
        .then(() => { resolve(true) })
        .catch(() => { reject(false) });
    });
  }

  private dispararSinalSonoroComVibracao() {
    this.nativeAudio.preloadSimple('audioPop', 'assets/sounds/hangouts.ogg').then(() => {
      this.nativeAudio.play('audioPop').then(() => {
        setTimeout(() => {
          this.nativeAudio.stop('audioPop').then(() => {
            this.nativeAudio.unload('audioPop').then(() => {
              this.vibration.vibrate(1500);
            }, () => {});
          }, () => {}); 
        }, 1000);
      }, () => {});
    }, () => {});
  }

  private exibirToast(mensagem: string, tipo: string) {
    try {
        this.toast.dismiss();
    } catch(e) {}


    this.toast = this.toastCtrl.create({
      message: mensagem, 
      duration: 5000, 
      position: 'bottom', 
      cssClass: 'toast-' + tipo, 
      showCloseButton: true, 
      closeButtonText: 'Ok'
    });
    
    this.toast.present();
  }
}