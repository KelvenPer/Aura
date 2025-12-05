PRAGMA foreign_keys = ON;

-- USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  crm TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- PACIENTES
CREATE TABLE IF NOT EXISTS pacientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  cpf TEXT UNIQUE,
  data_cadastro TEXT NOT NULL DEFAULT (datetime('now')),
  responsavel_id INTEGER,
  FOREIGN KEY (responsavel_id) REFERENCES users(id)
);

-- AGENDAMENTOS
CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente_id INTEGER NOT NULL,
  data_hora_inicio TEXT NOT NULL,
  data_hora_fim TEXT NOT NULL,
  tipo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendado',
  valor_previsto REAL,
  sala TEXT,
  observacoes TEXT,
  responsavel_id INTEGER,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (responsavel_id) REFERENCES users(id)
);

-- FINANCEIRO
CREATE TABLE IF NOT EXISTS transacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  tipo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  pago INTEGER NOT NULL DEFAULT 0,
  data_competencia TEXT NOT NULL DEFAULT (datetime('now')),
  responsavel_id INTEGER,
  FOREIGN KEY (responsavel_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_pacientes_responsavel ON pacientes(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_responsavel ON transacoes(responsavel_id);
