import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Toast, Events, ToastController } from 'ionic-angular';

import { Storage } from "@ionic/storage";
import { Observable } from "rxjs/Observable";
import { NativeAudio } from '@ionic-native/native-audio';
import { Vibration } from '@ionic-native/vibration';
import { Config } from '../models/config';
import moment from 'moment';
import _ from 'lodash';

import { LoadingFactory } from '../factories/loading-factory';

import 'rxjs/Rx';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';

import { Chamado } from "../models/chamado";
import { Checkin } from '../models/checkin';
import { Intencao } from '../models/intencao';
import { LogService } from './log';
import { GeolocationService } from './geo-location';
import { CheckinCheckoutService } from './checkin-checkout';


@Injectable()
export class ChamadoService {
  toast: Toast;
  public onlineOffline: boolean = navigator.onLine;
  private executando: boolean = false;
  private chamados: Chamado[] = [];

  constructor(
    private http: Http,
    private storage: Storage,
    private events: Events,
    private toastCtrl: ToastController,
    private nativeAudio: NativeAudio,
    private vibration: Vibration,
    private loadingFactory: LoadingFactory,
    private logService: LogService,
    private geolocationService: GeolocationService,
    private checkinCheckoutService: CheckinCheckoutService
  ) {}

  buscarChamadosApi(codTecnico: number): Observable<Chamado[]> {
    return this.http.get(Config.API_URL + 'OsTecnico/' + codTecnico)
      .retry(2)
      .map((res: Response) => {
        this.logService.adicionarLog({
          tipo: Config.LOG.TIPOS.SUCCESS, 
          mensagem: `${res.status} ${res.statusText} - GET ${res.url.replace(Config.API_URL, '')}`
        });
        return res.json()
      })
      .catch((error: Error) => {
        this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
        return Observable.throw(error);
      });
  }

  buscarChamadoApi(codOS: number): Observable<Chamado> {
    return this.http.get(Config.API_URL + 'Os/' + codOS)
      .retry(2)
      .map((res: Response) => {
        this.logService.adicionarLog({
          tipo: Config.LOG.TIPOS.SUCCESS, 
          mensagem: `${res.status} ${res.statusText} - GET ${res.url.replace(Config.API_URL, '')}`
        });
        return res.json()
      })
      .catch((error: Error) => {
        this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
        return Observable.throw(error);
      });
  }

  enviarIntencaoApi(intencao: Intencao): Observable<any> {
    return this.http.post(Config.API_URL + 'OsIntencao', intencao)
      .retry(2)
      .map((res: Response) => {
        this.logService.adicionarLog({
          tipo: Config.LOG.TIPOS.SUCCESS, 
          mensagem: `${res.status} ${res.statusText} - POST ${res.url.replace(Config.API_URL, '')}`
        });
        return res.json()
      })
      .catch((error: Error) => {
        this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
        return Observable.throw(error);
      });
  }

  fecharChamadoApi(chamado: Chamado): Observable<any> {
    return this.http.post(Config.API_URL + 'OsTecnico', chamado)
      .retry(2)
      .map((res: Response) => {
        this.logService.adicionarLog({
          tipo: Config.LOG.TIPOS.SUCCESS, 
          mensagem: `${res.status} ${res.statusText} - POST ${res.url.replace(Config.API_URL, '')}`
        });
        return res.json()
      })
      .catch((error: Error) => {
        this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
        return Observable.throw(error);
      });
  }

  buscarChamadosFechadosApi(codTecnico: number): Observable<Chamado[]> {
    return this.http.get(Config.API_URL + 'OsTecnicoFechada/' + codTecnico)
      .map((res: Response) => {
        this.logService.adicionarLog({
          tipo: Config.LOG.TIPOS.SUCCESS, 
          mensagem: `${res.status} ${res.statusText} - GET ${res.url.replace(Config.API_URL, '')}`
        });
        return res.json()
      })
      .catch((error: Error) => {
        this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
        return Observable.throw(error);
      });
  }

  registrarLeituraChamadoApi(chamado: Chamado): Observable<any> {
    return this.http.post(Config.API_URL + 'OsTecnicoLeitura', chamado)
      .retry(2)
      .map((res: Response) => {
        this.logService.adicionarLog({
          tipo: Config.LOG.TIPOS.SUCCESS, 
          mensagem: `${res.status} ${res.statusText} - POST ${res.url.replace(Config.API_URL, '')}`
        });
        return res.json()
      })
      .catch((error: Error) => {
        this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: `${error.name} ${error.message} ${error.stack}` });
        return Observable.throw(error);
      });
  }

  buscarChamados(): Promise<Chamado[]> {
    return new Promise((resolve, reject) => {
      try {
        this.chamados = this.chamados != null ? this.chamados
          .filter((cham, index, self) => index === self.findIndex((c) => ( c.codOs === cham.codOs ))) : [];

        resolve(this.chamados);  
      } catch (error) {
        reject();
      }
    });
  }

  buscarChamadosStorage(): Promise<Chamado[]> {
    return new Promise((resolve, reject) => {
      this.storage.get('Chamados').then((chamados: Chamado[]) => {
        this.chamados = chamados != null ? chamados.filter((cham, index, self) => index === self.findIndex((c) => ( c.codOs === cham.codOs ))
      ) : [];

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

  sincronizarChamados(verbose: boolean=false, codTecnico: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (this.executando) {
        if (verbose) this.exibirToast(Config.MSG.AGUARDE_ALGUNS_INSTANTES, Config.TOAST.WARNING);
        resolve();
        return;
      }
      
      if (!codTecnico) {
        if (verbose) this.exibirToast(Config.MSG.ERRO_TECNICO_NAO_ENCONTRADO, Config.TOAST.ERROR);
        resolve();
        return;
      }

      if (!navigator.onLine) {
        if (verbose) this.exibirToast(Config.MSG.INTERNET_OFFLINE, Config.TOAST.ERROR);
        resolve();
        return;
      }
      
      this.executando = true;
      if (verbose) this.loadingFactory.exibir(Config.MSG.SINCRONIZANDO_CHAMADOS);
      
      if (verbose) this.loadingFactory.alterar(Config.MSG.BUSCANDO_CHAMADOS_BASE_LOCAL);
      this.buscarChamadosStorage().then((chamadosStorage) => {

        if (verbose) this.loadingFactory.alterar(Config.MSG.ENVIANDO_CHECKINS);
        this.enviarCheckins(verbose, chamadosStorage).then(() => {

          if (verbose) this.loadingFactory.alterar(Config.MSG.ENVIANDO_INTENCOES);
          this.enviarIntencao(verbose, chamadosStorage).then(() => {

            if (verbose) this.loadingFactory.alterar(Config.MSG.ENVIANDO_CHAMADOS_FECHADOS);
            this.enviarChamadosFechados(verbose, chamadosStorage).then((chamadosAbertos) => {

              if (verbose) this.loadingFactory.alterar(Config.MSG.BUSCANDO_CHAMADOS_SERVIDOR);
              this.buscarChamadosApi(codTecnico).subscribe((chamadosApi) => {

                if (chamadosApi.length !== chamadosStorage.length && !verbose) this.dispararSinalSonoroComVibracao();

                if (verbose) this.loadingFactory.alterar(Config.MSG.COMBINANDO_CHAMADOS_SERVIDOR_SMARTPHONE);
                this.combinarChamadosApiStorage(verbose, chamadosAbertos, chamadosApi).then((chamadosCombinados) => {

                  if (verbose) this.loadingFactory.alterar(Config.MSG.ATUALIZAR_CHAMADOS_STORAGE);
                  this.atualizarChamadosStorage(chamadosCombinados).then((chamadosStorageRes) => {
                    
                    resolve(chamadosStorageRes);
                  }).catch(() => { 
                    this.executando = false;
                    this.loadingFactory.encerrar();
                    if (verbose) this.exibirToast(Config.MSG.ERRO_GRAVAR_CHAMADOS_API_STORAGE, Config.TOAST.ERROR);
                    reject();
                  });
                }).catch(() => {
                  this.executando = false;
                  this.loadingFactory.encerrar();
                  if (verbose) this.exibirToast(Config.MSG.ERRO_UNIFICAR_CHAMADOS_API_STORAGE, Config.TOAST.ERROR);
                  reject();
                });
              },
              response => {
                if (verbose) {
                  if (response.status === 500) {
                    this.exibirToast(Config.MSG.ERRO_AO_CONSULTAR_CHAMADOS_TECNICO, Config.TOAST.ERROR);
                    this.logService.adicionarLog({tipo: Config.LOG.TIPOS.SUCCESS, mensagem: response.message});
                  }
                    
                  
                  if (response.status === 404) {
                    this.exibirToast(Config.MSG.NENHUM_CHAMADO_ENCONTRADO, Config.TOAST.WARNING);
                    this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: response.message});
                  }
                }

                this.executando = false;
                this.loadingFactory.encerrar();
                reject();
              },
              () => {
                this.executando = false;
                this.loadingFactory.encerrar();
                if (verbose) this.exibirToast(Config.MSG.CHAMADOS_SINCRONIZADOS, Config.TOAST.SUCCESS);
                this.events.publish('sincronizacao:efetuada');
              })
            }).catch(() => { 
              this.executando = false;
              this.loadingFactory.encerrar();
              if (verbose) this.exibirToast(Config.MSG.ERRO_AO_ENVIAR_CHAMADO_FECHADO, Config.TOAST.ERROR);
              this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: Config.MSG.ERRO_AO_ENVIAR_CHAMADO_FECHADO});
              reject();
            });
          }).catch(() => { 
            this.executando = false;
            this.loadingFactory.encerrar();
            if (verbose) this.exibirToast(Config.MSG.ERRO_AO_ENVIAR_INTENCOES, Config.TOAST.ERROR);
            this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: Config.MSG.ERRO_AO_ENVIAR_INTENCOES});
            reject();
          });
        }).catch(() => { 
          this.executando = false;
          this.loadingFactory.encerrar();
          if (verbose) this.exibirToast(Config.MSG.ERRO_AO_ENVIAR_CHECKINS, Config.TOAST.ERROR);
          this.logService.adicionarLog({tipo: Config.LOG.TIPOS.ERROR, mensagem: Config.MSG.ERRO_AO_ENVIAR_CHECKINS});
          reject();
        });
      });
    });
  }

  combinarChamadosApiStorage(verbose: boolean=false, chamadosStorage: Chamado[], chamadosApi: Chamado[]): Promise<Chamado[]> {
    return new Promise((resolve, reject) => {
      chamadosStorage.forEach((cStorage, sIndex) => {
        if (!this.verificarListaContemChamado(cStorage, chamadosApi)) {
          chamadosStorage.splice(sIndex, 1);
        } else {
          chamadosStorage.forEach((cStorage, sIndex) => {
            chamadosApi.forEach((cApi) => {
              if (cStorage.codOs === cApi.codOs) {
                chamadosStorage[sIndex].indBloqueioReincidencia = cApi.indBloqueioReincidencia;
                chamadosStorage[sIndex].indOSIntervencaoEquipamento = cApi.indOSIntervencaoEquipamento;
                chamadosStorage[sIndex].tipoIntervencao = cApi.tipoIntervencao;
              }
            });
          });
        }
      });

      chamadosStorage = chamadosStorage.concat(chamadosApi);

      resolve(chamadosStorage);
    });
  }

  enviarCheckins(verbose: boolean=false, chamadosStorage: Chamado[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const enviarCheckin = (checkin: Checkin, i: number) => {
        return new Promise((resolve, reject) => {
          if (verbose) this.loadingFactory.alterar(`Enviando checkins para o servidor`);
          
          this.checkinCheckoutService.enviarCheckinApi(checkin).subscribe(() => {
            resolve(`Checkin enviado com sucesso`);
          }, err => {
            reject(`Não foi possível enviar o checkin`);
          });
        })
      }
  
      const checkins = []
      chamadosStorage.forEach(chamado => { 
        if (chamado.checkin.localizacao.latitude && chamado.checkin.localizacao.longitude)
          checkins.push(chamado.checkin)
      });

      if (checkins.length == 0) {
        resolve();
        return
      }

      const promises = []
      checkins.map((checkin, checkinIndex) => {
        if (checkin.status != Config.CHECKIN.STATUS.ENVIADO) {
          promises.push(enviarCheckin(checkin, checkinIndex));
        }
      });
  
      Promise.all(promises)
        .then(() => {
          chamadosStorage.forEach((chamado, i) => { 
            chamado.checkin.status = Config.CHECKIN.STATUS.ENVIADO;
            this.atualizarChamado(chamado);
          });

          resolve();
        })
        .catch(error => {
          reject(`Erro: ${error}`);
        });
    });
  }

  enviarIntencao(verbose: boolean=false, chamadosStorage: Chamado[]): Promise<any> {
    return new Promise((resolve, reject) => {
      chamadosStorage = chamadosStorage.filter((c) => { return (c.indIntencaoAtendimento) });

      if (!chamadosStorage.length || !this.geolocationService.buscarUltimaLocalizacao()) {
        resolve();
        return
      }

      let intencao = new Intencao();
      intencao.localizacao = this.geolocationService.buscarUltimaLocalizacao();
      intencao.codOS = chamadosStorage[0].codOs;
      intencao.dataHoraCadastro = chamadosStorage[0].dataHoraIntencaoAtendimento;
      intencao.codTecnico = chamadosStorage[0].tecnico.codTecnico;

      this.enviarIntencaoApi(intencao).subscribe(() => { resolve() }, e => { reject() });
    });
  }

  enviarChamadosFechados(verbose: boolean=false, chamados: Chamado[]): Promise<any> {
    return new Promise((resolve, reject) => {
      let chamadosFechados = chamados.filter((c) => { return (c.dataHoraFechamento !== null) });

      if (!chamadosFechados.length) {
        resolve(chamados);
        return
      }

      if (verbose) {
        this.loadingFactory.alterar(Config.MSG.ENVIANDO_CHAMADO_FECHADO);
      }

      this.fecharChamadoApi(chamadosFechados[0]).subscribe((res) => {
        this.apagarChamadoStorage(chamadosFechados[0]).then(() => {
          this.buscarChamadosStorage().then((chamadosStorage) => {
            resolve(chamadosStorage);
          }).catch(() => {
            reject();
          });
        }).catch(() => {
          reject();
        }); 
      }, error => {
       reject(); 
      });
    });
  }

  atualizarChamado(novoChamado: Chamado): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.get('Chamados').then((chamadosStorage: Chamado[]) => {
        chamadosStorage = chamadosStorage.filter((c) => {
          return (c.codOs.toString().indexOf(novoChamado.codOs.toString()) < 0);
        });

        chamadosStorage.push(novoChamado);

        this.storage.set('Chamados', chamadosStorage).then(() => {
          this.chamados = chamadosStorage;
          resolve();
        }).catch(() => {
          reject();
        });
      })
      .catch(() => {
        reject();
      })
    });
  }

  atualizarChamadosStorage(novosChamados: Chamado[]): Promise<Chamado[]> {
    return new Promise((resolve, reject) => {
      this.storage.set('Chamados', novosChamados).then((res) => {
        this.chamados = novosChamados;

        resolve(novosChamados);
      })
      .catch(() => {
        reject();
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
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          reject(false);
        });
    });
  }

  buscarStatusExecucao(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(this.executando);
    });
  }

  private verificarListaContemChamado(chamado: Chamado, lista: Chamado[]): boolean {
      var i;
      for (i = 0; i < lista.length; i++) {
        if (lista[i].codOs === chamado.codOs) {
          return true;
        }
      }

      return false;
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
}