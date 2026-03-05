dayjs.locale('fr')

let allMissions = [], allGendarmes = [], allBrigades = [], allCompagnies = []
let currentTab = 'missions', filteredMissions = [], editingMissionId = null
let selectedCompagnieId = null, selectedBrigadeId = null, filteredGendarmes = []

// AUTH
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

// LOAD DATA
async function loadLogo() {
  try {
    const response = await axios.get('/api/config/logo_url')
    if (response.data.value) document.getElementById('nav-logo').src = response.data.value
  } catch (error) {
    console.error('Erreur chargement logo:', error)
  }
}

async function loadMissions() {
  try {
    const response = await axios.get('/api/missions')
    allMissions = response.data
    filteredMissions = allMissions
    renderCompagnieCards()
  } catch (error) {
    console.error('Erreur:', error)
    document.getElementById('content-missions').innerHTML = '<div class="bg-red-50 p-4 rounded">Erreur</div>'
  }
}

async function loadGendarmes() {
  try {
    const response = await axios.get('/api/gendarmes')
    allGendarmes = response.data
    filteredGendarmes = allGendarmes
    renderAdminGendarmes(filteredGendarmes)
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

// RENDER - NAVIGATION HIÉRARCHIQUE MISSIONS
function renderCompagnieCards() {
  const container = document.getElementById('content-missions')
  
  // Grouper missions par compagnie
  const missionsByCompagnie = {}
  allCompagnies.forEach(c => {
    missionsByCompagnie[c.id] = {
      compagnie: c,
      count: 0
    }
  })
  
  allMissions.forEach(m => {
    const brigade = allBrigades.find(b => b.id === m.brigade_id)
    if (brigade && missionsByCompagnie[brigade.compagnie_id]) {
      missionsByCompagnie[brigade.compagnie_id].count++
    }
  })
  
  container.innerHTML = `
    <div class="mb-6">
      <button onclick="showNewMissionModal()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mb-4">
        <i class="fas fa-plus mr-2"></i>Nouvelle mission
      </button>
      <div class="flex items-center gap-2 mb-4">
        <button onclick="resetMissionView()" class="text-sm text-gray-600 hover:text-gray-900">
          <i class="fas fa-home mr-1"></i>Retour aux compagnies
        </button>
        ${selectedCompagnieId ? `<i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          <span class="text-sm font-medium text-gray-700">${allCompagnies.find(c => c.id === selectedCompagnieId)?.nom}</span>` : ''}
        ${selectedBrigadeId ? `<i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          <span class="text-sm font-medium text-gray-700">${allBrigades.find(b => b.id === selectedBrigadeId)?.nom}</span>` : ''}
      </div>
    </div>
    
    ${!selectedCompagnieId ? renderCompagnieSelection(missionsByCompagnie) : ''}
    ${selectedCompagnieId && !selectedBrigadeId ? renderBrigadeSelection() : ''}
    ${selectedBrigadeId ? renderMissionsByBrigade() : ''}
  `
}

function renderCompagnieSelection(missionsByCompagnie) {
  return `
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        <i class="fas fa-building mr-2"></i>Sélectionnez une compagnie
      </h3>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${allCompagnies.map(c => {
        const data = missionsByCompagnie[c.id]
        return `
          <div onclick="selectCompagnie(${c.id})" 
               class="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all duration-200">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h4 class="font-bold text-gray-900 text-lg">${c.nom}</h4>
                <span class="inline-block text-xs font-mono bg-gray-100 px-2 py-1 rounded mt-1">${c.code}</span>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-blue-600">${data.count}</div>
                <div class="text-xs text-gray-500">missions</div>
              </div>
            </div>
            <div class="text-sm text-gray-600 space-y-1">
              <div><i class="fas fa-user-tie text-gray-400 w-4"></i> ${c.commandant || 'N/A'}</div>
              <div><i class="fas fa-phone text-gray-400 w-4"></i> ${c.telephone}</div>
              <div><i class="fas fa-map-marker-alt text-gray-400 w-4"></i> ${c.adresse}</div>
            </div>
          </div>
        `
      }).join('')}
    </div>
  `
}

function renderBrigadeSelection() {
  const compagnie = allCompagnies.find(c => c.id === selectedCompagnieId)
  const brigadesInCompagnie = allBrigades.filter(b => b.compagnie_id === selectedCompagnieId)
  
  // Compter missions par brigade
  const missionsByBrigade = {}
  brigadesInCompagnie.forEach(b => {
    missionsByBrigade[b.id] = allMissions.filter(m => m.brigade_id === b.id).length
  })
  
  return `
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        <i class="fas fa-shield-alt mr-2"></i>Brigades de ${compagnie.nom}
      </h3>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${brigadesInCompagnie.map(b => `
        <div onclick="selectBrigade(${b.id})" 
             class="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 hover:shadow-lg cursor-pointer transition-all duration-200">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="font-bold text-gray-900 text-lg">${b.nom}</h4>
              <span class="inline-block text-xs font-mono bg-gray-100 px-2 py-1 rounded mt-1">${b.code}</span>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-green-600">${missionsByBrigade[b.id]}</div>
              <div class="text-xs text-gray-500">missions</div>
            </div>
          </div>
          <div class="text-sm text-gray-600 space-y-1">
            <div><i class="fas fa-user text-gray-400 w-4"></i> ${b.chef_brigade}</div>
            <div><i class="fas fa-users text-gray-400 w-4"></i> ${b.effectifs} gendarmes</div>
            <div><i class="fas fa-phone text-gray-400 w-4"></i> ${b.telephone}</div>
            <div><i class="fas fa-map-marker-alt text-gray-400 w-4"></i> ${b.adresse}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `
}

function renderMissionsByBrigade() {
  const brigade = allBrigades.find(b => b.id === selectedBrigadeId)
  const missions = allMissions.filter(m => m.brigade_id === selectedBrigadeId)
  
  if (missions.length === 0) {
    return `
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <i class="fas fa-info-circle text-yellow-600 text-2xl mb-2"></i>
        <p class="text-gray-700">Aucune mission pour la brigade <strong>${brigade.nom}</strong></p>
      </div>
    `
  }
  
  return `
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        <i class="fas fa-tasks mr-2"></i>Missions de ${brigade.nom} (${missions.length})
      </h3>
    </div>
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mission</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effectifs</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${missions.map(m => {
            const prioriteClass = m.priorite === 'haute' ? 'bg-red-100 text-red-800' : 
                                  m.priorite === 'moyenne' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-green-100 text-green-800'
            const prioriteLabel = m.priorite === 'haute' ? 'Haute' : 
                                  m.priorite === 'moyenne' ? 'Moyenne' : 'Normale'
            return `
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-mono text-xs">${m.numero_mission}</td>
                <td class="px-4 py-3">
                  <div class="font-medium text-gray-900">${m.titre}</div>
                  ${m.description ? `<div class="text-sm text-gray-500 mt-1">${m.description.substring(0, 50)}${m.description.length > 50 ? '...' : ''}</div>` : ''}
                </td>
                <td class="px-4 py-3 text-sm">${dayjs(m.date_debut).format('DD/MM/YYYY')}</td>
                <td class="px-4 py-3 text-sm font-medium">
                  <span class="${m.effectifs_assignes >= m.effectifs_requis ? 'text-green-600' : 'text-orange-600'}">
                    ${m.effectifs_assignes}/${m.effectifs_requis}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 text-xs rounded-full ${prioriteClass}">${prioriteLabel}</span>
                </td>
                <td class="px-4 py-3 text-sm space-x-2">
                  <button onclick="viewAssignations(${m.id})" class="text-blue-600 hover:text-blue-800">
                    <i class="fas fa-users"></i> Voir
                  </button>
                  <button onclick="editMission(${m.id})" class="text-indigo-600 hover:text-indigo-800">
                    <i class="fas fa-edit"></i> Éditer
                  </button>
                  <button onclick="deleteMission(${m.id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    </div>
  `
}

function selectCompagnie(compagnieId) {
  selectedCompagnieId = compagnieId
  selectedBrigadeId = null
  renderCompagnieCards()
}

function selectBrigade(brigadeId) {
  selectedBrigadeId = brigadeId
  renderCompagnieCards()
}

function resetMissionView() {
  selectedCompagnieId = null
  selectedBrigadeId = null
  renderCompagnieCards()
}

// RENDER - GENDARMES
function renderAdminGendarmes(gendarmes) {
  const container = document.getElementById('gendarmes-table-container')
  
  // Compter missions actives par gendarme
  const missionsCountByGendarme = {}
  allGendarmes.forEach(g => {
    missionsCountByGendarme[g.id] = 0
  })
  
  allMissions.forEach(m => {
    if (m.gendarmes_assignes) {
      m.gendarmes_assignes.forEach(g => {
        const gendarme = allGendarmes.find(gd => gd.matricule === g.matricule)
        if (gendarme && (g.statut === 'valide' || g.statut === 'en_attente')) {
          missionsCountByGendarme[gendarme.id]++
        }
      })
    }
  })
  
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
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Missions actives</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${gendarmes.map(g => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono text-sm">${g.matricule}</td>
              <td class="px-4 py-3 font-medium">${g.prenom} ${g.nom}</td>
              <td class="px-4 py-3 text-sm">${g.grade}</td>
              <td class="px-4 py-3 text-sm">${g.specialite}</td>
              <td class="px-4 py-3 text-sm">
                ${g.telephone ? `<div><i class="fas fa-phone text-gray-400"></i> ${g.telephone}</div>` : ''}
                ${g.email ? `<div class="text-xs"><i class="fas fa-envelope text-gray-400"></i> ${g.email}</div>` : ''}
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs rounded-full ${missionsCountByGendarme[g.id] > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}">
                  ${missionsCountByGendarme[g.id]} mission${missionsCountByGendarme[g.id] > 1 ? 's' : ''}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                <button onclick="editGendarme(${g.id})" class="text-indigo-600 hover:text-indigo-800">
                  <i class="fas fa-edit"></i> Modifier
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

// RENDER - LIEUX
function renderAdminLieux() {
  const container = document.getElementById('content-lieux')
  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Compagnies -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Compagnies</h3>
          <button onclick="showNewCompagnieModal()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <i class="fas fa-plus mr-2"></i>Nouvelle
          </button>
        </div>
        <div class="space-y-3">
          ${allCompagnies.map(c => {
            const brigadesCount = allBrigades.filter(b => b.compagnie_id === c.id).length
            return `
              <div class="bg-white border rounded-lg p-4 shadow-sm">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h4 class="font-bold text-gray-900">${c.nom}</h4>
                      <span class="text-xs font-mono bg-gray-100 px-2 py-1 rounded">${c.code}</span>
                    </div>
                    <div class="text-sm text-gray-600 space-y-1">
                      <div><i class="fas fa-user-tie text-gray-400 w-4"></i> ${c.commandant || 'N/A'}</div>
                      <div><i class="fas fa-phone text-gray-400 w-4"></i> ${c.telephone}</div>
                      <div><i class="fas fa-shield-alt text-gray-400 w-4"></i> ${brigadesCount} brigade${brigadesCount > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button onclick="editCompagnie(${c.id})" class="text-indigo-600 hover:text-indigo-800">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteCompagnie(${c.id})" class="text-red-600 hover:text-red-800">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            `
          }).join('')}
        </div>
      </div>
      
      <!-- Brigades -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Brigades</h3>
          <button onclick="showNewBrigadeModal()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            <i class="fas fa-plus mr-2"></i>Nouvelle
          </button>
        </div>
        <div class="space-y-3">
          ${allBrigades.map(b => `
            <div class="bg-white border rounded-lg p-4 shadow-sm">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h4 class="font-bold text-gray-900">${b.nom}</h4>
                    <span class="text-xs font-mono bg-gray-100 px-2 py-1 rounded">${b.code}</span>
                  </div>
                  <div class="text-xs text-gray-500 mb-2">
                    <i class="fas fa-building"></i> ${b.compagnie_nom} (${b.compagnie_code})
                  </div>
                  <div class="text-sm text-gray-600 space-y-1">
                    <div><i class="fas fa-user text-gray-400 w-4"></i> ${b.chef_brigade}</div>
                    <div><i class="fas fa-users text-gray-400 w-4"></i> ${b.effectifs} gendarmes</div>
                    <div><i class="fas fa-phone text-gray-400 w-4"></i> ${b.telephone}</div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button onclick="editBrigade(${b.id})" class="text-indigo-600 hover:text-indigo-800">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteBrigade(${b.id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `
}

// MODALS - MISSIONS
function showNewMissionModal() {
  editingMissionId = null
  document.getElementById('modal-mission-title').textContent = 'Nouvelle mission'
  document.getElementById('form-mission').reset()
  document.getElementById('modal-mission').classList.remove('hidden')
  
  // Populate brigade dropdown
  const brigadeSelect = document.getElementById('mission-brigade-id')
  brigadeSelect.innerHTML = '<option value="">-- Sélectionnez une brigade --</option>' +
    allBrigades.map(b => `<option value="${b.id}">${b.nom} (${b.compagnie_nom})</option>`).join('')
}

function editMission(missionId) {
  editingMissionId = missionId
  const mission = allMissions.find(m => m.id === missionId)
  if (!mission) return
  
  document.getElementById('modal-mission-title').textContent = 'Modifier la mission'
  document.getElementById('mission-numero').value = mission.numero_mission
  document.getElementById('mission-titre').value = mission.titre
  document.getElementById('mission-description').value = mission.description || ''
  document.getElementById('mission-brigade-id').value = mission.brigade_id
  document.getElementById('mission-date-debut').value = dayjs(mission.date_debut).format('YYYY-MM-DDTHH:mm')
  document.getElementById('mission-date-fin').value = dayjs(mission.date_fin).format('YYYY-MM-DDTHH:mm')
  document.getElementById('mission-effectifs').value = mission.effectifs_requis
  document.getElementById('mission-competences').value = mission.competences_requises || ''
  document.getElementById('mission-priorite').value = mission.priorite
  
  // Populate brigade dropdown
  const brigadeSelect = document.getElementById('mission-brigade-id')
  brigadeSelect.innerHTML = '<option value="">-- Sélectionnez une brigade --</option>' +
    allBrigades.map(b => `<option value="${b.id}">${b.nom} (${b.compagnie_nom})</option>`).join('')
  brigadeSelect.value = mission.brigade_id
  
  document.getElementById('modal-mission').classList.remove('hidden')
}

async function deleteMission(missionId) {
  if (!confirm('Confirmer la suppression de cette mission ?')) return
  try {
    await axios.delete(`/api/missions/${missionId}`)
    await loadMissions()
    alert('Mission supprimée')
  } catch (error) {
    alert('Erreur suppression: ' + error.message)
  }
}

// MODALS - COMPAGNIES
function showNewCompagnieModal() {
  document.getElementById('form-compagnie').reset()
  document.getElementById('modal-compagnie').classList.remove('hidden')
}

function editCompagnie(compagnieId) {
  const compagnie = allCompagnies.find(c => c.id === compagnieId)
  if (!compagnie) return
  
  document.getElementById('compagnie-nom').value = compagnie.nom
  document.getElementById('compagnie-code').value = compagnie.code
  document.getElementById('compagnie-adresse').value = compagnie.adresse
  document.getElementById('compagnie-telephone').value = compagnie.telephone
  document.getElementById('compagnie-email').value = compagnie.email || ''
  document.getElementById('compagnie-commandant').value = compagnie.commandant
  
  document.getElementById('modal-compagnie').classList.remove('hidden')
}

async function deleteCompagnie(compagnieId) {
  if (!confirm('Confirmer la suppression ? Toutes les brigades rattachées seront affectées.')) return
  try {
    await axios.delete(`/api/compagnies/${compagnieId}`)
    await loadBrigades()
    alert('Compagnie supprimée')
  } catch (error) {
    alert('Erreur: ' + error.message)
  }
}

// MODALS - BRIGADES
function showNewBrigadeModal() {
  document.getElementById('form-brigade').reset()
  const compagnieSelect = document.getElementById('brigade-compagnie-id')
  compagnieSelect.innerHTML = '<option value="">-- Sélectionnez une compagnie --</option>' +
    allCompagnies.map(c => `<option value="${c.id}">${c.nom} (${c.code})</option>`).join('')
  document.getElementById('modal-brigade').classList.remove('hidden')
}

function editBrigade(brigadeId) {
  const brigade = allBrigades.find(b => b.id === brigadeId)
  if (!brigade) return
  
  const compagnieSelect = document.getElementById('brigade-compagnie-id')
  compagnieSelect.innerHTML = '<option value="">-- Sélectionnez une compagnie --</option>' +
    allCompagnies.map(c => `<option value="${c.id}">${c.nom} (${c.code})</option>`).join('')
  
  document.getElementById('brigade-compagnie-id').value = brigade.compagnie_id
  document.getElementById('brigade-nom').value = brigade.nom
  document.getElementById('brigade-code').value = brigade.code
  document.getElementById('brigade-adresse').value = brigade.adresse
  document.getElementById('brigade-telephone').value = brigade.telephone
  document.getElementById('brigade-email').value = brigade.email || ''
  document.getElementById('brigade-effectifs').value = brigade.effectifs
  document.getElementById('brigade-chef').value = brigade.chef_brigade
  
  document.getElementById('modal-brigade').classList.remove('hidden')
}

async function deleteBrigade(brigadeId) {
  if (!confirm('Confirmer la suppression de cette brigade ?')) return
  try {
    await axios.delete(`/api/brigades/${brigadeId}`)
    await loadBrigades()
    alert('Brigade supprimée')
  } catch (error) {
    alert('Erreur: ' + error.message)
  }
}

// MODALS - GENDARMES
function showNewGendarmeModal() {
  document.getElementById('form-gendarme').reset()
  document.getElementById('modal-gendarme').classList.remove('hidden')
}

function editGendarme(gendarmeId) {
  const gendarme = allGendarmes.find(g => g.id === gendarmeId)
  if (!gendarme) return
  
  document.getElementById('gendarme-matricule').value = gendarme.matricule
  document.getElementById('gendarme-nom').value = gendarme.nom
  document.getElementById('gendarme-prenom').value = gendarme.prenom
  document.getElementById('gendarme-grade').value = gendarme.grade
  document.getElementById('gendarme-specialite').value = gendarme.specialite
  document.getElementById('gendarme-telephone').value = gendarme.telephone
  document.getElementById('gendarme-email').value = gendarme.email || ''
  
  document.getElementById('modal-gendarme').classList.remove('hidden')
}

// VIEW ASSIGNATIONS
async function viewAssignations(missionId) {
  try {
    const [missionRes, assignationsRes] = await Promise.all([
      axios.get(`/api/missions/${missionId}`),
      axios.get(`/api/assignations/mission/${missionId}`)
    ])
    
    const mission = missionRes.data
    const assignations = assignationsRes.data
    
    document.getElementById('assignations-mission-title').textContent = mission.titre
    document.getElementById('assignations-mission-effectifs').textContent = 
      `${mission.effectifs_assignes}/${mission.effectifs_requis} effectifs`
    
    const container = document.getElementById('assignations-list')
    container.innerHTML = assignations.map(a => {
      const statusClass = a.statut === 'valide' ? 'border-green-500 bg-green-50' :
                          a.statut === 'en_attente' ? 'border-yellow-500 bg-yellow-50' :
                          'border-gray-300 bg-gray-50'
      const statusLabel = a.statut === 'valide' ? 'Validé' :
                          a.statut === 'en_attente' ? 'En attente' : 'Libre'
      const statusColor = a.statut === 'valide' ? 'text-green-700' :
                          a.statut === 'en_attente' ? 'text-yellow-700' : 'text-gray-500'
      
      return `
        <div class="border-l-4 ${statusClass} p-4 rounded">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              ${a.gendarme_nom ? `
                <div class="font-medium text-gray-900">${a.gendarme_prenom} ${a.gendarme_nom}</div>
                <div class="text-sm text-gray-600">${a.gendarme_grade} - ${a.gendarme_matricule}</div>
              ` : `
                <div class="text-gray-500 italic">Place disponible</div>
              `}
              <div class="mt-2">
                <span class="px-2 py-1 text-xs rounded ${statusColor}">${statusLabel}</span>
              </div>
            </div>
            <div class="flex gap-2">
              ${a.statut === 'libre' ? `
                <select id="gendarme-select-${a.id}" class="text-sm border rounded px-2 py-1">
                  <option value="">Choisir...</option>
                  ${allGendarmes.map(g => `<option value="${g.id}">${g.prenom} ${g.nom} (${g.matricule})</option>`).join('')}
                </select>
                <button onclick="confirmAssign(${a.id}, ${missionId})" class="text-blue-600 hover:text-blue-800">
                  <i class="fas fa-check"></i>
                </button>
              ` : ''}
              ${a.statut === 'en_attente' ? `
                <button onclick="validateAssignation(${a.id}, ${a.gendarme_id}, ${missionId})" class="text-green-600 hover:text-green-800" title="Valider">
                  <i class="fas fa-check-circle"></i>
                </button>
                <button onclick="rejectAssignation(${a.id}, ${missionId})" class="text-red-600 hover:text-red-800" title="Rejeter">
                  <i class="fas fa-times-circle"></i>
                </button>
              ` : ''}
              ${a.statut === 'valide' ? `
                <button onclick="liberateAssignation(${a.id}, ${missionId})" class="text-orange-600 hover:text-orange-800" title="Libérer">
                  <i class="fas fa-unlock"></i>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `
    }).join('')
    
    document.getElementById('modal-assignations').classList.remove('hidden')
  } catch (error) {
    alert('Erreur: ' + error.message)
  }
}

// SEARCH FUNCTIONS
function searchGendarme() {
  const searchTerm = document.getElementById('search-gendarme').value.toLowerCase()
  if (!searchTerm) {
    filteredGendarmes = allGendarmes
  } else {
    filteredGendarmes = allGendarmes.filter(g => 
      g.matricule.toLowerCase().includes(searchTerm) ||
      g.nom.toLowerCase().includes(searchTerm) ||
      g.prenom.toLowerCase().includes(searchTerm) ||
      g.grade.toLowerCase().includes(searchTerm) ||
      g.specialite.toLowerCase().includes(searchTerm) ||
      (g.telephone && g.telephone.includes(searchTerm)) ||
      (g.email && g.email.toLowerCase().includes(searchTerm))
    )
  }
  renderAdminGendarmes(filteredGendarmes)
}

// TAB SWITCHING
function switchTab(tabName) {
  currentTab = tabName
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('border-blue-500', 'text-blue-600'))
  document.getElementById(`tab-${tabName}`).classList.add('border-blue-500', 'text-blue-600')
  
  document.querySelectorAll('[id^="content-"]').forEach(el => el.classList.add('hidden'))
  document.getElementById(`content-${tabName}`).classList.remove('hidden')
  
  if (tabName === 'missions') {
    loadMissions()
  } else if (tabName === 'gendarmes') {
    loadGendarmes()
  } else if (tabName === 'lieux') {
    loadBrigades()
  }
}

// INIT
document.addEventListener('DOMContentLoaded', async function() {
  const authenticated = await checkAuth()
  if (!authenticated) return
  
  loadLogo()
  loadMissions()
  
  // Inject modals into page
  injectModals()
  
  // Logout
  document.getElementById('logout-btn').addEventListener('click', logout)
  
  // Close modals
  document.getElementById('close-modal-mission').addEventListener('click', () => {
    document.getElementById('modal-mission').classList.add('hidden')
  })
  document.getElementById('close-modal-compagnie').addEventListener('click', () => {
    document.getElementById('modal-compagnie').classList.add('hidden')
  })
  document.getElementById('close-modal-brigade').addEventListener('click', () => {
    document.getElementById('modal-brigade').classList.add('hidden')
  })
  document.getElementById('close-modal-gendarme').addEventListener('click', () => {
    document.getElementById('modal-gendarme').classList.add('hidden')
  })
  document.getElementById('close-modal-assignations').addEventListener('click', () => {
    document.getElementById('modal-assignations').classList.add('hidden')
  })
  
  // FORM - MISSION
  document.getElementById('form-mission').addEventListener('submit', async function(e) {
    e.preventDefault()
    const data = {
      numero_mission: document.getElementById('mission-numero').value,
      titre: document.getElementById('mission-titre').value,
      description: document.getElementById('mission-description').value,
      brigade_id: parseInt(document.getElementById('mission-brigade-id').value),
      date_debut: document.getElementById('mission-date-debut').value,
      date_fin: document.getElementById('mission-date-fin').value,
      effectifs_requis: parseInt(document.getElementById('mission-effectifs').value),
      competences_requises: document.getElementById('mission-competences').value,
      priorite: document.getElementById('mission-priorite').value
    }
    
    try {
      if (editingMissionId) {
        await axios.put(`/api/missions/${editingMissionId}`, data)
        alert('Mission modifiée avec succès')
      } else {
        await axios.post('/api/missions', data)
        alert('Mission créée avec succès')
      }
      document.getElementById('modal-mission').classList.add('hidden')
      await loadMissions()
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  })
  
  // FORM - COMPAGNIE
  document.getElementById('form-compagnie').addEventListener('submit', async function(e) {
    e.preventDefault()
    const data = {
      nom: document.getElementById('compagnie-nom').value,
      code: document.getElementById('compagnie-code').value,
      adresse: document.getElementById('compagnie-adresse').value,
      telephone: document.getElementById('compagnie-telephone').value,
      email: document.getElementById('compagnie-email').value || null,
      commandant: document.getElementById('compagnie-commandant').value
    }
    
    try {
      await axios.post('/api/compagnies', data)
      document.getElementById('modal-compagnie').classList.add('hidden')
      await loadBrigades()
      alert('Compagnie créée')
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  })
  
  // FORM - BRIGADE
  document.getElementById('form-brigade').addEventListener('submit', async function(e) {
    e.preventDefault()
    const data = {
      compagnie_id: parseInt(document.getElementById('brigade-compagnie-id').value),
      nom: document.getElementById('brigade-nom').value,
      code: document.getElementById('brigade-code').value,
      adresse: document.getElementById('brigade-adresse').value,
      telephone: document.getElementById('brigade-telephone').value,
      email: document.getElementById('brigade-email').value || null,
      effectifs: parseInt(document.getElementById('brigade-effectifs').value),
      chef_brigade: document.getElementById('brigade-chef').value
    }
    
    try {
      await axios.post('/api/brigades', data)
      document.getElementById('modal-brigade').classList.add('hidden')
      await loadBrigades()
      alert('Brigade créée')
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  })
  
  // FORM - GENDARME
  document.getElementById('form-gendarme').addEventListener('submit', async function(e) {
    e.preventDefault()
    const data = {
      matricule: document.getElementById('gendarme-matricule').value,
      nom: document.getElementById('gendarme-nom').value,
      prenom: document.getElementById('gendarme-prenom').value,
      grade: document.getElementById('gendarme-grade').value,
      specialite: document.getElementById('gendarme-specialite').value,
      telephone: document.getElementById('gendarme-telephone').value,
      email: document.getElementById('gendarme-email').value || null
    }
    
    try {
      await axios.post('/api/gendarmes', data)
      document.getElementById('modal-gendarme').classList.add('hidden')
      await loadGendarmes()
      alert('Gendarme ajouté')
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  })
  
  // FORM - LOGO
  document.getElementById('form-logo').addEventListener('submit', async function(e) {
    e.preventDefault()
    const logoUrl = document.getElementById('logo-url').value
    
    try {
      await axios.put('/api/config/logo_url', { value: logoUrl })
      document.getElementById('nav-logo').src = logoUrl
      alert('Logo mis à jour')
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  })
  
  // SEARCH
  document.getElementById('search-gendarme').addEventListener('input', searchGendarme)
})

// ASSIGNATIONS
async function rejectAssignation(assignationId, missionId) {
  try {
    await axios.put(`/api/assignations/${assignationId}`, { statut: 'en_attente', gendarme_id: null })
    document.getElementById('modal-assignations').classList.add('hidden')
    await viewAssignations(missionId)
    await loadMissions()
  } catch (error) {
    alert('Erreur: ' + error.message)
  }
}

async function confirmAssign(assignationId, missionId) {
  const selectEl = document.getElementById(`gendarme-select-${assignationId}`)
  const gendarmeId = selectEl.value
  if (!gendarmeId) {
    alert('Veuillez sélectionner un gendarme')
    return
  }
  
  try {
    await axios.put(`/api/assignations/${assignationId}`, { 
      gendarme_id: parseInt(gendarmeId), 
      statut: 'en_attente' 
    })
    await viewAssignations(missionId)
    await loadMissions()
  } catch (error) {
    alert('Erreur: ' + error.message)
  }
}

async function validateAssignation(assignationId, gendarmeId, missionId) {
  if (!confirm('Valider cette affectation ?')) return
  try {
    await axios.put(`/api/assignations/${assignationId}`, { statut: 'valide' })
    await viewAssignations(missionId)
    await loadMissions()
  } catch (error) {
    alert('Erreur: ' + error.message)
  }
}

async function liberateAssignation(assignationId, missionId) {
  if (!confirm('Libérer cette place ?')) return
  try {
    await axios.put(`/api/assignations/${assignationId}`, { statut: 'libre', gendarme_id: null })
    await viewAssignations(missionId)
    await loadMissions()
  } catch (error) {
    alert('Erreur: ' + error.message)
  }
}

// INJECT MODALS
function injectModals() {
  const modalsContainer = document.getElementById('modals-container')
  modalsContainer.innerHTML = `
    <!-- Modal Mission -->
    <div id="modal-mission" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold" id="modal-mission-title">Nouvelle mission</h2>
          <button id="close-modal-mission" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        <form id="form-mission">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2">Numéro de mission *</label>
              <input type="text" id="mission-numero" required placeholder="M2026-XXX"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2">Titre *</label>
              <input type="text" id="mission-titre" required placeholder="Ex: Sécurisation événement"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2">Description</label>
              <textarea id="mission-description" rows="3" placeholder="Description détaillée..."
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2">Brigade *</label>
              <select id="mission-brigade-id" required
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">-- Sélectionnez une brigade --</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Date de début *</label>
              <input type="datetime-local" id="mission-date-debut" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Date de fin *</label>
              <input type="datetime-local" id="mission-date-fin" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Effectifs requis *</label>
              <input type="number" id="mission-effectifs" required min="1" value="1"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Priorité</label>
              <select id="mission-priorite"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="normale">Normale</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2">Compétences requises</label>
              <input type="text" id="mission-competences" placeholder="Ex: Maintien de l'ordre, Premiers secours"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" onclick="document.getElementById('modal-mission').classList.add('hidden')"
                    class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <i class="fas fa-save mr-2"></i>Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Compagnie -->
    <div id="modal-compagnie" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">Nouvelle compagnie</h2>
          <button id="close-modal-compagnie" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        <form id="form-compagnie">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Nom *</label>
              <input type="text" id="compagnie-nom" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Code *</label>
              <input type="text" id="compagnie-code" required placeholder="CGP"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2">Adresse *</label>
              <input type="text" id="compagnie-adresse" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Téléphone *</label>
              <input type="tel" id="compagnie-telephone" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Email</label>
              <input type="email" id="compagnie-email"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2">Commandant *</label>
              <input type="text" id="compagnie-commandant" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" onclick="document.getElementById('modal-compagnie').classList.add('hidden')"
                    class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <i class="fas fa-save mr-2"></i>Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Brigade -->
    <div id="modal-brigade" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">Nouvelle brigade</h2>
          <button id="close-modal-brigade" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        <form id="form-brigade">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2">Compagnie *</label>
              <select id="brigade-compagnie-id" required
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">-- Sélectionnez une compagnie --</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Nom *</label>
              <input type="text" id="brigade-nom" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Code *</label>
              <input type="text" id="brigade-code" required placeholder="BPC"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2">Adresse *</label>
              <input type="text" id="brigade-adresse" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Téléphone *</label>
              <input type="tel" id="brigade-telephone" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Email</label>
              <input type="email" id="brigade-email"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Effectifs *</label>
              <input type="number" id="brigade-effectifs" required min="1" value="20"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Chef de brigade *</label>
              <input type="text" id="brigade-chef" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" onclick="document.getElementById('modal-brigade').classList.add('hidden')"
                    class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <i class="fas fa-save mr-2"></i>Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Gendarme -->
    <div id="modal-gendarme" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">Nouveau gendarme</h2>
          <button id="close-modal-gendarme" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        <form id="form-gendarme">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Matricule *</label>
              <input type="text" id="gendarme-matricule" required placeholder="GR001"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Grade *</label>
              <input type="text" id="gendarme-grade" required placeholder="Gendarme"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Nom *</label>
              <input type="text" id="gendarme-nom" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Prénom *</label>
              <input type="text" id="gendarme-prenom" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2">Spécialité</label>
              <input type="text" id="gendarme-specialite" placeholder="Ex: Maître-chien"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Téléphone</label>
              <input type="tel" id="gendarme-telephone"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Email</label>
              <input type="email" id="gendarme-email"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" onclick="document.getElementById('modal-gendarme').classList.add('hidden')"
                    class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <i class="fas fa-save mr-2"></i>Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Assignations -->
    <div id="modal-assignations" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-2xl font-bold" id="assignations-mission-title">Assignations</h2>
            <p class="text-sm text-gray-600" id="assignations-mission-effectifs"></p>
          </div>
          <button id="close-modal-assignations" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        <div id="assignations-list" class="space-y-3"></div>
      </div>
    </div>
  `
}
