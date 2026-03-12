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
        <title>Connexion - GesRes</title>
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

// Page Appels à volontaires (gendarmes)
app.get('/volontaires', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appels à volontaires - GesRes</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <img src="/static/default-logo.png" alt="Logo" class="h-10 w-10 sm:h-12 sm:w-12 object-contain bg-white rounded-lg p-1 shadow-md">
                        <div>
                            <h1 class="text-base sm:text-xl font-bold">GesRes - Appels à volontaires</h1>
                            <p class="text-xs text-blue-200">Portail des missions disponibles</p>
                        </div>
                    </div>
                    <div class="hidden sm:flex space-x-3">
                        <a href="/volontaires" class="px-4 py-2 bg-white text-blue-900 rounded-lg hover:bg-blue-50 font-medium transition-colors shadow-md">
                            <i class="fas fa-hand-paper mr-2"></i>Appels à volontaires
                        </a>
                        <a href="/admin" class="px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-lg transition-colors">
                            <i class="fas fa-cog mr-2"></i>Administration
                        </a>
                    </div>
                </div>
            </div>
        </nav>

        <div class="container mx-auto px-4 py-8 max-w-7xl">
          <h1 class="text-3xl font-bold text-blue-900 mb-8">Appels à volontaires</h1>
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Colonne gauche : Affichage & Filtres -->
            <div class="lg:col-span-1 space-y-6">
              <!-- Section Affichage -->
              <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Affichage</h2>
                <div class="space-y-3">
                  <div class="text-sm text-gray-600 mb-3 font-medium">
                    Missions à venir
                  </div>
                  <p class="text-xs text-gray-500">Appels à volontaires, volontariats, disponibilités</p>
                  
                  <div class="space-y-2">
                    <label class="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                      <input type="checkbox" id="filter-volontaire" checked class="w-5 h-5 rounded text-blue-600">
                      <span class="flex items-center">
                        <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span class="text-gray-700">Appel à volontaire</span>
                      </span>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                      <input type="checkbox" id="filter-disponibilite" checked class="w-5 h-5 rounded text-blue-600">
                      <span class="text-blue-600 font-medium">DISPONIBILITÉ</span>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                      <input type="checkbox" id="filter-convocation" checked class="w-5 h-5 rounded text-green-600">
                      <span class="text-green-600 font-medium">CONVOCATION</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Section Calendrier -->
              <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div class="text-center text-sm text-gray-600 mb-4">
                  Veuillez sélectionner au moins une journée<br>pour compléter votre affichage
                </div>
                
                <div id="calendar-container" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <!-- Calendrier généré dynamiquement -->
                </div>
              </div>
            </div>
            
            <!-- Colonne droite : Sélection des missions -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Sélection</h2>
                <p class="text-sm text-gray-600 mb-6">
                  Détail de la mission sélectionnée dans le calendrier du bandeau supérieur.
                </p>
                
                <!-- Filtres par brigade -->
                <div id="brigade-filters" class="flex flex-wrap gap-2 mb-6">
                  <!-- Boutons brigade générés dynamiquement -->
                </div>
                
                <!-- Liste des missions -->
                <div id="missions-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Cartes mission générées dynamiquement -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/locale/fr.js"></script>
        <script>
          dayjs.locale('fr')
        </script>
        <script src="/static/volontaires.js"></script>
    </body>
    </html>
  `)
})

// Page d'accueil - Redirection vers appels à volontaires
app.get('/', (c) => {
  return c.redirect('/volontaires')
})

// Page d'administration
app.get('/admin', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Administration - GesRes</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Menu hamburger mobile (admin) -->
        <div id="hamburger-menu-admin" class="hamburger-menu fixed top-4 right-4 z-50" onclick="toggleMobileMenuAdmin()">
            <span></span>
            <span></span>
            <span></span>
        </div>

        <!-- Backdrop du menu mobile -->
        <div id="mobile-nav-backdrop-admin" class="mobile-nav-backdrop" onclick="closeMobileMenuAdmin()"></div>

        <!-- Menu mobile overlay (admin) -->
        <div id="mobile-nav-overlay-admin" class="mobile-nav-overlay">
            <div class="flex flex-col space-y-4">
                <div class="text-center mb-6">
                    <img id="mobile-logo-admin" src="/static/default-logo.png" alt="Logo" class="h-20 w-20 mx-auto object-contain bg-white rounded-lg p-2 shadow-lg mb-3">
                    <h2 class="text-xl font-bold text-white">GesRes Admin</h2>
                    <p id="mobile-user-info" class="text-sm text-blue-200"></p>
                </div>
                
                <button onclick="navigateFromMobileAdmin('missions')" class="w-full px-6 py-4 bg-white text-blue-900 rounded-lg hover:bg-blue-50 font-medium transition-colors shadow-md text-left">
                    <i class="fas fa-list mr-3"></i>Missions publiques
                </button>
                
                <button onclick="navigateFromMobileAdmin('admin')" class="w-full px-6 py-4 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors text-left">
                    <i class="fas fa-cog mr-3"></i>Administration
                </button>
                
                <button onclick="logout()" class="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-left">
                    <i class="fas fa-sign-out-alt mr-3"></i>Déconnexion
                </button>
                
                <div class="mt-8 pt-8 border-t border-blue-700 text-center text-blue-200 text-sm">
                    <p>Gendarmerie Nationale</p>
                    <p class="text-xs mt-1">Admin Mobile 1.0</p>
                </div>
            </div>
        </div>

        <nav class="bg-blue-900 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <img id="nav-logo" src="/static/default-logo.png" alt="Logo" class="h-10 w-10 object-contain bg-white rounded p-1 cursor-pointer" onclick="showLogoUploadModal()">
                        <h1 class="text-base sm:text-xl font-bold">GesRes - Administration</h1>
                    </div>
                    <div class="desktop-menu hidden lg:flex items-center space-x-4">
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

        <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
            <!-- Onglets -->
            <div class="bg-white rounded-lg shadow mb-4 sm:mb-6 overflow-x-auto">
                <div class="flex border-b min-w-max">
                    <button onclick="switchTab('missions')" id="tab-missions" 
                            class="tab-btn px-3 sm:px-6 py-2 sm:py-3 font-medium text-blue-600 border-b-2 border-blue-600 text-sm sm:text-base whitespace-nowrap">
                        <i class="fas fa-clipboard-list mr-1 sm:mr-2"></i><span class="hidden sm:inline">Missions</span><span class="sm:hidden">Miss.</span>
                    </button>
                    <button onclick="switchTab('lieux')" id="tab-lieux" 
                            class="tab-btn px-3 sm:px-6 py-2 sm:py-3 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent text-sm sm:text-base whitespace-nowrap">
                        <i class="fas fa-map-marked-alt mr-1 sm:mr-2"></i><span class="hidden sm:inline">Compagnies & Brigades</span><span class="sm:hidden">Lieux</span>
                    </button>
                    <button onclick="switchTab('gendarmes')" id="tab-gendarmes" 
                            class="tab-btn px-3 sm:px-6 py-2 sm:py-3 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent text-sm sm:text-base whitespace-nowrap">
                        <i class="fas fa-users mr-1 sm:mr-2"></i>Gendarmes
                    </button>
                    <button onclick="switchTab('parametres')" id="tab-parametres" 
                            class="tab-btn px-3 sm:px-6 py-2 sm:py-3 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent text-sm sm:text-base whitespace-nowrap">
                        <i class="fas fa-cog mr-1 sm:mr-2"></i><span class="hidden sm:inline">Paramètres</span><span class="sm:hidden">Param.</span>
                    </button>
                </div>
            </div>

            <!-- Contenu Missions -->
            <div id="content-missions" class="space-y-4"></div>
            
            <!-- Contenu Lieux -->
            <div id="content-lieux" class="hidden space-y-4"></div>
            
            <!-- Contenu Gendarmes -->
            <div id="content-gendarmes" class="hidden space-y-4">
                <div class="bg-white rounded-lg shadow-lg p-3 sm:p-4 mb-4">
                    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div class="flex items-center space-x-3 flex-1">
                            <i class="fas fa-search text-xl text-gray-400"></i>
                            <input type="text" id="search-gendarme" 
                                   placeholder="Rechercher un gendarme..." 
                                   class="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base">
                        </div>
                        <button onclick="showNewGendarmeModal()" class="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap text-sm sm:text-base">
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
                    
                    <!-- Aperçu du logo actuel -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2">Aperçu actuel</label>
                        <div class="flex items-center gap-4">
                            <img id="current-logo-preview" src="/static/default-logo.png" alt="Logo actuel" 
                                 class="h-24 w-24 object-contain border-2 border-gray-300 rounded-lg p-2 bg-white">
                            <div class="text-sm text-gray-600">
                                <p>Ce logo est affiché en haut de toutes les pages</p>
                            </div>
                        </div>
                    </div>
                    
                    <form id="form-logo">
                        <!-- Option 1: Téléverser un fichier -->
                        <div class="mb-6 p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                            <label class="block text-sm font-semibold mb-2 text-blue-900">
                                <i class="fas fa-upload mr-2"></i>Option 1 : Téléverser une image depuis votre ordinateur
                            </label>
                            <input type="file" id="logo-file" accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml"
                                   class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                            <p class="text-xs text-gray-600 mt-2">
                                <i class="fas fa-info-circle mr-1"></i>Formats acceptés : PNG, JPG, GIF, SVG (max 2 Mo)
                            </p>
                            <!-- Aperçu du fichier sélectionné -->
                            <div id="file-preview" class="hidden mt-4">
                                <label class="block text-sm font-medium mb-2">Aperçu de l'image sélectionnée</label>
                                <img id="file-preview-img" src="" alt="Aperçu" 
                                     class="h-32 w-32 object-contain border-2 border-green-300 rounded-lg p-2 bg-white">
                            </div>
                        </div>
                        
                        <!-- Option 2: URL externe -->
                        <div class="mb-6 p-4 border-2 border-gray-300 rounded-lg">
                            <label class="block text-sm font-semibold mb-2">
                                <i class="fas fa-link mr-2"></i>Option 2 : URL d'une image en ligne
                            </label>
                            <input type="url" id="logo-url" placeholder="https://example.com/logo.png"
                                   class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                            <p class="text-xs text-gray-600 mt-2">
                                <i class="fas fa-info-circle mr-1"></i>Entrez l'URL complète d'une image hébergée en ligne
                            </p>
                        </div>
                        
                        <div class="flex gap-4">
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <i class="fas fa-save mr-2"></i>Enregistrer le logo
                            </button>
                            <button type="button" onclick="resetLogo()" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                                <i class="fas fa-undo mr-2"></i>Réinitialiser
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Section Import Excel des missions -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">
                        <i class="fas fa-file-excel mr-2 text-green-600"></i>Import de missions depuis Excel
                    </h3>
                    
                    <div class="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                        <p class="text-sm text-gray-700 mb-2">
                            <i class="fas fa-info-circle text-green-500 mr-2"></i>
                            <strong>Format Excel attendu :</strong>
                        </p>
                        <div class="text-sm text-gray-600 ml-6 space-y-1">
                            <p><strong>Colonnes obligatoires</strong> (dans l'ordre) :</p>
                            <ol class="list-decimal ml-4 space-y-1">
                                <li><strong>Numéro de mission</strong> (ex: 1819992)</li>
                                <li><strong>Date début</strong> (format: JJ/MM/AA HH:MM:SS ou DD/MM/YYYY HH:MM:SS)</li>
                                <li><strong>Date fin</strong> (format: JJ/MM/AA HH:MM:SS ou DD/MM/YYYY HH:MM:SS)</li>
                                <li><strong>Description</strong> (ex: Ordre et sécurité publique)</li>
                                <li><strong>Titre</strong> (ex: Renfort PAM)</li>
                                <li><strong>Code brigade</strong> (ex: 58577 ou BTA-PERSAN)</li>
                            </ol>
                            <p class="mt-2"><strong>Colonnes optionnelles</strong> :</p>
                            <ol class="list-decimal ml-4 space-y-1" start="7">
                                <li><strong>Effectifs requis</strong> (défaut: 1)</li>
                                <li><strong>Priorité</strong> (normale/haute/urgente, défaut: normale)</li>
                                <li><strong>Compétences</strong> (séparées par virgule)</li>
                            </ol>
                        </div>
                    </div>
                    
                    <!-- Zone de téléchargement du fichier -->
                    <div class="mb-6 p-6 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
                        <label class="block text-sm font-semibold mb-2 text-green-900">
                            <i class="fas fa-upload mr-2"></i>Sélectionnez votre fichier Excel
                        </label>
                        <input type="file" id="excel-file" accept=".xlsx,.xls"
                               class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 bg-white">
                        <p class="text-xs text-gray-600 mt-2">
                            <i class="fas fa-info-circle mr-1"></i>Formats acceptés : .xlsx, .xls
                        </p>
                    </div>
                    
                    <!-- Aperçu des données -->
                    <div id="excel-preview" class="hidden mb-6">
                        <label class="block text-sm font-semibold mb-2">
                            <i class="fas fa-eye mr-2"></i>Aperçu des données (5 premières lignes)
                        </label>
                        <div class="overflow-x-auto">
                            <table id="excel-preview-table" class="min-w-full border-collapse border border-gray-300">
                                <thead class="bg-gray-100">
                                    <tr id="excel-preview-headers"></tr>
                                </thead>
                                <tbody id="excel-preview-body"></tbody>
                            </table>
                        </div>
                        <div class="mt-2 text-sm text-gray-600">
                            <span id="excel-total-rows"></span>
                        </div>
                    </div>
                    
                    <!-- Résultats de l'import -->
                    <div id="import-results" class="hidden mb-6"></div>
                    
                    <!-- Boutons d'action -->
                    <div class="flex gap-3">
                        <button onclick="processExcelFile()" id="btn-import-excel"
                                class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                            <i class="fas fa-file-import mr-2"></i>Importer les missions
                        </button>
                        <button onclick="downloadExcelTemplate()" 
                                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-download mr-2"></i>Télécharger le modèle Excel
                        </button>
                    </div>
                </div>
                
                <!-- Section Nettoyage automatique des missions -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">
                        <i class="fas fa-broom mr-2"></i>Nettoyage automatique des missions
                    </h3>
                    
                    <div class="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p class="text-sm text-gray-700 mb-2">
                            <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                            <strong>Fonctionnement automatique :</strong>
                        </p>
                        <ul class="text-sm text-gray-600 ml-6 space-y-1">
                            <li>• Les missions sont automatiquement supprimées le 1er de chaque mois</li>
                            <li>• Seules les missions terminées <strong>avant le mois précédent</strong> sont supprimées</li>
                            <li>• Exemple : le 1er avril, toutes les missions terminées avant mars sont supprimées</li>
                            <li>• Les assignations liées sont également supprimées automatiquement</li>
                        </ul>
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2">Statut des missions expirées</label>
                        <div id="cleanup-status" class="p-4 bg-gray-50 rounded-lg border">
                            <p class="text-sm text-gray-500">
                                <i class="fas fa-spinner fa-spin mr-2"></i>Chargement...
                            </p>
                        </div>
                    </div>
                    
                    <div class="flex gap-4">
                        <button onclick="checkCleanupStatus()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-sync mr-2"></i>Vérifier les missions à supprimer
                        </button>
                        <button onclick="cleanupExpiredMissionsNow()" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            <i class="fas fa-trash-alt mr-2"></i>Supprimer maintenant
                        </button>
                    </div>
                    
                    <div class="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                        <p class="text-xs text-yellow-800">
                            <i class="fas fa-exclamation-triangle mr-1"></i>
                            <strong>Attention :</strong> La suppression est définitive et ne peut pas être annulée.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tous les modals (mission, lieu, gendarme, assignations, logo, etc.) -->
        <div id="modals-container"></div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/locale/fr.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
        <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
        <script src="/static/admin.js"></script>
    </body>
    </html>
  `)
})

export default app
