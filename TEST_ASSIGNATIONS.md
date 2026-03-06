# 🧪 Guide de test - Gestion des assignations de gendarmes

## 🎯 Fonctionnalité testée
Affichage et gestion des assignations de gendarmes aux missions depuis l'interface admin.

---

## 📋 Prérequis
- Accès à l'interface admin : https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai/admin
- Identifiants : `admin` / `admin123`
- Missions existantes avec effectifs requis
- Gendarmes dans la base de données

---

## 🧪 Scénarios de test

### ✅ Test 1 : Visualiser les assignations d'une mission

**Étapes** :
1. Se connecter à l'interface admin
2. Naviguer dans l'onglet **"Missions"**
3. Cliquer sur une **compagnie** (ex: Compagnie de Gendarmerie de Paris)
4. Cliquer sur une **brigade** (ex: Brigade de Paris Centre)
5. Dans la liste des missions, cliquer sur le bouton **"👥 Voir"** d'une mission
6. **Observer** : Modal "Assignations" s'ouvre

**Résultat attendu** :
- ✅ Modal s'ouvre avec le titre de la mission
- ✅ Affichage des effectifs (ex: "2/3 effectifs")
- ✅ Liste des assignations avec 3 types de statuts :
  - 🟢 **Validé** (vert) : Gendarme assigné et validé
  - 🟡 **En attente** (jaune) : Gendarme proposé mais non validé
  - ⚪ **Libre** (gris) : Place disponible

---

### ✅ Test 2 : Assigner un gendarme à une place libre

**Étapes** :
1. Dans le modal "Assignations" d'une mission
2. Trouver une ligne avec statut **"Libre"**
3. Dans le dropdown **"Choisir..."**, sélectionner un gendarme
   - Format : "Prénom Nom (Matricule)"
   - Ex: "Pierre Bernard (GR003)"
4. Cliquer sur le bouton **✓** (valider)
5. **Observer** : La liste se rafraîchit automatiquement

**Résultat attendu** :
- ✅ Assignation créée avec statut **"En attente"**
- ✅ Gendarme affiché avec :
  - Nom complet
  - Grade et matricule
  - Badge jaune "En attente"
- ✅ Boutons disponibles : ✓ Valider, ✗ Rejeter
- ✅ Compteur d'effectifs mis à jour

---

### ✅ Test 3 : Valider une assignation en attente

**Étapes** :
1. Dans le modal "Assignations"
2. Trouver une assignation avec statut **"En attente"** (jaune)
3. Cliquer sur le bouton **✓ Valider** (vert)
4. **Confirmer** dans la popup de confirmation
5. **Observer** : La ligne passe en vert

**Résultat attendu** :
- ✅ Statut change de "En attente" à **"Validé"**
- ✅ Badge devient vert
- ✅ Bouton disponible : 🔓 Libérer (orange)
- ✅ Date de validation enregistrée
- ✅ Mission visible sur la page publique avec le gendarme assigné

---

### ✅ Test 4 : Rejeter une assignation en attente

**Étapes** :
1. Dans le modal "Assignations"
2. Trouver une assignation avec statut **"En attente"** (jaune)
3. Cliquer sur le bouton **✗ Rejeter** (rouge)
4. **Observer** : La ligne redevient "Libre"

**Résultat attendu** :
- ✅ Statut change de "En attente" à **"Libre"**
- ✅ Badge devient gris
- ✅ Gendarme supprimé de l'assignation
- ✅ Dropdown "Choisir..." réapparaît
- ✅ Place disponible pour un nouveau gendarme

---

### ✅ Test 5 : Libérer une assignation validée

**Étapes** :
1. Dans le modal "Assignations"
2. Trouver une assignation avec statut **"Validé"** (vert)
3. Cliquer sur le bouton **🔓 Libérer** (orange)
4. **Confirmer** dans la popup "Libérer cette place ?"
5. **Observer** : La place redevient libre

**Résultat attendu** :
- ✅ Statut change de "Validé" à **"Libre"**
- ✅ Gendarme retiré de l'assignation
- ✅ Place disponible pour réassignation
- ✅ Mission mise à jour sur la page publique

---

### ✅ Test 6 : Fermer le modal d'assignations

**Étapes** :
1. Dans le modal "Assignations" ouvert
2. Cliquer sur la **croix (✗)** en haut à droite
3. **Observer** : Modal se ferme

**Résultat attendu** :
- ✅ Modal se ferme correctement
- ✅ Liste des missions reste affichée
- ✅ Données mises à jour visibles dans la liste

---

## 🔍 Points de contrôle techniques

### Backend (API)
- ✅ `GET /api/assignations/mission/:missionId` - Liste les assignations avec détails gendarmes
- ✅ `PUT /api/assignations/:id` - Met à jour une assignation (statut, gendarme)
- ✅ Tri automatique : Validés → En attente → Libres
- ✅ JOIN avec table gendarmes pour récupérer les infos complètes

### Frontend (admin.js)
- ✅ Fonction `viewAssignations(missionId)` - Ouvre le modal
- ✅ Fonction `confirmAssign(assignationId, missionId)` - Assigne un gendarme
- ✅ Fonction `validateAssignation(assignationId, gendarmeId, missionId)` - Valide
- ✅ Fonction `rejectAssignation(assignationId, missionId)` - Rejette
- ✅ Fonction `liberateAssignation(assignationId, missionId)` - Libère
- ✅ Rechargement automatique après chaque action

### UI/UX
- ✅ Modal responsive avec scroll si beaucoup d'assignations
- ✅ Codes couleur clairs (vert/jaune/gris)
- ✅ Dropdown avec liste complète des gendarmes disponibles
- ✅ Boutons d'action conditionnels selon le statut
- ✅ Confirmations avant actions critiques (valider, libérer)
- ✅ Fermeture avec croix (✗) fonctionnelle

---

## 🎨 États des assignations

| Statut | Couleur | Badge | Actions disponibles | Description |
|--------|---------|-------|---------------------|-------------|
| **Libre** | Gris | ⚪ | Assigner (dropdown + ✓) | Place non attribuée |
| **En attente** | Jaune | 🟡 | Valider (✓), Rejeter (✗) | Gendarme proposé |
| **Validé** | Vert | 🟢 | Libérer (🔓) | Gendarme confirmé |

---

## 📊 Workflow complet

```
┌─────────┐   Assigner    ┌────────────┐   Valider    ┌─────────┐
│  LIBRE  │ ──────────────> EN ATTENTE  │ ──────────────> VALIDÉ  │
└─────────┘               └────────────┘              └─────────┘
     ▲                          │                           │
     │                          │ Rejeter                   │
     │                          ▼                           │
     └──────────────────────────┘                           │
                                                            │
                  Libérer                                   │
     ┌──────────────────────────────────────────────────────┘
     │
     ▼
┌─────────┐
│  LIBRE  │
└─────────┘
```

---

## 🔒 Sécurité

- ✅ Authentification admin requise (JWT)
- ✅ Validation côté serveur des statuts
- ✅ Vérification de l'existence du gendarme avant assignation
- ✅ Transactions atomiques pour éviter les conflits
- ✅ Timestamps enregistrés (assigned_at, validated_at)

---

## 📝 Données de test

La base de données contient :
- **6 missions** avec effectifs requis variés (1 à 5 gendarmes)
- **6 gendarmes** disponibles avec grades différents
- **14 assignations** préexistantes (mix de statuts)

**Exemple Mission 1** :
- Titre : "Sécurisation événement sportif"
- Effectifs requis : 3
- Assignations actuelles :
  1. Pierre Bernard (Maréchal des logis) - **Validé**
  2. Claire Moreau (Brigadier-chef) - **Validé**
  3. Place libre

---

## ✅ Checklist de validation

- [ ] Test 1 : Modal s'ouvre avec bouton "Voir"
- [ ] Test 2 : Assigner gendarme à place libre fonctionne
- [ ] Test 3 : Valider assignation fonctionne
- [ ] Test 4 : Rejeter assignation fonctionne
- [ ] Test 5 : Libérer assignation fonctionne
- [ ] Test 6 : Fermeture modal avec croix fonctionne
- [ ] Liste des gendarmes chargée dans dropdown
- [ ] Compteur d'effectifs mis à jour en temps réel
- [ ] Badges de couleur corrects
- [ ] Confirmations affichées avant actions critiques
- [ ] Rechargement automatique après chaque action

---

**✨ Fonctionnalité d'assignation complètement opérationnelle !**
