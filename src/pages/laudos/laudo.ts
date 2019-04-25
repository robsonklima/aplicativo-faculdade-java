import { Component, ViewChild } from '@angular/core';
import { NavParams, Slides } from 'ionic-angular';
import { ChamadoService } from '../../services/chamado';
import { Laudo } from '../../models/laudo';
import { Chamado } from '../../models/chamado';

@Component({
  selector: 'laudo-page',
  templateUrl: 'laudo.html'
})
export class LaudoPage {
  @ViewChild(Slides) slides: Slides;
  tituloSlide: string;
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

  ionViewWillEnter() {
    this.configurarSlide(this.slides.getActiveIndex());
  }

  private carregarChamado(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.chamadoService.buscarChamadoApi(this.laudo.codOS).subscribe(chamado => {
        this.chamado = chamado;

        resolve(chamado);
      }, err => {});
    });
  }

  public alterarSlide() {
    this.configurarSlide(this.slides.getActiveIndex());
  }

  private configurarSlide(i: number) {
    switch (i) {
      case 0:
        this.tituloSlide = (i + 1) + ". " + "Informações";
        //this.slides.lockSwipeToPrev(true);
        //this.slides.lockSwipeToNext(false);
        break;

      case 1:
        this.tituloSlide = (i + 1) + ". " + "Roteiro de Análise";
        break;

      case 2:
        this.tituloSlide = (i + 1) + ". " + "Fotos";
        break;
    }
  }
}