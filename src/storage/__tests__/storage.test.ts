import { StorageService } from '../storage';
import { Jogador, ConfigPelada } from '../../types';

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;
const mockRemoveItem = AsyncStorage.removeItem as jest.Mock;
const mockClear = AsyncStorage.clear as jest.Mock;

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('carregarDadosCompletos', () => {
    it('deve retornar dados padrão quando storage vazio', async () => {
      mockGetItem.mockResolvedValue(null);

      const dados = await StorageService.carregarDadosCompletos();

      expect(dados).toBeDefined();
      expect(dados.config).toBeDefined();
      expect(dados.players).toBeDefined();
      expect(Array.isArray(dados.players)).toBe(true);
      expect(dados.players.length).toBeGreaterThan(0);
    });

    it('deve carregar dados salvos do storage', async () => {
      const configMock: ConfigPelada = { valorMensalidade: 100, valorDiarista: 30, diaVencimentoMensalidade: 5, valorEmDinheiro: 0, duracaoPartidaMinutos: 7, jogadoresPorTime: 5, quantidadeTimes: 3, pontosVitoria: 3, pontosEmpateVantagem: 1, pontosParticipacaoGol: 0.5 };
      const playersMock: Jogador[] = [{ id: '1', nome: 'Teste', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 5, chute: 5, marcacao: 5, passe: 5, habilidade: 5, overall: 25 }];

      mockGetItem
        .mockResolvedValueOnce('v3_typescript_bcrypt_2026') // DATA_VERSION
        .mockResolvedValueOnce(JSON.stringify(configMock))
        .mockResolvedValueOnce(JSON.stringify(playersMock))
        .mockResolvedValueOnce(JSON.stringify({}))
        .mockResolvedValueOnce(JSON.stringify([]))
        .mockResolvedValueOnce(JSON.stringify([]))
        .mockResolvedValueOnce(JSON.stringify([]))
        .mockResolvedValueOnce(JSON.stringify([]))
        .mockResolvedValueOnce(JSON.stringify({}))
        .mockResolvedValueOnce(JSON.stringify([]))
        .mockResolvedValueOnce(JSON.stringify([]));

      const dados = await StorageService.carregarDadosCompletos();

      expect(dados.config.valorMensalidade).toBe(100);
      expect(dados.players).toHaveLength(1);
      expect(dados.players[0].nome).toBe('Teste');
    });
  });

  describe('salvarConfig', () => {
    it('deve chamar setItem com chave correta', async () => {
      const config: ConfigPelada = { valorMensalidade: 100, valorDiarista: 30, diaVencimentoMensalidade: 5, valorEmDinheiro: 0, duracaoPartidaMinutos: 7, jogadoresPorTime: 5, quantidadeTimes: 3, pontosVitoria: 3, pontosEmpateVantagem: 1, pontosParticipacaoGol: 0.5 };

      await StorageService.salvarConfig(config);

      expect(mockSetItem).toHaveBeenCalledWith('@pelada_config', JSON.stringify(config));
    });
  });

  describe('salvarPlayers', () => {
    it('deve chamar setItem com chave correta', async () => {
      const players: Jogador[] = [{ id: '1', nome: 'Teste', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 5, chute: 5, marcacao: 5, passe: 5, habilidade: 5, overall: 25 }];

      await StorageService.salvarPlayers(players);

      expect(mockSetItem).toHaveBeenCalledWith('@pelada_players', JSON.stringify(players));
    });
  });

  describe('salvarPagamentos', () => {
    it('deve chamar setItem com chave correta', async () => {
      const pagamentos = { j_1: { Janeiro: 75 } };

      await StorageService.salvarPagamentos(pagamentos);

      expect(mockSetItem).toHaveBeenCalledWith('@pelada_pagamentos', JSON.stringify(pagamentos));
    });
  });

  describe('resetarParaPadrao', () => {
    it('deve chamar clear', async () => {
      await StorageService.resetarParaPadrao();

      expect(mockClear).toHaveBeenCalled();
    });
  });
});