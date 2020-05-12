import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';

import { AuditoriaPage } from './auditoria';
import { Auditoria } from '../../models/auditoria';

import { AuditoriaService } from '../../services/auditoria';
import { DadosGlobaisService } from '../../services/dados-globais';
import { DadosGlobais } from '../../models/dados-globais';


@Component({
  selector: 'auditorias-page',
  templateUrl: 'auditorias.html'
})
export class AuditoriasPage {
  dg: DadosGlobais;
  auditorias: Auditoria[] = [];

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private auditoriaService: AuditoriaService,
    private dgService: DadosGlobaisService
  ) {}

  ngOnInit() {
    const loading = this.loadingCtrl.create({ 
      content: 'Carregando auditorias...' 
    });
    loading.present();

    this.carregarDadosGlobais()
      .then(() => this.carregarAuditorias().then(() => { loading.dismiss() }).catch(() => { loading.dismiss() }))
      .then(() => loading.dismiss()).catch(() => { loading.dismiss() });
  }

  public telaAuditoria(auditoria: Auditoria) {
    this.navCtrl.push(AuditoriaPage, { auditoria: auditoria });
  }

  private carregarDadosGlobais(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.dgService.buscarDadosGlobaisStorage().then((dados) => {
        this.dg = dados;

        resolve(true);
      })
      .catch((err) => { reject(false) });
    });
  }

  public carregarAuditorias(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.auditoriaService.buscarAuditoriasPorUsuario(this.dg.usuario.codUsuario)
        .subscribe(auditorias => {
          this.auditorias = auditorias;

          resolve();
        }, () => {
          this.exibirAlerta('Erro ao carregar as auditorias. Verifique sua conexão de internet');
          reject();
        });
    });
  }

  private exibirAlerta(msg: string) {
    const alerta = this.alertCtrl.create({
      title: 'Alerta!',
      subTitle: msg,
      buttons: ['OK']
    });

    alerta.present();
  }
}