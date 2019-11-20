import { Component } from '@angular/core';
import { DadosGlobais } from '../../models/dados-globais';
import { DadosGlobaisService } from '../../services/dados-globais';
import { FerramentaTecnico } from '../../models/ferramenta-tecnico';
import { FerramentaTecnicoService } from '../../services/ferramenta-tecnico';


@Component({
  selector: 'ferramentas-tecnico-page',
  template: `
    <ion-header>
      <ion-navbar>
        <ion-title>Ferramentas</ion-title>
      </ion-navbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-list-header>
          Selecione as ferramentas que você possui <br />
          <i ion-text color="primary">Ferramentas não marcadas serão tratadas pelo coordenador</i>
        </ion-list-header>

        <ion-item *ngFor="let ferramenta of ferramentasTecnico">
          <ion-toggle checked="false"></ion-toggle>

          <ion-label>
            {{ ferramenta?.nomeFerramentaTecnico }}
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class FerramentasTecnicoPage {
  dg: DadosGlobais;
  ferramentasTecnico: FerramentaTecnico[] = [];

  constructor(
    private dadosGlobaisService: DadosGlobaisService,
    private ferramentaTecnicoService: FerramentaTecnicoService
  ) {}

  ionViewWillEnter() {
    this.carregarDadosGlobais()
      .then(() => this.buscarFerramentasTecnico())
      .catch(() => {});
  }

  private carregarDadosGlobais(): Promise<DadosGlobais> {
    return new Promise((resolve, reject) => {
      this.dadosGlobaisService.buscarDadosGlobaisStorage()
        .then((dados) => {
          if (dados)
            this.dg = dados;
            resolve(dados);
        })
        .catch((err) => {
          reject(new Error(err.message))
        });
    });
  }

  public buscarFerramentasTecnico(): Promise<FerramentaTecnico[]> {
    return new Promise((resolve, reject) => {
      this.ferramentaTecnicoService.buscarFerramentasTecnicoStorage().then((ferramentas: FerramentaTecnico[]) => { 
        this.ferramentasTecnico = ferramentas;

        resolve(ferramentas);
      }).catch(err => {
        reject(err);
      });
    });
  }
}