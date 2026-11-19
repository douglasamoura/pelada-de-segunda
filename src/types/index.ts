// ============================================
// TIPOS CENTRAIS DO APP - PELADA DE SEGUNDA
// ============================================

// --- Configuração da Pelada ---
export interface ConfigPelada {
  valorMensalidade: number;
  valorDiarista: number;
  diaVencimentoMensalidade: number;
  valorEmDinheiro: number;
  duracaoPartidaMinutos: number;
  jogadoresPorTime: number;
  quantidadeTimes: number;
  pontosVitoria: number;
  pontosEmpateVantagem: number;
  pontosParticipacaoGol: number;
}

// --- Jogador ---
export type StatusJogador = 'Mensalista' | 'Mensalista Ausente' | 'Mensalista Temporário' | 'Diarista' | 'Goleiro';
export type PosicaoJogador = 'Linha' | 'Goleiro';
export type PapelUsuario = 'admin' | 'jogador';

export interface AtributosJogador {
  velocidade: number;
  chute: number;
  marcacao: number;
  passe: number;
  habilidade: number;
  overall: number;
}

export interface Jogador extends AtributosJogador {
  id: string;
  nome: string;
  status: StatusJogador;
  posicao: PosicaoJogador;
  avatar: string;
  ehAdmin?: boolean;
  papel?: PapelUsuario;
  login?: string; // login normalizado (sem acentos, lowercase)
  senhaHash?: string; // hash bcrypt da senha
  criadoEm?: string; // ISO date
  atualizadoEm?: string; // ISO date
}

export interface JogadorFormData {
  nome: string;
  status: StatusJogador;
  posicao: PosicaoJogador;
  avatar: string;
  velocidade: number;
  chute: number;
  marcacao: number;
  passe: number;
  habilidade: number;
  overall: number;
  ehAdmin?: boolean;
  senha?: string; // apenas no cadastro
}

// --- Usuário Autenticado (Sessão) ---
export interface UsuarioSessao extends Jogador {
  login: string;
  ehAdmin: boolean;
  papel: PapelUsuario;
  autenticadoEm: string; // ISO date
}

// --- Pagamentos ---
export interface PagamentoMensalidade {
  jogadorId: string;
  mes: number; // 1-12
  ano: number;
  pago: boolean;
  valor: number;
  dataPagamento?: string; // ISO date
  observacao?: string;
}

export type PagamentosMap = Record<string, Record<string, number | null>>; // jogadorId -> "mes" -> valor pago (null = não vencido/não informado)

// --- Financeiro (Caixa) ---
export type TipoLancamento = 'entrada' | 'saida';

export interface LancamentoFinanceiro {
  id: string;
  tipo: TipoLancamento;
  categoria: string;
  descricao: string;
  valor: number;
  data: string; // ISO date
  jogadorId?: string; // se relacionado a jogador (ex: mensalidade)
  comprovante?: string; // base64 ou URL
  criadoEm: string;
  atualizadoEm: string;
}

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: TipoLancamento;
  cor?: string;
  icone?: string;
  ativa: boolean;
}

// --- Partidas / Rodadas ---
export interface TimePartida {
  id: number;
  nome: string;
  cor: string;
  textColor?: string;
  jogadores: Jogador[];
  goleiro?: Jogador;
  poderTotal: number;
  poderMedio: number;
  gols?: number;
}

export interface EventoPartida {
  id: string;
  tipo: 'gol' | 'gol_contra' | 'assistencia' | 'cartao_amarelo' | 'cartao_vermelho' | 'substituicao' | 'observacao';
  timeId: number; // 1, 2, 3 (casa, visitante, espera)
  jogadorId: string;
  jogadorNome: string;
  minuto: number; // minuto do jogo (0-7)
  descricao?: string;
  createdAt: string;
}

export interface PartidaRealizada {
  id: string;
  data: string; // ISO date (início da partida)
  timeCasa: TimePartida;
  timeVisitante: TimePartida;
  timeEspera: TimePartida;
  golsCasa: number;
  golsVisitante: number;
  eventos: EventoPartida[];
  duracaoSegundos: number;
  finalizadaEm: string;
  observacoes?: string;
}

export interface RodadaCompleta {
  id: string;
  data: string; // ISO date (segunda-feira)
  partidas: PartidaRealizada[];
  jogadoresConfirmados: Jogador[];
  filaEspera: Jogador[];
  desfalques: Jogador[];
  createdAt: string;
  finalizadaEm?: string;
}

// --- Ranking / Histórico de Pontuação ---
export interface PontuacaoJogadorData {
  [dataISO: string]: number; // "2026-11-16" -> pontos
}

export interface HistoricoRankingJogador {
  nome: string;
  pontosTotais: number;
  pontosPorData: PontuacaoJogadorData;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols: number;
  assistencias: number;
  jogos: number;
  mvpCount: number; // vezes que foi o melhor da rodada
}

export type HistoricoRanking = Record<string, HistoricoRankingJogador>; // jogadorId -> stats

// --- Presença ---
export interface PresencaConfirmada {
  jogadorId: string;
  confirmadoEm: string; // ISO date
  tipo: 'mensalista' | 'diarista' | 'goleiro';
}

export interface FilaEsperaItem {
  jogadorId: string;
  entrouNaFilaEm: string; // ISO date
  posicao: number;
}

export interface Desfalque {
  jogadorId: string;
  jogadorNome: string;
  posicao: PosicaoJogador;
  horaDesfalque: string; // HH:mm
  motivo?: string;
  data: string; // ISO date
}

// --- Notificações ---
export type TipoNotificacao = 
  | 'agenda_aberta' 
  | 'vencimento_mensalidade' 
  | 'confirmacao_presenca' 
  | 'rodada_finalizada' 
  | 'pagamento_recebido' 
  | 'sistema';

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  data: string; // ISO date
  lida: boolean;
  jogadorId?: string; // se direcionada a jogador específico
  metadata?: Record<string, unknown>;
}

// --- Estado Global da Aplicação ---
export interface AppState {
  // Config
  config: ConfigPelada;
  
  // Jogadores
  players: Jogador[];
  
  // Pagamentos
  pagamentos: PagamentosMap;
  
  // Financeiro
  entradas: LancamentoFinanceiro[];
  saidas: LancamentoFinanceiro[];
  categoriasEntrada: CategoriaFinanceira[];
  categoriasSaida: CategoriaFinanceira[];
  
  // Partidas/Histórico
  historicoRanking: HistoricoRanking;
  partidasHistorico: PartidaRealizada[];
  rodadasHistorico: RodadaCompleta[];
  
  // Sessão
  usuarioLogado: UsuarioSessao | null;
  
  // UI State
  abaAtiva: 'presenca' | 'partidas' | 'ranking' | 'jogadores' | 'caixa' | 'historico' | 'configuracoes';
  tema: 'claro' | 'escuro' | 'sistema';
  
  // Notificações
  notificacoes: Notificacao[];
}

// --- Actions para useReducer ---
export type AppAction =
  | { type: 'SET_CONFIG'; payload: ConfigPelada }
  | { type: 'SET_PLAYERS'; payload: Jogador[] }
  | { type: 'UPDATE_PLAYER'; payload: Jogador }
  | { type: 'REMOVE_PLAYER'; payload: string } // jogadorId
  | { type: 'SET_PAGAMENTOS'; payload: PagamentosMap }
  | { type: 'UPDATE_PAGAMENTO'; payload: { jogadorId: string; chave: string; pago: number | null } }
  | { type: 'SET_ENTRADAS'; payload: LancamentoFinanceiro[] }
  | { type: 'ADD_ENTRADA'; payload: LancamentoFinanceiro }
  | { type: 'UPDATE_ENTRADA'; payload: LancamentoFinanceiro }
  | { type: 'REMOVE_ENTRADA'; payload: string }
  | { type: 'SET_SAIDAS'; payload: LancamentoFinanceiro[] }
  | { type: 'ADD_SAIDA'; payload: LancamentoFinanceiro }
  | { type: 'UPDATE_SAIDA'; payload: LancamentoFinanceiro }
  | { type: 'REMOVE_SAIDA'; payload: string }
  | { type: 'SET_CATEGORIAS_ENTRADA'; payload: CategoriaFinanceira[] }
  | { type: 'SET_CATEGORIAS_SAIDA'; payload: CategoriaFinanceira[] }
  | { type: 'SET_HISTORICO_RANKING'; payload: HistoricoRanking }
  | { type: 'UPDATE_HISTORICO_RANKING'; payload: { jogadorId: string; data: string; pontos: number } }
  | { type: 'SET_PARTIDAS_HISTORICO'; payload: PartidaRealizada[] }
  | { type: 'ADD_PARTIDA_REALIZADA'; payload: PartidaRealizada }
  | { type: 'SET_RODADAS_HISTORICO'; payload: RodadaCompleta[] }
  | { type: 'ADD_RODADA_COMPLETA'; payload: RodadaCompleta }
  | { type: 'SET_USUARIO_LOGADO'; payload: UsuarioSessao | null }
  | { type: 'SET_ABA_ATIVA'; payload: AppState['abaAtiva'] }
  | { type: 'SET_TEMA'; payload: AppState['tema'] }
  | { type: 'ADD_NOTIFICACAO'; payload: Notificacao }
  | { type: 'MARCAR_NOTIFICACAO_LIDA'; payload: string }
  | { type: 'LIMPAR_NOTIFICACOES_ANTIGAS'; payload: number } // dias
  | { type: 'RESET_APP' }
  | { type: 'HYDRATE'; payload: Partial<AppState> };

// --- Props dos Componentes Principais ---
export interface TabPropsBase {
  ehAdmin: boolean;
  usuarioLogado: UsuarioSessao | null;
}

export interface PresencaTabProps extends TabPropsBase {
  players: Jogador[];
  onEnviarParaSorteio: (confirmados: Jogador[]) => void;
}

export interface PartidasTabProps extends TabPropsBase {
  timesAtuais: TimePartida[] | null;
  setTimesAtuais: (times: TimePartida[]) => void;
  players: Jogador[];
  onUpdatePlayers: (players: Jogador[]) => Promise<void>;
  jogadoresPreSelecionados: Jogador[] | null;
  onAdicionarPontosRodada: (pontos: Record<string, { nome: string; pontos: number }>, dataStr: string) => Promise<void>;
}

export interface RankingTabProps extends TabPropsBase {
  players: Jogador[];
  historicoRanking: HistoricoRanking;
  onUpdateHistoricoRanking: (historico: HistoricoRanking) => Promise<void>;
}

export interface PlayersTabProps extends TabPropsBase {
  players: Jogador[];
  onUpdatePlayers: (players: Jogador[]) => Promise<void>;
}

export interface FinanceiroTabProps extends TabPropsBase {
  config: ConfigPelada;
  onUpdateConfig: (config: ConfigPelada) => Promise<void>;
  players: Jogador[];
  pagamentos: PagamentosMap;
  onUpdatePagamentos: (pagamentos: PagamentosMap) => Promise<void>;
  entradas: LancamentoFinanceiro[];
  onUpdateEntradas: (entradas: LancamentoFinanceiro[]) => Promise<void>;
  saidas: LancamentoFinanceiro[];
  onUpdateSaidas: (saidas: LancamentoFinanceiro[]) => Promise<void>;
  categoriasEntrada: CategoriaFinanceira[];
  onUpdateCategoriasEntrada: (cats: CategoriaFinanceira[]) => Promise<void>;
  categoriasSaida: CategoriaFinanceira[];
  onUpdateCategoriasSaida: (cats: CategoriaFinanceira[]) => Promise<void>;
}

// --- Utilitários ---
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;