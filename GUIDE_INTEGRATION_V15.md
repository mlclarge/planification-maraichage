# Guide d'Intégration V15 - Simulateur "Capacity First"

## 🎯 Philosophie de cette Version

La V15 inverse complètement l'expérience utilisateur du simulateur. Au lieu de dire "voici combien de planches il vous faut" (et souvent annoncer un dépassement décourageant), le nouveau simulateur dit :

**"Voici vos planches disponibles. Comment voulez-vous les utiliser ?"**

Cette approche "Capacity First" part des contraintes réelles du maraîcher pour lui proposer des solutions concrètes.

## 📐 Architecture du Simulateur

Le simulateur est maintenant organisé en **4 sections** logiques qui guident l'utilisateur.

### Section 1 : Vos Contraintes (en-tête fixe)

Cette section affiche les données de départ sans possibilité de modification directe (car elles viennent des autres onglets). L'utilisateur voit immédiatement sa situation actuelle, avec le marché configuré à gauche et la capacité disponible à droite. Une jauge en bas montre si la demande actuelle dépasse ou non la capacité.

### Section 2 : Scénarios Viables

Le système génère automatiquement **4 scénarios** qui rentrent dans la capacité disponible.

Le scénario **Prudent** utilise 80% de la capacité et laisse 20% de marge pour les imprévus comme la météo défavorable ou les maladies. C'est le scénario recommandé pour les débutants.

Le scénario **Équilibré** utilise 95% de la capacité et offre un bon compromis entre production et sécurité.

Le scénario **Ambitieux** utilise 100% de la capacité sans aucune marge. Il est réservé aux experts.

Le scénario **Demande Actuelle** montre la configuration actuelle pour comparaison. Si elle dépasse la capacité, elle est marquée en rouge.

Chaque carte affiche le nombre de paniers AMAP, les ventes marché, les planches nécessaires et le CA estimé. Un clic sur une carte applique automatiquement ces valeurs aux curseurs.

### Section 3 : Ajustement Manuel

C'est le cœur interactif du simulateur. L'utilisateur dispose de trois curseurs pour modifier en temps réel ses objectifs de marché. Le curseur "Paniers AMAP" va de 0 à 100 paniers. Le curseur "Ventes Marché" va de 0 à 100 unités. Le curseur "Restaurant" va de 0 à 10 unités.

À droite des curseurs, un panneau de résultats se met à jour instantanément. Il affiche une jauge de remplissage qui change de couleur selon le niveau. Le vert indique une utilisation inférieure à 80% avec une bonne marge. Le jaune signifie entre 80% et 95% avec une marge correcte. L'orange représente entre 95% et 100% avec une marge faible. Le rouge signale un dépassement de capacité.

Des conseils contextuels s'affichent en dessous pour guider l'utilisateur vers une configuration viable.

Le bouton "Appliquer au Marché" n'est actif que si les modifications sont viables et qu'il y a eu des changements. Cliquer dessus met à jour la configuration marché dans toute l'application.

### Section 4 : Détail par Culture (accordéon)

Cette section optionnelle permet un ajustement fin. Elle montre un tableau avec chaque culture, son type de cycle, le besoin calculé, le nombre de rotations, les planches nécessaires et le pourcentage du total.

L'utilisateur peut décocher certaines cultures pour les "externaliser", c'est-à-dire prévoir de les acheter à un collègue plutôt que de les produire. Cela libère des planches pour d'autres productions.

## 🔧 Fichiers à Intégrer

### calculScenarios_v15.js → src/utils/calculScenarios.js

Ce fichier contient le moteur de calcul avec les fonctions principales suivantes.

La fonction `calculerBesoinsSaison(marche)` calcule le besoin total en kg pour chaque légume sur la saison, en utilisant les compositions de paniers et la structure marché.

La fonction `calculerPlanchesParCulture(besoins, options)` convertit les besoins en kg en nombre de planches, en tenant compte du niveau de maturité, des rotations possibles et de l'intercalage.

La fonction `genererScenariosViables(marche, capacite, options)` génère les 4 scénarios prédéfinis qui rentrent dans la capacité.

La fonction `calculerImpact(marcheModifie, capacite, options)` calcule l'impact d'une modification du marché, avec les conseils contextuels.

La fonction `trouverCoefficientViable(marche, capacite, options)` trouve par dichotomie quel pourcentage de la demande peut être satisfait avec la capacité disponible.

### SimulateurScenarios_v15.jsx → src/components/SimulateurScenarios.jsx

Ce composant React gère l'interface utilisateur avec les états locaux pour le marché en cours d'édition, les calculs dérivés via useMemo pour les performances, les handlers pour les modifications et l'application, et les sous-composants pour la jauge, les cartes et les curseurs.

### App_v15.jsx → src/App.jsx

L'App.jsx mis à jour passe maintenant `setMarcheValide` au SimulateurScenarios, permettant au simulateur de modifier directement la configuration marché de l'application.

## 📦 Installation

Exécutez ces commandes dans votre terminal :

```bash
# Copier les nouveaux fichiers (retirer _v15 du nom)
cp calculScenarios_v15.js src/utils/calculScenarios.js
cp SimulateurScenarios_v15.jsx src/components/SimulateurScenarios.jsx
cp App_v15.jsx src/App.jsx

# Redémarrer l'application
npm run dev
```

## ✅ Vérification après Installation

Après installation, vérifiez ces points dans l'application.

L'onglet Simulateur doit s'ouvrir par défaut au lancement. La section "Vos Contraintes" doit afficher 68 planches si vous utilisez la configuration jardins par défaut. Les 4 scénarios doivent s'afficher, avec potentiellement le scénario "Demande Actuelle" en rouge si la demande dépasse la capacité. Les curseurs doivent mettre à jour la jauge en temps réel. Le bouton "Appliquer" doit être actif uniquement quand la configuration est viable et modifiée.

## 🎨 Parcours Utilisateur Type

Voici comment un maraîcher utiliserait typiquement ce simulateur.

Il commence par regarder la section "Vos Contraintes" pour voir sa situation actuelle. S'il constate que sa demande dépasse sa capacité, il peut d'abord essayer de cliquer sur le scénario "Équilibré" pour voir une proposition viable. Il ajuste ensuite les curseurs selon ses priorités commerciales, par exemple il peut vouloir plus d'AMAP que de marché. Il vérifie que la jauge reste dans le vert ou le jaune. Enfin, il clique sur "Appliquer au Marché" pour valider.

Il peut alors aller dans l'onglet "Cultures" pour voir le détail des séries à planter avec cette nouvelle configuration.

## 💡 Évolutions Futures Possibles

Plusieurs améliorations pourraient être envisagées pour les versions suivantes.

Une fonctionnalité de sauvegarde de scénarios personnalisés permettrait de garder plusieurs configurations. Un export PDF du scénario choisi faciliterait le partage avec des partenaires. Un historique des simulations permettrait de comparer différentes options testées. Enfin, une intégration avec l'onglet Jardins permettrait d'ajuster la capacité directement depuis le simulateur.
