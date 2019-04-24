import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { ChamadoService } from '../../services/chamado';
import { Laudo } from '../../models/laudo';
import { Chamado } from '../../models/chamado';

@Component({
  selector: 'laudo-page',
  templateUrl: 'laudo.html'
})
export class LaudoPage {
  laudo: Laudo;
  chamado: Chamado;

  constructor(
    private navParams: NavParams,
    private chamadoService: ChamadoService
  ) {
    this.laudo = this.navParams.get('laudo');
  }

  ionViewDidLoad() {
    this.carregarChamado();
  }

  private carregarChamado(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.chamadoService.buscarChamadoApi(this.laudo.codOS).subscribe(chamado => {
        this.chamado = chamado;

        resolve(chamado);
      }, err => {});
    });
  }
}