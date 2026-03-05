-- Données de test pour les gendarmes
INSERT OR IGNORE INTO gendarmes (matricule, nom, prenom, grade, specialite, telephone, email) VALUES 
  ('GR001', 'Dupont', 'Jean', 'Gendarme', 'Sécurité routière', '0612345678', 'jean.dupont@gendarmerie.fr'),
  ('GR002', 'Martin', 'Sophie', 'Brigadier', 'Investigation criminelle', '0623456789', 'sophie.martin@gendarmerie.fr'),
  ('GR003', 'Bernard', 'Pierre', 'Maréchal des logis', 'Maintien de l''ordre', '0634567890', 'pierre.bernard@gendarmerie.fr'),
  ('GR004', 'Dubois', 'Marie', 'Adjudant', 'Cybercriminalité', '0645678901', 'marie.dubois@gendarmerie.fr'),
  ('GR005', 'Leroy', 'Thomas', 'Gendarme', 'Surveillance générale', '0656789012', 'thomas.leroy@gendarmerie.fr'),
  ('GR006', 'Moreau', 'Claire', 'Brigadier-chef', 'Formation', '0667890123', 'claire.moreau@gendarmerie.fr');

-- Données de test pour les missions
INSERT OR IGNORE INTO missions (titre, description, lieu, date_debut, date_fin, effectifs_requis, competences_requises, priorite) VALUES 
  ('Sécurisation événement sportif', 'Assurer la sécurité lors du marathon régional', 'Stade Municipal, Paris', '2026-04-15 08:00:00', '2026-04-15 18:00:00', 3, 'Maintien de l''ordre, Premiers secours', 'haute'),
  ('Contrôle routier', 'Contrôle de vitesse et d''alcoolémie', 'RN7, sortie Lyon', '2026-03-20 14:00:00', '2026-03-20 20:00:00', 2, 'Sécurité routière', 'normale'),
  ('Patrouille nocturne', 'Surveillance du centre-ville', 'Centre-ville, Marseille', '2026-03-25 22:00:00', '2026-03-26 06:00:00', 2, 'Surveillance générale', 'normale'),
  ('Formation cyber', 'Session de formation sur la cybercriminalité', 'Centre de formation, Toulouse', '2026-04-01 09:00:00', '2026-04-03 17:00:00', 1, 'Cybercriminalité, Formation', 'basse'),
  ('Enquête terrain', 'Investigation suite à une série de cambriolages', 'Secteur Bordeaux Nord', '2026-03-18 08:00:00', '2026-03-22 18:00:00', 2, 'Investigation criminelle', 'urgente'),
  ('Surveillance manifestation', 'Encadrement d''une manifestation autorisée', 'Place de la République, Lyon', '2026-03-30 10:00:00', '2026-03-30 16:00:00', 4, 'Maintien de l''ordre', 'haute');

-- Assignations de test
INSERT OR IGNORE INTO assignations (mission_id, gendarme_id, statut, assigned_at, validated_at) VALUES 
  (1, 3, 'valide', '2026-03-05 10:00:00', '2026-03-05 11:00:00'),
  (1, 6, 'valide', '2026-03-05 10:30:00', '2026-03-05 11:30:00');

INSERT OR IGNORE INTO assignations (mission_id, gendarme_id, statut) VALUES 
  (1, NULL, 'libre');

INSERT OR IGNORE INTO assignations (mission_id, gendarme_id, statut, assigned_at, validated_at) VALUES 
  (2, 1, 'valide', '2026-03-05 09:00:00', '2026-03-05 09:00:00');

INSERT OR IGNORE INTO assignations (mission_id, gendarme_id, statut, assigned_at) VALUES 
  (2, 5, 'en_attente', '2026-03-05 14:00:00');

INSERT OR IGNORE INTO assignations (mission_id, gendarme_id, statut) VALUES 
  (3, NULL, 'libre'),
  (3, NULL, 'libre');

INSERT OR IGNORE INTO assignations (mission_id, gendarme_id, statut, assigned_at, validated_at) VALUES 
  (4, 4, 'valide', '2026-03-04 15:00:00', '2026-03-04 16:00:00');

INSERT OR IGNORE INTO assignations (mission_id, gendarme_id, statut, assigned_at, validated_at) VALUES 
  (5, 2, 'valide', '2026-03-05 08:00:00', '2026-03-05 08:30:00');

INSERT OR IGNORE INTO assignations (mission_id, gendarme_id, statut, assigned_at) VALUES 
  (5, 4, 'en_attente', '2026-03-05 13:00:00');

INSERT OR IGNORE INTO assignations (mission_id, gendarme_id, statut, assigned_at, validated_at) VALUES 
  (6, 3, 'valide', '2026-03-04 11:00:00', '2026-03-04 12:00:00'),
  (6, 6, 'valide', '2026-03-04 11:30:00', '2026-03-04 12:30:00');

INSERT OR IGNORE INTO assignations (mission_id, gendarme_id, statut, assigned_at) VALUES 
  (6, 1, 'en_attente', '2026-03-05 09:00:00'),
  (6, 5, 'en_attente', '2026-03-05 10:00:00');
