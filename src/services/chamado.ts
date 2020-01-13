import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Toast, Events, ToastController } from 'ionic-angular';

import { Storage } from "@ionic/storage";
import { Observable } from "rxjs/Observable";
import { NativeAudio } from '@ionic-native/native-audio';
import { PhonegapLocalNotification } from '@ionic-native/phonegap-local-notification';
import { Vibration } from '@ionic-native/vibration';
import { Config } from '../models/config';
import _ from 'lodash';

import { LoadingFactory } from '../factories/loading-factory';

import 'rxjs/Rx';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';

import { Chamado } from "../models/chamado";
import { Foto } from '../models/foto';
import { Checkin } from '../models/checkin';
import { Intencao } from '../models/intencao';
import { GeolocationService } from './geo-location';
import { FotoService } from './foto';
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
    private localNotification: PhonegapLocalNotification,
    private nativeAudio: NativeAudio,
    private vibration: Vibration,
    private loadingFactory: LoadingFactory,
    private geolocationService: GeolocationService,
    private fotoService: FotoService,
    private checkinCheckoutService: CheckinCheckoutService
  ) {}

  buscarChamadosApi(codTecnico: number): Observable<Chamado[]> {
    return this.http.get(Config.API_URL + 'OsTecnico/' + codTecnico)
      .timeout(60000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json())
    );
  }

  buscarChamadoApi(codOS: number): Observable<Chamado> {
    return this.http.get(Config.API_URL + 'Os/' + codOS)
      .timeout(60000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json())
    );
  }

  enviarIntencaoApi(intencao: Intencao): Observable<any> {
    return this.http.post(Config.API_URL + 'OsIntencao', intencao)
      .timeout(60000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  fecharChamadoApi(chamado: Chamado): Observable<any> {
    return this.http.post(Config.API_URL + 'OsTecnico', chamado)
      .timeout(60000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarChamadosFechadosApi(codTecnico: number): Observable<Chamado[]> {
    return this.http.get(Config.API_URL + 'OsTecnicoFechada/' + codTecnico)
      .timeout(60000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json())
    );
  }

  registrarLeituraChamadoApi(chamado: Chamado): Observable<any> {
    return this.http.post(Config.API_URL + 'OsTecnicoLeitura', chamado)
      .timeout(60000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
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

            if (verbose) this.loadingFactory.alterar(Config.MSG.ENVIANDO_FOTOS_PARA_SERVIDOR);
            this.enviarFotos(verbose, chamadosStorage).then(() => {

              if (verbose) this.loadingFactory.alterar(Config.MSG.ENVIANDO_CHAMADOS_FECHADOS);
              this.enviarChamadosFechados(verbose, chamadosStorage).then((chamadosAbertos) => {

                if (verbose) this.loadingFactory.alterar(Config.MSG.BUSCANDO_CHAMADOS_SERVIDOR);
                this.buscarChamadosApi(codTecnico).subscribe((chamadosApi) => {

                  if (chamadosApi.length !== chamadosStorage.length && !verbose) this.dispararSinalSonoroComVibracao();

                  if (verbose) this.loadingFactory.alterar(Config.MSG.COMBINANDO_CHAMADOS_SERVIDOR_SMARTPHONE);
                  this.combinarChamadosApiStorage(verbose, chamadosAbertos, chamadosApi).then((chamadosCombinados) => {

                    if (verbose) this.loadingFactory.alterar(Config.MSG.ATUALIZAR_CHAMADOS_STORAGE);
                    this.atualizarChamadosStorage(chamadosCombinados).then((chamadosStorageRes) => {
                      this.executando = false;
                      this.loadingFactory.encerrar();
                      if (verbose) this.exibirToast(Config.MSG.CHAMADOS_SINCRONIZADOS, Config.TOAST.SUCCESS);
                      this.events.publish('sincronizacao:efetuada');
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
                }, () => { 
                  this.executando = false;
                  this.loadingFactory.encerrar();
                  if (verbose) this.exibirToast(Config.MSG.ERRO_AO_CONSULTAR_CHAMADOS_TECNICO, Config.TOAST.ERROR);
                  reject();
                });
              }).catch(() => { 
                this.executando = false;
                this.loadingFactory.encerrar();
                if (verbose) this.exibirToast(Config.MSG.ERRO_AO_ENVIAR_CHAMADO_FECHADO, Config.TOAST.ERROR);
                reject();
              }); 
            }).catch(() => { 
              this.executando = false;
              this.loadingFactory.encerrar();
              if (verbose) this.exibirToast(Config.MSG.ERRO_ENVIAR_FOTOS_PARA_SERVIDOR, Config.TOAST.ERROR);
              reject();
            });
          }).catch(() => { 
            this.executando = false;
            this.loadingFactory.encerrar();
            if (verbose) this.exibirToast(Config.MSG.ERRO_AO_ENVIAR_INTENCOES, Config.TOAST.ERROR);
            reject();
          });
        }).catch(() => { 
          this.executando = false;
          this.loadingFactory.encerrar();
          if (verbose) this.exibirToast(Config.MSG.ERRO_AO_ENVIAR_CHECKINS, Config.TOAST.ERROR);
          reject();
        });
      });
    });
  }

  combinarChamadosApiStorage(verbose: boolean=false, chamadosStorage: Chamado[], chamadosApi: Chamado[]): Promise<Chamado[]> {
    return new Promise((resolve, reject) => {
      if (chamadosApi.length == 0) {
        resolve([]);
        return
      }

      if (chamadosStorage.length == 0) {
        chamadosStorage = chamadosApi;
      }

      chamadosStorage.forEach((cStorage, sIndex) => {
        chamadosApi.forEach((cAPI, aIndex) => {
          if (chamadosStorage.some(c => c.codOs === cAPI.codOs)) { // verifica se storage CONTEM chamado api
            if (cStorage.codOs == cAPI.codOs) {
              if (!_.isEqual(cAPI, cStorage)) {
                chamadosStorage[sIndex].tipoIntervencao = chamadosApi[aIndex].tipoIntervencao;
                chamadosStorage[sIndex].indBloqueioReincidencia = chamadosApi[aIndex].indBloqueioReincidencia;
                chamadosStorage[sIndex].indOSIntervencaoEquipamento = chamadosApi[aIndex].indOSIntervencaoEquipamento;
                chamadosStorage[sIndex].localAtendimento = chamadosApi[aIndex].localAtendimento;
                chamadosStorage[sIndex].equipamentoContrato = chamadosApi[aIndex].equipamentoContrato;
                chamadosStorage[sIndex].dataHoraAberturaOS = chamadosApi[aIndex].dataHoraAberturaOS;
                chamadosStorage[sIndex].dataHoraAgendamento = chamadosApi[aIndex].dataHoraAgendamento;
                chamadosStorage[sIndex].observacao = chamadosApi[aIndex].observacao;
                chamadosStorage[sIndex].defeitoRelatado = chamadosApi[aIndex].defeitoRelatado;
              }
            }
          } else {
            chamadosStorage.push(cAPI);
          }

          if (!chamadosApi.some(c => c.codOs === cStorage.codOs)) { // verifica se storage NAO contem chamado api
            chamadosStorage.splice(sIndex, 1);
          }
        });
      });

      chamadosStorage = chamadosStorage
        .filter((cham, index, self) => index === self.findIndex((c) => ( c.codOs === cham.codOs)))
        .sort((a, b) => { return ((a.codOs < b.codOs) ? -1 : ((a.codOs > b.codOs) ? 1 : 0))});
      
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

  enviarFotos(verbose: boolean=false, chamadosStorage: Chamado[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const enviarFoto = (foto: Foto, i: number) => {
        return new Promise((resolve, reject) => {
          if (verbose) {
            let qtdFotosAEnviar = fotos.filter((f) => { return (f.status != Config.FOTO.STATUS.ENVIADA) }).length;
            
            this.loadingFactory.alterar(`Enviando ${qtdFotosAEnviar} ${qtdFotosAEnviar == 1 ? 'foto' : 'fotos'} ao servidor. Por favor aguarde`);
          }
          
          //this.fotoService.comprimirFoto(foto).then(f => {
            this.fotoService.enviarFotoApi(foto).subscribe(() => {
              resolve(`Foto ${foto.nome} enviada com sucesso`);
            }, err => {
              reject(`Não foi possível enviar a foto ${foto.nome}`);
            });
          //}).catch();
        })
      }
  
      const fotos = []
      chamadosStorage.forEach(chamado => {
        chamado.rats.forEach((rat, ratIndex) => {
          rat.fotos.forEach((foto, fotoIndex) => {
            fotos.push(foto);
          });
        });
      });

      const promises = []
      fotos.map((foto, fotoIndex) => {
        if (foto.status != Config.FOTO.STATUS.ENVIADA) {
          promises.push(enviarFoto(foto, fotoIndex));
        }
      })
  
      Promise.all(promises).then(response => {
        chamadosStorage.forEach(chamado => {
          chamado.rats.forEach((rat, ratIndex) => {
            rat.fotos.forEach((foto, fotoIndex) => {
              chamado.rats[ratIndex].fotos[fotoIndex].status = Config.FOTO.STATUS.ENVIADA;
              this.atualizarChamado(chamado);
            });
          });
        });

        resolve();
      })
      .catch(error => {
        reject(`Erro: ${error}`);
      });
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
        this.loadingFactory.alterar(`Enviando ${chamadosFechados.length} ${chamadosFechados.length == 1 ? 'chamado' : 'chamados'} para o servidor`);
      }

      const enviarChamado = (chamado: Chamado, i: number) => {
        return new Promise((resolve, reject) => {
          this.fecharChamadoApi(chamado).subscribe((res) => {
            this.apagarChamadoStorage(chamado);
            
            resolve(`Chamado ${chamado.codOs} enviado com sucesso`);
          }, err => {
            reject(`Não foi possível enviar o chamado ${chamado.codOs}`);
          });
        })
      }
      
      const promises = []
      chamadosFechados.map((chamado, chamadoIndex) => {
        delete chamado.rats[0].fotos;
        promises.push(enviarChamado(chamado, chamadoIndex));
      });

      Promise.all(promises).then(response => {
        this.buscarChamadosStorage().then((chamadosStorage) => {
          //if (verbose) this.exibirToast(`${chamadosFechados.length == 1 ? 'Chamado' : 'Chamados'} enviados com sucesso para o servidor`, Config.TOAST.SUCCESS);

          resolve(chamadosStorage);
        }).catch(() => {
          reject();
        });
      }).catch(error => {
        if (verbose) this.exibirToast(`Não foi possível enviar ${chamadosFechados.length == 1 ? 'o chamado' : 'os chamados'} para o servidor`, Config.TOAST.ERROR);
        reject(`Erro: ${error}`);
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
        .then(() => { resolve(true) })
        .catch(() => { reject(false) });
    });
  }

  buscarStatusExecucao(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(this.executando);
    });
  }

  private exibirNotificacao(titulo:string, corpo: string): Promise<any> {
    return new Promise((resolve, reject) => {resolve(
      this.localNotification.requestPermission()
        .then((permission) => {
          if (permission === 'granted') {
            this.localNotification.create(
              titulo, 
              {
                tag: titulo,
                body: corpo,
                icon: 'assets/icon/favicon.ico'
              }
            );
          }
        }).catch()
      );
    });
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