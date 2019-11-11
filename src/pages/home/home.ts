import { Component } from '@angular/core';
import { LoadingController, NavController, PopoverController, Events } from 'ionic-angular';

import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';

import { LoginPage } from '../login/login';
import { ChamadosPage } from "../chamados/chamados";
import { PecasPage } from '../pecas/pecas';
import { HomeMaisOpcoesPage } from '../home/home-mais-opcoes';
import { IndicadorMenuPage } from '../indicadores/indicador-menu';
import { MensagensPage } from '../mensagens/mensagens';

import { Chamado } from "../../models/chamado";
import { DadosGlobais } from '../../models/dados-globais';
import { UsuarioPonto } from '../../models/usuario-ponto';
import { Laudo } from '../../models/laudo';

import { Config } from "../../config/config";
import moment from 'moment';

import { DadosGlobaisService } from '../../services/dados-globais';
import { UsuarioService } from '../../services/usuario';
import { ChamadoService } from "../../services/chamado";
import { AcaoService } from "../../services/acao";
import { DefeitoService } from "../../services/defeito";
import { CausaService } from "../../services/causa";
import { PecaService } from "../../services/peca";
import { TipoServicoService } from "../../services/tipo-servico";
import { LaudoService } from '../../services/laudo';
import { MensagemTecnicoService } from '../../services/mensagem-tecnico';
import { EquipamentoPOSService } from '../../services/equipamento-pos';
import { TipoComunicacaoService } from '../../services/tipo-comunicacao';
import { MotivoComunicacaoService } from '../../services/motivo-comunicacao';
import { OperadoraTelefoniaService } from '../../services/operadora-telefonia';
import { EquipamentoCausaService } from '../../services/equipamento-causa';


@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})
export class HomePage {
  versaoAppAtualizada: boolean = true;
  necessidadeRegistrarIntervalo: boolean = false;
  loginPage = LoginPage;
  dg: DadosGlobais;
  chamados: Chamado[];
  qtdMensagensTecnicoNaoLidas: number;
  laudos: Laudo[];
  task: any;
  perfilTecnico: boolean;
  usuarioPonto: UsuarioPonto;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
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
    private tipoServicoService: TipoServicoService,
    private laudoService: LaudoService,
    private mensagemTecnicoService: MensagemTecnicoService,
    private equipamentoPOSService: EquipamentoPOSService,
    private tipoComunicacaoService: TipoComunicacaoService,
    private motivoComunicacaoService: MotivoComunicacaoService,
    private operadoraTelefonicaService: OperadoraTelefoniaService,
    private equipamentoCausaService: EquipamentoCausaService
  ) {
    this.events.subscribe('sincronizacao:efetuada', () => {
      setTimeout(() => { this.carregarChamadosStorage() }, 2000);
    });
  }

  ionViewWillEnter() {
    this.carregarDadosGlobais()
      .then(() => this.carregarChamadosStorage().catch(() => {}))
      .then(() => this.carregarLaudos().catch(() => {}))
      .then(() => this.carregarMensagensTecnico().catch(() => {}))
      .then(() => this.obterRegistrosPonto().catch(() => {}))
      .then(() => this.verificarNecessidadeRegistroPontoIntervalo().catch(() => {}))
      .then(() => this.carregarVersaoApp().catch(() => {}))
      .catch(() => {});
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

  public telaMensagensTecnico() {
    this.navCtrl.push(MensagensPage);
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

  public carregarMensagensTecnico(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mensagemTecnicoService.buscarMensagensTecnicoApi(this.dg.usuario.codUsuario)
        .subscribe(mt => {
          this.qtdMensagensTecnicoNaoLidas = mt.filter((msg) => { return (!msg.indLeitura) }).length;

          resolve();
        }, err => {});
    });
  }

  private carregarDadosGlobais(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.dadosGlobaisService.buscarDadosGlobaisStorage().then((dados) => {
        this.dg = dados;
        
        if (!this.dg.usuario.codTecnico) {
          reject();
          return;
        }
        
        if (!this.dg.dataHoraCadastro || this.verificarNecessidadeAtualizacao()) {
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
    limiteAtualizacao.setDate(limiteAtualizacao.getDate() - Config.INT_SINC_BD_LOCAL_DIAS);

    if (new Date(this.dg.dataHoraCadastro) < limiteAtualizacao) return true;

    return false;
  }

  public atualizarBDLocal() {
    let loading = this.loadingCtrl.create({ content: 'Aguarde...' });
    loading.present();
    
    this.tipoServicoService.buscarTipoServicosApi().subscribe(() => { 
      loading.setContent("Preparando a tabela local: Tipos de Serviço");

      this.acaoService.buscarAcoesApi().subscribe(() => { 
        loading.setContent("Preparando a tabela local: Ações");
        
        this.defeitoService.buscarDefeitosApi().subscribe(() => { 
          loading.setContent("Preparando a tabela local: Defeitos");

          this.causaService.buscarCausasApi().subscribe(() => { 
            loading.setContent("Preparando a tabela local: Causas");

            this.pecaService.buscarPecasApi().subscribe(() => {
              loading.setContent("Preparando a tabela local: Peças");

              this.equipamentoPOSService.buscarEquipamentosPOSApi().subscribe(() => {
                loading.setContent("Preparando a tabela local: Equipamentos POS");

                this.operadoraTelefonicaService.buscarOperadorasApi().subscribe(() => {
                  loading.setContent("Preparando a tabela local: Operadoras");

                  this.tipoComunicacaoService.buscarTiposComunicacaoApi().subscribe(() => {
                    loading.setContent("Preparando a tabela local: Tipos de Comunicação");

                    this.motivoComunicacaoService.buscarMotivosComunicacaoPOSApi().subscribe(() => {
                      loading.setContent("Preparando a tabela local: Motivos de Comunicação");
                      
                      //this.equipamentoCausaService.buscarEquipamentosCausasApi().subscribe(() => {
                        //loading.setContent("Preparando a tabela local: Equipamentos e Causas. Este processo pode levar até 2 minutos. Favor não encerrar a aplicacão");  

                        loading.dismiss();
                    
                        this.salvarDadosGlobais();
                      //}, err => { loading.dismiss() });
                    }, err => { loading.dismiss() });
                  }, err => { loading.dismiss() });
                }, err => { loading.dismiss() });
              }, err => { loading.dismiss() });
            }, err => { loading.dismiss() });
          }, err => { loading.dismiss() });
        }, err => { loading.dismiss() });
      }, err => { loading.dismiss() });
    }, err => { loading.dismiss() });
  }

  private salvarDadosGlobais() {
    this.dg.dataHoraCadastro = new Date().toString();

    this.dadosGlobaisService.insereDadosGlobaisStorage(this.dg);
  }

  private carregarLaudos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.laudoService.buscarLaudosApi(this.dg.usuario.codTecnico)
        .subscribe(laudos => {
          this.laudos = laudos;

          resolve(laudos);
        }, err => {});
    });
  }

  private carregarVersaoApp(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.appVersion.getVersionNumber().then((versaoApp) => {
        this.dadosGlobaisService.buscarUltimaVersaoApp({
          versao: versaoApp, usuario: this.dg.usuario
        }).subscribe(versaoAppMaisRecente => {
          if (versaoAppMaisRecente) {
            if (versaoApp >= versaoAppMaisRecente) {
              this.versaoAppAtualizada = true;
            } else {
              this.versaoAppAtualizada = false;
            }
          }

          resolve();
        }, err => {});
      }).catch((err) => {});
    });
  }

  public abrirAplicativoNaLojaGoogle() {
    this.market.open(Config.GOOGLE_PLAY_NOME_APP);
  }

  private verificarNecessidadeRegistroPontoIntervalo(): Promise<any> {
    return new Promise((resolve, reject) => {
      let diff = moment.duration(moment().diff(moment(this.usuarioPonto.registros[0]))).asMinutes();

      if (this.usuarioPonto.registros.length == 1 && diff > 270) {
        this.necessidadeRegistrarIntervalo = true;
      }

      resolve();
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
}