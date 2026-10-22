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
import { MESES } from '../data/initialData';

export default function FinanceiroTab({
  config,
  onUpdateConfig,
  players,
  pagamentos,
  onUpdatePagamentos,
  entradas,
  onUpdateEntradas,
  saidas,
  onUpdateSaidas,
  categoriasEntrada,
  onUpdateCategoriasEntrada,
  categoriasSaida,
  onUpdateCategoriasSaida,
}) {
  // Sub-abas: 'mensalidades' | 'entradas' | 'saidas' | 'config'
  const [secaoAtiva, setSecaoAtiva] = useState('mensalidades');
  
  // Mês selecionado para a aba de mensalidades (padrão: Outubro ou mês atual)
  const [mesSelecionado, setMesSelecionado] = useState('Outubro');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos' | 'pagos' | 'pendentes'

  // Modais
  const [modalNovaEntrada, setModalNovaEntrada] = useState(false);
  const [modalNovaSaida, setModalNovaSaida] = useState(false);
  const [modalEditarPagamento, setModalEditarPagamento] = useState(null); // { player, mes, valorAtual }
  const [modalConfig, setModalConfig] = useState(false);

  // Estados dos formulários de entrada/saída
  const [formDescricao, setFormDescricao] = useState('');
  const [formValor, setFormValor] = useState('');
  const [formCategoria, setFormCategoria] = useState('');
  const [formData, setFormData] = useState('');
  const [itemEmEdicaoId, setItemEmEdicaoId] = useState(null);

  // Estados de edição de configuração
  const [tempValorMensalidade, setTempValorMensalidade] = useState(String(config.valorMensalidade || 75));
  const [tempDiaVencimento, setTempDiaVencimento] = useState(String(config.diaVencimentoMensalidade || 10));
  const [novaCatEntrada, setNovaCatEntrada] = useState('');
  const [novaCatSaida, setNovaCatSaida] = useState('');

  // Jogadores que pagam mensalidade (Mensalistas ou Mensalista Ausente / Temporário)
  const jogadoresMensalistas = useMemo(() => {
    return players.filter(p => p.status.includes('Mensalista'));
  }, [players]);

  // Cálculos Gerais do Caixa
  const totaisCalculados = useMemo(() => {
    // 1. Soma de todas as mensalidades pagas de todos os meses
    let totalMensalidadesGeral = 0;
    let totalMensalidadesMes = 0;
    let totalPagoMesQtd = 0;
    let totalPendenteMesQtd = 0;

    jogadoresMensalistas.forEach(p => {
      const pPagamentos = pagamentos[p.id] || {};
      
      // Soma geral de todos os meses
      MESES.forEach(m => {
        const val = pPagamentos[m];
        if (typeof val === 'number' && val > 0) {
          totalMensalidadesGeral += val;
        }
      });

      // Dados do mês selecionado
      const valMes = pPagamentos[mesSelecionado];
      if (typeof valMes === 'number' && valMes > 0) {
        totalMensalidadesMes += valMes;
        totalPagoMesQtd++;
      } else {
        totalPendenteMesQtd++;
      }
    });

    // 2. Soma de Entradas avulsas
    const totalEntradasAvulsas = entradas.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

    // 3. Soma de Saídas / Gastos
    const totalSaidasGeral = saidas.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

    // 4. Total em conta (Saldo)
    const saldoTotal = (totalMensalidadesGeral + totalEntradasAvulsas) - totalSaidasGeral;

    return {
      totalMensalidadesGeral,
      totalEntradasAvulsas,
      totalEntradasCompleto: totalMensalidadesGeral + totalEntradasAvulsas,
      totalSaidasGeral,
      saldoTotal,
      totalMensalidadesMes,
      totalPagoMesQtd,
      totalPendenteMesQtd,
    };
  }, [jogadoresMensalistas, pagamentos, entradas, saidas, mesSelecionado]);

  const alertSimples = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  // Alternar pagamento rápido (se pago -> remove, se pendente -> define valor padrão da config)
  const togglePagamentoRapido = (playerId) => {
    const pPagamentos = { ...(pagamentos[playerId] || {}) };
    const valorAtual = pPagamentos[mesSelecionado];

    if (valorAtual && valorAtual > 0) {
      // Desmarcar
      pPagamentos[mesSelecionado] = 0;
    } else {
      // Marcar com valor configurado
      pPagamentos[mesSelecionado] = Number(config.valorMensalidade) || 75.0;
    }

    const novosPagamentos = {
      ...pagamentos,
      [playerId]: pPagamentos,
    };
    onUpdatePagamentos(novosPagamentos);
  };

  // Salvar valor personalizado do pagamento
  const salvarPagamentoPersonalizado = (valorNum) => {
    if (!modalEditarPagamento) return;
    const { player, mes } = modalEditarPagamento;
    const pPagamentos = { ...(pagamentos[player.id] || {}) };
    pPagamentos[mes] = valorNum;

    onUpdatePagamentos({
      ...pagamentos,
      [player.id]: pPagamentos,
    });
    setModalEditarPagamento(null);
  };

  // Abrir modal de nova entrada ou edição
  const abrirModalEntrada = (item = null) => {
    if (item) {
      setItemEmEdicaoId(item.id);
      setFormDescricao(item.descricao);
      setFormValor(String(item.valor));
      setFormCategoria(item.categoria || categoriasEntrada[0]);
      setFormData(item.data || '');
    } else {
      setItemEmEdicaoId(null);
      setFormDescricao('');
      setFormValor('');
      setFormCategoria(categoriasEntrada[0] || 'Diarista');
      setFormData(new Date().toLocaleDateString('pt-BR'));
    }
    setModalNovaEntrada(true);
  };

  const salvarEntrada = () => {
    if (!formDescricao.trim() || !formValor) {
      alertSimples('Campos Obrigatórios', 'Preencha a descrição e o valor da entrada.');
      return;
    }
    const valorNum = parseFloat(formValor.replace(',', '.'));
    if (isNaN(valorNum) || valorNum < 0) {
      alertSimples('Valor Inválido', 'Insira um número válido para o valor.');
      return;
    }

    let novasEntradas = [...entradas];
    if (itemEmEdicaoId) {
      novasEntradas = novasEntradas.map(e =>
        e.id === itemEmEdicaoId
          ? { ...e, descricao: formDescricao, valor: valorNum, categoria: formCategoria, data: formData }
          : e
      );
    } else {
      novasEntradas.unshift({
        id: `ent_${Date.now()}`,
        descricao: formDescricao,
        valor: valorNum,
        categoria: formCategoria,
        data: formData || new Date().toLocaleDateString('pt-BR'),
      });
    }

    onUpdateEntradas(novasEntradas);
    setModalNovaEntrada(false);
  };

  const excluirEntrada = (id) => {
    const novas = entradas.filter(e => e.id !== id);
    onUpdateEntradas(novas);
  };

  // Abrir modal de nova saída ou edição
  const abrirModalSaida = (item = null) => {
    if (item) {
      setItemEmEdicaoId(item.id);
      setFormDescricao(item.descricao);
      setFormValor(String(item.valor));
      setFormCategoria(item.categoria || categoriasSaida[0]);
      setFormData(item.data || '');
    } else {
      setItemEmEdicaoId(null);
      setFormDescricao('');
      setFormValor('');
      setFormCategoria(categoriasSaida[0] || 'Quadra');
      setFormData(new Date().toLocaleDateString('pt-BR'));
    }
    setModalNovaSaida(true);
  };

  const salvarSaida = () => {
    if (!formDescricao.trim() || !formValor) {
      alertSimples('Campos Obrigatórios', 'Preencha a descrição e o valor da saída.');
      return;
    }
    const valorNum = parseFloat(formValor.replace(',', '.'));
    if (isNaN(valorNum) || valorNum < 0) {
      alertSimples('Valor Inválido', 'Insira um número válido para o valor.');
      return;
    }

    let novasSaidas = [...saidas];
    if (itemEmEdicaoId) {
      novasSaidas = novasSaidas.map(s =>
        s.id === itemEmEdicaoId
          ? { ...s, descricao: formDescricao, valor: valorNum, categoria: formCategoria, data: formData }
          : s
      );
    } else {
      novasSaidas.unshift({
        id: `sai_${Date.now()}`,
        descricao: formDescricao,
        valor: valorNum,
        categoria: formCategoria,
        data: formData || new Date().toLocaleDateString('pt-BR'),
      });
    }

    onUpdateSaidas(novasSaidas);
    setModalNovaSaida(false);
  };

  const excluirSaida = (id) => {
    const novas = saidas.filter(s => s.id !== id);
    onUpdateSaidas(novas);
  };

  // Salvar configurações
  const salvarConfiguracoes = () => {
    const vMensalidade = parseFloat(tempValorMensalidade.replace(',', '.'));
    const dVencimento = parseInt(tempDiaVencimento, 10);

    onUpdateConfig({
      ...config,
      valorMensalidade: isNaN(vMensalidade) ? 75.0 : vMensalidade,
      diaVencimentoMensalidade: isNaN(dVencimento) ? 10 : dVencimento,
    });
    setModalConfig(false);
    alertSimples('Configurações Salvas', 'Valores atualizados com sucesso!');
  };

  // Adicionar categoria
  const adicionarCatEntrada = () => {
    if (!novaCatEntrada.trim()) return;
    if (!categoriasEntrada.includes(novaCatEntrada.trim())) {
      onUpdateCategoriasEntrada([...categoriasEntrada, novaCatEntrada.trim()]);
    }
    setNovaCatEntrada('');
  };

  const adicionarCatSaida = () => {
    if (!novaCatSaida.trim()) return;
    if (!categoriasSaida.includes(novaCatSaida.trim())) {
      onUpdateCategoriasSaida([...categoriasSaida, novaCatSaida.trim()]);
    }
    setNovaCatSaida('');
  };

  // Jogadores filtrados para exibição no mês selecionado
  const mensalistasExibicao = useMemo(() => {
    return jogadoresMensalistas.filter(p => {
      const val = (pagamentos[p.id] || {})[mesSelecionado];
      const pago = typeof val === 'number' && val > 0;
      if (filtroStatus === 'pagos') return pago;
      if (filtroStatus === 'pendentes') return !pago;
      return true;
    });
  }, [jogadoresMensalistas, pagamentos, mesSelecionado, filtroStatus]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* CARD PRINCIPAL DO CAIXA / SALDO */}
      <View style={styles.cardResumoGeral}>
        <View style={styles.resumoTopo}>
          <Text style={styles.resumoTitulo}>💰 SALDO TOTAL EM CONTA</Text>
          <TouchableOpacity onPress={() => setModalConfig(true)} style={styles.btnConfigIcon}>
            <Text style={styles.btnConfigIconText}>⚙️ Ajustes</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.saldoValor, { color: totaisCalculados.saldoTotal >= 0 ? '#4ade80' : '#f87171' }]}>
          R$ {totaisCalculados.saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>

        <View style={styles.resumoMetricasLinha}>
          <View style={styles.metricaBox}>
            <Text style={styles.metricaLabel}>Total Entradas</Text>
            <Text style={styles.metricaValorVerde}>
              + R$ {totaisCalculados.totalEntradasCompleto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.metricaDivisor} />
          <View style={styles.metricaBox}>
            <Text style={styles.metricaLabel}>Total Saídas</Text>
            <Text style={styles.metricaValorVermelho}>
              - R$ {totaisCalculados.totalSaidasGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>

      {/* SELETOR DE SEÇÃO (SUB-ABAS) */}
      <View style={styles.subAbasContainer}>
        <TouchableOpacity
          style={[styles.subAbaBotao, secaoAtiva === 'mensalidades' && styles.subAbaAtiva]}
          onPress={() => setSecaoAtiva('mensalidades')}
        >
          <Text style={[styles.subAbaTexto, secaoAtiva === 'mensalidades' && styles.subAbaTextoAtiva]}>
            🗓️ Mensalidades
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subAbaBotao, secaoAtiva === 'entradas' && styles.subAbaAtiva]}
          onPress={() => setSecaoAtiva('entradas')}
        >
          <Text style={[styles.subAbaTexto, secaoAtiva === 'entradas' && styles.subAbaTextoAtiva]}>
            📥 Entradas ({entradas.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subAbaBotao, secaoAtiva === 'saidas' && styles.subAbaAtiva]}
          onPress={() => setSecaoAtiva('saidas')}
        >
          <Text style={[styles.subAbaTexto, secaoAtiva === 'saidas' && styles.subAbaTextoAtiva]}>
            📤 Saídas ({saidas.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* SEÇÃO 1: MENSALIDADES */}
      {secaoAtiva === 'mensalidades' && (
        <View>
          {/* SELETOR HORIZONTAL DE MESES */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollMeses}>
            {MESES.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.mesChip, mesSelecionado === m && styles.mesChipAtivo]}
                onPress={() => setMesSelecionado(m)}
              >
                <Text style={[styles.mesChipTexto, mesSelecionado === m && styles.mesChipTextoAtivo]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* PAINEL DE CONTROLE DO MÊS */}
          <View style={styles.cardMesInfo}>
            <View style={styles.cardMesHeader}>
              <View>
                <Text style={styles.cardMesTitulo}>Mensalidades de {mesSelecionado}</Text>
                <Text style={styles.cardMesSub}>
                  Vencimento dia {config.diaVencimentoMensalidade || 10} • Valor padrão: R$ {Number(config.valorMensalidade).toFixed(2)}
                </Text>
              </View>
              <View style={styles.badgeArrecadado}>
                <Text style={styles.badgeArrecadadoLabel}>Arrecadado:</Text>
                <Text style={styles.badgeArrecadadoValor}>
                  R$ {totaisCalculados.totalMensalidadesMes.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* BARRA DE PROGRESSO DE QUEM PAGOU */}
            <View style={styles.progressoContainer}>
              <View
                style={[
                  styles.progressoBarra,
                  {
                    width: `${
                      jogadoresMensalistas.length > 0
                        ? (totaisCalculados.totalPagoMesQtd / jogadoresMensalistas.length) * 100
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>

            <View style={styles.progressoTextos}>
              <Text style={styles.progressoTxtVerde}>
                ✅ {totaisCalculados.totalPagoMesQtd} pagaram
              </Text>
              <Text style={styles.progressoTxtVermelho}>
                ❌ {totaisCalculados.totalPendenteMesQtd} pendentes
              </Text>
            </View>

            {/* FILTROS: TODOS / PAGOS / PENDENTES */}
            <View style={styles.filtrosLinha}>
              <TouchableOpacity
                style={[styles.filtroBtn, filtroStatus === 'todos' && styles.filtroBtnAtivo]}
                onPress={() => setFiltroStatus('todos')}
              >
                <Text style={[styles.filtroBtnTxt, filtroStatus === 'todos' && styles.filtroBtnTxtAtivo]}>
                  Todos ({jogadoresMensalistas.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filtroBtn, filtroStatus === 'pagos' && styles.filtroBtnAtivo]}
                onPress={() => setFiltroStatus('pagos')}
              >
                <Text style={[styles.filtroBtnTxt, filtroStatus === 'pagos' && styles.filtroBtnTxtAtivo]}>
                  Pagos ({totaisCalculados.totalPagoMesQtd})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filtroBtn, filtroStatus === 'pendentes' && styles.filtroBtnAtivo]}
                onPress={() => setFiltroStatus('pendentes')}
              >
                <Text style={[styles.filtroBtnTxt, filtroStatus === 'pendentes' && styles.filtroBtnTxtAtivo]}>
                  Pendentes ({totaisCalculados.totalPendenteMesQtd})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* LISTA DE JOGADORES MENSALISTAS */}
          <View style={styles.listaJogadoresCaixa}>
            {mensalistasExibicao.map((p) => {
              const valorPago = (pagamentos[p.id] || {})[mesSelecionado];
              const estaPago = typeof valorPago === 'number' && valorPago > 0;

              return (
                <View key={p.id} style={styles.itemMensalista}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemAvatar}>{p.avatar || '⚽'}</Text>
                    <View>
                      <Text style={styles.itemNome}>{p.nome}</Text>
                      <Text style={styles.itemStatus}>
                        {p.status} {estaPago ? `• R$ ${valorPago.toFixed(2)}` : '• Pendente'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemAcoes}>
                    <TouchableOpacity
                      onPress={() => togglePagamentoRapido(p.id)}
                      style={[styles.btnStatusPagamento, estaPago ? styles.btnPago : styles.btnPendente]}
                    >
                      <Text style={styles.btnStatusTexto}>
                        {estaPago ? '✅ PAGO' : '❌ PENDENTE'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        setModalEditarPagamento({
                          player: p,
                          mes: mesSelecionado,
                          valorAtual: String(valorPago || config.valorMensalidade || 75),
                        })
                      }
                      style={styles.btnEditarValor}
                    >
                      <Text style={styles.btnEditarValorTexto}>✏️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* SEÇÃO 2: ENTRADAS AVULSAS */}
      {secaoAtiva === 'entradas' && (
        <View>
          <View style={styles.secaoHeaderRow}>
            <View>
              <Text style={styles.secaoTitulo}>Entradas Avulsas & Diaristas</Text>
              <Text style={styles.secaoSub}>Total: R$ {totaisCalculados.totalEntradasAvulsas.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.btnAdicionar} onPress={() => abrirModalEntrada()}>
              <Text style={styles.btnAdicionarTexto}>+ Nova Entrada</Text>
            </TouchableOpacity>
          </View>

          {entradas.map((item) => (
            <View key={item.id} style={styles.itemTransacao}>
              <View style={styles.transacaoInfo}>
                <View style={styles.transacaoBadgeEntrada}>
                  <Text style={styles.transacaoBadgeTxt}>{item.categoria || 'Entrada'}</Text>
                </View>
                <Text style={styles.transacaoDescricao}>{item.descricao}</Text>
                {item.data ? <Text style={styles.transacaoData}>📅 {item.data}</Text> : null}
              </View>

              <View style={styles.transacaoValorRow}>
                <Text style={styles.transacaoValorPositivo}>+ R$ {Number(item.valor).toFixed(2)}</Text>
                <View style={styles.transacaoBotoes}>
                  <TouchableOpacity onPress={() => abrirModalEntrada(item)} style={styles.btnIconMini}>
                    <Text>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => excluirEntrada(item.id)} style={styles.btnIconMini}>
                    <Text>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* SEÇÃO 3: SAÍDAS / GASTOS */}
      {secaoAtiva === 'saidas' && (
        <View>
          <View style={styles.secaoHeaderRow}>
            <View>
              <Text style={styles.secaoTitulo}>Gastos & Despesas</Text>
              <Text style={styles.secaoSub}>Total: R$ {totaisCalculados.totalSaidasGeral.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.btnAdicionarSaida} onPress={() => abrirModalSaida()}>
              <Text style={styles.btnAdicionarTexto}>+ Nova Saída</Text>
            </TouchableOpacity>
          </View>

          {saidas.map((item) => (
            <View key={item.id} style={styles.itemTransacao}>
              <View style={styles.transacaoInfo}>
                <View style={styles.transacaoBadgeSaida}>
                  <Text style={styles.transacaoBadgeTxt}>{item.categoria || 'Despesa'}</Text>
                </View>
                <Text style={styles.transacaoDescricao}>{item.descricao}</Text>
                {item.data ? <Text style={styles.transacaoData}>📅 {item.data}</Text> : null}
              </View>

              <View style={styles.transacaoValorRow}>
                <Text style={styles.transacaoValorNegativo}>- R$ {Number(item.valor).toFixed(2)}</Text>
                <View style={styles.transacaoBotoes}>
                  <TouchableOpacity onPress={() => abrirModalSaida(item)} style={styles.btnIconMini}>
                    <Text>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => excluirSaida(item.id)} style={styles.btnIconMini}>
                    <Text>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* MODAL 1: EDITAR VALOR DO PAGAMENTO DE MENSALIDADE */}
      <Modal visible={!!modalEditarPagamento} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Editar Pagamento</Text>
            <Text style={styles.modalSub}>
              {modalEditarPagamento?.player?.nome} • Mês: {modalEditarPagamento?.mes}
            </Text>

            <Text style={styles.labelInput}>Valor Pago (R$):</Text>
            <TextInput
              style={styles.inputModal}
              keyboardType="numeric"
              value={modalEditarPagamento?.valorAtual}
              onChangeText={(txt) =>
                setModalEditarPagamento((prev) => ({ ...prev, valorAtual: txt }))
              }
              placeholder="Ex: 75.00"
            />

            <View style={styles.modalBotoesLinha}>
              <TouchableOpacity
                style={styles.modalBtnCancelar}
                onPress={() => setModalEditarPagamento(null)}
              >
                <Text style={styles.modalBtnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnSalvar}
                onPress={() => {
                  const num = parseFloat((modalEditarPagamento?.valorAtual || '0').replace(',', '.'));
                  salvarPagamentoPersonalizado(isNaN(num) ? 0 : num);
                }}
              >
                <Text style={styles.modalBtnSalvarTexto}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: NOVA ENTRADA / EDITAR ENTRADA */}
      <Modal visible={modalNovaEntrada} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {itemEmEdicaoId ? 'Editar Entrada' : 'Nova Entrada de Dinheiro'}
            </Text>

            <Text style={styles.labelInput}>Descrição:</Text>
            <TextInput
              style={styles.inputModal}
              value={formDescricao}
              onChangeText={setFormDescricao}
              placeholder="Ex: Diaristas 24/10, Patrocínio, etc."
            />

            <Text style={styles.labelInput}>Valor (R$):</Text>
            <TextInput
              style={styles.inputModal}
              keyboardType="numeric"
              value={formValor}
              onChangeText={setFormValor}
              placeholder="Ex: 60.00"
            />

            <Text style={styles.labelInput}>Data:</Text>
            <TextInput
              style={styles.inputModal}
              value={formData}
              onChangeText={setFormData}
              placeholder="Ex: 24/10/2026"
            />

            <Text style={styles.labelInput}>Tipo / Categoria:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catChipsContainer}>
              {categoriasEntrada.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, formCategoria === cat && styles.catChipAtivo]}
                  onPress={() => setFormCategoria(cat)}
                >
                  <Text style={[styles.catChipTexto, formCategoria === cat && styles.catChipTextoAtivo]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalBotoesLinha}>
              <TouchableOpacity
                style={styles.modalBtnCancelar}
                onPress={() => setModalNovaEntrada(false)}
              >
                <Text style={styles.modalBtnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={salvarEntrada}>
                <Text style={styles.modalBtnSalvarTexto}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: NOVA SAÍDA / EDITAR SAÍDA */}
      <Modal visible={modalNovaSaida} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {itemEmEdicaoId ? 'Editar Saída' : 'Novo Gasto / Despesa'}
            </Text>

            <Text style={styles.labelInput}>Descrição:</Text>
            <TextInput
              style={styles.inputModal}
              value={formDescricao}
              onChangeText={setFormDescricao}
              placeholder="Ex: Quadra Novembro, 10L Chopp, etc."
            />

            <Text style={styles.labelInput}>Valor (R$):</Text>
            <TextInput
              style={styles.inputModal}
              keyboardType="numeric"
              value={formValor}
              onChangeText={setFormValor}
              placeholder="Ex: 920.00"
            />

            <Text style={styles.labelInput}>Data:</Text>
            <TextInput
              style={styles.inputModal}
              value={formData}
              onChangeText={setFormData}
              placeholder="Ex: 24/10/2026"
            />

            <Text style={styles.labelInput}>Tipo / Categoria:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catChipsContainer}>
              {categoriasSaida.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, formCategoria === cat && styles.catChipSaidaAtivo]}
                  onPress={() => setFormCategoria(cat)}
                >
                  <Text style={[styles.catChipTexto, formCategoria === cat && styles.catChipTextoAtivo]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalBotoesLinha}>
              <TouchableOpacity
                style={styles.modalBtnCancelar}
                onPress={() => setModalNovaSaida(false)}
              >
                <Text style={styles.modalBtnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSalvarVermelho} onPress={salvarSaida}>
                <Text style={styles.modalBtnSalvarTexto}>Salvar Gasto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: CONFIGURAÇÕES GERAIS EDITÁVEIS */}
      <Modal visible={modalConfig} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitulo}>⚙️ Configurações Financeiras</Text>
              <Text style={styles.modalSub}>
                Ajuste os valores padrão, dia do pagamento e tipos de lançamentos.
              </Text>

              <Text style={styles.labelInput}>Valor Padrão da Mensalidade (R$):</Text>
              <TextInput
                style={styles.inputModal}
                keyboardType="numeric"
                value={tempValorMensalidade}
                onChangeText={setTempValorMensalidade}
                placeholder="75.00"
              />

              <Text style={styles.labelInput}>Dia de Vencimento do Pagamento:</Text>
              <TextInput
                style={styles.inputModal}
                keyboardType="numeric"
                value={tempDiaVencimento}
                onChangeText={setTempDiaVencimento}
                placeholder="10"
              />

              <View style={styles.divisorLinha} />

              <Text style={styles.labelInput}>Tipos de Entrada de Dinheiro:</Text>
              <View style={styles.chipsWrap}>
                {categoriasEntrada.map((c) => (
                  <View key={c} style={styles.tagRemovivel}>
                    <Text style={styles.tagRemovivelTxt}>{c}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.addCatRow}>
                <TextInput
                  style={[styles.inputModal, { flex: 1, marginBottom: 0 }]}
                  placeholder="Novo tipo de entrada..."
                  value={novaCatEntrada}
                  onChangeText={setNovaCatEntrada}
                />
                <TouchableOpacity style={styles.btnAddCat} onPress={adicionarCatEntrada}>
                  <Text style={styles.btnAddCatTxt}>+ Add</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divisorLinha} />

              <Text style={styles.labelInput}>Tipos de Saída de Dinheiro:</Text>
              <View style={styles.chipsWrap}>
                {categoriasSaida.map((c) => (
                  <View key={c} style={styles.tagRemovivelSaida}>
                    <Text style={styles.tagRemovivelTxt}>{c}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.addCatRow}>
                <TextInput
                  style={[styles.inputModal, { flex: 1, marginBottom: 0 }]}
                  placeholder="Novo tipo de saída..."
                  value={novaCatSaida}
                  onChangeText={setNovaCatSaida}
                />
                <TouchableOpacity style={styles.btnAddCatSaida} onPress={adicionarCatSaida}>
                  <Text style={styles.btnAddCatTxt}>+ Add</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.modalBotoesLinha, { marginTop: 24 }]}>
                <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalConfig(false)}>
                  <Text style={styles.modalBtnCancelarTexto}>Fechar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnSalvar} onPress={salvarConfiguracoes}>
                  <Text style={styles.modalBtnSalvarTexto}>Salvar Tudo</Text>
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
  cardResumoGeral: {
    backgroundColor: '#064e3b',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#059669',
  },
  resumoTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumoTitulo: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  btnConfigIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  btnConfigIconText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  saldoValor: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  resumoMetricasLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  metricaBox: {
    flex: 1,
  },
  metricaLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  metricaValorVerde: {
    color: '#34d399',
    fontSize: 15,
    fontWeight: 'bold',
  },
  metricaValorVermelho: {
    color: '#f87171',
    fontSize: 15,
    fontWeight: 'bold',
  },
  metricaDivisor: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 12,
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
    backgroundColor: '#10b981',
  },
  subAbaTexto: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  subAbaTextoAtiva: {
    color: '#ffffff',
  },
  scrollMeses: {
    marginBottom: 14,
  },
  mesChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mesChipAtivo: {
    backgroundColor: '#047857',
    borderColor: '#047857',
  },
  mesChipTexto: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  mesChipTextoAtivo: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  cardMesInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardMesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardMesTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardMesSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  badgeArrecadado: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    alignItems: 'flex-end',
  },
  badgeArrecadadoLabel: {
    fontSize: 9,
    color: '#065f46',
    fontWeight: 'bold',
  },
  badgeArrecadadoValor: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '900',
  },
  progressoContainer: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressoBarra: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressoTextos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressoTxtVerde: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  progressoTxtVermelho: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
  filtrosLinha: {
    flexDirection: 'row',
    gap: 8,
  },
  filtroBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  filtroBtnAtivo: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filtroBtnTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  filtroBtnTxtAtivo: {
    color: '#ffffff',
  },
  listaJogadoresCaixa: {
    gap: 8,
  },
  itemMensalista: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemAvatar: {
    fontSize: 24,
    marginRight: 10,
  },
  itemNome: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  itemStatus: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  itemAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnStatusPagamento: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  btnPago: {
    backgroundColor: '#10b981',
  },
  btnPendente: {
    backgroundColor: '#ef4444',
  },
  btnStatusTexto: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  btnEditarValor: {
    backgroundColor: '#f1f5f9',
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEditarValorTexto: {
    fontSize: 14,
  },
  secaoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  secaoTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  secaoSub: {
    fontSize: 12,
    color: '#64748b',
  },
  btnAdicionar: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnAdicionarSaida: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnAdicionarTexto: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemTransacao: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transacaoInfo: {
    flex: 1,
    marginRight: 10,
  },
  transacaoBadgeEntrada: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  transacaoBadgeSaida: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  transacaoBadgeTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  transacaoDescricao: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  transacaoData: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  transacaoValorRow: {
    alignItems: 'flex-end',
  },
  transacaoValorPositivo: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 6,
  },
  transacaoValorNegativo: {
    fontSize: 15,
    fontWeight: '800',
    color: '#dc2626',
    marginBottom: 6,
  },
  transacaoBotoes: {
    flexDirection: 'row',
    gap: 6,
  },
  btnIconMini: {
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
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
    marginTop: 8,
  },
  inputModal: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 8,
  },
  catChipsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 4,
  },
  catChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  catChipAtivo: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  catChipSaidaAtivo: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  catChipTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  catChipTextoAtivo: {
    color: '#ffffff',
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
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  modalBtnSalvarVermelho: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  modalBtnSalvarTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  divisorLinha: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagRemovivel: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  tagRemovivelSaida: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  tagRemovivelTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
  },
  addCatRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  btnAddCat: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
  },
  btnAddCatSaida: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
  },
  btnAddCatTxt: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

