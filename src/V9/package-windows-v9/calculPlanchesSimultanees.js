// calculPlanchesSimultanees.js
// Module de calcul du nombre de planches simultanées nécessaires
// D'après le Cahier des Charges Fonctionnel : Moteur de Planification de Cultures

/**
 * 🎯 FONCTION CLÉ : Calcule combien de planches doivent être 
 * EN PRODUCTION simultanément pour maintenir un besoin hebdomadaire continu
 * 
 * @param {Object} culture - Objet culture avec rendement et durées
 * @param {number} besoinHebdo - Besoin hebdomadaire moyen en kg ou unités
 * @param {number} facteurSecurite - Facteur de sécurité (défaut 0.7 = -30%)
 * @returns {Object} Résultat avec planches simultanées et infos détaillées
 */
export function calculerPlanchesSimultanees(culture, besoinHebdo, facteurSecurite = 0.7) {
  // 1. Rendement net par planche (avec facteur de sécurité)
  const rendementBrut = culture.rendement.planche30m;
  const rendementNet = rendementBrut * facteurSecurite;
  
  // 2. Durée de production (fenêtre de récolte en semaines)
  const fenetreRecolteJours = culture.dureeOccupationPlanche;
  const fenetreRecolteSemaines = fenetreRecolteJours / 7;
  
  // 3. Planches nécessaires par semaine
  const planchesParSemaine = besoinHebdo / rendementNet;
  
  // 4. ⭐ PLANCHES SIMULTANÉES = planches/sem × durée production
  const planchesSimultanees = Math.ceil(
    planchesParSemaine * fenetreRecolteSemaines
  );
  
  // 5. Calculs pour les séries échelonnées
  const decalageOptimal = fenetreRecolteSemaines / planchesSimultanees;
  const nombreSeriesRecommandees = Math.ceil(20 / decalageOptimal); // 20 sem = saison
  const planchesParSerie = Math.ceil(planchesSimultanees / Math.min(nombreSeriesRecommandees, 4));
  
  return {
    planchesSimultanees,
    rendementNet,
    rendementBrut,
    fenetreRecolteSemaines,
    fenetreRecolteJours,
    planchesParSemaine,
    decalageOptimal,
    nombreSeriesRecommandees: Math.min(nombreSeriesRecommandees, 4), // Max 4 séries
    planchesParSerie,
    totalPlanchesSaison: planchesParSerie * Math.min(nombreSeriesRecommandees, 4)
  };
}

/**
 * 📅 Génère des séries échelonnées pour couvrir toute la saison
 * 
 * @param {Object} culture - Objet culture
 * @param {Object} calcul - Résultat de calculerPlanchesSimultanees()
 * @param {number} saisonDebut - Semaine de début (défaut 18 = 1er mai)
 * @param {number} saisonFin - Semaine de fin (défaut 38 = 1er sept)
 * @returns {Array} Liste des séries avec dates calculées
 */
export function genererSeriesEchelonnees(culture, calcul, saisonDebut = 18, saisonFin = 38) {
  const series = [];
  const { decalageOptimal, planchesParSerie, nombreSeriesRecommandees } = calcul;
  
  // Durées en semaines
  const dureeEnPepiniereSemaines = Math.ceil(culture.dureeEnPepiniere / 7);
  const dureeOccupationSemaines = Math.ceil(culture.dureeOccupationPlanche / 7);
  
  // Générer les séries avec décalage optimal
  for (let i = 0; i < nombreSeriesRecommandees; i++) {
    const semaineRecolteDebut = saisonDebut + (i * decalageOptimal);
    
    // Si on dépasse la fin de saison, arrêter
    if (semaineRecolteDebut > saisonFin) break;
    
    const semaineRecolteFin = Math.min(
      semaineRecolteDebut + calcul.fenetreRecolteSemaines,
      saisonFin
    );
    
    // Rétro-planning : Récolte → Plantation → Semis
    const semainePlantation = Math.round(semaineRecolteDebut - dureeEnPepiniereSemaines);
    const semaineSemis = Math.round(semainePlantation - dureeEnPepiniereSemaines);
    
    series.push({
      id: i + 1,
      planchesUtilisees: planchesParSerie,
      semaineSemis: Math.max(1, semaineSemis),
      semainePlantation: Math.max(1, semainePlantation),
      semaineRecolteDebut: Math.round(semaineRecolteDebut),
      semaineRecolteFin: Math.round(semaineRecolteFin),
      dureeOccupation: dureeOccupationSemaines
    });
  }
  
  return series;
}

/**
 * 🌱 Calcule les besoins en intrants pour toutes les séries
 * 
 * @param {Object} culture - Objet culture
 * @param {Array} series - Liste des séries générées
 * @param {number} margeSecurite - Marge de sécurité pour les plants (défaut 20%)
 * @returns {Object} Besoins en plants, graines, substrat et coûts
 */
export function calculerBesoinsIntrants(culture, series, margeSecurite = 0.2) {
  // 1. Nombre total de planches
  const totalPlanches = series.reduce((sum, s) => sum + s.planchesUtilisees, 0);
  
  // 2. Nombre de plants nécessaires
  const plantsParPlanche = culture.densite?.plantsParPlanche30m || 50;
  const plantsNecessaires = totalPlanches * plantsParPlanche;
  const plantsAPreparer = Math.ceil(plantsNecessaires * (1 + margeSecurite));
  
  // 3. Graines à semer (dépend du taux de germination)
  const tauxGermination = 0.9; // 90% par défaut
  const grainesASemer = Math.ceil(plantsAPreparer / tauxGermination);
  
  // 4. Poids de graines en grammes (estimation)
  // Moyenne: 1000 graines = ~5g pour légumes-fruits, ~2g pour légumes-feuilles
  const poidsMilleGraines = culture.categorie === 'Légume fruit' ? 5 : 2;
  const poidsGraines = (grainesASemer / 1000) * poidsMilleGraines;
  
  // 5. Substrat nécessaire (en litres)
  // Volume d'une motte 128 cellules : 0.05L, 72 cellules : 0.08L, pots 10cm : 0.5L
  let volumeParPlant = 0.05; // défaut 128 cellules
  if (culture.typeContenant?.includes('72')) volumeParPlant = 0.08;
  if (culture.typeContenant?.includes('pot')) volumeParPlant = 0.5;
  
  const substratLitres = Math.ceil(plantsAPreparer * volumeParPlant);
  
  // 6. Nombre de bacs de substrat (1 bac = 72L)
  const nombreBacs = Math.ceil(substratLitres / 72);
  
  // 7. Coûts estimés
  const coutGraines = Math.ceil(poidsGraines * 1); // ~1€/g pour graines bio
  const coutSubstrat = nombreBacs * 3.50; // ~3.50€/bac
  const coutTotal = coutGraines + coutSubstrat;
  
  return {
    plantsNecessaires,
    plantsAPreparer,
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
 * 🎮 Fonction principale : Génère un plan complet pour une culture
 * 
 * @param {Object} culture - Objet culture
 * @param {Object} marche - Configuration du marché (pour calcul besoin)
 * @param {Function} calculerBesoinHebdo - Fonction de calcul des besoins
 * @returns {Object} Plan complet avec planches, séries, intrants
 */
export function genererPlanComplet(culture, marche, calculerBesoinHebdo) {
  // 1. Calculer le besoin hebdomadaire moyen sur la saison (S18-S38)
  let besoinTotal = 0;
  let semaines = 0;
  
  for (let semaine = 18; semaine <= 38; semaine++) {
    const besoins = calculerBesoinHebdo(marche, semaine);
    if (besoins[culture.id]) {
      besoinTotal += besoins[culture.id].total;
      semaines++;
    }
  }
  
  const besoinHebdo = semaines > 0 ? besoinTotal / semaines : 0;
  
  // 2. Calculer les planches simultanées nécessaires
  const calcul = calculerPlanchesSimultanees(culture, besoinHebdo);
  
  // 3. Générer les séries échelonnées
  const series = genererSeriesEchelonnees(culture, calcul);
  
  // 4. Calculer les besoins en intrants
  const intrants = calculerBesoinsIntrants(culture, series);
  
  // 5. Assembler le plan complet
  return {
    culture,
    besoinHebdo,
    calcul,
    series,
    intrants,
    
    // Résumé pour affichage
    resume: {
      planchesSimultanees: calcul.planchesSimultanees,
      planchesParSerie: calcul.planchesParSerie,
      nombreSeries: series.length,
      totalPlanches: calcul.totalPlanchesSaison,
      frequence: Math.round(calcul.decalageOptimal * 10) / 10, // arrondi à 1 décimale
      fenetreRecolte: calcul.fenetreRecolteJours
    }
  };
}

/**
 * 📊 Valide qu'un plan est réalisable avec les jardins disponibles
 * 
 * @param {Object} plan - Plan généré par genererPlanComplet()
 * @param {Array} jardins - Liste des jardins avec leurs capacités
 * @returns {Object} Résultat de validation avec alertes éventuelles
 */
export function validerPlan(plan, jardins) {
  const planchesNecessaires = plan.calcul.totalPlanchesSaison;
  const planchesDisponibles = jardins.reduce((sum, j) => sum + j.nombrePlanches, 0);
  
  const alertes = [];
  
  if (planchesNecessaires > planchesDisponibles) {
    alertes.push({
      type: 'erreur',
      message: `Pas assez de planches ! Besoin : ${planchesNecessaires}, Disponible : ${planchesDisponibles}`
    });
  }
  
  // Vérifier les fenêtres de saisons
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
  
  return {
    valide: alertes.filter(a => a.type === 'erreur').length === 0,
    alertes,
    planchesNecessaires,
    planchesDisponibles,
    tauxUtilisation: (planchesNecessaires / planchesDisponibles) * 100
  };
}
