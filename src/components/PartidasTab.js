import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { sortearTimesEquilibrados } from '../utils/teamBalancer';

export default function PartidasTab({
  timesAtuais,
  setTimesAtuais,
  players,
  onUpdatePlayers,
  jogadoresPreSelecionados,
  onAdicionarPontosRodada,
  ehAdmin = false,
}) {
  // Goleiros disponíveis no elenco
  const goleirosDisponiveis = useMemo(() => {
    return players.filter((p) => p.posicao === 'Goleiro');
  }, [players]);

  // Mensalistas ativos de linha padrão para formação dos times
  const jogadoresLinhaPadrao = useMemo(() => {
    if (jogadoresPreSelecionados && jogadoresPreSelecionados.length >= 9) {
      return jogadoresPreSelecionados.filter((p) => p.posicao !== 'Goleiro');
    }
    return players
      .filter((p) => (p.status === 'Mensalista' || p.status === 'Mensalista Temporário') && p.posicao !== 'Goleiro')
      .slice(0, 15);
  }, [jogadoresPreSelecionados, players]);

  // 3 Times da Rodada (Divididos equilibradamente com 5 jogadores de linha cada)
  const [timesRodada, setTimesRodada] = useState(() => {
    if (timesAtuais && timesAtuais.length === 3) return timesAtuais;
    return sortearTimesEquilibrados(jogadoresLinhaPadrao, 3, 5);
  });

  // Atualiza se mudarem externamente
  useEffect(() => {
    if (timesAtuais && timesAtuais.length === 3) {
      setTimesRodada(timesAtuais);
    }
  }, [timesAtuais]);

  // Times na Fila da Quadra
  const [timeCasa, setTimeCasa] = useState(timesRodada[0]);
  const [timeVisitante, setTimeVisitante] = useState(timesRodada[1]);
  const [timeEspera, setTimeEspera] = useState(timesRodada[2]);

  // Sincroniza fila se os times da rodada forem regerados
  useEffect(() => {
    if (timesRodada && timesRodada.length === 3) {
      setTimeCasa(timesRodada[0]);
      setTimeVisitante(timesRodada[1]);
      setTimeEspera(timesRodada[2]);
    }
  }, [timesRodada]);

  // Goleiro selecionado para cada time no confronto atual
  const [goleiroTimeCasa, setGoleiroTimeCasa] = useState(goleirosDisponiveis[0] || null);
  const [goleiroTimeVisitante, setGoleiroTimeVisitante] = useState(goleirosDisponiveis[1] || null);

  // Garante que se um goleiro for adicionado ou removido, selecione automaticamente
  useEffect(() => {
    if (!goleiroTimeCasa && goleirosDisponiveis.length > 0) {
      setGoleiroTimeCasa(goleirosDisponiveis[0]);
    }
    if (!goleiroTimeVisitante && goleirosDisponiveis.length > 1) {
      setGoleiroTimeVisitante(goleirosDisponiveis[1]);
    }
  }, [goleirosDisponiveis]);

  // Modais
  const [modalVerTimes, setModalVerTimes] = useState(false);
  const [modalGerenciarGoleiros, setModalGerenciarGoleiros] = useState(false);
  const [modalDecisaoEmpatePrimeiroJogo, setModalDecisaoEmpatePrimeiroJogo] = useState(false);

  // Cronômetro da Partida (7 minutos = 420s)
  const TEMPO_PADRAO_SEGUNDOS = 7 * 60;
  const [tempoRestante, setTempoRestante] = useState(TEMPO_PADRAO_SEGUNDOS);
  const [cronometroAtivo, setCronometroAtivo] = useState(false);
  const timerRef = useRef(null);

  // Placar e eventos
  const [golsCasa, setGolsCasa] = useState(0);
  const [golsVisitante, setGolsVisitante] = useState(0);
  const [eventosJogoAtual, setEventosJogoAtual] = useState([]);
  const [partidasRealizadas, setPartidasRealizadas] = useState([]);

  // Modal Gol
  const [modalGol, setModalGol] = useState(null); // { timeAlvo: 'casa' | 'visitante' }
  const [autorGol, setAutorGol] = useState(null); // jogador ou { id: 'gol_contra', nome: '⚽ Gol Contra' }
  const [assistenciaGol, setAssistenciaGol] = useState(null);

  // Pontos da rodada acumulados por jogador
  const [pontosRodada, setPontosRodada] = useState({});

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

  // Efeito do Cronômetro
  useEffect(() => {
    if (cronometroAtivo) {
      timerRef.current = setInterval(() => {
        setTempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCronometroAtivo(false);
            tratarFimDeTempo();
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
  }, [cronometroAtivo, golsCasa, golsVisitante]);

  const iniciarOuPausarTimer = () => {
    setCronometroAtivo(!cronometroAtivo);
  };

  const resetarTimer = () => {
    setCronometroAtivo(false);
    setTempoRestante(TEMPO_PADRAO_SEGUNDOS);
  };

  // Alternar jogador entre Linha e Goleiro pelo tempo desejado
  const alternarPosicaoJogador = (jogadorId) => {
    const novaLista = players.map((p) => {
      if (p.id === jogadorId) {
        const novaPos = p.posicao === 'Goleiro' ? 'Linha' : 'Goleiro';
        const novoAvatar = novaPos === 'Goleiro' ? '🧤' : (p.status.includes('Mensalista') ? '⭐' : '🏃');
        return {
          ...p,
          posicao: novaPos,
          avatar: novoAvatar,
        };
      }
      return p;
    });

    if (onUpdatePlayers) {
      onUpdatePlayers(novaLista);
    }

    const jAtual = players.find((x) => x.id === jogadorId);
    const virouGoleiro = jAtual && jAtual.posicao !== 'Goleiro';

    alertSimples(
      'Posição Alterada! 🔄',
      virouGoleiro
        ? `${jAtual.nome} agora é GOLEIRO! Ele pontuará com a regra de goleiros (2 pts vitória, 0.5 empate, 1.0 gol/assistência).`
        : `${jAtual.nome} voltou a ser JOGADOR DE LINHA (cálculo normal de 3 pts vitória, 1.0 empate, 0.5 gol/assistência).`
    );
  };

  // Regerar times equilibrados manualmente
  const regerarTimes = () => {
    const novosTimes = sortearTimesEquilibrados(jogadoresLinhaPadrao, 3, 5, timesRodada);
    setTimesRodada(novosTimes);
    if (setTimesAtuais) setTimesAtuais(novosTimes);
    alertSimples('Times Regerados! ⚡', 'Os 3 times foram redistribuídos buscando formação diferente da semana passada.');
  };

  // Copiar escalação para o WhatsApp
  const copiarTextoWhatsApp = () => {
    let txt = `⚽ *PELADA DE SEGUNDA - TIMES DA RODADA*\n`;
    txt += `🏟️ *Toque de Bola - Monte Castelo, Juiz de Fora*\n`;
    txt += `⏰ *Segunda-feira • 19:00*\n\n`;

    timesRodada.forEach((t) => {
      txt += `*${t.nome.toUpperCase()}* (Poder: ${t.poderTotal})\n`;
      t.jogadores.forEach((j, idx) => {
        txt += ` ${idx + 1}. ${j.nome}\n`;
      });
      txt += `\n`;
    });

    txt += `🧤 *Goleiros:* ${goleirosDisponiveis.map((g) => g.nome).join(' e ')}\n`;
    txt += `⏱️ *Partidas de 7min ou 2 gols*\n`;

    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(txt);
      alertSimples('Copiado! 📋', 'Escalação copiada para o WhatsApp!');
    } else {
      alertSimples('Escalação dos Times', txt);
    }
  };

  // Abrir modal de gol
  const registrarGolTime = (lado) => {
    setAutorGol(null);
    setAssistenciaGol(null);
    setModalGol({ timeAlvo: lado });
  };

  // Confirmar Gol e Checar Regra de 2 Gols
  const confirmarRegistroGol = () => {
    if (!modalGol) return;
    const time = modalGol.timeAlvo === 'casa' ? timeCasa : timeVisitante;
    const novosGolsCasa = modalGol.timeAlvo === 'casa' ? golsCasa + 1 : golsCasa;
    const novosGolsVisitante = modalGol.timeAlvo === 'visitante' ? golsVisitante + 1 : golsVisitante;

    setGolsCasa(novosGolsCasa);
    setGolsVisitante(novosGolsVisitante);

    const novoEvento = {
      id: `ev_${Date.now()}`,
      timeNome: time.nome,
      autor: autorGol,
      assistencia: assistenciaGol,
      minuto: formatarTempo(TEMPO_PADRAO_SEGUNDOS - tempoRestante),
    };

    const novosEventos = [...eventosJogoAtual, novoEvento];
    setEventosJogoAtual(novosEventos);
    setModalGol(null);

    // REGRA OFICIAL: "a partida dura 7min ou ate um time fazer 2 gols"
    if (novosGolsCasa >= 2 || novosGolsVisitante >= 2) {
      setCronometroAtivo(false);
      setTimeout(() => {
        const timeVencedor = novosGolsCasa >= 2 ? timeCasa : timeVisitante;
        alertSimples(
          'Fim de Jogo! 🏁 Regra dos 2 Gols',
          `${timeVencedor.nome} fez 2 gols e venceu a partida!`
        );
        concluirPartida(timeVencedor, false, novosGolsCasa, novosGolsVisitante, novosEventos);
      }, 300);
    }
  };

  // Fim do tempo regulamentar de 7 minutos
  const tratarFimDeTempo = () => {
    if (golsCasa > golsVisitante) {
      concluirPartida(timeCasa, false, golsCasa, golsVisitante, eventosJogoAtual);
    } else if (golsVisitante > golsCasa) {
      concluirPartida(timeVisitante, false, golsCasa, golsVisitante, eventosJogoAtual);
    } else {
      // Empate!
      // Se for a primeira partida do dia, decide quem continua
      if (partidasRealizadas.length === 0) {
        setModalDecisaoEmpatePrimeiroJogo(true);
      } else {
        // Time desafiante (entrou a menos tempo) tem vantagem de empate e ganha o ponto
        concluirPartida(timeVisitante, true, golsCasa, golsVisitante, eventosJogoAtual);
      }
    }
  };

  // Conclui partida e aplica fórmula exata (diferenciada para goleiros e linha)
  const concluirPartida = (
    timeQueFica,
    foiEmpateComVantagem,
    placarCasa,
    placarVisitante,
    eventos
  ) => {
    const ehVencedorDireto = !foiEmpateComVantagem;
    const timeQueSai = timeQueFica.id === timeCasa.id ? timeVisitante : timeCasa;

    const goleiroQueFica = timeQueFica.id === timeCasa.id ? goleiroTimeCasa : goleiroTimeVisitante;

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

    // Helper para saber se jogador é goleiro atualmente
    const ehGoleiro = (jId) => {
      const p = players.find((x) => x.id === jId);
      return p ? p.posicao === 'Goleiro' : false;
    };

    // Computa presença/jogo para todos de linha
    timeCasa.jogadores.forEach((j) => {
      getOuCriaStats(j.id).jogos += 1;
    });
    timeVisitante.jogadores.forEach((j) => {
      getOuCriaStats(j.id).jogos += 1;
    });

    // Computa presença/jogo para os goleiros de ambos os times
    if (goleiroTimeCasa) {
      getOuCriaStats(goleiroTimeCasa.id).jogos += 1;
    }
    if (goleiroTimeVisitante) {
      getOuCriaStats(goleiroTimeVisitante.id).jogos += 1;
    }

    // 1. VITÓRIA:
    // Jogador de Linha = 3 pontos | Goleiro = 2 pontos
    if (ehVencedorDireto) {
      timeQueFica.jogadores.forEach((j) => {
        const st = getOuCriaStats(j.id);
        const ptsVit = ehGoleiro(j.id) ? 2.0 : 3.0;
        st.pontos += ptsVit;
        st.vitorias += 1;
      });

      if (goleiroQueFica) {
        const stG = getOuCriaStats(goleiroQueFica.id);
        stG.pontos += 2.0; // Goleiro ganha 2 pontos por vitória!
        stG.vitorias += 1;
      }
    }

    // 2. EMPATE COM VANTAGEM:
    // Somente o time que entrou a menos tempo ganha ponto:
    // Jogador de Linha = 1 ponto | Goleiro = 0.5 ponto
    if (foiEmpateComVantagem) {
      timeQueFica.jogadores.forEach((j) => {
        const st = getOuCriaStats(j.id);
        const ptsEmp = ehGoleiro(j.id) ? 0.5 : 1.0;
        st.pontos += ptsEmp;
        st.empates += 1;
      });

      if (goleiroQueFica) {
        const stG = getOuCriaStats(goleiroQueFica.id);
        stG.pontos += 0.5; // Goleiro ganha 0.5 ponto por empate!
        stG.empates += 1;
      }
    }

    // 3. GOLS E ASSISTÊNCIAS:
    // Jogador de Linha = 0.5 ponto | Goleiro = 1.0 ponto
    eventos.forEach((ev) => {
      if (ev.autor && ev.autor.id !== 'gol_contra') {
        const st = getOuCriaStats(ev.autor.id);
        const ptsGol = ehGoleiro(ev.autor.id) ? 1.0 : 0.5; // 1 pt para goleiro, 0.5 para linha!
        st.pontos += ptsGol;
        st.gols += 1;
      }
      if (ev.assistencia) {
        const st = getOuCriaStats(ev.assistencia.id);
        const ptsAss = ehGoleiro(ev.assistencia.id) ? 1.0 : 0.5; // 1 pt para goleiro, 0.5 para linha!
        st.pontos += ptsAss;
        st.assistencias += 1;
      }
    });

    setPontosRodada(novosPontosRodada);

    // Registra partida no histórico da sessão
    const registroPartida = {
      numero: partidasRealizadas.length + 1,
      timeCasaNome: timeCasa.nome,
      timeVisitanteNome: timeVisitante.nome,
      golsCasa: placarCasa,
      golsVisitante: placarVisitante,
      eventos,
      vencedorNome: foiEmpateComVantagem
        ? `${timeQueFica.nome} (Vantagem do Empate)`
        : timeQueFica.nome,
    };
    setPartidasRealizadas([registroPartida, ...partidasRealizadas]);

    // Rotação: Quem fica vira Time Casa. O 3º time entra como desafiante!
    setTimeCasa(timeQueFica);
    setTimeVisitante(timeEspera);
    setTimeEspera(timeQueSai);

    // Reseta mesa
    setGolsCasa(0);
    setGolsVisitante(0);
    setEventosJogoAtual([]);
    setTempoRestante(TEMPO_PADRAO_SEGUNDOS);
    setCronometroAtivo(false);

    alertSimples(
      'Fila da Quadra Atualizada 🔄',
      foiEmpateComVantagem
        ? `Empate em ${placarCasa}x${placarVisitante}! ${timeQueFica.nome} permanece na quadra pela vantagem do empate (Linha: +1 pt | Goleiro: +0.5 pt).\n\nPróximo jogo: ${timeQueFica.nome} vs ${timeEspera.nome} (Desafiante).`
        : `Vitória do ${timeQueFica.nome} por ${Math.max(placarCasa, placarVisitante)}x${Math.min(placarCasa, placarVisitante)} (Linha: +3 pts | Goleiro: +2 pts)!\n\nPróximo jogo: ${timeQueFica.nome} vs ${timeEspera.nome} (Desafiante).`
    );
  };

  const salvarRodadaNoRanking = () => {
    const totalJogadores = Object.keys(pontosRodada).length;
    if (totalJogadores === 0) {
      alertSimples('Sem Partidas', 'Realize pelo menos uma partida antes de salvar a rodada.');
      return;
    }

    const dataHoje = new Date().toLocaleDateString('pt-BR');
    if (onAdicionarPontosRodada) {
      onAdicionarPontosRodada(pontosRodada, dataHoje);
    }

    alertSimples(
      'Rodada Salva no Ranking! 🏆',
      `Os pontos de ${totalJogadores} atletas foram computados no Ranking com a data de hoje (${dataHoje}).`
    );
  };

  // Listas para o modal de Gol
  const jogadoresModalLado = modalGol?.timeAlvo === 'casa' ? timeCasa.jogadores : timeVisitante.jogadores;
  const goleiroModalLado = modalGol?.timeAlvo === 'casa' ? goleiroTimeCasa : goleiroTimeVisitante;
  const opcoesAssistencia = goleiroModalLado
    ? [...jogadoresModalLado, goleiroModalLado]
    : jogadoresModalLado;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* CABEÇALHO COM BOTÕES DE GESTÃO */}
      <View style={styles.topInfoBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.topInfoTitulo}>⚽ Jogos da Rodada</Text>
          <Text style={styles.topInfoSub}>
            7 min ou 2 gols • Linha (3V, 1E, 0.5G) • Goleiro (2V, 0.5E, 1G)
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          {/* BOTÃO GERENCIAR GOLEIROS */}
          {ehAdmin && (
            <TouchableOpacity
              style={styles.btnGerenciarGoleiros}
              onPress={() => setModalGerenciarGoleiros(true)}
            >
              <Text style={styles.btnGerenciarGoleirosTxt}>🧤 Goleiros</Text>
            </TouchableOpacity>
          )}

          {/* BOTÃO VER TIMES */}
          <TouchableOpacity style={styles.btnVerTimes} onPress={() => setModalVerTimes(true)}>
            <Text style={styles.btnVerTimesTxt}>👥 3 Times</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PAINEL DO CRONÔMETRO (7 MINUTOS) */}
      <View style={styles.cronometroCard}>
        <Text style={styles.cronometroLabel}>CRONÔMETRO DA PARTIDA</Text>
        <Text
          style={[
            styles.cronometroDisplay,
            tempoRestante === 0 ? styles.cronometroZerado : tempoRestante < 60 ? styles.cronometroFinal : null,
          ]}
        >
          {formatarTempo(tempoRestante)}
        </Text>

        {ehAdmin && (
          <View style={styles.cronometroBotoesRow}>
            <TouchableOpacity
              style={[styles.btnCronometro, cronometroAtivo ? styles.btnPausar : styles.btnIniciar]}
              onPress={iniciarOuPausarTimer}
            >
              <Text style={styles.btnCronometroTxt}>
                {cronometroAtivo ? '⏸️ Pausar' : '▶️ Iniciar (7 min)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnCronometro, styles.btnResetar]} onPress={resetarTimer}>
              <Text style={styles.btnCronometroTxt}>🔄 7:00</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CONFRONTO ATUAL NA QUADRA */}
      <View style={styles.confrontoCard}>
        <View style={styles.confrontoHeader}>
          <Text style={styles.confrontoTitulo}>
            Partida #{partidasRealizadas.length + 1} em Quadra
          </Text>
          <Text style={styles.confrontoSub}>
            {partidasRealizadas.length === 0
              ? '1ª Partida do Dia • Em caso de empate, decidem quem continua'
              : `O desafiante (${timeVisitante.nome}) possui vantagem de empate!`}
          </Text>
        </View>

        <View style={styles.placarRow}>
          {/* LADO TIME CASA (DEFENSOR DA QUADRA) */}
          <View style={styles.ladoTime}>
            <View style={[styles.corFaixa, { backgroundColor: timeCasa.cor }]} />
            <Text style={styles.nomeTimePlacar}>{timeCasa.nome}</Text>
            <Text style={styles.subTimePlacar}>Na quadra</Text>

            {/* SELETOR DE GOLEIRO TIME CASA */}
            <View style={styles.seletorGoleiroBox}>
              <Text style={styles.seletorGoleiroLabel}>Goleiro:</Text>
              <View style={styles.goleiroBtnsLinha}>
                {goleirosDisponiveis.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    disabled={!ehAdmin}
                    style={[
                      styles.btnGoleiroMini,
                      goleiroTimeCasa?.id === g.id && styles.btnGoleiroMiniAtivo,
                    ]}
                    onPress={() => setGoleiroTimeCasa(g)}
                  >
                    <Text
                      style={[
                        styles.btnGoleiroMiniTxt,
                        goleiroTimeCasa?.id === g.id && styles.btnGoleiroMiniTxtAtivo,
                      ]}
                      numberOfLines={1}
                    >
                      🧤 {g.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.golsPlacar}>{golsCasa}</Text>

            {ehAdmin && (
              <TouchableOpacity style={styles.btnGol} onPress={() => registrarGolTime('casa')}>
                <Text style={styles.btnGolTxt}>+ GOL</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.versusTxt}>X</Text>

          {/* LADO TIME VISITANTE (DESAFIANTE) */}
          <View style={styles.ladoTime}>
            <View style={[styles.corFaixa, { backgroundColor: timeVisitante.cor }]} />
            <Text style={styles.nomeTimePlacar}>{timeVisitante.nome}</Text>
            {partidasRealizadas.length > 0 && (
              <View style={styles.badgeVantagem}>
                <Text style={styles.badgeVantagemTxt}>⚖️ Vantagem Empate</Text>
              </View>
            )}

            {/* SELETOR DE GOLEIRO TIME VISITANTE */}
            <View style={styles.seletorGoleiroBox}>
              <Text style={styles.seletorGoleiroLabel}>Goleiro:</Text>
              <View style={styles.goleiroBtnsLinha}>
                {goleirosDisponiveis.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    disabled={!ehAdmin}
                    style={[
                      styles.btnGoleiroMini,
                      goleiroTimeVisitante?.id === g.id && styles.btnGoleiroMiniAtivo,
                    ]}
                    onPress={() => setGoleiroTimeVisitante(g)}
                  >
                    <Text
                      style={[
                        styles.btnGoleiroMiniTxt,
                        goleiroTimeVisitante?.id === g.id && styles.btnGoleiroMiniTxtAtivo,
                      ]}
                      numberOfLines={1}
                    >
                      🧤 {g.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.golsPlacar}>{golsVisitante}</Text>

            {ehAdmin && (
              <TouchableOpacity style={styles.btnGol} onPress={() => registrarGolTime('visitante')}>
                <Text style={styles.btnGolTxt}>+ GOL</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* EVENTOS / GOLS DA PARTIDA */}
        {eventosJogoAtual.length > 0 && (
          <View style={styles.eventosLista}>
            <Text style={styles.eventosTitulo}>Gols Registrados:</Text>
            {eventosJogoAtual.map((ev) => (
              <Text key={ev.id} style={styles.eventoItemTxt}>
                ⚽ {ev.minuto} -{' '}
                <Text style={{ fontWeight: 'bold' }}>
                  {ev.autor ? (ev.autor.id === 'gol_contra' ? '⚠️ GOL CONTRA' : ev.autor.nome) : 'Gol'}
                </Text>{' '}
                ({ev.timeNome})
                {ev.assistencia ? ` • Assistência: ${ev.assistencia.nome}` : ''}
              </Text>
            ))}
          </View>
        )}

        {/* BOTÃO FINALIZAR PARTIDA MANUALMENTE */}
        {ehAdmin && (
          <TouchableOpacity style={styles.btnFinalizarPartida} onPress={tratarFimDeTempo}>
            <Text style={styles.btnFinalizarPartidaTxt}>🏁 Finalizar Jogo (ou Fim de Tempo)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TIME NA ESPERA */}
      <View style={styles.timeEsperaCard}>
        <Text style={styles.timeEsperaLabel}>⏳ PRÓXIMO TIME A ENTRAR (AGUARDANDO):</Text>
        <View style={styles.timeEsperaInfo}>
          <View style={[styles.corEsperaBolinha, { backgroundColor: timeEspera.cor }]} />
          <Text style={styles.timeEsperaNome}>{timeEspera.nome}</Text>
          <Text style={styles.timeEsperaTxt}>
            • Entrará com vantagem do empate contra quem ficar em quadra!
          </Text>
        </View>
      </View>

      {/* PONTUAÇÃO ACUMULADA DA RODADA */}
      <View style={styles.pontuacaoRodadaCard}>
        <View style={styles.pontuacaoHeader}>
          <View>
            <Text style={styles.pontuacaoTitulo}>📊 Pontos da Rodada de Hoje</Text>
            <Text style={styles.pontuacaoSub}>
              Linha: 3V, 1E, 0.5G/A • Goleiro: 2V, 0.5E, 1G/A
            </Text>
          </View>

          {ehAdmin && (
            <TouchableOpacity style={styles.btnSalvarRanking} onPress={salvarRodadaNoRanking}>
              <Text style={styles.btnSalvarRankingTxt}>💾 Salvar no Ranking</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabelaPontos}>
          {Object.entries(pontosRodada).length === 0 ? (
            <Text style={styles.tabelaPontosVazia}>
              Nenhum ponto registrado ainda. Inicie a primeira partida!
            </Text>
          ) : (
            Object.entries(pontosRodada)
              .sort((a, b) => b[1].pontos - a[1].pontos)
              .map(([pId, stats], idx) => {
                const pObj = players.find((x) => x.id === pId);
                const ehG = pObj?.posicao === 'Goleiro';
                return (
                  <View key={pId} style={styles.linhaPontos}>
                    <Text style={styles.linhaPontosPos}>{idx + 1}º</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.linhaPontosNome}>{stats.nome}</Text>
                      <Text style={styles.linhaPontosPosTag}>{ehG ? '🧤 Goleiro' : 'Linha'}</Text>
                    </View>
                    <View style={styles.linhaPontosDetalhes}>
                      <Text style={styles.linhaPontosStat}>{stats.vitorias}V</Text>
                      <Text style={styles.linhaPontosStat}>{stats.empates}E</Text>
                      <Text style={styles.linhaPontosStat}>{stats.gols}G</Text>
                      <Text style={styles.linhaPontosStat}>{stats.assistencias}A</Text>
                    </View>
                    <View style={styles.badgePontosTotais}>
                      <Text style={styles.badgePontosTotaisTxt}>{stats.pontos.toFixed(1)} pts</Text>
                    </View>
                  </View>
                );
              })
          )}
        </View>
      </View>

      {/* ======================================================== */}
      {/* MODAL 1: REGISTRO DE GOL (COM GOL CONTRA E GOLEIRO NA ASSISTÊNCIA) */}
      {/* ======================================================== */}
      <Modal visible={!!modalGol} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>⚽ Registrar Gol</Text>
            <Text style={styles.modalSub}>
              Para: {modalGol?.timeAlvo === 'casa' ? timeCasa.nome : timeVisitante.nome}
            </Text>

            {/* AUTOR DO GOL */}
            <Text style={styles.labelModal}>Quem fez o gol?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <TouchableOpacity
                style={[
                  styles.chipModalJogador,
                  styles.chipGolContra,
                  autorGol?.id === 'gol_contra' && styles.chipGolContraAtivo,
                ]}
                onPress={() => setAutorGol({ id: 'gol_contra', nome: '⚽ Gol Contra' })}
              >
                <Text style={styles.chipGolContraTxt}>⚠️ Gol Contra</Text>
              </TouchableOpacity>

              {jogadoresModalLado.map((j) => (
                <TouchableOpacity
                  key={j.id}
                  style={[styles.chipModalJogador, autorGol?.id === j.id && styles.chipModalJogadorAtivo]}
                  onPress={() => setAutorGol(j)}
                >
                  <Text style={styles.chipModalTxt}>{j.nome}</Text>
                </TouchableOpacity>
              ))}

              {/* Goleiro também pode fazer gol */}
              {goleiroModalLado && (
                <TouchableOpacity
                  style={[
                    styles.chipModalJogador,
                    styles.chipGoleiroAssistencia,
                    autorGol?.id === goleiroModalLado.id && styles.chipModalJogadorAtivo,
                  ]}
                  onPress={() => setAutorGol(goleiroModalLado)}
                >
                  <Text style={styles.chipModalTxt}>🧤 {goleiroModalLado.nome} (Goleiro)</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* ASSISTÊNCIA (INCLUI O GOLEIRO DAQUELE TIME) */}
            <Text style={styles.labelModal}>
              Quem deu a assistência? (Opcional - inclui o Goleiro):
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
              {opcoesAssistencia.map((j) => {
                const isGoleiro = j.posicao === 'Goleiro';
                const isSelected = assistenciaGol?.id === j.id;
                return (
                  <TouchableOpacity
                    key={j.id}
                    style={[
                      styles.chipModalJogador,
                      isGoleiro && styles.chipGoleiroAssistencia,
                      isSelected && styles.chipModalJogadorAtivo,
                    ]}
                    onPress={() => setAssistenciaGol(isSelected ? null : j)}
                  >
                    <Text style={styles.chipModalTxt}>
                      {isGoleiro ? `🧤 ${j.nome} (Goleiro)` : j.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalBotoesLinha}>
              <TouchableOpacity style={styles.btnModalCancelar} onPress={() => setModalGol(null)}>
                <Text style={styles.btnModalCancelarTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnModalConfirmar} onPress={confirmarRegistroGol}>
                <Text style={styles.btnModalConfirmarTxt}>Confirmar Gol</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: GERENCIAR QUEM É GOLEIRO (OPÇÃO DE MUDAR JOGADOR) */}
      {/* ======================================================== */}
      <Modal visible={modalGerenciarGoleiros} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <Text style={styles.modalTitulo}>🧤 Gerenciar Goleiros da Pelada</Text>
            <Text style={styles.modalSub}>
              Alterne qualquer jogador para Goleiro pelo tempo que quiser. Ele pontua com a regra dos goleiros (2V, 0.5E, 1G/A) e volta ao normal quando for para a linha.
            </Text>

            <ScrollView style={{ marginVertical: 12 }}>
              {players.map((p) => {
                const ehG = p.posicao === 'Goleiro';
                return (
                  <View key={p.id} style={styles.linhaGerenciarGoleiroItem}>
                    <Text style={{ fontSize: 20 }}>{p.avatar}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.linhaGerenciarNome}>{p.nome}</Text>
                      <Text style={[styles.linhaGerenciarStatus, ehG && { color: '#34d399', fontWeight: 'bold' }]}>
                        {ehG ? '🧤 GOLEIRO ATUAL' : '⚽ Jogador de Linha'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.btnAlternarPosicao, ehG ? styles.btnVoltarLinha : styles.btnVirarGoleiro]}
                      onPress={() => alternarPosicaoJogador(p.id)}
                    >
                      <Text style={[styles.btnAlternarPosicaoTxt, ehG ? styles.btnVoltarLinhaTxt : styles.btnVirarGoleiroTxt]}>
                        {ehG ? '🏃 Voltar para Linha' : '🧤 Mudar p/ Goleiro'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.btnFecharModal}
              onPress={() => setModalGerenciarGoleiros(false)}
            >
              <Text style={styles.btnFecharModalTxt}>Concluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: VISUALIZAR OS 3 TIMES DA RODADA */}
      {/* ======================================================== */}
      <Modal visible={modalVerTimes} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContentTimes}>
              <View style={styles.modalTimesHeader}>
                <View>
                  <Text style={styles.modalTitulo}>🏆 3 Times da Rodada</Text>
                  <Text style={styles.modalSub}>
                    Divididos equilibradamente (5 jogadores de linha cada)
                  </Text>
                </View>

                <TouchableOpacity onPress={copiarTextoWhatsApp} style={styles.btnWhatsModal}>
                  <Text style={styles.btnWhatsModalTxt}>💬 WhatsApp</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timesModalGrid}>
                {timesRodada.map((t) => (
                  <View key={t.id} style={styles.cardTimeModal}>
                    <View style={[styles.headerTimeModal, { backgroundColor: t.cor }]}>
                      <Text style={[styles.nomeTimeModal, { color: t.textColor || '#ffffff' }]}>
                        {t.nome.toUpperCase()}
                      </Text>
                      <Text style={styles.poderTimeModal}>Poder: {t.poderTotal}</Text>
                    </View>
                    <View style={styles.listaJogadoresTimeModal}>
                      {t.jogadores.map((j, jIdx) => (
                        <Text key={j.id} style={styles.itemJogadorTimeModal}>
                          {jIdx + 1}. {j.nome} (OVR {j.overall})
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.modalTimesBotoes}>
                <TouchableOpacity style={styles.btnRegerarTimesModal} onPress={regerarTimes}>
                  <Text style={styles.btnRegerarTimesModalTxt}>🔄 Regerar Diferente</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnFecharModal} onPress={() => setModalVerTimes(false)}>
                  <Text style={styles.btnFecharModalTxt}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 4: DECISÃO DE EMPATE NA 1ª PARTIDA DO DIA */}
      {/* ======================================================== */}
      <Modal visible={modalDecisaoEmpatePrimeiroJogo} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>⚖️ Empate na 1ª Partida!</Text>
            <Text style={styles.modalSub}>
              Como os dois times entraram juntos no início, decida entre eles quem continuará na quadra para enfrentar o 3º time:
            </Text>

            <View style={{ gap: 10, marginVertical: 14 }}>
              <TouchableOpacity
                style={[styles.btnDecisaoPrimeiroJogo, { backgroundColor: timeCasa.cor }]}
                onPress={() => {
                  setModalDecisaoEmpatePrimeiroJogo(false);
                  concluirPartida(timeCasa, true, golsCasa, golsVisitante, eventosJogoAtual);
                }}
              >
                <Text style={[styles.btnDecisaoPrimeiroJogoTxt, { color: timeCasa.textColor || '#ffffff' }]}>
                  👉 {timeCasa.nome} Continua na Quadra
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnDecisaoPrimeiroJogo, { backgroundColor: timeVisitante.cor }]}
                onPress={() => {
                  setModalDecisaoEmpatePrimeiroJogo(false);
                  concluirPartida(timeVisitante, true, golsCasa, golsVisitante, eventosJogoAtual);
                }}
              >
                <Text style={[styles.btnDecisaoPrimeiroJogoTxt, { color: timeVisitante.textColor || '#ffffff' }]}>
                  👉 {timeVisitante.nome} Continua na Quadra
                </Text>
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
  topInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#062817',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f4829',
    gap: 8,
  },
  topInfoTitulo: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },
  topInfoSub: {
    color: '#a7f3d0',
    fontSize: 10,
    marginTop: 2,
  },
  btnGerenciarGoleiros: {
    backgroundColor: '#7c3aed',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  btnGerenciarGoleirosTxt: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  btnVerTimes: {
    backgroundColor: '#10b981',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  btnVerTimesTxt: {
    color: '#022c22',
    fontSize: 11,
    fontWeight: '800',
  },

  // Cronômetro
  cronometroCard: {
    backgroundColor: '#062817',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  cronometroLabel: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cronometroDisplay: {
    color: '#f8fafc',
    fontSize: 50,
    fontWeight: '900',
    letterSpacing: 2,
  },
  cronometroZerado: {
    color: '#ef4444',
  },
  cronometroFinal: {
    color: '#f59e0b',
  },
  cronometroBotoesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btnCronometro: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  btnIniciar: {
    backgroundColor: '#10b981',
  },
  btnPausar: {
    backgroundColor: '#f59e0b',
  },
  btnResetar: {
    backgroundColor: '#1e293b',
  },
  btnCronometroTxt: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  // Confronto Atual
  confrontoCard: {
    backgroundColor: '#062817',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  confrontoHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  confrontoTitulo: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
  },
  confrontoSub: {
    color: '#6ee7b7',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  placarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  ladoTime: {
    alignItems: 'center',
    flex: 1,
  },
  corFaixa: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
  },
  nomeTimePlacar: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
  },
  subTimePlacar: {
    color: '#94a3b8',
    fontSize: 10,
    marginBottom: 4,
  },
  badgeVantagem: {
    backgroundColor: '#854d0e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeVantagemTxt: {
    color: '#fef08a',
    fontSize: 9,
    fontWeight: '800',
  },
  seletorGoleiroBox: {
    marginVertical: 4,
    alignItems: 'center',
  },
  seletorGoleiroLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
  },
  goleiroBtnsLinha: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  btnGoleiroMini: {
    backgroundColor: '#0a321d',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#114a2a',
    maxWidth: 90,
  },
  btnGoleiroMiniAtivo: {
    backgroundColor: '#065f46',
    borderColor: '#34d399',
  },
  btnGoleiroMiniTxt: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  btnGoleiroMiniTxtAtivo: {
    color: '#ffffff',
  },
  golsPlacar: {
    color: '#ffffff',
    fontSize: 44,
    fontWeight: '900',
    marginVertical: 4,
  },
  btnGol: {
    backgroundColor: '#10b981',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  btnGolTxt: {
    color: '#022c22',
    fontSize: 12,
    fontWeight: '800',
  },
  versusTxt: {
    color: '#64748b',
    fontSize: 22,
    fontWeight: '900',
    paddingHorizontal: 6,
  },
  eventosLista: {
    backgroundColor: '#08331f',
    borderRadius: 8,
    padding: 10,
    marginVertical: 12,
  },
  eventosTitulo: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventoItemTxt: {
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 18,
  },
  btnFinalizarPartida: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  btnFinalizarPartidaTxt: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  // Time na Espera
  timeEsperaCard: {
    backgroundColor: '#0b1d14',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#123924',
  },
  timeEsperaLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timeEsperaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  corEsperaBolinha: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timeEsperaNome: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
  },
  timeEsperaTxt: {
    color: '#94a3b8',
    fontSize: 11,
  },

  // Pontuação da Rodada
  pontuacaoRodadaCard: {
    backgroundColor: '#062817',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  pontuacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  pontuacaoTitulo: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
  },
  pontuacaoSub: {
    color: '#6ee7b7',
    fontSize: 11,
  },
  btnSalvarRanking: {
    backgroundColor: '#f59e0b',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnSalvarRankingTxt: {
    color: '#78350f',
    fontSize: 12,
    fontWeight: '800',
  },
  tabelaPontos: {
    gap: 6,
  },
  tabelaPontosVazia: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  linhaPontos: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#08331f',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 8,
  },
  linhaPontosPos: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '800',
    width: 22,
  },
  linhaPontosNome: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  linhaPontosPosTag: {
    color: '#64748b',
    fontSize: 10,
  },
  linhaPontosDetalhes: {
    flexDirection: 'row',
    gap: 6,
  },
  linhaPontosStat: {
    color: '#94a3b8',
    fontSize: 11,
  },
  badgePontosTotais: {
    backgroundColor: '#065f46',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePontosTotaisTxt: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '800',
  },

  // Modal Gol
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#062615',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  modalTitulo: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    color: '#34d399',
    fontSize: 13,
    marginBottom: 12,
  },
  labelModal: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  chipModalJogador: {
    backgroundColor: '#0a321d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#114a2a',
  },
  chipModalJogadorAtivo: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
  },
  chipModalTxt: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  chipGolContra: {
    backgroundColor: '#7f1d1d',
    borderColor: '#ef4444',
  },
  chipGolContraAtivo: {
    backgroundColor: '#ef4444',
  },
  chipGolContraTxt: {
    color: '#fecaca',
    fontSize: 12,
    fontWeight: '800',
  },
  chipGoleiroAssistencia: {
    borderColor: '#a855f7',
  },
  modalBotoesLinha: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  btnModalCancelar: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#1e293b',
  },
  btnModalCancelarTxt: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  btnModalConfirmar: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  btnModalConfirmarTxt: {
    color: '#022c22',
    fontSize: 12,
    fontWeight: '800',
  },

  // Modal Gerenciar Goleiros
  linhaGerenciarGoleiroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#041f11',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  linhaGerenciarNome: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
  },
  linhaGerenciarStatus: {
    color: '#94a3b8',
    fontSize: 11,
  },
  btnAlternarPosicao: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnVirarGoleiro: {
    backgroundColor: '#065f46',
  },
  btnVirarGoleiroTxt: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
  },
  btnVoltarLinha: {
    backgroundColor: '#334155',
  },
  btnVoltarLinhaTxt: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },

  // Modal Times
  modalScrollContent: {
    paddingVertical: 20,
    justifyContent: 'center',
  },
  modalContentTimes: {
    backgroundColor: '#062615',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  modalTimesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  btnWhatsModal: {
    backgroundColor: '#25d366',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnWhatsModalTxt: {
    color: '#064e3b',
    fontSize: 12,
    fontWeight: '800',
  },
  timesModalGrid: {
    gap: 10,
    marginBottom: 16,
  },
  cardTimeModal: {
    backgroundColor: '#041f11',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  headerTimeModal: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nomeTimeModal: {
    fontSize: 13,
    fontWeight: '800',
  },
  poderTimeModal: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  listaJogadoresTimeModal: {
    padding: 8,
    gap: 4,
  },
  itemJogadorTimeModal: {
    color: '#e2e8f0',
    fontSize: 12,
  },
  modalTimesBotoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btnRegerarTimesModal: {
    backgroundColor: '#0f4829',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  btnRegerarTimesModalTxt: {
    color: '#d1fae5',
    fontSize: 12,
    fontWeight: '700',
  },
  btnFecharModal: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnFecharModalTxt: {
    color: '#022c22',
    fontSize: 13,
    fontWeight: '900',
  },

  // Decisão Empate 1º Jogo
  btnDecisaoPrimeiroJogo: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnDecisaoPrimeiroJogoTxt: {
    fontSize: 14,
    fontWeight: '800',
  },
});
