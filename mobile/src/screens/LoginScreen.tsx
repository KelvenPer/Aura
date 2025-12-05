import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const orbAnimA = useRef(new Animated.Value(0)).current;
  const orbAnimB = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  const startIntroAnimations = () => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(actionsAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
    ]).start();
  };

  const startFloatingOrbs = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnimA, {
          toValue: 1,
          duration: 9000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(orbAnimA, {
          toValue: 0,
          duration: 9000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnimB, {
          toValue: 1,
          duration: 12000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(orbAnimB, {
          toValue: 0,
          duration: 12000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  };

  const startShine = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startIntroAnimations();
    startFloatingOrbs();
    startShine();
  }, []);

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

  const orbAStyle = {
    transform: [
      {
        translateX: orbAnimA.interpolate({ inputRange: [0, 1], outputRange: [0, 26] }),
      },
      {
        translateY: orbAnimA.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }),
      },
      {
        scale: orbAnimA.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }),
      },
    ],
  };

  const orbBStyle = {
    transform: [
      {
        translateX: orbAnimB.interpolate({ inputRange: [0, 1], outputRange: [0, -22] }),
      },
      {
        translateY: orbAnimB.interpolate({ inputRange: [0, 1], outputRange: [0, 30] }),
      },
      {
        scale: orbAnimB.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] }),
      },
    ],
  };

  const headerStyle = {
    opacity: headerAnim,
    transform: [
      {
        translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
      },
    ],
  };

  const formStyle = {
    opacity: formAnim,
    transform: [
      {
        translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
      },
    ],
  };

  const actionsStyle = {
    opacity: actionsAnim,
    transform: [
      {
        translateY: actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
      },
    ],
  };

  const shineTranslate = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-220, 220],
  });

  const renderInput = ({
    label,
    value,
    onChangeText,
    icon,
    placeholder,
    isPassword,
    keyboardType,
    fieldKey,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    icon: React.ReactNode;
    placeholder: string;
    isPassword?: boolean;
    keyboardType?: "email-address" | "default" | "phone-pad";
    fieldKey: string;
  }) => {
    const focused = focusedField === fieldKey;
    return (
      <View
        style={[
          styles.inputRow,
          focused && { borderColor: "#818CF8", shadowColor: "#6366F1", shadowOpacity: 0.3, shadowRadius: 12 },
        ]}
      >
        <View style={[styles.inputIconBox, focused && { backgroundColor: "rgba(99,102,241,0.18)" }]}>
          {icon}
        </View>
        <View style={styles.inputColumn}>
          <Text style={[styles.inputLabel, focused && { color: "#C7D2FE" }]}>{label}</Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            keyboardType={keyboardType}
            secureTextEntry={isPassword && !showPassword}
            style={styles.input}
            onFocus={() => setFocusedField(fieldKey)}
            onBlur={() => setFocusedField(null)}
          />
        </View>
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
            {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.background}>
            <Animated.View style={[styles.orbIndigo, orbAStyle]} />
            <Animated.View style={[styles.orbViolet, orbBStyle]} />
            <View style={styles.orbTeal} />
          </View>

          <Animated.View style={[styles.header, headerStyle]}>
            <View style={styles.logoBox}>
              <Bot size={36} color="#ffffff" />
              <View style={styles.logoPulse} />
            </View>
            <View>
              <Text style={styles.title} numberOfLines={1}>
                AURA
              </Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.card, formStyle]}>
            <View style={styles.cardHeader}>
              <Text style={styles.formTitle}>Entrar</Text>
              <Text style={styles.formSub}>Acesso seguro e instantaneo.</Text>
            </View>

            {renderInput({
              label: "E-mail profissional",
              value: email,
              onChangeText: setEmail,
              icon: <Mail size={18} color="#A5B4FC" />,
              placeholder: "dr.kelven@aura.app",
              keyboardType: "email-address",
              fieldKey: "email",
            })}

            {renderInput({
              label: "Senha",
              value: password,
              onChangeText: setPassword,
              icon: <Lock size={18} color="#A5B4FC" />,
              placeholder: "Sua senha",
              isPassword: true,
              fieldKey: "password",
            })}

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
              style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            >
              <Animated.View style={[styles.shine, { transform: [{ translateX: shineTranslate }] }]} />
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.primaryContent}>
                  <Text style={styles.primaryText}>Entrar no sistema</Text>
                  <ChevronRight size={18} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.cardAlt, actionsStyle]}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Acesso rapido</Text>
              <View style={styles.dividerLine} />
            </View>

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
                <View style={styles.secondaryIconBox}>
                  <Fingerprint size={20} color="#34D399" />
                </View>
              )}
              <Text style={styles.secondaryText}>
                {bioSupported ? "Entrar com biometria" : "Biometria indisponivel"}
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

            <TouchableOpacity style={styles.createAccountButton} onPress={() => setCreateVisible(true)}>
              <Text style={styles.createAccountText}>Criar conta</Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <ShieldCheck size={16} color="#10B981" />
              <Text style={styles.footerText}>Acesso protegido</Text>
            </View>
            <Text style={styles.version}>Secure Access v2.2.0</Text>
          </Animated.View>
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
  safe: { flex: 1, backgroundColor: "#050B14" },
  scroll: { flexGrow: 1, padding: 18, gap: 14, paddingBottom: 18 },
  background: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  orbIndigo: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 200,
    backgroundColor: "rgba(99,102,241,0.28)",
    opacity: 0.8,
  },
  orbViolet: {
    position: "absolute",
    right: -100,
    top: 120,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: "rgba(129,140,248,0.22)",
    opacity: 0.75,
  },
  orbTeal: {
    position: "absolute",
    bottom: -140,
    left: 20,
    width: 280,
    height: 280,
    borderRadius: 200,
    backgroundColor: "rgba(16,185,129,0.18)",
    opacity: 0.6,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8, marginBottom: 4 },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "rgba(30,41,59,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(129,140,248,0.4)",
    shadowColor: "#6366F1",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 10,
  },
  logoPulse: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 8,
    backgroundColor: "#10B981",
    bottom: -4,
    right: -4,
    shadowColor: "#10B981",
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  title: { color: "#fff", fontSize: 26, fontWeight: "900", letterSpacing: 1 },
  subtitle: { color: "#A5B4FC", fontSize: 12, lineHeight: 16, marginTop: 2, maxWidth: 240 },
  card: {
    backgroundColor: "rgba(15,23,42,0.75)",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  cardHeader: { gap: 4 },
  formTitle: { color: "#E5E7EB", fontSize: 18, fontWeight: "800" },
  formSub: { color: "#9CA3AF", fontSize: 13 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(17,24,39,0.55)",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.7)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputIconBox: {
    padding: 8,
    backgroundColor: "rgba(31,41,55,0.8)",
    borderRadius: 12,
  },
  inputColumn: { flex: 1, gap: 2 },
  inputLabel: { color: "#6B7280", fontSize: 11, letterSpacing: 0.4, fontWeight: "700" },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 0,
  },
  eyeButton: { padding: 8 },
  forgotRow: { flexDirection: "row", justifyContent: "flex-end" },
  forgotText: { color: "#A5B4FC", fontSize: 12, fontWeight: "700" },
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
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#6366F1",
    shadowOpacity: 0.32,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 7,
  },
  shine: {
    position: "absolute",
    width: 120,
    height: "120%",
    backgroundColor: "rgba(255,255,255,0.18)",
    transform: [{ rotate: "18deg" }],
    left: 0,
    top: -10,
  },
  primaryContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  cardAlt: {
    backgroundColor: "rgba(12,17,35,0.72)",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 22,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    gap: 12,
  },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#1F2937" },
  dividerText: { marginHorizontal: 8, color: "#6B7280", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  socialRow: { flexDirection: "row", gap: 10 },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(17,24,39,0.72)",
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingVertical: 12,
    borderRadius: 14,
  },
  socialText: { color: "#E5E7EB", fontSize: 13, fontWeight: "700" },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(13,17,35,0.8)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.25)",
    paddingVertical: 12,
    borderRadius: 14,
  },
  secondaryIconBox: {
    padding: 8,
    backgroundColor: "rgba(52,211,153,0.08)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.24)",
  },
  secondaryText: { color: "#E5E7EB", fontSize: 14, fontWeight: "700" },
  bioMessage: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    padding: 10,
  },
  bioMessageText: { color: "#9CA3AF", fontSize: 12, textAlign: "center", fontWeight: "700" },
  createAccountButton: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "rgba(17,24,39,0.6)",
  },
  createAccountText: { color: "#A5B4FC", fontSize: 14, fontWeight: "800" },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 },
  footerText: { color: "#9CA3AF", fontSize: 12 },
  version: { color: "#6B7280", fontSize: 10, textAlign: "center", marginTop: -2 },
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
});
