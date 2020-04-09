import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { Config } from '../../models/config';


@Component({
  templateUrl: 'tutorial.html'
})
export class TutorialPage {
  versao: string;
  slides: any;

  constructor(
      private navCtrl: NavController,
      private menuCtrl: MenuController
  ) {}

  ngOnInit() {
    this.menuCtrl.enable(false);
    this.versao = Config.VERSAO_APP;
    this.slides = [
      {
        title: "Assinatura",
        description: `Na versão <b>${this.versao}</b> você e o cliente poderão assinar o RAT. `,
        image: "assets/imgs/form.png",
      },
      {
        title: "Equipamentos",
        description: `A partir de agora, o App permitirá incluir somente causas/periféricos relacionados ao equipamento.
                      Essa configuração é realizada no momento que o equipamento é cadastrado, ou seja, se houver alguma
                      anormalidade de cadastro, entre em contato com o Suporte Técnico Nacional.`,
        image: "assets/imgs/teller.png",
      },
      {
        title: "Defeitos e Ações",
        description: `A partir de agora, o App permitirá incluir somente defeitos e ações devidamente relacionadas 
                      às causas/periféricos. Isso garantirá que o usuário não registre, por exemplo, uma ação de "ajuste"
                      no periférico "dispensador de cédulas". Essa configuração dos critérios aceitos na inclusão dos 
                      detalhes do RAT, é realizada pelo Suporte Técnico Nacional.`,
        image: "assets/imgs/plugin.png",
      }
    ];
  }

  public telaLogin() {
    this.navCtrl.push(LoginPage);
  }
}