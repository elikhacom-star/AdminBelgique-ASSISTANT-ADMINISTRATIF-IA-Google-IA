# AdminBelgique – E-Administration & Assistant IA Belge
> Plateforme privée et indépendante d'assistance administrative, fiscale, juridique et immobilière propulsée par l'intelligence artificielle en Belgique.

Édité par **elikacces IT Solutions**.

---

## 🚀 Fonctionnalités Incluses

1. **Tableau de Bord Exécutif :**
   - Suivi des dossiers administratifs belges.
   - Échéancier fiscal officiel (TVA 20 du mois, Inasti, acomptes ISOC).
2. **Assistant IA Administratif Belge :**
   - Connecté au backend avec Gemini 3.8 Flash (`@google/genai`).
   - Base doctrinale et légale belge (SPF Finances, BCE, ONSS, Inasti, Moniteur Belge).
   - Filtre d'anonymisation breveté en temps réel (NISS, BCE, IBAN, adresses).
3. **Générateur de Documents Belges Officiels :**
   - Mises en demeure conformes au Code de droit économique (Livre XIX).
   - Contrats de bail de résidence principale conformes aux réglementations régionales (Wallonie, Bruxelles, Flandre) avec clause PEB.
   - Lettres d'indexation annuelle de loyer Statbel.
4. **Scanner & Analyseur de Courriers Administratifs (OCR) :**
   - Détection de l'organisme émetteur (SPF Finances, ONSS, CPAS, etc.).
   - Extraction et validation mathématique de la communication structurée (`+++xxx/xxxx/xxxxx+++`) par Modulo 97.
   - Calcul des délais de recours et génération d'un projet de réponse officielle.
5. **ImmoBoost Pro / ImmoScrap Pro (Immobilier Belge) :**
   - Agrégation d'annonces (Immoweb, Zimmo, Logic-Immo).
   - Calcul de rentabilité brute/nette avec droits d'enregistrement régionaux (12,5% ou 3%) et frais de notaire.
   - Restrictions régionales d'indexation PEB (E, F, G).
   - Générateur de descriptifs d'annonces immobilières conformes.
6. **Fiduciaires AI & Fiscalité Belge :**
   - Simulateur de revenus nets pour indépendant en personne physique (Inasti 20,5% + IPP progressif).
   - Auditeur de factures conforme au Code TVA belge.
   - Calendrier des échéances fiscales.
7. **JuristAssist Belge :**
   - Détecteur de clauses contractuelles abusives selon la loi B2B belge.
   - Bibliothèque de clauses certifiées prêtes à insérer.
8. **Centre RGPD & Anonymisation :**
   - Démonstrateur de biffage automatique certifié APD.
9. **Validateurs Algorithmiques :**
   - Vérificateur de numéro BCE Modulo 97.
   - Validateur de numéro de registre national (NISS) avec date de naissance et genre.
   - Calculateur d'indexation officiel Statbel.

---

## 🛠️ Installation & Démarrage Local

### Prérequis
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Étapes
1. Décompressez l'archive :
   ```bash
   unzip adminbelgique-platform.zip
   cd adminbelgique-platform
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   Copiez `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```
   Renseignez votre clé d'API Gemini (disponible gratuitement sur Google AI Studio) :
   ```env
   GEMINI_API_KEY="votre_cle_gemini_api"
   PORT=3000
   ```

4. Lancez le serveur de développement full-stack :
   ```bash
   npm run dev
   ```
   L'application s'ouvrira sur `http://localhost:3000`.

5. Construction pour la production :
   ```bash
   npm run build
   npm start
   ```

---

## 🌐 Déploiement avec votre Nom de Domaine Personnalisé (ex: app.adminbelgique.com)

### Étape 1 : Configuration DNS chez votre Registrar (OVH, Cloudflare, Namecheap, etc.)
Dans la zone DNS de votre domaine `adminbelgique.com`, ajoutez un enregistrement pour le sous-domaine `app` :
- **Si vous utilisez un VPS (OVH, Hetzner, etc.) :**
  - **Type :** `A`
  - **Hôte / Nom :** `app`
  - **Valeur / Cible :** `IP_DE_VOTRE_SERVEUR` (ex: `51.15.20.100`)
- **Si vous utilisez un PaaS (Render, Railway, Vercel) :**
  - **Type :** `CNAME`
  - **Hôte / Nom :** `app`
  - **Valeur / Cible :** Le nom de domaine fourni par la plateforme (ex: `adminbelgique.onrender.com`)

### Étape 2 : Déploiement sur Serveur VPS Ubuntu / Debian (Recommandé)
1. Installez Node.js 20, Nginx et PM2 :
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
   sudo npm install -g pm2 tsx
   ```

2. Déployez le code dans `/var/www/app.adminbelgique.com` :
   ```bash
   sudo mkdir -p /var/www/app.adminbelgique.com
   sudo chown -R $USER:$USER /var/www/app.adminbelgique.com
   # Copiez les fichiers du zip dans ce dossier
   cd /var/www/app.adminbelgique.com
   npm install
   npm run build
   ```

3. Démarrez l'application avec PM2 (process manager persistant) :
   ```bash
   pm2 start server.ts --name "adminbelgique" --interpreter tsx
   pm2 save
   pm2 startup
   ```

4. Configurez Nginx comme Reverse Proxy :
   Copiez le fichier `nginx.conf.example` vers `/etc/nginx/sites-available/app.adminbelgique.com` :
   ```bash
   sudo cp nginx.conf.example /etc/nginx/sites-available/app.adminbelgique.com
   sudo ln -s /etc/nginx/sites-available/app.adminbelgique.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. Activez le certificat SSL HTTPS gratuit (Let's Encrypt) :
   ```bash
   sudo certbot --nginx -d app.adminbelgique.com
   ```
   Votre application est maintenant en ligne et sécurisée sur `https://app.adminbelgique.com` !

---

## 📁 Structure du Projet

```
├── server.ts                  # Serveur full-stack Express & endpoints API belges
├── index.html                 # Point d'entrée HTML
├── package.json               # Scripts et dépendances
├── tsconfig.json              # Configuration TypeScript
├── vite.config.ts             # Configuration Vite & Tailwind
├── src/
│   ├── main.tsx               # Montage React
│   ├── App.tsx                # Composant racine & navigation
│   ├── index.css              # Styles globaux & Tailwind
│   ├── types/
│   │   └── adminbelgique.ts   # Définitions TypeScript
│   ├── data/
│   │   └── belgianData.ts     # Données administratives belges, modèles & indices
│   └── components/
│       ├── Header.tsx         # Barre supérieure, profils et téléchargement
│       ├── Sidebar.tsx        # Navigation latérale
│       ├── DashboardView.tsx  # Tableau de bord principal
│       ├── AiAssistantView.tsx# Assistant IA & filtre d'anonymisation
│       ├── DocumentGeneratorView.tsx # Générateur de baux et courriers
│       ├── DocumentAnalyzerView.tsx  # Scanner et extracteur Modulo 97
│       ├── ImmoBoostView.tsx  # Module immobilier ImmoScrap Pro
│       ├── FiduciaryView.tsx  # Fiscalité, simulateur Inasti & TVA
│       ├── JuristAssistView.tsx # Juridique & clauses certifiées
│       ├── AnonymizerView.tsx # Banc d'essai RGPD
│       ├── BelgianToolsView.tsx # Validateurs BCE / NISS / Statbel
│       └── SettingsView.tsx   # Paramètres & abonnements
```

---

## ⚖️ Avertissement Légal
AdminBelgique est une solution privée indépendante éditée par elikacces IT Solutions. Elle n'est en aucun cas mandatée par le Service Public Fédéral (SPF) Finances, l'ONSS ou une administration publique de l'État belge.
