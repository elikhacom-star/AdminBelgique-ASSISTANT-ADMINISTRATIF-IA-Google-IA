@echo off
title AdminBelgique - Demarrage Automatique Sans Ligne de Commande
color 0B
echo ================================================================
echo       AdminBelgique - Plateforme Administrative et IA
echo             Demarrage Automatique pour Windows
echo ================================================================
echo.

:: 1. Verifier si Node.js est installe
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ATTENTION] Node.js n'a pas ete detecte sur ce PC.
    echo Ouverture de la page officielle pour installer Node.js gratuitement...
    start https://nodejs.org/en/download
    echo Veuillez installer Node.js (version LTS) puis relancer ce fichier.
    pause
    exit /b
)

:: 2. Si premier lancement, installer et construire automatiquement
if not exist "node_modules" (
    echo [1/2] Premier lancement : Installation automatique des composants...
    call npm install
    echo [2/2] Creation de la version de production...
    call npm run build
)

:: 3. Ouvrir l'application dans le navigateur et lancer le serveur
echo Demarrage de la plateforme en cours...
timeout /t 2 >nul
start http://localhost:3000

echo Plateforme accessible sur http://localhost:3000
echo (Ne fermez pas cette fenetre tant que vous utilisez l'application)
npm start
