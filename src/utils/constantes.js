// constantes.js V14 - Configuration centralisée
// 🆕 V14 : Saison corrigée à 20 semaines (S18→S37)

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NIVEAUX DE MATURITÉ DE LA FERME
 * Impact direct sur les rendements attendus
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const NIVEAUX_MATURITE = {
  debutant: {
    id: 'debutant',
    label: 'Débutant',
    description: 'Ferme en création (0-3 ans)',
    coefficient: 0.70,
    icone: '🌱',
    couleur: '#f97316', // orange
    conseils: [
      'Prévoir des marges de sécurité importantes',
      'Commencer avec des cultures robustes',
      'Ne pas surcharger en nombre de cultures'
    ],
    impactDescription: 'Rendements réduits de 30% par rapport aux références IJM'
  },
  junior: {
    id: 'junior',
    label: 'Junior',
    description: 'Ferme en développement (3-6 ans)',
    coefficient: 0.85,
    icone: '🌿',
    couleur: '#3b82f6', // blue
    conseils: [
      'Optimiser les rotations',
      'Affiner les pratiques culturales',
      'Diversifier progressivement'
    ],
    impactDescription: 'Rendements réduits de 15% par rapport aux références IJM'
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    description: 'Ferme établie (6+ ans)',
    coefficient: 1.00,
    icone: '🌳',
    couleur: '#22c55e', // green
    conseils: [
      'Rendements de référence IJM atteignables',
      'Focus sur l\'optimisation fine',
      'Maximiser les successions'
    ],
    impactDescription: 'Rendements 100% des références IJM'
  }
};

export const NIVEAU_MATURITE_DEFAUT = 'debutant';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIGURATION DE LA SAISON
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const SAISON = {
  debut: 18,        // Semaine 18 = début mai
  fin: 37,          // 🆕 V14 : Semaine 37 = mi-septembre (était 38)
  duree: 20,        // 🆕 V14 : 20 semaines de vente (était 21)
  mois: 'Mai-Septembre',
  
  // Extensions possibles
  debutPreparation: 10, // Semaine 10 = début mars (semis)
  finRecolte: 44,       // Semaine 44 = fin octobre (dernières récoltes)
  
  // Labels pour affichage
  labels: {
    18: 'Mai (S18)',
    22: 'Juin (S22)',
    26: 'Juillet (S26)',
    31: 'Août (S31)',
    35: 'Sept (S35)',
    37: 'Mi-Sept (S37)' // 🆕 V14 : était 38
  }
};

/**
 * Vérifie si une semaine est dans la saison de vente
 */
export function estDansSaison(semaine) {
  return semaine >= SAISON.debut && semaine <= SAISON.fin;
}

/**
 * Calcule la proportion d'une période dans la saison
 */
export function proportionEnSaison(debut, fin) {
  const debutEffectif = Math.max(debut, SAISON.debut);
  const finEffective = Math.min(fin, SAISON.fin);
  const dureeEnSaison = Math.max(0, finEffective - debutEffectif + 1);
  const dureeTotal = fin - debut + 1;
  return dureeTotal > 0 ? dureeEnSaison / dureeTotal : 0;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TYPES DE CYCLES DE CULTURE
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const TYPES_CYCLES = {
  LONGUE_DUREE: {
    id: 'LONGUE_DUREE',
    label: 'Longue durée',
    description: 'Occupe la planche toute la saison (tomates, aubergines...)',
    icone: '🏠',
    couleur: '#8b5cf6' // purple
  },
  ROTATION_MOYENNE: {
    id: 'ROTATION_MOYENNE',
    label: 'Rotation moyenne',
    description: '2-3 cycles par saison (courgettes, carottes, haricots...)',
    icone: '🔄',
    couleur: '#3b82f6' // blue
  },
  ROTATION_RAPIDE: {
    id: 'ROTATION_RAPIDE',
    label: 'Rotation rapide',
    description: '4+ cycles par saison (radis, mesclun, verdurettes...)',
    icone: '⚡',
    couleur: '#22c55e' // green
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIGURATION DES JARDINS PAR DÉFAUT
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const JARDINS_DEFAUT = [
  { id: 1, nom: 'Jardin 1 Racines', nombrePlanches: 12, longueurPlanche: 15, couleur: '#22c55e' },
  { id: 2, nom: 'Jardin 2 Feuilles', nombrePlanches: 12, longueurPlanche: 15, couleur: '#3b82f6' },
  { id: 3, nom: 'Jardin 3 Fruits', nombrePlanches: 12, longueurPlanche: 15, couleur: '#f97316' },
  { id: 4, nom: 'Jardin 4 Graines', nombrePlanches: 12, longueurPlanche: 15, couleur: '#8b5cf6' },
  { id: 5, nom: 'Jardin 5 Aromatique', nombrePlanches: 12, longueurPlanche: 15, couleur: '#ec4899' },
  { id: 6, nom: 'Jardin 6 Serre', nombrePlanches: 8, longueurPlanche: 30, couleur: '#14b8a6' }
];

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COULEURS PAR CULTURE
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const COULEURS_CULTURES = {
  tomate: '#ef4444',
  aubergine: '#8b5cf6',
  courgette: '#22c55e',
  concombre: '#06b6d4',
  haricot: '#84cc16',
  carotte: '#f97316',
  betterave: '#ec4899',
  radis: '#f43f5e',
  mesclun: '#10b981',
  verdurette: '#14b8a6',
  basilic: '#6366f1'
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXPORT PAR DÉFAUT
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default {
  NIVEAUX_MATURITE,
  NIVEAU_MATURITE_DEFAUT,
  SAISON,
  TYPES_CYCLES,
  JARDINS_DEFAUT,
  COULEURS_CULTURES,
  estDansSaison,
  proportionEnSaison
};
