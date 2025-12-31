# 🚀 Application Planification Maraîchère V8.0 - Windows

## 📦 Installation sur Windows

### Prérequis

Avant de commencer, vous devez installer :

1. **Node.js** (version 16 ou supérieure)
   - Télécharger : https://nodejs.org/
   - Installer la version LTS (Long Term Support)
   - Vérifier l'installation :
     ```cmd
     node --version
     npm --version
     ```

2. **Un éditeur de code** (recommandé)
   - Visual Studio Code : https://code.visualstudio.com/
   - Ou tout autre éditeur de votre choix

---

## 📁 Structure du Projet

```
app-v8-final/
├── package.json              (Configuration npm)
├── vite.config.js            (Configuration Vite)
├── tailwind.config.js        (Configuration Tailwind CSS)
├── postcss.config.js         (Configuration PostCSS)
├── index.html                (Page HTML principale)
│
└── src/                      ⭐ DOSSIER PRINCIPAL
    ├── main.jsx              (Point d'entrée React)
    ├── App.jsx               (Composant racine)
    ├── index.css             (Styles globaux)
    │
    ├── components/           (Composants React)
    │   ├── ConfigurationMarche.jsx
    │   ├── ConfigurationJardins.jsx
    │   ├── SelectionCultures.jsx  ✅ V8.0
    │   ├── Planification.jsx      ✅ V8.0
    │   ├── GanttChart.jsx         ✅ V8.0
    │   └── Resultats.jsx          ✅ V8.0
    │
    ├── data/                 (Données de base)
    │   ├── cultures.js
    │   ├── compositionsPaniers.js ✅ V8.0
    │   └── taches.js
    │
    └── utils/                (Moteur de planification)
        ├── constantes.js     ✅ V8.0
        ├── PlanningEngine.js ✅ V8.0
        └── PlancheTimeline.js ✅ V8.0
```

---

## ⚡ Installation Rapide (Windows)

### Étape 1 : Extraire l'archive

1. **Télécharger** le fichier `app-v8-final.zip`
2. **Clic droit** sur le fichier → **Extraire tout...**
3. Choisir un dossier (ex: `C:\Users\VotreProfil\Documents\`)
4. Le dossier `app-v8-final` sera créé

### Étape 2 : Ouvrir un terminal

**Option A : PowerShell**
1. Appuyer sur `Windows + X`
2. Choisir **Windows PowerShell**

**Option B : Invite de commandes**
1. Appuyer sur `Windows + R`
2. Taper `cmd` et valider

**Option C : Terminal VS Code**
1. Ouvrir le dossier dans VS Code
2. Menu **Terminal** → **Nouveau terminal**

### Étape 3 : Naviguer vers le dossier

```cmd
cd C:\Users\VotreProfil\Documents\app-v8-final
```

*Remplacez le chemin par votre dossier*

### Étape 4 : Installer les dépendances

```cmd
npm install
```

⏱️ **Temps estimé** : 2-3 minutes (première fois)

Vous devriez voir :
```
added 275 packages in 2m
```

### Étape 5 : Lancer l'application

```cmd
npm run dev
```

Vous devriez voir :
```
  VITE v4.4.5  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Étape 6 : Ouvrir dans le navigateur

1. Ouvrir votre navigateur (Chrome, Firefox, Edge...)
2. Aller à l'adresse : **http://localhost:5173**
3. L'application s'affiche ! 🎉

---

## 🛑 Arrêter l'application

Dans le terminal :
- Appuyer sur **Ctrl + C**
- Confirmer avec **O** (Oui)

---

## 🔄 Relancer l'application

Depuis le dossier du projet :
```cmd
npm run dev
```

L'application redémarre immédiatement !

---

## ✅ Vérifications Après Installation

### 1. Onglet "Marché"
- ✅ Vous pouvez configurer les paniers AMAP
- ✅ Bouton "Valider" enregistre les données

### 2. Onglet "Jardins"
- ✅ 5 jardins configurables
- ✅ Nombre de planches modifiable

### 3. Onglet "Cultures"
- ✅ 10 cultures disponibles
- ✅ Quand vous ajoutez une culture, un **encadré bleu** affiche les dates (semis, plantation, récolte)
- ✅ Si erreur : **alerte rouge** visible

### 4. Onglet "Planification"
- ✅ Diagramme de Gantt avec **3 couleurs** :
  - 🔵 Bleu = Pépinière
  - 🟢 Vert = Croissance
  - 🟠 Orange = Récolte
- ✅ **Bande verte** en bas = Saison commerciale (S18-S38)

### 5. Onglet "Résultats"
- ✅ CA affiche **(20 semaines)** ← CRITIQUE !
- ✅ "Saison 2025 (Mai-Septembre)" visible

---

## 🐛 Problèmes Courants (Windows)

### Erreur : "npm n'est pas reconnu..."
**Solution** : Node.js n'est pas installé ou pas dans le PATH
1. Réinstaller Node.js
2. Redémarrer le terminal
3. Retester `npm --version`

### Erreur : "Cannot find module..."
**Solution** : Dépendances non installées
```cmd
npm install
```

### Erreur : Port 5173 déjà utilisé
**Solution** : Arrêter l'autre instance ou changer de port
```cmd
npm run dev -- --port 3000
```

### L'application ne se met pas à jour
**Solution** : Vider le cache du navigateur
- **Ctrl + Shift + R** (rafraîchir sans cache)

### Erreur : "Access denied" ou "Permission denied"
**Solution** : Exécuter en tant qu'administrateur
- Clic droit sur PowerShell → **Exécuter en tant qu'administrateur**

---

## 📝 Modifications et Développement

### Pour modifier le code :

1. **Ouvrir le projet dans VS Code** :
   ```cmd
   code .
   ```

2. **Les fichiers importants sont dans `/src`** :
   - `src/components/` - Interface utilisateur
   - `src/data/` - Données cultures et paniers
   - `src/utils/` - Moteur de calcul

3. **Les modifications sont automatiquement reflétées** :
   - Sauvegarder le fichier (Ctrl + S)
   - Le navigateur se rafraîchit automatiquement (Hot Reload)

### Pour compiler en production :

```cmd
npm run build
```

Crée un dossier `dist/` avec les fichiers optimisés.

---

## 🔒 Sécurité et Données

- ✅ **Tout fonctionne en local** sur votre PC
- ✅ **Aucune donnée envoyée sur Internet**
- ✅ **Pas de compte ou connexion nécessaire**
- ✅ **Données stockées dans le navigateur** (localStorage)

Pour **effacer toutes les données** :
- Ouvrir les DevTools (F12)
- Onglet "Application" → "Local Storage"
- Supprimer les entrées

---

## 📊 Fonctionnalités V8.0

### ✅ Corrections Critiques
- CA calculé sur **20 semaines** (Mai-Septembre) au lieu de 52
- Mention claire **(20 sem.)** dans les résultats
- Calculs conformes au cahier des charges

### ✅ Nouvelles Fonctionnalités
- **Moteur de rétro-planning** : calcul automatique dates semis/plantation
- **Validation fenêtres de saisons** : alertes si culture hors période
- **Génération tâches** : liste automatique des opérations
- **Gantt 3 phases** : pépinière (bleu), croissance (vert), récolte (orange)
- **Toutes séries visibles** : chaque succession de culture affichée

---

## 🚀 Prochaines Étapes

Une fois l'application fonctionnelle, vous pouvez :

1. **Configurer votre marché** (onglet Marché)
2. **Définir vos jardins** (onglet Jardins)
3. **Sélectionner vos cultures** (onglet Cultures)
4. **Visualiser le planning** (onglet Planification)
5. **Analyser la rentabilité** (onglet Résultats)

---

## 💡 Astuces Windows

### Créer un raccourci pour lancer l'app :

1. Créer un fichier `lancer-app.bat` :
   ```batch
   @echo off
   cd C:\Users\VotreProfil\Documents\app-v8-final
   npm run dev
   pause
   ```

2. Double-cliquer sur le fichier pour lancer l'app !

### Lancer automatiquement le navigateur :

Modifier `package.json` :
```json
"scripts": {
  "dev": "vite --open"
}
```

---

## 📞 Support

### Vérifier les logs
Si problème, regarder :
1. **Terminal** : messages d'erreur npm/vite
2. **Console navigateur** (F12) : erreurs JavaScript

### Fichiers de log utiles :
- `npm-debug.log` (si erreur npm)
- Console DevTools (F12 dans le navigateur)

---

## 📦 Résumé des Commandes Windows

```cmd
# Installation (une seule fois)
npm install

# Lancer en développement
npm run dev

# Arrêter l'application
Ctrl + C

# Compiler pour production
npm run build

# Nettoyer le cache
npm cache clean --force
```

---

**Version** : 8.0
**Plateforme** : Windows 10/11
**Node.js requis** : 16+
**Navigateurs compatibles** : Chrome, Firefox, Edge

Bon développement ! 🎉
