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
  tituloPagina: string;
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

  ionViewWillEnter() {
    if (this.paginaOrigem == "LAUDO_TECNICO") {
      this.tituloPagina = "Assinatura do Técnico";
    }

    if (this.paginaOrigem == "LAUDO_CLIENTE") {
      this.tituloPagina = "Assinatura do Cliente";
    }
  }

  public salvarAssinatura() {
    this.signatureImage = this.signaturePad.toDataURL();

    if (this.paginaOrigem == "LAUDO_TECNICO") {
      this.laudo.assinaturaTecnico = this.signatureImage;
      this.viewCtrl.dismiss(this.laudo);
    }

    if (this.paginaOrigem == "LAUDO_CLIENTE") {
      this.laudo.assinaturaCliente = this.signatureImage;
      this.viewCtrl.dismiss(this.laudo);
    }
  }

  public limparAssinatura() {
    this.signaturePad.clear();
  }

  public fecharModal() {
    this.viewCtrl.dismiss(this.laudo);
  }
}