// Configuration dayjs
dayjs.locale('fr')

let allMissions = [], allGendarmes = [], allBrigades = [], allCompagnies = []
let currentTab = 'missions'

// ==================== AUTH ====================

async function checkAuth() {
  try {
    const response = await axios.get('/api/auth/me')
    if (response.data.authenticated) {
      document.getElementById('user-info').textContent = `Connecté: ${response.data.user.username}`
      return true
    }
  } catch (error) {
    window.location.href = '/login'
    return false
  }
}

async function logout() {
  try {
    await axios.post('/api/auth/logout')
    window.location.href = '/login'
  } catch (error) {
    console.error('Erreur déconnexion:', error)
  }
}

// ==================== LOAD DATA ====================

async function loadLogo() {
  try {
    const response = await axios.get('/api/config/logo_url')
    if (response.data.value) {
      document.getElementById('nav-logo').src = response.data.value
    }
  } catch (error) {
    console.error('Erreur chargement logo:', error)
  }
}

async function loadMissions() {
  try {
    const response = await axios.get('/api/missions')
    allMissions = response.data
    renderAdminMissions(allMissions)
  } catch (error) {
    console.error('Erreur:', error)
    document.getElementById('content-missions').innerHTML = '<div class="bg-red-50 p-4 rounded">Erreur de chargement</div>'
  }
}

async function loadGendarmes() {
  try {
    const response = await axios.get('/api/gendarmes')
    allGendarmes = response.data
    renderAdminGendarmes(allGendarmes)
  } catch (error) {
    console.error('Erreur:', error)
  }
}

async function loadBrigades() {
  try {
    const [brigadesRes, compagniesRes] = await Promise.all([
      axios.get('/api/brigades'),
      axios.get('/api/compagnies')
    ])
    allBrigades = brigadesRes.data
    allCompagnies = compagniesRes.data
    renderAdminLieux()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

// ==================== RENDER ====================

function renderAdminMissions(missions) {
  const container = document.getElementById('content-missions')
  if (missions.length === 0) {
    container.innerHTML = '<div class="bg-gray-50 p-8 text-center rounded">Aucune mission</div>'
    return
  }
  
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mission</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brigade</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effectifs</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${missions.map(m => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono text-xs">${m.numero_mission}</td>
              <td class="px-4 py-3">
                <div class="font-medium">${m.titre}</div>
                <div class="text-xs text-gray-500">${m.description.substring(0, 50)}...</div>
              </td>
              <td class="px-4 py-3 text-sm">${m.brigade_nom || '-'}</td>
              <td class="px-4 py-3 text-sm">${dayjs(m.date_debut).format('DD/MM HH:mm')}</td>
              <td class="px-4 py-3 text-sm">${m.effectifs_assignes}/${m.effectifs_requis}</td>
              <td class="px-4 py-3"><span class="px-2 py-1 text-xs rounded ${getPriorityClass(m.priorite)}">${getPriorityLabel(m.priorite)}</span></td>
              <td class="px-4 py-3 text-sm">
                <button onclick="showAssignationsModal(${m.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                  <i class="fas fa-users"></i>
                </button>
                <button onclick="deleteMission(${m.id})" class="text-red-600 hover:text-red-800">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

function renderAdminGendarmes(gendarmes) {
  const container = document.getElementById('content-gendarmes')
  if (gendarmes.length === 0) {
    container.innerHTML = '<div class="bg-gray-50 p-8 text-center rounded">Aucun gendarme</div>'
    return
  }
  
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spécialité</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Missions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${gendarmes.map(g => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono text-sm">${g.matricule}</td>
              <td class="px-4 py-3 font-medium">${g.nom} ${g.prenom}</td>
              <td class="px-4 py-3 text-sm">${g.grade}</td>
              <td class="px-4 py-3 text-sm">${g.specialite || '-'}</td>
              <td class="px-4 py-3 text-sm">${g.telephone || '-'}</td>
              <td class="px-4 py-3"><span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">${g.missions_actives || 0}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

function renderAdminLieux() {
  const container = document.getElementById('content-lieux')
  
  container.innerHTML = `
    <div class="space-y-6">
      ${allCompagnies.map(comp => `
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-bold text-gray-800">${comp.nom}</h3>
              <p class="text-sm text-gray-600 font-mono">${comp.code}</p>
              <p class="text-sm text-gray-600 mt-1">${comp.adresse || ''}</p>
              <p class="text-sm text-gray-600">Commandant: ${comp.commandant || '-'}</p>
            </div>
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">${comp.nombre_brigades || 0} brigade(s)</span>
          </div>
          
          <div class="border-t pt-4 mt-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-semibold text-gray-700">Brigades rattachées</h4>
              <button onclick="showAddBrigadeModal(${comp.id})" class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                <i class="fas fa-plus mr-1"></i>Ajouter brigade
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${allBrigades.filter(b => b.compagnie_id === comp.id).map(b => `
                <div class="border rounded p-3 hover:bg-gray-50">
                  <div class="flex justify-between">
                    <div>
                      <div class="font-medium">${b.nom}</div>
                      <div class="text-xs text-gray-500 font-mono">${b.code}</div>
                      <div class="text-xs text-gray-600 mt-1">${b.adresse}</div>
                      <div class="text-xs text-gray-600">Chef: ${b.chef_brigade || '-'}</div>
                    </div>
                    <button onclick="deleteBrigade(${b.id})" class="text-red-600 hover:text-red-800 h-8">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              `).join('') || '<p class="text-gray-500 text-sm">Aucune brigade</p>'}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `
}

function getPriorityClass(p) {
  return {'urgente':'bg-red-100 text-red-800','haute':'bg-orange-100 text-orange-800','normale':'bg-blue-100 text-blue-800','basse':'bg-green-100 text-green-800'}[p]
}

function getPriorityLabel(p) {
  return {'urgente':'URGENTE','haute':'Haute','normale':'Normale','basse':'Basse'}[p]
}

function getStatutLabel(s) {
  return {'valide':'Validé','en_attente':'En attente','libre':'Libre'}[s]
}

// ==================== TABS ====================

function switchTab(tab) {
  currentTab = tab
  
  document.getElementById('tab-missions').className = tab === 'missions' ? 'px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600' : 'px-6 py-3 font-medium text-gray-500 hover:text-gray-700'
  document.getElementById('tab-lieux').className = tab === 'lieux' ? 'px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600' : 'px-6 py-3 font-medium text-gray-500 hover:text-gray-700'
  document.getElementById('tab-gendarmes').className = tab === 'gendarmes' ? 'px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600' : 'px-6 py-3 font-medium text-gray-500 hover:text-gray-700'
  
  document.getElementById('content-missions').className = tab === 'missions' ? 'space-y-4' : 'hidden'
  document.getElementById('content-lieux').className = tab === 'lieux' ? 'space-y-4' : 'hidden'
  document.getElementById('content-gendarmes').className = tab === 'gendarmes' ? 'space-y-4' : 'hidden'
  
  if (tab === 'gendarmes' && allGendarmes.length === 0) loadGendarmes()
  if (tab === 'lieux' && allBrigades.length === 0) loadBrigades()
}

// ==================== MODALS CONTAINER ====================

function initModals() {
  document.getElementById('modals-container').innerHTML = `
    <!-- Modal Mission -->
    <div id="modal-mission" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">Nouvelle Mission</h2>
        <form id="form-mission" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Numéro de mission *</label>
              <input type="text" id="mission-numero" required class="w-full px-3 py-2 border rounded-lg" placeholder="M2026-XXX">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Titre *</label>
              <input type="text" id="mission-titre" required class="w-full px-3 py-2 border rounded-lg">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea id="mission-description" rows="2" class="w-full px-3 py-2 border rounded-lg"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Brigade *</label>
            <select id="mission-brigade" required class="w-full px-3 py-2 border rounded-lg"></select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Date début *</label>
              <input type="datetime-local" id="mission-debut" required class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Date fin</label>
              <input type="datetime-local" id="mission-fin" class="w-full px-3 py-2 border rounded-lg">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Effectifs requis</label>
              <input type="number" id="mission-effectifs" min="1" value="1" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Priorité</label>
              <select id="mission-priorite" class="w-full px-3 py-2 border rounded-lg">
                <option value="normale">Normale</option>
                <option value="basse">Basse</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Compétences requises</label>
            <input type="text" id="mission-competences" class="w-full px-3 py-2 border rounded-lg">
          </div>
          <div class="flex justify-end space-x-2">
            <button type="button" onclick="hideModal('modal-mission')" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Annuler</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Créer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Lieu -->
    <div id="modal-lieu" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-screen overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">Gestion des Lieux</h2>
        
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3">Créer une Compagnie</h3>
          <form id="form-compagnie" class="space-y-3 bg-gray-50 p-4 rounded">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-1">Nom *</label>
                <input type="text" id="comp-nom" required class="w-full px-3 py-2 border rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Code *</label>
                <input type="text" id="comp-code" required class="w-full px-3 py-2 border rounded-lg" placeholder="CGP">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Adresse</label>
              <input type="text" id="comp-adresse" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-1">Téléphone</label>
                <input type="tel" id="comp-telephone" class="w-full px-3 py-2 border rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Commandant</label>
                <input type="text" id="comp-commandant" class="w-full px-3 py-2 border rounded-lg">
              </div>
            </div>
            <button type="submit" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              <i class="fas fa-plus mr-2"></i>Créer Compagnie
            </button>
          </form>
        </div>
        
        <div class="border-t pt-4">
          <button onclick="hideModal('modal-lieu')" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Fermer</button>
        </div>
      </div>
    </div>

    <!-- Modal Brigade -->
    <div id="modal-brigade" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 class="text-xl font-bold mb-4">Nouvelle Brigade</h2>
        <form id="form-brigade" class="space-y-3">
          <input type="hidden" id="brigade-compagnie-id">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Nom *</label>
              <input type="text" id="brigade-nom" required class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Code *</label>
              <input type="text" id="brigade-code" required class="w-full px-3 py-2 border rounded-lg" placeholder="BPC">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Adresse *</label>
            <input type="text" id="brigade-adresse" required class="w-full px-3 py-2 border rounded-lg">
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Téléphone</label>
              <input type="tel" id="brigade-telephone" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Effectifs</label>
              <input type="number" id="brigade-effectifs" min="0" value="0" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Chef de Brigade</label>
              <input type="text" id="brigade-chef" class="w-full px-3 py-2 border rounded-lg">
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <button type="button" onclick="hideModal('modal-brigade')" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Annuler</button>
            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Créer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Gendarme -->
    <div id="modal-gendarme" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 class="text-xl font-bold mb-4">Nouveau Gendarme</h2>
        <form id="form-gendarme" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Matricule *</label>
              <input type="text" id="gendarme-matricule" required class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Grade *</label>
              <input type="text" id="gendarme-grade" required class="w-full px-3 py-2 border rounded-lg">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Nom *</label>
              <input type="text" id="gendarme-nom" required class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Prénom *</label>
              <input type="text" id="gendarme-prenom" required class="w-full px-3 py-2 border rounded-lg">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Spécialité</label>
            <input type="text" id="gendarme-specialite" class="w-full px-3 py-2 border rounded-lg">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Téléphone</label>
              <input type="tel" id="gendarme-telephone" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input type="email" id="gendarme-email" class="w-full px-3 py-2 border rounded-lg">
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <button type="button" onclick="hideModal('modal-gendarme')" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Annuler</button>
            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Créer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Assignations -->
    <div id="modal-assignations" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold" id="modal-mission-titre">Assignations</h2>
          <button onclick="hideModal('modal-assignations')" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        <div id="assignations-content"></div>
      </div>
    </div>

    <!-- Modal Upload Logo -->
    <div id="modal-logo" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 class="text-xl font-bold mb-4">Modifier l'écusson</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">URL de l'image</label>
            <input type="url" id="logo-url" class="w-full px-3 py-2 border rounded-lg" placeholder="https://...">
            <p class="text-xs text-gray-500 mt-1">Entrez l'URL d'une image hébergée en ligne</p>
          </div>
          <div class="border-t pt-4">
            <p class="text-sm text-gray-600 mb-2">Aperçu actuel:</p>
            <img id="logo-preview" src="/static/default-logo.png" class="h-20 w-20 object-contain border rounded p-2">
          </div>
          <div class="flex justify-end space-x-2">
            <button onclick="hideModal('modal-logo')" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Annuler</button>
            <button onclick="saveLogo()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  `
}

// ==================== MODAL FUNCTIONS ====================

function showAddMissionModal() {
  // Charger les brigades dans le select
  axios.get('/api/brigades').then(res => {
    document.getElementById('mission-brigade').innerHTML = 
      '<option value="">Sélectionner une brigade...</option>' +
      res.data.map(b => `<option value="${b.id}">${b.compagnie_nom} - ${b.nom}</option>`).join('')
  })
  document.getElementById('modal-mission').classList.remove('hidden')
}

function showAddLieuModal() {
  document.getElementById('modal-lieu').classList.remove('hidden')
}

function showAddGendarmeModal() {
  document.getElementById('modal-gendarme').classList.remove('hidden')
}

function showAddBrigadeModal(compagnieId) {
  document.getElementById('brigade-compagnie-id').value = compagnieId
  document.getElementById('modal-brigade').classList.remove('hidden')
}

function showLogoUploadModal() {
  axios.get('/api/config/logo_url').then(res => {
    if (res.data.value) {
      document.getElementById('logo-url').value = res.data.value
      document.getElementById('logo-preview').src = res.data.value
    }
  })
  document.getElementById('modal-logo').classList.remove('hidden')
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.add('hidden')
  // Reset forms
  document.querySelectorAll(`#${modalId} form`).forEach(f => f.reset())
}

// ==================== FORM HANDLERS ====================

document.addEventListener('DOMContentLoaded', () => {
  checkAuth().then(authenticated => {
    if (authenticated) {
      initModals()
      loadLogo()
      loadMissions()
      
      // Form handlers
      document.getElementById('form-mission').addEventListener('submit', async (e) => {
        e.preventDefault()
        const data = {
          numero_mission: document.getElementById('mission-numero').value,
          titre: document.getElementById('mission-titre').value,
          description: document.getElementById('mission-description').value,
          brigade_id: document.getElementById('mission-brigade').value,
          date_debut: document.getElementById('mission-debut').value,
          date_fin: document.getElementById('mission-fin').value,
          effectifs_requis: parseInt(document.getElementById('mission-effectifs').value),
          competences_requises: document.getElementById('mission-competences').value,
          priorite: document.getElementById('mission-priorite').value
        }
        
        try {
          await axios.post('/api/missions', data)
          hideModal('modal-mission')
          loadMissions()
          alert('Mission créée')
        } catch (error) {
          alert(error.response?.data?.error || 'Erreur')
        }
      })

      document.getElementById('form-compagnie').addEventListener('submit', async (e) => {
        e.preventDefault()
        const data = {
          nom: document.getElementById('comp-nom').value,
          code: document.getElementById('comp-code').value,
          adresse: document.getElementById('comp-adresse').value,
          telephone: document.getElementById('comp-telephone').value,
          commandant: document.getElementById('comp-commandant').value
        }
        
        try {
          await axios.post('/api/compagnies', data)
          e.target.reset()
          loadBrigades()
          alert('Compagnie créée')
        } catch (error) {
          alert('Erreur')
        }
      })

      document.getElementById('form-brigade').addEventListener('submit', async (e) => {
        e.preventDefault()
        const data = {
          compagnie_id: parseInt(document.getElementById('brigade-compagnie-id').value),
          nom: document.getElementById('brigade-nom').value,
          code: document.getElementById('brigade-code').value,
          adresse: document.getElementById('brigade-adresse').value,
          telephone: document.getElementById('brigade-telephone').value,
          effectifs: parseInt(document.getElementById('brigade-effectifs').value),
          chef_brigade: document.getElementById('brigade-chef').value
        }
        
        try {
          await axios.post('/api/brigades', data)
          hideModal('modal-brigade')
          loadBrigades()
          alert('Brigade créée')
        } catch (error) {
          alert('Erreur')
        }
      })

      document.getElementById('form-gendarme').addEventListener('submit', async (e) => {
        e.preventDefault()
        const data = {
          matricule: document.getElementById('gendarme-matricule').value,
          nom: document.getElementById('gendarme-nom').value,
          prenom: document.getElementById('gendarme-prenom').value,
          grade: document.getElementById('gendarme-grade').value,
          specialite: document.getElementById('gendarme-specialite').value,
          telephone: document.getElementById('gendarme-telephone').value,
          email: document.getElementById('gendarme-email').value
        }
        
        try {
          await axios.post('/api/gendarmes', data)
          hideModal('modal-gendarme')
          loadGendarmes()
          alert('Gendarme créé')
        } catch (error) {
          alert('Erreur')
        }
      })
    }
  })
})

// ==================== ACTIONS ====================

async function deleteMission(id) {
  if (!confirm('Supprimer cette mission ?')) return
  try {
    await axios.delete(`/api/missions/${id}`)
    loadMissions()
    alert('Mission supprimée')
  } catch (error) {
    alert('Erreur')
  }
}

async function deleteBrigade(id) {
  if (!confirm('Supprimer cette brigade ?')) return
  try {
    await axios.delete(`/api/brigades/${id}`)
    loadBrigades()
    alert('Brigade supprimée')
  } catch (error) {
    alert('Erreur: ' + (error.response?.data?.error || 'Impossible de supprimer'))
  }
}

async function saveLogo() {
  const url = document.getElementById('logo-url').value
  if (!url) {
    alert('Veuillez entrer une URL')
    return
  }
  
  try {
    await axios.post('/api/config', { key: 'logo_url', value: url })
    document.getElementById('nav-logo').src = url
    hideModal('modal-logo')
    alert('Logo mis à jour')
  } catch (error) {
    alert('Erreur')
  }
}

// ==================== ASSIGNATIONS ====================

async function showAssignationsModal(missionId) {
  try {
    const [missionRes, gendarmesRes] = await Promise.all([
      axios.get(`/api/missions/${missionId}`),
      axios.get('/api/gendarmes')
    ])
    
    const { mission, assignations } = missionRes.data
    allGendarmes = gendarmesRes.data
    
    document.getElementById('modal-mission-titre').textContent = mission.titre
    document.getElementById('assignations-content').innerHTML = `
      <div class="mb-4 p-4 bg-blue-50 rounded">
        <div class="text-sm"><strong>N°:</strong> ${mission.numero_mission}</div>
        <div class="text-sm"><strong>Brigade:</strong> ${mission.brigade_nom}</div>
        <div class="text-sm"><strong>Date:</strong> ${dayjs(mission.date_debut).format('DD/MM/YYYY HH:mm')}</div>
      </div>
      
      <div class="space-y-3">
        ${assignations.map(a => `
          <div class="border rounded p-3 ${a.statut === 'valide' ? 'bg-green-50' : a.statut === 'en_attente' ? 'bg-yellow-50' : 'bg-gray-50'}">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                ${a.gendarme_id ? `
                  <div class="font-medium">${a.grade} ${a.nom} ${a.prenom}</div>
                  <div class="text-sm text-gray-600">${a.matricule} - ${a.specialite || 'Sans spé'}</div>
                ` : '<div class="text-gray-500"><i class="fas fa-user-plus mr-2"></i>Place libre</div>'}
                <span class="status-${a.statut} px-2 py-1 rounded text-xs font-medium inline-block mt-2">${getStatutLabel(a.statut)}</span>
              </div>
              <div class="flex space-x-2">
                ${a.statut === 'libre' ? `<button onclick="assignGendarme(${a.id}, ${missionId})" class="px-3 py-1 bg-blue-600 text-white text-sm rounded">Assigner</button>` : ''}
                ${a.statut === 'en_attente' ? `<button onclick="validateAssignation(${a.id}, ${a.gendarme_id}, ${missionId})" class="px-3 py-1 bg-green-600 text-white text-sm rounded">Valider</button>` : ''}
                ${a.gendarme_id ? `<button onclick="liberateAssignation(${a.id}, ${missionId})" class="px-3 py-1 bg-red-600 text-white text-sm rounded">Libérer</button>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `
    
    document.getElementById('modal-assignations').classList.remove('hidden')
  } catch (error) {
    console.error('Erreur:', error)
  }
}

async function assignGendarme(assignationId, missionId) {
  const options = allGendarmes.filter(g => g.disponible).map(g => 
    `<option value="${g.id}">${g.grade} ${g.nom} ${g.prenom} (${g.matricule})</option>`
  ).join('')
  
  if (!options) {
    alert('Aucun gendarme disponible')
    return
  }
  
  const modal = document.createElement('div')
  modal.id = 'temp-modal'
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="font-bold mb-3">Assigner un gendarme</h3>
      <select id="select-gendarme" class="w-full px-3 py-2 border rounded mb-3">
        <option value="">Sélectionner...</option>${options}
      </select>
      <div class="flex justify-end space-x-2">
        <button onclick="this.closest('#temp-modal').remove()" class="px-4 py-2 bg-gray-300 rounded">Annuler</button>
        <button onclick="confirmAssign(${assignationId}, ${missionId})" class="px-4 py-2 bg-blue-600 text-white rounded">Assigner</button>
      </div>
    </div>
  `
  document.body.appendChild(modal)
}

async function confirmAssign(assignationId, missionId) {
  const gendarmeId = document.getElementById('select-gendarme').value
  if (!gendarmeId) {
    alert('Sélectionner un gendarme')
    return
  }
  
  try {
    await axios.put(`/api/assignations/${assignationId}`, {
      gendarme_id: gendarmeId,
      statut: 'en_attente'
    })
    document.getElementById('temp-modal').remove()
    showAssignationsModal(missionId)
    loadMissions()
  } catch (error) {
    alert('Erreur')
  }
}

async function validateAssignation(assignationId, gendarmeId, missionId) {
  if (!confirm('Valider cette assignation ?')) return
  
  try {
    await axios.put(`/api/assignations/${assignationId}`, {
      gendarme_id: gendarmeId,
      statut: 'valide'
    })
    showAssignationsModal(missionId)
    loadMissions()
  } catch (error) {
    alert('Erreur')
  }
}

async function liberateAssignation(assignationId, missionId) {
  if (!confirm('Libérer cette place ?')) return
  
  try {
    await axios.put(`/api/assignations/${assignationId}`, {
      statut: 'libre'
    })
    showAssignationsModal(missionId)
    loadMissions()
  } catch (error) {
    alert('Erreur')
  }
}
