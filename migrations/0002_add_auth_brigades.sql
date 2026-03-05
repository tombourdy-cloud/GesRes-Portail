-- Nouvelle migration pour ajouter les tables compagnies, brigades, utilisateurs et mettre à jour missions

-- Table des utilisateurs administrateurs
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK(role IN ('admin', 'super_admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des compagnies de gendarmerie
CREATE TABLE IF NOT EXISTS compagnies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  adresse TEXT,
  telephone TEXT,
  email TEXT,
  commandant TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des brigades (rattachées aux compagnies)
CREATE TABLE IF NOT EXISTS brigades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  compagnie_id INTEGER NOT NULL,
  nom TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  adresse TEXT NOT NULL,
  telephone TEXT,
  email TEXT,
  effectifs INTEGER DEFAULT 0,
  chef_brigade TEXT,
  latitude REAL,
  longitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE,
  UNIQUE(compagnie_id, nom)
);

-- Table pour l'écusson personnalisé
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ajouter les nouveaux champs à la table missions
ALTER TABLE missions ADD COLUMN numero_mission TEXT;
ALTER TABLE missions ADD COLUMN brigade_id INTEGER REFERENCES brigades(id);

-- Créer des index
CREATE INDEX IF NOT EXISTS idx_brigades_compagnie ON brigades(compagnie_id);
CREATE INDEX IF NOT EXISTS idx_missions_brigade ON missions(brigade_id);
CREATE INDEX IF NOT EXISTS idx_missions_numero ON missions(numero_mission);

-- Insérer un utilisateur admin par défaut (mot de passe: admin123)
-- Hash bcrypt de "admin123": $2b$10$rEqZXyKVJZ7xJZ7xJZ7xJeqZXyKVJZ7xJZ7xJZ7xJeqZXyKVJZ7xJ
INSERT OR IGNORE INTO users (username, password_hash, nom, prenom, role) VALUES 
  ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J8zBQPvLBH8FXjLH5PqITzBdH.hEWa', 'Administrateur', 'Système', 'super_admin');

-- Insérer un écusson par défaut
INSERT OR IGNORE INTO config (key, value) VALUES 
  ('logo_url', '/static/default-logo.png');
