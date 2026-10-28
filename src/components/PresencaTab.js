import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';

export default function PresencaTab({
  players,
  usuarioLogado,
  ehAdmin,
  onEnviarParaSorteio,
}) {
  // Goleiros fixos da pelada (Foró e Gabriel)
  const goleirosFixos = useMemo(() => {
    return players.filter((p) => p.posicao === 'Goleiro');
  }, [players]);

  // Mensalistas ativos (15 vagas principais)
  const mensalistasAtivos = useMemo(() => {
    return players.filter(
      (p) =>
        (p.status === 'Mensalista' || p.status === 'Mensalista Temporário') &&
        p.posicao !== 'Goleiro'
    );
  }, [players]);

  // Diaristas disponíveis para a fila de espera
  const diaristasDisponiveis = useMemo(() => {
    return players.filter(
      (p) => p.status === 'Diarista' && p.posicao !== 'Goleiro'
    );
  }, [players]);

  // Estado dos 15 confirmados de linha (inicializa com os 15 mensalistas ativos)
  const [confirmadosLinha, setConfirmadosLinha] = useState(() => {
    return mensalistasAtivos.slice(0, 15);
  });

  // Estado dos goleiros confirmados (inicializa com os 2 goleiros fixos)
  const [goleirosConfirmados, setGoleirosConfirmados] = useState(() => {
    return [...goleirosFixos];
  });

  // Lista de Espera de Diaristas (Array ordenado por ordem de confirmação)
  const [filaEsperaDiaristas, setFilaEsperaDiaristas] = useState([]);

  // Desfalques (mensalistas ou goleiros que informaram que não vão)
  const [desfalques, setDesfalques] = useState([]);

  // Checagem automática do horário de abertura (Quinta 12:00 até Segunda 18:00)
  const verificarSeAgendaAberta = () => {
    const agora = new Date();
    const diaSemana = agora.getDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
    const hora = agora.getHours();

    if (diaSemana === 4 && hora >= 12) return true;
    if (diaSemana === 5 || diaSemana === 6 || diaSemana === 0) return true;
    if (diaSemana === 1 && hora < 18) return true;
    return false;
  };

  const [agendaAberta, setAgendaAberta] = useState(verificarSeAgendaAberta);

  const alertSimples = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  // Status de presença do próprio usuário logado
  const euEstouConfirmadoLinha = confirmadosLinha.some((p) => p.id === usuarioLogado?.id);
  const euEstouGoleiro = goleirosConfirmados.some((g) => g.id === usuarioLogado?.id);
  const minhaPosicaoFila = filaEsperaDiaristas.findIndex((d) => d.id === usuarioLogado?.id);
  const euEstouNaFila = minhaPosicaoFila !== -1;
  const euEstouConfirmado = euEstouConfirmadoLinha || euEstouGoleiro;

  // 1. Retirar nome da lista de confirmados (Desfalque)
  const retirarNomeConfirmado = (jogador) => {
    // Verificação de permissão: apenas o próprio jogador ou o admin pode retirar
    if (!ehAdmin && jogador.id !== usuarioLogado?.id) {
      alertSimples('Ação não permitida', 'Você só pode alterar a sua própria presença.');
      return;
    }

    if (jogador.posicao === 'Goleiro') {
      setGoleirosConfirmados((prev) => prev.filter((g) => g.id !== jogador.id));
      setDesfalques((prev) => [
        ...prev,
        { ...jogador, horaDesfalque: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
      alertSimples('Desfalque Confirmado', `${jogador.nome} foi retirado da lista de goleiros.`);
      return;
    }

    // Retira da linha dos 15
    setConfirmadosLinha((prev) => prev.filter((p) => p.id !== jogador.id));
    setDesfalques((prev) => [
      ...prev,
      { ...jogador, horaDesfalque: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    // Promove automaticamente o 1º diarista da fila se houver
    if (filaEsperaDiaristas.length > 0) {
      const primeiroFila = filaEsperaDiaristas[0];
      setFilaEsperaDiaristas((prev) => prev.slice(1));
      setConfirmadosLinha((prev) => [...prev.filter((p) => p.id !== jogador.id), primeiroFila]);
      alertSimples(
        'Vaga Preenchida! 🔄',
        `${jogador.nome} informou desfalque. ${primeiroFila.nome} (1º da lista de espera) assumiu a vaga nos 15 confirmados!`
      );
    } else {
      alertSimples('Desfalque Registrado', `${jogador.nome} retirou o nome. Agora temos 1 vaga aberta.`);
    }
  };

  // Reassumir vaga (após desfalque)
  const reassumirVaga = (jogador) => {
    if (!ehAdmin && jogador.id !== usuarioLogado?.id) {
      alertSimples('Ação não permitida', 'Você só pode alterar a sua própria presença.');
      return;
    }

    setDesfalques((prev) => prev.filter((p) => p.id !== jogador.id));
    if (jogador.posicao === 'Goleiro') {
      setGoleirosConfirmados((prev) => [...prev, jogador]);
      return;
    }

    if (confirmadosLinha.length < 15) {
      setConfirmadosLinha((prev) => [...prev, jogador]);
      alertSimples('Confirmado!', `${jogador.nome} reassumiu sua vaga nos 15 confirmados.`);
    } else {
      setFilaEsperaDiaristas((prev) => [{ ...jogador, dataHoraConfirmacao: 'Prioridade Mensalista' }, ...prev]);
      alertSimples('Lista Cheia', `${jogador.nome} entrou como 1º na lista de espera.`);
    }
  };

  // 2. Entrar na Lista de Espera (ou na vaga se houver < 15)
  const entrarDiaristaFila = (diarista) => {
    if (!ehAdmin && diarista.id !== usuarioLogado?.id) {
      alertSimples('Ação não permitida', 'Você só pode colocar o seu próprio nome na lista.');
      return;
    }

    if (confirmadosLinha.some((p) => p.id === diarista.id)) {
      alertSimples('Já Confirmado', `${diarista.nome} já está na lista dos 15 confirmados.`);
      return;
    }
    if (filaEsperaDiaristas.some((p) => p.id === diarista.id)) {
      alertSimples('Já na Fila', `${diarista.nome} já está na lista de espera.`);
      return;
    }

    const agora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (confirmadosLinha.length < 15) {
      setConfirmadosLinha((prev) => [...prev, diarista]);
      alertSimples('Confirmado! ⚽', `${diarista.nome} preencheu uma das 15 vagas de linha!`);
    } else {
      setFilaEsperaDiaristas((prev) => [
        ...prev,
        { ...diarista, dataHoraConfirmacao: agora },
      ]);
      alertSimples(
        'Na Lista de Espera ⏳',
        `${diarista.nome} foi adicionado à lista de espera na posição #${filaEsperaDiaristas.length + 1}.`
      );
    }
  };

  // 3. Retirar nome da Lista de Espera
  const retirarDiaristaFila = (diaristaId) => {
    if (!ehAdmin && diaristaId !== usuarioLogado?.id) {
      alertSimples('Ação não permitida', 'Você só pode alterar o seu próprio nome.');
      return;
    }
    setFilaEsperaDiaristas((prev) => prev.filter((p) => p.id !== diaristaId));
    alertSimples('Removido', 'Seu nome foi retirado da lista de espera.');
  };

  // Enviar os 15 confirmados para a aba de Jogos da Rodada (Exclusivo do Admin)
  const handleDivisaoTimes = () => {
    if (!ehAdmin) {
      alertSimples('Acesso Restrito', 'Apenas o administrador pode gerar ou dividir os times.');
      return;
    }
    if (confirmadosLinha.length < 9) {
      alertSimples('Mínimo 9 Jogadores', 'É necessário pelo menos 9 jogadores para dividir os 3 times.');
      return;
    }
    if (onEnviarParaSorteio) {
      onEnviarParaSorteio(confirmadosLinha);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* CARD DO LOCAL E HORÁRIO OFICIAL */}
      <View style={styles.cardInfoLocal}>
        <View style={styles.headerLocalLinha}>
          <View>
            <Text style={styles.badgeLocal}>🏟️ LOCAL & HORÁRIO DO JOGO</Text>
            <Text style={styles.localNome}>Toque de Bola</Text>
            <Text style={styles.localEndereco}>Monte Castelo, Juiz de Fora - MG</Text>
          </View>
          <View style={styles.horaDestaqueBox}>
            <Text style={styles.horaDestaqueLabel}>SEGUNDA</Text>
            <Text style={styles.horaDestaqueValor}>19:00</Text>
          </View>
        </View>

        {/* STATUS PESSOAL DO USUÁRIO LOGADO */}
        {usuarioLogado && (
          <View style={styles.cardStatusPessoal}>
            <Text style={styles.statusPessoalTitulo}>
              Seu Status para esta Segunda ({usuarioLogado.nome}):
            </Text>

            {euEstouConfirmado ? (
              <View style={styles.statusPessoalRow}>
                <View style={styles.badgeConfirmadoPessoal}>
                  <Text style={styles.badgeConfirmadoPessoalTxt}>
                    ✅ CONFIRMADO PARA O JOGO
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.btnDesfalquePessoal}
                  onPress={() => retirarNomeConfirmado(usuarioLogado)}
                >
                  <Text style={styles.btnDesfalquePessoalTxt}>❌ Não Poderei Ir</Text>
                </TouchableOpacity>
              </View>
            ) : euEstouNaFila ? (
              <View style={styles.statusPessoalRow}>
                <View style={styles.badgeFilaPessoal}>
                  <Text style={styles.badgeFilaPessoalTxt}>
                    ⏳ NA FILA DE ESPERA (#{minhaPosicaoFila + 1})
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.btnSairFilaPessoal}
                  onPress={() => retirarDiaristaFila(usuarioLogado.id)}
                >
                  <Text style={styles.btnSairFilaPessoalTxt}>✕ Sair da Fila</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.statusPessoalRow}>
                <Text style={styles.txtNaoConfirmado}>Você ainda não marcou presença.</Text>
                <TouchableOpacity
                  style={styles.btnConfirmarPessoal}
                  onPress={() => entrarDiaristaFila(usuarioLogado)}
                >
                  <Text style={styles.btnConfirmarPessoalTxt}>
                    {confirmadosLinha.length < 15 ? '⚽ Confirmar Presença' : '⏳ Entrar na Fila de Espera'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* REGRAS DE HORÁRIO AUTOMÁTICO */}
        <View style={styles.regrasHorarioBox}>
          <Text style={styles.regrasHorarioTxt}>
            📅 <Text style={{ fontWeight: 'bold' }}>Quinta 12:00:</Text> Lista abre no app com 15 mensalistas e 2 goleiros pré-confirmados.
          </Text>
          <Text style={styles.regrasHorarioTxt}>
            ⚡ <Text style={{ fontWeight: 'bold' }}>Segunda 18:00:</Text> Divisão automática dos 3 times equilibrados pelo sistema.
          </Text>
        </View>

        {/* STATUS DA AGENDA */}
        <View style={styles.statusAgendaLinha}>
          <View style={[styles.badgeStatusAgenda, agendaAberta ? styles.badgeAberta : styles.badgeFechada]}>
            <Text style={styles.badgeStatusAgendaTxt}>
              {agendaAberta ? '🟢 LISTA ABERTA PARA CONFIRMAÇÃO' : '🔒 LISTA FECHADA (TIMES JÁ DIVIDIDOS)'}
            </Text>
          </View>

          {/* Controle exclusivo do administrador */}
          {ehAdmin && (
            <TouchableOpacity
              style={styles.btnSimularToggle}
              onPress={() => setAgendaAberta(!agendaAberta)}
            >
              <Text style={styles.btnSimularToggleTxt}>
                {agendaAberta ? 'Fechar' : 'Abrir'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* SEÇÃO 1: OS 2 GOLEIROS FIXOS */}
      <View style={styles.cardSecao}>
        <View style={styles.cardSecaoHeader}>
          <Text style={styles.secaoTitulo}>🧤 Goleiros Fixos ({goleirosConfirmados.length}/2)</Text>
          <Text style={styles.secaoSub}>Não entram no sorteio da linha; são escalados na quadra.</Text>
        </View>

        <View style={styles.goleirosGrid}>
          {goleirosConfirmados.map((g) => {
            const podeAlterar = ehAdmin || g.id === usuarioLogado?.id;
            return (
              <View key={g.id} style={styles.cardGoleiroItem}>
                <Text style={styles.goleiroAvatar}>{g.avatar || '🧤'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goleiroNome}>{g.nome}</Text>
                  <Text style={styles.goleiroStatus}>Goleiro Fixo Confirmado</Text>
                </View>

                {podeAlterar && (
                  <TouchableOpacity
                    style={styles.btnDesfalqueMini}
                    onPress={() => retirarNomeConfirmado(g)}
                  >
                    <Text style={styles.btnDesfalqueMiniTxt}>❌ Desfalque</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
          {goleirosConfirmados.length < 2 && (
            <Text style={styles.avisoGoleiroFalta}>
              ⚠️ Atenção: Apenas {goleirosConfirmados.length} goleiro confirmado para esta segunda.
            </Text>
          )}
        </View>
      </View>

      {/* SEÇÃO 2: 15 CONFIRMADOS DE LINHA */}
      <View style={styles.cardSecao}>
        <View style={styles.cardSecaoHeaderLinha}>
          <View>
            <Text style={styles.secaoTitulo}>
              ⚽ Confirmados de Linha ({confirmadosLinha.length}/15)
            </Text>
            <Text style={styles.secaoSub}>
              {confirmadosLinha.length === 15
                ? 'Lista completa para os 3 times de 5 jogadores!'
                : `Faltam ${15 - confirmadosLinha.length} jogador(es) para fechar os 15.`}
            </Text>
          </View>

          {/* Botão de divisão de times exclusivo do Admin */}
          {ehAdmin && (
            <TouchableOpacity style={styles.btnDividirTimesAgora} onPress={handleDivisaoTimes}>
              <Text style={styles.btnDividirTimesAgoraTxt}>⚡ Ver / Gerar Times</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LISTA DOS 15 JOGADORES CONFIRMADOS */}
        <View style={styles.listaJogadoresConfirmados}>
          {confirmadosLinha.map((j, idx) => {
            const isMensalista = j.status.includes('Mensalista');
            const podeAlterar = ehAdmin || j.id === usuarioLogado?.id;

            return (
              <View key={j.id} style={styles.itemConfirmado}>
                <Text style={styles.itemIndex}>{idx + 1}.</Text>
                <Text style={styles.itemAvatar}>{j.avatar}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemNome}>
                    {j.nome} {j.id === usuarioLogado?.id ? '(Você)' : ''}
                  </Text>
                  <Text style={styles.itemSubStatus}>
                    {isMensalista ? '⭐ Mensalista Ativo' : '🏃 Diarista Promovido'} • OVR {j.overall}
                  </Text>
                </View>

                {/* BOTÃO PARA RETIRAR O NOME (Apenas Admin ou o próprio jogador) */}
                {podeAlterar && (
                  <TouchableOpacity
                    style={styles.btnRetirarNome}
                    onPress={() => retirarNomeConfirmado(j)}
                  >
                    <Text style={styles.btnRetirarNomeTxt}>❌ Não Vou</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* SEÇÃO 3: LISTA DE ESPERA DOS DIARISTAS */}
      <View style={styles.cardSecao}>
        <View style={styles.cardSecaoHeader}>
          <Text style={styles.secaoTitulo}>
            ⏳ Lista de Espera de Diaristas ({filaEsperaDiaristas.length})
          </Text>
          <Text style={styles.secaoSub}>
            Ordem de chegada estrita: quem confirmou primeiro tem prioridade na vaga.
          </Text>
        </View>

        {filaEsperaDiaristas.length === 0 ? (
          <Text style={styles.txtFilaVazia}>
            Nenhum diarista aguardando na lista de espera no momento.
          </Text>
        ) : (
          <View style={styles.listaFila}>
            {filaEsperaDiaristas.map((d, index) => {
              const podeAlterar = ehAdmin || d.id === usuarioLogado?.id;
              return (
                <View key={d.id} style={styles.itemFila}>
                  <View style={styles.badgePosicaoFila}>
                    <Text style={styles.badgePosicaoFilaTxt}>#{index + 1}</Text>
                  </View>
                  <Text style={styles.itemAvatar}>{d.avatar}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemNome}>
                      {d.nome} {d.id === usuarioLogado?.id ? '(Você)' : ''}
                    </Text>
                    <Text style={styles.itemHoraFila}>
                      Aguardando desde: {d.dataHoraConfirmacao || 'Hoje'}
                    </Text>
                  </View>

                  {podeAlterar && (
                    <TouchableOpacity
                      style={styles.btnSairFila}
                      onPress={() => retirarDiaristaFila(d.id)}
                    >
                      <Text style={styles.btnSairFilaTxt}>✕ Sair da Fila</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ADMIN: ADICIONAR QUALQUER DIARISTA NA FILA */}
        {ehAdmin && (
          <View style={styles.adicionarDiaristaContainer}>
            <Text style={styles.labelAdicionarDiarista}>
              👑 Admin: Adicionar Diarista na Lista de Espera:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              {diaristasDisponiveis
                .filter(
                  (d) =>
                    !confirmadosLinha.some((c) => c.id === d.id) &&
                    !filaEsperaDiaristas.some((f) => f.id === d.id)
                )
                .map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={styles.chipDiaristaAdicionar}
                    onPress={() => entrarDiaristaFila(d)}
                  >
                    <Text style={styles.chipDiaristaAdicionarTxt}>+ {d.nome}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* SEÇÃO 4: DESFALQUES REGISTRADOS */}
      {desfalques.length > 0 && (
        <View style={styles.cardSecao}>
          <Text style={styles.secaoTitulo}>🚫 Desfalques da Rodada ({desfalques.length})</Text>
          <Text style={styles.secaoSub}>Atletas que informaram que não poderão comparecer:</Text>

          <View style={{ marginTop: 8, gap: 6 }}>
            {desfalques.map((p) => {
              const podeAlterar = ehAdmin || p.id === usuarioLogado?.id;
              return (
                <View key={p.id} style={styles.itemDesfalque}>
                  <Text style={styles.itemNomeDesfalque}>
                    ❌ {p.nome} ({p.posicao})
                  </Text>
                  {podeAlterar && (
                    <TouchableOpacity
                      style={styles.btnReassumir}
                      onPress={() => reassumirVaga(p)}
                    >
                      <Text style={styles.btnReassumirTxt}>↩️ Reassumir Vaga</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}
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

  // Card do Local
  cardInfoLocal: {
    backgroundColor: '#062817',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  headerLocalLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeLocal: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  localNome: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  localEndereco: {
    color: '#a7f3d0',
    fontSize: 12,
  },
  horaDestaqueBox: {
    backgroundColor: '#0a321d',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  horaDestaqueLabel: {
    color: '#a7f3d0',
    fontSize: 10,
    fontWeight: '800',
  },
  horaDestaqueValor: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },

  // Status Pessoal
  cardStatusPessoal: {
    backgroundColor: '#041f11',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  statusPessoalTitulo: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
  },
  statusPessoalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  badgeConfirmadoPessoal: {
    backgroundColor: '#065f46',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeConfirmadoPessoalTxt: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '900',
  },
  btnDesfalquePessoal: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnDesfalquePessoalTxt: {
    color: '#fecaca',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeFilaPessoal: {
    backgroundColor: '#854d0e',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeFilaPessoalTxt: {
    color: '#fef08a',
    fontSize: 12,
    fontWeight: '900',
  },
  btnSairFilaPessoal: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnSairFilaPessoalTxt: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  txtNaoConfirmado: {
    color: '#94a3b8',
    fontSize: 12,
  },
  btnConfirmarPessoal: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  btnConfirmarPessoalTxt: {
    color: '#022c22',
    fontSize: 12,
    fontWeight: '900',
  },

  regrasHorarioBox: {
    backgroundColor: '#041f11',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 4,
  },
  regrasHorarioTxt: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16,
  },
  statusAgendaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeStatusAgenda: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeAberta: {
    backgroundColor: '#065f46',
  },
  badgeFechada: {
    backgroundColor: '#854d0e',
  },
  badgeStatusAgendaTxt: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  btnSimularToggle: {
    backgroundColor: '#0f4829',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btnSimularToggleTxt: {
    color: '#d1fae5',
    fontSize: 11,
    fontWeight: '700',
  },

  // Seções Gerais
  cardSecao: {
    backgroundColor: '#062615',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  cardSecaoHeader: {
    marginBottom: 12,
  },
  cardSecaoHeaderLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  secaoTitulo: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
  },
  secaoSub: {
    color: '#6ee7b7',
    fontSize: 11,
    marginTop: 2,
  },
  btnDividirTimesAgora: {
    backgroundColor: '#10b981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnDividirTimesAgoraTxt: {
    color: '#022c22',
    fontSize: 12,
    fontWeight: '800',
  },

  // Goleiros
  goleirosGrid: {
    gap: 8,
  },
  cardGoleiroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#08331f',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  goleiroAvatar: {
    fontSize: 20,
  },
  goleiroNome: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
  },
  goleiroStatus: {
    color: '#a7f3d0',
    fontSize: 11,
  },
  btnDesfalqueMini: {
    backgroundColor: '#7f1d1d',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnDesfalqueMiniTxt: {
    color: '#fecaca',
    fontSize: 11,
    fontWeight: '700',
  },
  avisoGoleiroFalta: {
    color: '#f59e0b',
    fontSize: 12,
    marginTop: 4,
  },

  // Confirmados Linha
  listaJogadoresConfirmados: {
    gap: 6,
  },
  itemConfirmado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#08331f',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 8,
  },
  itemIndex: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    width: 20,
  },
  itemAvatar: {
    fontSize: 16,
  },
  itemNome: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  itemSubStatus: {
    color: '#94a3b8',
    fontSize: 10,
  },
  btnRetirarNome: {
    backgroundColor: '#334155',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnRetirarNomeTxt: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },

  // Fila de Espera
  txtFilaVazia: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
    marginVertical: 6,
  },
  listaFila: {
    gap: 6,
    marginBottom: 12,
  },
  itemFila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a321d',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  badgePosicaoFila: {
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgePosicaoFilaTxt: {
    color: '#022c22',
    fontSize: 11,
    fontWeight: '900',
  },
  itemHoraFila: {
    color: '#6ee7b7',
    fontSize: 10,
  },
  btnSairFila: {
    backgroundColor: '#1e293b',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  btnSairFilaTxt: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  adicionarDiaristaContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#0f4829',
    paddingTop: 8,
  },
  labelAdicionarDiarista: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '700',
  },
  chipDiaristaAdicionar: {
    backgroundColor: '#0a321d',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#114a2a',
  },
  chipDiaristaAdicionarTxt: {
    color: '#d1fae5',
    fontSize: 11,
    fontWeight: '700',
  },

  // Desfalques
  itemDesfalque: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1c1917',
    padding: 8,
    borderRadius: 6,
  },
  itemNomeDesfalque: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  btnReassumir: {
    backgroundColor: '#065f46',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  btnReassumirTxt: {
    color: '#a7f3d0',
    fontSize: 10,
    fontWeight: '700',
  },
});
