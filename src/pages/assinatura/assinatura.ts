import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { HomePage } from '../home/home';
import { ScreenOrientation } from '@ionic-native/screen-orientation';


@Component({
  selector: 'assinatura-page',
  templateUrl: 'assinatura.html',
})
export class AssinaturaPage {
  @ViewChild(SignaturePad) public signaturePad: SignaturePad;

  public signaturePadOptions: Object = {
    'minWidth': 2,
    'canvasWidth': 340,
    'canvasHeight': 200
  };
  public signatureImage: string;

  constructor(
    private navCtrl: NavController,
    private screenOrientation: ScreenOrientation
  ) {}

  ionViewWillEnter() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT).then(() => {}).catch(() => {})
  }

  drawCancel() {
    this.navCtrl.push(HomePage);
  }

  drawComplete() {
    this.signatureImage = this.signaturePad.toDataURL();
    this.navCtrl.push(HomePage, { signatureImage: this.signatureImage });
  }

  drawClear() {
    this.signaturePad.clear();
  }

  ionViewWillLeave() {
    this.screenOrientation.unlock;
  }
}