// calculPlanchesSimultanees.js V20 - DATES DE RÉCOLTE CORRIGÉES
// 🎯 FIX CRITIQUE : Les tomates ne récoltent plus dès S18 !
// 🆕 V20 : Calcul DANS LE BON SENS (Semis → Plantation → Récolte)

import { NIVEAUX_MATURITE } from './constantes';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CLASSIFICATION UNIFIÉE DES TYPES DE CYCLES
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const TYPES_CYCLES = {
  LONGUE_DUREE: { 
    rotations: 1, 
    cultures: ['tomate', 'aubergine', 'concombre', 'poivron'],
    label: 'Long',
    icon: '🏠',
    description: '1 cycle/saison - Cultures permanentes'
  },
  ROTATION_MOYENNE: { 
    rotations: 2, 
    cultures: ['courgette', 'haricot', 'carotte', 'betterave', 'basilic', 'chou'],
    label: 'Moyen',
    icon: '🔄',
    description: '2 cycles/saison - Succession possible'
  },
  ROTATION_RAPIDE: { 
    rotations: 4, 
    cultures: ['radis', 'mesclun', 'verdurette', 'epinard', 'navet'],
    label: 'Rapide',
    icon: '⚡',
    description: '4 cycles/saison - Rotations multiples'
  }
};

/**
 * 🆕 V20 : DONNÉES AGRONOMIQUES RÉALISTES
 * Dates de semis, durées de pépinière, jours à maturité, durée récolte
 */
const DONNEES_AGRONOMIQUES = {
  tomate: {
    semisDebut: 10,           // S10 = début mars (pépinière chauffée)
    dureePepiniere: 6,        // 6 semaines en pépinière
    plantationDebut: 16,      // S16 = mi-avril (après gelées)
    joursAMaturite: 70,       // 70 jours plant → première récolte
    dureeRecolte: 12          // 12 semaines de récolte
    // → Première récolte = S16 + 10 = S26 (fin juin) ✅
  },
  aubergine: {
    semisDebut: 8,
    dureePepiniere: 8,
    plantationDebut: 18,
    joursAMaturite: 80,
    dureeRecolte: 10
  },
  concombre: {
    semisDebut: 12,
    dureePepiniere: 4,
    plantationDebut: 18,
    joursAMaturite: 50,
    dureeRecolte: 10
  },
  poivron: {
    semisDebut: 8,
    dureePepiniere: 10,
    plantationDebut: 20,
    joursAMaturite: 75,
    dureeRecolte: 10
  },
  courgette: {
    semisDebut: 14,
    dureePepiniere: 3,
    plantationDebut: 18,
    joursAMaturite: 45,
    dureeRecolte: 14
  },
  haricot: {
    semisDebut: 16,
    dureePepiniere: 0,        // Semis direct
    plantationDebut: 16,
    joursAMaturite: 60,
    dureeRecolte: 4
  },
  carotte: {
    semisDebut: 12,
    dureePepiniere: 0,
    plantationDebut: 12,
    joursAMaturite: 70,
    dureeRecolte: 8
  },
  betterave: {
    semisDebut: 14,
    dureePepiniere: 0,
    plantationDebut: 14,
    joursAMaturite: 60,
    dureeRecolte: 6
  },
  radis: {
    semisDebut: 10,
    dureePepiniere: 0,
    plantationDebut: 10,
    joursAMaturite: 25,
    dureeRecolte: 2
  },
  mesclun: {
    semisDebut: 10,
    dureePepiniere: 0,
    plantationDebut: 10,
    joursAMaturite: 30,
    dureeRecolte: 3
  },
  verdurette: {
    semisDebut: 10,
    dureePepiniere: 0,
    plantationDebut: 10,
    joursAMaturite: 35,
    dureeRecolte: 3
  },
  basilic: {
    semisDebut: 12,
    dureePepiniere: 4,
    plantationDebut: 18,
    joursAMaturite: 40,
    dureeRecolte: 12
  }
};

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
  
  const dureeOccupation = culture.dureeOccupationPlanche || 60;
  if (dureeOccupation >= 90) return 'LONGUE_DUREE';
  if (dureeOccupation >= 45) return 'ROTATION_MOYENNE';
  return 'ROTATION_RAPIDE';
}

/**
 * Obtient le nombre de rotations pour une culture
 */
export function getRotationsPourCulture(culture) {
  const typeCycle = classifierCulture(culture);
  return TYPES_CYCLES[typeCycle]?.rotations || 1;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CALCUL DES PLANCHES PHYSIQUES
 * Formule : Planches = BesoinSaison / (Rendement × Coefficient × Rotations)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function calculerPlanchesPhysiques(culture, besoinSaison, options = {}) {
  const {
    niveauMaturite = 'debutant',
    longueurPlanche = 15
  } = options;
  
  const coefficient = NIVEAUX_MATURITE[niveauMaturite]?.coefficient || 0.70;
  
  const rendementBase = longueurPlanche === 30 
    ? culture.rendement.planche30m 
    : (culture.rendement.planche15m || culture.rendement.planche30m / 2);
  
  const rendementEffectif = rendementBase * coefficient;
  const rotations = getRotationsPourCulture(culture);
  const typeCycle = classifierCulture(culture);
  
  // Production par planche sur la SAISON (avec rotations)
  const productionParPlancheSaison = rendementEffectif * rotations;
  
  // Planches PHYSIQUES nécessaires
  const planchesPhysiques = Math.ceil(besoinSaison / productionParPlancheSaison);
  
  console.log(`📐 [${typeCycle}] ${culture.nom}:`, {
    besoinSaison: besoinSaison.toFixed(1),
    rendementEffectif: rendementEffectif.toFixed(1),
    rotations,
    productionParPlanche: productionParPlancheSaison.toFixed(1),
    planchesPhysiques
  });
  
  return {
    planchesPhysiques,
    rendementEffectif,
    rendementBase,
    coefficient,
    rotations,
    typeCycle,
    productionParPlancheSaison,
    besoinSaison
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Calcul pour l'étalement des séries (flux continu de récolte)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function calculerPlanchesSimultanees(culture, besoinHebdo, facteurSecurite = 0.7, delaiIntercalaire = 1) {
  const rendementBrut = culture.rendement.planche30m;
  const rendementNet = rendementBrut * facteurSecurite;
  
  const fenetreRecolteJours = culture.dureeOccupationPlanche;
  const fenetreRecolteSemaines = fenetreRecolteJours / 7;
  
  const capaciteHebdo = rendementNet / fenetreRecolteSemaines;
  const planchesSimultanees = Math.ceil(besoinHebdo / capaciteHebdo);
  
  const dureeOccupationReelleSemaines = fenetreRecolteSemaines + delaiIntercalaire;
  const decalageOptimal = Math.max(1, dureeOccupationReelleSemaines / planchesSimultanees);
  
  const rotations = getRotationsPourCulture(culture);
  const nombreSeriesRecommandees = planchesSimultanees * rotations;
  
  return {
    planchesSimultanees,
    rendementNet,
    rendementBrut,
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
 * 🆕 V20 : GÉNÉRATION DE SÉRIES AVEC DATES CORRECTES
 * Les dates sont calculées DANS LE BON SENS : Semis → Plantation → Récolte
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function genererSeriesEchelonnees(culture, calcul, planchesPhysiques, delaiIntercalaire = 1, saisonDebut = 18, saisonFin = 38) {
  const series = [];
  const { rotations } = calcul;
  
  // 🆕 V20 : Utiliser les données agronomiques RÉALISTES si disponibles
  const cultureId = culture.id?.toLowerCase() || '';
  const donneesAgro = DONNEES_AGRONOMIQUES[cultureId] || {};
  
  // Durées en semaines (avec fallback sur les données de la culture)
  const dureePepiniere = donneesAgro.dureePepiniere ?? Math.ceil((culture.dureeEnPepiniere || 0) / 7);
  const joursAMaturite = donneesAgro.joursAMaturite || culture.joursAMaturite || culture.dtm || 60;
  const semainesCroissance = Math.ceil(joursAMaturite / 7);
  const dureeRecolte = donneesAgro.dureeRecolte || Math.ceil((culture.dureeOccupationPlanche || 42) / 7 / 2);
  
  // 🆕 V20 : Date de DÉBUT réaliste (semis ou plantation selon la culture)
  const semisDebutSaison = donneesAgro.semisDebut || Math.max(8, saisonDebut - semainesCroissance - dureePepiniere);
  const plantationDebutSaison = donneesAgro.plantationDebut || (semisDebutSaison + dureePepiniere);
  
  // Durée totale d'occupation d'une planche
  const dureeOccupationTotale = semainesCroissance + dureeRecolte + delaiIntercalaire;
  
  // Décalage entre les planches pour étaler la récolte
  const decalageEntrePlanches = planchesPhysiques > 1 
    ? Math.min(3, Math.max(1, Math.floor(dureeRecolte / planchesPhysiques)))
    : 0;
  
  console.log(`📅 V20 Génération ${culture.nom}:`);
  console.log(`   Pépinière: ${dureePepiniere} sem | Croissance: ${semainesCroissance} sem | Récolte: ${dureeRecolte} sem`);
  console.log(`   Semis débute: S${semisDebutSaison} | Plantation: S${plantationDebutSaison} | Première récolte: S${plantationDebutSaison + semainesCroissance}`);
  
  // 🆕 V20 : Générer les séries DANS LE BON SENS
  for (let rotationIdx = 0; rotationIdx < rotations; rotationIdx++) {
    for (let plancheIdx = 0; plancheIdx < planchesPhysiques; plancheIdx++) {
      
      // Décalage pour cette rotation
      const decalageRotation = rotationIdx * dureeOccupationTotale;
      
      // Décalage entre planches pour étaler la récolte
      const decalagePlanche = plancheIdx * decalageEntrePlanches;
      
      // 🆕 V20 : CALCUL CORRECT - partir du SEMIS et avancer dans le temps
      
      // 1. Date de SEMIS (début du processus)
      const semaineSemis = semisDebutSaison + decalageRotation + decalagePlanche;
      
      // 2. Date de PLANTATION = semis + durée pépinière
      const semainePlantation = dureePepiniere > 0 
        ? semaineSemis + dureePepiniere 
        : semaineSemis; // Semis direct
      
      // 3. Date de début de RÉCOLTE = plantation + croissance
      // 🎯 C'est ICI que le bug était ! Avant, semaineRecolteDebut = S18 directement
      const semaineRecolteDebut = semainePlantation + semainesCroissance;
      
      // 4. Date de fin de récolte
      const semaineRecolteFin = semaineRecolteDebut + dureeRecolte;
      
      // Vérifier que la série est pertinente (récolte au moins partiellement en saison)
      if (semaineRecolteDebut > saisonFin + 6) {
        console.log(`   ⏭️ Série Pl.${plancheIdx + 1} rot.${rotationIdx + 1} ignorée (récolte trop tardive: S${Math.round(semaineRecolteDebut)})`);
        continue;
      }
      
      // Occupation de la planche (de la plantation à la fin de récolte + délai)
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
        semaineDebut: Math.round(semaineRecolteDebut), // Alias pour compatibilité
        semaineFin: Math.round(semaineRecolteFin),     // Alias pour compatibilité
        occupationDebut,
        occupationFin,
        dureeOccupation: occupationFin - occupationDebut,
        delaiIntercalaire,
        horsVente: semaineRecolteDebut > saisonFin,
        rotation: rotationIdx + 1,
        // 🆕 V20 : Objet dates pour le Gantt
        dates: {
          semis: Math.round(semaineSemis),
          plantation: Math.round(semainePlantation),
          recolteDebut: Math.round(semaineRecolteDebut),
          recolteFin: Math.round(semaineRecolteFin)
        }
      });
      
      console.log(`   ✅ Pl.${plancheIdx + 1}: Semis S${Math.round(semaineSemis)} → Plant. S${Math.round(semainePlantation)} → Récolte S${Math.round(semaineRecolteDebut)}-S${Math.round(semaineRecolteFin)}`);
    }
  }
  
  console.log(`✅ ${series.length} séries générées pour ${culture.nom}`);
  if (series.length > 0) {
    console.log(`   Première récolte: S${Math.min(...series.map(s => s.semaineRecolteDebut))}`);
    console.log(`   Dernière récolte: S${Math.max(...series.map(s => s.semaineRecolteFin))}`);
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
function detecterGaps(planches, series, saisonDebut = 18, saisonFin = 38) {
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
  
  // Graines
  const grainesParPlanche = culture.semis?.grainesParPlanche || 100;
  const grainesASemer = grainesParPlanche * nombreSeries;
  const poidsGraines = grainesASemer * (culture.semis?.poidsGraine || 0.01);
  
  // Substrat (si pépinière)
  const litresParPlanche = culture.dureeEnPepiniere > 0 ? 5 : 0;
  const substratLitres = litresParPlanche * nombreSeries;
  const nombreBacs = Math.ceil(substratLitres / 20);
  
  // Coûts estimés
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
 * FONCTION PRINCIPALE : Génère un plan complet pour une culture
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function genererPlanComplet(culture, marche, calculerBesoinHebdo, delaiIntercalaire = 1, options = {}) {
  const {
    niveauMaturite = 'debutant',
    longueurPlanche = 15,
    planchesDisponibles = null
  } = options;
  
  console.log(`🚀 V20 Génération plan ${culture.nom} | Maturité: ${niveauMaturite} | Délai: ${delaiIntercalaire}s | Planches: ${longueurPlanche}m`);
  
  // 1. Calculer le besoin TOTAL sur la saison
  let besoinTotal = 0;
  let semaines = 0;
  
  for (let semaine = 18; semaine <= 38; semaine++) {
    const besoins = calculerBesoinHebdo(marche, semaine);
    if (besoins[culture.id] && besoins[culture.id].total > 0) {
      besoinTotal += besoins[culture.id].total;
      semaines++;
    }
  }
  
  const besoinHebdo = semaines > 0 ? besoinTotal / semaines : 0;
  console.log(`📊 Besoins ${culture.nom}: total=${besoinTotal.toFixed(1)}, hebdo moyen=${besoinHebdo.toFixed(1)}`);
  
  // 2. Calculer planches PHYSIQUES avec classification UNIFIÉE
  const calculPhysique = calculerPlanchesPhysiques(culture, besoinTotal, {
    niveauMaturite,
    longueurPlanche
  });
  
  console.log(`✅ ${culture.nom}: ${calculPhysique.planchesPhysiques * calculPhysique.rotations} séries sur ${calculPhysique.planchesPhysiques} planches physiques (${calculPhysique.typeCycle})`);
  
  // 3. Calculer planches simultanées (pour échelonnement)
  const coefficient = NIVEAUX_MATURITE[niveauMaturite]?.coefficient || 0.70;
  const calcul = calculerPlanchesSimultanees(culture, besoinHebdo, coefficient, delaiIntercalaire);
  
  // 4. 🆕 V20 : Générer séries avec algorithme CORRIGÉ (dates réalistes)
  const { series, planchesReelles, planchesDetail, gaps } = genererSeriesEchelonnees(
    culture, 
    { ...calcul, rotations: calculPhysique.rotations },
    calculPhysique.planchesPhysiques,
    delaiIntercalaire
  );
  
  // 5. Calculer les besoins en intrants
  const intrants = calculerBesoinsIntrants(culture, series);
  
  // 6. Utiliser planchesPhysiques comme valeur finale
  const planchesFinales = calculPhysique.planchesPhysiques;
  
  // 7. Assembler le calcul corrigé
  const calculCorrige = {
    ...calcul,
    planchesSimultanees: planchesFinales,
    planchesPhysiques: planchesFinales,
    totalPlanchesSaison: planchesFinales,
    rotations: calculPhysique.rotations,
    typeCycle: calculPhysique.typeCycle,
    coefficient,
    niveauMaturite,
    longueurPlanche,
    delaiIntercalaire,
    planchesDetail
  };
  
  // 8. Calculer production et couverture estimées
  const productionEstimee = planchesFinales * calculPhysique.productionParPlancheSaison;
  const tauxCouverture = besoinTotal > 0 ? Math.round((productionEstimee / besoinTotal) * 100) : 100;
  
  return {
    culture,
    besoinHebdo,
    besoinTotal,
    calcul: calculCorrige,
    series,
    gaps,
    intrants,
    
    resume: {
      planchesSimultanees: planchesFinales,
      planchesPhysiques: planchesFinales,
      planchesParSerie: 1,
      nombreSeries: series.length,
      totalPlanches: planchesFinales,
      frequence: Math.round(calcul.decalageOptimal * 10) / 10,
      fenetreRecolte: calcul.fenetreRecolteJours,
      delaiIntercalaire,
      rotations: calculPhysique.rotations,
      typeCycle: calculPhysique.typeCycle,
      productionEstimee: Math.round(productionEstimee),
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
  
  if (plan.culture.fenetres?.semis) {
    const semainesSemis = plan.series.map(s => s.semaineSemis);
    const fenetreSemis = plan.culture.fenetres.semis;
    
    const semiHorsFenetre = semainesSemis.filter(s => 
      s < fenetreSemis.debut || s > fenetreSemis.fin
    );
    
    if (semiHorsFenetre.length > 0) {
      alertes.push({
        type: 'avertissement',
        message: `${semiHorsFenetre.length} semis hors fenêtre optimale (S${fenetreSemis.debut}-S${fenetreSemis.fin})`
      });
    }
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
 * ═══════════════════════════════════════════════════════════════════════════
 * CALCUL ÉCONOMIE INTERCALAGE
 * ═══════════════════════════════════════════════════════════════════════════
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
  calculerEconomieIntercalage,
  calculerRepartitionOptimale,
  TYPES_CYCLES
};
