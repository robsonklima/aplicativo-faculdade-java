import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, MenuController, Events } from 'ionic-angular';
import { BackgroundGeolocation, BackgroundGeolocationResponse, BackgroundGeolocationConfig, BackgroundGeolocationEvents } from '@ionic-native/background-geolocation';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NativeAudio } from '@ionic-native/native-audio';
import { Vibration } from '@ionic-native/vibration';

import { Config } from "../config/config";
import { Chamado } from '../models/chamado';
import { Localizacao } from '../models/localizacao';

import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { SenhaAlteracaoPage } from "../pages/senha-alteracao/senha-alteracao";

import { DadosGlobais } from '../models/dados-globais';
import { DadosGlobaisService } from '../services/dados-globais';
import { GeolocationService } from '../services/geo-location';
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
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    platform: Platform,
    private events: Events,
    private bGeolocation: BackgroundGeolocation,
    private nativeAudio: NativeAudio,
    private vibration: Vibration,
    private dadosGlobaisService: DadosGlobaisService,
    private geolocation: GeolocationService,
    private usuarioService: UsuarioService,
    private menuCtrl: MenuController,
    private chamadoService: ChamadoService
  ) {
    platform.ready().then(() => {
      statusBar.overlaysWebView(false);
      statusBar.backgroundColorByHexString('#488aff');
      splashScreen.hide();
      
      if (platform.is('cordova')) { this.iniciarColetaLocalizacaoSegundoPlano() }
      this.events.subscribe('login:efetuado', (dg: DadosGlobais) => { this.dadosGlobais = dg });
      this.events.subscribe('sincronizacao:solicitada', () => { this.iniciarSincronizacao() });
      
      this.dadosGlobaisService.buscarDadosGlobaisStorage().then((dados) => {
        if (dados) 
          this.dadosGlobais = dados;

          if (dados) {
            if (dados.usuario) {
              this.usuarioService.salvarCredenciais(dados.usuario);
              
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
    if (!this.dadosGlobais.usuario.codTecnico) return;

    if (!this.verificarIntervaloMinimoSincronizacao()) return;

    clearInterval(this.task);

    this.task = setInterval(() => { 
      this.sincronizarChamados();
    }, Config.INT_SINC_CHAMADOS_MILISEG);

    this.sincronizarChamados().then(() => {}).catch(() => {});
  }

  private sincronizarChamados(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataHoraUltAtualizacao = new Date();

      this.chamadoService.buscarChamadosStorage().then((chamadosStorage) => {
        this.sincronizarChamadosFechados(chamadosStorage.filter((c) => { return (c.dataHoraFechamento !== null) })).then(() => {
          this.chamadoService.buscarChamadosApi(this.dadosGlobais.usuario.codTecnico).subscribe((chamadosApi) => {
            this.unificarChamadosApiStorage(chamadosStorage, chamadosApi).then((chamadosUnificados) => {
              if (chamadosUnificados.length) {
                this.chamadoService.atualizarChamadosStorage(chamadosUnificados).then(() => {
                  this.events.publish('sincronizacao:efetuada');

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

          this.dispararSinalSonoroComVibracao();
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
                this.dispararSinalSonoroComVibracao();

                resolve(true);
              }).catch(() => {
                reject(false);
              });
            } else {
              this.dispararSinalSonoroComVibracao();

              reject(false);
            }
          }
        },
        err => {
          this.dispararSinalSonoroComVibracao();
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

  private iniciarColetaLocalizacaoSegundoPlano() {
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 15,
      distanceFilter: 30,
      debug: false,
      stopOnTerminate: false,
      interval: 5 * 60000,
      fastestInterval: 5 * 60000,
      activitiesInterval: 5 * 60000,
      notificationTitle: 'App Técnicos',
      notificationText: 'Sistema de Sincronização',
      maxLocations: 1
    };

    this.bGeolocation.configure(config).then(() => {
      this.bGeolocation.on(BackgroundGeolocationEvents.location).subscribe((res: BackgroundGeolocationResponse) => {
          this.dadosGlobaisService.buscarDadosGlobaisStorage().then((dg) => {
            if (dg) {
              let loc = new Localizacao();
              loc.latitude = res.latitude;
              loc.longitude = res.longitude;
              loc.codUsuario = dg.usuario.codUsuario;
              loc.dataHoraCad = moment().format('YYYY-MM-DD HH:mm:ss');

              if (loc.codUsuario){
                this.geolocation.enviarLocalizacao(loc).subscribe(() => { this.iniciarSincronizacao() }, err => {});
              }
            }
          }).catch();
        }, err => {});
    }).catch();
    
    this.bGeolocation.start().then().catch();
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

  public sair() {
    this.dadosGlobaisService.apagarDadosGlobaisStorage().then(() => {
        this.nav.setRoot(this.loginPage);
      }).catch((err) => {});
  }
}