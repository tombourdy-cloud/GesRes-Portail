#!/bin/bash
# Script de création d'utilisateur admin
# Usage: ./create_user.sh

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  🔐 Création d'un nouvel utilisateur admin - GesRes"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Demander les informations
read -p "Nom d'utilisateur (ex: jean.dupont) : " USERNAME
read -p "Prénom : " PRENOM
read -p "Nom : " NOM
read -s -p "Mot de passe : " PASSWORD
echo ""
read -s -p "Confirmer le mot de passe : " PASSWORD_CONFIRM
echo ""
echo ""

# Vérifier que les mots de passe correspondent
if [ "$PASSWORD" != "$PASSWORD_CONFIRM" ]; then
    echo "❌ Erreur : Les mots de passe ne correspondent pas"
    exit 1
fi

# Vérifier que tous les champs sont remplis
if [ -z "$USERNAME" ] || [ -z "$PRENOM" ] || [ -z "$NOM" ] || [ -z "$PASSWORD" ]; then
    echo "❌ Erreur : Tous les champs sont obligatoires"
    exit 1
fi

echo "🔐 Génération du hash du mot de passe..."
# Générer le hash SHA-256
PASSWORD_HASH=$(echo -n "$PASSWORD" | sha256sum | cut -d' ' -f1)

echo "📝 Informations de l'utilisateur :"
echo "   Username : $USERNAME"
echo "   Nom      : $NOM"
echo "   Prénom   : $PRENOM"
echo "   Hash     : $PASSWORD_HASH"
echo ""

read -p "Confirmer la création ? (o/n) : " CONFIRM
if [ "$CONFIRM" != "o" ] && [ "$CONFIRM" != "O" ]; then
    echo "❌ Création annulée"
    exit 0
fi

echo ""
echo "🚀 Création de l'utilisateur dans la base de données..."

# Créer l'utilisateur
npx wrangler d1 execute webapp-production --remote \
  --command="INSERT INTO users (username, password_hash, nom, prenom, role) VALUES ('$USERNAME', '$PASSWORD_HASH', '$NOM', '$PRENOM', 'admin')"

echo ""
echo "✅ Utilisateur créé avec succès !"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Identifiants de connexion"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "URL      : https://gesres-missions.pages.dev/login"
echo "Username : $USERNAME"
echo "Password : [le mot de passe que vous avez saisi]"
echo ""
echo "═══════════════════════════════════════════════════════════"
