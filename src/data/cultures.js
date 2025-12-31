// cultures.js V13 - Base de données des cultures CORRIGÉE
// 🛠️ FIX : rotationsPossibles corrigés pour carottes et autres légumes racines
// Sources: Chartes Institut Jardinier Maraîcher + Documents fournis

export const cultures = [
  {
    id: 'tomate',
    nom: 'Tomates',
    categorie: 'Légume fruit',
    methode: 'transplantation',
    typeContenant: '128 puis pots 10cm',
    delaiIntercalaireRecommande: 2,
    delaiIntercalaireMin: 1,
    delaiIntercalaireMax: 3,
    
    // 🆕 V13 : Classification explicite pour le moteur de calcul
    typeCycle: 'LONGUE_DUREE', // Occupe la planche toute la saison
    
    densite: {
      rangs: 1,
      espacementRang: 61,
      espacementInterRang: 120,
      plantsParPlanche30m: 50
    },
    fenetres: {
      semis: { debut: 10, fin: 15 },
      transplantation: { debut: 18, fin: 22 },
      recolte: { debut: 28, fin: 40 }
    },
    dureeEnPepiniere: 49,
    dureeOccupationPlanche: 120, // 17 semaines - toute la saison
    dureeRecolte: 84, // 12 semaines de récolte (S28-S40)
    rotationsPossibles: 1, // ✅ Correct : 1 seule rotation possible
    
    rendement: {
      planche15m: 458,
      planche30m: 917,
      parM2: 40
    },
    prix: {
      unitaire: 3.50,
      caPotentielPlanche15m: 889,
      caPotentielPlanche30m: 1778
    },
    besoins: {
      temperatureGermination: 24,
      joursAvantGermination: 6,
      protection: 'serre',
      irrigation: 'goutte-à-goutte',
      paillage: 'plastique'
    },
    itk: {
      faux_semis: false,
      pyrodesherbage: false,
      herse_etrille: false,
      desherbage_manuel: false,
      paillage: 21,
      pincer: true
    },
    poidsMoyenPanier: {
      petit: 800,
      moyen: 1500,
      grand: 2500
    }
  },
  
  {
    id: 'courgette',
    nom: 'Courgettes',
    categorie: 'Légume fruit',
    methode: 'transplantation',
    typeContenant: '72',
    delaiIntercalaireRecommande: 2,
    delaiIntercalaireMin: 1,
    delaiIntercalaireMax: 3,
    
    // 🆕 V13 : Classification
    typeCycle: 'ROTATION_MOYENNE',
    
    densite: {
      rangs: 1,
      espacementRang: 61,
      espacementInterRang: 120,
      plantsParPlanche30m: 50
    },
    fenetres: {
      semis: { debut: 15, fin: 22 },
      transplantation: { debut: 18, fin: 26 },
      recolte: { debut: 22, fin: 40 }
    },
    dureeEnPepiniere: 15,
    dureeOccupationPlanche: 70, // 10 semaines
    dureeRecolte: 42, // 6 semaines
    rotationsPossibles: 2, // ✅ 2 rotations possibles
    
    rendement: {
      planche15m: 63,
      planche30m: 126,
      parM2: 4.2
    },
    prix: {
      unitaire: 4.00,
      caPotentielPlanche15m: 253,
      caPotentielPlanche30m: 506
    },
    besoins: {
      temperatureGermination: 30,
      joursAvantGermination: 4,
      protection: 'couvre-sol tissé + filet',
      irrigation: 'goutte-à-goutte'
    },
    itk: {
      faux_semis: false,
      pyrodesherbage: false,
      herse_etrille: false,
      desherbage_manuel: false,
      paillage: false
    },
    poidsMoyenPanier: {
      petit: 600,
      moyen: 1000,
      grand: 1500
    }
  },
  
  {
    id: 'concombre',
    nom: 'Concombres',
    categorie: 'Légume fruit',
    methode: 'transplantation',
    typeContenant: 'Pots 6po',
    delaiIntercalaireRecommande: 2,
    delaiIntercalaireMin: 1,
    delaiIntercalaireMax: 3,
    
    // 🆕 V13 : Classification
    typeCycle: 'LONGUE_DUREE',
    
    densite: {
      rangs: 1,
      espacementRang: 45,
      espacementInterRang: 120,
      plantsParPlanche30m: 67
    },
    fenetres: {
      semis: { debut: 15, fin: 24 },
      transplantation: { debut: 18, fin: 26 },
      recolte: { debut: 22, fin: 38 }
    },
    dureeEnPepiniere: 28,
    dureeOccupationPlanche: 90, // 13 semaines
    dureeRecolte: 56, // 8 semaines
    rotationsPossibles: 1, // Longue durée
    
    rendement: {
      planche15m: 140,
      planche30m: 280,
      parM2: 9.3,
      poidsUnitaire: 400
    },
    prix: {
      unitaire: 2.10,
      caPotentielPlanche15m: 294,
      caPotentielPlanche30m: 588
    },
    besoins: {
      temperatureGermination: 21,
      joursAvantGermination: 3,
      protection: 'serre',
      irrigation: 'goutte-à-goutte'
    },
    itk: {
      faux_semis: false,
      paillage: true
    },
    poidsMoyenPanier: {
      petit: 400,
      moyen: 800,
      grand: 1200
    }
  },
  
  {
    id: 'aubergine',
    nom: 'Aubergines',
    categorie: 'Légume fruit',
    methode: 'transplantation',
    typeContenant: '128 puis pots 10cm',
    delaiIntercalaireRecommande: 2,
    delaiIntercalaireMin: 1,
    delaiIntercalaireMax: 3,
    
    // 🆕 V13 : Classification
    typeCycle: 'LONGUE_DUREE',
    
    densite: {
      rangs: 2,
      espacementRang: 30,
      espacementInterRang: 38,
      plantsParPlanche30m: 100
    },
    fenetres: {
      semis: { debut: 10, fin: 15 },
      transplantation: { debut: 18, fin: 22 },
      recolte: { debut: 28, fin: 40 }
    },
    dureeEnPepiniere: 70,
    dureeOccupationPlanche: 120, // 17 semaines
    dureeRecolte: 84, // 12 semaines
    rotationsPossibles: 1,
    
    rendement: {
      planche15m: 166,
      planche30m: 332,
      parM2: 11
    },
    prix: {
      unitaire: 6.10,
      caPotentielPlanche15m: 1014,
      caPotentielPlanche30m: 2028
    },
    besoins: {
      temperatureGermination: 30,
      joursAvantGermination: 7,
      protection: 'serre',
      irrigation: 'goutte-à-goutte'
    },
    itk: {
      faux_semis: false,
      paillage: true
    },
    poidsMoyenPanier: {
      petit: 300,
      moyen: 800,
      grand: 1000
    }
  },
  
  {
    id: 'haricot',
    nom: 'Haricots (grimpants)',
    categorie: 'Légume fruit',
    methode: 'transplantation',
    typeContenant: '72',
    delaiIntercalaireRecommande: 2,
    delaiIntercalaireMin: 1,
    delaiIntercalaireMax: 3,
    
    // 🆕 V13 : Classification - Haricots grimpants = plusieurs vagues possibles
    typeCycle: 'ROTATION_MOYENNE',
    
    densite: {
      rangs: 1,
      espacementRang: 30,
      espacementInterRang: 120,
      plantsParPlanche30m: 100
    },
    fenetres: {
      semis: { debut: 18, fin: 26 },
      transplantation: { debut: 20, fin: 28 },
      recolte: { debut: 29, fin: 40 }
    },
    dureeEnPepiniere: 14,
    dureeOccupationPlanche: 56, // 8 semaines
    dureeRecolte: 35, // 5 semaines
    joursAMaturite: 60,
    rotationsPossibles: 2, // 🛠️ V13 : 2 rotations possibles (pas 1)
    
    rendement: {
      planche15m: 34,
      planche30m: 68,
      parM2: 2.3
    },
    prix: {
      unitaire: 15.20,
      caPotentielPlanche15m: 362,
      caPotentielPlanche30m: 724
    },
    besoins: {
      temperatureGermination: 25,
      joursAvantGermination: 8,
      protection: 'couvre-sol tissé',
      irrigation: 'goutte-à-goutte',
      tuteurage: true
    },
    itk: {
      faux_semis: false,
      binette: 14,
      paillage: 49
    },
    poidsMoyenPanier: {
      petit: 300,
      moyen: 600,
      grand: 800
    }
  },
  
  {
    id: 'mesclun',
    nom: 'Mesclun (Salanova)',
    categorie: 'Feuille',
    methode: 'transplantation',
    typeContenant: '128',
    delaiIntercalaireRecommande: 1,
    delaiIntercalaireMin: 1,
    delaiIntercalaireMax: 2,
    
    // 🆕 V13 : Classification
    typeCycle: 'ROTATION_RAPIDE',
    
    densite: {
      rangs: 4,
      espacementRang: 15,
      espacementInterRang: 20,
      plantsParPlanche30m: 400
    },
    fenetres: {
      semis: { debut: 8, fin: 38 },
      transplantation: { debut: 10, fin: 40 },
      recolte: { debut: 14, fin: 44 }
    },
    dureeEnPepiniere: 30,
    dureeOccupationPlanche: 56, // 8 semaines (4 croissance + 4 récolte)
    dureeRecolte: 28, // 4 semaines
    rotationsPossibles: 3, // ✅ 3 cycles par saison
    nombreCoupesParCycle: 3,
    
    rendement: {
      planche15m: 13,
      planche30m: 26,
      planche30mTotal: 78,
      parM2: 2.6,
      parM2Total: 7.8
    },
    prix: {
      unitaire: 14.00,
      caPotentielPlanche15m: 176,
      caPotentielPlanche30m: 352,
      caPotentielPlanche30mTotal: 1056
    },
    besoins: {
      temperatureGermination: 20,
      joursAvantGermination: 4,
      protection: 'couvre-sol tissé',
      irrigation: 'aspersion'
    },
    itk: {
      faux_semis: false,
      herse_etrille: false
    },
    poidsMoyenPanier: {
      petit: 200,
      moyen: 400,
      grand: 500
    },
    notes: 'Multi-coupes: 2-3 récoltes par cycle. Intervalles de semis: 14 jours'
  },
  
  {
    id: 'verdurette',
    nom: 'Verdurettes (Roquette/Tatsoi)',
    categorie: 'Feuille',
    methode: 'semis_direct',
    typeContenant: 'Six Row Seeder ou Jang',
    delaiIntercalaireRecommande: 1,
    delaiIntercalaireMin: 1,
    delaiIntercalaireMax: 2,
    
    // 🆕 V13 : Classification
    typeCycle: 'ROTATION_RAPIDE',
    
    densite: {
      rangs: 12,
      espacementRang: 1.5,
      espacementInterRang: 4,
      densiteSemis: 115
    },
    fenetres: {
      semis: { debut: 8, fin: 40 },
      recolte: { debut: 11, fin: 44 }
    },
    dureeOccupationPlanche: 35, // 5 semaines
    dureeRecolte: 14, // 2 semaines
    rotationsPossibles: 4, // 🛠️ V13 : 4 cycles possibles (pas 3)
    nombreCoupesParCycle: 2,
    
    rendement: {
      planche15m: 7,
      planche30m: 14,
      planche30mTotal: 28,
      parM2: 0.93,
      parM2Total: 1.86
    },
    prix: {
      unitaire: 18.30,
      caPotentielPlanche15m: 128,
      caPotentielPlanche30m: 256,
      caPotentielPlanche30mTotal: 512
    },
    besoins: {
      temperatureGermination: 20,
      joursAvantGermination: 5,
      protection: 'filet anti-insectes',
      irrigation: 'aspersion'
    },
    itk: {
      faux_semis: false,
      herse_etrille1: 10,
      herse_etrille2: 17
    },
    poidsMoyenPanier: {
      petit: 150,
      moyen: 200,
      grand: 300
    }
  },
  
  {
    id: 'carotte',
    nom: 'Carottes',
    categorie: 'Racine',
    methode: 'semis_direct',
    typeContenant: 'Jang',
    delaiIntercalaireRecommande: 1,
    delaiIntercalaireMin: 1,
    delaiIntercalaireMax: 2,
    
    // 🆕 V13 : Classification CORRIGÉE - C'est une rotation moyenne, pas longue durée !
    typeCycle: 'ROTATION_MOYENNE',
    
    densite: {
      rangs: 6,
      espacementRang: 2.5,
      espacementInterRang: 6.3,
      densiteSemis: 16
    },
    fenetres: {
      semis: { debut: 10, fin: 28 },
      recolte: { debut: 20, fin: 44 }
    },
    dureeOccupationPlanche: 90, // 13 semaines
    dureeRecolte: 21, // 3 semaines de récolte
    
    // 🛠️ V13 FIX MAJEUR : rotationsPossibles = 2 (pas 1 !)
    // Avec 13 semaines d'occupation + 1 sem repos = 14 sem/cycle
    // Sur 21 semaines de saison : 21/14 ≈ 1.5 cycles, arrondi à 2 avec échelonnement
    rotationsPossibles: 2,
    
    typeRecolte: 'bottes',
    rendement: {
      planche15m: 53,
      planche30m: 106,
      parM2: 3.5,
      poidsParBotte: 800
    },
    prix: {
      unitaire: 2.80,
      caPotentielPlanche15m: 147,
      caPotentielPlanche30m: 294
    },
    besoins: {
      temperatureGermination: 20,
      joursAvantGermination: 7,
      protection: 'aucune',
      irrigation: 'aspersion puis goutte-à-goutte'
    },
    itk: {
      faux_semis: -7,
      pyrodesherbage: 4,
      herse_etrille1: 10,
      bio_disque: 21,
      desherbage_manuel: 35
    },
    poidsMoyenPanier: {
      petit: 500,
      moyen: 800,
      grand: 1000
    }
  },
  
  {
    id: 'betterave',
    nom: 'Betteraves',
    categorie: 'Racine',
    methode: 'transplantation',
    typeContenant: '72',
    delaiIntercalaireRecommande: 2,
    delaiIntercalaireMin: 1,
    delaiIntercalaireMax: 3,
    
    // 🆕 V13 : Classification
    typeCycle: 'ROTATION_MOYENNE',
    
    densite: {
      rangs: 2,
      espacementRang: 45,
      espacementInterRang: 46,
      plantsParPlanche30m: 67
    },
    fenetres: {
      semis: { debut: 12, fin: 28 },
      transplantation: { debut: 16, fin: 32 },
      recolte: { debut: 24, fin: 44 }
    },
    dureeEnPepiniere: 30,
    dureeOccupationPlanche: 70, // 10 semaines
    dureeRecolte: 14, // 2 semaines
    rotationsPossibles: 2, // ✅ Correct
    typeRecolte: 'bottes',
    
    rendement: {
      planche15m: 44,
      planche30m: 88,
      parM2: 2.9,
      poidsParBotte: 600
    },
    prix: {
      unitaire: 3.00,
      caPotentielPlanche15m: 131,
      caPotentielPlanche30m: 262
    },
    besoins: {
      temperatureGermination: 30,
      joursAvantGermination: 7,
      protection: 'couvre-sol tissé',
      irrigation: 'goutte-à-goutte'
    },
    itk: {
      bio_disque: 12,
      binette: 20,
      bore_algues1: 20
    },
    poidsMoyenPanier: {
      petit: 600,
      moyen: 1000,
      grand: 1500
    }
  },
  
  {
    id: 'radis',
    nom: 'Radis',
    categorie: 'Racine',
    methode: 'semis_direct',
    typeContenant: 'Six Row Seeder ou Jang',
    delaiIntercalaireRecommande: 1,
    delaiIntercalaireMin: 1,
    delaiIntercalaireMax: 2,
    
    // 🆕 V13 : Classification
    typeCycle: 'ROTATION_RAPIDE',
    
    densite: {
      rangs: 12,
      espacementRang: 2,
      espacementInterRang: 5,
      densiteSemis: 95
    },
    fenetres: {
      semis: { debut: 8, fin: 36 },
      recolte: { debut: 12, fin: 40 }
    },
    dureeOccupationPlanche: 28, // 4 semaines
    dureeRecolte: 7, // 1 semaine
    rotationsPossibles: 5, // 🛠️ V13 : 5 cycles possibles (pas 3)
    typeRecolte: 'bottes',
    
    rendement: {
      planche15m: 70,
      planche30m: 140,
      parM2: 4.7,
      poidsParBotte: 300
    },
    prix: {
      unitaire: 2.10,
      caPotentielPlanche15m: 147,
      caPotentielPlanche30m: 294
    },
    besoins: {
      temperatureGermination: 25,
      joursAvantGermination: 3,
      protection: 'filet anti-insectes',
      irrigation: 'aspersion'
    },
    itk: {
      herse_etrille1: 10,
      herse_etrille2: 17
    },
    poidsMoyenPanier: {
      petit: 300,
      moyen: 600,
      grand: 900
    }
  },
  
  {
    id: 'basilic',
    nom: 'Basilic',
    categorie: 'Aromatique',
    methode: 'transplantation',
    typeContenant: '128',
    delaiIntercalaireRecommande: 2,
    delaiIntercalaireMin: 1,
    delaiIntercalaireMax: 3,
    
    // 🆕 V13 : Classification
    typeCycle: 'ROTATION_MOYENNE',
    
    densite: {
      rangs: 4,
      espacementRang: 30,
      espacementInterRang: 20,
      plantsParPlanche30m: 200
    },
    fenetres: {
      semis: { debut: 12, fin: 24 },
      transplantation: { debut: 16, fin: 28 },
      recolte: { debut: 20, fin: 38 }
    },
    dureeEnPepiniere: 30,
    dureeOccupationPlanche: 70, // 10 semaines
    dureeRecolte: 42, // 6 semaines
    rotationsPossibles: 2,
    
    rendement: {
      planche15m: 193,
      planche30m: 386,
      parM2: 12.9,
      poidsUnitaire: 50
    },
    prix: {
      unitaire: 2.00,
      caPotentielPlanche15m: 385,
      caPotentielPlanche30m: 770
    },
    besoins: {
      temperatureGermination: 25,
      joursAvantGermination: 7,
      protection: 'tunnel/serre',
      irrigation: 'goutte-à-goutte'
    },
    itk: {
      paillage: 21
    },
    poidsMoyenPanier: {
      petit: 50,
      moyen: 50,
      grand: 100
    }
  }
];

// Fonction utilitaire pour obtenir une culture par son ID
export const getCultureById = (id) => {
  return cultures.find(culture => culture.id === id);
};

// Fonction pour obtenir toutes les cultures par catégorie
export const getCulturesByCategorie = (categorie) => {
  return cultures.filter(culture => culture.categorie === categorie);
};

// Export des catégories disponibles
export const categories = [
  'Légume fruit',
  'Feuille',
  'Racine',
  'Aromatique'
];

// 🆕 V13 : Types de cycles pour le moteur de calcul
export const TYPES_CYCLES = {
  LONGUE_DUREE: 'LONGUE_DUREE',       // Tomates, aubergines, concombres - 1 rotation
  ROTATION_MOYENNE: 'ROTATION_MOYENNE', // Courgettes, carottes, betteraves - 2 rotations
  ROTATION_RAPIDE: 'ROTATION_RAPIDE'    // Radis, mesclun, verdurettes - 3+ rotations
};
