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
        <link href="/static/style.css" rel="stylesheet">
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
        <nav class="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <img id="nav-logo" src="/static/default-logo.png" alt="Logo" class="h-12 w-12 object-contain bg-white rounded-lg p-1 shadow-md">
                        <div>
                            <h1 class="text-xl font-bold">Missions Réserve Gendarmerie</h1>
                            <p class="text-xs text-blue-200">Portail des missions disponibles</p>
                        </div>
                    </div>
                    <div class="flex space-x-3">
                        <a href="/" class="px-4 py-2 bg-white text-blue-900 rounded-lg hover:bg-blue-50 font-medium transition-colors shadow-md">
                            <i class="fas fa-list mr-2"></i>Missions
                        </a>
                        <a href="/admin" class="px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-lg transition-colors">
                            <i class="fas fa-cog mr-2"></i>Administration
                        </a>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Breadcrumb -->
        <div class="bg-blue-800 text-white shadow-inner">
            <div class="container mx-auto px-4 py-3">
                <div id="breadcrumb" class="flex items-center text-sm">
                    <i class="fas fa-home text-blue-300"></i>
                    <span class="text-white font-medium ml-2">Sélection de la compagnie</span>
                </div>
            </div>
        </div>

        <div class="container mx-auto px-4 py-8">
            <!-- Contenu principal -->
            <div id="main-content"></div>
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
