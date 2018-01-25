export class Config {
   public static CHAMADO = { TRANSFERIDO: 8, FECHADO: 3 };
   public static ACAO = { PENDENCIA_PECA: { CODACAO: 19 } };
   public static GOOGLE_KEY = 'AIzaSyCdX8k9LPBt6c3gNKOMCWlgyYmrV5AMkf8';
   public static POS_CONFIG = { enableHighAccuracy: true, maximumAge: 3600, timeout: 20000 };
   public static BACKGROUND_MODE_CONFIG = { title: 'SAT Sincronização', text: 'Executando', silent: true };
   public static INT_SINC_BD_LOCAL_DIAS = 7;
   public static INT_SINC_CHAMADOS_MILISEG = 300000; // 5 minutos
   public static INT_MIN_SINC_CHAMADOS_SEG = 5.0;
   public static INT_LOADING_CHAMADOS_MILISEG = 6000;

   //public static API_URL = 'http://localhost:60687/api/';
   public static API_URL = 'http://sat.perto.com.br/prjSATWebAPI/api/';
}