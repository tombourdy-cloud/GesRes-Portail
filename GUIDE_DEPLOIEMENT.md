# 🚀 Guide de déploiement - GesRes sur Cloudflare Pages

Date : 06/03/2026

---

## 📋 Prérequis

Avant de déployer, assurez-vous d'avoir :

- ✅ Un compte Cloudflare (gratuit) : https://dash.cloudflare.com/sign-up
- ✅ Une clé API Cloudflare configurée dans l'onglet "Deploy"
- ✅ Node.js et npm installés
- ✅ Le projet GesRes dans `/home/user/webapp/`

---

## 🔧 Configuration initiale (une seule fois)

### 1. Créer la base de données D1 de production

```bash
cd /home/user/webapp
npx wrangler d1 create webapp-production
```

**Résultat attendu** :
```
✅ Successfully created DB 'webapp-production'

database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
database_name = "webapp-production"
```

**Copiez le `database_id`** et mettez-le dans `wrangler.jsonc` :

```jsonc
{
  "name": "webapp",
  "compatibility_date": "2026-03-06",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "COLLEZ_ICI_LE_DATABASE_ID"
    }
  ]
}
```

### 2. Créer les tables en production

```bash
# Appliquer toutes les migrations
npx wrangler d1 migrations apply webapp-production

# Vous verrez :
# ✅ Migration 0001_initial_schema.sql applied
# ✅ Migration 0002_add_auth_brigades.sql applied
# ✅ Migration 0003_remove_brigade_fields.sql applied
```

### 3. Charger les données de test

```bash
# Charger les missions, gendarmes, assignations
npx wrangler d1 execute webapp-production --file=./seed.sql

# Charger les compagnies et brigades
npx wrangler d1 execute webapp-production --file=./seed_brigades.sql

# Créer le compte admin par défaut (admin / admin123)
npx wrangler d1 execute webapp-production --file=./fix_admin_user.sql
```

### 4. Créer le projet Cloudflare Pages

```bash
npx wrangler pages project create webapp --production-branch main
```

**Si le nom "webapp" est déjà pris**, essayez :
- `gesres-missions`
- `gesres-gendarmerie`
- `webapp-VOTRE_NOM`

**Note** : Le nom du projet devient votre URL : `https://PROJET_NAME.pages.dev`

---

## 🚀 Déploiement (à chaque mise à jour)

### Méthode 1 : Script automatique (recommandé)

```bash
cd /home/user/webapp
./deploy.sh
```

Ce script fait automatiquement :
1. ✅ Build du projet
2. ✅ Vérification
3. ✅ Déploiement sur Cloudflare
4. ✅ Affichage des URLs

### Méthode 2 : Manuelle

```bash
cd /home/user/webapp

# 1. Build
npm run build

# 2. Déployer
npx wrangler pages deploy dist --project-name webapp

# Si vous avez utilisé un autre nom de projet :
npx wrangler pages deploy dist --project-name VOTRE_NOM_PROJET
```

**Durée** : 30-60 secondes

---

## 🌐 URLs après déploiement

Une fois déployé, votre site sera accessible via :

| Type | URL | Description |
|------|-----|-------------|
| **Production** | `https://webapp.pages.dev` | URL principale (permanente) |
| **Branche main** | `https://main.webapp.pages.dev` | URL de la branche Git |
| **Admin** | `https://webapp.pages.dev/admin` | Interface administrateur |
| **Login** | `https://webapp.pages.dev/login` | Page de connexion |
| **API** | `https://webapp.pages.dev/api/*` | Endpoints API |

### Identifiants par défaut

- **Username** : `admin`
- **Password** : `admin123`

⚠️ **Important** : Changez le mot de passe après le premier déploiement !

---

## 🔄 Mises à jour après le déploiement initial

### Mettre à jour le code

```bash
cd /home/user/webapp

# Modifier vos fichiers (src/, public/, etc.)
# Ensuite :

./deploy.sh
```

### Mettre à jour la base de données

**Ajouter une nouvelle colonne** :

```bash
# 1. Créer une migration
cat > migrations/0004_nouvelle_colonne.sql << 'EOF'
ALTER TABLE missions ADD COLUMN nouvelle_colonne TEXT;
EOF

# 2. Appliquer en production
npx wrangler d1 migrations apply webapp-production

# 3. Redéployer le code si nécessaire
./deploy.sh
```

**Modifier des données** :

```bash
# Exécuter une requête SQL
npx wrangler d1 execute webapp-production --command="UPDATE missions SET priorite='haute' WHERE id=1"

# Ou exécuter un fichier SQL
npx wrangler d1 execute webapp-production --file=./update.sql
```

---

## 🔒 Sécurité

### Changer le mot de passe admin

```bash
# 1. Générer un hash SHA-256
echo -n "VOTRE_NOUVEAU_MOT_DE_PASSE" | sha256sum

# Exemple de résultat :
# 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8

# 2. Mettre à jour en production
npx wrangler d1 execute webapp-production --command="UPDATE users SET password_hash='HASH_ICI' WHERE username='admin'"
```

### Ajouter des secrets (API keys)

```bash
# Exemple : Clé API Resend pour les emails
npx wrangler pages secret put RESEND_API_KEY --project-name webapp

# Vous serez invité à entrer la valeur du secret
# La clé sera stockée de manière sécurisée par Cloudflare
```

### Lister les secrets

```bash
npx wrangler pages secret list --project-name webapp
```

---

## 🎨 Domaine personnalisé (optionnel)

### Ajouter votre propre domaine

Si vous possédez un nom de domaine (ex : `gesres.fr`) :

```bash
# Ajouter le domaine
npx wrangler pages domain add gesres.fr --project-name webapp

# Suivre les instructions pour configurer les DNS
```

**Cloudflare générera automatiquement** :
- ✅ Certificat SSL gratuit
- ✅ HTTPS activé
- ✅ Redirection www → non-www (ou inverse)

---

## 📊 Monitoring et logs

### Voir les logs en temps réel

```bash
npx wrangler pages deployment tail --project-name webapp
```

**Vous verrez** :
- 📝 Requêtes HTTP
- ⚠️ Erreurs
- 🐛 Logs de debug

### Dashboard Cloudflare

1. Aller sur https://dash.cloudflare.com
2. **Pages** → **webapp**
3. Onglets disponibles :
   - **Deployments** : Historique des déploiements
   - **Analytics** : Statistiques de trafic
   - **Settings** : Configuration

### Rollback (revenir en arrière)

**Si une mise à jour casse quelque chose** :

**Méthode 1 : Dashboard**
1. https://dash.cloudflare.com
2. Pages → webapp → Deployments
3. Cliquer sur la version précédente
4. "Rollback to this deployment"

**Méthode 2 : Git**
```bash
git log --oneline  # Voir l'historique
git checkout COMMIT_HASH  # Revenir à une version
./deploy.sh  # Redéployer
```

---

## 💾 Sauvegarde de la base de données

### Créer une sauvegarde

```bash
# Exporter toute la base
npx wrangler d1 export webapp-production --output=backup_$(date +%Y%m%d_%H%M%S).sql

# Exemple : backup_20260306_143000.sql
```

### Restaurer une sauvegarde

```bash
# Attention : cela écrasera les données existantes !
npx wrangler d1 execute webapp-production --file=backup_20260306_143000.sql
```

---

## 🐛 Dépannage

### Erreur : "Project name already exists"

**Solution** : Utilisez un autre nom
```bash
npx wrangler pages project create gesres-missions --production-branch main
```

N'oubliez pas de mettre à jour `--project-name` dans toutes les commandes.

### Erreur : "Database not found"

**Solution** : Vérifiez le `database_id` dans `wrangler.jsonc`
```bash
# Lister vos bases D1
npx wrangler d1 list

# Copier le bon database_id dans wrangler.jsonc
```

### Erreur : "Unauthorized"

**Solution** : Reconfigurez votre clé API
1. Onglet "Deploy"
2. Vérifier que la clé est valide
3. Relancer `setup_cloudflare_api_key`

### Le site affiche une page blanche

**Vérification** :
```bash
# Vérifier les logs
npx wrangler pages deployment tail --project-name webapp

# Vérifier que dist/ contient des fichiers
ls -lh dist/
```

### Base de données vide en production

**Solution** :
```bash
# Recharger les données
npx wrangler d1 execute webapp-production --file=./seed.sql
npx wrangler d1 execute webapp-production --file=./seed_brigades.sql
npx wrangler d1 execute webapp-production --file=./fix_admin_user.sql
```

---

## 📝 Commandes utiles

### Gestion du projet

```bash
# Voir les informations du projet
npx wrangler pages project list

# Voir les déploiements
npx wrangler pages deployment list --project-name webapp

# Supprimer un projet (attention !)
npx wrangler pages project delete webapp
```

### Gestion de la base D1

```bash
# Lister les bases
npx wrangler d1 list

# Console SQL interactive
npx wrangler d1 execute webapp-production --command="SELECT * FROM users"

# Informations sur la base
npx wrangler d1 info webapp-production
```

### Développement local

```bash
# Lancer en local (avec base locale)
npm run dev:d1

# Build pour production
npm run build

# Preview du build
npm run preview
```

---

## 📊 Checklist de déploiement

### Première fois

- [ ] Compte Cloudflare créé
- [ ] Clé API configurée dans l'onglet "Deploy"
- [ ] Base D1 créée : `npx wrangler d1 create webapp-production`
- [ ] `database_id` copié dans `wrangler.jsonc`
- [ ] Migrations appliquées : `npx wrangler d1 migrations apply`
- [ ] Données de test chargées : `seed.sql`, `seed_brigades.sql`, `fix_admin_user.sql`
- [ ] Projet Pages créé : `npx wrangler pages project create webapp`
- [ ] Premier déploiement : `./deploy.sh`
- [ ] Site testé : `https://webapp.pages.dev`
- [ ] Admin testé : `https://webapp.pages.dev/admin`
- [ ] Mot de passe admin changé

### Mises à jour

- [ ] Code modifié
- [ ] Testé localement : `npm run build` + `pm2 restart webapp`
- [ ] Commit Git : `git add . && git commit -m "..."`
- [ ] Déploiement : `./deploy.sh`
- [ ] Vérification : Tester les URLs de production
- [ ] Rollback si nécessaire

---

## 🎉 Félicitations !

Votre application GesRes est maintenant en production sur Cloudflare Pages !

### Prochaines étapes

1. **Partagez l'URL** avec vos utilisateurs
2. **Changez le mot de passe admin**
3. **Configurez un domaine personnalisé** (optionnel)
4. **Activez les notifications email** avec Resend (optionnel)
5. **Surveillez les statistiques** via le dashboard

### Support

Pour toute question ou problème :
- 📖 Documentation Cloudflare : https://developers.cloudflare.com/pages
- 🔧 Dashboard : https://dash.cloudflare.com
- 📊 Status : https://www.cloudflarestatus.com

---

✅ **Votre site est en ligne 24/7 !**
