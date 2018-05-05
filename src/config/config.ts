export class Config {
   public static CHAMADO = { TRANSFERIDO: 8, FECHADO: 3 };
   public static ACAO = { PENDENCIA_PECA: { CODACAO: 19 } };
   public static USUARIO_PERFIL = { 
       ADMINISTRADOR_SISTEMA: 1, 
       FILIAL_SUPORTE_TECNICO: 32,
       FILIAL_TECNICO_DE_CAMPO: 35,
       FILIAL_SUPORTE_TECNICO_DE_CAMPO: 79,
       FILIAL_TECNICO_DE_CAMPO_COM_CHAMADOS: 84,
   };
   public static QTD_MAX_FOTOS_POR_ATENDIMENTO = 3;
   public static GOOGLE_KEY = 'AIzaSyCdX8k9LPBt6c3gNKOMCWlgyYmrV5AMkf8';
   public static GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=perto.sat.apptecnicos';
   public static GOOGLE_PLAY_NOME_APP = 'perto.sat.apptecnicos';
   public static POS_CONFIG = { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 };
   public static INT_SINC_BD_LOCAL_DIAS = 7;
   public static INT_SINC_CHAMADOS_MILISEG = 300000; // 5 minutos
   public static INT_MIN_SINC_CHAMADOS_SEG = 10.0;

   //public static API_URL = 'http://localhost:60687/api/';
   public static API_URL = 'http://sat.perto.com.br/prjSATWebAPI/api/';
}