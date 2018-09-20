import { Component, ViewChild } from '@angular/core';
import { NavParams, Platform, Slides, AlertController, LoadingController, 
         ToastController, ModalController, NavController, Events, 
         ViewController } from 'ionic-angular';
import { NgForm } from '@angular/forms';

import { Geolocation } from '@ionic-native/geolocation';

import { Config } from './../../config/config';
import { DadosGlobaisService } from '../../services/dados-globais';
import { ChamadoService } from './../../services/chamado';
import { UsuarioService } from '../../services/usuario';
import { CheckinCheckoutService } from '../../services/checkin-checkout';

import { DadosGlobais } from '../../models/dados-globais';
import { Chamado } from "../../models/chamado";
import { Rat } from "../../models/rat";
import { UsuarioPonto } from '../../models/usuario-ponto';
import { Foto } from '../../models/foto';

import { RatDetalhePage } from "../rat-detalhe/rat-detalhe";
import { RatDetalhePecaPage } from "../rat-detalhe-peca/rat-detalhe-peca";
import { HistoricoListaPage } from '../historico/historico-lista';
import { FotosPage } from '../fotos/fotos';
import { LocalizacaoEnvioPage } from '../localizacao-envio/localizacao-envio';

import moment from 'moment';
import { Camera } from '@ionic-native/camera';

@Component({
  selector: 'chamado-page',
  templateUrl: 'chamado.html'
})
export class ChamadoPage {
  @ViewChild(Slides) slides: Slides;
  tituloSlide: string;
  dg: DadosGlobais;
  chamado: Chamado;
  usuarioPonto: UsuarioPonto;
  foto: Foto;
  qtdMaximaFotos: number = Config.QTD_MAX_FOTOS_POR_ATENDIMENTO;
  distanciaCercaEletronica: number = 0;
  dataAtual: string = moment().format('YYYY-MM-DD');
  horaAtual: string = moment().format('HH:mm:ss');

  constructor(
    private platform: Platform,
    private geolocation: Geolocation,
    private modalCtrl: ModalController,
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private events: Events,
    private camera: Camera,
    private dadosGlobaisService: DadosGlobaisService,
    private chamadoService: ChamadoService,
    private usuarioService: UsuarioService,
    private checkinCheckoutService: CheckinCheckoutService
  ) {
    this.chamado = this.navParams.get('chamado');
  }

  ionViewWillEnter() {
    this.configurarSlide(this.slides.getActiveIndex());

    this.carregarDadosGlobais()
      .then(() => this.obterDistanciaRaioFilial(this.dg.usuario.filial.nomeFilial))
      .then(() => this.obterRegistrosPonto())
      .then(() => this.registrarLeituraOs())
      .catch(() => {});
  }

  public alterarSlide() {
    this.configurarSlide(this.slides.getActiveIndex());
  }

  public telaRatDetalhe(chamado: Chamado) {
    const modal = this.modalCtrl.create(RatDetalhePage, { chamado: this.chamado });
    modal.present();
    modal.onDidDismiss(() => {
      this.configurarSlide(this.slides.getActiveIndex());
    });
  }

  public telaRatDetalhePeca(chamado: Chamado, i: number) {
    const modal = this.modalCtrl.create(RatDetalhePecaPage, { chamado: this.chamado, i: i });
    modal.present();
    modal.onDidDismiss(
      () => {

      }
    );
  }

  public telaFotos() {
    const modal = this.modalCtrl.create(FotosPage, { chamado: this.chamado, modalidade: 'FOTO' });
    modal.present();
    modal.onDidDismiss(() => {
      this.configurarSlide(this.slides.getActiveIndex());
    });
  }

  public tirarFoto(modalidade: string) {
    let orientacoes = Config.ORIENTACAO_FOTO.filter((orientacao) => {
      return (orientacao.MODALIDADE == modalidade);
    });

    if (orientacoes.length == 0)
      return;

    const confirmacao = this.alertCtrl.create({
      title: orientacoes[0].DESCRICAO,
      message: orientacoes[0].MENSAGEM,
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Abrir Câmera',
          handler: () => {
            this.camera.getPicture({
              quality: 100,
              destinationType: this.camera.DestinationType.DATA_URL,
              encodingType: this.camera.EncodingType.JPEG,
              mediaType: this.camera.MediaType.PICTURE,
              correctOrientation: true,
              targetWidth: 720,
              targetHeight: 480,
              allowEdit: true
            }).then(imageData => {
              this.foto = new Foto();
              this.foto.nome = moment().format('YYYYMMDDHHmmss') + "_" +this.chamado.codOs.toString() + '_' + this.chamado.rats[0].numRat + '_' + modalidade;
              this.foto.str = 'data:image/jpeg;base64,' + imageData;
              this.foto.modalidade = modalidade;
              this.chamado.rats[0].fotos.push(this.foto);
              this.chamadoService.atualizarChamado(this.chamado);
              this.camera.cleanup();
              setTimeout(() => { 
                this.exibirToast("Foto adicionada com sucesso");
              }, 500);
            }).catch(err => {});
          }
        }
      ]
    });

    confirmacao.present();
  }

  public carregarFoto(modalidade: string): string {
    if (this.chamado.rats.length > 0) {

      let fotos = this.chamado.rats[0].fotos.filter((foto) => {
        return (foto.modalidade == modalidade);
      });

      if (fotos.length > 0) {
        return fotos[0].str;  
      }
    }

    return './assets/imgs/sem_foto.png';
  }

  public removerFoto(modalidade: string) {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja excluir esta foto?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Excluir',
          handler: () => {
            if (this.chamado.rats.length > 0) {
              this.chamado.rats[0].fotos = this.chamado.rats[0].fotos.filter((f) => {
                return (f.modalidade != modalidade);
              });

              this.chamadoService.atualizarChamado(this.chamado);
            }
          }
        }
      ]
    });

    confirmacao.present();
  }

  public verificarExistenciaFoto(modalidade: string): boolean {
    if (this.chamado.rats.length > 0) {

      let fotos = this.chamado.rats[0].fotos.filter((foto) => {
        return (foto.modalidade == modalidade);
      });

      if (fotos.length > 0) {
        return true;  
      }
    }

    return false;
  }

  public telaDocumentos() {
    const modal = this.modalCtrl.create(FotosPage, { chamado: this.chamado, modalidade: 'DOCUMENTO' });
    modal.present();
    modal.onDidDismiss(() => {
      this.configurarSlide(this.slides.getActiveIndex());
    });
  }

  public telaEquipamentosHistorico(chamado: Chamado) {
    const modal = this.modalCtrl.create(HistoricoListaPage, { chamado: this.chamado });
    modal.present();
    modal.onDidDismiss(() => {});
  }

  public telaLocalizacaoEnvio() {
    const loader = this.loadingCtrl.create({
      content: 'Obtendo sua localização...'
    });
    loader.present();

    this.platform.ready().then(() => {
      this.geolocation.getCurrentPosition(Config.POS_CONFIG).then((location) => {
        loader.dismiss().then(() => {
          const modal = this.modalCtrl.create(
            LocalizacaoEnvioPage, { lat: location.coords.latitude, lng: location.coords.longitude, chamado: this.chamado }
          );
          this.viewCtrl.dismiss().then(() => { modal.present(); }).catch();
          modal.onDidDismiss(() => {});
        })
        .catch();
      })
      .catch((err) => {
        loader.dismiss(() => {
          this.exibirToast('Não foi possível obter sua localização!');
        });
      });
    })
    .catch(() => {});
  }

  public efetuarCheckin() {
    const alerta = this.alertCtrl.create({
      title: 'Confirmar o Checkin?',
      message: `Somente confirme o Checkin se você realmente estiver 
                  no local do atendimento`,
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            if (this.chamadoService.verificarExisteCheckinEmOutroChamado()) {
              this.exibirToast('Você possui checkin aberto em outro chamado');
              return
            }
            
            const loader = this.loadingCtrl.create({
              content: 'Obtendo sua localização...',
              enableBackdropDismiss: true,
              dismissOnPageChange: true
            });
            loader.present();

            this.platform.ready().then(() => {
              this.geolocation.getCurrentPosition(Config.POS_CONFIG).then((location) => {
                loader.dismiss().then(() => {
                  //this.exibirAlerta("Lat: " + location.coords.latitude + ", Lng: " + location.coords.longitude + ". Dist.: " + this.obterDistanciaRaio(location.coords.latitude, location.coords.longitude, this.chamado.localAtendimento.localizacao.latitude, this.chamado.localAtendimento.localizacao.longitude) + ".");

                  if (!this.chamado.indCercaEletronicaLiberada) {
                    if ((this.obterDistanciaRaio(
                      location.coords.latitude, 
                      location.coords.longitude, 
                      this.chamado.localAtendimento.localizacao.latitude, 
                      this.chamado.localAtendimento.localizacao.longitude) 
                      > Number(this.distanciaCercaEletronica))
                    ) {
                      this.exibirToast('Você está distante do local de atendimento');
                      //return
                    }
                  }

                  this.chamado.checkin.dataHoraCadastro = new Date().toLocaleString('pt-BR');
                  this.chamado.checkin.localizacao.latitude = location.coords.latitude;
                  this.chamado.checkin.localizacao.longitude = location.coords.longitude;
                  this.chamadoService.atualizarChamado(this.chamado).then(() => {
                    this.configurarSlide(this.slides.getActiveIndex());
                    this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
                  }).catch();
                  
                })
                .catch();
              })
              .catch((err) => {
                loader.dismiss().then(() => {
                  this.checkinCheckoutService.buscarCheckinApi(this.chamado.codOs).subscribe(checkin => {
                    if (checkin) {
                      if (checkin.localizacao.latitude && checkin.localizacao.longitude) {
                        this.chamado.checkin.dataHoraCadastro = new Date().toLocaleString('pt-BR');
                        this.chamado.checkin.localizacao.latitude = checkin.localizacao.latitude;
                        this.chamado.checkin.localizacao.longitude = checkin.localizacao.longitude;
                        this.chamadoService.atualizarChamado(this.chamado)
                          .then(() => {
                            this.configurarSlide(this.slides.getActiveIndex());
                            this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
                          })
                          .catch();
                      } else {
                        this.exibirToast('Não foi possível efetuar o checkin');
                      }
                    } else {
                      this.exibirToast('Não foi possível efetuar o checkin');
                    }
                  },
                  err => {
                    this.exibirToast('Não foi possível efetuar o checkin');
                  });
                })
                .catch();
              });
            })
            .catch(() => {});
          }
        }
      ]
    });

    alerta.present();
  }

  public efetuarCheckout() {
    const alerta = this.alertCtrl.create({
      title: 'Confirmar o Checkout?',
      message: `Somente confirme o checkout se você já concluiu o chamado 
	                e deixará o local de atendimento`,
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            const loader = this.loadingCtrl.create({
              content: 'Obtendo sua localização...',
              enableBackdropDismiss: true,
              dismissOnPageChange: true
            });
            loader.present();

            this.platform.ready().then(() => {
              this.geolocation.getCurrentPosition(Config.POS_CONFIG).then((location) => {
                loader.dismiss().then(() => {
                  if (!this.chamado.indCercaEletronicaLiberada) {
                    if ((this.obterDistanciaRaio(
                      location.coords.latitude, 
                      location.coords.longitude, 
                      this.chamado.localAtendimento.localizacao.latitude, 
                      this.chamado.localAtendimento.localizacao.longitude) 
                      > Number(this.distanciaCercaEletronica))
                    ) {
                      this.exibirToast('Você está distante do local de atendimento');
                      //return
                    }
                  }
                  
                  this.chamado.checkout.dataHoraCadastro = new Date().toLocaleString('pt-BR');
                  this.chamado.checkout.localizacao.latitude = location.coords.latitude;
                  this.chamado.checkout.localizacao.longitude = location.coords.longitude;
                  this.chamadoService.atualizarChamado(this.chamado).then(() => {
                    this.configurarSlide(this.slides.getActiveIndex());
                    this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
                  })
                  .catch();
                })
                .catch();
              })
              .catch((err) => {
                loader.dismiss().then(() => {
                  this.checkinCheckoutService.buscarCheckoutApi(this.chamado.codOs).subscribe(checkout => {
                    if (checkout) {
                      if (checkout.localizacao.latitude && checkout.localizacao.longitude) {
                        this.chamado.checkout.dataHoraCadastro = new Date().toLocaleString('pt-BR');
                        this.chamado.checkout.localizacao.latitude = checkout.localizacao.latitude;
                        this.chamado.checkout.localizacao.longitude = checkout.localizacao.longitude;
                        this.chamadoService.atualizarChamado(this.chamado).then(() => {
                          this.configurarSlide(this.slides.getActiveIndex());
                          this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
                        })
                        .catch();
                      } else {
                        this.exibirToast('Não foi possível efetuar o checkout');
                      }
                    } else {
                      this.exibirToast('Não foi possível efetuar o checkout');
                    }
                  },
                  err => {
                    this.exibirToast('Não foi possível efetuar o checkout');
                  });
                })
                .catch();
              });
            })
            .catch(() => {});
          }
        }
      ]
    });

    alerta.present();
  }

  public salvarRat(form: NgForm) {
    let rat = new Rat();
    rat.numRat = form.value.numRat || 'AUTOMATICO';
    rat.dataInicio = form.value.dataInicio;
    rat.horaInicio = form.value.horaInicio;
    rat.dataSolucao = form.value.dataInicio;
    rat.horaSolucao = form.value.horaSolucao;
    rat.nomeAcompanhante = form.value.nomeAcompanhante;
    rat.codUsuarioCad = this.dg.usuario.codUsuario;
    rat.obsRAT = form.value.obsRAT;
    rat.ratDetalhes = [];
    rat.fotos = [];

    if (this.usuarioPonto) {
      rat.horarioInicioIntervalo = this.usuarioPonto.registros[1];
      rat.horarioTerminoIntervalo = this.usuarioPonto.registros[2];
    }

    if (moment(rat.dataInicio + ' ' +  rat.horaInicio, 'YYYY-MM-DD HH:mm').isBefore(moment(this.chamado.dataHoraAgendamento, 'YYYY-MM-DD HH:mm'))) {
      this.exibirToast('A horário de atendimento deve ocorrer depois do horário de agendamento do chamado');
      return
    }

    if (moment(rat.dataInicio + ' ' +  rat.horaInicio, 'YYYY-MM-DD HH:mm').isBefore(moment(this.chamado.dataHoraAberturaOS, 'YYYY-MM-DD HH:mm'))) {
      this.exibirToast('A horário de atendimento deve ocorrer depois da data de abertura do chamado');
      return
    }

    if (moment.duration(moment(rat.dataInicio + ' ' +  rat.horaSolucao, 'YYYY-MM-DD HH:mm').diff(moment(rat.dataInicio + ' ' +  rat.horaInicio, 'YYYY-MM-DD HH:mm'))).asMinutes() < 20) {
      this.exibirToast('O período mínimo de atendimento é de 20 minutos');
      return
    }

    if (moment(rat.dataInicio + ' ' +  rat.horaSolucao, 'YYYY-MM-DD HH:mm').isBefore(moment(rat.dataInicio + ' ' +  rat.horaInicio, 'YYYY-MM-DD HH:mm'))) {
      this.exibirToast('A solução deve ocorrer após o início');
      return
    }

    if (moment().isBefore(moment(rat.dataInicio + ' ' +  rat.horaSolucao, 'YYYY-MM-DD HH:mm'))) {
      this.exibirToast('A solução não pode ocorrer no futuro');
      return
    }

    if (this.chamado.rats.length == 0) {
      this.chamado.rats.push(rat);
    } else {
      this.chamado.rats[0].numRat = form.value.numRat;
      this.chamado.rats[0].dataInicio = form.value.dataInicio;
      this.chamado.rats[0].horaInicio = form.value.horaInicio;
      this.chamado.rats[0].horaSolucao = form.value.horaSolucao;
      this.chamado.rats[0].nomeAcompanhante = form.value.nomeAcompanhante;
      this.chamado.rats[0].obsRAT = form.value.obsRAT;
      this.chamado.rats[0].codUsuarioCad = this.dg.usuario.codUsuario;

      if (this.usuarioPonto) {
        this.chamado.rats[0].horarioInicioIntervalo = this.usuarioPonto.registros[1];
        this.chamado.rats[0].horarioTerminoIntervalo = this.usuarioPonto.registros[2];
      }
    }

    this.chamadoService.atualizarChamado(this.chamado);

    this.exibirToast('Rat atualizada com sucesso').then(() => {
      this.configurarSlide(this.slides.getActiveIndex());
      this.slides.slideTo(3, 500);
    }).catch(() => {});
  }

  public fecharChamado() {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja fechar este chamado?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            if (this.chamado.rats[0].ratDetalhes.length > 0) {
              this.chamado.statusServico.codStatusServico = Config.CHAMADO.FECHADO;
              this.chamado.statusServico.abreviacao = "F";
              this.chamado.statusServico.nomeStatusServico = "FECHADO";
              this.chamado.dataHoraFechamento = new Date().toLocaleString('pt-BR');

              this.chamadoService.atualizarChamado(this.chamado)
                .then(() => {
                  this.navCtrl.pop()
                    .then(() => {
                      this.exibirToast(`Chamado fechado no seu smartphone, 
                        aguarde a sincronização com o servidor`)
                        .then(() => {
                          this.events.publish('sincronizacao:solicitada');
                        })
                        .catch();
                    })
                    .catch();
                })
                .catch();
            } else {
              this.exibirToast('Favor inserir os detalhes da RAT');
            }
          }
        }
      ]
    });

    confirmacao.present();
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

  private obterRegistrosPonto(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.usuarioService.buscarRegistrosPonto(
        this.dg.usuario.codUsuario)
        .subscribe(res => {
          this.usuarioPonto = res;
          
          resolve(this.usuarioPonto);
        },
        err => {
          reject();
        });
    });
  }

  public removerRatDetalhe(ratDetalhe: any, i: number) {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja excluir este detalhe?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.chamado.rats[0].ratDetalhes.splice(i, 1);
            this.exibirToast('Detalhe excluído com sucesso')
              .then(() => {
                this.chamadoService.atualizarChamado(this.chamado);
              })
              .catch();
          }
        }
      ]
    });

    confirmacao.present();
  }

  public removerCaracteresNaoAlfabeticos(event: any) {
    let novoTexto = event.target.value;

    let regExp = new RegExp('^[A-Za-z? ]+$');

    if (!regExp.test(novoTexto)) {
      event.target.value = novoTexto.slice(0, -1);
    }
  }

  private configurarSlide(i: number) {
    switch (i) {
      case 0:
        this.tituloSlide = (i + 1) + ". " + "Informações";

        this.slides.lockSwipeToPrev(true);
        this.slides.lockSwipeToNext(false);
        break;
      case 1:
        this.tituloSlide = (i + 1) + ". " + "Checkin";

        this.slides.lockSwipeToPrev(false);
        if (!this.chamado.checkin.localizacao.latitude 
          || !this.chamado.checkin.localizacao.longitude 
          || this.chamado.indBloqueioReincidencia)
          this.slides.lockSwipeToNext(true);
          else
            this.slides.lockSwipeToNext(false);
        break;
      case 2:
        this.tituloSlide = (i + 1) + ". " + "Informações da RAT";

        this.slides.lockSwipeToPrev(false);
        if (this.chamado.rats.length == 0) {
          this.slides.lockSwipeToNext(true);
        }
        else {
          this.slides.lockSwipeToNext(false);
        }
        break;
      case 3:
        this.tituloSlide = (i + 1) + ". " + "Detalhes da RAT";

        this.slides.lockSwipeToPrev(false);
        if (this.chamado.rats[0].ratDetalhes.length == 0)
          this.slides.lockSwipeToNext(true);
          else {
            this.slides.lockSwipeToNext(false);
          }
        break;
      case 4:
        this.tituloSlide = (i + 1) + ". " + "Imagens";

        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(false);
        break;
      case 5:
        this.tituloSlide = (i + 1) + ". " + "Checkout";

        this.slides.lockSwipeToPrev(false);
        if (!this.chamado.checkout.localizacao.latitude || !this.chamado.checkout.localizacao.longitude) {
          this.slides.lockSwipeToNext(true); 
        }
        else {
          this.slides.lockSwipeToNext(false);
        }
        break;
      case 6:
        this.tituloSlide = (i + 1) + ". " + "Conferência";

        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(false);
        break;
      case 7:
        this.tituloSlide = (i + 1) + ". " + "Fechamento";
        
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(true);
        break;
    }
  }

  private registrarLeituraOs(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.chamado.dataHoraOSMobileLida) {
        this.chamado.dataHoraOSMobileLida = new Date().toLocaleString('pt-BR');
  
        this.chamadoService.registrarLeituraChamadoApi(this.chamado)
          .subscribe((r) => {
            this.chamadoService.atualizarChamado(this.chamado);

            resolve();
          },
          err => {
            this.chamado.dataHoraOSMobileLida = null;
            reject();
          });
      }
    });
  }

  private obterDistanciaRaio(latA, lonA, latB, lonB) {
    var raioTerrestre = 6371;
    var dLat = this.deg2rad(latB-latA);
    var dLon = this.deg2rad(lonB-lonA); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(latA)) * Math.cos(this.deg2rad(latB)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var distanciaEmKm = raioTerrestre * c;
    
    return distanciaEmKm;
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI/180)
  }

  private obterDistanciaRaioFilial(nomeFilial: string): Promise<any> {
    return new  Promise((resolve, reject) => {
      let cerca = Config.CERCA_ELETRONICA.filter((d) => {
        return (d.filial.toString().indexOf(nomeFilial) > -1);
      });

      if(cerca)
        this.distanciaCercaEletronica = cerca[0].distancia;

      resolve(cerca);
    })
  }

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: 3000, position: 'bottom'
      });

      resolve(toast.present());
    });
  }

  exibirAlerta(msg: string) {
    const alerta = this.alertCtrl.create({
      title: 'Alerta!',
      subTitle: msg,
      buttons: ['OK']
    });

    alerta.present();
  }
}