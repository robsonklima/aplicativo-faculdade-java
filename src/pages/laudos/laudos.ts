import { Component } from '@angular/core';
import { Laudo } from '../../models/laudo';
import { NavParams, NavController, LoadingController } from 'ionic-angular';
import { LaudoPage } from './laudo';
import { LaudoService } from '../../services/laudo';
import { DadosGlobais } from '../../models/dados-globais';
import { DadosGlobaisService } from '../../services/dados-globais';

@Component({
  selector: 'laudos-page',
  templateUrl: 'laudos.html'
})
export class LaudosPage {
  laudos: Laudo[] = [];
  dg: DadosGlobais;

  constructor(
    private navParams: NavParams,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private dadosGlobaisService: DadosGlobaisService,
    private laudoService: LaudoService
  ) {
    this.laudos = this.navParams.get('laudos');
  }

  ionViewWillEnter() {
    this.carregarDadosGlobais().catch(() => {});
  }

  public telaLaudo(laudo: Laudo) {
    this.navCtrl.push(LaudoPage, { laudo: laudo});
  }

  private carregarDadosGlobais(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.dadosGlobaisService.buscarDadosGlobaisStorage().then((dados) => {
        this.dg = dados;

        resolve(true);
      })
      .catch((err) => { reject(false) });
    });
  }

  public carregarLaudos(): Promise<any> {
    return new Promise((resolve, reject) => {
      const loader = this.loadingCtrl.create({
        content: 'Carregando Laudos...',
        enableBackdropDismiss: true,
        dismissOnPageChange: true
      });
      loader.present();

      this.laudoService.buscarLaudosApi(this.dg.usuario.codTecnico)
        .subscribe(laudos => {
          this.laudos = laudos;
          loader.dismiss();

          resolve(laudos);
        }, err => {
          loader.dismiss()
        });
    });
  }
}