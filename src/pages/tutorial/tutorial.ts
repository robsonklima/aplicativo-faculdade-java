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
        title: "Deslocamento",
        description: `Na versão <b>${this.versao}</b> você poderá informar que está em deslocamento
                      para o local de atendimento. `,
        image: "assets/imgs/late.png",
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
        title: "Mapas",
        description: `Agora ao clicar no icone de <b>navegação</b> você poderá selecionar rapidamente o aplicativo
                      de mapas que deseja utilizar (Waze, Maps etc.)`,
        image: "assets/imgs/maps-icon-8223.png",
      }
    ];
  }

  public telaLogin() {
    this.navCtrl.push(LoginPage);
  }
}