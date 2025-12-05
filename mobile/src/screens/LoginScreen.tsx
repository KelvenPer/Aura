import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AlertTriangle,
  Bot,
  ChevronRight,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";

import { AuraAPI, AuthResponse } from "../services/api";

type LoginScreenProps = {
  onSuccess: (auth: AuthResponse) => void;
};

const DEFAULT_EMAIL = "dr.kelven@aura.app";
const DEFAULT_PASSWORD = "aura123";

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotToken, setForgotToken] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [createVisible, setCreateVisible] = useState(false);
  const [createDoc, setCreateDoc] = useState("");
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createPass, setCreatePass] = useState("");
  const [createConfirm, setCreateConfirm] = useState("");
  const [bioSupported, setBioSupported] = useState(false);
  const [bioPending, setBioPending] = useState(false);
  const [bioMessage, setBioMessage] = useState<string | null>(null);
  const [bioStatus, setBioStatus] = useState<"ok" | "warn" | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const auth = await AuraAPI.login(email.trim(), password);
      onSuccess(auth);
    } catch (err: any) {
      console.error("Erro ao autenticar:", err);
      const message =
        err?.message?.includes("Network Error") || err?.code === "ERR_NETWORK"
          ? "Sem conexao com o servidor. Emulador Android use 10.0.2.2, iOS use localhost, dispositivo use o IP da maquina."
          : "Credenciais invalidas ou servidor indisponivel.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const subtitle = useMemo(
    () => "Acesso seguro para sua rotina de atendimentos e gestao financeira",
    []
  );

  useEffect(() => {
    const checkBio = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBioSupported(hasHardware && enrolled);
      if (!hasHardware || !enrolled) {
        setBioMessage("Biometria indisponivel neste dispositivo.");
        setBioStatus("warn");
      }
    };
    checkBio();
  }, []);

  const handleBiometricLogin = async () => {
    if (!bioSupported) return;
    setBioPending(true);
    setBioMessage(null);
    setBioStatus(null);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Autenticar com biometria",
        cancelLabel: "Cancelar",
        disableDeviceFallback: false,
      });
      if (result.success) {
        setBioStatus("ok");
        setBioMessage("Biometria validada, entrando...");
        await handleLogin();
      } else {
        setBioStatus("warn");
        setBioMessage("Autenticacao cancelada ou falhou.");
      }
    } catch (err) {
      console.error("Biometria erro:", err);
      setBioStatus("warn");
      setBioMessage("Nao foi possivel usar biometria.");
    } finally {
      setBioPending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.background}>
            <View style={styles.blobTop} />
            <View style={styles.blobMid} />
            <View style={styles.blobBottom} />
            <View style={styles.pulseCircle} />
            <View style={styles.pulseCircleSmall} />
          </View>

          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Bot size={36} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.title} numberOfLines={1}>
                AURA
              </Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.formTitle}>Entrar</Text>
            <Text style={styles.formSub}>Use seu e-mail profissional para acessar.</Text>

            <View style={styles.inputRow}>
              <View style={styles.inputIconBox}>
                <User size={18} color="#9CA3AF" />
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="dr.kelven@aura.app"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputIconBox}>
                <Lock size={18} color="#9CA3AF" />
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Senha"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>

            <View style={styles.forgotRow}>
              <TouchableOpacity onPress={() => setForgotVisible(true)}>
                <Text style={styles.forgotText}>Esqueci minha senha</Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <AlertTriangle size={16} color="#FB7185" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryText}>Entrar no sistema</Text>
                  <ChevronRight size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                !bioSupported && { opacity: 0.5 },
                bioPending && { opacity: 0.7 },
              ]}
              onPress={handleBiometricLogin}
              disabled={!bioSupported || bioPending}
            >
              {bioPending ? (
                <ActivityIndicator color="#34D399" />
              ) : (
                <Fingerprint size={20} color="#34D399" />
              )}
              <Text style={styles.secondaryText}>
                {bioSupported ? "Biometria" : "Biometria indisponivel"}
              </Text>
            </TouchableOpacity>

            {bioMessage && (
              <View
                style={[
                  styles.bioMessage,
                  bioStatus === "ok" ? { backgroundColor: "rgba(16,185,129,0.12)", borderColor: "#10B981" } : {},
                  bioStatus === "warn" ? { backgroundColor: "rgba(251,191,36,0.1)", borderColor: "#FBBF24" } : {},
                ]}
              >
                <Text
                  style={[
                    styles.bioMessageText,
                    bioStatus === "ok" ? { color: "#10B981" } : {},
                    bioStatus === "warn" ? { color: "#FBBF24" } : {},
                  ]}
                >
                  {bioMessage}
                </Text>
              </View>
            )}

            <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Mail size={18} color="#EAB308" />
              <Text style={styles.socialText}>Gmail</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
                <User size={18} color="#60A5FA" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.createAccountButton} onPress={() => setCreateVisible(true)}>
              <Text style={styles.createAccountText}>Criar conta</Text>
            </TouchableOpacity>

            <View style={{ height: 12 }} />

            <View style={styles.footerRow}>
              <ShieldCheck size={16} color="#10B981" />
              <Text style={styles.footerText}>Acesso protegido</Text>
            </View>
            <Text style={styles.version}>Secure Access v2.1.0</Text>
          </View>
        </ScrollView>

        {forgotVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {forgotStep === 1 ? "Recuperar acesso" : forgotStep === 2 ? "Digite o token" : "Nova senha"}
              </Text>
              <Text style={styles.modalSub}>
                {forgotStep === 1
                  ? "Informe seu e-mail para receber o token."
                  : forgotStep === 2
                  ? "Enviamos um token para o seu e-mail."
                  : "Defina uma nova senha segura."}
              </Text>

              {forgotStep === 1 && (
                <View style={styles.modalInputRow}>
                  <Mail size={18} color="#9CA3AF" />
                  <TextInput
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    placeholder="seuemail@clinica.com"
                    placeholderTextColor="#6B7280"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.modalInput}
                  />
                </View>
              )}

              {forgotStep === 2 && (
                <View style={styles.modalInputRow}>
                  <ShieldCheck size={18} color="#9CA3AF" />
                  <TextInput
                    value={forgotToken}
                    onChangeText={setForgotToken}
                    placeholder="Token de 6 digitos"
                    placeholderTextColor="#6B7280"
                    autoCapitalize="none"
                    style={styles.modalInput}
                  />
                </View>
              )}

              {forgotStep === 3 && (
                <>
                  <View style={styles.modalInputRow}>
                    <Lock size={18} color="#9CA3AF" />
                    <TextInput
                      value={forgotPassword}
                      onChangeText={setForgotPassword}
                      placeholder="Nova senha"
                      placeholderTextColor="#6B7280"
                      secureTextEntry
                      style={styles.modalInput}
                    />
                  </View>
                  <View style={styles.modalInputRow}>
                    <Lock size={18} color="#9CA3AF" />
                    <TextInput
                      value={forgotConfirm}
                      onChangeText={setForgotConfirm}
                      placeholder="Confirmar senha"
                      placeholderTextColor="#6B7280"
                      secureTextEntry
                      style={styles.modalInput}
                    />
                  </View>
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalSecondary}
                  onPress={() => {
                    setForgotVisible(false);
                    setForgotStep(1);
                    setForgotEmail("");
                    setForgotToken("");
                    setForgotPassword("");
                    setForgotConfirm("");
                  }}
                >
                  <Text style={styles.modalSecondaryText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalPrimary}
                  onPress={() => {
                    if (forgotStep < 3) {
                      setForgotStep((prev) => (prev === 1 ? 2 : 3));
                    } else {
                      setForgotVisible(false);
                      setForgotStep(1);
                      setForgotEmail("");
                      setForgotToken("");
                      setForgotPassword("");
                      setForgotConfirm("");
                    }
                  }}
                >
                  <Text style={styles.modalPrimaryText}>
                    {forgotStep === 3 ? "Salvar senha" : "Avancar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {createVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Criar conta</Text>
              <Text style={styles.modalSub}>Preencha seus dados para finalizar o cadastro.</Text>

              <View style={styles.modalInputRow}>
                <User size={18} color="#9CA3AF" />
                <TextInput
                  value={createName}
                  onChangeText={setCreateName}
                  placeholder="Nome completo"
                  placeholderTextColor="#6B7280"
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.modalInputRow}>
                <ShieldCheck size={18} color="#9CA3AF" />
                <TextInput
                  value={createDoc}
                  onChangeText={setCreateDoc}
                  placeholder="Documento do medico (CRM)"
                  placeholderTextColor="#6B7280"
                  autoCapitalize="characters"
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.modalInputRow}>
                <Mail size={18} color="#9CA3AF" />
                <TextInput
                  value={createEmail}
                  onChangeText={setCreateEmail}
                  placeholder="E-mail"
                  placeholderTextColor="#6B7280"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.modalInputRow}>
                <Mail size={18} color="#9CA3AF" />
                <TextInput
                  value={createPhone}
                  onChangeText={setCreatePhone}
                  placeholder="Telefone"
                  placeholderTextColor="#6B7280"
                  keyboardType="phone-pad"
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.modalInputRow}>
                <Lock size={18} color="#9CA3AF" />
                <TextInput
                  value={createPass}
                  onChangeText={setCreatePass}
                  placeholder="Senha"
                  placeholderTextColor="#6B7280"
                  secureTextEntry
                  style={styles.modalInput}
                />
              </View>
              <View style={styles.modalInputRow}>
                <Lock size={18} color="#9CA3AF" />
                <TextInput
                  value={createConfirm}
                  onChangeText={setCreateConfirm}
                  placeholder="Confirmar senha"
                  placeholderTextColor="#6B7280"
                  secureTextEntry
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalSecondary}
                  onPress={() => {
                    setCreateVisible(false);
                    setCreateDoc("");
                    setCreateName("");
                    setCreateEmail("");
                    setCreatePhone("");
                    setCreatePass("");
                    setCreateConfirm("");
                  }}
                >
                  <Text style={styles.modalSecondaryText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalPrimary}
                  onPress={() => {
                    // Placeholder de submissao
                    setCreateVisible(false);
                    setCreateDoc("");
                    setCreateName("");
                    setCreateEmail("");
                    setCreatePhone("");
                    setCreatePass("");
                    setCreateConfirm("");
                  }}
                >
                  <Text style={styles.modalPrimaryText}>Finalizar cadastro</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1024" },
  scroll: { flexGrow: 1, padding: 20, gap: 16, paddingBottom: 40 },
  background: { ...StyleSheet.absoluteFillObject },
  blobTop: {
    position: "absolute",
    top: -140,
    right: -100,
    width: 280,
    height: 280,
    backgroundColor: "rgba(99,102,241,0.25)",
    borderRadius: 200,
  },
  blobMid: {
    position: "absolute",
    top: 120,
    left: -80,
    width: 220,
    height: 220,
    backgroundColor: "rgba(16,185,129,0.16)",
    borderRadius: 200,
  },
  blobBottom: {
    position: "absolute",
    bottom: -160,
    right: -40,
    width: 240,
    height: 240,
    backgroundColor: "rgba(14,165,233,0.2)",
    borderRadius: 220,
  },
  pulseCircle: {
    position: "absolute",
    top: 60,
    right: 40,
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "rgba(99,102,241,0.12)",
    opacity: 0.8,
    transform: [{ scale: 1 }],
  },
  pulseCircleSmall: {
    position: "absolute",
    bottom: 140,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: "rgba(16,185,129,0.15)",
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4, marginBottom: 4 },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 8,
  },
  title: { color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: 1 },
  subtitle: { color: "#9CA3AF", fontSize: 12, lineHeight: 16, marginTop: 2, maxWidth: 220 },
  card: {
    backgroundColor: "rgba(12,17,35,0.92)",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 26,
    elevation: 10,
    gap: 14,
    marginBottom: 12,
  },
  formTitle: { color: "#E5E7EB", fontSize: 18, fontWeight: "800" },
  formSub: { color: "#9CA3AF", fontSize: 13 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(17,24,39,0.7)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputIconBox: {
    padding: 8,
    backgroundColor: "#1F2937",
    borderRadius: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  forgotRow: { flexDirection: "row", justifyContent: "flex-end" },
  forgotText: { color: "#818CF8", fontSize: 12, fontWeight: "700" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(248,113,113,0.12)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.5)",
    borderRadius: 12,
    padding: 10,
  },
  errorText: { color: "#fecdd3", fontSize: 12, flex: 1, fontWeight: "600" },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#6366F1",
    shadowOpacity: 0.32,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 7,
  },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#1F2937" },
  dividerText: { marginHorizontal: 8, color: "#6B7280", fontSize: 11, fontWeight: "700" },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0B1220",
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingVertical: 12,
    borderRadius: 14,
  },
  secondaryText: { color: "#E5E7EB", fontSize: 14, fontWeight: "700" },
  socialRow: { flexDirection: "row", gap: 10 },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(17,24,39,0.8)",
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingVertical: 12,
    borderRadius: 14,
  },
  socialText: { color: "#E5E7EB", fontSize: 13, fontWeight: "700" },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 },
  footerText: { color: "#9CA3AF", fontSize: 12 },
  version: { color: "#6B7280", fontSize: 10, textAlign: "center", marginTop: -4 },
  createAccountButton: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "rgba(17,24,39,0.6)",
  },
  createAccountText: { color: "#A5B4FC", fontSize: 14, fontWeight: "700" },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  modalSub: { color: "#9CA3AF", fontSize: 13 },
  modalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(17,24,39,0.9)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalInput: { flex: 1, color: "#fff", fontSize: 14, fontWeight: "500" },
  modalButtons: { flexDirection: "row", gap: 10, marginTop: 6 },
  modalSecondary: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#374151",
  },
  modalSecondaryText: { color: "#9CA3AF", fontSize: 14, fontWeight: "700" },
  modalPrimary: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#6366F1",
  },
  modalPrimaryText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  bioMessage: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    padding: 10,
  },
  bioMessageText: { color: "#9CA3AF", fontSize: 12, textAlign: "center", fontWeight: "700" },
});
