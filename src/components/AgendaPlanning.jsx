// AgendaPlanning_v21_responsive.jsx - VISION SYNTHÉTIQUE DE LA FERME
// 🆕 V20 : Tableau de bord opérationnel centralisant tout
// 📱 V21.1 : Optimisations responsive mobile
// - Header et navigation adaptés mobile
// - Grille calendrier responsive
// - Touch-friendly buttons

import React, { useState, useMemo } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, Package, Truck,
  Sprout, Droplets, Scissors, Sun, CheckCircle, AlertTriangle,
  ShoppingCart, Users, Home, TrendingUp, Eye, BarChart3,
  CalendarDays, List, LayoutGrid, Filter, RefreshCw
} from 'lucide-react';
import { SAISON } from '../utils/constantes';
import { calculerBesoinHebdo } from '../data/compositionsPaniers';

// Semaine actuelle (simulation - à adapter avec la vraie date)
const getSemaineActuelle = () => {
  const now = new Date();
  const debut = new Date(now.getFullYear(), 0, 1);
  const jours = Math.floor((now - debut) / (24 * 60 * 60 * 1000));
  return Math.ceil((jours + debut.getDay() + 1) / 7);
};

// Mapping semaine → dates 2025
const SEMAINES_2025 = {
  18: { debut: '28 avr', fin: '4 mai', mois: 'Mai', joursMois: [28, 29, 30, 1, 2, 3, 4] },
  19: { debut: '5 mai', fin: '11 mai', mois: 'Mai', joursMois: [5, 6, 7, 8, 9, 10, 11] },
  20: { debut: '12 mai', fin: '18 mai', mois: 'Mai', joursMois: [12, 13, 14, 15, 16, 17, 18] },
  21: { debut: '19 mai', fin: '25 mai', mois: 'Mai', joursMois: [19, 20, 21, 22, 23, 24, 25] },
  22: { debut: '26 mai', fin: '1 juin', mois: 'Juin', joursMois: [26, 27, 28, 29, 30, 31, 1] },
  23: { debut: '2 juin', fin: '8 juin', mois: 'Juin', joursMois: [2, 3, 4, 5, 6, 7, 8] },
  24: { debut: '9 juin', fin: '15 juin', mois: 'Juin', joursMois: [9, 10, 11, 12, 13, 14, 15] },
  25: { debut: '16 juin', fin: '22 juin', mois: 'Juin', joursMois: [16, 17, 18, 19, 20, 21, 22] },
  26: { debut: '23 juin', fin: '29 juin', mois: 'Juin', joursMois: [23, 24, 25, 26, 27, 28, 29] },
  27: { debut: '30 juin', fin: '6 juil', mois: 'Juillet', joursMois: [30, 1, 2, 3, 4, 5, 6] },
  28: { debut: '7 juil', fin: '13 juil', mois: 'Juillet', joursMois: [7, 8, 9, 10, 11, 12, 13] },
  29: { debut: '14 juil', fin: '20 juil', mois: 'Juillet', joursMois: [14, 15, 16, 17, 18, 19, 20] },
  30: { debut: '21 juil', fin: '27 juil', mois: 'Juillet', joursMois: [21, 22, 23, 24, 25, 26, 27] },
  31: { debut: '28 juil', fin: '3 août', mois: 'Août', joursMois: [28, 29, 30, 31, 1, 2, 3] },
  32: { debut: '4 août', fin: '10 août', mois: 'Août', joursMois: [4, 5, 6, 7, 8, 9, 10] },
  33: { debut: '11 août', fin: '17 août', mois: 'Août', joursMois: [11, 12, 13, 14, 15, 16, 17] },
  34: { debut: '18 août', fin: '24 août', mois: 'Août', joursMois: [18, 19, 20, 21, 22, 23, 24] },
  35: { debut: '25 août', fin: '31 août', mois: 'Août', joursMois: [25, 26, 27, 28, 29, 30, 31] },
  36: { debut: '1 sep', fin: '7 sep', mois: 'Septembre', joursMois: [1, 2, 3, 4, 5, 6, 7] },
  37: { debut: '8 sep', fin: '14 sep', mois: 'Septembre', joursMois: [8, 9, 10, 11, 12, 13, 14] },
  38: { debut: '15 sep', fin: '21 sep', mois: 'Septembre', joursMois: [15, 16, 17, 18, 19, 20, 21] }
};

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const JOURS_SEMAINE_COURT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Types de tâches
const TYPES_TACHES = {
  semis: { icone: Sprout, label: 'Semis', couleur: 'bg-blue-100 text-blue-700' },
  plantation: { icone: Sun, label: 'Plantation', couleur: 'bg-green-100 text-green-700' },
  arrosage: { icone: Droplets, label: 'Arrosage', couleur: 'bg-cyan-100 text-cyan-700' },
  taille: { icone: Scissors, label: 'Entretien', couleur: 'bg-purple-100 text-purple-700' },
  recolte: { icone: Package, label: 'Récolte', couleur: 'bg-orange-100 text-orange-700' },
  livraison: { icone: Truck, label: 'Livraison', couleur: 'bg-amber-100 text-amber-700' }
};

const AgendaPlanning = ({ 
  culturesSelectionnees, 
  jardins, 
  marche,
  onNavigateToTab 
}) => {
  // État
  const [semaineSelectionnee, setSemaineSelectionnee] = useState(24); // Simulation : semaine 24
  const [vueMode, setVueMode] = useState('semaine'); // 'jour', 'semaine', 'mois', 'saison'
  const [jourSelectionne, setJourSelectionne] = useState(0); // Index du jour dans la semaine
  const [tachesCompletees, setTachesCompletees] = useState({});

  // Infos de la semaine sélectionnée
  const semaineInfo = SEMAINES_2025[semaineSelectionnee] || { debut: '?', fin: '?', mois: '?' };
  const estDansSaison = semaineSelectionnee >= SAISON.debut && semaineSelectionnee <= SAISON.fin;

  // Navigation semaine
  const semainePrecedente = () => setSemaineSelectionnee(prev => Math.max(10, prev - 1));
  const semaineSuivante = () => setSemaineSelectionnee(prev => Math.min(44, prev + 1));

  // Calculer les besoins marché de la semaine
  const besoinsMarche = useMemo(() => {
    if (!estDansSaison) return null;
    
    try {
      const besoins = calculerBesoinHebdo(marche, semaineSelectionnee);
      
      // Transformer en liste avec détails
      const liste = Object.entries(besoins).map(([legume, data]) => ({
        legume,
        quantite: data.total,
        unite: data.unite || 'kg',
        detail: {
          amap: data.amap || 0,
          marche: data.marche || 0,
          restaurant: data.restaurant || 0
        }
      })).filter(item => item.quantite > 0);
      
      return liste.sort((a, b) => b.quantite - a.quantite);
    } catch (e) {
      console.warn('Erreur calcul besoins:', e);
      return [];
    }
  }, [marche, semaineSelectionnee, estDansSaison]);

  // Générer les tâches de la semaine
  const tachesSemaine = useMemo(() => {
    const taches = [];
    
    culturesSelectionnees.forEach(culture => {
      (culture.series || []).forEach((serie, idx) => {
        const serieLabel = `${culture.nom} S${idx + 1}`;
        
        // Semis
        if (serie.semaineSemis === semaineSelectionnee) {
          taches.push({
            id: `${culture.id}-${idx}-semis`,
            type: 'semis',
            culture: culture.nom,
            description: `Semis ${serieLabel}`,
            lieu: culture.typeSemis === 'pepiniere' ? 'Pépinière' : 'Plein champ',
            jour: 0, // Lundi
            duree: '1h',
            priorite: 'haute'
          });
        }
        
        // Plantation
        if (serie.semainePlantation === semaineSelectionnee) {
          taches.push({
            id: `${culture.id}-${idx}-plantation`,
            type: 'plantation',
            culture: culture.nom,
            description: `Plantation ${serieLabel}`,
            lieu: culture.jardinNom || 'Jardin',
            jour: 1, // Mardi
            duree: '2h',
            priorite: 'haute',
            planches: serie.planchesUtilisees
          });
        }
        
        // Récolte
        const recolteDebut = serie.semaineRecolteDebut || serie.semaineDebut;
        const recolteFin = serie.semaineRecolteFin || serie.semaineFin;
        
        if (recolteDebut && recolteFin && 
            semaineSelectionnee >= recolteDebut && 
            semaineSelectionnee <= recolteFin) {
          taches.push({
            id: `${culture.id}-${idx}-recolte-${semaineSelectionnee}`,
            type: 'recolte',
            culture: culture.nom,
            description: `Récolte ${serieLabel}`,
            lieu: culture.jardinNom || 'Jardin',
            jour: 2, // Mercredi (avant livraison AMAP)
            duree: '2h',
            priorite: 'haute'
          });
        }
        
        // Entretien (tomates, etc.)
        if (['tomate', 'concombre', 'aubergine'].includes(culture.id)) {
          const debutEntretien = serie.semainePlantation ? serie.semainePlantation + 2 : 20;
          const finEntretien = recolteFin || 38;
          
          if (semaineSelectionnee >= debutEntretien && semaineSelectionnee <= finEntretien) {
            taches.push({
              id: `${culture.id}-${idx}-taille-${semaineSelectionnee}`,
              type: 'taille',
              culture: culture.nom,
              description: `Taille ${serieLabel}`,
              lieu: culture.jardinNom || 'Serre',
              jour: 1, // Mardi
              duree: '1h',
              priorite: 'moyenne'
            });
          }
        }
      });
    });
    
    // Ajouter les tâches fixes
    if (estDansSaison) {
      // Livraison AMAP le mercredi
      if (marche.amap > 0) {
        taches.push({
          id: `livraison-amap-${semaineSelectionnee}`,
          type: 'livraison',
          culture: 'AMAP',
          description: `Livraison ${marche.amap} paniers AMAP`,
          lieu: 'Point de livraison',
          jour: 2, // Mercredi
          duree: '2h',
          priorite: 'haute',
          fixe: true
        });
      }
      
      // Marché le samedi
      if (marche.marche > 0) {
        taches.push({
          id: `marche-${semaineSelectionnee}`,
          type: 'livraison',
          culture: 'Marché',
          description: `Vente marché (${marche.marche} clients)`,
          lieu: 'Marché',
          jour: 5, // Samedi
          duree: '4h',
          priorite: 'haute',
          fixe: true
        });
      }
      
      // Arrosage quotidien
      for (let j = 0; j < 7; j++) {
        taches.push({
          id: `arrosage-${semaineSelectionnee}-${j}`,
          type: 'arrosage',
          culture: 'Tous jardins',
          description: 'Arrosage quotidien',
          lieu: 'Tous jardins',
          jour: j,
          duree: '1h',
          priorite: 'normale',
          fixe: true
        });
      }
    }
    
    return taches.sort((a, b) => a.jour - b.jour || a.type.localeCompare(b.type));
  }, [culturesSelectionnees, semaineSelectionnee, marche, estDansSaison]);

  // Tâches groupées par jour
  const tachesParJour = useMemo(() => {
    const parJour = {};
    for (let j = 0; j < 7; j++) {
      parJour[j] = tachesSemaine.filter(t => t.jour === j);
    }
    return parJour;
  }, [tachesSemaine]);

  // État des jardins cette semaine
  const etatJardins = useMemo(() => {
    return jardins.map(jardin => {
      const culturesJardin = culturesSelectionnees.filter(c => {
        if (c.jardinId === jardin.id) return true;
        if (c.repartition && c.repartition[jardin.id]) return true;
        return false;
      });
      
      const planchesUtilisees = culturesJardin.reduce((sum, c) => {
        if (c.repartition && c.repartition[jardin.id]) {
          return sum + c.repartition[jardin.id];
        }
        return sum + (c.totalPlanches || 0);
      }, 0);
      
      // Compter les cultures en récolte cette semaine
      const enRecolte = culturesJardin.filter(c => {
        return (c.series || []).some(s => {
          const debut = s.semaineRecolteDebut || s.semaineDebut;
          const fin = s.semaineRecolteFin || s.semaineFin;
          return debut && fin && semaineSelectionnee >= debut && semaineSelectionnee <= fin;
        });
      });
      
      return {
        ...jardin,
        culturesCount: culturesJardin.length,
        planchesUtilisees,
        tauxOccupation: Math.round((planchesUtilisees / jardin.nombrePlanches) * 100),
        enRecolte: enRecolte.length
      };
    });
  }, [jardins, culturesSelectionnees, semaineSelectionnee]);

  // Toggle tâche complétée
  const toggleTacheComplete = (tacheId) => {
    setTachesCompletees(prev => ({
      ...prev,
      [tacheId]: !prev[tacheId]
    }));
  };

  // Statistiques
  const stats = {
    totalTaches: tachesSemaine.length,
    completees: Object.values(tachesCompletees).filter(Boolean).length,
    heuresEstimees: tachesSemaine.reduce((sum, t) => {
      const h = parseInt(t.duree) || 1;
      return sum + h;
    }, 0)
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════════
          📱 EN-TÊTE RESPONSIVE avec navigation temporelle
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
        {/* Header - Stack on mobile, row on desktop */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center">
              <Calendar className="w-6 h-6 md:w-7 md:h-7 mr-2 md:mr-3" />
              Agenda de la Ferme
            </h1>
            <p className="text-emerald-100 mt-1 text-sm md:text-base">
              Planification opérationnelle
            </p>
          </div>
          
          {/* 📱 Navigation semaine - Responsive */}
          <div className="flex items-center justify-center space-x-2 md:space-x-4 bg-white/20 rounded-lg p-2">
            <button 
              onClick={semainePrecedente}
              className="p-2 md:p-2 hover:bg-white/20 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            <div className="text-center min-w-[120px] md:min-w-[200px]">
              <p className="text-base md:text-lg font-bold">S{semaineSelectionnee}</p>
              <p className="text-xs md:text-sm text-emerald-100">
                {semaineInfo.debut} - {semaineInfo.fin}
              </p>
              <p className="text-xs text-emerald-200 hidden sm:block">{semaineInfo.mois}</p>
            </div>
            
            <button 
              onClick={semaineSuivante}
              className="p-2 md:p-2 hover:bg-white/20 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
        
        {/* Indicateur saison */}
        {estDansSaison ? (
          <div className="flex items-center space-x-2 text-emerald-100 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>En saison de vente (S{SAISON.debut}-S{SAISON.fin})</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-amber-200 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Hors saison de vente</span>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          📱 GRILLE PRINCIPALE - Stack on mobile, 3 cols on desktop
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* COLONNE 1 : BESOINS MARCHÉ */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="p-3 md:p-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-blue-900 text-sm md:text-base">Besoins Marché</h2>
              </div>
              <span className="text-xs md:text-sm text-blue-600">S{semaineSelectionnee}</span>
            </div>
          </div>
          
          <div className="p-3 md:p-4">
            {!estDansSaison ? (
              <p className="text-gray-500 text-center py-6 md:py-8 text-sm">Pas de ventes cette semaine</p>
            ) : (
              <>
                {/* Résumé clients - 📱 Toujours 3 colonnes mais plus compact */}
                <div className="grid grid-cols-3 gap-1 md:gap-2 mb-3 md:mb-4">
                  <div className="text-center p-1.5 md:p-2 bg-green-50 rounded-lg">
                    <Users className="w-3 h-3 md:w-4 md:h-4 mx-auto text-green-600 mb-0.5 md:mb-1" />
                    <p className="text-sm md:text-lg font-bold text-green-700">{marche.amap}</p>
                    <p className="text-[10px] md:text-xs text-green-600">AMAP</p>
                  </div>
                  <div className="text-center p-1.5 md:p-2 bg-orange-50 rounded-lg">
                    <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mx-auto text-orange-600 mb-0.5 md:mb-1" />
                    <p className="text-sm md:text-lg font-bold text-orange-700">{marche.marche}</p>
                    <p className="text-[10px] md:text-xs text-orange-600">Marché</p>
                  </div>
                  <div className="text-center p-1.5 md:p-2 bg-purple-50 rounded-lg">
                    <Home className="w-3 h-3 md:w-4 md:h-4 mx-auto text-purple-600 mb-0.5 md:mb-1" />
                    <p className="text-sm md:text-lg font-bold text-purple-700">{marche.restaurant}</p>
                    <p className="text-[10px] md:text-xs text-purple-600">Resto</p>
                  </div>
                </div>
                
                {/* Liste des légumes à récolter */}
                <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-2">À récolter :</h3>
                <div className="space-y-1.5 md:space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
                  {besoinsMarche && besoinsMarche.slice(0, 10).map(item => (
                    <div key={item.legume} className="flex items-center justify-between p-1.5 md:p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs md:text-sm font-medium capitalize truncate">{item.legume}</span>
                      <span className="text-xs md:text-sm text-gray-600 ml-2 flex-shrink-0">
                        {item.quantite.toFixed(1)} {item.unite}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* COLONNE 2 : TÂCHES DE LA SEMAINE */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="p-3 md:p-4 bg-indigo-50 border-b border-indigo-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-indigo-900 text-sm md:text-base">Tâches de la Semaine</h2>
              </div>
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                {stats.completees}/{stats.totalTaches}
              </span>
            </div>
            <p className="text-xs text-indigo-600 mt-1">~{stats.heuresEstimees}h estimées</p>
          </div>
          
          <div className="p-3 md:p-4">
            {/* 📱 Navigation par jour - Responsive avec jours courts sur mobile */}
            <div className="flex justify-between mb-3 md:mb-4 border-b pb-2 overflow-x-auto">
              {JOURS_SEMAINE.map((jour, idx) => {
                const tachesJour = tachesParJour[idx] || [];
                const hasHighPriority = tachesJour.some(t => t.priorite === 'haute');
                
                return (
                  <button
                    key={idx}
                    onClick={() => setJourSelectionne(idx)}
                    className={`px-1.5 md:px-2 py-1 rounded text-[10px] md:text-xs font-medium transition-colors relative min-w-[32px] md:min-w-[36px] ${
                      jourSelectionne === idx 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {/* Court sur mobile, long sur desktop */}
                    <span className="hidden sm:inline">{jour}</span>
                    <span className="sm:hidden">{JOURS_SEMAINE_COURT[idx]}</span>
                    {tachesJour.length > 0 && (
                      <span className={`absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full text-[8px] md:text-xs flex items-center justify-center ${
                        hasHighPriority ? 'bg-red-500 text-white' : 'bg-gray-400 text-white'
                      }`}>
                        {tachesJour.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Tâches du jour sélectionné */}
            <div className="space-y-2 max-h-60 md:max-h-80 overflow-y-auto">
              <h3 className="text-xs md:text-sm font-medium text-gray-700">
                {JOURS_SEMAINE[jourSelectionne]} - {semaineInfo.joursMois?.[jourSelectionne] || '?'} {semaineInfo.mois}
              </h3>
              
              {(tachesParJour[jourSelectionne] || []).length === 0 ? (
                <p className="text-gray-400 text-xs md:text-sm text-center py-4">Pas de tâche ce jour</p>
              ) : (
                (tachesParJour[jourSelectionne] || []).map(tache => {
                  const config = TYPES_TACHES[tache.type];
                  const Icon = config.icone;
                  const estComplete = tachesCompletees[tache.id];
                  
                  return (
                    <div 
                      key={tache.id}
                      className={`p-2 md:p-3 rounded-lg border-2 transition-all ${
                        estComplete 
                          ? 'bg-gray-50 border-gray-200 opacity-60' 
                          : `${config.couleur} border-current`
                      }`}
                    >
                      <div className="flex items-start space-x-2 md:space-x-3">
                        <button
                          onClick={() => toggleTacheComplete(tache.id)}
                          className={`mt-0.5 w-4 h-4 md:w-5 md:h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                            estComplete 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {estComplete && <CheckCircle className="w-2 h-2 md:w-3 md:h-3" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 md:space-x-2">
                            <Icon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                            <span className={`font-medium text-xs md:text-sm truncate ${estComplete ? 'line-through' : ''}`}>
                              {tache.description}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 md:space-x-3 mt-0.5 md:mt-1 text-[10px] md:text-xs opacity-75">
                            <span className="truncate">📍 {tache.lieu}</span>
                            <span className="flex-shrink-0">⏱ {tache.duree}</span>
                          </div>
                        </div>
                        
                        {tache.priorite === 'haute' && !estComplete && (
                          <span className="px-1 md:px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] md:text-xs flex-shrink-0">
                            !
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* COLONNE 3 : ÉTAT DES JARDINS */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="p-3 md:p-4 bg-green-50 border-b border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Home className="w-5 h-5 text-green-600" />
                <h2 className="font-bold text-green-900 text-sm md:text-base">État des Jardins</h2>
              </div>
              <span className="text-xs md:text-sm text-green-600">{jardins.length} jardins</span>
            </div>
          </div>
          
          <div className="p-3 md:p-4 space-y-2 md:space-y-3">
            {etatJardins.map(jardin => (
              <div 
                key={jardin.id}
                className="p-2 md:p-3 rounded-lg border"
                style={{ borderColor: (jardin.couleur || '#10B981') + '60' }}
              >
                <div className="flex items-center justify-between mb-1.5 md:mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: jardin.couleur || '#10B981' }}
                    />
                    <span className="font-medium text-xs md:text-sm truncate">{jardin.nom}</span>
                  </div>
                  {jardin.enRecolte > 0 && (
                    <span className="px-1.5 md:px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] md:text-xs flex-shrink-0">
                      🥬 {jardin.enRecolte}
                    </span>
                  )}
                </div>
                
                {/* Barre d'occupation */}
                <div className="h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, jardin.tauxOccupation)}%`,
                      backgroundColor: jardin.tauxOccupation > 90 ? '#EF4444' : 
                                       jardin.tauxOccupation > 70 ? '#F59E0B' : '#10B981'
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-500">
                  <span>{jardin.planchesUtilisees}/{jardin.nombrePlanches} pl.</span>
                  <span>{jardin.tauxOccupation}%</span>
                </div>
              </div>
            ))}
            
            {/* Résumé total */}
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="font-medium text-gray-700">Occupation totale</span>
                <span className="text-gray-600">
                  {etatJardins.reduce((sum, j) => sum + j.planchesUtilisees, 0)}/
                  {etatJardins.reduce((sum, j) => sum + j.nombrePlanches, 0)} pl.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          📱 VUE CALENDRIER MENSUEL - Responsive grid
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-md border p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="font-bold text-base md:text-lg flex items-center">
            <CalendarDays className="w-4 h-4 md:w-5 md:h-5 mr-2 text-gray-600" />
            Vue Calendrier - {semaineInfo.mois}
          </h2>
        </div>
        
        {/* 📱 Grille responsive : 2 colonnes mobile, 4 tablet, 7 desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 md:gap-2">
          {/* En-têtes - affichés uniquement sur md+ */}
          {JOURS_SEMAINE.map(jour => (
            <div key={jour} className="hidden md:block text-center text-xs md:text-sm font-medium text-gray-500 py-1 md:py-2">
              {jour}
            </div>
          ))}
          
          {/* Jours */}
          {Array.from({ length: 7 }, (_, idx) => {
            const tachesJour = tachesParJour[idx] || [];
            const jourMois = semaineInfo.joursMois?.[idx] || idx + 1;
            const estAujourd = idx === jourSelectionne;
            
            return (
              <div 
                key={idx}
                onClick={() => setJourSelectionne(idx)}
                className={`min-h-[80px] md:min-h-24 p-1.5 md:p-2 rounded-lg border-2 cursor-pointer transition-all ${
                  estAujourd 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  {/* Afficher jour court sur mobile */}
                  <div className="flex items-center space-x-1">
                    <span className="md:hidden text-[10px] text-gray-500">{JOURS_SEMAINE_COURT[idx]}</span>
                    <span className={`text-xs md:text-sm font-bold ${estAujourd ? 'text-indigo-600' : 'text-gray-700'}`}>
                      {jourMois}
                    </span>
                  </div>
                  {tachesJour.length > 0 && (
                    <span className="px-1 md:px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] md:text-xs">
                      {tachesJour.length}
                    </span>
                  )}
                </div>
                
                {/* Mini-liste des tâches */}
                <div className="space-y-0.5 md:space-y-1">
                  {tachesJour.slice(0, 2).map(tache => {
                    const config = TYPES_TACHES[tache.type];
                    return (
                      <div 
                        key={tache.id}
                        className={`px-1 md:px-1.5 py-0.5 rounded text-[9px] md:text-xs truncate ${config.couleur}`}
                      >
                        {tache.culture}
                      </div>
                    );
                  })}
                  {tachesJour.length > 2 && (
                    <p className="text-[9px] md:text-xs text-gray-400">+{tachesJour.length - 2}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende - 📱 Responsive wrap */}
      <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
        <h4 className="font-medium text-gray-700 mb-2 md:mb-3 text-sm md:text-base">Types de tâches</h4>
        <div className="flex flex-wrap gap-1.5 md:gap-3">
          {Object.entries(TYPES_TACHES).map(([type, config]) => {
            const Icon = config.icone;
            return (
              <div key={type} className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg ${config.couleur} flex items-center space-x-1 md:space-x-2`}>
                <Icon className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-[10px] md:text-sm font-medium">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AgendaPlanning;
