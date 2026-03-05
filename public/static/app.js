// Configuration de dayjs en français
dayjs.locale('fr')

let allMissions = []

// Charger les statistiques
async function loadStats() {
  try {
    const response = await axios.get('/api/stats')
    const stats = response.data
    
    document.getElementById('stat-missions').textContent = stats.total_missions || 0
    document.getElementById('stat-valides').textContent = stats.assignations_validees || 0
    document.getElementById('stat-attente').textContent = stats.assignations_en_attente || 0
    document.getElementById('stat-libres').textContent = stats.places_libres || 0
  } catch (error) {
    console.error('Erreur chargement stats:', error)
  }
}

// Charger les missions
async function loadMissions() {
  try {
    const response = await axios.get('/api/missions')
    allMissions = response.data
    renderMissions(allMissions)
  } catch (error) {
    console.error('Erreur chargement missions:', error)
    document.getElementById('missions-list').innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        Erreur lors du chargement des missions
      </div>
    `
  }
}

// Afficher les missions
function renderMissions(missions) {
  const container = document.getElementById('missions-list')
  
  if (missions.length === 0) {
    container.innerHTML = `
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <i class="fas fa-inbox text-4xl text-gray-400 mb-2"></i>
        <p class="text-gray-500">Aucune mission disponible</p>
      </div>
    `
    return
  }
  
  container.innerHTML = missions.map(mission => {
    const dateDebut = dayjs(mission.date_debut).format('DD/MM/YYYY HH:mm')
    const dateFin = dayjs(mission.date_fin).format('DD/MM/YYYY HH:mm')
    
    const progressPct = Math.round((mission.effectifs_assignes / mission.effectifs_requis) * 100)
    
    return `
      <div class="bg-white rounded-lg shadow-lg p-6 priority-${mission.priorite}">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">${mission.titre}</h3>
            <div class="flex space-x-4 text-sm text-gray-600">
              <span><i class="fas fa-map-marker-alt mr-1"></i>${mission.lieu}</span>
              <span><i class="fas fa-calendar mr-1"></i>${dateDebut}</span>
              <span><i class="fas fa-clock mr-1"></i>jusqu'au ${dateFin}</span>
            </div>
          </div>
          <span class="px-3 py-1 rounded text-sm font-medium ${getPriorityClass(mission.priorite)}">
            ${getPriorityLabel(mission.priorite)}
          </span>
        </div>
        
        <p class="text-gray-700 mb-4">${mission.description}</p>
        
        ${mission.competences_requises ? `
          <div class="mb-4">
            <span class="text-sm font-medium text-gray-700">Compétences requises:</span>
            <p class="text-sm text-gray-600">${mission.competences_requises}</p>
          </div>
        ` : ''}
        
        <div class="mb-4">
          <div class="flex justify-between text-sm mb-1">
            <span class="font-medium">Effectifs: ${mission.effectifs_assignes}/${mission.effectifs_requis}</span>
            <span>${progressPct}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-green-500 h-2 rounded-full" style="width: ${progressPct}%"></div>
          </div>
        </div>
        
        <div class="flex space-x-2 flex-wrap gap-2">
          <span class="status-valide px-3 py-1 rounded text-sm font-medium">
            <i class="fas fa-check mr-1"></i>${mission.effectifs_assignes} Validé(s)
          </span>
          <span class="status-en_attente px-3 py-1 rounded text-sm font-medium">
            <i class="fas fa-clock mr-1"></i>${mission.effectifs_en_attente} En attente
          </span>
          <span class="status-libre px-3 py-1 rounded text-sm font-medium">
            <i class="fas fa-user-plus mr-1"></i>${mission.places_libres} Place(s) libre(s)
          </span>
        </div>
      </div>
    `
  }).join('')
}

function getPriorityClass(priorite) {
  const classes = {
    'urgente': 'bg-red-100 text-red-800',
    'haute': 'bg-orange-100 text-orange-800',
    'normale': 'bg-blue-100 text-blue-800',
    'basse': 'bg-green-100 text-green-800'
  }
  return classes[priorite] || classes.normale
}

function getPriorityLabel(priorite) {
  const labels = {
    'urgente': 'URGENTE',
    'haute': 'Haute',
    'normale': 'Normale',
    'basse': 'Basse'
  }
  return labels[priorite] || 'Normale'
}

// Filtres
document.getElementById('filter-priorite')?.addEventListener('change', applyFilters)
document.getElementById('filter-statut')?.addEventListener('change', applyFilters)
document.getElementById('filter-search')?.addEventListener('input', applyFilters)

function applyFilters() {
  const priorite = document.getElementById('filter-priorite').value
  const statut = document.getElementById('filter-statut').value
  const search = document.getElementById('filter-search').value.toLowerCase()
  
  let filtered = allMissions
  
  // Filtre priorité
  if (priorite) {
    filtered = filtered.filter(m => m.priorite === priorite)
  }
  
  // Filtre statut
  if (statut === 'complet') {
    filtered = filtered.filter(m => m.effectifs_assignes === m.effectifs_requis)
  } else if (statut === 'partiel') {
    filtered = filtered.filter(m => m.effectifs_assignes > 0 && m.effectifs_assignes < m.effectifs_requis)
  } else if (statut === 'libre') {
    filtered = filtered.filter(m => m.places_libres > 0)
  }
  
  // Filtre recherche
  if (search) {
    filtered = filtered.filter(m => 
      m.titre.toLowerCase().includes(search) ||
      m.description.toLowerCase().includes(search) ||
      m.lieu.toLowerCase().includes(search) ||
      (m.competences_requises && m.competences_requises.toLowerCase().includes(search))
    )
  }
  
  renderMissions(filtered)
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  loadStats()
  loadMissions()
})
