import { Component } from '@angular/core';
import { EquipamentoCausaService } from '../../services/equipamento-causa';
import { EquipamentoCausa } from '../../models/equipamento-causa';
import { EquipamentoPOSService } from '../../services/equipamento-pos';
import { EquipamentoPOS } from '../../models/equipamentoPOS';
import { LoadingController } from 'ionic-angular';


@Component({
  selector: 'teste-page',
  templateUrl: 'teste.html'
})
export class TestePage {
  equipamentosCausas: EquipamentoCausa[] = [];
  causas: any[] = [];
  equipamentosPOS: EquipamentoPOS[] = [];

  constructor(
    private loadingCtrl: LoadingController,
    private equipamentoCausaService: EquipamentoCausaService,
    private equipamentoPOSService: EquipamentoPOSService
  ) { }

  ionViewWillEnter() {
    this.carregarEquipamentosPOS();
  }

  private carregarEquipamentosPOS(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(
        this.equipamentoPOSService.buscarEquipamentosPOSStorage().then((equipamentos: EquipamentoPOS[]) => { 
          this.equipamentosPOS = equipamentos;
        }).catch(err => { })
      );
    });
  }

  public buscarCausas(codEquip: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const loading = this.loadingCtrl.create({ content: 'Aguarde...' });
      loading.present();

      this.equipamentoCausaService.buscarEquipamentosCausasStorage().then((eCausas: EquipamentoCausa[]) => { 
        this.equipamentosCausas = eCausas.filter(function(e){
          return e.equipamento.codEquip == codEquip;
        });

        if (this.equipamentosCausas.length == 0 ) return;
        this.causas = this.equipamentosCausas[0].causas;
        loading.dismiss();
        resolve();
      }).catch(e => {
        loading.dismiss();
        reject(e); 
      });
    });
  }
}