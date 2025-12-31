// Compositions saisonnières de paniers (en grammes)
// Source : Documentation "Composition Saisonnière de Paniers de Légumes"
// VERSION 8.0 : Intégration de la contrainte de saison (20 semaines)

import { SAISON, estDansSaison } from '../utils/constantes';

export const compositionsPaniers = {
  printemps: { // Semaines 18-26 (Mai-Juin)
    tomate: { petit: 0, moyen: 0, grand: 0 }, // Pas encore disponible
    courgette: { petit: 400, moyen: 900, grand: 1500 }, // Fin juin
    concombre: { petit: 400, moyen: 800, grand: 1200 }, // Fin juin
    aubergine: { petit: 0, moyen: 0, grand: 0 },
    haricot: { petit: 0, moyen: 0, grand: 0 },
    mesclun: { petit: 300, moyen: 500, grand: 800 },
    verdurette: { petit: 200, moyen: 300, grand: 500 },
    carotte: { petit: 800, moyen: 1600, grand: 2400 }, // Bottes
    betterave: { petit: 600, moyen: 800, grand: 1500 }, // Bottes
    radis: { petit: 300, moyen: 600, grand: 900 }, // Bottes
    basilic: { petit: 50, moyen: 50, grand: 100 }
  },
  ete: { // Semaines 27-38 (Juillet-Septembre)
    tomate: { petit: 800, moyen: 1500, grand: 2500 },
    courgette: { petit: 600, moyen: 1000, grand: 1500 },
    concombre: { petit: 400, moyen: 800, grand: 1200 },
    aubergine: { petit: 300, moyen: 800, grand: 1000 },
    haricot: { petit: 300, moyen: 600, grand: 800 },
    mesclun: { petit: 0, moyen: 0, grand: 300 }, // Optionnel
    verdurette: { petit: 0, moyen: 0, grand: 0 },
    carotte: { petit: 500, moyen: 800, grand: 1000 },
    betterave: { petit: 300, moyen: 600, grand: 800 },
    radis: { petit: 200, moyen: 400, grand: 600 },
    basilic: { petit: 50, moyen: 50, grand: 100 }
  },
  automne: { // Semaines 39-47 (Octobre-Novembre)
    tomate: { petit: 500, moyen: 800, grand: 1000 }, // Fin de saison
    courgette: { petit: 0, moyen: 0, grand: 0 },
    concombre: { petit: 0, moyen: 0, grand: 0 },
    aubergine: { petit: 300, moyen: 500, grand: 800 },
    haricot: { petit: 0, moyen: 500, grand: 800 },
    mesclun: { petit: 200, moyen: 400, grand: 500 },
    verdurette: { petit: 150, moyen: 200, grand: 300 },
    carotte: { petit: 800, moyen: 1500, grand: 2500 }, // Conservation
    betterave: { petit: 500, moyen: 1000, grand: 1500 },
    radis: { petit: 300, moyen: 600, grand: 800 }, // Hiver/Noir
    basilic: { petit: 0, moyen: 0, grand: 0 }
  },
  hiver: { // Semaines 48-17 (Décembre-Avril)
    tomate: { petit: 0, moyen: 0, grand: 0 },
    courgette: { petit: 0, moyen: 0, grand: 0 },
    concombre: { petit: 0, moyen: 0, grand: 0 },
    aubergine: { petit: 0, moyen: 0, grand: 0 },
    haricot: { petit: 0, moyen: 0, grand: 0 },
    mesclun: { petit: 200, moyen: 400, grand: 500 }, // Sous abri
    verdurette: { petit: 0, moyen: 200, grand: 300 },
    carotte: { petit: 1500, moyen: 3000, grand: 4500 }, // Base du panier
    betterave: { petit: 1000, moyen: 1500, grand: 2000 },
    radis: { petit: 300, moyen: 600, grand: 800 }, // Noir/Daikon
    basilic: { petit: 0, moyen: 0, grand: 0 }
  }
};

// Fonction pour obtenir la saison d'une semaine
export const getSaison = (semaine) => {
  if (semaine >= 18 && semaine <= 26) return 'printemps';
  if (semaine >= 27 && semaine <= 38) return 'ete';
  if (semaine >= 39 && semaine <= 47) return 'automne';
  return 'hiver';
};

// VERSION 8.0 : Fonction pour calculer le besoin hebdomadaire par légume
// MODIFICATION CRITIQUE : Ne calcule que sur les semaines de saison (18-38)
export const calculerBesoinHebdo = (marche, semaine) => {
  // V8.0 NOUVEAU : Vérifier si on est dans la saison commerciale
  if (!estDansSaison(semaine)) {
    // Hors saison : retourner des besoins à zéro
    const legumes = Object.keys(compositionsPaniers.printemps);
    return legumes.reduce((acc, legume) => {
      acc[legume] = {
        amap: 0,
        marche: 0,
        restaurant: 0,
        total: 0
      };
      return acc;
    }, {});
  }

  const saison = getSaison(semaine);
  const compositions = compositionsPaniers[saison];
  
  const besoins = {};
  
  Object.keys(compositions).forEach(legume => {
    const poids = compositions[legume];
    
    // AMAP
    const nombrePaniers = {
      petit: Math.round(marche.amap * marche.tauxPetit),
      moyen: Math.round(marche.amap * marche.tauxMoyen),
      grand: Math.round(marche.amap * marche.tauxGrand)
    };
    
    const besoinAMAP = (nombrePaniers.petit * poids.petit +
                        nombrePaniers.moyen * poids.moyen +
                        nombrePaniers.grand * poids.grand) / 1000; // Conversion en kg
    
    // Marché (moyenne des 3 tailles)
    const poidsMoyen = (poids.petit + poids.moyen + poids.grand) / 3;
    const besoinMarche = marche.marche * (poidsMoyen / 1000);
    
    // Restaurant (utilise le grand panier)
    const besoinRestaurant = marche.restaurant * (poids.grand / 1000);
    
    besoins[legume] = {
      amap: besoinAMAP,
      marche: besoinMarche,
      restaurant: besoinRestaurant,
      total: besoinAMAP + besoinMarche + besoinRestaurant
    };
  });
  
  return besoins;
};

// V8.0 NOUVEAU : Fonction pour calculer les besoins sur TOUTE la saison
export const calculerBesoinsSaison = (marche) => {
  const besoinsParLegume = {};
  
  // Initialiser les totaux pour chaque légume
  const legumes = Object.keys(compositionsPaniers.printemps);
  legumes.forEach(legume => {
    besoinsParLegume[legume] = {
      amap: 0,
      marche: 0,
      restaurant: 0,
      total: 0
    };
  });
  
  // Additionner les besoins sur toutes les semaines de saison
  for (let semaine = SAISON.debut; semaine <= SAISON.fin; semaine++) {
    const besoinsHebdo = calculerBesoinHebdo(marche, semaine);
    
    Object.keys(besoinsHebdo).forEach(legume => {
      besoinsParLegume[legume].amap += besoinsHebdo[legume].amap;
      besoinsParLegume[legume].marche += besoinsHebdo[legume].marche;
      besoinsParLegume[legume].restaurant += besoinsHebdo[legume].restaurant;
      besoinsParLegume[legume].total += besoinsHebdo[legume].total;
    });
  }
  
  return besoinsParLegume;
};

// Données d'intrants détaillés (€/m²)
// Source : Plan d'Affaires Microferme
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
    tempsTotal: 1.23, // h/m²/an
    tauxHoraire: 28, // €/h
    repartition: {
      recolte: 0.60, // 60%
      entretien: 0.30, // 30%
      implantation: 0.10 // 10%
    }
  }
};

// Calcul des coûts totaux d'intrants
export const calculerIntrants = (surfaceM2) => {
  const vars = intrants.variables;
  const fixes = intrants.fixes;
  const mo = intrants.mainOeuvre;
  
  return {
    variables: {
      fertilisation: surfaceM2 * ((vars.fertilisation.min + vars.fertilisation.max) / 2),
      semences: surfaceM2 * ((vars.semences.min + vars.semences.max) / 2),
      protection: surfaceM2 * ((vars.protection.min + vars.protection.max) / 2),
      total: 0
    },
    fixes: {
      materiel: surfaceM2 * fixes.materiel.valeur,
      serres: surfaceM2 * fixes.infrastructures.serres.valeur,
      irrigation: surfaceM2 * fixes.infrastructures.irrigation.valeur,
      vehicule: surfaceM2 * fixes.logistique.vehicule.valeur,
      vente: surfaceM2 * fixes.logistique.vente.valeur,
      energie: surfaceM2 * fixes.energie.valeur,
      administratif: surfaceM2 * fixes.administratif.valeur,
      total: 0
    },
    mainOeuvre: {
      heuresTotal: surfaceM2 * mo.tempsTotal,
      recolte: surfaceM2 * mo.tempsTotal * mo.repartition.recolte,
      entretien: surfaceM2 * mo.tempsTotal * mo.repartition.entretien,
      implantation: surfaceM2 * mo.tempsTotal * mo.repartition.implantation,
      coutTotal: surfaceM2 * mo.tempsTotal * mo.tauxHoraire
    },
    total: 0
  };
};

// Export pour compatibilité
export default {
  compositionsPaniers,
  getSaison,
  calculerBesoinHebdo,
  calculerBesoinsSaison,
  intrants,
  calculerIntrants,
  SAISON // V8.0 : Export de la constante SAISON
};
