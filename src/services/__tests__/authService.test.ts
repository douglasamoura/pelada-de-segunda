import { AuthService, normalizarLogin, gerarHashSenha, verificarSenha } from '../authService';
import { Jogador } from '../../types';

const jogadoresMock: Jogador[] = [
  {
    id: 'j_douglas',
    nome: 'Douglas',
    status: 'Mensalista' as const,
    posicao: 'Linha' as const,
    avatar: '⭐',
    velocidade: 5,
    chute: 5,
    marcacao: 5,
    passe: 5,
    habilidade: 5,
    overall: 25,
    ehAdmin: true,
    papel: 'admin' as const,
  },
  {
    id: 'j_alex',
    nome: 'Alex',
    status: 'Mensalista' as const,
    posicao: 'Linha' as const,
    avatar: '⭐',
    velocidade: 1,
    chute: 1,
    marcacao: 2,
    passe: 1,
    habilidade: 1,
    overall: 6,
  },
  {
    id: 'j_bahia',
    nome: 'Bahia',
    status: 'Mensalista' as const,
    posicao: 'Linha' as const,
    avatar: '⭐',
    velocidade: 5,
    chute: 3,
    marcacao: 4,
    passe: 3,
    habilidade: 3,
    overall: 18,
    ehAdmin: true,
    papel: 'admin' as const,
  },
];

describe('authService', () => {
  describe('normalizarLogin', () => {
    it('deve remover acentos', () => {
      expect(normalizarLogin('Rogério')).toBe('rogerio');
      expect(normalizarLogin('Filipão')).toBe('filipao');
      expect(normalizarLogin('Leo Sanfona')).toBe('leosanfona');
    });

    it('deve converter para lowercase', () => {
      expect(normalizarLogin('DOUGLAS')).toBe('douglas');
      expect(normalizarLogin('Douglas')).toBe('douglas');
    });

    it('deve remover espaços e caracteres especiais', () => {
      expect(normalizarLogin('Leo Sanfona')).toBe('leosanfona');
      expect(normalizarLogin('João Silva')).toBe('joaosilva');
      expect(normalizarLogin('Test@User!')).toBe('testuser');
    });

    it('deve retornar string vazia para entrada vazia', () => {
      expect(normalizarLogin('')).toBe('');
      expect(normalizarLogin(null as any)).toBe('');
      expect(normalizarLogin(undefined as any)).toBe('');
    });
  });

  describe('gerarHashSenha / verificarSenha', () => {
    it('deve gerar hash e verificar senha correta', async () => {
      const senha = 'minhaSenha123';
      const hash = await gerarHashSenha(senha);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(senha);
      expect(hash.startsWith('$2')).toBe(true); // bcrypt hash
      
      const valido = await verificarSenha(senha, hash);
      expect(valido).toBe(true);
    });

    it('deve rejeitar senha incorreta', async () => {
      const hash = await gerarHashSenha('senhaCorreta');
      const valido = await verificarSenha('senhaErrada', hash);
      expect(valido).toBe(false);
    });

    it('deve gerar hashes diferentes para a mesma senha', async () => {
      const hash1 = await gerarHashSenha('mesmaSenha');
      const hash2 = await gerarHashSenha('mesmaSenha');
      
      expect(hash1).not.toBe(hash2);
      
      // Mas ambos devem validar a senha
      expect(await verificarSenha('mesmaSenha', hash1)).toBe(true);
      expect(await verificarSenha('mesmaSenha', hash2)).toBe(true);
    });
  });

  describe('AuthService.autenticar', () => {
    it('deve autenticar Douglas (admin principal) com senha correta', async () => {
      const res = await AuthService.autenticar('douglas', '654321', jogadoresMock);
      
      expect(res.sucesso).toBe(true);
      expect(res.usuario).toBeDefined();
      expect(res.usuario?.ehAdmin).toBe(true);
      expect(res.usuario?.papel).toBe('admin');
      expect(res.usuario?.login).toBe('douglas');
    });

    it('deve rejeitar Douglas com senha incorreta', async () => {
      const res = await AuthService.autenticar('douglas', 'senhaErrada', jogadoresMock);
      
      expect(res.sucesso).toBe(false);
      expect(res.mensagem).toContain('incorreta');
    });

    it('deve autenticar jogador comum com senha padrão', async () => {
      const res = await AuthService.autenticar('alex', '123456', jogadoresMock);
      
      expect(res.sucesso).toBe(true);
      expect(res.usuario).toBeDefined();
      expect(res.usuario?.ehAdmin).toBe(false);
      expect(res.usuario?.papel).toBe('jogador');
      expect(res.usuario?.login).toBe('alex');
    });

    it('deve rejeitar jogador comum com senha incorreta', async () => {
      const res = await AuthService.autenticar('alex', 'senhaErrada', jogadoresMock);
      
      expect(res.sucesso).toBe(false);
      expect(res.mensagem).toContain('incorreta');
    });

    it('deve autenticar admin promovido (Bahia) com senha admin', async () => {
      const res = await AuthService.autenticar('bahia', '654321', jogadoresMock);
      
      expect(res.sucesso).toBe(true);
      expect(res.usuario?.ehAdmin).toBe(true);
      expect(res.usuario?.papel).toBe('admin');
    });

    it('deve autenticar admin promovido com senha admin (654321)', async () => {
          const res = await AuthService.autenticar('bahia', '654321', jogadoresMock);
      
      expect(res.sucesso).toBe(true);
      expect(res.usuario?.ehAdmin).toBe(true);
    });

    it('deve rejeitar usuário inexistente', async () => {
      const res = await AuthService.autenticar('usuarioInexistente', '123456', jogadoresMock);
      
      expect(res.sucesso).toBe(false);
      expect(res.mensagem).toContain('não encontrado');
    });

    it('deve rejeitar login vazio', async () => {
      const res = await AuthService.autenticar('', '123456', jogadoresMock);
      
      expect(res.sucesso).toBe(false);
      expect(res.mensagem).toContain('informe seu nome');
    });

    it('deve rejeitar senha vazia', async () => {
      const res = await AuthService.autenticar('alex', '', jogadoresMock);
      
      expect(res.sucesso).toBe(false);
      expect(res.mensagem).toContain('informe sua senha');
    });

    it('deve normalizar login com acentos e espaços', async () => {
      // Adiciona jogador com acento
      const jogadoresComAcento = [
        ...jogadoresMock,
        {
          id: 'j_rogerio',
          nome: 'Rogério',
              status: 'Mensalista' as const,
              posicao: 'Linha' as const,
          avatar: '⭐',
          velocidade: 2,
          chute: 3,
          marcacao: 2,
          passe: 3,
          habilidade: 3,
          overall: 13,
        },
      ];

      const res = await AuthService.autenticar('Rogério', '123456', jogadoresComAcento);
      
      expect(res.sucesso).toBe(true);
      expect(res.usuario?.login).toBe('rogerio');
    });
  });
});