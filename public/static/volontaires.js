// Variables globales
let allMissions = []
let allBrigades = []
let selectedDates = []
let selectedBrigades = []
let currentMonth = dayjs()

// Initialisation
async function init() {
  await loadData()
  renderCalendar()
  renderBrigadeFilters()
  renderMissions()
}

// Charger les données
async function loadData() {
  try {
    const [missionsRes, brigadesRes] = await Promise.all([
      axios.get('/api/missions'),
      axios.get('/api/brigades')
    ])
    
    allMissions = missionsRes.data
    allBrigades = brigadesRes.data
    
    console.log(`${allMissions.length} missions chargées`)
    console.log(`${allBrigades.length} brigades chargées`)
  } catch (error) {
    console.error('Erreur chargement données:', error)
  }
}

// Rendre le calendrier
function renderCalendar() {
  const container = document.getElementById('calendar-container')
  
  const monthName = currentMonth.format('MMMM YYYY')
  const firstDay = currentMonth.startOf('month')
  const lastDay = currentMonth.endOf('month')
  const startDay = firstDay.day() === 0 ? 6 : firstDay.day() - 1 // Lundi = 0
  const daysInMonth = currentMonth.daysInMonth()
  
  // Compter les missions par jour
  const missionsByDay = {}
  allMissions.forEach(m => {
    const dateKey = dayjs(m.date_debut).format('YYYY-MM-DD')
    missionsByDay[dateKey] = (missionsByDay[dateKey] || 0) + 1
  })
  
  let html = `
    <div class="text-center mb-4 flex items-center justify-between">
      <button onclick="previousMonth()" class="p-2 hover:bg-gray-800 rounded">
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="font-bold text-lg capitalize">${monthName}</span>
      <button onclick="nextMonth()" class="p-2 hover:bg-gray-800 rounded">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
    
    <!-- Jours de la semaine -->
    <div class="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-gray-400">
      <div>L</div>
      <div>M</div>
      <div>M</div>
      <div>J</div>
      <div>V</div>
      <div>S</div>
      <div>D</div>
    </div>
    
    <!-- Jours du mois -->
    <div class="grid grid-cols-7 gap-1">
  `
  
  // Cases vides avant le 1er jour
  for (let i = 0; i < startDay; i++) {
    html += '<div class="aspect-square"></div>'
  }
  
  // Jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    const date = currentMonth.date(day)
    const dateKey = date.format('YYYY-MM-DD')
    const isSelected = selectedDates.includes(dateKey)
    const hasMissions = missionsByDay[dateKey] > 0
    const isToday = date.isSame(dayjs(), 'day')
    
    const bgColor = isSelected ? 'bg-blue-600' : isToday ? 'bg-gray-700' : 'bg-gray-800'
    const textColor = isSelected || isToday ? 'text-white' : 'text-gray-300'
    const hoverClass = 'hover:bg-gray-700 cursor-pointer'
    
    html += `
      <div onclick="toggleDate('${dateKey}')" 
           class="${bgColor} ${textColor} ${hoverClass} aspect-square rounded flex flex-col items-center justify-center text-sm relative">
        <span class="font-medium">${day}</span>
        ${hasMissions ? `
          <div class="flex gap-1 mt-1">
            <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
          </div>
        ` : ''}
      </div>
    `
  }
  
  html += '</div>'
  container.innerHTML = html
}

// Basculer sélection date
function toggleDate(dateKey) {
  const index = selectedDates.indexOf(dateKey)
  if (index === -1) {
    selectedDates.push(dateKey)
  } else {
    selectedDates.splice(index, 1)
  }
  
  renderCalendar()
  renderMissions()
}

// Mois précédent
function previousMonth() {
  currentMonth = currentMonth.subtract(1, 'month')
  renderCalendar()
}

// Mois suivant
function nextMonth() {
  currentMonth = currentMonth.add(1, 'month')
  renderCalendar()
}

// Rendre les filtres brigades
function renderBrigadeFilters() {
  const container = document.getElementById('brigade-filters')
  
  let html = `
    <button onclick="toggleAllBrigades()" 
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedBrigades.length === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}">
      <i class="fas fa-check-circle mr-1"></i>
      Toutes les unités
    </button>
  `
  
  allBrigades.forEach(brigade => {
    const isSelected = selectedBrigades.includes(brigade.id)
    const bgColor = isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    
    html += `
      <button onclick="toggleBrigade(${brigade.id})" 
              class="${bgColor} px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        ${brigade.nom}
      </button>
    `
  })
  
  container.innerHTML = html
}

// Basculer toutes brigades
function toggleAllBrigades() {
  selectedBrigades = []
  renderBrigadeFilters()
  renderMissions()
}

// Basculer brigade
function toggleBrigade(brigadeId) {
  const index = selectedBrigades.indexOf(brigadeId)
  if (index === -1) {
    selectedBrigades.push(brigadeId)
  } else {
    selectedBrigades.splice(index, 1)
  }
  
  renderBrigadeFilters()
  renderMissions()
}

// Rendre les missions
function renderMissions() {
  const container = document.getElementById('missions-list')
  
  // Filtrer les missions
  let filteredMissions = allMissions.filter(m => {
    // Filtre par date
    if (selectedDates.length > 0) {
      const missionDate = dayjs(m.date_debut).format('YYYY-MM-DD')
      if (!selectedDates.includes(missionDate)) {
        return false
      }
    }
    
    // Filtre par brigade
    if (selectedBrigades.length > 0 && !selectedBrigades.includes(m.brigade_id)) {
      return false
    }
    
    return true
  })
  
  if (filteredMissions.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-gray-400">
        <i class="fas fa-calendar-times text-4xl mb-4"></i>
        <p>Aucune mission trouvée</p>
        <p class="text-sm mt-2">Sélectionnez une ou plusieurs dates dans le calendrier</p>
      </div>
    `
    return
  }
  
  // Trier par date
  filteredMissions.sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))
  
  let html = ''
  filteredMissions.forEach(mission => {
    const brigade = allBrigades.find(b => b.id === mission.brigade_id)
    const statutClass = mission.effectifs_assignes >= mission.effectifs_requis ? 'bg-green-600' : 'bg-orange-600'
    const placesLibres = mission.effectifs_requis - mission.effectifs_assignes
    const isConvoque = mission.priorite === 'haute' || mission.priorite === 'urgente'
    
    html += `
      <div class="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-indigo-500 transition-colors">
        <!-- En-tête -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="font-bold text-white mb-1">${mission.titre}</h3>
            <div class="text-sm text-indigo-400">${brigade?.nom || 'Brigade inconnue'}</div>
          </div>
          ${isConvoque ? `
            <span class="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              <i class="fas fa-check-circle mr-1"></i>CONVOQUÉ
            </span>
          ` : ''}
        </div>
        
        <!-- Informations -->
        <div class="space-y-2 text-sm text-gray-400 mb-3">
          ${mission.description ? `<p class="text-xs">${mission.description}</p>` : ''}
          
          <div class="flex items-center">
            <i class="fas fa-hashtag w-5 text-gray-500"></i>
            <span>Mission ${mission.numero_mission}</span>
          </div>
          
          <div class="flex items-center">
            <i class="fas fa-calendar w-5 text-gray-500"></i>
            <span>${dayjs(mission.date_debut).format('DD/MM/YYYY')}</span>
          </div>
          
          <div class="flex items-center">
            <i class="fas fa-clock w-5 text-gray-500"></i>
            <span>
              du ${dayjs(mission.date_debut).format('DD/MM/YYYY HH:mm')}
              au ${dayjs(mission.date_fin).format('DD/MM/YYYY HH:mm')}
            </span>
          </div>
        </div>
        
        <!-- Effectifs -->
        <div class="border-t border-gray-700 pt-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-400">Effectifs</span>
            <span class="${statutClass} text-white text-xs px-2 py-1 rounded font-medium">
              ${mission.effectifs_assignes} / ${mission.effectifs_requis}
            </span>
          </div>
          
          ${mission.gendarmes_assignes && mission.gendarmes_assignes.length > 0 ? `
            <div class="text-xs text-gray-400 mb-2">
              <i class="fas fa-users mr-1"></i>
              ${mission.gendarmes_assignes.map(g => `${g.nom} ${g.prenom}`).join(', ')}
            </div>
          ` : ''}
          
          <div class="text-xs ${placesLibres > 0 ? 'text-green-400' : 'text-orange-400'}">
            ${placesLibres > 0 ? 
              `<i class="fas fa-check-circle mr-1"></i>${placesLibres} place(s) disponible(s)` : 
              `<i class="fas fa-times-circle mr-1"></i>Complet`
            }
          </div>
        </div>
      </div>
    `
  })
  
  container.innerHTML = html
}

// Lancer l'initialisation
document.addEventListener('DOMContentLoaded', init)
