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
        title: "Sincronização",
        description: `Criamos um novo sistema de sincronização de chamados na versão 
        <b>` + this.versao + `</b>. Agora o sistema está muito mais preciso durante o processo 
        de envio e recebimento de chamados.`,
        image: "assets/imgs/refresh.png",
      },
      {
        title: "Lista de Chamados",
        description: `A tela de listagem de chamados mudou! Adicionamos os chamados fechados,
        e agora você poderá acompanhar os chamados que estão na lista de sincronização.`,
        image: "assets/imgs/list.png",
      },
      {
        title: "Equipamentos POS",
        description: `Esta versão contém uma nova lâmina nos detalhes do <b>chamado</b>, que deverá ser preenchida  
                      quando você estiver atendendo um equipamento <b>POS</b>.`,
        image: "assets/imgs/mcom.png",
      },
      {
        title: "Novos Mapas",
        description: `Adicionamos novos mapas para você! Visualize seus <b>chamados no mapa</b>, verifique
                      a <b>distância percorrida</b> e o <b>tempo de duração</b> do seu percurso!`,
        image: "assets/imgs/maps-icon-8223.png",
      },
      // {
      //   title: "Ferramentas!",
      //   description: `Agora você poderá informar ao seu coordenador as <b>ferramentas</b> que possui! 
      //                 Assim, o seu líder o manterá sempre preparado! `,
      //   image: "assets/imgs/briefcase.png",
      // },
      {
        title: "Detalhes do RAT",
        description: `A partir de agora, o algoritmo compreende quais causas cada equipamento possui e quais defeitos e ações cada causa contém! 
                      Deste modo, otimizaremos o seu tempo!`,
        image: "assets/imgs/atm.png",
      }
    ];
  }

  public telaLogin() {
    this.navCtrl.push(LoginPage);
  }
}