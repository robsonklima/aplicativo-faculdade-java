import { Component } from '@angular/core';

import { LogService } from '../../services/log';
import { Log } from '../../models/log';
import { LoadingController, AlertController, ViewController } from 'ionic-angular';
import { Config } from '../../models/config';


@Component({
  selector: 'logs-page',
  template: `
    <ion-header>
      <ion-navbar>
        <ion-title>Logs do Aplicativo</ion-title>

        <ion-buttons end>
          <button 
            ion-button 
            icon-only 
            (click)="apagarLogs()"
            [disabled]="!logs?.length">
            <ion-icon name="trash"></ion-icon>
          </button>

          <button 
            ion-button 
            icon-only 
            (click)="enviarLogs()"
            [disabled]="!logs?.length">
            <ion-icon name="md-cloud-upload"></ion-icon>
          </button>

          <button 
            ion-button 
            icon-only 
            (click)="fecharModal()">
            <ion-icon name="close"></ion-icon>
          </button>
        </ion-buttons>
      </ion-navbar>
    </ion-header>

    <ion-content class="cards-bg">
      <ion-list>
        <ion-item *ngFor="let log of logs" text-wrap>
          <p class="small" [ngClass]="{ 'font-green': log.tipo == 'SUCCESS', 'font-red': log.tipo == 'ERROR', 'font-orange': log.tipo == 'WARNING' }"><b>{{ log?.dataHoraCad }} - {{ log?.tipo }}</b></p>
          <p class="tiny"><i>{{ log?.mensagem }}</i></p>
        </ion-item>
      </ion-list>

      <ion-card padding text-center *ngIf="!logs?.length">
        <p>Nenhum log encontrado</p>
      </ion-card>
    </ion-content>
  `
})
export class LogsPage {
  logs: Log[] = [];
  
  constructor(
    private logService: LogService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private viewCtrl: ViewController
  ) {}

  ionViewWillEnter() {
    this.logService.buscarLogs().then((logs) => {
      this.logs = logs;
    });
  }

  public apagarLogs() {
    const confirmacao = this.alertCtrl.create({
      title: Config.MSG.CONFIRMACAO,
      message: Config.MSG.REMOVER_OS_LOGS,
      buttons: [
        {
          text: Config.MSG.CANCELAR,
          handler: () => {}
        },
        {
          text: Config.MSG.CONFIRMAR,
          handler: () => {
            const loading = this.loadingCtrl.create({ content: Config.MSG.AGUARDE });
            loading.present();
        
            this.logService.apagarLogs().then(() => {
              this.logs = [];
              loading.dismiss();
            }).catch(() => {
              loading.dismiss();
            });
          }
        }
      ]
    });

    confirmacao.present();
  }

  public enviarLogs() {
    const loading = this.loadingCtrl.create({ content: Config.MSG.ENVIANDO_LOGS });
    loading.present();

    this.logService.enviarLogsApi().subscribe(() => {
      loading.dismiss();
    }, e => {
      loading.dismiss();
    });
  }

  public fecharModal() {
    this.viewCtrl.dismiss();
  }
}