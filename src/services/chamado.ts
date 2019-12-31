import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { ToastController, Toast, LoadingController, Events, Platform, Loading } from 'ionic-angular';

import { Storage } from "@ionic/storage";
import { Observable } from "rxjs/Observable";
import { NativeAudio } from '@ionic-native/native-audio';
import { Vibration } from '@ionic-native/vibration';
import { Config } from '../models/config';
import _ from 'lodash';

import { LoadingFactory } from '../factories/loading-factory';
import { ToastFactory } from '../factories/toast-factory';

import 'rxjs/Rx';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';

import { Chamado } from "../models/chamado";
import { Foto } from '../models/foto';

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
    private nativeAudio: NativeAudio,
    private vibration: Vibration,
    private loadingFactory: LoadingFactory,
    private toastFactory: ToastFactory
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

  enviarFotoApi(foto: Foto): Observable<any> {
    return this.http.post(Config.API_URL + 'RatImagemUpload', foto)
      .timeout(60000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  fecharChamadoApi(chamado: Chamado): Observable<any> {
    return this.http.post(Config.API_URL + 'OsTecnico', chamado)
      .timeout(30000)
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
        this.chamados = chamados != null ? chamados .filter((cham, index, self) => index === self.findIndex((c) => ( c.codOs === cham.codOs ))
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
  
  atualizarChamado(chamado: Chamado): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.get('Chamados').then((chamados: Chamado[]) => {
        let objIndex = chamados.findIndex((c => c.codOs == chamado.codOs));
        chamados[objIndex] = chamado;
        this.storage.set('Chamados', chamados).then(() => { 
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

  sincronizarChamados(verbose: boolean=false, codTecnico: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!codTecnico) {
        if (verbose) this.toastFactory.exibirToast(Config.MSG.ERRO_TECNICO_NAO_ENCONTRADO, Config.TOAST.ERROR);
        resolve();
        return;
      }

      if (this.executando) {
        if (verbose) this.toastFactory.exibirToast(Config.MSG.AGUARDE_ALGUNS_INSTANTES, Config.TOAST.WARNING);
        resolve();
        return;
      }

      if (!navigator.onLine) {
        if (verbose) this.toastFactory.exibirToast(Config.MSG.INTERNET_OFFLINE, Config.TOAST.ERROR);
        resolve();
        return;
      }
      
      this.executando = true;
      if (verbose) this.loadingFactory.exibir(Config.MSG.SINCRONIZANDO_CHAMADOS);
      
      if (verbose) this.loadingFactory.alterar(Config.MSG.BUSCANDO_CHAMADOS_BASE_LOCAL);
      this.buscarChamadosStorage().then((chamadosStorage) => {

        if (verbose) this.loadingFactory.alterar(Config.MSG.ENVIANDO_FOTOS_PARA_SERVIDOR);
        this.enviarFotos(verbose, chamadosStorage).then(() => {

          if (verbose) this.loadingFactory.alterar(Config.MSG.ENVIANDO_CHAMADOS_FECHADOS);
          this.sincronizarChamadosFechados(verbose, chamadosStorage).then(() => {

            if (verbose) this.loadingFactory.alterar(Config.MSG.BUSCANDO_CHAMADOS_SERVIDOR);
            this.buscarChamadosApi(codTecnico).subscribe((chamadosApi) => {

              if (verbose) this.loadingFactory.alterar(Config.MSG.COMBINANDO_CHAMADOS_SERVIDOR_SMARTPHONE);
              this.unificarChamadosApiStorage(verbose, chamadosStorage, chamadosApi).then((chamadosUnificados) => {
                if (!chamadosUnificados.length) return;

                if (verbose) this.loadingFactory.alterar(Config.MSG.ATUALIZAR_CHAMADOS_STORAGE);
                this.atualizarChamadosStorage(chamadosUnificados).then((chamadosStorageRes) => {
                  this.executando = false;
                  this.loadingFactory.encerrar();
                  if (verbose) this.toastFactory.exibirToast(Config.MSG.CHAMADOS_SINCRONIZADOS, Config.TOAST.SUCCESS);
                  this.events.publish('sincronizacao:efetuada');
                  resolve(chamadosStorageRes);
                }).catch(() => { 
                  this.executando = false;
                  this.loadingFactory.encerrar();
                  if (verbose) this.toastFactory.exibirToast(Config.MSG.ERRO_GRAVAR_CHAMADOS_API_STORAGE, Config.TOAST.ERROR);
                  reject();
                });
              }).catch(() => {
                this.executando = false;
                this.loadingFactory.encerrar();
                if (verbose) this.toastFactory.exibirToast(Config.MSG.ERRO_UNIFICAR_CHAMADOS_API_STORAGE, Config.TOAST.ERROR);
                reject();
              });
            }, () => { 
              this.executando = false;
              this.loadingFactory.encerrar();
              if (verbose) this.toastFactory.exibirToast(Config.MSG.ERRO_AO_CONSULTAR_CHAMADOS_TECNICO, Config.TOAST.ERROR);
              reject();
            });
          }).catch(() => { 
            this.executando = false;
            this.loadingFactory.encerrar();
            if (verbose) this.toastFactory.exibirToast(Config.MSG.ERRO_AO_ENVIAR_CHAMADO_FECHADO, Config.TOAST.ERROR);
            reject();
          }); 
        }).catch(() => { 
          this.executando = false;
          this.loadingFactory.encerrar();
          if (verbose) this.toastFactory.exibirToast(Config.MSG.ERRO_ENVIAR_FOTOS_PARA_SERVIDOR, Config.TOAST.ERROR);
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

  enviarFotos(verbose: boolean=false, chamadosStorage: Chamado[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const enviarFoto = (foto: Foto, i: number) => {
        return new Promise((resolve, reject) => {
          if (verbose) {
            let qtdFotosAEnviar = fotos.filter((f) => { 
              return (f.status != Config.FOTO.STATUS.ENVIADA) 
            }).length;
            
            this.loadingFactory.alterar(
              `Enviando: ${qtdFotosAEnviar} ${qtdFotosAEnviar == 1 ? 'foto' : 'fotos'}. 
               Este processo pode demorar alguns minutos`);
          }
            
          this.enviarFotoApi(foto).subscribe(() => {
            resolve(`Foto ${foto.nome} enviada com sucesso`);
          }, err => {
            reject(`Não foi possível enviar a foto ${foto.nome}`);
          });
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
  
      Promise.all(promises)
        .then(response => {
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

  sincronizarChamadosFechados(verbose: boolean=false, chamados: Chamado[]): Promise<any> {
    let chamadosFechados = chamados.filter((c) => { return (c.dataHoraFechamento !== null) });

    return new Promise((resolve, reject) => {
      if (!chamadosFechados.length) {
        resolve();
        return
      }

      let chamadoAFechar = chamadosFechados[0];
      chamadoAFechar.rats.forEach((rat, ratIndex) => {
        rat.fotos.forEach((foto, fotoIndex) => {
          chamadoAFechar.rats[ratIndex].fotos[fotoIndex].str = "";
        });
      });

      this.fecharChamadoApi(chamadoAFechar).subscribe(res => {
        if (res) {
          if (res.indexOf('00 - ') > -1) {
            if (verbose) this.toastFactory.exibirToast('Chamado ' + chamadoAFechar.codOs + ' fechado junto ao servidor', Config.TOAST.SUCCESS);
            
            this.apagarChamadoStorage(chamadoAFechar).then(() => { 
              resolve();
            }).catch(() => { reject(false) });
          } else {
            if (verbose) this.toastFactory.exibirToast('Não foi possível sincronizar o chamado ' + chamadoAFechar.codOs + '', Config.TOAST.ERROR);
            
            reject();
          }
        }
      },
      err => {
        reject();
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
}