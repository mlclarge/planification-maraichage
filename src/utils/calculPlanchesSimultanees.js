// calculPlanchesSimultanees.js V22 - AVEC DÉLAI INTERCALAIRE
// 🎯 FIX CRITIQUE : Deux formules selon le type de culture
// 🆕 V22 : Le délai intercalaire (vacances entre cultures) impacte le nombre de rotations
// 
// 1. LONGUE DURÉE (tomate, aubergine) : Formule IJM capacité hebdo
//    N = D_hebdo / (R × Coef / T_récolte)
//    → Pas impacté par délai (1 seule rotation)
//
// 2. ROTATION RAPIDE/MOYENNE (mesclun, radis, courgette) : Formule Séries / Rotations
//    Rotations_réelles = floor(Saison / (Durée_cycle + Délai_intercalaire))
//    N = (Besoin_saison / Rendement) / Rotations_réelles
//
// Source: Analyse expert IJM + Documents exercice

import { NIVEAUX_MATURITE, SAISON } from './constantes';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CLASSIFICATION DES TYPES DE CYCLES
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const TYPES_CYCLES = {
  LONGUE_DUREE: { 
    rotations: 1, 
    cultures: ['tomate', 'aubergine', 'concombre', 'poivron'],
    label: 'Long',
    icon: '🏠',
    description: '1 cycle/saison - Formule IJM capacité hebdo'
  },
  ROTATION_MOYENNE: { 
    rotations: 2, 
    cultures: ['courgette', 'haricot', 'carotte', 'betterave', 'basilic', 'chou'],
    label: 'Moyen',
    icon: '🔄',
    description: '2 cycles/saison - Formule Séries/Rotations'
  },
  ROTATION_RAPIDE: { 
    rotations: 4, 
    cultures: ['radis', 'mesclun', 'verdurette', 'epinard', 'navet'],
    label: 'Rapide',
    icon: '⚡',
    description: '4+ cycles/saison - Formule Séries/Rotations'
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DONNÉES AGRONOMIQUES V21
 * ═══════════════════════════════════════════════════════════════════════════
 */
const DONNEES_AGRONOMIQUES = {
  tomate: {
    semisDebut: 10,
    dureePepiniere: 6,
    plantationDebut: 16,
    joursAMaturite: 70,
    dureeRecolteSemaines: 25,  // 180 jours selon doc IJM
    dureeCycleSemaines: 25,    // 🆕 V22 : Durée totale d'occupation planche
    delaiIntercalaireDefaut: 2, // 🆕 V22 : Vacances par défaut (nettoyage résidus)
    rotationsMax: 1
  },
  aubergine: {
    semisDebut: 8,
    dureePepiniere: 8,
    plantationDebut: 18,
    joursAMaturite: 80,
    dureeRecolteSemaines: 20,
    dureeCycleSemaines: 20,
    delaiIntercalaireDefaut: 2,
    rotationsMax: 1
  },
  concombre: {
    semisDebut: 12,
    dureePepiniere: 4,
    plantationDebut: 18,
    joursAMaturite: 50,
    dureeRecolteSemaines: 16,
    dureeCycleSemaines: 16,
    delaiIntercalaireDefaut: 2,
    rotationsMax: 1
  },
  poivron: {
    semisDebut: 8,
    dureePepiniere: 10,
    plantationDebut: 20,
    joursAMaturite: 75,
    dureeRecolteSemaines: 18,
    dureeCycleSemaines: 18,
    delaiIntercalaireDefaut: 2,
    rotationsMax: 1
  },
  courgette: {
    semisDebut: 14,
    dureePepiniere: 3,
    plantationDebut: 18,
    joursAMaturite: 45,
    dureeRecolteSemaines: 10,
    dureeCycleSemaines: 10,
    delaiIntercalaireDefaut: 2,  // 🔧 FIX: Synchronisé avec cultures.js (était 1)
    rotationsMax: 2
  },
  haricot: {
    semisDebut: 16,
    dureePepiniere: 0,
    plantationDebut: 16,
    joursAMaturite: 60,
    dureeRecolteSemaines: 5,
    dureeCycleSemaines: 9,
    delaiIntercalaireDefaut: 2,  // 🔧 FIX: Synchronisé avec cultures.js (était 1)
    rotationsMax: 2
  },
  carotte: {
    semisDebut: 12,
    dureePepiniere: 0,
    plantationDebut: 12,
    joursAMaturite: 70,
    dureeRecolteSemaines: 6,
    dureeCycleSemaines: 10,
    delaiIntercalaireDefaut: 1,
    rotationsMax: 2
  },
  betterave: {
    semisDebut: 14,
    dureePepiniere: 0,
    plantationDebut: 14,
    joursAMaturite: 60,
    dureeRecolteSemaines: 4,
    dureeCycleSemaines: 9,
    delaiIntercalaireDefaut: 2,  // 🔧 FIX: Synchronisé avec cultures.js (était 1)
    rotationsMax: 2
  },
  radis: {
    semisDebut: 10,
    dureePepiniere: 0,
    plantationDebut: 10,
    joursAMaturite: 25,
    dureeRecolteSemaines: 4,
    dureeCycleSemaines: 5,
    delaiIntercalaireDefaut: 1,  // Cycle court = vacances courtes
    rotationsMax: 3
  },
  mesclun: {
    semisDebut: 10,
    dureePepiniere: 0,
    plantationDebut: 10,
    joursAMaturite: 30,
    dureeRecolteSemaines: 8,
    dureeCycleSemaines: 5,
    delaiIntercalaireDefaut: 1,
    rotationsMax: 3.5
  },
  verdurette: {
    semisDebut: 10,
    dureePepiniere: 0,
    plantationDebut: 10,
    joursAMaturite: 35,
    dureeRecolteSemaines: 5,
    dureeCycleSemaines: 5,
    delaiIntercalaireDefaut: 1,
    rotationsMax: 4
  },
  basilic: {
    semisDebut: 12,
    dureePepiniere: 4,
    plantationDebut: 18,
    joursAMaturite: 40,
    dureeRecolteSemaines: 10,
    dureeCycleSemaines: 10,
    delaiIntercalaireDefaut: 2,  // 🔧 FIX: Synchronisé avec cultures.js (était 1)
    rotationsMax: 2
  }
};

/**
 * Récupère les données agronomiques d'une culture
 */
export function getDonneesAgro(culture) {
  const cultureId = culture.id?.toLowerCase() || culture.nom?.toLowerCase() || '';
  return DONNEES_AGRONOMIQUES[cultureId] || null;
}

/**
 * Classifie une culture selon son type de cycle
 */
export function classifierCulture(culture) {
  const cultureId = culture.id?.toLowerCase() || culture.nom?.toLowerCase() || '';
  
  for (const [type, config] of Object.entries(TYPES_CYCLES)) {
    if (config.cultures.some(c => cultureId.includes(c))) {
      return type;
    }
  }
  
  // Fallback basé sur la durée d'occupation
  const dureeOccupation = culture.dureeOccupationPlanche || 60;
  if (dureeOccupation >= 90) return 'LONGUE_DUREE';
  if (dureeOccupation >= 45) return 'ROTATION_MOYENNE';
  return 'ROTATION_RAPIDE';
}

/**
 * Obtient le nombre de rotations pour une culture
 */
export function getRotationsPourCulture(culture) {
  const donneesAgro = getDonneesAgro(culture);
  if (donneesAgro?.rotationsMax) {
    return donneesAgro.rotationsMax;
  }
  
  // Fallback sur rotationsPossibles de la culture
  if (culture.rotationsPossibles) {
    return culture.rotationsPossibles;
  }
  
  const typeCycle = classifierCulture(culture);
  return TYPES_CYCLES[typeCycle]?.rotations || 1;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🆕 V21 : CALCUL DES PLANCHES PHYSIQUES - DOUBLE LOGIQUE
 * 
 * LONGUE DURÉE : N = D_hebdo / (R × Coef / T_récolte)
 * ROTATIONS    : N = (Besoin_saison / Rendement) / Rotations
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function calculerPlanchesPhysiques(culture, besoinSaison, options = {}) {
  const {
    niveauMaturite = 'debutant',
    longueurPlanche = 15,
    saisonDuree = SAISON?.duree || 20,
    delaiIntercalaire = 1  // 🆕 V22 : Délai entre 2 cultures (vacances)
  } = options;
  
  const coefficient = NIVEAUX_MATURITE[niveauMaturite]?.coefficient || 0.70;
  
  const rendementBase = longueurPlanche === 30 
    ? culture.rendement.planche30m 
    : (culture.rendement.planche15m || culture.rendement.planche30m / 2);
  
  const rendementEffectif = rendementBase * coefficient;
  const typeCycle = classifierCulture(culture);
  
  // Données agronomiques
  const donneesAgro = getDonneesAgro(culture);
  const dureeRecolteSemaines = culture.dureeRecolteSemaines 
    || donneesAgro?.dureeRecolteSemaines
    || (culture.dureeRecolte ? Math.ceil(culture.dureeRecolte / 7) : 8);
  
  // 🆕 V22 : Durée d'un cycle complet (occupation planche)
  const dureeCycleSemaines = donneesAgro?.dureeCycleSemaines 
    || culture.dureeCycleSemaines
    || Math.ceil((culture.dureeOccupationPlanche || 60) / 7);
  
  let planchesPhysiques;
  let methodeCalcul;
  let details = {};
  let rotationsEffectives;
  
  if (typeCycle === 'LONGUE_DUREE') {
    // ═══════════════════════════════════════════════════════════════════════
    // FORMULE IJM : Capacité hebdomadaire
    // Pour les cultures qui occupent la planche toute la saison
    // Le délai intercalaire n'a pas d'impact (1 seule rotation)
    // ═══════════════════════════════════════════════════════════════════════
    const besoinHebdo = besoinSaison / saisonDuree;
    const capaciteHebdo = rendementEffectif / dureeRecolteSemaines;
    planchesPhysiques = Math.ceil(besoinHebdo / capaciteHebdo);
    rotationsEffectives = 1;
    
    methodeCalcul = 'IJM_CAPACITE_HEBDO';
    details = {
      besoinHebdo,
      capaciteHebdo,
      dureeRecolteSemaines,
      delaiIntercalaire,
      rotationsEffectives,
      formule: `⌈${besoinHebdo.toFixed(1)} / (${rendementEffectif.toFixed(0)} / ${dureeRecolteSemaines})⌉ = ${planchesPhysiques}`
    };
    
    console.log(`📐 V22 [${typeCycle}] ${culture.nom} - Méthode IJM:`);
    console.log(`   Besoin: ${besoinHebdo.toFixed(1)} kg/sem`);
    console.log(`   Capacité: ${rendementEffectif.toFixed(0)} kg / ${dureeRecolteSemaines} sem = ${capaciteHebdo.toFixed(2)} kg/sem/planche`);
    console.log(`   → ${planchesPhysiques} planches (délai non applicable, 1 rotation)`);
    
  } else {
    // ═══════════════════════════════════════════════════════════════════════
    // FORMULE SÉRIES / ROTATIONS - 🆕 V22 AVEC DÉLAI INTERCALAIRE
    // 
    // Le délai intercalaire RÉDUIT le nombre de rotations possibles :
    // Rotations_réelles = floor(Saison / (Durée_cycle + Délai))
    // 
    // Exemple mesclun avec délai 2 sem :
    //   - Cycle : 5 sem
    //   - Avec délai : 5 + 2 = 7 sem
    //   - Rotations : 20 / 7 = 2.8 → 2 rotations (au lieu de 4)
    // ═══════════════════════════════════════════════════════════════════════
    
    // Durée effective d'un cycle avec le délai de vacances
    const dureeCycleAvecDelai = dureeCycleSemaines + delaiIntercalaire;
    
    // Nombre de rotations RÉELLES possibles sur la saison
    const rotationsMax = getRotationsPourCulture(culture);
    rotationsEffectives = Math.min(
      rotationsMax,
      Math.floor(saisonDuree / dureeCycleAvecDelai)
    );
    
    // Sécurité : au moins 1 rotation
    rotationsEffectives = Math.max(1, rotationsEffectives);
    
    // Nombre de séries nécessaires
    const nombreSeries = Math.ceil(besoinSaison / rendementBase);
    
    // Planches nécessaires = séries / rotations effectives
    planchesPhysiques = Math.ceil(nombreSeries / rotationsEffectives);
    
    methodeCalcul = 'SERIES_ROTATIONS';
    details = {
      nombreSeries,
      rotationsMax,
      rotationsEffectives,
      dureeCycleSemaines,
      delaiIntercalaire,
      dureeCycleAvecDelai,
      rendementParSerie: rendementBase,
      formule: `⌈${nombreSeries} séries / ${rotationsEffectives} rot⌉ = ${planchesPhysiques} (délai ${delaiIntercalaire}sem)`
    };
    
    console.log(`📐 V22 [${typeCycle}] ${culture.nom} - Méthode Séries/Rotations:`);
    console.log(`   Besoin saison: ${besoinSaison.toFixed(0)} kg`);
    console.log(`   Rendement/série: ${rendementBase.toFixed(0)} kg (BRUT) → ${nombreSeries} séries`);
    console.log(`   Cycle: ${dureeCycleSemaines}sem + délai ${delaiIntercalaire}sem = ${dureeCycleAvecDelai}sem`);
    console.log(`   Rotations: ${rotationsMax} max → ${rotationsEffectives} effectives (saison ${saisonDuree}sem)`);
    console.log(`   → ${planchesPhysiques} planches (${nombreSeries} séries ÷ ${rotationsEffectives} rot)`);
  }
  
  // Production totale estimée (avec rotations effectives)
  const productionParPlancheSaison = rendementEffectif * rotationsEffectives;
  const productionTotaleEstimee = planchesPhysiques * productionParPlancheSaison;
  
  return {
    planchesPhysiques,
    methodeCalcul,
    rendementEffectif,
    rendementBase,
    coefficient,
    rotations: rotationsEffectives,  // 🆕 V22 : Retourner rotations effectives
    rotationsMax: getRotationsPourCulture(culture),
    typeCycle,
    productionParPlancheSaison,
    productionTotaleEstimee,
    besoinSaison,
    delaiIntercalaire,
    dureeCycleSemaines,
    details
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CALCUL POUR L'ÉCHELONNEMENT DES SÉRIES
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function calculerPlanchesSimultanees(culture, besoinHebdo, facteurSecurite = 0.7, delaiIntercalaire = 1) {
  const rendementBase = culture.rendement?.planche15m || culture.rendement?.planche30m / 2 || 100;
  const rendementNet = rendementBase * facteurSecurite;
  
  const donneesAgro = getDonneesAgro(culture);
  const fenetreRecolteSemaines = culture.dureeRecolteSemaines 
    || donneesAgro?.dureeRecolteSemaines
    || (culture.dureeRecolte ? culture.dureeRecolte / 7 : 6);
  
  const fenetreRecolteJours = fenetreRecolteSemaines * 7;
  const dureeOccupationPlanche = culture.dureeOccupationPlanche || 60;
  const dureeOccupationReelleSemaines = Math.ceil(dureeOccupationPlanche / 7) + delaiIntercalaire;
  
  // Capacité hebdomadaire d'une planche
  const capaciteHebdo = rendementNet / fenetreRecolteSemaines;
  
  // Planches simultanées pour couvrir le besoin hebdo
  const planchesSimultanees = Math.ceil(besoinHebdo / capaciteHebdo);
  
  const decalageOptimal = fenetreRecolteSemaines > 0 
    ? Math.max(1, fenetreRecolteSemaines / planchesSimultanees)
    : 2;
  
  const rotations = getRotationsPourCulture(culture);
  const nombreSeriesRecommandees = planchesSimultanees * rotations;
  
  return {
    planchesSimultanees,
    rendementNet,
    rendementBrut: rendementBase,
    capaciteHebdo,
    fenetreRecolteSemaines,
    fenetreRecolteJours,
    dureeOccupationReelleSemaines,
    decalageOptimal,
    nombreSeriesRecommandees,
    planchesParSerie: 1,
    rotations,
    totalPlanchesSaison: planchesSimultanees,
    delaiIntercalaire
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GÉNÉRATION DE SÉRIES AVEC DATES CORRECTES
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function genererSeriesEchelonnees(culture, calcul, planchesPhysiques, delaiIntercalaire = 1, saisonDebut = 18, saisonFin = 37) {
  const series = [];
  const rotations = calcul.rotations || getRotationsPourCulture(culture);
  
  const cultureId = culture.id?.toLowerCase() || '';
  const donneesAgro = DONNEES_AGRONOMIQUES[cultureId] || {};
  
  // Durées en semaines
  const dureePepiniere = donneesAgro.dureePepiniere ?? Math.ceil((culture.dureeEnPepiniere || 0) / 7);
  const joursAMaturite = donneesAgro.joursAMaturite || culture.joursAMaturite || 60;
  const semainesCroissance = Math.ceil(joursAMaturite / 7);
  const dureeRecolte = donneesAgro.dureeRecolteSemaines || Math.ceil((culture.dureeRecolte || 42) / 7);
  
  // Date de début réaliste
  const semisDebutSaison = donneesAgro.semisDebut || Math.max(8, saisonDebut - semainesCroissance - dureePepiniere);
  
  // Durée totale d'occupation d'une planche
  const dureeOccupationTotale = semainesCroissance + dureeRecolte + delaiIntercalaire;
  
  // Décalage entre les planches pour étaler la récolte
  const decalageEntrePlanches = planchesPhysiques > 1 
    ? Math.min(3, Math.max(1, Math.floor(dureeRecolte / planchesPhysiques)))
    : 0;
  
  // Générer les séries
  for (let rotationIdx = 0; rotationIdx < Math.ceil(rotations); rotationIdx++) {
    for (let plancheIdx = 0; plancheIdx < planchesPhysiques; plancheIdx++) {
      
      const decalageRotation = rotationIdx * dureeOccupationTotale;
      const decalagePlanche = plancheIdx * decalageEntrePlanches;
      
      const semaineSemis = semisDebutSaison + decalageRotation + decalagePlanche;
      const semainePlantation = dureePepiniere > 0 
        ? semaineSemis + dureePepiniere 
        : semaineSemis;
      const semaineRecolteDebut = semainePlantation + semainesCroissance;
      const semaineRecolteFin = semaineRecolteDebut + dureeRecolte;
      
      // Vérifier que la série est pertinente
      if (semaineRecolteDebut > saisonFin + 6) {
        continue;
      }
      
      const occupationDebut = Math.max(1, Math.round(semainePlantation));
      const occupationFin = Math.round(semaineRecolteFin) + delaiIntercalaire;
      
      series.push({
        id: series.length + 1,
        plancheId: plancheIdx + 1,
        planchesUtilisees: 1,
        semaineSemis: Math.max(1, Math.round(semaineSemis)),
        semainePlantation: Math.max(1, Math.round(semainePlantation)),
        semaineRecolteDebut: Math.round(semaineRecolteDebut),
        semaineRecolteFin: Math.round(semaineRecolteFin),
        semaineDebut: Math.round(semaineRecolteDebut),
        semaineFin: Math.round(semaineRecolteFin),
        occupationDebut,
        occupationFin,
        dureeOccupation: occupationFin - occupationDebut,
        delaiIntercalaire,
        horsVente: semaineRecolteDebut > saisonFin,
        rotation: rotationIdx + 1,
        dates: {
          semis: Math.round(semaineSemis),
          plantation: Math.round(semainePlantation),
          recolteDebut: Math.round(semaineRecolteDebut),
          recolteFin: Math.round(semaineRecolteFin)
        }
      });
    }
  }
  
  // Créer les planches
  const planches = [];
  for (let i = 0; i < planchesPhysiques; i++) {
    const plancheSeries = series.filter(s => s.plancheId === i + 1);
    const finOccupation = plancheSeries.length > 0 
      ? Math.max(...plancheSeries.map(s => s.occupationFin))
      : saisonFin;
    
    planches.push({
      id: i + 1,
      finOccupation,
      series: plancheSeries.map(s => s.id)
    });
  }
  
  // Détection des gaps pour l'intercalage
  const gaps = detecterGaps(planches, series, saisonDebut, saisonFin);
  
  return { 
    series, 
    planchesReelles: planches.length,
    planchesDetail: planches, 
    gaps 
  };
}

/**
 * Détecte les fenêtres d'opportunité pour cultures intercalaires
 */
function detecterGaps(planches, series, saisonDebut = 18, saisonFin = 37) {
  const FENETRE_AVANT = 10;
  const FENETRE_APRES = 44;
  
  return planches.map(p => {
    const plancheSeries = series.filter(s => s.plancheId === p.id);
    
    if (plancheSeries.length === 0) {
      return {
        plancheId: p.id,
        gapAvant: { debut: FENETRE_AVANT, fin: saisonFin, duree: saisonFin - FENETRE_AVANT },
        gapApres: null
      };
    }
    
    const premiereOccupation = Math.min(...plancheSeries.map(s => s.occupationDebut));
    const derniereOccupation = Math.max(...plancheSeries.map(s => s.occupationFin));
    
    const gapAvant = premiereOccupation > FENETRE_AVANT + 4
      ? { debut: FENETRE_AVANT, fin: premiereOccupation, duree: premiereOccupation - FENETRE_AVANT }
      : null;
    
    const gapApres = derniereOccupation < FENETRE_APRES - 4
      ? { debut: derniereOccupation, fin: FENETRE_APRES, duree: FENETRE_APRES - derniereOccupation }
      : null;
    
    return { plancheId: p.id, gapAvant, gapApres };
  });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CALCUL DES BESOINS EN INTRANTS
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function calculerBesoinsIntrants(culture, series) {
  const nombreSeries = series.length;
  
  const grainesParPlanche = culture.semis?.grainesParPlanche || 100;
  const grainesASemer = grainesParPlanche * nombreSeries;
  const poidsGraines = grainesASemer * (culture.semis?.poidsGraine || 0.01);
  
  const litresParPlanche = culture.dureeEnPepiniere > 0 ? 5 : 0;
  const substratLitres = litresParPlanche * nombreSeries;
  const nombreBacs = Math.ceil(substratLitres / 20);
  
  const coutGraines = grainesASemer * 0.01;
  const coutSubstrat = substratLitres * 0.5;
  const coutTotal = coutGraines + coutSubstrat;
  
  return {
    grainesASemer,
    poidsGraines: poidsGraines.toFixed(1),
    substratLitres,
    nombreBacs,
    couts: {
      graines: coutGraines,
      substrat: Math.ceil(coutSubstrat),
      total: Math.ceil(coutTotal)
    }
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FONCTION PRINCIPALE - GÉNÉRATION DU PLAN COMPLET
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function genererPlanComplet(culture, marche, calculerBesoinHebdo, delaiIntercalaire = 1, options = {}) {
  const {
    niveauMaturite = 'debutant',
    longueurPlanche = 15,
    planchesDisponibles = null
  } = options;
  
  const saisonDebut = SAISON?.debut || 18;
  const saisonFin = SAISON?.fin || 37;
  const saisonDuree = SAISON?.duree || 20;
  
  console.log(`🚀 V22 Génération plan ${culture.nom} | Maturité: ${niveauMaturite} | Planches: ${longueurPlanche}m | Délai: ${delaiIntercalaire}sem`);
  
  // 1. Calculer le besoin TOTAL sur la saison
  let besoinTotal = 0;
  
  for (let semaine = saisonDebut; semaine <= saisonFin; semaine++) {
    const besoins = calculerBesoinHebdo(marche, semaine);
    if (besoins[culture.id] && besoins[culture.id].total > 0) {
      besoinTotal += besoins[culture.id].total;
    }
  }
  
  const besoinHebdo = besoinTotal / saisonDuree;
  console.log(`📊 Besoins ${culture.nom}: total=${besoinTotal.toFixed(1)}kg, hebdo=${besoinHebdo.toFixed(1)}kg/sem`);
  
  // 2. 🆕 V22 : Calcul avec délai intercalaire
  const calculPhysique = calculerPlanchesPhysiques(culture, besoinTotal, {
    niveauMaturite,
    longueurPlanche,
    saisonDuree,
    delaiIntercalaire  // 🆕 V22 : Passer le délai pour ajuster les rotations
  });
  
  const planchesPhysiques = calculPhysique.planchesPhysiques;
  
  console.log(`✅ ${culture.nom}: ${planchesPhysiques} planches (méthode: ${calculPhysique.methodeCalcul})`);
  
  // 3. Calculer pour l'échelonnement
  const coefficient = NIVEAUX_MATURITE[niveauMaturite]?.coefficient || 0.70;
  const calcul = calculerPlanchesSimultanees(culture, besoinHebdo, coefficient, delaiIntercalaire);
  
  // 4. Générer séries avec dates réalistes
  const { series, planchesReelles, planchesDetail, gaps } = genererSeriesEchelonnees(
    culture, 
    { ...calcul, rotations: calculPhysique.rotations },
    planchesPhysiques,
    delaiIntercalaire,
    saisonDebut,
    saisonFin
  );
  
  // 5. Calculer les besoins en intrants
  const intrants = calculerBesoinsIntrants(culture, series);
  
  // 6. Assembler le résultat
  const calculCorrige = {
    ...calcul,
    planchesSimultanees: planchesPhysiques,
    planchesPhysiques: planchesPhysiques,
    totalPlanchesSaison: planchesPhysiques,
    rotations: calculPhysique.rotations,
    typeCycle: calculPhysique.typeCycle,
    methodeCalcul: calculPhysique.methodeCalcul,
    coefficient,
    niveauMaturite,
    longueurPlanche,
    delaiIntercalaire,
    planchesDetail,
    details: calculPhysique.details
  };
  
  // 7. Calculer production et couverture
  const tauxCouverture = besoinTotal > 0 
    ? Math.round((calculPhysique.productionTotaleEstimee / besoinTotal) * 100) 
    : 100;
  
  return {
    culture,
    besoinHebdo,
    besoinTotal,
    calcul: calculCorrige,
    series,
    gaps,
    intrants,
    
    resume: {
      planchesSimultanees: planchesPhysiques,
      planchesPhysiques: planchesPhysiques,
      planchesParSerie: 1,
      nombreSeries: series.length,
      totalPlanches: planchesPhysiques,
      frequence: Math.round(calcul.decalageOptimal * 10) / 10,
      fenetreRecolte: calcul.fenetreRecolteJours,
      delaiIntercalaire,
      rotations: calculPhysique.rotations,
      typeCycle: calculPhysique.typeCycle,
      methodeCalcul: calculPhysique.methodeCalcul,
      productionEstimee: Math.round(calculPhysique.productionTotaleEstimee),
      tauxCouverture
    }
  };
}

/**
 * Valide qu'un plan est réalisable avec les jardins disponibles
 */
export function validerPlan(plan, jardins) {
  const planchesNecessaires = plan.calcul.planchesPhysiques || plan.calcul.totalPlanchesSaison;
  const planchesDisponibles = jardins.reduce((sum, j) => sum + j.nombrePlanches, 0);
  
  const alertes = [];
  
  if (planchesNecessaires > planchesDisponibles) {
    alertes.push({
      type: 'erreur',
      message: `Pas assez de planches ! Besoin : ${planchesNecessaires}, Disponible : ${planchesDisponibles}`
    });
  }
  
  return {
    valide: alertes.filter(a => a.type === 'erreur').length === 0,
    alertes,
    planchesNecessaires,
    planchesDisponibles,
    tauxUtilisation: (planchesNecessaires / planchesDisponibles) * 100
  };
}

/**
 * Calcule le nombre RÉEL de planches simultanées
 */
export function calculerPlanchesSimultaneesReelles(series) {
  if (!series || series.length === 0) return 0;
  
  let planchesMax = 0;
  
  const semaineMin = Math.min(...series.map(s => s.occupationDebut));
  const semaineMax = Math.max(...series.map(s => s.occupationFin));
  
  for (let semaine = semaineMin; semaine <= semaineMax; semaine++) {
    let planchesOccupees = 0;
    
    series.forEach(serie => {
      if (semaine >= serie.occupationDebut && semaine <= serie.occupationFin) {
        planchesOccupees += serie.planchesUtilisees;
      }
    });
    
    if (planchesOccupees > planchesMax) {
      planchesMax = planchesOccupees;
    }
  }
  
  return planchesMax;
}

/**
 * Calcule les économies potentielles par intercalage
 */
export function calculerEconomieIntercalage(culturesSelectionnees) {
  // Cultures hôtes (longue durée) - offrent des fenêtres
  const culturesHotes = culturesSelectionnees.filter(c => {
    const type = classifierCulture(c);
    return type === 'LONGUE_DUREE';
  });
  
  // Cultures intercalaires (rapide) - peuvent profiter des fenêtres
  const culturesIntercalaires = culturesSelectionnees.filter(c => {
    const type = classifierCulture(c);
    return type === 'ROTATION_RAPIDE';
  });
  
  // Calculer fenêtres disponibles
  let fenetresAvant = 0;
  let fenetresApres = 0;
  
  culturesHotes.forEach(c => {
    const planches = c.totalPlanches || c.planComplet?.calcul?.planchesPhysiques || 0;
    fenetresAvant += planches;
    fenetresApres += planches;
  });
  
  const cyclesIntercalairesDisponibles = fenetresAvant + fenetresApres;
  
  // Calculer économie potentielle
  let economieRadis = 0;
  let economieMesclun = 0;
  let economieVerdurette = 0;
  
  culturesIntercalaires.forEach(c => {
    const planches = c.totalPlanches || c.planComplet?.calcul?.planchesPhysiques || 0;
    const cultureId = c.id?.toLowerCase() || '';
    
    if (cultureId.includes('radis')) {
      economieRadis = Math.min(planches, Math.floor(cyclesIntercalairesDisponibles * 0.4));
    } else if (cultureId.includes('mesclun')) {
      economieMesclun = Math.min(planches, Math.floor(cyclesIntercalairesDisponibles * 0.3));
    } else if (cultureId.includes('verdurette')) {
      economieVerdurette = Math.min(planches, Math.floor(cyclesIntercalairesDisponibles * 0.2));
    }
  });
  
  const planchesEconomisees = economieRadis + economieMesclun + economieVerdurette;
  
  return {
    culturesHotes: culturesHotes.length,
    culturesIntercalaires: culturesIntercalaires.length,
    fenetresAvant,
    fenetresApres,
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
 * Calcule la répartition optimale avec intercalage
 */
export function calculerRepartitionOptimale(culturesSelectionnees, jardins) {
  const intercalage = calculerEconomieIntercalage(culturesSelectionnees);
  
  const planchesTotales = culturesSelectionnees.reduce((sum, c) => 
    sum + (c.totalPlanches || c.planComplet?.calcul?.planchesPhysiques || 0), 0);
  
  const planchesOptimisees = planchesTotales - intercalage.planchesEconomisees;
  const capaciteTotale = jardins.reduce((sum, j) => sum + j.nombrePlanches, 0);
  
  return {
    planchesAvantOptimisation: planchesTotales,
    planchesApresOptimisation: planchesOptimisees,
    economie: intercalage.planchesEconomisees,
    capaciteTotale,
    viableAvant: planchesTotales <= capaciteTotale,
    viableApres: planchesOptimisees <= capaciteTotale,
    intercalage
  };
}

// Exports par défaut
export default {
  calculerPlanchesPhysiques,
  calculerPlanchesSimultanees,
  calculerPlanchesSimultaneesReelles,
  genererSeriesEchelonnees,
  calculerBesoinsIntrants,
  genererPlanComplet,
  validerPlan,
  classifierCulture,
  getRotationsPourCulture,
  getDonneesAgro,
  calculerEconomieIntercalage,
  calculerRepartitionOptimale,
  TYPES_CYCLES,
  DONNEES_AGRONOMIQUES
};
