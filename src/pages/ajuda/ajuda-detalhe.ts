import { Component } from '@angular/core';
import { NavParams} from 'ionic-angular';

@Component({
  selector: 'ajuda-detalhe-page',
  templateUrl: 'ajuda-detalhe.html'
})
export class AjudaDetalhePage {
  item: any;

  constructor(
    private navParams: NavParams
  ) {
    this.item = this.navParams.get('item');
  }
}