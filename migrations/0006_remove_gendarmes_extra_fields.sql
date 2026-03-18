-- Migration : Suppression complète des colonnes matricule, specialite, telephone, email
-- Ces champs ne sont plus utilisés dans l'interface

-- Étape 1 : Créer une nouvelle table simplifiée (uniquement nom, prenom, grade)
CREATE TABLE IF NOT EXISTS gendarmes_simplified (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  grade TEXT NOT NULL,
  disponible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Étape 2 : Copier uniquement les données essentielles
INSERT INTO gendarmes_simplified (id, nom, prenom, grade, disponible, created_at)
SELECT id, nom, prenom, grade, disponible, created_at
FROM gendarmes;

-- Étape 3 : Supprimer l'ancienne table
DROP TABLE gendarmes;

-- Étape 4 : Renommer la nouvelle table
ALTER TABLE gendarmes_simplified RENAME TO gendarmes;

-- Étape 5 : Recréer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_gendarmes_nom_prenom ON gendarmes(nom, prenom);
