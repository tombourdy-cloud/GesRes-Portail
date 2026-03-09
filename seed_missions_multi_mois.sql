-- Script pour créer des missions de test sur plusieurs mois
-- Pour démontrer la fonctionnalité de navigation par mois

-- Missions Mars 2026
INSERT OR IGNORE INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, effectifs_requis, priorite) VALUES
('M2026-003', 'Sécurisation Marché', 'Sécurisation du marché hebdomadaire', 2, '2026-03-15 08:00', '2026-03-15 14:00', 3, 'normale'),
('M2026-004', 'Contrôle Routier A16', 'Contrôle de vitesse sur A16', 2, '2026-03-20 07:00', '2026-03-20 19:00', 4, 'haute');

-- Créer les assignations pour ces missions
INSERT INTO assignations (mission_id, gendarme_id, statut) 
SELECT 3, NULL, 'libre' FROM missions WHERE id = 3 UNION ALL
SELECT 3, NULL, 'libre' FROM missions WHERE id = 3 UNION ALL
SELECT 3, NULL, 'libre' FROM missions WHERE id = 3 UNION ALL
SELECT 4, NULL, 'libre' FROM missions WHERE id = 4 UNION ALL
SELECT 4, NULL, 'libre' FROM missions WHERE id = 4 UNION ALL
SELECT 4, NULL, 'libre' FROM missions WHERE id = 4 UNION ALL
SELECT 4, NULL, 'libre' FROM missions WHERE id = 4;

-- Missions Avril 2026
INSERT OR IGNORE INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, effectifs_requis, priorite) VALUES
('M2026-005', 'Opération Tranquillité Vacances', 'Surveillance zones pavillonnaires pendant vacances', 2, '2026-04-05 09:00', '2026-04-25 18:00', 2, 'moyenne'),
('M2026-006', 'Patrouille Nocturne', 'Patrouille nocturne centre-ville', 4, '2026-04-10 21:00', '2026-04-11 05:00', 2, 'normale'),
('M2026-007', 'Sécurité Manifestation', 'Sécurisation manifestation syndicale', 2, '2026-04-18 13:00', '2026-04-18 19:00', 5, 'haute');

-- Créer les assignations
INSERT INTO assignations (mission_id, gendarme_id, statut) 
SELECT 5, NULL, 'libre' FROM missions WHERE id = 5 UNION ALL
SELECT 5, NULL, 'libre' FROM missions WHERE id = 5 UNION ALL
SELECT 6, NULL, 'libre' FROM missions WHERE id = 6 UNION ALL
SELECT 6, NULL, 'libre' FROM missions WHERE id = 6 UNION ALL
SELECT 7, NULL, 'libre' FROM missions WHERE id = 7 UNION ALL
SELECT 7, NULL, 'libre' FROM missions WHERE id = 7 UNION ALL
SELECT 7, NULL, 'libre' FROM missions WHERE id = 7 UNION ALL
SELECT 7, NULL, 'libre' FROM missions WHERE id = 7 UNION ALL
SELECT 7, NULL, 'libre' FROM missions WHERE id = 7;

-- Missions Mai 2026
INSERT OR IGNORE INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, effectifs_requis, priorite) VALUES
('M2026-008', 'Surveillance Festivités 1er Mai', 'Sécurisation festivités du travail', 2, '2026-05-01 10:00', '2026-05-01 20:00', 4, 'haute'),
('M2026-009', 'Contrôle Prévention Routière', 'Campagne prévention alcool au volant', 4, '2026-05-08 18:00', '2026-05-08 23:00', 3, 'normale'),
('M2026-010', 'Surveillance Établissements Scolaires', 'Ronde établissements scolaires', 2, '2026-05-15 07:00', '2026-05-15 09:00', 2, 'normale');

-- Créer les assignations
INSERT INTO assignations (mission_id, gendarme_id, statut) 
SELECT 8, NULL, 'libre' FROM missions WHERE id = 8 UNION ALL
SELECT 8, NULL, 'libre' FROM missions WHERE id = 8 UNION ALL
SELECT 8, NULL, 'libre' FROM missions WHERE id = 8 UNION ALL
SELECT 8, NULL, 'libre' FROM missions WHERE id = 8 UNION ALL
SELECT 9, NULL, 'libre' FROM missions WHERE id = 9 UNION ALL
SELECT 9, NULL, 'libre' FROM missions WHERE id = 9 UNION ALL
SELECT 9, NULL, 'libre' FROM missions WHERE id = 9 UNION ALL
SELECT 10, NULL, 'libre' FROM missions WHERE id = 10 UNION ALL
SELECT 10, NULL, 'libre' FROM missions WHERE id = 10;

-- Missions Juin 2026
INSERT OR IGNORE INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, effectifs_requis, priorite) VALUES
('M2026-011', 'Surveillance Fête de la Musique', 'Sécurisation festivités 21 juin', 2, '2026-06-21 18:00', '2026-06-22 03:00', 6, 'haute'),
('M2026-012', 'Contrôle Vitesse RN14', 'Contrôle radar sur RN14', 4, '2026-06-10 08:00', '2026-06-10 18:00', 2, 'normale');

-- Créer les assignations
INSERT INTO assignations (mission_id, gendarme_id, statut) 
SELECT 11, NULL, 'libre' FROM missions WHERE id = 11 UNION ALL
SELECT 11, NULL, 'libre' FROM missions WHERE id = 11 UNION ALL
SELECT 11, NULL, 'libre' FROM missions WHERE id = 11 UNION ALL
SELECT 11, NULL, 'libre' FROM missions WHERE id = 11 UNION ALL
SELECT 11, NULL, 'libre' FROM missions WHERE id = 11 UNION ALL
SELECT 11, NULL, 'libre' FROM missions WHERE id = 11 UNION ALL
SELECT 12, NULL, 'libre' FROM missions WHERE id = 12 UNION ALL
SELECT 12, NULL, 'libre' FROM missions WHERE id = 12;
