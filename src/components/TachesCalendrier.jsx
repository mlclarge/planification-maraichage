// TachesCalendrier_v20.jsx - VUE CALENDAIRE AVEC MOIS
// 🆕 V20 : En-tête MOIS + semaines pour chaque culture
// 🆕 V20 : Toggle entre vue semaines et vue mois
// 🆕 V20 : Dates concrètes (ex: S12 = 17-23 mars)

import React, { useState, useMemo } from 'react';
import { 
  Calendar, ChevronDown, ChevronRight, Clock, Sprout, 
  Droplets, Scissors, Package, Truck, Sun, Filter,
  List, CalendarDays, LayoutGrid
} from 'lucide-react';
import { SAISON } from '../utils/constantes';

// Mapping semaine → dates 2025
const SEMAINES_2025 = {
  1: { debut: '30 déc', fin: '5 jan', mois: 'Janvier' },
  2: { debut: '6 jan', fin: '12 jan', mois: 'Janvier' },
  3: { debut: '13 jan', fin: '19 jan', mois: 'Janvier' },
  4: { debut: '20 jan', fin: '26 jan', mois: 'Janvier' },
  5: { debut: '27 jan', fin: '2 fév', mois: 'Février' },
  6: { debut: '3 fév', fin: '9 fév', mois: 'Février' },
  7: { debut: '10 fév', fin: '16 fév', mois: 'Février' },
  8: { debut: '17 fév', fin: '23 fév', mois: 'Février' },
  9: { debut: '24 fév', fin: '2 mar', mois: 'Mars' },
  10: { debut: '3 mar', fin: '9 mar', mois: 'Mars' },
  11: { debut: '10 mar', fin: '16 mar', mois: 'Mars' },
  12: { debut: '17 mar', fin: '23 mar', mois: 'Mars' },
  13: { debut: '24 mar', fin: '30 mar', mois: 'Mars' },
  14: { debut: '31 mar', fin: '6 avr', mois: 'Avril' },
  15: { debut: '7 avr', fin: '13 avr', mois: 'Avril' },
  16: { debut: '14 avr', fin: '20 avr', mois: 'Avril' },
  17: { debut: '21 avr', fin: '27 avr', mois: 'Avril' },
  18: { debut: '28 avr', fin: '4 mai', mois: 'Mai' },
  19: { debut: '5 mai', fin: '11 mai', mois: 'Mai' },
  20: { debut: '12 mai', fin: '18 mai', mois: 'Mai' },
  21: { debut: '19 mai', fin: '25 mai', mois: 'Mai' },
  22: { debut: '26 mai', fin: '1 juin', mois: 'Juin' },
  23: { debut: '2 juin', fin: '8 juin', mois: 'Juin' },
  24: { debut: '9 juin', fin: '15 juin', mois: 'Juin' },
  25: { debut: '16 juin', fin: '22 juin', mois: 'Juin' },
  26: { debut: '23 juin', fin: '29 juin', mois: 'Juin' },
  27: { debut: '30 juin', fin: '6 juil', mois: 'Juillet' },
  28: { debut: '7 juil', fin: '13 juil', mois: 'Juillet' },
  29: { debut: '14 juil', fin: '20 juil', mois: 'Juillet' },
  30: { debut: '21 juil', fin: '27 juil', mois: 'Juillet' },
  31: { debut: '28 juil', fin: '3 août', mois: 'Août' },
  32: { debut: '4 août', fin: '10 août', mois: 'Août' },
  33: { debut: '11 août', fin: '17 août', mois: 'Août' },
  34: { debut: '18 août', fin: '24 août', mois: 'Août' },
  35: { debut: '25 août', fin: '31 août', mois: 'Août' },
  36: { debut: '1 sep', fin: '7 sep', mois: 'Septembre' },
  37: { debut: '8 sep', fin: '14 sep', mois: 'Septembre' },
  38: { debut: '15 sep', fin: '21 sep', mois: 'Septembre' },
  39: { debut: '22 sep', fin: '28 sep', mois: 'Septembre' },
  40: { debut: '29 sep', fin: '5 oct', mois: 'Octobre' },
  41: { debut: '6 oct', fin: '12 oct', mois: 'Octobre' },
  42: { debut: '13 oct', fin: '19 oct', mois: 'Octobre' },
  43: { debut: '20 oct', fin: '26 oct', mois: 'Octobre' },
  44: { debut: '27 oct', fin: '2 nov', mois: 'Novembre' },
  45: { debut: '3 nov', fin: '9 nov', mois: 'Novembre' },
  46: { debut: '10 nov', fin: '16 nov', mois: 'Novembre' },
  47: { debut: '17 nov', fin: '23 nov', mois: 'Novembre' },
  48: { debut: '24 nov', fin: '30 nov', mois: 'Novembre' },
  49: { debut: '1 déc', fin: '7 déc', mois: 'Décembre' },
  50: { debut: '8 déc', fin: '14 déc', mois: 'Décembre' },
  51: { debut: '15 déc', fin: '21 déc', mois: 'Décembre' },
  52: { debut: '22 déc', fin: '28 déc', mois: 'Décembre' }
};

// Types de tâches avec icônes et couleurs
const TYPES_TACHES = {
  semis: { 
    icone: Sprout, 
    label: 'Semis', 
    couleur: 'bg-blue-100 text-blue-700 border-blue-300',
    couleurBarre: '#3B82F6'
  },
  plantation: { 
    icone: Sun, 
    label: 'Plantation', 
    couleur: 'bg-green-100 text-green-700 border-green-300',
    couleurBarre: '#22C55E'
  },
  arrosage: { 
    icone: Droplets, 
    label: 'Arrosage', 
    couleur: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    couleurBarre: '#06B6D4'
  },
  taille: { 
    icone: Scissors, 
    label: 'Taille/Entretien', 
    couleur: 'bg-purple-100 text-purple-700 border-purple-300',
    couleurBarre: '#8B5CF6'
  },
  recolte: { 
    icone: Package, 
    label: 'Récolte', 
    couleur: 'bg-orange-100 text-orange-700 border-orange-300',
    couleurBarre: '#F97316'
  },
  livraison: { 
    icone: Truck, 
    label: 'Livraison', 
    couleur: 'bg-amber-100 text-amber-700 border-amber-300',
    couleurBarre: '#F59E0B'
  }
};

// Mois pour la navigation
const MOIS = [
  { id: 1, nom: 'Janvier', court: 'Jan', semaines: [1, 2, 3, 4] },
  { id: 2, nom: 'Février', court: 'Fév', semaines: [5, 6, 7, 8] },
  { id: 3, nom: 'Mars', court: 'Mar', semaines: [9, 10, 11, 12, 13] },
  { id: 4, nom: 'Avril', court: 'Avr', semaines: [14, 15, 16, 17] },
  { id: 5, nom: 'Mai', court: 'Mai', semaines: [18, 19, 20, 21] },
  { id: 6, nom: 'Juin', court: 'Juin', semaines: [22, 23, 24, 25, 26] },
  { id: 7, nom: 'Juillet', court: 'Juil', semaines: [27, 28, 29, 30] },
  { id: 8, nom: 'Août', court: 'Août', semaines: [31, 32, 33, 34, 35] },
  { id: 9, nom: 'Septembre', court: 'Sep', semaines: [36, 37, 38, 39] },
  { id: 10, nom: 'Octobre', court: 'Oct', semaines: [40, 41, 42, 43] },
  { id: 11, nom: 'Novembre', court: 'Nov', semaines: [44, 45, 46, 47, 48] },
  { id: 12, nom: 'Décembre', court: 'Déc', semaines: [49, 50, 51, 52] }
];

const TachesCalendrier = ({ culturesSelectionnees, marche }) => {
  const [vueMode, setVueMode] = useState('calendrier'); // 'liste', 'calendrier', 'mois'
  const [accordeonsCultures, setAccordeonsCultures] = useState({});
  const [filtreType, setFiltreType] = useState('tous');
  const [moisSelectionne, setMoisSelectionne] = useState(null); // null = tous les mois
  
  const toggleCulture = (id) => setAccordeonsCultures(prev => ({
    ...prev,
    [id]: !prev[id]
  }));

  // Générer les tâches pour chaque culture
  const tachesParCulture = useMemo(() => {
    return culturesSelectionnees.map(culture => {
      const taches = [];
      
      (culture.series || []).forEach((serie, idx) => {
        const serieId = `${culture.id}-S${idx + 1}`;
        
        // Semis
        if (serie.semaineSemis) {
          taches.push({
            id: `${serieId}-semis`,
            type: 'semis',
            semaine: serie.semaineSemis,
            serie: idx + 1,
            description: `Semis série ${idx + 1}`,
            lieu: culture.typeSemis === 'pepiniere' ? 'Pépinière' : 'Plein champ',
            duree: '30min-1h'
          });
        }
        
        // Plantation
        if (serie.semainePlantation) {
          taches.push({
            id: `${serieId}-plantation`,
            type: 'plantation',
            semaine: serie.semainePlantation,
            serie: idx + 1,
            description: `Plantation série ${idx + 1}`,
            lieu: culture.jardinNom || 'Jardin',
            duree: '1-2h',
            planches: serie.planchesUtilisees || 1
          });
        }
        
        // Récolte (sur plusieurs semaines)
        const recolteDebut = serie.semaineRecolteDebut || serie.semaineDebut;
        const recolteFin = serie.semaineRecolteFin || serie.semaineFin;
        
        if (recolteDebut && recolteFin) {
          // Ajouter une tâche de récolte pour chaque semaine
          for (let sem = recolteDebut; sem <= recolteFin; sem++) {
            taches.push({
              id: `${serieId}-recolte-S${sem}`,
              type: 'recolte',
              semaine: sem,
              serie: idx + 1,
              description: `Récolte série ${idx + 1}`,
              lieu: culture.jardinNom || 'Jardin',
              duree: '1-2h/semaine'
            });
          }
        }
        
        // Tâches d'entretien (taille pour tomates, etc.)
        if (['tomate', 'concombre', 'aubergine'].includes(culture.id)) {
          const debutEntretien = serie.semainePlantation ? serie.semainePlantation + 2 : 20;
          const finEntretien = recolteFin || 38;
          
          for (let sem = debutEntretien; sem <= finEntretien; sem += 2) {
            taches.push({
              id: `${serieId}-taille-S${sem}`,
              type: 'taille',
              semaine: sem,
              serie: idx + 1,
              description: `Taille/tuteurage série ${idx + 1}`,
              lieu: culture.jardinNom || 'Jardin',
              duree: '30min-1h'
            });
          }
        }
      });
      
      return {
        culture,
        taches: taches.sort((a, b) => a.semaine - b.semaine)
      };
    });
  }, [culturesSelectionnees]);

  // Toutes les tâches aplaties et triées
  const toutesTaches = useMemo(() => {
    const toutes = tachesParCulture.flatMap(({ culture, taches }) => 
      taches.map(t => ({ ...t, cultureNom: culture.nom, cultureId: culture.id }))
    );
    
    // Filtrer par type si nécessaire
    let filtrees = filtreType === 'tous' 
      ? toutes 
      : toutes.filter(t => t.type === filtreType);
    
    // Filtrer par mois si sélectionné
    if (moisSelectionne) {
      const mois = MOIS.find(m => m.id === moisSelectionne);
      if (mois) {
        filtrees = filtrees.filter(t => mois.semaines.includes(t.semaine));
      }
    }
    
    return filtrees.sort((a, b) => a.semaine - b.semaine);
  }, [tachesParCulture, filtreType, moisSelectionne]);

  // Tâches groupées par semaine
  const tachesParSemaine = useMemo(() => {
    const parSemaine = {};
    toutesTaches.forEach(tache => {
      if (!parSemaine[tache.semaine]) {
        parSemaine[tache.semaine] = [];
      }
      parSemaine[tache.semaine].push(tache);
    });
    return parSemaine;
  }, [toutesTaches]);

  // Tâches groupées par mois
  const tachesParMois = useMemo(() => {
    const parMois = {};
    MOIS.forEach(mois => {
      parMois[mois.id] = toutesTaches.filter(t => mois.semaines.includes(t.semaine));
    });
    return parMois;
  }, [toutesTaches]);

  // Statistiques
  const stats = useMemo(() => ({
    totalTaches: toutesTaches.length,
    parType: Object.keys(TYPES_TACHES).reduce((acc, type) => {
      acc[type] = toutesTaches.filter(t => t.type === type).length;
      return acc;
    }, {})
  }), [toutesTaches]);

  // Rendu d'une tâche
  const TacheCard = ({ tache, showCulture = false }) => {
    const config = TYPES_TACHES[tache.type];
    const Icon = config.icone;
    const semaineInfo = SEMAINES_2025[tache.semaine];
    
    return (
      <div className={`p-3 rounded-lg border-2 ${config.couleur} flex items-start space-x-3`}>
        <div className="p-2 rounded-full bg-white">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{tache.description}</span>
            <span className="text-xs opacity-75">{tache.duree}</span>
          </div>
          {showCulture && (
            <p className="text-xs mt-0.5 opacity-75">🌱 {tache.cultureNom}</p>
          )}
          <div className="flex items-center space-x-3 mt-1 text-xs opacity-75">
            <span>📍 {tache.lieu}</span>
            {tache.planches && <span>📐 {tache.planches} pl.</span>}
          </div>
          {semaineInfo && (
            <p className="text-xs mt-1 font-medium">
              S{tache.semaine} : {semaineInfo.debut} - {semaineInfo.fin}
            </p>
          )}
        </div>
      </div>
    );
  };

  // État vide
  if (culturesSelectionnees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Sélectionnez des cultures pour voir les tâches</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Calendar className="w-7 h-7 mr-3" />
              Calendrier des Tâches
            </h1>
            <p className="text-indigo-100 mt-1">
              {stats.totalTaches} interventions planifiées sur {culturesSelectionnees.length} cultures
            </p>
          </div>
          
          {/* Résumé par type */}
          <div className="flex space-x-4">
            {Object.entries(TYPES_TACHES).slice(0, 4).map(([type, config]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold">{stats.parType[type] || 0}</div>
                <div className="text-xs text-indigo-200">{config.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Toggle de vue */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setVueMode('liste')}
              className={`px-3 py-2 rounded flex items-center space-x-2 text-sm font-medium transition-colors ${
                vueMode === 'liste' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Liste</span>
            </button>
            <button
              onClick={() => setVueMode('calendrier')}
              className={`px-3 py-2 rounded flex items-center space-x-2 text-sm font-medium transition-colors ${
                vueMode === 'calendrier' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Calendrier</span>
            </button>
            <button
              onClick={() => setVueMode('mois')}
              className={`px-3 py-2 rounded flex items-center space-x-2 text-sm font-medium transition-colors ${
                vueMode === 'mois' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Par mois</span>
            </button>
          </div>

          {/* Filtre par type */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="tous">Toutes les tâches</option>
              {Object.entries(TYPES_TACHES).map(([type, config]) => (
                <option key={type} value={type}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Filtre par mois */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={moisSelectionne || ''}
              onChange={(e) => setMoisSelectionne(e.target.value ? parseInt(e.target.value) : null)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tous les mois</option>
              {MOIS.map(mois => (
                <option key={mois.id} value={mois.id}>{mois.nom}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          VUE LISTE - Tâches par culture avec chronologie
          ═══════════════════════════════════════════════════════════════════════ */}
      {vueMode === 'liste' && (
        <div className="space-y-4">
          {tachesParCulture.map(({ culture, taches }) => {
            const tachesFiltrees = filtreType === 'tous' 
              ? taches 
              : taches.filter(t => t.type === filtreType);
            
            if (tachesFiltrees.length === 0) return null;
            
            const isOpen = accordeonsCultures[culture.id];
            
            return (
              <div key={culture.id} className="bg-white rounded-lg shadow-md border overflow-hidden">
                {/* Header culture */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => toggleCulture(culture.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🌱</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{culture.nom}</h3>
                      <p className="text-sm text-gray-500">
                        {tachesFiltrees.length} tâches • {culture.series?.length || 0} séries
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Contenu - Chronologie avec MOIS */}
                {isOpen && (
                  <div className="p-4 border-t bg-gray-50">
                    {/* 🆕 V20 : En-tête avec MOIS */}
                    <div className="mb-4 overflow-x-auto">
                      <div className="flex border-b pb-2 mb-2" style={{ minWidth: '800px' }}>
                        <div className="w-32 flex-shrink-0"></div>
                        <div className="flex-1 flex">
                          {MOIS.filter(m => m.id >= 3 && m.id <= 10).map(mois => (
                            <div 
                              key={mois.id}
                              className="flex-1 text-center text-xs font-bold text-gray-700 border-r border-gray-200"
                            >
                              {mois.nom}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Ligne des semaines */}
                      <div className="flex mb-4" style={{ minWidth: '800px' }}>
                        <div className="w-32 flex-shrink-0 text-xs text-gray-400">Semaines</div>
                        <div className="flex-1 flex">
                          {Array.from({ length: 35 }, (_, i) => i + 10).map(sem => (
                            <div 
                              key={sem}
                              className={`flex-1 text-center text-xs ${
                                sem >= SAISON.debut && sem <= SAISON.fin 
                                  ? 'bg-green-50 text-green-700 font-medium' 
                                  : 'text-gray-400'
                              }`}
                              style={{ minWidth: '20px' }}
                            >
                              {sem % 2 === 0 ? sem : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Barres de Gantt par type de tâche */}
                    <div className="space-y-3" style={{ minWidth: '800px' }}>
                      {Object.entries(TYPES_TACHES).map(([type, config]) => {
                        const tachesType = tachesFiltrees.filter(t => t.type === type);
                        if (tachesType.length === 0) return null;
                        
                        const Icon = config.icone;
                        const semaines = tachesType.map(t => t.semaine);
                        const minSem = Math.min(...semaines);
                        const maxSem = Math.max(...semaines);
                        
                        return (
                          <div key={type} className="flex items-center">
                            <div className="w-32 flex-shrink-0 flex items-center space-x-2">
                              <Icon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{config.label}</span>
                            </div>
                            <div className="flex-1 h-6 bg-gray-100 rounded relative">
                              {/* Barre continue */}
                              <div
                                className="absolute h-full rounded"
                                style={{
                                  left: `${((minSem - 10) / 35) * 100}%`,
                                  width: `${((maxSem - minSem + 1) / 35) * 100}%`,
                                  backgroundColor: config.couleurBarre,
                                  opacity: 0.7
                                }}
                              />
                              {/* Points individuels */}
                              {tachesType.map((tache, idx) => (
                                <div
                                  key={idx}
                                  className="absolute w-3 h-3 rounded-full border-2 border-white shadow"
                                  style={{
                                    left: `${((tache.semaine - 10) / 35) * 100}%`,
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: config.couleurBarre
                                  }}
                                  title={`S${tache.semaine}: ${tache.description}`}
                                />
                              ))}
                            </div>
                            <div className="w-20 text-right text-xs text-gray-500">
                              {tachesType.length}×
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Liste détaillée */}
                    <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tachesFiltrees.slice(0, 12).map(tache => (
                        <TacheCard key={tache.id} tache={tache} />
                      ))}
                      {tachesFiltrees.length > 12 && (
                        <p className="col-span-full text-sm text-gray-500 text-center">
                          ... et {tachesFiltrees.length - 12} autres tâches
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          VUE CALENDRIER - Semaine par semaine
          ═══════════════════════════════════════════════════════════════════════ */}
      {vueMode === 'calendrier' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {Object.entries(tachesParSemaine)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .slice(0, 20)
              .map(([semaine, taches]) => {
                const semaineInfo = SEMAINES_2025[parseInt(semaine)];
                
                return (
                  <div key={semaine} className="border-l-4 border-indigo-500 pl-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          Semaine {semaine}
                        </h3>
                        {semaineInfo && (
                          <p className="text-sm text-gray-500">
                            {semaineInfo.debut} - {semaineInfo.fin} • {semaineInfo.mois}
                          </p>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {taches.length} tâche{taches.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {taches.map(tache => (
                        <TacheCard key={tache.id} tache={tache} showCulture={true} />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
          
          {Object.keys(tachesParSemaine).length > 20 && (
            <p className="mt-4 text-center text-gray-500">
              Affichage limité aux 20 premières semaines
            </p>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          VUE PAR MOIS - Grille mensuelle
          ═══════════════════════════════════════════════════════════════════════ */}
      {vueMode === 'mois' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOIS.filter(mois => mois.id >= 3 && mois.id <= 10).map(mois => {
            const tachesMois = tachesParMois[mois.id] || [];
            const estSaisonVente = mois.id >= 5 && mois.id <= 9;
            
            return (
              <div 
                key={mois.id}
                className={`bg-white rounded-lg shadow-md border-2 overflow-hidden ${
                  estSaisonVente ? 'border-green-300' : 'border-gray-200'
                }`}
              >
                <div className={`p-3 ${estSaisonVente ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{mois.nom}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      estSaisonVente ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tachesMois.length} tâches
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">S{mois.semaines[0]} - S{mois.semaines[mois.semaines.length - 1]}</p>
                </div>
                
                <div className="p-3 max-h-64 overflow-y-auto">
                  {tachesMois.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Aucune tâche</p>
                  ) : (
                    <div className="space-y-2">
                      {/* Résumé par type */}
                      <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b">
                        {Object.entries(TYPES_TACHES).map(([type, config]) => {
                          const count = tachesMois.filter(t => t.type === type).length;
                          if (count === 0) return null;
                          const Icon = config.icone;
                          return (
                            <span 
                              key={type}
                              className={`px-2 py-1 rounded text-xs flex items-center space-x-1 ${config.couleur}`}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{count}</span>
                            </span>
                          );
                        })}
                      </div>
                      
                      {/* Liste des tâches */}
                      {tachesMois.slice(0, 8).map(tache => {
                        const config = TYPES_TACHES[tache.type];
                        const Icon = config.icone;
                        return (
                          <div key={tache.id} className="flex items-center space-x-2 text-sm">
                            <Icon className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600 truncate">{tache.cultureNom}</span>
                            <span className="text-gray-400">S{tache.semaine}</span>
                          </div>
                        );
                      })}
                      {tachesMois.length > 8 && (
                        <p className="text-xs text-gray-400">+{tachesMois.length - 8} autres</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Légende */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h4 className="font-medium text-gray-700 mb-3">Légende des tâches</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(TYPES_TACHES).map(([type, config]) => {
            const Icon = config.icone;
            return (
              <div key={type} className={`px-3 py-2 rounded-lg border ${config.couleur} flex items-center space-x-2`}>
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TachesCalendrier;
