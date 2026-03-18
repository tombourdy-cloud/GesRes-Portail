-- Migration : Simplification table gendarmes
-- Suppression des contraintes et colonnes matricule, specialite, telephone, email

-- Étape 1 : Créer une nouvelle table sans contrainte UNIQUE sur matricule
CREATE TABLE IF NOT EXISTS gendarmes_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matricule TEXT,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  grade TEXT NOT NULL,
  specialite TEXT,
  telephone TEXT,
  email TEXT,
  disponible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Étape 2 : Copier les données existantes
INSERT INTO gendarmes_new (id, matricule, nom, prenom, grade, specialite, telephone, email, disponible, created_at)
SELECT id, matricule, nom, prenom, grade, specialite, telephone, email, disponible, created_at
FROM gendarmes;

-- Étape 3 : Supprimer l'ancienne table
DROP TABLE gendarmes;

-- Étape 4 : Renommer la nouvelle table
ALTER TABLE gendarmes_new RENAME TO gendarmes;

-- Étape 5 : Recréer les index (sans l'index sur matricule qui forçait l'unicité)
CREATE INDEX IF NOT EXISTS idx_assignations_gendarme ON assignations(gendarme_id);
CREATE INDEX IF NOT EXISTS idx_gendarmes_nom_prenom ON gendarmes(nom, prenom);
