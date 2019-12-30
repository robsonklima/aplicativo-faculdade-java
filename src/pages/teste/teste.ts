import { Component } from '@angular/core';
import { FotoService } from '../../services/foto';
import { Config } from '../../models/config';


@Component({
  selector: 'teste-page',
  templateUrl: 'teste.html'
})
export class TestePage {
  constructor(
    private fotoService: FotoService    
  ) {}

  ionViewWillEnter() {
    console.log('ENVIADA' == Config.FOTO.STATUS.ENVIADA)
  }
}