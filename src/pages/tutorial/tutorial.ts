import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';

import { LoginPage } from '../login/login';


@Component({
  templateUrl: 'tutorial.html'
})
export class TutorialPage {
  constructor(
      private navCtrl: NavController,
      private menuCtrl: MenuController
  ) {}

  slides = [
    {
      title: "Bem-vindo!",
      description: `O <b>App Técnicos</b> é um aplicativo para dispositivos móveis que possui 
                    suporte em múltiplas plataformas.`,
      image: "assets/imgs/ica-slidebox-img-1.png",
    },
    {
      title: "Para que serve?",
      description: `O <b>software</b> foi desenvolvido para automatizar a coleta 
                    de informações dos atendimentos técnicos aos terminais bancários da empresa <b>Perto</b>.`,
      image: "assets/imgs/ica-slidebox-img-2.png",
    },
    {
      title: "Quem mantém?",
      description: `O algoritmo é desenvolvido e mantido pela <b>Equipe SAT</b>, 
                    um time de desenvolvimento que faz parte da empresa Perto.`,
      image: "assets/imgs/ica-slidebox-img-3.png",
    }
  ];

  ngOnInit() {
    this.menuCtrl.enable(false);
  }

  public telaLogin() {
    this.navCtrl.push(LoginPage);
  }
}