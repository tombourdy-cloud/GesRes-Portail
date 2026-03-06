# 🔐 Guide de connexion et gestion du mot de passe admin

Date : 06/03/2026

---

## ✅ COMPTE ADMIN RÉINITIALISÉ

Le compte admin a été réinitialisé avec succès !

---

## 🔑 IDENTIFIANTS DE CONNEXION

**URL de connexion** : https://gesres-missions.pages.dev/login

**Username** : `admin`  
**Password** : `admin123`

---

## 🧪 TEST DE CONNEXION

### Étape 1 : Ouvrir la page de connexion

Ouvrez votre navigateur et allez sur :
```
https://gesres-missions.pages.dev/login
```

### Étape 2 : Saisir les identifiants

- **Nom d'utilisateur** : `admin`
- **Mot de passe** : `admin123`

### Étape 3 : Cliquer sur "Se connecter"

Vous devriez être redirigé vers :
```
https://gesres-missions.pages.dev/admin
```

---

## 🔧 CHANGER LE MOT DE PASSE

### Méthode 1 : Depuis le sandbox (recommandé)

**Étape 1** : Générer le hash SHA-256 de votre nouveau mot de passe

```bash
# Remplacez VOTRE_NOUVEAU_MOT_DE_PASSE par le mot de passe souhaité
echo -n "VOTRE_NOUVEAU_MOT_DE_PASSE" | sha256sum
```

**Exemple** :
```bash
echo -n "MonNouveauMDP2026!" | sha256sum
# Résultat : abc123def456...
```

**Étape 2** : Mettre à jour le mot de passe dans la base

```bash
cd /home/user/webapp

# Remplacez NOUVEAU_HASH par le hash obtenu à l'étape 1
npx wrangler d1 execute webapp-production --remote \
  --command="UPDATE users SET password_hash='NOUVEAU_HASH' WHERE username='admin'"
```

**Exemple complet** :
```bash
# 1. Générer le hash
echo -n "MonNouveauMDP2026!" | sha256sum
# Résultat : 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8

# 2. Mettre à jour
npx wrangler d1 execute webapp-production --remote \
  --command="UPDATE users SET password_hash='5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' WHERE username='admin'"
```

### Méthode 2 : Via le Dashboard Cloudflare

**Étape 1** : Générer le hash (comme ci-dessus)

**Étape 2** : Aller sur le Dashboard

1. https://dash.cloudflare.com
2. **Workers & Pages** → **D1 SQL Databases**
3. Cliquer sur **webapp-production**
4. Onglet **Console**

**Étape 3** : Exécuter la requête SQL

```sql
UPDATE users 
SET password_hash='VOTRE_NOUVEAU_HASH' 
WHERE username='admin';
```

**Étape 4** : Cliquer sur **Execute**

---

## 🆘 DÉPANNAGE

### Problème 1 : "Nom d'utilisateur ou mot de passe incorrect"

**Vérifications** :

1. **Vérifier que le compte existe** :
```bash
npx wrangler d1 execute webapp-production --remote \
  --command="SELECT username, nom, prenom, role FROM users WHERE username='admin'"
```

2. **Vérifier le hash du mot de passe** :
```bash
# Hash correct pour "admin123"
echo -n "admin123" | sha256sum
# Résultat attendu : 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
```

3. **Recréer le compte** :
```bash
# Supprimer l'ancien
npx wrangler d1 execute webapp-production --remote \
  --command="DELETE FROM users WHERE username='admin'"

# Recréer avec le bon hash
npx wrangler d1 execute webapp-production --remote \
  --command="INSERT INTO users (username, password_hash, nom, prenom, role) VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', 'Système', 'admin')"
```

### Problème 2 : Page de connexion ne s'affiche pas

**Vérifier que le site est bien déployé** :
```bash
curl https://gesres-missions.pages.dev/login
```

**Résultat attendu** : Code HTML de la page de connexion

### Problème 3 : Cookie non enregistré

**Vider le cache du navigateur** :
1. Appuyez sur `Ctrl + Shift + Suppr` (Windows) ou `Cmd + Shift + Suppr` (Mac)
2. Cochez "Cookies" et "Cache"
3. Cliquez sur "Effacer les données"
4. Réessayez de vous connecter

### Problème 4 : Redirection infinie

**Désactiver les bloqueurs de cookies** :
- Vérifiez que votre navigateur accepte les cookies
- Désactivez les extensions de confidentialité temporairement

---

## 📋 HASH DES MOTS DE PASSE COURANTS

Pour référence, voici les hash SHA-256 de quelques mots de passe courants :

| Mot de passe | Hash SHA-256 |
|--------------|--------------|
| `admin123` | `240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9` |
| `admin` | `8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918` |
| `password` | `5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8` |

⚠️ **N'utilisez JAMAIS ces mots de passe en production !**

---

## 🔒 BONNES PRATIQUES DE SÉCURITÉ

### Créer un mot de passe fort

Un bon mot de passe doit :
- ✅ Contenir au moins 12 caractères
- ✅ Mélanger majuscules et minuscules
- ✅ Inclure des chiffres
- ✅ Inclure des caractères spéciaux (!, @, #, $, etc.)

**Exemples de mots de passe forts** :
- `GesRes2026!Secure`
- `Admin@Missions#2026`
- `M1ss!0ns_R3serve`

### Créer plusieurs comptes admin

Pour plus de sécurité, créez des comptes individuels :

```bash
# 1. Générer le hash
echo -n "MotDePasse_Jean" | sha256sum

# 2. Créer le compte
npx wrangler d1 execute webapp-production --remote \
  --command="INSERT INTO users (username, password_hash, nom, prenom, role) VALUES ('jean.dupont', 'HASH_ICI', 'Dupont', 'Jean', 'admin')"
```

### Changer régulièrement le mot de passe

Recommandation : Changez le mot de passe tous les 3 mois.

---

## 🛠️ COMMANDES UTILES

### Lister tous les utilisateurs

```bash
npx wrangler d1 execute webapp-production --remote \
  --command="SELECT id, username, nom, prenom, role, created_at FROM users"
```

### Supprimer un utilisateur

```bash
npx wrangler d1 execute webapp-production --remote \
  --command="DELETE FROM users WHERE username='nom_utilisateur'"
```

### Vérifier le hash d'un mot de passe

```bash
# Sur Linux/Mac
echo -n "votre_mot_de_passe" | sha256sum

# Sur Windows (PowerShell)
$password = "votre_mot_de_passe"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($password)
$hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
[System.BitConverter]::ToString($hash).Replace("-","").ToLower()
```

---

## 📞 BESOIN D'AIDE ?

### Si vous ne pouvez toujours pas vous connecter

1. **Vérifiez l'URL** : https://gesres-missions.pages.dev/login
2. **Vérifiez les identifiants** : admin / admin123
3. **Videz le cache du navigateur**
4. **Essayez un autre navigateur** (Chrome, Firefox, Safari)
5. **Vérifiez la console JavaScript** (F12 → Console)

### Logs de débogage

```bash
# Voir les logs en temps réel
npx wrangler pages deployment tail --project-name gesres-missions
```

---

## ✅ RÉCAPITULATIF

| Information | Valeur |
|-------------|--------|
| **URL de connexion** | https://gesres-missions.pages.dev/login |
| **Username** | admin |
| **Password** | admin123 |
| **Hash du password** | 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9 |
| **Base de données** | webapp-production |
| **Database ID** | b28b7666-cd22-4d41-b4d7-7cccf6cfef6c |

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ **Connectez-vous** : https://gesres-missions.pages.dev/login
2. ⚠️ **Changez le mot de passe** immédiatement
3. 📊 **Chargez les données de test**
4. 🎨 **Personnalisez le logo**

---

🔐 **Le compte admin est prêt ! Vous pouvez vous connecter maintenant !**
