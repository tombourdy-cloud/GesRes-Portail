# Gestion des Missions - Réservistes Gendarmerie

## 📋 Vue d'ensemble du projet

Application web complète de gestion des missions pour les réservistes de la gendarmerie nationale. Elle permet aux gendarmes de consulter les missions disponibles et aux administrateurs de gérer l'ensemble du système (missions, affectations, brigades, compagnies, gendarmes).

---

## 🌐 URLs d'accès

### Production (Sandbox)
- **Page publique**: https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai
- **Page de connexion admin**: https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai/login
- **Interface d'administration**: https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai/admin

### Identifiants par défaut
- **Utilisateur**: `admin`
- **Mot de passe**: `admin123`

---

## ✅ Fonctionnalités implémentées

### Interface publique (Gendarmes)
1. **Sélecteur de brigade** en haut de page pour filtrer les missions par localisation
2. **Affichage des missions** sous forme de cartes avec :
   - Numéro de mission (badge bleu)
   - Titre et description
   - Brigade et compagnie (bouton cliquable)
   - Dates de début et fin
   - Badge de priorité (haute/moyenne/normale)
   - Compétences requises
   - Barre de progression des effectifs (validés/en attente/libres)
   - **Noms des gendarmes assignés** (validés et en attente)
3. **Filtres avancés** :
   - Par priorité (haute/moyenne/normale)
   - Par statut (complet/places disponibles)
   - Recherche textuelle (titre, description, compétences)
4. **Modal d'informations brigade** :
   - Nom, code, effectifs
   - Adresse complète
   - Téléphone
   - Chef de brigade
   - Informations de la compagnie de rattachement

### Interface d'administration

#### 🔐 Authentification
- Page de connexion sécurisée (`/login`)
- Système JWT avec cookies HTTP-Only
- Protection des routes admin
- Déconnexion avec nettoyage des cookies

#### 📋 Gestion des Missions (Navigation hiérarchique)
- **Affichage organisé** en 3 niveaux :
  1. **Vue Compagnies** : Cartes cliquables affichant le nombre de missions par compagnie
  2. **Vue Brigades** : Après sélection de la compagnie, cartes des brigades avec compteur de missions
  3. **Vue Missions** : Après sélection de la brigade, tableau détaillé des missions
- **Navigation** :
  - Fil d'ariane (breadcrumb) pour voir le chemin : Accueil → Compagnie → Brigade
  - Bouton "Retour aux compagnies" pour revenir à la vue principale
- **Création** avec champs obligatoires :
  - Numéro de mission (unique)
  - Titre
  - Brigade (sélection via dropdown)
  - Date de début et fin
- **Modification** des missions existantes via modal
- **Suppression** de missions
- **Affichage missions** :
  - Numéro, titre, dates
  - Effectifs (assignés/requis) avec code couleur
  - Badge de priorité (haute/moyenne/normale)
  - Actions : voir assignations, éditer, supprimer

#### 👮 Gestion des Gendarmes
- **Barre de recherche** en temps réel permettant de filtrer par :
  - Matricule
  - Nom ou prénom
  - Grade
  - Spécialité
  - Téléphone ou email
- **Liste complète** avec matricule, nom, grade, spécialité, contact
- **Badge** indiquant le nombre de missions actives
- **Création** de nouveaux gendarmes
- **Modification** de gendarmes existants via bouton "Modifier"
- **Affichage** des missions actives par gendarme

#### 📍 Gestion des Lieux
- Organisation hiérarchique : **Compagnies → Brigades**
- **Onglet "Nouveau lieu"** permettant de :
  - Créer/modifier/supprimer des compagnies
  - Créer/modifier/supprimer des brigades
  - Rattacher les brigades aux compagnies
- Affichage des relations hiérarchiques

#### 🎖️ Gestion des Affectations
- Visualisation par mission des effectifs requis
- Assignation de gendarmes (statut : libre → en attente → validé)
- États possibles :
  - **Libre** (gris) : place disponible
  - **En attente** (jaune) : gendarme proposé, validation requise
  - **Validé** (vert) : assignation confirmée
- Actions : affecter, valider, rejeter, libérer

#### 🎨 Personnalisation
- **Logo/écusson personnalisable** :
  - Upload via URL d'image
  - Affichage sur toutes les pages
  - Stockage dans la base de données (table `settings`)

---

## 🗄️ Architecture des données

### Modèle relationnel (Cloudflare D1 SQLite)

#### Table `users`
- `id` (PK), `username`, `password_hash`, `nom`, `prenom`, `role`, `created_at`

#### Table `compagnies`
- `id` (PK), `nom`, `code`, `adresse`, `telephone`, `email`, `commandant`, `created_at`

#### Table `brigades`
- `id` (PK), `compagnie_id` (FK → compagnies), `nom`, `code`, `adresse`, `telephone`, `email`, `effectifs`, `chef_brigade`, `latitude`, `longitude`, `created_at`

#### Table `missions`
- `id` (PK), `numero_mission` (UNIQUE), `titre`, `description`, `lieu`, `brigade_id` (FK → brigades), `date_debut`, `date_fin`, `effectifs_requis`, `competences_requises`, `priorite`, `created_at`

#### Table `gendarmes`
- `id` (PK), `matricule` (UNIQUE), `nom`, `prenom`, `grade`, `specialite`, `telephone`, `email`, `created_at`

#### Table `assignations`
- `id` (PK), `mission_id` (FK → missions), `gendarme_id` (FK → gendarmes, nullable), `statut` (libre/en_attente/valide), `created_at`

#### Table `settings`
- `id` (PK), `key` (UNIQUE), `value`, `updated_at`

### Relations
- Compagnie **1 → N** Brigades
- Brigade **1 → N** Missions
- Mission **1 → N** Assignations
- Gendarme **1 → N** Assignations (validées/en attente)

---

## 🛠️ Stack technique

- **Backend**: Hono.js (framework edge-first)
- **Base de données**: Cloudflare D1 (SQLite distribué)
- **Runtime**: Cloudflare Workers/Pages
- **Frontend**: HTML5 + JavaScript Vanilla + TailwindCSS (CDN)
- **Icons**: Font Awesome 6.4.0 (CDN)
- **Build**: Vite + TypeScript
- **Process Management**: PM2
- **Authentification**: JWT avec cookies HTTP-Only

---

## 📦 Installation et développement local

### Prérequis
- Node.js 18+
- npm 9+
- PM2 (pré-installé dans le sandbox)

### Installation
```bash
cd /home/user/webapp
npm install
```

### Configuration de la base de données
```bash
# Appliquer les migrations
npm run db:migrate:local

# Charger les données de test
npm run db:seed

# Réinitialiser la base (efface tout et recharge)
npm run db:reset
```

### Lancement en développement
```bash
# Build du projet
npm run build

# Démarrer avec PM2
pm2 start ecosystem.config.cjs

# Vérifier les logs
pm2 logs webapp --nostream

# Arrêter le service
pm2 delete webapp
```

### Accès local
- Interface publique : http://localhost:3000
- Interface admin : http://localhost:3000/admin
- API : http://localhost:3000/api/*

---

## 🚀 Déploiement sur Cloudflare Pages

### Prérequis
1. Compte Cloudflare avec API Token configuré
2. Appeler `setup_cloudflare_api_key` pour configurer l'authentification

### Créer le projet Cloudflare Pages
```bash
# Créer la base de données de production
npx wrangler d1 create webapp-production

# Copier le database_id dans wrangler.jsonc

# Créer le projet Pages
npx wrangler pages project create webapp --production-branch main

# Appliquer les migrations en production
npm run db:migrate:prod
```

### Déployer
```bash
# Build et déploiement
npm run deploy

# Ou manuellement
npm run build
npx wrangler pages deploy dist --project-name webapp
```

### Configuration des secrets
```bash
# Ajouter des variables d'environnement (si nécessaire)
npx wrangler pages secret put JWT_SECRET --project-name webapp
```

---

## 📊 API Endpoints

### Public
- `GET /api/missions` - Liste toutes les missions avec gendarmes assignés
- `GET /api/missions/:id` - Détails d'une mission
- `GET /api/brigades` - Liste toutes les brigades avec leurs compagnies
- `GET /api/brigades/:id` - Détails d'une brigade
- `GET /api/compagnies` - Liste toutes les compagnies
- `GET /api/settings/:key` - Récupérer un paramètre (ex: logo)

### Administration (authentification requise)
- `POST /api/auth/login` - Connexion admin
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Vérifier l'authentification
- `POST /api/missions` - Créer une mission
- `PUT /api/missions/:id` - Modifier une mission
- `DELETE /api/missions/:id` - Supprimer une mission
- `POST /api/compagnies` - Créer une compagnie
- `PUT /api/compagnies/:id` - Modifier une compagnie
- `DELETE /api/compagnies/:id` - Supprimer une compagnie
- `POST /api/brigades` - Créer une brigade
- `PUT /api/brigades/:id` - Modifier une brigade
- `DELETE /api/brigades/:id` - Supprimer une brigade
- `POST /api/gendarmes` - Créer un gendarme
- `GET /api/gendarmes` - Liste des gendarmes
- `GET /api/assignations/mission/:missionId` - Assignations par mission
- `PUT /api/assignations/:id` - Modifier une assignation
- `PUT /api/settings/:key` - Modifier un paramètre

---

## 📈 Données de test incluses

- **4 compagnies** : Paris (CGP), Lyon (CGL), Marseille (CGM), Toulouse (CGT)
- **12 brigades** : 3 par compagnie (Centre, Nord, Sud/Est/Ouest)
- **6 missions** : avec numéros M2026-001 à M2026-006
- **6 gendarmes** : grades variés (Adjudant-chef, Maréchal des logis, Brigadier-chef, Gendarme)
- **14 assignations** : mix de statuts (libre, en attente, validé)

---

## 🎯 Fonctionnalités à venir (suggestions)

1. **Authentification avancée** :
   - Gestion des rôles (super_admin, admin, manager)
   - Réinitialisation de mot de passe
   - Multi-factor authentication (MFA)

2. **Notifications** :
   - Email de notification aux gendarmes (nouvelle mission, validation)
   - Rappels automatiques avant début de mission

3. **Export et rapports** :
   - Export PDF des missions
   - Export Excel des statistiques
   - Rapport mensuel d'activité

4. **Visualisations avancées** :
   - Calendrier des missions
   - Carte interactive des brigades
   - Dashboard avec graphiques (Chart.js)

5. **Améliorations UX** :
   - Historique des modifications
   - Upload d'image pour logo (fichier local)
   - Thème sombre
   - Version mobile optimisée

6. **Sécurité** :
   - Rate limiting
   - Validation plus stricte des entrées
   - Audit logs des actions admin

---

## 🔧 Scripts npm disponibles

```bash
npm run dev            # Vite dev server (local machine uniquement)
npm run dev:sandbox    # Wrangler dev server pour sandbox
npm run dev:d1         # Wrangler avec base D1 locale
npm run build          # Build pour production
npm run preview        # Preview du build local
npm run deploy         # Build + déploiement Cloudflare Pages
npm run db:migrate:local   # Appliquer migrations localement
npm run db:migrate:prod    # Appliquer migrations en production
npm run db:seed        # Charger données de test
npm run db:reset       # Réinitialiser base locale
npm run clean-port     # Libérer le port 3000
npm run test           # Test curl de l'API
```

---

## 📝 Guide d'utilisation

### Pour les gendarmes (interface publique)
1. Accéder à la page d'accueil
2. Sélectionner une brigade dans le menu déroulant (optionnel)
3. Utiliser les filtres (priorité, statut, recherche)
4. Consulter les missions disponibles
5. Cliquer sur le bouton brigade pour voir les informations du lieu
6. Noter les gendarmes déjà assignés sur chaque mission

### Pour les administrateurs
1. Se connecter via `/login` (admin/admin123)
2. **Onglet Missions** :
   - Créer une nouvelle mission (champs obligatoires : numéro, titre, brigade, dates)
   - Rechercher une mission via la barre de recherche globale
   - Modifier une mission existante (bouton éditer)
   - Voir/gérer les assignations (bouton "Voir")
   - Supprimer une mission
3. **Onglet Nouveau lieu** :
   - Créer des compagnies (nom, code, adresse, commandant)
   - Créer des brigades rattachées aux compagnies
   - Modifier ou supprimer compagnies/brigades
4. **Onglet Nouveau gendarme** :
   - Ajouter un gendarme (matricule, nom, prénom, grade, spécialité, contact)
   - Voir la liste avec le nombre de missions actives
5. **Paramètres** :
   - Changer l'écusson (logo) via URL d'image

---

## 🏗️ Structure du projet

```
webapp/
├── src/
│   ├── index.tsx          # Application Hono principale
│   └── api.tsx            # Routes API (missions, gendarmes, brigades)
├── public/
│   └── static/
│       ├── app.js         # Frontend public (missions)
│       ├── admin.js       # Frontend admin (CRUD complet + recherche)
│       ├── login.js       # Page de connexion
│       ├── default-logo.png
│       └── styles.css
├── migrations/
│   ├── 0001_initial_schema.sql      # Schéma missions/gendarmes
│   └── 0002_add_auth_brigades.sql   # Auth + brigades/compagnies
├── seed.sql               # Données de test missions/gendarmes
├── seed_brigades.sql      # Données de test compagnies/brigades
├── fix_admin_user.sql     # Script de création compte admin
├── ecosystem.config.cjs   # Configuration PM2
├── wrangler.jsonc         # Configuration Cloudflare
├── vite.config.ts         # Configuration Vite
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔄 Workflow de développement

### Modifications du code
1. Modifier les fichiers dans `src/` ou `public/static/`
2. Rebuild : `npm run build`
3. Redémarrer : `pm2 restart webapp`
4. Tester : `curl http://localhost:3000/api/missions`

### Modifications de la base de données
1. Créer un nouveau fichier de migration dans `migrations/`
2. Appliquer : `npm run db:migrate:local`
3. (Optionnel) Charger des données : créer un fichier SQL et exécuter avec `npx wrangler d1 execute webapp-production --local --file=./votre-fichier.sql`
4. En production : `npm run db:migrate:prod`

### Commits Git
```bash
git add .
git commit -m "Votre message"
git push origin main
```

---

## 🎨 Personnalisation

### Changer les couleurs
Modifier les classes Tailwind dans `src/index.tsx` et les fichiers JS du dossier `public/static/`.

### Ajouter des champs
1. Modifier la migration dans `migrations/`
2. Appliquer avec `npm run db:migrate:local`
3. Mettre à jour les API dans `src/api.tsx`
4. Mettre à jour le frontend dans `public/static/admin.js`

### Ajouter un nouvel utilisateur admin
```bash
# Créer un hash SHA-256 du mot de passe
echo -n "votre_mot_de_passe" | sha256sum

# Insérer dans la base
npx wrangler d1 execute webapp-production --local --command="INSERT INTO users (username, password_hash, nom, prenom, role) VALUES ('nouveau_admin', 'hash_ici', 'Nom', 'Prénom', 'admin')"
```

---

## ⚙️ Configuration Cloudflare

### wrangler.jsonc
```jsonc
{
  "name": "webapp",
  "compatibility_date": "2026-03-05",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "YOUR_DATABASE_ID"
    }
  ]
}
```

---

## 🐛 Dépannage

### Le port 3000 est déjà utilisé
```bash
npm run clean-port
# ou
fuser -k 3000/tcp
```

### L'authentification ne fonctionne pas
- Vérifier que le cookie `auth_token` est bien envoyé
- Vérifier le hash du mot de passe dans la table `users`
- Mot de passe par défaut : `admin123` (hash SHA-256)

### Les brigades n'apparaissent pas
```bash
# Vérifier les données
npx wrangler d1 execute webapp-production --local --command="SELECT * FROM brigades"

# Recharger les données
npm run db:reset
```

### Erreur "SQLITE_ERROR"
- Vérifier la syntaxe SQL dans les fichiers de migration
- S'assurer que toutes les colonnes ont des valeurs

---

## 📅 Historique des versions

### Version 3.0 (2026-03-05)
- ✅ **Navigation hiérarchique** dans l'admin : Compagnies → Brigades → Missions
- ✅ **Cartes cliquables** pour sélectionner compagnies et brigades
- ✅ **Compteurs visuels** de missions par compagnie/brigade
- ✅ **Fil d'ariane** (breadcrumb) pour la navigation
- ✅ **Barre de recherche gendarmes** avec filtrage en temps réel
- ✅ **Modification de gendarmes** via bouton dans l'interface

### Version 2.0 (2026-03-05)
- ✅ Système d'authentification JWT
- ✅ Champ numéro de mission obligatoire
- ✅ Gestion hiérarchique compagnies/brigades
- ✅ Sélecteur de brigade sur page publique
- ✅ Modal d'informations brigade
- ✅ Barre de recherche globale admin
- ✅ Modification des missions existantes
- ✅ Affichage des noms de gendarmes assignés
- ✅ Logo/écusson personnalisable

### Version 1.0 (2026-03-05)
- ✅ CRUD missions, gendarmes, assignations
- ✅ Interface publique avec filtres
- ✅ Interface admin avec onglets
- ✅ Base de données D1 avec migrations
- ✅ Déploiement PM2

---

## 📞 Support et contributions

Pour toute question ou amélioration, veuillez créer une issue sur le dépôt GitHub ou contacter l'équipe de développement.

---

## 📄 Licence

Ce projet est développé pour la Gendarmerie Nationale Française. Tous droits réservés.
