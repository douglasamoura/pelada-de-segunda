import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { DATAS_RODADAS } from '../data/initialData';

export default function RankingTab({
  players,
  historicoRanking,
  onUpdateHistoricoRanking,
}) {
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'mensalista' | 'diarista'
  const [jogadorDetalhes, setJogadorDetalhes] = useState(null); // jogador selecionado para ver histórico por rodada

  // Monta lista de classificação geral com dados consolidados
  const rankingGeral = useMemo(() => {
    return players
      .map((p) => {
        const hist = historicoRanking[p.id] || {};
        const pontos = hist.pontosTotais || 0;
        return {
          ...p,
          pontosTotais: pontos,
          pontosPorData: hist.pontosPorData || {},
        };
      })
      .filter((p) => {
        const matchNome = p.nome.toLowerCase().includes(busca.toLowerCase());
        if (!matchNome) return false;
        if (filtroTipo === 'mensalista') return p.status.includes('Mensalista');
        if (filtroTipo === 'diarista') return p.status.includes('Diarista');
        return true;
      })
      .sort((a, b) => b.pontosTotais - a.pontosTotais);
  }, [players, historicoRanking, busca, filtroTipo]);

  const top3 = rankingGeral.slice(0, 3);
  const restante = rankingGeral.slice(3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* PÓDIO TOP 3 */}
      {rankingGeral.length >= 3 && !busca && filtroTipo === 'todos' && (
        <View style={styles.podioContainer}>
          <Text style={styles.podioTitulo}>🏆 PÓDIO DA PELADA 2026</Text>

          <View style={styles.podioCardsLinha}>
            {/* 2º LUGAR */}
            {top3[1] && (
              <TouchableOpacity
                onPress={() => setJogadorDetalhes(top3[1])}
                style={[styles.podioCard, styles.podioSegundo]}
              >
                <Text style={styles.podioMedalha}>🥈</Text>
                <Text style={styles.podioNome} numberOfLines={1}>{top3[1].nome}</Text>
                <Text style={styles.podioPontos}>{top3[1].pontosTotais} pts</Text>
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
                <Text style={styles.podioPontosOuro}>{top3[0].pontosTotais} pts</Text>
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
                <Text style={styles.podioPontos}>{top3[2].pontosTotais} pts</Text>
                <Text style={styles.podioPosicao}>3º LUGAR</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* BARRA DE PESQUISA & FILTROS */}
      <View style={styles.filtrosBox}>
        <TextInput
          style={styles.inputBusca}
          placeholder="Buscar jogador no ranking..."
          value={busca}
          onChangeText={setBusca}
        />

        <View style={styles.filtrosRow}>
          {['todos', 'mensalista', 'diarista'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filtroBtn, filtroTipo === f && styles.filtroBtnAtivo]}
              onPress={() => setFiltroTipo(f)}
            >
              <Text style={[styles.filtroBtnTxt, filtroTipo === f && styles.filtroBtnTxtAtivo]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* TABELA DE CLASSIFICAÇÃO */}
      <View style={styles.cardTabelaGeral}>
        <View style={styles.tabelaHeaderLinha}>
          <Text style={[styles.colHeader, { width: 36 }]}>POS</Text>
          <Text style={[styles.colHeader, { flex: 1 }]}>JOGADOR</Text>
          <Text style={[styles.colHeader, { width: 70, textAlign: 'center' }]}>STATUS</Text>
          <Text style={[styles.colHeader, { width: 70, textAlign: 'right' }]}>PONTOS</Text>
        </View>

        {(busca || filtroTipo !== 'todos' ? rankingGeral : restante).map((p, idx) => {
          const posicaoReal = rankingGeral.findIndex((x) => x.id === p.id) + 1;
          return (
            <TouchableOpacity
              key={p.id}
              style={styles.tabelaLinha}
              onPress={() => setJogadorDetalhes(p)}
            >
              <Text style={styles.colPos}>#{posicaoReal}</Text>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, marginRight: 6 }}>{p.avatar}</Text>
                <Text style={styles.colNome}>{p.nome}</Text>
              </View>
              <View style={styles.colStatusBadge}>
                <Text style={styles.colStatusTxt}>
                  {p.status.includes('Mensalista') ? 'Mensal' : 'Diarista'}
                </Text>
              </View>
              <Text style={styles.colPontos}>{p.pontosTotais.toFixed(1)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* MODAL DETALHES DO JOGADOR & PONTOS POR RODADA */}
      <Modal visible={!!jogadorDetalhes} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>{jogadorDetalhes?.nome}</Text>
            <Text style={styles.modalSub}>
              {jogadorDetalhes?.status} • Total Acumulado:{' '}
              <Text style={{ fontWeight: 'bold', color: '#10b981' }}>
                {jogadorDetalhes?.pontosTotais} pts
              </Text>
            </Text>

            <Text style={styles.modalSecaoSubtitulo}>📅 Histórico de Pontuação por Rodada:</Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {Object.keys(jogadorDetalhes?.pontosPorData || {}).length === 0 ? (
                <Text style={styles.semDadosTxt}>Nenhum registro de rodada anterior.</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  podioContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  podioTitulo: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 14,
  },
  podioCardsLinha: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  podioCard: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
  },
  podioPrimeiro: {
    backgroundColor: '#eab308',
    paddingVertical: 18,
    elevation: 4,
  },
  podioSegundo: {
    backgroundColor: '#cbd5e1',
    paddingVertical: 14,
  },
  podioTerceiro: {
    backgroundColor: '#fed7aa',
    paddingVertical: 12,
  },
  podioMedalhaOuro: {
    fontSize: 24,
    marginBottom: 4,
  },
  podioMedalha: {
    fontSize: 20,
    marginBottom: 4,
  },
  podioNomeOuro: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
  },
  podioNome: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  podioPontosOuro: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    marginVertical: 4,
  },
  podioPontos: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginVertical: 2,
  },
  podioPosicaoOuro: {
    fontSize: 9,
    fontWeight: '900',
    color: '#713f12',
    backgroundColor: '#fef08a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  podioPosicao: {
    fontSize: 8,
    fontWeight: '800',
    color: '#334155',
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  filtrosBox: {
    marginBottom: 12,
    gap: 8,
  },
  inputBusca: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  filtrosRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filtroBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filtroBtnAtivo: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filtroBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  filtroBtnTxtAtivo: {
    color: '#ffffff',
  },
  cardTabelaGeral: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  tabelaHeaderLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
    marginBottom: 6,
  },
  colHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  tabelaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  colPos: {
    width: 36,
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
  },
  colNome: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  colStatusBadge: {
    width: 70,
    backgroundColor: '#f1f5f9',
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
  },
  colStatusTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  colPontos: {
    width: 70,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '900',
    color: '#059669',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 400,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 16,
  },
  modalSecaoSubtitulo: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 10,
  },
  semDadosTxt: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  linhaDataHistorico: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dataHistoricoTxt: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
  },
  badgeDataHistorico: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeDataHistoricoTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  btnFecharModal: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18,
  },
  btnFecharModalTxt: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

