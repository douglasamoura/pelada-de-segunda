import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';

// Lista inicial de jogadores pré-cadastrados para teste
const JOGADORES_INICIAIS = [
  { id: '1', nome: 'Douglas Moura', tipo: 'mensalista', foto: '⚽' },
  { id: '2', nome: 'Bruno Silva', tipo: 'mensalista', foto: '🏃' },
  { id: '3', nome: 'Carlos Eduardo', tipo: 'mensalista', foto: '🧤' },
  { id: '4', nome: 'Lucas Rocha', tipo: 'mensalista', foto: '⚡' },
  { id: '5', nome: 'Rafael Costa', tipo: 'mensalista', foto: '🎯' },
  { id: '6', nome: 'Felipe Santos', tipo: 'mensalista', foto: '🔥' },
  { id: '7', nome: 'Mateus Diarista', tipo: 'diarista', foto: '👟' },
  { id: '8', nome: 'Rodrigo Diarista', tipo: 'diarista', foto: '👟' },
];

export default function App() {
  // Usuário atualmente logado
  const [usuarioLogado, setUsuarioLogado] = useState(JOGADORES_INICIAIS[0]);

  // Informações da Pelada
  const [peladaInfo] = useState({
    titulo: 'Pelada de Segunda',
    data: 'Próxima Segunda-feira',
    horario: '20:00 às 21:30',
    local: 'Arena Show de Bola - Quadra 2',
    vagasTotais: 14,
  });

  // Estado da Agenda (Aberta ou Fechada)
  const [agendaAberta, setAgendaAberta] = useState(true);

  // Lista de presenças e confirmações
  // Status possíveis para cada jogador: 'confirmado' | 'nao_vai' | 'fila' | 'pendente'
  const [presencas, setPresencas] = useState({
    '1': { status: 'pendente', horarioResposta: null },
    '2': { status: 'confirmado', horarioResposta: '18:15' },
    '3': { status: 'confirmado', horarioResposta: '18:30' },
    '4': { status: 'confirmado', horarioResposta: '18:45' },
    '5': { status: 'nao_vai', horarioResposta: '19:00' },
    '6': { status: 'pendente', horarioResposta: null },
    '7': { status: 'fila', horarioResposta: '18:05' },
    '8': { status: 'pendente', horarioResposta: null },
  });

  // Ações do jogador logado
  const responderPresenca = (novoStatus) => {
    if (!agendaAberta) {
      alertSimples('Agenda Fechada', 'A agenda para esta pelada ainda não está aberta.');
      return;
    }

    const agora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPresencas((prev) => ({
      ...prev,
      [usuarioLogado.id]: {
        status: novoStatus,
        horarioResposta: agora,
      },
    }));

    if (novoStatus === 'confirmado') {
      alertSimples('Presença Confirmada! ⚽', 'Sua vaga está garantida na pelada de segunda!');
    } else if (novoStatus === 'nao_vai') {
      alertSimples('Que pena! ❌', 'Sua vaga foi liberada para a fila de espera dos diaristas.');
    } else if (novoStatus === 'fila') {
      alertSimples('Nome na Fila! ⏳', 'Você entrou na fila de espera. Assim que abrir vaga, você será chamado!');
    } else if (novoStatus === 'pendente') {
      alertSimples('Cancelado', 'Sua resposta foi redefinida.');
    }
  };

  const alertSimples = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  // Separação dos jogadores por grupos
  const confirmados = JOGADORES_INICIAIS.filter(
    (j) => presencas[j.id]?.status === 'confirmado'
  );

  const filaEspera = JOGADORES_INICIAIS.filter(
    (j) => presencas[j.id]?.status === 'fila'
  );

  const naoVao = JOGADORES_INICIAIS.filter(
    (j) => presencas[j.id]?.status === 'nao_vai'
  );

  const statusAtualUsuario = presencas[usuarioLogado.id]?.status || 'pendente';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#134e2b" />
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <Text style={styles.headerBadge}>⚽ PELADA DE SEGUNDA</Text>
          <Text style={styles.headerTitle}>{peladaInfo.data}</Text>
          <Text style={styles.headerSubtitle}>
            🕒 {peladaInfo.horario} • 📍 {peladaInfo.local}
          </Text>

          {/* STATUS DA AGENDA */}
          <View style={styles.agendaStatusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: agendaAberta ? '#22c55e' : '#ef4444' },
              ]}
            />
            <Text style={styles.agendaStatusText}>
              {agendaAberta ? 'Agenda Aberta para Respostas' : 'Agenda Fechada'}
            </Text>
            <TouchableOpacity
              onPress={() => setAgendaAberta(!agendaAberta)}
              style={styles.toggleAgendaButton}
            >
              <Text style={styles.toggleAgendaText}>
                {agendaAberta ? 'Fechar' : 'Abrir'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SELETOR RÁPIDO DE USUÁRIO (Simula quem está logado) */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>👤 JOGADOR LOGADO:</Text>
          <View style={styles.userProfile}>
            <Text style={styles.userAvatar}>{usuarioLogado.foto}</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{usuarioLogado.nome}</Text>
              <View
                style={[
                  styles.tipoBadge,
                  usuarioLogado.tipo === 'mensalista'
                    ? styles.badgeMensalista
                    : styles.badgeDiarista,
                ]}
              >
                <Text style={styles.tipoBadgeText}>
                  {usuarioLogado.tipo === 'mensalista' ? '⭐ Mensalista' : '⏳ Diarista'}
                </Text>
              </View>
            </View>
          </View>

          {/* Troca rápida de jogador para demonstração */}
          <Text style={styles.switchLabel}>Simular login como outro jogador:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userScroll}>
            {JOGADORES_INICIAIS.map((jogador) => (
              <TouchableOpacity
                key={jogador.id}
                onPress={() => setUsuarioLogado(jogador)}
                style={[
                  styles.switchButton,
                  usuarioLogado.id === jogador.id && styles.switchButtonActive,
                ]}
              >
                <Text style={styles.switchButtonText}>
                  {jogador.foto} {jogador.nome.split(' ')[0]} ({jogador.tipo === 'mensalista' ? 'M' : 'D'})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* TELA DE CONFIRMAÇÃO DO USUÁRIO LOGADO */}
        <View style={[styles.card, styles.actionCard]}>
          <Text style={styles.cardTitle}>
            {usuarioLogado.tipo === 'mensalista'
              ? '🎯 Você vai na próxima pelada?'
              : '⏳ Fila de Espera dos Diaristas'}
          </Text>

          {!agendaAberta ? (
            <View style={styles.avisoAgendaFechada}>
              <Text style={styles.avisoTexto}>
                🔒 A agenda está fechada no momento. Aguarde o organizador abrir as confirmações.
              </Text>
            </View>
          ) : (
            <>
              {/* Opções para Mensalista */}
              {usuarioLogado.tipo === 'mensalista' && (
                <View style={styles.botoesContainer}>
                  <TouchableOpacity
                    onPress={() => responderPresenca('confirmado')}
                    style={[
                      styles.botaoPrincipal,
                      styles.botaoConfirmar,
                      statusAtualUsuario === 'confirmado' && styles.botaoSelecionado,
                    ]}
                  >
                    <Text style={styles.botaoTexto}>
                      {statusAtualUsuario === 'confirmado' ? '✅ VOCÊ CONFIRMOU' : '⚽ VOU JOGAR!'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => responderPresenca('nao_vai')}
                    style={[
                      styles.botaoPrincipal,
                      styles.botaoRecusar,
                      statusAtualUsuario === 'nao_vai' && styles.botaoSelecionado,
                    ]}
                  >
                    <Text style={styles.botaoTexto}>
                      {statusAtualUsuario === 'nao_vai' ? '❌ VOCÊ AVISOU QUE NÃO VAI' : '🚫 NÃO VOU'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Opções para Diarista */}
              {usuarioLogado.tipo === 'diarista' && (
                <View style={styles.botoesContainer}>
                  {statusAtualUsuario !== 'fila' ? (
                    <TouchableOpacity
                      onPress={() => responderPresenca('fila')}
                      style={[styles.botaoPrincipal, styles.botaoFila]}
                    >
                      <Text style={styles.botaoTexto}>✋ COLOCAR NOME NA FILA</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => responderPresenca('pendente')}
                      style={[styles.botaoPrincipal, styles.botaoRecusar]}
                    >
                      <Text style={styles.botaoTexto}>❌ SAIR DA FILA DE ESPERA</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}
        </View>

        {/* LISTA DE CONFIRMADOS */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>
              📋 Confirmados ({confirmados.length}/{peladaInfo.vagasTotais})
            </Text>
            <Text style={styles.vagasRestantes}>
              {peladaInfo.vagasTotais - confirmados.length} vagas restantes
            </Text>
          </View>

          {confirmados.length === 0 ? (
            <Text style={styles.listaVazia}>Nenhum jogador confirmado ainda.</Text>
          ) : (
            confirmados.map((jogador, index) => (
              <View key={jogador.id} style={styles.playerItem}>
                <Text style={styles.playerNumber}>{index + 1}.</Text>
                <Text style={styles.playerAvatarSmall}>{jogador.foto}</Text>
                <Text style={styles.playerName}>{jogador.nome}</Text>
                <View style={styles.tagMensalista}>
                  <Text style={styles.tagText}>
                    {jogador.tipo === 'mensalista' ? 'MENSALISTA' : 'DIARISTA'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* FILA DE ESPERA (DIARISTAS) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            ⏳ Fila de Espera (Diaristas) - {filaEspera.length}
          </Text>
          <Text style={styles.cardDica}>
            Ordem de prioridade para assumir vagas liberadas por mensalistas:
          </Text>

          {filaEspera.length === 0 ? (
            <Text style={styles.listaVazia}>Nenhum diarista na fila até o momento.</Text>
          ) : (
            filaEspera.map((jogador, index) => (
              <View key={jogador.id} style={styles.playerItem}>
                <View style={styles.posicaoFila}>
                  <Text style={styles.posicaoFilaText}>#{index + 1}</Text>
                </View>
                <Text style={styles.playerAvatarSmall}>{jogador.foto}</Text>
                <Text style={styles.playerName}>{jogador.nome}</Text>
                <Text style={styles.horarioFila}>
                  Entrou às {presencas[jogador.id]?.horarioResposta || '--:--'}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* AUSÊNCIAS (NÃO VÃO) */}
        {naoVao.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>❌ Desfalques Confirmados ({naoVao.length})</Text>
            {naoVao.map((jogador) => (
              <View key={jogador.id} style={styles.playerItem}>
                <Text style={styles.playerAvatarSmall}>{jogador.foto}</Text>
                <Text style={[styles.playerName, styles.playerDesfalque]}>{jogador.nome}</Text>
                <Text style={styles.tagLiberou}>Liberou vaga</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a2315',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#134e2b',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  headerBadge: {
    color: '#86efac',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  headerSubtitle: {
    color: '#dcfce7',
    fontSize: 13,
    marginBottom: 14,
  },
  agendaStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  agendaStatusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 10,
  },
  toggleAgendaButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  toggleAgendaText: {
    color: '#134e2b',
    fontSize: 11,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  cardDica: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    marginTop: 2,
  },
  vagasRestantes: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
  },
  tipoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  badgeMensalista: {
    backgroundColor: '#fef3c7',
  },
  badgeDiarista: {
    backgroundColor: '#e0f2fe',
  },
  tipoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
  },
  switchLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 6,
  },
  userScroll: {
    marginTop: 4,
  },
  switchButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  switchButtonActive: {
    backgroundColor: '#134e2b',
  },
  switchButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  actionCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
  },
  botoesContainer: {
    marginTop: 12,
    gap: 10,
  },
  botaoPrincipal: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoConfirmar: {
    backgroundColor: '#16a34a',
  },
  botaoRecusar: {
    backgroundColor: '#dc2626',
  },
  botaoFila: {
    backgroundColor: '#2563eb',
  },
  botaoSelecionado: {
    borderWidth: 3,
    borderColor: '#facc15',
  },
  botaoTexto: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  avisoAgendaFechada: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  avisoTexto: {
    color: '#991b1b',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  playerNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9ca3af',
    width: 24,
  },
  posicaoFila: {
    backgroundColor: '#dbeafe',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  posicaoFilaText: {
    color: '#1d4ed8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  playerAvatarSmall: {
    fontSize: 18,
    marginRight: 10,
  },
  playerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  playerDesfalque: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  tagMensalista: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '700',
  },
  tagLiberou: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600',
  },
  horarioFila: {
    fontSize: 11,
    color: '#6b7280',
  },
  listaVazia: {
    color: '#9ca3af',
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
});

