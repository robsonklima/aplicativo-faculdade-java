import { Component, ViewChild } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Laudo } from '../../models/laudo';
import { Chamado } from '../../models/chamado';


@Component({
  selector: 'assinatura-page',
  templateUrl: 'assinatura.html',
})
export class AssinaturaPage {
  paginaOrigem: string;
  tituloPagina: string;
  laudo: Laudo;
  chamado: Chamado;
  @ViewChild(SignaturePad) public signaturePad: SignaturePad;
  public signaturePadOptions: Object = { 'minWidth': 2, 'canvasWidth': 320, 'canvasHeight': 200 };
  public signatureImage: string;

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams
  ) {
    this.paginaOrigem = this.navParams.get('paginaOrigem');
    this.laudo = this.navParams.get('laudo');
    this.chamado = this.navParams.get('chamado');
  }

  ionViewWillEnter() {
    if (this.paginaOrigem == "LAUDO_TECNICO") {
      this.tituloPagina = "Assinatura do Técnico";
    }

    if (this.paginaOrigem == "LAUDO_CLIENTE" || this.paginaOrigem == "RAT_CLIENTE") {
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

    if (this.paginaOrigem == "RAT_CLIENTE") {
      this.chamado.rats[0].assinaturaCliente = this.signatureImage;
      this.viewCtrl.dismiss(this.chamado);
    }
  }

  public limparAssinatura() {
    this.signaturePad.clear();
  }

  public fecharModal() {
    this.viewCtrl.dismiss(this.laudo);
  }
}