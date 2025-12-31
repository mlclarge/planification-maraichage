// SimulateurScenarios.jsx V21 - 4 BLOCS COMPLETS
// 🎯 Ordre : Contraintes → Objectifs → Scénarios → Fournitures
// 🆕 V21 : Scénarios cliquables, Fournitures par culture, Calculs automatiques

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sliders, TrendingUp, AlertTriangle, CheckCircle, Info,
  ChevronDown, ShoppingCart, Home, Leaf, Package,
  DollarSign, Sprout, Shield, Bug, Settings
} from 'lucide-react';
import { NIVEAUX_MATURITE, SAISON } from '../utils/constantes';
import { 
  genererScenariosViables, 
  calculerImpact, 
  estimerCA 
} from '../utils/calculScenarios';
import { cultures as catalogueCultures } from '../data/cultures';

// ═══════════════════════════════════════════════════════════════════════════
// DONNÉES FOURNITURES PAR DÉFAUT (modifiables)
// ═══════════════════════════════════════════════════════════════════════════

const PRIX_FOURNITURES = {
  // Semences & Plants
  semences: {
    prixGraine: 0.01,        // €/graine moyenne
    prixPlant: 0.35,         // €/plant si achat externe
    prixPlateau128: 3.50,    // €/plateau 128 alvéoles
    prixPlateau72: 4.00,     // €/plateau 72 alvéoles
    prixSubstrat: 0.50       // €/litre
  },
  // Fertilisation
  fertilisation: {
    compost: 0.20,           // €/m²
    amendement: 0.05,        // €/m²
    engraisFoliaire: 0.02    // €/m²
  },
  // Protection & Couverture
  protection: {
    bachePlastique: 12,      // €/planche (amortie sur 3 ans)
    toileTissee: 15,         // €/planche (amortie sur 5 ans)
    voileP17: 8,             // €/planche (amortie sur 2 ans)
    filetInsectes: 20        // €/planche (amortie sur 4 ans)
  },
  // Bio-traitement
  biotraitement: {
    bt: 0.50,                // €/planche/saison
    soufreCuivre: 0.30,      // €/planche/saison
    purins: 0.10             // €/planche/saison (fait maison)
  }
};

// Mapping cultures → besoins protection (depuis chartes)
const BESOINS_PROTECTION = {
  tomate: { bachePlastique: true, toileTissee: true },
  aubergine: { toileTissee: true, filetInsectes: false },
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

// Mapping cultures → besoins bio-traitement
const BESOINS_BIOTRAITEMENT = {
  tomate: { soufreCuivre: true, bt: false, purins: true },
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

const SimulateurScenarios = ({ 
  marche, 
  setMarcheValide, 
  jardins, 
  niveauMaturite, 
  setNiveauMaturite,
  culturesSelectionnees = [],
  fournitures,
  setFournitures
}) => {
  // ═══════════════════════════════════════════════════════════════════════
  // ÉTATS LOCAUX
  // ═══════════════════════════════════════════════════════════════════════
  
  // Accordéons
  const [accordeons, setAccordeons] = useState({
    contraintes: true,
    objectifs: true,
    scenarios: true,
    fournitures: true
  });
  const toggle = (id) => setAccordeons(prev => ({ ...prev, [id]: !prev[id] }));

  // Valeurs des sliders (modifiables en temps réel)
  const [slidersMarche, setSlidersMarche] = useState({
    amap: marche.amap || 0,
    marche: marche.marche || 0,
    restaurant: marche.restaurant || 0
  });

  // Scénario actuellement sélectionné
  const [scenarioSelectionne, setScenarioSelectionne] = useState(null);

  // Ajustements manuels des fournitures
  const [ajustementsFournitures, setAjustementsFournitures] = useState({});

  // Synchroniser avec marche externe
  useEffect(() => {
    setSlidersMarche({
      amap: marche.amap || 0,
      marche: marche.marche || 0,
      restaurant: marche.restaurant || 0
    });
  }, [marche]);

  // ═══════════════════════════════════════════════════════════════════════
  // CALCULS
  // ═══════════════════════════════════════════════════════════════════════

  // Capacité totale des jardins
  const capacitePlanches = useMemo(() => {
    return jardins.reduce((sum, j) => sum + j.nombrePlanches, 0);
  }, [jardins]);

  // Surface totale
  const surfaceTotale = useMemo(() => {
    return jardins.reduce((sum, j) => sum + (j.nombrePlanches * j.longueurPlanche * 0.8), 0);
  }, [jardins]);

  // Configuration niveau
  const niveauConfig = NIVEAUX_MATURITE[niveauMaturite] || NIVEAUX_MATURITE.debutant;

  // Marché actuel (depuis sliders)
  const marcheActuel = useMemo(() => ({
    ...marche,
    amap: slidersMarche.amap,
    marche: slidersMarche.marche,
    restaurant: slidersMarche.restaurant
  }), [marche, slidersMarche]);

  // Impact temps réel
  const impact = useMemo(() => {
    if (capacitePlanches === 0) return null;
    return calculerImpact(marcheActuel, capacitePlanches, { niveauMaturite });
  }, [marcheActuel, capacitePlanches, niveauMaturite]);

  // Scénarios viables
  const scenarios = useMemo(() => {
    if (capacitePlanches === 0) return [];
    return genererScenariosViables(marcheActuel, capacitePlanches, { niveauMaturite });
  }, [marcheActuel, capacitePlanches, niveauMaturite]);

  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 V21 : CALCUL FOURNITURES PAR CULTURE
  // ═══════════════════════════════════════════════════════════════════════

  const fournituresCalculees = useMemo(() => {
    const result = {
      parCulture: {},
      totaux: {
        semences: 0,
        fertilisation: 0,
        protection: 0,
        biotraitement: 0,
        total: 0
      }
    };

    // Si pas de cultures sélectionnées, calculer sur le catalogue
    const culturesACalculer = culturesSelectionnees.length > 0 
      ? culturesSelectionnees 
      : [];

    culturesACalculer.forEach(culture => {
      const id = culture.id;
      const planches = culture.totalPlanches || 1;
      const series = culture.series?.length || 1;
      const longueur = culture.longueurPlanche || 15;
      const surfaceCulture = planches * longueur * 0.8;

      // Données de la culture depuis le catalogue
      const catalogueData = catalogueCultures.find(c => c.id === id) || {};
      
      // 1. SEMENCES & PLANTS
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

      // Appliquer ajustements manuels si présents
      const ajust = ajustementsFournitures[id] || {};
      const semencesAjuste = ajust.semences ?? coutSemences.total;
      const fertilisationAjuste = ajust.fertilisation ?? coutFertilisation.total;
      const protectionAjuste = ajust.protection ?? coutProtection.total;
      const biotraitementAjuste = ajust.biotraitement ?? coutBiotraitement.total;

      // Total culture
      const totalCulture = semencesAjuste + fertilisationAjuste + protectionAjuste + biotraitementAjuste;

      result.parCulture[id] = {
        nom: culture.nom || catalogueData.nom || id,
        planches,
        series,
        semences: {
          ...coutSemences,
          ajuste: semencesAjuste,
          detail: { graines: grainesNecessaires, plateaux: nombrePlateaux, substrat: substratLitres }
        },
        fertilisation: {
          ...coutFertilisation,
          ajuste: fertilisationAjuste
        },
        protection: {
          ...coutProtection,
          ajuste: protectionAjuste,
          besoins: besoinsProtection
        },
        biotraitement: {
          ...coutBiotraitement,
          ajuste: biotraitementAjuste,
          besoins: besoinsBio
        },
        total: totalCulture
      };

      // Ajouter aux totaux
      result.totaux.semences += semencesAjuste;
      result.totaux.fertilisation += fertilisationAjuste;
      result.totaux.protection += protectionAjuste;
      result.totaux.biotraitement += biotraitementAjuste;
      result.totaux.total += totalCulture;
    });

    return result;
  }, [culturesSelectionnees, ajustementsFournitures]);

  // Mettre à jour fournitures parent
  useEffect(() => {
    if (setFournitures) {
      setFournitures(fournituresCalculees);
    }
  }, [fournituresCalculees, setFournitures]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════

  // Mise à jour slider
  const handleSliderChange = (field, value) => {
    setSlidersMarche(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
    setScenarioSelectionne(null); // Désélectionner le scénario
  };

  // Appliquer les valeurs des sliders au marché global
  const appliquerMarche = () => {
    setMarcheValide({
      ...marche,
      amap: slidersMarche.amap,
      marche: slidersMarche.marche,
      restaurant: slidersMarche.restaurant
    });
  };

  // 🆕 V21 : Sélectionner un scénario (pré-remplit les sliders)
  const selectionnerScenario = (scenario) => {
    setScenarioSelectionne(scenario.id);
    setSlidersMarche({
      amap: scenario.marche.amap,
      marche: scenario.marche.marche,
      restaurant: scenario.marche.restaurant
    });
    // Appliquer directement au marché global
    setMarcheValide({
      ...marche,
      amap: scenario.marche.amap,
      marche: scenario.marche.marche,
      restaurant: scenario.marche.restaurant
    });
  };

  // Ajuster manuellement une fourniture
  const ajusterFourniture = (cultureId, categorie, valeur) => {
    setAjustementsFournitures(prev => ({
      ...prev,
      [cultureId]: {
        ...(prev[cultureId] || {}),
        [categorie]: parseFloat(valeur) || 0
      }
    }));
  };

  // Réinitialiser un ajustement
  const reinitialiserAjustement = (cultureId, categorie) => {
    setAjustementsFournitures(prev => {
      const newAjust = { ...prev };
      if (newAjust[cultureId]) {
        delete newAjust[cultureId][categorie];
        if (Object.keys(newAjust[cultureId]).length === 0) {
          delete newAjust[cultureId];
        }
      }
      return newAjust;
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // COMPOSANT SECTION ACCORDÉON
  // ═══════════════════════════════════════════════════════════════════════

  const Section = ({ id, title, icon: Icon, children, badge = null, color = 'gray' }) => {
    const isOpen = accordeons[id];
    const colors = {
      gray: 'border-gray-200 bg-gray-50',
      green: 'border-green-300 bg-green-50',
      blue: 'border-blue-300 bg-blue-50',
      purple: 'border-purple-300 bg-purple-50',
      orange: 'border-orange-300 bg-orange-50'
    };
    
    return (
      <div className={`border-2 rounded-xl overflow-hidden mb-4 ${colors[color]}`}>
        <button 
          onClick={() => toggle(id)} 
          className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-colors text-left"
        >
          <span className="font-bold text-lg text-gray-900 flex items-center">
            <Icon className="w-5 h-5 mr-2" />
            {title}
          </span>
          <div className="flex items-center space-x-2">
            {badge && <span className="text-xs bg-white px-2 py-1 rounded font-medium">{badge}</span>}
            <ChevronDown className={`w-6 h-6 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {isOpen && <div className="p-4 bg-white border-t">{children}</div>}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MESSAGE SI PAS DE JARDINS
  // ═══════════════════════════════════════════════════════════════════════

  if (capacitePlanches === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun jardin configuré</h3>
        <p className="text-gray-500 mb-4">
          Pour utiliser le simulateur, commencez par configurer vos jardins dans l'onglet "Jardins".
        </p>
        <p className="text-sm text-gray-400">
          Définissez le nombre de planches et leur longueur pour calculer votre capacité de production.
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDU PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-4">
      {/* ════════════════════════════════════════════════════════════════════
          BLOC 1 : VOS CONTRAINTES
          ════════════════════════════════════════════════════════════════════ */}
      <Section id="contraintes" title="Vos Contraintes" icon={Settings} color="gray" badge={`${capacitePlanches} planches`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Marché configuré */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Marché Configuré
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Paniers AMAP</span>
                <span className="font-bold">{marche.amap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ventes marché</span>
                <span className="font-bold">{marche.marche}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Restaurant</span>
                <span className="font-bold">{marche.restaurant}</span>
              </div>
            </div>
          </div>

          {/* Capacité disponible */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Capacité Disponible
            </h4>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">{capacitePlanches}</div>
              <div className="text-sm text-gray-600">Planches totales</div>
              <div className="text-xs text-gray-500 mt-1">
                {jardins.length} jardin{jardins.length > 1 ? 's' : ''} • {surfaceTotale.toFixed(0)} m²
              </div>
            </div>
          </div>

          {/* Niveau de maturité */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
              <Leaf className="w-4 h-4 mr-2" />
              Votre Niveau
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(NIVEAUX_MATURITE).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setNiveauMaturite(key)}
                  className={`p-2 rounded-lg text-center transition-all ${
                    niveauMaturite === key
                      ? 'ring-2 ring-offset-1 shadow-md'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: niveauMaturite === key ? config.couleur + '30' : 'white',
                    borderColor: config.couleur,
                    ringColor: config.couleur
                  }}
                >
                  <div className="text-xl">{config.icone}</div>
                  <div className="text-xs font-medium">{config.label}</div>
                  <div className="text-xs text-gray-500">×{config.coefficient}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          BLOC 2 : AJUSTEZ VOS OBJECTIFS MARCHÉ
          ════════════════════════════════════════════════════════════════════ */}
      <Section id="objectifs" title="Ajustez Vos Objectifs Marché" icon={Sliders} color="blue" badge="Temps réel">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sliders */}
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Modifiez les curseurs et voyez l'impact en temps réel sur vos besoins en planches.
            </p>

            {/* Slider AMAP */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-700 flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2 text-blue-500" />
                  Paniers AMAP
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={slidersMarche.amap}
                    onChange={(e) => handleSliderChange('amap', e.target.value)}
                    className="w-16 px-2 py-1 border rounded text-center font-bold"
                  />
                  <span className="text-gray-500 text-sm">paniers</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={slidersMarche.amap}
                onChange={(e) => handleSliderChange('amap', e.target.value)}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider Marché */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-700 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                  Ventes Marché
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={slidersMarche.marche}
                    onChange={(e) => handleSliderChange('marche', e.target.value)}
                    className="w-16 px-2 py-1 border rounded text-center font-bold"
                  />
                  <span className="text-gray-500 text-sm">unités</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={slidersMarche.marche}
                onChange={(e) => handleSliderChange('marche', e.target.value)}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider Restaurant */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-700 flex items-center">
                  <Home className="w-4 h-4 mr-2 text-orange-500" />
                  Restaurants
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={slidersMarche.restaurant}
                    onChange={(e) => handleSliderChange('restaurant', e.target.value)}
                    className="w-16 px-2 py-1 border rounded text-center font-bold"
                  />
                  <span className="text-gray-500 text-sm">unités</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={slidersMarche.restaurant}
                onChange={(e) => handleSliderChange('restaurant', e.target.value)}
                className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Résultat temps réel */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
              <span>Résultat en Temps Réel</span>
              {impact?.viable && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Viable
                </span>
              )}
              {impact && !impact.viable && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Dépassement
                </span>
              )}
            </h4>

            {impact && (
              <>
                {/* Jauge de remplissage */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Utilisation des planches</span>
                    <span className={`font-bold ${impact.viable ? 'text-green-600' : 'text-red-600'}`}>
                      {impact.planchesNecessaires} / {capacitePlanches}
                    </span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        impact.tauxRemplissage > 100 ? 'bg-red-500' :
                        impact.tauxRemplissage > 90 ? 'bg-orange-500' :
                        impact.tauxRemplissage > 70 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, impact.tauxRemplissage)}%` }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-500 mt-1">
                    {impact.tauxRemplissage}% utilisé
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center border">
                    <div className="text-xs text-gray-500">Planches nécessaires</div>
                    <div className={`text-2xl font-bold ${impact.viable ? 'text-green-600' : 'text-red-600'}`}>
                      {impact.planchesNecessaires}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border">
                    <div className="text-xs text-gray-500">CA Potentiel</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {impact.caEstime?.toLocaleString('fr-FR')}€
                    </div>
                  </div>
                </div>

                {/* Conseils */}
                {impact.conseils && impact.conseils.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {impact.conseils.map((conseil, i) => (
                      <div 
                        key={i}
                        className={`text-sm p-2 rounded flex items-start ${
                          conseil.type === 'error' ? 'bg-red-50 text-red-700' :
                          conseil.type === 'warning' ? 'bg-orange-50 text-orange-700' :
                          conseil.type === 'success' ? 'bg-green-50 text-green-700' :
                          'bg-blue-50 text-blue-700'
                        }`}
                      >
                        <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        {conseil.message}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          BLOC 3 : SCÉNARIOS VIABLES
          ════════════════════════════════════════════════════════════════════ */}
      <Section id="scenarios" title="Scénarios Viables" icon={TrendingUp} color="green" badge={`${capacitePlanches} pl. en ${niveauConfig.label}`}>
        <p className="text-sm text-gray-600 mb-4">
          Cliquez sur un scénario pour pré-remplir automatiquement vos objectifs. Vous pouvez ensuite les ajuster manuellement.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map(scenario => {
            const isSelected = scenarioSelectionne === scenario.id;
            const isRecommande = scenario.recommande;
            
            return (
              <button
                key={scenario.id}
                onClick={() => selectionnerScenario(scenario)}
                className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                  isSelected 
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                    : scenario.viable 
                      ? 'border-gray-200 bg-white hover:border-green-300' 
                      : 'border-red-200 bg-red-50 opacity-60'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold">{scenario.nom}</span>
                  {scenario.viable && (
                    <CheckCircle className={`w-5 h-5 ${isSelected ? 'text-green-600' : 'text-green-400'}`} />
                  )}
                </div>
                
                {/* Description */}
                <p className="text-xs text-gray-500 mb-3">{scenario.description}</p>
                
                {/* Détails */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">AMAP :</span>
                    <span className="font-medium">{scenario.marche.amap} paniers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marché :</span>
                    <span className="font-medium">{scenario.marche.marche} unités</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Planches :</span>
                    <span className={`font-bold ${scenario.viable ? 'text-green-600' : 'text-red-600'}`}>
                      {scenario.planches} / {capacitePlanches}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">CA estimé :</span>
                    <span className="font-bold text-blue-600">{scenario.caEstime?.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>

                {/* Badge recommandé */}
                {isRecommande && (
                  <div className="mt-3 text-center">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      ⭐ Recommandé pour {niveauConfig.label}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          BLOC 4 : FOURNITURES & INTRANTS
          ════════════════════════════════════════════════════════════════════ */}
      <Section 
        id="fournitures" 
        title="Fournitures & Intrants" 
        icon={Package} 
        color="orange" 
        badge={culturesSelectionnees.length > 0 ? `${fournituresCalculees.totaux.total.toFixed(0)} €` : 'Aucune culture'}
      >
        {culturesSelectionnees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Sélectionnez des cultures dans l'onglet "Cultures" pour voir les fournitures nécessaires.</p>
          </div>
        ) : (
          <>
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

            {/* Détail par culture */}
            <h4 className="font-semibold text-gray-700 mb-3">Détail par culture (cliquez sur une valeur pour l'ajuster)</h4>
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
                  {Object.entries(fournituresCalculees.parCulture).map(([id, data]) => {
                    const ajust = ajustementsFournitures[id] || {};
                    const hasAjustSemences = ajust.semences !== undefined;
                    const hasAjustFertil = ajust.fertilisation !== undefined;
                    const hasAjustProtec = ajust.protection !== undefined;
                    const hasAjustBio = ajust.biotraitement !== undefined;

                    return (
                      <tr key={id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 border font-medium">{data.nom}</td>
                        <td className="px-3 py-2 border text-center">{data.planches}</td>
                        <td className="px-3 py-2 border text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={data.semences.ajuste.toFixed(1)}
                            onChange={(e) => ajusterFourniture(id, 'semences', e.target.value)}
                            className={`w-20 px-1 py-0.5 text-right rounded border ${hasAjustSemences ? 'bg-yellow-50 border-yellow-300' : 'border-gray-200'}`}
                          />
                          {hasAjustSemences && (
                            <button 
                              onClick={() => reinitialiserAjustement(id, 'semences')}
                              className="ml-1 text-xs text-gray-400 hover:text-red-500"
                              title="Réinitialiser"
                            >
                              ↺
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-2 border text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={data.fertilisation.ajuste.toFixed(1)}
                            onChange={(e) => ajusterFourniture(id, 'fertilisation', e.target.value)}
                            className={`w-20 px-1 py-0.5 text-right rounded border ${hasAjustFertil ? 'bg-yellow-50 border-yellow-300' : 'border-gray-200'}`}
                          />
                          {hasAjustFertil && (
                            <button 
                              onClick={() => reinitialiserAjustement(id, 'fertilisation')}
                              className="ml-1 text-xs text-gray-400 hover:text-red-500"
                              title="Réinitialiser"
                            >
                              ↺
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-2 border text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={data.protection.ajuste.toFixed(1)}
                            onChange={(e) => ajusterFourniture(id, 'protection', e.target.value)}
                            className={`w-20 px-1 py-0.5 text-right rounded border ${hasAjustProtec ? 'bg-yellow-50 border-yellow-300' : 'border-gray-200'}`}
                          />
                          {hasAjustProtec && (
                            <button 
                              onClick={() => reinitialiserAjustement(id, 'protection')}
                              className="ml-1 text-xs text-gray-400 hover:text-red-500"
                              title="Réinitialiser"
                            >
                              ↺
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-2 border text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={data.biotraitement.ajuste.toFixed(1)}
                            onChange={(e) => ajusterFourniture(id, 'biotraitement', e.target.value)}
                            className={`w-20 px-1 py-0.5 text-right rounded border ${hasAjustBio ? 'bg-yellow-50 border-yellow-300' : 'border-gray-200'}`}
                          />
                          {hasAjustBio && (
                            <button 
                              onClick={() => reinitialiserAjustement(id, 'biotraitement')}
                              className="ml-1 text-xs text-gray-400 hover:text-red-500"
                              title="Réinitialiser"
                            >
                              ↺
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-2 border text-right font-bold text-orange-700">
                          {data.total.toFixed(0)} €
                        </td>
                      </tr>
                    );
                  })}
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

            {/* Note explicative */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
              <Info className="w-4 h-4 inline mr-1" />
              Les valeurs sont calculées automatiquement selon les chartes de culture. 
              Cliquez sur une valeur pour l'ajuster manuellement (surlignée en jaune).
              Le total est répercuté dans l'onglet Résultats.
            </div>
          </>
        )}
      </Section>
    </div>
  );
};

export default SimulateurScenarios;
