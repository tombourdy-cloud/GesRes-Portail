console.log('🚀 admin.js chargé !')

dayjs.locale('fr')

let allMissions = [], allGendarmes = [], allBrigades = [], allCompagnies = []
let currentTab = 'missions', filteredMissions = [], editingMissionId = null
let editingCompagnieId = null, editingBrigadeId = null, editingGendarmeId = null
let selectedCompagnieId = null, selectedBrigadeId = null, selectedMonth = null, filteredGendarmes = []

// ==================== MENU MOBILE ADMIN ====================
function toggleMobileMenuAdmin() {
  const hamburger = document.getElementById('hamburger-menu-admin')
  const overlay = document.getElementById('mobile-nav-overlay-admin')
  const backdrop = document.getElementById('mobile-nav-backdrop-admin')
  
  hamburger.classList.toggle('active')
  overlay.classList.toggle('active')
  backdrop.classList.toggle('active')
  
  document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : 'auto'
}

function closeMobileMenuAdmin() {
  const hamburger = document.getElementById('hamburger-menu-admin')
  const overlay = document.getElementById('mobile-nav-overlay-admin')
  const backdrop = document.getElementById('mobile-nav-backdrop-admin')
  
  hamburger.classList.remove('active')
  overlay.classList.remove('active')
  backdrop.classList.remove('active')
  document.body.style.overflow = 'auto'
}

function navigateFromMobileAdmin(action) {
  closeMobileMenuAdmin()
  
  if (action === 'missions') {
    window.location.href = '/'
  } else if (action === 'admin') {
    // Reste sur la page admin
  }
}

// AUTH
async function checkAuth() {
  try {
    const response = await axios.get('/api/auth/me')
    if (response.data.authenticated) {
      const username = response.data.user.username
      document.getElementById('user-info').textContent = `Connecté: ${username}`
      
      // Mettre à jour également le menu mobile
      const mobileUserInfo = document.getElementById('mobile-user-info')
      if (mobileUserInfo) {
        mobileUserInfo.textContent = `Connecté: ${username}`
      }
      
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
    if (response.data.value) {
      document.getElementById('nav-logo').src = response.data.value
      
      // Mettre à jour le logo du menu mobile admin
      const mobileLogoAdmin = document.getElementById('mobile-logo-admin')
      if (mobileLogoAdmin) {
        mobileLogoAdmin.src = response.data.value
      }
      
      // Mettre à jour aussi l'aperçu dans les paramètres si la page est chargée
      const previewElement = document.getElementById('current-logo-preview')
      if (previewElement) {
        previewElement.src = response.data.value
      }
    }
  } catch (error) {
    console.error('Erreur chargement logo:', error)
  }
}

async function loadMissions() {
  try {
    // Charger en parallèle missions, brigades et compagnies pour optimiser
    const [missionsRes, brigadesRes, compagniesRes] = await Promise.all([
      axios.get('/api/missions'),
      axios.get('/api/brigades'),
      axios.get('/api/compagnies')
    ])
    
    allMissions = missionsRes.data
    allBrigades = brigadesRes.data
    allCompagnies = compagniesRes.data
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

// Charger toutes les données en une seule fois (optimisation)
async function loadAllData() {
  try {
    const [missionsRes, brigadesRes, compagniesRes, gendarmesRes] = await Promise.all([
      axios.get('/api/missions'),
      axios.get('/api/brigades'),
      axios.get('/api/compagnies'),
      axios.get('/api/gendarmes')
    ])
    
    allMissions = missionsRes.data
    allBrigades = brigadesRes.data
    allCompagnies = compagniesRes.data
    allGendarmes = gendarmesRes.data
    filteredMissions = allMissions
    filteredGendarmes = allGendarmes
  } catch (error) {
    console.error('Erreur chargement données:', error)
    throw error
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
      <div class="flex flex-wrap gap-3 mb-4">
        <button onclick="showNewMissionModal()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-2"></i>Nouvelle mission
        </button>
        <button onclick="showImportExcelModal()" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          <i class="fas fa-file-excel mr-2"></i>Importer depuis Excel
        </button>
      </div>
      <div class="flex items-center gap-2 mb-4">
        <button onclick="resetMissionView()" class="text-sm text-gray-600 hover:text-gray-900">
          <i class="fas fa-home mr-1"></i>Retour aux compagnies
        </button>
        ${selectedCompagnieId ? `<i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          <span class="text-sm font-medium text-gray-700">${allCompagnies.find(c => c.id === selectedCompagnieId)?.nom}</span>` : ''}
        ${selectedBrigadeId ? `<i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          <span class="text-sm font-medium text-gray-700">${allBrigades.find(b => b.id === selectedBrigadeId)?.nom}</span>` : ''}
        ${selectedMonth ? `<i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          <span class="text-sm font-medium text-gray-700">${dayjs(selectedMonth).format('MMMM YYYY')}</span>` : ''}
      </div>
    </div>
    
    ${!selectedCompagnieId ? renderCompagnieSelection(missionsByCompagnie) : ''}
    ${selectedCompagnieId && !selectedBrigadeId ? renderBrigadeSelection() : ''}
    ${selectedBrigadeId && !selectedMonth ? renderMonthSelection() : ''}
    ${selectedBrigadeId && selectedMonth ? renderMissionsByMonth() : ''}
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
               class="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all duration-200 card-hover">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h4 class="font-bold text-gray-900 text-lg">${c.nom}</h4>
                <span class="inline-block text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded mt-1">${c.code}</span>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold text-blue-600">${data.count}</div>
                <div class="text-xs text-gray-500">mission${data.count > 1 ? 's' : ''}</div>
              </div>
            </div>
            <div class="text-sm text-gray-600 space-y-1">
              <div><i class="fas fa-user-tie text-blue-400 w-4 mr-1"></i> ${c.commandant || 'N/A'}</div>
              <div><i class="fas fa-phone text-blue-400 w-4 mr-1"></i> ${c.telephone}</div>
              <div><i class="fas fa-map-marker-alt text-blue-400 w-4 mr-1"></i> ${c.adresse.substring(0, 40)}${c.adresse.length > 40 ? '...' : ''}</div>
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
             class="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 hover:shadow-lg cursor-pointer transition-all duration-200 card-hover">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="font-bold text-gray-900 text-lg">${b.nom}</h4>
              <span class="inline-block text-xs font-mono bg-green-50 text-green-700 px-2 py-1 rounded mt-1">${b.code}</span>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-green-600">${missionsByBrigade[b.id]}</div>
              <div class="text-xs text-gray-500">mission${missionsByBrigade[b.id] > 1 ? 's' : ''}</div>
            </div>
          </div>
          <div class="text-sm text-gray-600 space-y-1">
            <div><i class="fas fa-phone text-green-400 w-4 mr-1"></i> ${b.telephone}</div>
            <div><i class="fas fa-map-marker-alt text-green-400 w-4 mr-1"></i> ${b.adresse.substring(0, 40)}${b.adresse.length > 40 ? '...' : ''}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `
}

function renderMonthSelection() {
  const brigade = allBrigades.find(b => b.id === selectedBrigadeId)
  const missions = allMissions.filter(m => m.brigade_id === selectedBrigadeId)
  
  // Grouper les missions par mois
  const missionsByMonth = {}
  missions.forEach(m => {
    const monthKey = dayjs(m.date_debut).format('YYYY-MM')
    if (!missionsByMonth[monthKey]) {
      missionsByMonth[monthKey] = {
        monthKey: monthKey,
        displayName: dayjs(m.date_debut).format('MMMM YYYY'),
        missions: []
      }
    }
    missionsByMonth[monthKey].missions.push(m)
  })
  
  // Trier les mois par ordre chronologique
  const sortedMonths = Object.values(missionsByMonth).sort((a, b) => 
    a.monthKey.localeCompare(b.monthKey)
  )
  
  if (sortedMonths.length === 0) {
    return `
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <i class="fas fa-info-circle text-yellow-600 text-2xl mb-2"></i>
        <p class="text-gray-700">Aucune mission planifiée pour la brigade <strong>${brigade.nom}</strong></p>
      </div>
    `
  }
  
  return `
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        <i class="fas fa-calendar-alt mr-2"></i>Sélectionnez un mois - Brigade ${brigade.nom}
      </h3>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      ${sortedMonths.map(month => `
        <div onclick="selectMonth('${month.monthKey}')" 
             class="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-purple-500 hover:shadow-lg cursor-pointer transition-all duration-200 card-hover">
          <div class="flex items-start justify-between mb-3">
            <div>
              <div class="text-sm text-gray-500 uppercase">
                <i class="fas fa-calendar mr-1"></i>${dayjs(month.monthKey).format('MMMM')}
              </div>
              <h4 class="font-bold text-gray-900 text-2xl mt-1">${dayjs(month.monthKey).format('YYYY')}</h4>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-purple-600">${month.missions.length}</div>
              <div class="text-xs text-gray-500">mission${month.missions.length > 1 ? 's' : ''}</div>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-100">
            <div class="text-sm text-gray-600 space-y-1">
              <div><i class="fas fa-clock text-purple-400 w-4 mr-1"></i> 
                ${month.missions.filter(m => m.priorite === 'haute').length} haute priorité
              </div>
              <div><i class="fas fa-users text-purple-400 w-4 mr-1"></i> 
                ${month.missions.reduce((sum, m) => sum + m.effectifs_requis, 0)} effectifs requis
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `
}

function renderMissionsByMonth() {
  const brigade = allBrigades.find(b => b.id === selectedBrigadeId)
  const missions = allMissions.filter(m => {
    const missionMonth = dayjs(m.date_debut).format('YYYY-MM')
    return m.brigade_id === selectedBrigadeId && missionMonth === selectedMonth
  })
  
  // Trier les missions par date de début
  missions.sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))
  
  if (missions.length === 0) {
    return `
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <i class="fas fa-info-circle text-yellow-600 text-2xl mb-2"></i>
        <p class="text-gray-700">Aucune mission en <strong>${dayjs(selectedMonth).format('MMMM YYYY')}</strong> pour la brigade <strong>${brigade.nom}</strong></p>
      </div>
    `
  }
  
  return `
    <div class="mb-4 flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-800">
        <i class="fas fa-tasks mr-2"></i>Missions de ${brigade.nom} - ${dayjs(selectedMonth).format('MMMM YYYY')} (${missions.length})
      </h3>
      <button onclick="exportMonthMissionsPDF(${selectedBrigadeId}, '${selectedMonth}')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        <i class="fas fa-file-pdf mr-2"></i>Exporter le mois
      </button>
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
                <td class="px-4 py-3 text-sm">
                  <div>${dayjs(m.date_debut).format('DD/MM/YYYY')}</div>
                  ${m.date_fin ? `<div class="text-xs text-gray-500">au ${dayjs(m.date_fin).format('DD/MM/YYYY')}</div>` : ''}
                </td>
                <td class="px-4 py-3 text-sm font-medium">
                  <span class="${m.effectifs_assignes >= m.effectifs_requis ? 'text-green-600' : 'text-orange-600'}">
                    ${m.effectifs_assignes}/${m.effectifs_requis}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 text-xs rounded-full ${prioriteClass}">${prioriteLabel}</span>
                </td>
                <td class="px-4 py-3 text-sm space-x-2">
                  <button onclick="viewAssignations(${m.id})" class="text-blue-600 hover:text-blue-800" title="Voir les assignations">
                    <i class="fas fa-users"></i>
                  </button>
                  <button onclick="exportMissionPDF(${m.id})" class="text-green-600 hover:text-green-800" title="Exporter en PDF">
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  <button onclick="editMission(${m.id})" class="text-indigo-600 hover:text-indigo-800" title="Éditer">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteMission(${m.id})" class="text-red-600 hover:text-red-800" title="Supprimer">
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
    <div class="mb-4 flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-800">
        <i class="fas fa-tasks mr-2"></i>Missions de ${brigade.nom} (${missions.length})
      </h3>
      <button onclick="exportBrigadeMissionsPDF(${selectedBrigadeId})" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        <i class="fas fa-file-pdf mr-2"></i>Exporter toutes les missions
      </button>
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
                  <button onclick="viewAssignations(${m.id})" class="text-blue-600 hover:text-blue-800" title="Voir les assignations">
                    <i class="fas fa-users"></i>
                  </button>
                  <button onclick="exportMissionPDF(${m.id})" class="text-green-600 hover:text-green-800" title="Exporter en PDF">
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  <button onclick="editMission(${m.id})" class="text-indigo-600 hover:text-indigo-800" title="Éditer">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteMission(${m.id})" class="text-red-600 hover:text-red-800" title="Supprimer">
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
  selectedMonth = null
  renderCompagnieCards()
}

function selectBrigade(brigadeId) {
  selectedBrigadeId = brigadeId
  selectedMonth = null
  renderCompagnieCards()
}

function selectMonth(monthKey) {
  selectedMonth = monthKey
  renderCompagnieCards()
}

function resetMissionView() {
  selectedCompagnieId = null
  selectedBrigadeId = null
  selectedMonth = null
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
                <button onclick="editGendarme(${g.id})" class="text-indigo-600 hover:text-indigo-800 mr-3">
                  <i class="fas fa-edit"></i> Modifier
                </button>
                <button onclick="deleteGendarme(${g.id})" class="text-red-600 hover:text-red-800">
                  <i class="fas fa-trash"></i> Supprimer
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
            <i class="fas fa-plus mr-2"></i>Ajouter
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
            <i class="fas fa-plus mr-2"></i>Ajouter
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
                    <div><i class="fas fa-phone text-gray-400 w-4"></i> ${b.telephone}</div>
                    <div><i class="fas fa-map-marker-alt text-gray-400 w-4"></i> ${b.adresse.substring(0, 40)}...</div>
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
  
  // Séparer date et heure pour les champs
  document.getElementById('mission-date-debut').value = dayjs(mission.date_debut).format('YYYY-MM-DD')
  document.getElementById('mission-heure-debut').value = dayjs(mission.date_debut).format('HH:mm')
  document.getElementById('mission-date-fin').value = dayjs(mission.date_fin).format('YYYY-MM-DD')
  document.getElementById('mission-heure-fin').value = dayjs(mission.date_fin).format('HH:mm')
  
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
    // Recharger seulement les missions
    const response = await axios.get('/api/missions')
    allMissions = response.data
    renderCompagnieCards()
    alert('Mission supprimée')
  } catch (error) {
    alert('Erreur suppression: ' + error.message)
  }
}

// MODALS - COMPAGNIES
function showNewCompagnieModal() {
  editingCompagnieId = null
  document.getElementById('form-compagnie').reset()
  document.getElementById('modal-compagnie').classList.remove('hidden')
}

function editCompagnie(compagnieId) {
  editingCompagnieId = compagnieId
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
  editingBrigadeId = null
  document.getElementById('form-brigade').reset()
  const compagnieSelect = document.getElementById('brigade-compagnie-id')
  compagnieSelect.innerHTML = '<option value="">-- Sélectionnez une compagnie --</option>' +
    allCompagnies.map(c => `<option value="${c.id}">${c.nom} (${c.code})</option>`).join('')
  document.getElementById('modal-brigade').classList.remove('hidden')
}

function editBrigade(brigadeId) {
  editingBrigadeId = brigadeId
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
  editingGendarmeId = null
  document.getElementById('form-gendarme').reset()
  document.getElementById('modal-gendarme').classList.remove('hidden')
}

function editGendarme(gendarmeId) {
  editingGendarmeId = gendarmeId
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

async function deleteGendarme(gendarmeId) {
  const gendarme = allGendarmes.find(g => g.id === gendarmeId)
  if (!gendarme) return
  
  if (!confirm(`Voulez-vous vraiment supprimer le gendarme ${gendarme.prenom} ${gendarme.nom} (${gendarme.matricule}) ?`)) {
    return
  }
  
  try {
    await axios.delete(`/api/gendarmes/${gendarmeId}`)
    // Recharger les gendarmes
    const response = await axios.get('/api/gendarmes')
    allGendarmes = response.data
    filteredGendarmes = allGendarmes
    renderAdminGendarmes(filteredGendarmes)
    alert('Gendarme supprimé avec succès')
  } catch (error) {
    console.error('Erreur suppression gendarme:', error)
    alert('Erreur: ' + (error.response?.data?.error || error.message))
  }
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
            <div class="flex gap-2 items-center">
              ${a.statut === 'libre' ? `
                <select id="gendarme-select-${a.id}" class="text-sm border rounded px-2 py-1">
                  <option value="">Choisir un gendarme...</option>
                  ${allGendarmes.map(g => `<option value="${g.id}">${g.prenom} ${g.nom} (${g.matricule})</option>`).join('')}
                </select>
                <button onclick="confirmAssign(${a.id}, ${missionId})" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm" title="Assigner">
                  <i class="fas fa-check"></i> Assigner
                </button>
              ` : ''}
              ${a.statut === 'en_attente' ? `
                <button onclick="modifyAssignation(${a.id}, ${missionId})" class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm" title="Modifier le gendarme">
                  <i class="fas fa-edit"></i> Modifier
                </button>
                <button onclick="validateAssignation(${a.id}, ${a.gendarme_id}, ${missionId})" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm" title="Valider">
                  <i class="fas fa-check-circle"></i> Valider
                </button>
                <button onclick="rejectAssignation(${a.id}, ${missionId})" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm" title="Rejeter">
                  <i class="fas fa-times-circle"></i> Rejeter
                </button>
              ` : ''}
              ${a.statut === 'valide' ? `
                <button onclick="modifyAssignation(${a.id}, ${missionId})" class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm" title="Changer le gendarme">
                  <i class="fas fa-edit"></i> Modifier
                </button>
                <button onclick="liberateAssignation(${a.id}, ${missionId})" class="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm" title="Libérer">
                  <i class="fas fa-unlock"></i> Libérer
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
  console.log('🔍 searchGendarme appelée')
  const searchInput = document.getElementById('search-gendarme')
  if (!searchInput) {
    console.error('❌ search-gendarme introuvable dans searchGendarme')
    return
  }
  
  const searchTerm = searchInput.value.toLowerCase()
  console.log('🔍 Terme de recherche:', searchTerm)
  console.log('📊 Total gendarmes:', allGendarmes.length)
  
  if (!searchTerm) {
    filteredGendarmes = allGendarmes
  } else {
    filteredGendarmes = allGendarmes.filter(g => 
      g.matricule.toLowerCase().includes(searchTerm) ||
      g.nom.toLowerCase().includes(searchTerm) ||
      g.prenom.toLowerCase().includes(searchTerm) ||
      g.grade.toLowerCase().includes(searchTerm) ||
      (g.specialite && g.specialite.toLowerCase().includes(searchTerm)) ||
      (g.telephone && g.telephone.includes(searchTerm)) ||
      (g.email && g.email.toLowerCase().includes(searchTerm))
    )
  }
  
  console.log('✅ Gendarmes filtrés:', filteredGendarmes.length)
  renderAdminGendarmes(filteredGendarmes)
}

// TAB SWITCHING
function switchTab(tabName) {
  currentTab = tabName
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('border-blue-500', 'text-blue-600'))
  document.getElementById(`tab-${tabName}`).classList.add('border-blue-500', 'text-blue-600')
  
  document.querySelectorAll('[id^="content-"]').forEach(el => el.classList.add('hidden'))
  document.getElementById(`content-${tabName}`).classList.remove('hidden')
  
  // Utiliser les données déjà chargées (pas de rechargement)
  if (tabName === 'missions') {
    renderCompagnieCards()
  } else if (tabName === 'gendarmes') {
    renderAdminGendarmes(filteredGendarmes)
  } else if (tabName === 'lieux') {
    renderAdminLieux()
  }
}

// INIT
document.addEventListener('DOMContentLoaded', async function() {
  console.log('📄 DOM chargé, initialisation...')
  
  const authenticated = await checkAuth()
  console.log('🔐 Authentification:', authenticated)
  if (!authenticated) return
  
  // Précharger toutes les données en parallèle pour optimiser
  await Promise.all([
    loadLogo(),
    loadAllData()
  ])
  
  // Afficher l'onglet missions par défaut
  renderCompagnieCards()
  
  // Inject modals into page (AVANT les event listeners)
  injectModals()
  
  // Close modals (APRÈS injection)
  document.getElementById('close-modal-mission').addEventListener('click', () => {
    document.getElementById('modal-mission').classList.add('hidden')
  })
  document.getElementById('close-modal-compagnie').addEventListener('click', () => {
    document.getElementById('modal-compagnie').classList.add('hidden')
  })
  document.getElementById('close-modal-brigade').addEventListener('click', () => {
    document.getElementById('modal-brigade').classList.add('hidden')
  })
  
  // Attacher l'événement pour l'import Excel (APRÈS injection des modales)
  const importFileInput = document.getElementById('import-excel-file')
  if (importFileInput) {
    importFileInput.addEventListener('change', handleImportExcelFileSelect)
  }
  const importCloseBtn = document.getElementById('close-modal-import-excel')
  if (importCloseBtn) {
    importCloseBtn.addEventListener('click', closeImportExcelModal)
  }
  document.getElementById('close-modal-gendarme').addEventListener('click', () => {
    document.getElementById('modal-gendarme').classList.add('hidden')
  })
  document.getElementById('close-modal-assignations').addEventListener('click', () => {
    document.getElementById('modal-assignations').classList.add('hidden')
  })
  
  // Fermer les modals en cliquant sur le fond
  document.getElementById('modal-assignations').addEventListener('click', (e) => {
    if (e.target.id === 'modal-assignations') {
      document.getElementById('modal-assignations').classList.add('hidden')
    }
  })
  
  // FORM - MISSION
  document.getElementById('form-mission').addEventListener('submit', async function(e) {
    e.preventDefault()
    console.log('📝 Formulaire mission soumis')
    
    // Combiner date + heure
    const dateDebut = document.getElementById('mission-date-debut').value
    const heureDebut = document.getElementById('mission-heure-debut').value
    const dateFin = document.getElementById('mission-date-fin').value
    const heureFin = document.getElementById('mission-heure-fin').value
    
    const data = {
      numero_mission: document.getElementById('mission-numero').value,
      titre: document.getElementById('mission-titre').value,
      description: document.getElementById('mission-description').value,
      brigade_id: parseInt(document.getElementById('mission-brigade-id').value),
      date_debut: `${dateDebut} ${heureDebut}:00`,
      date_fin: `${dateFin} ${heureFin}:00`,
      effectifs_requis: parseInt(document.getElementById('mission-effectifs').value),
      competences_requises: document.getElementById('mission-competences').value,
      priorite: document.getElementById('mission-priorite').value
    }
    
    console.log('📦 Données mission:', data)
    
    try {
      if (editingMissionId) {
        console.log('✏️ Modification mission ID:', editingMissionId)
        await axios.put(`/api/missions/${editingMissionId}`, data)
        alert('Mission modifiée avec succès')
      } else {
        console.log('🚀 Création nouvelle mission...')
        const response = await axios.post('/api/missions', data)
        console.log('✅ Réponse:', response.data)
        alert('Mission créée avec succès')
      }
      document.getElementById('modal-mission').classList.add('hidden')
      // Recharger seulement les missions
      const response = await axios.get('/api/missions')
      allMissions = response.data
      renderCompagnieCards()
      
      // Si on est en mode import Excel, afficher la mission suivante
      if (importedMissions.length > 0 && currentImportIndex < importedMissions.length) {
        setTimeout(() => {
          showNextImportedMission()
        }, 500)  // Petit délai pour que l'utilisateur voie la confirmation
      } else if (importedMissions.length > 0 && currentImportIndex >= importedMissions.length) {
        // Fin de l'import
        alert(`✅ Import Excel terminé!\n\n${importedMissions.length} mission(s) créée(s) avec succès.`)
        importedMissions = []
        currentImportIndex = 0
      }
    } catch (error) {
      console.error('❌ Erreur création mission:', error)
      console.error('❌ Détails:', error.response?.data)
      alert('Erreur: ' + (error.response?.data?.error || error.message))
    }
  })
  
  // FORM - COMPAGNIE
  console.log('🔗 Attachement du listener pour form-compagnie')
  const formCompagnie = document.getElementById('form-compagnie')
  if (!formCompagnie) {
    console.error('❌ Élément form-compagnie introuvable !')
  } else {
    console.log('✅ Élément form-compagnie trouvé:', formCompagnie)
  }
  
  document.getElementById('form-compagnie').addEventListener('submit', async function(e) {
    e.preventDefault()
    console.log('📝 Formulaire compagnie soumis')
    
    const data = {
      nom: document.getElementById('compagnie-nom').value,
      code: document.getElementById('compagnie-code').value,
      adresse: document.getElementById('compagnie-adresse').value,
      telephone: document.getElementById('compagnie-telephone').value,
      email: document.getElementById('compagnie-email').value || null,
      commandant: document.getElementById('compagnie-commandant').value
    }
    
    console.log('📦 Données à envoyer:', data)
    
    try {
      if (editingCompagnieId) {
        console.log('✏️ Modification compagnie ID:', editingCompagnieId)
        await axios.put(`/api/compagnies/${editingCompagnieId}`, data)
        alert('Compagnie modifiée avec succès !')
      } else {
        console.log('🚀 Création nouvelle compagnie...')
        const response = await axios.post('/api/compagnies', data)
        console.log('✅ Réponse reçue:', response.data)
        alert('Compagnie créée avec succès !')
      }
      
      document.getElementById('modal-compagnie').classList.add('hidden')
      editingCompagnieId = null
      
      console.log('🔄 Rechargement des données...')
      // Recharger compagnies et brigades
      const [compagniesRes, brigadesRes] = await Promise.all([
        axios.get('/api/compagnies'),
        axios.get('/api/brigades')
      ])
      allCompagnies = compagniesRes.data
      allBrigades = brigadesRes.data
      console.log('📊 Données rechargées:', allCompagnies.length, 'compagnies')
      
      renderAdminLieux()
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error)
      alert('Erreur: ' + (error.response?.data?.error || error.message))
    }
  })
  
  // FORM - BRIGADE
  document.getElementById('form-brigade').addEventListener('submit', async function(e) {
    e.preventDefault()
    console.log('📝 Formulaire brigade soumis')
    
    const data = {
      compagnie_id: parseInt(document.getElementById('brigade-compagnie-id').value),
      nom: document.getElementById('brigade-nom').value,
      code: document.getElementById('brigade-code').value,
      adresse: document.getElementById('brigade-adresse').value,
      telephone: document.getElementById('brigade-telephone').value,
      email: document.getElementById('brigade-email').value || null
    }
    
    console.log('📦 Données:', data)
    console.log('🔑 Mode:', editingBrigadeId ? `Modification (ID: ${editingBrigadeId})` : 'Création')
    
    try {
      if (editingBrigadeId) {
        // Mode modification
        console.log('🔄 Envoi PUT /api/brigades/' + editingBrigadeId)
        const response = await axios.put(`/api/brigades/${editingBrigadeId}`, data)
        console.log('✅ Réponse:', response.data)
        alert('Brigade modifiée avec succès !')
        editingBrigadeId = null
      } else {
        // Mode création
        console.log('🚀 Envoi POST /api/brigades')
        const response = await axios.post('/api/brigades', data)
        console.log('✅ Réponse:', response.data)
        alert('Brigade créée avec succès !')
      }
      
      document.getElementById('modal-brigade').classList.add('hidden')
      // Recharger seulement les brigades
      const listResponse = await axios.get('/api/brigades')
      allBrigades = listResponse.data
      renderAdminLieux()
    } catch (error) {
      console.error('❌ Erreur:', error)
      console.error('❌ Détails:', error.response?.data)
      alert('Erreur: ' + (error.response?.data?.error || error.message))
    }
  })
  
  // FORM - GENDARME
  document.getElementById('form-gendarme').addEventListener('submit', async function(e) {
    e.preventDefault()
    console.log('📝 Formulaire gendarme soumis')
    
    const data = {
      matricule: document.getElementById('gendarme-matricule').value,
      nom: document.getElementById('gendarme-nom').value,
      prenom: document.getElementById('gendarme-prenom').value,
      grade: document.getElementById('gendarme-grade').value,
      specialite: document.getElementById('gendarme-specialite').value,
      telephone: document.getElementById('gendarme-telephone').value,
      email: document.getElementById('gendarme-email').value || null
    }
    
    console.log('📦 Données gendarme:', data)
    console.log('🔑 Mode:', editingGendarmeId ? `Modification (ID: ${editingGendarmeId})` : 'Création')
    
    try {
      if (editingGendarmeId) {
        // Mode modification
        console.log('🔄 Envoi PUT /api/gendarmes/' + editingGendarmeId)
        const response = await axios.put(`/api/gendarmes/${editingGendarmeId}`, data)
        console.log('✅ Réponse:', response.data)
        alert('Gendarme modifié avec succès !')
        editingGendarmeId = null
      } else {
        // Mode création
        console.log('🚀 Envoi POST /api/gendarmes')
        const response = await axios.post('/api/gendarmes', data)
        console.log('✅ Réponse:', response.data)
        alert('Gendarme ajouté avec succès !')
      }
      
      document.getElementById('modal-gendarme').classList.add('hidden')
      // Recharger seulement les gendarmes
      const listResponse = await axios.get('/api/gendarmes')
      allGendarmes = listResponse.data
      filteredGendarmes = allGendarmes
      renderAdminGendarmes(filteredGendarmes)
    } catch (error) {
      console.error('❌ Erreur:', error)
      console.error('❌ Détails:', error.response?.data)
      alert('Erreur: ' + (error.response?.data?.error || error.message))
    }
  })
  
  // FORM - LOGO - Aperçu fichier lors de la sélection
  const logoFileInput = document.getElementById('logo-file')
  logoFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0]
    if (!file) {
      document.getElementById('file-preview').classList.add('hidden')
      return
    }
    
    // Vérifier la taille (max 2 Mo)
    if (file.size > 2 * 1024 * 1024) {
      alert('L\'image est trop volumineuse. Taille maximale : 2 Mo')
      e.target.value = ''
      return
    }
    
    // Afficher l'aperçu
    const reader = new FileReader()
    reader.onload = function(event) {
      document.getElementById('file-preview-img').src = event.target.result
      document.getElementById('file-preview').classList.remove('hidden')
    }
    reader.readAsDataURL(file)
  })
  
  // FORM - LOGO - Soumission
  document.getElementById('form-logo').addEventListener('submit', async function(e) {
    e.preventDefault()
    
    const logoFile = document.getElementById('logo-file').files[0]
    const logoUrl = document.getElementById('logo-url').value
    
    try {
      let finalLogoUrl = ''
      
      // Priorité au fichier téléversé
      if (logoFile) {
        // Convertir le fichier en base64
        const reader = new FileReader()
        reader.onload = async function(event) {
          const base64Data = event.target.result
          
          try {
            await axios.put('/api/config/logo_url', { value: base64Data })
            document.getElementById('nav-logo').src = base64Data
            document.getElementById('current-logo-preview').src = base64Data
            alert('✅ Logo téléversé et enregistré avec succès !')
            
            // Réinitialiser le formulaire
            document.getElementById('logo-file').value = ''
            document.getElementById('logo-url').value = ''
            document.getElementById('file-preview').classList.add('hidden')
          } catch (error) {
            alert('❌ Erreur lors de l\'enregistrement : ' + error.message)
          }
        }
        reader.readAsDataURL(logoFile)
      } 
      // Sinon, utiliser l'URL
      else if (logoUrl) {
        await axios.put('/api/config/logo_url', { value: logoUrl })
        document.getElementById('nav-logo').src = logoUrl
        document.getElementById('current-logo-preview').src = logoUrl
        alert('✅ Logo mis à jour avec l\'URL fournie !')
        document.getElementById('logo-url').value = ''
      } 
      else {
        alert('⚠️ Veuillez sélectionner un fichier ou entrer une URL')
      }
    } catch (error) {
      alert('❌ Erreur : ' + error.message)
    }
  })
  
  // SEARCH
  const searchInput = document.getElementById('search-gendarme')
  if (searchInput) {
    searchInput.addEventListener('input', searchGendarme)
    console.log('✅ Événement recherche attaché')
  } else {
    console.error('❌ Élément search-gendarme introuvable')
  }
})

// FONCTION - Réinitialiser le logo
async function resetLogo() {
  if (!confirm('Voulez-vous vraiment réinitialiser le logo au logo par défaut ?')) {
    return
  }
  
  try {
    const defaultLogo = '/static/default-logo.png'
    await axios.put('/api/config/logo_url', { value: defaultLogo })
    document.getElementById('nav-logo').src = defaultLogo
    document.getElementById('current-logo-preview').src = defaultLogo
    document.getElementById('logo-file').value = ''
    document.getElementById('logo-url').value = ''
    document.getElementById('file-preview').classList.add('hidden')
    alert('✅ Logo réinitialisé au logo par défaut')
  } catch (error) {
    alert('❌ Erreur : ' + error.message)
  }
}

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
    // Recharger missions
    const response = await axios.get('/api/missions')
    allMissions = response.data
    renderCompagnieCards()
  } catch (error) {
    alert('Erreur: ' + error.message)
  }
}

async function validateAssignation(assignationId, gendarmeId, missionId) {
  if (!confirm('Valider cette affectation ?')) return
  
  console.log('✅ Validation assignation:', assignationId, 'gendarme:', gendarmeId, 'mission:', missionId)
  
  try {
    const response = await axios.put(`/api/assignations/${assignationId}`, { statut: 'valide' })
    console.log('✅ Réponse:', response.data)
    
    await viewAssignations(missionId)
    // Recharger missions
    const missionsResponse = await axios.get('/api/missions')
    allMissions = missionsResponse.data
    renderCompagnieCards()
    alert('Affectation validée avec succès')
  } catch (error) {
    console.error('❌ Erreur validation:', error)
    console.error('❌ Détails:', error.response?.data)
    alert('Erreur: ' + (error.response?.data?.error || error.message))
  }
}

async function liberateAssignation(assignationId, missionId) {
  if (!confirm('Libérer cette place ?')) return
  try {
    await axios.put(`/api/assignations/${assignationId}`, { statut: 'libre', gendarme_id: null })
    await viewAssignations(missionId)
    // Recharger missions
    const response = await axios.get('/api/missions')
    allMissions = response.data
    renderCompagnieCards()
  } catch (error) {
    alert('Erreur: ' + error.message)
  }
}

// Modifier l'affectation d'un gendarme sur une mission
async function modifyAssignation(assignationId, missionId) {
  try {
    // Récupérer l'assignation actuelle
    const assignationRes = await axios.get(`/api/assignations/mission/${missionId}`)
    const assignation = assignationRes.data.find(a => a.id === assignationId)
    
    if (!assignation) {
      alert('Assignation introuvable')
      return
    }
    
    // Créer un modal temporaire pour choisir un nouveau gendarme
    const modal = document.createElement('div')
    modal.id = 'modal-modify-assignation'
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]'
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Modifier l'affectation</h3>
          <button onclick="document.getElementById('modal-modify-assignation').remove()" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        <p class="mb-4 text-gray-600">Gendarme actuel : <strong>${assignation.gendarme_nom || 'Aucun'} ${assignation.gendarme_prenom || ''}</strong></p>
        <label class="block mb-2 font-semibold">Nouveau gendarme :</label>
        <select id="select-new-gendarme" class="w-full border p-2 rounded mb-4">
          <option value="">-- Choisir --</option>
          ${allGendarmes.map(g => `
            <option value="${g.id}" ${g.id === assignation.gendarme_id ? 'selected' : ''}>
              ${g.matricule} - ${g.nom} ${g.prenom} (${g.grade})
            </option>
          `).join('')}
        </select>
        <div class="flex gap-2">
          <button onclick="document.getElementById('modal-modify-assignation').remove()" class="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Annuler
          </button>
          <button onclick="confirmModifyAssignation(${assignationId}, ${missionId})" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <i class="fas fa-check"></i> Confirmer
          </button>
        </div>
      </div>
    `
    document.body.appendChild(modal)
  } catch (error) {
    alert('Erreur : ' + error.message)
  }
}

// Confirmer la modification d'affectation
async function confirmModifyAssignation(assignationId, missionId) {
  const newGendarmeId = parseInt(document.getElementById('select-new-gendarme').value)
  
  if (!newGendarmeId) {
    alert('Veuillez choisir un gendarme')
    return
  }
  
  try {
    // Mettre à jour l'assignation avec le nouveau gendarme (statut: en_attente)
    await axios.put(`/api/assignations/${assignationId}`, {
      gendarme_id: newGendarmeId,
      statut: 'en_attente'
    })
    
    // Fermer le modal de modification
    document.getElementById('modal-modify-assignation').remove()
    
    // Rafraîchir la liste des assignations
    await viewAssignations(missionId)
    
    // Recharger les missions
    const response = await axios.get('/api/missions')
    allMissions = response.data
    renderCompagnieCards()
    
    alert('✅ Gendarme modifié avec succès')
  } catch (error) {
    alert('❌ Erreur : ' + error.message)
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
              <input type="date" id="mission-date-debut" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Heure de début *</label>
              <input type="time" id="mission-heure-debut" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Date de fin *</label>
              <input type="date" id="mission-date-fin" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Heure de fin *</label>
              <input type="time" id="mission-heure-fin" required
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

    <!-- Modal Import Excel -->
    <div id="modal-import-excel" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-green-700">
            <i class="fas fa-file-excel mr-2"></i>Import de missions depuis Excel
          </h2>
          <button id="close-modal-import-excel" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        
        <!-- Instructions -->
        <div class="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p class="text-sm text-gray-700 font-semibold mb-2">
            <i class="fas fa-info-circle text-blue-500 mr-2"></i>Format Excel attendu :
          </p>
          <p class="text-xs text-gray-600">
            Le fichier sera analysé et chaque ligne remplira automatiquement la modale de création de mission.
            Vous pourrez valider ou modifier chaque mission avant de l'enregistrer.
          </p>
        </div>
        
        <!-- Zone de téléchargement -->
        <div class="mb-6 p-6 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
          <label class="block text-sm font-semibold mb-2 text-green-900">
            <i class="fas fa-upload mr-2"></i>Sélectionnez votre fichier Excel ou ODS
          </label>
          <input type="file" id="import-excel-file" accept=".xlsx,.xls,.ods"
                 class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 bg-white">
          <p class="text-xs text-gray-600 mt-2">
            <i class="fas fa-info-circle mr-1"></i>Formats acceptés : .xlsx, .xls, .ods
          </p>
        </div>
        
        <!-- Aperçu des données -->
        <div id="import-excel-preview" class="hidden mb-6">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-semibold">
              <i class="fas fa-eye mr-2"></i>Aperçu des données
            </label>
            <span id="import-excel-total" class="text-sm text-gray-600"></span>
          </div>
          <div class="overflow-x-auto border rounded-lg">
            <table id="import-excel-table" class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr id="import-excel-headers"></tr>
              </thead>
              <tbody id="import-excel-body" class="bg-white divide-y divide-gray-200"></tbody>
            </table>
          </div>
        </div>
        
        <!-- Message d'état -->
        <div id="import-excel-status" class="hidden mb-6"></div>
        
        <!-- Boutons d'action -->
        <div class="flex justify-between items-center">
          <button onclick="downloadImportTemplate()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <i class="fas fa-download mr-2"></i>Télécharger le modèle
          </button>
          <div class="flex gap-3">
            <button onclick="closeImportExcelModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button onclick="startImportFromExcel()" id="btn-start-import" disabled
                    class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
              <i class="fas fa-play mr-2"></i>Commencer l'import
            </button>
          </div>
        </div>
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
              <select id="gendarme-grade" required
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">-- Sélectionnez un grade --</option>
                <option value="Brigadier">Brigadier</option>
                <option value="Brigadier-Chef">Brigadier-Chef</option>
                <option value="Maréchal-des-logis">Maréchal-des-logis</option>
                <option value="Gendarme">Gendarme</option>
                <option value="Maréchal-des-logis-Chef">Maréchal-des-logis-Chef</option>
                <option value="Adjudant">Adjudant</option>
                <option value="Adjudant-Chef">Adjudant-Chef</option>
                <option value="Major">Major</option>
                <option value="Sous-Lieutenant">Sous-Lieutenant</option>
                <option value="Lieutenant">Lieutenant</option>
                <option value="Capitaine">Capitaine</option>
                <option value="Commandant">Commandant</option>
                <option value="Lieutenant-Colonel">Lieutenant-Colonel</option>
                <option value="Colonel">Colonel</option>
                <option value="Général">Général</option>
              </select>
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

// ==================== EXPORT PDF ====================

/**
 * Exporter une mission en PDF avec toutes ses informations et assignations
 */
async function exportMissionPDF(missionId) {
  try {
    // Charger les données
    const [missionRes, assignationsRes] = await Promise.all([
      axios.get(`/api/missions/${missionId}`),
      axios.get(`/api/assignations/mission/${missionId}`)
    ])
    
    const mission = missionRes.data
    const assignations = assignationsRes.data
    
    // Initialiser jsPDF
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    
    // En-tête
    doc.setFontSize(20)
    doc.setTextColor(37, 99, 235) // Bleu
    doc.text('FICHE DE MISSION', 105, 20, { align: 'center' })
    
    // Numéro de mission
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`Mission N° ${mission.numero_mission}`, 105, 30, { align: 'center' })
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 35, 190, 35)
    
    let yPos = 45
    
    // Informations générales
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('INFORMATIONS GÉNÉRALES', 20, yPos)
    yPos += 8
    
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    
    // Titre
    doc.setFont(undefined, 'bold')
    doc.text('Titre :', 20, yPos)
    doc.setFont(undefined, 'normal')
    const splitTitle = doc.splitTextToSize(mission.titre, 160)
    doc.text(splitTitle, 50, yPos)
    yPos += splitTitle.length * 5 + 3
    
    // Description
    if (mission.description) {
      doc.setFont(undefined, 'bold')
      doc.text('Description :', 20, yPos)
      doc.setFont(undefined, 'normal')
      const splitDesc = doc.splitTextToSize(mission.description, 160)
      doc.text(splitDesc, 20, yPos + 5)
      yPos += splitDesc.length * 5 + 8
    }
    
    // Brigade et Compagnie
    doc.setFont(undefined, 'bold')
    doc.text('Brigade :', 20, yPos)
    doc.setFont(undefined, 'normal')
    doc.text(mission.brigade_nom || 'Non spécifiée', 50, yPos)
    yPos += 6
    
    doc.setFont(undefined, 'bold')
    doc.text('Compagnie :', 20, yPos)
    doc.setFont(undefined, 'normal')
    doc.text(mission.compagnie_nom || 'Non spécifiée', 50, yPos)
    yPos += 8
    
    // Dates
    doc.setFont(undefined, 'bold')
    doc.text('Date de début :', 20, yPos)
    doc.setFont(undefined, 'normal')
    doc.text(dayjs(mission.date_debut).format('DD/MM/YYYY HH:mm'), 55, yPos)
    yPos += 6
    
    doc.setFont(undefined, 'bold')
    doc.text('Date de fin :', 20, yPos)
    doc.setFont(undefined, 'normal')
    doc.text(dayjs(mission.date_fin).format('DD/MM/YYYY HH:mm'), 55, yPos)
    yPos += 8
    
    // Effectifs
    doc.setFont(undefined, 'bold')
    doc.text('Effectifs requis :', 20, yPos)
    doc.setFont(undefined, 'normal')
    doc.text(`${mission.effectifs_assignes || 0} / ${mission.effectifs_requis}`, 60, yPos)
    yPos += 6
    
    // Priorité
    doc.setFont(undefined, 'bold')
    doc.text('Priorité :', 20, yPos)
    doc.setFont(undefined, 'normal')
    const prioriteLabel = mission.priorite === 'haute' ? 'HAUTE' : 
                          mission.priorite === 'moyenne' ? 'Moyenne' : 'Normale'
    doc.text(prioriteLabel, 45, yPos)
    yPos += 10
    
    // Compétences requises
    if (mission.competences_requises) {
      doc.setFont(undefined, 'bold')
      doc.text('Compétences requises :', 20, yPos)
      doc.setFont(undefined, 'normal')
      const splitComp = doc.splitTextToSize(mission.competences_requises, 160)
      doc.text(splitComp, 20, yPos + 5)
      yPos += splitComp.length * 5 + 10
    }
    
    // Ligne de séparation
    doc.line(20, yPos, 190, yPos)
    yPos += 10
    
    // Liste des gendarmes assignés
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('GENDARMES ASSIGNÉS', 20, yPos)
    yPos += 8
    
    // Tableau des assignations
    const assignationsValidees = assignations.filter(a => a.statut === 'valide')
    const assignationsAttente = assignations.filter(a => a.statut === 'en_attente')
    const placesLibres = assignations.filter(a => a.statut === 'libre')
    
    const tableData = []
    
    // Validés
    assignationsValidees.forEach(a => {
      tableData.push([
        `${a.gendarme_prenom} ${a.gendarme_nom}`,
        a.gendarme_matricule,
        a.gendarme_grade,
        a.gendarme_telephone || '-',
        'Validé'
      ])
    })
    
    // En attente
    assignationsAttente.forEach(a => {
      tableData.push([
        `${a.gendarme_prenom} ${a.gendarme_nom}`,
        a.gendarme_matricule,
        a.gendarme_grade,
        a.gendarme_telephone || '-',
        'En attente'
      ])
    })
    
    // Libres
    placesLibres.forEach(() => {
      tableData.push([
        'Place disponible',
        '-',
        '-',
        '-',
        'Libre'
      ])
    })
    
    doc.autoTable({
      startY: yPos,
      head: [['Nom', 'Matricule', 'Grade', 'Téléphone', 'Statut']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 }
      }
    })
    
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Page ${i} sur ${pageCount} - Généré le ${dayjs().format('DD/MM/YYYY à HH:mm')}`,
        105,
        290,
        { align: 'center' }
      )
      doc.text('GesRes - Gestion des Missions Réserve', 105, 285, { align: 'center' })
    }
    
    // Télécharger
    doc.save(`Mission_${mission.numero_mission}_${dayjs().format('YYYY-MM-DD')}.pdf`)
    
  } catch (error) {
    console.error('Erreur export PDF:', error)
    alert('❌ Erreur lors de l\'export PDF : ' + error.message)
  }
}

/**
 * Exporter toutes les missions d'une brigade en PDF
 */
async function exportBrigadeMissionsPDF(brigadeId) {
  try {
    const brigade = allBrigades.find(b => b.id === brigadeId)
    if (!brigade) {
      alert('Brigade non trouvée')
      return
    }
    
    const missions = allMissions.filter(m => m.brigade_id === brigadeId)
    
    if (missions.length === 0) {
      alert('Aucune mission pour cette brigade')
      return
    }
    
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    
    // En-tête
    doc.setFontSize(18)
    doc.setTextColor(37, 99, 235)
    doc.text('LISTE DES MISSIONS', 105, 20, { align: 'center' })
    
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(brigade.nom, 105, 28, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`${brigade.compagnie_nom || ''}`, 105, 34, { align: 'center' })
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 38, 190, 38)
    
    // Tableau des missions
    const tableData = missions.map(m => [
      m.numero_mission,
      m.titre,
      dayjs(m.date_debut).format('DD/MM/YYYY'),
      dayjs(m.date_fin).format('DD/MM/YYYY'),
      `${m.effectifs_assignes || 0}/${m.effectifs_requis}`,
      m.priorite === 'haute' ? 'Haute' : m.priorite === 'moyenne' ? 'Moyenne' : 'Normale'
    ])
    
    doc.autoTable({
      startY: 45,
      head: [['N° Mission', 'Titre', 'Début', 'Fin', 'Effectifs', 'Priorité']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 60 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      }
    })
    
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Page ${i} sur ${pageCount} - Généré le ${dayjs().format('DD/MM/YYYY à HH:mm')}`,
        105,
        290,
        { align: 'center' }
      )
      doc.text('GesRes - Gestion des Missions Réserve', 105, 285, { align: 'center' })
    }
    
    doc.save(`Missions_${brigade.code}_${dayjs().format('YYYY-MM-DD')}.pdf`)
    
  } catch (error) {
    console.error('Erreur export PDF:', error)
    alert('❌ Erreur lors de l\'export PDF : ' + error.message)
  }
}

async function exportMonthMissionsPDF(brigadeId, monthKey) {
  try {
    const brigade = allBrigades.find(b => b.id === brigadeId)
    if (!brigade) {
      alert('Brigade non trouvée')
      return
    }
    
    const missions = allMissions.filter(m => {
      const missionMonth = dayjs(m.date_debut).format('YYYY-MM')
      return m.brigade_id === brigadeId && missionMonth === monthKey
    })
    
    // Trier les missions par date
    missions.sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))
    
    if (missions.length === 0) {
      alert('Aucune mission pour ce mois')
      return
    }
    
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    
    // En-tête
    doc.setFontSize(18)
    doc.setTextColor(37, 99, 235)
    doc.text('MISSIONS DU MOIS', 105, 20, { align: 'center' })
    
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(brigade.nom, 105, 28, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor(128, 0, 128)
    doc.text(dayjs(monthKey).format('MMMM YYYY'), 105, 35, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`${brigade.compagnie_nom || ''}`, 105, 42, { align: 'center' })
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 46, 190, 46)
    
    // Tableau des missions
    const tableData = missions.map(m => [
      m.numero_mission,
      m.titre,
      dayjs(m.date_debut).format('DD/MM/YYYY'),
      `${m.effectifs_assignes}/${m.effectifs_requis}`,
      m.priorite === 'haute' ? 'Haute' : m.priorite === 'moyenne' ? 'Moyenne' : 'Normale'
    ])
    
    doc.autoTable({
      head: [['N°', 'Mission', 'Date', 'Effectifs', 'Priorité']],
      body: tableData,
      startY: 52,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [128, 0, 128],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 }
      },
      didDrawPage: function (data) {
        // Pied de page
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Généré le ${dayjs().format('DD/MM/YYYY à HH:mm')}`,
          105,
          290,
          { align: 'center' }
        )
        doc.text('GesRes - Gestion des Missions Réserve', 105, 285, { align: 'center' })
      }
    })
    
    doc.save(`Missions_${brigade.code}_${dayjs(monthKey).format('YYYY-MM')}.pdf`)
    
  } catch (error) {
    console.error('Erreur export PDF:', error)
    alert('❌ Erreur lors de l\'export PDF : ' + error.message)
  }
}

// ==================== NETTOYAGE AUTOMATIQUE ====================

// Vérifier les missions à supprimer
async function checkCleanupStatus() {
  try {
    const statusDiv = document.getElementById('cleanup-status')
    statusDiv.innerHTML = '<p class="text-sm text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Vérification en cours...</p>'
    
    const response = await axios.get('/api/missions/cleanup-status')
    const { count, lastMonthEnd, missions } = response.data
    
    const lastMonthDate = new Date(lastMonthEnd)
    const formattedDate = lastMonthDate.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
    
    if (count === 0) {
      statusDiv.innerHTML = `
        <div class="flex items-center">
          <i class="fas fa-check-circle text-green-500 text-2xl mr-3"></i>
          <div>
            <p class="text-sm font-medium text-gray-800">Aucune mission expirée</p>
            <p class="text-xs text-gray-500">Toutes les missions sont à jour (terminées après le ${formattedDate})</p>
          </div>
        </div>
      `
    } else {
      statusDiv.innerHTML = `
        <div class="flex items-center mb-3">
          <i class="fas fa-exclamation-triangle text-orange-500 text-2xl mr-3"></i>
          <div>
            <p class="text-sm font-medium text-gray-800">${count} mission(s) expirée(s) à supprimer</p>
            <p class="text-xs text-gray-500">Missions terminées avant le ${formattedDate}</p>
          </div>
        </div>
        <div class="mt-3 max-h-40 overflow-y-auto">
          <ul class="text-xs text-gray-600 space-y-1">
            ${missions.slice(0, 10).map(m => `
              <li class="flex items-center justify-between py-1 px-2 hover:bg-gray-100 rounded">
                <span><strong>${m.numero_mission}</strong> - ${m.titre}</span>
                <span class="text-gray-400">${new Date(m.date_fin).toLocaleDateString('fr-FR')}</span>
              </li>
            `).join('')}
            ${count > 10 ? `<li class="text-gray-400 italic">... et ${count - 10} autres</li>` : ''}
          </ul>
        </div>
      `
    }
  } catch (error) {
    console.error('Erreur vérification cleanup:', error)
    const statusDiv = document.getElementById('cleanup-status')
    statusDiv.innerHTML = `
      <p class="text-sm text-red-600">
        <i class="fas fa-times-circle mr-2"></i>Erreur lors de la vérification
      </p>
    `
  }
}

// Supprimer les missions expirées maintenant
async function cleanupExpiredMissionsNow() {
  if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer toutes les missions expirées ?\n\nCette action est définitive et ne peut pas être annulée.')) {
    return
  }
  
  try {
    const response = await axios.post('/api/missions/cleanup')
    const { deleted, message, missions } = response.data
    
    if (deleted === 0) {
      alert('✅ Aucune mission à supprimer')
    } else {
      alert(`✅ ${message}\n\nMissions supprimées :\n${missions.map(m => `- ${m.numero_mission} : ${m.titre}`).join('\n')}`)
      
      // Recharger les données
      await loadAllData()
      renderCompagnieCards()
    }
    
    // Mettre à jour le statut
    await checkCleanupStatus()
  } catch (error) {
    console.error('Erreur nettoyage:', error)
    alert('❌ Erreur lors du nettoyage des missions expirées')
  }
}

// Charger le statut au chargement de l'onglet paramètres
const originalSwitchTab = switchTab
switchTab = function(tabName) {
  originalSwitchTab(tabName)
  
  if (tabName === 'parametres') {
    checkCleanupStatus()
  }
}

// =============================================================================
// IMPORT EXCEL DES MISSIONS
// =============================================================================

let excelData = null

// Gérer la sélection du fichier Excel
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('excel-file')
  if (fileInput) {
    fileInput.addEventListener('change', handleExcelFileSelect)
  }
})

function handleExcelFileSelect(event) {
  const file = event.target.files[0]
  if (!file) {
    excelData = null
    document.getElementById('excel-preview').classList.add('hidden')
    document.getElementById('btn-import-excel').disabled = true
    return
  }

  const reader = new FileReader()
  
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array', cellDates: true })
      
      // Lire la première feuille
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Convertir en JSON (avec l'en-tête)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'dd/mm/yyyy hh:mm:ss' })
      
      if (jsonData.length === 0) {
        alert('❌ Le fichier Excel est vide')
        return
      }
      
      // Stocker les données
      excelData = jsonData
      
      // Afficher l'aperçu
      displayExcelPreview(jsonData)
      
      // Activer le bouton d'import
      document.getElementById('btn-import-excel').disabled = false
      
    } catch (error) {
      console.error('Erreur lecture Excel:', error)
      alert('❌ Erreur lors de la lecture du fichier Excel')
    }
  }
  
  reader.readAsArrayBuffer(file)
}

function displayExcelPreview(data) {
  const previewDiv = document.getElementById('excel-preview')
  const headersRow = document.getElementById('excel-preview-headers')
  const bodyTable = document.getElementById('excel-preview-body')
  const totalRowsSpan = document.getElementById('excel-total-rows')
  
  // Nettoyer
  headersRow.innerHTML = ''
  bodyTable.innerHTML = ''
  
  // Afficher les 5 premières lignes
  const previewCount = Math.min(6, data.length) // En-tête + 5 lignes
  
  for (let i = 0; i < previewCount; i++) {
    const row = data[i]
    
    if (i === 0) {
      // En-têtes (première ligne ou numérotation par défaut)
      const isHeader = typeof row[0] === 'string' && !row[0].match(/^\d+$/)
      
      if (isHeader) {
        row.forEach((cell, idx) => {
          const th = document.createElement('th')
          th.className = 'border border-gray-300 px-2 py-1 text-xs font-semibold'
          th.textContent = cell || `Colonne ${idx + 1}`
          headersRow.appendChild(th)
        })
      } else {
        // Pas d'en-tête, créer des noms par défaut
        const headers = ['N° Mission', 'Date début', 'Date fin', 'Description', 'Titre', 'Code brigade', 'Effectifs', 'Priorité', 'Compétences']
        headers.forEach((name, idx) => {
          if (idx < row.length) {
            const th = document.createElement('th')
            th.className = 'border border-gray-300 px-2 py-1 text-xs font-semibold'
            th.textContent = name
            headersRow.appendChild(th)
          }
        })
        
        // Ajouter la première ligne dans le body
        const tr = document.createElement('tr')
        tr.className = 'hover:bg-gray-50'
        row.forEach(cell => {
          const td = document.createElement('td')
          td.className = 'border border-gray-300 px-2 py-1 text-xs'
          td.textContent = cell || ''
          tr.appendChild(td)
        })
        bodyTable.appendChild(tr)
      }
    } else {
      // Lignes de données
      const tr = document.createElement('tr')
      tr.className = 'hover:bg-gray-50'
      row.forEach(cell => {
        const td = document.createElement('td')
        td.className = 'border border-gray-300 px-2 py-1 text-xs'
        td.textContent = cell || ''
        tr.appendChild(td)
      })
      bodyTable.appendChild(tr)
    }
  }
  
  const dataRows = data.length - 1 // Enlever l'en-tête
  totalRowsSpan.textContent = `Total : ${dataRows} mission(s) à importer`
  
  previewDiv.classList.remove('hidden')
}

async function processExcelFile() {
  if (!excelData || excelData.length < 2) {
    alert('❌ Aucune donnée à importer')
    return
  }
  
  const resultsDiv = document.getElementById('import-results')
  resultsDiv.innerHTML = '<p class="text-sm text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Import en cours...</p>'
  resultsDiv.classList.remove('hidden')
  
  // Déterminer si la première ligne est un en-tête
  const hasHeader = typeof excelData[0][0] === 'string' && !excelData[0][0].match(/^\d+$/)
  const startRow = hasHeader ? 1 : 0
  
  const missions = []
  const errors = []
  
  // Charger la liste des brigades pour validation
  try {
    await loadAllData()
  } catch (error) {
    alert('❌ Erreur lors du chargement des brigades')
    return
  }
  
  // Parser chaque ligne
  for (let i = startRow; i < excelData.length; i++) {
    const row = excelData[i]
    const rowNum = i + 1
    
    // Vérifier que la ligne n'est pas vide
    if (!row || row.length === 0 || !row[0]) {
      continue
    }
    
    try {
      // Colonnes : [0]N°mission, [1]Date début, [2]Date fin, [3]Description, [4]Titre, [5]Code brigade, [6]Effectifs, [7]Priorité, [8]Compétences
      const numeroMission = String(row[0] || '').trim()
      const dateDebut = parseExcelDate(row[1])
      const dateFin = parseExcelDate(row[2])
      const description = String(row[3] || '').trim()
      const titre = String(row[4] || '').trim()
      const codeBrigade = String(row[5] || '').trim()
      const effectifsReqis = parseInt(row[6]) || 1
      const priorite = String(row[7] || 'normale').trim().toLowerCase()
      const competences = String(row[8] || '').trim()
      
      // Validations
      if (!numeroMission) {
        errors.push(`Ligne ${rowNum}: Numéro de mission manquant`)
        continue
      }
      if (!dateDebut || !dateFin) {
        errors.push(`Ligne ${rowNum}: Dates invalides`)
        continue
      }
      if (!titre) {
        errors.push(`Ligne ${rowNum}: Titre manquant`)
        continue
      }
      if (!codeBrigade) {
        errors.push(`Ligne ${rowNum}: Code brigade manquant`)
        continue
      }
      
      // Trouver l'ID de la brigade
      const brigade = allBrigades.find(b => 
        b.code === codeBrigade || 
        b.nom.toLowerCase().includes(codeBrigade.toLowerCase())
      )
      
      if (!brigade) {
        errors.push(`Ligne ${rowNum}: Brigade introuvable (${codeBrigade})`)
        continue
      }
      
      // Valider priorité
      const validPriorities = ['basse', 'normale', 'haute', 'urgente']
      const finalPriorite = validPriorities.includes(priorite) ? priorite : 'normale'
      
      missions.push({
        numero_mission: numeroMission,
        titre: titre,
        description: description || titre,
        brigade_id: brigade.id,
        date_debut: dateDebut,
        date_fin: dateFin,
        effectifs_requis: effectifsReqis,
        priorite: finalPriorite,
        competences_requises: competences || null
      })
      
    } catch (error) {
      errors.push(`Ligne ${rowNum}: ${error.message}`)
    }
  }
  
  // Afficher les résultats
  if (missions.length === 0) {
    resultsDiv.innerHTML = `
      <div class="p-4 bg-red-50 border-l-4 border-red-500 rounded">
        <p class="text-sm text-red-800 font-semibold"><i class="fas fa-times-circle mr-2"></i>Aucune mission valide trouvée</p>
        <ul class="text-xs text-red-700 mt-2 ml-4">
          ${errors.map(e => `<li>• ${e}</li>`).join('')}
        </ul>
      </div>
    `
    return
  }
  
  // Confirmation
  const confirm = window.confirm(
    `📊 Import Excel\n\n` +
    `✅ ${missions.length} mission(s) valide(s)\n` +
    `${errors.length > 0 ? `⚠️ ${errors.length} erreur(s)\n` : ''}` +
    `\nConfirmez-vous l'import ?`
  )
  
  if (!confirm) {
    resultsDiv.classList.add('hidden')
    return
  }
  
  // Envoyer les missions à l'API
  try {
    const response = await axios.post('/api/missions/import-batch', {
      missions: missions
    })
    
    const { success, failed, total } = response.data
    
    resultsDiv.innerHTML = `
      <div class="p-4 bg-green-50 border-l-4 border-green-500 rounded">
        <p class="text-sm text-green-800 font-semibold">
          <i class="fas fa-check-circle mr-2"></i>Import terminé
        </p>
        <div class="text-xs text-green-700 mt-2">
          <p>✅ ${success} mission(s) créée(s) avec succès</p>
          ${failed > 0 ? `<p class="text-red-600">❌ ${failed} échec(s)</p>` : ''}
          ${errors.length > 0 ? `<p class="text-yellow-600">⚠️ ${errors.length} ligne(s) ignorée(s) (erreurs de format)</p>` : ''}
        </div>
        ${errors.length > 0 ? `
          <details class="mt-2">
            <summary class="text-xs text-gray-600 cursor-pointer hover:text-gray-800">Voir les erreurs</summary>
            <ul class="text-xs text-gray-700 mt-1 ml-4">
              ${errors.map(e => `<li>• ${e}</li>`).join('')}
            </ul>
          </details>
        ` : ''}
      </div>
    `
    
    // Recharger les données
    await loadAllData()
    
    // Réinitialiser le formulaire
    document.getElementById('excel-file').value = ''
    excelData = null
    document.getElementById('excel-preview').classList.add('hidden')
    document.getElementById('btn-import-excel').disabled = true
    
  } catch (error) {
    console.error('Erreur import:', error)
    resultsDiv.innerHTML = `
      <div class="p-4 bg-red-50 border-l-4 border-red-500 rounded">
        <p class="text-sm text-red-800 font-semibold">
          <i class="fas fa-times-circle mr-2"></i>Erreur lors de l'import
        </p>
        <p class="text-xs text-red-700 mt-1">${error.response?.data?.error || error.message}</p>
      </div>
    `
  }
}

function parseExcelDate(dateValue) {
  if (!dateValue) return null
  
  // Si c'est déjà une date JavaScript
  if (dateValue instanceof Date) {
    return dateValue.toISOString().slice(0, 19).replace('T', ' ')
  }
  
  // Si c'est un nombre Excel (serial date)
  if (typeof dateValue === 'number') {
    const date = XLSX.SSF.parse_date_code(dateValue)
    return `${String(date.y).padStart(4, '0')}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')} ${String(date.H || 0).padStart(2, '0')}:${String(date.M || 0).padStart(2, '0')}:${String(date.S || 0).padStart(2, '0')}`
  }
  
  // Si c'est une chaîne, parser plusieurs formats
  if (typeof dateValue === 'string') {
    const str = dateValue.trim()
    
    // Format: DD/MM/YY HH:MM:SS ou DD/MM/YYYY HH:MM:SS
    const match1 = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/)
    if (match1) {
      const [, day, month, year, hour, min, sec] = match1
      const fullYear = year.length === 2 ? `20${year}` : year
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${min.padStart(2, '0')}:${sec.padStart(2, '0')}`
    }
    
    // Format: YYYY-MM-DD HH:MM:SS
    const match2 = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/)
    if (match2) {
      const [, year, month, day, hour, min, sec] = match2
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${min.padStart(2, '0')}:${sec.padStart(2, '0')}`
    }
  }
  
  return null
}

function downloadExcelTemplate() {
  // Créer un fichier Excel d'exemple
  const data = [
    ['Numéro de mission', 'Date début', 'Date fin', 'Description', 'Titre', 'Code brigade', 'Effectifs requis', 'Priorité', 'Compétences'],
    ['1819992', '13/03/26 15:00:00', '13/03/26 23:00:00', 'Ordre et sécurité publique', 'Renfort PAM', '58577', 2, 'normale', 'PSC1'],
    ['1827585', '14/03/26 00:30:00', '14/03/26 07:00:00', 'Ordre et sécurité publique', 'Renfort BGE', 'BTA-PERSAN', 1, 'haute', '']
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Missions')
  
  // Télécharger
  XLSX.writeFile(wb, 'modele_import_missions.xlsx')
}

// =============================================================================
// IMPORT EXCEL AVEC REMPLISSAGE MODALE (VERSION 2)
// =============================================================================

let importedMissions = []
let currentImportIndex = 0

function showImportExcelModal() {
  document.getElementById('modal-import-excel').classList.remove('hidden')
  
  // Réinitialiser
  document.getElementById('import-excel-file').value = ''
  document.getElementById('import-excel-preview').classList.add('hidden')
  document.getElementById('import-excel-status').classList.add('hidden')
  document.getElementById('btn-start-import').disabled = true
  importedMissions = []
  currentImportIndex = 0
}

function closeImportExcelModal() {
  document.getElementById('modal-import-excel').classList.add('hidden')
}

function handleImportExcelFileSelect(event) {
  const file = event.target.files[0]
  if (!file) {
    importedMissions = []
    document.getElementById('import-excel-preview').classList.add('hidden')
    document.getElementById('btn-start-import').disabled = true
    return
  }

  const reader = new FileReader()
  
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array', cellDates: true })
      
      // Lire la première feuille
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Convertir en JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false })
      
      if (jsonData.length === 0) {
        alert('❌ Le fichier Excel est vide')
        return
      }
      
      // Parser les missions
      parseImportedMissions(jsonData)
      
    } catch (error) {
      console.error('Erreur lecture Excel:', error)
      alert('❌ Erreur lors de la lecture du fichier Excel')
    }
  }
  
  reader.readAsArrayBuffer(file)
}

function parseImportedMissions(data) {
  const hasHeader = typeof data[0][0] === 'string' && !data[0][0].match(/^\d+$/)
  const startRow = hasHeader ? 1 : 0
  
  importedMissions = []
  const errors = []
  
  // Parser chaque ligne
  for (let i = startRow; i < data.length; i++) {
    const row = data[i]
    const rowNum = i + 1
    
    // Vérifier que la ligne n'est pas vide
    if (!row || row.length === 0 || !row[0]) {
      continue
    }
    
    try {
      // MAPPING PERSONNALISÉ SELON LE FICHIER EXCEL
      // Colonne B (index 1) : App. Met. Cont. Loc → Brigade
      // Colonne AD (index 29) : Numéro mission
      // Colonne C (index 2) : Date de début
      // Colonne D (index 3) : Date de fin
      // Colonne G (index 6) : Lbl Action → Description
      // Colonne H (index 7) : Objet de la mission → Titre
      // Colonne J (index 9) : Heure de début
      // Colonne K (index 10) : Heure de fin
      // Colonnes V, W, X (index 21, 22, 23) : Nb Officiers + Nb Sous-off + Nb Mili Rang → Effectifs
      
      const codeBrigade = String(row[1] || '').trim()  // Colonne B
      const numeroMission = String(row[29] || '').trim()  // Colonne AD
      const dateDebut = String(row[2] || '').trim()  // Colonne C
      const dateFin = String(row[3] || '').trim()  // Colonne D
      const description = String(row[6] || '').trim()  // Colonne G
      const titre = String(row[7] || '').trim()  // Colonne H
      const heureDebut = String(row[9] || '').trim()  // Colonne J
      const heureFin = String(row[10] || '').trim()  // Colonne K
      
      // Calcul des effectifs : somme des colonnes V, W, X
      const nbOfficiers = parseInt(row[21]) || 0  // Colonne V
      const nbSousOff = parseInt(row[22]) || 0  // Colonne W
      const nbMiliRang = parseInt(row[23]) || 0  // Colonne X
      const effectifsReqis = nbOfficiers + nbSousOff + nbMiliRang
      
      const mission = {
        numero_mission: numeroMission,
        code_brigade: codeBrigade,
        date_debut: dateDebut,
        date_fin: dateFin,
        heure_debut: heureDebut,
        heure_fin: heureFin,
        description: description,
        titre: titre,
        effectifs_requis: effectifsReqis > 0 ? effectifsReqis : 1,
        priorite: 'normale',  // Pas de colonne priorité dans votre Excel
        competences_requises: '',  // Pas de colonne compétences dans votre Excel
        rowNum: rowNum  // Pour affichage
      }
      
      importedMissions.push(mission)
      
    } catch (error) {
      errors.push(`Ligne ${rowNum}: ${error.message}`)
    }
  }
  
  // Afficher l'aperçu
  displayImportPreview(data.slice(0, Math.min(6, data.length)))
  
  // Afficher le statut
  const statusDiv = document.getElementById('import-excel-status')
  if (importedMissions.length > 0) {
    statusDiv.innerHTML = `
      <div class="p-4 bg-green-50 border-l-4 border-green-500 rounded">
        <p class="text-sm text-green-800 font-semibold">
          <i class="fas fa-check-circle mr-2"></i>${importedMissions.length} mission(s) détectée(s)
        </p>
        <p class="text-xs text-green-700 mt-1">
          Cliquez sur "Commencer l'import" pour traiter les missions une par une.
        </p>
      </div>
    `
    statusDiv.classList.remove('hidden')
    document.getElementById('btn-start-import').disabled = false
  } else {
    statusDiv.innerHTML = `
      <div class="p-4 bg-red-50 border-l-4 border-red-500 rounded">
        <p class="text-sm text-red-800 font-semibold">
          <i class="fas fa-times-circle mr-2"></i>Aucune mission valide trouvée
        </p>
      </div>
    `
    statusDiv.classList.remove('hidden')
    document.getElementById('btn-start-import').disabled = true
  }
  
  document.getElementById('import-excel-total').textContent = `${importedMissions.length} mission(s) à importer`
}

function displayImportPreview(data) {
  const headersRow = document.getElementById('import-excel-headers')
  const bodyTable = document.getElementById('import-excel-body')
  
  // Nettoyer
  headersRow.innerHTML = ''
  bodyTable.innerHTML = ''
  
  // En-têtes
  const hasHeader = typeof data[0][0] === 'string' && !data[0][0].match(/^\d+$/)
  const headers = hasHeader ? data[0] : ['N° Mission', 'Date début', 'Date fin', 'Description', 'Titre', 'Code brigade', 'Effectifs', 'Priorité', 'Compétences']
  
  headers.forEach((header, idx) => {
    const th = document.createElement('th')
    th.className = 'px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'
    th.textContent = header || `Colonne ${idx + 1}`
    headersRow.appendChild(th)
  })
  
  // Lignes (max 5)
  const startRow = hasHeader ? 1 : 0
  const endRow = Math.min(startRow + 5, data.length)
  
  for (let i = startRow; i < endRow; i++) {
    const row = data[i]
    const tr = document.createElement('tr')
    tr.className = 'hover:bg-gray-50'
    
    row.forEach(cell => {
      const td = document.createElement('td')
      td.className = 'px-4 py-2 text-xs text-gray-900 whitespace-nowrap'
      td.textContent = cell || ''
      tr.appendChild(td)
    })
    
    bodyTable.appendChild(tr)
  }
  
  document.getElementById('import-excel-preview').classList.remove('hidden')
}

async function startImportFromExcel() {
  if (importedMissions.length === 0) {
    alert('❌ Aucune mission à importer')
    return
  }
  
  currentImportIndex = 0
  
  // Fermer la modale d'import
  closeImportExcelModal()
  
  // Afficher la première mission dans la modale de création
  await showNextImportedMission()
}

async function showNextImportedMission() {
  if (currentImportIndex >= importedMissions.length) {
    // Fin de l'import
    alert(`✅ Import terminé!\n\n${currentImportIndex} mission(s) traitée(s).`)
    
    // Recharger les données
    await loadAllData()
    renderCompagnieCards()
    
    // Réinitialiser
    importedMissions = []
    currentImportIndex = 0
    return
  }
  
  const mission = importedMissions[currentImportIndex]
  
  // Trouver la brigade
  const brigade = allBrigades.find(b => 
    b.code === mission.code_brigade || 
    b.nom.toLowerCase().includes(mission.code_brigade.toLowerCase())
  )
  
  if (!brigade) {
    const skipConfirm = confirm(
      `⚠️ Mission ${currentImportIndex + 1}/${importedMissions.length}\n\n` +
      `Brigade introuvable: ${mission.code_brigade}\n\n` +
      `Voulez-vous ignorer cette mission et passer à la suivante?`
    )
    if (skipConfirm) {
      currentImportIndex++
      await showNextImportedMission()
    }
    return
  }
  
  // Remplir la modale avec les données
  document.getElementById('mission-numero').value = mission.numero_mission
  document.getElementById('mission-titre').value = mission.titre
  document.getElementById('mission-description').value = mission.description || ''
  document.getElementById('mission-brigade-id').value = brigade.id
  
  // Remplir les champs date et heure séparément
  document.getElementById('mission-date-debut').value = mission.date_debut || ''
  document.getElementById('mission-heure-debut').value = mission.heure_debut || ''
  document.getElementById('mission-date-fin').value = mission.date_fin || ''
  document.getElementById('mission-heure-fin').value = mission.heure_fin || ''
  
  document.getElementById('mission-effectifs').value = mission.effectifs_requis || 1
  document.getElementById('mission-priorite').value = mission.priorite || 'normale'
  document.getElementById('mission-competences').value = mission.competences_requises || ''
  
  // Mettre à jour le titre de la modale
  document.getElementById('modal-mission-title').textContent = `Import Excel - Mission ${currentImportIndex + 1}/${importedMissions.length}`
  
  // Afficher la modale
  document.getElementById('modal-mission').classList.remove('hidden')
  
  // IMPORTANT: Incrémenter l'index pour la prochaine mission
  currentImportIndex++
}

function downloadImportTemplate() {
  // Créer un fichier Excel d'exemple
  const data = [
    ['Numéro de mission', 'Date début', 'Date fin', 'Description', 'Titre', 'Code brigade', 'Effectifs requis', 'Priorité', 'Compétences'],
    ['1819992', '13/03/26 15:00:00', '13/03/26 23:00:00', 'Ordre et sécurité publique', 'Renfort PAM', '58577', 2, 'normale', 'PSC1'],
    ['1827585', '14/03/26 00:30:00', '14/03/26 07:00:00', 'Ordre et sécurité publique', 'Renfort BGE', 'BTA-PERSAN', 1, 'haute', '']
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Missions')
  
  XLSX.writeFile(wb, 'modele_import_missions_gesres.xlsx')
}

