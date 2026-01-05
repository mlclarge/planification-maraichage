// compositionsPaniers.js V2 - CORRIGÉ selon données IJM
// 🎯 Besoins hebdo cibles (50 paniers + 20 marché + 10 restos) :
// - Tomates: 55-60 kg/sem
// - Courgettes: 45-50 kg/sem  
// - Concombres: 35 kg/sem (pièces ~400g)
// - Carottes: 35-40 kg/sem (80 bottes × ~450g)
// - Betteraves: 25-30 kg/sem (42 bottes × ~600g)
// - Mesclun: 22.5 kg/sem
// - Verdurettes: 10-15 kg/sem
// - Haricots: 20-25 kg/sem
// - Radis: 20-25 kg/sem (70 bottes × ~300g)
// - Basilic: 3-4 kg/sem (60 bouquets × ~50g)
// - Aubergines: 20-25 kg/sem

import { SAISON, estDansSaison } from '../utils/constantes';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSITIONS SAISONNIÈRES (en grammes par panier)
// RECALIBRÉES selon exercice IJM pour 50 paniers + 20 marché + 10 restos
// ═══════════════════════════════════════════════════════════════════════════

export const compositionsPaniers = {
  printemps: { // Semaines 18-26 (Mai-Juin) - Début de saison
    tomate: { petit: 0, moyen: 0, grand: 0 },           // Pas encore dispo
    courgette: { petit: 200, moyen: 400, grand: 600 },  // Fin juin seulement
    concombre: { petit: 200, moyen: 400, grand: 600 },  // Fin juin seulement
    aubergine: { petit: 0, moyen: 0, grand: 0 },        // Pas encore dispo
    haricot: { petit: 0, moyen: 0, grand: 0 },          // Pas encore dispo
    mesclun: { petit: 200, moyen: 350, grand: 500 },    // Culture de base printemps
    verdurette: { petit: 100, moyen: 150, grand: 200 }, // Complément mesclun
    carotte: { petit: 300, moyen: 500, grand: 700 },    // Carottes nouvelles
    betterave: { petit: 250, moyen: 400, grand: 550 },  // Bottes avec fanes
    radis: { petit: 200, moyen: 350, grand: 500 },      // Forte demande printemps
    basilic: { petit: 30, moyen: 50, grand: 70 }        // Début timide
  },
  
  ete: { // Semaines 27-37 (Juillet-Mi Sept) - Pleine saison
    tomate: { petit: 400, moyen: 750, grand: 1100 },    // 🍅 Réduit pour ~60 kg/sem
    courgette: { petit: 350, moyen: 600, grand: 850 },  // Réduit pour ~50 kg/sem
    concombre: { petit: 250, moyen: 450, grand: 650 },  // ~1 pièce/panier
    aubergine: { petit: 150, moyen: 300, grand: 450 },  // Réduit pour ~25 kg/sem
    haricot: { petit: 150, moyen: 300, grand: 450 },    // Récolte manuelle intensive
    mesclun: { petit: 150, moyen: 250, grand: 400 },    // Augmenté pour ~22 kg/sem
    verdurette: { petit: 50, moyen: 100, grand: 150 },  // Minimal en été
    carotte: { petit: 250, moyen: 400, grand: 550 },    // Augmenté pour ~35 kg/sem
    betterave: { petit: 150, moyen: 300, grand: 450 },  // Volume modéré
    radis: { petit: 100, moyen: 200, grand: 300 },      // Réduit (chaleur)
    basilic: { petit: 30, moyen: 50, grand: 70 }        // Réduit pour ~4 kg/sem
  },
  
  automne: { // Semaines 38-44 (Fin Sept-Octobre) - Fin de saison
    tomate: { petit: 300, moyen: 500, grand: 700 },     // Dernières récoltes
    courgette: { petit: 0, moyen: 0, grand: 0 },        // Fin de cycle
    concombre: { petit: 0, moyen: 0, grand: 0 },        // Fin de cycle
    aubergine: { petit: 150, moyen: 300, grand: 450 },  // Fin de cycle
    haricot: { petit: 100, moyen: 200, grand: 300 },    // Dernières séries
    mesclun: { petit: 200, moyen: 350, grand: 500 },    // Retour en force
    verdurette: { petit: 100, moyen: 150, grand: 200 }, // Retour
    carotte: { petit: 400, moyen: 700, grand: 1000 },   // Conservation
    betterave: { petit: 300, moyen: 500, grand: 700 },  // Conservation
    radis: { petit: 200, moyen: 350, grand: 500 },      // Radis d'hiver
    basilic: { petit: 0, moyen: 0, grand: 0 }           // Fin
  },
  
  hiver: { // Semaines 45-17 - HORS SAISON VENTE
    tomate: { petit: 0, moyen: 0, grand: 0 },
    courgette: { petit: 0, moyen: 0, grand: 0 },
    concombre: { petit: 0, moyen: 0, grand: 0 },
    aubergine: { petit: 0, moyen: 0, grand: 0 },
    haricot: { petit: 0, moyen: 0, grand: 0 },
    mesclun: { petit: 150, moyen: 300, grand: 450 },    // Sous abri possible
    verdurette: { petit: 0, moyen: 100, grand: 150 },
    carotte: { petit: 500, moyen: 900, grand: 1300 },   // Stock conservation
    betterave: { petit: 400, moyen: 700, grand: 1000 }, // Stock conservation
    radis: { petit: 200, moyen: 350, grand: 500 },      // Radis noir/daikon
    basilic: { petit: 0, moyen: 0, grand: 0 }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Retourne la saison pour une semaine donnée
 */
export const getSaison = (semaine) => {
  if (semaine >= 18 && semaine <= 26) return 'printemps';
  if (semaine >= 27 && semaine <= 37) return 'ete';  // 🆕 V2: fin à 37 (pas 38)
  if (semaine >= 38 && semaine <= 44) return 'automne';
  return 'hiver';
};

/**
 * Calcule le besoin hebdomadaire par légume pour une semaine donnée
 * @param {Object} marche - Configuration du marché {amap, marche, restaurant, tauxPetit, tauxMoyen, tauxGrand}
 * @param {number} semaine - Numéro de semaine (1-52)
 * @returns {Object} Besoins par légume {amap, marche, restaurant, total}
 */
export const calculerBesoinHebdo = (marche, semaine) => {
  // Vérifier si on est dans la saison commerciale (S18-S37)
  if (!estDansSaison(semaine)) {
    const legumes = Object.keys(compositionsPaniers.printemps);
    return legumes.reduce((acc, legume) => {
      acc[legume] = { amap: 0, marche: 0, restaurant: 0, total: 0 };
      return acc;
    }, {});
  }

  const saison = getSaison(semaine);
  const compositions = compositionsPaniers[saison];
  
  // Valeurs par défaut pour les taux de répartition
  const tauxPetit = marche.tauxPetit || 0.33;
  const tauxMoyen = marche.tauxMoyen || 0.33;
  const tauxGrand = marche.tauxGrand || 0.34;
  
  const besoins = {};
  
  Object.keys(compositions).forEach(legume => {
    const poids = compositions[legume];
    
    // AMAP : répartition selon taux petit/moyen/grand
    const nombrePaniers = {
      petit: Math.round(marche.amap * tauxPetit),
      moyen: Math.round(marche.amap * tauxMoyen),
      grand: Math.round(marche.amap * tauxGrand)
    };
    
    const besoinAMAP = (
      nombrePaniers.petit * poids.petit +
      nombrePaniers.moyen * poids.moyen +
      nombrePaniers.grand * poids.grand
    ) / 1000; // Conversion g → kg
    
    // Marché : moyenne pondérée des 3 tailles
    const poidsMoyenMarche = (poids.petit + poids.moyen + poids.grand) / 3;
    const besoinMarche = marche.marche * (poidsMoyenMarche / 1000);
    
    // Restaurant : basé sur le grand panier (commandes volume)
    const besoinRestaurant = marche.restaurant * (poids.grand / 1000);
    
    besoins[legume] = {
      amap: Math.round(besoinAMAP * 100) / 100,
      marche: Math.round(besoinMarche * 100) / 100,
      restaurant: Math.round(besoinRestaurant * 100) / 100,
      total: Math.round((besoinAMAP + besoinMarche + besoinRestaurant) * 100) / 100
    };
  });
  
  return besoins;
};

/**
 * Calcule les besoins sur TOUTE la saison (S18-S37)
 */
export const calculerBesoinsSaison = (marche) => {
  const besoinsParLegume = {};
  
  // Initialiser
  const legumes = Object.keys(compositionsPaniers.printemps);
  legumes.forEach(legume => {
    besoinsParLegume[legume] = { amap: 0, marche: 0, restaurant: 0, total: 0 };
  });
  
  // Additionner sur toutes les semaines de saison
  for (let semaine = SAISON.debut; semaine <= SAISON.fin; semaine++) {
    const besoinsHebdo = calculerBesoinHebdo(marche, semaine);
    
    Object.keys(besoinsHebdo).forEach(legume => {
      besoinsParLegume[legume].amap += besoinsHebdo[legume].amap;
      besoinsParLegume[legume].marche += besoinsHebdo[legume].marche;
      besoinsParLegume[legume].restaurant += besoinsHebdo[legume].restaurant;
      besoinsParLegume[legume].total += besoinsHebdo[legume].total;
    });
  }
  
  // Arrondir les totaux
  Object.keys(besoinsParLegume).forEach(legume => {
    besoinsParLegume[legume].amap = Math.round(besoinsParLegume[legume].amap * 10) / 10;
    besoinsParLegume[legume].marche = Math.round(besoinsParLegume[legume].marche * 10) / 10;
    besoinsParLegume[legume].restaurant = Math.round(besoinsParLegume[legume].restaurant * 10) / 10;
    besoinsParLegume[legume].total = Math.round(besoinsParLegume[legume].total * 10) / 10;
  });
  
  return besoinsParLegume;
};

// ═══════════════════════════════════════════════════════════════════════════
// DONNÉES D'INTRANTS (inchangées)
// ═══════════════════════════════════════════════════════════════════════════

export const intrants = {
  variables: {
    fertilisation: { min: 0.18, max: 0.23, description: 'Compost et amendements organiques' },
    semences: { min: 0.20, max: 1.50, description: 'Plants et semences (variable selon HVA)' },
    protection: { min: 0.10, max: 0.30, description: 'Voiles, filets, biocontrôle' }
  },
  fixes: {
    materiel: { valeur: 0.43, description: 'Amortissement motoculteur et outils (7 ans)' },
    infrastructures: {
      serres: { valeur: 0.37, description: 'Serres et bâches (15 ans)' },
      irrigation: { valeur: 0.15, description: 'Système irrigation (10 ans)' }
    },
    logistique: {
      vehicule: { valeur: 0.70, description: 'Véhicule livraison (5 ans)' },
      vente: { valeur: 0.40, description: 'Matériel vente (5 ans)' }
    },
    energie: { valeur: 0.20, description: 'Carburants, électricité' },
    administratif: { valeur: 0.50, description: 'Comptabilité, assurance, certification' }
  },
  mainOeuvre: {
    tempsTotal: 1.23,
    tauxHoraire: 28,
    repartition: {
      recolte: 0.60,
      entretien: 0.30,
      implantation: 0.10
    }
  }
};

export const calculerIntrants = (surfaceM2) => {
  const vars = intrants.variables;
  const fixes = intrants.fixes;
  const mo = intrants.mainOeuvre;
  
  const variablesTotal = surfaceM2 * (
    (vars.fertilisation.min + vars.fertilisation.max) / 2 +
    (vars.semences.min + vars.semences.max) / 2 +
    (vars.protection.min + vars.protection.max) / 2
  );
  
  const fixesTotal = surfaceM2 * (
    fixes.materiel.valeur +
    fixes.infrastructures.serres.valeur +
    fixes.infrastructures.irrigation.valeur +
    fixes.logistique.vehicule.valeur +
    fixes.logistique.vente.valeur +
    fixes.energie.valeur +
    fixes.administratif.valeur
  );
  
  const moTotal = surfaceM2 * mo.tempsTotal * mo.tauxHoraire;
  
  return {
    variables: {
      fertilisation: surfaceM2 * ((vars.fertilisation.min + vars.fertilisation.max) / 2),
      semences: surfaceM2 * ((vars.semences.min + vars.semences.max) / 2),
      protection: surfaceM2 * ((vars.protection.min + vars.protection.max) / 2),
      total: variablesTotal
    },
    fixes: {
      materiel: surfaceM2 * fixes.materiel.valeur,
      serres: surfaceM2 * fixes.infrastructures.serres.valeur,
      irrigation: surfaceM2 * fixes.infrastructures.irrigation.valeur,
      vehicule: surfaceM2 * fixes.logistique.vehicule.valeur,
      vente: surfaceM2 * fixes.logistique.vente.valeur,
      energie: surfaceM2 * fixes.energie.valeur,
      administratif: surfaceM2 * fixes.administratif.valeur,
      total: fixesTotal
    },
    mainOeuvre: {
      heuresTotal: surfaceM2 * mo.tempsTotal,
      recolte: surfaceM2 * mo.tempsTotal * mo.repartition.recolte,
      entretien: surfaceM2 * mo.tempsTotal * mo.repartition.entretien,
      implantation: surfaceM2 * mo.tempsTotal * mo.repartition.implantation,
      coutTotal: moTotal
    },
    total: variablesTotal + fixesTotal + moTotal
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  compositionsPaniers,
  getSaison,
  calculerBesoinHebdo,
  calculerBesoinsSaison,
  intrants,
  calculerIntrants,
  SAISON
};
