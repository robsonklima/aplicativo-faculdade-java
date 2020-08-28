import { Component, OnInit, ViewChild } from '@angular/core';
import { NavParams, AlertController, ViewController, ToastController, Slides } from 'ionic-angular';
import { Chamado } from '../../models/chamado';
import { Config } from '../../models/config';
import { NgForm } from '@angular/forms';
import { ChamadoService } from '../../services/chamado';
import { ChecklistPreventivaItem } from '../../models/checklist-preventiva-item';


@Component({
  selector: 'checklist-preventiva-page',
  templateUrl: 'checklist-preventiva.html'
})
export class ChecklistPreventivaPage {
  @ViewChild(Slides) slides: Slides;
  tituloSlide: string;
  chamado: Chamado;
  itensNaoChecados: number;

  constructor(
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private chamadoService: ChamadoService
  ) {
    this.chamado = this.navParams.get('chamado');
  }

  ionViewWillEnter() {
    this.configurarSlide();
    this.itensNaoChecados = this.chamado.checklistPreventiva.itens.filter((i) => { return (i.checado === 0 && i.obs === null) }).length;
  }

  public fecharModalConfirmacao() {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Ao sair você perderá todas as informações inseridas ou modificadas?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.viewCtrl.dismiss(this.chamado);
          }
        }
      ]
    });

    confirmacao.present();
  }

  public salvarChecklist() {
    //if (!this.validarCamposObrigatorios()) return;

    const confirm = this.alertCtrl.create({
      title: 'Finalizar Checklist?',
      message: 'Você deseja salvar e finalizar este checklist?',
      buttons: [
        {
          text: 'Não',
          handler: () => {}
        },
        {
          text: 'Sim',
          handler: () => {
            this.chamadoService.atualizarChamado(this.chamado).then(() => {
              this.viewCtrl.dismiss(this.chamado);
            });
          }
        }
      ]
    });
    confirm.present();
  }

  public salvarInformacoesAmbiente(form: NgForm) {
    this.chamado.checklistPreventiva.tensaoSemCarga = Number(form.value.tensaoSemCarga);
    this.chamado.checklistPreventiva.tensaoComCarga = Number(form.value.tensaoComCarga);
    this.chamado.checklistPreventiva.tensaoEntreTerraENeutro = Number(form.value.tensaoEntreTerraENeutro);
    this.chamado.checklistPreventiva.temperatura = Number(form.value.temperatura);
    this.chamado.checklistPreventiva.redeEstabilizada = Number(form.value.redeEstabilizada);
    this.chamado.checklistPreventiva.possuiNoBreak = Number(form.value.possuiNoBreak);
    this.chamado.checklistPreventiva.possuiArCondicionado = Number(form.value.possuiArCondicionado);
    this.chamado.checklistPreventiva.justificativa = form.value.justificativa;

    console.log(this.chamado);
    this.chamadoService.atualizarChamado(this.chamado).then(() => {
      this.configurarSlide();
      this.slides.slideTo(1, 500);
    });
  }

  public selecionarItem(item: ChecklistPreventivaItem, e: any) {
    if (!e || item.obrigatorioObs) {
      const prompt = this.alertCtrl.create({
        title: 'Observação',
        message: `${ item.descricao }`,
        inputs: [
          {
            name: 'observacao',
            placeholder: 'Observação'
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
              // Atualiza Obs
              for (let i = 0; i < this.chamado.checklistPreventiva.itens.length; i++) {
                if (this.chamado.checklistPreventiva.itens[i].descricao === item.descricao) {
                  this.chamado.checklistPreventiva.itens[i].obs = res.observacao;
                }
              }
            }
          }
        ]
      });
      prompt.present();
    }

    // Atualiza checado
    for (let i = 0; i < this.chamado.checklistPreventiva.itens.length; i++) {
      if (this.chamado.checklistPreventiva.itens[i].descricao === item.descricao) {
        this.chamado.checklistPreventiva.itens[i].checado = e;
      }
    }

    this.itensNaoChecados = this.chamado.checklistPreventiva.itens.filter((i) => { return (i.checado === 0 && i.obs === null) }).length;
  }

  private configurarSlide() {
    let i = this.slides.getActiveIndex();

    switch (i) {
      case 0:
        this.tituloSlide = `Ambiente`;
        this.slides.lockSwipeToPrev(true);
        this.slides.lockSwipeToNext(false);
      break;

      case 1:
        this.tituloSlide = `Imagens`;
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(false);
      break;

      case 2:
        this.tituloSlide = `Checklist`;
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(true);
      break;
    }
  }

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: Config.TOAST.DURACAO, position: 'bottom'
      });

      resolve(toast.present());
    });
  }
}