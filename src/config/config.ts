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
  public static PERC_SLA_ACEITAVEL = 98;
  public static PERC_REINC_ACEITAVEL = 30;
  public static PERC_PEND_ACEITAVEL = 3;
  public static PERC_DISP_ACEITAVEL = 99.99;
  public static CERCA_ELETRONICA = [
    { filial: 'FPR', distancia: 2.00 },
    { filial: 'FRS', distancia: 2.55 },
    { filial: 'FDF', distancia: 5.65 },
    { filial: 'FES', distancia: 3.43 },
    { filial: 'FSP', distancia: 2.47 },
    { filial: 'FBU', distancia: 2.18 },
    { filial: 'FRN', distancia: 3.30 },
    { filial: 'FCP', distancia: 2.25 },
    { filial: 'FSC', distancia: 2.12 },
    { filial: 'FMS', distancia: 2.04 },
    { filial: 'FTO', distancia: 2.27 },
    { filial: 'FPA', distancia: 3.34 },
    { filial: 'FRO', distancia: 3.21 },
    { filial: 'FMG', distancia: 2.69 },
    { filial: 'FPE', distancia: 2.70 },
    { filial: 'FGO', distancia: 3.15 },
    { filial: 'FMT', distancia: 4.65 },
    { filial: 'FMA', distancia: 2.18 },
    { filial: 'FBA', distancia: 4.56 },
    { filial: 'FCE', distancia: 2.35 },
    { filial: 'FRJ', distancia: 4.44 },
    { filial: 'FAM', distancia: 4.78 }
  ];

  //public static API_URL = 'http://localhost:60687/api/';
  public static API_URL = 'http://sat.perto.com.br/prjSATWebAPI/api/';
}