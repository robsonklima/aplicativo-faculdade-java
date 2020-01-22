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
        console.log('Directory exists'+response);
      }).catch(err => {
        console.log('Directory doesn\'t exist'+JSON.stringify(err));
        this.file.createDir(this.file.externalRootDirectory, 'data', false).then(response => {
          console.log('Directory create' + response);
        }).catch(err => {
          console.log('Directory no create'+JSON.stringify(err));
        }); 
      });
    });
  }
}