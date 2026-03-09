dayjs.locale('fr')

let allMissions = [], allBrigades = [], allCompagnies = []
let selectedCompagnieId = null, selectedBrigadeId = null, selectedMonth = null
let currentFilters = {
  priorite: 'all',
  statut: 'all',
  search: ''
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

async function loadAllData() {
  try {
    const [missionsRes, brigadesRes, compagniesRes] = await Promise.all([
      axios.get('/api/missions'),
      axios.get('/api/brigades'),
      axios.get('/api/compagnies')
    ])
    
    allMissions = missionsRes.data
    allBrigades = brigadesRes.data
    allCompagnies = compagniesRes.data
    
    renderView()
  } catch (error) {
    console.error('Erreur chargement:', error)
    document.getElementById('main-content').innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <i class="fas fa-exclamation-triangle text-red-600 text-3xl mb-3"></i>
        <p class="text-red-800 font-medium">Erreur de chargement des données</p>
      </div>
    `
  }
}

// ==================== RENDER FUNCTIONS ====================
function renderView() {
  if (!selectedCompagnieId) {
    renderCompagnies()
  } else if (!selectedBrigadeId) {
    renderBrigades()
  } else if (!selectedMonth) {
    renderMonths()
  } else {
    renderMissions()
  }
}

function renderCompagnies() {
  const container = document.getElementById('main-content')
  
  // Compter missions par compagnie
  const missionsByCompagnie = {}
  allCompagnies.forEach(c => {
    missionsByCompagnie[c.id] = 0
  })
  
  allMissions.forEach(m => {
    const brigade = allBrigades.find(b => b.id === m.brigade_id)
    if (brigade && missionsByCompagnie[brigade.compagnie_id] !== undefined) {
      missionsByCompagnie[brigade.compagnie_id]++
    }
  })
  
  // Update breadcrumb
  document.getElementById('breadcrumb').innerHTML = `
    <i class="fas fa-home text-blue-300"></i>
    <span class="text-white font-medium">Sélection de la compagnie</span>
  `
  
  container.innerHTML = `
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-3">
          <i class="fas fa-building mr-3"></i>Sélectionnez votre compagnie
        </h2>
        <p class="text-gray-600">Choisissez votre compagnie de rattachement pour accéder aux missions disponibles</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${allCompagnies.map(c => `
          <div onclick="selectCompagnie(${c.id})" 
               class="group bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-xl p-8 hover:border-blue-500 hover:shadow-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <div class="bg-blue-600 text-white rounded-lg p-3 group-hover:scale-110 transition-transform">
                    <i class="fas fa-building text-2xl"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">${c.nom}</h3>
                    <span class="inline-block text-xs font-mono bg-blue-100 text-blue-800 px-3 py-1 rounded-full mt-1">${c.code}</span>
                  </div>
                </div>
              </div>
              <div class="text-center bg-white rounded-lg p-4 shadow-sm group-hover:shadow-md transition-shadow">
                <div class="text-4xl font-bold text-blue-600">${missionsByCompagnie[c.id]}</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide">Mission${missionsByCompagnie[c.id] > 1 ? 's' : ''}</div>
              </div>
            </div>
            
            <div class="space-y-2 text-sm text-gray-600 pl-14">
              <div class="flex items-center gap-2">
                <i class="fas fa-user-tie text-blue-400 w-5"></i>
                <span>${c.commandant || 'N/A'}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-phone text-blue-400 w-5"></i>
                <span>${c.telephone}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-map-marker-alt text-blue-400 w-5"></i>
                <span class="truncate">${c.adresse}</span>
              </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-blue-100 flex items-center justify-between">
              <span class="text-sm text-gray-500">
                <i class="fas fa-shield-alt mr-2"></i>${allBrigades.filter(b => b.compagnie_id === c.id).length} brigade${allBrigades.filter(b => b.compagnie_id === c.id).length > 1 ? 's' : ''}
              </span>
              <span class="text-blue-600 font-medium group-hover:translate-x-2 transition-transform inline-block">
                Consulter <i class="fas fa-arrow-right ml-2"></i>
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

function renderBrigades() {
  const compagnie = allCompagnies.find(c => c.id === selectedCompagnieId)
  const brigadesInCompagnie = allBrigades.filter(b => b.compagnie_id === selectedCompagnieId)
  
  // Compter missions par brigade
  const missionsByBrigade = {}
  brigadesInCompagnie.forEach(b => {
    missionsByBrigade[b.id] = allMissions.filter(m => m.brigade_id === b.id).length
  })
  
  // Update breadcrumb
  document.getElementById('breadcrumb').innerHTML = `
    <span onclick="resetToCompagnies()" class="text-blue-300 hover:text-white cursor-pointer">
      <i class="fas fa-home"></i> Compagnies
    </span>
    <i class="fas fa-chevron-right text-blue-400 text-sm mx-2"></i>
    <span class="text-white font-medium">${compagnie.nom}</span>
  `
  
  const container = document.getElementById('main-content')
  container.innerHTML = `
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-8">
        <button onclick="resetToCompagnies()" class="mb-4 px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-md">
          <i class="fas fa-arrow-left mr-2"></i>Retour aux compagnies
        </button>
        <h2 class="text-3xl font-bold text-gray-800 mb-3">
          <i class="fas fa-shield-alt mr-3"></i>Brigades de ${compagnie.nom}
        </h2>
        <p class="text-gray-600">Choisissez votre brigade pour consulter les missions disponibles</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${brigadesInCompagnie.map(b => `
          <div onclick="selectBrigade(${b.id})" 
               class="group bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-xl p-6 hover:border-green-500 hover:shadow-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <div class="bg-green-600 text-white rounded-lg p-2 group-hover:scale-110 transition-transform">
                    <i class="fas fa-shield-alt text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">${b.nom}</h3>
                    <span class="inline-block text-xs font-mono bg-green-100 text-green-800 px-2 py-1 rounded-full">${b.code}</span>
                  </div>
                </div>
              </div>
              <div class="text-center bg-white rounded-lg p-3 shadow-sm group-hover:shadow-md transition-shadow">
                <div class="text-3xl font-bold text-green-600">${missionsByBrigade[b.id]}</div>
                <div class="text-xs text-gray-500 uppercase">Mission${missionsByBrigade[b.id] > 1 ? 's' : ''}</div>
              </div>
            </div>
            
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-start gap-2">
                <i class="fas fa-phone text-green-400 w-5 mt-0.5"></i>
                <span>${b.telephone}</span>
              </div>
              <div class="flex items-start gap-2">
                <i class="fas fa-map-marker-alt text-green-400 w-5 mt-0.5"></i>
                <span class="flex-1 text-xs">${b.adresse}</span>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-green-100">
              <button onclick="event.stopPropagation(); showBrigadeInfo(${b.id})" 
                      class="text-sm text-green-600 hover:text-green-700 font-medium">
                <i class="fas fa-info-circle mr-1"></i>Informations détaillées
              </button>
            </div>
            
            <div class="mt-4 text-green-600 font-medium text-right group-hover:translate-x-2 transition-transform">
              Voir les missions <i class="fas fa-arrow-right ml-2"></i>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

function renderMonths() {
  const compagnie = allCompagnies.find(c => c.id === selectedCompagnieId)
  const brigade = allBrigades.find(b => b.id === selectedBrigadeId)
  const missionsInBrigade = allMissions.filter(m => m.brigade_id === selectedBrigadeId)
  
  // Grouper les missions par mois
  const missionsByMonth = {}
  missionsInBrigade.forEach(m => {
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
  
  // Update breadcrumb
  document.getElementById('breadcrumb').innerHTML = `
    <span onclick="resetToCompagnies()" class="text-blue-300 hover:text-white cursor-pointer">
      <i class="fas fa-home"></i> Compagnies
    </span>
    <i class="fas fa-chevron-right text-blue-400 text-sm mx-2"></i>
    <span onclick="resetToBrigades()" class="text-blue-300 hover:text-white cursor-pointer">
      ${compagnie.nom}
    </span>
    <i class="fas fa-chevron-right text-blue-400 text-sm mx-2"></i>
    <span class="text-white font-medium">${brigade.nom}</span>
  `
  
  const container = document.getElementById('main-content')
  
  if (sortedMonths.length === 0) {
    container.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <button onclick="resetToBrigades()" class="mb-6 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
          <i class="fas fa-arrow-left mr-2"></i>Retour aux brigades
        </button>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <i class="fas fa-info-circle text-yellow-600 text-2xl mb-2"></i>
          <p class="text-gray-700">Aucune mission planifiée pour la brigade <strong>${brigade.nom}</strong></p>
        </div>
      </div>
    `
    return
  }
  
  container.innerHTML = `
    <div class="max-w-6xl mx-auto">
      <div class="mb-6">
        <button onclick="resetToBrigades()" class="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
          <i class="fas fa-arrow-left mr-2"></i>Retour aux brigades
        </button>
      </div>
      
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-3">
          <i class="fas fa-calendar-alt mr-3"></i>Sélectionnez un mois
        </h2>
        <p class="text-blue-100">Brigade ${brigade.nom} - ${sortedMonths.length} mois disponible${sortedMonths.length > 1 ? 's' : ''}</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${sortedMonths.map(month => `
          <div onclick="selectMonth('${month.monthKey}')" 
               class="group bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 rounded-xl p-8 hover:border-purple-500 hover:shadow-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <div class="bg-purple-600 text-white rounded-lg p-3 group-hover:scale-110 transition-transform">
                    <i class="fas fa-calendar text-2xl"></i>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500 uppercase font-medium">${dayjs(month.monthKey).format('MMMM')}</div>
                    <h3 class="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">${dayjs(month.monthKey).format('YYYY')}</h3>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-4xl font-bold text-purple-600 group-hover:scale-110 transition-transform">${month.missions.length}</div>
                <div class="text-xs text-gray-500 uppercase">mission${month.missions.length > 1 ? 's' : ''}</div>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-clock text-purple-400 w-4"></i>
                <span>${month.missions.filter(m => m.priorite === 'haute').length} haute priorité</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-users text-purple-400 w-4"></i>
                <span>${month.missions.reduce((sum, m) => sum + m.effectifs_requis, 0)} effectifs requis</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-check-circle text-purple-400 w-4"></i>
                <span>${month.missions.filter(m => m.places_libres > 0).length} avec places disponibles</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

function renderMissions() {
  const compagnie = allCompagnies.find(c => c.id === selectedCompagnieId)
  const brigade = allBrigades.find(b => b.id === selectedBrigadeId)
  const missionsInBrigade = allMissions.filter(m => {
    const missionMonth = dayjs(m.date_debut).format('YYYY-MM')
    return m.brigade_id === selectedBrigadeId && missionMonth === selectedMonth
  })
  
  // Trier les missions par date de début
  missionsInBrigade.sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))
  
  // Appliquer les filtres
  let filteredMissions = missionsInBrigade.filter(m => {
    const matchPriorite = currentFilters.priorite === 'all' || m.priorite === currentFilters.priorite
    const matchStatut = currentFilters.statut === 'all' || 
                        (currentFilters.statut === 'disponible' && m.places_libres > 0) ||
                        (currentFilters.statut === 'complet' && m.places_libres === 0)
    const searchTerm = currentFilters.search.toLowerCase()
    const matchSearch = !searchTerm || 
                        m.titre.toLowerCase().includes(searchTerm) ||
                        (m.description && m.description.toLowerCase().includes(searchTerm)) ||
                        (m.competences_requises && m.competences_requises.toLowerCase().includes(searchTerm))
    
    return matchPriorite && matchStatut && matchSearch
  })
  
  // Update breadcrumb
  document.getElementById('breadcrumb').innerHTML = `
    <span onclick="resetToCompagnies()" class="text-blue-300 hover:text-white cursor-pointer">
      <i class="fas fa-home"></i> Compagnies
    </span>
    <i class="fas fa-chevron-right text-blue-400 text-sm mx-2"></i>
    <span onclick="resetToBrigades()" class="text-blue-300 hover:text-white cursor-pointer">
      ${compagnie.nom}
    </span>
    <i class="fas fa-chevron-right text-blue-400 text-sm mx-2"></i>
    <span onclick="resetToMonths()" class="text-blue-300 hover:text-white cursor-pointer">
      ${brigade.nom}
    </span>
    <i class="fas fa-chevron-right text-blue-400 text-sm mx-2"></i>
    <span class="text-white font-medium">${dayjs(selectedMonth).format('MMMM YYYY')}</span>
  `
  
  const container = document.getElementById('main-content')
  container.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <!-- En-tête avec navigation -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <button onclick="resetToMonths()" class="mb-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <i class="fas fa-arrow-left mr-2"></i>Retour aux mois
            </button>
            <h2 class="text-2xl font-bold text-gray-800">
              <i class="fas fa-tasks mr-2 text-green-600"></i>${brigade.nom} - ${dayjs(selectedMonth).format('MMMM YYYY')}
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              <span class="font-medium">${compagnie.nom}</span> · 
              ${missionsInBrigade.length} mission${missionsInBrigade.length > 1 ? 's' : ''} ce mois
            </p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button onclick="showBrigadeInfo(${brigade.id})" 
                    class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg">
              <i class="fas fa-info-circle mr-2"></i>Informations brigade
            </button>
          </div>
        </div>
      </div>
      
      <!-- Filtres -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Priorité -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-exclamation-circle mr-2"></i>Priorité
            </label>
            <select id="filter-priorite" onchange="applyFilters()" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">Toutes les priorités</option>
              <option value="haute">Haute</option>
              <option value="moyenne">Moyenne</option>
              <option value="normale">Normale</option>
            </select>
          </div>
          
          <!-- Statut -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-filter mr-2"></i>Disponibilité
            </label>
            <select id="filter-statut" onchange="applyFilters()" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">Tous les statuts</option>
              <option value="disponible">Places disponibles</option>
              <option value="complet">Complet</option>
            </select>
          </div>
          
          <!-- Recherche -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-search mr-2"></i>Recherche
            </label>
            <input type="text" id="filter-search" oninput="applyFilters()" 
                   placeholder="Titre, description, compétences..."
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
        </div>
        
        ${filteredMissions.length < missionsInBrigade.length ? `
          <div class="mt-4 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
            <i class="fas fa-info-circle mr-2"></i>
            ${filteredMissions.length} mission${filteredMissions.length > 1 ? 's' : ''} trouvée${filteredMissions.length > 1 ? 's' : ''} sur ${missionsInBrigade.length}
          </div>
        ` : ''}
      </div>
      
      <!-- Liste des missions -->
      <div id="missions-list" class="space-y-4">
        ${filteredMissions.length === 0 ? `
          <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <i class="fas fa-inbox text-yellow-400 text-5xl mb-4"></i>
            <p class="text-gray-700 text-lg font-medium">Aucune mission ne correspond à vos critères</p>
            <button onclick="resetFilters()" class="mt-4 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
              Réinitialiser les filtres
            </button>
          </div>
        ` : filteredMissions.map(m => renderMissionCard(m)).join('')}
      </div>
    </div>
  `
}

function renderMissionCard(m) {
  const dateDebut = dayjs(m.date_debut)
  const dateFin = dayjs(m.date_fin)
  const progress = m.effectifs_requis > 0 ? Math.round((m.effectifs_assignes / m.effectifs_requis) * 100) : 0
  
  const prioriteClass = m.priorite === 'haute' ? 'bg-red-100 text-red-800 border-red-300' : 
                        m.priorite === 'moyenne' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
                        'bg-green-100 text-green-800 border-green-300'
  const prioriteIcon = m.priorite === 'haute' ? 'fa-exclamation-triangle' : 
                       m.priorite === 'moyenne' ? 'fa-exclamation-circle' : 'fa-check-circle'
  const prioriteLabel = m.priorite === 'haute' ? 'HAUTE' : 
                        m.priorite === 'moyenne' ? 'MOYENNE' : 'NORMALE'
  
  return `
    <div class="bg-white border-l-4 ${m.priorite === 'haute' ? 'border-red-500' : m.priorite === 'moyenne' ? 'border-yellow-500' : 'border-green-500'} rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div class="p-6">
        <div class="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="px-3 py-1 bg-blue-600 text-white text-xs font-mono rounded-full">
                ${m.numero_mission}
              </span>
              <span class="px-3 py-1 border ${prioriteClass} text-xs font-bold rounded-full">
                <i class="fas ${prioriteIcon} mr-1"></i>${prioriteLabel}
              </span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">${m.titre}</h3>
            ${m.description ? `<p class="text-gray-600 mb-3">${m.description}</p>` : ''}
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <i class="fas fa-calendar-alt text-blue-500 w-5"></i>
              <span><strong>Début:</strong> ${dateDebut.format('DD/MM/YYYY à HH:mm')}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <i class="fas fa-calendar-check text-blue-500 w-5"></i>
              <span><strong>Fin:</strong> ${dateFin.format('DD/MM/YYYY à HH:mm')}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <i class="fas fa-clock text-blue-500 w-5"></i>
              <span><strong>Durée:</strong> ${Math.ceil(dateFin.diff(dateDebut, 'hour'))}h</span>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <i class="fas fa-map-marker-alt text-green-500 w-5"></i>
              <span>${m.brigade_nom} (${m.brigade_code})</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <i class="fas fa-building text-green-500 w-5"></i>
              <span>${m.compagnie_nom}</span>
            </div>
            ${m.competences_requises ? `
              <div class="flex items-start gap-2 text-sm text-gray-600">
                <i class="fas fa-star text-yellow-500 w-5 mt-0.5"></i>
                <span class="flex-1"><strong>Compétences:</strong> ${m.competences_requises}</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Effectifs et assignations -->
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">
              <i class="fas fa-users mr-2"></i>Effectifs
            </span>
            <span class="text-sm font-bold ${progress >= 100 ? 'text-green-600' : progress >= 66 ? 'text-yellow-600' : 'text-red-600'}">
              ${m.effectifs_assignes}/${m.effectifs_requis}
            </span>
          </div>
          
          <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div class="h-full transition-all duration-500 rounded-full ${progress >= 100 ? 'bg-green-500' : progress >= 66 ? 'bg-yellow-500' : 'bg-blue-500'}" 
                 style="width: ${progress}%"></div>
          </div>
          
          <div class="flex justify-between mt-2 text-xs text-gray-500">
            <span><i class="fas fa-check-circle text-green-500 mr-1"></i>${m.effectifs_assignes} validé${m.effectifs_assignes > 1 ? 's' : ''}</span>
            <span><i class="fas fa-clock text-yellow-500 mr-1"></i>${m.effectifs_en_attente} en attente</span>
            <span><i class="fas fa-user-plus text-gray-400 mr-1"></i>${m.places_libres} libre${m.places_libres > 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <!-- Gendarmes assignés -->
        ${m.gendarmes_assignes && m.gendarmes_assignes.length > 0 ? `
          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">
              <i class="fas fa-user-check mr-2"></i>Gendarmes assignés
            </h4>
            <div class="space-y-2">
              ${m.gendarmes_assignes.map(g => `
                <div class="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      ${g.prenom.charAt(0)}${g.nom.charAt(0)}
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">${g.prenom} ${g.nom}</div>
                      <div class="text-xs text-gray-500">${g.grade} · ${g.matricule}</div>
                    </div>
                  </div>
                  <span class="px-3 py-1 text-xs font-medium rounded-full ${
                    g.statut === 'valide' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }">
                    ${g.statut === 'valide' ? 'Validé' : 'En attente'}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `
}

// ==================== NAVIGATION ====================
function selectCompagnie(compagnieId) {
  selectedCompagnieId = compagnieId
  selectedBrigadeId = null
  selectedMonth = null
  renderView()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function selectBrigade(brigadeId) {
  selectedBrigadeId = brigadeId
  selectedMonth = null
  resetFilters()
  renderView()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function selectMonth(monthKey) {
  selectedMonth = monthKey
  resetFilters()
  renderView()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetToCompagnies() {
  selectedCompagnieId = null
  selectedBrigadeId = null
  selectedMonth = null
  resetFilters()
  renderView()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetToBrigades() {
  selectedBrigadeId = null
  selectedMonth = null
  resetFilters()
  renderView()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetToMonths() {
  selectedMonth = null
  resetFilters()
  renderView()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ==================== FILTERS ====================
function applyFilters() {
  currentFilters.priorite = document.getElementById('filter-priorite').value
  currentFilters.statut = document.getElementById('filter-statut').value
  currentFilters.search = document.getElementById('filter-search').value
  renderMissions()
}

function resetFilters() {
  currentFilters = {
    priorite: 'all',
    statut: 'all',
    search: ''
  }
  if (document.getElementById('filter-priorite')) {
    document.getElementById('filter-priorite').value = 'all'
    document.getElementById('filter-statut').value = 'all'
    document.getElementById('filter-search').value = ''
  }
}

// ==================== BRIGADE INFO MODAL ====================
function showBrigadeInfo(brigadeId) {
  const brigade = allBrigades.find(b => b.id === brigadeId)
  if (!brigade) return
  
  const compagnie = allCompagnies.find(c => c.id === brigade.compagnie_id)
  
  document.getElementById('brigade-info-content').innerHTML = `
    <div class="space-y-4">
      <!-- Brigade -->
      <div class="bg-green-50 rounded-lg p-4">
        <h3 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <i class="fas fa-shield-alt text-green-600"></i>
          ${brigade.nom}
          <span class="text-sm font-mono bg-green-200 text-green-800 px-2 py-1 rounded">${brigade.code}</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div class="md:col-span-2">
            <div class="text-gray-600 mb-1"><i class="fas fa-map-marker-alt w-5 mr-2"></i><strong>Adresse:</strong></div>
            <div class="ml-7">${brigade.adresse}</div>
          </div>
          <div>
            <div class="text-gray-600 mb-1"><i class="fas fa-phone w-5 mr-2"></i><strong>Téléphone:</strong></div>
            <div class="ml-7">${brigade.telephone}</div>
          </div>
          ${brigade.email ? `
            <div>
              <div class="text-gray-600 mb-1"><i class="fas fa-envelope w-5 mr-2"></i><strong>Email:</strong></div>
              <div class="ml-7">${brigade.email}</div>
            </div>
          ` : ''}
        </div>
      </div>
      
      <!-- Compagnie -->
      ${compagnie ? `
        <div class="bg-blue-50 rounded-lg p-4">
          <h3 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i class="fas fa-building text-blue-600"></i>
            ${compagnie.nom}
            <span class="text-sm font-mono bg-blue-200 text-blue-800 px-2 py-1 rounded">${compagnie.code}</span>
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <div class="text-gray-600 mb-1"><i class="fas fa-user-tie w-5 mr-2"></i><strong>Commandant:</strong></div>
              <div class="ml-7">${compagnie.commandant}</div>
            </div>
            <div>
              <div class="text-gray-600 mb-1"><i class="fas fa-phone w-5 mr-2"></i><strong>Téléphone:</strong></div>
              <div class="ml-7">${compagnie.telephone}</div>
            </div>
            <div class="md:col-span-2">
              <div class="text-gray-600 mb-1"><i class="fas fa-map-marker-alt w-5 mr-2"></i><strong>Adresse:</strong></div>
              <div class="ml-7">${compagnie.adresse}</div>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `
  
  document.getElementById('modal-brigade-info').classList.remove('hidden')
}

function hideBrigadeInfo() {
  document.getElementById('modal-brigade-info').classList.add('hidden')
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async function() {
  await Promise.all([
    loadLogo(),
    loadAllData()
  ])
})
