import { Component } from '@angular/core';
import { NavParams, ViewController, AlertController, Platform, ToastController } from 'ionic-angular';

import { Camera } from '@ionic-native/camera';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Diagnostic } from '@ionic-native/diagnostic';

import { Laudo } from '../../models/laudo';
import { Foto } from '../../models/foto';

import moment from 'moment';
import { LaudoSituacao } from '../../models/laudo-situacao';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'situacao-page',
  templateUrl: 'situacao.html'
})
export class SituacaoPage {
  laudo: Laudo;
  situacao: LaudoSituacao;
  foto: Foto;
  qtdFotosLaudo: number;

  constructor(
    private diagnostic: Diagnostic,
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private camera: Camera,
    private platform: Platform,
    private toastCtrl: ToastController,
    private androidPermissions: AndroidPermissions,
  ) {
    this.laudo = this.navParams.get('laudo');

    platform.ready().then(() => {
      androidPermissions.requestPermissions([androidPermissions.PERMISSION.CAMERA]);
    });
  }

  ionViewWillEnter() {
    this.situacao = new LaudoSituacao();
    this.situacao.fotos = [];
    this.obterQtdFotosLaudo();
  }

  public criarSituacao(form: NgForm) {
    this.situacao.causa = form.value.causa;
    this.situacao.acao = form.value.acao;

    this.laudo.situacoes.push(this.situacao);
    this.fecharModal()
  }

  public selecionarFoto(sourceType: number) {
    if (!this.platform.is('cordova')) return;

    this.platform.ready().then(() => {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(result => {
        this.obterPermissaoCamera().then(() => {
          this.androidPermissions.requestPermissions([
            this.androidPermissions.PERMISSION.CAMERA, 
            this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, 
            this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
          ]).then(() => {
            this.camera.getPicture({
              quality: 80,
              targetWidth: 720,
              targetHeight: 960,
              destinationType: this.camera.DestinationType.DATA_URL,
              encodingType: this.camera.EncodingType.JPEG,
              mediaType: this.camera.MediaType.PICTURE,
              saveToPhotoAlbum: false,
              sourceType: 1
            }).then(imageData => {
              this.foto = new Foto();
              this.foto.nome = moment().format('YYYYMMDDHHmmss') + '_' + this.laudo.codOS + '_LAUDO';
              this.foto.str = 'data:image/jpeg;base64,' + imageData;
              this.foto.modalidade = "LAUDO_SIT_" + (this.laudo.situacoes.length + 1);
              this.situacao.fotos.push(this.foto);
              this.qtdFotosLaudo = this.qtdFotosLaudo + 1;
              this.camera.cleanup();
            }).catch(e => {});
          }).catch(e => {});
        }).catch(e => {});
      }).catch(e => {});
    }).catch(e => {});
  }

  private obterPermissaoCamera(): Promise<any>  {
    return new Promise((resolve, reject) => {
      this.platform.ready().then(() => {
        this.diagnostic.getPermissionAuthorizationStatus(this.diagnostic.permission.CAMERA).then((cameraStatus) => {
          this.diagnostic.getPermissionAuthorizationStatus(this.diagnostic.permission.READ_EXTERNAL_STORAGE).then((readStatus) => {
            this.diagnostic.getPermissionAuthorizationStatus(this.diagnostic.permission.WRITE_EXTERNAL_STORAGE).then((writeStatus) => {
              //alert(`AuthorizationStatus`);
              //alert(status);
              if (cameraStatus != this.diagnostic.permissionStatus.GRANTED || readStatus != this.diagnostic.permissionStatus.GRANTED || writeStatus != this.diagnostic.permissionStatus.GRANTED) {
                this.diagnostic.requestRuntimePermission([
                  this.diagnostic.permission.CAMERA, 
                  this.diagnostic.permission.READ_EXTERNAL_STORAGE,
                  this.diagnostic.permission.WRITE_EXTERNAL_STORAGE
                ]).then((data) => {
                  //alert(`getCameraAuthorizationStatus`);
                  //alert(data);
                  resolve();
                })
              } else {
                //alert("We have the permission");
                resolve();
              }
            }, (statusError) => {
              //alert(`statusError`);
              //alert(statusError);
              reject();
            });
          }).catch(e => { reject() });
        }).catch(e => { reject() });
      }).catch(e => { reject() });
    });
  }

  public removerFoto(i: number) {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja excluir esta foto?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.situacao.fotos.splice(i, 1);
          }
        }
      ]
    });

    confirmacao.present();
  }

  private obterQtdFotosLaudo() {
    this.qtdFotosLaudo = 0;

    this.laudo.situacoes.forEach(situacao => {
      this.qtdFotosLaudo = this.qtdFotosLaudo + situacao.fotos.length;
    });
  }

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: 3000, position: 'bottom'
      });

      resolve(toast.present());
    });
  }

  public fecharModal() {
    this.viewCtrl.dismiss(this.laudo);
  }
}