import { sortearTimesEquilibrados, calcularPoderTime, timesEstaoEquilibrados, TimeBalanceado } from '../teamBalancer';
import { Jogador } from '../../types';

// Jogadores de teste com diferentes overalls - 15 jogadores de linha + 2 goleiros
const criarJogadoresTeste = (): Jogador[] => [
  { id: '1', nome: 'Jogador Forte 1', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 5, chute: 5, marcacao: 5, passe: 5, habilidade: 5, overall: 25 },
  { id: '2', nome: 'Jogador Forte 2', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 5, chute: 5, marcacao: 5, passe: 5, habilidade: 5, overall: 25 },
  { id: '3', nome: 'Jogador Forte 3', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 5, chute: 4, marcacao: 4, passe: 4, habilidade: 4, overall: 21 },
  { id: '4', nome: 'Jogador Médio 1', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 3, chute: 3, marcacao: 3, passe: 3, habilidade: 3, overall: 15 },
  { id: '5', nome: 'Jogador Médio 2', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 3, chute: 3, marcacao: 3, passe: 3, habilidade: 3, overall: 15 },
  { id: '6', nome: 'Jogador Médio 3', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 3, chute: 3, marcacao: 3, passe: 3, habilidade: 3, overall: 15 },
  { id: '7', nome: 'Jogador Médio 4', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 3, chute: 3, marcacao: 3, passe: 3, habilidade: 3, overall: 15 },
  { id: '8', nome: 'Jogador Médio 5', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 3, chute: 3, marcacao: 3, passe: 3, habilidade: 3, overall: 15 },
  { id: '9', nome: 'Jogador Fraco 1', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 1, chute: 1, marcacao: 1, passe: 1, habilidade: 1, overall: 5 },
  { id: '10', nome: 'Jogador Fraco 2', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 1, chute: 1, marcacao: 1, passe: 1, habilidade: 1, overall: 5 },
  { id: '11', nome: 'Jogador Fraco 3', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 1, chute: 1, marcacao: 1, passe: 1, habilidade: 1, overall: 5 },
  { id: '12', nome: 'Jogador Fraco 4', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 1, chute: 1, marcacao: 1, passe: 1, habilidade: 1, overall: 5 },
  { id: '13', nome: 'Jogador Fraco 5', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 1, chute: 1, marcacao: 1, passe: 1, habilidade: 1, overall: 5 },
  { id: '14', nome: 'Jogador Fraco 6', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 1, chute: 1, marcacao: 1, passe: 1, habilidade: 1, overall: 5 },
  { id: '15', nome: 'Jogador Fraco 7', status: 'Mensalista', posicao: 'Linha', avatar: '⭐', velocidade: 1, chute: 1, marcacao: 1, passe: 1, habilidade: 1, overall: 5 },
  { id: '16', nome: 'Goleiro 1', status: 'Goleiro', posicao: 'Goleiro', avatar: '🧤', velocidade: 2, chute: 2, marcacao: 2, passe: 2, habilidade: 2, overall: 10 },
  { id: '17', nome: 'Goleiro 2', status: 'Goleiro', posicao: 'Goleiro', avatar: '🧤', velocidade: 2, chute: 2, marcacao: 2, passe: 2, habilidade: 2, overall: 10 },
];

describe('teamBalancer', () => {
  describe('sortearTimesEquilibrados', () => {
    it('deve retornar 3 times com 5 jogadores de linha cada', () => {
      const jogadores = criarJogadoresTeste();
      const times = sortearTimesEquilibrados(jogadores, 3, 5);

      expect(times).toHaveLength(3);
      times.forEach((time) => {
        expect(time.jogadores).toHaveLength(5);
        expect(time.jogadores.every((j) => j.posicao !== 'Goleiro')).toBe(true);
      });
    });

    it('deve ignorar goleiros na distribuição', () => {
      const jogadores = criarJogadoresTeste();
      const times = sortearTimesEquilibrados(jogadores, 3, 5);

      const todosJogadores = times.flatMap((t) => t.jogadores);
      const goleiros = todosJogadores.filter((j) => j.posicao === 'Goleiro');
      expect(goleiros).toHaveLength(0);
    });

    it('deve distribuir todos os jogadores de linha disponíveis', () => {
      const jogadores = criarJogadoresTeste();
      const times = sortearTimesEquilibrados(jogadores, 3, 5);

      const todosJogadores = times.flatMap((t) => t.jogadores);
      expect(todosJogadores).toHaveLength(15); // 3 times * 5 jogadores
    });

    it('deve calcular poderTotal e poderMedio para cada time', () => {
      const jogadores = criarJogadoresTeste();
      const times = sortearTimesEquilibrados(jogadores, 3, 5);

      times.forEach((time) => {
        expect(time.poderTotal).toBeGreaterThan(0);
        expect(time.poderMedio).toBeGreaterThan(0);
        expect(time.poderMedio).toBeCloseTo(time.poderTotal / 5, 1);
      });
    });

    it('deve retornar times vazios quando não há jogadores', () => {
      const times = sortearTimesEquilibrados([], 3, 5);

      expect(times).toHaveLength(3);
      times.forEach((time) => {
        expect(time.jogadores).toHaveLength(0);
        expect(time.poderTotal).toBe(0);
      });
    });

    it('deve balancear times com poder similar', () => {
      const jogadores = criarJogadoresTeste();
      const times = sortearTimesEquilibrados(jogadores, 3, 5);

      const poderes = times.map((t) => t.poderTotal);
      const diff = Math.max(...poderes) - Math.min(...poderes);
      
      // Diferença de poder deve ser razoável (menos que 30 pontos)
      expect(diff).toBeLessThan(30);
    });

    it('deve diversificar times em relação à semana anterior', () => {
      const jogadores = criarJogadoresTeste();
      
      // Simula times da semana anterior
      const timesAnterior = [
        { jogadores: jogadores.slice(0, 5) },
        { jogadores: jogadores.slice(5, 10) },
        { jogadores: jogadores.slice(10, 15) },
      ];

      const times = sortearTimesEquilibrados(jogadores, 3, 5, timesAnterior);

      // Verifica que houve tentativa de diversificação
      // (pelo menos alguns jogadores mudaram de time)
      const jogadoresTime1Anterior = new Set(timesAnterior[0].jogadores.map((j) => j.id));
      const jogadoresTime1Atual = new Set(times[0].jogadores.map((j) => j.id));
      
      // Não devem ser exatamente iguais (pode falhar ocasionalmente por aleatoriedade)
      // Mas a probabilidade de serem idênticos é muito baixa
      expect(jogadoresTime1Atual).not.toEqual(jogadoresTime1Anterior);
    });
  });

  describe('calcularPoderTime', () => {
    it('deve calcular soma dos overalls', () => {
      const jogadores = [
        { overall: 10 } as Jogador,
        { overall: 20 } as Jogador,
        { overall: 15 } as Jogador,
      ];

      const poder = calcularPoderTime(jogadores);
      expect(poder).toBe(45);
    });

    it('deve retornar 0 para array vazio', () => {
      expect(calcularPoderTime([])).toBe(0);
    });

    it('deve usar 10 como default quando overall não definido', () => {
      const jogadores = [
        { overall: undefined } as unknown as Jogador,
        { overall: 20 } as Jogador,
      ];

      const poder = calcularPoderTime(jogadores);
      expect(poder).toBe(30); // 10 + 20
    });
  });

  describe('timesEstaoEquilibrados', () => {
    it('deve retornar true quando diferença de poder <= threshold', () => {
        const times: TimeBalanceado[] = [
          { id: 1, nome: 'Time 1', cor: '#16a34a', jogadores: [{ overall: 25 } as any, { overall: 25 } as any], poderTotal: 50, poderMedio: 25 },
          { id: 2, nome: 'Time 2', cor: '#f8fafc', jogadores: [{ overall: 25 } as any, { overall: 25 } as any], poderTotal: 50, poderMedio: 25 },
          { id: 3, nome: 'Time 3', cor: '#18181b', jogadores: [{ overall: 25 } as any, { overall: 25 } as any], poderTotal: 50, poderMedio: 25 },
      ];

      expect(timesEstaoEquilibrados(times, 10)).toBe(true);
    });

    it('deve retornar false quando diferença de poder > threshold', () => {
        const times: TimeBalanceado[] = [
          { id: 1, nome: 'Time 1', cor: '#16a34a', jogadores: [{ overall: 25 } as any, { overall: 25 } as any], poderTotal: 50, poderMedio: 25 },
          { id: 2, nome: 'Time 2', cor: '#f8fafc', jogadores: [{ overall: 35 } as any, { overall: 35 } as any], poderTotal: 70, poderMedio: 35 },
          { id: 3, nome: 'Time 3', cor: '#18181b', jogadores: [{ overall: 25 } as any, { overall: 25 } as any], poderTotal: 50, poderMedio: 25 },
      ];

      expect(timesEstaoEquilibrados(times, 10)).toBe(false);
    });
  });
});