-- Mise à jour de l'utilisateur admin avec le bon hash
-- Mot de passe: admin123
-- Hash SHA-256: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9

DELETE FROM users WHERE username = 'admin';

INSERT INTO users (username, password_hash, nom, prenom, role) VALUES 
  ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrateur', 'Système', 'super_admin');
