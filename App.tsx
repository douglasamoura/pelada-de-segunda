import React, { useEffect, useCallback } from 'react';
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

import { AppProvider, useAuth, useUI, usePlayers, useRanking, useFinanceiro, useConfig, usePagamentos, useApp } from './src/context/AppContext';
import { AuthService } from './src/services/authService';
import LoginScreen from './src/components/LoginScreen';
import FinanceiroTab from './src/components/FinanceiroTab';
import PlayersTab from './src/components/PlayersTab';
import PartidasTab from './src/components/PartidasTab';
import RankingTab from './src/components/RankingTab';
import PresencaTab from './src/components/PresencaTab';
import { Jogador, TimePartida, HistoricoRanking, ConfigPelada, PagamentosMap } from './src/types';
import { sortearTimesEquilibrados } from './src/utils/teamBalancer';

// ============================================
// COMPONENTE PRINCIPAL (CONSUMINDO CONTEXT)
// ============================================

function AppContent() {
  const { usuarioLogado, ehAdmin, login, logout } = useAuth();
  const { abaAtiva, setAbaAtiva } = useUI();
  const { players, updatePlayers } = usePlayers();
  const { historicoRanking, updateHistoricoRanking } = useRanking();
  const { config, updateConfig } = useConfig();
  const { pagamentos, updatePagamentos } = usePagamentos();
  const { entradas, saidas, categoriasEntrada, categoriasSaida, updateCategorias } = useFinanceiro();
  const { dispatch } = useApp();
  
  const [carregando, setCarregando] = React.useState(true);
  const [timesAtuais, setTimesAtuais] = React.useState<TimePartida[] | null>(null);
  const [jogadoresPreSelecionados, setJogadoresPreSelecionados] = React.useState<Jogador[] | null>(null);

  // Proteção: caso um usuário comum tente ficar na aba jogadores, redireciona para presença
  useEffect(() => {
    if (usuarioLogado && !ehAdmin && abaAtiva === 'jogadores') {
      setAbaAtiva('presenca');
    }
  }, [usuarioLogado, ehAdmin, abaAtiva, setAbaAtiva]);

  // Handler para adicionar pontos da rodada
  const handleAdicionarPontosRodada = useCallback(async (
    pontosRodada: Record<string, { nome: string; pontos: number }>,
    dataStr: string
  ) => {
    Object.entries(pontosRodada).forEach(([playerId, stats]) => {
      dispatch({ type: 'UPDATE_HISTORICO_RANKING', payload: { jogadorId: playerId, data: dataStr, pontos: stats.pontos } });
    });
  }, [dispatch]);

  // Simula carregamento inicial (o Context já fez o hydrate)
  useEffect(() => {
    const timer = setTimeout(() => setCarregando(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Carregando dados da Pelada de Segunda...</Text>
      </View>
    );
  }

  // TELA DE LOGIN OBRIGATÓRIA: Bloqueia 100% dos dados para usuários não autenticados
  if (!usuarioLogado) {
    return (
      <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" {...(Platform.OS !== 'web' ? { backgroundColor: '#064e3b' } : {})} />
        <LoginScreen
          players={players}
            onLoginSucesso={async (usuario: import('./src/types').UsuarioSessao) => {
            await login(usuario);
          }}
        />
      </SafeAreaView>
    );
  }

  const handleLogout = useCallback(async () => {
    await logout();
    setAbaAtiva('presenca');
  }, [logout, setAbaAtiva]);

  const handleUpdatePlayers = useCallback(async (novosPlayers: Jogador[]) => {
    await updatePlayers(novosPlayers);
  }, [updatePlayers]);

  const handleUpdateHistoricoRanking = useCallback(async (novoHist: HistoricoRanking) => {
    await updateHistoricoRanking(novoHist);
  }, [updateHistoricoRanking]);

  const handleUpdateConfig = useCallback(async (novaConfig: ConfigPelada) => {
    await updateConfig(novaConfig);
  }, [updateConfig]);

  const handleUpdatePagamentos = useCallback(async (novosPagamentos: PagamentosMap) => {
    await updatePagamentos(novosPagamentos);
  }, [updatePagamentos]);

  const handleUpdateCategoriasEntrada = useCallback(async (novasCats: any[]) => {
    await updateCategorias(novasCats, categoriasSaida);
  }, [updateCategorias, categoriasSaida]);

  const handleUpdateCategoriasSaida = useCallback(async (novasCats: any[]) => {
    await updateCategorias(categoriasEntrada, novasCats);
  }, [updateCategorias, categoriasEntrada]);

  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" {...(Platform.OS !== 'web' ? { backgroundColor: '#064e3b' } : {})} />

      {/* CABEÇALHO GLOBAL COM INFORMAÇÕES DO USUÁRIO E SAIR */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.appBadge}>⚽ PELADA DE SEGUNDA</Text>
          <Text style={styles.appTitulo}>Toque de Bola</Text>
          <Text style={styles.headerHorario}>Segundas • 19:00 (Monte Castelo, JF)</Text>
        </View>

        {/* PERFIL DO USUÁRIO LOGADO */}
        <View style={styles.headerRightInfo}>
          <View style={styles.userPerfilLinha}>
            <View style={styles.userTagBadge}>
              <Text style={styles.userTagNome} numberOfLines={1}>
                {usuarioLogado?.nome || 'Jogador'}
              </Text>
              <Text style={[styles.userTagPapel, ehAdmin && styles.userTagPapelAdmin]}>
                {ehAdmin ? '👑 Administrador' : '⚽ Jogador'}
              </Text>
            </View>

            {/* BOTÃO DE SAIR / LOGOUT */}
            <TouchableOpacity
              style={styles.btnSairHeader}
              onPress={handleLogout}
            >
              <Text style={styles.btnSairHeaderTxt}>🚪 Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ÁREA DE CONTEÚDO PRINCIPAL (BASEADA NA ABA ATIVA) */}
      <View style={styles.conteudoContainer}>
        {/* 1) PRESENÇA */}
        {abaAtiva === 'presenca' && (
          <PresencaTab
            players={players}
            usuarioLogado={usuarioLogado}
            ehAdmin={ehAdmin}
            onEnviarParaSorteio={(confirmados: Jogador[]) => {
              setJogadoresPreSelecionados(confirmados);
              setAbaAtiva('partidas');
            }}
          />
        )}

        {/* 2) JOGOS DA RODADA */}
        {abaAtiva === 'partidas' && (
          <PartidasTab
            timesAtuais={timesAtuais}
            setTimesAtuais={setTimesAtuais}
            players={players}
            onUpdatePlayers={handleUpdatePlayers}
            jogadoresPreSelecionados={jogadoresPreSelecionados}
            onAdicionarPontosRodada={handleAdicionarPontosRodada}
            ehAdmin={ehAdmin}
          />
        )}

        {/* 3) RANKING */}
        {abaAtiva === 'ranking' && (
          <RankingTab
            players={players}
            historicoRanking={historicoRanking}
            onUpdateHistoricoRanking={handleUpdateHistoricoRanking}
            ehAdmin={ehAdmin}
          />
        )}

        {/* 4) LISTA DE JOGADORES (APENAS ADMINISTRADOR) */}
        {ehAdmin && abaAtiva === 'jogadores' && (
          <PlayersTab
            players={players}
            onUpdatePlayers={handleUpdatePlayers}
          />
        )}

        {/* 5) CAIXA */}
        {abaAtiva === 'caixa' && (
          <FinanceiroTab
            config={config}
            onUpdateConfig={handleUpdateConfig}
            players={players}
                    onUpdatePlayers={handleUpdatePlayers}
            pagamentos={pagamentos}
            onUpdatePagamentos={handleUpdatePagamentos}
            entradas={entradas}
            onUpdateEntradas={async () => {}}
            saidas={saidas}
            onUpdateSaidas={async () => {}}
            categoriasEntrada={categoriasEntrada}
            onUpdateCategoriasEntrada={handleUpdateCategoriasEntrada}
            categoriasSaida={categoriasSaida}
            onUpdateCategoriasSaida={handleUpdateCategoriasSaida}
            ehAdmin={ehAdmin}
          />
        )}
      </View>

      {/* BARRA DE NAVEGAÇÃO INFERIOR COM A ORDEM SOLICITADA */}
      <View style={styles.bottomNav}>
        {[
          { key: 'presenca', label: 'Presença', icon: '📋' },
          { key: 'partidas', label: 'Jogos da Rodada', icon: '⚽' },
          { key: 'ranking', label: 'Ranking', icon: '🏆' },
          ...(ehAdmin ? [{ key: 'jogadores', label: 'Jogadores', icon: '👥' }] : []),
          { key: 'caixa', label: 'Caixa', icon: '💰' },
        ].map((tab) => {
          const ativo = abaAtiva === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setAbaAtiva(tab.key as any)}
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

// ============================================
// APP WRAPPER COM PROVIDER
// ============================================

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#064e3b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#059669',
  },
  appBadge: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  appTitulo: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
  },
  headerHorario: {
    color: '#a7f3d0',
    fontSize: 10,
    marginTop: 1,
  },
  headerRightInfo: {
    alignItems: 'flex-end',
  },
  userPerfilLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userTagBadge: {
    alignItems: 'flex-end',
  },
  userTagNome: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    maxWidth: 120,
  },
  userTagPapel: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  userTagPapelAdmin: {
    color: '#fbbf24',
  },
  btnSairHeader: {
    backgroundColor: '#041f11',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  btnSairHeaderTxt: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '800',
  },
  conteudoContainer: {
    flex: 1,
    backgroundColor: '#031a0e',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#041f11',
    borderTopWidth: 1,
    borderTopColor: '#0f4829',
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: 64,
  },
  navItemAtivo: {
    backgroundColor: '#064e3b',
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  navLabelAtivo: {
    color: '#34d399',
    fontWeight: '800',
  },
});