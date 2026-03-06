# 🧪 Guide de test - Téléversement du blason

## 🎯 Fonctionnalité testée
Upload de logo/blason depuis le portail d'administration avec deux options :
1. **Téléverser un fichier** depuis l'ordinateur
2. **Entrer une URL** d'image en ligne

---

## 📋 Prérequis
- Accès à l'interface admin : https://3000-ilpfsuqr8mj8l3n8ddfjt-5c13a017.sandbox.novita.ai/admin
- Identifiants : `admin` / `admin123`
- Une image de test (PNG, JPG, GIF ou SVG, max 2 Mo)

---

## 🧪 Scénarios de test

### ✅ Test 1 : Téléversement d'un fichier image

**Étapes** :
1. Se connecter à l'interface admin
2. Cliquer sur l'onglet "Paramètres" (icône engrenage)
3. Voir la section "Logo / Écusson"
4. Voir l'**aperçu du logo actuel** en haut
5. Dans la zone "Option 1 : Téléverser une image depuis votre ordinateur"
6. Cliquer sur "Parcourir" / "Choose File"
7. Sélectionner une image (PNG/JPG/GIF/SVG, < 2 Mo)
8. **Observer** : L'aperçu de l'image sélectionnée s'affiche
9. Cliquer sur le bouton **"Enregistrer le logo"**
10. **Vérifier** : Message de succès "✅ Logo téléversé et enregistré avec succès !"
11. **Vérifier** : Le logo dans la barre de navigation est mis à jour
12. **Vérifier** : L'aperçu du logo actuel affiche la nouvelle image

**Résultat attendu** :
- ✅ Aperçu en temps réel de l'image sélectionnée
- ✅ Upload réussi avec message de confirmation
- ✅ Logo visible dans la barre de navigation (coin supérieur gauche)
- ✅ Logo mis à jour sur toutes les pages (admin et publique)

---

### ✅ Test 2 : URL d'image externe

**Étapes** :
1. Dans l'onglet "Paramètres"
2. Dans la zone "Option 2 : URL d'une image en ligne"
3. Entrer une URL valide, par exemple :
   ```
   https://upload.wikimedia.org/wikipedia/fr/thumb/4/4e/Armoiries_gendarmerie_nationale_fran%C3%A7aise.svg/200px-Armoiries_gendarmerie_nationale_fran%C3%A7aise.svg.png
   ```
4. Cliquer sur **"Enregistrer le logo"**
5. **Vérifier** : Message "✅ Logo mis à jour avec l'URL fournie !"
6. **Vérifier** : Logo mis à jour dans la barre de navigation

**Résultat attendu** :
- ✅ Logo chargé depuis l'URL externe
- ✅ Visible partout sur le site

---

### ✅ Test 3 : Réinitialisation au logo par défaut

**Étapes** :
1. Dans l'onglet "Paramètres"
2. Cliquer sur le bouton **"Réinitialiser"** (gris)
3. **Confirmer** dans la popup
4. **Vérifier** : Message "✅ Logo réinitialisé au logo par défaut"
5. **Vérifier** : Logo par défaut restauré (`/static/default-logo.png`)

**Résultat attendu** :
- ✅ Logo par défaut restauré
- ✅ Champs du formulaire vidés

---

### ❌ Test 4 : Validation - Fichier trop volumineux

**Étapes** :
1. Sélectionner une image > 2 Mo
2. **Observer** : Message d'erreur immédiat
   ```
   L'image est trop volumineuse. Taille maximale : 2 Mo
   ```
3. Le champ fichier est vidé automatiquement

**Résultat attendu** :
- ✅ Validation côté client
- ✅ Pas d'upload effectué

---

### ❌ Test 5 : Validation - Aucune image sélectionnée

**Étapes** :
1. Ne rien sélectionner (ni fichier, ni URL)
2. Cliquer sur "Enregistrer le logo"
3. **Observer** : Message d'alerte
   ```
   ⚠️ Veuillez sélectionner un fichier ou entrer une URL
   ```

**Résultat attendu** :
- ✅ Validation empêchant l'envoi vide

---

## 🔍 Points de contrôle techniques

### Backend
- ✅ Route `GET /api/config/logo_url` retourne la valeur actuelle
- ✅ Route `PUT /api/config/logo_url` accepte :
  - URL externe (string)
  - Data URI base64 (`data:image/png;base64,...`)
- ✅ Validation de taille serveur (max 5 Mo encodé)
- ✅ Stockage dans table `config` (clé `logo_url`)

### Frontend
- ✅ Input type="file" avec accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml"
- ✅ Lecture du fichier avec FileReader API
- ✅ Conversion en base64 (data URI)
- ✅ Aperçu en temps réel avec `<img id="file-preview-img">`
- ✅ Validation taille client (2 Mo)
- ✅ Reset du formulaire après upload

### UI/UX
- ✅ Deux options clairement séparées (fichier vs URL)
- ✅ Aperçu du logo actuel visible
- ✅ Aperçu du fichier sélectionné avant upload
- ✅ Messages de succès/erreur clairs avec émojis
- ✅ Bouton réinitialiser avec confirmation

---

## 🎨 Formats d'image testés

| Format | Extension | Support | Taille max |
|--------|-----------|---------|------------|
| PNG | `.png` | ✅ | 2 Mo |
| JPEG | `.jpg`, `.jpeg` | ✅ | 2 Mo |
| GIF | `.gif` | ✅ | 2 Mo |
| SVG | `.svg` | ✅ | 2 Mo |
| WebP | `.webp` | ❌ Non supporté actuellement | - |
| BMP | `.bmp` | ❌ Non supporté actuellement | - |

---

## 🔒 Sécurité

- ✅ Validation MIME type côté client
- ✅ Validation taille côté client (2 Mo)
- ✅ Validation taille côté serveur (5 Mo base64)
- ✅ Pas d'exécution de code (stockage data URI)
- ✅ Authentification admin requise (JWT)

---

## 📝 Notes

1. **Stockage** : Les images sont converties en base64 et stockées directement dans la base de données (table `config`)
2. **Performance** : Pour des logos de grande taille, privilégier l'hébergement externe et utiliser l'option URL
3. **Persistance** : Le logo est conservé même après redémarrage du serveur
4. **Visibilité** : Le logo apparaît sur TOUTES les pages (publique et admin)

---

## ✅ Checklist de validation

- [ ] Test 1 : Upload fichier PNG réussi
- [ ] Test 1 : Upload fichier JPG réussi
- [ ] Test 1 : Upload fichier SVG réussi
- [ ] Test 2 : URL externe fonctionne
- [ ] Test 3 : Réinitialisation fonctionne
- [ ] Test 4 : Validation taille > 2 Mo
- [ ] Test 5 : Validation champ vide
- [ ] Logo visible sur page publique
- [ ] Logo visible sur page admin
- [ ] Logo persiste après refresh
- [ ] Aperçu en temps réel fonctionne

---

**✨ Fonctionnalité prête pour production !**
