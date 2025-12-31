# Guide d'Intégration V14 - Simulateur de Scénarios

## 🎯 Objectif de cette Version

La V14 introduit un **Simulateur de Scénarios** complet qui permet de tester différentes configurations et de trouver l'équilibre optimal entre ta capacité de production (68 planches) et ta demande du marché.

## 📊 Ce que le Simulateur permet

Le simulateur répond à ta question : "Comment tenir ma production sur 68 planches ?"

Il te permet de jouer sur **4 leviers** simultanément et de voir l'impact en temps réel :

### 1. Niveau de Maturité
Tu peux basculer instantanément entre Débutant (×0.70), Junior (×0.85) et Expert (×1.00) pour voir combien de planches sont nécessaires dans chaque cas.

### 2. Mode de Calcul
Tu peux activer/désactiver le mode Bio-Intensif qui intercale les cultures rapides (radis, mesclun, verdurettes) dans les fenêtres libres des cultures longues (avant et après les tomates par exemple).

### 3. Ajustement de la Demande
Un curseur te permet de réduire ta production cible de 100% à 50%. Si tu passes à 80%, le système recalcule automatiquement les planches nécessaires.

### 4. Exclusion de Cultures
Tu peux exclure certaines cultures gourmandes en planches (ex: carottes) pour voir l'impact. Cela simule le cas où tu achèterais ces légumes à un collègue.

## 🧮 L'Intercalage Bio-Intensif Expliqué

Le mode Bio-Intensif exploite les fenêtres temporelles libres :

```
EXEMPLE : Planche de Tomates

Semaine 10    Semaine 18    Semaine 40    Semaine 44
    │             │              │              │
    │◄── RADIS ──►│◄── TOMATES ─►│◄── RADIS ───►│
    │   (8 sem)   │   (22 sem)   │   (4 sem)    │
    │             │              │              │
```

Les radis peuvent être cultivés AVANT la plantation des tomates (S10-S17) et APRÈS leur récolte (S41-S44). Ces 12 semaines "gratuites" représentent l'équivalent de 2-3 planches de radis économisées !

### Matrice de Compatibilité

| Culture Hôte | Fenêtre Avant | Fenêtre Après | Cultures Compatibles |
|--------------|---------------|---------------|---------------------|
| Tomates | 8 semaines | 4 semaines | Radis, Mesclun, Verdurettes |
| Aubergines | 8 semaines | 4 semaines | Radis, Mesclun, Verdurettes |
| Concombres | 8 semaines | 6 semaines | Radis, Mesclun |

## 📈 Résultats Attendus pour ta Ferme (68 planches)

Voici les scénarios pré-calculés que tu verras dans le comparateur :

| Scénario | Planches | Viable ? | Notes |
|----------|----------|----------|-------|
| Débutant Standard | 156 | ❌ | Mode actuel - 88 planches de trop |
| Débutant Bio-Intensif | 140 | ❌ | -16 pl. grâce à l'intercalage |
| Débutant Prudent (80%) | 112 | ❌ | Encore insuffisant |
| Débutant Prudent (70%) | 98 | ⚠️ | Se rapproche... |
| Junior Bio-Intensif | 82 | ⚠️ | Projection saison 2-3 |
| Expert Bio-Intensif | 70 | ✅ | Ferme établie |

**Conclusion** : En mode débutant, tu ne peux pas tenir 100% de ta demande sur 68 planches. Les options sont :

1. **Réduire la demande à ~70%** (moins de paniers ou paniers plus petits)
2. **Prioriser** les cultures à haut ratio €/planche et acheter le reste
3. **Planifier sur 2-3 saisons** pour atteindre le niveau Junior

## 🔔 Les Notifications Explicatives

Le simulateur génère automatiquement des notifications pour t'expliquer chaque situation :

### Types de Notifications

**✅ Success (vert)** : Le scénario est viable, tu peux produire ta demande.

**⚠️ Warning (jaune)** : Le scénario est limite, quelques ajustements suffiraient.

**❌ Error (rouge)** : Capacité insuffisante, ajustements majeurs nécessaires.

**ℹ️ Info (bleu)** : Explications sur les paramètres et leurs impacts.

### Exemples de Notifications

"⚠️ **Carottes : 46 planches** - Cette culture représente 30% de votre besoin total. Envisagez de réduire sa production ou d'en acheter une partie."

"⚡ **Intercalage Actif** - L'intercalage des cultures rapides vous fait économiser 16 planches."

"🌱 **Niveau Débutant** - Le coefficient ×0.70 applique une marge de sécurité de 30%. Après 2-3 saisons d'expérience, vous pourrez passer en Junior."

## 📁 Fichiers à Intégrer

### 1. `calculScenarios_v14.js` → `src/utils/calculScenarios.js`

Moteur de calcul des scénarios avec :
- `simulerScenario()` : Calcule un scénario complet
- `comparerScenarios()` : Compare 5 scénarios types
- `trouverScenarioOptimal()` : Trouve la meilleure config pour ton niveau
- `calculerCapaciteIntercalage()` : Calcule les fenêtres d'intercalage
- `genererNotifications()` : Génère les explications contextuelles

### 2. `SimulateurScenarios_v14.jsx` → `src/components/SimulateurScenarios.jsx`

Interface utilisateur avec :
- Sélecteur de niveau de maturité
- Sélecteur de mode (Standard/Bio-Intensif)
- Curseur d'ajustement de demande
- Tableau de détail par culture avec exclusion
- Comparateur de scénarios
- Notifications contextuelles

### 3. `App_v14.jsx` → `src/App.jsx`

Mise à jour de l'application avec :
- Nouvel onglet "Simulateur" (premier onglet)
- Badge "New" sur l'onglet
- Intégration du composant SimulateurScenarios

## 🔧 Installation

```bash
# 1. Copier les nouveaux fichiers
cp calculScenarios_v14.js src/utils/calculScenarios.js
cp SimulateurScenarios_v14.jsx src/components/SimulateurScenarios.jsx
cp App_v14.jsx src/App.jsx

# 2. S'assurer que les dépendances V13 sont présentes
# (cultures_v13.js, constantes_v13.js, calculPlanchesSimultanees_v13.js)

# 3. Redémarrer
npm run dev
```

## 🧪 Test après Installation

1. L'application doit s'ouvrir sur l'onglet "Simulateur" avec un badge "New"
2. Le résumé doit montrer ~156 planches nécessaires en mode Débutant Standard
3. En activant "Bio-Intensif", le nombre doit baisser (~140 planches)
4. En passant en "Expert", le nombre doit approcher 70 planches
5. Les notifications doivent s'afficher en temps réel

## 💡 Conseil d'Utilisation

Commence par le simulateur pour définir ta stratégie globale AVANT d'aller dans l'onglet Cultures. Une fois que tu as trouvé un scénario viable, note les paramètres (niveau, mode, % demande) et utilise-les comme référence pour ta planification détaillée.
