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
import { MESES, STATUS_CORES } from '../data/initialData';

export default function FinanceiroTab({
  config,
  onUpdateConfig,
  players,
  onUpdatePlayers,
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
  ehAdmin = false,
}) {
  // Sub-visão: 'mensal' | 'grade' | 'entradas' | 'saidas'
  const [visaoAtiva, setVisaoAtiva] = useState('mensal');
  
  // Mês selecionado na visão mensal (padrão: Outubro)
  const [mesSelecionado, setMesSelecionado] = useState('Outubro');
  const [filtroStatusMes, setFiltroStatusMes] = useState('todos'); // 'todos' | 'pagos' | 'pendentes' | 'ausentes'

  // Modais
  const [modalEditarPagamento, setModalEditarPagamento] = useState(null); // { player, mes, valorAtual }
  const [modalEditarStatus, setModalEditarStatus] = useState(null); // player
  const [modalDinheiro, setModalDinheiro] = useState(false);
  const [modalNovaEntrada, setModalNovaEntrada] = useState(false);
  const [modalDiaristasRapido, setModalDiaristasRapido] = useState(false);
  const [modalNovaSaida, setModalNovaSaida] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);

  // Estados dos formulários
  const [formDescricao, setFormDescricao] = useState('');
  const [formValor, setFormValor] = useState('');
  const [formCategoria, setFormCategoria] = useState('');
  const [formData, setFormData] = useState('');
  const [itemEmEdicaoId, setItemEmEdicaoId] = useState(null);

  // Formulário Diaristas Rápido
  const [diaristasQtd, setDiaristasQtd] = useState('1');
  const [diaristasData, setDiaristasData] = useState(new Date().toLocaleDateString('pt-BR'));

  // Estado Dinheiro em mãos
  const [tempDinheiro, setTempDinheiro] = useState(String(config.valorEmDinheiro || 0));

  // Configurações
  const [tempValorMensalidade, setTempValorMensalidade] = useState(String(config.valorMensalidade || 75));
  const [tempDiaVencimento, setTempDiaVencimento] = useState(String(config.diaVencimentoMensalidade || 10));
  const [mostrarHistoricoExMensalistas, setMostrarHistoricoExMensalistas] = useState(false);

  // Função auxiliar para identificar mensalistas
  const isMensalistaStatus = (status) =>
    status === 'Mensalista' ||
    status === 'Mensalista Temporário' ||
    status === 'Mensalista Ausente';

  // Lista ATIVA de mensalistas (exclui diaristas e avulsos)
  const jogadoresMensalistas = useMemo(() => {
    const ordemOficial = [
      'j_alex', 'j_bahia', 'j_brug', 'j_daibert', 'j_douglas', 'j_diogo',
      'j_felipe', 'j_felipo', 'j_rogerio', 'j_rechan', 'j_guilherme',
      'j_filipao', 'j_lucao', 'j_alan', 'j_fabio', 'j_victao'
    ];
    const mapa = new Map(players.map(p => [p.id, p]));
    const lista = [];

    // Adiciona na ordem oficial apenas os que são Mensalistas, Mensalistas Temporários ou Mensalistas Ausentes
    ordemOficial.forEach(id => {
      const p = mapa.get(id);
      if (p && isMensalistaStatus(p.status)) {
        lista.push(p);
      }
    });

    // Adiciona quaisquer outros mensalistas criados pelo usuário
    players.forEach(p => {
      if (!ordemOficial.includes(p.id) && isMensalistaStatus(p.status)) {
        lista.push(p);
      }
    });

    return lista;
  }, [players]);

  // Ex-mensalistas (hoje Diaristas) que possuem histórico de pagamentos anteriores
  const exMensalistasComHistorico = useMemo(() => {
    return players.filter(p => {
      if (isMensalistaStatus(p.status)) return false;
      const pPag = pagamentos[p.id] || {};
      return Object.values(pPag).some(v => typeof v === 'number' && v > 0);
    });
  }, [players, pagamentos]);

  // Cálculos Gerais do Caixa (Fórmula da planilha: Mensalidades + Entradas - Saídas)
  const totais = useMemo(() => {
    let totalMensalidadesGeral = 0;
    let totalExMensalistas = 0;
    let totalMensalidadesMes = 0;
    let qtdPagosMes = 0;
    let qtdAusentesMes = 0;
    let qtdPendentesMes = 0;

    // 1. MANTÉM TODOS OS VALORES PAGOS ANTERIORMENTE NO CAIXA (inclusive de quem hoje é diarista)
    Object.keys(pagamentos).forEach((pId) => {
      const pPag = pagamentos[pId] || {};
      const playerObj = players.find(x => x.id === pId);
      const isMens = playerObj ? isMensalistaStatus(playerObj.status) : false;

      MESES.forEach((m) => {
        const val = pPag[m];
        if (typeof val === 'number' && val > 0) {
          totalMensalidadesGeral += val;
          if (!isMens) {
            totalExMensalistas += val;
          }
        }
      });
    });

    // 2. MENSALIDADES DO MÊS SELECIONADO: Apenas para quem é Mensalista / Mensalista Temporário
    jogadoresMensalistas.forEach((p) => {
      const pPag = pagamentos[p.id] || {};
      const valMes = pPag[mesSelecionado];
      if (typeof valMes === 'number') {
        if (valMes > 0) {
          totalMensalidadesMes += valMes;
          qtdPagosMes++;
        } else if (valMes === 0) {
          qtdAusentesMes++;
        }
      } else {
        qtdPendentesMes++;
      }
    });

    const totalEntradasAvulsas = entradas.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    const totalEntradasCompleto = totalMensalidadesGeral + totalEntradasAvulsas;
    const totalSaidasGeral = saidas.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    const saldoTotal = totalEntradasCompleto - totalSaidasGeral;

    const valorDinheiro = Number(config.valorEmDinheiro) || 0;
    const saldoNoBanco = saldoTotal - valorDinheiro;

    return {
      totalMensalidadesGeral,
      totalExMensalistas,
      totalEntradasAvulsas,
      totalEntradasCompleto,
      totalSaidasGeral,
      saldoTotal,
      valorDinheiro,
      saldoNoBanco,
      totalMensalidadesMes,
      qtdPagosMes,
      qtdAusentesMes,
      qtdPendentesMes,
    };
  }, [players, jogadoresMensalistas, pagamentos, entradas, saidas, mesSelecionado, config.valorEmDinheiro]);

  const alertSimples = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  const definirPagamentoMes = (playerId, mes, tipo, valorPersonalizado = null) => {
    const pPag = { ...(pagamentos[playerId] || {}) };
    
    if (tipo === 'pago') {
      const padrao = mes === 'Janeiro' ? 60.0 : (Number(config.valorMensalidade) || 75.0);
      pPag[mes] = valorPersonalizado !== null ? valorPersonalizado : padrao;
    } else if (tipo === 'ausente') {
      pPag[mes] = 0.0;
    } else if (tipo === 'pendente') {
      pPag[mes] = null;
    }

    onUpdatePagamentos({
      ...pagamentos,
      [playerId]: pPag,
    });
  };

  const salvarPagamentoModal = (valorNum) => {
    if (!modalEditarPagamento) return;
    const { player, mes } = modalEditarPagamento;
    const pPag = { ...(pagamentos[player.id] || {}) };
    pPag[mes] = valorNum;

    onUpdatePagamentos({
      ...pagamentos,
      [player.id]: pPag,
    });
    setModalEditarPagamento(null);
  };

  const salvarNovoStatusJogador = (novoStatus) => {
    if (!modalEditarStatus) return;
    const novosPlayers = players.map(p =>
      p.id === modalEditarStatus.id ? { ...p, status: novoStatus } : p
    );
    onUpdatePlayers(novosPlayers);
    setModalEditarStatus(null);
  };

  const salvarDinheiroEmMaos = () => {
    const num = parseFloat(tempDinheiro.replace(',', '.'));
    onUpdateConfig({
      ...config,
      valorEmDinheiro: isNaN(num) ? 0.0 : num,
    });
    setModalDinheiro(false);
  };

  const salvarDiaristasRapido = () => {
    const qtd = parseInt(diaristasQtd, 10);
    if (isNaN(qtd) || qtd <= 0) {
      alertSimples('Quantidade Inválida', 'Informe a quantidade de diaristas.');
      return;
    }
    const valorUnitario = Number(config.valorDiarista) || 20.0;
    const totalDiaristas = qtd * valorUnitario;
    const desc = qtd === 1 ? `Diarista ${diaristasData}` : `Diaristas ${diaristasData}`;

    const novasEntradas = [
      {
        id: `ent_${Date.now()}`,
        descricao: desc,
        valor: totalDiaristas,
        categoria: 'Diarista',
        data: diaristasData,
      },
      ...entradas,
    ];
    onUpdateEntradas(novasEntradas);
    setModalDiaristasRapido(false);
  };

  const salvarEntrada = () => {
    if (!formDescricao.trim() || !formValor) {
      alertSimples('Campos Obrigatórios', 'Preencha a descrição e o valor da entrada.');
      return;
    }
    const valorNum = parseFloat(formValor.replace(',', '.'));
    if (isNaN(valorNum) || valorNum < 0) {
      alertSimples('Valor Inválido', 'Insira um valor numérico válido.');
      return;
    }

    let novas = [...entradas];
    if (itemEmEdicaoId) {
      novas = novas.map(e =>
        e.id === itemEmEdicaoId
          ? { ...e, descricao: formDescricao, valor: valorNum, categoria: formCategoria, data: formData }
          : e
      );
    } else {
      novas.unshift({
        id: `ent_${Date.now()}`,
        descricao: formDescricao,
        valor: valorNum,
        categoria: formCategoria,
        data: formData || new Date().toLocaleDateString('pt-BR'),
      });
    }
    onUpdateEntradas(novas);
    setModalNovaEntrada(false);
  };

  const salvarSaida = () => {
    if (!formDescricao.trim() || !formValor) {
      alertSimples('Campos Obrigatórios', 'Preencha a descrição e o valor da saída.');
      return;
    }
    const valorNum = parseFloat(formValor.replace(',', '.'));
    if (isNaN(valorNum) || valorNum < 0) {
      alertSimples('Valor Inválido', 'Insira um valor numérico válido.');
      return;
    }

    let novas = [...saidas];
    if (itemEmEdicaoId) {
      novas = novas.map(s =>
        s.id === itemEmEdicaoId
          ? { ...s, descricao: formDescricao, valor: valorNum, categoria: formCategoria, data: formData }
          : s
      );
    } else {
      novas.unshift({
        id: `sai_${Date.now()}`,
        descricao: formDescricao,
        valor: valorNum,
        categoria: formCategoria,
        data: formData || new Date().toLocaleDateString('pt-BR'),
      });
    }
    onUpdateSaidas(novas);
    setModalNovaSaida(false);
  };

  const jogadoresExibicaoMes = useMemo(() => {
    return jogadoresMensalistas.filter(p => {
      const val = (pagamentos[p.id] || {})[mesSelecionado];
      const estaPago = typeof val === 'number' && val > 0;
      const estaAusente = val === 0;
      const estaPendente = val === null || val === undefined;

      if (filtroStatusMes === 'pagos') return estaPago;
      if (filtroStatusMes === 'ausentes') return estaAusente;
      if (filtroStatusMes === 'pendentes') return estaPendente;
      return true;
    });
  }, [jogadoresMensalistas, pagamentos, mesSelecionado, filtroStatusMes]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* 1. CARDS DE RESUMO FINANCEIRO */}
      <View style={styles.cardResumoGeral}>
        <View style={styles.resumoTopo}>
          <Text style={styles.resumoTitulo}>💰 SALDO TOTAL EM CAIXA</Text>
          {ehAdmin && (
            <TouchableOpacity onPress={() => setModalConfig(true)} style={styles.btnConfigIcon}>
              <Text style={styles.btnConfigIconText}>⚙️ Ajustes</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.saldoValor, { color: totais.saldoTotal >= 0 ? '#4ade80' : '#f87171' }]}>
          R$ {totais.saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>

        {/* DIVISÃO ENTRE CONTA BANCÁRIA E DINHEIRO VIVO EM MÃOS */}
        <View style={styles.linhaDivisaoDinheiro}>
          <View style={styles.boxSubSaldo}>
            <Text style={styles.labelSubSaldo}>💳 Na Conta / Pix:</Text>
            <Text style={styles.valorSubSaldoBanco}>
              R$ {totais.saldoNoBanco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.divisorVertical} />

          <TouchableOpacity
            style={styles.boxSubSaldoDinheiro}
            disabled={!ehAdmin}
            onPress={() => {
              if (ehAdmin) {
                setTempDinheiro(String(config.valorEmDinheiro || 0));
                setModalDinheiro(true);
              }
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.labelSubSaldo}>💵 Em Dinheiro (Com você):</Text>
              {ehAdmin && <Text style={styles.linkEditarDinheiro}>✏️</Text>}
            </View>
            <Text style={styles.valorSubSaldoDinheiro}>
              R$ {totais.valorDinheiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* MÉTRICAS DE ENTRADAS VS SAÍDAS */}
        <View style={styles.resumoMetricasLinha}>
          <View style={styles.metricaBox}>
            <Text style={styles.metricaLabel}>Total de Entradas</Text>
            <Text style={styles.metricaValorVerde}>
              + R$ {totais.totalEntradasCompleto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.metricaDivisor} />
          <View style={styles.metricaBox}>
            <Text style={styles.metricaLabel}>Total de Saídas (Gastos)</Text>
            <Text style={styles.metricaValorVermelho}>
              - R$ {totais.totalSaidasGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. SELETOR DE VISÃO (SUB-ABAS) */}
      <View style={styles.subAbasContainer}>
        <TouchableOpacity
          style={[styles.subAbaBotao, visaoAtiva === 'mensal' && styles.subAbaAtiva]}
          onPress={() => setVisaoAtiva('mensal')}
        >
          <Text style={[styles.subAbaTexto, visaoAtiva === 'mensal' && styles.subAbaTextoAtiva]}>
            🗓️ Mensal ({mesSelecionado})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subAbaBotao, visaoAtiva === 'grade' && styles.subAbaAtiva]}
          onPress={() => setVisaoAtiva('grade')}
        >
          <Text style={[styles.subAbaTexto, visaoAtiva === 'grade' && styles.subAbaTextoAtiva]}>
            📊 Grade Anual
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subAbaBotao, visaoAtiva === 'entradas' && styles.subAbaAtiva]}
          onPress={() => setVisaoAtiva('entradas')}
        >
          <Text style={[styles.subAbaTexto, visaoAtiva === 'entradas' && styles.subAbaTextoAtiva]}>
            📥 Entradas ({entradas.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subAbaBotao, visaoAtiva === 'saidas' && styles.subAbaAtiva]}
          onPress={() => setVisaoAtiva('saidas')}
        >
          <Text style={[styles.subAbaTexto, visaoAtiva === 'saidas' && styles.subAbaTextoAtiva]}>
            📤 Saídas ({saidas.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. VISÃO 1: MENSAL (QUEM JÁ PAGOU E QUEM AINDA NÃO PAGOU NESTE MÊS) */}
      {visaoAtiva === 'mensal' && (
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
                  {mesSelecionado === 'Janeiro' ? 'Mensalidade inicial: R$ 60,00' : 'Mensalidade padrão: R$ 75,00'} • Vencimento dia {config.diaVencimentoMensalidade || 10}
                </Text>
              </View>
              <View style={styles.badgeArrecadado}>
                <Text style={styles.badgeArrecadadoLabel}>Arrecadado:</Text>
                <Text style={styles.badgeArrecadadoValor}>
                  R$ {totais.totalMensalidadesMes.toFixed(2)}
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
                        ? (totais.qtdPagosMes / jogadoresMensalistas.length) * 100
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>

            <View style={styles.progressoTextos}>
              <Text style={styles.progressoTxtVerde}>
                ✅ {totais.qtdPagosMes} Pagaram
              </Text>
              <Text style={styles.progressoTxtCinza}>
                ⏸️ {totais.qtdAusentesMes} Ausentes / Lesão (R$ 0)
              </Text>
              <Text style={styles.progressoTxtVermelho}>
                ❌ {totais.qtdPendentesMes} Pendentes
              </Text>
            </View>

            {/* FILTROS RÁPIDOS */}
            <View style={styles.filtrosLinha}>
              {[
                { key: 'todos', label: `Mensalistas (${jogadoresMensalistas.length})` },
                { key: 'pagos', label: `Pagos (${totais.qtdPagosMes})` },
                { key: 'pendentes', label: `Pendentes (${totais.qtdPendentesMes})` },
                { key: 'ausentes', label: `Ausentes (${totais.qtdAusentesMes})` },
              ].map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filtroBtn, filtroStatusMes === f.key && styles.filtroBtnAtivo]}
                  onPress={() => setFiltroStatusMes(f.key)}
                >
                  <Text style={[styles.filtroBtnTxt, filtroStatusMes === f.key && styles.filtroBtnTxtAtivo]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ALERTA DE DÍVIDAS / PAGAMENTO PARCIAL NO MÊS SELECIONADO */}
          {(() => {
            const devedoresMes = jogadoresMensalistas.filter((p) => {
              const val = (pagamentos[p.id] || {})[mesSelecionado];
              const valorEsperado = mesSelecionado === 'Janeiro' ? 60.0 : (Number(config.valorMensalidade) || 75.0);
              return typeof val === 'number' && val > 0 && val < valorEsperado;
            });

            if (devedoresMes.length === 0) return null;

            return (
              <View style={styles.bannerAlertaDivida}>
                <Text style={styles.bannerAlertaDividaTitulo}>⚠️ Pagamento Parcial Detectado:</Text>
                {devedoresMes.map(p => {
                  const val = (pagamentos[p.id] || {})[mesSelecionado];
                  const vEsp = mesSelecionado === 'Janeiro' ? 60.0 : (Number(config.valorMensalidade) || 75.0);
                  return (
                    <Text key={p.id} style={styles.bannerAlertaDividaTxt}>
                      • <Text style={{ fontWeight: 'bold' }}>{p.nome}</Text> pagou R$ {val.toFixed(2)}, devendo <Text style={{ fontWeight: 'bold', color: '#b91c1c' }}>R$ {(vEsp - val).toFixed(2)}</Text> para integralizar os R$ {vEsp.toFixed(2)}.
                    </Text>
                  );
                })}
              </View>
            );
          })()}

          {/* LISTA DOS JOGADORES NO MÊS SELECIONADO */}
          <View style={styles.listaJogadoresCaixa}>
            {jogadoresExibicaoMes.map((p) => {
              const valorPago = (pagamentos[p.id] || {})[mesSelecionado];
              const estaPago = typeof valorPago === 'number' && valorPago > 0;
              const estaAusente = valorPago === 0;

              const statusEstilo = STATUS_CORES[p.status] || STATUS_CORES['Mensalista'];

              const valorEsperado = mesSelecionado === 'Janeiro' ? 60.0 : (Number(config.valorMensalidade) || 75.0);
              const deveParte = estaPago && valorPago < valorEsperado;

              return (
                <View key={p.id} style={styles.itemMensalista}>
                  {/* IDENTIFICAÇÃO DO JOGADOR */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemAvatar}>{p.avatar || '⚽'}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.itemNome}>{p.nome}</Text>
                        
                        {/* BADGE DE STATUS CLICÁVEL PARA MUDAR FACILMENTE (ADMIN APENAS) */}
                        <TouchableOpacity
                          disabled={!ehAdmin}
                          style={[styles.badgeStatusMini, { backgroundColor: statusEstilo.bg, borderColor: statusEstilo.border }]}
                          onPress={() => {
                            if (ehAdmin) setModalEditarStatus(p);
                          }}
                        >
                          <Text style={[styles.badgeStatusMiniTxt, { color: statusEstilo.text }]}>
                            {p.status} {ehAdmin ? '▾' : ''}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* INDICAÇÃO DE STATUS DE PAGAMENTO */}
                      {estaPago ? (
                        <Text style={styles.itemPagamentoVerde}>
                          ✅ Pagou R$ {valorPago.toFixed(2)}
                          {deveParte ? ` (⚠️ Devendo R$ ${(valorEsperado - valorPago).toFixed(2)})` : ''}
                        </Text>
                      ) : estaAusente ? (
                        <Text style={styles.itemPagamentoAusente}>
                          ⏸️ Ausente / Lesão (R$ 0,00)
                        </Text>
                      ) : (
                        <Text style={styles.itemPagamentoPendente}>
                          ❌ Ainda não pagou em {mesSelecionado}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* AÇÕES RÁPIDAS DE 1 TOQUE (APENAS ADMINISTRADOR) */}
                  {ehAdmin && (
                    <View style={styles.itemAcoesLinha}>
                      {/* Botão Pagou */}
                      <TouchableOpacity
                        onPress={() => definirPagamentoMes(p.id, mesSelecionado, 'pago')}
                        style={[styles.btnAcaoPagar, estaPago && !deveParte && styles.btnAcaoSelecionada]}
                      >
                        <Text style={styles.btnAcaoPagarTxt}>
                          {mesSelecionado === 'Janeiro' ? 'R$ 60' : 'R$ 75'}
                        </Text>
                      </TouchableOpacity>

                      {/* Botão Ausente R$ 0 */}
                      <TouchableOpacity
                        onPress={() => definirPagamentoMes(p.id, mesSelecionado, 'ausente')}
                        style={[styles.btnAcaoAusente, estaAusente && styles.btnAcaoSelecionada]}
                      >
                        <Text style={styles.btnAcaoAusenteTxt}>R$ 0</Text>
                      </TouchableOpacity>

                      {/* Botão Limpar / Pendente */}
                      {valorPago !== null && valorPago !== undefined && (
                        <TouchableOpacity
                          onPress={() => definirPagamentoMes(p.id, mesSelecionado, 'pendente')}
                          style={styles.btnAcaoLimpar}
                        >
                          <Text style={styles.btnAcaoLimparTxt}>✕</Text>
                        </TouchableOpacity>
                      )}

                      {/* Botão Personalizar Valor */}
                      <TouchableOpacity
                        onPress={() =>
                          setModalEditarPagamento({
                            player: p,
                            mes: mesSelecionado,
                            valorAtual: valorPago !== null && valorPago !== undefined ? String(valorPago) : (mesSelecionado === 'Janeiro' ? '60' : String(config.valorMensalidade || 75)),
                          })
                        }
                        style={styles.btnEditarValor}
                      >
                        <Text style={styles.btnEditarValorTexto}>✏️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* 4. VISÃO 2: GRADE ANUAL COMPLETA (ESTILO PLANILHA GOOGLE SHEETS) */}
      {visaoAtiva === 'grade' && (
        <View style={styles.cardGradeAnual}>
          <View style={styles.gradeHeaderRow}>
            <View>
              <Text style={styles.cardGradeTitulo}>📊 Tabela Anual de Pagamentos 2026</Text>
              <Text style={styles.cardGradeSub}>
                Verde = Pagou • Cinza = R$ 0 (Ausente/Lesão) • Branco = Pendente
              </Text>
            </View>
          </View>

          {/* TABELA COM SCROLL HORIZONTAL */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.gradeScroll}>
            <View>
              {/* LINHA DE CABEÇALHO */}
              <View style={styles.gradeLinhaHeader}>
                <Text style={[styles.gradeColHeader, { width: 120, textAlign: 'left' }]}>JOGADOR</Text>
                <Text style={[styles.gradeColHeader, { width: 130, textAlign: 'center' }]}>STATUS</Text>
                {MESES.map((m) => (
                  <Text key={m} style={[styles.gradeColHeader, { width: 68, textAlign: 'center' }]}>
                    {m.slice(0, 3)}
                  </Text>
                ))}
              </View>

              {/* LINHAS DOS MENSALISTAS */}
              {jogadoresMensalistas.map((p) => {
                const statusEstilo = STATUS_CORES[p.status] || STATUS_CORES['Mensalista'];
                const pPag = pagamentos[p.id] || {};

                return (
                  <View key={p.id} style={styles.gradeLinhaItem}>
                    {/* NOME */}
                    <View style={[styles.gradeColCell, { width: 120, justifyContent: 'flex-start' }]}>
                      <Text style={styles.gradeNomeTxt} numberOfLines={1}>{p.nome}</Text>
                    </View>

                    {/* STATUS COM BADGE */}
                    <TouchableOpacity
                      disabled={!ehAdmin}
                      style={[styles.gradeColCell, { width: 130 }]}
                      onPress={() => {
                        if (ehAdmin) setModalEditarStatus(p);
                      }}
                    >
                      <View style={[styles.badgeGradeStatus, { backgroundColor: statusEstilo.bg, borderColor: statusEstilo.border }]}>
                        <Text style={[styles.badgeGradeStatusTxt, { color: statusEstilo.text }]} numberOfLines={1}>
                          {p.status}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* CÉLULAS DOS MESES (JAN A DEZ) */}
                    {MESES.map((m) => {
                      const val = pPag[m];
                      const temValor = typeof val === 'number';
                      const estaPago = temValor && val > 0;
                      const estaAusente = temValor && val === 0;

                      const valorEsperado = m === 'Janeiro' ? 60.0 : (Number(config.valorMensalidade) || 75.0);
                      const deveParte = estaPago && val < valorEsperado;

                      return (
                        <TouchableOpacity
                          key={m}
                          disabled={!ehAdmin}
                          style={[
                            styles.gradeCelulaMes,
                            estaPago && (deveParte ? styles.gradeCelulaPagaParcial : styles.gradeCelulaPaga),
                            estaAusente && styles.gradeCelulaAusente,
                          ]}
                          onPress={() => {
                            if (ehAdmin) {
                              setModalEditarPagamento({
                                player: p,
                                mes: m,
                                valorAtual: temValor ? String(val) : (m === 'Janeiro' ? '60' : String(config.valorMensalidade || 75)),
                              });
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.gradeCelulaTxt,
                              estaPago && (deveParte ? styles.gradeCelulaTxtParcial : styles.gradeCelulaTxtPaga),
                              estaAusente && styles.gradeCelulaTxtAusente,
                            ]}
                          >
                            {estaPago ? (deveParte ? `R$ ${val} ⚠️` : `R$ ${val}`) : estaAusente ? 'R$ 0' : '-'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}

              {/* SEÇÃO / TOGGLE: HISTÓRICO DE EX-MENSALISTAS (VALORES MANTIDOS NO CAIXA) */}
              {exMensalistasComHistorico.length > 0 && (
                <View style={styles.secaoExMensalistasContainer}>
                  <TouchableOpacity
                    style={styles.btnToggleHistorico}
                    onPress={() => setMostrarHistoricoExMensalistas(!mostrarHistoricoExMensalistas)}
                  >
                    <Text style={styles.btnToggleHistoricoTxt}>
                      {mostrarHistoricoExMensalistas
                        ? '▲ Ocultar Histórico de Ex-Mensalistas'
                        : `👥 Ver Pagamentos Anteriores de Ex-Mensalistas (${exMensalistasComHistorico.length} jogadores • R$ ${totais.totalExMensalistas.toFixed(2)} mantidos no caixa) ▾`}
                    </Text>
                  </TouchableOpacity>

                  {mostrarHistoricoExMensalistas && (
                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.subtituloExMensalistas}>
                        Estes jogadores hoje são Diaristas, mas os valores pagos quando eram mensalistas permanecem somados ao Caixa:
                      </Text>
                      {exMensalistasComHistorico.map((p) => {
                        const statusEstilo = STATUS_CORES[p.status] || STATUS_CORES['Diarista'];
                        const pPag = pagamentos[p.id] || {};

                        return (
                          <View key={p.id} style={[styles.gradeLinhaItem, { opacity: 0.88, backgroundColor: '#f8fafc' }]}>
                            {/* NOME */}
                            <View style={[styles.gradeColCell, { width: 120, justifyContent: 'flex-start' }]}>
                              <Text style={styles.gradeNomeTxt} numberOfLines={1}>{p.nome}</Text>
                            </View>

                            {/* STATUS COM BADGE */}
                            <TouchableOpacity
                              style={[styles.gradeColCell, { width: 130 }]}
                              onPress={() => setModalEditarStatus(p)}
                            >
                              <View style={[styles.badgeGradeStatus, { backgroundColor: statusEstilo.bg, borderColor: statusEstilo.border }]}>
                                <Text style={[styles.badgeGradeStatusTxt, { color: statusEstilo.text }]} numberOfLines={1}>
                                  {p.status}
                                </Text>
                              </View>
                            </TouchableOpacity>

                            {/* CÉLULAS DOS MESES */}
                            {MESES.map((m) => {
                              const val = pPag[m];
                              const temValor = typeof val === 'number';
                              const estaPago = temValor && val > 0;
                              const estaAusente = temValor && val === 0;

                              return (
                                <View
                                  key={m}
                                  style={[
                                    styles.gradeCelulaMes,
                                    estaPago && styles.gradeCelulaPaga,
                                    estaAusente && styles.gradeCelulaAusente,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.gradeCelulaTxt,
                                      estaPago && styles.gradeCelulaTxtPaga,
                                      estaAusente && styles.gradeCelulaTxtAusente,
                                    ]}
                                  >
                                    {estaPago ? `R$ ${val}` : estaAusente ? 'R$ 0' : '-'}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 5. VISÃO 3: ENTRADAS & DIARISTAS */}
      {visaoAtiva === 'entradas' && (
        <View>
          <View style={styles.secaoHeaderRow}>
            <View>
              <Text style={styles.secaoTitulo}>Entradas & Diaristas</Text>
              <Text style={styles.secaoSub}>
                Total de Entradas Avulsas: R$ {totais.totalEntradasAvulsas.toFixed(2)}
              </Text>
            </View>

            {ehAdmin && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {/* BOTÃO RÁPIDO PARA DIARISTAS DO JOGO */}
                <TouchableOpacity
                  style={styles.btnDiaristasRapido}
                  onPress={() => setModalDiaristasRapido(true)}
                >
                  <Text style={styles.btnDiaristasRapidoTxt}>⚡ + Diaristas da Rodada</Text>
                </TouchableOpacity>

                {/* NOVA ENTRADA AVULSA */}
                <TouchableOpacity
                  style={styles.btnAdicionar}
                  onPress={() => {
                    setItemEmEdicaoId(null);
                    setFormDescricao('');
                    setFormValor('');
                    setFormCategoria('Diarista');
                    setFormData(new Date().toLocaleDateString('pt-BR'));
                    setModalNovaEntrada(true);
                  }}
                >
                  <Text style={styles.btnAdicionarTexto}>+ Outra</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* LISTA DE TODAS AS ENTRADAS */}
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
                {ehAdmin && (
                  <View style={styles.transacaoBotoes}>
                    <TouchableOpacity
                      onPress={() => {
                        setItemEmEdicaoId(item.id);
                        setFormDescricao(item.descricao);
                        setFormValor(String(item.valor));
                        setFormCategoria(item.categoria || 'Diarista');
                        setFormData(item.data || '');
                        setModalNovaEntrada(true);
                      }}
                      style={styles.btnIconMini}
                    >
                      <Text>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        onUpdateEntradas(entradas.filter(e => e.id !== item.id));
                      }}
                      style={styles.btnIconMini}
                    >
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 6. VISÃO 4: SAÍDAS & GASTOS (QUADRA, CHOPP, CHURRASCO) */}
      {visaoAtiva === 'saidas' && (
        <View>
          <View style={styles.secaoHeaderRow}>
            <View>
              <Text style={styles.secaoTitulo}>Gastos & Saídas</Text>
              <Text style={styles.secaoSub}>Total de Gastos: R$ {totais.totalSaidasGeral.toFixed(2)}</Text>
            </View>
            {ehAdmin && (
              <TouchableOpacity
                style={styles.btnAdicionarSaida}
                onPress={() => {
                  setItemEmEdicaoId(null);
                  setFormDescricao('');
                  setFormValor('');
                  setFormCategoria('Quadra');
                  setFormData(new Date().toLocaleDateString('pt-BR'));
                  setModalNovaSaida(true);
                }}
              >
                <Text style={styles.btnAdicionarTexto}>+ Nova Saída</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* LISTA DE SAÍDAS */}
          {saidas.map((item) => (
            <View key={item.id} style={styles.itemTransacao}>
              <View style={styles.transacaoInfo}>
                <View style={styles.transacaoBadgeSaida}>
                  <Text style={styles.transacaoBadgeTxt}>{item.categoria || 'Quadra'}</Text>
                </View>
                <Text style={styles.transacaoDescricao}>{item.descricao}</Text>
                {item.data ? <Text style={styles.transacaoData}>📅 {item.data}</Text> : null}
              </View>

              <View style={styles.transacaoValorRow}>
                <Text style={styles.transacaoValorNegativo}>- R$ {Number(item.valor).toFixed(2)}</Text>
                {ehAdmin && (
                  <View style={styles.transacaoBotoes}>
                    <TouchableOpacity
                      onPress={() => {
                        setItemEmEdicaoId(item.id);
                        setFormDescricao(item.descricao);
                        setFormValor(String(item.valor));
                        setFormCategoria(item.categoria || 'Quadra');
                        setFormData(item.data || '');
                        setModalNovaSaida(true);
                      }}
                      style={styles.btnIconMini}
                    >
                      <Text>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        onUpdateSaidas(saidas.filter(s => s.id !== item.id));
                      }}
                      style={styles.btnIconMini}
                    >
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* MODAL 1: EDITAR VALOR DO PAGAMENTO (EX: ALEX PAGOU 65 DEVENDO 10) */}
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
              placeholder="Ex: 75.00 ou 65.00"
            />

            {/* BOTÕES DE ATALHO RÁPIDO DENTRO DO MODAL */}
            {(() => {
              const valIntegral = modalEditarPagamento?.mes === 'Janeiro' ? 60 : (Number(config.valorMensalidade) || 75);
              const valComDesconto10 = valIntegral - 10;
              return (
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                  <TouchableOpacity
                    style={styles.btnAtalhoValor}
                    onPress={() => setModalEditarPagamento((prev) => ({ ...prev, valorAtual: String(valIntegral) }))}
                  >
                    <Text style={styles.btnAtalhoValorTxt}>R$ {valIntegral} (Integral)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnAtalhoValor}
                    onPress={() => setModalEditarPagamento((prev) => ({ ...prev, valorAtual: String(valComDesconto10) }))}
                  >
                    <Text style={styles.btnAtalhoValorTxt}>R$ {valComDesconto10} (-10 devendo)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnAtalhoValor}
                    onPress={() => setModalEditarPagamento((prev) => ({ ...prev, valorAtual: '0' }))}
                  >
                    <Text style={styles.btnAtalhoValorTxt}>R$ 0 (Ausente)</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}

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
                  salvarPagamentoModal(isNaN(num) ? 0 : num);
                }}
              >
                <Text style={styles.modalBtnSalvarTexto}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: ALTERAR STATUS DO JOGADOR (EX: VICTÃO SUBSTITUINDO RECHAN) */}
      <Modal visible={!!modalEditarStatus} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Alterar Status do Jogador</Text>
            <Text style={styles.modalSub}>
              {modalEditarStatus?.nome} • Status atual: {modalEditarStatus?.status}
            </Text>

            <View style={{ gap: 8, marginVertical: 12 }}>
              {[
                { status: 'Mensalista', desc: 'Paga a mensalidade integral todo mês' },
                { status: 'Mensalista Temporário', desc: 'Substituindo temporariamente outro jogador lesionado' },
                { status: 'Mensalista Ausente', desc: 'Ausente por lesão / dispensado temporariamente' },
                { status: 'Diarista', desc: 'Paga por jogo/rodada que comparecer' },
              ].map(item => {
                const cor = STATUS_CORES[item.status] || STATUS_CORES['Mensalista'];
                const selecionado = modalEditarStatus?.status === item.status;
                return (
                  <TouchableOpacity
                    key={item.status}
                    style={[
                      styles.opcaoStatusItem,
                      { backgroundColor: cor.bg, borderColor: selecionado ? cor.text : cor.border },
                      selecionado && { borderWidth: 2 },
                    ]}
                    onPress={() => salvarNovoStatusJogador(item.status)}
                  >
                    <Text style={[styles.opcaoStatusTitulo, { color: cor.text }]}>
                      {item.status} {selecionado ? '✓' : ''}
                    </Text>
                    <Text style={[styles.opcaoStatusDesc, { color: cor.text }]}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalBtnCancelar}
              onPress={() => setModalEditarStatus(null)}
            >
              <Text style={styles.modalBtnCancelarTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: AJUSTAR DINHEIRO EM MÃOS */}
      <Modal visible={modalDinheiro} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>💵 Dinheiro em Mãos</Text>
            <Text style={styles.modalSub}>
              Esse valor já faz parte do total em caixa da pelada. Ele só fica destacado para você saber exatamente quanto dinheiro vivo está com você.
            </Text>

            <Text style={styles.labelInput}>Valor em Dinheiro (R$):</Text>
            <TextInput
              style={styles.inputModal}
              keyboardType="numeric"
              value={tempDinheiro}
              onChangeText={setTempDinheiro}
              placeholder="0.00"
            />

            <View style={styles.modalBotoesLinha}>
              <TouchableOpacity
                style={styles.modalBtnCancelar}
                onPress={() => setModalDinheiro(false)}
              >
                <Text style={styles.modalBtnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={salvarDinheiroEmMaos}>
                <Text style={styles.modalBtnSalvarTexto}>Salvar Valor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: LANÇAMENTO RÁPIDO DE DIARISTAS DA RODADA */}
      <Modal visible={modalDiaristasRapido} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>⚡ Lançar Diaristas do Jogo</Text>
            <Text style={styles.modalSub}>
              Cada diarista paga R$ {Number(config.valorDiarista || 20).toFixed(2)} por pelada.
            </Text>

            <Text style={styles.labelInput}>Quantos diaristas jogaram?</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              {['1', '2', '3', '4'].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.btnQtdDiarista,
                    diaristasQtd === n && styles.btnQtdDiaristaAtivo,
                  ]}
                  onPress={() => setDiaristasQtd(n)}
                >
                  <Text style={[styles.btnQtdDiaristaTxt, diaristasQtd === n && styles.btnQtdDiaristaTxtAtivo]}>
                    {n} ({n}x R$ 20 = R$ {parseInt(n, 10) * 20})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.labelInput}>Data da Pelada:</Text>
            <TextInput
              style={styles.inputModal}
              value={diaristasData}
              onChangeText={setDiaristasData}
              placeholder="Ex: 27/10/2026"
            />

            <View style={styles.resumoDiaristasBox}>
              <Text style={styles.resumoDiaristasTxt}>
                Total da Entrada:{' '}
                <Text style={{ fontWeight: '900', color: '#059669' }}>
                  + R$ {(parseInt(diaristasQtd, 10) * (Number(config.valorDiarista) || 20)).toFixed(2)}
                </Text>
              </Text>
            </View>

            <View style={styles.modalBotoesLinha}>
              <TouchableOpacity
                style={styles.modalBtnCancelar}
                onPress={() => setModalDiaristasRapido(false)}
              >
                <Text style={styles.modalBtnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={salvarDiaristasRapido}>
                <Text style={styles.modalBtnSalvarTexto}>Lançar no Caixa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: NOVA ENTRADA AVULSA */}
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
              placeholder="Ex: Patrocínio camisas, Diaristas 27/10, etc."
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
              placeholder="Ex: 27/10/2026"
            />

            <Text style={styles.labelInput}>Categoria:</Text>
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

      {/* MODAL 6: NOVA SAÍDA / GASTO */}
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
              placeholder="Ex: Quadra Outubro, Chopp, Bola, etc."
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
              placeholder="Ex: 27/10/2026"
            />

            <Text style={styles.labelInput}>Categoria:</Text>
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

      {/* MODAL 7: CONFIGURAÇÕES EDITÁVEIS */}
      <Modal visible={modalConfig} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitulo}>⚙️ Configurações do Caixa</Text>
              <Text style={styles.modalSub}>
                Ajuste os valores padrão da pelada de forma flexível.
              </Text>

              <Text style={styles.labelInput}>Valor Padrão da Mensalidade (R$):</Text>
              <TextInput
                style={styles.inputModal}
                keyboardType="numeric"
                value={tempValorMensalidade}
                onChangeText={setTempValorMensalidade}
                placeholder="75.00"
              />

              <Text style={styles.labelInput}>Valor Padrão do Diarista por Jogo (R$):</Text>
              <TextInput
                style={styles.inputModal}
                keyboardType="numeric"
                value={String(config.valorDiarista || 20)}
                onChangeText={(t) => onUpdateConfig({ ...config, valorDiarista: parseFloat(t) || 20 })}
                placeholder="20.00"
              />

              <Text style={styles.labelInput}>Dia de Vencimento do Pagamento:</Text>
              <TextInput
                style={styles.inputModal}
                keyboardType="numeric"
                value={tempDiaVencimento}
                onChangeText={setTempDiaVencimento}
                placeholder="10"
              />

              <View style={styles.modalBotoesLinha}>
                <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalConfig(false)}>
                  <Text style={styles.modalBtnCancelarTexto}>Fechar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalBtnSalvar}
                  onPress={() => {
                    onUpdateConfig({
                      ...config,
                      valorMensalidade: parseFloat(tempValorMensalidade) || 75.0,
                      diaVencimentoMensalidade: parseInt(tempDiaVencimento, 10) || 10,
                    });
                    setModalConfig(false);
                    alertSimples('Salvo', 'Configurações atualizadas!');
                  }}
                >
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
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
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
    marginBottom: 6,
  },
  resumoTitulo: {
    color: '#a7f3d0',
    fontSize: 11,
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
    marginBottom: 14,
  },
  linhaDivisaoDinheiro: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  boxSubSaldo: {
    flex: 1,
  },
  boxSubSaldoDinheiro: {
    flex: 1.2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 6,
    borderRadius: 10,
  },
  labelSubSaldo: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  valorSubSaldoBanco: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '800',
  },
  valorSubSaldoDinheiro: {
    color: '#facc15',
    fontSize: 16,
    fontWeight: '900',
  },
  linkEditarDinheiro: {
    fontSize: 12,
  },
  divisorVertical: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 10,
  },
  resumoMetricasLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  metricaBox: {
    flex: 1,
  },
  metricaLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  metricaValorVerde: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metricaValorVermelho: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metricaDivisor: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 10,
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
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  subAbaAtiva: {
    backgroundColor: '#10b981',
  },
  subAbaTexto: {
    color: '#94a3b8',
    fontSize: 11,
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
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardMesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
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
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  progressoTxtCinza: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  progressoTxtVermelho: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
  },
  filtrosLinha: {
    flexDirection: 'row',
    gap: 6,
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
    fontSize: 10,
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
    marginRight: 8,
  },
  itemAvatar: {
    fontSize: 22,
    marginRight: 10,
  },
  itemNome: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  badgeStatusMini: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeStatusMiniTxt: {
    fontSize: 9,
    fontWeight: '800',
  },
  itemPagamentoVerde: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '700',
    marginTop: 2,
  },
  itemPagamentoAusente: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  itemPagamentoPendente: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    marginTop: 2,
  },
  itemAcoesLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnAcaoPagar: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#86efac',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnAcaoPagarTxt: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '800',
  },
  btnAcaoAusente: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnAcaoAusenteTxt: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  btnAcaoLimpar: {
    backgroundColor: '#fee2e2',
    width: 26,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  btnAcaoLimparTxt: {
    color: '#b91c1c',
    fontSize: 11,
    fontWeight: 'bold',
  },
  btnAcaoSelecionada: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  btnEditarValor: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEditarValorTexto: {
    fontSize: 12,
  },
  cardGradeAnual: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  gradeHeaderRow: {
    marginBottom: 12,
  },
  cardGradeTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardGradeSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  gradeScroll: {
    marginTop: 4,
  },
  gradeLinhaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  gradeColHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    paddingHorizontal: 4,
  },
  gradeLinhaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 6,
  },
  gradeColCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  gradeNomeTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  badgeGradeStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    maxWidth: 120,
  },
  badgeGradeStatusTxt: {
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  gradeCelulaMes: {
    width: 68,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    marginHorizontal: 1,
    backgroundColor: '#ffffff',
  },
  gradeCelulaPaga: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  gradeCelulaAusente: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  gradeCelulaTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  gradeCelulaTxtPaga: {
    color: '#15803d',
    fontWeight: '900',
  },
  btnToggleHistorico: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignSelf: 'flex-start',
    marginTop: 14,
    marginBottom: 4,
  },
  btnToggleHistoricoTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  subtituloExMensalistas: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  secaoExMensalistasContainer: {
    marginTop: 10,
    paddingTop: 8,
  },
  bannerAlertaDivida: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  bannerAlertaDividaTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b45309',
    marginBottom: 4,
  },
  bannerAlertaDividaTxt: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 18,
  },
  gradeCelulaPagaParcial: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  gradeCelulaTxtParcial: {
    color: '#b45309',
    fontWeight: '800',
  },
  gradeCelulaTxtAusente: {
    color: '#64748b',
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
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  btnDiaristasRapido: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnDiaristasRapidoTxt: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  btnAdicionar: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
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
    fontSize: 11,
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
    lineHeight: 18,
  },
  labelInput: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 6,
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
    marginBottom: 10,
  },
  btnAtalhoValor: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  btnAtalhoValorTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  opcaoStatusItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  opcaoStatusTitulo: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  opcaoStatusDesc: {
    fontSize: 11,
    opacity: 0.85,
  },
  btnQtdDiarista: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  btnQtdDiaristaAtivo: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  btnQtdDiaristaTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  btnQtdDiaristaTxtAtivo: {
    color: '#ffffff',
  },
  resumoDiaristasBox: {
    backgroundColor: '#ecfdf5',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  resumoDiaristasTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065f46',
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
});
