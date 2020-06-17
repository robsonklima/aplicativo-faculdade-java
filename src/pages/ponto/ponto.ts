import { Component } from '@angular/core';
import { PontoData } from '../../models/ponto-data';
import { NavParams, AlertController, ToastController, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import moment from 'moment';
import { PontoUsuarioService } from '../../services/ponto-usuario';
import { Config } from '../../models/config';
import { PontoUsuario } from '../../models/ponto-usuario';
import { DadosGlobaisService } from '../../services/dados-globais';
import { DadosGlobais } from '../../models/dados-globais';


@Component({
  selector: 'ponto-page',
  templateUrl: 'ponto.html'
})
export class PontoPage {
  dg: DadosGlobais;
  pontoData: PontoData;

  constructor(
    private navParams: NavParams,
    private platform: Platform,
    private geolocation: Geolocation,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private dadosGlobaisService: DadosGlobaisService,
    private pontoUsuarioService: PontoUsuarioService
  ) {
    this.pontoData = this.navParams.get('pontoData');
  }

  ngOnInit() {
    this.carregarDadosGlobais().then(() => {
      this.pontoData.pontosUsuario = this.pontoData.pontosUsuario.sort(function(a,b) { return (a.dataHoraRegistro > b.dataHoraRegistro) ? 1 : ((b.dataHoraRegistro > a.dataHoraRegistro) ? -1 : 0)}); 
    }).catch(() => {});
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
              
              this.pontoData.pontosUsuario = this.pontoData.pontosUsuario.filter((p) => {
                return (p.codPontoUsuario != codPontoUsuario);
              });
            }, er => {
              this.exibirToast(`Erro ao deletar o registro: ${er}.`, Config.TOAST.ERROR);
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
      message: "Digite o horário da marcação de ponto",
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

                pontoUsuario.dataHoraRegistro = `${this.pontoData.dataRegistro} ${data.ponto}`;
                pontoUsuario.codUsuario = this.dg.usuario.codUsuario;
                pontoUsuario.latitude = location.coords.latitude;
                pontoUsuario.longitude = location.coords.longitude;
                pontosUsuario.push(pontoUsuario);
                
                this.pontoUsuarioService.enviarPontosUsuarioApi(pontoUsuario).subscribe(() => {
                  this.exibirToast('Ponto registrado com sucesso!', Config.TOAST.SUCCESS);
                  this.pontoData.pontosUsuario.push(pontoUsuario);
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