// Configuration de dayjs en français
dayjs.locale('fr')

let allMissions = []
let allBrigades = []
let selectedBrigadeId = null

// Charger le logo personnalisé
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

// Charger les brigades
async function loadBrigades() {
  try {
    const response = await axios.get('/api/brigades')
    allBrigades = response.data
    
    const selector = document.getElementById('brigade-selector')
    selector.innerHTML = '<option value="">Toutes les brigades</option>' +
      allBrigades.map(b => `
        <option value="${b.id}">${b.compagnie_nom} - ${b.nom} (${b.code})</option>
      `).join('')
  } catch (error) {
    console.error('Erreur chargement brigades:', error)
  }
}

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
    let url = '/api/missions'
    if (selectedBrigadeId) {
      url += `?brigade_id=${selectedBrigadeId}`
    }
    
    const response = await axios.get(url)
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
        <p class="text-gray-500">Aucune mission disponible pour cette brigade</p>
      </div>
    `
    return
  }
  
  container.innerHTML = missions.map(mission => {
    const dateDebut = dayjs(mission.date_debut).format('DD/MM/YYYY HH:mm')
    const dateFin = dayjs(mission.date_fin).format('DD/MM/YYYY HH:mm')
    
    const progressPct = Math.round((mission.effectifs_assignes / mission.effectifs_requis) * 100)
    
    return `
      <div class="bg-white rounded-lg shadow-lg p-6 priority-${mission.priorite} hover:shadow-xl transition-shadow">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <span class="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-mono rounded">${mission.numero_mission}</span>
              <h3 class="text-xl font-bold text-gray-800">${mission.titre}</h3>
            </div>
            <div class="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
              <button onclick="showBrigadeInfoById(${mission.brigade_id})" class="hover:text-blue-600 hover:underline">
                <i class="fas fa-map-marker-alt mr-1"></i>${mission.brigade_nom || mission.lieu}
              </button>
              <span><i class="fas fa-calendar mr-1"></i>${dateDebut}</span>
              <span><i class="fas fa-clock mr-1"></i>jusqu'au ${dateFin}</span>
            </div>
            ${mission.brigade_code ? `<div class="text-xs text-gray-500">Brigade: ${mission.brigade_code} - ${mission.compagnie_nom}</div>` : ''}
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
        
        <!-- Gendarmes assignés -->
        ${mission.gendarmes_assignes && mission.gendarmes_assignes.length > 0 ? `
          <div class="mb-4 border-t pt-4">
            <h4 class="text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-users mr-2"></i>Gendarmes affectés :
            </h4>
            <div class="space-y-2">
              ${mission.gendarmes_assignes.map(g => `
                <div class="flex items-center space-x-2 text-sm">
                  <span class="status-${g.statut} px-2 py-1 rounded text-xs font-medium">
                    ${g.statut === 'valide' ? '✓' : '⏱'}
                  </span>
                  <span class="font-medium">${g.grade} ${g.nom} ${g.prenom}</span>
                  <span class="text-gray-500 font-mono text-xs">(${g.matricule})</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
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

// Afficher les informations d'une brigade
async function showBrigadeInfoById(brigadeId) {
  if (!brigadeId) return
  
  try {
    const response = await axios.get(`/api/brigades/${brigadeId}`)
    const brigade = response.data
    
    document.getElementById('brigade-info-titre').textContent = brigade.nom
    document.getElementById('brigade-info-content').innerHTML = `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Code Brigade</label>
            <p class="text-gray-900 font-mono">${brigade.code}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Effectifs</label>
            <p class="text-gray-900">${brigade.effectifs || 0} gendarmes</p>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Adresse</label>
          <p class="text-gray-900">${brigade.adresse}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Téléphone</label>
            <p class="text-gray-900">${brigade.telephone || '-'}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Chef de Brigade</label>
            <p class="text-gray-900">${brigade.chef_brigade || '-'}</p>
          </div>
        </div>
        
        <div class="border-t pt-4 mt-4">
          <h3 class="font-bold text-lg mb-2">Compagnie de rattachement</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700">Nom</label>
            <p class="text-gray-900">${brigade.compagnie_nom}</p>
          </div>
          <div class="mt-2">
            <label class="block text-sm font-medium text-gray-700">Commandant</label>
            <p class="text-gray-900">${brigade.compagnie_commandant || '-'}</p>
          </div>
          <div class="mt-2">
            <label class="block text-sm font-medium text-gray-700">Adresse Compagnie</label>
            <p class="text-gray-900">${brigade.compagnie_adresse || '-'}</p>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('modal-brigade-info').classList.remove('hidden')
  } catch (error) {
    console.error('Erreur chargement brigade:', error)
    alert('Erreur lors du chargement des informations de la brigade')
  }
}

function showBrigadeInfo() {
  if (selectedBrigadeId) {
    showBrigadeInfoById(selectedBrigadeId)
  }
}

function hideBrigadeInfo() {
  document.getElementById('modal-brigade-info').classList.add('hidden')
}

// Sélecteur de brigade
document.getElementById('brigade-selector')?.addEventListener('change', (e) => {
  selectedBrigadeId = e.target.value || null
  document.getElementById('btn-info-brigade').disabled = !selectedBrigadeId
  loadMissions()
})

// Filtres
document.getElementById('filter-priorite')?.addEventListener('change', applyFilters)
document.getElementById('filter-statut')?.addEventListener('change', applyFilters)
document.getElementById('filter-search')?.addEventListener('input', applyFilters)

function applyFilters() {
  const priorite = document.getElementById('filter-priorite').value
  const statut = document.getElementById('filter-statut').value
  const search = document.getElementById('filter-search').value.toLowerCase()
  
  let filtered = allMissions
  
  if (priorite) {
    filtered = filtered.filter(m => m.priorite === priorite)
  }
  
  if (statut === 'complet') {
    filtered = filtered.filter(m => m.effectifs_assignes === m.effectifs_requis)
  } else if (statut === 'partiel') {
    filtered = filtered.filter(m => m.effectifs_assignes > 0 && m.effectifs_assignes < m.effectifs_requis)
  } else if (statut === 'libre') {
    filtered = filtered.filter(m => m.places_libres > 0)
  }
  
  if (search) {
    filtered = filtered.filter(m => 
      m.titre.toLowerCase().includes(search) ||
      m.description.toLowerCase().includes(search) ||
      m.numero_mission.toLowerCase().includes(search) ||
      (m.brigade_nom && m.brigade_nom.toLowerCase().includes(search)) ||
      (m.competences_requises && m.competences_requises.toLowerCase().includes(search))
    )
  }
  
  renderMissions(filtered)
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  loadLogo()
  loadBrigades()
  loadStats()
  loadMissions()
})
