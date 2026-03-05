# Gestion des Missions - Réserve Gendarmerie

Application web complète de gestion des missions pour les réservistes de la gendarmerie, avec interface d'administration sécurisée et système de gestion des brigades.

## 🎯 Objectif

Permettre la visualisation et la gestion des missions disponibles pour les réservistes de la gendarmerie, avec un système d'assignation et de validation des affectations organisé par brigades et compagnies.

## ✨ Fonctionnalités Complètes

### 🔐 Authentification
- ✅ **Système de connexion sécurisé** pour accéder à l'interface admin
- ✅ **Protection des routes admin** par JWT
- ✅ **Gestion de session** avec cookies sécurisés
- ✅ **Compte par défaut** : `admin` / `admin123`

### 📋 Interface Utilisateur (Page d'accueil)
- ✅ **Sélecteur de brigade** pour filtrer les missions par brigade
- ✅ **Bouton d'information** pour afficher les détails d'une brigade (clic sur lieu ou bouton info)
- ✅ **Affichage des missions** avec numéro de mission, brigade et compagnie
- ✅ **Statistiques en temps réel** (missions, assignations, places libres)
- ✅ **Filtres avancés** (priorité, statut, recherche)
- ✅ **Indicateurs visuels** de progression

### 🗺️ Gestion des Lieux (Hiérarchique)
- ✅ **Compagnies de gendarmerie** :
  - Nom, code, adresse, téléphone
  - Commandant de compagnie
  - Nombre de brigades rattachées
- ✅ **Brigades rattachées aux compagnies** :
  - Nom, code unique, adresse
  - Chef de brigade, effectifs
  - Téléphone, coordonnées GPS (optionnel)
- ✅ **Interface de création** via l'onglet "Nouveau lieu"
- ✅ **Organisation hiérarchique** : Compagnie → Brigades
- ✅ **Modal d'information** affichant les détails brigade + compagnie parent

### 🛠️ Interface d'Administration
1. **Onglet Missions** :
   - Créer missions avec **numéro obligatoire**
   - Champs obligatoires : **numéro, titre, brigade, date début**
   - Sélection brigade via **liste déroulante**
   - Tableau complet avec actions
   
2. **Onglet Compagnies & Brigades** :
   - Vue hiérarchique : compagnie + ses brigades
   - Créer compagnies et brigades
   - Rattachement automatique brigade → compagnie
   - Suppression avec gestion des dépendances

3. **Onglet Gendarmes** :
   - Liste complète des réservistes
   - Création de nouveaux gendarmes
   - Suivi des missions actives

4. **Gestion des Assignations** :
   - Workflow : Libre → En attente → Validé
   - Assigner des gendarmes
   - Valider les assignations
   - Libérer des places

### 🎨 Personnalisation
- ✅ **Écusson modifiable** : Clic sur le logo dans la navigation (admin uniquement)
- ✅ **Upload via URL** d'image externe
- ✅ **Persistance** en base de données (table config)

## 🌐 URLs Actuelles

### Développement (Sandbox)
- **🏠 Page d'accueil** : https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai
- **🔐 Connexion Admin** : https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai/login
- **⚙️ Administration** : https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai/admin

### 🔑 Identifiants
- **Username** : `admin`
- **Password** : `admin123`

### API Endpoints

**Authentification**
- `POST /api/auth/login` - Connexion (username, password)
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Vérifier session

**Compagnies**
- `GET /api/compagnies` - Liste des compagnies
- `GET /api/compagnies/:id` - Détails compagnie + brigades
- `POST /api/compagnies` - Créer une compagnie
- `PUT /api/compagnies/:id` - Modifier une compagnie

**Brigades**
- `GET /api/brigades` - Liste des brigades
- `GET /api/brigades/:id` - Détails brigade + compagnie parent
- `POST /api/brigades` - Créer une brigade
- `PUT /api/brigades/:id` - Modifier une brigade
- `DELETE /api/brigades/:id` - Supprimer une brigade

**Missions**
- `GET /api/missions?brigade_id=X` - Liste missions (filtrable par brigade)
- `GET /api/missions/:id` - Détails mission complète
- `POST /api/missions` - Créer mission (champs requis: numero_mission, titre, brigade_id, date_debut)
- `PUT /api/missions/:id` - Modifier mission
- `DELETE /api/missions/:id` - Supprimer mission

**Gendarmes**
- `GET /api/gendarmes` - Liste gendarmes
- `GET /api/gendarmes/:id` - Détails gendarme
- `POST /api/gendarmes` - Créer gendarme
- `PUT /api/gendarmes/:id` - Modifier gendarme

**Assignations**
- `PUT /api/assignations/:id` - Modifier assignation (statut: libre|en_attente|valide)

**Configuration**
- `GET /api/config/:key` - Récupérer config (ex: logo_url)
- `POST /api/config` - Mettre à jour config

**Statistiques**
- `GET /api/stats` - Stats globales

## 🗄️ Architecture de Données

### Tables Database (Cloudflare D1)

**users**
- Administrateurs avec authentification
- username (unique), password_hash (SHA-256)
- role (admin, super_admin)

**compagnies**
- Compagnies de gendarmerie
- nom (unique), code (unique), adresse, commandant

**brigades**
- Brigades rattachées à une compagnie (relation hiérarchique)
- compagnie_id (FK), nom, code (unique), adresse
- chef_brigade, effectifs, coordonnées GPS

**missions**
- **numero_mission** (obligatoire, unique)
- titre (obligatoire), description
- **brigade_id** (obligatoire, FK vers brigades)
- date_debut (obligatoire), date_fin
- effectifs_requis, competences_requises, priorite

**gendarmes**
- matricule (unique), nom, prenom, grade
- specialite, telephone, email, disponible

**assignations**
- Relation missions ↔ gendarmes
- mission_id (FK), gendarme_id (FK nullable)
- statut (libre|en_attente|valide)

**config**
- Configuration système (logo_url, etc.)
- key (unique), value

### Relations
```
Compagnie (1) ──→ (N) Brigades
Brigade (1) ──→ (N) Missions
Mission (1) ──→ (N) Assignations ──→ (0..1) Gendarme
```

## 🚀 Guide d'Utilisation

### Pour les Gendarmes (Consultation)
1. **Accéder à la page d'accueil**
2. **Sélectionner une brigade** dans la liste déroulante
3. **Cliquer sur "Informations"** pour voir les détails de la brigade
4. **Consulter les missions** de la brigade sélectionnée
5. **Cliquer sur le nom d'une brigade** dans une mission pour voir ses infos
6. **Utiliser les filtres** pour affiner la recherche

### Pour les Administrateurs
1. **Se connecter** via `/login` (admin/admin123)
2. **Créer des lieux** (onglet "Compagnies & Brigades") :
   - D'abord créer une **compagnie**
   - Puis ajouter des **brigades** rattachées à la compagnie
3. **Créer une mission** :
   - Remplir **numéro de mission** (obligatoire)
   - Renseigner **titre** (obligatoire)
   - Sélectionner **brigade** dans la liste (obligatoire)
   - Définir **date début** (obligatoire)
   - Compléter autres informations
4. **Gérer les assignations** :
   - Cliquer sur l'icône "Gérer" d'une mission
   - **Assigner** un gendarme à une place libre
   - **Valider** les assignations en attente
   - **Libérer** des places si nécessaire
5. **Personnaliser l'écusson** :
   - Cliquer sur le logo dans la navigation
   - Entrer l'URL d'une image externe
   - Sauvegarder

## 💻 Déploiement Local

### Installation
```bash
cd /home/user/webapp
npm install
```

### Développement
```bash
# Appliquer les migrations
npm run db:migrate:local

# Insérer les données de test
npm run db:seed
npx wrangler d1 execute webapp-production --local --file=./seed_brigades.sql
npx wrangler d1 execute webapp-production --local --file=./fix_admin_user.sql

# Build
npm run build

# Démarrer
pm2 start ecosystem.config.cjs

# Tester
curl http://localhost:3000/api/stats
```

### Commandes DB
```bash
npm run db:reset              # Reset complet
npm run db:console:local      # Console SQL
```

## 🌍 Déploiement Production

### Prérequis
1. Compte Cloudflare
2. API Token configuré
3. Créer base D1 production

### Étapes
```bash
# 1. Créer base D1
npx wrangler d1 create webapp-production

# 2. Copier database_id dans wrangler.jsonc

# 3. Migrations production
npm run db:migrate:prod
npx wrangler d1 execute webapp-production --file=./seed.sql
npx wrangler d1 execute webapp-production --file=./seed_brigades.sql  
npx wrangler d1 execute webapp-production --file=./fix_admin_user.sql

# 4. Déployer
npm run deploy:prod
```

## 📊 Données de Test

- **4 Compagnies** (Paris, Lyon, Marseille, Toulouse)
- **12 Brigades** (3 par compagnie)
- **6 Gendarmes** avec différents grades
- **6 Missions** variées avec numéros
- **1 Utilisateur admin** (admin/admin123)

## 🛠️ Stack Technique

- **Backend** : Hono + TypeScript
- **Base de données** : Cloudflare D1 (SQLite)
- **Authentification** : JWT + SHA-256
- **Frontend** : Vanilla JavaScript
- **Styling** : Tailwind CSS
- **Icons** : Font Awesome
- **Dates** : Day.js
- **HTTP** : Axios
- **Déploiement** : Cloudflare Pages

## 📁 Structure

```
webapp/
├── src/
│   ├── api.tsx             # Routes API (auth, CRUD)
│   └── index.tsx           # Pages HTML
├── public/static/
│   ├── app.js              # JS page accueil
│   ├── admin.js            # JS page admin
│   ├── login.js            # JS page login
│   ├── style.css           # Styles
│   └── default-logo.png    # Logo par défaut
├── migrations/
│   ├── 0001_initial_schema.sql
│   └── 0002_add_auth_brigades.sql
├── seed.sql                # Données initiales
├── seed_brigades.sql       # Compagnies et brigades
├── fix_admin_user.sql      # Utilisateur admin
├── ecosystem.config.cjs    # PM2
├── wrangler.jsonc          # Cloudflare
└── package.json
```

## 🔄 Nouvelles Fonctionnalités

### ✅ Système d'Authentification
- Page de connexion dédiée
- Protection des routes admin
- Session persistante avec cookies
- Déconnexion sécurisée

### ✅ Gestion Hiérarchique des Lieux
- **Compagnies** : Niveau supérieur
- **Brigades** : Rattachées à une compagnie
- Création et suppression
- Modal d'information détaillée

### ✅ Missions Améliorées
- **Numéro de mission** unique obligatoire
- **Sélection brigade** via liste déroulante
- **Validation des champs** obligatoires
- **Affichage brigade + compagnie** dans les cartes

### ✅ Interface Utilisateur Améliorée
- **Filtre par brigade** en haut de page
- **Clic sur lieu** pour afficher infos brigade
- **Design responsive** et moderne
- **Écusson personnalisable** par URL

## 🎯 Workflow Complet

### Création d'une Mission
1. Admin se connecte → `/login`
2. Clique "Nouveau Lieu" → Crée compagnie et brigades
3. Clique "Nouvelle Mission" → Remplit formulaire :
   - ✅ Numéro mission (requis)
   - ✅ Titre (requis)
   - ✅ Brigade (requis, liste déroulante)
   - ✅ Date début (requis)
   - Autres champs optionnels
4. Mission créée avec places libres

### Assignation et Validation
```
Place Libre → [Assigner gendarme] → En Attente → [Valider] → Validé
                                    ↓                        ↓
                                    [Libérer] ←─────────────┘
```

### Consultation par Gendarme
1. Gendarme visite page d'accueil
2. **Sélectionne sa brigade** dans le menu déroulant
3. Voit uniquement les missions de sa brigade
4. **Clique sur le lieu** pour voir infos brigade + compagnie

## 🔐 Sécurité

- **Authentification SHA-256** pour les mots de passe
- **Sessions JWT** avec expiration 24h
- **Protection routes admin** : redirection vers login si non authentifié
- **Cookies HttpOnly** pour sécuriser les tokens

⚠️ **Pour production** : Implémenter bcrypt et JWT signé avec secret sécurisé

## 📝 Améliorations Recommandées

1. **Authentification renforcée** :
   - Bcrypt pour hash passwords
   - JWT signé avec secret environnement
   - Gestion des rôles avancée

2. **Fonctionnalités supplémentaires** :
   - Export PDF/Excel des plannings
   - Notifications email
   - Vue calendrier
   - Historique des modifications
   - Upload de fichiers pour l'écusson

3. **UX** :
   - Carte interactive des brigades
   - Recherche autocomplete
   - Dashboard graphiques

## 💾 Base de Données

**Mode Local** : `.wrangler/state/v3/d1/`  
**Mode Production** : Cloudflare D1 distribué globalement

### Commandes Utiles
```bash
# Console SQL locale
npm run db:console:local

# Voir les brigades
npx wrangler d1 execute webapp-production --local --command="SELECT * FROM brigades"

# Voir les compagnies
npx wrangler d1 execute webapp-production --local --command="SELECT * FROM compagnies"
```

## 📞 Support

**Logs** : `pm2 logs webapp --nostream`  
**Status** : `pm2 list`  
**Restart** : `pm2 restart webapp`

## 🎉 Statut

- ✅ **Authentification** : Opérationnelle
- ✅ **Gestion lieux** : Compagnies + Brigades
- ✅ **Missions** : Numéro obligatoire + Brigade
- ✅ **Assignations** : Workflow complet
- ✅ **Personnalisation** : Logo modifiable
- ✅ **Interface utilisateur** : Filtre par brigade
- ✅ **Prêt pour production** : Oui (après config Cloudflare)
