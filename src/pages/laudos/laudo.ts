import { Component, ViewChild, OnInit  } from '@angular/core';
import { NavParams, Slides, ToastController, AlertController, 
  ViewController, ModalController } from 'ionic-angular';
import { Laudo } from '../../models/laudo';
import { Chamado } from '../../models/chamado';
import { NgForm } from '@angular/forms';
import { Foto } from '../../models/foto';

import { SituacaoPage } from './situacao';
import { ChamadoService } from '../../services/chamado';

import moment from 'moment';
import { AssinaturaPage } from '../assinatura/assinatura';


@Component({
  selector: 'laudo-page',
  templateUrl: 'laudo.html'
})
export class LaudoPage {
  @ViewChild(Slides) slides: Slides;
  tituloSlide: string;
  chamado: Chamado;
  laudo: Laudo;
  foto: Foto;

  constructor(
    private chamadoService: ChamadoService,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private viewCtrl: ViewController,
    private modalCtrl: ModalController
  ) {
    this.chamado = this.navParams.get('chamado');
  }

  ionViewWillEnter() {
    this.configurarSlide(this.slides.getActiveIndex());
  }

  ngOnInit() {
    this.laudo = new Laudo();
  }

  public telaSituacao() {
    const modal = this.modalCtrl.create(SituacaoPage, { laudo: this.laudo });
    modal.present();
    modal.onDidDismiss((laudo) => {
      this.laudo = laudo;

      this.configurarSlide(this.slides.getActiveIndex());
    }); 
  }

  public telaAssinatura() {
    const modal = this.modalCtrl.create(AssinaturaPage, { paginaOrigem: "LAUDO", laudo: this.laudo });
    modal.present();
    modal.onDidDismiss((laudo) => {
      this.laudo = laudo;

      this.configurarSlide(this.slides.getActiveIndex());
    });
  }

  public criarLaudo(form: NgForm) {
    this.laudo.codOS = this.chamado.codOs;
    this.laudo.codTecnico = this.chamado.tecnico.codTecnico;
    this.laudo.relatoCliente = form.value.relatoCliente;
    this.laudo.dataHoraCad = moment().format();
    this.laudo.situacoes = [];
    this.laudo.assinatura = null;
    this.laudo.indAtivo = 1;
    
    this.configurarSlide(this.slides.getActiveIndex());
    this.slides.slideTo(1, 500);
  }

  public salvarLaudo(form: NgForm) {
    this.laudo.conclusao = form.value.conclusao;
    
    this.configurarSlide(this.slides.getActiveIndex());
    this.slides.slideTo(3, 500);
  }

  public removerSituacao(i: number) {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja excluir esta situação?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.laudo.situacoes.splice(i, 1);
            this.exibirToast("Situação removida com sucesso")
          }
        }
      ]
    });

    confirmacao.present();
  }

  public finalizarLaudo() {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja finalizar este laudo?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {}
        },
        {
          text: 'Confirmar',
          handler: () => {
            if (this.laudo.situacoes.length == 0) {
              this.exibirToast('Favor informar as situações do laudo');
              return
            }

            this.chamado.rats[0].laudos.push(this.laudo);
            this.chamadoService.atualizarChamado(this.chamado);

            this.fecharModal();
          }
        }
      ]
    });

    confirmacao.present();
  }

  public alterarSlide() {
    this.configurarSlide(this.slides.getActiveIndex());
  }

  private configurarSlide(i: number) {
    switch (i) {
      case 0:
        this.tituloSlide = (i + 1) + ". " + "Relato do Cliente";
        
        if (!this.laudo.relatoCliente) {
          this.slides.lockSwipeToNext(true);
        } else {
          this.slides.lockSwipeToNext(false);
        }
        
        break;
      case 1:
        this.tituloSlide = (i + 1) + ". " + "Situações";
       
        if (this.laudo.situacoes.length == 0) {
          this.slides.lockSwipeToNext(true);
        } else {
          this.slides.lockSwipeToNext(false);
        }
       
        break;
      case 2:
        this.tituloSlide = (i + 1) + ". " + "Conclusão";
        
        if (!this.laudo.conclusao) {
          this.slides.lockSwipeToNext(true);
        } else {
          this.slides.lockSwipeToNext(false);
        }
        
        break;
      case 3:
        this.tituloSlide = (i + 1) + ". " + "Assinatura do Técnico";
        
        if (!this.laudo.assinatura) {
          this.slides.lockSwipeToNext(true);
        } else {
          this.slides.lockSwipeToNext(false);
        }
        
        break;
      case 4:
        this.tituloSlide = (i + 1) + ". " + "Finalizar";
        
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(false);
        
        break;
    }
  }

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: 3000, position: 'bottom'
      });

      resolve(toast.present());
    });
  }

  public fecharModal() {
    this.viewCtrl.dismiss();
  }
}