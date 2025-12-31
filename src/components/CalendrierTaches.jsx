import React, { useState } from 'react';
import { ChevronDown, Clock, Calendar, Wrench, Leaf } from 'lucide-react';

// Données de la charte des tâches (nb jours après implantation)
const charteTaches = {
  'Ail': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Aneth': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: 10, herse2: null, bioDisque: null, binette: 17, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Basilic': { couvreSol: 'Couvre-sol tissé', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: 21, tondre: null },
  'Betteraves': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: 12, binette: 20, desherbageMain: null, bore1: 20, bore2: null, paillage: null, pincer: null, tondre: null },
  'Betteraves conservation': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: 20, binette: 27, desherbageMain: null, bore1: 30, bore2: null, paillage: null, pincer: null, tondre: null },
  'Bettes à carde': { couvreSol: 'Couvre-sol tissé + filet anti-insecte', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: 20, bore2: 50, paillage: null, pincer: null, tondre: null },
  'Bok choy': { couvreSol: 'Filet anti-insecte ou couverture flottante', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: 12, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Carottes': { couvreSol: null, fauxSemis: -7, pyrodesherbeur: 4, herse1: 10, herse2: null, bioDisque: 21, binette: null, desherbageMain: 35, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Céleri-rave': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: 20, bore2: 34, paillage: null, pincer: null, tondre: null },
  'Cerises de terre': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Choux et brocoli': { couvreSol: 'Filet anti-insecte ou couverture flottante', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: 14, bore2: null, paillage: 21, pincer: null, tondre: null },
  'Choux frisés': { couvreSol: 'Couvre-sol tissé + filet anti-insecte', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: 20, bore2: 50, paillage: null, pincer: null, tondre: null },
  'Choux frisés Mini': { couvreSol: 'Filet anti-insecte ou couverture flottante', fauxSemis: null, pyrodesherbeur: null, herse1: 10, herse2: 17, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Choux-fleurs': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: 20, desherbageMain: null, bore1: 20, bore2: 50, paillage: 20, pincer: null, tondre: null },
  'Choux-raves': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: 10, herse2: null, bioDisque: null, binette: 17, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Coriandre': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: 10, herse2: null, bioDisque: null, binette: 17, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Courges hiver': { couvreSol: 'Couvre-sol tissé + filet anti-insecte', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Courgettes': { couvreSol: 'Couvre-sol tissé + filet anti-insecte', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Épinard SD': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: 14, herse2: 21, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Épinard TR': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: 10, herse2: 17, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Fenouil Mini': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: 10, herse2: null, bioDisque: 17, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Frisées': { couvreSol: 'Avec ou sans couvre-sol tissé', fauxSemis: null, pyrodesherbeur: null, herse1: 14, herse2: 21, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Haricots grimpants': { couvreSol: 'Couvre-sol tissé + tuteurage', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: 49, tondre: null },
  'Haricots nains': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: 14, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Laitues': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: 12, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Melons': { couvreSol: 'Couvre-sol tissé + filet anti-insecte', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: 21, tondre: null },
  'Mesclun': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: 10, herse2: 17, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Moutarde': { couvreSol: 'Filet anti-insecte ou couverture flottante', fauxSemis: null, pyrodesherbeur: null, herse1: 10, herse2: 17, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Oignons': { couvreSol: 'Peut être planté sur couvre-sol', fauxSemis: -12, pyrodesherbeur: 0, herse1: null, herse2: null, bioDisque: 10, binette: null, desherbageMain: 55, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Oignons verts': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: 10, herse2: null, bioDisque: 17, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Poireaux': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: 27, binette: 12, desherbageMain: null, bore1: null, bore2: null, paillage: 49, pincer: null, tondre: null },
  'Pois sucrés': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: 14, desherbageMain: null, bore1: null, bore2: null, paillage: 25, pincer: null, tondre: null },
  'Rabiole': { couvreSol: 'Filet anti-insecte ou couverture flottante', fauxSemis: null, pyrodesherbeur: null, herse1: 10, herse2: 17, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Radis': { couvreSol: 'Filet anti-insecte ou couverture flottante', fauxSemis: null, pyrodesherbeur: null, herse1: 10, herse2: 17, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Radis hiver': { couvreSol: 'Filet anti-insecte', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Rapini': { couvreSol: 'Filet anti-insecte ou couverture flottante', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: 12, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Roquette': { couvreSol: 'Filet anti-insecte ou couverture flottante', fauxSemis: null, pyrodesherbeur: null, herse1: 10, herse2: 17, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Salanova': { couvreSol: 'Couvre-sol tissé', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Sucrines': { couvreSol: null, fauxSemis: null, pyrodesherbeur: null, herse1: 14, herse2: 21, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: null, tondre: null },
  'Tomates': { couvreSol: 'Couvre-sol tissé + tuteurage', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: 21, bore2: 42, paillage: null, pincer: 28, tondre: null },
  'Concombres': { couvreSol: 'Couvre-sol tissé + tuteurage', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: null, bore2: null, paillage: null, pincer: 21, tondre: null },
  'Poivrons': { couvreSol: 'Couvre-sol tissé', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: 21, bore2: 42, paillage: null, pincer: null, tondre: null },
  'Aubergines': { couvreSol: 'Couvre-sol tissé', fauxSemis: null, pyrodesherbeur: null, herse1: null, herse2: null, bioDisque: null, binette: null, desherbageMain: null, bore1: 21, bore2: 42, paillage: null, pincer: null, tondre: null },
};

// Temps estimé par tâche (en minutes par planche)
const tempsTaches = {
  fauxSemis: { nom: 'Faux semis', temps: 5, categorie: 'Préparation sol', icon: '🌱' },
  pyrodesherbeur: { nom: 'Pyrodésherbeur', temps: 3, categorie: 'Désherbage', icon: '🔥' },
  herse1: { nom: 'Herse étrille 1', temps: 4, categorie: 'Désherbage', icon: '⚙️' },
  herse2: { nom: 'Herse étrille 2', temps: 4, categorie: 'Désherbage', icon: '⚙️' },
  bioDisque: { nom: 'Bio-disque', temps: 6, categorie: 'Désherbage', icon: '💿' },
  binette: { nom: 'Binette', temps: 15, categorie: 'Désherbage', icon: '🔧' },
  desherbageMain: { nom: 'Désherbage main', temps: 30, categorie: 'Désherbage', icon: '✋' },
  bore1: { nom: 'Bore/algues 1', temps: 5, categorie: 'Fertilisation', icon: '💧' },
  bore2: { nom: 'Bore/algues 2', temps: 5, categorie: 'Fertilisation', icon: '💧' },
  paillage: { nom: 'Paillage/épandage', temps: 20, categorie: 'Protection', icon: '🌾' },
  pincer: { nom: 'Pincer/couper têtes', temps: 10, categorie: 'Taille', icon: '✂️' },
  tondre: { nom: 'Tondre et bâcher', temps: 15, categorie: 'Fin culture', icon: '🏁' },
};

// Temps estimés pour tâches standards
const tempsStandards = {
  semis: { nom: 'Semis en pépinière', temps: 20, icon: '🌱' },
  transplant: { nom: 'Transplantation', temps: 45, icon: '🌿' },
  recolte: { nom: 'Récolte', temps: 30, icon: '🧺' },
  nettoyage: { nom: 'Nettoyage planche', temps: 15, icon: '🧹' },
  arrosage: { nom: 'Arrosage/irrigation', temps: 10, icon: '💦' },
};

const CalendrierTaches = ({ culturesSelectionnees, jardins }) => {
  const [accordeonsOuverts, setAccordeonsOuverts] = useState({});
  
  const toggleAccordeon = (cultureId) => {
    setAccordeonsOuverts(prev => ({ ...prev, [cultureId]: !prev[cultureId] }));
  };

  // Calculer les tâches pour une culture
  const getTachesCulture = (culture) => {
    const taches = charteTaches[culture.nom] || {};
    const listeTaches = [];
    
    Object.entries(taches).forEach(([key, jour]) => {
      if (jour !== null && tempsTaches[key]) {
        listeTaches.push({
          ...tempsTaches[key],
          jour,
          key
        });
      }
    });
    
    return listeTaches.sort((a, b) => a.jour - b.jour);
  };

  // Calculs globaux
  const totalCultures = culturesSelectionnees.length;
  const totalPlanches = culturesSelectionnees.reduce((sum, c) => sum + (c.totalPlanches || 0), 0);
  
  // Temps total estimé
  let tempsTotal = 0;
  let tempsParCategorie = { 'Préparation sol': 0, 'Désherbage': 0, 'Fertilisation': 0, 'Protection': 0, 'Taille': 0, 'Fin culture': 0 };
  let tempsStandardsTotal = { semis: 0, transplant: 0, recolte: 0, nettoyage: 0, arrosage: 0 };
  
  culturesSelectionnees.forEach(culture => {
    const nbPlanches = culture.totalPlanches || 1;
    const nbSeries = culture.series?.length || 1;
    
    // Tâches spécifiques
    const taches = getTachesCulture(culture);
    taches.forEach(tache => {
      const temps = tache.temps * nbPlanches;
      tempsTotal += temps;
      if (tempsParCategorie[tache.categorie] !== undefined) {
        tempsParCategorie[tache.categorie] += temps;
      }
    });
    
    // Tâches standards (par série)
    tempsStandardsTotal.semis += tempsStandards.semis.temps * nbSeries;
    tempsStandardsTotal.transplant += tempsStandards.transplant.temps * nbPlanches;
    tempsStandardsTotal.recolte += tempsStandards.recolte.temps * nbPlanches * 4; // ~4 récoltes
    tempsStandardsTotal.nettoyage += tempsStandards.nettoyage.temps * nbPlanches;
    tempsStandardsTotal.arrosage += tempsStandards.arrosage.temps * nbPlanches * 20; // ~20 arrosages
  });
  
  const tempsStandardsTotalMin = Object.values(tempsStandardsTotal).reduce((a, b) => a + b, 0);
  const tempsTotalGlobal = tempsTotal + tempsStandardsTotalMin;
  
  // Convertir en heures
  const formatTemps = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${heures}h${mins}` : `${heures}h`;
  };

  if (culturesSelectionnees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Calendrier des Tâches</h2>
        <p className="text-gray-500">Sélectionnez des cultures dans l'onglet "Cultures" pour voir le calendrier des tâches.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard KPIs */}
      <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-sky-50 rounded-xl shadow-lg border-2 border-teal-200 p-6">
        <h3 className="text-lg font-bold text-teal-900 mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-2" />
          📋 Tableau de Bord - Calendrier des Tâches
        </h3>
        
        {/* KPIs principaux */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-teal-100 text-center">
            <div className="text-3xl mb-1">🥬</div>
            <div className="text-2xl font-bold text-teal-600">{totalCultures}</div>
            <div className="text-xs text-gray-600">Cultures</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100 text-center">
            <div className="text-3xl mb-1">📏</div>
            <div className="text-2xl font-bold text-green-600">{totalPlanches}</div>
            <div className="text-xs text-gray-600">Planches</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 text-center">
            <div className="text-3xl mb-1">⏱️</div>
            <div className="text-2xl font-bold text-blue-600">{formatTemps(tempsTotalGlobal)}</div>
            <div className="text-xs text-gray-600">Temps total</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100 text-center">
            <div className="text-3xl mb-1">📅</div>
            <div className="text-2xl font-bold text-purple-600">{Math.ceil(tempsTotalGlobal / 60 / 8)}</div>
            <div className="text-xs text-gray-600">Journées (8h)</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-100 text-center">
            <div className="text-3xl mb-1">⚙️</div>
            <div className="text-2xl font-bold text-amber-600">{culturesSelectionnees.reduce((sum, c) => sum + getTachesCulture(c).length, 0)}</div>
            <div className="text-xs text-gray-600">Interventions</div>
          </div>
        </div>

        {/* Temps par type de tâche */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
          {Object.entries(tempsStandardsTotal).map(([key, temps]) => (
            <div key={key} className="bg-white rounded-lg p-2 text-center border">
              <div className="text-lg">{tempsStandards[key].icon}</div>
              <div className="text-sm font-bold text-gray-700">{formatTemps(temps)}</div>
              <div className="text-xs text-gray-500">{tempsStandards[key].nom}</div>
            </div>
          ))}
        </div>

        {/* Temps par catégorie de tâche spécifique */}
        <div className="bg-white rounded-lg p-3 border">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">⚙️ Tâches spécifiques par catégorie</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(tempsParCategorie).filter(([_, t]) => t > 0).map(([cat, temps]) => (
              <span key={cat} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                {cat}: <strong>{formatTemps(temps)}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des cultures avec accordéons */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Wrench className="w-5 h-5 mr-2" />
            Tâches par Culture
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const allOpen = {};
                culturesSelectionnees.forEach(c => allOpen[c.id] = true);
                setAccordeonsOuverts(allOpen);
              }}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >📂 Tout ouvrir</button>
            <button
              onClick={() => setAccordeonsOuverts({})}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >📁 Tout fermer</button>
          </div>
        </div>

        <div className="space-y-3">
          {culturesSelectionnees.map(culture => {
            const taches = getTachesCulture(culture);
            const isOpen = accordeonsOuverts[culture.id];
            const charteCulture = charteTaches[culture.nom] || {};
            const tempsEstime = taches.reduce((sum, t) => sum + t.temps * (culture.totalPlanches || 1), 0);
            
            return (
              <div key={culture.id} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                {/* Header accordéon */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                  onClick={() => toggleAccordeon(culture.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold shadow">
                      {culture.nom.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{culture.nom}</h4>
                      <p className="text-sm text-gray-500">
                        {culture.totalPlanches} pl. • {taches.length} tâches • {formatTemps(tempsEstime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {charteCulture.couvreSol && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hidden sm:block">
                        🛡️ {charteCulture.couvreSol.substring(0, 20)}...
                      </span>
                    )}
                    <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                {/* Contenu */}
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    {/* Protection/Couvre-sol */}
                    {charteCulture.couvreSol && (
                      <div className="mt-3 bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-800">
                          🛡️ <strong>Protection :</strong> {charteCulture.couvreSol}
                        </p>
                      </div>
                    )}
                    
                    {/* Timeline des tâches */}
                    {taches.length > 0 ? (
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">📅 Chronologie des interventions</h5>
                        <div className="space-y-2">
                          {taches.map((tache, idx) => (
                            <div 
                              key={idx}
                              className={`flex items-center p-3 rounded-lg border ${
                                tache.categorie === 'Désherbage' ? 'bg-orange-50 border-orange-200' :
                                tache.categorie === 'Fertilisation' ? 'bg-blue-50 border-blue-200' :
                                tache.categorie === 'Protection' ? 'bg-green-50 border-green-200' :
                                tache.categorie === 'Taille' ? 'bg-purple-50 border-purple-200' :
                                'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="w-16 text-center">
                                <div className={`text-lg font-bold ${tache.jour < 0 ? 'text-red-600' : 'text-teal-600'}`}>
                                  J{tache.jour > 0 ? '+' : ''}{tache.jour}
                                </div>
                              </div>
                              <div className="flex-1 ml-3">
                                <div className="flex items-center">
                                  <span className="text-xl mr-2">{tache.icon}</span>
                                  <span className="font-medium text-gray-800">{tache.nom}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {tache.categorie} • ~{tache.temps * (culture.totalPlanches || 1)} min ({tache.temps} min/pl.)
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-gray-500 text-sm">✨ Aucune tâche spécifique - Culture à faible entretien</p>
                      </div>
                    )}
                    
                    {/* Tâches standards */}
                    <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <h5 className="text-sm font-semibold text-blue-800 mb-2">📋 Tâches standards (estimées)</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                        <div className="bg-white p-1.5 sm:p-2 rounded text-center">
  <div className="text-[10px] sm:text-xs">🌱 Semis</div>
  <div className="font-bold text-xs sm:text-sm">{formatTemps(tempsStandards.semis.temps * (culture.series?.length || 1))}</div>
</div>
                                                <div className="bg-white p-1.5 sm:p-2 rounded text-center">
  <div className="text-[10px] sm:text-xs">🌿 Transplant</div>
  <div className="font-bold text-xs sm:text-sm">{formatTemps(tempsStandards.transplant.temps * (culture.totalPlanches || 1))}</div>
</div>
<div className="bg-white p-1.5 sm:p-2 rounded text-center">
  <div className="text-[10px] sm:text-xs">🧺 Récoltes</div>
  <div className="font-bold text-xs sm:text-sm">{formatTemps(tempsStandards.recolte.temps * (culture.totalPlanches || 1) * 4)}</div>
</div>
                       <div className="bg-white p-1.5 sm:p-2 rounded text-center">
  <div className="text-[10px] sm:text-xs">💦 Arrosage</div>
  <div className="font-bold text-xs sm:text-sm">{formatTemps(tempsStandards.arrosage.temps * (culture.totalPlanches || 1) * 20)}</div>
</div>
                        <div className="bg-white p-1.5 sm:p-2 rounded text-center">
  <div className="text-[10px] sm:text-xs">🧹 Nettoyage</div>
  <div className="font-bold text-xs sm:text-sm">{formatTemps(tempsStandards.nettoyage.temps * (culture.totalPlanches || 1))}</div>
</div>
                      
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendrierTaches;
