import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';

export default function RankingTab({
  players,
  historicoRanking,
  onUpdateHistoricoRanking,
  ehAdmin = false,
}) {
  const [busca, setBusca] = useState('');
  const [jogadorDetalhes, setJogadorDetalhes] = useState(null);
  const [modalEditarJogos, setModalEditarJogos] = useState(false);
  const [tempJogosCount, setTempJogosCount] = useState('');

  // Ordenação interativa pelas 3 colunas: 'total' | 'media' | 'jogos'
  const [colunaOrdenacao, setColunaOrdenacao] = useState('total');
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState('desc'); // 'desc' | 'asc'

  const aoClicarColuna = (coluna) => {
    if (colunaOrdenacao === coluna) {
      // Inverte direção entre decrescente e crescente
      setDirecaoOrdenacao((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      // Nova coluna selecionada, começa em decrescente (maior primeiro)
      setColunaOrdenacao(coluna);
      setDirecaoOrdenacao('desc');
    }
  };

  const alertSimples = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  // Consolidação da classificação geral
  const rankingGeral = useMemo(() => {
    return players
      .map((p) => {
        const hist = historicoRanking[p.id] || {};
        const pontos = Number(hist.pontosTotais || 0);

        // Quantidade de jogos que compareceu
        let jogos = hist.jogosComparecidos;
        if (typeof jogos !== 'number') {
          const qtdDatas = Object.keys(hist.pontosPorData || {}).length;
          if (qtdDatas > 0) {
            jogos = qtdDatas;
          } else if (pontos > 0) {
            jogos = Math.max(1, Math.round(pontos / 4.8));
          } else {
            jogos = 0;
          }
        }

        const media = jogos > 0 ? pontos / jogos : 0;

        return {
          ...p,
          pontosTotais: Math.round(pontos * 10) / 10,
          jogosComparecidos: jogos,
          mediaPorJogo: Math.round(media * 100) / 100,
          pontosPorData: hist.pontosPorData || {},
        };
      })
      .filter((p) => {
        const matchNome = p.nome.toLowerCase().includes(busca.toLowerCase());
        return matchNome;
      })
      .sort((a, b) => {
        let valA = a.pontosTotais;
        let valB = b.pontosTotais;

        if (colunaOrdenacao === 'media') {
          valA = a.mediaPorJogo;
          valB = b.mediaPorJogo;
        } else if (colunaOrdenacao === 'jogos') {
          valA = a.jogosComparecidos;
          valB = b.jogosComparecidos;
        }

        if (direcaoOrdenacao === 'asc') {
          // Ordem Crescente (menor para o maior)
          if (valA !== valB) return valA - valB;
          return a.pontosTotais - b.pontosTotais;
        } else {
          // Ordem Decrescente (maior para o menor)
          if (valB !== valA) return valB - valA;
          return b.pontosTotais - a.pontosTotais;
        }
      });
  }, [players, historicoRanking, busca, colunaOrdenacao, direcaoOrdenacao]);

  const top3 = rankingGeral.slice(0, 3);
  const restante = rankingGeral.slice(3);

  // Salvar alteração manual de jogos comparecidos
  const salvarEdicaoJogos = () => {
    if (!jogadorDetalhes) return;
    const novosJogos = parseInt(tempJogosCount, 10);
    if (isNaN(novosJogos) || novosJogos < 0) {
      alertSimples('Valor Inválido', 'Informe um número válido de jogos comparecidos.');
      return;
    }

    const novoHist = {
      ...historicoRanking,
      [jogadorDetalhes.id]: {
        ...(historicoRanking[jogadorDetalhes.id] || {}),
        nome: jogadorDetalhes.nome,
        pontosTotais: jogadorDetalhes.pontosTotais,
        jogosComparecidos: novosJogos,
      },
    };

    if (onUpdateHistoricoRanking) {
      onUpdateHistoricoRanking(novoHist);
    }

    setJogadorDetalhes((prev) => ({
      ...prev,
      jogosComparecidos: novosJogos,
      mediaPorJogo: novosJogos > 0 ? Math.round((prev.pontosTotais / novosJogos) * 100) / 100 : 0,
    }));
    setModalEditarJogos(false);
    alertSimples('Atualizado! ✅', `Jogos comparecidos de ${jogadorDetalhes.nome} ajustados para ${novosJogos}.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* PÓDIO TOP 3 */}
      {rankingGeral.length >= 3 && !busca && (
        <View style={styles.podioContainer}>
          <Text style={styles.podioTitulo}>🏆 PÓDIO DA PELADA 2026</Text>
          <Text style={styles.podioSub}>Saldo Total & Média de Pontos por Jogo</Text>

          <View style={styles.podioCardsLinha}>
            {/* 2º LUGAR */}
            {top3[1] && (
              <TouchableOpacity
                onPress={() => setJogadorDetalhes(top3[1])}
                style={[styles.podioCard, styles.podioSegundo]}
              >
                <Text style={styles.podioMedalha}>🥈</Text>
                <Text style={styles.podioNome} numberOfLines={1}>{top3[1].nome}</Text>
                <Text style={styles.podioPontos}>{top3[1].pontosTotais.toFixed(1)} pts</Text>
                <Text style={styles.podioMedia}>Média: {top3[1].mediaPorJogo.toFixed(2)}</Text>
                <Text style={styles.podioPosicao}>2º LUGAR</Text>
              </TouchableOpacity>
            )}

            {/* 1º LUGAR */}
            {top3[0] && (
              <TouchableOpacity
                onPress={() => setJogadorDetalhes(top3[0])}
                style={[styles.podioCard, styles.podioPrimeiro]}
              >
                <Text style={styles.podioMedalhaOuro}>👑 🥇</Text>
                <Text style={styles.podioNomeOuro} numberOfLines={1}>{top3[0].nome}</Text>
                <Text style={styles.podioPontosOuro}>{top3[0].pontosTotais.toFixed(1)} pts</Text>
                <Text style={styles.podioMediaOuro}>Média: {top3[0].mediaPorJogo.toFixed(2)}</Text>
                <Text style={styles.podioPosicaoOuro}>LÍDER</Text>
              </TouchableOpacity>
            )}

            {/* 3º LUGAR */}
            {top3[2] && (
              <TouchableOpacity
                onPress={() => setJogadorDetalhes(top3[2])}
                style={[styles.podioCard, styles.podioTerceiro]}
              >
                <Text style={styles.podioMedalha}>🥉</Text>
                <Text style={styles.podioNome} numberOfLines={1}>{top3[2].nome}</Text>
                <Text style={styles.podioPontos}>{top3[2].pontosTotais.toFixed(1)} pts</Text>
                <Text style={styles.podioMedia}>Média: {top3[2].mediaPorJogo.toFixed(2)}</Text>
                <Text style={styles.podioPosicao}>3º LUGAR</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* BARRA DE PESQUISA */}
      <View style={styles.barraControles}>
        <TextInput
          style={styles.inputBusca}
          placeholder="Buscar jogador no ranking..."
          placeholderTextColor="#64748b"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* TABELA DE CLASSIFICAÇÃO */}
      <View style={styles.cardTabelaGeral}>
        {/* CABEÇALHO DA TABELA INTERATIVO (CLIQUE PARA ORDENAR CRESCENTE / DECRESCENTE) */}
        <View style={styles.tabelaHeaderLinha}>
          <Text style={[styles.colHeader, { width: 34 }]}>POS</Text>
          <Text style={[styles.colHeader, { flex: 1 }]}>JOGADOR</Text>

          {/* 1. JOGOS */}
          <TouchableOpacity
            style={[styles.colHeaderBtn, { width: 56 }]}
            onPress={() => aoClicarColuna('jogos')}
          >
            <Text
              style={[
                styles.colHeader,
                styles.colHeaderClicavel,
                colunaOrdenacao === 'jogos' && styles.colHeaderAtivo,
              ]}
            >
              JOGOS {colunaOrdenacao === 'jogos' ? (direcaoOrdenacao === 'desc' ? '▾' : '▴') : ''}
            </Text>
          </TouchableOpacity>

          {/* 2. MÉDIA/J */}
          <TouchableOpacity
            style={[styles.colHeaderBtn, { width: 72 }]}
            onPress={() => aoClicarColuna('media')}
          >
            <Text
              style={[
                styles.colHeader,
                styles.colHeaderClicavel,
                colunaOrdenacao === 'media' && styles.colHeaderAtivo,
              ]}
            >
              MÉDIA/J {colunaOrdenacao === 'media' ? (direcaoOrdenacao === 'desc' ? '▾' : '▴') : ''}
            </Text>
          </TouchableOpacity>

          {/* 3. TOTAL */}
          <TouchableOpacity
            style={[styles.colHeaderBtn, { width: 72, alignItems: 'flex-end' }]}
            onPress={() => aoClicarColuna('total')}
          >
            <Text
              style={[
                styles.colHeader,
                styles.colHeaderClicavel,
                { textAlign: 'right' },
                colunaOrdenacao === 'total' && styles.colHeaderAtivo,
              ]}
            >
              TOTAL {colunaOrdenacao === 'total' ? (direcaoOrdenacao === 'desc' ? '▾' : '▴') : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* LINHAS DA TABELA */}
        {(busca || colunaOrdenacao !== 'total' || direcaoOrdenacao !== 'desc' ? rankingGeral : restante).map((p, idx) => {
          const posicaoReal = rankingGeral.findIndex((x) => x.id === p.id) + 1;
          const ehGoleiro = p.posicao === 'Goleiro';

          return (
            <TouchableOpacity
              key={p.id}
              style={styles.tabelaLinha}
              onPress={() => setJogadorDetalhes(p)}
            >
              {/* POSIÇÃO */}
              <Text style={styles.colPos}>#{posicaoReal}</Text>

              {/* JOGADOR */}
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, marginRight: 6 }}>{p.avatar}</Text>
                <View>
                  <Text style={styles.colNome}>{p.nome}</Text>
                  <Text style={styles.colSubPos}>{ehGoleiro ? '🧤 Goleiro' : 'Linha'}</Text>
                </View>
              </View>

              {/* JOGOS COMPARECIDOS */}
              <Text style={styles.colJogos}>{p.jogosComparecidos}</Text>

              {/* MÉDIA POR JOGO */}
              <View style={styles.colMediaBox}>
                <Text style={styles.colMediaTxt}>{p.mediaPorJogo.toFixed(2)}</Text>
              </View>

              {/* SALDO TOTAL */}
              <Text style={styles.colPontos}>{p.pontosTotais.toFixed(1)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* MODAL DETALHES DO JOGADOR */}
      <Modal visible={!!jogadorDetalhes} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderLinha}>
              <View>
                <Text style={styles.modalTitulo}>{jogadorDetalhes?.nome}</Text>
                <Text style={styles.modalSub}>
                  {jogadorDetalhes?.posicao === 'Goleiro' ? '🧤 Goleiro' : '⚽ Jogador de Linha'} • {jogadorDetalhes?.status}
                </Text>
              </View>
              <Text style={{ fontSize: 32 }}>{jogadorDetalhes?.avatar}</Text>
            </View>

            {/* CARDS DE SALDO TOTAL E MÉDIA */}
            <View style={styles.metricasDestaqueModal}>
              <View style={styles.metricaBoxModal}>
                <Text style={styles.metricaBoxLabel}>SALDO TOTAL</Text>
                <Text style={styles.metricaBoxValorVerde}>
                  {jogadorDetalhes?.pontosTotais.toFixed(1)} pts
                </Text>
              </View>

              <View style={styles.metricaDivisorModal} />

              <View style={styles.metricaBoxModal}>
                <Text style={styles.metricaBoxLabel}>MÉDIA POR JOGO</Text>
                <Text style={styles.metricaBoxValorAmbar}>
                  {jogadorDetalhes?.mediaPorJogo.toFixed(2)} pts/j
                </Text>
              </View>
            </View>

            {/* CONTADOR DE JOGOS COMPARECIDOS COM BOTÃO DE EDIÇÃO */}
            <View style={styles.jogosComparecidosLinha}>
              <Text style={styles.jogosComparecidosTxt}>
                Compareceu em:{' '}
                <Text style={{ fontWeight: 'bold', color: '#f8fafc' }}>
                  {jogadorDetalhes?.jogosComparecidos} peladas/jogos
                </Text>
              </Text>

              {ehAdmin && (
                <TouchableOpacity
                  style={styles.btnEditarJogos}
                  onPress={() => {
                    setTempJogosCount(String(jogadorDetalhes?.jogosComparecidos || 0));
                    setModalEditarJogos(true);
                  }}
                >
                  <Text style={styles.btnEditarJogosTxt}>✏️ Ajustar</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* HISTÓRICO POR DATA */}
            <Text style={styles.modalSecaoSubtitulo}>📅 Pontuação por Rodada Registrada:</Text>
            <ScrollView style={{ maxHeight: 220, marginBottom: 16 }}>
              {Object.keys(jogadorDetalhes?.pontosPorData || {}).length === 0 ? (
                <Text style={styles.semDadosTxt}>
                  Nenhuma partida finalizada no app ainda. Os pontos acima correspondem ao saldo acumulado da temporada 2026.
                </Text>
              ) : (
                Object.entries(jogadorDetalhes?.pontosPorData || {}).map(([data, pts]) => (
                  <View key={data} style={styles.linhaDataHistorico}>
                    <Text style={styles.dataHistoricoTxt}>⚽ Rodada {data}</Text>
                    <View style={styles.badgeDataHistorico}>
                      <Text style={styles.badgeDataHistoricoTxt}>+{Number(pts).toFixed(1)} pts</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.btnFecharModal}
              onPress={() => setJogadorDetalhes(null)}
            >
              <Text style={styles.btnFecharModalTxt}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL SECUNDÁRIO: EDITAR QUANTIDADE DE JOGOS COMPARECIDOS */}
      <Modal visible={modalEditarJogos} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 320 }]}>
            <Text style={styles.modalTitulo}>Ajustar Presenças</Text>
            <Text style={styles.modalSub}>{jogadorDetalhes?.nome}</Text>

            <Text style={styles.labelInputModal}>Jogos que compareceu na temporada:</Text>
            <TextInput
              style={styles.inputModalQtd}
              keyboardType="numeric"
              value={tempJogosCount}
              onChangeText={setTempJogosCount}
              placeholder="Ex: 35"
              placeholderTextColor="#64748b"
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={styles.btnCancelarModal}
                onPress={() => setModalEditarJogos(false)}
              >
                <Text style={styles.btnCancelarModalTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSalvarModal}
                onPress={salvarEdicaoJogos}
              >
                <Text style={styles.btnSalvarModalTxt}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031a0e',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  // Pódio
  podioContainer: {
    backgroundColor: '#062817',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f4829',
    alignItems: 'center',
  },
  podioTitulo: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  podioSub: {
    color: '#6ee7b7',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 14,
  },
  podioCardsLinha: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  podioCard: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  podioPrimeiro: {
    backgroundColor: '#0a3a22',
    borderColor: '#fbbf24',
    paddingVertical: 18,
  },
  podioSegundo: {
    backgroundColor: '#062615',
    borderColor: '#94a3b8',
    paddingVertical: 12,
  },
  podioTerceiro: {
    backgroundColor: '#062615',
    borderColor: '#b45309',
    paddingVertical: 10,
  },
  podioMedalha: {
    fontSize: 22,
    marginBottom: 4,
  },
  podioMedalhaOuro: {
    fontSize: 26,
    marginBottom: 4,
  },
  podioNome: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
  },
  podioNomeOuro: {
    color: '#fbbf24',
    fontSize: 15,
    fontWeight: '900',
  },
  podioPontos: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  podioPontosOuro: {
    color: '#34d399',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  podioMedia: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  podioMediaOuro: {
    color: '#fef08a',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  podioPosicao: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  podioPosicaoOuro: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: 1,
  },

  // Barra de Controles
  barraControles: {
    marginBottom: 14,
  },
  inputBusca: {
    backgroundColor: '#062615',
    color: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#0f4829',
  },

  // Tabela Geral
  cardTabelaGeral: {
    backgroundColor: '#062615',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  tabelaHeaderLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#0f4829',
    marginBottom: 4,
  },
  colHeader: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  colHeaderBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colHeaderClicavel: {
    color: '#94a3b8',
  },
  colHeaderAtivo: {
    color: '#34d399',
    fontWeight: '900',
  },
  tabelaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#08331f',
  },
  colPos: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '900',
    width: 34,
  },
  colNome: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  colSubPos: {
    color: '#64748b',
    fontSize: 10,
  },
  colJogos: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    width: 50,
    textAlign: 'center',
  },
  colMediaBox: {
    width: 68,
    alignItems: 'center',
  },
  colMediaTxt: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '800',
  },
  colPontos: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '900',
    width: 72,
    textAlign: 'right',
  },

  // Modal Detalhes
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#062615',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#10b981',
    maxHeight: '90%',
  },
  modalHeaderLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitulo: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
  },
  modalSub: {
    color: '#6ee7b7',
    fontSize: 12,
    marginTop: 2,
  },
  metricasDestaqueModal: {
    flexDirection: 'row',
    backgroundColor: '#041f11',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  metricaBoxModal: {
    flex: 1,
    alignItems: 'center',
  },
  metricaBoxLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
  },
  metricaBoxValorVerde: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  metricaBoxValorAmbar: {
    color: '#f59e0b',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  metricaDivisorModal: {
    width: 1,
    height: 36,
    backgroundColor: '#0f4829',
  },
  jogosComparecidosLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#08331f',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  jogosComparecidosTxt: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  btnEditarJogos: {
    backgroundColor: '#0f4829',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  btnEditarJogosTxt: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '700',
  },
  modalSecaoSubtitulo: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  semDadosTxt: {
    color: '#64748b',
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  linhaDataHistorico: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#08331f',
  },
  dataHistoricoTxt: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  badgeDataHistorico: {
    backgroundColor: '#065f46',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeDataHistoricoTxt: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '800',
  },
  btnFecharModal: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnFecharModalTxt: {
    color: '#022c22',
    fontSize: 13,
    fontWeight: '900',
  },

  // Modal Editar Presenças
  labelInputModal: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  inputModalQtd: {
    backgroundColor: '#041f11',
    color: '#ffffff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  btnCancelarModal: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#1e293b',
  },
  btnCancelarModalTxt: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  btnSalvarModal: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  btnSalvarModalTxt: {
    color: '#022c22',
    fontSize: 12,
    fontWeight: '800',
  },
});
