// Charte des tÃ¢ches - Source : Institut Jardinier MaraÃ®cher
// Nombre de jours aprÃ¨s implantation pour chaque tÃ¢che

export const tachesCultures = {
  tomate: {
    protection: 'serre',
    taches: [
      { nom: 'Paillage', jour: 21, description: 'Paillage plastique' },
      { nom: 'Pincer/tÃªtes', jour: 42, description: 'Pincer et couper tÃªtes' }
    ]
  },
  courgette: {
    protection: 'couvre-sol tissÃ© + filet',
    taches: []
  },
  concombre: {
    protection: 'serre',
    taches: [
      { nom: 'Paillage', jour: 21, description: 'Paillage plastique' }
    ]
  },
  aubergine: {
    protection: 'serre',
    taches: [
      { nom: 'Paillage', jour: 21, description: 'Paillage plastique' }
    ]
  },
  haricot: {
    protection: 'couvre-sol tissÃ©',
    taches: [
      { nom: 'Binette', jour: 14, description: 'Binage' },
      { nom: 'Paillage', jour: 49, description: 'Paillage' }
    ]
  },
  mesclun: {
    protection: 'couvre-sol tissÃ©',
    taches: []
  },
  verdurette: {
    protection: 'filet anti-insectes',
    taches: [
      { nom: 'Herse Ã©trille 1', jour: 10, description: 'Herse Ã©trille (peigne)' },
      { nom: 'Herse Ã©trille 2', jour: 17, description: 'Herse Ã©trille (peigne)' }
    ]
  },
  carotte: {
    protection: 'aucune',
    taches: [
      { nom: 'Faux semis', jour: -7, description: 'Faux semis avant implantation' },
      { nom: 'PyrodÃ©sherbeur', jour: 4, description: 'PyrodÃ©sherbeur' },
      { nom: 'Herse Ã©trille 1', jour: 10, description: 'Herse Ã©trille (peigne)' },
      { nom: 'Bio-disque', jour: 21, description: 'Bio-disque' },
      { nom: 'DÃ©sherbage manuel', jour: 35, description: 'DÃ©sherbage Ã  la main' }
    ]
  },
  betterave: {
    protection: 'couvre-sol tissÃ©',
    taches: [
      { nom: 'Bio-disque', jour: 12, description: 'Bio-disque' },
      { nom: 'Binette', jour: 20, description: 'Binage' },
      { nom: 'Bore/algues 1', jour: 20, description: 'Application bore/algues' }
    ]
  },
  radis: {
    protection: 'filet anti-insectes ou couverture flottante',
    taches: [
      { nom: 'Herse Ã©trille 1', jour: 10, description: 'Herse Ã©trille (peigne)' },
      { nom: 'Herse Ã©trille 2', jour: 17, description: 'Herse Ã©trille (peigne)' }
    ]
  },
  basilic: {
    protection: 'tunnel/serre',
    taches: [
      { nom: 'Paillage', jour: 21, description: 'Paillage' }
    ]
  }
};

// Couleurs par type de tÃ¢che (pour le calendrier)
export const couleursTaches = {
  'Faux semis': '#6366f1', // Indigo
  'PyrodÃ©sherbeur': '#f59e0b', // Amber
  'Herse Ã©trille 1': '#10b981', // Emerald
  'Herse Ã©trille 2': '#10b981',
  'Bio-disque': '#8b5cf6', // Violet
  'Binette': '#14b8a6', // Teal
  'DÃ©sherbage manuel': '#ef4444', // Red
  'Bore/algues 1': '#3b82f6', // Blue
  'Bore/algues 2': '#3b82f6',
  'Paillage': '#a855f7', // Purple
  'Pincer/tÃªtes': '#ec4899', // Pink
  'Tondre et bÃ¢cher': '#64748b' // Slate
};

// Fonction pour calculer les dates des tÃ¢ches
export const calculerDatesTaches = (culture, semaineImplantation) => {
  const taches = tachesCultures[culture.id];
  if (!taches || !taches.taches) return [];
  
  return taches.taches.map(tache => {
    const joursDepuisImplantation = tache.jour;
    const semainesTache = Math.floor(joursDepuisImplantation / 7);
    const semaine = semaineImplantation + semainesTache;
    
    return {
      ...tache,
      semaine: Math.max(1, Math.min(52, semaine)),
      couleur: couleursTaches[tache.nom] || '#gray-500'
    };
  });
};

// Types de protections
export const protections = {
  'serre': { icon: 'ðŸ¡', description: 'Serre froide/tunnel' },
  'couvre-sol tissÃ©': { icon: 'ðŸ§µ', description: 'Couvre-sol tissÃ©' },
  'couvre-sol tissÃ© + filet': { icon: 'ðŸ§µðŸ•¸ï¸', description: 'Couvre-sol + filet anti-insectes' },
  'filet anti-insectes': { icon: 'ðŸ•¸ï¸', description: 'Filet anti-insectes' },
  'filet anti-insectes ou couverture flottante': { icon: 'ðŸ•¸ï¸', description: 'Filet ou couverture flottante' },
  'tunnel/serre': { icon: 'ðŸ¡', description: 'Tunnel ou serre' },
  'aucune': { icon: 'ðŸŒ¤ï¸', description: 'Aucune protection' }
};
