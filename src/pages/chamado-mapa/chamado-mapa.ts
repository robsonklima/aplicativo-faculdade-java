import { Component } from '@angular/core';
import { NavParams, Platform, ToastController, ViewController } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';

import { Config } from "../../config/config";
import { GeolocationService } from "../../services/geo-location";
import { Chamado } from './../../models/chamado';
import { Marker } from './../../interfaces/marker';

@Component({
  selector: 'chamado-mapa-page',
  templateUrl: 'chamado-mapa.html'
})
export class ChamadoMapaPage {
    latitude: number = -29.851740;
    longitude: number = -50.992004;
    chamado: Chamado;
    markers: Marker[] = [];
    zoom: number = 9;

  constructor(
    private platform: Platform,
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private geolocationService: GeolocationService,
    private geolocation: Geolocation
  ) {
    this.chamado = this.navParams.get('chamado');
  }

  ionViewWillEnter() {
    this.carregarMapa();
  }

  private carregarMapa() {
    this.platform.ready()
      .then(() => {
        this.geolocation.getCurrentPosition(Config.POS_CONFIG)
          .then((pos) => {
          this.latitude = pos.coords.latitude;
          this.longitude = pos.coords.longitude;

          this.adicionaMarcadorTecnico();

          this.geolocationService.buscarCoordenadasPorEndereco(this.chamado.localAtendimento.endereco)
            .subscribe((geo) => {
            if (geo.status == "OK") {
              this.chamado.localAtendimento.localizacao.latitude = geo.results[0].geometry.location.lat;
              this.chamado.localAtendimento.localizacao.longitude = geo.results[0].geometry.location.lng;
              this.chamado.localAtendimento.enderecoFormatado = geo.results[0].formatted_address;
            }

            this.adicionaMarcadorChamado();

            
            this.geolocationService.buscarDistanciaDuracao(
              this.latitude, 
              this.longitude, 
              this.chamado.localAtendimento.localizacao.latitude, 
              this.chamado.localAtendimento.localizacao.longitude
              ).subscribe((matrix) => {
                if (matrix.status == "OK" && matrix.rows[0].elements[0].status == "OK") {
                  this.chamado.localAtendimento.distancia = matrix.rows[0].elements[0].distance.text;
                  this.chamado.localAtendimento.distanciaEmMetros = matrix.rows[0].elements[0].distance.value;
                  this.chamado.localAtendimento.duracao = matrix.rows[0].elements[0].duration.text;
                  this.chamado.localAtendimento.duracaoEmSegundos = matrix.rows[0].elements[0].duration.value;
                }
              }, err => {
                this.exibirToast('Não foi possível obter sua localização')
                  .then(() => { this.fecharModal() })
                  .catch();
              });
            }, err => {
              this.exibirToast('Não foi possível obter sua localização')
                .then(() => { this.fecharModal() })
                .catch();
            });
          }).catch((err) => {
            this.exibirToast('Não foi possível obter sua localização')
              .then(() => { this.fecharModal() })
              .catch();
          });
      })
      .catch(() => {
        this.exibirToast('O dispositivo não respondeu')
          .then(() => { this.fecharModal(); })
          .catch();
      });
  }

  private adicionaMarcadorTecnico() {
    this.markers.push({
      lat: Number(this.latitude),
      lng: Number(this.longitude),
      label: "T",
      title: "Minha Localização",
      subtitle: "",
      draggable: false,
      iconUrl: ""
    });
  }

  private adicionaMarcadorChamado() {
    this.markers.push({
      lat: Number(this.chamado.localAtendimento.localizacao.latitude),
      lng: Number(this.chamado.localAtendimento.localizacao.longitude),
      label: "L",
      title: this.chamado.codOs.toString(),
      subtitle: this.chamado.localAtendimento.endereco,
      draggable: false,
      iconUrl: ""
    });
  }

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: 2000, position: 'bottom'
      });

      resolve(toast.present());
    });
  }

  fecharModal() {
    this.viewCtrl.dismiss();
  }
}