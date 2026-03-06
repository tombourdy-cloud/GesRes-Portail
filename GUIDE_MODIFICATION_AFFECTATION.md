# Guide : Modifier l'affectation d'un gendarme

## ✅ Version 3.8 - Modification d'affectation gendarme

Date : 06/03/2026

---

## 🎯 Fonctionnalité implémentée

**Problème résolu** : L'administrateur peut maintenant **modifier l'affectation d'un gendarme sur une mission** sans créer de nouvelle place.

### Scénarios d'utilisation

1. **Modifier un gendarme validé** : Changer le gendarme assigné après validation
2. **Modifier un gendarme en attente** : Choisir un autre gendarme avant validation
3. **Aucun bouton "Ajouter une place"** : Ce bouton a été supprimé

---

## 🔧 Comment utiliser

### Étape 1 : Accéder aux assignations d'une mission

1. Se connecter en tant qu'administrateur : https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai/admin
   - **Identifiant** : `admin`
   - **Mot de passe** : `admin123`

2. Cliquer sur l'onglet **"Missions"**

3. Naviguer vers une mission (Compagnie → Brigade → Mission)

4. Cliquer sur le bouton **"👥 Voir"** pour afficher les gendarmes assignés

### Étape 2 : Modifier l'affectation

#### Pour une assignation validée (badge vert) :

1. Cliquer sur le bouton **"✏️ Modifier"** à droite du gendarme
2. Un modal s'affiche avec :
   - Le gendarme actuellement assigné
   - Un dropdown pour choisir un nouveau gendarme
3. Sélectionner le nouveau gendarme dans la liste
4. Cliquer sur **"✓ Confirmer"**
5. Le statut passe automatiquement à **"En attente"** (jaune)

#### Pour une assignation en attente (badge jaune) :

1. Cliquer sur le bouton **"✏️ Modifier"**
2. Choisir un autre gendarme dans le dropdown
3. Cliquer sur **"✓ Confirmer"**
4. L'affectation est mise à jour

---

## 📋 Tests de validation

### Test 1 : Modifier un gendarme validé

**Prérequis** : Une mission avec au moins 1 assignation validée

1. Ouvrir la mission `M2026-001` (BPC - Contrôle routier)
2. Cliquer sur **"👥 Voir"**
3. Repérer l'assignation validée (badge vert) : `Pierre Bernard`
4. Cliquer sur **"✏️ Modifier"**
5. Sélectionner un autre gendarme (ex : `Jean Martin`)
6. Cliquer sur **"✓ Confirmer"**
7. **Résultat attendu** :
   - Message de succès : ✅ "Gendarme modifié avec succès"
   - La ligne affiche maintenant `Jean Martin`
   - Le badge passe à **"En attente"** (jaune)
   - Le compteur d'effectifs reste identique

### Test 2 : Modifier un gendarme en attente

**Prérequis** : Une mission avec au moins 1 assignation en attente

1. Ouvrir une mission avec une assignation en attente
2. Cliquer sur **"✏️ Modifier"**
3. Choisir un nouveau gendarme
4. Cliquer sur **"✓ Confirmer"**
5. **Résultat attendu** :
   - Message de succès
   - Le nouveau gendarme est affiché
   - Le statut reste **"En attente"**

### Test 3 : Vérifier la suppression du bouton "Ajouter une place"

1. Ouvrir n'importe quelle mission
2. Cliquer sur **"👥 Voir"**
3. **Résultat attendu** :
   - Aucun bouton **"🔘 Ajouter une place supplémentaire"**
   - Seuls les boutons suivants sont visibles :
     - Pour les places libres : dropdown + **"Assigner"**
     - Pour les places en attente : **"✏️ Modifier"**, **"✓ Valider"**, **"✗ Rejeter"**
     - Pour les places validées : **"✏️ Modifier"**, **"🔓 Libérer"**

### Test 4 : Annuler une modification

1. Cliquer sur **"✏️ Modifier"**
2. Cliquer sur **"Annuler"** ou sur la croix ✗
3. **Résultat attendu** :
   - Le modal de modification se ferme
   - Aucune modification n'est appliquée

---

## 🔧 Détails techniques

### Frontend (`admin.js`)

**Nouvelle fonction `modifyAssignation(assignationId, missionId)`** :
- Affiche un modal temporaire avec un dropdown de gendarmes
- Pré-sélectionne le gendarme actuellement assigné
- Permet de choisir un nouveau gendarme

**Nouvelle fonction `confirmModifyAssignation(assignationId, missionId)`** :
- Envoie une requête `PUT /api/assignations/:id`
- Met à jour l'assignation avec le nouveau gendarme
- Passe automatiquement le statut à **"en_attente"**
- Rafraîchit la liste des assignations et missions

**Bouton "Modifier" ajouté pour** :
- Les assignations validées (statut : `valide`)
- Les assignations en attente (statut : `en_attente`)

### Backend (`api.tsx`)

**Route existante utilisée** : `PUT /api/assignations/:id`
- Supporte déjà la modification du `gendarme_id`
- Met à jour le champ `assigned_at` avec l'horodatage actuel
- Conserve ou crée le commentaire si fourni

### Données mises à jour

```json
{
  "gendarme_id": 5,           // Nouveau gendarme
  "statut": "en_attente",     // Toujours "en_attente" après modification
  "assigned_at": "2026-03-06T14:30:00Z"
}
```

---

## 🎨 Interface utilisateur

### Bouton "Modifier" (indigo)

```html
<button onclick="modifyAssignation(1, 1)" class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">
  <i class="fas fa-edit"></i> Modifier
</button>
```

### Modal de modification

```
┌─────────────────────────────────────────┐
│ Modifier l'affectation              ✗  │
├─────────────────────────────────────────┤
│ Gendarme actuel : Pierre Bernard        │
│                                         │
│ Nouveau gendarme :                      │
│ ┌─────────────────────────────────┐     │
│ │ GR001 - Martin Jean (Capitaine) │     │
│ └─────────────────────────────────┘     │
│                                         │
│  [Annuler]  [✓ Confirmer]              │
└─────────────────────────────────────────┘
```

---

## 📊 Workflow de modification

```
┌─────────────────┐
│ Assignation     │
│ validée         │ ──────┐
└─────────────────┘       │
                          │ Clic "Modifier"
┌─────────────────┐       │
│ Assignation     │ ──────┤
│ en attente      │       │
└─────────────────┘       │
                          ↓
                  ┌─────────────────┐
                  │ Modal           │
                  │ Choisir nouveau │
                  │ gendarme        │
                  └─────────────────┘
                          │
                          │ Confirmer
                          ↓
                  ┌─────────────────┐
                  │ Assignation     │
                  │ mise à jour     │
                  │ Statut:         │
                  │ "en_attente"    │
                  └─────────────────┘
```

---

## ⚠️ Points importants

### Règles de gestion

1. **Après modification** : Le statut est toujours `en_attente`
2. **Validation requise** : L'administrateur doit re-valider l'affectation
3. **Modification illimitée** : On peut modifier autant de fois que nécessaire
4. **Places fixes** : Aucune place supplémentaire n'est créée

### Sécurité

- Vérification JWT côté serveur
- Validation des IDs (mission, assignation, gendarme)
- Transactions atomiques en base de données
- Vérification que le gendarme existe

### UX/UI

- Modal z-index élevé (z-[60]) pour passer devant le modal des assignations
- Pré-sélection du gendarme actuel dans le dropdown
- Messages de confirmation clairs
- Fermeture automatique après succès

---

## 📝 Historique

| Version | Date       | Modifications                                              |
|---------|------------|------------------------------------------------------------|
| 3.8     | 06/03/2026 | Ajout fonction "Modifier affectation gendarme"             |
|         |            | Suppression bouton "Ajouter une place supplémentaire"     |
|         |            | Ajout modal de modification avec dropdown                  |
|         |            | Statut automatique "en_attente" après modification         |
| 3.7     | 06/03/2026 | Correction croix modal assignations                        |
| 3.6     | 06/03/2026 | Export PDF + notifications email                           |
| 3.5     | 05/03/2026 | Correction bouton "Voir"                                   |

---

## 🚀 URLs de test

- **Interface publique** : https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai
- **Interface admin** : https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai/admin
  - Login : `admin`
  - Password : `admin123`
- **API Assignations** :
  - GET : `/api/assignations/mission/:missionId`
  - PUT : `/api/assignations/:id`

---

## 🔮 Améliorations futures possibles

1. **Historique des modifications** : Tracer qui a modifié quoi et quand
2. **Notification par email** : Alerter le gendarme remplacé et le nouveau gendarme
3. **Motif de modification** : Ajouter un champ commentaire obligatoire
4. **Validation en masse** : Valider plusieurs assignations d'un coup
5. **Comparaison de compétences** : Suggérer les gendarmes avec les compétences requises

---

## 📞 Support

Pour toute question ou problème :
- Vérifier les logs : `pm2 logs webapp --nostream`
- Tester l'API : `curl http://localhost:3000/api/assignations/mission/1`
- Consulter la console du navigateur (F12)

---

✅ **Fonctionnalité prête pour la production !**
