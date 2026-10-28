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
  useWindowDimensions,
} from 'react-native';

import { StorageService } from './src/storage/storage';
import { AuthService, normalizarLogin } from './src/services/authService';
import LoginScreen from './src/components/LoginScreen';
import FinanceiroTab from './src/components/FinanceiroTab';
import PlayersTab from './src/components/PlayersTab';
import PartidasTab from './src/components/PartidasTab';
import RankingTab from './src/components/RankingTab';
import PresencaTab from './src/components/PresencaTab';

export default function App() {
  const [carregando, setCarregando] = useState(true);

  // Sessão do Usuário Logado e Controle de Acesso
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Estados principais da aplicação
  // Ordem das Abas solicitada pelo usuário:
  // 1) Presença | 2) Jogos / Times | 3) Ranking | 4) Jogadores (Admin) | 5) Caixa
  const [abaAtiva, setAbaAtiva] = useState('presenca');
  const [config, setConfig] = useState({});
  const [players, setPlayers] = useState([]);
  const [pagamentos, setPagamentos] = useState({});
  const [entradas, setEntradas] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const [categoriasEntrada, setCategoriasEntrada] = useState([]);
  const [categoriasSaida, setCategoriasSaida] = useState([]);
  const [historicoRanking, setHistoricoRanking] = useState({});
  
  // Times ativos e jogadores confirmados para o sorteio
  const [timesAtuais, setTimesAtuais] = useState(null);
  const [jogadoresPreSelecionados, setJogadoresPreSelecionados] = useState(null);

  // Carrega dados iniciais do Storage / Planilha e Sessão Ativa
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

        // Recupera sessão se o usuário já estiver autenticado
        const sessaoSalva = await AuthService.obterSessaoAtiva();
        if (sessaoSalva) {
          setUsuarioLogado(sessaoSalva);
        }
      } catch (e) {
        console.error('Erro na inicialização:', e);
      } finally {
        setCarregando(false);
      }
    }
    inicializar();
  }, []);

  const { width } = useWindowDimensions();
  const ehMobile = width < 768;

  const ehAdmin = Boolean(usuarioLogado?.ehAdmin);

  // Proteção: caso um usuário comum tente ficar na aba jogadores, redireciona para presença
  useEffect(() => {
    if (usuarioLogado && !ehAdmin && abaAtiva === 'jogadores') {
      setAbaAtiva('presenca');
    }
  }, [usuarioLogado, ehAdmin, abaAtiva]);

  // Handlers com persistência automática no AsyncStorage
  const handleUpdateConfig = async (novaConfig) => {
    setConfig(novaConfig);
    await StorageService.salvarConfig(novaConfig);
  };

  const handleUpdatePlayers = async (novosPlayers) => {
    setPlayers(novosPlayers);
    await StorageService.salvarPlayers(novosPlayers);

    // Se o usuário atualmente logado tiver seu papel alterado (ex: promovido ou rebaixado), sincroniza a sessão imediatamente
    if (usuarioLogado) {
      const meuJogadorAtualizado = novosPlayers.find(
        (p) => p.id === usuarioLogado.id || (usuarioLogado.login && p.nome && normalizarLogin(p.nome) === usuarioLogado.login)
      );
      if (meuJogadorAtualizado) {
        const novoEhAdmin = usuarioLogado.login === 'douglas' || Boolean(meuJogadorAtualizado.ehAdmin);
        const novoUsuario = {
          ...usuarioLogado,
          ...meuJogadorAtualizado,
          ehAdmin: novoEhAdmin,
          papel: novoEhAdmin ? 'admin' : 'jogador',
        };
        setUsuarioLogado(novoUsuario);
        await AuthService.salvarSessao(novoUsuario);
      }
    }
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

      novoHist[playerId].pontosTotais =
        Math.round(((novoHist[playerId].pontosTotais || 0) + stats.pontos) * 10) / 10;

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

  // TELA DE LOGIN OBRIGATÓRIA: Bloqueia 100% dos dados para usuários não autenticados
  if (!usuarioLogado) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#064e3b" />
        <LoginScreen
          players={players}
          onLoginSucesso={(usuario) => {
            setUsuarioLogado(usuario);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />

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
              onPress={async () => {
                await AuthService.fazerLogout();
                setUsuarioLogado(null);
                setAbaAtiva('presenca');
              }}
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
            onEnviarParaSorteio={(confirmados) => {
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
            ehAdmin={ehAdmin}
          />
        )}
      </View>

      {/* BARRA DE NAVEGAÇÃO INFERIOR COM A ORDEM SOLICITADA */}
      <View style={[styles.bottomNav, ehMobile && styles.bottomNavMobile]}>
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
    backgroundColor: '#041f11',
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
  bottomNavMobile: {
    marginBottom: 58,
    borderBottomWidth: 1,
    borderBottomColor: '#0f4829',
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
