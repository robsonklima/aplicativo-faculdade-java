import { Component } from '@angular/core';

import moment from 'moment';


@Component({
  selector: 'teste-page',
  templateUrl: 'teste.html'
})
export class TestePage {
  mapa: any;
  
  constructor(
    
  ) {}

  ionViewWillEnter() {
    let tempTime = moment.duration(1358);
    let tempo = tempTime.hours() + tempTime.minutes();

    console.log(moment().startOf('day').seconds(1358).format('H:mm:ss'));
  }

  
}