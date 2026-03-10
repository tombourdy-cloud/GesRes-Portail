-- Création de la brigade BTA PERSAN
-- D'abord, vérifier/créer la compagnie parent si nécessaire
INSERT OR IGNORE INTO compagnies (nom, created_at) 
VALUES ('Compagnie du Val d''Oise', datetime('now'));

-- Créer la brigade BTA PERSAN
INSERT OR IGNORE INTO brigades (compagnie_id, nom, code, adresse, created_at)
SELECT id, 'Brigade Territoriale Autonome de Persan', 'BTA-PERSAN', 'Persan (95340)', datetime('now')
FROM compagnies WHERE nom = 'Compagnie du Val d''Oise';

-- Insertion des missions de mars 2026 pour la BTA PERSAN
-- Mission 1: 1819992 - 13/03/26 15:00 → 23:00
INSERT INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, priorite, created_at)
SELECT 
  '1819992',
  'Renfort PAM',
  'Ordre et sécurité publique',
  b.id,
  datetime('2026-03-13 15:00:00'),
  datetime('2026-03-13 23:00:00'),
  'normale',
  datetime('now')
FROM brigades b WHERE b.code = 'BTA-PERSAN';

-- Mission 2: 1827585 - 14/03/26 00:30 → 07:00
INSERT INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, priorite, created_at)
SELECT 
  '1827585',
  'Renfort BGE',
  'Ordre et sécurité publique',
  b.id,
  datetime('2026-03-14 00:30:00'),
  datetime('2026-03-14 07:00:00'),
  'normale',
  datetime('now')
FROM brigades b WHERE b.code = 'BTA-PERSAN';

-- Mission 3: 1819702 - 14/03/26 15:00 → 23:00
INSERT INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, priorite, created_at)
SELECT 
  '1819702',
  'Renfort PAM',
  'Ordre et sécurité publique',
  b.id,
  datetime('2026-03-14 15:00:00'),
  datetime('2026-03-14 23:00:00'),
  'normale',
  datetime('now')
FROM brigades b WHERE b.code = 'BTA-PERSAN';

-- Mission 4: 1827585 - 15/03/26 00:30 → 07:00
INSERT INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, priorite, created_at)
SELECT 
  '1827585',
  'Renfort BGE',
  'Ordre et sécurité publique',
  b.id,
  datetime('2026-03-15 00:30:00'),
  datetime('2026-03-15 07:00:00'),
  'normale',
  datetime('now')
FROM brigades b WHERE b.code = 'BTA-PERSAN';

-- Mission 5: 1820123 - 15/03/26 15:00 → 23:00
INSERT INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, priorite, created_at)
SELECT 
  '1820123',
  'Ordre et sécurité publique',
  'Ordre et sécurité publique',
  b.id,
  datetime('2026-03-15 15:00:00'),
  datetime('2026-03-15 23:00:00'),
  'normale',
  datetime('now')
FROM brigades b WHERE b.code = 'BTA-PERSAN';
