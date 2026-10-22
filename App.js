import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';

import { StorageService } from './src/storage/storage';
import FinanceiroTab from './src/components/FinanceiroTab';
import PlayersTab from './src/components/PlayersTab';
import PartidasTab from './src/components/PartidasTab';
import RankingTab from './src/components/RankingTab';
import PresencaTab from './src/components/PresencaTab';

export default function App() {
  const [carregando, setCarregando] = useState(true);

  // Estados principais da aplicação
  const [abaAtiva, setAbaAtiva] = useState('caixa'); // 'caixa' | 'times' | 'jogos' | 'ranking' | 'presenca'
  const [config, setConfig] = useState({});
  const [players, setPlayers] = useState([]);
  const [pagamentos, setPagamentos] = useState({});
  const [entradas, setEntradas] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const [categoriasEntrada, setCategoriasEntrada] = useState([]);
  const [categoriasSaida, setCategoriasSaida] = useState([]);
  const [historicoRanking, setHistoricoRanking] = useState({});
  
  // Times ativos para as partidas (definidos pelo sorteio ou padrão)
  const [timesAtuais, setTimesAtuais] = useState(null);

  // Carrega dados iniciais do Storage / Planilha
  useEffect(() => {
    async function inicializar() {
      try {
        const dados = await StorageService.carregarDadosCompletos();
        setConfig(dados.config);
        setPlayers(dados.players);
        setPagamentos(dados.pagamentos);
        setEntradas(dados.entradas);
        setSaidas(dados.saidas);
        setCategoriasEntrada(dados.categoriasEntrada);
        setCategoriasSaida(dados.categoriasSaida);
        setHistoricoRanking(dados.historicoRanking);
      } catch (e) {
        console.error('Erro na inicialização:', e);
      } finally {
        setCarregando(false);
      }
    }
    inicializar();
  }, []);

  // Handlers com persistência automática no AsyncStorage
  const handleUpdateConfig = async (novaConfig) => {
    setConfig(novaConfig);
    await StorageService.salvarConfig(novaConfig);
  };

  const handleUpdatePlayers = async (novosPlayers) => {
    setPlayers(novosPlayers);
    await StorageService.salvarPlayers(novosPlayers);
  };

  const handleUpdatePagamentos = async (novosPagamentos) => {
    setPagamentos(novosPagamentos);
    await StorageService.salvarPagamentos(novosPagamentos);
  };

  const handleUpdateEntradas = async (novasEntradas) => {
    setEntradas(novasEntradas);
    await StorageService.salvarEntradas(novasEntradas);
  };

  const handleUpdateSaidas = async (novasSaidas) => {
    setSaidas(novasSaidas);
    await StorageService.salvarSaidas(novasSaidas);
  };

  const handleUpdateCategoriasEntrada = async (novasCats) => {
    setCategoriasEntrada(novasCats);
    await StorageService.salvarCategorias(novasCats, categoriasSaida);
  };

  const handleUpdateCategoriasSaida = async (novasCats) => {
    setCategoriasSaida(novasCats);
    await StorageService.salvarCategorias(categoriasEntrada, novasCats);
  };

  const handleUpdateHistoricoRanking = async (novoHist) => {
    setHistoricoRanking(novoHist);
    await StorageService.salvarHistoricoRanking(novoHist);
  };

  // Quando finaliza a rodada em PartidasTab, computa os pontos no Ranking Geral
  const handleAdicionarPontosRodada = async (pontosRodada, dataStr) => {
    const novoHist = { ...historicoRanking };

    Object.entries(pontosRodada).forEach(([playerId, stats]) => {
      if (!novoHist[playerId]) {
        novoHist[playerId] = {
          nome: stats.nome,
          pontosTotais: 0,
          pontosPorData: {},
        };
      }

      // Adiciona aos pontos totais
      novoHist[playerId].pontosTotais =
        Math.round(((novoHist[playerId].pontosTotais || 0) + stats.pontos) * 10) / 10;

      // Registra a pontuação na data
      if (!novoHist[playerId].pontosPorData) {
        novoHist[playerId].pontosPorData = {};
      }
      novoHist[playerId].pontosPorData[dataStr] =
        Math.round(((novoHist[playerId].pontosPorData[dataStr] || 0) + stats.pontos) * 10) / 10;
    });

    setHistoricoRanking(novoHist);
    await StorageService.salvarHistoricoRanking(novoHist);
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Carregando dados da Pelada de Segunda...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />

      {/* CABEÇALHO GLOBAL */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.appBadge}>⚽ PELADA DE SEGUNDA</Text>
          <Text style={styles.appTitulo}>Gestão & Partidas</Text>
        </View>
        <View style={styles.headerRightInfo}>
          <Text style={styles.headerQuadra}>Arena Show de Bola</Text>
          <Text style={styles.headerHorario}>Segundas • 20h às 21:30</Text>
        </View>
      </View>

      {/* ÁREA DE CONTEÚDO PRINCIPAL (BASEADA NA ABA ATIVA) */}
      <View style={styles.conteudoContainer}>
        {abaAtiva === 'caixa' && (
          <FinanceiroTab
            config={config}
            onUpdateConfig={handleUpdateConfig}
            players={players}
            pagamentos={pagamentos}
            onUpdatePagamentos={handleUpdatePagamentos}
            entradas={entradas}
            onUpdateEntradas={handleUpdateEntradas}
            saidas={saidas}
            onUpdateSaidas={handleUpdateSaidas}
            categoriasEntrada={categoriasEntrada}
            onUpdateCategoriasEntrada={handleUpdateCategoriasEntrada}
            categoriasSaida={categoriasSaida}
            onUpdateCategoriasSaida={handleUpdateCategoriasSaida}
          />
        )}

        {abaAtiva === 'times' && (
          <PlayersTab
            players={players}
            onUpdatePlayers={handleUpdatePlayers}
            onTimesGerados={(times) => setTimesAtuais(times)}
          />
        )}

        {abaAtiva === 'jogos' && (
          <PartidasTab
            timesAtuais={timesAtuais}
            players={players}
            onAdicionarPontosRodada={handleAdicionarPontosRodada}
          />
        )}

        {abaAtiva === 'ranking' && (
          <RankingTab
            players={players}
            historicoRanking={historicoRanking}
            onUpdateHistoricoRanking={handleUpdateHistoricoRanking}
          />
        )}

        {abaAtiva === 'presenca' && (
          <PresencaTab
            players={players}
            onEnviarParaSorteio={(confirmados) => {
              setAbaAtiva('times');
            }}
          />
        )}
      </View>

      {/* BARRA DE NAVEGAÇÃO INFERIOR MODERNA */}
      <View style={styles.bottomNav}>
        {[
          { key: 'caixa', label: 'Caixa', icon: '💰' },
          { key: 'times', label: 'Times', icon: '⚡' },
          { key: 'jogos', label: 'Jogos (7m)', icon: '⚽' },
          { key: 'ranking', label: 'Ranking', icon: '🏆' },
          { key: 'presenca', label: 'Presença', icon: '📋' },
        ].map((tab) => {
          const ativo = abaAtiva === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setAbaAtiva(tab.key)}
              style={[styles.navItem, ativo && styles.navItemAtivo]}
            >
              <Text style={styles.navIcon}>{tab.icon}</Text>
              <Text style={[styles.navLabel, ativo && styles.navLabelAtivo]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a2315',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a2315',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#a7f3d0',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  topHeader: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#059669',
  },
  appBadge: {
    color: '#86efac',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  appTitulo: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerRightInfo: {
    alignItems: 'flex-end',
  },
  headerQuadra: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
  headerHorario: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 1,
  },
  conteudoContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 10,
  },
  navItemAtivo: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  navLabelAtivo: {
    color: '#10b981',
    fontWeight: '900',
  },
});
