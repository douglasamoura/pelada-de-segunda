import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppState,
  AppAction,
  ConfigPelada,
  Jogador,
  PagamentosMap,
  LancamentoFinanceiro,
  CategoriaFinanceira,
  HistoricoRanking,
  PartidaRealizada,
  RodadaCompleta,
  UsuarioSessao,
  Notificacao,
} from '../types';
import { StorageService } from '../storage/storage';
import { CONFIG_PADRAO, JOGADORES_INICIAIS, PAGAMENTOS_INICIAIS, ENTRADAS_INICIAIS, SAIDAS_INICIAIS, HISTORICO_PONTUACAO_INICIAL, CATEGORIAS_ENTRADA, CATEGORIAS_SAIDA } from '../data/initialData';

// ============================================
// ESTADO INICIAL
// ============================================

const inicialState: AppState = {
  config: CONFIG_PADRAO,
  players: JOGADORES_INICIAIS,
  pagamentos: PAGAMENTOS_INICIAIS,
  entradas: ENTRADAS_INICIAIS,
  saidas: SAIDAS_INICIAIS,
  categoriasEntrada: CATEGORIAS_ENTRADA.map((nome, index) => ({
    id: `cat_ent_${index}`,
    nome,
    tipo: 'entrada',
    ativa: true,
  })),
  categoriasSaida: CATEGORIAS_SAIDA.map((nome, index) => ({
    id: `cat_sai_${index}`,
    nome,
    tipo: 'saida',
    ativa: true,
  })),
  historicoRanking: HISTORICO_PONTUACAO_INICIAL,
  partidasHistorico: [],
  rodadasHistorico: [],
  usuarioLogado: null,
  abaAtiva: 'presenca',
  tema: 'escuro',
  notificacoes: [],
};

// ============================================
// REDUCER
// ============================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Config
    case 'SET_CONFIG':
      return { ...state, config: action.payload };

    // Players
    case 'SET_PLAYERS':
      return { ...state, players: action.payload };
    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: state.players.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.payload),
      };

    // Pagamentos
    case 'SET_PAGAMENTOS':
      return { ...state, pagamentos: action.payload };
    case 'UPDATE_PAGAMENTO': {
      const { jogadorId, chave, pago } = action.payload;
      const novosPagamentos = { ...state.pagamentos };
      if (!novosPagamentos[jogadorId]) novosPagamentos[jogadorId] = {};
      novosPagamentos[jogadorId][chave] = pago;
      return { ...state, pagamentos: novosPagamentos };
    }

    // Entradas
    case 'SET_ENTRADAS':
      return { ...state, entradas: action.payload };
    case 'ADD_ENTRADA':
      return { ...state, entradas: [action.payload, ...state.entradas] };
    case 'UPDATE_ENTRADA':
      return {
        ...state,
        entradas: state.entradas.map((e) => (e.id === action.payload.id ? action.payload : e)),
      };
    case 'REMOVE_ENTRADA':
      return {
        ...state,
        entradas: state.entradas.filter((e) => e.id !== action.payload),
      };

    // Saídas
    case 'SET_SAIDAS':
      return { ...state, saidas: action.payload };
    case 'ADD_SAIDA':
      return { ...state, saidas: [action.payload, ...state.saidas] };
    case 'UPDATE_SAIDA':
      return {
        ...state,
        saidas: state.saidas.map((s) => (s.id === action.payload.id ? action.payload : s)),
      };
    case 'REMOVE_SAIDA':
      return {
        ...state,
        saidas: state.saidas.filter((s) => s.id !== action.payload),
      };

    // Categorias
    case 'SET_CATEGORIAS_ENTRADA':
      return { ...state, categoriasEntrada: action.payload };
    case 'SET_CATEGORIAS_SAIDA':
      return { ...state, categoriasSaida: action.payload };

    // Histórico Ranking
    case 'SET_HISTORICO_RANKING':
      return { ...state, historicoRanking: action.payload };
    case 'UPDATE_HISTORICO_RANKING': {
      const { jogadorId, data, pontos } = action.payload;
      const novoHistorico = { ...state.historicoRanking };
      if (!novoHistorico[jogadorId]) {
        const jogador = state.players.find((p) => p.id === jogadorId);
        novoHistorico[jogadorId] = {
          nome: jogador?.nome || 'Desconhecido',
          pontosTotais: 0,
          pontosPorData: {},
          vitorias: 0,
          empates: 0,
          derrotas: 0,
          gols: 0,
          assistencias: 0,
          jogos: 0,
          mvpCount: 0,
        };
      }
      const atual = novoHistorico[jogadorId].pontosPorData[data] || 0;
      novoHistorico[jogadorId].pontosPorData[data] = Math.round((atual + pontos) * 10) / 10;
      novoHistorico[jogadorId].pontosTotais = Math.round(
        Object.values(novoHistorico[jogadorId].pontosPorData).reduce((a, b) => a + b, 0) * 10
      ) / 10;
      return { ...state, historicoRanking: novoHistorico };
    }

    // Partidas
    case 'SET_PARTIDAS_HISTORICO':
      return { ...state, partidasHistorico: action.payload };
    case 'ADD_PARTIDA_REALIZADA':
      return { ...state, partidasHistorico: [action.payload, ...state.partidasHistorico] };

    // Rodadas
    case 'SET_RODADAS_HISTORICO':
      return { ...state, rodadasHistorico: action.payload };
    case 'ADD_RODADA_COMPLETA':
      return { ...state, rodadasHistorico: [action.payload, ...state.rodadasHistorico] };

    // Sessão
    case 'SET_USUARIO_LOGADO':
      return { ...state, usuarioLogado: action.payload };

    // UI
    case 'SET_ABA_ATIVA':
      return { ...state, abaAtiva: action.payload };
    case 'SET_TEMA':
      return { ...state, tema: action.payload };

    // Notificações
    case 'ADD_NOTIFICACAO':
      return { ...state, notificacoes: [action.payload, ...state.notificacoes] };
    case 'MARCAR_NOTIFICACAO_LIDA':
      return {
        ...state,
        notificacoes: state.notificacoes.map((n) =>
          n.id === action.payload ? { ...n, lida: true } : n
        ),
      };
    case 'LIMPAR_NOTIFICACOES_ANTIGAS': {
      const cutoff = Date.now() - action.payload * 24 * 60 * 60 * 1000;
      return {
        ...state,
        notificacoes: state.notificacoes.filter((n) => new Date(n.data).getTime() > cutoff),
      };
    }

    // Reset / Hydrate
    case 'RESET_APP':
      return inicialState;
    case 'HYDRATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helpers async que persistem no storage
  hydrate: () => Promise<void>;
  persistConfig: (config: ConfigPelada) => Promise<void>;
  persistPlayers: (players: Jogador[]) => Promise<void>;
  persistPagamentos: (pagamentos: PagamentosMap) => Promise<void>;
  persistEntradas: (entradas: LancamentoFinanceiro[]) => Promise<void>;
  persistSaidas: (saidas: LancamentoFinanceiro[]) => Promise<void>;
  persistCategorias: (entradas: CategoriaFinanceira[], saidas: CategoriaFinanceira[]) => Promise<void>;
  persistHistoricoRanking: (historico: HistoricoRanking) => Promise<void>;
  persistPartidas: (partidas: PartidaRealizada[]) => Promise<void>;
  persistRodadas: (rodadas: RodadaCompleta[]) => Promise<void>;
  login: (usuario: UsuarioSessao) => Promise<void>;
  logout: () => Promise<void>;
  addNotificacao: (notif: Omit<Notificacao, 'id' | 'data' | 'lida'>) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, inicialState);

  // --- Hydrate: carrega tudo do AsyncStorage na inicialização ---
  const hydrate = useCallback(async () => {
    try {
      const dados = await StorageService.carregarDadosCompletos();
      dispatch({ type: 'HYDRATE', payload: dados });
      
      // Recupera sessão ativa
      const { AuthService } = await import('../services/authService');
      const sessaoSalva = await AuthService.obterSessaoAtiva();
      if (sessaoSalva) {
        dispatch({ type: 'SET_USUARIO_LOGADO', payload: sessaoSalva });
      }
    } catch (e) {
      console.error('Erro no hydrate:', e);
    }
  }, []);

  // --- Persistência individual ---
  const persistConfig = useCallback(async (config: ConfigPelada) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
    await StorageService.salvarConfig(config);
  }, []);

  const persistPlayers = useCallback(async (players: Jogador[]) => {
    dispatch({ type: 'SET_PLAYERS', payload: players });
    await StorageService.salvarPlayers(players);
  }, []);

  const persistPagamentos = useCallback(async (pagamentos: PagamentosMap) => {
    dispatch({ type: 'SET_PAGAMENTOS', payload: pagamentos });
    await StorageService.salvarPagamentos(pagamentos);
  }, []);

  const persistEntradas = useCallback(async (entradas: LancamentoFinanceiro[]) => {
    dispatch({ type: 'SET_ENTRADAS', payload: entradas });
    await StorageService.salvarEntradas(entradas);
  }, []);

  const persistSaidas = useCallback(async (saidas: LancamentoFinanceiro[]) => {
    dispatch({ type: 'SET_SAIDAS', payload: saidas });
    await StorageService.salvarSaidas(saidas);
  }, []);

  const persistCategorias = useCallback(async (entradas: CategoriaFinanceira[], saidas: CategoriaFinanceira[]) => {
    dispatch({ type: 'SET_CATEGORIAS_ENTRADA', payload: entradas });
    dispatch({ type: 'SET_CATEGORIAS_SAIDA', payload: saidas });
    await StorageService.salvarCategorias(entradas, saidas);
  }, []);

  const persistHistoricoRanking = useCallback(async (historico: HistoricoRanking) => {
    dispatch({ type: 'SET_HISTORICO_RANKING', payload: historico });
    await StorageService.salvarHistoricoRanking(historico);
  }, []);

  const persistPartidas = useCallback(async (partidas: PartidaRealizada[]) => {
    dispatch({ type: 'SET_PARTIDAS_HISTORICO', payload: partidas });
    await StorageService.salvarPartidas(partidas);
  }, []);

  const persistRodadas = useCallback(async (rodadas: RodadaCompleta[]) => {
    dispatch({ type: 'SET_RODADAS_HISTORICO', payload: rodadas });
    // Salvar rodadas também no storage (chave nova)
    try {
      await AsyncStorage.setItem('@pelada_rodadas_hist', JSON.stringify(rodadas));
    } catch (e) {
      console.error('Erro ao salvar rodadas:', e);
    }
  }, []);

  // --- Auth ---
  const login = useCallback(async (usuario: UsuarioSessao) => {
    dispatch({ type: 'SET_USUARIO_LOGADO', payload: usuario });
    const { AuthService } = await import('../services/authService');
    await AuthService.salvarSessao(usuario);
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: 'SET_USUARIO_LOGADO', payload: null });
    dispatch({ type: 'SET_ABA_ATIVA', payload: 'presenca' });
    const { AuthService } = await import('../services/authService');
    await AuthService.fazerLogout();
  }, []);

  // --- Notificações ---
  const addNotificacao = useCallback(async (notif: Omit<Notificacao, 'id' | 'data' | 'lida'>) => {
    const nova: Notificacao = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      data: new Date().toISOString(),
      lida: false,
    };
    dispatch({ type: 'ADD_NOTIFICACAO', payload: nova });
    
    // TODO: Agendar notificação push local se necessário
    // await Notifications.scheduleNotificationAsync({...});
  }, []);

  // Effect: hydrate na montagem
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const value: AppContextValue = {
    state,
    dispatch,
    hydrate,
    persistConfig,
    persistPlayers,
    persistPagamentos,
    persistEntradas,
    persistSaidas,
    persistCategorias,
    persistHistoricoRanking,
    persistPartidas,
    persistRodadas,
    login,
    logout,
    addNotificacao,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================
// HOOKS DE CONSUMO
// ============================================

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}

// Hooks específicos para cada fatia do estado (performance)
export function useConfig() {
  const { state, persistConfig } = useApp();
  return { config: state.config, updateConfig: persistConfig };
}

export function usePlayers() {
  const { state, persistPlayers } = useApp();
  return { players: state.players, updatePlayers: persistPlayers };
}

export function usePagamentos() {
  const { state, persistPagamentos } = useApp();
  return { pagamentos: state.pagamentos, updatePagamentos: persistPagamentos };
}

export function useFinanceiro() {
  const { state, persistEntradas, persistSaidas, persistCategorias } = useApp();
  return {
    entradas: state.entradas,
    saidas: state.saidas,
    categoriasEntrada: state.categoriasEntrada,
    categoriasSaida: state.categoriasSaida,
    addEntrada: (e: LancamentoFinanceiro) => {
      const novas = [e, ...state.entradas];
      persistEntradas(novas);
    },
    updateEntrada: (e: LancamentoFinanceiro) => {
      const novas = state.entradas.map((x) => (x.id === e.id ? e : x));
      persistEntradas(novas);
    },
    removeEntrada: (id: string) => {
      const novas = state.entradas.filter((x) => x.id !== id);
      persistEntradas(novas);
    },
    addSaida: (s: LancamentoFinanceiro) => {
      const novas = [s, ...state.saidas];
      persistSaidas(novas);
    },
    updateSaida: (s: LancamentoFinanceiro) => {
      const novas = state.saidas.map((x) => (x.id === s.id ? s : x));
      persistSaidas(novas);
    },
    removeSaida: (id: string) => {
      const novas = state.saidas.filter((x) => x.id !== id);
      persistSaidas(novas);
    },
    updateCategorias: (entradas: CategoriaFinanceira[], saidas: CategoriaFinanceira[]) =>
      persistCategorias(entradas, saidas),
  };
}

export function useRanking() {
  const { state, persistHistoricoRanking } = useApp();
  return { historicoRanking: state.historicoRanking, updateHistoricoRanking: persistHistoricoRanking };
}

export function usePartidas() {
  const { state, persistPartidas, persistRodadas } = useApp();
  return {
    partidasHistorico: state.partidasHistorico,
    rodadasHistorico: state.rodadasHistorico,
    addPartida: (p: PartidaRealizada) => {
      const novas = [p, ...state.partidasHistorico];
      persistPartidas(novas);
    },
    addRodada: (r: RodadaCompleta) => {
      const novas = [r, ...state.rodadasHistorico];
      persistRodadas(novas);
    },
  };
}

export function useAuth() {
  const { state, login, logout } = useApp();
  return { usuarioLogado: state.usuarioLogado, login, logout, ehAdmin: Boolean(state.usuarioLogado?.ehAdmin) };
}

export function useUI() {
  const { state, dispatch } = useApp();
  return {
    abaAtiva: state.abaAtiva,
    setAbaAtiva: (aba: AppState['abaAtiva']) => dispatch({ type: 'SET_ABA_ATIVA', payload: aba }),
    tema: state.tema,
    setTema: (tema: AppState['tema']) => dispatch({ type: 'SET_TEMA', payload: tema }),
  };
}

export function useNotificacoes() {
  const { state, dispatch, addNotificacao } = useApp();
  return {
    notificacoes: state.notificacoes,
    naoLidas: state.notificacoes.filter((n) => !n.lida).length,
    add: addNotificacao,
    marcarLida: (id: string) => dispatch({ type: 'MARCAR_NOTIFICACAO_LIDA', payload: id }),
    limparAntigas: (dias: number) => dispatch({ type: 'LIMPAR_NOTIFICACOES_ANTIGAS', payload: dias }),
  };
}