import { Component, ViewChild } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Laudo } from '../../models/laudo';


@Component({
  selector: 'assinatura-page',
  templateUrl: 'assinatura.html',
})
export class AssinaturaPage {
  paginaOrigem: string;
  laudo: Laudo;
  @ViewChild(SignaturePad) public signaturePad: SignaturePad;
  public signaturePadOptions: Object = { 'minWidth': 2, 'canvasWidth': 320, 'canvasHeight': 200 };
  public signatureImage: string;

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams
  ) {
    this.paginaOrigem = this.navParams.get('paginaOrigem');
    this.laudo = this.navParams.get('laudo');
  }

  public salvarAssinatura() {
    this.signatureImage = this.signaturePad.toDataURL();

    if (this.paginaOrigem == "LAUDO") {
      this.laudo.assinatura = this.signatureImage;
      this.viewCtrl.dismiss(this.laudo);
    }
  }

  public limparAssinatura() {
    this.signaturePad.clear();
  }
}