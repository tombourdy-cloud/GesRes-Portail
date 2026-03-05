import { Hono } from 'hono'
import apiRoutes from './api'

const app = new Hono()

// Monter les routes API
app.route('/', apiRoutes)

// ==================== PAGES ====================

// Page de connexion
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Connexion - Administration</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-900 to-blue-700 min-h-screen flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
            <div class="text-center mb-8">
                <i class="fas fa-shield-alt text-6xl text-blue-900 mb-4"></i>
                <h1 class="text-2xl font-bold text-gray-800">Administration</h1>
                <p class="text-gray-600">Gestion des Missions - Réserve</p>
            </div>
            
            <form id="login-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        <i class="fas fa-user mr-2"></i>Nom d'utilisateur
                    </label>
                    <input type="text" id="username" required 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        <i class="fas fa-lock mr-2"></i>Mot de passe
                    </label>
                    <input type="password" id="password" required 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                
                <div id="error-message" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"></div>
                
                <button type="submit" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                </button>
            </form>
            
            <div class="mt-6 text-center text-sm text-gray-600">
                <p>Compte de test: <strong>admin</strong> / <strong>admin123</strong></p>
            </div>
            
            <div class="mt-6 text-center">
                <a href="/" class="text-blue-600 hover:text-blue-800 text-sm">
                    <i class="fas fa-arrow-left mr-1"></i>Retour aux missions
                </a>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/login.js"></script>
    </body>
    </html>
  `)
})

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
        <link href="/static/style.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <nav class="bg-blue-900 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <img id="nav-logo" src="/static/default-logo.png" alt="Logo" class="h-10 w-10 object-contain bg-white rounded p-1">
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
            <!-- Sélecteur de brigade -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div class="flex items-center space-x-4">
                    <i class="fas fa-building text-2xl text-blue-600"></i>
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Sélectionner une brigade</label>
                        <select id="brigade-selector" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Toutes les brigades</option>
                        </select>
                    </div>
                    <button id="btn-info-brigade" onclick="showBrigadeInfo()" disabled
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                        <i class="fas fa-info-circle mr-2"></i>Informations
                    </button>
                </div>
            </div>

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

        <!-- Modal informations brigade -->
        <div id="modal-brigade-info" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold" id="brigade-info-titre">Informations Brigade</h2>
                    <button onclick="hideBrigadeInfo()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <div id="brigade-info-content"></div>
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
        <link href="/static/style.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <nav class="bg-blue-900 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <img id="nav-logo" src="/static/default-logo.png" alt="Logo" class="h-10 w-10 object-contain bg-white rounded p-1 cursor-pointer" onclick="showLogoUploadModal()">
                        <h1 class="text-xl font-bold">Administration des Missions</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span id="user-info" class="text-sm"></span>
                        <a href="/" class="px-4 py-2 hover:bg-blue-800 rounded">
                            <i class="fas fa-list mr-2"></i>Missions
                        </a>
                        <a href="/admin" class="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600">
                            <i class="fas fa-cog mr-2"></i>Administration
                        </a>
                        <button onclick="logout()" class="px-4 py-2 bg-red-600 rounded hover:bg-red-700">
                            <i class="fas fa-sign-out-alt mr-2"></i>Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="container mx-auto px-4 py-8">
            <!-- Onglets -->
            <div class="bg-white rounded-lg shadow mb-6">
                <div class="flex border-b">
                    <button onclick="switchTab('missions')" id="tab-missions" 
                            class="tab-btn px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600">
                        <i class="fas fa-clipboard-list mr-2"></i>Missions
                    </button>
                    <button onclick="switchTab('lieux')" id="tab-lieux" 
                            class="tab-btn px-6 py-3 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
                        <i class="fas fa-map-marked-alt mr-2"></i>Compagnies & Brigades
                    </button>
                    <button onclick="switchTab('gendarmes')" id="tab-gendarmes" 
                            class="tab-btn px-6 py-3 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
                        <i class="fas fa-users mr-2"></i>Gendarmes
                    </button>
                    <button onclick="switchTab('parametres')" id="tab-parametres" 
                            class="tab-btn px-6 py-3 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
                        <i class="fas fa-cog mr-2"></i>Paramètres
                    </button>
                </div>
            </div>

            <!-- Contenu Missions -->
            <div id="content-missions" class="space-y-4"></div>
            
            <!-- Contenu Lieux -->
            <div id="content-lieux" class="hidden space-y-4"></div>
            
            <!-- Contenu Gendarmes -->
            <div id="content-gendarmes" class="hidden space-y-4">
                <div class="bg-white rounded-lg shadow-lg p-4 mb-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3 flex-1">
                            <i class="fas fa-search text-xl text-gray-400"></i>
                            <input type="text" id="search-gendarme" 
                                   placeholder="Rechercher un gendarme par nom, matricule, grade, spécialité..." 
                                   class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        </div>
                        <button onclick="showNewGendarmeModal()" class="ml-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <i class="fas fa-plus mr-2"></i>Nouveau gendarme
                        </button>
                    </div>
                </div>
                <div id="gendarmes-table-container"></div>
            </div>
            
            <!-- Contenu Paramètres -->
            <div id="content-parametres" class="hidden space-y-4">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">
                        <i class="fas fa-image mr-2"></i>Logo / Écusson
                    </h3>
                    <form id="form-logo">
                        <div class="mb-4">
                            <label class="block text-sm font-medium mb-2">URL de l'image</label>
                            <input type="url" id="logo-url" placeholder="https://example.com/logo.png"
                                   class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                        </div>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>Enregistrer
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Tous les modals (mission, lieu, gendarme, assignations, logo, etc.) -->
        <div id="modals-container"></div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
        <script src="/static/admin.js"></script>
    </body>
    </html>
  `)
})

export default app
