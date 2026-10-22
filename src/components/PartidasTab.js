import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';

export default function PartidasTab({
  timesAtuais,
  players,
  onAdicionarPontosRodada,
}) {
  // Se não houver times definidos pelo sorteio, usa os 3 times padrão
  const timesDisponiveis = timesAtuais && timesAtuais.length === 3 ? timesAtuais : [
    { id: 1, nome: 'Time Colete', cor: '#16a34a', jogadores: players.slice(0, 5) },
    { id: 2, nome: 'Time Branco', cor: '#f8fafc', textColor: '#1e293b', jogadores: players.slice(5, 10) },
    { id: 3, nome: 'Time Preto', cor: '#18181b', jogadores: players.slice(10, 15) },
  ];

  // Fila de jogo:
  // timeCasa: time que já estava na quadra (se for a primeira partida, é o Time 1)
  // timeVisitante: time que entrou de fora (tem a VANTAGEM DO EMPATE!)
  // timeEspera: time que está de fora aguardando
  const [timeCasa, setTimeCasa] = useState(timesDisponiveis[0]);
  const [timeVisitante, setTimeVisitante] = useState(timesDisponiveis[1]);
  const [timeEspera, setTimeEspera] = useState(timesDisponiveis[2]);

  // Atualiza se times mudarem por novo sorteio
  useEffect(() => {
    if (timesAtuais && timesAtuais.length === 3) {
      setTimeCasa(timesAtuais[0]);
      setTimeVisitante(timesAtuais[1]);
      setTimeEspera(timesAtuais[2]);
    }
  }, [timesAtuais]);

  // Cronômetro da partida (7 minutos = 420 segundos)
  const TEMPO_PADRAO_SEGUNDOS = 7 * 60;
  const [tempoRestante, setTempoRestante] = useState(TEMPO_PADRAO_SEGUNDOS);
  const [cronometroAtivo, setCronometroAtivo] = useState(false);
  const timerRef = useRef(null);

  // Placar do jogo atual
  const [golsCasa, setGolsCasa] = useState(0);
  const [golsVisitante, setGolsVisitante] = useState(0);

  // Eventos do jogo atual (gols, autores e assistências)
  const [eventosJogoAtual, setEventosJogoAtual] = useState([]);

  // Histórico de partidas jogadas na sessão atual
  const [partidasRealizadas, setPartidasRealizadas] = useState([]);

  // Modal para registrar autor do gol e assistência
  const [modalGol, setModalGol] = useState(null); // { timeAlvo: 'casa' | 'visitante' }
  const [autorGol, setAutorGol] = useState(null);
  const [assistenciaGol, setAssistenciaGol] = useState(null);

  // Pontuação acumulada na rodada de hoje por jogador ID: { [pId]: { pontos, vitorias, empates, gols, assistencias } }
  const [pontosRodada, setPontosRodada] = useState({});

  // Efeito do Cronômetro
  useEffect(() => {
    if (cronometroAtivo) {
      timerRef.current = setInterval(() => {
        setTempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCronometroAtivo(false);
            alertSimples('Fim de Jogo! ⏱️', 'Os 7 minutos terminaram! Finalize a partida.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cronometroAtivo]);

  const alertSimples = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  const formatarTempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
  };

  // Abrir modal de gol
  const registrarGolTime = (lado) => {
    setAutorGol(null);
    setAssistenciaGol(null);
    setModalGol({ timeAlvo: lado });
  };

  // Confirmar gol
  const confirmarRegistroGol = () => {
    if (!modalGol) return;
    const time = modalGol.timeAlvo === 'casa' ? timeCasa : timeVisitante;

    if (modalGol.timeAlvo === 'casa') {
      setGolsCasa((g) => g + 1);
    } else {
      setGolsVisitante((g) => g + 1);
    }

    setEventosJogoAtual((prev) => [
      ...prev,
      {
        id: `ev_${Date.now()}`,
        timeNome: time.nome,
        autor: autorGol,
        assistencia: assistenciaGol,
        minuto: formatarTempo(TEMPO_PADRAO_SEGUNDOS - tempoRestante),
      },
    ]);

    setModalGol(null);
  };

  // FINALIZAR PARTIDA E APLICAR REGRAS EXATAS
  const finalizarPartida = () => {
    // Determina o vencedor
    let vencedor = null;
    let timeQueFica = null;
    let timeQueSai = null;
    let foiEmpate = false;

    if (golsCasa > golsVisitante) {
      vencedor = timeCasa;
      timeQueFica = timeCasa;
      timeQueSai = timeVisitante;
    } else if (golsVisitante > golsCasa) {
      vencedor = timeVisitante;
      timeQueFica = timeVisitante;
      timeQueSai = timeCasa;
    } else {
      // EMPATE:
      // REGRA: "e 1 ponto para cada empate (mas somente ao time que ficar na quandra,
      // o time que fica na quadra é o time que estava de fora, entao ele entra com a vantagem do empate)"
      foiEmpate = true;
      vencedor = null;
      timeQueFica = timeVisitante; // o visitante veio de fora com a vantagem!
      timeQueSai = timeCasa;
    }

    // Calcula os pontos concedidos nesta partida:
    const novosPontosRodada = { ...pontosRodada };

    const getOuCriaStats = (pId) => {
      if (!novosPontosRodada[pId]) {
        novosPontosRodada[pId] = {
          nome: players.find((x) => x.id === pId)?.nome || 'Jogador',
          pontos: 0,
          vitorias: 0,
          empates: 0,
          gols: 0,
          assistencias: 0,
          jogos: 0,
        };
      }
      return novosPontosRodada[pId];
    };

    // Computa jogos para todos os que jogaram
    timeCasa.jogadores.forEach((j) => {
      const st = getOuCriaStats(j.id);
      st.jogos += 1;
    });
    timeVisitante.jogadores.forEach((j) => {
      const st = getOuCriaStats(j.id);
      st.jogos += 1;
    });

    // 1. Vitórias (3 pontos para cada do time vencedor)
    if (!foiEmpate && vencedor) {
      vencedor.jogadores.forEach((j) => {
        const st = getOuCriaStats(j.id);
        st.pontos += 3.0;
        st.vitorias += 1;
      });
    }

    // 2. Empates (1 ponto somente para o time que fica na quadra com a vantagem)
    if (foiEmpate) {
      timeQueFica.jogadores.forEach((j) => {
        const st = getOuCriaStats(j.id);
        st.pontos += 1.0;
        st.empates += 1;
      });
    }

    // 3. Participações em gol: 0,5 pontos por gol ou assistência
    eventosJogoAtual.forEach((ev) => {
      if (ev.autor) {
        const st = getOuCriaStats(ev.autor.id);
        st.pontos += 0.5;
        st.gols += 1;
      }
      if (ev.assistencia) {
        const st = getOuCriaStats(ev.assistencia.id);
        st.pontos += 0.5;
        st.assistencias += 1;
      }
    });

    setPontosRodada(novosPontosRodada);

    // Salva no registro de partidas
    const partidaSalva = {
      id: `p_${Date.now()}`,
      numero: partidasRealizadas.length + 1,
      timeCasaNome: timeCasa.nome,
      timeVisitanteNome: timeVisitante.nome,
      golsCasa,
      golsVisitante,
      timeFicouNome: timeQueFica.nome,
      foiEmpate,
      eventos: [...eventosJogoAtual],
    };
    setPartidasRealizadas((prev) => [partidaSalva, ...prev]);

    // Prepara a PRÓXIMA PARTIDA:
    // Quem ficou vira o "timeCasa" (já estava na quadra)
    // O "timeEspera" entra como "timeVisitante" (com a vantagem do empate!)
    // O que saiu vai para o "timeEspera"
    const proximoCasa = timeQueFica;
    const proximoVisitante = timeEspera;
    const proximoEspera = timeQueSai;

    setTimeCasa(proximoCasa);
    setTimeVisitante(proximoVisitante);
    setTimeEspera(proximoEspera);

    // Reseta placar e cronômetro
    setGolsCasa(0);
    setGolsVisitante(0);
    setEventosJogoAtual([]);
    setTempoRestante(TEMPO_PADRAO_SEGUNDOS);
    setCronometroAtivo(false);

    alertSimples(
      'Partida Finalizada! ⚽',
      `${partidaSalva.timeCasaNome} ${golsCasa} x ${golsVisitante} ${partidaSalva.timeVisitanteNome}\n\n` +
        (foiEmpate
          ? `Empate! ${timeQueFica.nome} fica na quadra pela VANTAGEM DO EMPATE (+1 pt para cada).\n\n`
          : `Vitória do ${vencedor.nome}! (+3 pts para cada jogador).\n\n`) +
        `Próximo jogo: ${proximoCasa.nome} x ${proximoVisitante.nome} (${proximoVisitante.nome} entra com vantagem do empate).`
    );
  };

  // Salvar a rodada inteira na Tabela de Ranking Oficial
  const salvarRodadaNoRanking = () => {
    if (Object.keys(pontosRodada).length === 0) {
      alertSimples('Sem Pontos', 'Finalize pelo menos uma partida para registrar pontos na rodada.');
      return;
    }

    if (onAdicionarPontosRodada) {
      onAdicionarPontosRodada(pontosRodada, new Date().toLocaleDateString('pt-BR'));
      alertSimples('Rodada Salva!', 'Todos os pontos conquistados hoje foram computados na Classificação Geral!');
    }
  };

  // Lista dos jogadores com pontos na rodada ordenados
  const rankingRodada = Object.entries(pontosRodada)
    .map(([id, dados]) => ({ id, ...dados }))
    .sort((a, b) => b.pontos - a.pontos);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* CARD DO JOGO ATUAL COM PLACAR E CRONÔMETRO */}
      <View style={styles.cardJogoAtual}>
        {/* CRONÔMETRO DE 7 MIN */}
        <View style={styles.cronometroContainer}>
          <Text style={styles.cronometroLabel}>⏱️ TEMPO DE JOGO (7 MIN):</Text>
          <Text style={styles.cronometroDisplay}>{formatarTempo(tempoRestante)}</Text>

          <View style={styles.cronometroBotoes}>
            <TouchableOpacity
              onPress={() => setCronometroAtivo(!cronometroAtivo)}
              style={[styles.btnCrono, cronometroAtivo ? styles.btnCronoPausar : styles.btnCronoIniciar]}
            >
              <Text style={styles.btnCronoTxt}>
                {cronometroAtivo ? '⏸️ PAUSAR' : '▶️ INICIAR'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setCronometroAtivo(false);
                setTempoRestante(TEMPO_PADRAO_SEGUNDOS);
              }}
              style={styles.btnCronoReset}
            >
              <Text style={styles.btnCronoResetTxt}>🔄 Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PLACAR DO CONFRONTO */}
        <View style={styles.confrontoContainer}>
          {/* TIME CASA (NA QUADRA) */}
          <View style={styles.timeBox}>
            <View style={[styles.timeCorBar, { backgroundColor: timeCasa.cor }]} />
            <Text style={styles.timeNomePlacar}>{timeCasa.nome}</Text>
            <Text style={styles.timeStatusQuadra}>Na Quadra</Text>
            <Text style={styles.placarNumero}>{golsCasa}</Text>
            <TouchableOpacity onPress={() => registrarGolTime('casa')} style={styles.btnGol}>
              <Text style={styles.btnGolTxt}>+ GOL</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divisorVs}>
            <Text style={styles.vsTexto}>X</Text>
          </View>

          {/* TIME VISITANTE (DE FORA - COM VANTAGEM DO EMPATE) */}
          <View style={styles.timeBox}>
            <View style={[styles.timeCorBar, { backgroundColor: timeVisitante.cor }]} />
            <Text style={styles.timeNomePlacar}>{timeVisitante.nome}</Text>
            <View style={styles.badgeVantagem}>
              <Text style={styles.badgeVantagemTxt}>⚖️ Vantagem Empate</Text>
            </View>
            <Text style={styles.placarNumero}>{golsVisitante}</Text>
            <TouchableOpacity onPress={() => registrarGolTime('visitante')} style={styles.btnGol}>
              <Text style={styles.btnGolTxt}>+ GOL</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* EVENTOS / GOLS DA PARTIDA ATUAL */}
        {eventosJogoAtual.length > 0 && (
          <View style={styles.eventosPartidaBox}>
            <Text style={styles.eventosTitulo}>⚽ Gols nesta partida (+0.5 pt por gol/assist):</Text>
            {eventosJogoAtual.map((ev) => (
              <Text key={ev.id} style={styles.eventoLinha}>
                • {ev.minuto} - {ev.timeNome}:{' '}
                <Text style={{ fontWeight: 'bold' }}>{ev.autor?.nome || 'Gol'}</Text>
                {ev.assistencia ? ` (Assist: ${ev.assistencia.nome})` : ''}
              </Text>
            ))}
          </View>
        )}

        {/* BOTÃO FINALIZAR PARTIDA */}
        <TouchableOpacity onPress={finalizarPartida} style={styles.btnFinalizarPartida}>
          <Text style={styles.btnFinalizarPartidaTxt}>🏁 FINALIZAR PARTIDA & COMPUTAR PONTOS</Text>
        </TouchableOpacity>

        {/* TIME QUE ESTÁ NA ESPERA */}
        <View style={styles.timeEsperaAviso}>
          <Text style={styles.timeEsperaTxt}>
            ⏳ <Text style={{ fontWeight: 'bold' }}>Próximo na fila:</Text> {timeEspera.nome} (entra contra quem ficar)
          </Text>
        </View>
      </View>

      {/* PONTUAÇÃO ACUMULADA DA RODADA DE HOJE */}
      {rankingRodada.length > 0 && (
        <View style={styles.cardPontosRodada}>
          <View style={styles.pontosRodadaHeader}>
            <View>
              <Text style={styles.cardSecaoTitulo}>🏆 Pontuação da Rodada de Hoje</Text>
              <Text style={styles.cardSecaoSub}>
                Vitória = 3 pts • Empate c/ Vantagem = 1 pt • Gol / Assist = 0.5 pt
              </Text>
            </View>
            <TouchableOpacity onPress={salvarRodadaNoRanking} style={styles.btnSalvarGeral}>
              <Text style={styles.btnSalvarGeralTxt}>💾 Salvar Rodada</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabelaRodada}>
            {rankingRodada.map((item, idx) => (
              <View key={item.id} style={styles.itemRankingRodada}>
                <Text style={styles.posRankingRodada}>#{idx + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nomeRankingRodada}>{item.nome}</Text>
                  <Text style={styles.statsRankingRodada}>
                    {item.vitorias}V • {item.empates}E • {item.gols}G • {item.assistencias}A ({item.jogos} jogos)
                  </Text>
                </View>
                <View style={styles.badgePontosRodada}>
                  <Text style={styles.badgePontosRodadaTxt}>{item.pontos.toFixed(1)} pts</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* HISTÓRICO DE PARTIDAS REALIZADAS NA SESSÃO */}
      {partidasRealizadas.length > 0 && (
        <View style={styles.cardHistoricoPartidas}>
          <Text style={styles.cardSecaoTitulo}>📜 Partidas Realizadas Hoje ({partidasRealizadas.length})</Text>
          {partidasRealizadas.map((p) => (
            <View key={p.id} style={styles.itemPartidaHistorico}>
              <View style={styles.partidaHeaderLinha}>
                <Text style={styles.partidaNumero}>Partida #{p.numero}</Text>
                <Text style={styles.partidaResultado}>
                  {p.foiEmpate ? '🤝 Empate (Vantagem)' : '🏆 Vitória'}
                </Text>
              </View>

              <Text style={styles.partidaPlacarTxt}>
                {p.timeCasaNome} <Text style={{ fontWeight: '900' }}>{p.golsCasa}</Text> x{' '}
                <Text style={{ fontWeight: '900' }}>{p.golsVisitante}</Text> {p.timeVisitanteNome}
              </Text>

              <Text style={styles.partidaFicouTxt}>
                Ficou na quadra: <Text style={{ fontWeight: 'bold' }}>{p.timeFicouNome}</Text>
              </Text>

              {p.eventos && p.eventos.length > 0 && (
                <View style={styles.partidaGolsLista}>
                  {p.eventos.map((ev) => (
                    <Text key={ev.id} style={styles.partidaGolTxt}>
                      ⚽ {ev.autor?.nome || 'Gol'}{ev.assistencia ? ` (Assist: ${ev.assistencia.nome})` : ''}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* MODAL REGISTRAR AUTOR DO GOL E ASSISTÊNCIA */}
      <Modal visible={!!modalGol} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>⚽ Registrar Gol</Text>
            <Text style={styles.modalSub}>
              {modalGol?.timeAlvo === 'casa' ? timeCasa.nome : timeVisitante.nome} (+0.5 pt por gol e assistência)
            </Text>

            {/* SELEÇÃO DO AUTOR DO GOL */}
            <Text style={styles.labelInput}>Quem fez o gol?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {(modalGol?.timeAlvo === 'casa' ? timeCasa.jogadores : timeVisitante.jogadores).map((j) => (
                <TouchableOpacity
                  key={j.id}
                  style={[styles.chipModalJogador, autorGol?.id === j.id && styles.chipModalJogadorAtivo]}
                  onPress={() => setAutorGol(autorGol?.id === j.id ? null : j)}
                >
                  <Text style={[styles.chipModalJogadorTxt, autorGol?.id === j.id && styles.chipModalJogadorTxtAtivo]}>
                    {j.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* SELEÇÃO DA ASSISTÊNCIA */}
            <Text style={styles.labelInput}>Quem deu a assistência? (Opcional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {(modalGol?.timeAlvo === 'casa' ? timeCasa.jogadores : timeVisitante.jogadores)
                .filter((j) => !autorGol || j.id !== autorGol.id)
                .map((j) => (
                  <TouchableOpacity
                    key={j.id}
                    style={[styles.chipModalJogador, assistenciaGol?.id === j.id && styles.chipModalJogadorAtivo]}
                    onPress={() => setAssistenciaGol(assistenciaGol?.id === j.id ? null : j)}
                  >
                    <Text style={[styles.chipModalJogadorTxt, assistenciaGol?.id === j.id && styles.chipModalJogadorTxtAtivo]}>
                      {j.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.modalBotoesLinha}>
              <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalGol(null)}>
                <Text style={styles.modalBtnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={confirmarRegistroGol}>
                <Text style={styles.modalBtnSalvarTexto}>Confirmar Gol</Text>
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
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  cardJogoAtual: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  cronometroContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  cronometroLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cronometroDisplay: {
    fontSize: 42,
    fontWeight: '900',
    color: '#38bdf8',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    marginBottom: 8,
  },
  cronometroBotoes: {
    flexDirection: 'row',
    gap: 10,
  },
  btnCrono: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnCronoIniciar: {
    backgroundColor: '#16a34a',
  },
  btnCronoPausar: {
    backgroundColor: '#eab308',
  },
  btnCronoTxt: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  btnCronoReset: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnCronoResetTxt: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  confrontoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timeCorBar: {
    width: 28,
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
  },
  timeNomePlacar: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  timeStatusQuadra: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
    marginTop: 2,
  },
  badgeVantagem: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  badgeVantagemTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563eb',
  },
  placarNumero: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0f172a',
    marginVertical: 4,
  },
  btnGol: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  btnGolTxt: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
  },
  divisorVs: {
    paddingHorizontal: 10,
  },
  vsTexto: {
    fontSize: 18,
    fontWeight: '900',
    color: '#94a3b8',
  },
  eventosPartidaBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  eventosTitulo: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  eventoLinha: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  btnFinalizarPartida: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnFinalizarPartidaTxt: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  timeEsperaAviso: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    alignItems: 'center',
  },
  timeEsperaTxt: {
    fontSize: 11,
    color: '#64748b',
  },
  cardPontosRodada: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  pontosRodadaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardSecaoTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardSecaoSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  btnSalvarGeral: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  btnSalvarGeralTxt: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  tabelaRodada: {
    gap: 8,
  },
  itemRankingRodada: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  posRankingRodada: {
    width: 28,
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
  },
  nomeRankingRodada: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  statsRankingRodada: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  badgePontosRodada: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePontosRodadaTxt: {
    fontSize: 13,
    fontWeight: '900',
    color: '#059669',
  },
  cardHistoricoPartidas: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
  },
  itemPartidaHistorico: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  partidaHeaderLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  partidaNumero: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
  },
  partidaResultado: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  partidaPlacarTxt: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginVertical: 2,
  },
  partidaFicouTxt: {
    fontSize: 12,
    color: '#475569',
  },
  partidaGolsLista: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  partidaGolTxt: {
    fontSize: 11,
    color: '#64748b',
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
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 16,
  },
  labelInput: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 6,
  },
  chipsScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chipModalJogador: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  chipModalJogadorAtivo: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  chipModalJogadorTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  chipModalJogadorTxtAtivo: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalBotoesLinha: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalBtnCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  modalBtnCancelarTexto: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 13,
  },
  modalBtnSalvar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  modalBtnSalvarTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

