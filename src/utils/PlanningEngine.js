// Moteur de Planification - PlanningEngine.js
// Version 8.0 - Implémentation du rétro-planning et gestion des dépendances

import {
  SAISON,
  ZONES_CLIMATIQUES,
  ZONE_DEFAUT,
  BUFFER_PREPARATION_SOL,
  BUFFER_NETTOYAGE,
  joursEnSemaines,
  semainesEnJours,
  ajouterSemaines,
  differenceSemaines
} from './constantes';

/**
 * Classe principale du moteur de planification
 * Gère les calculs de dates, la validation des fenêtres et les dépendances
 */
export class PlanningEngine {
  constructor(zone = ZONE_DEFAUT) {
    this.zone = ZONES_CLIMATIQUES[zone];
    if (!this.zone) {
      console.warn(`Zone ${zone} non trouvée, utilisation de ${ZONE_DEFAUT}`);
      this.zone = ZONES_CLIMATIQUES[ZONE_DEFAUT];
    }
  }

  /**
   * CALCUL RÉTRO-PLANNING
   * Calcule toutes les dates à partir d'une date de récolte souhaitée
   * 
   * @param {number} semaineRecolte - Semaine souhaitée pour la récolte
   * @param {object} culture - Objet culture avec les paramètres agronomiques
   * @param {string} typeProtection - Type de protection ('serre', 'plein-champ', etc.)
   * @returns {object} - Objet contenant toutes les dates calculées
   */
  calculerDatesDepuisRecolte(semaineRecolte, culture, typeProtection = 'plein-champ') {
    // 1. Calculer la date de plantation
    // Date plantation = Date récolte - DTM (Days To Maturity)
    const dtmModifie = this.calculerDTMModifie(culture.dureeOccupationPlanche, typeProtection);
    const semainesDTM = joursEnSemaines(dtmModifie);
    const semainePlantation = ajouterSemaines(semaineRecolte, -semainesDTM);

    // 2. Calculer la date de semis
    // Date semis = Date plantation - Temps pépinière
    let semaineSemis = semainePlantation;
    if (culture.methode === 'transplantation' && culture.dureeEnPepiniere) {
      const semainesPepiniere = joursEnSemaines(culture.dureeEnPepiniere);
      semaineSemis = ajouterSemaines(semainePlantation, -semainesPepiniere);
    }

    // 3. Calculer la date de fin de récolte
    // Date fin récolte = Date début récolte + Fenêtre de récolte
    const semainesFenetreRecolte = culture.fenetres.recolte.fin - culture.fenetres.recolte.debut;
    const semaineFinRecolte = ajouterSemaines(semaineRecolte, semainesFenetreRecolte);

    // 4. Calculer la date de libération de la planche
    // Date libération = Date fin récolte + Buffer nettoyage
    const semainesBuffer = joursEnSemaines(BUFFER_NETTOYAGE);
    const semaineLiberation = ajouterSemaines(semaineFinRecolte, semainesBuffer);

    // 5. Construire l'objet de résultat
    const dates = {
      semis: semaineSemis,
      plantation: semainePlantation,
      recolteDebut: semaineRecolte,
      recolteFin: semaineFinRecolte,
      liberation: semaineLiberation,
      
      // Durées calculées
      durees: {
        pepiniere: culture.methode === 'transplantation' ? joursEnSemaines(culture.dureeEnPepiniere) : 0,
        croissance: semainesDTM,
        recolte: semainesFenetreRecolte,
        occupation: differenceSemaines(semainePlantation, semaineLiberation)
      },
      
      // Métadonnées
      typeProtection,
      dtmOriginal: culture.dureeOccupationPlanche,
      dtmModifie
    };

    return dates;
  }

  /**
   * Calcule le DTM modifié en fonction du type de protection
   * @param {number} dtmBase - DTM de base en jours
   * @param {string} typeProtection - Type de protection
   * @returns {number} - DTM modifié en jours
   */
  calculerDTMModifie(dtmBase, typeProtection) {
    const modificateur = this.zone.modificationsDTM[typeProtection] || 0;
    return Math.round(dtmBase * (1 + modificateur));
  }

  /**
   * VALIDATION DES FENÊTRES DE SAISONS
   * Vérifie que les dates calculées respectent les fenêtres autorisées
   * 
   * @param {object} dates - Dates calculées par calculerDatesDepuisRecolte
   * @param {object} culture - Objet culture
   * @returns {object} - Résultat de validation avec alertes si nécessaire
   */
  validerFenetresSaisons(dates, culture) {
    const alertes = [];
    const erreurs = [];

    // Vérifier la fenêtre de semis
    if (culture.fenetres.semis) {
      const { debut, fin } = culture.fenetres.semis;
      
      if (dates.semis < debut) {
        erreurs.push({
          type: 'semis_trop_tot',
          message: `Semis trop tôt (S${dates.semis}). Minimum autorisé: S${debut}`,
          gravite: 'haute',
          semaineSuggestion: debut
        });
      }
      
      if (dates.semis > fin) {
        erreurs.push({
          type: 'semis_trop_tard',
          message: `Semis trop tard (S${dates.semis}). Maximum autorisé: S${fin}`,
          gravite: 'haute',
          semaineSuggestion: fin
        });
      }
    }

    // Vérifier la fenêtre de plantation (si transplantation)
    if (culture.methode === 'transplantation' && culture.fenetres.transplantation) {
      const { debut, fin } = culture.fenetres.transplantation;
      
      if (dates.plantation < debut) {
        erreurs.push({
          type: 'plantation_trop_tot',
          message: `Plantation trop tôt (S${dates.plantation}). Minimum autorisé: S${debut}`,
          gravite: 'haute',
          semaineSuggestion: debut
        });
      }
      
      if (dates.plantation > fin) {
        erreurs.push({
          type: 'plantation_trop_tard',
          message: `Plantation trop tard (S${dates.plantation}). Maximum autorisé: S${fin}`,
          gravite: 'haute',
          semaineSuggestion: fin
        });
      }
    }

    // Vérifier la fenêtre de récolte
    if (culture.fenetres.recolte) {
      const { debut, fin } = culture.fenetres.recolte;
      
      if (dates.recolteDebut < debut) {
        alertes.push({
          type: 'recolte_precoce',
          message: `Récolte précoce (S${dates.recolteDebut}). Normal à partir de: S${debut}`,
          gravite: 'moyenne'
        });
      }
      
      if (dates.recolteFin > fin) {
        alertes.push({
          type: 'recolte_tardive',
          message: `Récolte tardive (S${dates.recolteFin}). Fin normale: S${fin}`,
          gravite: 'moyenne'
        });
      }
    }

    // Vérifier les risques de gel
    if (dates.plantation < this.zone.dernierGel) {
      alertes.push({
        type: 'risque_gel_debut',
        message: `Risque de gel au printemps (plantation S${dates.plantation}, dernier gel S${this.zone.dernierGel})`,
        gravite: 'haute'
      });
    }

    if (dates.recolteFin > this.zone.premierGel) {
      alertes.push({
        type: 'risque_gel_fin',
        message: `Risque de gel à l'automne (fin récolte S${dates.recolteFin}, premier gel S${this.zone.premierGel})`,
        gravite: 'moyenne'
      });
    }

    return {
      valide: erreurs.length === 0,
      erreurs,
      alertes,
      graviteMaximale: erreurs.length > 0 ? 'haute' : (alertes.length > 0 ? 'moyenne' : 'aucune')
    };
  }

  /**
   * GÉNÉRATION DES TÂCHES
   * Génère automatiquement les tâches à partir de la date de plantation
   * 
   * @param {object} dates - Dates calculées
   * @param {object} culture - Objet culture
   * @param {object} modeleTaches - Modèle de tâches depuis taches.js
   * @returns {array} - Liste des tâches avec dates calculées
   */
  genererTaches(dates, culture, modeleTaches) {
    if (!modeleTaches || !modeleTaches.taches) {
      return [];
    }

    const taches = modeleTaches.taches.map((tache, index) => {
      // Calculer la date de la tâche
      // Task_Date = Plantation_Date + Offset_Days
      const semainesOffset = joursEnSemaines(tache.jour);
      const semaineTache = ajouterSemaines(dates.plantation, semainesOffset);

      return {
        id: `tache_${culture.id}_${index}_${Date.now()}`,
        nom: tache.nom,
        description: tache.description,
        semaine: semaineTache,
        jourOffset: tache.jour,
        dateCalculee: semaineTache,
        statut: 'a_faire',
        heuresEstimees: this.estimerHeuresTache(tache.nom),
        cultureId: culture.id,
        couleur: this.getCouleurTache(tache.nom)
      };
    });

    // Trier les tâches par date
    return taches.sort((a, b) => a.semaine - b.semaine);
  }

  /**
   * Estime les heures nécessaires pour une tâche
   * @param {string} nomTache - Nom de la tâche
   * @returns {number} - Heures estimées
   */
  estimerHeuresTache(nomTache) {
    const estimations = {
      'Faux semis': 1,
      'Pyrodésherbage': 1,
      'Herse étrille 1': 0.5,
      'Herse étrille 2': 0.5,
      'Bio-disque': 1,
      'Binette': 1.5,
      'Désherbage manuel': 3,
      'Bore/algues 1': 0.5,
      'Bore/algues 2': 0.5,
      'Paillage': 2,
      'Pincer/têtes': 1,
      'Tondre et bâcher': 1
    };
    
    return estimations[nomTache] || 1;
  }

  /**
   * Retourne la couleur d'une tâche pour le calendrier
   * @param {string} nomTache - Nom de la tâche
   * @returns {string} - Code couleur
   */
  getCouleurTache(nomTache) {
    const couleurs = {
      'Faux semis': '#6366f1',
      'Pyrodésherbage': '#f59e0b',
      'Herse étrille 1': '#10b981',
      'Herse étrille 2': '#10b981',
      'Bio-disque': '#8b5cf6',
      'Binette': '#14b8a6',
      'Désherbage manuel': '#ef4444',
      'Bore/algues 1': '#3b82f6',
      'Bore/algues 2': '#3b82f6',
      'Paillage': '#a855f7',
      'Pincer/têtes': '#ec4899',
      'Tondre et bâcher': '#64748b'
    };
    
    return couleurs[nomTache] || '#gray-500';
  }

  /**
   * RECALCUL EN CASCADE
   * Si on modifie une date clé, recalcule toutes les dates dépendantes
   * 
   * @param {object} planting - Objet planting (série)
   * @param {number} nouvelleValeur - Nouvelle valeur de la date
   * @param {string} champ - Champ modifié ('semis', 'plantation', 'recolteDebut')
   * @param {object} culture - Objet culture
   * @returns {object} - Planting mis à jour avec dates recalculées
   */
  recalculerEnCascade(planting, nouvelleValeur, champ, culture) {
    let nouvellesDates;

    switch (champ) {
      case 'recolteDebut':
        // Si on change la date de récolte, recalculer tout en rétro-planning
        nouvellesDates = this.calculerDatesDepuisRecolte(
          nouvelleValeur,
          culture,
          planting.typeProtection || 'plein-champ'
        );
        break;

      case 'plantation':
        // Si on change la plantation, recalculer semis et dates de récolte
        const dtmModifie = this.calculerDTMModifie(
          culture.dureeOccupationPlanche,
          planting.typeProtection || 'plein-champ'
        );
        const semainesDTM = joursEnSemaines(dtmModifie);
        
        nouvellesDates = {
          ...planting.dates,
          plantation: nouvelleValeur,
          recolteDebut: ajouterSemaines(nouvelleValeur, semainesDTM),
          semis: culture.methode === 'transplantation' && culture.dureeEnPepiniere
            ? ajouterSemaines(nouvelleValeur, -joursEnSemaines(culture.dureeEnPepiniere))
            : nouvelleValeur
        };
        break;

      case 'semis':
        // Si on change le semis, recalculer plantation et récolte
        const semainesPepiniere = culture.methode === 'transplantation' && culture.dureeEnPepiniere
          ? joursEnSemaines(culture.dureeEnPepiniere)
          : 0;
        
        const nouvellePlantation = ajouterSemaines(nouvelleValeur, semainesPepiniere);
        const dtm = this.calculerDTMModifie(
          culture.dureeOccupationPlanche,
          planting.typeProtection || 'plein-champ'
        );
        
        nouvellesDates = {
          ...planting.dates,
          semis: nouvelleValeur,
          plantation: nouvellePlantation,
          recolteDebut: ajouterSemaines(nouvellePlantation, joursEnSemaines(dtm))
        };
        break;

      default:
        return planting;
    }

    // Recalculer les dates de fin et libération
    const semainesFenetreRecolte = culture.fenetres.recolte.fin - culture.fenetres.recolte.debut;
    nouvellesDates.recolteFin = ajouterSemaines(
      nouvellesDates.recolteDebut,
      semainesFenetreRecolte
    );
    
    const semainesBuffer = joursEnSemaines(BUFFER_NETTOYAGE);
    nouvellesDates.liberation = ajouterSemaines(
      nouvellesDates.recolteFin,
      semainesBuffer
    );

    // Mettre à jour le planting
    const plantingMisAJour = {
      ...planting,
      dates: nouvellesDates
    };

    // Régénérer les tâches avec les nouvelles dates
    // Note: Nécessite le modèle de tâches en paramètre
    // plantingMisAJour.taches = this.genererTaches(nouvellesDates, culture, modeleTaches);

    return plantingMisAJour;
  }

  /**
   * CALCUL DES BESOINS EN PLANCHES
   * À partir d'un objectif de production, calcule le nombre de planches nécessaires
   * 
   * @param {number} objectifKg - Objectif de production en kg
   * @param {object} culture - Objet culture
   * @param {number} facteurSecurite - Coefficient de surproduction (ex: 1.3 pour +30%)
   * @returns {number} - Nombre de planches nécessaires
   */
  calculerPlanchesNecessaires(objectifKg, culture, facteurSecurite = 1.3) {
    // Appliquer le facteur de sécurité
    const objectifAvecSecurite = objectifKg * facteurSecurite;
    
    // Rendement par planche (30m)
    let rendementPlanche = culture.rendement.planche30m;
    
    // Si culture avec plusieurs coupes, utiliser le rendement total
    if (culture.nombreCoupesParCycle && culture.rendement.planche30mTotal) {
      rendementPlanche = culture.rendement.planche30mTotal;
    }
    
    // Calculer le nombre de planches
    const nombrePlanches = Math.ceil(objectifAvecSecurite / rendementPlanche);
    
    return nombrePlanches;
  }

  /**
   * CALCUL DU NOMBRE DE SÉRIES NÉCESSAIRES
   * Détermine combien de séries sont nécessaires pour couvrir toute la saison
   * 
   * @param {object} culture - Objet culture
   * @param {number} semaineDebut - Première semaine de production souhaitée
   * @param {number} semaineFin - Dernière semaine de production souhaitée
   * @returns {array} - Liste des semaines de début pour chaque série
   */
  calculerSeriesNecessaires(culture, semaineDebut = SAISON.debut, semaineFin = SAISON.fin) {
    const series = [];
    const dureeOccupation = joursEnSemaines(culture.dureeOccupationPlanche);
    
    // Décalage optimal entre séries (50% de la durée)
    const decalage = Math.ceil(dureeOccupation / 2);
    
    let semaineCourante = semaineDebut;
    
    while (semaineCourante <= semaineFin) {
      // Calculer les dates pour cette série
      const dates = this.calculerDatesDepuisRecolte(
        semaineCourante,
        culture,
        'plein-champ'
      );
      
      // Vérifier que la série se termine avant la fin de saison
      if (dates.recolteFin <= semaineFin) {
        series.push({
          semaineRecolteDebut: semaineCourante,
          dates
        });
      }
      
      // Passer à la série suivante
      semaineCourante = ajouterSemaines(semaineCourante, decalage);
    }
    
    return series;
  }
}

// Export de la classe
export default PlanningEngine;
