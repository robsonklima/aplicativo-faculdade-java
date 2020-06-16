import { Component } from '@angular/core';

import { PontoUsuarioService } from '../../services/ponto-usuario';

import moment from 'moment';
import { PontoUsuario } from '../../models/ponto-usuario';
import { LoadingController, AlertController, ToastController, Platform } from 'ionic-angular';
import { DadosGlobais } from '../../models/dados-globais';
import { DadosGlobaisService } from '../../services/dados-globais';
import { Config } from '../../models/config';
import { Geolocation } from '@ionic-native/geolocation';


@Component({
  selector: 'ponto-page',
  templateUrl: 'ponto.html'
})
export class PontoPage {
  dg: DadosGlobais;
  dataAtual: any;
  dataAtualFormatada: any;
  dataSelecionada: any;
  dataSelecionadaFormatada: string;
  pontosUsuario: PontoUsuario[] = [];
  pontosUsuarioDataSelecionada: PontoUsuario[] = [];

  constructor(
    private pontoUsuarioService: PontoUsuarioService,
    private dadosGlobaisService: DadosGlobaisService,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private geolocation: Geolocation,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.carregarDadosGlobais()
      .then(() => this.carregarPontosUsuario(null))
      .catch(() => {});

    this.dataAtual = moment();
    this.dataAtualFormatada = this.dataAtual.format('DD/MM/YYYY');
  }

  private carregarDadosGlobais(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.dadosGlobaisService.buscarDadosGlobaisStorage().then((dados) => {
        this.dg = dados;

        if (!this.dg.usuario.codTecnico) {
          reject();
          return;
        }
        
        resolve(true);
      })
      .catch((err) => { reject(false) });
    });
  }

  public carregarPontosUsuario(refresher, verbose: boolean=true) {
    const loader = this.loadingCtrl.create({ content: "Carregando..." });
    if (verbose) loader.present();
    
    this.dataSelecionada = moment();
    this.dataSelecionadaFormatada = this.dataSelecionada.format('DD/MM/YYYY');
    
    this.pontoUsuarioService.buscarPontosPorUsuario(this.dg.usuario.codUsuario).subscribe((pontosUsuario: PontoUsuario[]) => {
      this.pontosUsuario = pontosUsuario;
      this.atualizarPontosDataSelecionada();
      if (verbose) loader.dismiss();
      if (refresher) refresher.complete();
    }, e => {
      this.exibirToast('Não foi possível carregar os registros.', Config.TOAST.ERROR);
      if (verbose) loader.dismiss();
      if (refresher) refresher.complete();
    })
  }

  public selecionarData(e: any) {
    this.dataSelecionada = moment().year(e.year).month(e.month-1).date(e.day);
    this.dataSelecionadaFormatada = this.dataSelecionada.format('DD/MM/YYYY');
    this.atualizarPontosDataSelecionada();
  }

  private atualizarPontosDataSelecionada() {
    this.pontosUsuarioDataSelecionada = this.pontosUsuario.filter((ponto: PontoUsuario) => {
      return (moment(ponto.dataHoraRegistro).format('DD/MM/YYYY') == moment(this.dataSelecionada).format('DD/MM/YYYY'));
    });
  }

  public registrarPonto() {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: `Deseja registrar seu ponto em ${moment().format('DD/MM/YYYY HH:mm')}?`,
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {}
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.platform.ready().then(() => {
              this.geolocation.getCurrentPosition(Config.POS_CONFIG).then((location) => {
                let pontosUsuario: PontoUsuario[] = [];

                let pontoUsuario: PontoUsuario = new PontoUsuario();
                pontoUsuario.dataHoraRegistro = moment().format('YYYY-MM-DD HH:mm:ss');
                pontoUsuario.codUsuario = this.dg.usuario.codUsuario;
                pontoUsuario.latitude = location.coords.latitude;
                pontoUsuario.longitude = location.coords.longitude;

                pontosUsuario.push(pontoUsuario);

                this.pontoUsuarioService.enviarPontosUsuarioApi(pontosUsuario).subscribe(() => {
                  this.exibirToast('Ponto registrado com sucesso!', Config.TOAST.SUCCESS);
                  this.carregarPontosUsuario(false);
                }, er => {
                  this.exibirToast(`Erro ao registrar o ponto: ${er}.`, Config.TOAST.ERROR);
                });
              }).catch((er) => {
                this.exibirToast(`Erro ao registrar o ponto: ${er}.`, Config.TOAST.ERROR);
              });
            }).catch((er) => {
              this.exibirToast(`Erro ao registrar o ponto: ${er}.`, Config.TOAST.ERROR);
            });
          }
        }
      ]
    });

    confirmacao.present();
  }

  public incluirPonto() {
    const prompt = this.alertCtrl.create({
      title: 'Novo Registro',
      message: "Digite a data e horário da marcação de ponto",
      inputs: [
        {
          name: 'ponto',
          type: 'time'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {}
        },
        {
          text: 'Salvar',
          handler: data => {
            if (!data.ponto) return;

            this.platform.ready().then(() => {
              this.geolocation.getCurrentPosition(Config.POS_CONFIG).then((location) => {
                let pontosUsuario: PontoUsuario[] = [];

                let pontoUsuario: PontoUsuario = new PontoUsuario();

                pontoUsuario.dataHoraRegistro = this.dataSelecionada.format(`YYYY-MM-DD ${data.ponto}`);
                pontoUsuario.codUsuario = this.dg.usuario.codUsuario;
                pontoUsuario.latitude = location.coords.latitude;
                pontoUsuario.longitude = location.coords.longitude;
                pontosUsuario.push(pontoUsuario);
                
                this.pontoUsuarioService.enviarPontosUsuarioApi(pontosUsuario).subscribe(() => {
                  this.exibirToast('Ponto registrado com sucesso!', Config.TOAST.SUCCESS);
                  this.carregarPontosUsuario(false);
                }, er => {
                  this.exibirToast(`Erro ao registrar o ponto: ${er}.`, Config.TOAST.ERROR);
                });
              }).catch((er) => {
                this.exibirToast(`Erro ao registrar o ponto: ${er}.`, Config.TOAST.ERROR);
              });
            }).catch((er) => {
              this.exibirToast(`Erro ao registrar o ponto: ${er}.`, Config.TOAST.ERROR);
            });
          }
        }
      ]
    });
    prompt.present();
  }

  public salvarAlteracoesPonto() {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: `Deseja aplicar as alterações realizadas?`,
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {}
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.pontosUsuarioDataSelecionada.forEach((ponto, i) => {
              this.pontosUsuarioDataSelecionada[i].correcaoHabilitada = 0;
            });

            this.pontoUsuarioService.enviarPontosUsuarioApi(this.pontosUsuarioDataSelecionada).subscribe(() => {
              this.exibirToast('Registros atualizados com sucesso!', Config.TOAST.SUCCESS);
              this.carregarPontosUsuario(false);
            }, er => {
              this.exibirToast(`Erro ao atualizar os registros: ${er}.`, Config.TOAST.ERROR);
            });
          }
        }
      ]
    });

    confirmacao.present();    
  }

  public deletarPontoUsuario(codPontoUsuario: number) {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: `Deseja deletar este registro de ponto?`,
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {}
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.pontoUsuarioService.deletarPontoUsuarioApi(codPontoUsuario).subscribe(() => {
              this.exibirToast('Registro deletado com sucesso!', Config.TOAST.SUCCESS);
              this.carregarPontosUsuario(false);
            }, er => {
              this.exibirToast(`Erro ao deletar o registro: ${er}.`, Config.TOAST.ERROR);
            });
          }
        }
      ]
    });

    confirmacao.present();
  }

  private exibirToast(mensagem: string, tipo: string='info', posicao: string=null) {
    const toast = this.toastCtrl.create({
      message: mensagem, 
      duration: Config.TOAST.DURACAO, 
      position: posicao || 'bottom', 
      cssClass: 'toast-' + tipo
    });
    
    toast.present();
  }
}