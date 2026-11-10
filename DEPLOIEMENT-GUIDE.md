# Guide Officiel de Déploiement – Plateforme AdminBelgique
> **Domaine cible :** `app.adminbelgique.com`  
> **Éditeur :** elikacces IT Solutions  
> **Version :** Production Standalone (React 19 + Express Node.js + PWA + RBAC)

---

## 📦 1. Quels fichiers mettre exactement sur votre hébergement ?

Pour que votre site fonctionne de façon **100% IDENTIQUE** à la plateforme actuelle (avec toutes les fonctionnalités : générateur de documents légaux belges, validation BCE/NISS Modulo 97, assistant IA, gestion des utilisateurs RBAC, enregistrement des dossiers), votre hébergement doit exécuter le moteur Node.js.

Voici la liste exacte des fichiers et dossiers de production nécessaires :

| Fichier / Dossier | Rôle et Utilité | Obligatoire ? |
| :--- | :--- | :--- |
| **`dist/`** | Dossier contenant l'application Frontend complète compilée (HTML, CSS Tailwind v4, JS minifié, PWA manifest, icônes). | **OUI** |
| **`server.js`** | Le serveur Backend Node.js pré-compilé en JavaScript pur ES module. Il démarre instantanément avec `node server.js` sans nécessiter TypeScript. | **OUI** |
| **`package.json`** | Déclare les dépendances de production nécessaires à Node.js (`express`, `dotenv`, `@google/genai`, `firebase`). | **OUI** |
| **`data/`** | Contient la base de données locale autonome (`users.json`, `dossiers.json`, `audit_logs.json`, `settings.json`). | **OUI** |
| **`.env`** | Variables d'environnement (`PORT=3000`, `NODE_ENV=production`, `GEMINI_API_KEY=...`). | **OUI** |
| **`ecosystem.config.cjs`** | Fichier de configuration pour le gestionnaire de processus PM2 (sur VPS ou cPanel). | Recommandé |
| **`nginx.conf.example`** | Modèle de configuration pour reverse proxy Nginx avec SSL HTTPS. | Sur VPS |
| **`docker-compose.yml` & `Dockerfile`** | Permet de lancer toute la plateforme en 1 seule commande Docker. | Si Docker |

> 💡 **Tout est inclus dans l'archive `adminbelgique-platform.zip`** téléchargeable directement via le bouton **"Télécharger (.ZIP)"** dans la barre de navigation du site ou à l'adresse `/api/download-zip`.

---

## 🌐 2. Configuration de votre Nom de Domaine (`app.adminbelgique.com`)

Chez votre registrar (le fournisseur chez qui vous avez acheté `adminbelgique.com` : OVH, Cloudflare, Namecheap, Infomaniak, Hostinger, Gandi...) :

1. Rendez-vous dans la rubrique **Zone DNS**.
2. Ajoutez un enregistrement DNS pour le sous-domaine `app` :
   - **Cas A : Vous avez un VPS / Serveur Dédié avec adresse IP fixe**
     - Type : `A`
     - Sous-domaine / Hôte : `app`
     - Cible / Valeur : L'adresse IP publique de votre serveur (ex: `51.15.20.100`)
     - TTL : Par défaut (3600 ou automatique)
   - **Cas B : Vous utilisez un PaaS (Render, Railway, etc.)**
     - Type : `CNAME`
     - Sous-domaine / Hôte : `app`
     - Cible : L'adresse fournie par le service (ex: `adminbelgique.onrender.com`)

---

## 🚀 3. Méthodes d'Installation selon votre Hébergement

### Méthode A : Sur Hébergement Web Mutualisé / cPanel (avec Node.js Selector)
*(OVH Cloud Web, Hostinger, o2switch, Planethoster, cPanel)*

1. **Uploadez les fichiers :**
   - Connectez-vous à votre gestionnaire de fichiers cPanel ou par FTP (FileZilla).
   - Créez un dossier pour votre application, par exemple `/home/votrecompte/app.adminbelgique.com/`.
   - Extrayez ou déposez le contenu de `adminbelgique-platform.zip` dans ce dossier.

2. **Créez l'application Node.js dans cPanel :**
   - Allez dans cPanel > **Setup Node.js App** (ou Gestionnaire d'applications Node.js).
   - Cliquez sur **Create Application**.
   - **Node.js version :** Choisissez `20.x` (ou `18.x` minimum).
   - **Application mode :** `Production`.
   - **Application root :** Le dossier où vous avez mis les fichiers (ex: `app.adminbelgique.com`).
   - **Application URL :** `app.adminbelgique.com`.
   - **Application startup file :** `server.js`.
   - Cliquez sur **Create**.

3. **Installez les dépendances :**
   - Dans la même interface cPanel, cliquez sur le bouton **Run NPM Install** (ou lancez la commande `npm install --omit=dev` via le terminal cPanel).

4. **Variables d'environnement :**
   - Dans la section "Environment variables" de l'interface cPanel, ajoutez :
     - `NODE_ENV` = `production`
     - `PORT` = `3000` (ou laissez cPanel injecter le port automatiquement)
     - `GEMINI_API_KEY` = *Votre clé Google AI Studio*

5. Cliquez sur **Restart** : Votre site `app.adminbelgique.com` est immédiatement actif !

---

### Méthode B : Sur Serveur VPS Linux (Ubuntu / Debian) – La plus performante & recommandée
*(OVH VPS, Hetzner Cloud, Scaleway, DigitalOcean, AWS EC2, Linode)*

#### Étape 1 : Préparation du serveur (1 minute)
Connectez-vous en SSH à votre serveur :
```bash
sudo apt update && sudo apt upgrade -y
# Installer Node.js 20, Nginx, Certbot et PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git unzip
sudo npm install -g pm2
```

#### Étape 2 : Déploiement des fichiers
```bash
# Créer le répertoire web
sudo mkdir -p /var/www/app.adminbelgique.com
sudo chown -R $USER:$USER /var/www/app.adminbelgique.com
cd /var/www/app.adminbelgique.com

# Transférez ou uploadez adminbelgique-platform.zip ici, puis :
unzip adminbelgique-platform.zip

# Installer les dépendances de production
npm install --omit=dev

# Créer votre fichier .env
cat <<EOF > .env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY="votre_cle_gemini_api_ici"
EOF
```

#### Étape 3 : Démarrer le serveur en continu avec PM2
```bash
# Démarrage avec le fichier de configuration haute disponibilité
pm2 start ecosystem.config.cjs

# Sauvegarde pour redémarrage automatique en cas de redémarrage du VPS
pm2 save
pm2 startup
```

#### Étape 4 : Configurer Nginx en Reverse Proxy
```bash
# Copier la configuration Nginx
sudo cp nginx.conf.example /etc/nginx/sites-available/app.adminbelgique.com

# Activer le site
sudo ln -sf /etc/nginx/sites-available/app.adminbelgique.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Tester et recharger Nginx
sudo nginx -t
sudo systemctl reload nginx
```

#### Étape 5 : Activer le cadenas HTTPS gratuit (Let's Encrypt SSL)
```bash
sudo certbot --nginx -d app.adminbelgique.com
```
*Le certificat SSL sera automatiquement installé et renouvelé tous les 90 jours sans aucune action manuelle.*

---

### Méthode C : Déploiement Docker en 1 Commande (Tout environnement)

Si Docker et Docker Compose sont installés sur votre serveur :
```bash
# 1. Décompresser le projet
unzip adminbelgique-platform.zip
cd adminbelgique-platform

# 2. Configurer la clé Gemini
echo "GEMINI_API_KEY=votre_cle" > .env

# 3. Lancer en arrière-plan
docker compose up -d --build
```
L'application tourne immédiatement sur le port 3000 avec redémarrage automatique et persistance des dossiers dans le volume `./data`.

---

## 🔑 4. Comptes Utilisateurs & Rôles Pré-configurés

L'authentification et le contrôle d'accès RBAC (Role-Based Access Control) sont déjà initialisés dans la base `data/users.json` :

| Rôle | Email de connexion | Mot de passe par défaut | Permissions d'accès |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `admin@adminbelgique.com` | `Admin1234!` | Accès total : Gestion des utilisateurs, logs d'audit, paramètres, création et suppression de contenu. |
| **Éditeur** | `editeur@adminbelgique.com` | `Editeur1234!` | Accès opérationnel : Création et modification de dossiers, génération de baux/mises en demeure, analyses. Pas d'accès à la suppression d'utilisateurs. |
| **Visiteur** | `visiteur@adminbelgique.com` | `Visiteur1234!` | Consultation en lecture seule des dossiers et simulateurs. Pas de modification de paramètres. |

> 🔒 **Recommandation de sécurité :** Dès votre première connexion en tant qu'administrateur, rendez-vous dans la section **Administration & Rôles** ou **Paramètres** pour modifier ces mots de passe ou créer vos propres comptes personnalisés.

---

## 🧪 5. Vérification du Bon Fonctionnement

Une fois déployé sur `https://app.adminbelgique.com` :
1. **Frontend :** Ouvrez `https://app.adminbelgique.com` dans votre navigateur (l'interface bilingue et responsive doit s'afficher immédiatement).
2. **Backend API :** Vérifiez l'URL `https://app.adminbelgique.com/api/auth/check` (doit répondre un statut JSON valide).
3. **Validation BCE / NISS :** Testez un numéro d'entreprise dans les Outils Belges (ex: SPF Finances `0308.356.862`) pour valider le calcul Modulo 97.
4. **Documents légaux :** Générez une mise en demeure ou un bail locatif en PDF/Texte pour confirmer que le moteur serveur tourne parfaitement.
