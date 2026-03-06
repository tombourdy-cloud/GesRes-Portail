-- Migration pour rendre les colonnes optionnelles dans missions
-- SQLite ne supporte pas ALTER COLUMN, donc on doit recréer la table

-- Créer une nouvelle table avec la bonne structure
CREATE TABLE missions_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_mission TEXT,
  titre TEXT NOT NULL,
  description TEXT,  -- Maintenant nullable
  lieu TEXT,  -- Maintenant nullable
  brigade_id INTEGER,
  date_debut DATETIME NOT NULL,
  date_fin DATETIME,  -- Maintenant nullable
  effectifs_requis INTEGER DEFAULT 1,
  competences_requises TEXT,
  priorite TEXT DEFAULT 'normale',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (brigade_id) REFERENCES brigades(id)
);

-- Copier les données existantes (s'il y en a)
INSERT INTO missions_new 
  SELECT id, numero_mission, titre, description, lieu, brigade_id, date_debut, date_fin, 
         effectifs_requis, competences_requises, priorite, created_at
  FROM missions;

-- Supprimer l'ancienne table
DROP TABLE missions;

-- Renommer la nouvelle table
ALTER TABLE missions_new RENAME TO missions;

-- Recréer les index si nécessaires
CREATE INDEX IF NOT EXISTS idx_missions_brigade ON missions(brigade_id);
CREATE INDEX IF NOT EXISTS idx_missions_dates ON missions(date_debut, date_fin);
