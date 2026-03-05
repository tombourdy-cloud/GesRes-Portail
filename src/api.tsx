import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { jwt } from 'hono/jwt'
import { setCookie, getCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// JWT Secret (en production, utiliser une variable d'environnement)
const JWT_SECRET = 'your-secret-key-change-in-production'

// Enable CORS pour toutes les routes API
app.use('/api/*', cors())

// Servir les fichiers statiques
app.use('/static/*', serveStatic({ root: './public' }))

// ==================== AUTHENTICATION ====================

// Helper pour hasher le mot de passe (simple pour demo, utiliser bcrypt en production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// POST /api/auth/login - Connexion
app.post('/api/auth/login', async (c) => {
  const { DB } = c.env
  const { username, password } = await c.req.json()
  
  const passwordHash = await hashPassword(password)
  
  const user = await DB.prepare(`
    SELECT id, username, nom, prenom, role 
    FROM users 
    WHERE username = ? AND password_hash = ?
  `).bind(username, passwordHash).first()
  
  if (!user) {
    return c.json({ error: 'Identifiants invalides' }, 401)
  }
  
  // Créer un token JWT simple
  const token = btoa(JSON.stringify({ userId: user.id, username: user.username, role: user.role, exp: Date.now() + 86400000 }))
  
  setCookie(c, 'auth_token', token, {
    httpOnly: false,
    secure: false,
    maxAge: 86400,
    path: '/'
  })
  
  return c.json({ 
    success: true, 
    user: { id: user.id, username: user.username, nom: user.nom, prenom: user.prenom, role: user.role },
    token 
  })
})

// POST /api/auth/logout - Déconnexion
app.post('/api/auth/logout', async (c) => {
  setCookie(c, 'auth_token', '', {
    maxAge: 0,
    path: '/'
  })
  return c.json({ success: true })
})

// GET /api/auth/me - Vérifier l'authentification
app.get('/api/auth/me', async (c) => {
  const token = getCookie(c, 'auth_token')
  
  if (!token) {
    return c.json({ authenticated: false }, 401)
  }
  
  try {
    const payload = JSON.parse(atob(token))
    
    if (payload.exp < Date.now()) {
      return c.json({ authenticated: false, error: 'Token expiré' }, 401)
    }
    
    return c.json({ authenticated: true, user: payload })
  } catch (error) {
    return c.json({ authenticated: false, error: 'Token invalide' }, 401)
  }
})

// ==================== COMPAGNIES ====================

// GET /api/compagnies - Liste des compagnies
app.get('/api/compagnies', async (c) => {
  const { DB } = c.env
  
  const compagnies = await DB.prepare(`
    SELECT 
      c.*,
      COUNT(b.id) as nombre_brigades
    FROM compagnies c
    LEFT JOIN brigades b ON c.id = b.compagnie_id
    GROUP BY c.id
    ORDER BY c.nom
  `).all()
  
  return c.json(compagnies.results)
})

// GET /api/compagnies/:id - Détails d'une compagnie avec ses brigades
app.get('/api/compagnies/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  const compagnie = await DB.prepare(`SELECT * FROM compagnies WHERE id = ?`).bind(id).first()
  
  if (!compagnie) {
    return c.json({ error: 'Compagnie non trouvée' }, 404)
  }
  
  const brigades = await DB.prepare(`
    SELECT * FROM brigades WHERE compagnie_id = ? ORDER BY nom
  `).bind(id).all()
  
  return c.json({ compagnie, brigades: brigades.results })
})

// POST /api/compagnies - Créer une compagnie
app.post('/api/compagnies', async (c) => {
  const { DB } = c.env
  const { nom, code, adresse, telephone, email, commandant } = await c.req.json()
  
  const result = await DB.prepare(`
    INSERT INTO compagnies (nom, code, adresse, telephone, email, commandant)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(nom, code, adresse, telephone, email, commandant).run()
  
  return c.json({ id: result.meta.last_row_id, message: 'Compagnie créée' }, 201)
})

// PUT /api/compagnies/:id - Modifier une compagnie
app.put('/api/compagnies/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { nom, code, adresse, telephone, email, commandant } = await c.req.json()
  
  await DB.prepare(`
    UPDATE compagnies 
    SET nom = ?, code = ?, adresse = ?, telephone = ?, email = ?, commandant = ?
    WHERE id = ?
  `).bind(nom, code, adresse, telephone, email, commandant, id).run()
  
  return c.json({ message: 'Compagnie mise à jour' })
})

// ==================== BRIGADES ====================

// GET /api/brigades - Liste des brigades
app.get('/api/brigades', async (c) => {
  const { DB } = c.env
  
  const brigades = await DB.prepare(`
    SELECT 
      b.*,
      c.nom as compagnie_nom,
      c.code as compagnie_code
    FROM brigades b
    JOIN compagnies c ON b.compagnie_id = c.id
    ORDER BY c.nom, b.nom
  `).all()
  
  return c.json(brigades.results)
})

// GET /api/brigades/:id - Détails d'une brigade
app.get('/api/brigades/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  const brigade = await DB.prepare(`
    SELECT 
      b.*,
      c.nom as compagnie_nom,
      c.code as compagnie_code,
      c.adresse as compagnie_adresse,
      c.telephone as compagnie_telephone,
      c.commandant as compagnie_commandant
    FROM brigades b
    JOIN compagnies c ON b.compagnie_id = c.id
    WHERE b.id = ?
  `).bind(id).first()
  
  if (!brigade) {
    return c.json({ error: 'Brigade non trouvée' }, 404)
  }
  
  return c.json(brigade)
})

// POST /api/brigades - Créer une brigade
app.post('/api/brigades', async (c) => {
  const { DB } = c.env
  const { compagnie_id, nom, code, adresse, telephone, email, effectifs, chef_brigade, latitude, longitude } = await c.req.json()
  
  const result = await DB.prepare(`
    INSERT INTO brigades (compagnie_id, nom, code, adresse, telephone, email, effectifs, chef_brigade, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(compagnie_id, nom, code, adresse, telephone, email, effectifs, chef_brigade, latitude, longitude).run()
  
  return c.json({ id: result.meta.last_row_id, message: 'Brigade créée' }, 201)
})

// PUT /api/brigades/:id - Modifier une brigade
app.put('/api/brigades/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { compagnie_id, nom, code, adresse, telephone, email, effectifs, chef_brigade, latitude, longitude } = await c.req.json()
  
  await DB.prepare(`
    UPDATE brigades 
    SET compagnie_id = ?, nom = ?, code = ?, adresse = ?, telephone = ?, email = ?, 
        effectifs = ?, chef_brigade = ?, latitude = ?, longitude = ?
    WHERE id = ?
  `).bind(compagnie_id, nom, code, adresse, telephone, email, effectifs, chef_brigade, latitude, longitude, id).run()
  
  return c.json({ message: 'Brigade mise à jour' })
})

// DELETE /api/brigades/:id - Supprimer une brigade
app.delete('/api/brigades/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  await DB.prepare(`DELETE FROM brigades WHERE id = ?`).bind(id).run()
  
  return c.json({ message: 'Brigade supprimée' })
})

// ==================== MISSIONS ====================

// GET /api/missions - Récupérer toutes les missions avec leurs assignations
app.get('/api/missions', async (c) => {
  const { DB } = c.env
  const brigade_id = c.req.query('brigade_id')
  
  let query = `
    SELECT 
      m.*,
      b.nom as brigade_nom,
      b.code as brigade_code,
      c.nom as compagnie_nom,
      COUNT(CASE WHEN a.statut = 'valide' THEN 1 END) as effectifs_assignes,
      COUNT(CASE WHEN a.statut = 'en_attente' THEN 1 END) as effectifs_en_attente,
      COUNT(CASE WHEN a.statut = 'libre' THEN 1 END) as places_libres
    FROM missions m
    LEFT JOIN assignations a ON m.id = a.mission_id
    LEFT JOIN brigades b ON m.brigade_id = b.id
    LEFT JOIN compagnies c ON b.compagnie_id = c.id
  `
  
  if (brigade_id) {
    query += ` WHERE m.brigade_id = ${brigade_id}`
  }
  
  query += ` GROUP BY m.id ORDER BY m.date_debut DESC`
  
  const missions = await DB.prepare(query).all()
  
  // Pour chaque mission, récupérer les gendarmes assignés
  const missionsWithGendarmes = await Promise.all(
    missions.results.map(async (mission: any) => {
      const gendarmes = await DB.prepare(`
        SELECT 
          g.nom,
          g.prenom,
          g.grade,
          g.matricule,
          a.statut
        FROM assignations a
        JOIN gendarmes g ON a.gendarme_id = g.id
        WHERE a.mission_id = ? AND a.statut IN ('valide', 'en_attente')
        ORDER BY a.statut DESC
      `).bind(mission.id).all()
      
      return {
        ...mission,
        gendarmes_assignes: gendarmes.results
      }
    })
  )
  
  return c.json(missionsWithGendarmes)
})

// GET /api/missions/:id - Récupérer une mission avec détails complets
app.get('/api/missions/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  const mission = await DB.prepare(`
    SELECT 
      m.*,
      b.nom as brigade_nom,
      b.code as brigade_code,
      b.adresse as brigade_adresse,
      b.telephone as brigade_telephone,
      c.nom as compagnie_nom
    FROM missions m
    LEFT JOIN brigades b ON m.brigade_id = b.id
    LEFT JOIN compagnies c ON b.compagnie_id = c.id
    WHERE m.id = ?
  `).bind(id).first()
  
  if (!mission) {
    return c.json({ error: 'Mission non trouvée' }, 404)
  }
  
  const assignations = await DB.prepare(`
    SELECT 
      a.*,
      g.matricule,
      g.nom,
      g.prenom,
      g.grade,
      g.specialite
    FROM assignations a
    LEFT JOIN gendarmes g ON a.gendarme_id = g.id
    WHERE a.mission_id = ?
    ORDER BY 
      CASE a.statut 
        WHEN 'valide' THEN 1 
        WHEN 'en_attente' THEN 2 
        WHEN 'libre' THEN 3 
      END
  `).bind(id).all()
  
  return c.json({
    mission,
    assignations: assignations.results
  })
})

// POST /api/missions - Créer une nouvelle mission
app.post('/api/missions', async (c) => {
  const { DB } = c.env
  const body = await c.req.json()
  
  const { numero_mission, titre, description, brigade_id, date_debut, date_fin, effectifs_requis, competences_requises, priorite } = body
  
  // Vérifier les champs obligatoires
  if (!numero_mission || !titre || !brigade_id || !date_debut) {
    return c.json({ error: 'Champs obligatoires manquants: numéro de mission, titre, brigade et date début' }, 400)
  }
  
  // Créer la mission
  const result = await DB.prepare(`
    INSERT INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, effectifs_requis, competences_requises, priorite)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(numero_mission, titre, description, brigade_id, date_debut, date_fin, effectifs_requis, competences_requises, priorite || 'normale').run()
  
  const missionId = result.meta.last_row_id
  
  // Créer les assignations libres
  for (let i = 0; i < effectifs_requis; i++) {
    await DB.prepare(`
      INSERT INTO assignations (mission_id, statut)
      VALUES (?, 'libre')
    `).bind(missionId).run()
  }
  
  return c.json({ id: missionId, message: 'Mission créée avec succès' }, 201)
})

// PUT /api/missions/:id - Mettre à jour une mission
app.put('/api/missions/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const { numero_mission, titre, description, brigade_id, date_debut, date_fin, effectifs_requis, competences_requises, priorite } = body
  
  await DB.prepare(`
    UPDATE missions 
    SET numero_mission = ?, titre = ?, description = ?, brigade_id = ?, date_debut = ?, date_fin = ?, 
        effectifs_requis = ?, competences_requises = ?, priorite = ?
    WHERE id = ?
  `).bind(numero_mission, titre, description, brigade_id, date_debut, date_fin, effectifs_requis, competences_requises, priorite, id).run()
  
  return c.json({ message: 'Mission mise à jour avec succès' })
})

// DELETE /api/missions/:id - Supprimer une mission
app.delete('/api/missions/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  await DB.prepare(`DELETE FROM missions WHERE id = ?`).bind(id).run()
  
  return c.json({ message: 'Mission supprimée avec succès' })
})

// ==================== GENDARMES ====================

// GET /api/gendarmes - Récupérer tous les gendarmes
app.get('/api/gendarmes', async (c) => {
  const { DB } = c.env
  
  const gendarmes = await DB.prepare(`
    SELECT 
      g.*,
      COUNT(a.id) as missions_actives
    FROM gendarmes g
    LEFT JOIN assignations a ON g.id = a.gendarme_id AND a.statut IN ('valide', 'en_attente')
    GROUP BY g.id
    ORDER BY g.nom, g.prenom
  `).all()
  
  return c.json(gendarmes.results)
})

// GET /api/gendarmes/:id - Récupérer un gendarme avec ses missions
app.get('/api/gendarmes/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  const gendarme = await DB.prepare(`
    SELECT * FROM gendarmes WHERE id = ?
  `).bind(id).first()
  
  if (!gendarme) {
    return c.json({ error: 'Gendarme non trouvé' }, 404)
  }
  
  const missions = await DB.prepare(`
    SELECT 
      m.*,
      a.statut as statut_assignation,
      a.assigned_at,
      a.validated_at
    FROM missions m
    JOIN assignations a ON m.id = a.mission_id
    WHERE a.gendarme_id = ?
    ORDER BY m.date_debut DESC
  `).bind(id).all()
  
  return c.json({
    gendarme,
    missions: missions.results
  })
})

// POST /api/gendarmes - Créer un nouveau gendarme
app.post('/api/gendarmes', async (c) => {
  const { DB } = c.env
  const body = await c.req.json()
  
  const { matricule, nom, prenom, grade, specialite, telephone, email } = body
  
  const result = await DB.prepare(`
    INSERT INTO gendarmes (matricule, nom, prenom, grade, specialite, telephone, email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(matricule, nom, prenom, grade, specialite, telephone, email).run()
  
  return c.json({ id: result.meta.last_row_id, message: 'Gendarme créé avec succès' }, 201)
})

// PUT /api/gendarmes/:id - Mettre à jour un gendarme
app.put('/api/gendarmes/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const { matricule, nom, prenom, grade, specialite, telephone, email, disponible } = body
  
  await DB.prepare(`
    UPDATE gendarmes 
    SET matricule = ?, nom = ?, prenom = ?, grade = ?, specialite = ?, 
        telephone = ?, email = ?, disponible = ?
    WHERE id = ?
  `).bind(matricule, nom, prenom, grade, specialite, telephone, email, disponible, id).run()
  
  return c.json({ message: 'Gendarme mis à jour avec succès' })
})

// ==================== ASSIGNATIONS ====================

// PUT /api/assignations/:id - Mettre à jour une assignation
app.put('/api/assignations/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const { gendarme_id, statut, commentaire } = body
  
  let query = ''
  let params: any[] = []
  
  if (statut === 'libre') {
    query = `UPDATE assignations SET gendarme_id = NULL, statut = 'libre', commentaire = ?, assigned_at = NULL, validated_at = NULL WHERE id = ?`
    params = [commentaire || null, id]
  } else if (statut === 'en_attente') {
    query = `UPDATE assignations SET gendarme_id = ?, statut = 'en_attente', commentaire = ?, assigned_at = CURRENT_TIMESTAMP, validated_at = NULL WHERE id = ?`
    params = [gendarme_id, commentaire || null, id]
  } else if (statut === 'valide') {
    query = `UPDATE assignations SET gendarme_id = ?, statut = 'valide', commentaire = ?, assigned_at = COALESCE(assigned_at, CURRENT_TIMESTAMP), validated_at = CURRENT_TIMESTAMP WHERE id = ?`
    params = [gendarme_id, commentaire || null, id]
  }
  
  await DB.prepare(query).bind(...params).run()
  
  return c.json({ message: 'Assignation mise à jour avec succès' })
})

// ==================== CONFIG ====================

// GET /api/config/:key - Récupérer une valeur de config
app.get('/api/config/:key', async (c) => {
  const { DB } = c.env
  const key = c.req.param('key')
  
  const config = await DB.prepare(`SELECT value FROM config WHERE key = ?`).bind(key).first()
  
  return c.json({ value: config?.value || null })
})

// POST /api/config - Mettre à jour une config
app.post('/api/config', async (c) => {
  const { DB } = c.env
  const { key, value } = await c.req.json()
  
  await DB.prepare(`
    INSERT INTO config (key, value, updated_at) 
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
  `).bind(key, value, value).run()
  
  return c.json({ message: 'Configuration mise à jour' })
})

// ==================== STATS ====================

// GET /api/stats - Statistiques générales
app.get('/api/stats', async (c) => {
  const { DB } = c.env
  
  const stats = await DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM missions) as total_missions,
      (SELECT COUNT(*) FROM gendarmes) as total_gendarmes,
      (SELECT COUNT(*) FROM assignations WHERE statut = 'valide') as assignations_validees,
      (SELECT COUNT(*) FROM assignations WHERE statut = 'en_attente') as assignations_en_attente,
      (SELECT COUNT(*) FROM assignations WHERE statut = 'libre') as places_libres,
      (SELECT COUNT(*) FROM compagnies) as total_compagnies,
      (SELECT COUNT(*) FROM brigades) as total_brigades
  `).first()
  
  return c.json(stats)
})

export default app
