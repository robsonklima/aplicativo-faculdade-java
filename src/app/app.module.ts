import { MyApp } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage' 
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from "@angular/http";
import { ChartsModule } from 'ng2-charts';

import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic'
import { Network } from '@ionic-native/network';
import { AppVersion } from '@ionic-native/app-version';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Market } from '@ionic-native/market';
import { AppAvailability } from '@ionic-native/app-availability';
import { Device } from '@ionic-native/device';
import { BackgroundMode } from '@ionic-native/background-mode';
import { PhonegapLocalNotification } from '@ionic-native/phonegap-local-notification';
import { NativeAudio } from '@ionic-native/native-audio';
import { Vibration } from '@ionic-native/vibration';
import { Badge } from '@ionic-native/badge';
import { Camera } from '@ionic-native/camera';

import { LoginPage } from "../pages/login/login";
import { SenhaAlteracaoPage } from "../pages/senha-alteracao/senha-alteracao";
import { HomePage } from '../pages/home/home';
import { HomeMaisOpcoesPage } from '../pages/home/home-mais-opcoes';
import { ChamadosPage } from "../pages/chamados/chamados";
import { ChamadoPage } from "../pages/chamados/chamado";
import { ChamadosFechadosPage } from '../pages/chamados/chamados-fechados';
import { ChamadoFechadoPage } from '../pages/chamados/chamado-fechado';
import { RatDetalhePage } from "../pages/rat-detalhe/rat-detalhe";
import { RatDetalhePecaPage } from "../pages/rat-detalhe-peca/rat-detalhe-peca";
import { HistoricoListaPage } from '../pages/historico/historico-lista';
import { PecasPage } from '../pages/pecas/pecas';
import { PecaPage } from '../pages/peca/peca';
import { AjudaListaPage } from '../pages/ajuda/ajuda-lista';
import { AjudaDetalhePage } from '../pages/ajuda/ajuda-detalhe';
import { ProblemaPage } from '../pages/problema/problema';
import { SobrePage } from '../pages/sobre/sobre';
import { IndicadorMenuPage } from '../pages/indicadores/indicador-menu';
import { IndicadorFiliaisPage } from '../pages/indicadores/indicador-filiais';
import { IndicadorTecnicoPage } from '../pages/indicadores/indicador-tecnico';
import { IndicadorPerformanceTecnicoPage } from '../pages/indicadores/indicador-performance-tecnico';
import { ChamadosMaisOpcoesPage } from '../pages/chamados/chamados-mais-opcoes';

import { DadosGlobaisService } from '../services/dados-globais';
import { ChamadoService } from "../services/chamado";
import { GeolocationService } from './../services/geo-location';
import { UsuarioService } from '../services/usuario';
import { AcaoService } from "../services/acao";
import { DefeitoService } from "../services/defeito";
import { CausaService } from "../services/causa";
import { PecaService } from "../services/peca";
import { TipoServicoService } from "../services/tipo-servico";
import { EquipamentoContratoService } from '../services/equipamento-contrato';
import { HistoricoDetalhePage } from '../pages/historico/historico-detalhe';
import { CheckinCheckoutService } from '../services/checkin-checkout';
import { AjudaTopicoService } from '../services/ajuda-topico';
import { FotoService } from '../services/foto';
import { IndicadorService } from '../services/indicador';
import { LocalizacaoService } from '../services/localizacao';

import { CapitalizePipe } from '../pipes/capitalize';
import { EllipsisPipe } from '../pipes/ellipsis';
import { LowercasePipe } from '../pipes/lowercase';
import { FotosPage } from '../pages/fotos/fotos';
import { LocalizacaoEnvioPage } from '../pages/localizacao-envio/localizacao-envio';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SenhaAlteracaoPage,
    HomePage,
    HomeMaisOpcoesPage,
    ChamadosPage,
    ChamadoPage,
    ChamadosMaisOpcoesPage,
    ChamadosFechadosPage,
    ChamadoFechadoPage,
    RatDetalhePage,
    RatDetalhePecaPage,
    HistoricoListaPage,
    HistoricoDetalhePage,
    PecasPage,
    PecaPage,
    AjudaListaPage,
    AjudaDetalhePage,
    ProblemaPage,
    SobrePage,
    FotosPage,
    IndicadorMenuPage,
    IndicadorFiliaisPage,
    IndicadorTecnicoPage,
    IndicadorPerformanceTecnicoPage,
    LocalizacaoEnvioPage,
    CapitalizePipe,
    EllipsisPipe,
    LowercasePipe
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp, {
      monthNames: ['janeiro', 'fevereiro', 'mar\u00e7o', 'abril', 'maio', 'junho', 
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro' ],
      monthShortNames: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago',
         'set', 'out', 'nov', 'dez' ],
      dayNames: ['domingo', 'segunda-feira', 'ter\u00e7a-feira', 'quarta-feira',
         'quinta-feira', 'sexta-feira', 'sabado' ],
      dayShortNames: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab' ],
      scrollAssist: false, 
      autoFocusAssist: false
    }),
    IonicStorageModule.forRoot(),
    ChartsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SenhaAlteracaoPage,
    HomePage,
    HomeMaisOpcoesPage,
    ChamadosPage,
    ChamadoPage,
    ChamadosMaisOpcoesPage,
    ChamadosFechadosPage,
    ChamadoFechadoPage,
    RatDetalhePage,
    RatDetalhePecaPage,
    HistoricoListaPage,
    HistoricoDetalhePage,
    PecasPage,
    PecaPage,
    AjudaListaPage,
    AjudaDetalhePage,
    ProblemaPage,
    SobrePage,
    FotosPage,
    IndicadorMenuPage,
    IndicadorFiliaisPage,
    IndicadorTecnicoPage,
    IndicadorPerformanceTecnicoPage,
    LocalizacaoEnvioPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Diagnostic,
    Geolocation,
    BackgroundMode,
    PhonegapLocalNotification,
    Badge,
    NativeAudio,
    Vibration,
    Network,
    AppVersion,
    InAppBrowser,
    Market,
    AppAvailability,
    Device,
    Camera,
    DadosGlobaisService,
    ChamadoService,
    GeolocationService,
    UsuarioService,
    AcaoService,
    DefeitoService,
    CausaService,
    PecaService,
    EquipamentoContratoService,
    TipoServicoService,
    CheckinCheckoutService,
    FotoService,
    AjudaTopicoService,
    IndicadorService,
    LocalizacaoService
  ]
})
export class AppModule {}