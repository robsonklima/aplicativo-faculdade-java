import { Component } from '@angular/core';

import { LogService } from '../../services/log';
import { Log } from '../../models/log';


@Component({
  selector: 'logs-page',
  template: `
    <ion-header>
      <ion-navbar>
        <ion-title>Logs do Aplicativo</ion-title>

        <ion-buttons end>
          <button 
            [disabled]="true"
            ion-button 
            icon-only 
            (click)="funcao()">
            <ion-icon name="md-cloud-upload"></ion-icon>
          </button>
        </ion-buttons>
      </ion-navbar>
    </ion-header>

    <ion-content>
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
    private logService: LogService
  ) {}

  ionViewWillEnter() {
    this.logs = this.logService.buscarLogs();
  }
}