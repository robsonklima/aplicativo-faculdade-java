import { Component  } from '@angular/core';
import { NavController, NavParams, Platform, ToastController } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';

import { Config } from "../../config/config";
import { Marker } from "../../interfaces/marker";
import { Chamado } from "../../models/chamado";
import { GeolocationService } from "../../services/geo-location";

@Component({
  selector: 'chamados-mapa-page',
  templateUrl: 'chamados-mapa.html'
})
export class ChamadosMapaPage {
  markers: Marker[] = []
  chamados: Chamado[];
  zoom: number = 8;
  lat: number = -29.851740;
  lng: number = -50.992004;

  constructor(
    private platform: Platform,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private geolocationService: GeolocationService,
    private geolocation: Geolocation
  ) {
    this.chamados = this.navParams.get('chamados');
    this.carregarMapa();
  }

  private carregarMapa() {
    this.platform.ready()
      .then(() => {
        this.geolocation.getCurrentPosition(Config.POS_CONFIG)
          .then((pos) => {
          this.lat = pos.coords.latitude;
          this.lng = pos.coords.longitude;

          this.adicionaMarcadorTecnico();

          this.chamados.forEach((chamado, i) => {
            this.geolocationService.buscarCoordenadasPorEndereco(chamado.localAtendimento.endereco)
              .subscribe((geo) => {
              if (geo.status == "OK") {
                chamado.localAtendimento.localizacao.latitude = geo.results[0].geometry.location.lat;
                chamado.localAtendimento.localizacao.longitude = geo.results[0].geometry.location.lng;

                this.adicionaMarcadorChamado(chamado, i);
              }

              this.geolocationService.buscarDistanciaDuracao(
                pos.coords.latitude, 
                pos.coords.longitude, 
                chamado.localAtendimento.localizacao.latitude, 
                chamado.localAtendimento.localizacao.longitude
                ).subscribe((matrix) => {
                  if (matrix.status == "OK" && matrix.rows[0].elements[0].status == "OK") {
                    chamado.localAtendimento.distancia = matrix.rows[0].elements[0].distance.text;
                    chamado.localAtendimento.distanciaEmMetros = matrix.rows[0].elements[0].distance.value;
                    chamado.localAtendimento.duracao = matrix.rows[0].elements[0].duration.text;
                    chamado.localAtendimento.duracaoEmSegundos = matrix.rows[0].elements[0].duration.value;
                  }
              }, err => {
                this.exibirToast('Não foi possível obter a distância e duração')
                  .then(() => { 
                    this.navCtrl.pop(); 
                  })
                  .catch();
              });
            }, err => {
              this.exibirToast('Não foi possível obter as coordenadas')
                .then(() => { 
                  this.navCtrl.pop(); 
                })
                .catch();
            });
          });
        }).catch((err) => {
          this.exibirToast('Não foi possível obter sua localização')
            .then(() => { this.navCtrl.pop(); })
            .catch();
        });
    })
    .catch(() => {
      this.exibirToast('O dispositivo não respondeu')
        .then(() => { this.navCtrl.pop(); })
        .catch();
    });
  }
  
  private adicionaMarcadorChamado(chamado, i) {
    this.markers.push({
      lat: Number(chamado.localAtendimento.localizacao.latitude),
      lng: Number(chamado.localAtendimento.localizacao.longitude),
      label: (i + 1).toString(),
      title: chamado.codOs.toString(),
      subtitle: chamado.localAtendimento.endereco,
      draggable: false,
      iconUrl: ""
    })
  }

  private adicionaMarcadorTecnico() {
    this.markers.push({
      lat: Number(this.lat),
      lng: Number(this.lng),
      label: "T",
      title: "Minha Localização",
      subtitle: "",
      draggable: false,
      iconUrl: ""
    })
  }

  clickedMarker(label: string, index: number) {}

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: 2000, position: 'bottom'
      });

      resolve(toast.present());
    });
  }
}