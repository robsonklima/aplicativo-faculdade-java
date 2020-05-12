import { Component, ViewChild } from '@angular/core';
import { Slides, ToastController, ModalController, AlertController, ViewController, LoadingController, Platform, NavController } from 'ionic-angular';
import { Config } from '../../models/config';
import { AssinaturaPage } from '../assinatura/assinatura';
import { Auditoria } from '../../models/auditoria';
import { Condutor } from '../../models/condutor';
import { AcessorioVeiculo } from '../../models/acessorio-veiculo';
import { NgForm } from '@angular/forms';
import { Filial } from '../../models/filial';
import { Veiculo } from '../../models/veiculo';
import { AppAvailability } from '@ionic-native/app-availability';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Camera } from '@ionic-native/camera';
import { Foto } from '../../models/foto';
import moment from 'moment';
import { Market } from '@ionic-native/market';
import { DadosGlobaisService } from '../../services/dados-globais';
import { DadosGlobais } from '../../models/dados-globais';


@Component({
  selector: 'auditoria-page',
  templateUrl: 'auditoria.html'
})
export class AuditoriaPage {
  dg: DadosGlobais;
  @ViewChild(Slides) slides: Slides;
  tituloSlide: string;
  auditoria: Auditoria = new Auditoria();
  
  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private dadosGlobaisService: DadosGlobaisService,
    private market: Market,
    private appAvailability: AppAvailability,
    private diagnostic: Diagnostic,
    private androidPerm: AndroidPermissions,
    private camera: Camera,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private viewCtrl: ViewController,
    public loadingCtrl: LoadingController
  ) {}

  ionViewWillEnter() {
    this.auditoria.veiculo = new Veiculo();
    this.auditoria.veiculo.acessoriosVeiculo = [];

    this.carregarDadosGlobais();
    this.carregarAcessorios();
    this.configurarSlide();
  }

  public telaAssinaturaTecnico() {
    const modal = this.modalCtrl.create(AssinaturaPage, { paginaOrigem: "AUDITORIA_TECNICO" });
    modal.present();
    modal.onDidDismiss((assinatura: string) => {
      this.auditoria.assinaturaTecnico = assinatura;
    });
  }

  private carregarDadosGlobais(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.dadosGlobaisService.buscarDadosGlobaisStorage().then((dados) => {
        this.dg = dados;

        resolve(true);
      })
      .catch((err) => { reject(false) });
    });
  }

  private carregarAcessorios() {
    let listaAcessorios: string[] = ['Agua', 'Oleo', 'Luzes', 'Pneus Dianteiros',
      'Pneus Traseiros', 'Estepe', 'Revisão Programada', 'Para-Brisa', 'Lanternas', 
      'Retrovisores', 'Calota', 'Estofamento Geral', 'Radio', 'Documento CRLV', 
      'Chave-reserva/manual', 'Cartão de abastecimento'];

    listaAcessorios.sort();

    listaAcessorios.forEach(acess => {
      let acessorio = new AcessorioVeiculo();
      acessorio.nome = acess;
      acessorio.selecionado = false;
      acessorio.justificativa = null;

      this.auditoria.veiculo.acessoriosVeiculo.push(acessorio);
    });
  }

  public salvarDadosCondutor(f: NgForm) {
    let condutor = new Condutor();
    condutor.nome = f.value.nome;
    condutor.matricula = f.value.matricula;
    condutor.rg = f.value.rg;
    condutor.cpf = f.value.cpf;
    condutor.cnh = f.value.cnh;
    condutor.categorias = f.value.cnhCategorias;
    condutor.finalidadesUso = f.value.finalidadesUso;

    let filial = new Filial();
    filial.nomeFilial = f.value.filial;
    condutor.filial = filial;

    this.auditoria.condutor = condutor;

    console.log(this.auditoria);

    this.exibirToast('Dados do condutor salvos com sucesso', Config.TOAST.SUCCESS);
    this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
    this.configurarSlide();
  }

  public salvarDadosVeiculo(f: NgForm) {
    this.auditoria.veiculo.placa = f.value.placa;

    this.exibirToast('Dados do veículo salvos com sucesso', Config.TOAST.SUCCESS);
    this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
    this.configurarSlide();
  }

  public tirarFoto(modalidade: string) {
    this.platform.ready().then(() => {
      if (!this.platform.is('cordova')) {
        this.exibirToast(Config.MSG.RECURSO_NATIVO, Config.TOAST.ERROR);
        return;
      }

      this.appAvailability.check(Config.OPEN_CAMERA).then((yes: boolean) => {
        this.diagnostic.requestRuntimePermissions([ this.diagnostic.permission.WRITE_EXTERNAL_STORAGE, this.diagnostic.permission.CAMERA ]).then(() => {
          this.androidPerm.requestPermissions([ this.androidPerm.PERMISSION.WRITE_EXTERNAL_STORAGE, this.androidPerm.PERMISSION.CAMERA ]).then(() => {
            this.camera.getPicture({
              quality: Config.FOTO.QUALITY,
              targetWidth: Config.FOTO.WIDTH,
              targetHeight: Config.FOTO.HEIGHT,
              destinationType: this.camera.DestinationType.DATA_URL,
              encodingType: this.camera.EncodingType.JPEG,
              mediaType: this.camera.MediaType.PICTURE,
              saveToPhotoAlbum: false,
              allowEdit: true,
              sourceType: 1,
              correctOrientation: true
            }).then(imageData => {
              let foto = new Foto();
              foto.nome = moment().format('YYYYMMDDHHmmss') + "_" + '_' + modalidade;
              foto.str = 'data:image/jpeg;base64,' + imageData;
              foto.modalidade = modalidade;
              this.auditoria.veiculo.fotos.push(foto);
              this.camera.cleanup().catch();
            }).catch(() => { this.exibirAlerta(Config.MSG.ERRO_FOTO) });
          }).catch(() => { this.exibirAlerta(Config.MSG.ERRO_FOTO) });
        }).catch(() => { this.exibirAlerta(Config.MSG.ERRO_PERMISSAO_CAMERA) });
      },
      (no: boolean) => {
        this.exibirToast('Favor instalar o aplicativo Open Camera', Config.TOAST.ERROR);
        setTimeout(() => { this.market.open('net.sourceforge.opencamera') }, 2500);
        return;
      }).catch(() => { this.exibirAlerta(Config.MSG.ERRO_RESPOSTA_DISPOSITIVO) });
    }).catch(() => { this.exibirAlerta(Config.MSG.ERRO_RESPOSTA_DISPOSITIVO) });
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
            if (this.auditoria.veiculo.fotos.length > 0) {
              this.auditoria.veiculo.fotos = this.auditoria.veiculo.fotos.filter((f) => {
                return (f.modalidade != modalidade);
              });
            }
          }
        }
      ]
    });

    confirmacao.present();
  }

  public verificarExistenciaFoto(modalidade: string): boolean {
    if (typeof(this.auditoria.veiculo) !== 'undefined' && typeof(this.auditoria.veiculo.fotos) !== 'undefined') {
      if (this.auditoria.veiculo.fotos.length > 0) {
        let fotos = this.auditoria.veiculo.fotos.filter((foto) => { return (foto.modalidade == modalidade) });

        if (fotos.length > 0) return true;
      }
    }

    return false;
  }

  public carregarFoto(modalidade: string): string {
    if (typeof(this.auditoria.veiculo) !== 'undefined' && typeof(this.auditoria.veiculo.fotos) !== 'undefined') {
      if (this.auditoria.veiculo.fotos.length > 0) {
        let fotos = this.auditoria.veiculo.fotos.filter((foto) => { return (foto.modalidade == modalidade) });

        if (fotos.length > 0) return fotos[0].str;
      }
    }

    switch (modalidade) {
      case 'AUD_FRONTAL':
        return 'assets/imgs/aud_1.png';
      case 'AUD_FRONTAL_LAT_ESQ':
        return 'assets/imgs/aud_2.png';
      case 'AUD_ODOMETRO':
        return 'assets/imgs/aud_3.png';
      case 'AUD_TRAS_LAT_DIR':
        return 'assets/imgs/aud_4.png';
      case 'AUD_INTERNA':
        return 'assets/imgs/aud_5.png';
      case 'AUD_ITENS_SEG':
        return 'assets/imgs/aud_6.png';
      default:
        return 'assets/imgs/no-photo.png';
    }
  }

  public salvar3() {
    this.exibirToast('Condições do veículo salvas com sucesso', Config.TOAST.SUCCESS);
    this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
    this.configurarSlide();
  }

  public salvar4() {
    this.exibirToast('Componentes e acessórios salvos com sucesso', Config.TOAST.SUCCESS);
    this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
    this.configurarSlide();
  }

  public salvar5() {
    this.exibirToast('Utilização do KM salva com sucesso', Config.TOAST.SUCCESS);
    this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
    this.configurarSlide();
  }

  public salvar6() {
    this.exibirToast('Utilização dos créditos salvo com sucesso', Config.TOAST.SUCCESS);
    this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
    this.configurarSlide();
  }

  public formatarCampo(event: any, mascara: string) {
    var i = event.target.value.length;
    var saida = mascara.substring(1,0);
    var texto = mascara.substring(i)
    
    if (texto.substring(0,1) != saida) {
      event.target.value += texto.substring(0,1);
    }
  }

  private configurarSlide() {
    let i = this.slides.getActiveIndex();

    switch (i) {
      case 0:
        this.tituloSlide = `Dados do Condutor`;
        this.slides.lockSwipeToPrev(true);
        this.slides.lockSwipeToNext(false);
      break;

      case 1:
        this.tituloSlide = `Dados do Veículo`;
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(false);
      break;

      case 2:
        this.tituloSlide = `Condições do Veículo`;
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(false);
      break;

      case 3:
        this.tituloSlide = `Assinatura`;
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(true);
      break;
    }
  }

  public selecionarAcessorio(acessorio: AcessorioVeiculo, e: any) {

    if (!e) {
      const prompt = this.alertCtrl.create({
        title: 'Justificativa',
        message: `Justifique a inconformidade do item ${acessorio.nome}`,
        inputs: [
          {
            name: 'justificativa',
            placeholder: 'Justificativa'
          },
        ],
        buttons: [
          {
            text: 'Cancelar',
            handler: res => {}
          },
          {
            text: 'Salvar',
            handler: res => {
              for (let i = 0; i < this.auditoria.veiculo.acessoriosVeiculo.length; i++) {
                if (this.auditoria.veiculo.acessoriosVeiculo[i].nome === acessorio.nome) {
                  this.auditoria.veiculo.acessoriosVeiculo[i].justificativa = res.justificativa;
                }
              }
            }
          }
        ]
      });
      prompt.present();
    }

    for (let i = 0; i < this.auditoria.veiculo.acessoriosVeiculo.length; i++) {
      if (this.auditoria.veiculo.acessoriosVeiculo[i].nome === acessorio.nome) {
        this.auditoria.veiculo.acessoriosVeiculo[i].selecionado = e;
      }
    }
  }

  public salvarAuditoria() {
    if (!this.validarCamposObrigatorios()) return;

    const confirm = this.alertCtrl.create({
      title: 'Finalizar Auditoria e Salvar?',
      message: 'Você deseja finalizar sua auditoria e enviar os dados para o servidor?',
      buttons: [
        {
          text: 'Não',
          handler: () => {}
        },
        {
          text: 'Sim',
          handler: () => {
            const loader = this.loadingCtrl.create({
              content: "Enviando dados... Por favor aguarde",
              duration: 3000
            });

            loader.present();
          }
        }
      ]
    });
    confirm.present();
  }

  private validarCamposObrigatorios(): boolean {
    if (typeof(this.auditoria.condutor) === 'undefined') {
      this.exibirToast('Insira os dados do condutor', Config.TOAST.ERROR);
      return false;
    }

    if (!this.auditoria.condutor.nome) {
      this.exibirToast('Insira o nome do condutor', Config.TOAST.ERROR);
      return false;
    }

    if (!this.auditoria.condutor.matricula) {
      this.exibirToast('Insira a matrícula do condutor', Config.TOAST.ERROR);
      return false;
    }

    if (!this.auditoria.condutor.rg) {
      this.exibirToast('Insira o RG do condutor', Config.TOAST.ERROR);
      return false;
    }

    if (!this.auditoria.condutor.cpf) {
      this.exibirToast('Insira o CPF do condutor', Config.TOAST.ERROR);
      return false;
    }

    if (!this.auditoria.condutor.filial) {
      this.exibirToast('Insira a filial do condutor', Config.TOAST.ERROR);
      return false;
    }

    if (!this.auditoria.condutor.categorias) {
      this.exibirToast('Insira as categorias da CNH do condutor', Config.TOAST.ERROR);
      return false;
    }
    
    if (!this.auditoria.condutor.categorias.length) {
      this.exibirToast('Insira as categorias da CNH do condutor', Config.TOAST.ERROR);
      return false;
    }

    if (!this.auditoria.condutor.finalidadesUso) {
      this.exibirToast('Insira a finalidade de uso do condutor', Config.TOAST.ERROR);
      return false;
    }

    if (!this.auditoria.condutor.finalidadesUso.length) {
      this.exibirToast('Insira a finalidade de uso do condutor', Config.TOAST.ERROR);
      return false;
    }

    if (!this.auditoria.condutor.cnh) {
      this.exibirToast('Insira a CNH do condutor', Config.TOAST.ERROR);
      return false;
    }

    if (typeof(this.auditoria.veiculo) === 'undefined') {
      this.exibirToast('Insira os dados do veículo', Config.TOAST.ERROR);
      return false;
    }

    if (!this.auditoria.veiculo.placa) {
      this.exibirToast('Insira a placa do veículo', Config.TOAST.ERROR);
      return false;
    }
      
    if (typeof(this.auditoria.veiculo.fotos) === 'undefined') {
      this.exibirToast('Insira as fotos do veículo', Config.TOAST.ERROR);
      return false;
    }
      
    if (this.auditoria.veiculo.fotos.length < 6) {
      this.exibirToast('Insira ao menos 6 fotos do veículo', Config.TOAST.ERROR);
      return false;
    }

    if (!this.auditoria.assinaturaTecnico) {
      this.exibirToast('Insira a sua assinatura', Config.TOAST.ERROR);
      return false;
    }

    return true;
  }

  public sair() {
    const confirm = this.alertCtrl.create({
      title: 'Deseja sair?',
      message: 'Você perderá todas as informações inseridas',
      buttons: [
        {
          text: 'Não',
          handler: () => {}
        },
        {
          text: 'Sim',
          handler: () => {
            this.viewCtrl.dismiss();
          }
        }
      ]
    });
    confirm.present();
  }

  private exibirAlerta(msg: string) {
    const alerta = this.alertCtrl.create({
      title: 'Alerta!',
      subTitle: msg,
      buttons: ['OK']
    });

    alerta.present();
  }

  private exibirToast(mensagem: string, tipo: string='info', posicao: string=null) {
    const toast = this.toastCtrl.create({
      message: mensagem, 
      duration: 3000, 
      position: posicao || 'bottom', 
      cssClass: 'toast-' + tipo
    });
    
    toast.present();
  }
}