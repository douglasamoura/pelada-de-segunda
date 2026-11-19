import { Jogador, TimePartida } from '../types';

/**
 * Utilitário de Balanceamento de Times para Pelada de Segunda
 * Divisão em 3 times de 5 jogadores de linha mantendo o poder equilibrado
 * e diversificando em relação aos times da semana anterior.
 */

export interface TimeBalanceado {
  id: number;
  nome: string;
  cor: string;
  textColor?: string;
  jogadores: Jogador[];
  poderTotal: number;
  poderMedio: number;
}

interface TimesSemanaAnterior {
  jogadores: Jogador[];
}

export function sortearTimesEquilibrados(
  jogadoresSelecionados: Jogador[],
  numTimes: number = 3,
  jogadoresPorTime: number = 5,
  timesSemanaAnterior: TimesSemanaAnterior[] | null = null
): TimeBalanceado[] {
  if (!jogadoresSelecionados || jogadoresSelecionados.length === 0) {
    return [
      { id: 1, nome: 'Time Colete', cor: '#16a34a', jogadores: [], poderTotal: 0, poderMedio: 0 },
      { id: 2, nome: 'Time Branco', cor: '#f8fafc', textColor: '#1e293b', jogadores: [], poderTotal: 0, poderMedio: 0 },
      { id: 3, nome: 'Time Preto', cor: '#18181b', jogadores: [], poderTotal: 0, poderMedio: 0 },
    ];
  }

  // Apenas jogadores de linha (os goleiros são fixos e selecionados por partida)
  const linha = jogadoresSelecionados
    .filter((j) => j.posicao !== 'Goleiro')
    .slice(0, numTimes * jogadoresPorTime);

  // Mapa de duplas que jogaram juntas na semana anterior
  const duplasSemanaAnterior = new Set<string>();
  if (timesSemanaAnterior && Array.isArray(timesSemanaAnterior)) {
    timesSemanaAnterior.forEach((t) => {
      const jgs = t.jogadores || [];
      for (let i = 0; i < jgs.length; i++) {
        for (let k = i + 1; k < jgs.length; k++) {
          duplasSemanaAnterior.add(`${jgs[i].id}_${jgs[k].id}`);
          duplasSemanaAnterior.add(`${jgs[k].id}_${jgs[i].id}`);
        }
      }
    });
  }

  let melhorDivisao: TimeBalanceado[] | null = null;
  let menorScoreTotal = Infinity;

  // Realiza múltiplas iterações estocásticas com penalidade para duplas repetidas
  const TENTATIVAS = 60;

  for (let tentativa = 0; tentativa < TENTATIVAS; tentativa++) {
    // Embaralha com leve aleatoriedade mantendo peso do overall
    const candidatos = [...linha].sort(() => Math.random() - 0.5);
    candidatos.sort((a, b) => {
      const diff = (b.overall || 10) - (a.overall || 10);
      return diff + (Math.random() * 2 - 1);
    });

    const times: TimeBalanceado[] = [
      { id: 1, nome: 'Time Colete', cor: '#16a34a', jogadores: [], poderTotal: 0, poderMedio: 0 },
      { id: 2, nome: 'Time Branco', cor: '#f8fafc', textColor: '#1e293b', jogadores: [], poderTotal: 0, poderMedio: 0 },
      { id: 3, nome: 'Time Preto', cor: '#18181b', jogadores: [], poderTotal: 0, poderMedio: 0 },
    ];

    // Distribuição gulosa considerando vagas e poder
    for (const jogador of candidatos) {
      const timesComVaga = times.filter((t) => t.jogadores.length < jogadoresPorTime);
      const timesConsiderados = timesComVaga.length > 0 ? timesComVaga : times;

      let melhorTime = timesConsiderados[0];
      let menorCusto = Infinity;

      for (const t of timesConsiderados) {
        const poderAtual = t.jogadores.reduce((acc, j) => acc + (j.overall || 10), 0);
        
        // Penalidade caso já tenha companheiro da semana passada
        let repeticoes = 0;
        t.jogadores.forEach((companheiro) => {
          if (duplasSemanaAnterior.has(`${jogador.id}_${companheiro.id}`)) {
            repeticoes += 1;
          }
        });

        const custo = poderAtual + repeticoes * 2.5;
        if (custo < menorCusto) {
          menorCusto = custo;
          melhorTime = t;
        }
      }

      melhorTime.jogadores.push(jogador);
    }

    // Calcula poderes e penalidade de repetição
    const poderes = times.map((t) =>
      t.jogadores.reduce((acc, j) => acc + (j.overall || 10), 0)
    );
    const diffPoder = Math.max(...poderes) - Math.min(...poderes);

    let totalRepeticoes = 0;
    times.forEach((t) => {
      for (let i = 0; i < t.jogadores.length; i++) {
        for (let k = i + 1; k < t.jogadores.length; k++) {
          if (duplasSemanaAnterior.has(`${t.jogadores[i].id}_${t.jogadores[k].id}`)) {
            totalRepeticoes += 1;
          }
        }
      }
    });

    // Score composto: prioriza equilíbrio de poder (diffPoder * 2) + diversidade (totalRepeticoes)
    const scoreTotal = diffPoder * 2.0 + totalRepeticoes * 0.8;

    if (scoreTotal < menorScoreTotal) {
      menorScoreTotal = scoreTotal;
      melhorDivisao = times.map((t) => {
        const pTotal = t.jogadores.reduce((acc, j) => acc + (j.overall || 10), 0);
        return {
          ...t,
          poderTotal: Math.round(pTotal * 10) / 10,
          poderMedio: Math.round((pTotal / (t.jogadores.length || 1)) * 10) / 10,
        };
      });
    }
  }

  return melhorDivisao || [
    { id: 1, nome: 'Time Colete', cor: '#16a34a', jogadores: [], poderTotal: 0, poderMedio: 0 },
    { id: 2, nome: 'Time Branco', cor: '#f8fafc', textColor: '#1e293b', jogadores: [], poderTotal: 0, poderMedio: 0 },
    { id: 3, nome: 'Time Preto', cor: '#18181b', jogadores: [], poderTotal: 0, poderMedio: 0 },
  ];
}

/**
 * Calcula o poder total de um time
 */
export function calcularPoderTime(jogadores: Jogador[]): number {
  return Math.round(
    jogadores.reduce((acc, j) => acc + (j.overall || 10), 0) * 10
  ) / 10;
}

/**
 * Verifica se dois times estão equilibrados (diferença <= threshold)
 */
export function timesEstaoEquilibrados(
  times: TimeBalanceado[],
  threshold: number = 5
): boolean {
  const poderes = times.map((t) => calcularPoderTime(t.jogadores));
  const diff = Math.max(...poderes) - Math.min(...poderes);
  return diff <= threshold;
}

/**
 * Gera times aleatórios (fallback simples)
 */
export function sortearTimesAleatorios(
  jogadoresSelecionados: Jogador[],
  numTimes: number = 3,
  jogadoresPorTime: number = 5
): TimeBalanceado[] {
  const linha = jogadoresSelecionados
    .filter((j) => j.posicao !== 'Goleiro')
    .slice(0, numTimes * jogadoresPorTime);

  const embaralhados = [...linha].sort(() => Math.random() - 0.5);
  
  const times: TimeBalanceado[] = Array.from({ length: numTimes }, (_, i) => ({
    id: i + 1,
    nome: ['Time Colete', 'Time Branco', 'Time Preto'][i] || `Time ${i + 1}`,
    cor: ['#16a34a', '#f8fafc', '#18181b'][i] || '#64748b',
    textColor: i === 1 ? '#1e293b' : undefined,
    jogadores: [],
    poderTotal: 0,
    poderMedio: 0,
  }));

  embaralhados.forEach((jogador, index) => {
    const timeIndex = index % numTimes;
    times[timeIndex].jogadores.push(jogador);
  });

  return times.map((t) => ({
    ...t,
    poderTotal: calcularPoderTime(t.jogadores),
    poderMedio: calcularPoderTime(t.jogadores) / (t.jogadores.length || 1),
  }));
}