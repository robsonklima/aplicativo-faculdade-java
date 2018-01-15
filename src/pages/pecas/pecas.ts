import { Component } from '@angular/core';
import { AlertController, LoadingController } from 'ionic-angular';

import { Chamado } from "../../models/chamado";
import { Peca } from "../../models/peca";
import { DadosGlobais } from '../../models/dados-globais';

import { PecaService } from "../../services/peca";
import { DadosGlobaisService } from '../../services/dados-globais';
import { AcaoService } from "../../services/acao";
import { DefeitoService } from "../../services/defeito";
import { CausaService } from "../../services/causa";
import { TipoServicoService } from "../../services/tipo-servico";

@Component({
  selector: 'pecas-page',
  templateUrl: 'pecas.html'
})
export class PecasPage {
  dadosGlobais: DadosGlobais;
  chamado: Chamado;
  ratDetalheIndex: number;
  inputPesquisar: string;
  pecas: Peca[] = [];
  spinner: boolean;

  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private pecaService: PecaService,
    private dadosGlobaisService: DadosGlobaisService,
    private acaoService: AcaoService,
    private defeitoService: DefeitoService,
    private causaService: CausaService,
    private tipoServicoService: TipoServicoService
  ) {}

  ionViewWillEnter() {
    this.carregarDadosGlobais();
  }

  private carregarPecasStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(
        this.pecaService.buscarPecasStorage()
          .then(
          (pecas: Peca[]) => {
            this.pecas = pecas.sort( function(a,b) { return (a.codMagnus > b.codMagnus) ? 1 : 
              ((b.codMagnus > a.codMagnus) ? -1 : 0) }); 
          })
          .catch(err => { })
      );
    });
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

  public atualizarBDLocal() {
    const loading = this.loadingCtrl.create({ content: 'Aguarde, sincronizando dados offline...' });
    loading.present();

    this.tipoServicoService.buscarTipoServicosApi()
      .subscribe(tipoServicos => { this.acaoService.buscarAcoesApi()
        .subscribe(acoes => { this.defeitoService.buscarDefeitosApi()
          .subscribe(defeitos => { this.causaService.buscarCausasApi()
            .subscribe(causas => { this.pecaService.buscarPecasApi()
              .subscribe(pecas => {
                loading.dismiss();
                this.salvarDadosGlobais();
              }, err => { loading.dismiss() });
            }, err => { loading.dismiss() });
          }, err => { loading.dismiss() });
        }, err => { loading.dismiss() });
      }, err => { loading.dismiss() });
  }

  public exibirDetalhesPeca(peca: Peca) {
    let alert = this.alertCtrl.create({
      title: peca.codMagnus,
      message: peca.nomePeca,
      buttons: ['OK']
    });

    alert.present();
  }

  private carregarDadosGlobais() {
    this.dadosGlobaisService.buscarDadosGlobaisStorage()
      .then((dados: DadosGlobais) => {
        if (dados) 
          this.dadosGlobais = dados;
      })
      .catch((err) => {});
  }

  private salvarDadosGlobais() {
    this.dadosGlobais.dataHoraCadastro = new Date().toLocaleString('pt-BR');

    this.dadosGlobaisService.insereDadosGlobaisStorage(this.dadosGlobais);
  }
}