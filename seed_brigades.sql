-- Données de test pour compagnies et brigades

-- Compagnies de gendarmerie
INSERT OR IGNORE INTO compagnies (nom, code, adresse, telephone, commandant) VALUES 
  ('Compagnie de Gendarmerie de Paris', 'CGP', '1 Boulevard du Palais, 75001 Paris', '01 53 71 53 71', 'Colonel Dubois'),
  ('Compagnie de Gendarmerie de Lyon', 'CGL', '15 Rue de la Martinière, 69001 Lyon', '04 72 00 10 00', 'Lieutenant-Colonel Martin'),
  ('Compagnie de Gendarmerie de Marseille', 'CGM', '32 Boulevard de la Corderie, 13007 Marseille', '04 91 39 80 00', 'Commandant Bernard'),
  ('Compagnie de Gendarmerie de Toulouse', 'CGT', '8 Rue du Rempart Saint-Étienne, 31000 Toulouse', '05 34 41 47 00', 'Commandant Leroy');

-- Brigades rattachées aux compagnies
INSERT OR IGNORE INTO brigades (compagnie_id, nom, code, adresse, telephone, chef_brigade, effectifs) VALUES 
  -- Paris
  (1, 'Brigade de Paris Centre', 'BPC', '1 Rue de Lutèce, 75004 Paris', '01 42 76 25 00', 'Capitaine Rousseau', 25),
  (1, 'Brigade de Paris Nord', 'BPN', '15 Rue Marx Dormoy, 75018 Paris', '01 53 41 50 00', 'Capitaine Durand', 20),
  (1, 'Brigade de Paris Sud', 'BPS', '42 Avenue du Général Leclerc, 75014 Paris', '01 43 22 40 00', 'Lieutenant Moreau', 18),
  
  -- Lyon
  (2, 'Brigade de Lyon Centre', 'BLC', '3 Place Bellecour, 69002 Lyon', '04 78 42 26 56', 'Capitaine Petit', 22),
  (2, 'Brigade de Lyon Est', 'BLE', '25 Avenue Lacassagne, 69003 Lyon', '04 78 54 32 10', 'Lieutenant Laurent', 16),
  (2, 'Brigade de Lyon Ouest', 'BLO', '10 Rue de Trion, 69005 Lyon', '04 78 25 18 00', 'Capitaine Simon', 19),
  
  -- Marseille
  (3, 'Brigade de Marseille Centre', 'BMC', '5 Rue de la République, 13001 Marseille', '04 91 90 40 40', 'Commandant Michel', 28),
  (3, 'Brigade de Marseille Nord', 'BMN', '45 Boulevard National, 13003 Marseille', '04 91 02 52 00', 'Capitaine Thomas', 24),
  (3, 'Brigade de Marseille Sud', 'BMS', '112 Avenue de Mazargues, 13008 Marseille', '04 91 71 14 00', 'Lieutenant Blanc', 20),
  
  -- Toulouse
  (4, 'Brigade de Toulouse Centre', 'BTC', '12 Place du Capitole, 31000 Toulouse', '05 61 11 22 33', 'Capitaine Garcia', 21),
  (4, 'Brigade de Toulouse Nord', 'BTN', '8 Chemin de la Loge, 31200 Toulouse', '05 61 57 80 00', 'Lieutenant Roux', 17),
  (4, 'Brigade de Toulouse Sud', 'BTS', '25 Route de Narbonne, 31400 Toulouse', '05 62 19 30 00', 'Capitaine Fabre', 19);

-- Mettre à jour les missions existantes avec des brigades
UPDATE missions SET numero_mission = 'M2026-001', brigade_id = 1 WHERE id = 1;
UPDATE missions SET numero_mission = 'M2026-002', brigade_id = 4 WHERE id = 2;
UPDATE missions SET numero_mission = 'M2026-003', brigade_id = 7 WHERE id = 3;
UPDATE missions SET numero_mission = 'M2026-004', brigade_id = 10 WHERE id = 4;
UPDATE missions SET numero_mission = 'M2026-005', brigade_id = 7 WHERE id = 5;
UPDATE missions SET numero_mission = 'M2026-006', brigade_id = 4 WHERE id = 6;
