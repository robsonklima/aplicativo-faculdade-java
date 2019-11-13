import { RatDetalhe } from '../../models/rat-detalhe';
import { Component, ViewChild } from '@angular/core';
import { AlertController, NavParams, Slides, ToastController, ViewController } from 'ionic-angular';
import { NgForm } from '@angular/forms';

import { Config } from './../../config/config';

import { Chamado } from './../../models/chamado';
import { TipoServico } from "../../models/tipo-servico";
import { Peca } from "../../models/peca";
import { Acao } from "../../models/acao";
import { TipoCausa } from "../../models/tipo-causa";
import { Causa } from "../../models/causa";
import { Defeito } from "../../models/defeito";

import { TipoServicoService } from "../../services/tipo-servico";
import { AcaoService } from "../../services/acao";
import { CausaService } from "../../services/causa";
import { DefeitoService } from "../../services/defeito";
import { PecaService } from '../../services/peca';
import { ChamadoService } from "../../services/chamado";

@Component({
  selector: 'rat-detalhe-page',
  templateUrl: 'rat-detalhe.html'
})
export class RatDetalhePage {
    @ViewChild(Slides) slides: Slides;
    tituloSlide: string;
    chamado: Chamado;
    ratDetalhe: RatDetalhe;
    tipoCausas: TipoCausa[] = [];
    tipoServico: TipoServico;
    tipoServicos: TipoServico[];
    tipoCausa: TipoCausa;
    defeito: Defeito;
    defeitos: Defeito[] = [];
    causa: Causa;
    modulos: Causa[] = [];
    subModulos: Causa[] = [];
    componentes: Causa[] = [];
    acao: Acao;
    acoes: Acao[] = [];
    pecas: Peca[] = [];
    inputPesquisar: string;
    spinner: boolean;
    qtd = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ];

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private tipoServicoService: TipoServicoService,
    private acaoService: AcaoService,
    private causaService: CausaService,
    private defeitoService: DefeitoService,
    private pecaService: PecaService,
    private chamadoService: ChamadoService
  ) {
    this.chamado = this.navParams.get('chamado');
  }

  ionViewWillEnter() {
    this.configurarSlide(this.slides.getActiveIndex());
    this.buscarTipoCausas();
    this.buscarModulos();
    this.buscarDefeitos();
    this.buscarAcoes();
  }

  public buscarTipoCausas() {
    this.tipoCausas = [{
      codTipoCausa: 1,
      nomeTipoCausa: 'Máquina'
    }, {
      codTipoCausa: 2,
      nomeTipoCausa: 'Extra-Máquina'
    }]
  }

  public buscarTipoServicos(codTipoCausa: string) {
    this.tipoServicoService.buscarTipoServicosStorage()
      .then((tipoServicos: TipoServico[]) => {
        this.tipoServicos = tipoServicos
          .filter((ts) => { return (ts.codETipoServico.substring(0, 1) == codTipoCausa) })
          .sort((a, b) => ( Number(a.codETipoServico) - Number(b.codETipoServico) ));
      })
      .catch(err => {});
  }

  public buscarModulos() {
    this.causaService.buscarCausasStorage()
      .then((causas: Causa[]) => {
        this.modulos = causas.filter((causa) => { 
          return (causa.codECausa.substring(2, 5) == '000');
        });
      })
      .catch(err => {});
  }

  public buscarSubModulos(modulo: string) {
    this.causaService.buscarCausasStorage()
      .then((causas: Causa[]) => {
        this.subModulos = causas.filter((causa) => { 
          return (causa.codECausa.substring(0, 2) == modulo.substring(0, 2) 
            && causa.codECausa.substring(3, 5) == '00');
        });
      })
      .catch(err => {});

    this.componentes = [];
  }

  public buscarComponentes(subModulo: string) {
    this.causaService.buscarCausasStorage()
      .then((causas: Causa[]) => {
        this.componentes = causas.filter((causa) => { 
          return (causa.codECausa.substring(0, 3) == subModulo.substring(0, 3));
        });
      })
      .catch(err => {});
  }

  public buscarDefeitos() {
    this.defeitoService.buscarDefeitosStorage()
      .then((defeitos: Defeito[]) => {
        this.defeitos = defeitos.sort((a, b) => 
          Number(a.codEDefeito) - Number(b.codEDefeito));
      })
      .catch(err => {});
  }

  public buscarAcoes() {
    this.acaoService.buscarAcoesStorage()
      .then((acoes: Acao[]) => {
        this.acoes = acoes.sort((a, b) => 
          Number(a.codEAcao) - Number(b.codEAcao));
      })
      .catch(err => {});
  }

  public salvarRatDetalhe(form: NgForm) {
    let tipoCausa = new TipoCausa();
    tipoCausa = form.value.tipoCausa;
    let tipoServico = new TipoServico()
    tipoServico = form.value.tipoServico;
    let defeito = new Defeito();
    defeito = form.value.defeito;
    let causa = new Causa();
    causa = form.value.causa;
    let acao = new Acao();
    acao = form.value.acao;
    let pecas: Peca[] = [];

    if (!tipoCausa.codTipoCausa  || !tipoServico.codTipoServico || !defeito.codDefeito || !causa.codCausa || !acao.codAcao ) {
      this.exibirToast('Erro ao salvar detalhe! Tente novamente').then(() => {
        this.fecharModal();
        
        return
      })
      .catch(() => {});
    } else {
      this.ratDetalhe = {
        tipoCausa: tipoCausa,
        tipoServico: tipoServico,
        defeito: defeito,
        causa: causa,
        acao: acao,
        pecas: pecas
      };
      
      this.configurarSlide(this.slides.getActiveIndex());
      this.slides.slideTo(this.slides.getActiveIndex() + 1, 500);
  
      if (this.ratDetalhe.acao.codAcao == Config.ACAO.PENDENCIA_PECA.CODACAO) {
        this.apresentarCampoProtocoloStn();
      }

      // if (causa.codECausa.substring(0, 2) == "15") {
      //   this.apresentarCamposQuantidadesCedulas();
      // }

      if (causa.codECausa.substring(0, 2) == "08") {
        this.exibirAlerta("Este chamado exige lançamento de laudo!");
      }
    }
  }

  public salvarRatDetalheNoChamadoESair() {
    this.exibirToast('Detalhe adicionado com sucesso')
      .then(() => {
        this.chamado.rats[0].ratDetalhes.push(this.ratDetalhe);
        this.chamadoService.atualizarChamado(this.chamado);
        this.fecharModal();
      })
      .catch();
  }

  public filtrarPecas(ev: any) {
    let val = ev.target.value;

    if (val && val.trim() != '') {
      if (val.length < 4) {
        return
      }
    }

    this.spinner = true;

    this.carregarPecasStorage().then(() => {
      this.spinner = false;

      this.pecas = this.pecas.filter((peca) => {
        if (val && val.trim() != '') {
          return (peca.nomePeca.toString().toLowerCase().indexOf(val.toLowerCase()) > -1
            || peca.codMagnus.toString().toLowerCase().indexOf(val.toLowerCase()) > -1);
        }
      })
    });
  }

  public limparPesquisa() {
    this.pecas.splice(0, this.pecas.length);
    this.inputPesquisar = "";
  }

  public adicionarPeca(peca: Peca) {
    if (!this.verificaPecaJaAdicionada(peca)) {
      this.ratDetalhe.pecas.push({
        codPeca: peca.codPeca,
        codMagnus: peca.codMagnus,
        nomePeca: peca.nomePeca,
        qtd: 1
      });
      this.limparPesquisa();
    } else {
      this.exibirToast("Esta peça já foi adicionada");
    }
  }

  public alterarQtdPeca(qtd: number, i: number) {
    this.ratDetalhe.pecas[i].qtd = qtd;
  }

  public removerPeca(peca: Peca) {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja excluir esta peça?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            let i = this.ratDetalhe.pecas
              .map(function (p) { return p.codPeca; }).indexOf(peca.codPeca);

            if (i > -1) {
              this.ratDetalhe.pecas.splice(i, 1);
              this.exibirToast("Peça removida com sucesso");
              this.chamadoService.atualizarChamado(this.chamado);
            }
          }
        }
      ]
    });

    confirmacao.present();
  }

  public fecharModalConfirmacao() {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja sair e perder as informações inseridas?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.fecharModal()
          }
        }
      ]
    });

    confirmacao.present();
  }

  private verificaPecaJaAdicionada(peca: Peca) {
    let res: boolean;

    this.ratDetalhe.pecas.forEach((p, i) => {
      if (p.codMagnus
        .toString()
        .toLowerCase()
        .indexOf(peca.codMagnus.toString().toLowerCase()) > -1)
        res = true;
    });

    return res;
  }

  private apresentarCampoProtocoloStn() {
    let prompt = this.alertCtrl.create({
      title: 'Protocolo STN',
      message: `Digite o protocolo STN para esta 
                  pendência de peças`,
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'protocoloStn',
          type: 'number',
          placeholder: 'Protocolo STN'
        },
      ],
      buttons: [
        {
          text: 'Salvar',
          handler: dados => {
            if (!dados.protocoloStn || dados.protocoloStn.trim() == '') {
              return false
            }

            this.ratDetalhe.protocoloStn = dados.protocoloStn.trim();
          }
        }
      ]
    });
    prompt.present();
  }

  // private apresentarCamposQuantidadesCedulas() {
  //   let prompt = this.alertCtrl.create({
  //     title: 'Quantidade de Cédulas',
  //     message: `Preencha os campos abaixo`,
  //     enableBackdropDismiss: false,
  //     inputs: [
  //       {
  //         name: 'qtdCedulasPagas',
  //         type: 'number',
  //         placeholder: 'Qtd Cédulas Pagas'
  //       },
  //       {
  //         name: 'qtdCedulasRejeitadas',
  //         type: 'number',
  //         placeholder: 'Qtd Cédulas Rejeitadas'
  //       }
  //     ],
  //     buttons: [
  //       {
  //         text: 'Salvar',
  //         handler: dados => {
  //           if ((!dados.qtdCedulasPagas || dados.qtdCedulasPagas.trim() == '') || 
  //               (!dados.qtdCedulasRejeitadas || dados.qtdCedulasRejeitadas.trim() == '')) {
  //             this.exibirAlerta('Favor informar a quantidade de cédulas pagas e rejeitadas!');
              
  //             return false;
  //           }

  //           if ((dados.qtdCedulasPagas <= this.chamado.qtdCedulasPagas || 
  //               dados.qtdCedulasRejeitadas <= this.chamado.qtdCedulasRejeitadas) &&
  //               prompt.data.inputs.length == 2) {
              
  //             let justificativaJaAdicionada: Boolean = false;
              
  //             prompt.data.inputs.forEach(input => {
  //               if (input.name == 'justificativaCedulas')
  //                 justificativaJaAdicionada = true;
  //             });

  //             if (!justificativaJaAdicionada) {
  //               prompt.addInput({
  //                 name: 'justificativaCedulas',
  //                 type: 'text',
  //                 placeholder: 'Justificativa'
  //               });
  //             }

  //             return false;
  //           }

  //           this.chamado.qtdCedulasPagas = dados.qtdCedulasPagas.trim();
  //           this.chamado.qtdCedulasRejeitadas = dados.qtdCedulasRejeitadas.trim();

  //           if (prompt.data.inputs.length == 3) {
  //             this.chamado.justificativaCedulas = dados.justificativaCedulas.trim();
  //           }
  //         }
  //       }
  //     ]
  //   });

  //   prompt.present();
  // }

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: 2500, position: 'bottom'
      });

      resolve(toast.present());
    });
  }

  private carregarPecasStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(
        this.pecaService.buscarPecasStorage()
          .then(
          (pecas: Peca[]) => {
            this.pecas = pecas;
          })
          .catch(err => { })
      );
    });
  }

  private configurarSlide(i: number) {
    switch (i) {
      case 0:
        this.tituloSlide = "6." + (i + 1) + ". " + "Inserindo Detalhe";
        this.slides.lockSwipeToPrev(true);
        if (!this.ratDetalhe)
          this.slides.lockSwipeToNext(true);
          else
            this.slides.lockSwipeToNext(false);
        break;
      case 1:
        this.tituloSlide = "6." + (i + 1) + ". " + "Inserindo Peças";
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(true);
        break;
    }
  }

  public alterarSlide() {
    this.configurarSlide(this.slides.getActiveIndex());
  }

  private exibirAlerta(msg: string) {
    const alerta = this.alertCtrl.create({
      title: 'Alerta!',
      subTitle: msg,
      buttons: ['OK']
    });

    alerta.present();
  }

  private fecharModal() {
    this.viewCtrl.dismiss();
  }
}