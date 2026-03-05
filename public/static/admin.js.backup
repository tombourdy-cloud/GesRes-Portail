// Configuration de dayjs en français
dayjs.locale('fr')

let allMissions = []
let allGendarmes = []
let currentTab = 'missions'

// Charger les missions
async function loadMissions() {
  try {
    const response = await axios.get('/api/missions')
    allMissions = response.data
    renderAdminMissions(allMissions)
  } catch (error) {
    console.error('Erreur chargement missions:', error)
    document.getElementById('content-missions').innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        Erreur lors du chargement des missions
      </div>
    `
  }
}

// Charger les gendarmes
async function loadGendarmes() {
  try {
    const response = await axios.get('/api/gendarmes')
    allGendarmes = response.data
    renderAdminGendarmes(allGendarmes)
  } catch (error) {
    console.error('Erreur chargement gendarmes:', error)
    document.getElementById('content-gendarmes').innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        Erreur lors du chargement des gendarmes
      </div>
    `
  }
}

// Afficher les missions (mode admin)
function renderAdminMissions(missions) {
  const container = document.getElementById('content-missions')
  
  if (missions.length === 0) {
    container.innerHTML = `
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <i class="fas fa-inbox text-4xl text-gray-400 mb-2"></i>
        <p class="text-gray-500">Aucune mission créée</p>
      </div>
    `
    return
  }
  
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mission</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lieu</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date début</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effectifs</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${missions.map(mission => {
            const dateDebut = dayjs(mission.date_debut).format('DD/MM/YYYY HH:mm')
            const progressPct = Math.round((mission.effectifs_assignes / mission.effectifs_requis) * 100)
            
            return `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="font-medium text-gray-900">${mission.titre}</div>
                  <div class="text-sm text-gray-500">${mission.description.substring(0, 60)}...</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">${mission.lieu}</td>
                <td class="px-6 py-4 text-sm text-gray-700">${dateDebut}</td>
                <td class="px-6 py-4">
                  <div class="text-sm">
                    <div class="font-medium">${mission.effectifs_assignes}/${mission.effectifs_requis}</div>
                    <div class="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div class="bg-green-500 h-2 rounded-full" style="width: ${progressPct}%"></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs rounded ${getPriorityClass(mission.priorite)}">
                    ${getPriorityLabel(mission.priorite)}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <button onclick="showAssignationsModal(${mission.id})" 
                          class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-users mr-1"></i>Gérer
                  </button>
                  <button onclick="deleteMission(${mission.id})" 
                          class="text-red-600 hover:text-red-800">
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

// Afficher les gendarmes (mode admin)
function renderAdminGendarmes(gendarmes) {
  const container = document.getElementById('content-gendarmes')
  
  if (gendarmes.length === 0) {
    container.innerHTML = `
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <i class="fas fa-inbox text-4xl text-gray-400 mb-2"></i>
        <p class="text-gray-500">Aucun gendarme enregistré</p>
      </div>
    `
    return
  }
  
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spécialité</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Missions</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${gendarmes.map(gendarme => `
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 font-mono text-sm">${gendarme.matricule}</td>
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">${gendarme.nom} ${gendarme.prenom}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">${gendarme.grade}</td>
              <td class="px-6 py-4 text-sm text-gray-700">${gendarme.specialite || '-'}</td>
              <td class="px-6 py-4 text-sm">
                <div>${gendarme.telephone || '-'}</div>
                <div class="text-gray-500">${gendarme.email || '-'}</div>
              </td>
              <td class="px-6 py-4 text-sm">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  ${gendarme.missions_actives || 0} mission(s)
                </span>
              </td>
              <td class="px-6 py-4">
                ${gendarme.disponible ? 
                  '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Disponible</span>' :
                  '<span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Indisponible</span>'
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
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

// Gestion des onglets
function switchTab(tab) {
  currentTab = tab
  
  // Mettre à jour l'apparence des onglets
  document.getElementById('tab-missions').className = tab === 'missions' 
    ? 'px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600'
    : 'px-6 py-3 font-medium text-gray-500 hover:text-gray-700'
    
  document.getElementById('tab-gendarmes').className = tab === 'gendarmes'
    ? 'px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600'
    : 'px-6 py-3 font-medium text-gray-500 hover:text-gray-700'
  
  // Afficher/masquer le contenu
  document.getElementById('content-missions').className = tab === 'missions' ? 'space-y-4' : 'hidden space-y-4'
  document.getElementById('content-gendarmes').className = tab === 'gendarmes' ? 'space-y-4' : 'hidden space-y-4'
  
  // Charger les données si nécessaire
  if (tab === 'gendarmes' && allGendarmes.length === 0) {
    loadGendarmes()
  }
}

// Modal pour ajouter une mission
function showAddMissionModal() {
  document.getElementById('modal-mission').classList.remove('hidden')
}

function hideAddMissionModal() {
  document.getElementById('modal-mission').classList.add('hidden')
  document.getElementById('form-mission').reset()
}

document.getElementById('form-mission')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const data = {
    titre: document.getElementById('mission-titre').value,
    description: document.getElementById('mission-description').value,
    lieu: document.getElementById('mission-lieu').value,
    date_debut: document.getElementById('mission-debut').value,
    date_fin: document.getElementById('mission-fin').value,
    effectifs_requis: parseInt(document.getElementById('mission-effectifs').value),
    competences_requises: document.getElementById('mission-competences').value,
    priorite: document.getElementById('mission-priorite').value
  }
  
  try {
    await axios.post('/api/missions', data)
    hideAddMissionModal()
    loadMissions()
    alert('Mission créée avec succès')
  } catch (error) {
    console.error('Erreur création mission:', error)
    alert('Erreur lors de la création de la mission')
  }
})

// Modal pour ajouter un gendarme
function showAddGendarmeModal() {
  document.getElementById('modal-gendarme').classList.remove('hidden')
}

function hideAddGendarmeModal() {
  document.getElementById('modal-gendarme').classList.add('hidden')
  document.getElementById('form-gendarme').reset()
}

document.getElementById('form-gendarme')?.addEventListener('submit', async (e) => {
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
    hideAddGendarmeModal()
    loadGendarmes()
    alert('Gendarme créé avec succès')
  } catch (error) {
    console.error('Erreur création gendarme:', error)
    alert('Erreur lors de la création du gendarme')
  }
})

// Supprimer une mission
async function deleteMission(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
    return
  }
  
  try {
    await axios.delete(`/api/missions/${id}`)
    loadMissions()
    alert('Mission supprimée avec succès')
  } catch (error) {
    console.error('Erreur suppression mission:', error)
    alert('Erreur lors de la suppression de la mission')
  }
}

// Modal pour gérer les assignations d'une mission
async function showAssignationsModal(missionId) {
  document.getElementById('modal-assignations').classList.remove('hidden')
  
  try {
    const response = await axios.get(`/api/missions/${missionId}`)
    const { mission, assignations } = response.data
    
    // Charger tous les gendarmes si pas encore fait
    if (allGendarmes.length === 0) {
      const gendarmesResponse = await axios.get('/api/gendarmes')
      allGendarmes = gendarmesResponse.data
    }
    
    document.getElementById('modal-mission-titre').textContent = mission.titre
    
    const content = document.getElementById('assignations-content')
    content.innerHTML = `
      <div class="mb-4 p-4 bg-blue-50 rounded-lg">
        <div class="text-sm text-gray-700">
          <strong>Lieu:</strong> ${mission.lieu}<br>
          <strong>Date:</strong> ${dayjs(mission.date_debut).format('DD/MM/YYYY HH:mm')} - ${dayjs(mission.date_fin).format('DD/MM/YYYY HH:mm')}<br>
          <strong>Effectifs requis:</strong> ${mission.effectifs_requis}<br>
          ${mission.competences_requises ? `<strong>Compétences:</strong> ${mission.competences_requises}` : ''}
        </div>
      </div>
      
      <div class="space-y-3">
        ${assignations.map(assignation => `
          <div class="border rounded-lg p-4 ${assignation.statut === 'valide' ? 'bg-green-50 border-green-200' : 
                                            assignation.statut === 'en_attente' ? 'bg-yellow-50 border-yellow-200' : 
                                            'bg-gray-50 border-gray-200'}">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                ${assignation.gendarme_id ? `
                  <div class="font-medium text-gray-900">
                    ${assignation.grade} ${assignation.nom} ${assignation.prenom}
                  </div>
                  <div class="text-sm text-gray-600">
                    ${assignation.matricule} - ${assignation.specialite || 'Aucune spécialité'}
                  </div>
                ` : `
                  <div class="text-gray-500">
                    <i class="fas fa-user-plus mr-2"></i>Place libre
                  </div>
                `}
                
                <div class="mt-2">
                  <span class="status-${assignation.statut} px-2 py-1 rounded text-xs font-medium">
                    ${getStatutLabel(assignation.statut)}
                  </span>
                </div>
              </div>
              
              <div class="flex space-x-2">
                ${assignation.statut === 'libre' ? `
                  <button onclick="assignGendarme(${assignation.id}, ${missionId})" 
                          class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    <i class="fas fa-user-plus mr-1"></i>Assigner
                  </button>
                ` : ''}
                
                ${assignation.statut === 'en_attente' ? `
                  <button onclick="validateAssignation(${assignation.id}, ${assignation.gendarme_id}, ${missionId})" 
                          class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    <i class="fas fa-check mr-1"></i>Valider
                  </button>
                ` : ''}
                
                ${assignation.gendarme_id ? `
                  <button onclick="liberateAssignation(${assignation.id}, ${missionId})" 
                          class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                    <i class="fas fa-times mr-1"></i>Libérer
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="mt-6 flex justify-end">
        <button onclick="hideAssignationsModal()" 
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
          Fermer
        </button>
      </div>
    `
  } catch (error) {
    console.error('Erreur chargement assignations:', error)
    content.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Erreur lors du chargement des assignations
      </div>
    `
  }
}

function hideAssignationsModal() {
  document.getElementById('modal-assignations').classList.add('hidden')
}

function getStatutLabel(statut) {
  const labels = {
    'valide': 'Validé',
    'en_attente': 'En attente',
    'libre': 'Libre'
  }
  return labels[statut] || statut
}

// Assigner un gendarme à une place libre
async function assignGendarme(assignationId, missionId) {
  // Créer un sélecteur de gendarmes
  const gendarmeOptions = allGendarmes
    .filter(g => g.disponible)
    .map(g => `<option value="${g.id}">${g.grade} ${g.nom} ${g.prenom} (${g.matricule}) - ${g.specialite || 'Sans spécialité'}</option>`)
    .join('')
  
  if (!gendarmeOptions) {
    alert('Aucun gendarme disponible')
    return
  }
  
  const html = `
    <select id="select-gendarme" class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3">
      <option value="">Sélectionner un gendarme...</option>
      ${gendarmeOptions}
    </select>
    <textarea id="commentaire-assignation" placeholder="Commentaire (optionnel)" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" rows="2"></textarea>
    <div class="flex justify-end space-x-2">
      <button onclick="document.getElementById('temp-modal').remove()" 
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
        Annuler
      </button>
      <button onclick="confirmAssignGendarme(${assignationId}, ${missionId})" 
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Assigner
      </button>
    </div>
  `
  
  const modal = document.createElement('div')
  modal.id = 'temp-modal'
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  modal.innerHTML = `<div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">${html}</div>`
  document.body.appendChild(modal)
}

async function confirmAssignGendarme(assignationId, missionId) {
  const gendarmeId = document.getElementById('select-gendarme').value
  const commentaire = document.getElementById('commentaire-assignation').value
  
  if (!gendarmeId) {
    alert('Veuillez sélectionner un gendarme')
    return
  }
  
  try {
    await axios.put(`/api/assignations/${assignationId}`, {
      gendarme_id: gendarmeId,
      statut: 'en_attente',
      commentaire: commentaire
    })
    
    document.getElementById('temp-modal')?.remove()
    showAssignationsModal(missionId)
    loadMissions()
    alert('Gendarme assigné en attente de validation')
  } catch (error) {
    console.error('Erreur assignation:', error)
    alert('Erreur lors de l\'assignation')
  }
}

// Valider une assignation
async function validateAssignation(assignationId, gendarmeId, missionId) {
  if (!confirm('Valider cette assignation ?')) {
    return
  }
  
  try {
    await axios.put(`/api/assignations/${assignationId}`, {
      gendarme_id: gendarmeId,
      statut: 'valide'
    })
    
    showAssignationsModal(missionId)
    loadMissions()
    alert('Assignation validée avec succès')
  } catch (error) {
    console.error('Erreur validation:', error)
    alert('Erreur lors de la validation')
  }
}

// Libérer une assignation
async function liberateAssignation(assignationId, missionId) {
  if (!confirm('Libérer cette assignation ? Le gendarme sera retiré de la mission.')) {
    return
  }
  
  try {
    await axios.put(`/api/assignations/${assignationId}`, {
      statut: 'libre'
    })
    
    showAssignationsModal(missionId)
    loadMissions()
    alert('Assignation libérée avec succès')
  } catch (error) {
    console.error('Erreur libération:', error)
    alert('Erreur lors de la libération')
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  loadMissions()
})
