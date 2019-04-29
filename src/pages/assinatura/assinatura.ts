import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { HomePage } from '../home/home';


@Component({
  selector: 'assinatura-page',
  templateUrl: 'assinatura.html',
})
export class AssinaturaPage {
  @ViewChild(SignaturePad) public signaturePad: SignaturePad;

  public signaturePadOptions: Object = {
    'minWidth': 2,
    'canvasWidth': 320,
    'canvasHeight': 200
  };
  public signatureImage: string;

  constructor(
    private navCtrl: NavController
  ) {}

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
}