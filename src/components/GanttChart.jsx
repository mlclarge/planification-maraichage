// GanttChart_v20.jsx - COULEURS AMÉLIORÉES ET PHASES DISTINCTES
// 🎯 FIX : La pépinière est maintenant VISIBLE avec des couleurs contrastées
// 🆕 V20 : En-tête avec MOIS + semaines, phases séparées, largeur minimum

import React, { useState, useMemo } from 'react';
import { SAISON } from '../utils/constantes';
import { Calendar, ChevronDown, Lightbulb, Info, Eye, EyeOff } from 'lucide-react';

const GanttChart = ({ culturesSelectionnees, jardins }) => {
  const [accordeonsJardins, setAccordeonsJardins] = useState({});
  const [accordeonsCultures, setAccordeonsCultures] = useState({});
  const [accordeonFenetres, setAccordeonFenetres] = useState(false);
  const [vueMode, setVueMode] = useState('saison'); // 'saison' ou 'annee'
  const [showTooltip, setShowTooltip] = useState(null);

  // Logique accordéons corrigée V19
  const toggleJardin = (id) => setAccordeonsJardins(prev => ({ 
    ...prev, 
    [id]: prev[id] === true ? false : true 
  }));
  
  const toggleCulture = (id) => setAccordeonsCultures(prev => ({ 
    ...prev, 
    [id]: prev[id] === true ? false : true 
  }));
  
  const isJardinOpen = (id) => accordeonsJardins[id] === true;
  const isCultureOpen = (id) => accordeonsCultures[id] === true;

  const ouvrirTousJardins = () => {
    const ouvert = {};
    jardins.forEach(j => { ouvert[j.id] = true; });
    setAccordeonsJardins(ouvert);
  };
  
  const fermerTousJardins = () => {
    const ferme = {};
    jardins.forEach(j => { ferme[j.id] = false; });
    setAccordeonsJardins(ferme);
  };

  // 🆕 V20 : COULEURS PLUS CONTRASTÉES
  const COULEURS_PHASES = {
    pepiniere: {
      bg: '#3B82F6',      // Bleu vif (était #93c5fd - trop clair)
      border: '#1D4ED8',
      label: 'Pépinière'
    },
    croissance: {
      bg: '#22C55E',      // Vert vif (était #86efac)
      border: '#16A34A',
      label: 'Croissance'
    },
    recolte: {
      bg: '#F97316',      // Orange vif (était #fdba74)
      border: '#EA580C',
      label: 'Récolte'
    }
  };

  // 🆕 V20 : Mapping semaine → mois
  const getMoisFromSemaine = (semaine) => {
    // Approximation : semaine 1 = début janvier
    const mois = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    // Semaine 1 = début janvier, semaine 52 = fin décembre
    const moisIndex = Math.floor((semaine - 1) / 4.33);
    return mois[Math.min(11, Math.max(0, moisIndex))];
  };

  // Configuration de la vue
  const semaineDebut = vueMode === 'annee' ? 1 : 10;
  const semaineFin = vueMode === 'annee' ? 52 : 44;
  const nombreSemaines = semaineFin - semaineDebut + 1;

  // Générer les colonnes avec mois
  const colonnes = useMemo(() => {
    const cols = [];
    let currentMois = '';
    let moisStart = 0;
    
    for (let s = semaineDebut; s <= semaineFin; s++) {
      const mois = getMoisFromSemaine(s);
      if (mois !== currentMois) {
        if (currentMois) {
          cols.push({ type: 'mois', label: currentMois, start: moisStart, end: s - 1 });
        }
        currentMois = mois;
        moisStart = s;
      }
    }
    // Dernier mois
    if (currentMois) {
      cols.push({ type: 'mois', label: currentMois, start: moisStart, end: semaineFin });
    }
    
    return cols;
  }, [semaineDebut, semaineFin]);

  // Calcul des fenêtres d'opportunité
  const fenetresOpportunite = useMemo(() => {
    const fenetres = [];
    
    culturesSelectionnees.forEach(culture => {
      if (!culture.series || culture.series.length === 0) return;
      
      const seriesParPlanche = {};
      culture.series.forEach(serie => {
        const plancheId = serie.plancheId || serie.id;
        if (!seriesParPlanche[plancheId]) seriesParPlanche[plancheId] = [];
        seriesParPlanche[plancheId].push(serie);
      });
      
      Object.entries(seriesParPlanche).forEach(([plancheId, series]) => {
        const seriesTriees = [...series].sort((a, b) => 
          (a.semaineDebut || a.occupationDebut || 0) - (b.semaineDebut || b.occupationDebut || 0)
        );
        
        const premiereSerie = seriesTriees[0];
        const debutPremiere = premiereSerie?.semainePlantation || premiereSerie?.occupationDebut || 18;
        if (debutPremiere > 14) {
          const duree = debutPremiere - 10;
          if (duree >= 4) {
            fenetres.push({
              culture: culture.nom,
              planche: `Pl.${plancheId}`,
              type: 'Avant',
              debut: 10,
              fin: debutPremiere,
              duree,
              suggestion: duree >= 6 ? 'Radis ou Mesclun' : 'Radis'
            });
          }
        }
        
        const derniereSerie = seriesTriees[seriesTriees.length - 1];
        const finDerniere = derniereSerie?.semaineRecolteFin || derniereSerie?.occupationFin || 38;
        if (finDerniere < 42) {
          const duree = 44 - finDerniere;
          if (duree >= 4) {
            fenetres.push({
              culture: culture.nom,
              planche: `Pl.${plancheId}`,
              type: 'Après',
              debut: finDerniere,
              fin: 44,
              duree,
              suggestion: duree >= 6 ? 'Mesclun ou Épinard' : 'Mesclun'
            });
          }
        }
      });
    });
    
    return fenetres.sort((a, b) => b.duree - a.duree);
  }, [culturesSelectionnees]);

  // 🆕 V20 : Composant pour rendre une barre de phase avec largeur minimum
  const BarrePhase = ({ phase, debut, fin, totalSemaines, semaineDebutVue }) => {
    if (!debut || !fin || debut > fin) return null;
    
    const debutRelatif = Math.max(0, (debut - semaineDebutVue) / totalSemaines);
    const finRelatif = Math.min(1, (fin - semaineDebutVue + 1) / totalSemaines);
    let largeur = finRelatif - debutRelatif;
    
    // 🆕 Largeur minimum pour visibilité (au moins 2% ou 1 semaine)
    const largeurMin = Math.max(0.02, 1 / totalSemaines);
    if (largeur < largeurMin && largeur > 0) {
      largeur = largeurMin;
    }
    
    if (largeur <= 0) return null;
    
    const couleur = COULEURS_PHASES[phase];
    
    return (
      <div
        className="absolute h-full rounded-sm border"
        style={{
          left: `${debutRelatif * 100}%`,
          width: `${largeur * 100}%`,
          backgroundColor: couleur.bg,
          borderColor: couleur.border,
          minWidth: '4px' // Largeur minimum en pixels
        }}
        title={`${couleur.label}: S${debut}-S${fin}`}
      />
    );
  };

  // État vide
  if (culturesSelectionnees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Assignez des cultures aux jardins pour voir la planification</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gantt Principal */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Diagramme de Gantt - Planification</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Toggle vue */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setVueMode('saison')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  vueMode === 'saison' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                }`}
              >
                Saison (S10-S44)
              </button>
              <button
                onClick={() => setVueMode('annee')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  vueMode === 'annee' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                }`}
              >
                Année complète
              </button>
            </div>
            
            {/* Bouton opportunités */}
            <button
              onClick={() => setAccordeonFenetres(!accordeonFenetres)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                accordeonFenetres ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Opportunités ({fenetresOpportunite.length})</span>
            </button>
            
            {/* Boutons ouvrir/fermer */}
            <div className="flex space-x-2">
              <button onClick={ouvrirTousJardins} className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                📂 Tout ouvrir
              </button>
              <button onClick={fermerTousJardins} className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                📁 Tout fermer
              </button>
            </div>
          </div>
        </div>

        {/* 🆕 V20 : En-tête avec MOIS au-dessus des semaines */}
        <div className="mb-4 overflow-x-auto">
          <div style={{ minWidth: `${nombreSemaines * 24}px` }}>
            {/* Ligne des MOIS */}
            <div className="flex h-6 mb-1">
              <div className="w-24 flex-shrink-0"></div>
              <div className="flex-1 relative flex">
                {colonnes.map((col, idx) => {
                  const startPos = ((col.start - semaineDebut) / nombreSemaines) * 100;
                  const width = ((col.end - col.start + 1) / nombreSemaines) * 100;
                  return (
                    <div
                      key={idx}
                      className="absolute h-full flex items-center justify-center text-xs font-bold text-gray-700 bg-gray-100 border-r border-gray-300"
                      style={{ left: `${startPos}%`, width: `${width}%` }}
                    >
                      {col.label}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Ligne des SEMAINES */}
            <div className="flex h-5">
              <div className="w-24 flex-shrink-0 text-xs text-gray-400 font-medium flex items-center">
                Semaines →
              </div>
              <div className="flex-1 flex">
                {Array.from({ length: nombreSemaines }, (_, i) => semaineDebut + i).map(sem => (
                  <div 
                    key={sem} 
                    className={`flex-1 text-center text-xs border-r border-gray-100 ${
                      sem >= SAISON.debut && sem <= SAISON.fin ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-400'
                    }`}
                    style={{ minWidth: '20px' }}
                  >
                    {sem % 2 === 0 ? sem : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calendrier par jardin avec accordéons */}
        <div className="space-y-3">
          {jardins.map(jardin => {
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
            
            const isOpen = isJardinOpen(jardin.id);

            return (
              <div 
                key={jardin.id} 
                className="border-2 rounded-xl overflow-hidden" 
                style={{ borderColor: (jardin.couleur || '#f59e0b') + '80' }}
              >
                {/* Header Jardin */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                  style={{ backgroundColor: (jardin.couleur || '#f59e0b') + '15' }}
                  onClick={() => toggleJardin(jardin.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow"
                      style={{ backgroundColor: jardin.couleur || '#f59e0b' }}
                    >
                      {jardin.nom?.charAt(0) || 'J'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{jardin.nom}</h3>
                      <p className="text-sm text-gray-500">
                        {culturesJardin.length} culture{culturesJardin.length > 1 ? 's' : ''} • {planchesUtilisees}/{jardin.nombrePlanches} pl. • {jardin.longueurPlanche}m
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Contenu Jardin */}
                {isOpen && (
                  <div className="p-4 border-t bg-white space-y-3" style={{ borderColor: (jardin.couleur || '#f59e0b') + '30' }}>
                    {culturesJardin.length === 0 ? (
                      <p className="text-gray-400 text-sm italic text-center py-4">Aucune culture assignée</p>
                    ) : (
                      culturesJardin.map(culture => {
                        const isCultOpen = isCultureOpen(culture.id);
                        const planchesCulture = culture.repartition?.[jardin.id] || culture.totalPlanches || 0;
                        
                        return (
                          <div key={culture.id} className="border rounded-lg overflow-hidden">
                            {/* Header Culture */}
                            <div 
                              className="p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between bg-gray-50"
                              onClick={() => toggleCulture(culture.id)}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">🌱</span>
                                <span className="font-semibold text-gray-800">{culture.nom}</span>
                                <span className="text-xs text-gray-500">
                                  ({culture.series?.length || 0} série{(culture.series?.length || 0) > 1 ? 's' : ''} • {planchesCulture} pl.)
                                </span>
                                {culture.intercalee && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                    🔗 Intercalée
                                  </span>
                                )}
                              </div>
                              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isCultOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {/* 🆕 V20 : Contenu Culture - Gantt avec 3 PHASES SÉPARÉES */}
                            {isCultOpen && (
                              <div className="p-3 bg-white border-t overflow-x-auto">
                                {(() => {
                                  const planchesMap = {};
                                  (culture.series || []).forEach(serie => {
                                    const plancheId = serie.plancheId || serie.id;
                                    if (!planchesMap[plancheId]) planchesMap[plancheId] = [];
                                    planchesMap[plancheId].push(serie);
                                  });
                                  
                                  return Object.entries(planchesMap).slice(0, 10).map(([plancheId, series]) => (
                                    <div key={plancheId} className="flex items-center mb-2" style={{ minWidth: `${nombreSemaines * 24}px` }}>
                                      <div className="w-24 flex-shrink-0 text-xs text-gray-500 font-medium">
                                        Pl. {plancheId}
                                      </div>
                                      <div className="flex-1 h-7 bg-gray-100 rounded relative">
                                        {/* Zone de vente (fond) */}
                                        <div 
                                          className="absolute h-full bg-green-100 opacity-40"
                                          style={{
                                            left: `${((SAISON.debut - semaineDebut) / nombreSemaines) * 100}%`,
                                            width: `${((SAISON.fin - SAISON.debut + 1) / nombreSemaines) * 100}%`
                                          }}
                                        />
                                        
                                        {/* 🆕 V20 : Barres des séries avec 3 PHASES SÉPARÉES */}
                                        {series.map((serie, idx) => {
                                          const semis = serie.semaineSemis || serie.dates?.semis;
                                          const plantation = serie.semainePlantation || serie.dates?.plantation;
                                          const recolteDebut = serie.semaineRecolteDebut || serie.semaineDebut || serie.dates?.recolteDebut;
                                          const recolteFin = serie.semaineRecolteFin || serie.semaineFin || serie.dates?.recolteFin;
                                          
                                          if (!recolteDebut || !recolteFin) return null;
                                          
                                          // Calculer les périodes de chaque phase
                                          const pepiniereDebut = semis;
                                          const pepiniereFin = plantation ? plantation - 1 : null;
                                          
                                          const croissanceDebut = plantation || recolteDebut - 4;
                                          const croissanceFin = recolteDebut - 1;
                                          
                                          return (
                                            <React.Fragment key={idx}>
                                              {/* Phase PÉPINIÈRE (bleu) */}
                                              {pepiniereDebut && pepiniereFin && pepiniereFin >= pepiniereDebut && (
                                                <BarrePhase
                                                  phase="pepiniere"
                                                  debut={pepiniereDebut}
                                                  fin={pepiniereFin}
                                                  totalSemaines={nombreSemaines}
                                                  semaineDebutVue={semaineDebut}
                                                />
                                              )}
                                              
                                              {/* Phase CROISSANCE (vert) */}
                                              {croissanceDebut && croissanceFin && croissanceFin >= croissanceDebut && (
                                                <BarrePhase
                                                  phase="croissance"
                                                  debut={croissanceDebut}
                                                  fin={croissanceFin}
                                                  totalSemaines={nombreSemaines}
                                                  semaineDebutVue={semaineDebut}
                                                />
                                              )}
                                              
                                              {/* Phase RÉCOLTE (orange) */}
                                              <BarrePhase
                                                phase="recolte"
                                                debut={recolteDebut}
                                                fin={recolteFin}
                                                totalSemaines={nombreSemaines}
                                                semaineDebutVue={semaineDebut}
                                              />
                                            </React.Fragment>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ));
                                })()}
                                
                                {Object.keys(culture.series?.reduce((acc, s) => { 
                                  acc[s.plancheId || s.id] = true; 
                                  return acc; 
                                }, {}) || {}).length > 10 && (
                                  <p className="text-xs text-gray-400 italic mt-2">
                                    ... et {Object.keys(culture.series?.reduce((acc, s) => { acc[s.plancheId || s.id] = true; return acc; }, {}) || {}).length - 10} autres planches
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 🆕 V20 : LÉGENDE AMÉLIORÉE avec couleurs vives */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <div 
                className="w-5 h-5 rounded border-2" 
                style={{ backgroundColor: COULEURS_PHASES.pepiniere.bg, borderColor: COULEURS_PHASES.pepiniere.border }}
              />
              <span className="font-medium">Pépinière</span>
              <span className="text-xs text-gray-500">(semis → plantation)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-5 h-5 rounded border-2" 
                style={{ backgroundColor: COULEURS_PHASES.croissance.bg, borderColor: COULEURS_PHASES.croissance.border }}
              />
              <span className="font-medium">Croissance</span>
              <span className="text-xs text-gray-500">(en terre)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-5 h-5 rounded border-2" 
                style={{ backgroundColor: COULEURS_PHASES.recolte.bg, borderColor: COULEURS_PHASES.recolte.border }}
              />
              <span className="font-medium">Récolte</span>
              <span className="text-xs text-gray-500">(production)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded bg-green-100 border-2 border-green-300"></div>
              <span className="font-medium">Saison de vente</span>
              <span className="text-xs text-gray-500">(S{SAISON.debut}-S{SAISON.fin})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fenêtres d'opportunité */}
      {accordeonFenetres && (
        <div className="bg-white rounded-lg shadow-md border-2 border-yellow-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-900">
                Fenêtres d'Opportunité pour Cultures Intercalaires
              </h3>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
                {fenetresOpportunite.length}
              </span>
            </div>
          </div>

          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <Info className="w-4 h-4 inline mr-2" />
              <strong>C'est quoi ?</strong> Les fenêtres d'opportunité sont des périodes où vos planches sont libres 
              (avant plantation ou après récolte). Vous pouvez y semer des cultures rapides comme les Radis ou le Mesclun 
              pour maximiser la production sans ajouter de planches.
            </p>
          </div>

          {fenetresOpportunite.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune fenêtre d'opportunité détectée</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-yellow-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Culture hôte</th>
                    <th className="px-3 py-2 text-left">Planche</th>
                    <th className="px-3 py-2 text-center">Position</th>
                    <th className="px-3 py-2 text-center">Période</th>
                    <th className="px-3 py-2 text-center">Durée</th>
                    <th className="px-3 py-2 text-left">Suggestion</th>
                  </tr>
                </thead>
                <tbody>
                  {fenetresOpportunite.slice(0, 20).map((fenetre, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 font-medium">{fenetre.culture}</td>
                      <td className="px-3 py-2 text-gray-600">{fenetre.planche}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          fenetre.type === 'Avant' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {fenetre.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-gray-600">S{fenetre.debut} → S{fenetre.fin}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`font-bold ${fenetre.duree >= 6 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {fenetre.duree} sem
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {fenetre.suggestion}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {fenetresOpportunite.length > 20 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ... et {fenetresOpportunite.length - 20} autres fenêtres
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GanttChart;
