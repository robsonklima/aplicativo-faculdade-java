import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController, Events } from 'ionic-angular';

import { Badge } from '@ionic-native/badge';

import { LoginPage } from '../login/login';
import { ChamadosPage } from "../chamados/chamados";
import { PecasPage } from '../pecas/pecas';

import { Chamado } from "../../models/chamado";
import { DadosGlobais } from '../../models/dados-globais';

import { Config } from "../../config/config";

import { DadosGlobaisService } from '../../services/dados-globais';
import { UsuarioService } from '../../services/usuario';
import { ChamadoService } from "../../services/chamado";
import { AcaoService } from "../../services/acao";
import { DefeitoService } from "../../services/defeito";
import { CausaService } from "../../services/causa";
import { PecaService } from "../../services/peca";
import { TipoServicoService } from "../../services/tipo-servico";

@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})
export class HomePage {
  loginPage = LoginPage;
  dadosGlobais: DadosGlobais;
  chamados: Chamado[];
  task: any;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private events: Events,
    private badge: Badge,
    private dadosGlobaisService: DadosGlobaisService,
    private chamadoService: ChamadoService,
    private usuarioService: UsuarioService,
    private acaoService: AcaoService,
    private defeitoService: DefeitoService,
    private causaService: CausaService,
    private pecaService: PecaService,
    private tipoServicoService: TipoServicoService
  ) { 
    this.events.subscribe('sincronizacao:efetuada', () => {
      this.carregarChamadosStorage();
    });
  }

  ionViewWillEnter() {
    this.carregarDadosGlobais();
    this.carregarChamadosStorage();
    this.carregarSenhaExpirada();
  }

  public telaChamados() {
    this.navCtrl.push(ChamadosPage);
  }

  public telaPecas() {
    this.navCtrl.push(PecasPage);
  }

  public carregarChamadosStorage(): Promise<Chamado[]> {
    return new Promise((resolve, reject) => {
      this.chamadoService.buscarChamadosStorage()
        .then((chamados: Chamado[]) => {
          this.chamados = chamados.filter((c) => {
            return (!c.dataHoraFechamento);
          }).filter((c) => {
            return (!c.dataHoraOSMobileLida);
          });

          this.badge.set(this.chamados.length);

          resolve(chamados);
        })  
        .catch(err => {})
    });
  }

  private carregarDadosGlobais() {
    this.dadosGlobaisService.buscarDadosGlobaisStorage()
      .then((dados: DadosGlobais) => {
        if (dados) 
          this.dadosGlobais = dados;

        if (!this.dadosGlobais.dataHoraCadastro || this.verificarNecessidadeAtualizacao())
          this.atualizarBDLocal();
      })
      .catch((err) => {});
  }

  private verificarNecessidadeAtualizacao(): boolean {
    let limiteAtualizacao = new Date();
    limiteAtualizacao.setDate(limiteAtualizacao.getDate() 
      - Config.INT_SINC_BD_LOCAL_DIAS);

    if (new Date(this.dadosGlobais.dataHoraCadastro) < limiteAtualizacao)
      return true;

    return false;
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

  private salvarDadosGlobais() {
    this.dadosGlobais.dataHoraCadastro = new Date().toString();

    this.dadosGlobaisService.insereDadosGlobaisStorage(this.dadosGlobais);
  }

  private carregarSenhaExpirada() {
    this.usuarioService.verificarSenhaExpirada()
      .subscribe(senhaExpirada => {
        if (senhaExpirada) {
          this.exibirAlerta(`Sua senha expirou. Altere sua senha 
            para continuar utilizando a aplicação.`);
        }
      }, err => {});
  }

  private exibirAlerta(msg: string) {
    const alerta = this.alertCtrl.create({
      title: 'Alerta!',
      subTitle: msg,
      buttons: ['OK']
    });

    alerta.present();
  }
  
  ionViewWillLeave() {
    clearInterval(this.task);
  }
}