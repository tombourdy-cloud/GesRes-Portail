#!/bin/bash
# Script de déploiement GesRes sur Cloudflare Pages
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement GesRes sur Cloudflare Pages"
echo "=========================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json introuvable"
    echo "Exécutez ce script depuis /home/user/webapp"
    exit 1
fi

# 2. Build du projet
echo -e "${BLUE}📦 Étape 1/3 : Build du projet...${NC}"
npm run build
echo -e "${GREEN}✅ Build terminé${NC}"
echo ""

# 3. Vérifier que dist/ existe
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le dossier dist/ n'existe pas"
    exit 1
fi

# 4. Afficher la taille du build
BUILD_SIZE=$(du -sh dist | cut -f1)
echo -e "${BLUE}📊 Taille du build: ${BUILD_SIZE}${NC}"
echo ""

# 5. Déployer sur Cloudflare Pages
echo -e "${BLUE}🚀 Étape 2/3 : Déploiement sur Cloudflare Pages...${NC}"
npx wrangler pages deploy dist --project-name gesres-missions
echo -e "${GREEN}✅ Déploiement terminé${NC}"
echo ""

# 6. Afficher les URLs
echo -e "${BLUE}🌐 Étape 3/3 : Informations de déploiement${NC}"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ Votre site est en ligne !${NC}"
echo ""
echo "📍 URLs disponibles:"
echo "   Production: https://gesres-missions.pages.dev"
echo "   Branche:    https://main.gesres-missions.pages.dev"
echo "   Admin:      https://gesres-missions.pages.dev/admin"
echo "   API:        https://gesres-missions.pages.dev/api/*"
echo ""
echo "🔐 Identifiants admin par défaut:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo -e "${YELLOW}⚠️  N'oubliez pas de changer le mot de passe admin !${NC}"
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Déploiement réussi !${NC}"
