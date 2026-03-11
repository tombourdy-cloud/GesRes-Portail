# 📊 Guide d'Import Excel des Missions - GesRes

## Vue d'ensemble

GesRes permet désormais d'importer des missions en masse depuis des fichiers Excel (.xlsx, .xls). Cette fonctionnalité facilite la création rapide de dizaines ou centaines de missions sans saisie manuelle.

---

## 🔐 Accès à la fonctionnalité

1. **Connexion** : https://gesres-missions.pages.dev/admin
2. **Identifiants** : admin / admin123
3. **Onglet** : **Paramètres** (dernier onglet)
4. **Section** : **Import de missions depuis Excel** (en vert)

---

## 📋 Format Excel Attendu

### Colonnes **OBLIGATOIRES** (dans l'ordre)

| N° | Colonne | Exemple | Description |
|---|---------|---------|-------------|
| 1 | **Numéro de mission** | `1819992` | Identifiant unique de la mission |
| 2 | **Date début** | `13/03/26 15:00:00` | Format : `JJ/MM/AA HH:MM:SS` ou `DD/MM/YYYY HH:MM:SS` |
| 3 | **Date fin** | `13/03/26 23:00:00` | Format : `JJ/MM/AA HH:MM:SS` ou `DD/MM/YYYY HH:MM:SS` |
| 4 | **Description** | `Ordre et sécurité publique` | Texte libre |
| 5 | **Titre** | `Renfort PAM` | Titre court de la mission |
| 6 | **Code brigade** | `58577` ou `BTA-PERSAN` | Code ou nom partiel de la brigade |

### Colonnes **OPTIONNELLES** (dans l'ordre)

| N° | Colonne | Exemple | Défaut | Description |
|---|---------|---------|--------|-------------|
| 7 | **Effectifs requis** | `2` | `1` | Nombre de gendarmes nécessaires |
| 8 | **Priorité** | `normale`, `haute`, `urgente`, `basse` | `normale` | Niveau de priorité |
| 9 | **Compétences** | `PSC1, Permis B` | `null` | Compétences séparées par virgules |

---

## 📥 Exemple de Fichier Excel

### Structure avec en-têtes

| Numéro de mission | Date début | Date fin | Description | Titre | Code brigade | Effectifs requis | Priorité | Compétences |
|---|---|---|---|---|---|---|---|---|
| 1819992 | 13/03/26 15:00:00 | 13/03/26 23:00:00 | Ordre et sécurité publique | Renfort PAM | 58577 | 2 | normale | PSC1 |
| 1827585 | 14/03/26 00:30:00 | 14/03/26 07:00:00 | Ordre et sécurité publique | Renfort BGE | BTA-PERSAN | 1 | haute |  |
| 1819702 | 14/03/26 15:00:00 | 14/03/26 23:00:00 | Ordre et sécurité publique | Renfort PAM | 58577 | 2 | normale |  |

### Formats de dates acceptés

✅ **Formats valides :**
- `13/03/26 15:00:00` (court, recommandé)
- `13/03/2026 15:00:00` (long)
- `2026-03-13 15:00:00` (ISO)

❌ **Formats non valides :**
- `13/03/26` (sans heure)
- `13-03-2026 15:00` (tirets dans date européenne)

---

## 🚀 Procédure d'Import

### 1️⃣ Préparer le fichier Excel

- Télécharger le **modèle Excel** via le bouton bleu **"Télécharger le modèle Excel"**
- Remplir les colonnes avec vos données
- Sauvegarder au format `.xlsx` ou `.xls`

### 2️⃣ Importer dans GesRes

1. **Sélectionner** votre fichier Excel via le bouton vert
2. **Aperçu automatique** : les 5 premières lignes s'affichent
3. **Vérifier** les données affichées
4. **Cliquer** sur **"Importer les missions"** (bouton vert)
5. **Confirmer** l'import dans la boîte de dialogue
6. **Attendre** le résultat

### 3️⃣ Résultats

Le système affichera :
- ✅ **Nombre de missions créées avec succès**
- ❌ **Nombre d'échecs** (avec détails)
- ⚠️ **Lignes ignorées** (erreurs de format)

---

## ⚠️ Gestion des Erreurs

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Numéro de mission manquant` | Colonne 1 vide | Remplir le numéro |
| `Dates invalides` | Format incorrect | Utiliser `JJ/MM/AA HH:MM:SS` |
| `Titre manquant` | Colonne 5 vide | Ajouter un titre |
| `Brigade introuvable` | Code brigade invalide | Vérifier le code dans l'admin |
| `Champs obligatoires manquants` | Colonnes 1-6 incomplètes | Vérifier toutes les colonnes obligatoires |

### Lignes ignorées

Les lignes avec erreurs sont **ignorées** mais l'import continue pour les autres missions. Un résumé détaillé est affiché à la fin.

---

## 🔧 API Technique

### Endpoint : `POST /api/missions/import-batch`

**Requête :**
```json
{
  "missions": [
    {
      "numero_mission": "1819992",
      "titre": "Renfort PAM",
      "description": "Ordre et sécurité publique",
      "brigade_id": 14,
      "date_debut": "2026-03-13 15:00:00",
      "date_fin": "2026-03-13 23:00:00",
      "effectifs_requis": 2,
      "priorite": "normale",
      "competences_requises": "PSC1"
    }
  ]
}
```

**Réponse :**
```json
{
  "success": 1,
  "failed": 0,
  "total": 1,
  "message": "Import terminé: 1 succès, 0 échec(s)"
}
```

---

## 🛡️ Sécurité & Validation

### Validations automatiques

- ✅ **Numéro de mission** : chaîne non vide
- ✅ **Dates** : format valide et parseable
- ✅ **Brigade** : existence vérifiée en base
- ✅ **Priorité** : limitée à `basse`, `normale`, `haute`, `urgente`
- ✅ **Effectifs** : entier positif (défaut : 1)

### Création automatique

Pour chaque mission créée, le système :
1. Insère la mission en base de données
2. Crée les **assignations libres** automatiquement (nombre = effectifs requis)
3. Associe la mission à la brigade

---

## 💡 Conseils & Bonnes Pratiques

### ✅ Recommandations

- **Utiliser le modèle** : télécharger le template pour éviter les erreurs
- **Vérifier les codes brigades** : consulter la liste dans l'onglet "Compagnies & Brigades"
- **Tester avec 2-3 missions** avant un import massif
- **Garder l'en-tête** dans votre fichier Excel pour la lisibilité

### ⚠️ À éviter

- ❌ Importer des missions en doublon (même numéro)
- ❌ Utiliser des codes brigades inexistants
- ❌ Oublier les heures dans les dates
- ❌ Importer plus de 500 missions d'un coup (risque de timeout)

---

## 📞 Support

En cas de problème :
1. Vérifier le format du fichier Excel
2. Télécharger le modèle et comparer
3. Consulter les erreurs affichées après l'import
4. Contacter l'administrateur système

---

## 🔄 Mises à Jour

**Version actuelle** : 7.0 (mars 2026)

**Prochaines améliorations prévues** :
- Import CSV
- Import avec photos/documents
- Gestion des missions récurrentes
- Import avec affectation directe de gendarmes

---

## 📚 Liens Utiles

- **Application** : https://gesres-missions.pages.dev
- **Admin** : https://gesres-missions.pages.dev/admin
- **GitHub** : https://github.com/tombourdy-cloud/GesRes-Portail
- **Documentation générale** : `README.md`
- **Guide mobile** : `GUIDE_MOBILE.md`
