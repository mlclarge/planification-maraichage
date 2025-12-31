# 🪟 INSTALLATION WINDOWS - GUIDE COMPLET V9.0

## 📦 CONTENU DU PACKAGE

```
package-windows-v9/
├── 📄 INSTALLATION_WINDOWS.md (ce fichier)
├── 💻 calculPlanchesSimultanees.js
├── 💻 SelectionCultures.jsx (encodage UTF-8 corrigé)
├── 🔧 install.ps1 (script PowerShell automatique)
└── 📋 VERIFICATION.md
```

---

## 🚀 MÉTHODE 1 : INSTALLATION AUTOMATIQUE (Recommandé)

### Étape 1 : Localiser votre projet
```powershell
# Ouvrir PowerShell dans le dossier de votre projet
cd "D:\Chemin\Vers\Votre\Projet"
```

### Étape 2 : Extraire le package
```powershell
# Extraire package-windows-v9.zip dans votre projet
# Vous aurez un dossier : package-windows-v9/
```

### Étape 3 : Exécuter le script d'installation
```powershell
# Autoriser l'exécution de scripts (une seule fois)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Lancer l'installation automatique
cd package-windows-v9
.\install.ps1
```

**Le script va :**
- ✅ Créer le dossier src/utils/ si nécessaire
- ✅ Copier calculPlanchesSimultanees.js
- ✅ Sauvegarder votre SelectionCultures.jsx actuel
- ✅ Installer la nouvelle version (encodage UTF-8 corrigé)
- ✅ Vérifier que tout est OK

---

## 🔧 MÉTHODE 2 : INSTALLATION MANUELLE

### Étape 1 : Créer le dossier utils (si inexistant)
```powershell
# Dans le dossier de votre projet
cd src
mkdir utils
```

### Étape 2 : Copier le module de calcul
```powershell
# Copier calculPlanchesSimultanees.js
copy package-windows-v9\calculPlanchesSimultanees.js src\utils\
```

### Étape 3 : Sauvegarder l'ancien fichier
```powershell
# Sauvegarder SelectionCultures.jsx
copy src\components\SelectionCultures.jsx src\components\SelectionCultures.jsx.backup
```

### Étape 4 : Installer le nouveau fichier
```powershell
# Copier la nouvelle version (UTF-8 corrigé)
copy package-windows-v9\SelectionCultures.jsx src\components\
```

### Étape 5 : Vérifier l'encodage
```powershell
# Ouvrir dans VS Code et vérifier en bas à droite :
# Doit afficher "UTF-8" ou "UTF-8 with BOM"
```

---

## 🧪 VÉRIFICATION

### 1. Vérifier que les fichiers sont bien copiés
```powershell
# Lister les fichiers
ls src\utils\calculPlanchesSimultanees.js
ls src\components\SelectionCultures.jsx
```

### 2. Relancer l'application
```powershell
npm run dev
```

### 3. Ouvrir dans le navigateur
```
http://localhost:5173
```

### 4. Vérifier l'encodage correct
- ✅ "Marché" (pas "MarchÃ©")
- ✅ "Résumé" (pas "RÃ©sumÃ©")
- ✅ "€" (pas "â‚¬")

### 5. Tester les calculs automatiques
1. Aller dans "Cultures"
2. Ajouter "Courgettes"
3. Vérifier que vous voyez :
   - ✅ "Planification Professionnelle"
   - ✅ "⭐ Planches simultanées: 5"
   - ✅ "Planning de Semis Échelonnés (4 séries)"
   - ✅ "Besoins en Intrants"

---

## 🐛 RÉSOLUTION DES PROBLÈMES

### Problème 1 : Encodage toujours incorrect
```powershell
# Dans VS Code, ouvrir SelectionCultures.jsx
# Cliquer sur l'encodage en bas à droite
# Choisir "Reopen with Encoding" → "UTF-8"
# Puis "Save with Encoding" → "UTF-8"
```

### Problème 2 : Module introuvable
```
Error: Cannot find module '../utils/calculPlanchesSimultanees'
```

**Solution** :
```powershell
# Vérifier que le fichier existe
ls src\utils\calculPlanchesSimultanees.js

# Si absent, le copier à nouveau
copy package-windows-v9\calculPlanchesSimultanees.js src\utils\
```

### Problème 3 : Erreur de syntaxe
```
SyntaxError: Unexpected token
```

**Solution** :
```powershell
# Supprimer node_modules et réinstaller
rm -r node_modules
npm install
npm run dev
```

### Problème 4 : Planches simultanées = 0
**Solution** :
- Vérifier que votre configuration marché est remplie
- Ouvrir la console F12 et chercher les erreurs
- Vérifier que calculerBesoinHebdo() retourne des valeurs

---

## 📝 NOTES IMPORTANTES

### Encodage UTF-8
- Tous les fichiers fournis sont en **UTF-8 with BOM** pour Windows
- Compatible avec Visual Studio Code, Notepad++, Sublime Text
- Si problème : toujours "Save with Encoding → UTF-8 with BOM"

### Structure du Projet
```
votre-projet/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   ├── ConfigurationMarche.jsx
│   │   ├── ConfigurationJardins.jsx
│   │   ├── SelectionCultures.jsx ← NOUVEAU (V9.0)
│   │   ├── Planification.jsx
│   │   └── Resultats.jsx
│   ├── data/
│   │   ├── cultures.js
│   │   ├── compositionsPaniers.js
│   │   └── taches.js
│   ├── utils/ ← NOUVEAU DOSSIER
│   │   └── calculPlanchesSimultanees.js ← NOUVEAU FICHIER
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

---

## ✅ CHECKLIST FINALE

- [ ] Package extrait
- [ ] Dossier src/utils/ créé
- [ ] calculPlanchesSimultanees.js copié
- [ ] SelectionCultures.jsx sauvegardé (.backup)
- [ ] Nouvelle version installée
- [ ] npm run dev lancé
- [ ] Application ouverte (localhost:5173)
- [ ] Encodage correct vérifié (Marché, Résumé, €)
- [ ] Culture ajoutée (test)
- [ ] "Planches simultanées" affichées
- [ ] "Planning Semis Échelonnés" affiché
- [ ] "Besoins Intrants" affichés
- [ ] Console F12 : pas d'erreurs

---

## 🎉 APRÈS L'INSTALLATION

Vous aurez :
- ✅ Encodage UTF-8 corrigé partout
- ✅ Calcul automatique des planches simultanées
- ✅ Génération des 4 séries échelonnées
- ✅ Planning semis détaillé
- ✅ Calcul besoins intrants (plants, graines, substrat, coûts)
- ✅ Validation automatique
- ✅ Alertes si problèmes

**Exactement comme dans vos screenshots !** 🎯

---

## 💬 BESOIN D'AIDE ?

Si vous bloquez :
1. Vérifier VERIFICATION.md
2. Ouvrir console F12 (dans navigateur)
3. Copier l'erreur exacte
4. Me contacter avec l'erreur

---

## 📚 FICHIERS DE RÉFÉRENCE

- **PRINCIPE_CALCUL_PLANCHES.md** : La théorie mathématique
- **ESTIMATION_PLANCHES_PAR_LEGUME.md** : Calculs pour vos 11 légumes
- **README_V9.md** : Vue d'ensemble complète

---

**Bonne installation ! 🚀**
