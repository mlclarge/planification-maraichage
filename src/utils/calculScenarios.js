// calculScenarios_V24.js - Moteur de Simulation "Capacity First"
// 🎯 Part des contraintes (planches disponibles) pour proposer des scénarios viables
// 🔧 V21 FIX : Utilise la MÊME logique de calcul que calculPlanchesSimultanees
// 🆕 V22 : Prise en compte du DÉLAI INTERCALAIRE (vacances entre cultures)
// 🆕 V24 : Prise en compte LONGUEUR PLANCHES (serre 30m = ×2)
//          + Calcul capacité en équivalent 15m

import { SAISON } from './constantes';
import { compositionsPaniers, getSaison } from '../data/compositionsPaniers';
import { cultures } from '../data/cultures';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🆕 V24 : CALCUL CAPACITÉ EN ÉQUIVALENT 15M
 * Prend en compte les différentes longueurs de planches par jardin
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function calculerCapaciteEquivalent15m(jardins) {
  if (!jardins || jardins.length === 0) return 0;
  
  return jardins.reduce((sum, j) => {
    const facteur = (j.longueurPlanche || 15) / 15;
    return sum + (j.nombrePlanches * facteur);
  }, 0);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Coefficients de maturité
export const COEFFICIENTS_MATURITE = {
  debutant: 0.70,
  junior: 0.85,
  expert: 1.00
};

// 🔧 V21 FIX : Types de cycles avec rotations EXACTES de cultures_V14.js
export const TYPES_CYCLES = {
  LONGUE_DUREE: { 
    cultures: ['tomate', 'aubergine', 'concombre', 'poivron'],
    methode: 'IJM_CAPACITE_HEBDO'
  },
  ROTATION_MOYENNE: { 
    cultures: ['courgette', 'haricot', 'carotte', 'betterave', 'basilic'],
    methode: 'SERIES_ROTATIONS'
  },
  ROTATION_RAPIDE: { 
    cultures: ['radis', 'mesclun', 'verdurette', 'epinard'],
    methode: 'SERIES_ROTATIONS'
  }
};

// 🔧 V21 FIX : Rotations MAX par culture (sans délai intercalaire)
const ROTATIONS_MAX_PAR_CULTURE = {
  tomate: 1,
  aubergine: 1,
  concombre: 1,
  poivron: 1,
  courgette: 2,
  haricot: 2,
  carotte: 2,
  betterave: 2,
  basilic: 2,
  radis: 3,
  mesclun: 3.5,
  verdurette: 4,
  epinard: 3
};

// 🆕 V22 : Délai intercalaire par défaut (vacances entre 2 cultures)
// ⚠️ SYNCHRONISÉ avec calculPlanchesSimultanees_V22.js et cultures.js
const DELAI_INTERCALAIRE_DEFAUT = {
  tomate: 2,      // Nettoyage résidus important
  aubergine: 2,
  concombre: 2,
  poivron: 2,
  courgette: 2,   // 🔧 FIX: Synchronisé avec Cultures (était 1)
  haricot: 2,     // 🔧 FIX: Synchronisé avec Cultures (était 1)
  carotte: 1,
  betterave: 2,   // 🔧 FIX: Synchronisé avec Cultures (était 1)
  basilic: 2,     // 🔧 FIX: Synchronisé avec Cultures (était 1)
  radis: 1,       // Cycle court = vacances courtes
  mesclun: 1,
  verdurette: 1,
  epinard: 1
};

// 🆕 V22 : Durée d'un cycle complet (occupation planche en semaines)
// ⚠️ SYNCHRONISÉ avec calculPlanchesSimultanees_V22.js
const DUREE_CYCLE_SEMAINES = {
  tomate: 25,     // Occupe toute la saison
  aubergine: 20,
  concombre: 16,
  poivron: 18,
  courgette: 10,
  haricot: 9,
  carotte: 10,
  betterave: 9,
  basilic: 10,
  radis: 5,
  mesclun: 5,
  verdurette: 5,
  epinard: 6
};

// 🔧 V21 FIX : Durées de récolte pour formule IJM (depuis cultures_V14.js)
const DUREE_RECOLTE_SEMAINES = {
  tomate: 25,
  aubergine: 20,
  concombre: 16,
  poivron: 16,
  courgette: 10,
  haricot: 5,
  carotte: 6,
  betterave: 4,
  basilic: 10,
  radis: 4,
  mesclun: 8,
  verdurette: 5,
  epinard: 6
};

/**
 * 🆕 V22 : Calcule le nombre de rotations effectives avec délai intercalaire
 */
function calculerRotationsEffectives(cultureId, delaiIntercalaire = null) {
  const rotationsMax = ROTATIONS_MAX_PAR_CULTURE[cultureId] || 1;
  const dureeCycle = DUREE_CYCLE_SEMAINES[cultureId] || 10;
  const delai = delaiIntercalaire ?? DELAI_INTERCALAIRE_DEFAUT[cultureId] ?? 1;
  
  // Pour les cultures longue durée, pas d'impact (1 seule rotation)
  if (rotationsMax === 1) {
    return 1;
  }
  
  // Durée effective d'un cycle avec le délai
  const dureeCycleAvecDelai = dureeCycle + delai;
  
  // Rotations possibles sur la saison
  const rotationsEffectives = Math.min(
    rotationsMax,
    Math.floor(SAISON.duree / dureeCycleAvecDelai)
  );
  
  return Math.max(1, rotationsEffectives);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CALCUL DES BESOINS PAR CULTURE
 * Calcule le besoin total sur la saison pour chaque légume
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function calculerBesoinsSaison(marche) {
  const besoins = {};
  
  // Initialiser tous les légumes à 0
  Object.keys(compositionsPaniers.printemps).forEach(legume => {
    besoins[legume] = 0;
  });
  
  // Calculer sur toutes les semaines de saison (18-37)
  for (let semaine = SAISON.debut; semaine <= SAISON.fin; semaine++) {
    const saison = getSaison(semaine);
    const compositions = compositionsPaniers[saison];
    
    Object.keys(compositions).forEach(legume => {
      const poids = compositions[legume];
      
      // AMAP (répartition par taille de panier)
      const nbPetit = Math.round(marche.amap * marche.tauxPetit);
      const nbMoyen = Math.round(marche.amap * marche.tauxMoyen);
      const nbGrand = Math.round(marche.amap * marche.tauxGrand);
      
      const besoinAMAP = (nbPetit * poids.petit + nbMoyen * poids.moyen + nbGrand * poids.grand) / 1000;
      
      // Marché (moyenne des 3 tailles)
      const poidsMoyen = (poids.petit + poids.moyen + poids.grand) / 3;
      const besoinMarche = marche.marche * (poidsMoyen / 1000);
      
      // Restaurant (grand panier)
      const besoinRestaurant = marche.restaurant * (poids.grand / 1000);
      
      besoins[legume] += besoinAMAP + besoinMarche + besoinRestaurant;
    });
  }
  
  return besoins;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔧 V21 FIX : CLASSIFIER UNE CULTURE PAR TYPE DE CYCLE
 * ═══════════════════════════════════════════════════════════════════════════
 */
function getTypeCycle(cultureId) {
  for (const [type, config] of Object.entries(TYPES_CYCLES)) {
    if (config.cultures.includes(cultureId)) {
      return type;
    }
  }
  return 'ROTATION_MOYENNE'; // Par défaut
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔧 V22 FIX : CALCUL DES PLANCHES NÉCESSAIRES PAR CULTURE
 * Utilise la MÊME logique double que calculPlanchesSimultanees_V22.js
 * 🆕 Prend en compte le délai intercalaire pour ajuster les rotations
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function calculerPlanchesParCulture(besoins, options = {}) {
  const {
    niveauMaturite = 'debutant',
    longueurPlanche = 15,
    modeIntercalage = true
  } = options;
  
  const coefficient = COEFFICIENTS_MATURITE[niveauMaturite] || 0.70;
  const resultats = {};
  let planchesTotales = 0;
  
  // Trouver les données de culture pour chaque légume
  cultures.forEach(culture => {
    const besoin = besoins[culture.id] || 0;
    if (besoin <= 0) {
      resultats[culture.id] = { planches: 0, besoin: 0, rendement: 0, rotations: 1 };
      return;
    }
    
    // Rendement selon longueur de planche
    const rendementBase = longueurPlanche === 30 
      ? culture.rendement.planche30m 
      : (culture.rendement.planche15m || culture.rendement.planche30m / 2);
    
    // Rendement avec coefficient
    const rendementEffectif = rendementBase * coefficient;
    
    // 🔧 V22 FIX : Déterminer le type de cycle et les rotations EFFECTIVES
    const typeCycle = getTypeCycle(culture.id);
    const rotationsMax = ROTATIONS_MAX_PAR_CULTURE[culture.id] || 1;
    const rotationsEffectives = calculerRotationsEffectives(culture.id); // 🆕 V22
    const delaiIntercalaire = DELAI_INTERCALAIRE_DEFAUT[culture.id] || 1;
    const dureeRecolte = DUREE_RECOLTE_SEMAINES[culture.id] || 10;
    
    let planches;
    let methodeCalcul;
    
    // 🔧 V22 FIX : Double logique de calcul avec délai intercalaire
    if (typeCycle === 'LONGUE_DUREE') {
      // ═══════════════════════════════════════════════════════════════════
      // FORMULE IJM (capacité hebdomadaire)
      // Pour les cultures qui occupent la planche toute la saison
      // Planches = Besoin_hebdo / Capacité_hebdo_par_planche
      // Le délai intercalaire n'a pas d'impact (1 seule rotation)
      // ═══════════════════════════════════════════════════════════════════
      const besoinHebdo = besoin / SAISON.duree;
      const capaciteHebdo = rendementEffectif / dureeRecolte;
      planches = Math.ceil(besoinHebdo / capaciteHebdo);
      methodeCalcul = 'IJM';
      
    } else {
      // ═══════════════════════════════════════════════════════════════════
      // FORMULE SÉRIES / ROTATIONS - 🆕 V22 AVEC DÉLAI INTERCALAIRE
      // 
      // Le délai intercalaire RÉDUIT le nombre de rotations possibles
      // rotationsEffectives = floor(Saison / (Durée_cycle + Délai))
      // 
      // ⚠️ IMPORTANT : Utiliser rendementBase (BRUT, sans coefficient)
      // ═══════════════════════════════════════════════════════════════════
      const nombreSeries = Math.ceil(besoin / rendementBase);
      planches = Math.ceil(nombreSeries / rotationsEffectives); // 🆕 V22 : rotations effectives
      methodeCalcul = 'SERIES';
    }
    
    resultats[culture.id] = {
      planches,
      besoin: Math.round(besoin * 10) / 10,
      rendement: Math.round(rendementBase * 10) / 10,
      rendementEffectif: Math.round(rendementEffectif * 10) / 10,
      rotationsMax,                    // 🆕 V22 : Max théorique
      rotations: rotationsEffectives,  // 🆕 V22 : Effectives avec délai
      delaiIntercalaire,               // 🆕 V22
      typeCycle,
      methodeCalcul,
      type: typeCycle === 'LONGUE_DUREE' ? 'longue' : 
            typeCycle === 'ROTATION_RAPIDE' ? 'rapide' : 'moyenne'
    };
    
    planchesTotales += planches;
  });
  
  // Appliquer l'intercalage si activé
  if (modeIntercalage) {
    const economie = calculerEconomieIntercalage(resultats);
    planchesTotales -= economie.planchesEconomisees;
    resultats._intercalage = economie;
  }
  
  resultats._total = planchesTotales;
  
  return resultats;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CALCUL DE L'ÉCONOMIE PAR INTERCALAGE
 * Les cultures rapides peuvent s'insérer avant/après les cultures longues
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function calculerEconomieIntercalage(resultatsParCulture) {
  // Planches de cultures longues disponibles pour intercalage
  const planchesHotes = 
    (resultatsParCulture.tomate?.planches || 0) +
    (resultatsParCulture.aubergine?.planches || 0) +
    (resultatsParCulture.concombre?.planches || 0);
  
  // Fenêtres disponibles : ~8 semaines avant + ~4 semaines après = ~12 semaines
  // Un radis = 4 semaines, donc 3 cycles possibles par planche hôte
  const cyclesIntercalairesDisponibles = planchesHotes * 2; // 2 cycles (avant + après)
  
  // Cultures intercalaires
  const radis = resultatsParCulture.radis?.planches || 0;
  const mesclun = resultatsParCulture.mesclun?.planches || 0;
  const verdurette = resultatsParCulture.verdurette?.planches || 0;
  
  // Économie : on peut absorber une partie des cultures rapides dans les fenêtres
  const economieRadis = Math.min(radis, Math.floor(cyclesIntercalairesDisponibles * 0.4));
  const economieMesclun = Math.min(mesclun, Math.floor(cyclesIntercalairesDisponibles * 0.3));
  const economieVerdurette = Math.min(verdurette, Math.floor(cyclesIntercalairesDisponibles * 0.2));
  
  const planchesEconomisees = economieRadis + economieMesclun + economieVerdurette;
  
  return {
    planchesHotes,
    cyclesDisponibles: cyclesIntercalairesDisponibles,
    economieRadis,
    economieMesclun,
    economieVerdurette,
    planchesEconomisees,
    details: [
      economieRadis > 0 ? `Radis: -${economieRadis} pl.` : null,
      economieMesclun > 0 ? `Mesclun: -${economieMesclun} pl.` : null,
      economieVerdurette > 0 ? `Verdurettes: -${economieVerdurette} pl.` : null
    ].filter(Boolean)
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TROUVER LE COEFFICIENT DE RÉDUCTION POUR ÊTRE VIABLE
 * Calcule quel % de la demande on peut satisfaire avec les planches disponibles
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function trouverCoefficientViable(marche, capacitePlanches, options = {}) {
  const { niveauMaturite = 'debutant', marge = 0.95 } = options;
  
  // Calculer les besoins à 100%
  const besoins100 = calculerBesoinsSaison(marche);
  const planches100 = calculerPlanchesParCulture(besoins100, { niveauMaturite });
  
  if (planches100._total <= capacitePlanches) {
    return { coefficient: 1.0, planchesNecessaires: planches100._total, viable: true };
  }
  
  // Chercher le coefficient par dichotomie
  let coeffMin = 0.3;
  let coeffMax = 1.0;
  let coefficient = 0.5;
  
  for (let i = 0; i < 10; i++) {
    coefficient = (coeffMin + coeffMax) / 2;
    
    const marcheReduit = {
      ...marche,
      amap: Math.round(marche.amap * coefficient),
      marche: Math.round(marche.marche * coefficient),
      restaurant: Math.round(marche.restaurant * coefficient)
    };
    
    const besoinsReduits = calculerBesoinsSaison(marcheReduit);
    const planchesReduites = calculerPlanchesParCulture(besoinsReduits, { niveauMaturite });
    
    if (planchesReduites._total <= capacitePlanches * marge) {
      coeffMin = coefficient;
    } else {
      coeffMax = coefficient;
    }
  }
  
  return {
    coefficient: Math.round(coefficient * 100) / 100,
    planchesNecessaires: planches100._total,
    viable: false
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GÉNÉRER DES SCÉNARIOS VIABLES AUTOMATIQUEMENT
 * 🆕 V21 FIX : Part de la CAPACITÉ pour créer de vraies nuances
 * Au lieu de réduire la demande, calcule quelle demande correspond à X% de capacité
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function genererScenariosViables(marche, capacitePlanches, options = {}) {
  const { niveauMaturite = 'debutant' } = options;
  const scenarios = [];
  
  // Calculer d'abord les besoins de la demande actuelle pour avoir un ratio
  const besoinsActuels = calculerBesoinsSaison(marche);
  const planchesActuelles = calculerPlanchesParCulture(besoinsActuels, { niveauMaturite });
  const planchesDemandeActuelle = planchesActuelles._total;
  
  // Ratio : combien de planches par unité de marché
  const totalUnites = (marche.amap || 0) + (marche.marche || 0) + (marche.restaurant || 0);
  const planchesParUnite = totalUnites > 0 ? planchesDemandeActuelle / totalUnites : 1;
  
  // Fonction helper : calculer le marché pour un nombre de planches cible
  const calculerMarchePourCapacite = (planchesCibles) => {
    if (totalUnites === 0 || planchesDemandeActuelle === 0) {
      return { ...marche };
    }
    
    // Ratio de réduction basé sur la capacité cible
    const ratio = planchesCibles / planchesDemandeActuelle;
    
    return {
      amap: Math.round((marche.amap || 0) * ratio),
      marche: Math.round((marche.marche || 0) * ratio),
      restaurant: Math.round((marche.restaurant || 0) * ratio),
      tauxPetit: marche.tauxPetit,
      tauxMoyen: marche.tauxMoyen,
      tauxGrand: marche.tauxGrand
    };
  };
  
  // Scénario 1 : PRUDENT (80% de la capacité)
  const planchesPrudent = Math.floor(capacitePlanches * 0.80);
  const marchePrudent = calculerMarchePourCapacite(planchesPrudent);
  const besoinsPrudentCalc = calculerBesoinsSaison(marchePrudent);
  const planchesPrudentCalc = calculerPlanchesParCulture(besoinsPrudentCalc, { niveauMaturite });
  
  scenarios.push({
    id: 'prudent',
    nom: '🛡️ Prudent',
    description: 'Marge de sécurité de 20% pour les imprévus',
    marche: marchePrudent,
    planches: planchesPrudentCalc._total,
    planchesCibles: planchesPrudent,
    tauxRemplissage: Math.round((planchesPrudentCalc._total / capacitePlanches) * 100),
    caEstime: estimerCA(marchePrudent),
    viable: true,
    recommande: niveauMaturite === 'debutant'
  });
  
  // Scénario 2 : ÉQUILIBRÉ (90% de la capacité)
  const planchesEquilibre = Math.floor(capacitePlanches * 0.90);
  const marcheEquilibre = calculerMarchePourCapacite(planchesEquilibre);
  const besoinsEquilibreCalc = calculerBesoinsSaison(marcheEquilibre);
  const planchesEquilibreCalc = calculerPlanchesParCulture(besoinsEquilibreCalc, { niveauMaturite });
  
  scenarios.push({
    id: 'equilibre',
    nom: '⚖️ Équilibré',
    description: 'Bonne utilisation avec marge de 10%',
    marche: marcheEquilibre,
    planches: planchesEquilibreCalc._total,
    planchesCibles: planchesEquilibre,
    tauxRemplissage: Math.round((planchesEquilibreCalc._total / capacitePlanches) * 100),
    caEstime: estimerCA(marcheEquilibre),
    viable: true,
    recommande: niveauMaturite === 'junior'
  });
  
  // Scénario 3 : AMBITIEUX (100% de la capacité)
  const planchesAmbitieux = capacitePlanches;
  const marcheAmbitieux = calculerMarchePourCapacite(planchesAmbitieux);
  const besoinsAmbitieuxCalc = calculerBesoinsSaison(marcheAmbitieux);
  const planchesAmbitieuxCalc = calculerPlanchesParCulture(besoinsAmbitieuxCalc, { niveauMaturite });
  
  scenarios.push({
    id: 'ambitieux',
    nom: '🚀 Ambitieux',
    description: 'Capacité maximale, aucune marge',
    marche: marcheAmbitieux,
    planches: planchesAmbitieuxCalc._total,
    planchesCibles: planchesAmbitieux,
    tauxRemplissage: Math.round((planchesAmbitieuxCalc._total / capacitePlanches) * 100),
    caEstime: estimerCA(marcheAmbitieux),
    viable: planchesAmbitieuxCalc._total <= capacitePlanches,
    recommande: niveauMaturite === 'expert'
  });
  
  // Scénario 4 : DEMANDE ACTUELLE (pour comparaison)
  scenarios.push({
    id: 'actuel',
    nom: '📊 Demande Actuelle',
    description: 'Votre configuration marché actuelle',
    marche: { ...marche },
    planches: planchesActuelles._total,
    tauxRemplissage: Math.round((planchesActuelles._total / capacitePlanches) * 100),
    caEstime: estimerCA(marche),
    viable: planchesActuelles._total <= capacitePlanches,
    recommande: false,
    estActuel: true
  });
  
  return scenarios;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ESTIMER LE CHIFFRE D'AFFAIRES
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function estimerCA(marche) {
  // Prix moyens des paniers
  const prixPetit = 15;
  const prixMoyen = 25;
  const prixGrand = 35;
  
  // CA hebdomadaire AMAP
  const caHebdoAMAP = 
    Math.round(marche.amap * marche.tauxPetit) * prixPetit +
    Math.round(marche.amap * marche.tauxMoyen) * prixMoyen +
    Math.round(marche.amap * marche.tauxGrand) * prixGrand;
  
  // CA hebdomadaire marché (prix moyen)
  const caHebdoMarche = marche.marche * prixMoyen;
  
  // CA hebdomadaire restaurant (prix grand)
  const caHebdoRestaurant = marche.restaurant * prixGrand;
  
  // Total sur la saison (utiliser SAISON.duree)
  const nbSemaines = SAISON.duree || 20;
  return (caHebdoAMAP + caHebdoMarche + caHebdoRestaurant) * nbSemaines;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CALCULER L'IMPACT D'UNE MODIFICATION DU MARCHÉ
 * Utilisé pour le feedback temps réel des curseurs
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function calculerImpact(marcheModifie, capacitePlanches, options = {}) {
  const { niveauMaturite = 'debutant' } = options;
  
  const besoins = calculerBesoinsSaison(marcheModifie);
  const detailPlanches = calculerPlanchesParCulture(besoins, { niveauMaturite });
  const planchesNecessaires = detailPlanches._total;
  
  const ecart = planchesNecessaires - capacitePlanches;
  const tauxRemplissage = (planchesNecessaires / capacitePlanches) * 100;
  const viable = planchesNecessaires <= capacitePlanches;
  
  // Générer des conseils contextuels
  const conseils = [];
  
  if (!viable) {
    conseils.push({
      type: 'error',
      message: `Il manque ${ecart} planches. Réduisez vos objectifs ou passez au niveau supérieur.`
    });
    
    // Trouver quelle réduction permettrait d'être viable
    const coeff = trouverCoefficientViable(marcheModifie, capacitePlanches, { niveauMaturite });
    conseils.push({
      type: 'suggestion',
      message: `En passant à ${Math.round(coeff.coefficient * 100)}% de cette demande, vous seriez viable.`
    });
  } else if (tauxRemplissage >= 95) {
    conseils.push({
      type: 'warning',
      message: 'Attention, vous êtes à la limite de votre capacité. Peu de marge pour les imprévus.'
    });
  } else if (tauxRemplissage >= 80) {
    conseils.push({
      type: 'success',
      message: 'Bonne utilisation de vos planches avec une marge de sécurité raisonnable.'
    });
  } else {
    conseils.push({
      type: 'info',
      message: `Vous pourriez augmenter votre production de ${Math.round(100 - tauxRemplissage)}%.`
    });
  }
  
  return {
    planchesNecessaires,
    capacitePlanches,
    ecart,
    tauxRemplissage: Math.round(tauxRemplissage),
    viable,
    caEstime: estimerCA(marcheModifie),
    detailPlanches,
    conseils,
    intercalage: detailPlanches._intercalage
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXPORTS - TOUS NOMMÉS POUR COMPATIBILITÉ V21
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default {
  calculerBesoinsSaison,
  calculerPlanchesParCulture,
  calculerEconomieIntercalage,
  trouverCoefficientViable,
  genererScenariosViables,
  estimerCA,
  calculerImpact,
  COEFFICIENTS_MATURITE,
  TYPES_CYCLES
};
