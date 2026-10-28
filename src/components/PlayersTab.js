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
import { normalizarLogin } from '../services/authService';

export default function PlayersTab({
  players,
  onUpdatePlayers,
}) {
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
  const [formEhAdmin, setFormEhAdmin] = useState(false);
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

  // Abrir modal de criação/edição
  const abrirModalJogador = (jogador = null) => {
    if (jogador) {
      setJogadorEmEdicao(jogador);
      setFormNome(jogador.nome);
      setFormStatus(jogador.status || 'Mensalista');
      setFormPosicao(jogador.posicao || 'Linha');
      setFormEhAdmin(normalizarLogin(jogador.nome) === 'douglas' || Boolean(jogador.ehAdmin));
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
      setFormEhAdmin(false);
      setFormVelocidade(3);
      setFormChute(3);
      setFormMarcacao(3);
      setFormPasse(3);
      setFormHabilidade(3);
    }
    setModalJogador(true);
  };

  // Alternar permissão de Administrador de um jogador
  const alternarAdminJogador = (jogadorId) => {
    const jogadorAlvo = players.find((p) => p.id === jogadorId);
    if (!jogadorAlvo) return;

    if (normalizarLogin(jogadorAlvo.nome) === 'douglas') {
      alertSimples(
        'Ação Não Permitida',
        'Douglas é o Administrador Principal e não pode ter seu papel alterado.'
      );
      return;
    }

    const estaAdmin = Boolean(jogadorAlvo.ehAdmin);
    const novoStatusAdmin = !estaAdmin;

    const executarAlternancia = () => {
      const novaLista = players.map((p) => {
        if (p.id === jogadorId) {
          return {
            ...p,
            ehAdmin: novoStatusAdmin,
            papel: novoStatusAdmin ? 'admin' : 'jogador',
          };
        }
        return p;
      });

      onUpdatePlayers(novaLista);

      alertSimples(
        novoStatusAdmin ? '👑 Promovido a Administrador!' : '⚽ Rebaixado a Usuário Comum',
        novoStatusAdmin
          ? `${jogadorAlvo.nome} agora é ADMINISTRADOR! Ele terá permissão para ver esta aba de jogadores, gerenciar partidas, caixa e presenças.`
          : `${jogadorAlvo.nome} voltou a ser USUÁRIO COMUM. A aba de jogadores e os botões de edição foram bloqueados para ele.`
      );
    };

    const confirmMsg = estaAdmin
      ? `Deseja remover os privilégios de administrador de "${jogadorAlvo.nome}"?\n\nEle voltará a ser um usuário comum.`
      : `Deseja promover "${jogadorAlvo.nome}" a ADMINISTRADOR?\n\nEle terá controle total sobre finanças, partidas, presenças e banco de jogadores.`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        executarAlternancia();
      }
    } else {
      Alert.alert(
        estaAdmin ? 'Remover Administrador?' : 'Promover a Administrador?',
        confirmMsg,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: estaAdmin ? 'Remover Admin' : 'Sim, Promover',
            style: estaAdmin ? 'destructive' : 'default',
            onPress: executarAlternancia,
          },
        ]
      );
    }
  };

  // Salvar jogador
  const salvarJogador = () => {
    if (!formNome.trim()) {
      alertSimples('Nome Obrigatório', 'Informe o nome do jogador.');
      return;
    }

    const overall = formVelocidade + formChute + formMarcacao + formPasse + formHabilidade;
    const avatar = formPosicao === 'Goleiro' ? '🧤' : formStatus.includes('Mensalista') ? '⭐' : '🏃';
    const ehAdminFinal = normalizarLogin(formNome) === 'douglas' ? true : formEhAdmin;

    let novaLista = [...players];

    if (jogadorEmEdicao) {
      novaLista = novaLista.map(p => {
        if (p.id === jogadorEmEdicao.id) {
          return {
            ...p,
            nome: formNome,
            status: formStatus,
            posicao: formPosicao,
            ehAdmin: ehAdminFinal,
            papel: ehAdminFinal ? 'admin' : 'jogador',
            avatar,
            velocidade: formVelocidade,
            chute: formChute,
            marcacao: formMarcacao,
            passe: formPasse,
            habilidade: formHabilidade,
            overall,
          };
        }
        return p;
      });
    } else {
      const novoId = `j_${Date.now()}`;
      novaLista.push({
        id: novoId,
        nome: formNome,
        status: formStatus,
        posicao: formPosicao,
        ehAdmin: ehAdminFinal,
        papel: ehAdminFinal ? 'admin' : 'jogador',
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

  // Alternar rapidamente entre Linha e Goleiro
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

    onUpdatePlayers(novaLista);

    const jAtual = players.find((x) => x.id === jogadorId);
    const virouGoleiro = jAtual && jAtual.posicao !== 'Goleiro';

    alertSimples(
      'Posição Alterada! 🔄',
      virouGoleiro
        ? `${jAtual.nome} agora é GOLEIRO! Pontuará com a fórmula de goleiros (2 vit, 0.5 emp, 1.0 gol/assist).`
        : `${jAtual.nome} voltou a ser JOGADOR DE LINHA (cálculo normal de 3 vit, 1.0 emp, 0.5 gol/assist).`
    );
  };

  // Excluir jogador
  const excluirJogador = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja excluir este jogador?')) {
        const novaLista = players.filter(p => p.id !== id);
        onUpdatePlayers(novaLista);
      }
    } else {
      Alert.alert('Excluir Jogador', 'Tem certeza que deseja excluir?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            const novaLista = players.filter(p => p.id !== id);
            onUpdatePlayers(novaLista);
          },
        },
      ]);
    }
  };

  // Filtragem da lista
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* CABEÇALHO */}
      <View style={styles.headerLista}>
        <View>
          <Text style={styles.tituloSecao}>👥 Banco de Jogadores</Text>
          <Text style={styles.subtituloSecao}>
            {players.length} atletas cadastrados • Atributos individuais e overall (6 a 25)
          </Text>
        </View>

        <TouchableOpacity style={styles.btnNovoJogador} onPress={() => abrirModalJogador()}>
          <Text style={styles.btnNovoJogadorTexto}>+ Novo Jogador</Text>
        </TouchableOpacity>
      </View>

      {/* BARRA DE PESQUISA */}
      <View style={styles.buscaLinha}>
        <TextInput
          style={styles.inputBusca}
          placeholder="Buscar jogador por nome..."
          placeholderTextColor="#64748b"
          value={buscaJogador}
          onChangeText={setBuscaJogador}
        />
      </View>

      {/* FILTROS DE TIPO */}
      <View style={styles.filtrosTipoRow}>
        {[
          { key: 'todos', label: `Todos (${players.length})` },
          { key: 'mensalista', label: 'Mensalistas' },
          { key: 'diarista', label: 'Diaristas' },
          { key: 'goleiro', label: 'Goleiros' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filtroTipoBtn, filtroTipo === f.key && styles.filtroTipoBtnAtivo]}
            onPress={() => setFiltroTipo(f.key)}
          >
            <Text style={[styles.filtroTipoTxt, filtroTipo === f.key && styles.filtroTipoTxtAtivo]}>
              {f.label}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={styles.jogadorNomeGrande}>{p.nome}</Text>
                    {normalizarLogin(p.nome) === 'douglas' || p.ehAdmin ? (
                      <View style={styles.badgeAdminMini}>
                        <Text style={styles.badgeAdminMiniTxt}>
                          {normalizarLogin(p.nome) === 'douglas' ? '👑 Admin Principal' : '👑 Admin'}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.badgeComumMini}>
                        <Text style={styles.badgeComumMiniTxt}>⚽ Atleta</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.jogadorSub}>
                    {p.status} • {p.posicao}
                  </Text>
                </View>
              </View>

              <View style={styles.overallDestaqueBox}>
                <Text style={styles.overallDestaqueLabel}>OVERALL</Text>
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

            {/* AÇÕES: ALTERNAR ADMIN / ALTERNAR GOLEIRO / EDITAR / EXCLUIR */}
            <View style={styles.acoesJogadorLinha}>
              {/* BOTÃO TORNAR / REMOVER ADMINISTRADOR */}
              {normalizarLogin(p.nome) !== 'douglas' && (
                <TouchableOpacity
                  onPress={() => alternarAdminJogador(p.id)}
                  style={[
                    styles.btnAdminToggleCard,
                    p.ehAdmin ? styles.btnAdminRemoverCard : styles.btnAdminPromoverCard,
                  ]}
                >
                  <Text
                    style={[
                      styles.btnAdminToggleCardTxt,
                      p.ehAdmin ? styles.btnAdminRemoverCardTxt : styles.btnAdminPromoverCardTxt,
                    ]}
                  >
                    {p.ehAdmin ? '❌ Tirar Admin' : '👑 Tornar Admin'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => alternarPosicaoJogador(p.id)}
                style={[
                  styles.btnTogglePosicaoCard,
                  p.posicao === 'Goleiro' ? styles.btnVoltarLinhaCard : styles.btnVirarGoleiroCard,
                ]}
              >
                <Text style={styles.btnTogglePosicaoCardTxt}>
                  {p.posicao === 'Goleiro' ? '🏃 Linha' : '🧤 Goleiro'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => abrirModalJogador(p)} style={styles.btnEditarCard}>
                <Text style={styles.btnEditarCardTxt}>✏️ Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => excluirJogador(p.id)} style={styles.btnExcluirCard}>
                <Text style={styles.btnExcluirCardTxt}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DO JOGADOR */}
      <Modal visible={modalJogador} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitulo}>
                {jogadorEmEdicao ? `Editar ${jogadorEmEdicao.nome}` : 'Novo Jogador'}
              </Text>

              <Text style={styles.labelInput}>Nome do Jogador:</Text>
              <TextInput
                style={styles.inputModal}
                value={formNome}
                onChangeText={setFormNome}
                placeholder="Ex: Gabriel Jesus"
                placeholderTextColor="#64748b"
              />

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
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

              {/* PERMISSÃO DE ACESSO / PERFIL ADMINISTRADOR */}
              {normalizarLogin(formNome) !== 'douglas' && (
                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.labelInput}>Permissão de Acesso:</Text>
                  <View style={styles.tipoPickerRow}>
                    <TouchableOpacity
                      style={[styles.tipoPickerBtn, !formEhAdmin && styles.tipoPickerBtnAtivo]}
                      onPress={() => setFormEhAdmin(false)}
                    >
                      <Text style={[styles.tipoPickerTxt, !formEhAdmin && styles.tipoPickerTxtAtivo]}>
                        ⚽ Usuário Comum
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.tipoPickerBtn, formEhAdmin && styles.tipoPickerBtnAdminAtivo]}
                      onPress={() => setFormEhAdmin(true)}
                    >
                      <Text style={[styles.tipoPickerTxt, formEhAdmin && styles.tipoPickerTxtAdminAtivo]}>
                        👑 Administrador
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <Text style={styles.labelSubSecaoModal}>Notas de Habilidade (1 a 5 estrelas):</Text>

              {[
                { label: 'Velocidade (VEL):', val: formVelocidade, setter: setFormVelocidade },
                { label: 'Chute / Finalização (CHU):', val: formChute, setter: setFormChute },
                { label: 'Marcação / Defesa (MAR):', val: formMarcacao, setter: setFormMarcacao },
                { label: 'Passe / Visão (PAS):', val: formPasse, setter: setFormPasse },
                { label: 'Habilidade / Drible (HAB):', val: formHabilidade, setter: setFormHabilidade },
              ].map((item, idx) => (
                <View key={idx} style={styles.sliderLinha}>
                  <Text style={styles.sliderLabel}>{item.label}</Text>
                  <View style={styles.estrelasRow}>
                    {[1, 2, 3, 4, 5].map((nota) => (
                      <TouchableOpacity
                        key={nota}
                        onPress={() => item.setter(nota)}
                        style={[styles.estrelaBtn, item.val >= nota && styles.estrelaBtnAtiva]}
                      >
                        <Text style={[styles.estrelaTxt, item.val >= nota && styles.estrelaTxtAtiva]}>
                          {nota}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <View style={styles.overallPreviaBox}>
                <Text style={styles.overallPreviaTxt}>
                  Overall Resultante:{' '}
                  <Text style={{ fontWeight: '900', color: '#10b981' }}>
                    {formVelocidade + formChute + formMarcacao + formPasse + formHabilidade}
                  </Text>{' '}
                  pts
                </Text>
              </View>

              <View style={styles.modalBotoesLinha}>
                <TouchableOpacity style={styles.btnCancelarModal} onPress={() => setModalJogador(false)}>
                  <Text style={styles.btnCancelarModalTxt}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSalvarModal} onPress={salvarJogador}>
                  <Text style={styles.btnSalvarModalTxt}>Salvar</Text>
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
    backgroundColor: '#031a0e',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  tituloSecao: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
  },
  subtituloSecao: {
    color: '#6ee7b7',
    fontSize: 12,
    marginTop: 2,
  },
  btnNovoJogador: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  btnNovoJogadorTexto: {
    color: '#022c22',
    fontSize: 13,
    fontWeight: '800',
  },
  buscaLinha: {
    marginBottom: 12,
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
  filtrosTipoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filtroTipoBtn: {
    backgroundColor: '#062615',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  filtroTipoBtnAtivo: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
  },
  filtroTipoTxt: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  filtroTipoTxtAtivo: {
    color: '#022c22',
    fontWeight: '800',
  },
  jogadoresLista: {
    gap: 12,
  },
  cardJogadorHabilidade: {
    backgroundColor: '#062817',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  jogadorCardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  jogadorIdentidade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  jogadorAvatarGrande: {
    fontSize: 24,
  },
  jogadorNomeGrande: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
  },
  jogadorSub: {
    color: '#94a3b8',
    fontSize: 11,
  },
  overallDestaqueBox: {
    backgroundColor: '#0a321d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  overallDestaqueLabel: {
    color: '#a7f3d0',
    fontSize: 9,
    fontWeight: '800',
  },
  overallDestaqueValor: {
    color: '#34d399',
    fontSize: 18,
    fontWeight: '900',
  },
  atributosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#041f11',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  atributoItem: {
    alignItems: 'center',
  },
  atributoSigla: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
  },
  atributoNota: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  acoesJogadorLinha: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  btnTogglePosicaoCard: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnVirarGoleiroCard: {
    backgroundColor: '#3b0764',
    borderWidth: 1,
    borderColor: '#a855f7',
  },
  btnVoltarLinhaCard: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#64748b',
  },
  btnTogglePosicaoCardTxt: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '800',
  },
  btnEditarCard: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#0f4829',
  },
  btnEditarCardTxt: {
    color: '#d1fae5',
    fontSize: 12,
    fontWeight: '600',
  },
  btnExcluirCard: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#1e293b',
  },
  btnExcluirCardTxt: {
    fontSize: 12,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
  },
  modalScrollContent: {
    padding: 16,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#062817',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  modalTitulo: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  labelInput: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputModal: {
    backgroundColor: '#041f11',
    color: '#ffffff',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  tipoPickerRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tipoPickerBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#041f11',
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  tipoPickerBtnAtivo: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
  },
  tipoPickerBtnAdminAtivo: {
    backgroundColor: '#78350f',
    borderColor: '#f59e0b',
  },
  tipoPickerTxt: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  tipoPickerTxtAtivo: {
    color: '#022c22',
    fontWeight: '800',
  },
  tipoPickerTxtAdminAtivo: {
    color: '#fef08a',
    fontWeight: '800',
  },
  badgeAdminMini: {
    backgroundColor: '#3b2904',
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAdminMiniTxt: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeComumMini: {
    backgroundColor: '#071f14',
    borderWidth: 1,
    borderColor: '#1e3a2b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeComumMiniTxt: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  btnAdminToggleCard: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  btnAdminPromoverCard: {
    backgroundColor: '#1c1906',
    borderColor: '#f59e0b',
  },
  btnAdminRemoverCard: {
    backgroundColor: '#200b0b',
    borderColor: '#ef4444',
  },
  btnAdminToggleCardTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  btnAdminPromoverCardTxt: {
    color: '#fbbf24',
  },
  btnAdminRemoverCardTxt: {
    color: '#f87171',
  },
  labelSubSecaoModal: {
    color: '#a7f3d0',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 10,
  },
  sliderLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  estrelasRow: {
    flexDirection: 'row',
    gap: 6,
  },
  estrelaBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#041f11',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f4829',
  },
  estrelaBtnAtiva: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
  },
  estrelaTxt: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  estrelaTxtAtiva: {
    color: '#022c22',
    fontWeight: '900',
  },
  overallPreviaBox: {
    backgroundColor: '#041f11',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 14,
  },
  overallPreviaTxt: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  modalBotoesLinha: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btnCancelarModal: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  btnCancelarModalTxt: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  btnSalvarModal: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#10b981',
  },
  btnSalvarModalTxt: {
    color: '#022c22',
    fontSize: 13,
    fontWeight: '800',
  },
});
