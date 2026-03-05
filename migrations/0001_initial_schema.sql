-- Gendarmes réservistes
CREATE TABLE IF NOT EXISTS gendarmes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matricule TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  grade TEXT NOT NULL,
  specialite TEXT,
  telephone TEXT,
  email TEXT,
  disponible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Missions
CREATE TABLE IF NOT EXISTS missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  lieu TEXT NOT NULL,
  date_debut DATETIME NOT NULL,
  date_fin DATETIME NOT NULL,
  effectifs_requis INTEGER DEFAULT 1,
  competences_requises TEXT,
  priorite TEXT DEFAULT 'normale' CHECK(priorite IN ('basse', 'normale', 'haute', 'urgente')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Assignations (relation entre gendarmes et missions)
CREATE TABLE IF NOT EXISTS assignations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_id INTEGER NOT NULL,
  gendarme_id INTEGER,
  statut TEXT DEFAULT 'libre' CHECK(statut IN ('libre', 'en_attente', 'valide')),
  commentaire TEXT,
  assigned_at DATETIME,
  validated_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
  FOREIGN KEY (gendarme_id) REFERENCES gendarmes(id) ON DELETE SET NULL
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_assignations_mission ON assignations(mission_id);
CREATE INDEX IF NOT EXISTS idx_assignations_gendarme ON assignations(gendarme_id);
CREATE INDEX IF NOT EXISTS idx_assignations_statut ON assignations(statut);
CREATE INDEX IF NOT EXISTS idx_gendarmes_matricule ON gendarmes(matricule);
CREATE INDEX IF NOT EXISTS idx_missions_dates ON missions(date_debut, date_fin);
