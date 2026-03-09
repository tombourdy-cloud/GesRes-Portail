# 📱 Guide d'utilisation Mobile/Tablette - GesRes v5.0

## 🎯 Introduction

GesRes est maintenant **100% responsive** et optimisé pour une utilisation sur **smartphones et tablettes**. Ce guide explique comment utiliser l'application sur différents appareils.

---

## 📱 Utilisation sur Mobile (< 640px)

### Menu de navigation

#### **Interface publique (Gendarmes)**
1. **Accès au menu** :
   - Cliquez sur l'**icône hamburger** (☰) en haut à droite
   - Le menu s'ouvre en glissant depuis la gauche

2. **Options du menu mobile** :
   - **Missions disponibles** : Retour à la liste des compagnies
   - **Administration** : Accès à l'interface admin (nécessite connexion)
   - Logo et nom de l'application

3. **Fermeture du menu** :
   - Cliquez sur le fond sombre (backdrop)
   - Cliquez à nouveau sur l'icône hamburger

#### **Interface admin**
1. **Menu admin mobile** :
   - Icône hamburger en haut à droite
   - Informations de connexion affichées
   - **Missions publiques** : Retour à la vue gendarmes
   - **Administration** : Rester sur l'admin
   - **Déconnexion** : Se déconnecter

### Navigation

#### **Interface publique**
- **Compagnies** : Cartes en colonne unique, faciles à scroller
- **Brigades** : Une carte par ligne, boutons tactiles larges
- **Missions** : 
  - Filtres empilés verticalement
  - Cartes missions en pleine largeur
  - Boutons d'action adaptés

#### **Interface admin**
- **Onglets scrollables** : Swipez horizontalement pour voir tous les onglets
- **Labels raccourcis** :
  - "Miss." au lieu de "Missions"
  - "Lieux" au lieu de "Compagnies & Brigades"
  - "Param." au lieu de "Paramètres"
- **Boutons empilés** : Actions en colonnes verticales

### Modales et formulaires

- **Modales plein écran** : Utilisation optimale de l'espace mobile
- **Champs de formulaire** :
  - Hauteur minimum 44px (norme tactile)
  - Font-size 16px (évite le zoom automatique iOS)
- **Boutons d'action** : Larges et espacés pour éviter les erreurs

### Fil d'Ariane (Breadcrumb)

- **Responsive** : Textes réduits sur mobile
- **Multi-lignes** : Wrap automatique si nécessaire
- **Cliquable** : Navigation rapide vers niveaux précédents

---

## 📱 Utilisation sur Tablette (640px - 1024px)

### Navigation

#### **Interface publique**
- **Compagnies/Brigades** : Grilles 2 colonnes
- **Menu classique** : Boutons dans la barre de navigation (pas de hamburger)
- **Espace optimisé** : Cartes côte à côte

#### **Interface admin**
- **Onglets complets** : Tous les labels affichés
- **Navigation standard** : Boutons dans la barre supérieure
- **Grilles 2 colonnes** : Pour compagnies et brigades

### Modales

- **Taille adaptée** : 90% de la largeur d'écran
- **Scroll vertical** : Si contenu trop long
- **Boutons en ligne** : Annuler et Enregistrer côte à côte

---

## 💻 Utilisation sur Desktop (> 1024px)

### Navigation complète

- **Tous les éléments visibles** : Pas de menu hamburger
- **Grilles 3-4 colonnes** : Utilisation optimale de l'écran large
- **Modales centrées** : Taille maximale 2xl (672px)

---

## 🎨 Optimisations visuelles

### Zones tactiles

✅ **Conformité WCAG 2.1** :
- Minimum **44px × 44px** pour tous les éléments interactifs
- Espacement suffisant entre boutons
- Contraste des couleurs optimisé

### Animations

- **Smooth scroll** : Défilement fluide sur toute l'app
- **Transitions** : Animations des cartes au survol (desktop/tablette)
- **Menu mobile** : Glissement fluide avec backdrop

### Police et lisibilité

- **Police Inter** : Professionnelle et lisible sur tous écrans
- **Tailles adaptatives** :
  - Mobile : textes réduits (text-base → text-sm)
  - Tablette : textes intermédiaires
  - Desktop : textes pleins

---

## 🔧 Fonctionnalités techniques

### Breakpoints CSS

```css
/* Mobile */
@media (max-width: 640px) { ... }

/* Tablette */
@media (min-width: 641px) and (max-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1025px) { ... }
```

### Classes Tailwind utilisées

- `sm:` : Styles à partir de 640px (tablette+)
- `lg:` : Styles à partir de 1024px (desktop)
- `hidden sm:block` : Caché sur mobile, visible tablette+
- `block sm:hidden` : Visible mobile, caché tablette+

### Optimisations iOS/Android

- **iOS** : Font-size 16px évite le zoom automatique
- **Android** : Support des zones tactiles élargies
- **Touch events** : Tap highlight personnalisé
- **Viewport** : `width=device-width, initial-scale=1.0`

---

## 📊 Statistiques de compatibilité

### Appareils testés

| Appareil | Résolution | Statut |
|----------|-----------|--------|
| iPhone SE | 375 × 667 | ✅ Optimisé |
| iPhone 12/13 | 390 × 844 | ✅ Optimisé |
| iPhone 14 Pro Max | 430 × 932 | ✅ Optimisé |
| iPad Mini | 768 × 1024 | ✅ Optimisé |
| iPad Pro | 1024 × 1366 | ✅ Optimisé |
| Samsung Galaxy S21 | 360 × 800 | ✅ Optimisé |
| Desktop 1920px | 1920 × 1080 | ✅ Optimisé |

### Navigateurs supportés

✅ Safari iOS 14+  
✅ Chrome Android 90+  
✅ Chrome Desktop  
✅ Firefox Desktop  
✅ Edge Desktop  

---

## 🚀 Conseils d'utilisation

### Pour les gendarmes (interface publique)

1. **Navigation rapide** :
   - Utilisez le fil d'ariane pour remonter rapidement
   - Scroll pour voir toutes les cartes

2. **Recherche de missions** :
   - Utilisez les filtres (empilés sur mobile)
   - Recherche textuelle pour trouver rapidement

3. **Informations brigades** :
   - Cliquez sur "Informations" pour la modale détaillée
   - Modale plein écran sur mobile pour lisibilité

### Pour les administrateurs

1. **Navigation multi-onglets** :
   - Swipez les onglets horizontalement sur mobile
   - Tous visibles sur tablette/desktop

2. **Gestion des données** :
   - Formulaires adaptés pour saisie tactile
   - Validation inline pour éviter erreurs

3. **Export PDF** :
   - Fonctionnel sur tous appareils
   - Téléchargement automatique

---

## 📞 Support technique

Pour toute question ou problème d'affichage mobile :

1. Vérifiez votre **version de navigateur** (mise à jour recommandée)
2. Videz le **cache du navigateur**
3. Testez en **mode navigation privée**
4. Contactez l'administrateur système

---

## 🎉 Version actuelle

**GesRes v5.0 - Mobile/Tablette Responsive**

- Date de sortie : 2026-03-09
- Tag GitHub : `v5.0-mobile`
- Deployment Cloudflare : Production

---

## 📝 Changelog v5.0

### Ajouté
- Menu hamburger mobile pour navigation
- CSS responsive avec breakpoints mobile/tablette/desktop
- Zones tactiles conformes WCAG (44px minimum)
- Modales adaptées pour mobile (plein écran)
- Onglets scrollables horizontalement
- Synchronisation logos entre nav et menu mobile
- Optimisation espacements pour petits écrans

### Modifié
- Grilles adaptatives (1 colonne mobile, 2 tablette, 3-4 desktop)
- Textes raccourcis sur mobile ("Miss.", "Param.")
- Fil d'ariane responsive avec wrap
- Formulaires optimisés tactile

### Corrigé
- Zoom iOS sur focus des inputs
- Débordement des onglets sur mobile
- Taille des zones cliquables trop petites
- Modales trop larges sur mobile

---

**Testez dès maintenant sur votre mobile : https://gesres-missions.pages.dev** 📱✨
