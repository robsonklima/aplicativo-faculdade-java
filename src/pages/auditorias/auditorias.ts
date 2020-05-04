import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuditoriaPage } from './auditoria';


@Component({
  selector: 'auditorias-page',
  templateUrl: 'auditorias.html'
})
export class AuditoriasPage {
  constructor(
    private navCtrl: NavController
  ) {}

  public telaAuditoria() {
    this.navCtrl.push(AuditoriaPage);
  }
}