-- Création simple de la compagnie, brigade et missions BTA PERSAN

-- 1. Créer la compagnie
INSERT INTO compagnies (nom, code, adresse, created_at) 
VALUES ('Compagnie du Val d''Oise', 'CIE-VAL-OISE', 'Val d''Oise (95)', datetime('now'));

-- 2. Créer la brigade (on récupère l'ID de la compagnie directement)
INSERT INTO brigades (compagnie_id, nom, code, adresse, created_at)
VALUES (
  (SELECT id FROM compagnies WHERE nom = 'Compagnie du Val d''Oise' LIMIT 1),
  'Brigade Territoriale Autonome de Persan',
  'BTA-PERSAN',
  'Persan (95340)',
  datetime('now')
);

-- 3. Créer les missions
-- Mission 1: 1819992 - 13/03/26 15:00 → 23:00
INSERT INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, priorite, created_at)
VALUES (
  '1819992',
  'Renfort PAM',
  'Ordre et sécurité publique',
  (SELECT id FROM brigades WHERE code = 'BTA-PERSAN' LIMIT 1),
  '2026-03-13 15:00:00',
  '2026-03-13 23:00:00',
  'normale',
  datetime('now')
);

-- Mission 2: 1827585 - 14/03/26 00:30 → 07:00
INSERT INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, priorite, created_at)
VALUES (
  '1827585',
  'Renfort BGE',
  'Ordre et sécurité publique',
  (SELECT id FROM brigades WHERE code = 'BTA-PERSAN' LIMIT 1),
  '2026-03-14 00:30:00',
  '2026-03-14 07:00:00',
  'normale',
  datetime('now')
);

-- Mission 3: 1819702 - 14/03/26 15:00 → 23:00
INSERT INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, priorite, created_at)
VALUES (
  '1819702',
  'Renfort PAM',
  'Ordre et sécurité publique',
  (SELECT id FROM brigades WHERE code = 'BTA-PERSAN' LIMIT 1),
  '2026-03-14 15:00:00',
  '2026-03-14 23:00:00',
  'normale',
  datetime('now')
);

-- Mission 4: 1827585 - 15/03/26 00:30 → 07:00
INSERT INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, priorite, created_at)
VALUES (
  '1827585',
  'Renfort BGE',
  'Ordre et sécurité publique',
  (SELECT id FROM brigades WHERE code = 'BTA-PERSAN' LIMIT 1),
  '2026-03-15 00:30:00',
  '2026-03-15 07:00:00',
  'normale',
  datetime('now')
);

-- Mission 5: 1820123 - 15/03/26 15:00 → 23:00
INSERT INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, priorite, created_at)
VALUES (
  '1820123',
  'Ordre et sécurité publique',
  'Ordre et sécurité publique',
  (SELECT id FROM brigades WHERE code = 'BTA-PERSAN' LIMIT 1),
  '2026-03-15 15:00:00',
  '2026-03-15 23:00:00',
  'normale',
  datetime('now')
);
