# ⚡ DÉMARRAGE RAPIDE - Windows

## 📦 Ce que vous avez téléchargé

**app-v8-final.zip** (49 KB)
- Application complète V8.0
- Structure /src correcte
- Prête à fonctionner sur Windows

---

## 🚀 Installation en 5 Minutes

### 1️⃣ Extraire le ZIP
```
Clic droit sur app-v8-final.zip
→ Extraire tout...
→ Choisir un dossier (ex: Documents)
```

### 2️⃣ Ouvrir PowerShell
```
Windows + X
→ Windows PowerShell
```

### 3️⃣ Aller dans le dossier
```powershell
cd C:\Users\VotreProfil\Documents\app-v8-final
```

### 4️⃣ Installer
```powershell
npm install
```
⏱️ Patience... 2-3 minutes

### 5️⃣ Lancer
```powershell
npm run dev
```

### 6️⃣ Ouvrir le navigateur
```
http://localhost:5173
```

**C'EST TOUT ! 🎉**

---

## ✅ Vérifications Rapides

### Onglet "Cultures"
- Ajouter une culture (ex: Tomate)
- **Vérifier** : Encadré bleu avec dates (semis, plantation, récolte)

### Onglet "Planification"
- **Vérifier** : Gantt avec 3 couleurs (bleu, vert, orange)
- **Vérifier** : Bande verte "Saison commerciale"

### Onglet "Résultats"
- **Vérifier** : CA avec mention **(20 semaines)**

**Si tout est OK → Vous êtes bon ! ✅**

---

## 🛑 Arrêter l'Application

Dans PowerShell :
```
Ctrl + C
```

---

## 🔄 Relancer Plus Tard

```powershell
cd C:\Users\VotreProfil\Documents\app-v8-final
npm run dev
```

---

## 🐛 Problème ?

### "npm n'est pas reconnu"
→ Installer Node.js : https://nodejs.org/

### Port 5173 occupé
→ Utiliser un autre port :
```powershell
npm run dev -- --port 3000
```

### Erreur "Cannot find module"
→ Réinstaller :
```powershell
npm install
```

---

## 📚 Documentation Complète

Voir **README_WINDOWS.md** dans le dossier pour :
- Instructions détaillées
- Problèmes courants
- Astuces Windows
- Modifications du code

---

## 🎯 Fonctionnalités V8.0

✅ CA sur 20 semaines (correct !)
✅ Validation fenêtres de saisons
✅ Gantt 3 phases colorées
✅ Calcul automatique des dates
✅ Alertes visuelles

---

**Version** : 8.0 - Windows Edition
**Support** : Node.js 16+
**Navigateur** : Chrome, Firefox, Edge

Bon développement ! 🚀
