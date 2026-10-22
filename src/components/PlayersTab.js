import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { sortearTimesEquilibrados } from '../utils/teamBalancer';

export default function PlayersTab({
  players,
  onUpdatePlayers,
  onTimesGerados, // envia os times gerados para a aba de partidas
}) {
  const [subSecao, setSubSecao] = useState('sorteio'); // 'sorteio' | 'jogadores'

  // Jogadores selecionados para o sorteio do dia (IDs)
  // Pré-seleciona os primeiros 15 por padrão
  const [selecionadosIds, setSelecionadosIds] = useState(() => {
    return players.slice(0, 15).map(p => p.id);
  });

  // Times sorteados
  const [timesSorteados, setTimesSorteados] = useState(null);

  // Filtro de busca na lista de jogadores
  const [buscaJogador, setBuscaJogador] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'mensalista' | 'diarista' | 'goleiro'

  // Modal de edição / criação de jogador
  const [modalJogador, setModalJogador] = useState(false);
  const [jogadorEmEdicao, setJogadorEmEdicao] = useState(null);

  // Formulário do jogador
  const [formNome, setFormNome] = useState('');
  const [formStatus, setFormStatus] = useState('Mensalista');
  const [formPosicao, setFormPosicao] = useState('Linha');
  const [formVelocidade, setFormVelocidade] = useState(3);
  const [formChute, setFormChute] = useState(3);
  const [formMarcacao, setFormMarcacao] = useState(3);
  const [formPasse, setFormPasse] = useState(3);
  const [formHabilidade, setFormHabilidade] = useState(3);

  const alertSimples = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  // Toggle seleção de presença
  const toggleSelecao = (id) => {
    setSelecionadosIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Auto-selecionar os 15 primeiros
  const autoSelecionar15 = () => {
    setSelecionadosIds(players.slice(0, 15).map(p => p.id));
  };

  // Limpar seleção
  const limparSelecao = () => {
    setSelecionadosIds([]);
    setTimesSorteados(null);
  };

  // Executar Sorteio Equilibrado
  const realizarSorteio = () => {
    const selecionados = players.filter(p => selecionadosIds.includes(p.id));

    if (selecionados.length < 9) {
      alertSimples('Jogadores Insuficientes', 'Selecione pelo menos 9 jogadores para dividir os 3 times.');
      return;
    }

    const resultadoTimes = sortearTimesEquilibrados(selecionados, 3, 5);
    setTimesSorteados(resultadoTimes);

    if (onTimesGerados) {
      onTimesGerados(resultadoTimes);
    }
  };

  // Copiar escalação para o WhatsApp
  const copiarTextoWhatsApp = () => {
    if (!timesSorteados) return;

    let txt = `⚽ *PELADA DE SEGUNDA - TIMES SORTEADOS*\n\n`;
    timesSorteados.forEach(t => {
      txt += `*${t.nome.toUpperCase()}* (Poder: ${t.poderTotal} pts):\n`;
      t.jogadores.forEach((j, i) => {
        txt += ` ${i + 1}. ${j.nome} (${j.posicao === 'Goleiro' ? 'GK' : 'Linha'} - ovr ${j.overall})\n`;
      });
      txt += `\n`;
    });
    txt += `⏱️ Partidas de 7 min • Regra do Empate com Vantagem para o Desafiante!\n`;

    if (Platform.OS === 'web' && navigator?.clipboard) {
      navigator.clipboard.writeText(txt);
      alertSimples('Copiado!', 'Escalação copiada para a área de transferência! Cole no grupo do WhatsApp.');
    } else {
      alertSimples('Escalação dos Times', txt);
    }
  };

  // Abrir modal de criação ou edição
  const abrirModalJogador = (jogador = null) => {
    if (jogador) {
      setJogadorEmEdicao(jogador);
      setFormNome(jogador.nome);
      setFormStatus(jogador.status || 'Mensalista');
      setFormPosicao(jogador.posicao || 'Linha');
      setFormVelocidade(jogador.velocidade || 3);
      setFormChute(jogador.chute || 3);
      setFormMarcacao(jogador.marcacao || 3);
      setFormPasse(jogador.passe || 3);
      setFormHabilidade(jogador.habilidade || 3);
    } else {
      setJogadorEmEdicao(null);
      setFormNome('');
      setFormStatus('Mensalista');
      setFormPosicao('Linha');
      setFormVelocidade(3);
      setFormChute(3);
      setFormMarcacao(3);
      setFormPasse(3);
      setFormHabilidade(3);
    }
    setModalJogador(true);
  };

  const salvarJogador = () => {
    if (!formNome.trim()) {
      alertSimples('Nome Obrigatório', 'Informe o nome do jogador.');
      return;
    }

    const overall = formVelocidade + formChute + formMarcacao + formPasse + formHabilidade;
    const avatar = formPosicao === 'Goleiro' ? '🧤' : formStatus.includes('Mensalista') ? '⭐' : '🏃';

    let novaLista = [...players];
    if (jogadorEmEdicao) {
      novaLista = novaLista.map(p =>
        p.id === jogadorEmEdicao.id
          ? {
              ...p,
              nome: formNome,
              status: formStatus,
              posicao: formPosicao,
              avatar,
              velocidade: formVelocidade,
              chute: formChute,
              marcacao: formMarcacao,
              passe: formPasse,
              habilidade: formHabilidade,
              overall,
            }
          : p
      );
    } else {
      novaLista.push({
        id: `p_${Date.now()}`,
        nome: formNome,
        status: formStatus,
        posicao: formPosicao,
        avatar,
        velocidade: formVelocidade,
        chute: formChute,
        marcacao: formMarcacao,
        passe: formPasse,
        habilidade: formHabilidade,
        overall,
      });
    }

    onUpdatePlayers(novaLista);
    setModalJogador(false);
  };

  const excluirJogador = (id) => {
    const nova = players.filter(p => p.id !== id);
    onUpdatePlayers(nova);
  };

  // Jogadores filtrados para exibição
  const jogadoresFiltrados = useMemo(() => {
    return players.filter(p => {
      const matchNome = p.nome.toLowerCase().includes(buscaJogador.toLowerCase());
      if (!matchNome) return false;

      if (filtroTipo === 'mensalista') return p.status.includes('Mensalista');
      if (filtroTipo === 'diarista') return p.status.includes('Diarista');
      if (filtroTipo === 'goleiro') return p.posicao === 'Goleiro';
      return true;
    });
  }, [players, buscaJogador, filtroTipo]);

  // Diferença de poder entre os times sorteados
  const diferencaPoder = useMemo(() => {
    if (!timesSorteados || timesSorteados.length < 2) return 0;
    const poderes = timesSorteados.map(t => t.poderTotal);
    return Math.round((Math.max(...poderes) - Math.min(...poderes)) * 10) / 10;
  }, [timesSorteados]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* SELETOR DE SUB-SEÇÃO */}
      <View style={styles.subAbasContainer}>
        <TouchableOpacity
          style={[styles.subAbaBotao, subSecao === 'sorteio' && styles.subAbaAtiva]}
          onPress={() => setSubSecao('sorteio')}
        >
          <Text style={[styles.subAbaTexto, subSecao === 'sorteio' && styles.subAbaTextoAtiva]}>
            ⚡ Divisão de 3 Times
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subAbaBotao, subSecao === 'jogadores' && styles.subAbaAtiva]}
          onPress={() => setSubSecao('jogadores')}
        >
          <Text style={[styles.subAbaTexto, subSecao === 'jogadores' && styles.subAbaTextoAtiva]}>
            ⭐ Habilidades & Jogadores ({players.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* SEÇÃO 1: DIVISÃO EQUILIBRADA DE TIMES */}
      {subSecao === 'sorteio' && (
        <View>
          {/* PAINEL DE SELEÇÃO DOS 15 JOGADORES */}
          <View style={styles.cardSorteioConfig}>
            <View style={styles.cardHeaderLinha}>
              <View>
                <Text style={styles.cardTitulo}>Lista de Presença do Dia</Text>
                <Text style={styles.cardSub}>
                  Pelada com 3 times de 5 jogadores (15 atletas no total).
                </Text>
              </View>

              <View
                style={[
                  styles.badgeContador,
                  selecionadosIds.length === 15 ? styles.badge15Ideal : styles.badgeNormal,
                ]}
              >
                <Text style={styles.badgeContadorTexto}>
                  {selecionadosIds.length} / 15
                </Text>
              </View>
            </View>

            {/* Ações rápidas de seleção */}
            <View style={styles.acoesRapidasLinha}>
              <TouchableOpacity onPress={autoSelecionar15} style={styles.btnAcaoMini}>
                <Text style={styles.btnAcaoMiniTexto}>⚡ Selecionar 15</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={limparSelecao} style={styles.btnAcaoMini}>
                <Text style={styles.btnAcaoMiniTexto}>🧹 Limpar</Text>
              </TouchableOpacity>
            </View>

            {/* GRADE DE SELEÇÃO DE JOGADORES */}
            <Text style={styles.labelGrade}>Toque para marcar quem vai jogar hoje:</Text>
            <View style={styles.gradePresenca}>
              {players.map((p) => {
                const isSelected = selecionadosIds.includes(p.id);
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => toggleSelecao(p.id)}
                    style={[styles.chipJogadorPresenca, isSelected && styles.chipJogadorSelecionado]}
                  >
                    <Text style={styles.chipAvatar}>{p.avatar}</Text>
                    <Text style={[styles.chipNome, isSelected && styles.chipNomeSelecionado]}>
                      {p.nome.split(' ')[0]}
                    </Text>
                    <Text style={[styles.chipOverall, isSelected && styles.chipOverallSelecionado]}>
                      {p.overall}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* BOTÃO PRINCIPAL DE SORTEIO */}
            <TouchableOpacity
              onPress={realizarSorteio}
              style={[
                styles.btnSortearPrincipal,
                selecionadosIds.length === 15 && styles.btnSortearDestaque,
              ]}
            >
              <Text style={styles.btnSortearTexto}>
                ⚡ SORTEAR 3 TIMES COM PODER EQUILIBRADO
              </Text>
            </TouchableOpacity>
          </View>

          {/* EXIBIÇÃO DOS TIMES SORTEADOS */}
          {timesSorteados && (
            <View style={styles.containerTimesSorteados}>
              <View style={styles.resultadoHeader}>
                <View>
                  <Text style={styles.resultadoTitulo}>🏆 Times Formados</Text>
                  <Text style={styles.resultadoSub}>
                    Diferença máxima entre times: apenas{' '}
                    <Text style={{ fontWeight: 'bold', color: '#10b981' }}>{diferencaPoder} pts</Text>! ⚖️
                  </Text>
                </View>
                <TouchableOpacity onPress={copiarTextoWhatsApp} style={styles.btnWhats}>
                  <Text style={styles.btnWhatsTexto}>💬 WhatsApp</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timesGrid}>
                {timesSorteados.map((time, idx) => (
                  <View
                    key={time.id}
                    style={[
                      styles.cardTime,
                      idx === 0
                        ? styles.bordaVerde
                        : idx === 1
                        ? styles.bordaBranca
                        : styles.bordaPreta,
                    ]}
                  >
                    {/* CABEÇALHO DO TIME */}
                    <View
                      style={[
                        styles.timeHeader,
                        { backgroundColor: time.cor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeNome,
                          { color: time.textColor || '#ffffff' },
                        ]}
                      >
                        {time.nome.toUpperCase()}
                      </Text>
                      <View style={styles.timePoderBadge}>
                        <Text style={styles.timePoderTxt}>Poder: {time.poderTotal}</Text>
                      </View>
                    </View>

                    {/* LISTA DE JOGADORES DO TIME */}
                    <View style={styles.timeJogadoresLista}>
                      {time.jogadores.map((j, jIdx) => (
                        <View key={j.id} style={styles.timeJogadorItem}>
                          <Text style={styles.timeJogadorIndex}>{jIdx + 1}.</Text>
                          <Text style={styles.timeJogadorAvatar}>{j.avatar}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.timeJogadorNome}>{j.nome}</Text>
                            <Text style={styles.timeJogadorPos}>
                              {j.posicao === 'Goleiro' ? '🧤 Goleiro' : 'Linha'}
                            </Text>
                          </View>
                          <View style={styles.timeJogadorOvrBox}>
                            <Text style={styles.timeJogadorOvrTxt}>{j.overall}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity onPress={realizarSorteio} style={styles.btnReSortear}>
                <Text style={styles.btnReSortearTexto}>🔄 Re-sortear Times</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* SEÇÃO 2: BANCO DE JOGADORES & TABELA DE HABILIDADES */}
      {subSecao === 'jogadores' && (
        <View>
          {/* BARRA DE PESQUISA E NOVO JOGADOR */}
          <View style={styles.buscaLinha}>
            <TextInput
              style={styles.inputBusca}
              placeholder="Buscar jogador..."
              value={buscaJogador}
              onChangeText={setBuscaJogador}
            />
            <TouchableOpacity style={styles.btnNovoJogador} onPress={() => abrirModalJogador()}>
              <Text style={styles.btnNovoJogadorTexto}>+ Novo</Text>
            </TouchableOpacity>
          </View>

          {/* FILTROS DE TIPO */}
          <View style={styles.filtrosTipoRow}>
            {['todos', 'mensalista', 'diarista', 'goleiro'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filtroTipoBtn, filtroTipo === f && styles.filtroTipoBtnAtivo]}
                onPress={() => setFiltroTipo(f)}
              >
                <Text style={[styles.filtroTipoTxt, filtroTipo === f && styles.filtroTipoTxtAtivo]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* LISTA DE JOGADORES COM HABILIDADES */}
          <View style={styles.jogadoresLista}>
            {jogadoresFiltrados.map((p) => (
              <View key={p.id} style={styles.cardJogadorHabilidade}>
                <View style={styles.jogadorCardTopo}>
                  <View style={styles.jogadorIdentidade}>
                    <Text style={styles.jogadorAvatarGrande}>{p.avatar}</Text>
                    <View>
                      <Text style={styles.jogadorNomeGrande}>{p.nome}</Text>
                      <Text style={styles.jogadorSub}>
                        {p.status} • {p.posicao}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.overallDestaqueBox}>
                    <Text style={styles.overallDestaqueLabel}>PODER</Text>
                    <Text style={styles.overallDestaqueValor}>{p.overall}</Text>
                  </View>
                </View>

                {/* ATRIBUTOS INDIVIDUAIS (1 a 5) */}
                <View style={styles.atributosGrid}>
                  <View style={styles.atributoItem}>
                    <Text style={styles.atributoSigla}>VEL</Text>
                    <Text style={styles.atributoNota}>{p.velocidade || 2}</Text>
                  </View>
                  <View style={styles.atributoItem}>
                    <Text style={styles.atributoSigla}>CHU</Text>
                    <Text style={styles.atributoNota}>{p.chute || 2}</Text>
                  </View>
                  <View style={styles.atributoItem}>
                    <Text style={styles.atributoSigla}>MAR</Text>
                    <Text style={styles.atributoNota}>{p.marcacao || 2}</Text>
                  </View>
                  <View style={styles.atributoItem}>
                    <Text style={styles.atributoSigla}>PAS</Text>
                    <Text style={styles.atributoNota}>{p.passe || 2}</Text>
                  </View>
                  <View style={styles.atributoItem}>
                    <Text style={styles.atributoSigla}>HAB</Text>
                    <Text style={styles.atributoNota}>{p.habilidade || 2}</Text>
                  </View>
                </View>

                {/* BOTÕES DE AÇÃO */}
                <View style={styles.cardJogadorAcoes}>
                  <TouchableOpacity
                    style={styles.btnEditarHabilidades}
                    onPress={() => abrirModalJogador(p)}
                  >
                    <Text style={styles.btnEditarHabilidadesTxt}>✏️ Editar Habilidades</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnExcluirMini}
                    onPress={() => excluirJogador(p.id)}
                  >
                    <Text>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* MODAL DE CADASTRO / EDIÇÃO DE JOGADOR E NOTAS */}
      <Modal visible={modalJogador} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitulo}>
                {jogadorEmEdicao ? 'Editar Habilidades' : 'Cadastrar Novo Jogador'}
              </Text>
              <Text style={styles.modalSub}>
                Defina o poder e notas de 1 a 5 em cada fundamento.
              </Text>

              <Text style={styles.labelInput}>Nome do Jogador:</Text>
              <TextInput
                style={styles.inputModal}
                value={formNome}
                onChangeText={setFormNome}
                placeholder="Ex: Neymar Silva"
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.labelInput}>Status:</Text>
                  <View style={styles.tipoPickerRow}>
                    {['Mensalista', 'Diarista'].map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[styles.tipoPickerBtn, formStatus === st && styles.tipoPickerBtnAtivo]}
                        onPress={() => setFormStatus(st)}
                      >
                        <Text style={[styles.tipoPickerTxt, formStatus === st && styles.tipoPickerTxtAtivo]}>
                          {st}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.labelInput}>Posição:</Text>
                  <View style={styles.tipoPickerRow}>
                    {['Linha', 'Goleiro'].map((pos) => (
                      <TouchableOpacity
                        key={pos}
                        style={[styles.tipoPickerBtn, formPosicao === pos && styles.tipoPickerBtnAtivo]}
                        onPress={() => setFormPosicao(pos)}
                      >
                        <Text style={[styles.tipoPickerTxt, formPosicao === pos && styles.tipoPickerTxtAtivo]}>
                          {pos}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.divisorLinha} />

              <Text style={[styles.labelInput, { fontSize: 13, marginBottom: 12 }]}>
                ⭐ Atributos (Notas de 1 a 5):
              </Text>

              {/* SELETORES DE NOTAS DE 1 A 5 */}
              {[
                { label: 'Velocidade', val: formVelocidade, setVal: setFormVelocidade },
                { label: 'Chute', val: formChute, setVal: setFormChute },
                { label: 'Marcação', val: formMarcacao, setVal: setFormMarcacao },
                { label: 'Passe', val: formPasse, setVal: setFormPasse },
                { label: 'Habilidade', val: formHabilidade, setVal: setFormHabilidade },
              ].map((item) => (
                <View key={item.label} style={styles.seletorAtributoLinha}>
                  <Text style={styles.seletorLabel}>{item.label}</Text>
                  <View style={styles.botoesNotaRow}>
                    {[1, 2, 3, 4, 5].map((nota) => (
                      <TouchableOpacity
                        key={nota}
                        style={[styles.btnNota, item.val === nota && styles.btnNotaAtiva]}
                        onPress={() => item.setVal(nota)}
                      >
                        <Text style={[styles.btnNotaTxt, item.val === nota && styles.btnNotaTxtAtiva]}>
                          {nota}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <View style={styles.resumoPoderFinal}>
                <Text style={styles.resumoPoderTxt}>Poder Calculado (Overall):</Text>
                <Text style={styles.resumoPoderNumero}>
                  {formVelocidade + formChute + formMarcacao + formPasse + formHabilidade} pts
                </Text>
              </View>

              <View style={styles.modalBotoesLinha}>
                <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalJogador(false)}>
                  <Text style={styles.modalBtnCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnSalvar} onPress={salvarJogador}>
                  <Text style={styles.modalBtnSalvarTexto}>Salvar Jogador</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
  subAbasContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  subAbaBotao: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  subAbaAtiva: {
    backgroundColor: '#16a34a',
  },
  subAbaTexto: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  subAbaTextoAtiva: {
    color: '#ffffff',
  },
  cardSorteioConfig: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  badgeContador: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeNormal: {
    backgroundColor: '#f1f5f9',
  },
  badge15Ideal: {
    backgroundColor: '#dcfce7',
    borderWidth: 1.5,
    borderColor: '#22c55e',
  },
  badgeContadorTexto: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  acoesRapidasLinha: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  btnAcaoMini: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  btnAcaoMiniTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  labelGrade: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  gradePresenca: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  chipJogadorPresenca: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  chipJogadorSelecionado: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  chipAvatar: {
    fontSize: 14,
    marginRight: 4,
  },
  chipNome: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginRight: 4,
  },
  chipNomeSelecionado: {
    color: '#ffffff',
  },
  chipOverall: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  chipOverallSelecionado: {
    color: '#064e3b',
    backgroundColor: '#a7f3d0',
  },
  btnSortearPrincipal: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnSortearDestaque: {
    backgroundColor: '#16a34a',
  },
  btnSortearTexto: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  containerTimesSorteados: {
    marginTop: 4,
  },
  resultadoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultadoTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  resultadoSub: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  btnWhats: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  btnWhatsTexto: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timesGrid: {
    gap: 12,
  },
  cardTime: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  bordaVerde: {
    borderLeftWidth: 6,
    borderLeftColor: '#16a34a',
  },
  bordaBranca: {
    borderLeftWidth: 6,
    borderLeftColor: '#94a3b8',
  },
  bordaPreta: {
    borderLeftWidth: 6,
    borderLeftColor: '#18181b',
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  timeNome: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  timePoderBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timePoderTxt: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  timeJogadoresLista: {
    padding: 12,
    gap: 8,
  },
  timeJogadorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeJogadorIndex: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    width: 20,
  },
  timeJogadorAvatar: {
    fontSize: 16,
    marginRight: 8,
  },
  timeJogadorNome: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  timeJogadorPos: {
    fontSize: 11,
    color: '#64748b',
  },
  timeJogadorOvrBox: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeJogadorOvrTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  btnReSortear: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  btnReSortearTexto: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
  },
  buscaLinha: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  inputBusca: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    fontSize: 13,
  },
  btnNovoJogador: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 10,
  },
  btnNovoJogadorTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  filtrosTipoRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  filtroTipoBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filtroTipoBtnAtivo: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filtroTipoTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  filtroTipoTxtAtivo: {
    color: '#ffffff',
  },
  jogadoresLista: {
    gap: 10,
  },
  cardJogadorHabilidade: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  jogadorCardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jogadorIdentidade: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jogadorAvatarGrande: {
    fontSize: 28,
    marginRight: 10,
  },
  jogadorNomeGrande: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  jogadorSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  overallDestaqueBox: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  overallDestaqueLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065f46',
  },
  overallDestaqueValor: {
    fontSize: 18,
    fontWeight: '900',
    color: '#047857',
  },
  atributosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  atributoItem: {
    alignItems: 'center',
    flex: 1,
  },
  atributoSigla: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 2,
  },
  atributoNota: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardJogadorAcoes: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  btnEditarHabilidades: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnEditarHabilidadesTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  btnExcluirMini: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 420,
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
    marginBottom: 6,
  },
  inputModal: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 10,
  },
  tipoPickerRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  tipoPickerBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tipoPickerBtnAtivo: {
    backgroundColor: '#0f172a',
  },
  tipoPickerTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  tipoPickerTxtAtivo: {
    color: '#ffffff',
  },
  divisorLinha: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  seletorAtributoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seletorLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  botoesNotaRow: {
    flexDirection: 'row',
    gap: 6,
  },
  btnNota: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnNotaAtiva: {
    backgroundColor: '#16a34a',
  },
  btnNotaTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  btnNotaTxtAtiva: {
    color: '#ffffff',
  },
  resumoPoderFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  resumoPoderTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065f46',
  },
  resumoPoderNumero: {
    fontSize: 16,
    fontWeight: '900',
    color: '#047857',
  },
  modalBotoesLinha: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
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
    backgroundColor: '#16a34a',
    alignItems: 'center',
  },
  modalBtnSalvarTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

