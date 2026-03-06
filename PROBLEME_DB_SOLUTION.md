# 🔧 Solution : Lier la base de données D1 au projet Cloudflare Pages

## ❌ Problème identifié

La base de données D1 existe et contient des données, mais **elle n'est pas liée au projet Cloudflare Pages `gesres-missions`**.

Résultat : 
- ✅ Les pages HTML s'affichent
- ❌ Toutes les requêtes API timeout (pas de connexion DB)
- ❌ Impossible de créer/voir des compagnies, brigades, missions

---

## ✅ Solution : Lier manuellement la DB via le Dashboard

### **Étapes à suivre :**

1. **Allez sur le Dashboard Cloudflare**
   - URL : https://dash.cloudflare.com

2. **Accédez à votre projet Pages**
   - Menu : **Workers & Pages**
   - Cliquez sur : **gesres-missions**

3. **Ouvrez les Settings (Paramètres)**
   - Cliquez sur l'onglet **Settings**

4. **Configurez les Bindings (Liaisons)**
   - Dans le menu de gauche, cliquez sur **Functions**
   - Puis sur **D1 database bindings**

5. **Ajoutez la liaison D1**
   - Cliquez sur **Add binding** (Ajouter une liaison)
   - **Variable name** : `DB`
   - **D1 database** : Sélectionnez `webapp-production`
   - Cliquez sur **Save** (Enregistrer)

6. **Vérifiez la liaison**
   - Dans la liste des bindings, vous devriez voir :
     ```
     DB → webapp-production
     ```

7. **Redéployez (optionnel)**
   - Les bindings sont actifs immédiatement
   - Mais si besoin, redéployez :
   ```bash
   cd /home/user/webapp
   npm run deploy
   ```

---

## 🧪 Test après configuration

Une fois la liaison effectuée, testez :

### **1. Via l'interface web**
- Allez sur : https://gesres-missions.pages.dev/admin
- Connectez-vous avec : `SRJ95` / `missions@RES95`
- Allez dans l'onglet **Compagnies & Brigades**
- Cliquez sur **Nouvelle** pour créer une compagnie
- ✅ Ça devrait fonctionner !

### **2. Via l'API (curl)**
```bash
curl https://gesres-missions.pages.dev/api/compagnies
```

Devrait retourner :
```json
[
  {
    "id": 1,
    "nom": "Compagnie de Gendarmerie de Paris",
    "code": "CGP",
    ...
  },
  ...
]
```

---

## 📊 Informations de la base de données

- **Nom** : `webapp-production`
- **ID** : `b28b7666-cd22-4d41-b4d7-7cccf6cfef6c`
- **Région** : ENAM (Europe & North America)
- **Tables** : users, compagnies, brigades, missions, gendarmes, assignations, settings
- **Données actuelles** :
  - ✅ 4 compagnies (Paris, Lyon, Marseille, Toulouse)
  - ✅ 5 utilisateurs (admin, demo.user, sophie.martin, SRJ95)

---

## 🎯 Résumé

**Problème** : DB non liée → API timeout  
**Solution** : Dashboard Cloudflare → gesres-missions → Settings → Functions → D1 bindings → Ajouter `DB` → `webapp-production`  
**Résultat** : ✅ Site fonctionnel avec création/lecture de données

---

## 📞 En cas de problème

Si après avoir lié la DB, ça ne fonctionne toujours pas :

1. **Vérifiez la liaison** dans le Dashboard
2. **Attendez 1-2 minutes** (propagation)
3. **Redéployez** le site :
   ```bash
   cd /home/user/webapp
   npm run build
   npx wrangler pages deploy dist --project-name gesres-missions
   ```
4. **Testez l'API** avec curl
5. **Contactez-moi** si le problème persiste

---

**Date** : 06/03/2026 10:51 UTC  
**Version** : GesRes v3.8
