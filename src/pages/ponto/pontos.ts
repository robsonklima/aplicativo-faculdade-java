import { Component } from '@angular/core';
import { Platform, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { PontoDataService } from '../../services/ponto-data';
import { DadosGlobaisService } from '../../services/dados-globais';
import moment from 'moment';
import { DadosGlobais } from '../../models/dados-globais';
import { PontoData } from '../../models/ponto-data';
import { Config } from '../../models/config';
import { Geolocation } from '@ionic-native/geolocation';


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
    private pontoDataService: PontoDataService,
    private dadosGlobaisService: DadosGlobaisService,
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

      if (verbose) loader.dismiss();
      if (refresher) refresher.complete();
    }, e => {
      this.exibirToast('Não foi possível carregar os registros.', Config.TOAST.ERROR);
      if (verbose) loader.dismiss();
      if (refresher) refresher.complete();
    })
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