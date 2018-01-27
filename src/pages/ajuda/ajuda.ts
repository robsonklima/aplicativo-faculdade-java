import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'ajuda-page',
  templateUrl: 'ajuda.html'
})
export class AjudaPage {
  constructor(
    private viewCtrl: ViewController
  ) {}

  public fecharModal() {
    this.viewCtrl.dismiss();
  }
}