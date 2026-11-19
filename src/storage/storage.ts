import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ConfigPelada,
  Jogador,
  PagamentosMap,
  LancamentoFinanceiro,
  CategoriaFinanceira,
  HistoricoRanking,
  PartidaRealizada,
  RodadaCompleta,
} from '../types';
import {
  CONFIG_PADRAO,
  JOGADORES_INICIAIS,
  PAGAMENTOS_INICIAIS,
  ENTRADAS_INICIAIS,
  SAIDAS_INICIAIS,
  HISTORICO_PONTUACAO_INICIAL,
  CATEGORIAS_ENTRADA,
  CATEGORIAS_SAIDA,
} from '../data/initialData';
import { migrarSenhasParaHash } from '../services/authService';

const DATA_VERSION = 'v3_typescript_bcrypt_2026';

const KEYS = {
  DATA_VERSION: '@pelada_data_version',
  CONFIG: '@pelada_config',
  PLAYERS: '@pelada_players',
  PAGAMENTOS: '@pelada_pagamentos',
  ENTRADAS: '@pelada_entradas',
  SAIDAS: '@pelada_saidas',
  CATEGORIAS_ENTRADA: '@pelada_cat_entradas',
  CATEGORIAS_SAIDA: '@pelada_cat_saidas',
  HISTORICO: '@pelada_historico_ranking',
  PARTIDAS_HISTORICO: '@pelada_partidas_hist',
  RODADAS_HISTORICO: '@pelada_rodadas_hist',
} as const;

interface DadosCompletosStorage {
  config: ConfigPelada;
  players: Jogador[];
  pagamentos: PagamentosMap;
  entradas: LancamentoFinanceiro[];
  saidas: LancamentoFinanceiro[];
  categoriasEntrada: CategoriaFinanceira[];
  categoriasSaida: CategoriaFinanceira[];
  historicoRanking: HistoricoRanking;
  partidasHistorico: PartidaRealizada[];
  rodadasHistorico: RodadaCompleta[];
}

function parseJSON<T>(value: string | null, fallback: T): T {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export const StorageService = {
  /**
   * Carrega todos os dados do AsyncStorage
   * Inclui migração automática de versão e hash de senhas
   */
  async carregarDadosCompletos(): Promise<DadosCompletosStorage> {
    try {
      const currentVersion = await AsyncStorage.getItem(KEYS.DATA_VERSION);
      
      if (currentVersion !== DATA_VERSION) {
        // Nova versão: sincroniza dados padrão e migra senhas
        console.log(`[Storage] Migrando dados da versão ${currentVersion} para ${DATA_VERSION}`);
        
        // Migra jogadores para incluir hash de senhas
        const playersComHash = await migrarSenhasParaHash(JOGADORES_INICIAIS);
        
        const categoriasEntrada: CategoriaFinanceira[] = CATEGORIAS_ENTRADA.map((nome, index) => ({
          id: `cat_ent_${index}`,
          nome,
          tipo: 'entrada' as const,
          ativa: true,
        }));
        
        const categoriasSaida: CategoriaFinanceira[] = CATEGORIAS_SAIDA.map((nome, index) => ({
          id: `cat_sai_${index}`,
          nome,
          tipo: 'saida' as const,
          ativa: true,
        }));

        await Promise.all([
          AsyncStorage.setItem(KEYS.DATA_VERSION, DATA_VERSION),
          AsyncStorage.setItem(KEYS.CONFIG, JSON.stringify(CONFIG_PADRAO)),
          AsyncStorage.setItem(KEYS.PLAYERS, JSON.stringify(playersComHash)),
          AsyncStorage.setItem(KEYS.PAGAMENTOS, JSON.stringify(PAGAMENTOS_INICIAIS)),
          AsyncStorage.setItem(KEYS.ENTRADAS, JSON.stringify(ENTRADAS_INICIAIS)),
          AsyncStorage.setItem(KEYS.SAIDAS, JSON.stringify(SAIDAS_INICIAIS)),
          AsyncStorage.setItem(KEYS.CATEGORIAS_ENTRADA, JSON.stringify(categoriasEntrada)),
          AsyncStorage.setItem(KEYS.CATEGORIAS_SAIDA, JSON.stringify(categoriasSaida)),
          AsyncStorage.setItem(KEYS.HISTORICO, JSON.stringify(HISTORICO_PONTUACAO_INICIAL)),
          AsyncStorage.setItem(KEYS.PARTIDAS_HISTORICO, JSON.stringify([])),
          AsyncStorage.setItem(KEYS.RODADAS_HISTORICO, JSON.stringify([])),
        ]);

        return {
          config: CONFIG_PADRAO,
          players: playersComHash,
          pagamentos: PAGAMENTOS_INICIAIS,
          entradas: ENTRADAS_INICIAIS,
          saidas: SAIDAS_INICIAIS,
          categoriasEntrada,
          categoriasSaida,
          historicoRanking: HISTORICO_PONTUACAO_INICIAL,
          partidasHistorico: [],
          rodadasHistorico: [],
        };
      }

      const [
        savedConfig,
        savedPlayers,
        savedPagamentos,
        savedEntradas,
        savedSaidas,
        savedCatEntradas,
        savedCatSaidas,
        savedHistorico,
        savedPartidas,
        savedRodadas,
      ] = await Promise.all([
        AsyncStorage.getItem(KEYS.CONFIG),
        AsyncStorage.getItem(KEYS.PLAYERS),
        AsyncStorage.getItem(KEYS.PAGAMENTOS),
        AsyncStorage.getItem(KEYS.ENTRADAS),
        AsyncStorage.getItem(KEYS.SAIDAS),
        AsyncStorage.getItem(KEYS.CATEGORIAS_ENTRADA),
        AsyncStorage.getItem(KEYS.CATEGORIAS_SAIDA),
        AsyncStorage.getItem(KEYS.HISTORICO),
        AsyncStorage.getItem(KEYS.PARTIDAS_HISTORICO),
        AsyncStorage.getItem(KEYS.RODADAS_HISTORICO),
      ]);

      // Migra jogadores existentes para ter hash de senha se necessário
      const playersParseados = parseJSON<Jogador[]>(savedPlayers, JOGADORES_INICIAIS);
      const playersComHash = await migrarSenhasParaHash(playersParseados);
      
      // Se houve migração, salva de volta
      if (playersComHash.some((p, i) => p.senhaHash !== playersParseados[i]?.senhaHash)) {
        await AsyncStorage.setItem(KEYS.PLAYERS, JSON.stringify(playersComHash));
      }

      return {
        config: parseJSON<ConfigPelada>(savedConfig, CONFIG_PADRAO),
        players: playersComHash,
        pagamentos: parseJSON<PagamentosMap>(savedPagamentos, PAGAMENTOS_INICIAIS),
        entradas: parseJSON<LancamentoFinanceiro[]>(savedEntradas, ENTRADAS_INICIAIS),
        saidas: parseJSON<LancamentoFinanceiro[]>(savedSaidas, SAIDAS_INICIAIS),
        categoriasEntrada: parseJSON<CategoriaFinanceira[]>(savedCatEntradas, 
          CATEGORIAS_ENTRADA.map((nome, index) => ({ id: `cat_ent_${index}`, nome, tipo: 'entrada' as const, ativa: true }))
        ),
        categoriasSaida: parseJSON<CategoriaFinanceira[]>(savedCatSaidas,
          CATEGORIAS_SAIDA.map((nome, index) => ({ id: `cat_sai_${index}`, nome, tipo: 'saida' as const, ativa: true }))
        ),
        historicoRanking: parseJSON<HistoricoRanking>(savedHistorico, HISTORICO_PONTUACAO_INICIAL),
        partidasHistorico: parseJSON<PartidaRealizada[]>(savedPartidas, []),
        rodadasHistorico: parseJSON<RodadaCompleta[]>(savedRodadas, []),
      };
    } catch (e) {
      console.warn('Erro ao carregar do Storage, usando dados padrão:', e);
      
      const playersComHash = await migrarSenhasParaHash(JOGADORES_INICIAIS);
      
      return {
        config: CONFIG_PADRAO,
        players: playersComHash,
        pagamentos: PAGAMENTOS_INICIAIS,
        entradas: ENTRADAS_INICIAIS,
        saidas: SAIDAS_INICIAIS,
        categoriasEntrada: CATEGORIAS_ENTRADA.map((nome, index) => ({
          id: `cat_ent_${index}`,
          nome,
          tipo: 'entrada' as const,
          ativa: true,
        })),
        categoriasSaida: CATEGORIAS_SAIDA.map((nome, index) => ({
          id: `cat_sai_${index}`,
          nome,
          tipo: 'saida' as const,
          ativa: true,
        })),
        historicoRanking: HISTORICO_PONTUACAO_INICIAL,
        partidasHistorico: [],
        rodadasHistorico: [],
      };
    }
  },

  async salvarConfig(config: ConfigPelada): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('[Storage] Erro ao salvar config:', e);
    }
  },

  async salvarPlayers(players: Jogador[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PLAYERS, JSON.stringify(players));
    } catch (e) {
      console.error('[Storage] Erro ao salvar players:', e);
    }
  },

  async salvarPagamentos(pagamentos: PagamentosMap): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PAGAMENTOS, JSON.stringify(pagamentos));
    } catch (e) {
      console.error('[Storage] Erro ao salvar pagamentos:', e);
    }
  },

  async salvarEntradas(entradas: LancamentoFinanceiro[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ENTRADAS, JSON.stringify(entradas));
    } catch (e) {
      console.error('[Storage] Erro ao salvar entradas:', e);
    }
  },

  async salvarSaidas(saidas: LancamentoFinanceiro[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SAIDAS, JSON.stringify(saidas));
    } catch (e) {
      console.error('[Storage] Erro ao salvar saídas:', e);
    }
  },

  async salvarCategorias(
    catEntradas: CategoriaFinanceira[],
    catSaidas: CategoriaFinanceira[]
  ): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(KEYS.CATEGORIAS_ENTRADA, JSON.stringify(catEntradas)),
        AsyncStorage.setItem(KEYS.CATEGORIAS_SAIDA, JSON.stringify(catSaidas)),
      ]);
    } catch (e) {
      console.error('[Storage] Erro ao salvar categorias:', e);
    }
  },

  async salvarHistoricoRanking(ranking: HistoricoRanking): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.HISTORICO, JSON.stringify(ranking));
    } catch (e) {
      console.error('[Storage] Erro ao salvar histórico ranking:', e);
    }
  },

  async salvarPartidas(partidas: PartidaRealizada[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PARTIDAS_HISTORICO, JSON.stringify(partidas));
    } catch (e) {
      console.error('[Storage] Erro ao salvar partidas:', e);
    }
  },

  async salvarRodadas(rodadas: RodadaCompleta[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.RODADAS_HISTORICO, JSON.stringify(rodadas));
    } catch (e) {
      console.error('[Storage] Erro ao salvar rodadas:', e);
    }
  },

  async resetarParaPadrao(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('[Storage] Erro ao resetar:', e);
    }
  },

  // --- Métodos utilitários para chaves específicas ---
  async getItem<T>(key: string, fallback: T): Promise<T> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },

  async setItem(key: string, value: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[Storage] Erro ao salvar ${key}:`, e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`[Storage] Erro ao remover ${key}:`, e);
    }
  },
};