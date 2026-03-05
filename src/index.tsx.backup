import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS pour toutes les routes API
app.use('/api/*', cors())

// Servir les fichiers statiques
app.use('/static/*', serveStatic({ root: './public' }))

// ==================== API ROUTES ====================

// GET /api/missions - Récupérer toutes les missions avec leurs assignations
app.get('/api/missions', async (c) => {
  const { DB } = c.env
  
  const missions = await DB.prepare(`
    SELECT 
      m.*,
      COUNT(CASE WHEN a.statut = 'valide' THEN 1 END) as effectifs_assignes,
      COUNT(CASE WHEN a.statut = 'en_attente' THEN 1 END) as effectifs_en_attente,
      COUNT(CASE WHEN a.statut = 'libre' THEN 1 END) as places_libres
    FROM missions m
    LEFT JOIN assignations a ON m.id = a.mission_id
    GROUP BY m.id
    ORDER BY m.date_debut DESC
  `).all()
  
  return c.json(missions.results)
})

// GET /api/missions/:id - Récupérer une mission avec détails complets
app.get('/api/missions/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  const mission = await DB.prepare(`
    SELECT * FROM missions WHERE id = ?
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
  
  const { titre, description, lieu, date_debut, date_fin, effectifs_requis, competences_requises, priorite } = body
  
  // Créer la mission
  const result = await DB.prepare(`
    INSERT INTO missions (titre, description, lieu, date_debut, date_fin, effectifs_requis, competences_requises, priorite)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(titre, description, lieu, date_debut, date_fin, effectifs_requis, competences_requises, priorite || 'normale').run()
  
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
  
  const { titre, description, lieu, date_debut, date_fin, effectifs_requis, competences_requises, priorite } = body
  
  await DB.prepare(`
    UPDATE missions 
    SET titre = ?, description = ?, lieu = ?, date_debut = ?, date_fin = ?, 
        effectifs_requis = ?, competences_requises = ?, priorite = ?
    WHERE id = ?
  `).bind(titre, description, lieu, date_debut, date_fin, effectifs_requis, competences_requises, priorite, id).run()
  
  return c.json({ message: 'Mission mise à jour avec succès' })
})

// DELETE /api/missions/:id - Supprimer une mission
app.delete('/api/missions/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  await DB.prepare(`DELETE FROM missions WHERE id = ?`).bind(id).run()
  
  return c.json({ message: 'Mission supprimée avec succès' })
})

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

// PUT /api/assignations/:id - Mettre à jour une assignation (assigner/valider/libérer)
app.put('/api/assignations/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const { gendarme_id, statut, commentaire } = body
  
  let query = ''
  let params: any[] = []
  
  if (statut === 'libre') {
    // Libérer la place
    query = `UPDATE assignations SET gendarme_id = NULL, statut = 'libre', commentaire = ?, assigned_at = NULL, validated_at = NULL WHERE id = ?`
    params = [commentaire || null, id]
  } else if (statut === 'en_attente') {
    // Assigner en attente
    query = `UPDATE assignations SET gendarme_id = ?, statut = 'en_attente', commentaire = ?, assigned_at = CURRENT_TIMESTAMP, validated_at = NULL WHERE id = ?`
    params = [gendarme_id, commentaire || null, id]
  } else if (statut === 'valide') {
    // Valider l'assignation
    query = `UPDATE assignations SET gendarme_id = ?, statut = 'valide', commentaire = ?, assigned_at = COALESCE(assigned_at, CURRENT_TIMESTAMP), validated_at = CURRENT_TIMESTAMP WHERE id = ?`
    params = [gendarme_id, commentaire || null, id]
  }
  
  await DB.prepare(query).bind(...params).run()
  
  return c.json({ message: 'Assignation mise à jour avec succès' })
})

// GET /api/stats - Statistiques générales
app.get('/api/stats', async (c) => {
  const { DB } = c.env
  
  const stats = await DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM missions) as total_missions,
      (SELECT COUNT(*) FROM gendarmes) as total_gendarmes,
      (SELECT COUNT(*) FROM assignations WHERE statut = 'valide') as assignations_validees,
      (SELECT COUNT(*) FROM assignations WHERE statut = 'en_attente') as assignations_en_attente,
      (SELECT COUNT(*) FROM assignations WHERE statut = 'libre') as places_libres
  `).first()
  
  return c.json(stats)
})

// ==================== PAGES ====================

// Page d'accueil - Liste des missions
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestion des Missions - Réserve Gendarmerie</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .priority-urgente { border-left: 4px solid #dc2626; }
          .priority-haute { border-left: 4px solid #ea580c; }
          .priority-normale { border-left: 4px solid #2563eb; }
          .priority-basse { border-left: 4px solid #65a30d; }
          
          .status-valide { background-color: #dcfce7; color: #166534; }
          .status-en_attente { background-color: #fef3c7; color: #92400e; }
          .status-libre { background-color: #e5e7eb; color: #374151; }
        </style>
    </head>
    <body class="bg-gray-50">
        <nav class="bg-blue-900 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-shield-alt text-2xl"></i>
                        <h1 class="text-xl font-bold">Gestion des Missions - Réserve Gendarmerie</h1>
                    </div>
                    <div class="flex space-x-4">
                        <a href="/" class="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600">
                            <i class="fas fa-list mr-2"></i>Missions
                        </a>
                        <a href="/admin" class="px-4 py-2 hover:bg-blue-800 rounded">
                            <i class="fas fa-cog mr-2"></i>Administration
                        </a>
                    </div>
                </div>
            </div>
        </nav>

        <div class="container mx-auto px-4 py-8">
            <!-- Statistiques -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Total Missions</p>
                            <p class="text-2xl font-bold text-gray-800" id="stat-missions">-</p>
                        </div>
                        <i class="fas fa-clipboard-list text-3xl text-blue-500"></i>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Assignés</p>
                            <p class="text-2xl font-bold text-green-600" id="stat-valides">-</p>
                        </div>
                        <i class="fas fa-check-circle text-3xl text-green-500"></i>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">En Attente</p>
                            <p class="text-2xl font-bold text-yellow-600" id="stat-attente">-</p>
                        </div>
                        <i class="fas fa-clock text-3xl text-yellow-500"></i>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Places Libres</p>
                            <p class="text-2xl font-bold text-gray-600" id="stat-libres">-</p>
                        </div>
                        <i class="fas fa-user-plus text-3xl text-gray-400"></i>
                    </div>
                </div>
            </div>

            <!-- Filtres -->
            <div class="bg-white rounded-lg shadow p-4 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                        <select id="filter-priorite" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">Toutes</option>
                            <option value="urgente">Urgente</option>
                            <option value="haute">Haute</option>
                            <option value="normale">Normale</option>
                            <option value="basse">Basse</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                        <select id="filter-statut" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">Tous</option>
                            <option value="complet">Complet (tous validés)</option>
                            <option value="partiel">Partiellement assigné</option>
                            <option value="libre">Places libres</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
                        <input type="text" id="filter-search" placeholder="Rechercher..." 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                </div>
            </div>

            <!-- Liste des missions -->
            <div id="missions-list" class="space-y-4">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                    <p class="text-gray-500 mt-2">Chargement des missions...</p>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// Page d'administration
app.get('/admin', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Administration - Gestion des Missions</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .priority-urgente { border-left: 4px solid #dc2626; }
          .priority-haute { border-left: 4px solid #ea580c; }
          .priority-normale { border-left: 4px solid #2563eb; }
          .priority-basse { border-left: 4px solid #65a30d; }
          
          .status-valide { background-color: #dcfce7; color: #166534; }
          .status-en_attente { background-color: #fef3c7; color: #92400e; }
          .status-libre { background-color: #e5e7eb; color: #374151; }
        </style>
    </head>
    <body class="bg-gray-50">
        <nav class="bg-blue-900 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-shield-alt text-2xl"></i>
                        <h1 class="text-xl font-bold">Administration des Missions</h1>
                    </div>
                    <div class="flex space-x-4">
                        <a href="/" class="px-4 py-2 hover:bg-blue-800 rounded">
                            <i class="fas fa-list mr-2"></i>Missions
                        </a>
                        <a href="/admin" class="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600">
                            <i class="fas fa-cog mr-2"></i>Administration
                        </a>
                    </div>
                </div>
            </div>
        </nav>

        <div class="container mx-auto px-4 py-8">
            <!-- Actions rapides -->
            <div class="flex space-x-4 mb-6">
                <button onclick="showAddMissionModal()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <i class="fas fa-plus mr-2"></i>Nouvelle Mission
                </button>
                <button onclick="showAddGendarmeModal()" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <i class="fas fa-user-plus mr-2"></i>Nouveau Gendarme
                </button>
            </div>

            <!-- Onglets -->
            <div class="bg-white rounded-lg shadow mb-6">
                <div class="flex border-b">
                    <button onclick="switchTab('missions')" id="tab-missions" 
                            class="px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600">
                        <i class="fas fa-clipboard-list mr-2"></i>Missions
                    </button>
                    <button onclick="switchTab('gendarmes')" id="tab-gendarmes" 
                            class="px-6 py-3 font-medium text-gray-500 hover:text-gray-700">
                        <i class="fas fa-users mr-2"></i>Gendarmes
                    </button>
                </div>
            </div>

            <!-- Contenu des onglets -->
            <div id="content-missions" class="space-y-4">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                    <p class="text-gray-500 mt-2">Chargement...</p>
                </div>
            </div>

            <div id="content-gendarmes" class="hidden space-y-4">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                    <p class="text-gray-500 mt-2">Chargement...</p>
                </div>
            </div>
        </div>

        <!-- Modal pour ajouter une mission -->
        <div id="modal-mission" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                <h2 class="text-2xl font-bold mb-4">Nouvelle Mission</h2>
                <form id="form-mission" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                        <input type="text" id="mission-titre" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="mission-description" required rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                        <input type="text" id="mission-lieu" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                            <input type="datetime-local" id="mission-debut" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                            <input type="datetime-local" id="mission-fin" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Effectifs requis</label>
                            <input type="number" id="mission-effectifs" required min="1" value="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                            <select id="mission-priorite" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="normale">Normale</option>
                                <option value="basse">Basse</option>
                                <option value="haute">Haute</option>
                                <option value="urgente">Urgente</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Compétences requises</label>
                        <input type="text" id="mission-competences" placeholder="Ex: Maintien de l'ordre, Premiers secours" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" onclick="hideAddMissionModal()" 
                                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                            Annuler
                        </button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>Créer
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal pour ajouter un gendarme -->
        <div id="modal-gendarme" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                <h2 class="text-2xl font-bold mb-4">Nouveau Gendarme</h2>
                <form id="form-gendarme" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
                            <input type="text" id="gendarme-matricule" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                            <input type="text" id="gendarme-grade" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input type="text" id="gendarme-nom" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                            <input type="text" id="gendarme-prenom" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                        <input type="text" id="gendarme-specialite" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                            <input type="tel" id="gendarme-telephone" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" id="gendarme-email" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" onclick="hideAddGendarmeModal()" 
                                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                            Annuler
                        </button>
                        <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <i class="fas fa-save mr-2"></i>Créer
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal pour gérer les assignations d'une mission -->
        <div id="modal-assignations" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold" id="modal-mission-titre">Gestion des assignations</h2>
                    <button onclick="hideAssignationsModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <div id="assignations-content"></div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
        <script src="/static/admin.js"></script>
    </body>
    </html>
  `)
})

export default app
