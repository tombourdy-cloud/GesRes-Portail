# 🔧 FIX : Configuration du binding D1 pour gesres-missions

## ❌ Problème actuel

- ✅ Lecture (GET) fonctionne
- ❌ Écriture (POST/PUT/DELETE) timeout ou ne fonctionne pas
- Cause probable : **Binding D1 mal configuré ou manquant en Production**

---

## ✅ Solution : Configuration correcte du binding D1

### **Étape 1 : Accéder aux paramètres**

1. Allez sur : https://dash.cloudflare.com
2. Cliquez sur **Workers & Pages**
3. Cliquez sur **gesres-missions**
4. Cliquez sur **Settings** (en haut)
5. Dans le menu de gauche, cliquez sur **Functions**

---

### **Étape 2 : Configurer les bindings D1**

Vous devez avoir **DEUX bindings** (Production ET Preview) :

#### **📍 Section "Production"**

Cliquez sur **Add binding** (si vide) ou **Edit** (si déjà présent)

**Configurez** :
- **Variable name** : `DB` ⬅️ EXACTEMENT "DB" (majuscules)
- **D1 database** : Sélectionnez **webapp-production** dans la liste
- Cliquez sur **Save**

#### **📍 Section "Preview"**

Cliquez sur **Add binding** (si vide) ou **Edit** (si déjà présent)

**Configurez** :
- **Variable name** : `DB` ⬅️ EXACTEMENT "DB" (majuscules)
- **D1 database** : Sélectionnez **webapp-production** dans la liste
- Cliquez sur **Save**

---

### **Étape 3 : Résultat attendu**

Vous devriez voir :

```
Production
  DB → webapp-production

Preview  
  DB → webapp-production
```

---

### **Étape 4 : Forcer un redéploiement**

Après avoir configuré les bindings, **redéployez le site** :

```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name gesres-missions
```

Ou attendez quelques minutes pour que la configuration se propage.

---

### **Étape 5 : Tester**

#### **Test 1 : Lecture (devrait déjà fonctionner)**
```bash
curl https://gesres-missions.pages.dev/api/compagnies
```

#### **Test 2 : Écriture (devrait maintenant fonctionner)**
```bash
curl -X POST https://gesres-missions.pages.dev/api/compagnies \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test Binding","code":"TB","adresse":"Test","telephone":"01","email":"","commandant":"Test"}'
```

Devrait retourner :
```json
{"id":6,"message":"Compagnie créée"}
```

#### **Test 3 : Via l'interface web**
1. Allez sur : https://gesres-missions.pages.dev/admin
2. Connectez-vous avec : `SRJ95` / `missions@RES95`
3. Onglet **Compagnies & Brigades**
4. Cliquez sur **Nouvelle**
5. Remplissez le formulaire
6. Validez
7. ✅ La compagnie devrait apparaître immédiatement !

---

## 🔍 Points de vérification

### ✅ Checklist

- [ ] Binding Production configuré avec variable `DB` → `webapp-production`
- [ ] Binding Preview configuré avec variable `DB` → `webapp-production`
- [ ] Redéploiement effectué
- [ ] Test API POST réussi
- [ ] Test interface web réussi

### ❌ Erreurs communes

1. **Variable name incorrect** : Doit être exactement `DB` (pas `db`, pas `Database`)
2. **Mauvaise base sélectionnée** : Doit être `webapp-production` (pas `gesres-missions-production`)
3. **Binding manquant en Preview** : Il faut configurer les DEUX (Production ET Preview)
4. **Pas de redéploiement** : Les changements de binding nécessitent parfois un redéploiement

---

## 🆘 Si ça ne fonctionne toujours pas

### Vérification dans le Dashboard

1. **Vérifiez que les bindings sont bien présents** dans Settings → Functions
2. **Vérifiez que la base webapp-production existe** : Dashboard → Workers & Pages → D1 SQL Databases
3. **Vérifiez les logs** : Dashboard → gesres-missions → Deployment logs

### Commandes de diagnostic

```bash
# Lister les bases D1
npx wrangler d1 list

# Vérifier les infos de la base
npx wrangler d1 info webapp-production

# Tester une écriture directe dans la base
npx wrangler d1 execute webapp-production --remote \
  --command="INSERT INTO compagnies (nom, code, adresse, telephone, commandant) VALUES ('Test Direct', 'TD', 'Test', '01', 'Test')"
```

---

## 📞 Contact

Si le problème persiste après avoir suivi toutes ces étapes, il peut y avoir :
- Un problème de permissions sur votre compte Cloudflare
- Une limitation du plan gratuit
- Un bug de Cloudflare Pages

Dans ce cas, contactez le support Cloudflare ou consultez la documentation :
https://developers.cloudflare.com/d1/get-started/

---

**Date** : 06/03/2026 11:25 UTC  
**Version** : GesRes v3.8  
**Database** : webapp-production (b28b7666-cd22-4d41-b4d7-7cccf6cfef6c)
