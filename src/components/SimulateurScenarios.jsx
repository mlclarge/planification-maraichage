// SimulateurScenarios.jsx V21 - 4 BLOCS COMPLETS
// 🎯 Ordre : Contraintes → Objectifs → Scénarios → Fournitures
// 🆕 V21 : Scénarios cliquables, Fournitures par culture, Calculs automatiques
// 📱 V22 : Optimisations mobile - blocs repliés + steppers

import React, { useState, useMemo, useEffect } from "react";
import {
  Sliders,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ShoppingCart,
  Home,
  Leaf,
  Package,
  DollarSign,
  Sprout,
  Shield,
  Bug,
  Settings,
  Minus,
  Plus,
} from "lucide-react";
import { NIVEAUX_MATURITE, SAISON } from "../utils/constantes";
import {
  genererScenariosViables,
  calculerImpact,
  estimerCA,
} from "../utils/calculScenarios";
import { cultures as catalogueCultures } from "../data/cultures";

// ═══════════════════════════════════════════════════════════════════════════
// DONNÉES FOURNITURES PAR DÉFAUT (modifiables)
// ═══════════════════════════════════════════════════════════════════════════

const PRIX_FOURNITURES = {
  // Semences & Plants
  semences: {
    prixGraine: 0.01, // €/graine moyenne
    prixPlant: 0.35, // €/plant si achat externe
    prixPlateau128: 3.5, // €/plateau 128 alvéoles
    prixPlateau72: 4.0, // €/plateau 72 alvéoles
    prixSubstrat: 0.5, // €/litre
  },
  // Fertilisation
  fertilisation: {
    compost: 0.2, // €/m²
    amendement: 0.05, // €/m²
    engraisFoliaire: 0.02, // €/m²
  },
  // Protection & Couverture
  protection: {
    bachePlastique: 12, // €/planche (amortie sur 3 ans)
    toileTissee: 15, // €/planche (amortie sur 5 ans)
    voileP17: 8, // €/planche (amortie sur 2 ans)
    filetInsectes: 20, // €/planche (amortie sur 4 ans)
  },
  // Bio-traitement
  biotraitement: {
    bt: 0.5, // €/planche/saison
    soufreCuivre: 0.3, // €/planche/saison
    purins: 0.1, // €/planche/saison (fait maison)
  },
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
  verdurette: { voileP17: true },
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
  basilic: { soufreCuivre: true },
};

const SimulateurScenarios = ({
  marche,
  setMarcheValide,
  jardins,
  niveauMaturite,
  setNiveauMaturite,
  culturesSelectionnees = [],
  fournitures,
  setFournitures,
}) => {
  // ═══════════════════════════════════════════════════════════════════════
  // ÉTATS LOCAUX
  // ═══════════════════════════════════════════════════════════════════════

  // 📱 Détection mobile pour état initial des accordéons
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Accordéons - fermés par défaut sur mobile, ouverts sur desktop
  const [accordeons, setAccordeons] = useState({
    contraintes: true,
    objectifs: true,
    scenarios: true,
    fournitures: true,
  });

  // 📱 Fermer les accordéons sur mobile au premier chargement
  useEffect(() => {
    if (isMobile) {
      setAccordeons({
        contraintes: false,
        objectifs: false,
        scenarios: false,
        fournitures: false,
      });
    }
  }, [isMobile]);

  const toggle = (id) =>
    setAccordeons((prev) => ({ ...prev, [id]: !prev[id] }));

  // Valeurs des sliders (modifiables en temps réel)
  const [slidersMarche, setSlidersMarche] = useState({
    amap: marche.amap || 0,
    marche: marche.marche || 0,
    restaurant: marche.restaurant || 0,
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
      restaurant: marche.restaurant || 0,
    });
  }, [marche]);

  // ═══════════════════════════════════════════════════════════════════════
  // 📱 COMPOSANT STEPPER MOBILE
  // ═══════════════════════════════════════════════════════════════════════

  const MobileStepper = ({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    color = "blue",
  }) => {
    const colorClasses = {
      blue: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
      green: "bg-green-600 hover:bg-green-700 active:bg-green-800",
      orange: "bg-orange-600 hover:bg-orange-700 active:bg-orange-800",
    };

    const increment = () => onChange(Math.min(max, (value || 0) + step));
    const decrement = () => onChange(Math.max(min, (value || 0) - step));

    const displayValue = value === 0 ? "" : value;

    const handleInputChange = (e) => {
      const val = e.target.value;
      onChange(val === "" ? 0 : parseInt(val) || 0);
    };

    return (
      <div className="flex items-center justify-center space-x-3 sm:hidden">
        <button
          type="button"
          onClick={decrement}
          className={`w-12 h-12 rounded-full ${colorClasses[color]} text-white flex items-center justify-center shadow-md transition-colors`}
        >
          <Minus className="w-6 h-6" />
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={displayValue}
          onChange={handleInputChange}
          placeholder="0"
          className="w-20 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={increment}
          className={`w-12 h-12 rounded-full ${colorClasses[color]} text-white flex items-center justify-center shadow-md transition-colors`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // CALCULS
  // ═══════════════════════════════════════════════════════════════════════

  // Capacité totale des jardins
  const capacitePlanches = useMemo(() => {
    return jardins.reduce((sum, j) => sum + j.nombrePlanches, 0);
  }, [jardins]);

  // Surface totale
  const surfaceTotale = useMemo(() => {
    return jardins.reduce(
      (sum, j) => sum + j.nombrePlanches * j.longueurPlanche * 0.8,
      0
    );
  }, [jardins]);

  // Configuration niveau
  const niveauConfig =
    NIVEAUX_MATURITE[niveauMaturite] || NIVEAUX_MATURITE.debutant;

  // Marché actuel (depuis sliders)
  const marcheActuel = useMemo(
    () => ({
      ...marche,
      amap: slidersMarche.amap,
      marche: slidersMarche.marche,
      restaurant: slidersMarche.restaurant,
    }),
    [marche, slidersMarche]
  );

  // Impact temps réel
  const impact = useMemo(() => {
    if (capacitePlanches === 0) return null;
    return calculerImpact(marcheActuel, capacitePlanches, { niveauMaturite });
  }, [marcheActuel, capacitePlanches, niveauMaturite]);

  // Scénarios viables
  const scenarios = useMemo(() => {
    if (capacitePlanches === 0) return [];
    return genererScenariosViables(marcheActuel, capacitePlanches, {
      niveauMaturite,
    });
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
        total: 0,
      },
    };

    // Si pas de cultures sélectionnées, calculer sur le catalogue
    const culturesACalculer =
      culturesSelectionnees.length > 0 ? culturesSelectionnees : [];

    culturesACalculer.forEach((culture) => {
      const id = culture.id;
      const planches = culture.totalPlanches || 1;
      const series = culture.series?.length || 1;
      const longueur = culture.longueurPlanche || 15;
      const surfaceCulture = planches * longueur * 0.8;

      // Données de la culture depuis le catalogue
      const catalogueData = catalogueCultures.find((c) => c.id === id) || {};

      // 1. SEMENCES & PLANTS
      const densiteSemis = catalogueData.semis?.densite || 100;
      const grainesNecessaires = densiteSemis * planches * series;
      const plateauxType = catalogueData.pepiniere?.typeContenant || 128;
      const nbPlateaux = Math.ceil(grainesNecessaires / plateauxType);

      let coutSemences = 0;
      if (catalogueData.semis?.type === "direct") {
        coutSemences =
          grainesNecessaires * PRIX_FOURNITURES.semences.prixGraine;
      } else {
        coutSemences =
          nbPlateaux *
          (plateauxType === 128
            ? PRIX_FOURNITURES.semences.prixPlateau128
            : PRIX_FOURNITURES.semences.prixPlateau72);
        coutSemences += nbPlateaux * 2 * PRIX_FOURNITURES.semences.prixSubstrat;
      }

      // 2. FERTILISATION
      const coutFertilisation =
        surfaceCulture *
        (PRIX_FOURNITURES.fertilisation.compost +
          PRIX_FOURNITURES.fertilisation.amendement +
          PRIX_FOURNITURES.fertilisation.engraisFoliaire);

      // 3. PROTECTION
      let coutProtection = 0;
      const besoinsProtection = BESOINS_PROTECTION[id] || {};
      if (besoinsProtection.bachePlastique)
        coutProtection +=
          (PRIX_FOURNITURES.protection.bachePlastique / 3) * planches;
      if (besoinsProtection.toileTissee)
        coutProtection +=
          (PRIX_FOURNITURES.protection.toileTissee / 5) * planches;
      if (besoinsProtection.voileP17)
        coutProtection += (PRIX_FOURNITURES.protection.voileP17 / 2) * planches;
      if (besoinsProtection.filetInsectes)
        coutProtection +=
          (PRIX_FOURNITURES.protection.filetInsectes / 4) * planches;

      // 4. BIOTRAITEMENT
      let coutBiotraitement = 0;
      const besoinsBio = BESOINS_BIOTRAITEMENT[id] || {};
      if (besoinsBio.bt)
        coutBiotraitement += PRIX_FOURNITURES.biotraitement.bt * planches;
      if (besoinsBio.soufreCuivre)
        coutBiotraitement +=
          PRIX_FOURNITURES.biotraitement.soufreCuivre * planches;
      if (besoinsBio.purins)
        coutBiotraitement += PRIX_FOURNITURES.biotraitement.purins * planches;

      // Appliquer ajustements manuels
      const ajust = ajustementsFournitures[id] || {};
      const semencesFinal = ajust.semences ?? coutSemences;
      const fertilisationFinal = ajust.fertilisation ?? coutFertilisation;
      const protectionFinal = ajust.protection ?? coutProtection;
      const biotraitementFinal = ajust.biotraitement ?? coutBiotraitement;

      result.parCulture[id] = {
        nom: culture.nom || catalogueData.nom || id,
        planches,
        semences: semencesFinal,
        fertilisation: fertilisationFinal,
        protection: protectionFinal,
        biotraitement: biotraitementFinal,
        total:
          semencesFinal +
          fertilisationFinal +
          protectionFinal +
          biotraitementFinal,
        ajuste: {
          semences: ajust.semences !== undefined,
          fertilisation: ajust.fertilisation !== undefined,
          protection: ajust.protection !== undefined,
          biotraitement: ajust.biotraitement !== undefined,
        },
      };

      result.totaux.semences += semencesFinal;
      result.totaux.fertilisation += fertilisationFinal;
      result.totaux.protection += protectionFinal;
      result.totaux.biotraitement += biotraitementFinal;
      result.totaux.total +=
        semencesFinal +
        fertilisationFinal +
        protectionFinal +
        biotraitementFinal;
    });

    return result;
  }, [culturesSelectionnees, ajustementsFournitures]);

  // Synchroniser fournitures avec parent
  useEffect(() => {
    if (setFournitures && fournituresCalculees.totaux.total > 0) {
      setFournitures(fournituresCalculees);
    }
  }, [fournituresCalculees, setFournitures]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════

  const handleSliderChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setSlidersMarche((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleAppliquerMarche = () => {
    if (setMarcheValide) {
      setMarcheValide({
        ...marche,
        amap: slidersMarche.amap,
        marche: slidersMarche.marche,
        restaurant: slidersMarche.restaurant,
      });
      alert("✅ Marché mis à jour ! Les calculs ont été recalculés.");
    }
  };

  const handleSelectionScenario = (scenario) => {
    setScenarioSelectionne(scenario);
    setSlidersMarche({
      amap: scenario.amap,
      marche: scenario.marche,
      restaurant: scenario.restaurant,
    });
  };

  const handleAjusterFourniture = (cultureId, categorie, valeur) => {
    setAjustementsFournitures((prev) => {
      const newAjust = { ...prev };
      if (!newAjust[cultureId]) newAjust[cultureId] = {};

      if (valeur === null) {
        delete newAjust[cultureId][categorie];
        if (Object.keys(newAjust[cultureId]).length === 0) {
          delete newAjust[cultureId];
        }
      } else {
        newAjust[cultureId][categorie] = valeur;
      }
      return newAjust;
    });
  };

  const handleResetAjustement = (cultureId, categorie) => {
    setAjustementsFournitures((prev) => {
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

  const Section = ({
    id,
    title,
    icon: Icon,
    children,
    badge = null,
    color = "gray",
  }) => {
    const isOpen = accordeons[id];
    const colors = {
      gray: "border-gray-200 bg-gray-50",
      green: "border-green-300 bg-green-50",
      blue: "border-blue-300 bg-blue-50",
      purple: "border-purple-300 bg-purple-50",
      orange: "border-orange-300 bg-orange-50",
    };

    return (
      <div
        className={`border-2 rounded-xl overflow-hidden mb-4 ${colors[color]}`}
      >
        <button
          onClick={() => toggle(id)}
          className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-colors text-left"
        >
          <span className="font-bold text-lg text-gray-900 flex items-center">
            <Icon className="w-5 h-5 mr-2" />
            {title}
          </span>
          <div className="flex items-center space-x-2">
            {badge && (
              <span className="text-xs bg-white px-2 py-1 rounded font-medium">
                {badge}
              </span>
            )}
            <ChevronDown
              className={`w-6 h-6 text-gray-500 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
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
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          Aucun jardin configuré
        </h3>
        <p className="text-gray-500 mb-4">
          Pour utiliser le simulateur, commencez par configurer vos jardins dans
          l'onglet "Jardins".
        </p>
        <p className="text-sm text-gray-400">
          Définissez le nombre de planches et leur longueur pour calculer votre
          capacité de production.
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
      <Section
        id="contraintes"
        title="Vos Contraintes"
        icon={Settings}
        color="gray"
        badge={`${capacitePlanches} planches`}
      >
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

          {/*  Capacité disponible */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Capacité Disponible
            </h4>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {capacitePlanches}
              </div>
              <div className="text-sm text-gray-600">Planches totales</div>
              <div className="text-xs text-gray-500 mt-1">
                {jardins.length} jardin{jardins.length > 1 ? "s" : ""} •{" "}
                {surfaceTotale.toFixed(0)} m²
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
                      ? "ring-2 ring-offset-1 shadow-md"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor:
                      niveauMaturite === key ? config.couleur + "30" : "white",
                    borderColor: config.couleur,
                    ringColor: config.couleur,
                  }}
                >
                  <div className="text-xl">{config.icone}</div>
                  <div className="text-xs font-medium">{config.label}</div>
                  <div className="text-xs text-gray-500">
                    ×{config.coefficient}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          BLOC 2 : AJUSTEZ VOS OBJECTIFS MARCHÉ
          ════════════════════════════════════════════════════════════════════ */}
      <Section
        id="objectifs"
        title="Ajustez Vos Objectifs Marché"
        icon={Sliders}
        color="blue"
        badge="Temps réel"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sliders */}
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Modifiez les curseurs et voyez l'impact en temps réel sur vos
              besoins en planches.
            </p>

            {/* Slider AMAP */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-700 flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2 text-blue-500" />
                  Paniers AMAP
                </label>
                {/* Desktop : affichage valeur */}
                <div className="hidden sm:flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={slidersMarche.amap === 0 ? "" : slidersMarche.amap}
                    onChange={(e) => handleSliderChange("amap", e.target.value)}
                    placeholder="0"
                    className="w-16 px-2 py-1 border rounded text-center font-bold"
                  />
                  <span className="text-gray-500 text-sm">paniers</span>
                </div>
              </div>
              {/* 📱 Mobile : stepper */}
              <MobileStepper
                value={slidersMarche.amap}
                onChange={(val) => handleSliderChange("amap", val)}
                max={100}
                color="blue"
              />
              {/* Desktop : slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={slidersMarche.amap}
                onChange={(e) => handleSliderChange("amap", e.target.value)}
                className="hidden sm:block w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider Marché */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-700 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                  Ventes Marché
                </label>
                {/* Desktop : affichage valeur */}
                <div className="hidden sm:flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={
                      slidersMarche.marche === 0 ? "" : slidersMarche.marche
                    }
                    onChange={(e) =>
                      handleSliderChange("marche", e.target.value)
                    }
                    placeholder="0"
                    className="w-16 px-2 py-1 border rounded text-center font-bold"
                  />
                  <span className="text-gray-500 text-sm">unités</span>
                </div>
              </div>
              {/* 📱 Mobile : stepper */}
              <MobileStepper
                value={slidersMarche.marche}
                onChange={(val) => handleSliderChange("marche", val)}
                max={100}
                color="green"
              />
              {/* Desktop : slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={slidersMarche.marche}
                onChange={(e) => handleSliderChange("marche", e.target.value)}
                className="hidden sm:block w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider Restaurant */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-700 flex items-center">
                  <Home className="w-4 h-4 mr-2 text-orange-500" />
                  Restaurants
                </label>
                {/* Desktop : affichage valeur */}
                <div className="hidden sm:flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={
                      slidersMarche.restaurant === 0
                        ? ""
                        : slidersMarche.restaurant
                    }
                    onChange={(e) =>
                      handleSliderChange("restaurant", e.target.value)
                    }
                    placeholder="0"
                    className="w-16 px-2 py-1 border rounded text-center font-bold"
                  />
                  <span className="text-gray-500 text-sm">unités</span>
                </div>
              </div>
              {/* 📱 Mobile : stepper */}
              <MobileStepper
                value={slidersMarche.restaurant}
                onChange={(val) => handleSliderChange("restaurant", val)}
                max={20}
                color="orange"
              />
              {/* Desktop : slider */}
              <input
                type="range"
                min="0"
                max="20"
                value={slidersMarche.restaurant}
                onChange={(e) =>
                  handleSliderChange("restaurant", e.target.value)
                }
                className="hidden sm:block w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
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
                    <span className="text-gray-600">
                      Utilisation des planches
                    </span>
                    <span
                      className={`font-bold ${
                        impact.viable ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {impact.planchesNecessaires} / {capacitePlanches}
                    </span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        impact.tauxRemplissage > 100
                          ? "bg-red-500"
                          : impact.tauxRemplissage > 85
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(impact.tauxRemplissage, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-center text-sm mt-1 text-gray-500">
                    {impact.tauxRemplissage.toFixed(0)}% utilisé
                  </div>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-gray-500 text-xs">
                      Planches nécessaires
                    </div>
                    <div className="font-bold text-lg text-blue-600">
                      {impact.planchesNecessaires}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-gray-500 text-xs">CA Potentiel</div>
                    <div className="font-bold text-lg text-green-600">
                      {estimerCA(marcheActuel).toLocaleString()} €
                    </div>
                  </div>
                </div>

                {/* Bouton Appliquer */}
                <button
                  onClick={handleAppliquerMarche}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Appliquer ces valeurs
                </button>
              </>
            )}
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          BLOC 3 : SCÉNARIOS VIABLES
          ════════════════════════════════════════════════════════════════════ */}
      <Section
        id="scenarios"
        title="Scénarios Viables"
        icon={TrendingUp}
        color="green"
        badge={`${scenarios.length} options`}
      >
        {scenarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-orange-400" />
            <p>Aucun scénario viable avec la configuration actuelle.</p>
            <p className="text-sm mt-2">
              Essayez de réduire vos objectifs ou d'augmenter votre capacité.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.slice(0, 6).map((scenario, index) => (
              <div
                key={index}
                onClick={() => handleSelectionScenario(scenario)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                  scenarioSelectionne === scenario
                    ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                    : "border-gray-200 bg-white hover:border-green-300"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    Option {index + 1}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      scenario.tauxRemplissage > 85
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {scenario.tauxRemplissage.toFixed(0)}%
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">🧺 AMAP</span>
                    <span className="font-bold">{scenario.amap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">🏪 Marché</span>
                    <span className="font-bold">{scenario.marche}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">🍽️ Restaurant</span>
                    <span className="font-bold">{scenario.restaurant}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between">
                    <span className="text-gray-600">💰 CA estimé</span>
                    <span className="font-bold text-green-600">
                      {scenario.caEstime?.toLocaleString() || "?"} €
                    </span>
                  </div>
                </div>

                {scenarioSelectionne === scenario && (
                  <div className="mt-3 text-center">
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Sélectionné
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {scenarioSelectionne && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
            <span className="text-sm text-blue-800">
              <Info className="w-4 h-4 inline mr-1" />
              Scénario sélectionné chargé dans les curseurs ci-dessus
            </span>
            <button
              onClick={handleAppliquerMarche}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Appliquer ce scénario
            </button>
          </div>
        )}
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          BLOC 4 : FOURNITURES ET INTRANTS
          ════════════════════════════════════════════════════════════════════ */}
      <Section
        id="fournitures"
        title="Fournitures et Intrants"
        icon={Package}
        color="orange"
        badge={`${fournituresCalculees.totaux.total.toFixed(0)} €`}
      >
        {culturesSelectionnees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Sprout className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Sélectionnez des cultures pour calculer les fournitures.</p>
            <p className="text-sm mt-2">
              Allez dans l'onglet "Cultures" pour commencer.
            </p>
          </div>
        ) : (
          <>
            {/* Résumé total */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                <Sprout className="w-5 h-5 mx-auto text-green-600 mb-1" />
                <div className="text-xs text-gray-600">Semences</div>
                <div className="font-bold text-green-700">
                  {fournituresCalculees.totaux.semences.toFixed(0)} €
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-center">
                <Leaf className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                <div className="text-xs text-gray-600">Fertilisation</div>
                <div className="font-bold text-amber-700">
                  {fournituresCalculees.totaux.fertilisation.toFixed(0)} €
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                <Shield className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                <div className="text-xs text-gray-600">Protection</div>
                <div className="font-bold text-blue-700">
                  {fournituresCalculees.totaux.protection.toFixed(0)} €
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-center">
                <Bug className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                <div className="text-xs text-gray-600">Bio-traitement</div>
                <div className="font-bold text-purple-700">
                  {fournituresCalculees.totaux.biotraitement.toFixed(0)} €
                </div>
              </div>
              <div className="bg-orange-100 rounded-lg p-3 border-2 border-orange-400 text-center">
                <DollarSign className="w-5 h-5 mx-auto text-orange-600 mb-1" />
                <div className="text-xs text-gray-600 font-medium">TOTAL</div>
                <div className="font-bold text-xl text-orange-700">
                  {fournituresCalculees.totaux.total.toFixed(0)} €
                </div>
              </div>
            </div>

            {/* Tableau détaillé par culture */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 border text-left font-semibold">
                      Culture
                    </th>
                    <th className="px-3 py-2 border text-center font-semibold">
                      Planches
                    </th>
                    <th className="px-3 py-2 border text-right font-semibold text-green-700">
                      Semences
                    </th>
                    <th className="px-3 py-2 border text-right font-semibold text-amber-700">
                      Fertilisation
                    </th>
                    <th className="px-3 py-2 border text-right font-semibold text-blue-700">
                      Protection
                    </th>
                    <th className="px-3 py-2 border text-right font-semibold text-purple-700">
                      Bio-trait.
                    </th>
                    <th className="px-3 py-2 border text-right font-semibold text-orange-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(fournituresCalculees.parCulture).map(
                    ([id, data]) => {
                      return (
                        <tr key={id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 border font-medium">
                            {data.nom}
                          </td>
                          <td className="px-3 py-2 border text-center">
                            {data.planches}
                          </td>
                          <td
                            className={`px-3 py-2 border text-right cursor-pointer hover:bg-green-50 ${
                              data.ajuste.semences ? "bg-yellow-100" : ""
                            }`}
                            onClick={() => {
                              const newVal = prompt(
                                `Semences pour ${
                                  data.nom
                                } (actuel: ${data.semences.toFixed(0)}€):`,
                                data.semences.toFixed(0)
                              );
                              if (newVal !== null)
                                handleAjusterFourniture(
                                  id,
                                  "semences",
                                  parseFloat(newVal) || 0
                                );
                            }}
                            title="Cliquez pour modifier"
                          >
                            {data.semences.toFixed(0)} €
                          </td>
                          <td
                            className={`px-3 py-2 border text-right cursor-pointer hover:bg-amber-50 ${
                              data.ajuste.fertilisation ? "bg-yellow-100" : ""
                            }`}
                            onClick={() => {
                              const newVal = prompt(
                                `Fertilisation pour ${
                                  data.nom
                                } (actuel: ${data.fertilisation.toFixed(0)}€):`,
                                data.fertilisation.toFixed(0)
                              );
                              if (newVal !== null)
                                handleAjusterFourniture(
                                  id,
                                  "fertilisation",
                                  parseFloat(newVal) || 0
                                );
                            }}
                            title="Cliquez pour modifier"
                          >
                            {data.fertilisation.toFixed(0)} €
                          </td>
                          <td
                            className={`px-3 py-2 border text-right cursor-pointer hover:bg-blue-50 ${
                              data.ajuste.protection ? "bg-yellow-100" : ""
                            }`}
                            onClick={() => {
                              const newVal = prompt(
                                `Protection pour ${
                                  data.nom
                                } (actuel: ${data.protection.toFixed(0)}€):`,
                                data.protection.toFixed(0)
                              );
                              if (newVal !== null)
                                handleAjusterFourniture(
                                  id,
                                  "protection",
                                  parseFloat(newVal) || 0
                                );
                            }}
                            title="Cliquez pour modifier"
                          >
                            {data.protection.toFixed(0)} €
                          </td>
                          <td
                            className={`px-3 py-2 border text-right cursor-pointer hover:bg-purple-50 ${
                              data.ajuste.biotraitement ? "bg-yellow-100" : ""
                            }`}
                            onClick={() => {
                              const newVal = prompt(
                                `Bio-traitement pour ${
                                  data.nom
                                } (actuel: ${data.biotraitement.toFixed(0)}€):`,
                                data.biotraitement.toFixed(0)
                              );
                              if (newVal !== null)
                                handleAjusterFourniture(
                                  id,
                                  "biotraitement",
                                  parseFloat(newVal) || 0
                                );
                            }}
                            title="Cliquez pour modifier"
                          >
                            {data.biotraitement.toFixed(0)} €
                          </td>
                          <td className="px-3 py-2 border text-right font-bold text-orange-700">
                            {data.total.toFixed(0)} €
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
                <tfoot className="bg-orange-100 font-bold">
                  <tr>
                    <td className="px-3 py-2 border">TOTAL</td>
                    <td className="px-3 py-2 border text-center">
                      {culturesSelectionnees.reduce(
                        (s, c) => s + (c.totalPlanches || 0),
                        0
                      )}
                    </td>
                    <td className="px-3 py-2 border text-right text-green-700">
                      {fournituresCalculees.totaux.semences.toFixed(0)} €
                    </td>
                    <td className="px-3 py-2 border text-right text-amber-700">
                      {fournituresCalculees.totaux.fertilisation.toFixed(0)} €
                    </td>
                    <td className="px-3 py-2 border text-right text-blue-700">
                      {fournituresCalculees.totaux.protection.toFixed(0)} €
                    </td>
                    <td className="px-3 py-2 border text-right text-purple-700">
                      {fournituresCalculees.totaux.biotraitement.toFixed(0)} €
                    </td>
                    <td className="px-3 py-2 border text-right text-orange-800 text-lg">
                      {fournituresCalculees.totaux.total.toFixed(0)} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Note explicative */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
              <Info className="w-4 h-4 inline mr-1" />
              Les valeurs sont calculées automatiquement selon les chartes de
              culture. Cliquez sur une valeur pour l'ajuster manuellement
              (surlignée en jaune). Le total est répercuté dans l'onglet
              Résultats.
            </div>
          </>
        )}
      </Section>
    </div>
  );
};

export default SimulateurScenarios;
