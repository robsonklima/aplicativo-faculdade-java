import { Component, ViewChild } from '@angular/core';
import { Platform, ToastController, NavController, MenuController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AppVersion } from '@ionic-native/app-version';
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

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  loginPage = LoginPage;
  homePage = HomePage;
  @ViewChild('nav') nav: NavController;
  ultimaAtualizacao: Date = new Date();
  dadosGlobais: DadosGlobais;
  chamados: Chamado[];
  task: any;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    private toastCtrl: ToastController,
    private appVersion: AppVersion,
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
        this.prepararSincronizacao();
      });

      this.events.subscribe('sincronizacao:solicitada', () => {
        this.prepararSincronizacao();
      });
      
      this.dadosGlobaisService.buscarDadosGlobaisStorage().then((dados) => {
        if (dados) 
          this.dadosGlobais = dados;

          if (dados) {
            if (dados.usuario) {
              this.usuarioService.salvarCredenciais(dados.usuario);
              
              this.appVersion.getVersionNumber().then((versaoApp) => {
                this.dadosGlobais.versaoApp = versaoApp;
              }).catch(() => {});

              this.menuCtrl.enable(true);
              this.nav.setRoot(this.homePage);

              this.backgroundMode.enable();
              this.backgroundMode.setDefaults(Config.BACKGROUND_MODE_CONFIG);
              
              this.backgroundMode.on("activate").subscribe(() => { 
                this.prepararSincronizacao(); 
              }, err => {});
              
              this.prepararSincronizacao();
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

  private prepararSincronizacao() {
    if (!this.verificarIntervaloMinimoSincronizacao()) {
      console.log('Sincronização Rejeitada', new Date().toLocaleString('pt-BR'));
      return
    } 

    clearInterval(this.task);

    this.sincronizarChamados();

    this.task = setInterval(() => {
      this.sincronizarChamados();
    }, Config.INT_SINC_CHAMADOS_MILISEG);
  }

  private sincronizarChamados() {
    this.ultimaAtualizacao = new Date();

    this.chamadoService.buscarChamadosStorage().then((chamadosStorage) => {
      this.sincronizarChamadosFechados(chamadosStorage.filter((c) => { return (c.dataHoraFechamento !== null) })).then(() => {
        console.log('Chamados Fechados Enviados', new Date().toLocaleString('pt-BR'));

        this.chamadoService.buscarChamadosApi(this.dadosGlobais.usuario.codTecnico).subscribe((chamadosApi) => {
          console.log('Chamados Api Carregados', new Date().toLocaleString('pt-BR'));
          
          this.unificarChamadosApiStorage(chamadosStorage, chamadosApi).then((chamadosUnificados) => {
            this.chamadoService.atualizarChamadosStorage(chamadosUnificados).then(() => {
              this.events.publish('sincronizacao:efetuada');
            })
            .catch(() => {});
          })
          .catch(() => {});
        }, err => {
          if (!this.backgroundMode.isActive())
            this.exibirToast('Não foi possível conectar ao servidor');

          console.log('Chamados Api Erro ao Carregar', new Date().toLocaleString('pt-BR'));
        });
      })
      .catch(() => {
        console.log('Chamados Fechados Erro ao Enviar', new Date().toLocaleString('pt-BR'));
      });
    })
    .catch(() => {});

    console.log(' ');
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
            this.exibirMensagem(cs.codOs.toString(), 'Chamado Removido');
          } else {
            chamados.push(cs);
          }
        });
      }
    
      console.log('Chamados Api/Stg Unificados', new Date().toLocaleString('pt-BR'));
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
    if(!this.ultimaAtualizacao) return false;
    
    var diferenca = (new Date().getTime() - this.ultimaAtualizacao.getTime()) / 1000;

    return (Math.abs(Math.round(diferenca)) > Config.INT_MIN_SINC_CHAMADOS_SEG);
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