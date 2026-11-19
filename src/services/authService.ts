import AsyncStorage from '@react-native-async-storage/async-storage';
import bcrypt from 'bcryptjs';
import { Jogador, UsuarioSessao } from '../types';

const SESSAO_KEY = '@pelada_usuario_sessao';
const BCRYPT_ROUNDS = 10;

// Senhas padrão (apenas para primeira configuração/migração)
const SENHA_PADRAO_JOGADOR = '123456';
const SENHA_PADRAO_ADMIN = '654321';

/**
 * Normaliza o nome do jogador para gerar o identificador de login
 * Ex: "Rogério" -> "rogerio", "Filipão" -> "filipao", "Leo Sanfona" -> "leosanfona"
 */
export function normalizarLogin(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '') // remove espaços
    .replace(/[^a-z0-9]/g, ''); // mantém apenas alfanuméricos
}

/**
 * Gera hash bcrypt da senha
 */
export async function gerarHashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, BCRYPT_ROUNDS);
}

/**
 * Verifica senha contra hash
 */
export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

/**
 * Migra senhas antigas (texto plano) para hash bcrypt
 * Deve ser chamado uma vez na inicialização ou via script de migração
 */
export async function migrarSenhasParaHash(players: Jogador[]): Promise<Jogador[]> {
  const atualizados = await Promise.all(
    players.map(async (p) => {
      // Se já tem hash, não faz nada
      if (p.senhaHash && p.senhaHash.startsWith('$2')) {
        return p;
      }
      
      // Determina qual senha padrão usar baseada no papel
      const ehAdmin = p.ehAdmin || p.papel === 'admin' || normalizarLogin(p.nome) === 'douglas';
      const senhaPadrao = ehAdmin ? SENHA_PADRAO_ADMIN : SENHA_PADRAO_JOGADOR;
      
      const senhaHash = await gerarHashSenha(senhaPadrao);
      return { ...p, senhaHash, ehAdmin, papel: ehAdmin ? 'admin' as const : 'jogador' as const };
    })
  );
  return atualizados;
}

export const AuthService = {
  /**
   * Autentica o usuário com base no nome normalizado e senha (com bcrypt)
   */
  async autenticar(
    loginDigitado: string,
    senhaDigitada: string,
    players: Jogador[] = []
  ): Promise<{ sucesso: boolean; mensagem?: string; usuario?: UsuarioSessao }> {
    const loginLimpo = normalizarLogin(loginDigitado);
    const senhaLimpa = String(senhaDigitada || '').trim();

    if (!loginLimpo) {
      return { sucesso: false, mensagem: 'Por favor, informe seu nome de usuário.' };
    }
    if (!senhaLimpa) {
      return { sucesso: false, mensagem: 'Por favor, informe sua senha.' };
    }

    // 1. REGRA DO ADMINISTRADOR PRINCIPAL (DOUGLAS) - login fixo "douglas"
    if (loginLimpo === 'douglas') {
      const douglasPlayer = players.find((p) => normalizarLogin(p.nome) === 'douglas');
      
      // Verifica senha: primeiro tenta hash salvo, depois fallback para senha padrão
      let senhaValida = false;
      if (douglasPlayer?.senhaHash) {
        senhaValida = await verificarSenha(senhaLimpa, douglasPlayer.senhaHash);
      } else {
        // Fallback para senha padrão hardcoded (migração)
        senhaValida = senhaLimpa === SENHA_PADRAO_ADMIN;
      }

      if (senhaValida) {
        const douglasObj = douglasPlayer || {
          id: 'j_douglas',
          nome: 'Douglas',
          avatar: '⭐',
          status: 'Mensalista' as const,
          posicao: 'Linha' as const,
          velocidade: 5,
          chute: 5,
          marcacao: 5,
          passe: 5,
          habilidade: 5,
          overall: 25,
        };

        const usuarioAdmin: UsuarioSessao = {
          ...douglasObj,
          login: 'douglas',
          ehAdmin: true,
                  papel: 'admin' as const,
          autenticadoEm: new Date().toISOString(),
        };

        await this.salvarSessao(usuarioAdmin);
        return { sucesso: true, usuario: usuarioAdmin };
      } else {
        return {
          sucesso: false,
          mensagem: 'Senha de administrador incorreta.',
        };
      }
    }

    // 2. DEMAIS JOGADORES - busca pelo nome normalizado
    const jogador = players.find((p) => normalizarLogin(p.nome) === loginLimpo);

    if (!jogador) {
      return {
        sucesso: false,
        mensagem: `Jogador "${loginDigitado}" não encontrado no elenco. Verifique a grafia do seu nome.`,
      };
    }

    // Verifica se é admin (promovido por outro admin)
    const ehJogadorAdmin = Boolean(jogador.ehAdmin) || jogador.papel === 'admin';

    // Verifica senha com bcrypt
    let senhaValida = false;
    if (jogador.senhaHash) {
      senhaValida = await verificarSenha(senhaLimpa, jogador.senhaHash);
    } else {
      // Fallback para migração: senhas padrão antigas
      const senhaPadrao = ehJogadorAdmin ? SENHA_PADRAO_ADMIN : SENHA_PADRAO_JOGADOR;
      senhaValida = senhaLimpa === senhaPadrao;
    }

    if (!senhaValida) {
      return {
        sucesso: false,
        mensagem: 'Senha incorreta.',
      };
    }

    const usuario: UsuarioSessao = {
      ...jogador,
      login: loginLimpo,
      ehAdmin: ehJogadorAdmin,
          papel: ehJogadorAdmin ? 'admin' as const : 'jogador' as const,
      autenticadoEm: new Date().toISOString(),
    };

    await this.salvarSessao(usuario);
    return { sucesso: true, usuario };
  },

  /**
   * Altera a senha do usuário logado
   */
  async alterarSenha(
    usuarioLogado: UsuarioSessao,
    senhaAtual: string,
    novaSenha: string,
    players: Jogador[]
  ): Promise<{ sucesso: boolean; mensagem: string; usuarioAtualizado?: UsuarioSessao }> {
    // Verifica senha atual
    const jogador = players.find((p) => p.id === usuarioLogado.id);
    if (!jogador) {
      return { sucesso: false, mensagem: 'Jogador não encontrado.' };
    }

    let senhaValida = false;
    if (jogador.senhaHash) {
      senhaValida = await verificarSenha(senhaAtual, jogador.senhaHash);
    } else {
      const ehAdmin = Boolean(jogador.ehAdmin) || jogador.papel === 'admin';
      const senhaPadrao = ehAdmin ? SENHA_PADRAO_ADMIN : SENHA_PADRAO_JOGADOR;
      senhaValida = senhaAtual === senhaPadrao;
    }

    if (!senhaValida) {
      return { sucesso: false, mensagem: 'Senha atual incorreta.' };
    }

    if (novaSenha.length < 4) {
      return { sucesso: false, mensagem: 'A nova senha deve ter pelo menos 4 caracteres.' };
    }

    // Gera novo hash
    const novoHash = await gerarHashSenha(novaSenha);
    
    // Atualiza jogador na lista
    const playersAtualizados = players.map((p) =>
      p.id === jogador.id ? { ...p, senhaHash: novoHash } : p
    );

    // Atualiza sessão
    const usuarioAtualizado: UsuarioSessao = {
      ...usuarioLogado,
      senhaHash: novoHash,
    };
    await this.salvarSessao(usuarioAtualizado);

    return { 
      sucesso: true, 
      mensagem: 'Senha alterada com sucesso!',
      usuarioAtualizado,
    };
  },

  /**
   * Define senha inicial para um jogador (admin)
   */
  async definirSenhaInicial(
    jogadorId: string,
    novaSenha: string,
    players: Jogador[]
  ): Promise<{ sucesso: boolean; mensagem: string; playersAtualizados?: Jogador[] }> {
    const jogador = players.find((p) => p.id === jogadorId);
    if (!jogador) {
      return { sucesso: false, mensagem: 'Jogador não encontrado.' };
    }

    if (novaSenha.length < 4) {
      return { sucesso: false, mensagem: 'A senha deve ter pelo menos 4 caracteres.' };
    }

    const novoHash = await gerarHashSenha(novaSenha);
    const playersAtualizados = players.map((p) =>
      p.id === jogadorId ? { ...p, senhaHash: novoHash } : p
    );

    return { 
      sucesso: true, 
      mensagem: 'Senha definida com sucesso!',
      playersAtualizados,
    };
  },

  /**
   * Recupera a sessão ativa salva no aparelho
   */
  async obterSessaoAtiva(): Promise<UsuarioSessao | null> {
    try {
        const sessaoStr = await AsyncStorage.getItem(SESSAO_KEY);
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
  async salvarSessao(usuario: UsuarioSessao): Promise<void> {
    try {
        await AsyncStorage.setItem(SESSAO_KEY, JSON.stringify(usuario));
    } catch (e) {
      console.error('Erro ao salvar sessão:', e);
    }
  },

  /**
   * Encerra a sessão atual (Logout)
   */
  async encerrarSessao(): Promise<void> {
    try {
        await AsyncStorage.removeItem(SESSAO_KEY);
    } catch (e) {
      console.error('Erro ao encerrar sessão:', e);
    }
  },

  async fazerLogout(): Promise<void> {
    return this.encerrarSessao();
  },
};