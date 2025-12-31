// SelectionCultures.jsx V20 - AVEC INDICATEURS ÉCONOMIQUES PAR CULTURE
// 🆕 V20 : Section "Indicateurs Économiques" ajoutée pour chaque culture
// 🛠️ FIX : Calcul correct avec rotations, plafonnement à capacité, alertes visuelles
// 📱 V22 : Optimisations mobile - bloc sélection replié par défaut

import React, { useState, useEffect, useMemo } from 'react';
import { cultures } from '../data/cultures';
import { Plus, X, AlertTriangle, Settings, ChevronDown, AlertCircle, CheckCircle, TrendingUp, MapPin, Layers, Info, DollarSign } from 'lucide-react';
import { calculerBesoinHebdo } from '../data/compositionsPaniers';
import { genererPlanComplet, validerPlan, calculerRepartitionOptimale, classifierCulture } from '../utils/calculPlanchesSimultanees';
import { NIVEAUX_MATURITE } from '../utils/constantes';

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
  
  // 📱 État accordéon section principale (fermé par défaut sur mobile)
  const [sectionSelectionOuverte, setSectionSelectionOuverte] = useState(true);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      // Fermer la section sur mobile au premier chargement
      if (mobile) {
        setSectionSelectionOuverte(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // RECALCUL AUTOMATIQUE QUAND NIVEAU OU LONGUEUR CHANGE
  // ═══════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    if (culturesSelectionnees.length === 0) return;
    
    console.log(`🔄 Recalcul de toutes les cultures avec niveau ${niveauMaturite} et planches ${longueurPlanche}m`);
    
    const culturesRecalculees = culturesSelectionnees.map(c => {
      const cultureBase = cultures.find(cb => cb.id === c.id);
      if (!cultureBase) return c;
      
      try {
        const plan = genererPlanComplet(
          cultureBase, 
          marche, 
          calculerBesoinHebdo, 
          c.delaiIntercalaire || cultureBase.delaiIntercalaireRecommande || 1,
          {
            niveauMaturite,
            longueurPlanche,
            planchesDisponibles: null
          }
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
  // CALCULS DE CAPACITÉ
  // ═══════════════════════════════════════════════════════════════════════

  const capaciteTotale = useMemo(() => {
    return jardins.reduce((sum, j) => sum + j.nombrePlanches, 0);
  }, [jardins]);

  const planchesUtilisees = useMemo(() => {
    return culturesSelectionnees.reduce((sum, c) => {
      if (c.repartition) {
        return sum + Object.values(c.repartition).reduce((s, v) => s + v, 0);
      }
      if (c.jardinId) {
        return sum + (c.totalPlanches || 0);
      }
      return sum;
    }, 0);
  }, [culturesSelectionnees]);

  const planchesDemandeesTotales = useMemo(() => {
    return culturesSelectionnees.reduce((sum, c) => sum + (c.totalPlanches || 0), 0);
  }, [culturesSelectionnees]);

  const planchesDisponibles = capaciteTotale - planchesUtilisees;

  // 🆕 V20 : Calcul du CA total pour pourcentages
  const caTotalEstime = useMemo(() => {
    return culturesSelectionnees.reduce((sum, c) => {
      const cultureBase = cultures.find(cb => cb.id === c.id);
      const prixUnitaire = cultureBase?.prix?.unitaire || 3.00;
      const coefficient = NIVEAUX_MATURITE[niveauMaturite]?.coefficient || 0.70;
      const rendement = cultureBase?.rendement?.[`planche${longueurPlanche}m`] || 100;
      const production = c.planComplet?.resume?.productionEstimee || (c.totalPlanches * rendement * coefficient);
      return sum + (production * prixUnitaire);
    }, 0);
  }, [culturesSelectionnees, niveauMaturite, longueurPlanche]);

  // Disponibilité par jardin
  const disponibiliteParJardin = useMemo(() => {
    const dispo = {};
    jardins.forEach(j => {
      dispo[j.id] = j.nombrePlanches;
    });
    
    culturesSelectionnees.forEach(c => {
      if (c.repartition) {
        Object.entries(c.repartition).forEach(([jId, nb]) => {
          dispo[parseInt(jId)] -= nb;
        });
      } else if (c.jardinId) {
        dispo[c.jardinId] -= c.totalPlanches || 0;
      }
    });
    
    return dispo;
  }, [jardins, culturesSelectionnees]);

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
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════

  const ajouterCulture = (culture) => {
    console.log(`📊 Plan généré pour ${culture.nom} | Niveau: ${niveauMaturite} | Délai: ${culture.delaiIntercalaireRecommande || 2}sem | Planches: ${longueurPlanche}m`);
    
    try {
      const plan = genererPlanComplet(
        culture, 
        marche, 
        calculerBesoinHebdo, 
        culture.delaiIntercalaireRecommande || 1,
        {
          niveauMaturite,
          longueurPlanche,
          planchesDisponibles: null
        }
      );
      
      const validation = validerPlan(plan, jardins);
      
      const nouvelleCulture = {
        ...culture,
        planComplet: plan,
        validation,
        planchesRecommandees: plan.calcul.planchesPhysiques,
        delaiIntercalaire: culture.delaiIntercalaireRecommande || 1,
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
        repartition: null
      };
      
      setCulturesSelectionnees([...culturesSelectionnees, nouvelleCulture]);
    } catch (error) {
      console.error('Erreur génération plan:', error);
    }
  };

  const retirerCulture = (cultureId) => {
    setCulturesSelectionnees(culturesSelectionnees.filter(c => c.id !== cultureId));
  };

  const assignerJardin = (cultureId, jardinId) => {
    setCulturesSelectionnees(culturesSelectionnees.map(c => {
      if (c.id === cultureId) {
        return {
          ...c,
          jardinId: jardinId ? parseInt(jardinId) : null,
          repartition: null
        };
      }
      return c;
    }));
  };

  const recalculerCultureAvecDelai = (cultureId, nouveauDelai) => {
    const culture = culturesSelectionnees.find(c => c.id === cultureId);
    if (!culture) return;
    
    const cultureBase = cultures.find(cb => cb.id === cultureId);
    if (!cultureBase) return;
    
    try {
      const plan = genererPlanComplet(
        cultureBase, 
        marche, 
        calculerBesoinHebdo, 
        nouveauDelai,
        {
          niveauMaturite,
          longueurPlanche,
          planchesDisponibles: null
        }
      );
      
      const validation = validerPlan(plan, jardins);
      
      setCulturesSelectionnees(culturesSelectionnees.map(c => {
        if (c.id === cultureId) {
          return {
            ...c,
            delaiIntercalaire: nouveauDelai,
            planComplet: plan,
            validation,
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
      console.error('Erreur recalcul:', error);
    }
  };

  const ouvrirModalRepartition = (culture) => {
    const repartitionInitiale = culture.repartition || {};
    setRepartitionTemp(repartitionInitiale);
    setModalRepartition({ open: true, cultureId: culture.id });
  };

  const fermerModalRepartition = () => {
    setModalRepartition({ open: false, cultureId: null });
    setRepartitionTemp({});
  };

  const sauvegarderRepartition = () => {
    const culture = culturesSelectionnees.find(c => c.id === modalRepartition.cultureId);
    if (!culture) return;
    
    const repartitionFinale = {};
    Object.entries(repartitionTemp).forEach(([jId, nb]) => {
      if (nb > 0) {
        repartitionFinale[parseInt(jId)] = nb;
      }
    });
    
    setCulturesSelectionnees(culturesSelectionnees.map(c => {
      if (c.id === modalRepartition.cultureId) {
        return {
          ...c,
          repartition: Object.keys(repartitionFinale).length > 0 ? repartitionFinale : null,
          jardinId: null
        };
      }
      return c;
    }));
    
    fermerModalRepartition();
  };

  // ═══════════════════════════════════════════════════════════════════════
  // COMPOSANT BADGE TYPE CYCLE
  // ═══════════════════════════════════════════════════════════════════════

  const BadgeTypeCycle = ({ typeCycle }) => {
    const config = {
      'LONGUE_DUREE': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🏠', label: 'Long' },
      'ROTATION_MOYENNE': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🔄', label: 'Moyen' },
      'ROTATION_RAPIDE': { bg: 'bg-green-100', text: 'text-green-700', icon: '⚡', label: 'Rapide' }
    };
    const c = config[typeCycle] || config['ROTATION_MOYENNE'];
    
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 V20 : COMPOSANT INDICATEURS ÉCONOMIQUES
  // ═══════════════════════════════════════════════════════════════════════

  const IndicateursEconomiques = ({ culture }) => {
    const cultureBase = cultures.find(cb => cb.id === culture.id);
    const prixUnitaire = cultureBase?.prix?.unitaire || 3.00;
    const coefficient = NIVEAUX_MATURITE[niveauMaturite]?.coefficient || 0.70;
    const rendement = cultureBase?.rendement?.[`planche${longueurPlanche}m`] || 100;
    
    const productionEstimee = culture.planComplet?.resume?.productionEstimee || 
      (culture.totalPlanches * rendement * coefficient);
    
    const caEstime = Math.round(productionEstimee * prixUnitaire);
    
    // Coûts intrants
    const intrants = culture.planComplet?.intrants || {};
    const coutIntrants = intrants.couts?.total || Math.round(culture.totalPlanches * 5);
    
    // Marge brute
    const margeBrute = caEstime - coutIntrants;
    const tauxMarge = caEstime > 0 ? Math.round((margeBrute / caEstime) * 100) : 0;
    
    // CA potentiel par planche
    const caPotentielPlanche = cultureBase?.prix?.[`caPotentielPlanche${longueurPlanche}m`] || 
      (prixUnitaire * rendement);
    
    // Part du CA total
    const partCA = caTotalEstime > 0 ? Math.round((caEstime / caTotalEstime) * 100) : 0;
    
    return (
      <div className="px-4 pb-4">
        {/* Grille d'indicateurs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {/* CA Estimé */}
          <div className="bg-emerald-50 p-3 rounded-lg text-center border border-emerald-200">
            <p className="text-xs text-gray-600 mb-1">💵 CA Estimé</p>
            <p className="text-xl font-bold text-emerald-600">
              {caEstime.toLocaleString('fr-FR')} €
            </p>
            <p className="text-xs text-gray-500">
              {partCA}% du total
            </p>
          </div>
          
          {/* Coûts Intrants */}
          <div className="bg-orange-50 p-3 rounded-lg text-center border border-orange-200">
            <p className="text-xs text-gray-600 mb-1">📦 Coûts</p>
            <p className="text-xl font-bold text-orange-600">
              {coutIntrants.toLocaleString('fr-FR')} €
            </p>
            <p className="text-xs text-gray-500">
              ~{Math.round(coutIntrants / Math.max(1, culture.totalPlanches))}€/pl.
            </p>
          </div>
          
          {/* Marge Brute */}
          <div className={`p-3 rounded-lg text-center border ${
            margeBrute > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <p className="text-xs text-gray-600 mb-1">📈 Marge</p>
            <p className={`text-xl font-bold ${margeBrute > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {margeBrute.toLocaleString('fr-FR')} €
            </p>
            <p className="text-xs text-gray-500">
              Taux: {tauxMarge}%
            </p>
          </div>
          
          {/* CA/Planche */}
          <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-200">
            <p className="text-xs text-gray-600 mb-1">📊 CA/Planche</p>
            <p className="text-xl font-bold text-purple-600">
              {Math.round(caEstime / Math.max(1, culture.totalPlanches))} €
            </p>
            <p className="text-xs text-gray-500">
              Potentiel: {Math.round(caPotentielPlanche)}€
            </p>
          </div>
          
          {/* Prix unitaire */}
          <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
            <p className="text-xs text-gray-600 mb-1">🏷️ Prix</p>
            <p className="text-xl font-bold text-blue-600">
              {prixUnitaire.toFixed(2)} €
            </p>
            <p className="text-xs text-gray-500">
              /{culture.typeRecolte === 'bottes' ? 'botte' : 'kg'}
            </p>
          </div>
        </div>
        
        {/* Résumé production */}
        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              <strong>{culture.totalPlanches}</strong> planches × <strong>{Math.round(rendement * coefficient)}</strong> {culture.typeRecolte === 'bottes' ? 'bt' : 'kg'}/pl. = 
            </span>
            <span className="font-bold text-green-600">
              {Math.round(productionEstimee)} {culture.typeRecolte === 'bottes' ? 'bottes' : 'kg'} → {caEstime.toLocaleString('fr-FR')} €
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* En-tête avec résumé */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            🌱 Sélection des Cultures
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              V20 + Économie
            </span>
          </h2>
          <div className="text-sm text-gray-600">
            Niveau: <strong className="text-green-600">{NIVEAUX_MATURITE[niveauMaturite]?.label}</strong>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
            <p className="text-xs text-gray-600">Cultures</p>
            <p className="text-2xl font-bold text-blue-600">{culturesSelectionnees.length}</p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
            <p className="text-xs text-gray-600">Planches demandées</p>
            <p className="text-2xl font-bold text-purple-600">{planchesDemandeesTotales}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
            <p className="text-xs text-gray-600">Capacité totale</p>
            <p className="text-2xl font-bold text-green-600">{capaciteTotale}</p>
            <p className="text-xs text-gray-500">{longueurPlanche}m</p>
          </div>
          
          <div className={`p-3 rounded-lg border text-center ${
            planchesDisponibles >= 0 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <p className="text-xs text-gray-600">Disponibles</p>
            <p className={`text-2xl font-bold ${planchesDisponibles >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {planchesDisponibles}
            </p>
          </div>
          
          <div className={`p-3 rounded-lg border text-center ${
            planchesDemandeesTotales <= capaciteTotale 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <p className="text-xs text-gray-600">Taux occupation</p>
            <p className={`text-2xl font-bold ${
              planchesDemandeesTotales <= capaciteTotale ? 'text-green-600' : 'text-red-600'
            }`}>
              {capaciteTotale > 0 ? Math.round((planchesDemandeesTotales / capaciteTotale) * 100) : 0}%
            </p>
          </div>
          
          {/* 🆕 V20 : CA Total Estimé */}
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-center">
            <p className="text-xs text-gray-600">💰 CA Total Estimé</p>
            <p className="text-2xl font-bold text-emerald-600">
              {Math.round(caTotalEstime).toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>

        {/* Alerte capacité insuffisante */}
        {planchesDemandeesTotales > capaciteTotale && (
          <div className="mt-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">Capacité insuffisante</p>
              <p className="text-sm text-red-700">
                Vous demandez {planchesDemandeesTotales} planches mais n'avez que {capaciteTotale} disponibles.
                Il manque <strong>{planchesDemandeesTotales - capaciteTotale}</strong> planches.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sélection des cultures - 📱 Accordéon sur mobile */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* Header cliquable */}
        <button 
          onClick={() => setSectionSelectionOuverte(!sectionSelectionOuverte)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <h3 className="font-bold text-lg flex items-center">
            <Plus className="w-5 h-5 mr-2 text-green-600" />
            Ajouter des cultures
            <span className="ml-2 text-sm font-normal text-gray-500">({cultures.length} disponibles)</span>
          </h3>
          <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${sectionSelectionOuverte ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Contenu - visible si ouvert */}
        {sectionSelectionOuverte && (
          <div className="p-4 border-t">
            <div className="flex flex-wrap gap-2">
              {cultures.map(culture => {
                const dejaSelectionnee = culturesSelectionnees.find(c => c.id === culture.id);
                const typeCycle = classifierCulture(culture);
                
                return (
                  <button
                    key={culture.id}
                    onClick={() => ajouterCulture(culture)}
                    disabled={dejaSelectionnee}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                      dejaSelectionnee 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    }`}
                  >
                    <span>{culture.nom}</span>
                    {!dejaSelectionnee && (
                      <span className="text-xs opacity-60">
                        {typeCycle === 'LONGUE_DUREE' ? '🏠' : typeCycle === 'ROTATION_RAPIDE' ? '⚡' : '🔄'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Liste des cultures sélectionnées */}
      <div className="space-y-4">
        {culturesSelectionnees.map(culture => {
          const typeCycle = culture.planComplet?.resume?.typeCycle || classifierCulture(culture);
          const cultureBase = cultures.find(cb => cb.id === culture.id);
          const coefficient = NIVEAUX_MATURITE[niveauMaturite]?.coefficient || 0.70;
          const rendementEffectif = cultureBase?.rendement?.[`planche${longueurPlanche}m`] * coefficient || 100;
          const cyclesParPlanche = culture.planComplet?.resume?.rotations || 1;
          
          const estAssigne = culture.jardinId || (culture.repartition && Object.keys(culture.repartition).length > 0);
          const planchesAssignees = culture.repartition 
            ? Object.values(culture.repartition).reduce((s, v) => s + v, 0)
            : (culture.jardinId ? culture.totalPlanches : 0);
          const planchesManquantes = culture.totalPlanches - planchesAssignees;

          return (
            <div 
              key={culture.id} 
              className={`bg-white rounded-xl shadow-md border-2 overflow-hidden ${
                estAssigne && planchesManquantes <= 0 
                  ? 'border-green-300' 
                  : planchesManquantes > 0 
                    ? 'border-orange-300' 
                    : 'border-gray-200'
              }`}
            >
              {/* Header culture */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    estAssigne ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {culture.nom.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-gray-900">{culture.nom}</h4>
                      <BadgeTypeCycle typeCycle={typeCycle} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {culture.categorie} • {culture.series?.length || 0} séries • {culture.totalPlanches} pl.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => retirerCulture(culture.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info rendement */}
              <div className="px-4 py-2 bg-blue-50 border-t border-b border-blue-100">
                <p className="text-sm text-blue-800">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  <strong>Rendement:</strong> {longueurPlanche}m × {coefficient} = <strong>{Math.round(rendementEffectif)} {culture.typeRecolte === 'bottes' ? 'bottes' : 'kg'}</strong>
                  {cyclesParPlanche > 1 && <span className="ml-2 text-purple-600">({cyclesParPlanche} cycles/pl.)</span>}
                </p>
              </div>

              {/* 🆕 V20 : Section Indicateurs Économiques - OUVERTE PAR DÉFAUT */}
              <div className="border-t">
                <button
                  onClick={() => toggleCultureSection(culture.id, 'economie')}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors bg-emerald-50"
                >
                  <span className="font-medium flex items-center text-emerald-700">
                    <DollarSign className="w-4 h-4 mr-2" />
                    💰 Indicateurs Économiques
                  </span>
                  <ChevronDown className={`w-5 h-5 text-emerald-600 transition-transform ${
                    isCultureSectionOpen(culture.id, 'economie', true) ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {isCultureSectionOpen(culture.id, 'economie', true) && (
                  <IndicateursEconomiques culture={culture} />
                )}
              </div>

              {/* Section Répartition Jardins */}
              <div className="border-t">
                <button
                  onClick={() => toggleCultureSection(culture.id, 'repartition')}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-green-600" />
                    Répartition Jardins
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                    isCultureSectionOpen(culture.id, 'repartition') ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {isCultureSectionOpen(culture.id, 'repartition') && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">Jardin principal :</label>
                      <select
                        value={culture.jardinId || ''}
                        onChange={(e) => assignerJardin(culture.id, e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 min-w-[200px]"
                      >
                        <option value="">-- Choisir --</option>
                        {jardins.map(j => {
                          const dispo = disponibiliteParJardin[j.id] || 0;
                          return (
                            <option key={j.id} value={j.id}>
                              {j.nom} ({dispo}/{j.nombrePlanches} dispo)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {culture.repartition && Object.keys(culture.repartition).length > 0 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-2">Répartition actuelle :</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(culture.repartition).map(([jId, nb]) => {
                            const jardin = jardins.find(j => j.id === parseInt(jId));
                            return (
                              <span key={jId} className="px-2 py-1 bg-white border border-green-300 rounded text-sm">
                                {jardin?.nom}: <strong>{nb}</strong> pl.
                              </span>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => ouvrirModalRepartition(culture)}
                          className="mt-2 text-sm text-green-700 hover:text-green-900 underline"
                        >
                          Modifier la répartition
                        </button>
                      </div>
                    )}

                    {!culture.jardinId && (!culture.repartition || Object.keys(culture.repartition).length === 0) && (
                      <button
                        onClick={() => ouvrirModalRepartition(culture)}
                        className="w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center border border-blue-200"
                      >
                        <Layers className="w-4 h-4 mr-2" />
                        Répartir sur les jardins
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Section Paramètres */}
              <div className="border-t">
                <button
                  onClick={() => toggleCultureSection(culture.id, 'parametres')}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-gray-600" />
                    Paramètres de Planification
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                    isCultureSectionOpen(culture.id, 'parametres', false) ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {isCultureSectionOpen(culture.id, 'parametres', false) && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center space-x-4">
                      <label className="text-sm text-gray-600">Délai intercalaire :</label>
                      <select
                        value={culture.delaiIntercalaire || 1}
                        onChange={(e) => recalculerCultureAvecDelai(culture.id, parseInt(e.target.value))}
                        className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                      >
                        <option value="1">1 semaine</option>
                        <option value="2">2 semaines</option>
                        <option value="3">3 semaines</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Section Planning des séries */}
              <div className="border-t">
                <button
                  onClick={() => toggleCultureSection(culture.id, 'planning')}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium flex items-center">
                    📅 Planning des {culture.series?.length || 0} Séries
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                    isCultureSectionOpen(culture.id, 'planning', false) ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {isCultureSectionOpen(culture.id, 'planning', false) && culture.series && (
                  <div className="px-4 pb-4">
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
  <p className="text-xs text-gray-400 mb-1 sm:hidden">👉 Glissez pour voir plus</p>
  <table className="w-full text-sm min-w-[400px]">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-2 py-1 text-left">Série</th>
                            <th className="px-2 py-1 text-center">Planche</th>
                            <th className="px-2 py-1 text-center">Semis</th>
                            <th className="px-2 py-1 text-center">Plant.</th>
                            <th className="px-2 py-1 text-center">Récolte</th>
                          </tr>
                        </thead>
                        <tbody>
                          {culture.series.slice(0, 10).map((serie, idx) => (
                            <tr key={serie.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-2 py-1">#{serie.id}</td>
                              <td className="px-2 py-1 text-center font-medium text-purple-600">
                                {serie.plancheId || '-'}
                              </td>
                              <td className="px-2 py-1 text-center">S{serie.semaineSemis}</td>
                              <td className="px-2 py-1 text-center">S{serie.semainePlantation}</td>
                              <td className="px-2 py-1 text-center font-medium text-green-600">
                                S{serie.semaineRecolteDebut}-{serie.semaineRecolteFin}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {culture.series.length > 10 && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          ... et {culture.series.length - 10} autres séries
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Section Production estimée */}
              <div className="border-t">
                <button
                  onClick={() => toggleCultureSection(culture.id, 'production')}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium flex items-center">
                    ✅ Production Estimée
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                    isCultureSectionOpen(culture.id, 'production', false) ? 'rotate-180' : ''
                  }`} />
                </button>
                
{isCultureSectionOpen(culture.id, 'production', false) && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-blue-50 p-2 sm:p-3 rounded-lg text-center">
                        <p className="text-[10px] sm:text-xs text-gray-600">Besoin saison</p>
                        <p className="text-base sm:text-lg font-bold text-blue-600">
                          {Math.round(culture.planComplet?.besoinTotal || 0)} {culture.typeRecolte === 'bottes' ? 'bt' : 'kg'}
                        </p>
                      </div>
                      <div className="bg-green-50 p-2 sm:p-3 rounded-lg text-center">
                        <p className="text-[10px] sm:text-xs text-gray-600">Production estimée</p>
                        <p className="text-base sm:text-lg font-bold text-green-600">
                          {Math.round(culture.planComplet?.resume?.productionEstimee || (culture.totalPlanches * rendementEffectif))} {culture.typeRecolte === 'bottes' ? 'bt' : 'kg'}
                        </p>
                      </div>
                      <div className={`p-2 sm:p-3 rounded-lg text-center ${
                        (culture.planComplet?.resume?.tauxCouverture || 100) >= 100 
                          ? 'bg-green-50' : 'bg-orange-50'
                      }`}>
                        <p className="text-[10px] sm:text-xs text-gray-600">Couverture</p>
                        <p className={`text-base sm:text-lg font-bold ${
                          (culture.planComplet?.resume?.tauxCouverture || 100) >= 100 
                            ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {culture.planComplet?.resume?.tauxCouverture || 100}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal répartition multi-jardins */}
      {modalRepartition.open && (() => {
        const culture = culturesSelectionnees.find(c => c.id === modalRepartition.cultureId);
        if (!culture) return null;
        
        const totalReparti = Object.values(repartitionTemp).reduce((s, v) => s + v, 0);
        const restant = culture.totalPlanches - totalReparti;
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b bg-gradient-to-r from-green-50 to-blue-50">
                <h3 className="font-bold text-lg">Répartir {culture.nom} sur plusieurs jardins</h3>
                <p className="text-sm text-gray-600">
                  {culture.totalPlanches} planches à répartir • Restant: <strong className={restant > 0 ? 'text-orange-600' : 'text-green-600'}>{restant}</strong>
                </p>
              </div>
              
              <div className="p-4 space-y-4">
                {jardins.map(jardin => {
                  let dispoJardin = jardin.nombrePlanches;
                  culturesSelectionnees.forEach(c => {
                    if (c.id === culture.id) return;
                    if (c.repartition?.[jardin.id]) {
                      dispoJardin -= c.repartition[jardin.id];
                    } else if (c.jardinId === jardin.id) {
                      dispoJardin -= c.totalPlanches;
                    }
                  });
                  
                  const valeurActuelle = repartitionTemp[jardin.id] || 0;
                  
                  return (
                    <div 
                      key={jardin.id} 
                      className={`p-3 rounded-lg border-2 ${
                        valeurActuelle > 0 ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium">{jardin.nom}</span>
                          <span className={`ml-2 text-sm ${dispoJardin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Dispo: {dispoJardin}
                          </span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={Math.max(0, dispoJardin)}
                          value={valeurActuelle}
                          onChange={(e) => setRepartitionTemp({
                            ...repartitionTemp,
                            [jardin.id]: Math.min(parseInt(e.target.value) || 0, dispoJardin)
                          })}
                          className="w-20 px-2 py-1 border rounded text-center"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.max(0, dispoJardin)}
                        value={valeurActuelle}
                        onChange={(e) => setRepartitionTemp({
                          ...repartitionTemp,
                          [jardin.id]: parseInt(e.target.value) || 0
                        })}
                        className="w-full"
                      />
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4 border-t flex justify-end space-x-3">
                <button
                  onClick={fermerModalRepartition}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={sauvegarderRepartition}
                  disabled={totalReparti !== culture.totalPlanches}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    totalReparti === culture.totalPlanches
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Valider ({totalReparti}/{culture.totalPlanches})
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default SelectionCultures;
