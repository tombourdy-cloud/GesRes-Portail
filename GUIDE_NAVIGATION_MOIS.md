# 📅 Guide de Navigation par Mois - GesRes

## Vue d'ensemble

Le système **GesRes** organise les missions par **mois** pour faciliter la planification et la gestion des ressources. Cette fonctionnalité permet aux administrateurs de visualiser rapidement les missions d'une brigade sur une période mensuelle spécifique.

---

## 🎯 Objectif

Permettre aux administrateurs de :
- Visualiser les missions **groupées par mois**
- Planifier les effectifs **mois par mois**
- Identifier rapidement les **périodes chargées**
- Exporter des rapports PDF **par mois**

---

## 🚀 Navigation étape par étape

### Étape 1 : Connexion
```
URL : https://gesres-missions.pages.dev/login
Identifiant : admin
Mot de passe : admin123
```

### Étape 2 : Sélection de la Compagnie
![Vue Compagnies](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Vue+Compagnies)

- **Onglet** : Missions
- **Affichage** : Cartes des compagnies avec compteur de missions
- **Action** : Cliquez sur une carte (ex: "Compagnie de Gendarmerie de Pontoise")

**Informations visibles** :
- Nom de la compagnie
- Code de la compagnie
- Nombre total de missions
- Commandant
- Coordonnées

### Étape 3 : Sélection de la Brigade
![Vue Brigades](https://via.placeholder.com/800x400/16A34A/FFFFFF?text=Vue+Brigades)

- **Affichage** : Cartes des brigades de la compagnie sélectionnée
- **Action** : Cliquez sur une brigade (ex: "BTA AUVERS SUR OISE")

**Informations visibles** :
- Nom de la brigade
- Code de la brigade
- Nombre de missions de la brigade
- Adresse
- Coordonnées

**Fil d'ariane** : `Accueil → Compagnie de Pontoise`

### Étape 4 : Sélection du Mois ⭐ NOUVEAU
![Vue Mois](https://via.placeholder.com/800x400/9333EA/FFFFFF?text=Vue+Mois)

- **Affichage** : Cartes mensuelles avec statistiques
- **Action** : Cliquez sur un mois (ex: "Mars 2026")

**Informations visibles par carte mensuelle** :
- **Mois et année** : Mars 2026
- **Nombre de missions** : 12 missions
- **Missions haute priorité** : 3 haute priorité
- **Effectifs requis** : 45 effectifs requis

**Tri automatique** : Les mois sont affichés par **ordre chronologique** (du plus ancien au plus récent)

**Fil d'ariane** : `Accueil → Compagnie de Pontoise → BTA AUVERS SUR OISE`

### Étape 5 : Liste des Missions du Mois
![Vue Missions](https://via.placeholder.com/800x400/DC2626/FFFFFF?text=Vue+Missions+du+Mois)

- **Affichage** : Tableau des missions du mois sélectionné
- **Tri** : Missions triées par **date de début** (ordre chronologique)

**Colonnes du tableau** :
- N° Mission
- Titre et description (tronquée)
- Date de début et date de fin
- Effectifs (assignés/requis) avec code couleur
- Priorité (badge coloré)
- Actions (Voir, Exporter PDF, Éditer, Supprimer)

**Actions disponibles** :
- 👁️ **Voir les assignations** : Gérer les gendarmes affectés
- 📄 **Exporter en PDF** : Export individuel de la mission
- ✏️ **Éditer** : Modifier les détails de la mission
- 🗑️ **Supprimer** : Supprimer la mission (avec confirmation)
- 📥 **Exporter le mois** : Export PDF de toutes les missions du mois (bouton en haut)

**Fil d'ariane** : `Accueil → Compagnie de Pontoise → BTA AUVERS SUR OISE → Mars 2026`

---

## 🎨 Codes couleur

### Cartes de navigation
- **Bleu** (#3B82F6) : Compagnies
- **Vert** (#16A34A) : Brigades
- **Violet** (#9333EA) : Mois

### Badges de priorité
- **Rouge** : Haute priorité
- **Jaune** : Moyenne priorité
- **Vert** : Priorité normale

### Effectifs
- **Vert** : Mission complète (effectifs assignés ≥ requis)
- **Orange** : Places disponibles (effectifs assignés < requis)

---

## 📊 Cas d'usage typiques

### Cas 1 : Planifier le mois prochain
1. Sélectionner la compagnie
2. Sélectionner la brigade
3. Cliquer sur le mois suivant (ex: Avril 2026)
4. Vérifier les effectifs requis
5. Assigner les gendarmes disponibles

### Cas 2 : Vérifier les périodes chargées
1. Sélectionner la compagnie
2. Sélectionner la brigade
3. Comparer les compteurs de missions entre les mois
4. Identifier les mois avec le plus de missions
5. Anticiper les besoins en effectifs

### Cas 3 : Exporter un rapport mensuel
1. Sélectionner la compagnie
2. Sélectionner la brigade
3. Cliquer sur le mois souhaité
4. Cliquer sur "📄 Exporter le mois" (bouton vert en haut à droite)
5. Le PDF est téléchargé automatiquement

### Cas 4 : Modifier une mission spécifique
1. Naviguer jusqu'au mois concerné
2. Trouver la mission dans le tableau
3. Cliquer sur "✏️ Éditer"
4. Modifier les champs nécessaires
5. Enregistrer

---

## 🔄 Navigation rapide

### Retour en arrière
- **Fil d'ariane cliquable** : Cliquez sur n'importe quel élément pour revenir
  - Clic sur "Accueil" → Retour aux compagnies
  - Clic sur "Compagnie de Pontoise" → Retour aux brigades
  - Clic sur "BTA AUVERS SUR OISE" → Retour aux mois

### Bouton de retour
- **"Retour aux compagnies"** : Bouton en haut à gauche pour revenir directement à la vue principale

---

## 📋 Résumé des avantages

| Avantage | Description |
|----------|-------------|
| 📅 **Vision mensuelle** | Les missions sont automatiquement groupées par mois de début |
| 📊 **Statistiques visuelles** | Compteur de missions, priorités et effectifs par mois |
| 🔢 **Tri chronologique** | Missions triées par date de début dans chaque mois |
| 📥 **Export PDF** | Export facile de toutes les missions du mois |
| 🎯 **Planification facilitée** | Identification rapide des périodes chargées |
| 🧭 **Navigation intuitive** | Fil d'ariane et cartes cliquables |
| ⚡ **Performances** | Chargement rapide grâce au groupement côté frontend |

---

## ❓ FAQ

### Q : Comment sont groupées les missions ?
**R** : Les missions sont groupées par **mois de début** (date_debut). Par exemple, une mission du 28 mars au 5 avril apparaîtra dans le mois de **Mars 2026**.

### Q : Que se passe-t-il si une brigade n'a pas de missions ?
**R** : Un message s'affiche : "Aucune mission planifiée pour la brigade [nom]".

### Q : Peut-on voir toutes les missions d'une brigade en une seule fois ?
**R** : Non, pour des raisons de clarté et de performance, les missions sont organisées par mois. Cela facilite la planification et évite les longs tableaux difficiles à lire.

### Q : Les mois vides sont-ils affichés ?
**R** : Non, seuls les mois ayant **au moins une mission** sont affichés.

### Q : Comment créer une nouvelle mission pour un mois spécifique ?
**R** : Cliquez sur "Nouvelle mission" (bouton bleu en haut), sélectionnez la brigade, puis choisissez une date de début dans le mois souhaité. La mission apparaîtra automatiquement dans le bon mois.

### Q : Puis-je filtrer les missions dans un mois ?
**R** : Actuellement, le filtrage se fait au niveau de la sélection du mois. Pour une recherche globale, utilisez la barre de recherche dans l'onglet Missions (à venir).

---

## 🔧 Support technique

### Problème : Les cartes de mois ne s'affichent pas
**Solution** :
1. Vérifier qu'il y a bien des missions pour cette brigade
2. Rafraîchir la page (Ctrl+F5)
3. Vérifier la console du navigateur (F12) pour d'éventuelles erreurs

### Problème : Les missions ne sont pas triées correctement
**Solution** :
1. Vérifier que les dates des missions sont correctes dans la base de données
2. Le tri se fait automatiquement par `date_debut` croissant
3. Signaler le problème si le tri reste incorrect

### Problème : Le fil d'ariane n'est pas cliquable
**Solution** :
- Le fil d'ariane est actuellement informatif, utilisez le bouton "Retour aux compagnies" pour naviguer

---

## 📞 Contact

Pour toute question ou suggestion d'amélioration sur cette fonctionnalité, contactez l'équipe de développement.

---

**Version** : 3.9 (2026-03-09)  
**Auteur** : Équipe GesRes  
**Dernière mise à jour** : 9 mars 2026
