# GesRes - Gestion des Missions Réserve

## 📋 Vue d'ensemble du projet

**GesRes** (Gestion des Missions Réserve) est une application web complète de gestion des missions pour les réservistes de la gendarmerie nationale. Elle permet aux gendarmes de consulter les missions disponibles et aux administrateurs de gérer l'ensemble du système (missions, affectations, brigades, compagnies, gendarmes).

### 🗑️ **NOUVEAU : Nettoyage automatique v6.0**
Les missions expirées sont automatiquement gérées :
- **Suppression automatique** : Le 1er de chaque mois à 2h du matin
- **Critère** : Missions terminées avant le mois précédent
- **Exemple** : Le 1er avril, les missions terminées avant mars sont supprimées
- **Cascade** : Les assignations liées sont supprimées automatiquement
- **Manuel** : Bouton de nettoyage dans l'onglet Paramètres (admin)

### 📊 **NOUVEAU : Import Excel v8.0**

#### Import massif de missions
- **Formats acceptés** : .xlsx, .xls, .ods
- **Colonnes obligatoires** : N° mission, dates début/fin, description, titre, code brigade
- **Colonnes optionnelles** : Effectifs requis, priorité, compétences
- **Écrasement automatique** : Les missions existantes avec le même numéro sont mises à jour
- **Validation automatique** : Vérification des brigades et formats de dates
- **Aperçu avant import** : Affichage des 5 premières lignes
- **Barre de progression** : Suivi en temps réel de l'import
- **Feedback détaillé** : Succès, échecs et erreurs affichés

#### Import massif du personnel (gendarmes)
- **Formats acceptés** : .xlsx, .xls, .ods
- **Colonnes requises** : Grade (abrégé), Nom, Prénom
- **Conversion automatique des grades abrégés** :
  - BRI → Brigadier
  - BRC → Brigadier-Chef
  - MDL → Maréchal-des-logis
  - GND → Gendarme
  - MDC → Maréchal-des-logis-Chef
  - ADJ → Adjudant
  - ADC → Adjudant-Chef
  - MAJ → Major
  - LTN → Lieutenant
  - CNE → Capitaine
  - CEN → Commandant
  - LCL → Lieutenant-Colonel
  - COL → Colonel
- **Détection flexible des colonnes** : Reconnaissance automatique des en-têtes (Grade, Nom, Prénom)
- **Aperçu avec conversion** : Affichage des grades convertis avant import
- **Gestion des doublons** : Mise à jour automatique si gendarme existe déjà (par nom/prénom)
- **Matricule automatique** : Génération automatique si non fourni
- **Barre de progression bleue** : Suivi en temps réel de l'import
- **Feedback détaillé** : Nombre de gendarmes importés et erreurs

### 📱 **Version Mobile/Tablette v5.0**
L'application est maintenant **100% responsive** et optimisée pour tous les appareils :
- **Mobile** : Interface tactile avec menu hamburger
- **Tablette** : Navigation adaptée avec layouts en 2 colonnes
- **Desktop** : Interface complète avec toutes les fonctionnalités

---

## 🌐 URLs d'accès

### Production (Cloudflare Pages)
- **Page publique**: https://gesres-missions.pages.dev
- **Page de connexion admin**: https://gesres-missions.pages.dev/login
- **Interface d'administration**: https://gesres-missions.pages.dev/admin

### Sandbox (Développement)
- **Page publique**: https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai
- **Page de connexion admin**: https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai/login
- **Interface d'administration**: https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai/admin

### Identifiants par défaut
- **Utilisateur**: `admin`
- **Mot de passe**: `admin123`

---

## ✅ Fonctionnalités implémentées

### 📱 Responsive Design Mobile/Tablette (v5.0)

#### Optimisations Mobile (< 640px)
- **Menu hamburger** : Navigation latérale avec overlay et backdrop
- **Zones tactiles** : Minimum 44px pour tous les boutons et liens
- **Grilles adaptatives** : Passage en colonne unique sur mobile
- **Modales plein écran** : Pour une meilleure lisibilité
- **Navigation sticky** : Barre de navigation fixée en haut
- **Fil d'ariane responsive** : Textes réduits et wrap automatique
- **Inputs optimisés** : Font-size 16px (évite le zoom iOS)
- **Scroll fluide** : Smooth scroll sur toute l'application

#### Optimisations Tablette (640px - 1024px)
- **Grilles 2 colonnes** : Utilisation optimale de l'espace
- **Navigation classique** : Boutons dans la barre de navigation
- **Modales adaptées** : 90% de la largeur d'écran
- **Espacements ajustés** : Padding optimisé pour tablette

#### Fonctionnalités Cross-Device
- **Menu mobile synchronisé** : Logo et informations utilisateur
- **Onglets scrollables** : Navigation horizontale sur mobile
- **Textes raccourcis** : Labels adaptés pour petits écrans
- **Boutons empilés** : Organisation verticale sur mobile
- **Breakpoints CSS** :
  - `< 640px` : Mobile
  - `641px - 1024px` : Tablette
  - `> 1024px` : Desktop

### Interface publique (Gendarmes)

#### Navigation hiérarchique optimisée
1. **Niveau 1 - Sélection Compagnie** :
   - Cartes visuelles élégantes avec dégradés
   - Compteur de missions par compagnie (grand format)
   - Informations clés : commandant, téléphone, adresse
   - Nombre de brigades rattachées
   - Animation hover avec élévation et ombre

2. **Niveau 2 - Sélection Brigade** :
   - Cartes vertes thématiques
   - Compteur de missions par brigade
   - Chef de brigade, effectifs, coordonnées
   - Bouton "Informations détaillées" pour modal
   - Fil d'ariane pour navigation : Accueil → Compagnie

3. **Niveau 3 - Liste des Missions** :
   - **Filtres avancés** (conservés) :
     - Par priorité (haute/moyenne/normale)
     - Par disponibilité (places disponibles/complet)
     - Recherche textuelle (titre, description, compétences)
   - **Affichage missions** sous forme de cartes avec :
     - Numéro de mission (badge bleu)
     - Titre et description
     - Badge de priorité (rouge/jaune/vert)
     - Dates de début/fin et durée calculée
     - Barre de progression des effectifs
     - **Noms des gendarmes assignés** avec avatars circulaires
     - Statuts : validés (vert) et en attente (jaune)
   - Fil d'ariane : Accueil → Compagnie → Brigade
   - Bouton retour vers brigades

#### Features UX
- **Scroll automatique** vers le haut à chaque navigation
- **Animations fluides** : cartes qui s'élèvent au survol
- **Design moderne** : dégradés, ombres, coins arrondis
- **Police Inter** : professionnelle et lisible
- **Modal brigade** : Informations complètes (brigade + compagnie)

### Interface d'administration

#### 🔐 Authentification
- Page de connexion sécurisée (`/login`)
- Système JWT avec cookies HTTP-Only
- Protection des routes admin
- Déconnexion avec nettoyage des cookies

#### 📋 Gestion des Missions (Navigation hiérarchique avec filtrage par mois)
- **Affichage organisé** en 4 niveaux :
  1. **Vue Compagnies** : Cartes cliquables affichant le nombre de missions par compagnie
  2. **Vue Brigades** : Après sélection de la compagnie, cartes des brigades avec compteur de missions
  3. **Vue Sélection Mois** : Après sélection de la brigade, cartes mensuelles avec :
     - Mois et année (format MMMM YYYY)
     - Nombre de missions du mois
     - Statistiques : missions haute priorité et effectifs requis
     - Missions groupées automatiquement par mois de début
  4. **Vue Missions du Mois** : Après sélection du mois, tableau détaillé des missions :
     - Missions triées par date de début (ordre chronologique)
     - Affichage date de début et date de fin
     - Bouton export PDF pour le mois complet
- **Navigation** :
  - Fil d'ariane (breadcrumb) : Accueil → Compagnie → Brigade → Mois
  - Bouton "Retour aux compagnies" pour revenir à la vue principale
  - Clic sur n'importe quel élément du fil d'ariane pour revenir en arrière
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
- **Import Excel massif** : Bouton "Importer Excel" pour import depuis fichier
  - Colonnes : Grade (abrégé), Nom, Prénom
  - Conversion automatique des grades abrégés (BRI→Brigadier, MDL→Maréchal-des-logis, etc.)
  - Aperçu avec conversion avant import
  - Barre de progression en temps réel
  - Gestion des doublons (mise à jour automatique)
- **Barre de recherche** en temps réel permettant de filtrer par :
  - Matricule
  - Nom ou prénom
  - Grade
  - Spécialité
  - Téléphone ou email
- **Liste complète** avec matricule, nom, grade, spécialité, contact
- **Badge** indiquant le nombre de missions actives
- **Création manuelle** de nouveaux gendarmes avec :
  - **Grades officiels** (liste déroulante, dans l'ordre hiérarchique) :
    - Brigadier
    - Brigadier-Chef
    - Maréchal-des-logis
    - **Gendarme** ← (placé ici par choix organisationnel)
    - Maréchal-des-logis-Chef
    - Adjudant
    - Adjudant-Chef
    - Major
    - Sous-Lieutenant
    - Lieutenant
    - Capitaine
    - Commandant
    - Lieutenant-Colonel
    - Colonel
    - Général
- **Modification manuelle** de gendarmes existants via bouton "Modifier"
  - Possibilité de modifier tous les champs (matricule, nom, prénom, grade, spécialité, contact)
  - Formulaire pré-rempli avec les données existantes
  - Validation automatique
- **Affichage** des missions actives par gendarme
- **Suppression** avec confirmation

#### 📍 Gestion des Lieux
- Organisation hiérarchique : **Compagnies → Brigades**
- **Onglet "Compagnies & Brigades"** permettant de :
  - Créer/modifier/supprimer des compagnies
  - Créer/modifier/supprimer des brigades
  - Rattacher les brigades aux compagnies
- **Champs compagnies** : nom, code, adresse, téléphone, email, commandant
- **Champs brigades** : nom, code, adresse, téléphone, email, compagnie de rattachement
- Affichage des relations hiérarchiques avec compteur de brigades par compagnie

#### 🎖️ Gestion des Affectations
- Visualisation par mission des effectifs requis
- Assignation de gendarmes (statut : libre → en attente → validé)
- **Modification d'affectation** : Changer le gendarme assigné sur une mission
- États possibles :
  - **Libre** (gris) : place disponible
  - **En attente** (jaune) : gendarme proposé, validation requise
  - **Validé** (vert) : assignation confirmée
- Actions disponibles par statut :
  - **Place libre** : Assigner un gendarme
  - **En attente** : Modifier, Valider, Rejeter
  - **Validé** : Modifier, Libérer
- Workflow de modification :
  1. Cliquer sur "✏️ Modifier"
  2. Choisir un nouveau gendarme dans le dropdown
  3. Confirmer : le statut passe automatiquement à "En attente"
  4. Valider l'assignation pour confirmation finale

#### 🎨 Personnalisation
- **Logo/écusson personnalisable** :
  - **Option 1 : Téléversement de fichier** depuis votre ordinateur
    - Formats supportés : PNG, JPG, GIF, SVG
    - Taille maximale : 2 Mo
    - Aperçu en temps réel avant enregistrement
    - Stockage en base64 dans la base de données
  - **Option 2 : URL d'image** hébergée en ligne
  - Aperçu du logo actuel
  - Bouton de réinitialisation au logo par défaut
  - Affichage sur toutes les pages (publique et admin)

---

## 🗄️ Architecture des données

### Modèle relationnel (Cloudflare D1 SQLite)

#### Table `users`
- `id` (PK), `username`, `password_hash`, `nom`, `prenom`, `role`, `created_at`

#### Table `compagnies`
- `id` (PK), `nom`, `code`, `adresse`, `telephone`, `email`, `commandant`, `created_at`

#### Table `brigades`
- `id` (PK), `compagnie_id` (FK → compagnies), `nom`, `code`, `adresse`, `telephone`, `email`, `latitude`, `longitude`, `created_at`
- Note : Les champs `effectifs` et `chef_brigade` ont été dépréciés (NULL)

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
- `POST /api/assignations` - Créer une nouvelle assignation (place supplémentaire)
- `PUT /api/assignations/:id` - Modifier une assignation (assigner/valider/rejeter/libérer/modifier gendarme)
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

## ⚡ Performances et optimisations

### Chargement optimisé
- **Préchargement parallèle** : Toutes les données (missions, brigades, compagnies, gendarmes) sont chargées en une seule fois au démarrage
- **Pas de rechargement inutile** : Navigation entre onglets sans rechargement des données
- **Rechargement ciblé** : Après création/modification, seules les données modifiées sont rechargées

### Temps de réponse API (mesurés)
- Page HTML : ~8ms
- API Compagnies : ~13ms
- API Brigades : ~13ms
- API Gendarmes : ~15ms
- API Missions : ~43ms (incluant les jointures et agrégations)

### UI responsive
- **Police Inter** : Police moderne et professionnelle open-source (alternative légale à Marianne)
- **Effets hover** : Animation fluide sur les cartes cliquables
- **Codes couleur** : Bleu pour compagnies, vert pour brigades, badges de statut
- **Grid responsive** : Adaptation automatique mobile/tablette/desktop

### Design
- **Police** : Inter (Google Fonts) - poids 300 à 800
- **Palette** : Bleu (#2563eb) compagnies, Vert (#16a34a) brigades
- **Antialiasing** : Rendu optimisé pour écrans haute résolution
- **Feature settings OpenType** : Ligatures et variantes contextuelles activées

### Expérience utilisateur (UX)
- **Navigation progressive** : Découverte étape par étape (Compagnies → Brigades → Missions)
- **Fil d'ariane cliquable** : Navigation rapide entre les niveaux
- **Cartes interactives** : Hover effects avec élévation et ombre portée
- **Codes couleur cohérents** : Bleu (compagnies), Vert (brigades), badges de statut
- **Animations fluides** : Transitions de 300ms, scroll automatique
- **Avatars visuels** : Initiales des gendarmes dans cercles colorés
- **Compteurs en grand format** : Lisibilité immédiate du nombre de missions
- **Design responsive** : Adaptation tablette/mobile avec grilles flexibles

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

**Workflow de navigation optimisé** :

1. **Page d'accueil - Sélection Compagnie** :
   - Visualiser les 4 compagnies sous forme de cartes élégantes
   - Voir le nombre de missions par compagnie
   - Voir les informations de contact de chaque compagnie
   - Cliquer sur une carte pour accéder aux brigades

2. **Vue Brigades** :
   - Voir les brigades de la compagnie sélectionnée
   - Consulter le nombre de missions par brigade
   - Accéder aux informations détaillées via le bouton en bas de carte
   - Cliquer sur une brigade pour voir ses missions
   - Utiliser le fil d'ariane pour revenir aux compagnies

3. **Vue Missions** :
   - Consulter uniquement les missions de la brigade sélectionnée
   - **Utiliser les filtres** :
     - Priorité (haute/moyenne/normale)
     - Disponibilité (places disponibles/complet)
     - Recherche textuelle
   - Voir les détails de chaque mission :
     - Numéro, titre, description
     - Dates et durée
     - Compétences requises
     - Progression des effectifs
     - **Noms et grades des gendarmes déjà assignés**
   - Cliquer sur "Informations brigade" pour voir coordonnées complètes
   - Utiliser le fil d'ariane pour naviguer : Accueil → Compagnie → Brigade

### Pour les administrateurs

#### Consultation des missions par mois (workflow recommandé)

**Objectif** : Visualiser les missions d'une brigade organisées par mois pour faciliter la planification.

**Étapes** :
1. **Se connecter** via `/login` (admin/admin123)
2. **Onglet Missions** → Vous êtes sur la vue Compagnies
3. **Cliquer sur une compagnie** (ex: Compagnie de Gendarmerie de Pontoise)
   - Vous voyez maintenant toutes les brigades de cette compagnie avec leur nombre de missions
4. **Cliquer sur une brigade** (ex: BTA AUVERS SUR OISE)
   - Vous voyez maintenant une **sélection de mois** disponibles
   - Chaque carte mensuelle affiche :
     - Le mois et l'année (ex: Mars 2026)
     - Le nombre total de missions du mois
     - Statistiques : missions haute priorité, effectifs requis
5. **Cliquer sur un mois** (ex: Mars 2026)
   - Vous voyez maintenant **toutes les missions de ce mois** pour cette brigade
   - Les missions sont **triées chronologiquement** par date de début
   - Vous pouvez :
     - Voir les détails de chaque mission
     - Gérer les assignations (bouton "Voir")
     - Modifier une mission (bouton éditer)
     - Exporter le mois complet en PDF
     - Supprimer une mission

**Navigation rapide** :
- Utilisez le fil d'ariane en haut : `Accueil → Compagnie → Brigade → Mois`
- Cliquez sur n'importe quel élément pour revenir en arrière
- Bouton "Retour aux compagnies" pour retourner à la vue principale

**Avantages** :
- ✅ Vision mensuelle claire des missions
- ✅ Planification facilitée par période
- ✅ Tri chronologique automatique
- ✅ Export PDF par mois
- ✅ Statistiques visuelles (priorités, effectifs)

#### Autres fonctionnalités admin

1. **Créer une nouvelle mission** :
   - Cliquer sur "Nouvelle mission" (bouton bleu en haut)
   - Remplir les champs obligatoires : numéro, titre, brigade, dates
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

### Version 3.9 (2026-03-18)
- ✅ **Import Excel du personnel (gendarmes)** :
  - Modal d'import avec instructions claires
  - Upload de fichier .xlsx, .xls, .ods
  - Détection flexible des colonnes (Grade, Nom, Prénom)
  - **Conversion automatique des grades abrégés** :
    - Mapping complet de 13 grades (BRI→Brigadier, MDL→Maréchal-des-logis, etc.)
    - Aperçu avec conversion visible avant import
  - Génération automatique des matricules (GR0001, GR0002, etc.)
  - Gestion intelligente des doublons (mise à jour si gendarme existe déjà par nom/prénom)
  - Barre de progression bleue en temps réel
  - Récapitulatif détaillé : succès, échecs, erreurs
  - Event listeners pour fermeture du modal et upload de fichier
- ✅ **Modification manuelle des gendarmes** :
  - Bouton "Modifier" dans le tableau des gendarmes
  - Formulaire pré-rempli avec toutes les données
  - Modification de tous les champs (matricule, nom, prénom, grade, spécialité, contact)
  - Validation et enregistrement via API PUT /api/gendarmes/:id
- ✅ **Écrasement des missions à l'import** :
  - Vérification du numéro de mission avant création
  - Mise à jour automatique (PUT) si mission existe déjà
  - Création (POST) si nouvelle mission
  - Messages distincts dans la barre de progression ("Création..." / "Mise à jour...")
- ✅ **Amélioration de l'affichage des dates** :
  - Format DD/MM/YYYY HH:mm dans toutes les vues (tableau missions, aperçu, export)
  - Normalisation complète dans toutes les fonctions dayjs
- ✅ **Bouton "Supprimer toutes les missions"** :
  - Bouton rouge avec icône danger dans l'onglet Missions (admin)
  - Double confirmation : alerte + saisie de texte "SUPPRIMER TOUT"
  - Suppression une par une avec barre de progression rouge
  - Endpoint API DELETE /api/missions/all
  - Affichage du nombre de missions supprimées

### Version 3.8 (2026-03-06)
- ✅ **Modification d'affectation de gendarme** :
  - Ajout du bouton "✏️ Modifier" pour les assignations validées et en attente
  - Modal de modification avec dropdown de gendarmes disponibles
  - Fonction `modifyAssignation()` : affiche modal temporaire avec liste des gendarmes
  - Fonction `confirmModifyAssignation()` : met à jour l'assignation et change le statut à "En attente"
  - Pré-sélection du gendarme actuellement assigné dans le dropdown
  - Fermeture automatique du modal après confirmation
  - Rechargement automatique de la liste des assignations et des missions
  - Statut automatiquement passé à "En attente" après modification (nécessite re-validation)
  - Suppression du bouton "🔘 Ajouter une place supplémentaire"
  - Workflow cohérent : Modifier → Choisir nouveau gendarme → Valider l'assignation

### Version 3.7 (2026-03-06)
- ✅ **Corrections modals et gestion des places** :
  - Fermeture du modal assignations par clic sur le fond
  - Ajout de `addNewAssignation()` pour créer une place supplémentaire
  - Bouton "Ajouter une place supplémentaire" quand aucune place libre
  - API POST `/api/assignations` pour créer une nouvelle assignation
  - Incrémentation automatique de `effectifs_requis` lors de l'ajout de place

### Version 3.6 (2026-03-06)
- ✅ **Export PDF des missions et assignations** :
  - Bibliothèques jsPDF 2.5.1 + jsPDF-AutoTable 3.8.2 (CDN)
  - Export PDF individuel par mission (bouton vert avec icône PDF)
  - Export PDF groupé de toutes les missions d'une brigade
  - Contenu PDF : en-tête, détails mission, tableau assignations, pied de page
  - Noms de fichiers automatiques : `Mission_M2026-001_2026-03-06.pdf` et `Missions_BPC_2026-03-06.pdf`
- ✅ **Système de notifications email** :
  - Intégration Resend API pour envoi d'emails
  - Templates HTML pour 3 types de notifications :
    - Nouvelle assignation (notification au gendarme)
    - Assignation validée (confirmation)
    - Rappel 48h avant début de mission
  - Routes API : `POST /api/notifications/nouvelle-assignation` et `/api/notifications/assignation-validee`
  - Configuration via secret Cloudflare : `RESEND_API_KEY`
  - Design professionnel avec logo, couleurs Gendarmerie, footer

### Version 3.5 (2026-03-06)
- ✅ **Correction bouton "Voir" pour les assignations** :
  - Ajout de la route API manquante `GET /api/assignations/mission/:missionId`
  - Récupération des assignations avec détails complets des gendarmes (JOIN)
  - Tri automatique des assignations : Validés → En attente → Libres
  - Modal fonctionnel avec affichage des 3 statuts (Libre/En attente/Validé)
  - Actions complètes : Assigner, Valider, Rejeter, Libérer
  - Rechargement automatique après chaque action
  - Liste déroulante des gendarmes disponibles pour assignation
  - Confirmations avant actions critiques
  - Compteur d'effectifs mis à jour en temps réel

### Version 3.4 (2026-03-05)
- ✅ **Téléversement de fichier pour le logo/blason** :
  - Ajout d'un champ de sélection de fichier (input type="file")
  - Aperçu en temps réel de l'image sélectionnée
  - Validation de la taille (max 2 Mo)
  - Validation des formats (PNG, JPG, GIF, SVG)
  - Conversion automatique en base64 pour stockage en DB
  - API PUT /api/config/:key avec validation de taille (max 5 Mo stockés)
  - Bouton de réinitialisation au logo par défaut
  - Affichage de l'aperçu du logo actuel dans les paramètres
  - Double option : téléversement fichier OU URL externe

### Version 3.3 (2026-03-05)
- ✅ **Correction modals** : Fermeture par croix X fonctionnelle sur tous les modals
- ✅ **Simplification brigades** : Suppression des champs "effectifs" et "chef de brigade"
- ✅ **Renommage** : Le site s'appelle maintenant "GesRes - Gestion des Missions Réserve"
- ✅ **Ordre grades** : Gendarme placé après Maréchal-des-logis dans la liste déroulante
- ✅ **Migration DB** : Mise à NULL des colonnes dépréciées (effectifs, chef_brigade)

### Version 3.2 (2026-03-05)
- ✅ **Navigation hiérarchique publique** : Compagnies → Brigades → Missions (comme interface admin)
- ✅ **Design moderne** : Cartes avec dégradés, animations hover, élévation au survol
- ✅ **Fil d'ariane** : Navigation visuelle avec breadcrumb cliquable
- ✅ **Filtres conservés** : Priorité, disponibilité, recherche (uniquement dans vue missions)
- ✅ **Avatars gendarmes** : Initiales dans cercles colorés
- ✅ **Police Inter** : Remplacement de Marianne pour conformité légale
- ✅ **Scroll automatique** : Retour en haut de page à chaque navigation

### Version 3.1 (2026-03-05)
- ✅ **Liste déroulante des grades** : 15 grades officiels de la gendarmerie (Gendarme à Général)
- ✅ **Optimisation chargement** : Préchargement parallèle de toutes les données (missions, brigades, compagnies, gendarmes)
- ✅ **Police Inter** : Police moderne et professionnelle (alternative légale à Marianne pour usage non-gouvernemental)
- ✅ **Amélioration UI** : Cartes compagnies/brigades avec effets hover améliorés et codes couleur

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
