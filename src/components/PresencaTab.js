import React, { useState } from 'react';
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
  onEnviarParaSorteio,
}) {
  const [usuarioLogado, setUsuarioLogado] = useState(players[0] || {});
  const [agendaAberta, setAgendaAberta] = useState(true);

  // Status possíveis: 'confirmado' | 'nao_vai' | 'fila' | 'pendente'
  const [presencas, setPresencas] = useState({
    p_1: { status: 'confirmado', horario: '18:00' },
    p_2: { status: 'confirmado', horario: '18:15' },
    p_3: { status: 'confirmado', horario: '18:20' },
    p_4: { status: 'confirmado', horario: '18:30' },
    p_5: { status: 'confirmado', horario: '18:35' },
    p_6: { status: 'confirmado', horario: '18:40' },
    p_7: { status: 'confirmado', horario: '18:45' },
    p_8: { status: 'confirmado', horario: '18:50' },
    p_9: { status: 'confirmado', horario: '18:55' },
    p_10: { status: 'confirmado', horario: '19:00' },
    p_11: { status: 'confirmado', horario: '19:05' },
    p_12: { status: 'confirmado', horario: '19:10' },
    p_13: { status: 'confirmado', horario: '19:15' },
    p_14: { status: 'confirmado', horario: '19:20' },
    p_15: { status: 'confirmado', horario: '19:25' },
  });

  const alertSimples = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

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
        horario: agora,
      },
    }));

    if (novoStatus === 'confirmado') {
      alertSimples('Presença Confirmada! ⚽', 'Sua vaga está garantida na pelada de segunda!');
    } else if (novoStatus === 'nao_vai') {
      alertSimples('Vaga Liberada ❌', 'Sua vaga foi liberada para a fila de espera.');
    } else if (novoStatus === 'fila') {
      alertSimples('Nome na Fila ⏳', 'Você entrou na fila de espera dos diaristas!');
    }
  };

  const confirmados = players.filter((p) => presencas[p.id]?.status === 'confirmado');
  const filaEspera = players.filter((p) => presencas[p.id]?.status === 'fila');
  const naoVao = players.filter((p) => presencas[p.id]?.status === 'nao_vai');

  const statusAtual = presencas[usuarioLogado.id]?.status || 'pendente';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* STATUS DA AGENDA */}
      <View style={styles.cardHeaderAgenda}>
        <View style={{ flex: 1 }}>
          <Text style={styles.agendaTitulo}>Próxima Segunda-feira</Text>
          <Text style={styles.agendaSub}>🕒 20:00 às 21:30 • 📍 Arena Show de Bola</Text>
        </View>

        <TouchableOpacity
          onPress={() => setAgendaAberta(!agendaAberta)}
          style={[styles.btnToggleAgenda, agendaAberta ? styles.btnAgendaAberta : styles.btnAgendaFechada]}
        >
          <Text style={styles.btnToggleAgendaTxt}>
            {agendaAberta ? '🟢 Aberta' : '🔴 Fechada'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* USUÁRIO ATIVO & AÇÕES */}
      <View style={styles.cardUsuario}>
        <Text style={styles.cardSecaoRotulo}>👤 JOGADOR SIMULADO:</Text>
        <View style={styles.usuarioLinha}>
          <Text style={styles.usuarioAvatar}>{usuarioLogado.avatar || '⚽'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.usuarioNome}>{usuarioLogado.nome}</Text>
            <Text style={styles.usuarioTipo}>{usuarioLogado.status} • Ovr: {usuarioLogado.overall}</Text>
          </View>
        </View>

        {/* SELETOR DE JOGADOR */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollTrocaUser}>
          {players.slice(0, 15).map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.btnTrocaUser, usuarioLogado.id === p.id && styles.btnTrocaUserAtivo]}
              onPress={() => setUsuarioLogado(p)}
            >
              <Text style={[styles.btnTrocaUserTxt, usuarioLogado.id === p.id && styles.btnTrocaUserTxtAtivo]}>
                {p.nome.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* BOTÕES DE CONFIRMAÇÃO */}
        <View style={styles.botoesAcaoRow}>
          <TouchableOpacity
            style={[styles.btnAcao, styles.btnConfirmar, statusAtual === 'confirmado' && styles.btnSelecionadoBorda]}
            onPress={() => responderPresenca('confirmado')}
          >
            <Text style={styles.btnAcaoTxt}>
              {statusAtual === 'confirmado' ? '✅ CONFIRMADO' : '⚽ VOU JOGAR'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnAcao, styles.btnRecusar, statusAtual === 'nao_vai' && styles.btnSelecionadoBorda]}
            onPress={() => responderPresenca('nao_vai')}
          >
            <Text style={styles.btnAcaoTxt}>
              {statusAtual === 'nao_vai' ? '❌ DESFALQUE' : '🚫 NÃO VOU'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnAcao, styles.btnFila, statusAtual === 'fila' && styles.btnSelecionadoBorda]}
            onPress={() => responderPresenca('fila')}
          >
            <Text style={styles.btnAcaoTxt}>
              {statusAtual === 'fila' ? '⏳ NA FILA' : '✋ FILA'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONFIRMADOS (15 VAGAS) */}
      <View style={styles.cardLista}>
        <View style={styles.cardListaHeader}>
          <View>
            <Text style={styles.listaTitulo}>📋 Confirmados ({confirmados.length}/15)</Text>
            <Text style={styles.listaSub}>15 jogadores necessários para os 3 times de 5</Text>
          </View>
          {confirmados.length >= 9 && onEnviarParaSorteio && (
            <TouchableOpacity
              style={styles.btnSortearDireto}
              onPress={() => onEnviarParaSorteio(confirmados)}
            >
              <Text style={styles.btnSortearDiretoTxt}>⚡ Ir para Divisão</Text>
            </TouchableOpacity>
          )}
        </View>

        {confirmados.map((p, idx) => (
          <View key={p.id} style={styles.itemJogadorLista}>
            <Text style={styles.itemIndex}>{idx + 1}.</Text>
            <Text style={styles.itemAvatar}>{p.avatar}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemNome}>{p.nome}</Text>
              <Text style={styles.itemInfoSub}>{p.status} • {p.posicao}</Text>
            </View>
            <View style={styles.badgeConfirmado}>
              <Text style={styles.badgeConfirmadoTxt}>Confirmado</Text>
            </View>
          </View>
        ))}
      </View>

      {/* FILA DE ESPERA */}
      {filaEspera.length > 0 && (
        <View style={styles.cardLista}>
          <Text style={styles.listaTitulo}>⏳ Fila de Espera ({filaEspera.length})</Text>
          {filaEspera.map((p, idx) => (
            <View key={p.id} style={styles.itemJogadorLista}>
              <Text style={styles.itemIndex}>#{idx + 1}</Text>
              <Text style={styles.itemAvatar}>{p.avatar}</Text>
              <Text style={styles.itemNome}>{p.nome}</Text>
            </View>
          ))}
        </View>
      )}

      {/* DESFALQUES */}
      {naoVao.length > 0 && (
        <View style={styles.cardLista}>
          <Text style={styles.listaTitulo}>❌ Desfalques ({naoVao.length})</Text>
          {naoVao.map((p) => (
            <View key={p.id} style={styles.itemJogadorLista}>
              <Text style={styles.itemAvatar}>{p.avatar}</Text>
              <Text style={[styles.itemNome, { textDecorationLine: 'line-through', color: '#94a3b8' }]}>
                {p.nome}
              </Text>
            </View>
          ))}
        </View>
      )}
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
  cardHeaderAgenda: {
    backgroundColor: '#134e2b',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  agendaTitulo: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  agendaSub: {
    color: '#dcfce7',
    fontSize: 12,
    marginTop: 2,
  },
  btnToggleAgenda: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  btnAgendaAberta: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
  },
  btnAgendaFechada: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  btnToggleAgendaTxt: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  cardUsuario: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  cardSecaoRotulo: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 8,
  },
  usuarioLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  usuarioAvatar: {
    fontSize: 32,
    marginRight: 10,
  },
  usuarioNome: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  usuarioTipo: {
    fontSize: 12,
    color: '#64748b',
  },
  scrollTrocaUser: {
    marginBottom: 14,
  },
  btnTrocaUser: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  btnTrocaUserAtivo: {
    backgroundColor: '#134e2b',
  },
  btnTrocaUserTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  btnTrocaUserTxtAtivo: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  botoesAcaoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAcao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnConfirmar: {
    backgroundColor: '#16a34a',
  },
  btnRecusar: {
    backgroundColor: '#dc2626',
  },
  btnFila: {
    backgroundColor: '#2563eb',
  },
  btnSelecionadoBorda: {
    borderWidth: 2,
    borderColor: '#facc15',
  },
  btnAcaoTxt: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 11,
  },
  cardLista: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  cardListaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listaTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  listaSub: {
    fontSize: 11,
    color: '#64748b',
  },
  btnSortearDireto: {
    backgroundColor: '#134e2b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnSortearDiretoTxt: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  itemJogadorLista: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemIndex: {
    width: 24,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  itemAvatar: {
    fontSize: 18,
    marginRight: 8,
  },
  itemNome: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  itemInfoSub: {
    fontSize: 11,
    color: '#64748b',
  },
  badgeConfirmado: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeConfirmadoTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
});

