import { Component } from '@angular/core';
import { Platform, LoadingController, AlertController, ToastController, NavController } from 'ionic-angular';
import { PontoDataService } from '../../services/ponto-data';
import { DadosGlobaisService } from '../../services/dados-globais';
import moment from 'moment';
import { DadosGlobais } from '../../models/dados-globais';
import { PontoData } from '../../models/ponto-data';
import { Config } from '../../models/config';
import { Geolocation } from '@ionic-native/geolocation';
import { PontoUsuario } from '../../models/ponto-usuario';
import { PontoUsuarioService } from '../../services/ponto-usuario';
import { PontoPage } from './ponto';


@Component({
  selector: 'pontos-page',
  templateUrl: 'pontos.html'
})
export class PontosPage {
  dg: DadosGlobais;
  dataAtual: any;
  dataAtualFormatada: any;
  pontosData: PontoData[] = [];

  constructor(
    private navCtrl: NavController,
    private pontoDataService: PontoDataService,
    private dadosGlobaisService: DadosGlobaisService,
    private pontoUsuarioService: PontoUsuarioService,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private geolocation: Geolocation,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.carregarDadosGlobais()
      .then(() => this.carregarDatasEPontosUsuario(null))
      .catch(() => {});

    this.dataAtual = moment();
    this.dataAtualFormatada = this.dataAtual.format('DD/MM/YYYY');
  }
  
  public telaPonto(pontoData: PontoData) {
    this.navCtrl.push(PontoPage, { pontoData: pontoData });
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

  public carregarDatasEPontosUsuario(refresher, verbose: boolean=true) {
    const loader = this.loadingCtrl.create({ content: "Carregando..." });
    if (verbose) loader.present();
     
    this.pontoDataService.buscarPontosDataPorUsuario(this.dg.usuario.codUsuario).subscribe((pontosData: PontoData[]) => {
      this.pontosData = pontosData;

      this.pontosData.forEach((data, i) => {
        this.pontosData[i].pontosUsuario = data.pontosUsuario.sort((a,b) => { 
          return (a.dataHoraRegistro > b.dataHoraRegistro) ? 1 : ((b.dataHoraRegistro > a.dataHoraRegistro) ? -1 : 0)
        }); 
      });

      if (verbose) loader.dismiss();
      if (refresher) refresher.complete();
    }, e => {
      this.exibirToast('Não foi possível carregar os registros.', Config.TOAST.ERROR);
      if (verbose) loader.dismiss();
      if (refresher) refresher.complete();
    })
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
            const loader = this.loadingCtrl.create({ content: "Carregando..." });
            loader.present();

            this.platform.ready().then(() => {
              this.geolocation.getCurrentPosition(Config.POS_CONFIG).then((location) => {
                let pontosUsuario: PontoUsuario[] = [];

                let pontoUsuario: PontoUsuario = new PontoUsuario();
                pontoUsuario.dataHoraRegistro = moment().format('YYYY-MM-DD HH:mm:ss');
                pontoUsuario.codUsuario = this.dg.usuario.codUsuario;
                pontoUsuario.latitude = location.coords.latitude;
                pontoUsuario.longitude = location.coords.longitude;
                pontoUsuario.indAtivo = 1;
                pontosUsuario.push(pontoUsuario);

                this.pontoUsuarioService.enviarPontoUsuarioApi(pontoUsuario).subscribe((pontoUsuario: PontoUsuario) => {
                  this.exibirToast('Ponto registrado com sucesso!', Config.TOAST.SUCCESS);

                  this.pontosData[0].pontosUsuario.push(pontoUsuario);

                  loader.dismiss();
                }, er => {
                  this.exibirToast(`Erro ao registrar o ponto: ${er}.`, Config.TOAST.ERROR);
                  loader.dismiss();
                });
              }).catch((er) => {
                this.exibirToast(`Erro ao registrar o ponto: ${er}.`, Config.TOAST.ERROR);
                loader.dismiss();
              });
            }).catch((er) => {
              this.exibirToast(`Erro ao registrar o ponto: ${er}.`, Config.TOAST.ERROR);
              loader.dismiss();
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