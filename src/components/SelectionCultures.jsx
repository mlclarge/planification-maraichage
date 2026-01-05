// SelectionCultures.jsx V25 - FOURNITURES INTÉGRÉES
// 🆕 V25 : Section Fournitures & Intrants déplacée depuis Simulateur
// 🆕 V24 : Intercalage réel - cultures rapides sur planches cultures longues
// 🔧 V24 : Fix menus déroulants - calcul dispo correct, plus de blocages
// 📱 V22 : Optimisations mobile

import React, { useState, useEffect, useMemo } from 'react';
import { cultures as catalogueCultures } from '../data/cultures';
import { Plus, X, AlertTriangle, Settings, ChevronDown, AlertCircle, CheckCircle, TrendingUp, MapPin, Layers, Info, DollarSign, Link, Package, Sprout, Leaf, Shield, Bug } from 'lucide-react';
import { calculerBesoinHebdo } from '../data/compositionsPaniers';
import { genererPlanComplet, validerPlan, calculerRepartitionOptimale, classifierCulture } from '../utils/calculPlanchesSimultanees';
import { calculerEconomieIntercalage } from '../utils/calculScenarios';
import { NIVEAUX_MATURITE } from '../utils/constantes';

// ═══════════════════════════════════════════════════════════════════════════
// 🆕 V25 : DONNÉES FOURNITURES (déplacé depuis SimulateurScenarios)
// ═══════════════════════════════════════════════════════════════════════════

const PRIX_FOURNITURES = {
  semences: { prixGraine: 0.01, prixPlant: 0.35, prixPlateau128: 3.50, prixPlateau72: 4.00, prixSubstrat: 0.50 },
  fertilisation: { compost: 0.20, amendement: 0.05, engraisFoliaire: 0.02 },
  protection: { bachePlastique: 12, toileTissee: 15, voileP17: 8, filetInsectes: 20 },
  biotraitement: { bt: 0.50, soufreCuivre: 0.30, purins: 0.10 }
};

const BESOINS_PROTECTION = {
  tomate: { bachePlastique: true, toileTissee: true },
  aubergine: { toileTissee: true },
  courgette: { toileTissee: true, filetInsectes: true },
  concombre: { bachePlastique: true },
  poivron: { toileTissee: true },
  haricot: { toileTissee: true },
  mesclun: { voileP17: true, toileTissee: true },
  radis: { voileP17: true, filetInsectes: true },
  carotte: { voileP17: true, filetInsectes: true },
  betterave: { toileTissee: true },
  basilic: { toileTissee: true },
  verdurette: { voileP17: true }
};

const BESOINS_BIOTRAITEMENT = {
  tomate: { soufreCuivre: true, purins: true },
  aubergine: { bt: true, purins: true },
  courgette: { soufreCuivre: true, purins: true },
  concombre: { soufreCuivre: true },
  poivron: { bt: true },
  haricot: { purins: true },
  mesclun: { purins: true },
  radis: { bt: true },
  carotte: { purins: true },
  betterave: { purins: true },
  basilic: { soufreCuivre: true }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🆕 V24 : CONFIGURATION INTERCALAGE
// ═══════════════════════════════════════════════════════════════════════════

// Cultures pouvant être intercalées (cycle court, petit gabarit)
const CULTURES_INTERCALABLES = ['radis', 'mesclun', 'verdurette', 'epinard'];

// Cultures hôtes (cycle long, peuvent accueillir des intercalaires)
const CULTURES_HOTES = ['tomate', 'aubergine', 'concombre', 'poivron'];

// Fenêtres temporelles d'intercalage (en semaines)
const FENETRES_INTERCALAGE = {
  avant: { debut: 10, fin: 17 },  // Avant plantation des cultures longues
  apres: { debut: 38, fin: 44 }   // Après arrachage des cultures longues
};

const SelectionCultures = ({ 
  culturesSelectionnees, 
  setCulturesSelectionnees, 
  jardins, 
  marche, 
  onChangeTab,
  niveauMaturite = 'debutant',
  longueurPlanche = 15
}) => {
  const [delaiIntercalaire, setDelaiIntercalaire] = useState(1);
  const [modalRepartition, setModalRepartition] = useState({ open: false, cultureId: null });
  const [repartitionTemp, setRepartitionTemp] = useState({});
  const [accordeonsCultures, setAccordeonsCultures] = useState({});
  
  // 📱 Détection mobile
  const [isMobile, setIsMobile] = useState(false);
  const [sectionSelectionOuverte, setSectionSelectionOuverte] = useState(true);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) setSectionSelectionOuverte(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 V24 : HELPERS INTERCALAGE
  // ═══════════════════════════════════════════════════════════════════════

  // Vérifier si une culture peut être intercalée
  const estIntercalable = (cultureId) => {
    return CULTURES_INTERCALABLES.includes(cultureId);
  };

  // Vérifier si une culture peut accueillir des intercalaires
  const estCultureHote = (cultureId) => {
    return CULTURES_HOTES.includes(cultureId);
  };

  // Obtenir les cultures hôtes disponibles (assignées à un jardin)
  const culturesHotesDisponibles = useMemo(() => {
    return culturesSelectionnees.filter(c => 
      estCultureHote(c.id) && 
      (c.jardinId || (c.repartition && Object.keys(c.repartition).length > 0))
    );
  }, [culturesSelectionnees]);

  // Calculer combien de planches intercalaires une culture hôte peut accueillir
  // Chaque planche hôte peut accueillir 2 cycles de cultures rapides (avant + après)
  const capaciteIntercalage = (cultureHote) => {
    // Facteur 2 : fenêtre avant plantation + fenêtre après arrachage
    return (cultureHote.totalPlanches || 0) * 2;
  };

  // Calculer les planches intercalées déjà utilisées sur une culture hôte
  const planchesIntercaleesUtilisees = (cultureHoteId) => {
    return culturesSelectionnees
      .filter(c => c.intercaleAvec === cultureHoteId)
      .reduce((sum, c) => sum + (c.totalPlanches || 0), 0);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RECALCUL AUTOMATIQUE QUAND NIVEAU OU LONGUEUR CHANGE
  // ═══════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    if (culturesSelectionnees.length === 0) return;
    
    console.log(`🔄 V24 Recalcul avec niveau ${niveauMaturite} et planches ${longueurPlanche}m`);
    
    const culturesRecalculees = culturesSelectionnees.map(c => {
      const cultureBase = catalogueCultures.find(cb => cb.id === c.id);
      if (!cultureBase) return c;
      
      try {
        const plan = genererPlanComplet(
          cultureBase, 
          marche, 
          calculerBesoinHebdo, 
          c.delaiIntercalaire || cultureBase.delaiIntercalaireRecommande || 1,
          { niveauMaturite, longueurPlanche, planchesDisponibles: null }
        );
        
        const validation = validerPlan(plan, jardins);
        
        return {
          ...c,
          planComplet: plan,
          validation,
          planchesRecommandees: plan.calcul.planchesPhysiques,
          series: plan.series.map(s => ({
            id: s.id,
            planchesUtilisees: s.planchesUtilisees,
            plancheId: s.plancheId,
            semaineDebut: s.semaineRecolteDebut,
            semaineFin: s.semaineRecolteFin,
            semaineRecolteDebut: s.semaineRecolteDebut,
            semaineRecolteFin: s.semaineRecolteFin,
            semaineSemis: s.semaineSemis,
            semainePlantation: s.semainePlantation,
            duree: s.dureeOccupation
          })),
          totalPlanches: plan.calcul.planchesPhysiques
        };
      } catch (error) {
        console.error(`Erreur recalcul ${c.nom}:`, error);
        return c;
      }
    });
    
    setCulturesSelectionnees(culturesRecalculees);
  }, [niveauMaturite, longueurPlanche]);

  // ═══════════════════════════════════════════════════════════════════════
  // 🔧 V24 : CALCULS DE CAPACITÉ - CORRIGÉS AVEC LONGUEUR PLANCHES
  // ═══════════════════════════════════════════════════════════════════════

  // Capacité totale en équivalent planches 15m
  // Une planche 30m = 2 planches 15m en terme de production
  const capaciteTotale = useMemo(() => {
    return jardins.reduce((sum, j) => {
      const facteur = (j.longueurPlanche || 15) / 15;
      return sum + (j.nombrePlanches * facteur);
    }, 0);
  }, [jardins]);

  // Capacité brute (nombre de planches physiques sans conversion)
  const capacitePlanchesPhysiques = useMemo(() => {
    return jardins.reduce((sum, j) => sum + j.nombrePlanches, 0);
  }, [jardins]);

  // Planches brutes (total demandé sans intercalage)
  const planchesBrutes = useMemo(() => {
    return culturesSelectionnees.reduce((sum, c) => sum + (c.totalPlanches || 0), 0);
  }, [culturesSelectionnees]);

  // 🆕 V24 : Planches intercalées (ne comptent pas dans l'occupation physique)
  const planchesIntercalees = useMemo(() => {
    return culturesSelectionnees
      .filter(c => c.intercaleAvec)
      .reduce((sum, c) => sum + (c.totalPlanches || 0), 0);
  }, [culturesSelectionnees]);

  // 🆕 V24 : Planches physiques réelles = brutes - intercalées
  const planchesPhysiquesNecessaires = useMemo(() => {
    return planchesBrutes - planchesIntercalees;
  }, [planchesBrutes, planchesIntercalees]);

  // Calcul de l'économie d'intercalage (pour affichage)
  const intercalage = useMemo(() => {
    if (culturesSelectionnees.length === 0) return { planchesEconomisees: 0, details: [] };
    
    const resultatsParCulture = {};
    culturesSelectionnees.forEach(c => {
      resultatsParCulture[c.id] = { planches: c.totalPlanches || 0 };
    });
    
    try {
      const result = calculerEconomieIntercalage(resultatsParCulture);
      return {
        ...result,
        // V24: L'économie réelle est le nombre de planches intercalées
        planchesEconomiseesReelles: planchesIntercalees
      };
    } catch (error) {
      console.error('Erreur calcul intercalage:', error);
      return { planchesEconomisees: 0, planchesEconomiseesReelles: planchesIntercalees, details: [] };
    }
  }, [culturesSelectionnees, planchesIntercalees]);

  // 🔧 V24 : Planches assignées aux jardins (hors intercalées)
  const planchesAssigneesJardins = useMemo(() => {
    return culturesSelectionnees.reduce((sum, c) => {
      // Les cultures intercalées ne comptent pas dans l'assignation jardin
      if (c.intercaleAvec) return sum;
      
      if (c.repartition) {
        return sum + Object.values(c.repartition).reduce((s, v) => s + v, 0);
      }
      if (c.jardinId) {
        return sum + (c.totalPlanches || 0);
      }
      return sum;
    }, 0);
  }, [culturesSelectionnees]);

  // 🔧 V24 : Disponibilité par jardin - AVEC LONGUEUR PLANCHES
  // Les cultures sont calculées en équivalent 15m
  // Un jardin 30m offre 2× plus de capacité par planche
  const disponibiliteParJardin = useMemo(() => {
    const dispo = {};
    
    // Initialiser avec capacité de chaque jardin (en équivalent 15m)
    jardins.forEach(j => {
      const facteur = (j.longueurPlanche || 15) / 15;
      dispo[j.id] = j.nombrePlanches * facteur;
    });
    
    // Soustraire les cultures assignées (SAUF les intercalées)
    // Les cultures sont toujours comptées en équivalent 15m
    culturesSelectionnees.forEach(c => {
      // Les cultures intercalées ne prennent pas de place dans les jardins
      if (c.intercaleAvec) return;
      
      if (c.repartition) {
        Object.entries(c.repartition).forEach(([jId, nb]) => {
          dispo[parseInt(jId)] = (dispo[parseInt(jId)] || 0) - nb;
        });
      } else if (c.jardinId) {
        dispo[c.jardinId] = (dispo[c.jardinId] || 0) - (c.totalPlanches || 0);
      }
    });
    
    console.log('📊 V24 Dispo par jardin (équiv. 15m):', dispo);
    return dispo;
  }, [jardins, culturesSelectionnees]);

  // Vérifier si toutes les cultures sont assignées
  const toutesAssignees = useMemo(() => {
    return culturesSelectionnees.every(c => 
      c.jardinId || 
      (c.repartition && Object.keys(c.repartition).length > 0) ||
      c.intercaleAvec  // 🆕 V24: intercalée = assignée
    );
  }, [culturesSelectionnees]);

  // Cultures non assignées
  const culturesNonAssignees = useMemo(() => {
    return culturesSelectionnees.filter(c => 
      !c.jardinId && 
      (!c.repartition || Object.keys(c.repartition).length === 0) &&
      !c.intercaleAvec
    );
  }, [culturesSelectionnees]);

  const planchesDisponibles = capaciteTotale - planchesAssigneesJardins;

  // ═══════════════════════════════════════════════════════════════════════
  // GESTION DES ACCORDÉONS
  // ═══════════════════════════════════════════════════════════════════════

  const toggleCultureSection = (cultureId, section) => {
    setAccordeonsCultures(prev => ({
      ...prev,
      [cultureId]: {
        ...prev[cultureId],
        [section]: !prev[cultureId]?.[section]
      }
    }));
  };

  const isCultureSectionOpen = (cultureId, section, defaultOpen = true) => {
    return accordeonsCultures[cultureId]?.[section] ?? defaultOpen;
  };

  // ═══════════════════════════════════════════════════════════════════════
  // GESTION DES CULTURES
  // ═══════════════════════════════════════════════════════════════════════

  const ajouterCulture = (cultureId) => {
    const culture = catalogueCultures.find(c => c.id === cultureId);
    if (!culture || culturesSelectionnees.some(c => c.id === cultureId)) return;
    
    console.log(`📊 Plan généré pour ${culture.nom} | Niveau: ${niveauMaturite} | Délai: ${culture.delaiIntercalaireRecommande || 2}sem | Planches: ${longueurPlanche}m`);
    
    try {
      const plan = genererPlanComplet(
        culture, 
        marche, 
        calculerBesoinHebdo, 
        culture.delaiIntercalaireRecommande || 2,
        { niveauMaturite, longueurPlanche, planchesDisponibles: null }
      );
      
      const validation = validerPlan(plan, jardins);
      
      const nouvelleCulture = {
        id: culture.id,
        nom: culture.nom,
        categorie: culture.categorie,
        typeRecolte: culture.typeRecolte || 'poids',
        delaiIntercalaire: culture.delaiIntercalaireRecommande || 2,
        delaiIntercalaireRecommande: culture.delaiIntercalaireRecommande || 2,
        planComplet: plan,
        validation,
        planchesRecommandees: plan.calcul.planchesPhysiques,
        series: plan.series.map(s => ({
          id: s.id,
          planchesUtilisees: s.planchesUtilisees,
          plancheId: s.plancheId,
          semaineDebut: s.semaineRecolteDebut,
          semaineFin: s.semaineRecolteFin,
          semaineRecolteDebut: s.semaineRecolteDebut,
          semaineRecolteFin: s.semaineRecolteFin,
          semaineSemis: s.semaineSemis,
          semainePlantation: s.semainePlantation,
          duree: s.dureeOccupation
        })),
        totalPlanches: plan.calcul.planchesPhysiques,
        jardinId: null,
        repartition: null,
        intercaleAvec: null  // 🆕 V24
      };
      
      setCulturesSelectionnees([...culturesSelectionnees, nouvelleCulture]);
    } catch (error) {
      console.error(`Erreur création plan ${culture.nom}:`, error);
    }
  };

  const supprimerCulture = (cultureId) => {
    setCulturesSelectionnees(culturesSelectionnees.filter(c => c.id !== cultureId));
  };

  // 🔧 V24 : Assigner à un jardin - CORRIGÉ
  const assignerJardin = (cultureId, jardinId) => {
    console.log(`🏡 V24 Assignation: ${cultureId} → jardin ${jardinId}`);
    setCulturesSelectionnees(prev => prev.map(c =>
      c.id === cultureId
        ? { ...c, jardinId: jardinId ? parseInt(jardinId) : null, repartition: null, intercaleAvec: null }
        : c
    ));
  };

  // 🆕 V24 : Intercaler avec une culture hôte
  const intercalerAvec = (cultureId, cultureHoteId) => {
    console.log(`🔗 V24 Intercalage: ${cultureId} → sur ${cultureHoteId}`);
    setCulturesSelectionnees(prev => prev.map(c =>
      c.id === cultureId
        ? { ...c, intercaleAvec: cultureHoteId || null, jardinId: null, repartition: null }
        : c
    ));
  };

  // Modal répartition
  const ouvrirModalRepartition = (cultureId) => {
    const culture = culturesSelectionnees.find(c => c.id === cultureId);
    const repartitionInitiale = culture?.repartition || {};
    setRepartitionTemp(repartitionInitiale);
    setModalRepartition({ open: true, cultureId });
  };

  const fermerModalRepartition = () => {
    setModalRepartition({ open: false, cultureId: null });
    setRepartitionTemp({});
  };

  const validerRepartition = () => {
    const { cultureId } = modalRepartition;
    setCulturesSelectionnees(prev => prev.map(c =>
      c.id === cultureId
        ? { ...c, repartition: { ...repartitionTemp }, jardinId: null, intercaleAvec: null }
        : c
    ));
    fermerModalRepartition();
  };

  // Recalculer avec nouveau délai
  const recalculerCultureAvecDelai = (cultureId, nouveauDelai) => {
    const culture = culturesSelectionnees.find(c => c.id === cultureId);
    if (!culture) return;
    
    const cultureBase = catalogueCultures.find(cb => cb.id === cultureId);
    if (!cultureBase) return;
    
    try {
      const plan = genererPlanComplet(
        cultureBase, marche, calculerBesoinHebdo, nouveauDelai,
        { niveauMaturite, longueurPlanche, planchesDisponibles: null }
      );
      
      const validation = validerPlan(plan, jardins);
      
      setCulturesSelectionnees(prev => prev.map(c => {
        if (c.id === cultureId) {
          return {
            ...c,
            delaiIntercalaire: nouveauDelai,
            planComplet: plan,
            validation,
            planchesRecommandees: plan.calcul.planchesPhysiques,
            series: plan.series.map(s => ({
              id: s.id,
              planchesUtilisees: s.planchesUtilisees,
              plancheId: s.plancheId,
              semaineDebut: s.semaineRecolteDebut,
              semaineFin: s.semaineRecolteFin,
              semaineRecolteDebut: s.semaineRecolteDebut,
              semaineRecolteFin: s.semaineRecolteFin,
              semaineSemis: s.semaineSemis,
              semainePlantation: s.semainePlantation,
              duree: s.dureeOccupation
            })),
            totalPlanches: plan.calcul.planchesPhysiques
          };
        }
        return c;
      }));
    } catch (error) {
      console.error(`Erreur recalcul avec délai ${nouveauDelai}:`, error);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // DONNÉES DÉRIVÉES
  // ═══════════════════════════════════════════════════════════════════════

  const culturesNonSelectionnees = catalogueCultures.filter(c => 
    !culturesSelectionnees.some(cs => cs.id === c.id)
  );

  const categoriesDisponibles = [...new Set(culturesNonSelectionnees.map(c => c.categorie))];

  // ═══════════════════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête avec résumé capacité */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 sm:p-4 border border-green-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Sélection des Cultures</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {culturesSelectionnees.length} culture(s) • Niveau: <strong>{NIVEAUX_MATURITE[niveauMaturite]?.label || niveauMaturite}</strong>
            </p>
          </div>
          
          {/* 🆕 V24 : Jauge capacité améliorée avec longueur planches */}
          <div className="bg-white rounded-lg p-3 shadow-sm min-w-[280px]">
            {/* Planches physiques nécessaires vs capacité */}
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Planches nécessaires</span>
              <span className={`font-bold ${
                planchesPhysiquesNecessaires > capaciteTotale ? 'text-red-600' : 'text-green-600'
              }`}>
                {planchesPhysiquesNecessaires} / {Math.round(capaciteTotale)} éq.15m
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full transition-all ${
                  planchesPhysiquesNecessaires > capaciteTotale ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (planchesPhysiquesNecessaires / capaciteTotale) * 100)}%` }}
              />
            </div>
            
            {/* Info capacité avec longueurs */}
            <div className="text-xs text-gray-500 mb-2">
              💡 {capacitePlanchesPhysiques} planches physiques = {Math.round(capaciteTotale)} équiv. 15m 
              {jardins.some(j => j.longueurPlanche === 30) && ' (serre 30m = ×2)'}
            </div>
            
            {/* Détail intercalage */}
            {planchesIntercalees > 0 && (
              <div className="bg-green-50 rounded p-2 mb-2">
                <div className="flex items-center text-xs text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  <span className="font-medium">
                    {planchesIntercalees} pl. intercalées = {planchesIntercalees} économisées
                  </span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {planchesBrutes} brut − {planchesIntercalees} intercalées = {planchesPhysiquesNecessaires} nécessaires
                </div>
              </div>
            )}
            
            {/* Assignation aux jardins */}
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Assignées aux jardins</span>
              <span className={`font-medium ${
                planchesAssigneesJardins === planchesPhysiquesNecessaires ? 'text-green-600' : 'text-orange-600'
              }`}>
                {planchesAssigneesJardins} / {planchesPhysiquesNecessaires}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
              <div 
                className={`h-1.5 rounded-full transition-all ${
                  planchesAssigneesJardins === planchesPhysiquesNecessaires ? 'bg-green-400' : 'bg-orange-400'
                }`}
                style={{ width: `${planchesPhysiquesNecessaires > 0 ? Math.min(100, (planchesAssigneesJardins / planchesPhysiquesNecessaires) * 100) : 0}%` }}
              />
            </div>
            
            {/* Statut */}
            {toutesAssignees && (
              <div className="text-xs text-green-600 flex items-center font-medium">
                <CheckCircle className="w-3 h-3 mr-1" />
                Toutes les cultures sont assignées !
              </div>
            )}
            {!toutesAssignees && culturesNonAssignees.length > 0 && (
              <div className="text-xs text-orange-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {culturesNonAssignees.length} culture(s) non assignée(s)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section ajout culture */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <button
          onClick={() => setSectionSelectionOuverte(!sectionSelectionOuverte)}
          className="w-full p-3 sm:p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center">
            <Plus className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-semibold text-gray-800">Ajouter une culture</span>
            <span className="ml-2 text-sm text-gray-500">({culturesNonSelectionnees.length} disponibles)</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${sectionSelectionOuverte ? 'rotate-180' : ''}`} />
        </button>
        
        {sectionSelectionOuverte && (
          <div className="p-3 sm:p-4 border-t">
            {categoriesDisponibles.length > 0 ? (
              <div className="space-y-3">
                {categoriesDisponibles.map(categorie => (
                  <div key={categorie}>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{categorie}</h4>
                    <div className="flex flex-wrap gap-2">
                      {culturesNonSelectionnees
                        .filter(c => c.categorie === categorie)
                        .map(culture => (
                          <button
                            key={culture.id}
                            onClick={() => ajouterCulture(culture.id)}
                            className="px-3 py-1.5 bg-white border rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-sm flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1 text-green-600" />
                            {culture.nom}
                            {estIntercalable(culture.id) && (
                              <span className="ml-1 text-xs text-green-600">⚡</span>
                            )}
                            {estCultureHote(culture.id) && (
                              <span className="ml-1 text-xs text-purple-600">🏠</span>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Toutes les cultures ont été ajoutées</p>
            )}
          </div>
        )}
      </div>

      {/* Liste des cultures sélectionnées */}
      <div className="space-y-3">
        {culturesSelectionnees.map(culture => {
          const cultureBase = catalogueCultures.find(c => c.id === culture.id);
          const classification = classifierCulture(culture.id);
          const coefficient = NIVEAUX_MATURITE[niveauMaturite]?.coefficient || 0.70;
          const rendement = cultureBase?.rendement?.[`planche${longueurPlanche}m`] || 100;
          const productionEstimee = culture.planComplet?.resume?.productionEstimee || (culture.totalPlanches * rendement * coefficient);
          const prixUnitaire = cultureBase?.prix?.unitaire || 3.00;
          const caEstime = productionEstimee * prixUnitaire;
          
          // 🆕 V24 : Déterminer le mode d'affectation
          const peutEtreIntercalee = estIntercalable(culture.id);
          const estIntercalee = culture.intercaleAvec !== null;
          const cultureHoteAssociee = estIntercalee 
            ? culturesSelectionnees.find(c => c.id === culture.intercaleAvec)
            : null;
          
          return (
            <div 
              key={culture.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                culture.validation?.valide === false ? 'border-red-300' : 
                estIntercalee ? 'border-green-300 bg-green-50/30' : ''
              }`}
            >
              {/* En-tête culture */}
              <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                      culture.categorie === 'Fruits' ? 'bg-red-500' :
                      culture.categorie === 'Feuilles' ? 'bg-green-500' :
                      culture.categorie === 'Racines' ? 'bg-orange-500' :
                      culture.categorie === 'Aromatiques' ? 'bg-purple-500' : 'bg-blue-500'
                    }`}>
                      {culture.nom.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">{culture.nom}</h3>
                        {/* Badge statut */}
                        {estIntercalee ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded flex items-center">
                            <Link className="w-3 h-3 mr-1" />
                            Intercalée
                          </span>
                        ) : culture.jardinId || (culture.repartition && Object.keys(culture.repartition).length > 0) ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Assignée
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Non assignée
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className={`px-1.5 py-0.5 rounded ${
                          classification?.typeCycle === 'LONGUE_DUREE' ? 'bg-purple-100 text-purple-700' :
                          classification?.typeCycle === 'ROTATION_RAPIDE' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {classification?.typeCycle === 'LONGUE_DUREE' ? '🏠 Long' :
                           classification?.typeCycle === 'ROTATION_RAPIDE' ? '⚡ Rapide' : '🔄 Moyen'}
                        </span>
                        <span>{classification?.rotations || 1} rot/saison</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-sm">
                      <div className={`px-2 py-1 rounded font-medium ${
                        estIntercalee ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {culture.totalPlanches} pl.
                        {estIntercalee && <span className="text-xs ml-1">(intercalée)</span>}
                      </div>
                      <div className="px-2 py-1 bg-green-100 rounded text-green-700 font-medium">
                        {Math.round(productionEstimee)} {culture.typeRecolte === 'bottes' ? 'bt' : 'kg'}
                      </div>
                      <div className="px-2 py-1 bg-orange-100 rounded text-orange-700 font-medium">
                        {Math.round(caEstime)} €
                      </div>
                    </div>
                    
                    <button
                      onClick={() => supprimerCulture(culture.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 🆕 V24 : Section Affectation - NOUVELLE UI */}
              <div className="border-t">
                <button
                  onClick={() => toggleCultureSection(culture.id, 'affectation')}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    Affectation
                    {culture.jardinId && (
                      <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                        {jardins.find(j => j.id === culture.jardinId)?.nom}
                      </span>
                    )}
                    {estIntercalee && (
                      <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                        Sur {cultureHoteAssociee?.nom}
                      </span>
                    )}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                    isCultureSectionOpen(culture.id, 'affectation') ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {isCultureSectionOpen(culture.id, 'affectation') && (
                  <div className="px-4 pb-4 space-y-3">
                    
                    {/* Option 1 : Jardin dédié */}
                    <div className={`p-3 rounded-lg border-2 transition-colors ${
                      !estIntercalee ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <label className="flex items-center mb-2">
                        <input
                          type="radio"
                          name={`affectation-${culture.id}`}
                          checked={!estIntercalee}
                          onChange={() => intercalerAvec(culture.id, null)}
                          className="mr-2"
                        />
                        <span className="font-medium text-sm">Jardin dédié</span>
                      </label>
                      
                      {!estIntercalee && (
                        <div className="flex flex-wrap gap-2 ml-5">
                          <select
                            value={culture.jardinId || ''}
                            onChange={(e) => assignerJardin(culture.id, e.target.value)}
                            className="flex-1 min-w-[150px] px-3 py-2 border rounded-lg text-sm bg-white"
                          >
                            <option value="">-- Choisir un jardin --</option>
                            {jardins.map(j => {
                              // 🔧 V24 : Calcul dispo CORRECT avec longueur planches
                              const facteur = (j.longueurPlanche || 15) / 15;
                              let dispoReelle = disponibiliteParJardin[j.id] || 0;
                              
                              // Si cette culture est déjà dans ce jardin, rajouter ses planches
                              if (culture.jardinId === j.id) {
                                dispoReelle += culture.totalPlanches || 0;
                              }
                              
                              const peutAccueillir = dispoReelle >= culture.totalPlanches;
                              const estSerre = j.longueurPlanche === 30;
                              
                              return (
                                <option key={j.id} value={j.id}>
                                  {j.nom} {estSerre ? '(30m)' : ''} [{Math.round(dispoReelle)} éq.15m dispo] {peutAccueillir ? '✓' : '⚠️'}
                                </option>
                              );
                            })}
                          </select>
                          
                          <button
                            onClick={() => ouvrirModalRepartition(culture.id)}
                            className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm flex items-center"
                          >
                            <Layers className="w-4 h-4 mr-1" />
                            Multi-jardins
                          </button>
                        </div>
                      )}
                      
                      {culture.repartition && Object.keys(culture.repartition).length > 0 && !estIntercalee && (
                        <div className="mt-2 ml-5 bg-purple-50 p-2 rounded-lg">
                          <p className="text-xs font-medium text-purple-700 mb-1">Répartition :</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(culture.repartition).map(([jId, nb]) => {
                              const jardin = jardins.find(j => j.id === parseInt(jId));
                              return nb > 0 ? (
                                <span key={jId} className="text-xs bg-white px-2 py-1 rounded">
                                  {jardin?.nom}: {nb} pl.
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Option 2 : Intercaler (uniquement pour cultures rapides) */}
                    {peutEtreIntercalee && (
                      <div className={`p-3 rounded-lg border-2 transition-colors ${
                        estIntercalee ? 'border-green-300 bg-green-50/50' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <label className="flex items-center mb-2">
                          <input
                            type="radio"
                            name={`affectation-${culture.id}`}
                            checked={estIntercalee}
                            onChange={() => {}}
                            className="mr-2"
                          />
                          <span className="font-medium text-sm flex items-center">
                            <Link className="w-4 h-4 mr-1 text-green-600" />
                            Intercaler avec culture longue
                            <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              Économise {culture.totalPlanches} pl.
                            </span>
                          </span>
                        </label>
                        
                        {/* Explication pédagogique */}
                        <div className="ml-5 mb-2 p-2 bg-green-100 rounded text-xs text-green-800">
                          <p className="font-medium mb-1">💡 Pourquoi intercaler ?</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            <li><strong>Compatibilité physiologique</strong> : {culture.nom} (petit gabarit) peut pousser sur les planches des cultures longues</li>
                            <li><strong>Compatibilité cyclique</strong> : cycle court ({classification?.rotations || 3}+ rotations) avant/après les tomates, aubergines...</li>
                            <li><strong>Fenêtre temporelle</strong> : sem. {FENETRES_INTERCALAGE.avant.debut}-{FENETRES_INTERCALAGE.avant.fin} (avant) et sem. {FENETRES_INTERCALAGE.apres.debut}-{FENETRES_INTERCALAGE.apres.fin} (après)</li>
                          </ul>
                        </div>
                        
                        {culturesHotesDisponibles.length > 0 ? (
                          <div className="ml-5">
                            <select
                              value={culture.intercaleAvec || ''}
                              onChange={(e) => intercalerAvec(culture.id, e.target.value || null)}
                              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                            >
                              <option value="">-- Choisir une culture hôte --</option>
                              {culturesHotesDisponibles.map(hote => {
                                const capacite = capaciteIntercalage(hote);
                                const utilise = planchesIntercaleesUtilisees(hote.id);
                                const restant = capacite - utilise + (culture.intercaleAvec === hote.id ? culture.totalPlanches : 0);
                                const jardinHote = jardins.find(j => j.id === hote.jardinId);
                                
                                return (
                                  <option 
                                    key={hote.id} 
                                    value={hote.id}
                                    disabled={restant < culture.totalPlanches && culture.intercaleAvec !== hote.id}
                                  >
                                    {hote.nom} ({hote.totalPlanches} pl. - {jardinHote?.nom || 'non assigné'}) 
                                    [{restant} pl. dispo pour intercalage]
                                    {restant >= culture.totalPlanches ? ' ✓' : ' ⚠️'}
                                  </option>
                                );
                              })}
                            </select>
                            
                            {estIntercalee && cultureHoteAssociee && (
                              <div className="mt-2 p-2 bg-green-100 rounded-lg">
                                <p className="text-xs text-green-800">
                                  <CheckCircle className="w-3 h-3 inline mr-1" />
                                  <strong>{culture.totalPlanches} planches de {culture.nom}</strong> intercalées sur les <strong>{cultureHoteAssociee.totalPlanches} planches de {cultureHoteAssociee.nom}</strong>
                                  {cultureHoteAssociee.jardinId && (
                                    <span> ({jardins.find(j => j.id === cultureHoteAssociee.jardinId)?.nom})</span>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="ml-5 p-2 bg-orange-100 rounded text-xs text-orange-700">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            Aucune culture hôte (tomate, aubergine, concombre, poivron) n'est encore assignée à un jardin.
                            Assignez d'abord une culture longue pour pouvoir intercaler.
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Message si culture non intercalable */}
                    {!peutEtreIntercalee && estCultureHote(culture.id) && (
                      <div className="p-2 bg-purple-50 rounded-lg text-xs text-purple-700">
                        <Info className="w-3 h-3 inline mr-1" />
                        <strong>Culture hôte</strong> : d'autres cultures (radis, mesclun...) pourront être intercalées sur ces planches.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Autres sections (économie, paramètres, etc.) - repliées par défaut */}
              <div className="border-t">
                <button
                  onClick={() => toggleCultureSection(culture.id, 'economie')}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-orange-500" />
                    Indicateurs Économiques
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                    isCultureSectionOpen(culture.id, 'economie', false) ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {isCultureSectionOpen(culture.id, 'economie', false) && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500 text-xs">Production</span>
                        <p className="font-medium">{Math.round(productionEstimee)} {culture.typeRecolte === 'bottes' ? 'bottes' : 'kg'}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500 text-xs">CA Estimé</span>
                        <p className="font-medium text-green-600">{Math.round(caEstime)} €</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500 text-xs">Prix unitaire</span>
                        <p className="font-medium">{prixUnitaire.toFixed(2)} €/{culture.typeRecolte === 'bottes' ? 'botte' : 'kg'}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500 text-xs">CA/planche</span>
                        <p className="font-medium">{culture.totalPlanches > 0 ? Math.round(caEstime / culture.totalPlanches) : 0} €</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Paramètres de planification */}
              <div className="border-t">
                <button
                  onClick={() => toggleCultureSection(culture.id, 'parametres')}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium flex items-center text-sm">
                    <Settings className="w-4 h-4 mr-2 text-gray-500" />
                    Paramètres de Planification
                    <span className="ml-2 text-xs text-gray-400">(délai: {culture.delaiIntercalaire || 1} sem)</span>
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                    isCultureSectionOpen(culture.id, 'parametres', false) ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {isCultureSectionOpen(culture.id, 'parametres', false) && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Délai entre séries :</label>
                      <select
                        value={culture.delaiIntercalaire || 1}
                        onChange={(e) => recalculerCultureAvecDelai(culture.id, parseInt(e.target.value))}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value={1}>1 semaine</option>
                        <option value={2}>2 semaines</option>
                        <option value={3}>3 semaines</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Temps de repos entre la fin d'une série et le début de la suivante sur une même planche.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucune culture */}
      {culturesSelectionnees.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Plus className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Aucune culture sélectionnée</h3>
          <p className="text-gray-500">Commencez par ajouter des cultures depuis la liste ci-dessus.</p>
        </div>
      )}

      {/* Modal répartition multi-jardins */}
      {modalRepartition.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-bold text-lg">Répartition multi-jardins</h3>
              <p className="text-sm text-gray-500">
                {culturesSelectionnees.find(c => c.id === modalRepartition.cultureId)?.nom} - 
                {culturesSelectionnees.find(c => c.id === modalRepartition.cultureId)?.totalPlanches} planches à répartir
              </p>
            </div>
            
            <div className="p-4 space-y-3">
              {jardins.map(jardin => {
                const culture = culturesSelectionnees.find(c => c.id === modalRepartition.cultureId);
                let dispoReelle = disponibiliteParJardin[jardin.id] || 0;
                
                // Ajouter les planches déjà assignées à ce jardin par cette culture
                if (culture?.repartition?.[jardin.id]) {
                  dispoReelle += culture.repartition[jardin.id];
                }
                
                return (
                  <div key={jardin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{jardin.nom}</p>
                      <p className="text-xs text-gray-500">{dispoReelle} planches disponibles</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max={dispoReelle}
                      value={repartitionTemp[jardin.id] || 0}
                      onChange={(e) => setRepartitionTemp(prev => ({
                        ...prev,
                        [jardin.id]: Math.max(0, parseInt(e.target.value) || 0)
                      }))}
                      className="w-20 px-2 py-1 border rounded text-center"
                    />
                  </div>
                );
              })}
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm">
                  <strong>Total réparti :</strong> {Object.values(repartitionTemp).reduce((s, v) => s + v, 0)} / 
                  {culturesSelectionnees.find(c => c.id === modalRepartition.cultureId)?.totalPlanches} planches
                </p>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={fermerModalRepartition}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={validerRepartition}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          🆕 V25 : FOURNITURES & INTRANTS (déplacé depuis Simulateur)
          ════════════════════════════════════════════════════════════════════ */}
      {culturesSelectionnees.length > 0 && (
        <FournituresSection 
          culturesSelectionnees={culturesSelectionnees}
          longueurPlanche={longueurPlanche}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🆕 V25 : COMPOSANT FOURNITURES (extrait pour clarté)
// ═══════════════════════════════════════════════════════════════════════════

const FournituresSection = ({ culturesSelectionnees, longueurPlanche }) => {
  const [accordeonOuvert, setAccordeonOuvert] = useState(false);
  
  // Calcul des fournitures
  const fournituresCalculees = useMemo(() => {
    const result = {
      parCulture: {},
      totaux: { semences: 0, fertilisation: 0, protection: 0, biotraitement: 0, total: 0 }
    };

    culturesSelectionnees.forEach(culture => {
      const id = culture.id;
      const planches = culture.totalPlanches || 1;
      const series = culture.series?.length || 1;
      const longueur = culture.longueurPlanche || longueurPlanche || 15;
      const surfaceCulture = planches * longueur * 0.8;

      const catalogueData = catalogueCultures.find(c => c.id === id) || {};
      
      // 1. SEMENCES
      const densiteSemis = catalogueData.semis?.densite || 100;
      const grainesNecessaires = densiteSemis * planches * series;
      const plateauxType = catalogueData.pepiniere?.typeContenant || 128;
      const plateauxParPlanche = catalogueData.pepiniere?.plateauxParPlanche30m || 2;
      const nombrePlateaux = Math.ceil((planches * plateauxParPlanche * (longueur / 30)) * series);
      const substratLitres = catalogueData.dureeEnPepiniere > 0 ? nombrePlateaux * 5 : 0;

      const coutSemences = {
        graines: Math.round(grainesNecessaires * PRIX_FOURNITURES.semences.prixGraine * 100) / 100,
        plateaux: Math.round(nombrePlateaux * (plateauxType === 128 ? PRIX_FOURNITURES.semences.prixPlateau128 : PRIX_FOURNITURES.semences.prixPlateau72) * 100) / 100,
        substrat: Math.round(substratLitres * PRIX_FOURNITURES.semences.prixSubstrat * 100) / 100,
        total: 0
      };
      coutSemences.total = coutSemences.graines + coutSemences.plateaux + coutSemences.substrat;

      // 2. FERTILISATION
      const coutFertilisation = {
        compost: Math.round(surfaceCulture * PRIX_FOURNITURES.fertilisation.compost * 100) / 100,
        amendement: Math.round(surfaceCulture * PRIX_FOURNITURES.fertilisation.amendement * 100) / 100,
        foliaire: Math.round(surfaceCulture * PRIX_FOURNITURES.fertilisation.engraisFoliaire * 100) / 100,
        total: 0
      };
      coutFertilisation.total = coutFertilisation.compost + coutFertilisation.amendement + coutFertilisation.foliaire;

      // 3. PROTECTION
      const besoinsProtection = BESOINS_PROTECTION[id] || {};
      const coutProtection = {
        bachePlastique: besoinsProtection.bachePlastique ? Math.round(planches * PRIX_FOURNITURES.protection.bachePlastique / 3 * 100) / 100 : 0,
        toileTissee: besoinsProtection.toileTissee ? Math.round(planches * PRIX_FOURNITURES.protection.toileTissee / 5 * 100) / 100 : 0,
        voileP17: besoinsProtection.voileP17 ? Math.round(planches * PRIX_FOURNITURES.protection.voileP17 / 2 * 100) / 100 : 0,
        filetInsectes: besoinsProtection.filetInsectes ? Math.round(planches * PRIX_FOURNITURES.protection.filetInsectes / 4 * 100) / 100 : 0,
        total: 0
      };
      coutProtection.total = coutProtection.bachePlastique + coutProtection.toileTissee + coutProtection.voileP17 + coutProtection.filetInsectes;

      // 4. BIO-TRAITEMENT
      const besoinsBio = BESOINS_BIOTRAITEMENT[id] || {};
      const coutBiotraitement = {
        bt: besoinsBio.bt ? Math.round(planches * PRIX_FOURNITURES.biotraitement.bt * 100) / 100 : 0,
        soufreCuivre: besoinsBio.soufreCuivre ? Math.round(planches * PRIX_FOURNITURES.biotraitement.soufreCuivre * 100) / 100 : 0,
        purins: besoinsBio.purins ? Math.round(planches * PRIX_FOURNITURES.biotraitement.purins * 100) / 100 : 0,
        total: 0
      };
      coutBiotraitement.total = coutBiotraitement.bt + coutBiotraitement.soufreCuivre + coutBiotraitement.purins;

      const totalCulture = coutSemences.total + coutFertilisation.total + coutProtection.total + coutBiotraitement.total;

      result.parCulture[id] = {
        nom: culture.nom,
        planches,
        semences: coutSemences.total,
        fertilisation: coutFertilisation.total,
        protection: coutProtection.total,
        biotraitement: coutBiotraitement.total,
        total: totalCulture
      };

      result.totaux.semences += coutSemences.total;
      result.totaux.fertilisation += coutFertilisation.total;
      result.totaux.protection += coutProtection.total;
      result.totaux.biotraitement += coutBiotraitement.total;
      result.totaux.total += totalCulture;
    });

    return result;
  }, [culturesSelectionnees, longueurPlanche]);

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 overflow-hidden mt-6">
      <button 
        onClick={() => setAccordeonOuvert(!accordeonOuvert)}
        className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Package className="w-6 h-6 text-orange-600" />
          <span className="font-bold text-lg text-gray-800">Fournitures & Intrants</span>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
            {fournituresCalculees.totaux.total.toFixed(0)} €
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${accordeonOuvert ? 'rotate-180' : ''}`} />
      </button>

      {accordeonOuvert && (
        <div className="p-4 bg-white">
          {/* Totaux par catégorie */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
              <Sprout className="w-5 h-5 mx-auto mb-1 text-green-600" />
              <div className="text-xs text-gray-600">Semences</div>
              <div className="text-lg font-bold text-green-700">{fournituresCalculees.totaux.semences.toFixed(0)} €</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
              <Leaf className="w-5 h-5 mx-auto mb-1 text-amber-600" />
              <div className="text-xs text-gray-600">Fertilisation</div>
              <div className="text-lg font-bold text-amber-700">{fournituresCalculees.totaux.fertilisation.toFixed(0)} €</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
              <Shield className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <div className="text-xs text-gray-600">Protection</div>
              <div className="text-lg font-bold text-blue-700">{fournituresCalculees.totaux.protection.toFixed(0)} €</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
              <Bug className="w-5 h-5 mx-auto mb-1 text-purple-600" />
              <div className="text-xs text-gray-600">Bio-traitement</div>
              <div className="text-lg font-bold text-purple-700">{fournituresCalculees.totaux.biotraitement.toFixed(0)} €</div>
            </div>
            <div className="bg-orange-100 rounded-lg p-3 text-center border-2 border-orange-300">
              <DollarSign className="w-5 h-5 mx-auto mb-1 text-orange-600" />
              <div className="text-xs text-gray-600 font-medium">TOTAL</div>
              <div className="text-xl font-bold text-orange-700">{fournituresCalculees.totaux.total.toFixed(0)} €</div>
            </div>
          </div>

          {/* Tableau détaillé */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 border text-left">Culture</th>
                  <th className="px-3 py-2 border text-center">Pl.</th>
                  <th className="px-3 py-2 border text-right">🌱 Semences</th>
                  <th className="px-3 py-2 border text-right">🧪 Fertilisation</th>
                  <th className="px-3 py-2 border text-right">🛡️ Protection</th>
                  <th className="px-3 py-2 border text-right">🐛 Bio-trait.</th>
                  <th className="px-3 py-2 border text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(fournituresCalculees.parCulture).map(([id, data]) => (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border font-medium">{data.nom}</td>
                    <td className="px-3 py-2 border text-center">{data.planches}</td>
                    <td className="px-3 py-2 border text-right">{data.semences.toFixed(0)} €</td>
                    <td className="px-3 py-2 border text-right">{data.fertilisation.toFixed(0)} €</td>
                    <td className="px-3 py-2 border text-right">{data.protection.toFixed(0)} €</td>
                    <td className="px-3 py-2 border text-right">{data.biotraitement.toFixed(0)} €</td>
                    <td className="px-3 py-2 border text-right font-bold text-orange-700">{data.total.toFixed(0)} €</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-orange-100 font-bold">
                <tr>
                  <td className="px-3 py-2 border">TOTAL</td>
                  <td className="px-3 py-2 border text-center">
                    {culturesSelectionnees.reduce((s, c) => s + (c.totalPlanches || 0), 0)}
                  </td>
                  <td className="px-3 py-2 border text-right text-green-700">{fournituresCalculees.totaux.semences.toFixed(0)} €</td>
                  <td className="px-3 py-2 border text-right text-amber-700">{fournituresCalculees.totaux.fertilisation.toFixed(0)} €</td>
                  <td className="px-3 py-2 border text-right text-blue-700">{fournituresCalculees.totaux.protection.toFixed(0)} €</td>
                  <td className="px-3 py-2 border text-right text-purple-700">{fournituresCalculees.totaux.biotraitement.toFixed(0)} €</td>
                  <td className="px-3 py-2 border text-right text-orange-800 text-lg">{fournituresCalculees.totaux.total.toFixed(0)} €</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <Info className="w-4 h-4 inline mr-1" />
            Les valeurs sont calculées automatiquement selon les chartes de culture.
            Ce total est utilisé dans l'onglet Résultats pour le calcul de rentabilité.
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionCultures;
