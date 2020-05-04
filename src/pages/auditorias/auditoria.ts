import { Component, ViewChild } from '@angular/core';
import { Slides, ToastController, ModalController, AlertController, ViewController, LoadingController } from 'ionic-angular';
import { Config } from '../../models/config';
import { AssinaturaPage } from '../assinatura/assinatura';


@Component({
  selector: 'auditoria-page',
  templateUrl: 'auditoria.html'
})
export class AuditoriaPage {
  @ViewChild(Slides) slides: Slides;
  tituloSlide: string;
  acessorios: any[] = [];
  assinaturaTecnico: string;

  constructor(
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private viewCtrl: ViewController,
    public loadingCtrl: LoadingController
  ) {}

  ionViewWillEnter() {
    this.configurarSlide();
    this.carregarAcessorios();
  }

  public telaAssinaturaTecnico() {
    const modal = this.modalCtrl.create(AssinaturaPage, { paginaOrigem: "AUDITORIA_TECNICO" });
    modal.present();
    modal.onDidDismiss((assinatura: string) => {
      this.assinaturaTecnico = assinatura;
    });
  }

  private carregarAcessorios() {
    let listaAcessorios: string[] = ['Retrovisor Direito', 'Retrovisor Esquerdo', 'Retrovisor Interno', 'Faróis', 'Calotas', 
      'Bateria', 'Rodas Comum', 'Lanternas', 'Luz de Neblina', 'Documentos', 'Bancos Dianteiros', 'Bancos Traseiros', 'Manual',
      'Tapetes', 'Rádio', 'MP3', 'Cartão Abastecimento', 'Buzina', 'Painel', 'Para-Brisa', 'Macaco', 'Triângulo', 'Chave de Rodas',
      'Chave e Reserva', 'Estofamento Geral'];  

    listaAcessorios.sort();

    listaAcessorios.forEach(a => {
      this.acessorios.push({ nome: a, selecionao: false });
    });
  }

  public salvar1() {
    this.exibirToast('Dados do condutor salvos com sucesso', Config.TOAST.SUCCESS);
    this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
    this.configurarSlide();
  }

  public salvar2() {
    this.exibirToast('Dados do veículo salvos com sucesso', Config.TOAST.SUCCESS);
    this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
    this.configurarSlide();
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
        this.tituloSlide = `Componentes e Acessórios`;
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(false);
      break;

      case 4:
        this.tituloSlide = `Utilização do Km`;
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(false);
      break;

      case 5:
        this.tituloSlide = `Assinatura`;
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(true);
      break;
    }
  }

  public selecionarAcessorio(acessorio: any, e: any) {
    for (let i = 0; i < this.acessorios.length; i++) {
      if (this.acessorios[i].nome === acessorio.nome) {
        this.acessorios[i].selecionado = e.checked;
      }
    }
  }

  public salvarAuditoria() {
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
              content: "Enviando dados... Por favor aguarde.",
              duration: 3000
            });

            loader.present();
          }
        }
      ]
    });
    confirm.present();
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