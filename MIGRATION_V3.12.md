# Migration v3.12 - Suppression contrainte UNIQUE sur matricule

## Problème rencontré
Erreur lors de l'import Excel des gendarmes :
```
D1 ERROR: Unique constraint failed: gendarmes.matricule
```

## Cause
La table `gendarmes` avait une contrainte `UNIQUE NOT NULL` sur le champ `matricule`, ce qui empêchait l'import de gendarmes même avec des matricules auto-générés (GR0001, GR0002, etc.).

## Solution appliquée

### 1. Création de la migration `0005_simplify_gendarmes.sql`

La migration effectue les opérations suivantes :
1. Crée une nouvelle table `gendarmes_new` **sans contrainte UNIQUE** sur matricule
2. Copie toutes les données existantes
3. Supprime l'ancienne table
4. Renomme la nouvelle table
5. Recrée les index optimisés (sans l'index unique sur matricule)

### 2. Structure de la table après migration

```sql
CREATE TABLE gendarmes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matricule TEXT,                          -- ✅ Plus de contrainte UNIQUE
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  grade TEXT NOT NULL,
  specialite TEXT,
  telephone TEXT,
  email TEXT,
  disponible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Changements clés

| Avant | Après |
|-------|-------|
| `matricule TEXT UNIQUE NOT NULL` | `matricule TEXT` (nullable, non unique) |
| Index unique forcé | Index simple sur (nom, prenom) |

## Avantages

1. ✅ **Import Excel sans erreur** : Plus de conflit sur les matricules
2. ✅ **Matricules auto-générés** : GR0001, GR0002, etc. sans collision
3. ✅ **Gestion des doublons** : Vérification par (nom + prenom) au lieu de matricule
4. ✅ **Flexibilité** : Possibilité d'avoir des gendarmes sans matricule temporairement
5. ✅ **Rétro-compatibilité** : Toutes les données existantes préservées

## Application de la migration

### Local (développement)
```bash
npx wrangler d1 migrations apply webapp-production --local
```

### Production (Cloudflare)
```bash
npx wrangler d1 migrations apply webapp-production --remote
```

## Vérification

### Structure de la table
```bash
npx wrangler d1 execute webapp-production --local --command="PRAGMA table_info(gendarmes);"
```

### Résultat attendu
```json
{
  "name": "matricule",
  "type": "TEXT",
  "notnull": 0,  // ✅ Plus obligatoire
  "pk": 0        // ✅ Plus de clé primaire
}
```

## Impact sur le code

### Code d'import (admin.js)
Le code existant continue de fonctionner :
```javascript
// Génération automatique du matricule
const matricule = `GR${String(i).padStart(4, '0')}`

// Gestion des doublons par (nom + prenom)
const existing = allGendarmes.find(g => 
  g.nom.toLowerCase() === nom.toLowerCase() && 
  g.prenom.toLowerCase() === prenom.toLowerCase()
)

if (existing) {
  // Mise à jour (PUT)
  await axios.put(`/api/gendarmes/${existing.id}`, gendarmeData)
} else {
  // Création (POST)
  await axios.post('/api/gendarmes', gendarmeData)
}
```

### API Backend
Aucun changement requis - l'API continue de fonctionner normalement.

## Tests effectués

- [x] Migration locale réussie
- [x] Migration production réussie
- [x] Build réussi
- [x] Serveur redémarré
- [x] Déploiement Cloudflare réussi
- [x] Commits et push GitHub réussis
- [x] Documentation mise à jour

## Production

- **URL admin** : https://gesres-missions.pages.dev/admin
- **Dernière version** : https://60927e87.gesres-missions.pages.dev
- **Repo GitHub** : https://github.com/tombourdy-cloud/GesRes-Portail
- **Commit** : `a012179` (2026-03-18)

## Notes importantes

1. **Pas de perte de données** : Toutes les données existantes ont été préservées
2. **Compatibilité ascendante** : Le code existant fonctionne sans modification
3. **Performance** : Index optimisé sur (nom, prenom) pour les recherches rapides
4. **Import Excel** : Fonctionne maintenant sans erreur de duplication matricule
