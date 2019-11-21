export class Config {
  public static VERSAO_APP = "0.0.54";
  public static QTD_MAX_FOTOS_POR_ATENDIMENTO = 3;
  public static GOOGLE_KEY = 'AIzaSyCdX8k9LPBt6c3gNKOMCWlgyYmrV5AMkf8';
  public static GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=perto.sat.apptecnicos';
  public static GOOGLE_PLAY_NOME_APP = 'perto.sat.apptecnicos';
  public static OPEN_CAMERA = 'net.sourceforge.opencamera';
  public static POS_CONFIG = { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 };
  public static TIPO_CAUSA = { MAQUINA: 1, EXTRA_MAQUINA: 2 };
  public static TIPO_INTERVENCAO = { 
    ALTERAÇÃO_ENGENHARIA:	1, CORRETIVA: 2, DESINSTALAÇÃO: 3, INSTALAÇÃO: 4, ORÇAMENTO: 5, PREVENTIVA: 6, REINSTALAÇÃO: 7,
    INSPECAO_TECNICA: 10, REMANEJAMENTO: 11, TREINAMENTO: 13, AUTORIZACAO_DESL: 14, ORC_APROVADO: 17, ORC_REPROVADO: 18,
    ORC_PEND_APROVAÇÃO_CLIENTE: 19, ORC_PEND_FILIAL_DETALHAR_MOTIVO: 20, CORRETIVAPOS_REINCIDENTES: 22, HELPDESK: 23,
    TROCA_VELOHC: 24, ATUALIZACAO: 25, LAUDO_TECNICO: 26, HELP_DESK_DSS: 27, PREVENTIVA_GERENCIAL: 28, 
    LISTA_ATUALIZACAO_EQUIPAMENTO: 29, VANDALISMO: 30, MANUTENCAO_GERENCIAL: 31, COFRE: 32
   };
  public static STATUS_SERVICO = { 
    ABERTO: 1, CANCELADO: 2, FECHADO: 3, ORCAMENTO: 4, PARCIAL: 5, PECAS_LIBERADAS: 6, PECAS_PENDENTES: 7, TRANSFERIDO: 8,
    PEÇA_TRANSITO: 9, PECA_FALTANTE: 10, PECA_SEPARADA: 11, FECHADO_P_ANALISE: 12, ORCAMENTO_APROVADO: 13,
    AGUARDANDO_CONTATO_CLIENTE: 14, AGUARDANDO_DECLARACÃO: 15, CANCELADO_COM_ATENDIMENTO: 16
   };
  public static INT_SINC_BD_LOCAL_DIAS = 1;
  public static INT_SINC_CHAMADOS_MILISEG = 360000;
  public static INT_MIN_SINC_CHAMADOS_SEG = 10.0;
  public static CERCA_ELETRONICA = [
    { filial: 'FPR', distancia: 2.00 }, { filial: 'FRS', distancia: 2.55 },
    { filial: 'FDF', distancia: 5.65 }, { filial: 'FES', distancia: 3.43 },
    { filial: 'FSP', distancia: 2.47 }, { filial: 'FBU', distancia: 2.18 },
    { filial: 'FRN', distancia: 3.30 }, { filial: 'FCP', distancia: 2.25 },
    { filial: 'FSC', distancia: 2.12 }, { filial: 'FMS', distancia: 2.04 },
    { filial: 'FTO', distancia: 2.27 }, { filial: 'FPA', distancia: 3.34 },
    { filial: 'FRO', distancia: 3.21 }, { filial: 'FMG', distancia: 2.69 },
    { filial: 'FPE', distancia: 2.70 }, { filial: 'FGO', distancia: 3.15 },
    { filial: 'FMT', distancia: 4.65 }, { filial: 'FMA', distancia: 2.18 },
    { filial: 'FBA', distancia: 4.56 }, { filial: 'FCE', distancia: 2.35 },
    { filial: 'FRJ', distancia: 4.44 }, { filial: 'FAM', distancia: 4.78 }
  ];
  public static EQUIPAMENTOS_POS = { POS_VELOH_3: 289, POS_VELOH_G: 172 };
  public static COR_RGB = { 
    CINZA: '#9E9E9E',
    VERDE: '#8BC34A', 
    VERMELHO: '#D32F2F', 
    LARANJA: '#FFC107',
    AZUL: '#00BCD4'
  };
  public static CHAMADO = { TRANSFERIDO: 8, FECHADO: 3 };
  public static ACAO = { PENDENCIA_PECA: { CODACAO: 19 } };
  public static USUARIO_PERFIL = {
    ADMINISTRADOR_SISTEMA: 1, FILIAL_SUPORTE_TECNICO: 32,
    FILIAL_TECNICO_DE_CAMPO: 35, FILIAL_SUPORTE_TECNICO_DE_CAMPO: 79,
    FILIAL_TECNICO_DE_CAMPO_COM_CHAMADOS: 84,
  };
  public static CLIENTE = {
    BB: 1, RIO_CARD: 256, BRINKS: 347, VLT_CARIOCA: 444, BVA_BRINKS: 479, 
    METRO_RIO: 538, CEF: 58, BNB: 253, PROTEGE: 490, BANRISUL: 2
  };
  public static MSG = {
    RECURSO_NATIVO: 'Este recurso deve ser acessado no dispositivo',
    ERRO_PERMISSAO_CAMERA: 'Erro ao obter permissões para acessar a câmera',
    ERRO_RESPOSTA_DISPOSITIVO: 'O dispositivo não respondeu',
    ERRO_FOTO: 'Erro ao tirar a foto. Favor tentar novamente',
    CHECKIN_EM_ABERTO: 'Você possui checkin aberto em outro chamado',
    CHECKIN_CONFIRMACAO: 'Somente confirme o Checkin se você realmente estiver no local do atendimento',
    CHECKOUT_CONFIRMACAO: 'Somente confirme o checkout se você já concluiu o chamado e deixará o local de atendimento',
    CONFIRMACAO: 'Confirmação',
    OBTENDO_LOCALIZACAO: 'Obtendo sua localização...',
  }
  public static API_URL = 'http://localhost:60687/api/';
  //public static API_URL = 'http://sat.perto.com.br/prjSATWebAPI/api/';
}