import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController, PopoverController, Events } from 'ionic-angular';

import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';

import { LoginPage } from '../login/login';
import { ChamadosPage } from "../chamados/chamados";
import { PecasPage } from '../pecas/pecas';
import { HomeMaisOpcoesPage } from '../home/home-mais-opcoes';
import { IndicadorMenuPage } from '../indicadores/indicador-menu';

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
  versaoAppAtualizada: boolean = true;
  loginPage = LoginPage;
  dadosGlobais: DadosGlobais;
  chamados: Chamado[];
  task: any;
  perfilTecnico: boolean;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private appVersion: AppVersion,
    private market: Market,
    private events: Events,
    private popoverCtrl: PopoverController,
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
      setTimeout(() => {
        this.carregarChamadosStorage();
      }, 2000);
    });
  }

  ionViewWillEnter() {
    this.carregarDadosGlobais().then(() => { 
      this.carregarVersaoApp();
    });
    this.carregarSenhaExpirada();
    this.carregarChamadosStorage();
  }

  public telaChamados() {
    this.navCtrl.push(ChamadosPage);
  }

  public telaPecas() {
    this.navCtrl.push(PecasPage);
  }

  public telaIndicadoresMenu() {
    this.navCtrl.push(IndicadorMenuPage);
  }


  public abrirPopover(event: MouseEvent) {
    const popover = this.popoverCtrl.create(HomeMaisOpcoesPage);

    popover.present({ev: event});

    popover.onDidDismiss(data => {
      if (!data)
        return;
    });
  }

  public carregarChamadosStorage(): Promise<Chamado[]> {
    return new Promise((resolve, reject) => {
      this.chamadoService.buscarChamadosStorage().then((chamados: Chamado[]) => {
        this.chamados = chamados.filter((c) => {
          return (!c.dataHoraFechamento);
        }).filter((c) => {
          return (!c.dataHoraOSMobileLida);
        });

        resolve(chamados);
      })  
      .catch(err => {
        reject();
      })
    });
  }

  private carregarDadosGlobais(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.dadosGlobaisService.buscarDadosGlobaisStorage().then((dados) => {
        this.dadosGlobais = dados;
        
        if (!this.dadosGlobais.usuario.codTecnico) {
          reject();
          return;
        }
        
        if (!this.dadosGlobais.dataHoraCadastro || this.verificarNecessidadeAtualizacao()) {
          this.atualizarBDLocal();
          this.carregarChamadosStorage();
        }

        resolve(true);
      })
      .catch((err) => { reject(false) });
    });
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

  private carregarVersaoApp() {
    this.appVersion.getVersionNumber().then((versaoApp) => {
      this.dadosGlobaisService.buscarUltimaVersaoApp({
        versao: versaoApp, usuario: this.dadosGlobais.usuario
      }).subscribe(versaoAppMaisRecente => {
        if (versaoAppMaisRecente) {
          if (versaoApp >= versaoAppMaisRecente) {
            this.versaoAppAtualizada = true;
          } else {
            this.versaoAppAtualizada = false;
          }
        }
      }, err => {});
    }).catch(() => {});
  }

  public abrirAplicativoNaLojaGoogle() {
    this.market.open(Config.GOOGLE_PLAY_NOME_APP);
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