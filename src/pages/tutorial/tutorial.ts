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
        description: `Os equipamentos agora apresentarão apenas as causas configuradas pelo STN. `,
        image: "assets/imgs/teller.png",
      },
      {
        title: "Defeitos e Ações",
        description: `Os defeitos e as ações serão apresentados de acordo com cada causa, também 
                      configurados pela equipe de STN. `,
        image: "assets/imgs/plugin.png",
      }
    ];
  }

  public telaLogin() {
    this.navCtrl.push(LoginPage);
  }
}