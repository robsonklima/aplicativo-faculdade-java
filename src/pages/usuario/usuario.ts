import { Component } from '@angular/core';
import { DadosGlobaisService } from '../../services/dados-globais';
import { DadosGlobais } from '../../models/dados-globais';
import { AlertController, LoadingController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { GeolocationService } from '../../services/geo-location';
import { Cep } from '../../models/cep';
import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario';


@Component({
  selector: 'usuario-page',
  templateUrl: 'usuario.html'
})
export class UsuarioPage {
  dg: DadosGlobais;
  
  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private dadosGlobaisService: DadosGlobaisService,
    private geolocationService: GeolocationService,
    private usuarioService: UsuarioService
  ) {
    
  }

  ionViewWillEnter() {
    this.carregarDadosGlobais().catch(() => {});
  }

  private carregarDadosGlobais(): Promise<DadosGlobais> {
    return new Promise((resolve, reject) => {
      this.dadosGlobaisService.buscarDadosGlobaisStorage()
        .then((dados) => {
          if (dados) {
            this.dg = dados;
          }

          resolve(dados);
        })
        .catch((err) => {
          reject(new Error(err.message))
        });
    });
  }

  public salvarUsuario(form: NgForm) {
    this.dg.usuario.nome = form.value.nomeUsuario;
    this.dg.usuario.fonePerto = form.value.telefonePerto;
    this.dg.usuario.fone = form.value.telefonePessoal;
    this.dg.usuario.cpf = form.value.cpf;
    this.dg.usuario.cep = form.value.cep.replace(/\D/g, '');
    this.dg.usuario.endereco = form.value.endereco;
    this.dg.usuario.numero = form.value.numero;
    this.dg.usuario.bairro = form.value.bairro;
    this.dg.usuario.siglaUF = form.value.estado;
    this.dg.usuario.cidade = form.value.cidade;
    this.dg.usuario.enderecoComplemento = form.value.complemento;

    const loading = this.loadingCtrl.create({ 
      content: 'Aguarde...' 
    });
    loading.present();

    this.usuarioService.atualizarUsuarioApi(this.dg.usuario).subscribe((res: Usuario) => {
      loading.dismiss().then(() => {
        this.dadosGlobaisService.insereDadosGlobaisStorage(this.dg);
        this.exibirAlerta('Confirmação!', 'Usuário salvo com sucesso!');
      });
    }, e => {
      loading.dismiss().then(() => {
        this.exibirAlerta('Erro!', 'Não foi possível salvar o usuário!');
      });
    })
  }

  public formatarCampo(event: any, mascara: string) {
    var i = event.target.value.length;
    var saida = mascara.substring(1,0);
    var texto = mascara.substring(i)
    if (texto.substring(0,1) != saida){
      event.target.value += texto.substring(0,1);
    }

    if (mascara === '#####-###' && event.target.value.length == 9) {
      this.geolocationService.buscarDetalhesPorCepApi(event.target.value).subscribe((res: Cep) => { 
        this.dg.usuario.cep = res.cep;
        this.dg.usuario.endereco = res.logradouro;
        this.dg.usuario.bairro = res.bairro;
        this.dg.usuario.siglaUF = res.uf;
        this.dg.usuario.cidade = res.localidade;
      }, e => {});
    }
  }

  public tirarFoto() {
    this.exibirAlerta('Instruções!', 'Por favor, utilize a câmera do aparelho para tirar um Foto 3x4, utilizando crachá e uniforme da empresa.');
  }

  private exibirAlerta(titulo: string, conteudo: string) {
    const alert = this.alertCtrl.create({
      title: titulo,
      subTitle: conteudo,
      buttons: ['OK']
    });

    alert.present();
  }
}