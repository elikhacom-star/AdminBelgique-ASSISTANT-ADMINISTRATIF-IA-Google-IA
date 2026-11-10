#!/usr/bin/env bash
cd "$(dirname "$0")"

echo "================================================================"
echo "      AdminBelgique - Plateforme Administrative et IA"
echo "            Démarrage Automatique pour Mac & Linux"
echo "================================================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "[ATTENTION] Node.js n'a pas été détecté sur cet ordinateur."
    open https://nodejs.org/en/download
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[1/2] Installation automatique des dépendances..."
    npm install
    echo "[2/2] Construction de l'application..."
    npm run build
fi

echo "Démarrage de l'application..."
(sleep 2 && open http://localhost:3000) &
npm start
