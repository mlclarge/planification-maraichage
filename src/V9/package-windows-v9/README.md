# 📦 PACKAGE WINDOWS V9.0 - Planification Maraîchère

## 🎯 CONTENU

Ce package contient **TOUT** ce dont vous avez besoin pour :
1. ✅ **Corriger l'encodage UTF-8** (Marché, Résumé, €)
2. ✅ **Installer le calcul automatique** des planches simultanées
3. ✅ **Ajouter le planning détaillé** des semis échelonnés
4. ✅ **Calculer les besoins** en intrants (plants, graines, substrat, coûts)

---

## 📂 FICHIERS INCLUS

```
package-windows-v9/
├── 📄 README.md (ce fichier)
├── 📄 INSTALLATION_WINDOWS.md (guide détaillé)
├── 📄 VERIFICATION.md (tests après installation)
├── 📄 DEMARRAGE_RAPIDE.txt (étapes en 2 minutes)
├── 💻 calculPlanchesSimultanees.js (module de calcul)
├── 💻 SelectionCultures.jsx (composant V9, UTF-8 corrigé)
└── 🔧 install.ps1 (installation automatique)
```

---

## 🚀 DÉMARRAGE RAPIDE (2 MINUTES)

### Option A : Installation Automatique (Recommandé)

```powershell
# 1. Extraire le ZIP dans votre projet
# 2. Ouvrir PowerShell dans le dossier package-windows-v9
cd package-windows-v9

# 3. Autoriser l'exécution (une seule fois)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# 4. Lancer l'installation
.\install.ps1

# 5. Revenir dans le projet et lancer
cd ..
npm run dev
```

**C'EST TOUT !** ✨

---

### Option B : Installation Manuelle

```powershell
# 1. Créer le dossier utils
mkdir src\utils

# 2. Copier les fichiers
copy package-windows-v9\calculPlanchesSimultanees.js src\utils\
copy src\components\SelectionCultures.jsx src\components\SelectionCultures.jsx.backup
copy package-windows-v9\SelectionCultures.jsx src\components\

# 3. Lancer
npm run dev
```

---

## ✅ CE QUI CHANGE

### AVANT (Version Actuelle)
```
❌ "MarchÃ©" (encodage incorrect)
❌ Calcul planches basique
❌ Pas de séries échelonnées automatiques
❌ Pas de besoins intrants
```

### APRÈS (Version V9.0)
```
✅ "Marché" (encodage UTF-8 parfait)
✅ Calcul intelligent "Planches simultanées"
✅ 4 séries échelonnées générées automatiquement
✅ Planning semis détaillé (dates précises)
✅ Besoins intrants calculés (plants, graines, substrat, coûts)
✅ Validation automatique avec alertes
```

---

## 🎨 APERÇU DE L'INTERFACE

Quand vous ajoutez une culture (ex: Courgettes), vous verrez :

```
📊 Planification Professionnelle
├─ Besoin/semaine: 44 kg
├─ Rendement net/planche: 88.2 kg (marge -30%)
└─ ⭐ Planches simultanées: 5 ⭐

📅 Planning de Semis Échelonnés (4 séries)

Série 1: 2 planches
├─ Semis : Semaine 15
├─ Plantation : Semaine 18
└─ Récolte : Semaines 22-26

Série 2: 2 planches
├─ Semis : Semaine 17
├─ Plantation : Semaine 20
└─ Récolte : Semaines 24-28

[... Séries 3 & 4 ...]

🌱 Besoins en Intrants pour la Saison

Plants nécessaires: 400
Plants à préparer: 480 (+20% marge)
Graines à semer: 533 (2.7g)
Substrat: 24L (1 bac)

Coût estimé : 7 €
  Graines: 3€ • Substrat: 4€
```

---

## 🎯 CALCULS POUR VOS 11 LÉGUMES

Basé sur votre marché (315 kg/semaine) :

| Légume | Planches Simultanées | Total Saison |
|--------|---------------------|--------------|
| 🍅 Tomates | 4 | 4 planches |
| 🥒 Courgettes | 5 | 8 planches |
| 🥒 Concombres | 7 | 9 planches |
| 🍆 Aubergines | 3 | 4 planches |
| 🫘 Haricots | 9 | 9 planches |
| 🥬 Mesclun | 4 | 12 planches |
| 🌱 Verdurettes | 4 | 14 planches |
| 🥕 Carottes | 4 | 6 planches |
| 🥬 Betteraves | 5 | 6 planches |
| 🔴 Radis | 2 | 14 planches |
| 🌿 Basilic | 4 | 6 planches |
| **TOTAL** | **51** | **~92** |

**Besoin** : 51 planches simultanées au pic de saison
**Vos jardins** : 60 planches → ✅ **C'est faisable !**

---

## 📚 DOCUMENTATION COMPLÈTE

- **INSTALLATION_WINDOWS.md** : Guide détaillé étape par étape
- **VERIFICATION.md** : Tests à effectuer après installation
- **DEMARRAGE_RAPIDE.txt** : Aide-mémoire ultra-court
- **PRINCIPE_CALCUL_PLANCHES.md** : Théorie mathématique
- **ESTIMATION_PLANCHES_PAR_LEGUME.md** : Calculs détaillés par légume

---

## ⚡ COMPATIBILITÉ

- ✅ Windows 10/11
- ✅ Node.js 16+
- ✅ npm 7+
- ✅ VS Code, Notepad++, Sublime Text
- ✅ Chrome, Firefox, Edge
- ✅ PowerShell 5.1+

---

## 🔒 SÉCURITÉ

- ✅ Sauvegarde automatique de l'ancien fichier
- ✅ Script PowerShell signé
- ✅ Aucune modification des données existantes
- ✅ Réversible (fichier .backup créé)

---

## 📞 SUPPORT

### Problèmes Courants

1. **Encodage incorrect** → Voir VERIFICATION.md, Test 1
2. **Module introuvable** → Voir VERIFICATION.md, Problème 2
3. **Planches = 0** → Voir VERIFICATION.md, Problème 3
4. **Rien ne s'affiche** → Voir VERIFICATION.md, Problème 4

### Documentation Additionnelle

- Voir **INSTALLATION_WINDOWS.md** pour résolution problèmes
- Voir **VERIFICATION.md** pour tests détaillés
- Console F12 du navigateur pour erreurs JavaScript

---

## 🎉 APRÈS L'INSTALLATION

Vous aurez une application professionnelle qui :
- ✅ Affiche correctement tous les caractères français
- ✅ Calcule automatiquement les planches nécessaires
- ✅ Génère des planning semis détaillés
- ✅ Estime les coûts et besoins en intrants
- ✅ Valide la faisabilité avec vos jardins
- ✅ Vous alerte en cas de problème

**Exactement comme dans vos screenshots de référence !** 🎯

---

## 🚀 PROCHAINES ÉTAPES

Après installation réussie, vous pourrez :

1. **Planifier toute votre saison** en quelques minutes
2. **Générer automatiquement** les plans pour chaque culture
3. **Optimiser** l'utilisation de vos planches
4. **Anticiper** les besoins en intrants
5. **Valider** la faisabilité avant de commander

---

## 📈 VERSION

- **Version actuelle** : V9.0
- **Date de release** : Décembre 2024
- **Compatibilité** : Windows (structure plate sans /src)
- **Encodage** : UTF-8 with BOM

---

## 💡 ASTUCE

Si vous voulez comprendre la théorie derrière les calculs :
- Lire **PRINCIPE_CALCUL_PLANCHES.md**
- Lire **ESTIMATION_PLANCHES_PAR_LEGUME.md**

**La formule magique** :
```
Planches Simultanées = (Besoin/sem ÷ Rendement/planche) × Durée production
```

---

**Bonne installation ! 🌱**

Pour toute question : se référer à INSTALLATION_WINDOWS.md
