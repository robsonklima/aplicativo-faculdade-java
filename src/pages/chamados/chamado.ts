import { Component, ViewChild } from '@angular/core';
import { NavParams, Platform, Slides, AlertController, LoadingController, ToastController, ModalController, NavController, ViewController } from 'ionic-angular';
import { NgForm } from '@angular/forms';

import { Geolocation } from '@ionic-native/geolocation';
import { Camera } from '@ionic-native/camera';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { AppAvailability } from '@ionic-native/app-availability';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Market } from '@ionic-native/market';

import moment from 'moment';
import _ from 'lodash';

import { Config } from '../../models/config';
import { DadosGlobais } from '../../models/dados-globais';
import { Chamado } from "../../models/chamado";
import { Rat } from "../../models/rat";
import { UsuarioPonto } from '../../models/usuario-ponto';
import { Foto } from '../../models/foto';
import { EquipamentoPOS } from '../../models/equipamentoPOS';
import { RatDetalhe } from '../../models/rat-detalhe';
import { TipoComunicacao } from '../../models/tipo-comunicacao';
import { MotivoComunicacao } from '../../models/motivo-comunicacao';
import { OperadoraTelefonia } from '../../models/operadora-telefonia';
import { MotivoCancelamento } from '../../models/motivo-cancelamento';

import { DadosGlobaisService } from '../../services/dados-globais';
import { ChamadoService } from './../../services/chamado';
import { UsuarioService } from '../../services/usuario';
import { TipoComunicacaoService } from '../../services/tipo-comunicacao';
import { EquipamentoPOSService } from '../../services/equipamento-pos';
import { OperadoraTelefoniaService } from '../../services/operadora-telefonia';
import { MotivoComunicacaoService } from '../../services/motivo-comunicacao';

import { RatDetalhePage } from "../rat-detalhe/rat-detalhe";
import { RatDetalhePecaPage } from "../rat-detalhe-peca/rat-detalhe-peca";
import { HistoricoListaPage } from '../historico/historico-lista';
import { FotosPage } from '../fotos/fotos';
import { LocalizacaoEnvioPage } from '../localizacao-envio/localizacao-envio';
import { LaudoPage } from '../laudos/laudo';
import { MotivoCancelamentoService } from '../../services/motivo-cancelamento';
import { StatusServicoService } from '../../services/status-servico';
import { StatusServico } from '../../models/status-servico';
import { DefeitoPOSService } from '../../services/defeito-pos';
import { DefeitoPOS } from '../../models/defeito-pos';


@Component({
  selector: 'chamado-page',
  templateUrl: 'chamado.html'
})
export class ChamadoPage {
  qtdMaximaFotos: number = Config.QTD_MAX_FOTOS_POR_ATENDIMENTO;
  distanciaCercaEletronica: number = 0;
  equipamentosPOS: EquipamentoPOS[] = [];
  tiposComunicacao: TipoComunicacao[] = [];
  operadoras: OperadoraTelefonia[] = [];
  motivosComunicacao: MotivoComunicacao[] = [];
  motivosCancelamento: MotivoCancelamento[] = [];
  defeitosPOS: DefeitoPOS[] = [];
  statusServicos: StatusServico[] = [];
  dataAtual: string = moment().format('YYYY-MM-DD');
  horaAtual: string = moment().format('HH:mm:ss');
  @ViewChild(Slides) slides: Slides;
  usuarioPonto: UsuarioPonto;
  tituloSlide: string;
  dg: DadosGlobais;
  chamado: Chamado;
  foto: Foto;
  config: any;
  mapaCheckin: any;

  constructor(
    private platform: Platform,
    private appAvailability: AppAvailability,
    private geolocation: Geolocation,
    private diagnostic: Diagnostic,
    private androidPerm: AndroidPermissions,
    private market: Market,
    private camera: Camera,
    private modalCtrl: ModalController,
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private dadosGlobaisService: DadosGlobaisService,
    private equipamentoPOSService: EquipamentoPOSService,
    private tipoComunicacaoService: TipoComunicacaoService,
    private operadorasTelefoniaService: OperadoraTelefoniaService,
    private motivoComunicacaoService: MotivoComunicacaoService,
    private motivoCancelamentoService: MotivoCancelamentoService,
    private defeitoPOSService: DefeitoPOSService,
    private chamadoService: ChamadoService,
    private usuarioService: UsuarioService,
    private statusServicoService: StatusServicoService,
  ) {
    this.chamado = this.navParams.get('chamado');
  }

  ionViewWillEnter() {
    this.configurarSlide(this.slides.getActiveIndex());

    this.carregarDadosGlobais()
      .then(() => this.buscarEquipamentosPOS())
      .then(() => this.buscarTiposComunicacao()) 
      .then(() => this.buscarMotivosComunicacao()) 
      .then(() => this.buscarMotivosCancelamento())
      .then(() => this.buscarOperadoras())
      .then(() => this.buscarStatusServicos())
      .then(() => this.buscarDefeitosPOS())
      .then(() => this.obterRegistrosPonto())
      .then(() => this.registrarLeituraOs())
      .catch(() => {});

    if (this.chamado.rats.length == 0) {
      let rat = new Rat();
      rat.fotos = [];
      rat.ratDetalhes = [];
      rat.laudos = [];
      this.chamado.rats.push(rat);
    }
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
      () => {}
    );
  }

  public telaLaudo(chamado: Chamado) {
    const modal = this.modalCtrl.create(LaudoPage, { chamado: this.chamado });
    modal.present();
    modal.onDidDismiss(() => {
      this.configurarSlide(this.slides.getActiveIndex());
    });
  }

  public telaFotos() {
    const modal = this.modalCtrl.create(FotosPage, { chamado: this.chamado, modalidade: 'FOTO' });
    modal.present();
    modal.onDidDismiss(() => {
      this.configurarSlide(this.slides.getActiveIndex());
    });
  }

  public tirarFoto(modalidade: string) {
    this.platform.ready().then(() => {
      if (!this.platform.is('cordova')) {
        this.exibirToast(Config.MSG.RECURSO_NATIVO);
        return;
      }

      this.appAvailability.check(Config.OPEN_CAMERA).then(
        (yes: boolean) => {
          this.diagnostic.requestRuntimePermissions([ this.diagnostic.permission.WRITE_EXTERNAL_STORAGE, this.diagnostic.permission.CAMERA ]).then(() => {
            this.androidPerm.requestPermissions([ this.androidPerm.PERMISSION.WRITE_EXTERNAL_STORAGE, this.androidPerm.PERMISSION.CAMERA ]).then(() => {
              this.camera.getPicture({
                quality: 80, 
                targetWidth: 380,
                destinationType: this.camera.DestinationType.DATA_URL,
                encodingType: this.camera.EncodingType.JPEG,
                mediaType: this.camera.MediaType.PICTURE,
                saveToPhotoAlbum: false,
                allowEdit: true,
                sourceType: 1
              }).then(imageData => {
                this.foto = new Foto();
                this.foto.nome = moment().format('YYYYMMDDHHmmss') + "_" + this.chamado.codOs.toString() + '_' + modalidade;
                this.foto.str = 'data:image/jpeg;base64,' + imageData;
                this.foto.modalidade = modalidade;
                this.chamado.rats[0].fotos.push(this.foto);
                this.chamadoService.atualizarChamado(this.chamado).catch();
                this.camera.cleanup().catch();
              }).catch(() => { this.exibirAlerta(Config.MSG.ERRO_FOTO) });
            }).catch(() => { this.exibirAlerta(Config.MSG.ERRO_FOTO) });
          }).catch(() => { this.exibirAlerta(Config.MSG.ERRO_PERMISSAO_CAMERA) });
        },
        (no: boolean) => {
          this.exibirToast('Favor instalar o aplicativo Open Camera').then(() => { 
            setTimeout(() => { this.market.open('net.sourceforge.opencamera') }, 2500);
          });
          
          return;
        }).catch(() => { this.exibirAlerta(Config.MSG.ERRO_RESPOSTA_DISPOSITIVO) });
    }).catch(() => { this.exibirAlerta(Config.MSG.ERRO_RESPOSTA_DISPOSITIVO) });
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

    return 'assets/imgs/no-photo.png';
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
    if (typeof(this.chamado.rats) !== 'undefined') {
      if (this.chamado.rats.length > 0) {

        let fotos = this.chamado.rats[0].fotos.filter((foto) => {
          return (foto.modalidade == modalidade);
        });
  
        if (fotos.length > 0) {
          return true;  
        }
      }
    }

    return false;
  }

  public verificarExistenciaLaudo(): boolean {
    if (typeof(this.chamado.rats) !== 'undefined') {
      if (this.chamado.rats.length > 0) {
        if (typeof(this.chamado.rats[0].laudos) !== 'undefined') {
          if (this.chamado.rats[0].laudos.length > 0) {
              return true;  
          }
        }
      }
    }

    return false;
  }

  public removerLaudo() {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja remover este laudo?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Excluir',
          handler: () => {
            this.chamado.rats[0].laudos = [];
            this.chamadoService.atualizarChamado(this.chamado);
          }
        }
      ]
    });

    confirmacao.present();
  }

  private verificarLaudoObrigatorio(): boolean {
    if (
      (
        this.chamado.cliente.codCliente == Config.CLIENTE.METRO_RIO   || 
        this.chamado.cliente.codCliente == Config.CLIENTE.RIO_CARD    || 
        this.chamado.cliente.codCliente == Config.CLIENTE.VLT_CARIOCA || 
        this.chamado.cliente.codCliente == Config.CLIENTE.BRINKS      || 
        this.chamado.cliente.codCliente == Config.CLIENTE.BVA_BRINKS  ||
        this.chamado.cliente.codCliente == Config.CLIENTE.CEF         || 
        this.chamado.cliente.codCliente == Config.CLIENTE.BNB         ||
        this.chamado.cliente.codCliente == Config.CLIENTE.PROTEGE     ||
        this.chamado.cliente.codCliente == Config.CLIENTE.BANRISUL    || 
        (
          this.chamado.cliente.codCliente == Config.CLIENTE.BB && 
          this.chamado.equipamentoContrato.indGarantia == 1
        )
      ) && this.verificarChamadoOrcamento()
    ) {
      return true;
    }

    if (this.chamado.numReincidencias >= 5) {
      return true;
    }

    if (this.verificarChamadoVandalismo()) {
      return true;
    }

    if (this.chamado.indOSIntervencaoEquipamento) {
      return true;
    }

    return false;
  }

  private verificarChamadoVandalismo(): boolean {
    if (typeof(this.chamado.rats) !== 'undefined') {
      if (this.chamado.rats.length > 0) {
        this.chamado.rats.forEach((rat: Rat) => {
          rat.ratDetalhes.forEach((ratDetalhe: RatDetalhe) => {
            if (ratDetalhe.causa.codCausa == 526) {
              return true;
            }  
          });
        });
      }
    }

    return false;
  }

  private verificarChamadoOrcamento(): boolean {
    if (typeof(this.chamado.rats) !== 'undefined') {
      if (this.chamado.rats.length > 0) {
        this.chamado.rats.forEach((rat: Rat) => {
          rat.ratDetalhes.forEach((ratDetalhe: RatDetalhe) => {
            if (ratDetalhe.acao.codAcao == 17) {
              return true;
            }  
          });
        });
      }
    }

    return false;
  }

  public verificarChamadoExtraMaquina(): boolean {
    let retorno: boolean = false; 

    if (this.chamado.rats.length > 0) {
      if (this.chamado.rats[0].ratDetalhes.length > 0) {
        this.chamado.rats[0].ratDetalhes.forEach((d) => {
          if(Number(d.tipoCausa.codTipoCausa) === Number(Config.TIPO_CAUSA.EXTRA_MAQUINA)) {
            retorno = true;
          }
        });
      }
    }

    return retorno;
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
      title: Config.MSG.CONFIRMACAO,
      message: Config.MSG.CHECKIN_CONFIRMACAO,
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            if (this.chamadoService.verificarExisteCheckinEmOutroChamado()) {
              this.exibirToast(Config.MSG.CHECKIN_EM_ABERTO);

              return
            }

            this.platform.ready().then(() => {
              // this.diagnostic.isGpsLocationAvailable().then((gpsStatus) => {
              //   if (!this.platform.is('cordova') && !gpsStatus) {
              //     this.exibirAlerta('Favor habilitar o gps do seu dispositivo');

              //     return;
              //   }

                const loader = this.loadingCtrl.create({ content: Config.MSG.OBTENDO_LOCALIZACAO, enableBackdropDismiss: true, 
                  dismissOnPageChange: true });
                loader.present();
  
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
                      }
  
                      if (this.chamado.indOSIntervencaoEquipamento)
                        this.exibirAlerta('Este chamado exige lançamento de laudo!');
                    }
  
                    this.chamado.checkin.dataHoraCadastro = new Date().toLocaleString('pt-BR');
                    this.chamado.checkin.localizacao.latitude = location.coords.latitude;
                    this.chamado.checkin.localizacao.longitude = location.coords.longitude;
                    
                    this.chamadoService.atualizarChamado(this.chamado).then(() => {
                      this.configurarSlide(this.slides.getActiveIndex());
                      this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
                    }).catch(() => { loader.dismiss() });
                  }).catch(() => { loader.dismiss() });
                }).catch(() => { loader.dismiss() });
              }).catch(() => {});
            // }).catch(() => {});
          }
        }
      ]
    });

    alerta.present();
  }

  public efetuarCheckout() {
    this.chamado.checkout.tentativas.push(moment().format());
    this.chamadoService.atualizarChamado(this.chamado);

    const alerta = this.alertCtrl.create({
      title: Config.MSG.CONFIRMACAO,
      message: Config.MSG.CHECKOUT_CONFIRMACAO,
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            if (!this.validarCamposObrigatorios()) return;

            const loader = this.loadingCtrl.create({ content: Config.MSG.OBTENDO_LOCALIZACAO, enableBackdropDismiss: true, 
              dismissOnPageChange: true });
            loader.present();

            this.platform.ready().then(() => {
              // this.diagnostic.isGpsLocationAvailable().then((gpsStatus) => {
              //   if (!gpsStatus) {
              //     this.exibirAlerta('Favor habilitar o gps do seu dispositivo');

              //     return;
              //   }

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
                      }
                    }
                    
                    this.chamado.checkout.dataHoraCadastro = new Date().toLocaleString('pt-BR');
                    this.chamado.checkout.localizacao.latitude = location.coords.latitude;
                    this.chamado.checkout.localizacao.longitude = location.coords.longitude;
                    this.chamadoService.atualizarChamado(this.chamado).then(() => {
                      this.configurarSlide(this.slides.getActiveIndex());
                      this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
                    }).catch(() => { loader.dismiss() });
                  }).catch(() => { loader.dismiss() });
                }).catch(() => { loader.dismiss() });
              }).catch(() => {});
            // }).catch(() => {});
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
    rat.statusServico = form.value.statusServico;
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
      this.chamado.rats[0].dataSolucao = form.value.dataInicio;
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
    this.configurarSlide(this.slides.getActiveIndex());
    this.slides.slideTo(4, 500);
  }

  public salvarInformacoesPOS(form: NgForm) {
    this.chamado.rats[0].statusServico = form.value.statusServico;
    this.chamado.rats[0].equipamentoRetirado = form.value.equipamentoRetirado;
    this.chamado.rats[0].numSerieRetirada = form.value.numSerieRetirada;
    this.chamado.rats[0].equipamentoInstalado = form.value.equipamentoInstalado;
    this.chamado.rats[0].numSerieInstalada = form.value.numSerieInstalada;
    this.chamado.rats[0].rede = form.value.rede;
    this.chamado.rats[0].tipoComunicacao = form.value.tipoComunicacao;
    this.chamado.rats[0].operadoraChipRetirado = form.value.operadoraChipRetirado;
    this.chamado.rats[0].nroChipRetirado = form.value.nroChipRetirado;
    this.chamado.rats[0].operadoraChipInstalado = form.value.operadoraChipInstalado;
    this.chamado.rats[0].nroChipInstalado = form.value.nroChipInstalado;
    this.chamado.rats[0].motivoComunicacao = form.value.motivoComunicacao;
    this.chamado.rats[0].motivoCancelamento = form.value.motivoCancelamento;
    this.chamado.rats[0].obsMotivoComunicacao = form.value.obsMotivoComunicacao;
    this.chamado.rats[0].obsMotivoCancelamento = form.value.obsMotivoCancelamento;
    this.chamado.rats[0].defeitoPOS = form.value.defeitoPOS;

    this.chamadoService.atualizarChamado(this.chamado);    
    this.configurarSlide(this.slides.getActiveIndex());
    this.slides.slideTo(5, 500);
  }

  public fecharChamado() {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja fechar este chamado?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {}
        },
        {
          text: 'Confirmar',
          handler: () => {
            if (!this.validarCamposObrigatorios()) return;

            this.chamado.statusServico.codStatusServico = Config.CHAMADO.FECHADO;
            this.chamado.statusServico.abreviacao = "F";
            this.chamado.statusServico.nomeStatusServico = "FECHADO";
            this.chamado.dataHoraFechamento = new Date().toLocaleString('pt-BR');

            this.chamadoService.atualizarChamado(this.chamado).then(() => {
              this.navCtrl.pop();
            }).catch();
          }
        }
      ]
    });

    confirmacao.present();
  }

  private validarCamposObrigatorios(): boolean {
    // ATM
    if (this.chamado.rats.length == 0) {
      this.exibirToast("favor inserir a RAT");

      return;
    }

    if (this.platform.is('cordova')) {
      if (this.chamado.indRatEletronica && this.chamado.rats[0].fotos.length < 3) {
        this.exibirToast("Este chamado deve conter no mínimo 3 fotos");

        return;
      } 
      
      if (!this.chamado.indRatEletronica && this.chamado.rats[0].fotos.length < 4) {
        this.exibirToast("Este chamado deve conter no mínimo 4 fotos");

        return;
      }
    }

    if (this.chamado.rats[0].laudos.length == 0 && this.verificarLaudoObrigatorio()) {
      this.exibirToast("Este chamado deve possuir um laudo");

      return;
    }

    if ((!this.chamado.rats[0].numRat && !this.chamado.indRatEletronica) || !this.chamado.rats[0].horaInicio 
      || !this.chamado.rats[0].horaSolucao || !this.chamado.rats[0].obsRAT || !this.chamado.rats[0].nomeAcompanhante) {
      this.exibirToast('Favor informar os dados da RAT');

      return false;
    }

    if (this.chamado.rats[0].ratDetalhes.length == 0) {
      this.exibirToast('Favor inserir os detalhes da RAT');

      return false;
    }

    // POS
    if (!this.verificarSeEquipamentoEPOS()) return true;

    if (!_.has(this.chamado.rats[0], 'statusServico') || !_.has(this.chamado.rats[0].statusServico, 'codStatusServico')) {
      this.exibirToast("Informe o status de serviço do POS");

      return false;
    }

    if (!_.has(this.chamado.rats[0], 'defeitoPOS') || !_.has(this.chamado.rats[0].defeitoPOS, 'codDefeitoPOS')) {
      this.exibirToast("Informe o defeito apresentado pelo POS");

      return false;
    }

    if (
      this.chamado.rats[0].statusServico.codStatusServico == Config.STATUS_SERVICO.CANCELADO || 
      this.chamado.rats[0].statusServico.codStatusServico == Config.STATUS_SERVICO.CANCELADO_COM_ATENDIMENTO
    ) {
      if (!_.has(this.chamado.rats[0], 'motivoCancelamento') || !_.has(this.chamado.rats[0].motivoCancelamento, 'codMotivoCancelamento') || !this.chamado.rats[0].obsMotivoCancelamento) {
        this.exibirToast('Favor inserir o motivo do cancelamento do chamado POS e a observação');

        return false;
      }
    }

    if (this.chamado.rats[0].statusServico.codStatusServico == Config.STATUS_SERVICO.FECHADO) {
      if (this.chamado.tipoIntervencao.codTipoIntervencao == Config.TIPO_INTERVENCAO.INSTALAÇÃO) {
        if (!_.has(this.chamado.rats[0], 'equipamentoInstalado') || !_.has(this.chamado.rats[0].equipamentoInstalado, 'codEquip') || !this.chamado.rats[0].numSerieInstalada) {
          this.exibirToast('Favor inserir o equipamento POS instalado e a série');

          return false;
        }

        if (!_.has(this.chamado.rats[0], 'tipoComunicacao') || !_.has(this.chamado.rats[0].tipoComunicacao, 'codTipoComunicacao')) {
          this.exibirToast('Favor inserir o tipo de comunicação do POS');

          return false;
        }

        if (!this.chamado.rats[0].rede && this.chamado.cliente.codCliente == Config.CLIENTE.BANRISUL) {
          this.exibirToast('Favor inserir a rede do equipamento POS');

          return false;
        }
      }

      if (this.chamado.tipoIntervencao.codTipoIntervencao == Config.TIPO_INTERVENCAO.CORRETIVA) {
        if (this.verificarSeDefeitoExigeTroca()) {
          if (!_.has(this.chamado.rats[0], 'equipamentoInstalado') || !_.has(this.chamado.rats[0].equipamentoInstalado, 'codEquip') || !this.chamado.rats[0].numSerieInstalada) {
            this.exibirToast('Favor inserir o equipamento POS instalado');
  
            return false;
          }
  
          if (!_.has(this.chamado.rats[0], 'equipamentoRetirado') || !_.has(this.chamado.rats[0].equipamentoRetirado, 'codEquip') || !this.chamado.rats[0].numSerieRetirada) {
            this.exibirToast('Favor inserir o equipamento POS retirado');
  
            return false;
          }
        }

        if (!_.has(this.chamado.rats[0], 'tipoComunicacao') || !_.has(this.chamado.rats[0].tipoComunicacao, 'codTipoComunicacao')) {
          this.exibirToast('Favor inserir o tipo de comunicação do POS');

          return false;
        }

        if (!this.chamado.rats[0].rede && this.chamado.cliente.codCliente == Config.CLIENTE.BANRISUL) {
          this.exibirToast('Favor inserir a rede do equipamento POS');

          return false;
        }
      }

      if (this.chamado.tipoIntervencao.codTipoIntervencao == Config.TIPO_INTERVENCAO.DESINSTALAÇÃO) {
        if (this.verificarSeDefeitoExigeTroca()) {
          if (!_.has(this.chamado.rats[0], 'equipamentoRetirado') || !_.has(this.chamado.rats[0].equipamentoRetirado, 'codEquip') || !this.chamado.rats[0].numSerieRetirada) {
            this.exibirToast('Favor inserir o equipamento POS retirado e a série');
  
            return false;
          }
        }

        if (!this.chamado.rats[0].rede && this.chamado.cliente.codCliente == Config.CLIENTE.BANRISUL) {
          this.exibirToast('Favor inserir a rede do equipamento POS');

          return false;
        }
      }

      if (
        this.chamado.tipoIntervencao.codTipoIntervencao == Config.TIPO_INTERVENCAO.REMANEJAMENTO ||
        this.chamado.tipoIntervencao.codTipoIntervencao == Config.TIPO_INTERVENCAO.TROCA_VELOHC
      ) {
        if (!_.has(this.chamado.rats[0], 'equipamentoInstalado') || !_.has(this.chamado.rats[0].equipamentoInstalado, 'codEquip') || !this.chamado.rats[0].numSerieInstalada) {
          this.exibirToast('Favor inserir o equipamento POS instalado e a série');
  
          return false;
        }

        if (this.verificarSeDefeitoExigeTroca()) {
          if (!_.has(this.chamado.rats[0], 'equipamentoRetirado') || !_.has(this.chamado.rats[0].equipamentoRetirado, 'codEquip') || !this.chamado.rats[0].numSerieRetirada) {
            this.exibirToast('Favor inserir o equipamento POS retirado');
    
            return false;
          }
        }
  
        if (!_.has(this.chamado.rats[0], 'tipoComunicacao') || !_.has(this.chamado.rats[0].tipoComunicacao, 'codTipoComunicacao')) {
          this.exibirToast('Favor inserir o tipo de comunicação do POS');
  
          return false;
        }
  
        if (!this.chamado.rats[0].rede && this.chamado.cliente.codCliente == Config.CLIENTE.BANRISUL) {
          this.exibirToast('Favor inserir a rede do equipamento POS');
  
          return false;
        }
      }
  
      if (
        this.chamado.tipoIntervencao.codTipoIntervencao == Config.TIPO_INTERVENCAO.ATUALIZACAO ||
        this.chamado.tipoIntervencao.codTipoIntervencao == Config.TIPO_INTERVENCAO.ALTERAÇÃO_ENGENHARIA
      ) {
        if (!_.has(this.chamado.rats[0], 'equipamentoInstalado') || !_.has(this.chamado.rats[0].equipamentoInstalado, 'codEquip') || !this.chamado.rats[0].numSerieInstalada) {
          this.exibirToast('Favor inserir o equipamento POS instalado e a série');
  
          return false;
        }
  
        if (!_.has(this.chamado.rats[0], 'tipoComunicacao') || !_.has(this.chamado.rats[0].tipoComunicacao, 'codTipoComunicacao')) {
          this.exibirToast('Favor inserir o tipo de comunicação do POS');
  
          return false;
        }
  
        if (!this.chamado.rats[0].rede && this.chamado.cliente.codCliente == Config.CLIENTE.BANRISUL) {
          this.exibirToast('Favor inserir a rede do equipamento POS');
  
          return false;
        }
      }
    }

    return true;
  }

  public salvarStatusServico(statusServico: StatusServico) {
    this.chamado.rats[0].statusServico = statusServico;

    this.chamadoService.atualizarChamado(this.chamado);    
  }

  public salvarDefeitoPOS(defeitoPOS: DefeitoPOS) {
    if (this.chamado.rats.length) {
      this.chamado.rats[0].defeitoPOS = defeitoPOS;

      this.chamadoService.atualizarChamado(this.chamado);
    }
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

  public verificarSeEquipamentoEPOS(): boolean {
    var i;
    
    for (i = 0; i < this.equipamentosPOS.length; i++) {
      if (this.equipamentosPOS[i].codEquip === this.chamado.equipamentoContrato.equipamento.codEquip) {
          return true;
      }

      if (this.equipamentosPOS[i].codEquip === this.chamado.codEquip) {
        return true;
      }
    }
    
    return false;
  }

  public verificarEquipamentoPossuiChip(): boolean {
    if (
      (
        this.chamado.codEquip === Config.EQUIPAMENTOS_POS.POS_VELOH_3 ||
        this.chamado.codEquip === Config.EQUIPAMENTOS_POS.POS_VELOH_G
      ) || (
        Number(this.chamado.equipamentoContrato.equipamento.codEEquip) === Config.EQUIPAMENTOS_POS.POS_VELOH_3 ||
        Number(this.chamado.equipamentoContrato.equipamento.codEEquip) === Config.EQUIPAMENTOS_POS.POS_VELOH_G
      )
    ) {
      return true;
    }
        

    return false;
  }

  public verificarSeDefeitoExigeTroca(): boolean {
    var i;
    
    for (i = 0; i < this.defeitosPOS.length; i++) {
      if (this.defeitosPOS[i].codDefeitoPOS === this.chamado.rats[0].defeitoPOS.codDefeitoPOS) {
        if(this.defeitosPOS[i].exigeTrocaEquipamento) {
          return true;
        }
      }
    }
    
    return false;
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
        this.tituloSlide = (i + 1) + ". " + "Imagens";

        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(false);
        break;
      case 3:
        this.tituloSlide = (i + 1) + ". " + "Informações da RAT";

        this.slides.lockSwipeToPrev(false);
        if ((!this.chamado.rats[0].numRat && !this.chamado.indRatEletronica) || !this.chamado.rats[0].horaInicio 
          || !this.chamado.rats[0].horaSolucao || !this.chamado.rats[0].obsRAT
          || !this.chamado.rats[0].nomeAcompanhante) {
          this.slides.lockSwipeToNext(true);
          } else {
            this.slides.lockSwipeToNext(false);
          }
        break;
      case 4:
          this.tituloSlide = (i + 1) + ". " + "Informações do POS";

          this.slides.lockSwipeToPrev(false);
          this.slides.lockSwipeToNext(false);
          break;
      case 5:
        this.tituloSlide = (i + 1) + ". " + "Detalhes da RAT";

        this.slides.lockSwipeToPrev(false);
        if (this.chamado.rats[0].ratDetalhes.length == 0)
          this.slides.lockSwipeToNext(true);
          else {
            this.slides.lockSwipeToNext(false);
          }
        break;
      case 6:
        this.tituloSlide = (i + 1) + ". " + "Checkout";

        this.slides.lockSwipeToPrev(false);
        if (!this.chamado.checkout.localizacao.latitude || !this.chamado.checkout.localizacao.longitude) {
          this.slides.lockSwipeToNext(true); 
        }
        else {
          this.slides.lockSwipeToNext(false);
        }
        break;
      case 7:
        this.tituloSlide = (i + 1) + ". " + "Conferência";

        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(false);
        break;
      case 8:
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

  public buscarEquipamentosPOS(): Promise<EquipamentoPOS[]> {
    return new Promise((resolve, reject) => {
      this.equipamentoPOSService.buscarEquipamentosPOSStorage().then((equips: EquipamentoPOS[]) => { 
        this.equipamentosPOS = equips;

        resolve(equips);
      }).catch(err => {
        reject(err);
      });
    });
  }

  public compararEquipamentosPOS(e1: EquipamentoPOS, e2: EquipamentoPOS): boolean {
    return e1 && e2 ? e1.codEquip == e2.codEquip : e1 == e2;
  }

  public buscarTiposComunicacao(): Promise<TipoComunicacao[]> {
    return new Promise((resolve, reject) => {
      this.tipoComunicacaoService.buscarTiposComunicacaoStorage().then((tiposCom: TipoComunicacao[]) => { 
        this.tiposComunicacao = tiposCom;

        resolve(tiposCom);
      }).catch(err => {
        reject(err);
      });
    });
  }

  public compararTiposComunicacao(t1: TipoComunicacao, t2: TipoComunicacao): boolean {
    return t1 && t2 ? t1.codTipoComunicacao == t2.codTipoComunicacao : t1 == t2;
  }

  public buscarOperadoras(): Promise<OperadoraTelefonia[]> {
    return new Promise((resolve, reject) => {
      this.operadorasTelefoniaService.buscarOperadorasStorage().then((operadoras: OperadoraTelefonia[]) => { 
        this.operadoras = operadoras;

        resolve(operadoras);
      }).catch(err => {
        reject(err);
      });
    });
  }

  public compararOperadoras(o1: OperadoraTelefonia, o2: OperadoraTelefonia): boolean {
    return o1 && o2 ? o1.codOperadoraTelefonica == o2.codOperadoraTelefonica : o1 == o2;
  }

  public buscarMotivosComunicacao(): Promise<MotivoComunicacao[]> {
    return new Promise((resolve, reject) => {
      this.motivoComunicacaoService.buscarMotivosComunicacaoStorage().then((motivos: MotivoComunicacao[]) => { 
        this.motivosComunicacao = motivos;

        resolve(motivos);
      }).catch(err => {
        reject(err);
      });
    });
  }

  public compararMotivosComunicacao(m1: MotivoComunicacao, m2: MotivoComunicacao): boolean {
    return m1 && m2 ? m1.codMotivoComunicacao == m2.codMotivoComunicacao : m1 == m2;
  }

  public buscarMotivosCancelamento(): Promise<MotivoCancelamento[]> {
    return new Promise((resolve, reject) => {
      this.motivoCancelamentoService.buscarMotivosCancelamentoStorage().then((motivos: MotivoCancelamento[]) => { 
        this.motivosCancelamento = motivos;
        
        resolve(motivos);
      }).catch(err => {
        reject(err);
      });
    });
  }

  public compararMotivosCancelamento(m1: MotivoCancelamento, m2: MotivoCancelamento): boolean {
    return m1 && m2 ? m1.codMotivoCancelamento == m2.codMotivoCancelamento : m1 == m2;
  }

  public buscarStatusServicos(): Promise<StatusServico[]> {
    return new Promise((resolve, reject) => {
      this.statusServicoService.buscarStatusServicosStorage().then((status: StatusServico[]) => { 
        this.statusServicos = status;
        
        resolve(status);
      }).catch(err => {
        reject(err);
      });
    });
  }

  public compararStatusServicos(ss1: StatusServico, ss2: StatusServico): boolean {
    return ss1 && ss2 ? ss1.codStatusServico == ss2.codStatusServico : ss1 == ss2;
  }

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: 3000, position: 'bottom'
      });

      resolve(toast.present());
    });
  }

  public buscarDefeitosPOS(): Promise<DefeitoPOS[]> {
    return new Promise((resolve, reject) => {
      this.defeitoPOSService.buscarDefeitosPOSStorage().then((defeitos: DefeitoPOS[]) => { 
        this.defeitosPOS = defeitos;

        resolve(defeitos);
      }).catch(err => {
        reject(err);
      });
    });
  }

  public compararDefeitosPOS(def1: DefeitoPOS, def2: DefeitoPOS): boolean {
    return def1 && def2 ? def1.codDefeitoPOS == def2.codDefeitoPOS : def1 == def2;
  }

  public verificarDefeitoPOSExiteTrocaEquipamento(codDefeitoPOS: number): boolean {
    this.defeitosPOS.forEach(defeito => {
      if (defeito.codDefeitoPOS == codDefeitoPOS && defeito.exigeTrocaEquipamento) 
        return true;
    });

    return false;
  }

  private exibirAlerta(msg: string) {
    const alerta = this.alertCtrl.create({
      title: 'Alerta!',
      subTitle: msg,
      buttons: ['OK']
    });

    alerta.present();
  }
}