import { Component } from '@angular/core';
import { File } from '@ionic-native/file';
import { Platform } from 'ionic-angular';


@Component({
  selector: 'teste-page',
  templateUrl: 'teste.html'
})
export class TestePage {
  
  constructor(
    private plt: Platform,
    private file: File
  ) {}

  ionViewWillEnter() {
    this.plt.ready().then(() =>{
      this.file.checkDir(this.file.externalRootDirectory, 'data').then(response => {
      }).catch(err => {
        this.file.createDir(this.file.externalRootDirectory, 'data', false).then(response => {
        }).catch(err => {
        }); 
      });
    });
  }
}