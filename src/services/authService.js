import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSAO_KEY = '@pelada_usuario_sessao';

/**
 * Normaliza o nome do jogador para gerar o identificador de login
 * Ex: "Rogério" -> "rogerio", "Filipão" -> "filipao", "Leo Sanfona" -> "leosanfona"
 */
export function normalizarLogin(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '') // remove espaços
    .replace(/[^a-z0-9]/g, ''); // mantém apenas alfanuméricos
}

export const AuthService = {
  /**
   * Autentica o usuário com base no nome sem acentos e senha
   */
  async autenticar(loginDigitado, senhaDigitada, players = []) {
    const loginLimpo = normalizarLogin(loginDigitado);
    const senhaLimpa = String(senhaDigitada || '').trim();

    if (!loginLimpo) {
      return { sucesso: false, mensagem: 'Por favor, informe seu nome de usuário.' };
    }
    if (!senhaLimpa) {
      return { sucesso: false, mensagem: 'Por favor, informe sua senha.' };
    }

    // 1. REGRA DO ADMINISTRADOR PRINCIPAL (DOUGLAS)
    if (loginLimpo === 'douglas') {
      if (senhaLimpa === '654321') {
        const douglasObj = players.find((p) => normalizarLogin(p.nome) === 'douglas') || {
          id: 'j_douglas',
          nome: 'Douglas',
          avatar: '⭐',
          status: 'Mensalista',
          posicao: 'Linha',
        };

        const usuarioAdmin = {
          ...douglasObj,
          login: 'douglas',
          ehAdmin: true,
          papel: 'admin',
        };

        await this.salvarSessao(usuarioAdmin);
        return { sucesso: true, usuario: usuarioAdmin };
      } else {
        return {
          sucesso: false,
          mensagem: 'Senha de administrador incorreta. (Para Douglas: 654321)',
        };
      }
    }

    // 2. REGRA DOS DEMAIS JOGADORES (ADMINISTRADORES OU COMUNS)
    // Localiza o jogador na lista pelo nome normalizado
    const jogador = players.find((p) => normalizarLogin(p.nome) === loginLimpo);

    if (!jogador) {
      return {
        sucesso: false,
        mensagem: `Jogador "${loginDigitado}" não encontrado no elenco. Verifique a grafia do seu nome.`,
      };
    }

    // Verifica se este jogador foi promovido a Administrador por outro admin
    const ehJogadorAdmin = Boolean(jogador.ehAdmin) || jogador.papel === 'admin';

    if (ehJogadorAdmin) {
      // Administradores promovidos podem autenticar tanto com a senha admin 654321 quanto com 123456
      if (senhaLimpa !== '654321' && senhaLimpa !== '123456') {
        return {
          sucesso: false,
          mensagem: 'Senha de administrador incorreta. (Use 654321 ou 123456)',
        };
      }

      const usuarioAdmin = {
        ...jogador,
        login: loginLimpo,
        ehAdmin: true,
        papel: 'admin',
      };

      await this.salvarSessao(usuarioAdmin);
      return { sucesso: true, usuario: usuarioAdmin };
    }

    // Jogador Comum (senha padrão: 123456)
    if (senhaLimpa !== '123456') {
      return {
        sucesso: false,
        mensagem: 'Senha incorreta. A senha padrão dos jogadores é 123456.',
      };
    }

    const usuarioJogador = {
      ...jogador,
      login: loginLimpo,
      ehAdmin: false,
      papel: 'jogador',
    };

    await this.salvarSessao(usuarioJogador);
    return { sucesso: true, usuario: usuarioJogador };
  },

  /**
   * Recupera a sessão ativa salva no aparelho
   */
  async obterSessaoAtiva() {
    try {
      const storage = AsyncStorage?.getItem ? AsyncStorage : AsyncStorage?.default;
      if (!storage?.getItem) return null;
      const sessaoStr = await storage.getItem(SESSAO_KEY);
      if (!sessaoStr) return null;
      return JSON.parse(sessaoStr);
    } catch (e) {
      console.warn('Erro ao carregar sessão:', e);
      return null;
    }
  },

  /**
   * Salva a sessão ativa
   */
  async salvarSessao(usuario) {
    try {
      const storage = AsyncStorage?.setItem ? AsyncStorage : AsyncStorage?.default;
      if (storage?.setItem) {
        await storage.setItem(SESSAO_KEY, JSON.stringify(usuario));
      }
    } catch (e) {
      console.error('Erro ao salvar sessão:', e);
    }
  },

  /**
   * Encerra a sessão atual (Logout)
   */
  async encerrarSessao() {
    try {
      const storage = AsyncStorage?.setItem ? AsyncStorage : AsyncStorage?.default;
      if (storage?.removeItem) {
        await storage.removeItem(SESSAO_KEY);
      }
    } catch (e) {
      console.error('Erro ao encerrar sessão:', e);
    }
  },

  async fazerLogout() {
    return this.encerrarSessao();
  },
};
