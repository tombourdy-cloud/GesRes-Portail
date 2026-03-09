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

// DELETE /api/compagnies/:id - Supprimer une compagnie
app.delete('/api/compagnies/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    // Vérifier si la compagnie a des brigades
    const brigades = await DB.prepare(`
      SELECT COUNT(*) as count FROM brigades WHERE compagnie_id = ?
    `).bind(id).first()
    
    if (brigades && brigades.count > 0) {
      return c.json({ 
        error: `Impossible de supprimer cette compagnie. Elle contient ${brigades.count} brigade(s).` 
      }, 400)
    }
    
    // Supprimer la compagnie
    await DB.prepare(`DELETE FROM compagnies WHERE id = ?`).bind(id).run()
    
    return c.json({ message: 'Compagnie supprimée avec succès' })
  } catch (error) {
    console.error('Erreur suppression compagnie:', error)
    return c.json({ error: 'Erreur lors de la suppression: ' + error.message }, 500)
  }
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
  `).bind(
    compagnie_id, 
    nom, 
    code, 
    adresse, 
    telephone || null, 
    email || null, 
    effectifs || 0, 
    chef_brigade || null, 
    latitude || null, 
    longitude || null
  ).run()
  
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

// GET /api/missions/cleanup-status - Vérifier les missions à supprimer
app.get("/api/missions/cleanup-status", async (c) => {
  const { DB } = c.env
  
  try {
    const now = new Date()
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    const lastMonthEndISO = lastMonthEnd.toISOString()
    
    const expiredMissions = await DB.prepare(`
      SELECT 
        id, 
        numero_mission, 
        titre, 
        date_debut,
        date_fin,
        brigade_id
      FROM missions
      WHERE date_fin < ?
      ORDER BY date_fin DESC
    `).bind(lastMonthEndISO).all()
    
    return c.json({
      count: expiredMissions.results.length,
      lastMonthEnd: lastMonthEndISO,
      missions: expiredMissions.results
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// POST /api/missions/cleanup - Nettoyer manuellement les missions expirées (admin)
app.post("/api/missions/cleanup", async (c) => {
  const { DB } = c.env
  
  // Vérifier l authentication
  const token = getCookie(c, "auth_token")
  if (!token) {
    return c.json({ error: "Non authentifié" }, 401)
  }
  
  try {
    const result = await cleanupExpiredMissions(DB)
    return c.json({
      success: true,
      message: `${result.deleted} mission(s) expirée(s) supprimée(s)`,
      deleted: result.deleted,
      missions: result.missions
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
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
  
  try {
    const body = await c.req.json()
    
    const { numero_mission, titre, description, brigade_id, date_debut, date_fin, effectifs_requis, competences_requises, priorite } = body
    
    // Vérifier les champs obligatoires
    if (!numero_mission || !titre || !brigade_id || !date_debut) {
      return c.json({ error: 'Champs obligatoires manquants: numéro de mission, titre, brigade et date début' }, 400)
    }
  
    // Créer la mission avec valeurs par défaut
    const result = await DB.prepare(`
      INSERT INTO missions (numero_mission, titre, description, brigade_id, date_debut, date_fin, effectifs_requis, competences_requises, priorite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      numero_mission, 
      titre, 
      description || null, 
      brigade_id, 
      date_debut, 
      date_fin || null, 
      effectifs_requis || 1, 
      competences_requises || null, 
      priorite || 'normale'
    ).run()
  
    const missionId = result.meta.last_row_id
    
    // Créer les assignations libres
    const effectifs = effectifs_requis || 1
    for (let i = 0; i < effectifs; i++) {
      await DB.prepare(`
        INSERT INTO assignations (mission_id, statut)
        VALUES (?, 'libre')
      `).bind(missionId).run()
    }
    
    return c.json({ id: missionId, message: 'Mission créée avec succès' }, 201)
  } catch (error) {
    console.error('Erreur création mission:', error)
    return c.json({ error: 'Erreur lors de la création de la mission: ' + error.message }, 500)
  }
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
  
  try {
    const body = await c.req.json()
    const { matricule, nom, prenom, grade, specialite, telephone, email } = body
    
    const result = await DB.prepare(`
      INSERT INTO gendarmes (matricule, nom, prenom, grade, specialite, telephone, email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(matricule, nom, prenom, grade, specialite || null, telephone || null, email || null).run()
    
    return c.json({ id: result.meta.last_row_id, message: 'Gendarme créé avec succès' }, 201)
  } catch (error) {
    console.error('Erreur création gendarme:', error)
    return c.json({ error: 'Erreur lors de la création du gendarme: ' + error.message }, 500)
  }
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

// DELETE /api/gendarmes/:id - Supprimer un gendarme
app.delete('/api/gendarmes/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    // Vérifier si le gendarme a des assignations actives
    const assignations = await DB.prepare(`
      SELECT COUNT(*) as count 
      FROM assignations 
      WHERE gendarme_id = ? AND statut IN ('valide', 'en_attente')
    `).bind(id).first()
    
    if (assignations && assignations.count > 0) {
      return c.json({ 
        error: `Impossible de supprimer ce gendarme. Il a ${assignations.count} mission(s) active(s).` 
      }, 400)
    }
    
    // Supprimer d'abord toutes les assignations du gendarme
    await DB.prepare(`DELETE FROM assignations WHERE gendarme_id = ?`).bind(id).run()
    
    // Puis supprimer le gendarme
    await DB.prepare(`DELETE FROM gendarmes WHERE id = ?`).bind(id).run()
    
    return c.json({ message: 'Gendarme supprimé avec succès' })
  } catch (error) {
    console.error('Erreur suppression gendarme:', error)
    return c.json({ error: 'Erreur lors de la suppression: ' + error.message }, 500)
  }
})

// ==================== ASSIGNATIONS ====================

// GET /api/assignations/mission/:missionId - Récupérer les assignations d'une mission
app.get('/api/assignations/mission/:missionId', async (c) => {
  const { DB } = c.env
  const missionId = c.req.param('missionId')
  
  const assignations = await DB.prepare(`
    SELECT 
      a.id,
      a.mission_id,
      a.gendarme_id,
      a.statut,
      a.commentaire,
      a.assigned_at,
      a.validated_at,
      g.matricule as gendarme_matricule,
      g.nom as gendarme_nom,
      g.prenom as gendarme_prenom,
      g.grade as gendarme_grade,
      g.specialite as gendarme_specialite,
      g.telephone as gendarme_telephone,
      g.email as gendarme_email
    FROM assignations a
    LEFT JOIN gendarmes g ON a.gendarme_id = g.id
    WHERE a.mission_id = ?
    ORDER BY 
      CASE a.statut 
        WHEN 'valide' THEN 1 
        WHEN 'en_attente' THEN 2 
        WHEN 'libre' THEN 3 
      END,
      a.id
  `).bind(missionId).all()
  
  return c.json(assignations.results || [])
})

// POST /api/assignations - Créer une nouvelle assignation (place supplémentaire)
app.post('/api/assignations', async (c) => {
  const { DB } = c.env
  const { mission_id, statut } = await c.req.json()
  
  // Créer une nouvelle assignation libre
  const result = await DB.prepare(`
    INSERT INTO assignations (mission_id, statut, gendarme_id)
    VALUES (?, ?, NULL)
  `).bind(mission_id, statut || 'libre').run()
  
  // Mettre à jour le nombre d'effectifs requis de la mission
  await DB.prepare(`
    UPDATE missions 
    SET effectifs_requis = effectifs_requis + 1 
    WHERE id = ?
  `).bind(mission_id).run()
  
  return c.json({ 
    id: result.meta.last_row_id, 
    message: 'Assignation créée avec succès' 
  }, 201)
})

// PUT /api/assignations/:id - Mettre à jour une assignation
app.put('/api/assignations/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    const body = await c.req.json()
    let { gendarme_id, statut, commentaire } = body
    
    // Si gendarme_id n'est pas fourni et qu'on valide, récupérer l'actuel
    if (statut === 'valide' && !gendarme_id) {
      const current = await DB.prepare(`SELECT gendarme_id FROM assignations WHERE id = ?`).bind(id).first()
      gendarme_id = current?.gendarme_id
    }
    
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
  } catch (error) {
    console.error('Erreur mise à jour assignation:', error)
    return c.json({ error: 'Erreur lors de la mise à jour: ' + error.message }, 500)
  }
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

// PUT /api/config/:key - Mettre à jour une valeur de config (méthode alternative)
app.put('/api/config/:key', async (c) => {
  const { DB } = c.env
  const key = c.req.param('key')
  const { value } = await c.req.json()
  
  // Vérifier la taille pour les images base64 (limite à 5 Mo de données)
  if (key === 'logo_url' && value && value.startsWith('data:image/')) {
    const sizeInBytes = value.length * 0.75 // Estimation de la taille décodée
    if (sizeInBytes > 5 * 1024 * 1024) {
      return c.json({ error: 'Image trop volumineuse (max 5 Mo)' }, 400)
    }
  }
  
  await DB.prepare(`
    INSERT INTO config (key, value, updated_at) 
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
  `).bind(key, value, value).run()
  
  return c.json({ message: 'Configuration mise à jour', key, value: value.length > 100 ? `${value.substring(0, 100)}...` : value })
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

// ==================== NOTIFICATIONS EMAIL ====================

// Configuration Resend (à configurer via wrangler secret put RESEND_API_KEY)
const RESEND_API_KEY = 'RESEND_API_KEY' // Sera remplacé par une variable d'environnement

/**
 * Envoyer un email via Resend API
 */
async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'GesRes <noreply@gesres.fr>',
        to: [to],
        subject: subject,
        html: html
      })
    })
    
    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur envoi email:', error)
    throw error
  }
}

/**
 * Template email : Nouvelle assignation
 */
function emailTemplateNouvelleAssignation(gendarme: any, mission: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .mission-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎖️ Nouvelle Mission Disponible</h1>
          <p style="margin: 10px 0 0 0;">GesRes - Gestion des Missions Réserve</p>
        </div>
        <div class="content">
          <p>Bonjour <strong>${gendarme.grade} ${gendarme.nom}</strong>,</p>
          
          <p>Vous avez été <strong>proposé(e)</strong> pour une nouvelle mission. Votre affectation est en attente de validation par votre chef de brigade.</p>
          
          <div class="mission-info">
            <h2 style="color: #2563eb; margin-top: 0;">📋 Détails de la mission</h2>
            <p><strong>Numéro :</strong> ${mission.numero_mission}</p>
            <p><strong>Titre :</strong> ${mission.titre}</p>
            <p><strong>Description :</strong> ${mission.description || 'Non spécifiée'}</p>
            <p><strong>Brigade :</strong> ${mission.brigade_nom}</p>
            <p><strong>Date de début :</strong> ${new Date(mission.date_debut).toLocaleString('fr-FR')}</p>
            <p><strong>Date de fin :</strong> ${new Date(mission.date_fin).toLocaleString('fr-FR')}</p>
            ${mission.competences_requises ? `<p><strong>Compétences requises :</strong> ${mission.competences_requises}</p>` : ''}
          </div>
          
          <p><strong>⏳ Statut :</strong> <span style="color: #d97706;">En attente de validation</span></p>
          
          <p>Vous recevrez une nouvelle notification dès que votre affectation sera validée.</p>
          
          <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe GesRes</strong></p>
        </div>
        <div class="footer">
          <p>Cet email est automatique, merci de ne pas y répondre.</p>
          <p>GesRes - Gestion des Missions Réserve © 2026</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Template email : Assignation validée
 */
function emailTemplateAssignationValidee(gendarme: any, mission: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .mission-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
        .alert-success { background: #dcfce7; border: 1px solid #86efac; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">✅ Mission Confirmée</h1>
          <p style="margin: 10px 0 0 0;">GesRes - Gestion des Missions Réserve</p>
        </div>
        <div class="content">
          <p>Bonjour <strong>${gendarme.grade} ${gendarme.nom}</strong>,</p>
          
          <div class="alert-success">
            <strong>✅ Bonne nouvelle !</strong> Votre affectation pour la mission <strong>${mission.numero_mission}</strong> a été <strong>validée</strong> par votre chef de brigade.
          </div>
          
          <div class="mission-info">
            <h2 style="color: #16a34a; margin-top: 0;">📋 Récapitulatif de la mission</h2>
            <p><strong>Numéro :</strong> ${mission.numero_mission}</p>
            <p><strong>Titre :</strong> ${mission.titre}</p>
            <p><strong>Description :</strong> ${mission.description || 'Non spécifiée'}</p>
            <p><strong>Brigade :</strong> ${mission.brigade_nom}</p>
            <p><strong>Lieu :</strong> ${mission.lieu || mission.brigade_adresse}</p>
            <p><strong>📅 Date de début :</strong> <strong>${new Date(mission.date_debut).toLocaleString('fr-FR')}</strong></p>
            <p><strong>📅 Date de fin :</strong> <strong>${new Date(mission.date_fin).toLocaleString('fr-FR')}</strong></p>
            ${mission.competences_requises ? `<p><strong>Compétences requises :</strong> ${mission.competences_requises}</p>` : ''}
          </div>
          
          <p><strong>📞 Contact :</strong> ${mission.brigade_telephone || 'Non spécifié'}</p>
          
          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ Important :</strong> Merci de vous présenter à l'heure indiquée. En cas d'empêchement, prévenez immédiatement votre chef de brigade.</p>
          </div>
          
          <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe GesRes</strong></p>
        </div>
        <div class="footer">
          <p>Cet email est automatique, merci de ne pas y répondre.</p>
          <p>GesRes - Gestion des Missions Réserve © 2026</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Template email : Rappel avant mission (48h avant)
 */
function emailTemplateRappelMission(gendarme: any, mission: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .mission-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">⏰ Rappel de Mission</h1>
          <p style="margin: 10px 0 0 0;">GesRes - Gestion des Missions Réserve</p>
        </div>
        <div class="content">
          <p>Bonjour <strong>${gendarme.grade} ${gendarme.nom}</strong>,</p>
          
          <p>Nous vous rappelons que votre mission <strong>${mission.numero_mission}</strong> commence dans <strong>48 heures</strong>.</p>
          
          <div class="mission-info">
            <h2 style="color: #f59e0b; margin-top: 0;">📋 Détails de la mission</h2>
            <p><strong>Numéro :</strong> ${mission.numero_mission}</p>
            <p><strong>Titre :</strong> ${mission.titre}</p>
            <p><strong>Brigade :</strong> ${mission.brigade_nom}</p>
            <p><strong>Lieu :</strong> ${mission.lieu || mission.brigade_adresse}</p>
            <p><strong>📅 Date de début :</strong> <strong style="color: #dc2626;">${new Date(mission.date_debut).toLocaleString('fr-FR')}</strong></p>
            <p><strong>📅 Date de fin :</strong> ${new Date(mission.date_fin).toLocaleString('fr-FR')}</p>
            <p><strong>📞 Contact :</strong> ${mission.brigade_telephone || 'Non spécifié'}</p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ Rappel :</strong> Merci de vous présenter à l'heure indiquée avec votre équipement complet. En cas d'empêchement, prévenez immédiatement votre chef de brigade.</p>
          </div>
          
          <p style="margin-top: 30px;">Bon courage pour cette mission,<br><strong>L'équipe GesRes</strong></p>
        </div>
        <div class="footer">
          <p>Cet email est automatique, merci de ne pas y répondre.</p>
          <p>GesRes - Gestion des Missions Réserve © 2026</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// POST /api/notifications/nouvelle-assignation - Envoyer notification nouvelle assignation
app.post('/api/notifications/nouvelle-assignation', async (c) => {
  const { DB } = c.env
  const { assignation_id } = await c.req.json()
  
  try {
    // Récupérer les infos de l'assignation, gendarme et mission
    const data = await DB.prepare(`
      SELECT 
        g.*,
        m.*,
        b.nom as brigade_nom,
        b.adresse as brigade_adresse,
        b.telephone as brigade_telephone
      FROM assignations a
      JOIN gendarmes g ON a.gendarme_id = g.id
      JOIN missions m ON a.mission_id = m.id
      JOIN brigades b ON m.brigade_id = b.id
      WHERE a.id = ?
    `).bind(assignation_id).first()
    
    if (!data || !data.email) {
      return c.json({ error: 'Email non disponible' }, 400)
    }
    
    const subject = `🎖️ Nouvelle mission disponible - ${data.numero_mission}`
    const html = emailTemplateNouvelleAssignation(data, data)
    
    await sendEmail(data.email, subject, html)
    
    return c.json({ message: 'Email envoyé avec succès' })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// POST /api/notifications/assignation-validee - Envoyer notification assignation validée
app.post('/api/notifications/assignation-validee', async (c) => {
  const { DB } = c.env
  const { assignation_id } = await c.req.json()
  
  try {
    const data = await DB.prepare(`
      SELECT 
        g.*,
        m.*,
        b.nom as brigade_nom,
        b.adresse as brigade_adresse,
        b.telephone as brigade_telephone
      FROM assignations a
      JOIN gendarmes g ON a.gendarme_id = g.id
      JOIN missions m ON a.mission_id = m.id
      JOIN brigades b ON m.brigade_id = b.id
      WHERE a.id = ?
    `).bind(assignation_id).first()
    
    if (!data || !data.email) {
      return c.json({ error: 'Email non disponible' }, 400)
    }
    
    const subject = `✅ Mission confirmée - ${data.numero_mission}`
    const html = emailTemplateAssignationValidee(data, data)
    
    await sendEmail(data.email, subject, html)
    
    return c.json({ message: 'Email envoyé avec succès' })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ==================== NETTOYAGE AUTOMATIQUE ====================

// Fonction helper pour supprimer les missions expirées
async function cleanupExpiredMissions(DB: D1Database): Promise<{ deleted: number, missions: any[] }> {
  try {
    // Calculer la date de fin du mois précédent (dernier jour du mois dernier à 23:59:59)
    const now = new Date()
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    const lastMonthEndISO = lastMonthEnd.toISOString()
    
    console.log(`🗑️ Nettoyage automatique : suppression des missions terminées avant le ${lastMonthEndISO}`)
    
    // Récupérer d'abord les missions à supprimer (pour logs)
    const missionsToDelete = await DB.prepare(`
      SELECT id, numero_mission, titre, date_fin
      FROM missions
      WHERE date_fin < ?
    `).bind(lastMonthEndISO).all()
    
    if (missionsToDelete.results.length === 0) {
      console.log('✅ Aucune mission expirée à supprimer')
      return { deleted: 0, missions: [] }
    }
    
    // Supprimer les missions (les assignations sont supprimées automatiquement via ON DELETE CASCADE)
    const result = await DB.prepare(`
      DELETE FROM missions
      WHERE date_fin < ?
    `).bind(lastMonthEndISO).run()
    
    console.log(`✅ ${missionsToDelete.results.length} missions expirées supprimées`)
    
    return {
      deleted: missionsToDelete.results.length,
      missions: missionsToDelete.results
    }
  } catch (error: any) {
    console.error('❌ Erreur lors du nettoyage automatique:', error)
    throw error
  }
}

