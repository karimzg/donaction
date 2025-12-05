#!/bin/bash

# Script de génération automatique des secrets pour Donaction
# Usage: ./scripts/generate-secrets.sh

set -e

echo "============================================"
echo "  Générateur de Secrets - Donaction"
echo "============================================"
echo ""

# Vérifier si openssl est disponible
if ! command -v openssl &> /dev/null; then
    echo "❌ Erreur: OpenSSL n'est pas installé"
    echo "Installation:"
    echo "  - Ubuntu/Debian: sudo apt-get install openssl"
    echo "  - macOS: brew install openssl"
    exit 1
fi

echo "🔐 Génération des secrets sécurisés..."
echo ""

# Fonction pour générer un secret
generate_secret() {
    openssl rand -base64 "$1"
}

# Génération des secrets
echo "📋 Copiez ces valeurs dans vos fichiers .env:"
echo ""

echo "# ========================================"
echo "# STRAPI API (donaction-api/.env)"
echo "# ========================================"
echo "JWT_SECRET=$(generate_secret 32)"
echo "ADMIN_JWT_SECRET=$(generate_secret 32)"
echo "API_TOKEN_SALT=$(generate_secret 16)"
echo "TRANSFER_TOKEN_SALT=$(generate_secret 16)"
echo "STRAPI_ADMIN_CLIENT_PREVIEW_SECRET=$(generate_secret 24)"
echo ""

# APP_KEYS (4 clés séparées par des virgules)
APP_KEY1=$(generate_secret 32)
APP_KEY2=$(generate_secret 32)
APP_KEY3=$(generate_secret 32)
APP_KEY4=$(generate_secret 32)
echo "APP_KEYS=$APP_KEY1,$APP_KEY2,$APP_KEY3,$APP_KEY4"
echo ""

echo "# ========================================"
echo "# FRONTEND (donaction-frontend/.env)"
echo "# ========================================"
echo "NEXTAUTH_SECRET=$(generate_secret 32)"
echo ""

echo "# ========================================"
echo "# DATABASE (racine .env)"
echo "# ========================================"
echo "DATABASE_PASSWORD=$(generate_secret 24)"
echo "PGADMIN_DEFAULT_PASSWORD=$(generate_secret 16)"
echo ""

echo "✅ Secrets générés avec succès!"
echo ""
echo "⚠️  IMPORTANT:"
echo "  1. Copiez ces secrets dans vos fichiers .env respectifs"
echo "  2. Ne commitez JAMAIS ces secrets dans Git"
echo "  3. Sauvegardez ces secrets dans un gestionnaire de mots de passe"
echo "  4. Pour les services externes (Stripe, ImageKit, etc), référez-vous au ENV_CONFIGURATION_GUIDE.md"
echo ""
