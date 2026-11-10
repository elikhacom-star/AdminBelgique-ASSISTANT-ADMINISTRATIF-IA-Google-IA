# Application Android - AdminBelgique (RBAC & E-Administration Belge)

Application mobile native développée en **Kotlin** avec **Jetpack Compose**, **Material 3** et intégration **Firebase & API REST**.
Elle implémente exactement le même système de contrôle d'accès basé sur les rôles (**RBAC**) que la version Web : **Administrateur**, **Éditeur**, et **Visiteur**.

---

## 1. Fonctionnalités & Permissions sur Android

| Rôle | Permissions Android | Droits Back-end Associés |
| :--- | :--- | :--- |
| **Administrateur** (`admin`) | Contrôle total : attribution des rôles, suspension, suppression d'utilisateurs, modification des coordonnées de facturation BCE / TVA. | Accès total à `/api/admin/*` et aux règles Firestore d'administration. |
| **Éditeur** (`editor`) | Création et édition de documents (mises en demeure, baux d'habitation, indexation Statbel). Consultation des paramètres de l'entreprise. | Accès en écriture à `/api/documents/generate` et aux dossiers. Refusé sur `/api/admin/users` (403). |
| **Visiteur** (`visitor`) | Mode consultation / lecture seule. Visualisation des modèles et simulations, mais la génération et modification affichent un bandeau de protection invitant à débloquer les droits. | Rejet automatique par le back-end (HTTP 403 Forbidden). |

---

## 2. Comment Ouvrir et Compiler dans Android Studio

1. **Prérequis** :
   - [Android Studio Ladybug ou version supérieure](https://developer.android.com/studio)
   - JDK 17 ou supérieur
   - Android SDK 35 (Android 15)

2. **Étapes de compilation** :
   - Lancez **Android Studio** -> Cliquez sur **Open** -> Sélectionnez le dossier `android/` de ce projet.
   - Laissez Gradle synchroniser les dépendances (`libs.versions.toml`).
   - Pour lancer l'application : Sélectionnez un émulateur (Pixel 8 / 9 avec Android 14/15) ou un smartphone Android connecté en mode Débogage USB, puis cliquez sur **Run (Shift+F10)**.

3. **Génération de l'APK installable** :
   - Dans le menu supérieur d'Android Studio : `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`.
   - L'APK est généré dans `android/app/build/outputs/apk/debug/app-debug.apk`. Vous pouvez l'envoyer et l'installer directement sur n'importe quel smartphone Android.

---

## 3. Option PWA / TWA (Installation 1 Clic Sans Android Studio)

Vous pouvez également installer instantanément l'application sur n'importe quel smartphone Android :
1. Ouvrez l'URL de la plateforme dans **Google Chrome** ou **Samsung Internet** sur votre téléphone Android.
2. Cliquez sur le menu (trois petits points) ou sur la bannière **"Installer l'application AdminBelgique"**.
3. L'application s'installe avec son icône native sur votre écran d'accueil et s'exécute en mode plein écran autonome sans barre d'adresse.
