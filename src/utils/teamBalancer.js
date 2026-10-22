/**
 * Utilitário de Balanceamento de Times para Pelada de Segunda
 * Divisão em 3 times de 5 jogadores mantendo o "poder" (overall) equilibrado.
 */

export function sortearTimesEquilibrados(jogadoresSelecionados, numTimes = 3, jogadoresPorTime = 5) {
  if (!jogadoresSelecionados || jogadoresSelecionados.length === 0) {
    return [
      { id: 1, nome: 'Time Colete', cor: '#16a34a', jogadores: [], poderTotal: 0, poderMedio: 0 },
      { id: 2, nome: 'Time Branco', cor: '#f8fafc', jogadores: [], poderTotal: 0, poderMedio: 0, textColor: '#1e293b' },
      { id: 3, nome: 'Time Preto', cor: '#18181b', jogadores: [], poderTotal: 0, poderMedio: 0 },
    ];
  }

  // Clona a lista
  const lista = [...jogadoresSelecionados];

  // Separa goleiros e jogadores de linha
  const goleiros = lista.filter(j => j.posicao === 'Goleiro');
  const linha = lista.filter(j => j.posicao !== 'Goleiro');

  // Embaralha levemente jogadores com mesma nota para haver variedade a cada sorteio
  linha.sort((a, b) => {
    const diff = b.overall - a.overall;
    if (diff === 0) return Math.random() - 0.5;
    return diff;
  });

  const times = [
    { id: 1, nome: 'Time Colete', cor: '#16a34a', jogadores: [] },
    { id: 2, nome: 'Time Branco', cor: '#f8fafc', jogadores: [], textColor: '#1e293b' },
    { id: 3, nome: 'Time Preto', cor: '#18181b', jogadores: [] },
  ];

  // 1. Distribui goleiros primeiro (1 por time enquanto houver)
  goleiros.forEach((g, idx) => {
    const tIndex = idx % numTimes;
    times[tIndex].jogadores.push(g);
  });

  // 2. Distribuição gulosa / balanceada para os jogadores de linha
  // Para cada jogador, atribui ao time que tem menor poder atual e que ainda tem vaga
  for (const jogador of linha) {
    // Filtra times com vagas
    const timesComVaga = times.filter(t => t.jogadores.length < jogadoresPorTime);
    const timesConsiderados = timesComVaga.length > 0 ? timesComVaga : times;

    // Encontra o time com menor soma de overall
    let timeMenorPoder = timesConsiderados[0];
    let menorPoder = timeMenorPoder.jogadores.reduce((acc, j) => acc + (j.overall || 10), 0);

    for (let i = 1; i < timesConsiderados.length; i++) {
      const p = timesConsiderados[i].jogadores.reduce((acc, j) => acc + (j.overall || 10), 0);
      if (p < menorPoder) {
        menorPoder = p;
        timeMenorPoder = timesConsiderados[i];
      }
    }

    timeMenorPoder.jogadores.push(jogador);
  }

  // 3. Otimização de troca (Local Search): tenta trocar 1 jogador de linha de time mais forte
  // com 1 de time mais fraco para diminuir ainda mais a diferença entre times
  let melhorou = true;
  let iteracoes = 0;
  while (melhorou && iteracoes < 30) {
    melhorou = false;
    iteracoes++;

    // Calcula poderes atuais
    const somas = times.map(t => t.jogadores.reduce((acc, j) => acc + (j.overall || 10), 0));
    const maxPoder = Math.max(...somas);
    const minPoder = Math.min(...somas);
    const diffAtual = maxPoder - minPoder;

    if (diffAtual <= 1.5) break; // Já está extremamente equilibrado

    const idxMax = somas.indexOf(maxPoder);
    const idxMin = somas.indexOf(minPoder);

    const timeMax = times[idxMax];
    const timeMin = times[idxMin];

    let melhorTroca = null;
    let menorDiff = diffAtual;

    for (let i = 0; i < timeMax.jogadores.length; i++) {
      const j1 = timeMax.jogadores[i];
      if (j1.posicao === 'Goleiro') continue; // não troca goleiro

      for (let j = 0; j < timeMin.jogadores.length; j++) {
        const j2 = timeMin.jogadores[j];
        if (j2.posicao === 'Goleiro') continue;

        // Se trocarmos j1 por j2
        const novaSomaMax = somas[idxMax] - j1.overall + j2.overall;
        const novaSomaMin = somas[idxMin] - j2.overall + j1.overall;
        const novasSomas = [...somas];
        novasSomas[idxMax] = novaSomaMax;
        novasSomas[idxMin] = novaSomaMin;

        const novaDiff = Math.max(...novasSomas) - Math.min(...novasSomas);
        if (novaDiff < menorDiff) {
          menorDiff = novaDiff;
          melhorTroca = { i, j };
        }
      }
    }

    if (melhorTroca && menorDiff < diffAtual) {
      const temp = timeMax.jogadores[melhorTroca.i];
      timeMax.jogadores[melhorTroca.i] = timeMin.jogadores[melhorTroca.j];
      timeMin.jogadores[melhorTroca.j] = temp;
      melhorou = true;
    }
  }

  // 4. Formata resultado final com estatísticas
  return times.map(t => {
    const total = t.jogadores.reduce((acc, j) => acc + (j.overall || 10), 0);
    const media = t.jogadores.length > 0 ? (total / t.jogadores.length).toFixed(1) : 0;
    return {
      ...t,
      poderTotal: Math.round(total * 10) / 10,
      poderMedio: parseFloat(media),
    };
  });
}

