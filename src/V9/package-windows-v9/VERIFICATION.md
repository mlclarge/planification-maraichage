# ✅ GUIDE DE VÉRIFICATION - V9.0

## 🧪 TESTS À EFFECTUER

### Test 1 : Encodage UTF-8 Corrigé ✅

**Où regarder** : Partout dans l'interface

**Ce que vous devez voir** :
- ✅ "Marché" (PAS "MarchÃ©")
- ✅ "Résumé" (PAS "RÃ©sumÃ©")  
- ✅ "Légume" (PAS "LÃ©gume")
- ✅ "€" (PAS "â‚¬")
- ✅ "Série" (PAS "SÃ©rie")

**Si erreur** :
- Ouvrir SelectionCultures.jsx dans VS Code
- Vérifier l'encodage en bas à droite : doit être "UTF-8"
- Si incorrect : "Reopen with Encoding" → "UTF-8"

---

### Test 2 : Module de Calcul Installé ✅

**Vérifier dans l'explorateur Windows** :
```
votre-projet\src\utils\calculPlanchesSimultanees.js
```

**Taille attendue** : ~9 KB

**Si absent** :
```powershell
copy package-windows-v9\calculPlanchesSimultanees.js src\utils\
```

---

### Test 3 : Calcul Planches Simultanées ✅

**Test** : Ajouter culture "Courgettes"

**Ce que vous devez voir** :

```
📊 Planification Professionnelle
├─ Besoin/semaine: 44 kg
├─ Rendement net/planche: 88.2 kg
└─ ⭐ Planches simultanées: 5
```

**Si vous voyez "0" ou rien** :
1. Ouvrir Console F12 (dans navigateur)
2. Chercher erreurs en rouge
3. Vérifier que marché est configuré (30 paniers AMAP minimum)

---

### Test 4 : Planning Semis Échelonnés ✅

**Ce que vous devez voir** :

```
📅 Planning de Semis Échelonnés (4 séries)

Série 1: 2 planches
├─ Semis : Semaine 15
├─ Plantation : Semaine 18
└─ Récolte : Semaines 22-26

[... Séries 2, 3, 4 ...]
```

**Si absent** :
- Vérifier que `culture.planComplet` existe (Console F12)
- Vérifier imports en haut du fichier

---

### Test 5 : Besoins en Intrants ✅

**Ce que vous devez voir** :

```
🌱 Besoins en Intrants pour la Saison

Plants nécessaires: 400
Plants à préparer: 480 (+20% marge)
Graines à semer: 533 (2.7g)
Substrat: 24L (1 bac)

Coût estimé : 7 €
Graines: 3€ • Substrat: 4€
```

**Si absent** :
- Même diagnostic que Test 4

---

### Test 6 : Alertes de Validation ✅

**Test** : Ajouter trop de cultures pour dépasser capacité jardin

**Ce que vous devez voir** :
```
❌ Pas assez de planches ! Besoin : 60, Disponible : 50
```

ou

```
⚠️ 2 semis hors fenêtre optimale (S10-S22)
```

---

### Test 7 : Compatibilité avec Fonctions Existantes ✅

**Test** : Vérifier que les anciennes fonctions marchent encore

**À tester** :
- ✅ Ajouter une série (bouton "➕ Ajouter une série")
- ✅ Supprimer une série (bouton X rouge)
- ✅ Modifier nombre de planches d'une série
- ✅ Changer le jardin assigné
- ✅ Retirer une culture (bouton X en haut)

**Tout doit fonctionner normalement**

---

## 🐛 PROBLÈMES COURANTS

### Problème 1 : Encodage Toujours Incorrect

**Symptôme** : "MarchÃ©" persiste

**Solution 1** : Forcer UTF-8 dans VS Code
```
1. Ouvrir SelectionCultures.jsx
2. Cliquer encodage en bas à droite
3. "Save with Encoding" → "UTF-8 with BOM"
4. Sauvegarder (Ctrl+S)
5. Recharger navigateur (Ctrl+Shift+R)
```

**Solution 2** : Vider le cache
```
1. Dans navigateur : Ctrl+Shift+Delete
2. Cocher "Cached images and files"
3. Cliquer "Clear data"
4. Recharger page (F5)
```

---

### Problème 2 : "Cannot find module"

**Erreur console** :
```
Error: Cannot find module '../utils/calculPlanchesSimultanees'
```

**Solution** :
```powershell
# Vérifier présence fichier
ls src\utils\calculPlanchesSimultanees.js

# Si absent, copier
copy package-windows-v9\calculPlanchesSimultanees.js src\utils\

# Redémarrer serveur
Ctrl+C (arrêter)
npm run dev (relancer)
```

---

### Problème 3 : Planches Simultanées = 0

**Cause** : Marché mal configuré ou vide

**Solution** :
1. Aller onglet "Marché"
2. Vérifier : au moins 10 paniers AMAP configurés
3. Cliquer "Valider la Configuration"
4. Retourner onglet "Cultures"
5. Retirer la culture
6. La rajouter

**Console F12** : Devrait afficher
```
📊 Plan généré pour Courgettes {calcul: {planchesSimultanees: 5, ...}}
```

---

### Problème 4 : Rien ne S'affiche

**Cause** : Erreur JavaScript bloque le rendu

**Solution** :
1. Ouvrir Console F12
2. Chercher erreur en rouge
3. Noter le message exact
4. Vérifier la ligne d'erreur dans SelectionCultures.jsx

**Erreurs communes** :
- `Unexpected token` → Problème de syntaxe
- `undefined is not a function` → Import manquant
- `Cannot read property` → Données nulles

**Si aucune erreur** : Problème de CSS
```powershell
# Réinstaller dépendances
rm -r node_modules
npm install
npm run dev
```

---

## 📊 RÉSULTATS ATTENDUS PAR LÉGUME

### Configuration Test (30 paniers AMAP)

| Légume | Planches Simultanées |
|--------|---------------------|
| 🍅 Tomates | 4 |
| 🥒 Courgettes | 5 |
| 🥒 Concombres | 7 |
| 🍆 Aubergines | 3 |
| 🫘 Haricots | 9 |

**Si vos chiffres sont différents** : C'est normal si votre configuration marché diffère

**Si tous = 0** : Problème de calcul, voir Problème 3

---

## ✅ CHECKLIST COMPLÈTE

### Encodage
- [ ] "Marché" correct partout
- [ ] "Résumé" correct
- [ ] "€" correct
- [ ] Aucun "Ã©", "Ã ", "Ã¨" visible

### Fonctionnalités V9
- [ ] Module calculPlanchesSimultanees.js présent
- [ ] "Planches simultanées" affichées (> 0)
- [ ] "Planning Semis Échelonnés" visible
- [ ] 4 séries listées avec dates
- [ ] "Besoins Intrants" visibles
- [ ] Coûts estimés affichés

### Compatibilité
- [ ] Ajouter série fonctionne
- [ ] Supprimer série fonctionne
- [ ] Modifier planches fonctionne
- [ ] Changer jardin fonctionne
- [ ] Retirer culture fonctionne

### Console F12
- [ ] Aucune erreur rouge
- [ ] Message "📊 Plan généré pour..." visible
- [ ] Objet plan contient `calcul`, `series`, `intrants`

---

## 🎉 SI TOUT EST ✅

**Félicitations !** Votre installation V9.0 est complète et fonctionnelle !

Vous avez maintenant :
- ✅ Encodage UTF-8 parfait
- ✅ Calcul intelligent des planches
- ✅ Planning automatique complet
- ✅ Estimation des intrants
- ✅ Validation automatique

**Prochaine étape** : Planifier toutes vos cultures pour la saison ! 🌱

---

## 📞 SUPPORT

Si après ces vérifications vous avez encore des problèmes :

1. Noter l'erreur exacte (Console F12)
2. Noter ce qui ne s'affiche pas
3. Prendre un screenshot si possible
4. Me contacter avec ces informations

**Je suis là pour vous aider !** 💪
