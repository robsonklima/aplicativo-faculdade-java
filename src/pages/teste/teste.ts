import { Component } from '@angular/core';
import { MensagemTecnicoService } from '../../services/mensagem-tecnico';


@Component({
  selector: 'teste-page',
  templateUrl: 'teste.html'
})
export class TestePage {
  
  constructor(
    private mensagemService: MensagemTecnicoService
  ) {}

  ionViewWillEnter() {
    this.mensagemService.buscarMensagensTecnicoApi(1153+'').subscribe(() => {}, e => {})
  }
}