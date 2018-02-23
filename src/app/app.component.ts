import { Component, ViewChild } from '@angular/core';
import { Platform, ToastController, NavController, MenuController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { BackgroundMode } from '@ionic-native/background-mode';
import { PhonegapLocalNotification } from '@ionic-native/phonegap-local-notification';
import { NativeAudio } from '@ionic-native/native-audio';
import { Vibration } from '@ionic-native/vibration';

import { Config } from "../config/config";

import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { SenhaAlteracaoPage } from "../pages/senha-alteracao/senha-alteracao";

import { DadosGlobais } from '../models/dados-globais';
import { DadosGlobaisService } from '../services/dados-globais';
import { Chamado } from '../models/chamado';

import { UsuarioService } from '../services/usuario';
import { ChamadoService } from "../services/chamado";

import moment from 'moment';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  loginPage = LoginPage;
  homePage = HomePage;
  @ViewChild('nav') nav: NavController;
  dataHoraUltAtualizacao: Date = new Date();

  dadosGlobais: DadosGlobais;
  chamados: Chamado[];
  task: any;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    private toastCtrl: ToastController,
    private events: Events,
    private backgroundMode: BackgroundMode,
    private localNotification: PhonegapLocalNotification,
    private nativeAudio: NativeAudio,
    private vibration: Vibration,
    private dadosGlobaisService: DadosGlobaisService,
    private usuarioService: UsuarioService,
    private menuCtrl: MenuController,
    private chamadoService: ChamadoService
  ) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();

      this.events.subscribe('login:efetuado', (dadosGlobais: DadosGlobais) => {
        this.dadosGlobais = dadosGlobais;
        this.iniciarSincronizacao();
      });

      this.events.subscribe('sincronizacao:solicitada', () => {
        this.iniciarSincronizacao();
      });
      
      this.dadosGlobaisService.buscarDadosGlobaisStorage().then((dados) => {
        if (dados) 
          this.dadosGlobais = dados;

          if (dados) {
            if (dados.usuario) {
              this.usuarioService.salvarCredenciais(dados.usuario);

              this.backgroundMode.setDefaults({ title: '', text: '', silent: true });
              this.backgroundMode.enable();

              this.backgroundMode.on("activate").subscribe(() => { 
                this.iniciarSincronizacao(); 
              }, err => {});
              
              this.iniciarSincronizacao();

              this.menuCtrl.enable(true);
              this.nav.setRoot(this.homePage);
            } else {
              this.nav.setRoot(this.loginPage);
            }
          } else {
            this.nav.setRoot(this.loginPage);
          }
      }).catch();
    });
  }

  public telaSenhaAlteracao() {
    this.menuCtrl.close().then(() => {
      this.nav.push(SenhaAlteracaoPage);  
    })
  }

  private iniciarSincronizacao() {
    if (!this.dadosGlobais.usuario.codTecnico) { return }

    if (!this.verificarIntervaloMinimoSincronizacao()) {
      return
    } 

    clearInterval(this.task);

    this.task = setInterval(() => { 
      this.sincronizarChamados();
    }, Config.INT_SINC_CHAMADOS_MILISEG);

    this.sincronizarChamados();
  }

  private sincronizarChamados() {
    this.dataHoraUltAtualizacao = new Date();

    this.chamadoService.buscarChamadosStorage().then((chamadosStorage) => {
      this.sincronizarChamadosFechados(chamadosStorage.filter((c) => { return (c.dataHoraFechamento !== null) })).then(() => {
        this.chamadoService.buscarChamadosApi(this.dadosGlobais.usuario.codTecnico).subscribe((chamadosApi) => {
          this.unificarChamadosApiStorage(chamadosStorage, chamadosApi).then((chamadosUnificados) => {
            if (chamadosUnificados.length) {
              this.chamadoService.atualizarChamadosStorage(chamadosUnificados).then(() => {
                this.events.publish('sincronizacao:efetuada');
              }).catch(() => {});
            }
          })
          .catch(() => {});
        }, err => {
          if (!this.backgroundMode.isActive())
            this.exibirToast('Não foi possível conectar ao servidor');
        });
      })
      .catch(() => {});
    })
    .catch(() => {});
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

          this.exibirMensagem(ca.codOs.toString(), 'Chamado Recebido');
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
          if (!chamadoEncontrado) {
            //this.exibirMensagem(cs.codOs.toString(), 'Chamado Removido');
          } else {
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
                this.exibirMensagem(chamado.codOs.toString(), 'Chamado sincronizado no servidor');

                resolve(true);
              }).catch(() => {
                reject(false);
              });
            } else {
              this.exibirMensagem(chamado.codOs.toString(), 'Não foi possível sincronizar');

              reject(false);
            }
          }
        },
        err => {
          this.exibirMensagem(chamado.codOs.toString(), 'Não foi possível sincronizar');
          reject(false);
        });
      });

      resolve(true);
    });
  }

  private verificarIntervaloMinimoSincronizacao(): boolean {
    return (moment.duration(moment(new Date()).diff(moment(this.dataHoraUltAtualizacao))).seconds() 
      > Config.INT_MIN_SINC_CHAMADOS_SEG && this.dataHoraUltAtualizacao !== null);
  }

  private dispararSinalSonoroComVibracao() {
    this.nativeAudio.preloadSimple('audioPop', 'assets/sounds/hangouts.ogg').then(() => {
      this.nativeAudio.play('audioPop').then(() => {
        setTimeout(() => {
          this.nativeAudio.stop('audioPop').then(() => {
            this.nativeAudio.unload('audioPop').then(() => {
              this.vibration.vibrate(1500);
            }, err => {});
          }, err => {}); 
        }, 1000);
      }, err => {});
    }, err => {});
  }

  private exibirMensagem(titulo: string, corpo: string) {
    if (this.backgroundMode.isActive()) {
      this.dispararSinalSonoroComVibracao();
      this.exibirNotificacao(titulo, corpo);
    } else {
      this.exibirToast(titulo + ' - ' + corpo);
    }
  }

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: 3000, position: 'bottom'
      });

      resolve(toast.present());
      reject();
    });
  }

  private exibirNotificacao(titulo:string, corpo: string): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(
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
          })
          .catch()
      );
    });
  }

  public sair() {
    this.dadosGlobaisService.apagarDadosGlobaisStorage().then(() => {
        this.nav.setRoot(this.loginPage);
      }).catch((err) => {});
  }
}