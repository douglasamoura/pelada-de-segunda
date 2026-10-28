// Dados 100% alinhados com a planilha oficial da Pelada de Segunda

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

export const STATUS_CORES = {
  'Mensalista': { bg: '#dcfce7', text: '#15803d', border: '#86efac', rotulo: 'Mensalista' },
  'Mensalista Ausente': { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5', rotulo: 'Mensalista Ausente' },
  'Mensalista Temporário': { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd', rotulo: 'Mensalista Temp.' },
  'Diarista': { bg: '#fef3c7', text: '#b45309', border: '#fcd34d', rotulo: 'Diarista' },
  'Goleiro': { bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe', rotulo: 'Goleiro' },
};

export const CATEGORIAS_ENTRADA = [
  'Diarista',
  'Caixa Anterior',
  'Churrasco/Evento',
  'Patrocínio',
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
  "valorMensalidade": 75.0,
  "valorDiarista": 20.0,
  "diaVencimentoMensalidade": 10,
  "valorEmDinheiro": 0.0,
  "duracaoPartidaMinutos": 7,
  "jogadoresPorTime": 5,
  "quantidadeTimes": 3,
  "pontosVitoria": 3.0,
  "pontosEmpateVantagem": 1.0,
  "pontosParticipacaoGol": 0.5
};

export const JOGADORES_INICIAIS = [
  {
    "id": "j_alex",
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
    "id": "j_bahia",
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
    "id": "j_brug",
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
    "id": "j_daibert",
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
    "id": "j_douglas",
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
    "id": "j_diogo",
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
    "id": "j_felipe",
    "nome": "Felipe",
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
    "id": "j_felipo",
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
    "id": "j_rogerio",
    "nome": "Rogerio",
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
    "id": "j_rechan",
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
    "id": "j_guilherme",
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
    "id": "j_filipao",
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
    "id": "j_lucao",
    "nome": "Lucao",
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
    "id": "j_alan",
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
    "id": "j_fabio",
    "nome": "Fabio",
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
    "id": "j_juan",
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
    "id": "j_thiago",
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
    "id": "j_victao",
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
    "id": "j_jader",
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
    "id": "j_yuri",
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
    "id": "j_thierry",
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
    "id": "j_fontainha",
    "nome": "Fontainha",
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
    "id": "j_foro",
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
    "id": "j_gabriel",
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
    "id": "j_peterson",
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
    "id": "j_leo_sanfona",
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
    "id": "j_caio",
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
    "id": "j_david",
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
    "id": "j_curinga",
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
    "id": "j_leo_lucao",
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
    "id": "j_wand",
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
    "id": "j_alan_neo",
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
    "id": "j_balboa",
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
    "id": "j_andre",
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
    "id": "j_guilherme_almeida",
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
    "id": "j_quibim",
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
    "id": "j_neo",
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
    "id": "j_rafael",
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
    "id": "j_ronildo",
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
  }
];

export const PAGAMENTOS_INICIAIS = {
  "j_alex": {
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
  "j_bahia": {
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
  "j_brug": {
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
  "j_daibert": {
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
  "j_douglas": {
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
  "j_diogo": {
    "Janeiro": 0.0,
    "Fevereiro": 75.0,
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
  "j_felipe": {
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
  "j_felipo": {
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
  "j_rogerio": {
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
  "j_rechan": {
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
  "j_guilherme": {
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
  "j_filipao": {
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
  "j_lucao": {
    "Janeiro": 0.0,
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
  "j_alan": {
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
  "j_fabio": {
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
  "j_juan": {
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
  "j_thiago": {
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
  "j_victao": {
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
  "j_jader": {
    "Janeiro": 60.0,
    "Fevereiro": 75.0,
    "Março": 75.0,
    "Abril": 0.0,
    "Maio": 0.0,
    "Junho": 0.0,
    "Julho": null,
    "Agosto": null,
    "Setembro": null,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "j_yuri": {
    "Janeiro": 60.0,
    "Fevereiro": 75.0,
    "Março": 0.0,
    "Abril": 75.0,
    "Maio": 0.0,
    "Junho": 0.0,
    "Julho": null,
    "Agosto": null,
    "Setembro": null,
    "Outubro": null,
    "Novembro": null,
    "Dezembro": null
  },
  "j_thierry": {
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
  },
  "j_fontainha": {
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
    "data": "Início 2026"
  },
  {
    "id": "ent_2",
    "descricao": "Diaristas 12/01 a 23/03",
    "valor": 520.0,
    "categoria": "Diarista",
    "data": "12/01 a 23/03"
  },
  {
    "id": "ent_3",
    "descricao": "Diaristas 30/03 a 11/05",
    "valor": 340.0,
    "categoria": "Diarista",
    "data": "30/03 a 11/05"
  },
  {
    "id": "ent_4",
    "descricao": "Diaristas 18/05 a 22/06",
    "valor": 520.0,
    "categoria": "Diarista",
    "data": "18/05 a 22/06"
  },
  {
    "id": "ent_5",
    "descricao": "Diarista 06/07",
    "valor": 20.0,
    "categoria": "Diarista",
    "data": "06/07/2026"
  },
  {
    "id": "ent_6",
    "descricao": "Diarista 13/07",
    "valor": 40.0,
    "categoria": "Diarista",
    "data": "13/07/2026"
  },
  {
    "id": "ent_7",
    "descricao": "Diaristas 20/07",
    "valor": 40.0,
    "categoria": "Diarista",
    "data": "20/07/2026"
  },
  {
    "id": "ent_8",
    "descricao": "Diaristas 27/07",
    "valor": 40.0,
    "categoria": "Diarista",
    "data": "27/07/2026"
  },
  {
    "id": "ent_9",
    "descricao": "Diaristas 03/08",
    "valor": 60.0,
    "categoria": "Diarista",
    "data": "03/08/2026"
  },
  {
    "id": "ent_10",
    "descricao": "Diaristas 10/08",
    "valor": 60.0,
    "categoria": "Diarista",
    "data": "10/08/2026"
  },
  {
    "id": "ent_11",
    "descricao": "Diaristas 17/08",
    "valor": 60.0,
    "categoria": "Diarista",
    "data": "17/08/2026"
  },
  {
    "id": "ent_12",
    "descricao": "Diaristas 24/08",
    "valor": 40.0,
    "categoria": "Diarista",
    "data": "24/08/2026"
  },
  {
    "id": "ent_13",
    "descricao": "Diaristas 31/08",
    "valor": 60.0,
    "categoria": "Diarista",
    "data": "31/08/2026"
  },
  {
    "id": "ent_14",
    "descricao": "Diaristas 14/09",
    "valor": 20.0,
    "categoria": "Diarista",
    "data": "14/09/2026"
  },
  {
    "id": "ent_15",
    "descricao": "Diaristas 21/09",
    "valor": 20.0,
    "categoria": "Diarista",
    "data": "21/09/2026"
  },
  {
    "id": "ent_16",
    "descricao": "Diaristas 05/10",
    "valor": 20.0,
    "categoria": "Diarista",
    "data": "05/10/2026"
  },
  {
    "id": "ent_17",
    "descricao": "Diaristas 12/10",
    "valor": 40.0,
    "categoria": "Diarista",
    "data": "12/10/2026"
  },
  {
    "id": "ent_18",
    "descricao": "Diaristas 19/10",
    "valor": 20.0,
    "categoria": "Diarista",
    "data": "19/10/2026"
  },
  {
    "id": "ent_19",
    "descricao": "Diaristas 27/10",
    "valor": 20.0,
    "categoria": "Diarista",
    "data": "27/10/2026"
  }
];

export const SAIDAS_INICIAIS = [
  {
    "id": "sai_1",
    "descricao": "Quadra jan/fev",
    "valor": 1380.0,
    "categoria": "Quadra",
    "data": "Fevereiro"
  },
  {
    "id": "sai_2",
    "descricao": "Quadra março",
    "valor": 1150.0,
    "categoria": "Quadra",
    "data": "Março"
  },
  {
    "id": "sai_3",
    "descricao": "Quadra abril",
    "valor": 920.0,
    "categoria": "Quadra",
    "data": "Abril"
  },
  {
    "id": "sai_4",
    "descricao": "Choop brinde",
    "valor": 60.0,
    "categoria": "Chopp/Bebidas",
    "data": "Abril"
  },
  {
    "id": "sai_5",
    "descricao": "Quadra maio",
    "valor": 920.0,
    "categoria": "Quadra",
    "data": "Maio"
  },
  {
    "id": "sai_6",
    "descricao": "Quadra Junho",
    "valor": 1150.0,
    "categoria": "Quadra",
    "data": "Junho"
  },
  {
    "id": "sai_7",
    "descricao": "Quadra Julho",
    "valor": 920.0,
    "categoria": "Quadra",
    "data": "Julho"
  },
  {
    "id": "sai_8",
    "descricao": "Quadra Agosto",
    "valor": 1150.0,
    "categoria": "Quadra",
    "data": "Agosto"
  },
  {
    "id": "sai_9",
    "descricao": "Quadra Setembro",
    "valor": 690.0,
    "categoria": "Quadra",
    "data": "Setembro"
  },
  {
    "id": "sai_10",
    "descricao": "Churrasco Setembro",
    "valor": 136.0,
    "categoria": "Churrasco/Comida",
    "data": "Setembro"
  },
  {
    "id": "sai_11",
    "descricao": "Quadra Outubro",
    "valor": 920.0,
    "categoria": "Quadra",
    "data": "Outubro"
  }
];

export const HISTORICO_PONTUACAO_INICIAL = {
  "j_lucao": {
    "nome": "Lucao",
    "pontosTotais": 176.5,
    "pontosPorData": {}
  },
  "j_guilherme": {
    "nome": "Guilherme",
    "pontosTotais": 175.5,
    "pontosPorData": {}
  },
  "j_diogo": {
    "nome": "Diogo",
    "pontosTotais": 169.5,
    "pontosPorData": {}
  },
  "j_rogerio": {
    "nome": "Rogerio",
    "pontosTotais": 155.0,
    "pontosPorData": {}
  },
  "j_filipao": {
    "nome": "Filipão",
    "pontosTotais": 153.0,
    "pontosPorData": {}
  },
  "j_bahia": {
    "nome": "Bahia",
    "pontosTotais": 152.5,
    "pontosPorData": {}
  },
  "j_felipo": {
    "nome": "Felipo",
    "pontosTotais": 147.5,
    "pontosPorData": {}
  },
  "j_daibert": {
    "nome": "Daibert",
    "pontosTotais": 144.5,
    "pontosPorData": {}
  },
  "j_felipe": {
    "nome": "Felipe",
    "pontosTotais": 140.5,
    "pontosPorData": {}
  },
  "j_alex": {
    "nome": "Alex",
    "pontosTotais": 133.0,
    "pontosPorData": {}
  },
  "j_brug": {
    "nome": "Brug",
    "pontosTotais": 132.5,
    "pontosPorData": {}
  },
  "j_victao": {
    "nome": "Victão",
    "pontosTotais": 116.0,
    "pontosPorData": {}
  },
  "j_alan": {
    "nome": "Alan",
    "pontosTotais": 109.5,
    "pontosPorData": {}
  },
  "j_douglas": {
    "nome": "Douglas",
    "pontosTotais": 107.0,
    "pontosPorData": {}
  },
  "j_fabio": {
    "nome": "Fabio",
    "pontosTotais": 100.0,
    "pontosPorData": {}
  },
  "j_fontainha": {
    "nome": "Fontainha",
    "pontosTotais": 80.5,
    "pontosPorData": {}
  },
  "j_thierry": {
    "nome": "Thierry",
    "pontosTotais": 48.5,
    "pontosPorData": {}
  },
  "j_wand": {
    "nome": "Wand",
    "pontosTotais": 31.5,
    "pontosPorData": {}
  },
  "j_ronildo": {
    "nome": "Ronildo",
    "pontosTotais": 28.5,
    "pontosPorData": {}
  },
  "j_rechan": {
    "nome": "Rechan",
    "pontosTotais": 27.0,
    "pontosPorData": {}
  },
  "j_andre": {
    "nome": "Andre",
    "pontosTotais": 20.5,
    "pontosPorData": {}
  },
  "j_caio": {
    "nome": "Caio",
    "pontosTotais": 17.0,
    "pontosPorData": {}
  },
  "j_peterson": {
    "nome": "Peterson",
    "pontosTotais": 20.0,
    "pontosPorData": {}
  },
  "j_yuri": {
    "nome": "Yuri",
    "pontosTotais": 7.0,
    "pontosPorData": {}
  },
  "j_foro": {
    "nome": "Foró",
    "pontosTotais": 6.0,
    "pontosPorData": {}
  },
  "j_thiago": {
    "nome": "Thiago",
    "pontosTotais": 0.0,
    "pontosPorData": {}
  },
  "j_jader": {
    "nome": "Jader",
    "pontosTotais": 0.0,
    "pontosPorData": {}
  },
  "j_juan": {
    "nome": "Juan",
    "pontosTotais": 0.0,
    "pontosPorData": {}
  }
};
