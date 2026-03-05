# Gestion des Missions - Réserve Gendarmerie

Application web de gestion des missions pour les réservistes de la gendarmerie, avec interface d'administration complète.

## 🎯 Objectif

Permettre la visualisation et la gestion des missions disponibles pour les réservistes de la gendarmerie, avec un système d'assignation et de validation des affectations.

## ✨ Fonctionnalités Complétées

### Interface Utilisateur (Page d'accueil)
- ✅ Affichage de toutes les missions disponibles
- ✅ Statistiques en temps réel (total missions, assignés, en attente, places libres)
- ✅ Filtres par priorité, statut et recherche textuelle
- ✅ Indicateurs visuels de progression des effectifs
- ✅ Badges de priorité (urgente, haute, normale, basse)
- ✅ Affichage des statuts d'assignation (validé, en attente, libre)

### Interface d'Administration
- ✅ Gestion complète des missions (création, modification, suppression)
- ✅ Gestion des gendarmes (ajout, consultation)
- ✅ Système d'assignation des gendarmes aux missions
- ✅ Workflow de validation (libre → en attente → validé)
- ✅ Vue détaillée des assignations par mission
- ✅ Libération des places assignées

### Système de Statuts
- **Libre** : Place disponible, aucun gendarme assigné
- **En attente** : Gendarme assigné, en attente de validation
- **Validé** : Assignation confirmée et validée par l'administrateur

## 🌐 URLs Actuelles

### Développement (Sandbox)
- **Page d'accueil** : https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai
- **Administration** : https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai/admin

### API Endpoints
- `GET /api/missions` - Liste toutes les missions avec statistiques
- `GET /api/missions/:id` - Détails d'une mission avec assignations
- `POST /api/missions` - Créer une nouvelle mission
- `PUT /api/missions/:id` - Modifier une mission
- `DELETE /api/missions/:id` - Supprimer une mission
- `GET /api/gendarmes` - Liste tous les gendarmes
- `GET /api/gendarmes/:id` - Détails d'un gendarme
- `POST /api/gendarmes` - Créer un nouveau gendarme
- `PUT /api/assignations/:id` - Modifier une assignation (assigner/valider/libérer)
- `GET /api/stats` - Statistiques globales

## 🗄️ Architecture de Données

### Tables Database (Cloudflare D1)

**gendarmes**
- id, matricule (unique), nom, prenom, grade, specialite
- telephone, email, disponible, created_at

**missions**
- id, titre, description, lieu
- date_debut, date_fin, effectifs_requis
- competences_requises, priorite (basse|normale|haute|urgente)
- created_at

**assignations**
- id, mission_id (FK), gendarme_id (FK nullable)
- statut (libre|en_attente|valide)
- commentaire, assigned_at, validated_at, created_at

## 🚀 Guide d'Utilisation

### Pour les Utilisateurs (Consultation)
1. Accéder à la page d'accueil
2. Consulter les missions disponibles avec leurs détails
3. Utiliser les filtres pour trouver des missions spécifiques
4. Voir les statistiques globales en haut de page

### Pour les Administrateurs
1. Accéder à l'onglet "Administration"
2. **Créer une nouvelle mission** :
   - Cliquer sur "Nouvelle Mission"
   - Remplir les informations (titre, description, lieu, dates, effectifs)
   - Définir la priorité et les compétences requises
3. **Gérer les assignations** :
   - Cliquer sur "Gérer" pour une mission
   - Assigner un gendarme à une place libre
   - Valider les assignations en attente
   - Libérer des places si nécessaire
4. **Gérer les gendarmes** :
   - Onglet "Gendarmes" pour voir tous les réservistes
   - Ajouter de nouveaux gendarmes avec "Nouveau Gendarme"

### Workflow d'Assignation
```
Place Libre → [Admin assigne] → En Attente → [Admin valide] → Validé
              ↓                              ↓
              [Admin libère] ←───────────────┘
```

## 💻 Déploiement Local

### Prérequis
- Node.js 18+
- NPM

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

# Build du projet
npm run build

# Démarrer avec PM2
pm2 start ecosystem.config.cjs

# Tester
npm run test
```

### Commandes Utiles
```bash
# Vérifier les logs
pm2 logs webapp --nostream

# Redémarrer
pm2 restart webapp

# Arrêter
pm2 stop webapp

# Reset de la base de données
npm run db:reset
```

## 🌍 Déploiement Production (Cloudflare Pages)

### Configuration Requise
1. Compte Cloudflare
2. API Token Cloudflare configuré
3. Base de données D1 en production

### Étapes de Déploiement
```bash
# 1. Créer la base de données D1 en production
npx wrangler d1 create webapp-production

# 2. Copier le database_id dans wrangler.jsonc

# 3. Appliquer les migrations en production
npm run db:migrate:prod

# 4. Créer le projet Cloudflare Pages
npx wrangler pages project create webapp --production-branch main

# 5. Déployer
npm run deploy:prod
```

## 📊 Données de Test Incluses

- **6 Gendarmes** : Différents grades et spécialités
- **6 Missions** : Variété de types de missions et priorités
- **14 Assignations** : Mix de statuts (validé, en attente, libre)

## 🛠️ Stack Technique

- **Backend** : Hono (framework web léger)
- **Base de données** : Cloudflare D1 (SQLite distribué)
- **Frontend** : HTML, CSS, JavaScript (Vanilla)
- **Styling** : Tailwind CSS (CDN)
- **Icons** : Font Awesome
- **HTTP Client** : Axios
- **Dates** : Day.js
- **Déploiement** : Cloudflare Pages
- **Process Manager** : PM2 (développement)

## 📁 Structure du Projet

```
webapp/
├── src/
│   └── index.tsx           # Application Hono principale avec toutes les routes
├── public/
│   └── static/
│       ├── app.js          # JavaScript page d'accueil
│       ├── admin.js        # JavaScript page admin
│       └── style.css       # Styles personnalisés
├── migrations/
│   └── 0001_initial_schema.sql  # Schéma de base de données
├── seed.sql                # Données de test
├── ecosystem.config.cjs    # Configuration PM2
├── wrangler.jsonc          # Configuration Cloudflare
├── vite.config.ts          # Configuration Vite
└── package.json            # Dépendances et scripts
```

## 🔄 Statut Actuel

- ✅ **Application fonctionnelle** : Backend et frontend opérationnels
- ✅ **Base de données** : D1 configuré avec données de test
- ✅ **APIs complètes** : Toutes les routes CRUD implémentées
- ✅ **Interface utilisateur** : Page missions avec filtres
- ✅ **Interface admin** : Gestion complète des assignations
- ⏳ **Déploiement production** : Prêt pour déploiement sur Cloudflare Pages

## 🎯 Prochaines Étapes Recommandées

1. **Authentification** : Ajouter un système de login pour sécuriser l'interface admin
2. **Notifications** : Système d'alertes pour les nouvelles missions et validations
3. **Historique** : Traçabilité des modifications d'assignations
4. **Export** : Génération de rapports PDF/Excel
5. **Calendrier** : Vue calendrier des missions
6. **Recherche avancée** : Filtres par compétences, disponibilité des gendarmes
7. **Dashboard** : Graphiques et analytics des missions

## 📝 Notes Importantes

- Les données sont stockées localement en mode `--local` dans `.wrangler/state/v3/d1`
- Pour la production, créer une vraie base D1 sur Cloudflare
- Les migrations doivent être appliquées à la fois en local et en production
- Le port 3000 est utilisé par défaut pour le développement

## 🔐 Sécurité

⚠️ **Important** : L'interface d'administration n'a actuellement aucune authentification. En production, il est **fortement recommandé** d'ajouter :
- Un système d'authentification (login/password)
- Une gestion des rôles et permissions
- Des tokens JWT ou sessions sécurisées
- Une protection CSRF

## 📞 Support

Pour toute question ou problème, vérifier :
- Les logs PM2 : `pm2 logs webapp --nostream`
- L'état des services : `pm2 list`
- La base de données : `npm run db:console:local`
