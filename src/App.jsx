// App.jsx V21 - Valeurs par défaut à ZÉRO + Onboarding + Mode Guidé
// 🎯 Le maraîcher doit configurer ses propres données
// 🆕 V21 : Onboarding, fournitures state, mode guidé contextuel par onglet

import React, { useState, useEffect } from "react";
import {
  Sprout,
  ShoppingCart,
  Home,
  Leaf,
  Calendar,
  ClipboardList,
  BarChart3,
  FileSpreadsheet,
  Sliders,
  TrendingUp,
  X,
  ArrowRight,
  CheckCircle,
  CalendarDays,
} from "lucide-react";

// Composants
import AgendaPlanning from "./components/AgendaPlanning";
import TachesCalendrier from "./components/TachesCalendrier";
import ConfigurationMarche from "./components/ConfigurationMarche";
import ConfigurationJardins from "./components/ConfigurationJardins";
import SelectionCultures from "./components/SelectionCultures";
import Planification from "./components/Planification";
import CalendrierTaches from "./components/CalendrierTaches";
import Resultats from "./components/Resultats";
import ExportExcel from "./components/ExportExcel";
import SimulateurScenarios from "./components/SimulateurScenarios";

// Constantes
import { NIVEAUX_MATURITE, NIVEAU_MATURITE_DEFAUT } from "./utils/constantes";

// ═══════════════════════════════════════════════════════════════════════════
// 🆕 V21 : GUIDES PAR ONGLET
// ═══════════════════════════════════════════════════════════════════════════
const GUIDES_ONGLETS = {
  marche: {
    titre: "🛒 Définissez votre marché",
    description:
      "Commencez par indiquer combien de paniers AMAP, ventes au marché et restaurants vous souhaitez fournir chaque semaine.",
    etapes: [
      "Entrez le nombre de paniers AMAP (ex: 30 paniers/semaine)",
      "Ajoutez vos ventes directes au marché si applicable",
      "Précisez vos livraisons restaurants",
      "Le CA Commercial estimé s'affiche automatiquement",
    ],
    conseil:
      "💡 Commencez prudemment la 1ère année. Vous pourrez toujours augmenter ensuite.",
  },
  jardins: {
    titre: "🏡 Configurez vos espaces de culture",
    description:
      "Décrivez vos jardins : nombre de planches et leur longueur. Cela détermine votre capacité de production.",
    etapes: [
      "Cliquez sur 'Ajouter un jardin'",
      "Donnez un nom (ex: Jardin Principal, Serre 1...)",
      "Indiquez le nombre de planches et leur longueur",
      "Utilisez 'Dupliquer' pour créer des jardins similaires",
    ],
    conseil:
      "💡 Une planche standard fait 15m × 80cm. Comptez ~12m² par planche de 15m.",
  },
  simulateur: {
    titre: "⚖️ Trouvez l'équilibre offre/demande",
    description:
      "Le simulateur calcule si votre capacité (planches) peut satisfaire votre demande (marché). Ajustez les curseurs pour trouver le bon équilibre.",
    etapes: [
      "Vérifiez vos contraintes (planches disponibles, niveau)",
      "Utilisez les curseurs pour ajuster vos objectifs",
      "Observez la jauge d'utilisation en temps réel",
      "Cliquez sur un scénario pour le pré-sélectionner",
    ],
    conseil: "💡 Visez 80-90% d'utilisation pour garder une marge de sécurité.",
  },
  cultures: {
    titre: "🌱 Sélectionnez vos cultures",
    description:
      "Choisissez les légumes à cultiver. Le système calcule automatiquement le nombre de séries et planches nécessaires.",
    etapes: [
      "Parcourez le catalogue de cultures",
      "Cliquez sur une culture pour voir ses détails",
      "Cliquez 'Ajouter' pour l'inclure dans votre plan",
      "Ajustez les paramètres si nécessaire (délai, planches...)",
    ],
    conseil:
      "💡 Commencez par 5-8 cultures maîtrisées plutôt que 20 cultures mal gérées.",
  },
  planification: {
    titre: "📅 Visualisez votre calendrier",
    description:
      "Le planning affiche toutes vos séries sur un calendrier. Vérifiez les chevauchements et optimisez vos rotations.",
    etapes: [
      "Consultez la vue Gantt pour voir l'occupation des planches",
      "Vérifiez qu'il n'y a pas de surcharge certaines semaines",
      "Identifiez les fenêtres d'intercalage disponibles",
      "Ajustez vos cultures si nécessaire",
    ],
    conseil:
      "💡 Les couleurs indiquent les phases : semis (vert), croissance (bleu), récolte (orange).",
  },
  taches: {
    titre: "📋 Gérez vos interventions",
    description:
      "Le calendrier des tâches liste toutes les interventions à réaliser : semis, plantations, récoltes, entretien...",
    etapes: [
      "Filtrez par semaine ou par type de tâche",
      "Cochez les tâches réalisées",
      "Anticipez les pics de travail",
      "Exportez votre planning hebdomadaire",
    ],
    conseil:
      "💡 Prévoyez 60% du temps pour la récolte, 30% entretien, 10% implantation.",
  },
  agenda: {
    titre: "📆 Vue opérationnelle",
    description:
      "L'agenda synthétise tout ce qui se passe cette semaine : besoins marché, tâches du jour, état des jardins.",
    etapes: [
      "Consultez les besoins de la semaine en cours",
      "Vérifiez les tâches prioritaires",
      "Naviguez entre les semaines",
      "Utilisez la vue mois pour anticiper",
    ],
    conseil: "💡 Consultez l'agenda chaque lundi pour planifier votre semaine.",
  },
  resultats: {
    titre: "📊 Analysez votre rentabilité",
    description:
      "Les résultats comparent votre CA planifié aux coûts (intrants, main d'œuvre) pour évaluer la viabilité économique.",
    etapes: [
      "Comparez CA Commercial vs CA Planifié",
      "Analysez les surplus par culture",
      "Vérifiez vos marges (opérationnelle et complète)",
      "Identifiez les cultures les plus rentables",
    ],
    conseil: "💡 Visez 35-55€/m² de CA et une marge opérationnelle positive.",
  },
  export: {
    titre: "📥 Exportez vos données",
    description:
      "Téléchargez un fichier Excel complet avec toutes vos données : planning, cultures, résultats financiers...",
    etapes: [
      "Vérifiez que toutes vos cultures sont configurées",
      "Cliquez sur 'Télécharger Excel'",
      "Le fichier contient 15 feuilles détaillées",
      "Utilisez-le pour vos déclarations ou votre banquier",
    ],
    conseil:
      "💡 Exportez régulièrement pour garder un historique de vos planifications.",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 🆕 V21 : COMPOSANT GUIDE HEADER (masquable par onglet) - RESPONSIVE
// ═══════════════════════════════════════════════════════════════════════════
const GuideHeader = ({ onglet, isVisible, onMasquer }) => {
  const guide = GUIDES_ONGLETS[onglet];
  if (!guide || !isVisible) return null;

  return (
    <div className="mb-4 md:mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl overflow-hidden">
      {/* Header avec bouton masquer */}
      <div className="px-3 md:px-4 py-2 md:py-3 bg-blue-100 flex items-center justify-between">
        <h3 className="font-bold text-blue-800 flex items-center text-sm md:text-base">
          <span className="text-lg md:text-xl mr-2">📘</span>
          <span className="hidden sm:inline">{guide.titre}</span>
          <span className="sm:hidden">
            {guide.titre.split(" ").slice(0, 3).join(" ")}...
          </span>
        </h3>
        <button
          onClick={() => onMasquer(onglet)}
          className="text-[10px] md:text-xs px-2 md:px-3 py-1 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors flex items-center min-h-[32px] md:min-h-[36px]"
        >
          <X className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Masquer ce guide</span>
          <span className="sm:hidden">Masquer</span>
        </button>
      </div>

      {/* Contenu */}
      <div className="p-3 md:p-4">
        <p className="text-gray-700 mb-3 md:mb-4 text-sm md:text-base">
          {guide.description}
        </p>

        {/* Étapes */}
        <div className="bg-white rounded-lg p-2 md:p-3 mb-3">
          <p className="text-xs md:text-sm font-semibold text-gray-600 mb-2">
            📋 Étapes :
          </p>
          <ol className="list-decimal list-inside space-y-1 text-xs md:text-sm text-gray-600">
            {guide.etapes.map((etape, i) => (
              <li key={i} className="pl-1 md:pl-2">
                {etape}
              </li>
            ))}
          </ol>
        </div>

        {/* Conseil */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 md:p-3 text-xs md:text-sm text-yellow-800">
          {guide.conseil}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
function App() {
  // ═══════════════════════════════════════════════════════════════════════
  // ÉTATS GLOBAUX
  // ═══════════════════════════════════════════════════════════════════════

  const [activeTab, setActiveTab] = useState("marche");

  // 🆕 V21 : Onboarding - affiché une seule fois
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const seen = localStorage.getItem("onboardingSeen");
    return !seen;
  });

  // 🆕 V21 : Configuration du marché - VALEURS À ZÉRO PAR DÉFAUT
  const [marche, setMarche] = useState({
    amap: 0, // 🆕 Zéro par défaut
    tauxPetit: 0.33,
    tauxMoyen: 0.33,
    tauxGrand: 0.34,
    marche: 0, // 🆕 Zéro par défaut
    restaurant: 0, // 🆕 Zéro par défaut
  });

  // Marché validé
  const [marcheValide, setMarcheValide] = useState({
    amap: 0,
    tauxPetit: 0.33,
    tauxMoyen: 0.33,
    tauxGrand: 0.34,
    marche: 0,
    restaurant: 0,
  });

  // 🆕 V21 : Configuration des jardins - VIDE PAR DÉFAUT
  const [jardins, setJardins] = useState([]);

  // Niveau de maturité
  const [niveauMaturite, setNiveauMaturite] = useState(() => {
    const saved = localStorage.getItem("niveauMaturite");
    return saved || NIVEAU_MATURITE_DEFAUT;
  });

  // Longueur de planche par défaut
  const [longueurPlancheDefaut, setLongueurPlancheDefaut] = useState(() => {
    const saved = localStorage.getItem("longueurPlancheDefaut");
    return saved ? parseInt(saved) : 15;
  });

  // Cultures sélectionnées
  const [culturesSelectionnees, setCulturesSelectionnees] = useState([]);

  // 🆕 V21 : État fournitures (calculé dans Simulateur, utilisé dans Résultats)
  const [fournitures, setFournitures] = useState({
    semences: {},
    fertilisation: {},
    protection: {},
    biotraitement: {},
    total: 0,
  });

  // 🆕 V26 : Planches calculées par le Simulateur (source de vérité)
  const [planchesSimulateur, setPlanchesSimulateur] = useState({
    parCulture: {}, // { tomate: 12, courgette: 8, ... }
    total: 0, // Total planches nécessaires
    detailCalcul: null, // Détail complet du calcul
  });

  // 🆕 V26 : Heures calculées depuis l'onglet Tâches
  const [heuresTaches, setHeuresTaches] = useState(0);

  // 🆕 V21 : Mode guidé - PAR ONGLET (chaque onglet peut être masqué individuellement)
  const [guidesVisibles, setGuidesVisibles] = useState(() => {
    const saved = localStorage.getItem("guidesVisibles");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {}; // Tous visibles par défaut
      }
    }
    return {}; // Objet vide = tous visibles par défaut
  });

  // Masquer le guide d'un onglet spécifique
  const masquerGuide = (onglet) => {
    setGuidesVisibles((prev) => ({
      ...prev,
      [onglet]: false,
    }));
  };

  // Réafficher tous les guides
  const afficherTousLesGuides = () => {
    setGuidesVisibles({});
  };

  // Vérifier si un guide est visible
  const isGuideVisible = (onglet) => {
    return guidesVisibles[onglet] !== false; // Visible par défaut si pas dans l'objet
  };

  // Compter les guides masqués
  const nbGuidesMasques = Object.values(guidesVisibles).filter(
    (v) => v === false
  ).length;

  // Sauvegarder les guides visibles
  useEffect(() => {
    localStorage.setItem("guidesVisibles", JSON.stringify(guidesVisibles));
  }, [guidesVisibles]);

  // ═══════════════════════════════════════════════════════════════════════
  // PERSISTANCE LOCALSTORAGE
  // ═══════════════════════════════════════════════════════════════════════

  useEffect(() => {
    localStorage.setItem("niveauMaturite", niveauMaturite);
  }, [niveauMaturite]);

  useEffect(() => {
    localStorage.setItem(
      "longueurPlancheDefaut",
      longueurPlancheDefaut.toString()
    );
  }, [longueurPlancheDefaut]);

  // Charger les données sauvegardées au démarrage
  useEffect(() => {
    const savedMarche = localStorage.getItem("marche");
    if (savedMarche) {
      try {
        const parsed = JSON.parse(savedMarche);
        setMarche(parsed);
        setMarcheValide(parsed);
      } catch (e) {
        console.error("Erreur chargement marché:", e);
      }
    }

    const savedJardins = localStorage.getItem("jardins");
    if (savedJardins) {
      try {
        const parsed = JSON.parse(savedJardins);
        // 🆕 V21 : Ne charger que si non vide
        if (parsed && parsed.length > 0) {
          setJardins(parsed);
        }
      } catch (e) {
        console.error("Erreur chargement jardins:", e);
      }
    }

    const savedFournitures = localStorage.getItem("fournitures");
    if (savedFournitures) {
      try {
        setFournitures(JSON.parse(savedFournitures));
      } catch (e) {
        console.error("Erreur chargement fournitures:", e);
      }
    }
  }, []);

  // Sauvegarder les données
  useEffect(() => {
    localStorage.setItem("marche", JSON.stringify(marcheValide));
  }, [marcheValide]);

  useEffect(() => {
    localStorage.setItem("jardins", JSON.stringify(jardins));
  }, [jardins]);

  useEffect(() => {
    localStorage.setItem("fournitures", JSON.stringify(fournitures));
  }, [fournitures]);

  // Synchroniser marche et marcheValide
  const handleMarcheValideChange = (newMarche) => {
    setMarcheValide(newMarche);
    setMarche(newMarche);
  };

  // 🆕 V21 : Fermer onboarding et marquer comme vu
  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("onboardingSeen", "true");
  };

  // 🆕 V21 : Réinitialiser tout (pour tests)
  const resetAll = () => {
    localStorage.clear();
    window.location.reload();
  };

  // ═══════════════════════════════════════════════════════════════════════
  // CALCULS DÉRIVÉS
  // ═══════════════════════════════════════════════════════════════════════

  const totalPaniers =
    marcheValide.amap + marcheValide.marche + marcheValide.restaurant;
  const coefficientMaturite =
    NIVEAUX_MATURITE[niveauMaturite]?.coefficient || 0.7;
  const niveauConfig =
    NIVEAUX_MATURITE[niveauMaturite] || NIVEAUX_MATURITE.debutant;
  const totalPlanches = jardins.reduce((sum, j) => sum + j.nombrePlanches, 0);

  // 🆕 V21 : Vérifier si la configuration est complète
  const configurationComplete = totalPaniers > 0 && totalPlanches > 0;

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION DES ONGLETS
  // ═══════════════════════════════════════════════════════════════════════

  const tabs = [
    {
      id: "marche",
      label: "Marché",
      icon: ShoppingCart,
      description: "Définissez votre demande",
    },
    {
      id: "simulateur",
      label: "Simulateur",
      icon: Sliders,
      description: "Trouvez l'équilibre",
    },
    {
      id: "jardins",
      label: "Jardins",
      icon: Home,
      description: "Configurez vos planches",
    },
    {
      id: "cultures",
      label: "Cultures",
      icon: Leaf,
      description: "Planifiez vos séries",
    },
    {
      id: "planification",
      label: "Planification",
      icon: Calendar,
      description: "Visualisez le calendrier",
    },
    {
      id: "taches",
      label: "Tâches",
      icon: ClipboardList,
      description: "Gérez vos travaux",
    },
    {
      id: "agenda",
      label: "Agenda",
      icon: CalendarDays,
      description: "Vue opérationnelle",
    },
    {
      id: "resultats",
      label: "Résultats",
      icon: BarChart3,
      description: "Analysez la rentabilité",
    },
    {
      id: "export",
      label: "Export",
      icon: FileSpreadsheet,
      description: "Exportez vos données",
    },
  ];

  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 V21 : COMPOSANT ONBOARDING
  // ═══════════════════════════════════════════════════════════════════════

  const OnboardingBanner = () => (
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 relative">
      <button
        onClick={dismissOnboarding}
        className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          👋 Bienvenue dans votre outil de planification !
        </h2>

        <p className="mb-6 text-green-100">
          Pour commencer votre planification maraîchère, suivez ces étapes :
        </p>

        {/* Workflow visuel */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {[
            {
              num: 1,
              label: "Marché",
              desc: "Vos besoins clients",
              icon: "🛒",
            },
            { num: 2, label: "Jardins", desc: "Vos parcelles", icon: "🏡" },
            {
              num: 3,
              label: "Simulateur",
              desc: "Équilibre offre/demande",
              icon: "⚖️",
            },
            {
              num: 4,
              label: "Cultures",
              desc: "Sélection légumes",
              icon: "🌱",
            },
            {
              num: 5,
              label: "Planification",
              desc: "Calendrier visuel",
              icon: "📅",
            },
            {
              num: 6,
              label: "Résultats",
              desc: "Analyse financière",
              icon: "📊",
            },
          ].map((step, i, arr) => (
            <React.Fragment key={step.num}>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center min-w-[100px]">
                <div className="text-2xl mb-1">{step.icon}</div>
                <div className="font-bold text-sm">
                  {step.num}. {step.label}
                </div>
                <div className="text-xs text-green-100">{step.desc}</div>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight className="w-5 h-5 text-green-200 hidden md:block" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => {
              dismissOnboarding();
              setActiveTab("marche");
            }}
            className="px-6 py-3 bg-white text-green-700 rounded-lg font-bold hover:bg-green-50 transition-colors flex items-center"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Commencer par le Marché
          </button>
          <button
            onClick={() => {
              dismissOnboarding();
              setActiveTab("jardins");
            }}
            className="px-6 py-3 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 transition-colors flex items-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Configurer mes Jardins
          </button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 V21 : ALERTE CONFIGURATION INCOMPLÈTE
  // ═══════════════════════════════════════════════════════════════════════

  const ConfigurationAlert = () => {
    if (configurationComplete) return null;

    const manqueMarche = totalPaniers === 0;
    const manqueJardins = totalPlanches === 0;

    return (
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <h4 className="font-bold text-amber-800">
              Configuration incomplète
            </h4>
            <p className="text-sm text-amber-700 mt-1">
              Pour utiliser le simulateur et planifier vos cultures, vous devez
              d'abord :
            </p>
            <ul className="mt-2 space-y-1">
              {manqueMarche && (
                <li className="flex items-center text-sm text-amber-700">
                  <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center mr-2 text-xs">
                    1
                  </span>
                  <button
                    onClick={() => setActiveTab("marche")}
                    className="underline hover:text-amber-900"
                  >
                    Définir vos besoins marché
                  </button>
                  (AMAP, ventes, restaurants)
                </li>
              )}
              {manqueJardins && (
                <li className="flex items-center text-sm text-amber-700">
                  <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center mr-2 text-xs">
                    2
                  </span>
                  <button
                    onClick={() => setActiveTab("jardins")}
                    className="underline hover:text-amber-900"
                  >
                    Configurer vos jardins
                  </button>
                  (nombre de planches)
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 🆕 V21 : Onboarding */}
      {showOnboarding && <OnboardingBanner />}

      {/* En-tête - 🆕 V21 Responsive */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo et titre */}
            <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sprout className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-xl font-bold text-gray-900 truncate">
                  <span className="hidden sm:inline">
                    Planification Maraîchère Bio-Intensive
                  </span>
                  <span className="sm:hidden">Planif. Maraîchère</span>
                </h1>
                <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
                  Version 21.0 - Configuration personnalisée
                </p>
              </div>
            </div>

            {/* Badge niveau de maturité + Toggle mode guidé */}
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              {/* 🆕 V21 : Bouton pour réafficher tous les guides */}
              {nbGuidesMasques > 0 && (
                <button
                  onClick={afficherTousLesGuides}
                  className="px-2 md:px-3 py-1.5 rounded-lg flex items-center space-x-1 md:space-x-2 transition-all text-xs md:text-sm bg-blue-100 text-blue-700 border-2 border-blue-300 hover:bg-blue-200 min-h-[44px]"
                  title="Réafficher tous les guides masqués"
                >
                  <span className="text-base md:text-lg">📘</span>
                  <span className="font-medium hidden lg:inline">
                    Réafficher guides ({nbGuidesMasques})
                  </span>
                  <span className="font-medium lg:hidden">
                    +{nbGuidesMasques}
                  </span>
                </button>
              )}

              <button
                onClick={() => setActiveTab("simulateur")}
                className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg flex items-center space-x-1 md:space-x-2 transition-all hover:shadow-md min-h-[44px]"
                style={{
                  backgroundColor: niveauConfig.couleur + "20",
                  border: `2px solid ${niveauConfig.couleur}`,
                }}
                title="Cliquez pour modifier dans le Simulateur"
              >
                <span className="text-base md:text-lg">
                  {niveauConfig.icone}
                </span>
                <span
                  className="font-medium text-xs md:text-sm hidden sm:inline"
                  style={{ color: niveauConfig.couleur }}
                >
                  {niveauConfig.label}
                </span>
                <span
                  className="text-[10px] md:text-xs px-1 md:px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: niveauConfig.couleur,
                    color: "white",
                  }}
                >
                  ×{coefficientMaturite}
                </span>
              </button>

              <div className="text-right text-xs md:text-sm text-gray-500 hidden md:block">
                <p>Sud-Ouest France</p>
                <p>Saison 2025 (Mai-Sept)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation par onglets - 🆕 V21 Responsive */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          {/* Scrollable sur mobile, wrap sur tablette+ */}
          <div className="flex overflow-x-auto py-2 scrollbar-hide -mx-2 px-2 md:flex-wrap md:justify-start gap-1">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              // 🆕 V21 : Indicateur de complétion
              const isComplete =
                (tab.id === "marche" && totalPaniers > 0) ||
                (tab.id === "jardins" && totalPlanches > 0) ||
                (tab.id !== "marche" && tab.id !== "jardins");

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 md:space-x-2 px-2.5 md:px-4 py-2 md:py-2.5 rounded-lg font-medium text-xs md:text-sm transition-all whitespace-nowrap relative group min-h-[44px] ${
                    isActive
                      ? "bg-green-100 text-green-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                  }`}
                >
                  {/* Numéro - caché sur mobile si pas actif */}
                  <span
                    className={`w-5 h-5 rounded-full flex-shrink-0 items-center justify-center text-xs font-bold hidden md:flex ${
                      isActive
                        ? "bg-green-600 text-white"
                        : isComplete
                        ? "bg-green-400 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {isComplete && !isActive ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>

                  {/* Tooltip - desktop only */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 hidden md:block">
                    {tab.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Contenu principal - 🆕 V21 Responsive */}
      <main className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
        {/* 🆕 V21 : Alerte si configuration incomplète */}
        {!configurationComplete &&
          activeTab !== "marche" &&
          activeTab !== "jardins" && <ConfigurationAlert />}

        {/* 🆕 V21 : Guide Header contextuel (masquable par onglet) */}
        <GuideHeader
          onglet={activeTab}
          isVisible={isGuideVisible(activeTab)}
          onMasquer={masquerGuide}
        />

        {/* Configuration du marché */}
        {activeTab === "marche" && (
          <ConfigurationMarche
            marche={marche}
            setMarche={setMarche}
            marcheValide={marcheValide}
            setMarcheValide={setMarcheValide}
          />
        )}

        {/* Configuration des jardins */}
        {activeTab === "jardins" && (
          <ConfigurationJardins jardins={jardins} setJardins={setJardins} />
        )}

        {/* Simulateur */}
        {activeTab === "simulateur" && (
          <SimulateurScenarios
            marche={marcheValide}
            setMarcheValide={handleMarcheValideChange}
            jardins={jardins}
            niveauMaturite={niveauMaturite}
            setNiveauMaturite={setNiveauMaturite}
            culturesSelectionnees={culturesSelectionnees}
            fournitures={fournitures}
            setFournitures={setFournitures}
            setPlanchesSimulateur={setPlanchesSimulateur}
          />
        )}

        {/* Sélection des cultures */}
        {activeTab === "cultures" && (
          <SelectionCultures
            culturesSelectionnees={culturesSelectionnees}
            setCulturesSelectionnees={setCulturesSelectionnees}
            jardins={jardins}
            marche={marcheValide}
            onChangeTab={setActiveTab}
            niveauMaturite={niveauMaturite}
            longueurPlanche={longueurPlancheDefaut}
            planchesSimulateur={planchesSimulateur}
          />
        )}

        {/* Planification visuelle */}
        {activeTab === "planification" && (
          <Planification
            culturesSelectionnees={culturesSelectionnees}
            jardins={jardins}
            niveauMaturite={niveauMaturite}
          />
        )}

        {/* Calendrier des tâches */}
        {activeTab === "taches" && (
          <CalendrierTaches
            culturesSelectionnees={culturesSelectionnees}
            jardins={jardins}
            setHeuresTaches={setHeuresTaches}
          />
        )}

        {/* 🆕 V21 : Agenda opérationnel */}
        {activeTab === "agenda" && (
          <AgendaPlanning
            marche={marcheValide}
            jardins={jardins}
            culturesSelectionnees={culturesSelectionnees}
            niveauMaturite={niveauMaturite}
          />
        )}

        {/* Résultats financiers */}
        {activeTab === "resultats" && (
          <Resultats
            marche={marcheValide}
            jardins={jardins}
            culturesSelectionnees={culturesSelectionnees}
            niveauMaturite={niveauMaturite}
            fournitures={fournitures}
            heuresTaches={heuresTaches}
          />
        )}

        {/* Export Excel */}
        {activeTab === "export" && (
          <ExportExcel
            marche={marcheValide}
            jardins={jardins}
            culturesSelectionnees={culturesSelectionnees}
            niveauMaturite={niveauMaturite}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>
              Méthodologie inspirée de l'Institut Jardinier Maraîcher • Adapté
              pour le Sud-Ouest de la France
            </p>
            <div className="flex items-center space-x-4">
              {configurationComplete ? (
                <>
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                    {totalPaniers} unités/semaine
                  </span>
                  <span>{totalPlanches} planches disponibles</span>
                </>
              ) : (
                <span className="text-amber-600">
                  ⚠️ Configuration en cours...
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
