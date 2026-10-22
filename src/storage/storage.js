import AsyncStorage from '@react-native-async-storage/async-storage';
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

const KEYS = {
  CONFIG: '@pelada_config',
  PLAYERS: '@pelada_players',
  PAGAMENTOS: '@pelada_pagamentos',
  ENTRADAS: '@pelada_entradas',
  SAIDAS: '@pelada_saidas',
  CATEGORIAS_ENTRADA: '@pelada_cat_entradas',
  CATEGORIAS_SAIDA: '@pelada_cat_saidas',
  HISTORICO: '@pelada_historico_ranking',
  PARTIDAS_HISTORICO: '@pelada_partidas_hist',
};

export const StorageService = {
  async carregarDadosCompletos() {
    try {
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
      ]);

      return {
        config: savedConfig ? JSON.parse(savedConfig) : CONFIG_PADRAO,
        players: savedPlayers ? JSON.parse(savedPlayers) : JOGADORES_INICIAIS,
        pagamentos: savedPagamentos ? JSON.parse(savedPagamentos) : PAGAMENTOS_INICIAIS,
        entradas: savedEntradas ? JSON.parse(savedEntradas) : ENTRADAS_INICIAIS,
        saidas: savedSaidas ? JSON.parse(savedSaidas) : SAIDAS_INICIAIS,
        categoriasEntrada: savedCatEntradas ? JSON.parse(savedCatEntradas) : CATEGORIAS_ENTRADA,
        categoriasSaida: savedCatSaidas ? JSON.parse(savedCatSaidas) : CATEGORIAS_SAIDA,
        historicoRanking: savedHistorico ? JSON.parse(savedHistorico) : HISTORICO_PONTUACAO_INICIAL,
        partidasHistorico: savedPartidas ? JSON.parse(savedPartidas) : [],
      };
    } catch (e) {
      console.warn('Erro ao carregar do Storage, usando dados padrão:', e);
      return {
        config: CONFIG_PADRAO,
        players: JOGADORES_INICIAIS,
        pagamentos: PAGAMENTOS_INICIAIS,
        entradas: ENTRADAS_INICIAIS,
        saidas: SAIDAS_INICIAIS,
        categoriasEntrada: CATEGORIAS_ENTRADA,
        categoriasSaida: CATEGORIAS_SAIDA,
        historicoRanking: HISTORICO_PONTUACAO_INICIAL,
        partidasHistorico: [],
      };
    }
  },

  async salvarConfig(config) {
    try {
      await AsyncStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  },

  async salvarPlayers(players) {
    try {
      await AsyncStorage.setItem(KEYS.PLAYERS, JSON.stringify(players));
    } catch (e) {
      console.error(e);
    }
  },

  async salvarPagamentos(pagamentos) {
    try {
      await AsyncStorage.setItem(KEYS.PAGAMENTOS, JSON.stringify(pagamentos));
    } catch (e) {
      console.error(e);
    }
  },

  async salvarEntradas(entradas) {
    try {
      await AsyncStorage.setItem(KEYS.ENTRADAS, JSON.stringify(entradas));
    } catch (e) {
      console.error(e);
    }
  },

  async salvarSaidas(saidas) {
    try {
      await AsyncStorage.setItem(KEYS.SAIDAS, JSON.stringify(saidas));
    } catch (e) {
      console.error(e);
    }
  },

  async salvarCategorias(catEntradas, catSaidas) {
    try {
      await Promise.all([
        AsyncStorage.setItem(KEYS.CATEGORIAS_ENTRADA, JSON.stringify(catEntradas)),
        AsyncStorage.setItem(KEYS.CATEGORIAS_SAIDA, JSON.stringify(catSaidas)),
      ]);
    } catch (e) {
      console.error(e);
    }
  },

  async salvarHistoricoRanking(ranking) {
    try {
      await AsyncStorage.setItem(KEYS.HISTORICO, JSON.stringify(ranking));
    } catch (e) {
      console.error(e);
    }
  },

  async salvarPartidas(partidas) {
    try {
      await AsyncStorage.setItem(KEYS.PARTIDAS_HISTORICO, JSON.stringify(partidas));
    } catch (e) {
      console.error(e);
    }
  },

  async resetarParaPadrao() {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error(e);
    }
  },
};

