import axios from "axios";

// ---------------------------------------------------------------------------
// Configuracao de rede
// ---------------------------------------------------------------------------
// Emulador Android: http://10.0.2.2:8000
// iOS Simulator:    http://localhost:8000
// Dispositivo fisico: use o IP da sua maquina, ex: http://192.168.X.X:8000
// Como voce esta abrindo via exp://192.168.100.12, defina o fallback para esse host
let API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.12:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

let authToken: string | null = null;

export const setAuthToken = (token?: string | null) => {
  authToken = token ?? null;
  if (authToken) {
    api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const setBaseURL = (url: string) => {
  API_BASE_URL = url;
  api.defaults.baseURL = url;
};

export const getBaseURL = () => API_BASE_URL;

// ---------------------------------------------------------------------------
// Tipagem (espelha o backend)
// ---------------------------------------------------------------------------

export interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Paciente {
  id: number;
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
  data_cadastro: string;
  responsavel_id?: number;
}

export interface Agendamento {
  id: number;
  paciente_id: number;
  data_hora_inicio: string;
  data_hora_fim: string;
  tipo: string;
  status: "agendado" | "confirmado" | "finalizado" | "cancelado" | string;
  valor_previsto?: number | null;
  sala?: string | null;
  observacoes?: string;
  paciente: Paciente;
  responsavel_id?: number;
}

export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa" | string;
  categoria: string;
  pago: boolean;
  data_competencia: string;
  responsavel_id?: number;
}

export interface CreatePacienteDTO {
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
}

// ---------------------------------------------------------------------------
// Funcoes de servico
// ---------------------------------------------------------------------------

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", { email, password });
  setAuthToken(response.data.access_token);
  return response.data;
};

export const fetchAgenda = async (): Promise<Agendamento[]> => {
  const response = await api.get<Agendamento[]>("/agendamentos/");
  return response.data;
};

export const fetchFinanceiro = async (): Promise<Transacao[]> => {
  const response = await api.get<Transacao[]>("/financeiro/");
  return response.data;
};

export const createPaciente = async (payload: CreatePacienteDTO): Promise<Paciente> => {
  const response = await api.post<Paciente>("/pacientes/", payload);
  return response.data;
};

// ---------------------------------------------------------------------------
// API agrupada
// ---------------------------------------------------------------------------

export const AuraAPI = {
  login,

  setBaseURL,
  getBaseURL,
  setAuthToken,
  clearAuthToken: () => setAuthToken(null),

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  getPacientes: async (): Promise<Paciente[]> => {
    const response = await api.get<Paciente[]>("/pacientes/");
    return response.data;
  },

  createPaciente,

  getAgenda: fetchAgenda,

  getFinanceiro: fetchFinanceiro,

  createAgendamento: async (payload: Omit<Agendamento, "id" | "paciente">) => {
    const response = await api.post<Agendamento>("/agendamentos/", payload);
    return response.data;
  },

  createTransacao: async (payload: Omit<Transacao, "id" | "data_competencia">) => {
    const response = await api.post<Transacao>("/financeiro/transacoes/", payload);
    return response.data;
  },

  healthCheck: async () => {
    try {
      const response = await api.get("/");
      return response.data;
    } catch (error) {
      return { status: "offline", error };
    }
  },
};

export default api;
