# 👥 Guide : Créer de nouveaux utilisateurs admin

Date : 06/03/2026

---

## 🎯 Objectif

Créer de nouveaux comptes administrateurs pour GesRes afin de donner accès à l'interface d'administration à plusieurs personnes.

---

## 🔧 Méthode 1 : Script automatique (RECOMMANDÉ)

### Utilisation du script create_user.sh

**Commande** :
```bash
cd /home/user/webapp
./create_user.sh
```

**Le script vous demandera** :
1. Nom d'utilisateur (ex: jean.dupont)
2. Prénom
3. Nom
4. Mot de passe
5. Confirmation du mot de passe

**Exemple d'utilisation** :
```
═══════════════════════════════════════════════════════════
  🔐 Création d'un nouvel utilisateur admin - GesRes
═══════════════════════════════════════════════════════════

Nom d'utilisateur (ex: jean.dupont) : marie.martin
Prénom : Marie
Nom : Martin
Mot de passe : ********
Confirmer le mot de passe : ********

🔐 Génération du hash du mot de passe...
📝 Informations de l'utilisateur :
   Username : marie.martin
   Nom      : Martin
   Prénom   : Marie
   Hash     : abc123...

Confirmer la création ? (o/n) : o

🚀 Création de l'utilisateur dans la base de données...
✅ Utilisateur créé avec succès !

═══════════════════════════════════════════════════════════
  Identifiants de connexion
═══════════════════════════════════════════════════════════

URL      : https://gesres-missions.pages.dev/login
Username : marie.martin
Password : [le mot de passe que vous avez saisi]
```

---

## 🔧 Méthode 2 : Commande manuelle

### Étape par étape

**Étape 1** : Générer le hash SHA-256 du mot de passe

```bash
# Remplacez "MotDePasse123" par le mot de passe souhaité
echo -n "MotDePasse123" | sha256sum
```

**Exemple** :
```bash
echo -n "Marie2026!" | sha256sum
# Résultat : 7a3d5e9c8b2f1a4d6e8c9b3f5a7d2e4c8b1f3a5d7e9c2b4f6a8d1c3e5b7f9a2d
```

**Étape 2** : Créer l'utilisateur dans la base de données

```bash
cd /home/user/webapp

npx wrangler d1 execute webapp-production --remote \
  --command="INSERT INTO users (username, password_hash, nom, prenom, role) VALUES ('marie.martin', '7a3d5e9c8b2f1a4d6e8c9b3f5a7d2e4c8b1f3a5d7e9c2b4f6a8d1c3e5b7f9a2d', 'Martin', 'Marie', 'admin')"
```

**Étape 3** : Vérifier la création

```bash
npx wrangler d1 execute webapp-production --remote \
  --command="SELECT username, nom, prenom, role FROM users WHERE username='marie.martin'"
```

---

## 🔧 Méthode 3 : Via Dashboard Cloudflare

### Étape par étape

**Étape 1** : Aller sur le Dashboard

1. https://dash.cloudflare.com
2. **Workers & Pages** → **D1 SQL Databases**
3. Cliquer sur **webapp-production**
4. Onglet **Console**

**Étape 2** : Générer le hash (sur votre machine)

```bash
echo -n "VotreMotDePasse" | sha256sum
```

**Étape 3** : Exécuter la requête SQL

```sql
INSERT INTO users (username, password_hash, nom, prenom, role) 
VALUES ('jean.dupont', 'VOTRE_HASH_ICI', 'Dupont', 'Jean', 'admin');
```

**Étape 4** : Cliquer sur **Execute**

---

## 📋 Exemples de création

### Exemple 1 : Créer un utilisateur "Jean Dupont"

```bash
# 1. Générer le hash
echo -n "Jean2026!" | sha256sum
# Résultat : abc123def456...

# 2. Créer l'utilisateur
npx wrangler d1 execute webapp-production --remote \
  --command="INSERT INTO users (username, password_hash, nom, prenom, role) VALUES ('jean.dupont', 'abc123def456...', 'Dupont', 'Jean', 'admin')"
```

### Exemple 2 : Créer un utilisateur "Sophie Bernard"

```bash
# 1. Générer le hash
echo -n "Sophie@2026" | sha256sum
# Résultat : def789ghi012...

# 2. Créer l'utilisateur
npx wrangler d1 execute webapp-production --remote \
  --command="INSERT INTO users (username, password_hash, nom, prenom, role) VALUES ('sophie.bernard', 'def789ghi012...', 'Bernard', 'Sophie', 'admin')"
```

---

## 📊 Gestion des utilisateurs

### Lister tous les utilisateurs

```bash
npx wrangler d1 execute webapp-production --remote \
  --command="SELECT id, username, nom, prenom, role, created_at FROM users ORDER BY created_at DESC"
```

**Résultat exemple** :
```json
[
  {
    "id": 1,
    "username": "admin",
    "nom": "Admin",
    "prenom": "Système",
    "role": "admin",
    "created_at": "2026-03-06 10:00:00"
  },
  {
    "id": 2,
    "username": "marie.martin",
    "nom": "Martin",
    "prenom": "Marie",
    "role": "admin",
    "created_at": "2026-03-06 11:00:00"
  }
]
```

### Compter le nombre d'utilisateurs

```bash
npx wrangler d1 execute webapp-production --remote \
  --command="SELECT COUNT(*) as total FROM users"
```

### Vérifier si un utilisateur existe

```bash
npx wrangler d1 execute webapp-production --remote \
  --command="SELECT username FROM users WHERE username='jean.dupont'"
```

---

## 🔄 Modifier un utilisateur existant

### Changer le mot de passe

```bash
# 1. Générer le nouveau hash
echo -n "NouveauMotDePasse" | sha256sum

# 2. Mettre à jour
npx wrangler d1 execute webapp-production --remote \
  --command="UPDATE users SET password_hash='NOUVEAU_HASH' WHERE username='jean.dupont'"
```

### Changer le nom/prénom

```bash
npx wrangler d1 execute webapp-production --remote \
  --command="UPDATE users SET nom='Nouveau_Nom', prenom='Nouveau_Prenom' WHERE username='jean.dupont'"
```

### Changer le nom d'utilisateur

```bash
npx wrangler d1 execute webapp-production --remote \
  --command="UPDATE users SET username='nouveau.username' WHERE username='ancien.username'"
```

---

## 🗑️ Supprimer un utilisateur

### Supprimer un utilisateur spécifique

```bash
npx wrangler d1 execute webapp-production --remote \
  --command="DELETE FROM users WHERE username='jean.dupont'"
```

### ⚠️ Attention

- Ne supprimez **JAMAIS** tous les utilisateurs admin !
- Gardez toujours au moins un compte admin actif
- Vérifiez avant de supprimer

---

## 🔒 Bonnes pratiques

### Conventions de nommage

**Format recommandé** : `prenom.nom`

**Exemples** :
- ✅ `jean.dupont`
- ✅ `marie.martin`
- ✅ `sophie.bernard`
- ❌ `jeandupont` (sans séparateur)
- ❌ `j.dupont` (trop court)

### Mots de passe forts

Un bon mot de passe doit :
- ✅ Au moins 12 caractères
- ✅ Majuscules ET minuscules
- ✅ Chiffres
- ✅ Caractères spéciaux (!, @, #, $, etc.)

**Exemples** :
- ✅ `GesRes2026!Secure`
- ✅ `Admin@Missions#26`
- ✅ `M!ss10ns_2026`
- ❌ `password` (trop simple)
- ❌ `admin123` (trop évident)

### Sécurité

1. **Ne partagez jamais** les mots de passe par email/SMS
2. **Changez** régulièrement les mots de passe (tous les 3 mois)
3. **Utilisez** un gestionnaire de mots de passe
4. **Activez** l'authentification à deux facteurs (si disponible)
5. **Créez** des comptes individuels (pas de compte partagé)

---

## 🧪 Tests après création

### Test 1 : Vérifier l'existence de l'utilisateur

```bash
npx wrangler d1 execute webapp-production --remote \
  --command="SELECT * FROM users WHERE username='nouveau.username'"
```

### Test 2 : Tester la connexion

1. Ouvrir : https://gesres-missions.pages.dev/login
2. Saisir les identifiants du nouvel utilisateur
3. Vérifier l'accès à l'interface admin

### Test 3 : Tester les permissions

Une fois connecté, vérifier que l'utilisateur peut :
- ✅ Voir les missions
- ✅ Créer/modifier/supprimer des missions
- ✅ Gérer les gendarmes
- ✅ Gérer les assignations

---

## 📊 Structure de la table users

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Champs** :
- `id` : Identifiant unique (auto-incrémenté)
- `username` : Nom d'utilisateur (unique)
- `password_hash` : Hash SHA-256 du mot de passe
- `nom` : Nom de famille
- `prenom` : Prénom
- `role` : Rôle (actuellement uniquement 'admin')
- `created_at` : Date de création

---

## 🛠️ Scripts utiles

### Script de création rapide

Créez un fichier `quick_user.sh` :

```bash
#!/bin/bash
# Usage: ./quick_user.sh username password "Nom" "Prenom"

USERNAME=$1
PASSWORD=$2
NOM=$3
PRENOM=$4

if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ] || [ -z "$NOM" ] || [ -z "$PRENOM" ]; then
    echo "Usage: ./quick_user.sh username password 'Nom' 'Prenom'"
    exit 1
fi

HASH=$(echo -n "$PASSWORD" | sha256sum | cut -d' ' -f1)

npx wrangler d1 execute webapp-production --remote \
  --command="INSERT INTO users (username, password_hash, nom, prenom, role) VALUES ('$USERNAME', '$HASH', '$NOM', '$PRENOM', 'admin')"

echo "✅ Utilisateur $USERNAME créé avec succès !"
```

**Utilisation** :
```bash
chmod +x quick_user.sh
./quick_user.sh jean.dupont "Jean2026!" "Dupont" "Jean"
```

---

## 🆘 Dépannage

### Erreur : "UNIQUE constraint failed: users.username"

**Cause** : Le nom d'utilisateur existe déjà

**Solution** :
```bash
# 1. Vérifier si l'utilisateur existe
npx wrangler d1 execute webapp-production --remote \
  --command="SELECT username FROM users WHERE username='jean.dupont'"

# 2. Choisir un autre nom d'utilisateur ou supprimer l'ancien
npx wrangler d1 execute webapp-production --remote \
  --command="DELETE FROM users WHERE username='jean.dupont'"
```

### Erreur : "NOT NULL constraint failed"

**Cause** : Un champ obligatoire est manquant

**Solution** : Vérifiez que tous les champs sont fournis :
- username
- password_hash
- nom
- prenom
- role

### L'utilisateur ne peut pas se connecter

**Vérifications** :
1. Le hash du mot de passe est correct
2. L'utilisateur existe dans la base
3. Le rôle est bien 'admin'
4. Les cookies sont activés dans le navigateur

---

## 📝 Exemple complet

### Créer 3 utilisateurs d'un coup

```bash
cd /home/user/webapp

# Utilisateur 1
echo -n "Jean2026!" | sha256sum
npx wrangler d1 execute webapp-production --remote \
  --command="INSERT INTO users (username, password_hash, nom, prenom, role) VALUES ('jean.dupont', 'HASH_1', 'Dupont', 'Jean', 'admin')"

# Utilisateur 2
echo -n "Marie2026!" | sha256sum
npx wrangler d1 execute webapp-production --remote \
  --command="INSERT INTO users (username, password_hash, nom, prenom, role) VALUES ('marie.martin', 'HASH_2', 'Martin', 'Marie', 'admin')"

# Utilisateur 3
echo -n "Pierre2026!" | sha256sum
npx wrangler d1 execute webapp-production --remote \
  --command="INSERT INTO users (username, password_hash, nom, prenom, role) VALUES ('pierre.durand', 'HASH_3', 'Durand', 'Pierre', 'admin')"

# Vérifier
npx wrangler d1 execute webapp-production --remote \
  --command="SELECT username, nom, prenom FROM users"
```

---

## 📞 Besoin d'aide ?

Si vous avez des questions ou des problèmes :
1. Consultez ce guide
2. Vérifiez les logs : `npx wrangler pages deployment tail --project-name gesres-missions`
3. Testez avec le compte admin par défaut d'abord

---

## ✅ Checklist de création

- [ ] Hash du mot de passe généré
- [ ] Nom d'utilisateur choisi (format: prenom.nom)
- [ ] Utilisateur créé dans la base
- [ ] Création vérifiée (SELECT)
- [ ] Connexion testée
- [ ] Mot de passe communiqué de manière sécurisée
- [ ] Utilisateur invité à changer son mot de passe

---

🔐 **Créez vos utilisateurs admin en toute sécurité !**
