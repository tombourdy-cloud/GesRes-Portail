# 📋 Guide d'import Excel des gendarmes

## Vue d'ensemble

L'interface d'administration permet d'importer en masse la liste des gendarmes depuis un fichier Excel. Cette fonctionnalité facilite grandement la gestion du personnel en permettant l'ajout rapide de plusieurs dizaines ou centaines de gendarmes en une seule opération.

## Accès à la fonctionnalité

1. Connectez-vous à l'interface d'administration : https://gesres-missions.pages.dev/admin
2. Allez dans l'onglet **"Gendarmes"**
3. Cliquez sur le bouton **"Importer Excel"** (bleu, avec icône Excel)

## Format du fichier Excel attendu

### Colonnes requises

Le fichier doit contenir **3 colonnes obligatoires** :

| Colonne | Description | Exemple |
|---------|-------------|---------|
| **Grade** | Grade abrégé du gendarme | BRI, MDL, ADJ |
| **Nom** ou **Nom d'usage** | Nom de famille | Dupont |
| **Prénom** | Prénom | Jean |

**Note importante** : Le système reconnaît automatiquement les colonnes nommées "Nom" ou "Nom d'usage" comme le nom de famille du gendarme. La détection est intelligente et exclut automatiquement la colonne "Prénom" même si elle contient le mot "nom". Cette flexibilité permet d'importer directement des fichiers Excel provenant de différentes sources sans avoir à renommer les colonnes.

### Grades abrégés acceptés

Le système reconnaît automatiquement les abréviations suivantes et les convertit en grades complets :

| Abréviation | Grade complet |
|-------------|--------------|
| **BRI** | Brigadier |
| **BRC** | Brigadier-Chef |
| **MDL** | Maréchal-des-logis |
| **GND** | Gendarme |
| **MDC** | Maréchal-des-logis-Chef |
| **ADJ** | Adjudant |
| **ADC** | Adjudant-Chef |
| **MAJ** | Major |
| **LTN** | Lieutenant |
| **CNE** | Capitaine |
| **CEN** | Commandant |
| **LCL** | Lieutenant-Colonel |
| **COL** | Colonel |

### Exemple de fichier Excel

Voici un exemple de fichier correctement formaté :

```
Grade   Nom       Prénom
BRI     Dupont    Jean
BRC     Martin    Pierre
MDL     Bernard   Marie
GND     Dubois    Luc
MDC     Petit     Sophie
ADJ     Richard   Thomas
ADC     Durand    Claire
MAJ     Leroy     François
LTN     Moreau    Julien
CNE     Simon     Isabelle
```

## Processus d'import

### Étape 1 : Sélection du fichier

1. Cliquez sur **"Sélectionnez votre fichier Excel ou ODS"**
2. Choisissez votre fichier (formats acceptés : `.xlsx`, `.xls`, `.ods`)
3. Le fichier est automatiquement analysé

### Étape 2 : Aperçu et validation

Après l'upload, le système affiche :

- **Un aperçu des 5 premières lignes** avec conversion des grades :
  - Exemple : `BRI → Brigadier`
- **Le nombre total de gendarmes détectés**
- **Les colonnes reconnues** (marquées avec ✅)

Vérifiez que :
- Les colonnes sont correctement détectées
- Les grades sont bien convertis
- Les noms et prénoms sont lisibles

### Étape 3 : Lancement de l'import

1. Cliquez sur **"Commencer l'import"**
2. Une barre de progression bleue s'affiche en temps réel
3. Le système :
   - Vérifie si chaque gendarme existe déjà (par nom + prénom)
   - **Met à jour** le gendarme s'il existe (mise à jour du grade uniquement)
   - **Crée** un nouveau gendarme s'il n'existe pas
   - **Note** : Les champs matricule, spécialité et contact ont été supprimés (migration v3.12)

### Étape 4 : Résultats

À la fin de l'import, vous recevez :

- **Nombre de gendarmes importés avec succès**
- **Nombre d'échecs** (si applicable)
- **Liste des erreurs** détaillées (ex : champs manquants, format incorrect)

## Gestion des doublons

Le système gère intelligemment les doublons :

- **Critère de détection** : Nom + Prénom (insensible à la casse)
- **Action si doublon** : Le gendarme existant est **mis à jour** avec les nouvelles informations
- **Données mises à jour** : Nom, Prénom, Grade

Exemple :
```
Fichier Excel : BRI, Dupont, Jean
Base existante : Gendarme "Jean DUPONT" (grade ADJ)
Résultat : Grade mis à jour vers Brigadier
```

## Structure de données simplifiée (v3.12)

La table `gendarmes` contient uniquement les champs essentiels :

| Champ | Type | Description |
|-------|------|-------------|
| **id** | INTEGER | Identifiant unique (auto-incrémenté) |
| **nom** | TEXT | Nom de famille (requis) |
| **prenom** | TEXT | Prénom (requis) |
| **grade** | TEXT | Grade complet (requis) |
| **disponible** | INTEGER | Disponibilité (0/1, défaut: 1) |
| **created_at** | DATETIME | Date de création |

**Champs supprimés** : matricule, specialite, telephone, email

**Avantages** :
- ✅ Plus d'erreur "Unique constraint failed: gendarmes.matricule"
- ✅ Import plus rapide et fiable
- ✅ Structure simplifiée et performante
- ✅ Focus sur les données essentielles

## Génération automatique des matricules

- **Les matricules sont générés automatiquement** lors de la création ou de l'import
- Format : `GR` suivi d'un numéro séquentiel sur 4 chiffres
- Exemples : `GR0001`, `GR0042`, `GR0153`
- **Vous n'avez pas besoin de fournir de matricule** dans le fichier Excel
- Le système gère automatiquement les matricules pour éviter les doublons

## Champs simplifiés

L'interface de gestion des gendarmes a été simplifiée pour se concentrer sur l'essentiel :

### Champs visibles dans le tableau
- **Nom et Prénom** : Identification du gendarme
- **Grade** : Grade militaire
- **Missions actives** : Nombre de missions en cours

### Champs absents (par choix de simplification)
- **Matricule** : Généré automatiquement, non affiché dans l'interface
- **Spécialité** : Non utilisé
- **Contact (téléphone, email)** : Non requis pour la gestion des missions

Cette simplification permet une saisie plus rapide et une interface plus claire.

## Modification manuelle après import

Après l'import, vous pouvez modifier n'importe quel gendarme :

1. Dans le tableau des gendarmes, cliquez sur **"✏️ Modifier"**
2. Modifiez les champs souhaités (matricule, nom, prénom, grade, spécialité, contact)
3. Cliquez sur **"Enregistrer"**

## Conseils et bonnes pratiques

### Préparation du fichier

1. **Utilisez une première ligne d'en-têtes** : Grade, Nom, Prénom
2. **Vérifiez les abréviations** : Utilisez exactement les codes listés ci-dessus
3. **Évitez les cellules vides** : Tous les gendarmes doivent avoir un grade, nom et prénom
4. **Encodage UTF-8** : Pour les caractères accentués (é, è, à, etc.)

### Avant l'import

- **Sauvegardez votre base** si vous avez des doutes
- **Testez avec un petit fichier** (5-10 lignes) avant d'importer toute votre liste
- **Vérifiez l'aperçu** : Les 5 premières lignes vous donnent une bonne indication

### Pendant l'import

- **Ne fermez pas la page** : L'import peut prendre quelques secondes/minutes selon le nombre de gendarmes
- **La barre de progression** vous indique l'avancement en temps réel
- **Soyez patient** : 50ms de délai entre chaque gendarme pour ne pas surcharger l'API

### Après l'import

- **Vérifiez la liste** : Utilisez la barre de recherche pour retrouver vos gendarmes
- **Corrigez les erreurs** : Si des gendarmes ont échoué, modifiez-les manuellement
- **Complétez les informations** : Ajoutez spécialités, téléphones, emails manuellement si nécessaire

## Formats de fichiers supportés

| Format | Extension | Support |
|--------|-----------|---------|
| Excel moderne | `.xlsx` | ✅ Recommandé |
| Excel ancien | `.xls` | ✅ Supporté |
| OpenDocument | `.ods` | ✅ Supporté |

## Limitations

- **Taille maximale** : Aucune limite théorique, mais pour de très gros fichiers (>1000 lignes), préférez diviser en plusieurs imports
- **Colonnes optionnelles** : Spécialité, Téléphone, Email ne sont pas gérés à l'import (ajoutez-les manuellement après)
- **Photos** : Non supportées à l'import

## Dépannage

### "Aucun gendarme valide trouvé"

Causes possibles :
- Fichier vide ou sans données
- Colonnes mal nommées (vérifiez l'orthographe : "Grade", "Nom", "Prénom")
- Première ligne sans en-têtes

Solution : Ajoutez une ligne d'en-têtes avec exactement "Grade", "Nom", "Prénom"

### "Erreur ligne X : Champs obligatoires manquants"

Causes :
- Une cellule est vide dans la ligne X
- Grade non reconnu

Solution : Vérifiez que toutes les cellules sont remplies et que le grade correspond aux abréviations listées

### La barre de progression reste bloquée

Causes :
- Problème de connexion réseau
- Erreur API

Solution :
- Rafraîchissez la page
- Vérifiez votre connexion internet
- Réessayez l'import

## Support

Pour toute question ou problème :
- Consultez la documentation complète : `README.md`
- Vérifiez les logs d'erreur affichés après l'import
- Contactez l'administrateur système

---

**Version du guide** : 3.9 (2026-03-18)
