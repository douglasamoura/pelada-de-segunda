// Dados importados e normalizados da planilha oficial da Pelada de Segunda

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

export const CATEGORIAS_ENTRADA = [
  'Mensalidade',
  'Diarista',
  'Caixa Anterior',
  'Churrasco/Evento',
  'Outro',
];

export const CATEGORIAS_SAIDA = [
  'Quadra',
  'Chopp/Bebidas',
  'Churrasco/Comida',
  'Material Esportivo',
  'Outro',
];

export const CONFIG_PADRAO = {
  valorMensalidade: 75.0,
  valorDiarista: 20.0,
  diaVencimentoMensalidade: 10,
  duracaoPartidaMinutos: 7,
  jogadoresPorTime: 5,
  quantidadeTimes: 3,
  pontosVitoria: 3.0,
  pontosEmpateVantagem: 1.0,
  pontosParticipacaoGol: 0.5,
};

export const JOGADORES_INICIAIS = [
  {
    "id": "p_1",
    "nome": "Rechan",
    "status": "Mensalista Ausente",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 4.0,
    "chute": 4.0,
    "marcacao": 3.0,
    "passe": 4.0,
    "habilidade": 4.0,
    "overall": 19.0
  },
  {
    "id": "p_2",
    "nome": "Bahia",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 5.0,
    "chute": 3.0,
    "marcacao": 4.0,
    "passe": 3.0,
    "habilidade": 3.0,
    "overall": 18.0
  },
  {
    "id": "p_3",
    "nome": "Diogo",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 4.0,
    "chute": 3.0,
    "marcacao": 3.0,
    "passe": 4.0,
    "habilidade": 3.0,
    "overall": 17.0
  },
  {
    "id": "p_4",
    "nome": "Guilherme",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 3.0,
    "chute": 3.0,
    "marcacao": 3.0,
    "passe": 4.0,
    "habilidade": 3.0,
    "overall": 16.0
  },
  {
    "id": "p_5",
    "nome": "Felipo",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 2.0,
    "chute": 3.0,
    "marcacao": 2.0,
    "passe": 4.0,
    "habilidade": 4.0,
    "overall": 15.0
  },
  {
    "id": "p_6",
    "nome": "Douglas",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 5.0,
    "chute": 3.0,
    "marcacao": 2.0,
    "passe": 3.0,
    "habilidade": 2.0,
    "overall": 15.0
  },
  {
    "id": "p_7",
    "nome": "Felipim",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 4.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 4.0,
    "habilidade": 3.0,
    "overall": 15.0
  },
  {
    "id": "p_8",
    "nome": "Daibert",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 3.0,
    "chute": 2.0,
    "marcacao": 3.0,
    "passe": 3.0,
    "habilidade": 2.0,
    "overall": 13.0
  },
  {
    "id": "p_9",
    "nome": "Rogério",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 2.0,
    "chute": 3.0,
    "marcacao": 2.0,
    "passe": 3.0,
    "habilidade": 3.0,
    "overall": 13.0
  },
  {
    "id": "p_10",
    "nome": "Brug",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 4.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 12.0
  },
  {
    "id": "p_11",
    "nome": "Lucão",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 1.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 3.0,
    "habilidade": 3.0,
    "overall": 11.0
  },
  {
    "id": "p_12",
    "nome": "Filipão",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  },
  {
    "id": "p_13",
    "nome": "Alan",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  },
  {
    "id": "p_14",
    "nome": "Alex",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 1.0,
    "chute": 1.0,
    "marcacao": 2.0,
    "passe": 1.0,
    "habilidade": 1.0,
    "overall": 6.0
  },
  {
    "id": "p_15",
    "nome": "Fábio",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 2.0,
    "chute": 3.0,
    "marcacao": 2.0,
    "passe": 3.0,
    "habilidade": 4.0,
    "overall": 14.0
  },
  {
    "id": "p_16",
    "nome": "Foró",
    "status": "Goleiro",
    "posicao": "Goleiro",
    "avatar": "🧤",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  },
  {
    "id": "p_17",
    "nome": "Gabriel",
    "status": "Goleiro",
    "posicao": "Goleiro",
    "avatar": "🧤",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  },
  {
    "id": "p_18",
    "nome": "Juan",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  },
  {
    "id": "p_19",
    "nome": "Peterson",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 4.0,
    "chute": 5.0,
    "marcacao": 3.0,
    "passe": 4.0,
    "habilidade": 4.0,
    "overall": 20.0
  },
  {
    "id": "p_20",
    "nome": "Thiago",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 3.0,
    "chute": 4.0,
    "marcacao": 3.0,
    "passe": 3.0,
    "habilidade": 5.0,
    "overall": 18.0
  },
  {
    "id": "p_21",
    "nome": "Leo Sanfona",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 4.0,
    "chute": 4.0,
    "marcacao": 3.0,
    "passe": 3.0,
    "habilidade": 4.0,
    "overall": 18.0
  },
  {
    "id": "p_22",
    "nome": "Caio",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 3.0,
    "chute": 3.0,
    "marcacao": 4.0,
    "passe": 4.0,
    "habilidade": 3.0,
    "overall": 17.0
  },
  {
    "id": "p_23",
    "nome": "Thierry",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 5.0,
    "marcacao": 3.0,
    "passe": 3.0,
    "habilidade": 3.0,
    "overall": 16.0
  },
  {
    "id": "p_24",
    "nome": "David",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 3.0,
    "marcacao": 5.0,
    "passe": 3.0,
    "habilidade": 2.0,
    "overall": 15.0
  },
  {
    "id": "p_25",
    "nome": "Curinga",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 3.0,
    "marcacao": 2.0,
    "passe": 5.0,
    "habilidade": 2.0,
    "overall": 14.0
  },
  {
    "id": "p_26",
    "nome": "Léo (Lucão)",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 3.0,
    "marcacao": 3.0,
    "passe": 4.0,
    "habilidade": 2.0,
    "overall": 14.0
  },
  {
    "id": "p_27",
    "nome": "Wand",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 3.0,
    "marcacao": 4.0,
    "passe": 2.0,
    "habilidade": 3.0,
    "overall": 14.0
  },
  {
    "id": "p_28",
    "nome": "Alan Neo",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 3.0,
    "marcacao": 3.0,
    "passe": 3.0,
    "habilidade": 3.0,
    "overall": 14.0
  },
  {
    "id": "p_29",
    "nome": "Yuri",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 3.0,
    "chute": 3.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 3.0,
    "overall": 13.0
  },
  {
    "id": "p_30",
    "nome": "Victão",
    "status": "Mensalista Temporário",
    "posicao": "Linha",
    "avatar": "⭐",
    "velocidade": 3.0,
    "chute": 3.0,
    "marcacao": 3.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 13.0
  },
  {
    "id": "p_31",
    "nome": "Leo Duarte",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 4.0,
    "overall": 12.0
  },
  {
    "id": "p_32",
    "nome": "Balboa",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 3.0,
    "chute": 2.0,
    "marcacao": 3.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 12.0
  },
  {
    "id": "p_33",
    "nome": "Andre",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 3.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 11.0
  },
  {
    "id": "p_34",
    "nome": "Guilherme Almeida",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 3.0,
    "passe": 2.0,
    "habilidade": 1.0,
    "overall": 10.0
  },
  {
    "id": "p_35",
    "nome": "Quibim",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 3.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 1.0,
    "habilidade": 1.0,
    "overall": 9.0
  },
  {
    "id": "p_36",
    "nome": "Neo",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 1.0,
    "overall": 9.0
  },
  {
    "id": "p_37",
    "nome": "Rafael",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 1.0,
    "chute": 3.0,
    "marcacao": 2.0,
    "passe": 1.0,
    "habilidade": 1.0,
    "overall": 8.0
  },
  {
    "id": "p_38",
    "nome": "Jader",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 1.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 1.0,
    "habilidade": 1.0,
    "overall": 7.0
  },
  {
    "id": "p_39",
    "nome": "Ronildo",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 5.0,
    "passe": 2.0,
    "habilidade": 3.0,
    "overall": 14.0
  },
  {
    "id": "p_extra_9",
    "nome": "Felipe",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⚽",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  },
  {
    "id": "p_extra_11",
    "nome": "Rogerio",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⚽",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  },
  {
    "id": "p_extra_15",
    "nome": "Lucao",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⚽",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  },
  {
    "id": "p_extra_17",
    "nome": "Fabio",
    "status": "Mensalista",
    "posicao": "Linha",
    "avatar": "⚽",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  },
  {
    "id": "p_extra_25",
    "nome": "Fontainha",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "⚽",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  },
  {
    "id": "p_rank_19",
    "nome": "André",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  },
  {
    "id": "p_rank_22",
    "nome": "Maninho",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  },
  {
    "id": "p_rank_24",
    "nome": "Léo Duarte",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  },
  {
    "id": "p_rank_27",
    "nome": "Foro",
    "status": "Diarista",
    "posicao": "Linha",
    "avatar": "🏃",
    "velocidade": 2.0,
    "chute": 2.0,
    "marcacao": 2.0,
    "passe": 2.0,
    "habilidade": 2.0,
    "overall": 10.0
  }
];

export const PAGAMENTOS_INICIAIS = {
  "p_14": {
    "Janeiro": 0.0,
    "Fevereiro": 75.0,
    "Março": 75.0,
    "Abril": 75.0,
    "Maio": 75.0,
    "Junho": 75.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 65.0,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "p_2": {
    "Janeiro": 60.0,
    "Fevereiro": 75.0,
    "Março": 75.0,
    "Abril": 75.0,
    "Maio": 75.0,
    "Junho": 75.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 75.0,
    "Outubro": 75.0,
    "Novembro": null,
    "Dezembro": null
  },
  "p_10": {
    "Janeiro": 60.0,
    "Fevereiro": 75.0,
    "Março": 75.0,
    "Abril": 75.0,
    "Maio": 75.0,
    "Junho": 75.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 75.0,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "p_8": {
    "Janeiro": 0.0,
    "Fevereiro": 75.0,
    "Março": 75.0,
    "Abril": 75.0,
    "Maio": 75.0,
    "Junho": 75.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 75.0,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "p_6": {
    "Janeiro": 60.0,
    "Fevereiro": 0.0,
    "Março": 0.0,
    "Abril": 0.0,
    "Maio": 0.0,
    "Junho": 0.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 75.0,
    "Outubro": 75.0,
    "Novembro": null,
    "Dezembro": null
  },
  "p_3": {
    "Janeiro": 0.0,
    "Fevereiro": 75.0,
    "Março": 0.0,
    "Abril": 0.0,
    "Maio": 75.0,
    "Junho": 75.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 75.0,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "p_extra_9": {
    "Janeiro": 60.0,
    "Fevereiro": 0.0,
    "Março": 0.0,
    "Abril": 0.0,
    "Maio": 75.0,
    "Junho": 75.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 75.0,
    "Outubro": 75.0,
    "Novembro": null,
    "Dezembro": null
  },
  "p_5": {
    "Janeiro": 60.0,
    "Fevereiro": 75.0,
    "Março": 75.0,
    "Abril": 75.0,
    "Maio": 75.0,
    "Junho": 75.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 75.0,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "p_extra_11": {
    "Janeiro": 60.0,
    "Fevereiro": 75.0,
    "Março": 75.0,
    "Abril": 75.0,
    "Maio": 75.0,
    "Junho": 75.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 75.0,
    "Outubro": 75.0,
    "Novembro": null,
    "Dezembro": null
  },
  "p_1": {
    "Janeiro": 60.0,
    "Fevereiro": 75.0,
    "Março": 75.0,
    "Abril": 75.0,
    "Maio": 75.0,
    "Junho": 0.0,
    "Julho": 0.0,
    "Agosto": 0.0,
    "Setembro": 75.0,
    "Outubro": 0.0,
    "Novembro": 0.0,
    "Dezembro": 0.0
  },
  "p_4": {
    "Janeiro": 60.0,
    "Fevereiro": 75.0,
    "Março": 75.0,
    "Abril": 75.0,
    "Maio": 75.0,
    "Junho": 75.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 75.0,
    "Outubro": 75.0,
    "Novembro": null,
    "Dezembro": null
  },
  "p_12": {
    "Janeiro": 0.0,
    "Fevereiro": 0.0,
    "Março": 0.0,
    "Abril": 0.0,
    "Maio": 75.0,
    "Junho": 75.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 75.0,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "p_extra_15": {
    "Janeiro": 0.0,
    "Fevereiro": 0.0,
    "Março": 0.0,
    "Abril": 0.0,
    "Maio": 0.0,
    "Junho": 75.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 75.0,
    "Outubro": 75.0,
    "Novembro": null,
    "Dezembro": null
  },
  "p_13": {
    "Janeiro": 0.0,
    "Fevereiro": 0.0,
    "Março": 0.0,
    "Abril": 0.0,
    "Maio": 0.0,
    "Junho": 0.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 75.0,
    "Outubro": 75.0,
    "Novembro": null,
    "Dezembro": null
  },
  "p_extra_17": {
    "Janeiro": 60.0,
    "Fevereiro": 0.0,
    "Março": 75.0,
    "Abril": 75.0,
    "Maio": 0.0,
    "Junho": 0.0,
    "Julho": 75.0,
    "Agosto": 75.0,
    "Setembro": 75.0,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "p_18": {
    "Janeiro": 60.0,
    "Fevereiro": 75.0,
    "Março": 75.0,
    "Abril": 75.0,
    "Maio": 0.0,
    "Junho": 0.0,
    "Julho": 0.0,
    "Agosto": null,
    "Setembro": null,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "p_20": {
    "Janeiro": 60.0,
    "Fevereiro": 75.0,
    "Março": 75.0,
    "Abril": 75.0,
    "Maio": 0.0,
    "Junho": 0.0,
    "Julho": 0.0,
    "Agosto": null,
    "Setembro": null,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "p_30": {
    "Janeiro": 60.0,
    "Fevereiro": 75.0,
    "Março": 75.0,
    "Abril": 75.0,
    "Maio": 75.0,
    "Junho": 0.0,
    "Julho": 0.0,
    "Agosto": 0.0,
    "Setembro": 0.0,
    "Outubro": 75.0,
    "Novembro": null,
    "Dezembro": null
  },
  "p_38": {
    "Janeiro": 60.0,
    "Fevereiro": 75.0,
    "Março": 75.0,
    "Abril": 0.0,
    "Maio": 0.0,
    "Junho": 0.0,
    "Julho": 0.0,
    "Agosto": null,
    "Setembro": null,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "p_29": {
    "Janeiro": 60.0,
    "Fevereiro": 75.0,
    "Março": 0.0,
    "Abril": 75.0,
    "Maio": 0.0,
    "Junho": 0.0,
    "Julho": 0.0,
    "Agosto": null,
    "Setembro": null,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "p_23": {
    "Janeiro": null,
    "Fevereiro": null,
    "Março": null,
    "Abril": null,
    "Maio": null,
    "Junho": null,
    "Julho": null,
    "Agosto": null,
    "Setembro": 0.0,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "p_extra_25": {
    "Janeiro": null,
    "Fevereiro": null,
    "Março": null,
    "Abril": null,
    "Maio": null,
    "Junho": null,
    "Julho": null,
    "Agosto": null,
    "Setembro": null,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  }
};

export const ENTRADAS_INICIAIS = [
  {
    "id": "ent_1",
    "descricao": "Caixa 2025",
    "valor": 120.0,
    "categoria": "Caixa Anterior",
    "data": "2026"
  },
  {
    "id": "ent_2",
    "descricao": "Diaristas 12/01 a 23/03",
    "valor": 520.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_3",
    "descricao": "Diaristas 30/03 a 11/05",
    "valor": 340.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_4",
    "descricao": "Diaristas 18/05 a 22/06",
    "valor": 520.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_5",
    "descricao": "Diarista 06/07",
    "valor": 20.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_6",
    "descricao": "Diarista 13/07",
    "valor": 40.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_7",
    "descricao": "Diaristas 20/07",
    "valor": 40.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_8",
    "descricao": "Diaristas 27/07",
    "valor": 40.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_9",
    "descricao": "Diaristas 03/08",
    "valor": 60.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_10",
    "descricao": "Diaristas 10/08",
    "valor": 60.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_11",
    "descricao": "Diaristas 17/08",
    "valor": 60.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_12",
    "descricao": "Diaristas 24/08",
    "valor": 40.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_13",
    "descricao": "Diaristas 31/08",
    "valor": 60.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_14",
    "descricao": "Diaristas 14/09",
    "valor": 20.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_15",
    "descricao": "Diaristas 21/09",
    "valor": 20.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_16",
    "descricao": "Diaristas 05/10",
    "valor": 20.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_17",
    "descricao": "Diaristas 12/10",
    "valor": 40.0,
    "categoria": "Diarista",
    "data": "2026"
  },
  {
    "id": "ent_18",
    "descricao": "Diaristas 19/10",
    "valor": 20.0,
    "categoria": "Diarista",
    "data": "2026"
  }
];

export const SAIDAS_INICIAIS = [
  {
    "id": "sai_1",
    "descricao": "Quadra jan/fev",
    "valor": 1380.0,
    "categoria": "Quadra",
    "data": "2026"
  },
  {
    "id": "sai_2",
    "descricao": "Quadra março",
    "valor": 1150.0,
    "categoria": "Quadra",
    "data": "2026"
  },
  {
    "id": "sai_3",
    "descricao": "Quadra abril",
    "valor": 920.0,
    "categoria": "Quadra",
    "data": "2026"
  },
  {
    "id": "sai_4",
    "descricao": "Choop brinde",
    "valor": 60.0,
    "categoria": "Chopp/Bebidas",
    "data": "2026"
  },
  {
    "id": "sai_5",
    "descricao": "Quadra maio",
    "valor": 920.0,
    "categoria": "Quadra",
    "data": "2026"
  },
  {
    "id": "sai_6",
    "descricao": "Quadra Junho",
    "valor": 1150.0,
    "categoria": "Quadra",
    "data": "2026"
  },
  {
    "id": "sai_7",
    "descricao": "Quadra Julho",
    "valor": 920.0,
    "categoria": "Quadra",
    "data": "2026"
  },
  {
    "id": "sai_8",
    "descricao": "Quadra Agosto",
    "valor": 1150.0,
    "categoria": "Quadra",
    "data": "2026"
  },
  {
    "id": "sai_9",
    "descricao": "Quadra Setembro",
    "valor": 690.0,
    "categoria": "Quadra",
    "data": "2026"
  },
  {
    "id": "sai_10",
    "descricao": "Churrasco Setembro",
    "valor": 136.0,
    "categoria": "Churrasco/Comida",
    "data": "2026"
  },
  {
    "id": "sai_11",
    "descricao": "Quadra Outubro",
    "valor": 920.0,
    "categoria": "Quadra",
    "data": "2026"
  }
];

export const DATAS_RODADAS = [
  "01/06/2026",
  "09/06/2026",
  "15/06/2026",
  "22/06/2026",
  "06/07/2026",
  "13/07/2026",
  "20/07/2026",
  "27/07/2026",
  "03/08/2026",
  "10/08/2026",
  "17/08/2026",
  "24/08/2026",
  "31/08/2026",
  "14/09/2026",
  "21/09/2026",
  "28/09/2026",
  "05/10/2026",
  "12/10/2026",
  "19/10/2026"
];

export const HISTORICO_PONTUACAO_INICIAL = {
  "p_2": {
    "nome": "Bahia",
    "pontosTotais": 152.5,
    "pontosPorData": {
      "01/06/2026": 10.5,
      "09/06/2026": 7.0,
      "15/06/2026": 14.5,
      "22/06/2026": 6.0,
      "06/07/2026": 16.5,
      "13/07/2026": 4.5,
      "20/07/2026": 13.5,
      "27/07/2026": 15.0,
      "24/08/2026": 9.0,
      "14/09/2026": 3.0,
      "21/09/2026": 14.0,
      "28/09/2026": 9.5,
      "05/10/2026": 3.0,
      "12/10/2026": 12.5,
      "19/10/2026": 14.0
    }
  },
  "p_extra_11": {
    "nome": "Rogerio",
    "pontosTotais": 155.0,
    "pontosPorData": {
      "01/06/2026": 9.0,
      "09/06/2026": 6.0,
      "15/06/2026": 8.0,
      "22/06/2026": 6.5,
      "06/07/2026": 17.5,
      "13/07/2026": 7.0,
      "20/07/2026": 10.0,
      "27/07/2026": 15.0,
      "03/08/2026": 7.0,
      "10/08/2026": 5.5,
      "17/08/2026": 5.0,
      "24/08/2026": 7.5,
      "31/08/2026": 4.0,
      "14/09/2026": 7.5,
      "21/09/2026": 1.0,
      "28/09/2026": 10.0,
      "05/10/2026": 3.5,
      "12/10/2026": 11.5,
      "19/10/2026": 13.5
    }
  },
  "p_5": {
    "nome": "Felipo",
    "pontosTotais": 147.5,
    "pontosPorData": {
      "01/06/2026": 10.0,
      "09/06/2026": 10.0,
      "15/06/2026": 8.0,
      "22/06/2026": 11.0,
      "06/07/2026": 4.5,
      "13/07/2026": 8.0,
      "20/07/2026": 13.5,
      "27/07/2026": 13.0,
      "03/08/2026": 6.0,
      "10/08/2026": 5.0,
      "17/08/2026": 6.0,
      "31/08/2026": 4.0,
      "14/09/2026": 3.5,
      "21/09/2026": 9.0,
      "28/09/2026": 4.5,
      "05/10/2026": 11.0,
      "12/10/2026": 13.0,
      "19/10/2026": 7.5
    }
  },
  "p_12": {
    "nome": "Filipão",
    "pontosTotais": 153.0,
    "pontosPorData": {
      "01/06/2026": 10.0,
      "09/06/2026": 11.0,
      "15/06/2026": 12.5,
      "22/06/2026": 9.5,
      "06/07/2026": 4.0,
      "13/07/2026": 11.0,
      "20/07/2026": 14.0,
      "10/08/2026": 11.0,
      "17/08/2026": 5.5,
      "24/08/2026": 2.0,
      "31/08/2026": 16.5,
      "14/09/2026": 14.0,
      "21/09/2026": 13.0,
      "28/09/2026": 5.5,
      "05/10/2026": 6.5,
      "19/10/2026": 7.0
    }
  },
  "p_7": {
    "nome": "Felipim",
    "pontosTotais": 140.5,
    "pontosPorData": {
      "01/06/2026": 6.5,
      "09/06/2026": 11.5,
      "15/06/2026": 3.5,
      "22/06/2026": 8.0,
      "06/07/2026": 17.0,
      "13/07/2026": 4.5,
      "20/07/2026": 8.0,
      "27/07/2026": 12.5,
      "03/08/2026": 6.0,
      "10/08/2026": 12.5,
      "17/08/2026": 5.0,
      "24/08/2026": 1.5,
      "31/08/2026": 4.5,
      "14/09/2026": 6.0,
      "28/09/2026": 9.0,
      "05/10/2026": 7.0,
      "12/10/2026": 10.0,
      "19/10/2026": 7.5
    }
  },
  "p_11": {
    "nome": "Lucão",
    "pontosTotais": 176.5,
    "pontosPorData": {
      "01/06/2026": 7.0,
      "09/06/2026": 7.0,
      "15/06/2026": 4.0,
      "22/06/2026": 10.5,
      "06/07/2026": 4.5,
      "13/07/2026": 11.5,
      "20/07/2026": 8.5,
      "27/07/2026": 14.5,
      "03/08/2026": 5.0,
      "10/08/2026": 10.0,
      "17/08/2026": 13.5,
      "24/08/2026": 17.0,
      "31/08/2026": 17.5,
      "14/09/2026": 13.0,
      "21/09/2026": 8.5,
      "28/09/2026": 6.5,
      "12/10/2026": 11.0,
      "19/10/2026": 7.0
    }
  },
  "p_10": {
    "nome": "Brug",
    "pontosTotais": 132.5,
    "pontosPorData": {
      "01/06/2026": 10.0,
      "09/06/2026": 7.0,
      "22/06/2026": 6.0,
      "06/07/2026": 17.0,
      "13/07/2026": 5.5,
      "20/07/2026": 13.0,
      "27/07/2026": 7.5,
      "03/08/2026": 6.5,
      "10/08/2026": 4.5,
      "17/08/2026": 4.0,
      "24/08/2026": 8.0,
      "31/08/2026": 4.0,
      "14/09/2026": 3.5,
      "21/09/2026": 1.0,
      "28/09/2026": 4.0,
      "05/10/2026": 12.5,
      "12/10/2026": 12.0,
      "19/10/2026": 6.5
    }
  },
  "p_8": {
    "nome": "Daibert",
    "pontosTotais": 144.5,
    "pontosPorData": {
      "01/06/2026": 6.5,
      "09/06/2026": 11.0,
      "15/06/2026": 13.5,
      "22/06/2026": 7.5,
      "06/07/2026": 4.0,
      "13/07/2026": 8.5,
      "20/07/2026": 8.0,
      "27/07/2026": 6.5,
      "03/08/2026": 5.5,
      "10/08/2026": 11.0,
      "24/08/2026": 16.5,
      "14/09/2026": 7.0,
      "21/09/2026": 1.0,
      "28/09/2026": 4.5,
      "05/10/2026": 10.0,
      "12/10/2026": 9.0,
      "19/10/2026": 14.5
    }
  },
  "p_4": {
    "nome": "Guilherme",
    "pontosTotais": 175.5,
    "pontosPorData": {
      "01/06/2026": 9.5,
      "09/06/2026": 6.0,
      "15/06/2026": 8.0,
      "22/06/2026": 7.5,
      "06/07/2026": 5.0,
      "13/07/2026": 7.5,
      "20/07/2026": 8.0,
      "27/07/2026": 13.0,
      "03/08/2026": 5.5,
      "10/08/2026": 10.5,
      "17/08/2026": 14.0,
      "24/08/2026": 1.5,
      "31/08/2026": 19.5,
      "14/09/2026": 14.5,
      "21/09/2026": 13.5,
      "28/09/2026": 5.5,
      "05/10/2026": 7.0,
      "12/10/2026": 11.5,
      "19/10/2026": 8.0
    }
  },
  "p_3": {
    "nome": "Diogo",
    "pontosTotais": 169.5,
    "pontosPorData": {
      "01/06/2026": 7.0,
      "09/06/2026": 7.0,
      "15/06/2026": 4.5,
      "22/06/2026": 10.5,
      "06/07/2026": 4.5,
      "13/07/2026": 14.5,
      "20/07/2026": 8.0,
      "27/07/2026": 6.5,
      "03/08/2026": 5.5,
      "10/08/2026": 13.0,
      "17/08/2026": 6.0,
      "24/08/2026": 18.0,
      "31/08/2026": 18.5,
      "14/09/2026": 6.5,
      "21/09/2026": 8.0,
      "28/09/2026": 3.0,
      "05/10/2026": 10.5,
      "12/10/2026": 10.5,
      "19/10/2026": 7.5
    }
  },
  "p_14": {
    "nome": "Alex",
    "pontosTotais": 133.0,
    "pontosPorData": {
      "01/06/2026": 6.0,
      "09/06/2026": 6.0,
      "15/06/2026": 12.5,
      "22/06/2026": 6.0,
      "06/07/2026": 4.0,
      "13/07/2026": 7.0,
      "20/07/2026": 7.0,
      "27/07/2026": 12.0,
      "03/08/2026": 5.0,
      "10/08/2026": 11.0,
      "17/08/2026": 4.0,
      "24/08/2026": 7.0,
      "31/08/2026": 4.0,
      "14/09/2026": 6.0,
      "21/09/2026": 8.0,
      "28/09/2026": 8.0,
      "05/10/2026": 3.0,
      "12/10/2026": 10.5,
      "19/10/2026": 6.0
    }
  },
  "p_13": {
    "nome": "Alan",
    "pontosTotais": 109.5,
    "pontosPorData": {
      "09/06/2026": 7.0,
      "15/06/2026": 7.0,
      "22/06/2026": 9.0,
      "06/07/2026": 15.0,
      "27/07/2026": 6.5,
      "03/08/2026": 6.5,
      "10/08/2026": 4.0,
      "17/08/2026": 6.0,
      "24/08/2026": 1.5,
      "31/08/2026": 4.5,
      "21/09/2026": 12.5,
      "28/09/2026": 6.0,
      "05/10/2026": 10.5,
      "19/10/2026": 13.5
    }
  },
  "p_30": {
    "nome": "Victão",
    "pontosTotais": 116.0,
    "pontosPorData": {
      "13/07/2026": 11.0,
      "20/07/2026": 13.0,
      "27/07/2026": 13.0,
      "03/08/2026": 5.5,
      "10/08/2026": 11.5,
      "17/08/2026": 13.0,
      "24/08/2026": 16.0,
      "31/08/2026": 4.5,
      "21/09/2026": 8.0,
      "05/10/2026": 3.5,
      "12/10/2026": 9.5,
      "19/10/2026": 7.5
    }
  },
  "p_39": {
    "nome": "Ronildo",
    "pontosTotais": 28.5,
    "pontosPorData": {
      "09/06/2026": 10.5,
      "15/06/2026": 12.5,
      "22/06/2026": 5.5
    }
  },
  "p_6": {
    "nome": "Douglas",
    "pontosTotais": 107.0,
    "pontosPorData": {
      "06/07/2026": 4.0,
      "13/07/2026": 10.0,
      "20/07/2026": 7.0,
      "27/07/2026": 7.0,
      "03/08/2026": 6.5,
      "10/08/2026": 9.0,
      "17/08/2026": 13.5,
      "24/08/2026": 9.5,
      "31/08/2026": 5.5,
      "14/09/2026": 3.5,
      "21/09/2026": 1.0,
      "28/09/2026": 3.0,
      "05/10/2026": 3.0,
      "12/10/2026": 10.0,
      "19/10/2026": 14.5
    }
  },
  "p_23": {
    "nome": "Thierry",
    "pontosTotais": 48.5,
    "pontosPorData": {
      "01/06/2026": 10.0,
      "27/07/2026": 13.0,
      "03/08/2026": 7.5,
      "10/08/2026": 4.0,
      "17/08/2026": 6.0,
      "05/10/2026": 8.0
    }
  },
  "p_extra_17": {
    "nome": "Fabio",
    "pontosTotais": 100.0,
    "pontosPorData": {
      "06/07/2026": 4.0,
      "13/07/2026": 4.0,
      "27/07/2026": 13.5,
      "03/08/2026": 6.0,
      "17/08/2026": 4.0,
      "24/08/2026": 1.0,
      "31/08/2026": 5.0,
      "14/09/2026": 14.0,
      "21/09/2026": 12.5,
      "28/09/2026": 10.0,
      "05/10/2026": 6.5,
      "12/10/2026": 11.5,
      "19/10/2026": 8.0
    }
  },
  "p_rank_19": {
    "nome": "André",
    "pontosTotais": 20.5,
    "pontosPorData": {
      "09/06/2026": 6.5,
      "15/06/2026": 7.0,
      "22/06/2026": 7.0
    }
  },
  "p_extra_25": {
    "nome": "Fontainha",
    "pontosTotais": 80.5,
    "pontosPorData": {
      "06/07/2026": 4.0,
      "13/07/2026": 5.0,
      "20/07/2026": 8.0,
      "03/08/2026": 5.5,
      "10/08/2026": 9.0,
      "17/08/2026": 12.5,
      "24/08/2026": 15.5,
      "31/08/2026": 17.5,
      "14/09/2026": 3.5
    }
  },
  "p_36": {
    "nome": "Neo",
    "pontosTotais": 10.0,
    "pontosPorData": {
      "01/06/2026": 10.0
    }
  },
  "p_rank_22": {
    "nome": "Maninho",
    "pontosTotais": 10.0,
    "pontosPorData": {
      "15/06/2026": 3.0,
      "22/06/2026": 7.0
    }
  },
  "p_27": {
    "nome": "Wand",
    "pontosTotais": 31.5,
    "pontosPorData": {
      "01/06/2026": 9.5,
      "12/10/2026": 11.0,
      "19/10/2026": 11.0
    }
  },
  "p_rank_24": {
    "nome": "Léo Duarte",
    "pontosTotais": 9.0,
    "pontosPorData": {
      "09/06/2026": 6.0,
      "15/06/2026": 3.0
    }
  },
  "p_34": {
    "nome": "Guilherme Almeida",
    "pontosTotais": 9.0,
    "pontosPorData": {
      "01/06/2026": 9.0
    }
  },
  "p_29": {
    "nome": "Yuri",
    "pontosTotais": 7.0,
    "pontosPorData": {
      "20/07/2026": 7.0
    }
  },
  "p_rank_27": {
    "nome": "Foro",
    "pontosTotais": 6.0,
    "pontosPorData": {
      "20/07/2026": 1.0,
      "10/08/2026": 1.0,
      "21/09/2026": 1.0,
      "12/10/2026": 3.0
    }
  },
  "p_38": {
    "nome": "Jader",
    "pontosTotais": 0.0,
    "pontosPorData": {}
  },
  "p_18": {
    "nome": "Juan",
    "pontosTotais": 0.0,
    "pontosPorData": {}
  },
  "p_1": {
    "nome": "Rechan",
    "pontosTotais": 27.0,
    "pontosPorData": {
      "31/08/2026": 4.0,
      "14/09/2026": 15.0,
      "21/09/2026": 1.0,
      "28/09/2026": 7.0
    }
  },
  "p_20": {
    "nome": "Thiago",
    "pontosTotais": 0.0,
    "pontosPorData": {}
  },
  "p_22": {
    "nome": "Caio",
    "pontosTotais": 17.0,
    "pontosPorData": {
      "12/10/2026": 10.0,
      "19/10/2026": 7.0
    }
  },
  "p_16": {
    "nome": "Foró",
    "pontosTotais": 0.0,
    "pontosPorData": {}
  },
  "p_9": {
    "nome": "Rogério",
    "pontosTotais": 0.0,
    "pontosPorData": {}
  },
  "p_15": {
    "nome": "Fábio",
    "pontosTotais": 0.0,
    "pontosPorData": {}
  }
};
