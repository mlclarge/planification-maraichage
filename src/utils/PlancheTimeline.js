// Gestion de l'Occupation des Planches - PlancheTimeline.js
// Version 8.0 - Implémentation du "Tetris Temporel"

import {
  BUFFER_PREPARATION_SOL,
  joursEnSemaines,
  differenceSemaines,
  ajouterSemaines
} from './constantes';

/**
 * Classe pour gérer l'occupation temporelle d'une planche
 * Implémente la logique du "Tetris Temporel" pour détecter les conflits
 */
export class PlancheTimeline {
  constructor(plancheId, jardinId) {
    this.plancheId = plancheId;
    this.jardinId = jardinId;
    this.occupations = []; // Liste des intervalles occupés
  }

  /**
   * Ajoute une occupation à la timeline
   * @param {object} planting - Objet planting (série)
   * @returns {boolean} - true si ajouté avec succès
   */
  ajouterOccupation(planting) {
    const occupation = {
      plantingId: planting.id,
      cultureId: planting.cultureId,
      cultureNom: planting.nom,
      semaineDebut: planting.dates.plantation,
      semaineFin: planting.dates.liberation,
      duree: differenceSemaines(planting.dates.plantation, planting.dates.liberation)
    };

    // Vérifier les conflits avant d'ajouter
    const conflit = this.detecterConflit(occupation.semaineDebut, occupation.semaineFin);
    
    if (conflit.type !== 'aucun') {
      console.warn(`Conflit détecté pour le planting ${planting.id}:`, conflit);
      return false;
    }

    // Ajouter l'occupation
    this.occupations.push(occupation);
    
    // Trier par date de début
    this.occupations.sort((a, b) => a.semaineDebut - b.semaineDebut);
    
    return true;
  }

  /**
   * Retire une occupation de la timeline
   * @param {string} plantingId - ID du planting à retirer
   * @returns {boolean} - true si retiré avec succès
   */
  retirerOccupation(plantingId) {
    const indexAvant = this.occupations.length;
    this.occupations = this.occupations.filter(occ => occ.plantingId !== plantingId);
    return this.occupations.length < indexAvant;
  }

  /**
   * DÉTECTION DE CONFLITS
   * Vérifie si un intervalle entre en conflit avec les occupations existantes
   * 
   * @param {number} semaineDebut - Semaine de début de la nouvelle occupation
   * @param {number} semaineFin - Semaine de fin de la nouvelle occupation
   * @param {string} plantingIdExclu - ID d'un planting à exclure de la vérification (pour mise à jour)
   * @returns {object} - Résultat de la détection avec type et détails
   */
  detecterConflit(semaineDebut, semaineFin, plantingIdExclu = null) {
    // Filtrer les occupations (exclure le planting en cours de mise à jour)
    const occupationsAVerifier = this.occupations.filter(
      occ => occ.plantingId !== plantingIdExclu
    );

    for (const occupation of occupationsAVerifier) {
      // TYPE 1: CHEVAUCHEMENT DIRECT (Collision)
      // Vérifie si les intervalles se chevauchent
      // Condition: (debut1 < fin2) ET (debut2 < fin1)
      const chevauchement = 
        (semaineDebut < occupation.semaineFin) &&
        (occupation.semaineDebut < semaineFin);

      if (chevauchement) {
        return {
          type: 'collision',
          gravite: 'haute',
          occupationConflictuelle: occupation,
          message: `Collision avec ${occupation.cultureNom} (S${occupation.semaineDebut}-S${occupation.semaineFin})`,
          details: {
            chevauchemDebut: Math.max(semaineDebut, occupation.semaineDebut),
            chevaucheFin: Math.min(semaineFin, occupation.semaineFin),
            dureeChevauchement: Math.min(semaineFin, occupation.semaineFin) - 
                               Math.max(semaineDebut, occupation.semaineDebut)
          }
        };
      }

      // TYPE 2: SUCCESSION NON VIABLE
      // Vérifie s'il y a assez de temps pour préparer le sol entre deux cultures
      // La nouvelle culture commence juste après une occupation existante
      const bufferNecessaire = joursEnSemaines(BUFFER_PREPARATION_SOL);
      
      // Cas A: La nouvelle culture vient après l'occupation existante
      if (semaineDebut >= occupation.semaineFin) {
        const espaceDispo = semaineDebut - occupation.semaineFin;
        
        if (espaceDispo < bufferNecessaire) {
          return {
            type: 'succession_non_viable',
            gravite: 'moyenne',
            occupationPrecedente: occupation,
            message: `Pas assez de temps pour préparer le sol après ${occupation.cultureNom}`,
            details: {
              espaceDisponible: espaceDispo,
              espaceNecessaire: bufferNecessaire,
              manque: bufferNecessaire - espaceDispo,
              semaineEspaceDispo: occupation.semaineFin,
              semaineDebutNouvelle: semaineDebut
            }
          };
        }
      }
      
      // Cas B: La nouvelle culture vient avant l'occupation existante
      if (semaineFin <= occupation.semaineDebut) {
        const espaceDispo = occupation.semaineDebut - semaineFin;
        
        if (espaceDispo < bufferNecessaire) {
          return {
            type: 'succession_non_viable',
            gravite: 'moyenne',
            occupationSuivante: occupation,
            message: `Pas assez de temps pour préparer le sol avant ${occupation.cultureNom}`,
            details: {
              espaceDisponible: espaceDispo,
              espaceNecessaire: bufferNecessaire,
              manque: bufferNecessaire - espaceDispo,
              semaineFinNouvelle: semaineFin,
              semaineDebutSuivante: occupation.semaineDebut
            }
          };
        }
      }
    }

    // Aucun conflit détecté
    return {
      type: 'aucun',
      gravite: 'aucune',
      message: 'Aucun conflit détecté'
    };
  }

  /**
   * RECHERCHE D'ESPACES LIBRES
   * Trouve tous les intervalles de temps disponibles sur la planche
   * 
   * @param {number} semaineDebut - Semaine de début de la recherche (défaut: 1)
   * @param {number} semaineFin - Semaine de fin de la recherche (défaut: 52)
   * @returns {array} - Liste des espaces libres avec début, fin et durée
   */
  trouverEspacesLibres(semaineDebut = 1, semaineFin = 52) {
    const espacesLibres = [];

    // Si aucune occupation, toute la période est libre
    if (this.occupations.length === 0) {
      return [{
        semaineDebut,
        semaineFin,
        duree: semaineFin - semaineDebut,
        plancheId: this.plancheId
      }];
    }

    // Trier les occupations par date de début (déjà fait dans ajouterOccupation)
    const occupationsSorted = [...this.occupations].sort(
      (a, b) => a.semaineDebut - b.semaineDebut
    );

    // Vérifier l'espace avant la première occupation
    if (occupationsSorted[0].semaineDebut > semaineDebut) {
      const duree = occupationsSorted[0].semaineDebut - semaineDebut;
      espacesLibres.push({
        semaineDebut,
        semaineFin: occupationsSorted[0].semaineDebut,
        duree,
        plancheId: this.plancheId
      });
    }

    // Vérifier les espaces entre chaque occupation
    for (let i = 0; i < occupationsSorted.length - 1; i++) {
      const finCourante = occupationsSorted[i].semaineFin;
      const debutSuivante = occupationsSorted[i + 1].semaineDebut;

      if (debutSuivante > finCourante) {
        const duree = debutSuivante - finCourante;
        espacesLibres.push({
          semaineDebut: finCourante,
          semaineFin: debutSuivante,
          duree,
          plancheId: this.plancheId,
          aprèsCulture: occupationsSorted[i].cultureNom,
          avantCulture: occupationsSorted[i + 1].cultureNom
        });
      }
    }

    // Vérifier l'espace après la dernière occupation
    const derniereOccupation = occupationsSorted[occupationsSorted.length - 1];
    if (derniereOccupation.semaineFin < semaineFin) {
      const duree = semaineFin - derniereOccupation.semaineFin;
      espacesLibres.push({
        semaineDebut: derniereOccupation.semaineFin,
        semaineFin,
        duree,
        plancheId: this.plancheId,
        aprèsCulture: derniereOccupation.cultureNom
      });
    }

    return espacesLibres;
  }

  /**
   * SUGGESTION DE CULTURES INTERCALAIRES
   * Propose des cultures rapides pour remplir les espaces libres
   * 
   * @param {array} cultures - Liste des cultures disponibles
   * @param {array} espacesLibres - Liste des espaces libres (optionnel, sera calculé sinon)
   * @returns {array} - Suggestions de cultures intercalaires avec détails
   */
  suggererIntercalaires(cultures, espacesLibres = null) {
    // Si espaces libres non fournis, les calculer
    if (!espacesLibres) {
      espacesLibres = this.trouverEspacesLibres();
    }

    const suggestions = [];
    const bufferNecessaire = joursEnSemaines(BUFFER_PREPARATION_SOL);

    for (const espace of espacesLibres) {
      // L'espace disponible réel est l'espace total moins 2x le buffer
      // (un buffer avant et un buffer après)
      const espaceReel = espace.duree - (2 * bufferNecessaire);

      if (espaceReel <= 0) {
        // Espace trop petit, même pour une culture intercalaire
        continue;
      }

      // Filtrer les cultures qui peuvent rentrer dans cet espace
      const culturesCompatibles = cultures.filter(culture => {
        const dureeOccupation = joursEnSemaines(culture.dureeOccupationPlanche);
        return dureeOccupation <= espaceReel && culture.rotationsPossibles >= 2;
      });

      if (culturesCompatibles.length > 0) {
        // Trier par rendement/durée (rentabilité)
        const culturesTriees = culturesCompatibles.sort((a, b) => {
          const rentabiliteA = a.prix.caPotentielPlanche30m / joursEnSemaines(a.dureeOccupationPlanche);
          const rentabiliteB = b.prix.caPotentielPlanche30m / joursEnSemaines(b.dureeOccupationPlanche);
          return rentabiliteB - rentabiliteA;
        });

        suggestions.push({
          espace,
          espaceReel,
          culturesProposees: culturesTriees.slice(0, 3), // Top 3
          meilleurChoix: culturesTriees[0],
          potentielCA: culturesTriees[0].prix.caPotentielPlanche30m,
          message: `Vous pouvez planter ${culturesTriees[0].nom} (CA: ${culturesTriees[0].prix.caPotentielPlanche30m}€)`
        });
      }
    }

    return suggestions;
  }

  /**
   * CALCUL DU TAUX D'OCCUPATION
   * Calcule le pourcentage d'occupation de la planche sur une période
   * 
   * @param {number} semaineDebut - Semaine de début (défaut: 1)
   * @param {number} semaineFin - Semaine de fin (défaut: 52)
   * @returns {object} - Statistiques d'occupation
   */
  calculerTauxOccupation(semaineDebut = 1, semaineFin = 52) {
    const dureeTotale = semaineFin - semaineDebut;
    let dureeOccupee = 0;

    for (const occupation of this.occupations) {
      // Calculer le chevauchement avec la période demandée
      const debut = Math.max(occupation.semaineDebut, semaineDebut);
      const fin = Math.min(occupation.semaineFin, semaineFin);
      
      if (fin > debut) {
        dureeOccupee += (fin - debut);
      }
    }

    const tauxOccupation = (dureeOccupee / dureeTotale) * 100;

    return {
      dureeTotale,
      dureeOccupee,
      dureeLibre: dureeTotale - dureeOccupee,
      tauxOccupation: Math.round(tauxOccupation * 10) / 10, // Arrondi à 0.1
      nombreOccupations: this.occupations.length
    };
  }

  /**
   * Retourne l'état de la planche à une semaine donnée
   * @param {number} semaine - Semaine à vérifier
   * @returns {object|null} - Occupation en cours ou null si libre
   */
  getOccupationASemaine(semaine) {
    return this.occupations.find(
      occ => semaine >= occ.semaineDebut && semaine < occ.semaineFin
    ) || null;
  }

  /**
   * Vérifie si la planche est libre pendant un intervalle
   * @param {number} semaineDebut - Semaine de début
   * @param {number} semaineFin - Semaine de fin
   * @returns {boolean} - true si entièrement libre
   */
  estLibre(semaineDebut, semaineFin) {
    const conflit = this.detecterConflit(semaineDebut, semaineFin);
    return conflit.type === 'aucun';
  }

  /**
   * Exporte l'état de la timeline pour visualisation
   * @returns {object} - État complet de la timeline
   */
  export() {
    return {
      plancheId: this.plancheId,
      jardinId: this.jardinId,
      occupations: [...this.occupations],
      espacesLibres: this.trouverEspacesLibres(),
      tauxOccupation: this.calculerTauxOccupation()
    };
  }
}

/**
 * Gestionnaire global pour toutes les planches
 * Permet de gérer l'ensemble des planches d'une exploitation
 */
export class GestionnairePlanches {
  constructor(jardins) {
    this.timelines = new Map();
    
    // Créer une timeline pour chaque planche de chaque jardin
    if (jardins && Array.isArray(jardins)) {
      jardins.forEach(jardin => {
        for (let i = 1; i <= jardin.nombrePlanches; i++) {
          const plancheId = `${jardin.id}_planche_${i}`;
          this.timelines.set(plancheId, new PlancheTimeline(plancheId, jardin.id));
        }
      });
    }
  }

  /**
   * Récupère la timeline d'une planche
   * @param {string} plancheId - ID de la planche
   * @returns {PlancheTimeline|null}
   */
  getTimeline(plancheId) {
    return this.timelines.get(plancheId) || null;
  }

  /**
   * Crée une nouvelle timeline si elle n'existe pas
   * @param {string} plancheId - ID de la planche
   * @param {number} jardinId - ID du jardin
   * @returns {PlancheTimeline}
   */
  creerTimeline(plancheId, jardinId) {
    if (!this.timelines.has(plancheId)) {
      this.timelines.set(plancheId, new PlancheTimeline(plancheId, jardinId));
    }
    return this.timelines.get(plancheId);
  }

  /**
   * Trouve les planches disponibles pour une culture
   * @param {number} semaineDebut - Semaine de début souhaitée
   * @param {number} semaineFin - Semaine de fin souhaitée
   * @param {number} jardinId - ID du jardin (optionnel)
   * @returns {array} - Liste des planches disponibles
   */
  trouverPlanchesDisponibles(semaineDebut, semaineFin, jardinId = null) {
    const disponibles = [];

    for (const [plancheId, timeline] of this.timelines) {
      // Filtrer par jardin si spécifié
      if (jardinId && timeline.jardinId !== jardinId) {
        continue;
      }

      if (timeline.estLibre(semaineDebut, semaineFin)) {
        disponibles.push({
          plancheId,
          jardinId: timeline.jardinId,
          timeline
        });
      }
    }

    return disponibles;
  }

  /**
   * Exporte l'état de toutes les timelines
   * @returns {array} - Liste des états de toutes les planches
   */
  exportAll() {
    const exports = [];
    for (const [plancheId, timeline] of this.timelines) {
      exports.push(timeline.export());
    }
    return exports;
  }
}

// Exports
export default {
  PlancheTimeline,
  GestionnairePlanches
};
