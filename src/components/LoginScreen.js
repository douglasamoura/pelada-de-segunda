import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AuthService } from '../services/authService';

export default function LoginScreen({ players, onLoginSucesso }) {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleEntrar = async () => {
    setErro('');
    if (!login.trim()) {
      setErro('Informe seu nome de usuário.');
      return;
    }
    if (!senha.trim()) {
      setErro('Informe sua senha.');
      return;
    }

    setCarregando(true);
    try {
      const res = await AuthService.autenticar(login, senha, players);
      if (res.sucesso) {
        onLoginSucesso(res.usuario);
      } else {
        setErro(res.mensagem || 'Falha na autenticação.');
      }
    } catch (e) {
      setErro('Ocorreu um erro ao tentar entrar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* LOGO & CABEÇALHO */}
        <View style={styles.header}>
          <View style={styles.escudoContainer}>
            <Text style={styles.escudoEmoji}>⚽</Text>
          </View>
          <Text style={styles.tituloApp}>PELADA DE SEGUNDA</Text>
          <View style={styles.badgeSeguranca}>
            <Text style={styles.badgeSegurancaTxt}>🔒 Acesso Restrito aos Atletas</Text>
          </View>
        </View>

        {/* CARD DO FORMULÁRIO DE LOGIN */}
        <View style={styles.cardLogin}>
          {/* MENSAGEM DE ERRO */}
          {!!erro && (
            <View style={styles.boxErro}>
              <Text style={styles.boxErroTxt}>⚠️ {erro}</Text>
            </View>
          )}

          {/* CAMPO USUÁRIO */}
          <View style={styles.inputGrupo}>
            <Text style={styles.labelInput}>USUÁRIO / NOME:</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcone}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: douglas, alex, bahia, lucao..."
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                autoCorrect={false}
                value={login}
                onChangeText={(txt) => {
                  setLogin(txt);
                  if (erro) setErro('');
                }}
              />
            </View>
          </View>

          {/* CAMPO SENHA */}
          <View style={styles.inputGrupo}>
            <Text style={styles.labelInput}>SENHA:</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcone}>🔑</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor="#64748b"
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                value={senha}
                onChangeText={(txt) => {
                  setSenha(txt);
                  if (erro) setErro('');
                }}
                onSubmitEditing={handleEntrar}
              />
              <TouchableOpacity
                onPress={() => setMostrarSenha(!mostrarSenha)}
                style={styles.btnOlho}
              >
                <Text style={styles.btnOlhoTxt}>{mostrarSenha ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BOTÃO ENTRAR */}
          <TouchableOpacity
            style={[styles.btnEntrar, carregando && styles.btnEntrarDesabilitado]}
            onPress={handleEntrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#022c22" />
            ) : (
              <Text style={styles.btnEntrarTxt}>⚽ Entrar no App</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031a0e',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 26,
  },
  escudoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#064e3b',
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  escudoEmoji: {
    fontSize: 40,
  },
  tituloApp: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subtituloApp: {
    color: '#a7f3d0',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },
  badgeSeguranca: {
    backgroundColor: '#0a321d',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0f4829',
    marginTop: 8,
  },
  badgeSegurancaTxt: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  cardLogin: {
    backgroundColor: '#062817',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#0f4829',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  boxErro: {
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  boxErroTxt: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  inputGrupo: {
    marginBottom: 16,
  },
  labelInput: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#041f11',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0f4829',
    paddingHorizontal: 12,
  },
  inputIcone: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    paddingVertical: 12,
    fontSize: 14,
  },
  btnOlho: {
    padding: 6,
  },
  btnOlhoTxt: {
    fontSize: 16,
  },
  btnEntrar: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  btnEntrarDesabilitado: {
    opacity: 0.7,
  },
  btnEntrarTxt: {
    color: '#022c22',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

