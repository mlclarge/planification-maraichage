// Resultats_V24.jsx - CALCULS CORRIGÉS
// 🔧 V24 : Suppression doublon Main d'œuvre/Salaires
// 🔧 V24 : Un seul poste "Coûts Main d'œuvre et intrants"
// 🔧 V24 : Suppression blocs inutiles (3 CA, comparaison niveaux)
// 📱 V21.1 : Optimisations responsive mobile

import React, { useMemo, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Briefcase,
  Building2,
  ChevronDown,
  Info,
  HelpCircle,
  ArrowRight,
  ShoppingCart,
  Leaf,
  AlertTriangle,
  BarChart3,
  Target,
  Wallet,
  Factory,
  Store,
  Lightbulb,
} from "lucide-react";
import { calculerBesoinHebdo } from "../data/compositionsPaniers";
import { SAISON, estDansSaison, NIVEAUX_MATURITE } from "../utils/constantes";

// Prix contextuels par niveau de marché (€/kg ou €/botte)
const prixContextuels = {
  bas: {
    tomate: 2.9,
    courgette: 2.0,
    concombre: 3.75,
    aubergine: 3.5,
    haricot: 10.0,
    mesclun: 14.0,
    verdurette: 12.0,
    carotte: 1.8,
    betterave: 2.5,
    radis: 6.0,
    basilic: 30.0,
  },
  moyen: {
    tomate: 3.8,
    courgette: 3.0,
    concombre: 5.0,
    aubergine: 4.5,
    haricot: 13.0,
    mesclun: 18.0,
    verdurette: 16.0,
    carotte: 2.5,
    betterave: 3.5,
    radis: 8.33,
    basilic: 40.0,
  },
  haut: {
    tomate: 4.8,
    courgette: 4.5,
    concombre: 6.25,
    aubergine: 6.0,
    haricot: 16.0,
    mesclun: 24.0,
    verdurette: 22.0,
    carotte: 3.2,
    betterave: 4.5,
    radis: 10.67,
    basilic: 50.0,
  },
};

// Prix des paniers AMAP
const PRIX_PANIERS = {
  petit: 15,
  moyen: 25,
  grand: 35,
};

const Resultats = ({
  marche,
  jardins,
  culturesSelectionnees,
  niveauMaturite = "debutant",
  longueurPlanche = 15,
  heuresTaches = 0,
}) => {
  const [afficherTableauIntrants, setAfficherTableauIntrants] = useState(true);
  const [tauxHoraire, setTauxHoraire] = useState(15); // SMIC agricole brut
  const [niveauRentabilite, setNiveauRentabilite] = useState("operationnelle");
  const [showExplicationCA, setShowExplicationCA] = useState(true);
  const [showTableauCA, setShowTableauCA] = useState(false);

  // 🆕 V19 : Accordéons avec logique corrigée
  const [accordeons, setAccordeons] = useState({});
  const toggle = (id) =>
    setAccordeons((prev) => ({
      ...prev,
      [id]: prev[id] === true ? false : true,
    }));
  const isOpen = (id, defaultOpen = false) =>
    accordeons[id] === true || (accordeons[id] === undefined && defaultOpen);

  // 🆕 V19 : Boutons tout ouvrir/fermer CORRIGÉS
  const ouvrirTout = () => {
    setAccordeons({
      recap: true,
      global: true,
      tableauCA: true,
      niveau: true,
      rentabilite: true,
      comparaison: true,
      salaires: true,
      kpis: true,
      temps: true,
      intrants: true,
      fixes: true,
      mo: true,
    });
  };

  const fermerTout = () => {
    setAccordeons({
      recap: false,
      global: false,
      tableauCA: false,
      niveau: false,
      rentabilite: false,
      comparaison: false,
      salaires: false,
      kpis: false,
      temps: false,
      intrants: false,
      fixes: false,
      mo: false,
    });
  };

  // Config niveau maturité
  const niveauConfig =
    NIVEAUX_MATURITE[niveauMaturite] || NIVEAUX_MATURITE.debutant;

  // Composant Accordéon
  const Section = ({
    id,
    title,
    icon,
    children,
    defaultOpen = false,
    badge = null,
    color = "gray",
  }) => {
    const open = isOpen(id, defaultOpen);
    const colors = {
      gray: "border-gray-200 bg-gray-50",
      green: "border-green-300 bg-green-50",
      blue: "border-blue-300 bg-blue-50",
      purple: "border-purple-300 bg-purple-50",
      orange: "border-orange-300 bg-orange-50",
      red: "border-red-300 bg-red-50",
      indigo: "border-indigo-300 bg-indigo-50",
    };
    return (
      <div
        className={`border-2 rounded-xl overflow-hidden mb-4 ${colors[color]}`}
      >
        <button
          onClick={() => toggle(id)}
          className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-white/50 transition-colors text-left"
        >
          <span className="font-bold text-base md:text-lg text-gray-900 flex items-center">
            <span className="mr-2 text-lg md:text-xl">{icon}</span>
            <span className="line-clamp-1">{title}</span>
          </span>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {badge && (
              <span className="text-xs bg-white px-2 py-1 rounded font-medium hidden sm:inline">
                {badge}
              </span>
            )}
            <ChevronDown
              className={`w-5 h-5 md:w-6 md:h-6 text-gray-500 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
        {open && <div className="p-3 md:p-4 bg-white border-t">{children}</div>}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🆕 V19 : CALCUL DE TOUS LES CA AVEC TERMINOLOGIE UNIFIÉE
  // ═══════════════════════════════════════════════════════════════════════════

  // 1. CA COMMERCIAL (ancien "CA Potentiel") - Ce que les clients paient
  const caCommercial = useMemo(() => {
    const nbSemaines = SAISON.fin - SAISON.debut + 1; // 21 semaines

    const nbPetit = Math.round(marche.amap * (marche.tauxPetit || 0.33));
    const nbMoyen = Math.round(marche.amap * (marche.tauxMoyen || 0.33));
    const nbGrand = Math.round(marche.amap * (marche.tauxGrand || 0.34));

    const caHebdoAMAP =
      nbPetit * PRIX_PANIERS.petit +
      nbMoyen * PRIX_PANIERS.moyen +
      nbGrand * PRIX_PANIERS.grand;
    const caHebdoMarche = marche.marche * PRIX_PANIERS.moyen;
    const caHebdoRestaurant = marche.restaurant * PRIX_PANIERS.grand;

    return {
      hebdo: {
        amap: caHebdoAMAP,
        marche: caHebdoMarche,
        restaurant: caHebdoRestaurant,
        total: caHebdoAMAP + caHebdoMarche + caHebdoRestaurant,
      },
      saison: {
        amap: caHebdoAMAP * nbSemaines,
        marche: caHebdoMarche * nbSemaines,
        restaurant: caHebdoRestaurant * nbSemaines,
        total: (caHebdoAMAP + caHebdoMarche + caHebdoRestaurant) * nbSemaines,
      },
      detail: { nbPetit, nbMoyen, nbGrand },
    };
  }, [marche]);

  // 🔧 V25 : CA Planifié supprimé - On utilise uniquement CA Commercial

  // 3. TOTAUX FINANCIERS - 🔧 V25 basé sur CA Commercial
  const totaux = useMemo(() => {
    // 🔧 V24 : Calcul surface avec valeurs par défaut sécurisées
    const surface = jardins.reduce((sum, j) => {
      const longueur = j.longueurPlanche || 15;
      const largeur = 0.8;
      return sum + j.nombrePlanches * longueur * largeur;
    }, 0);
    const planches = jardins.reduce((sum, j) => sum + j.nombrePlanches, 0);

    // 🔧 V24 : Intrants variables basés sur les cultures sélectionnées
    // Formule cohérente avec le Simulateur :
    // - Fertilisation : ~0.27 €/m² (compost 0.20 + amendement 0.05 + foliaire 0.02)
    // - Semences : ~0.50 €/m² (estimation moyenne)
    // - Protection : ~0.30 €/m² (amortis sur plusieurs années)
    // - Biotraitement : ~0.16 €/m²
    // TOTAL : ~1.23 €/m² (cohérent avec l'ancienne formule)
    const intrantsVariablesEstimes = Math.round(surface * 1.23);

    // Intrants fixes (amortissements) : ~2.87 €/m²
    // - Matériel : 0.55 €/m²
    // - Serres/bâches : 0.37 €/m²
    // - Irrigation : 0.15 €/m²
    // - Véhicule : 0.70 €/m²
    // - Matériel vente : 0.40 €/m²
    // - Énergie : 0.20 €/m²
    // - Admin : 0.50 €/m²
    const intrantsFixesEstimes = Math.round(surface * 2.87);

    console.log("📊 Résultats V24 - Calculs:", {
      surface: surface.toFixed(0) + " m²",
      planches,
      intrantsVariables: intrantsVariablesEstimes + " €",
      intrantsFixes: intrantsFixesEstimes + " €",
    });

    return {
      surface,
      planches,
      ca: caCommercial.saison.total, // 🔧 V25 : Utilise CA Commercial au lieu de CA Planifié
      intrantsVariables: intrantsVariablesEstimes,
      intrantsFixes: intrantsFixesEstimes,
    };
  }, [jardins, caCommercial]);

  // 🆕 V26 : Coût basé sur heures réelles de l'onglet Tâches
  const coutMainOeuvreTotal = useMemo(() => {
    const coutBrut = heuresTaches * tauxHoraire;
    const charges = Math.round(coutBrut * 0.45);
    return Math.round(coutBrut + charges);
  }, [heuresTaches, tauxHoraire]);

  // 🔧 V24 : Marges CORRIGÉES (plus de doublon)
  // Marge = CA - Intrants variables - Main d'œuvre
  const margeOperationnelle =
    totaux.ca - totaux.intrantsVariables - coutMainOeuvreTotal;
  const margeComplete = margeOperationnelle - totaux.intrantsFixes;
  const isRentableOperationnel = margeOperationnelle >= 0;
  const isRentableComplet = margeComplete >= 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header avec actions */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Résultats Financiers
              </h1>
              <p className="text-xs md:text-sm text-gray-500">
                Analyse de rentabilité V21
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={ouvrirTout}
              className="px-3 py-2 text-xs md:text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Tout ouvrir
            </button>
            <button
              onClick={fermerTout}
              className="px-3 py-2 text-xs md:text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Tout fermer
            </button>
          </div>
        </div>

        {/* KPIs rapides - 📱 Responsive grid */}
        {/* 🔧 V25 : CA Commercial uniquement */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <div className="bg-green-50 p-2 md:p-3 rounded-lg border border-green-200 text-center">
            <p className="text-xs text-gray-600">CA Commercial</p>
            <p className="text-lg md:text-xl font-bold text-green-600">
              {caCommercial.saison.total.toLocaleString()} €
            </p>
            <p className="text-[10px] text-gray-500">Demande clients</p>
          </div>
          <div
            className={`p-2 md:p-3 rounded-lg border text-center ${
              isRentableOperationnel
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p className="text-xs text-gray-600">Marge Opérat.</p>
            <p
              className={`text-lg md:text-xl font-bold ${
                isRentableOperationnel ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {margeOperationnelle.toLocaleString()} €
            </p>
          </div>
          <div
            className={`p-2 md:p-3 rounded-lg border text-center ${
              isRentableComplet
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p className="text-xs text-gray-600">Marge Complète</p>
            <p
              className={`text-lg md:text-xl font-bold ${
                isRentableComplet ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {margeComplete.toLocaleString()} €
            </p>
          </div>
        </div>
      </div>

      {/* 🔧 V24 : Bloc Calcul de Rentabilité CORRIGÉ */}
      <Section
        id="rentabilite"
        title="Calcul de Rentabilité"
        icon="🧮"
        color="indigo"
        defaultOpen={true}
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setNiveauRentabilite("operationnelle")}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              niveauRentabilite === "operationnelle"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-1" />
            Opérationnelle
          </button>
          <button
            onClick={() => setNiveauRentabilite("complete")}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              niveauRentabilite === "complete"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-1" />
            Complète
          </button>
        </div>

        {/* 🔧 V24 : Plus de doublon Main d'œuvre / Salaires */}
        <div className="space-y-2 text-sm md:text-base">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">CA Planifié (Saison)</span>
            <span className="font-bold text-green-600">
              {totaux.ca.toLocaleString()} €
            </span>
          </div>
          <div className="flex justify-between">
            <span>- Coûts intrants variables:</span>
            <span className="text-orange-600">
              -{totaux.intrantsVariables.toLocaleString()} €
            </span>
          </div>
          {niveauRentabilite === "complete" && (
            <div className="flex justify-between">
              <span>- Intrants fixes (amort.):</span>
              <span className="text-red-600">
                -{totaux.intrantsFixes.toLocaleString()} €
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>- Coûts main d'œuvre:</span>
            <span className="text-orange-600">
              -{coutMainOeuvreTotal.toLocaleString()} €
            </span>
          </div>
          <div className="text-xs text-gray-500 pl-4">
            ({heuresTaches.toFixed(0)}h × {tauxHoraire}€ + 45% charges)
          </div>
          <div className="flex justify-between pt-2 border-t-2">
            <span className="font-bold">Marge:</span>
            <span
              className={`font-bold text-lg md:text-xl ${
                (niveauRentabilite === "operationnelle"
                  ? margeOperationnelle
                  : margeComplete) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {(niveauRentabilite === "operationnelle"
                ? margeOperationnelle
                : margeComplete
              ).toLocaleString()}{" "}
              €
            </span>
          </div>
        </div>

        {/* Explication des indicateurs */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p className="font-medium mb-1">💡 Explications :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>CA Planifié</strong> : Production réelle × prix de vente
              (plafonné à la demande)
            </li>
            <li>
              <strong>Intrants variables</strong> : Semences, fertilisation,
              protection (~1.23 €/m²)
            </li>
            <li>
              <strong>Main d'œuvre</strong> : Salaires + charges sociales (45%)
            </li>
            <li>
              <strong>Marge opérationnelle</strong> : CA - intrants variables -
              main d'œuvre
            </li>
            <li>
              <strong>Marge complète</strong> : Marge opérationnelle -
              amortissements
            </li>
          </ul>
        </div>
      </Section>

      {/* 6. Configuration des Salaires - 📱 Responsive grid */}
      <Section
        id="salaires"
        title="Configuration Main d'Œuvre"
        icon="👥"
        color="blue"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Heures estimées (depuis Tâches)
            </label>
            <div className="w-full px-3 py-2 border-2 rounded bg-gray-100 min-h-[44px] flex items-center">
              <span className="font-bold text-purple-600">
                {heuresTaches.toFixed(0)} h
              </span>
              <span className="text-xs text-gray-500 ml-2">
                ({(heuresTaches / 8).toFixed(0)} journées)
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Taux horaire brut (€/h)
            </label>
            <input
              type="number"
              min="10"
              max="50"
              step="0.5"
              value={tauxHoraire}
              onChange={(e) => setTauxHoraire(parseFloat(e.target.value) || 15)}
              className="w-full px-3 py-2 border-2 rounded min-h-[44px]"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
          <div className="bg-blue-50 p-2 md:p-3 rounded border">
            <p className="text-xs">Coût brut</p>
            <p className="text-base md:text-lg font-bold text-blue-600">
              {Math.round(heuresTaches * tauxHoraire).toLocaleString()} €
            </p>
          </div>
          <div className="bg-orange-50 p-2 md:p-3 rounded border">
            <p className="text-xs">Charges (45%)</p>
            <p className="text-base md:text-lg font-bold text-orange-600">
              {Math.round(heuresTaches * tauxHoraire * 0.45).toLocaleString()} €
            </p>
          </div>
          <div className="bg-purple-50 p-2 md:p-3 rounded border">
            <p className="text-xs">Coût total</p>
            <p className="text-base md:text-lg font-bold text-purple-600">
              {coutMainOeuvreTotal.toLocaleString()} €
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Heures calculées automatiquement depuis l'onglet Tâches
        </p>
      </Section>

      {/* 🔧 V24 : Détail Intrants par Poste - Corrigé */}
      <Section
        id="intrants"
        title="Coûts Intrants Variables"
        icon="🌱"
        badge={`${totaux.intrantsVariables.toLocaleString()} €`}
        color="orange"
      >
        <div className="overflow-x-auto -mx-3 md:mx-0">
          <table className="w-full text-sm border-collapse min-w-[300px]">
            <thead className="bg-orange-100">
              <tr>
                <th className="px-2 md:px-3 py-2 border text-left">Poste</th>
                <th className="px-2 md:px-3 py-2 border text-right">€/m²</th>
                <th className="px-2 md:px-3 py-2 border text-right">
                  Total ({totaux.surface.toFixed(0)} m²)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 md:px-3 py-2 border">
                  Fertilisation (compost, engrais)
                </td>
                <td className="px-2 md:px-3 py-2 border text-right">0.65</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">
                  {(totaux.surface * 0.65).toLocaleString()} €
                </td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Semences et plants</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.42</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">
                  {(totaux.surface * 0.42).toLocaleString()} €
                </td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">
                  Protection (bio, filets)
                </td>
                <td className="px-2 md:px-3 py-2 border text-right">0.16</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">
                  {(totaux.surface * 0.16).toLocaleString()} €
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-orange-200 font-bold">
              <tr>
                <td className="px-2 md:px-3 py-2 border">
                  TOTAL INTRANTS VARIABLES
                </td>
                <td className="px-2 md:px-3 py-2 border text-right">1.23</td>
                <td className="px-2 md:px-3 py-2 border text-right">
                  {totaux.intrantsVariables.toLocaleString()} €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>

      {/* 10. Intrants Fixes - Amortissements - 📱 Responsive table */}
      <Section
        id="fixes"
        title="Intrants Fixes - Amortissements (€/m²)"
        icon="🗃️"
        badge={`${totaux.intrantsFixes.toLocaleString()} €`}
        color="red"
      >
        <div className="overflow-x-auto -mx-3 md:mx-0">
          <table className="w-full text-sm border-collapse min-w-[300px]">
            <thead className="bg-red-100">
              <tr>
                <th className="px-2 md:px-3 py-2 border text-left">Poste</th>
                <th className="px-2 md:px-3 py-2 border text-right">€/m²</th>
                <th className="px-2 md:px-3 py-2 border text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 md:px-3 py-2 border">
                  Matériel (outils, machines)
                </td>
                <td className="px-2 md:px-3 py-2 border text-right">0.55</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">
                  {(totaux.surface * 0.55).toLocaleString()} €
                </td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Serres et bâches</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.37</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">
                  {(totaux.surface * 0.37).toLocaleString()} €
                </td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Irrigation</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.15</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">
                  {(totaux.surface * 0.15).toLocaleString()} €
                </td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Véhicule livraison</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.70</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">
                  {(totaux.surface * 0.7).toLocaleString()} €
                </td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Matériel vente</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.40</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">
                  {(totaux.surface * 0.4).toLocaleString()} €
                </td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Énergie/carburants</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.20</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">
                  {(totaux.surface * 0.2).toLocaleString()} €
                </td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">
                  Frais administratifs
                </td>
                <td className="px-2 md:px-3 py-2 border text-right">0.50</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">
                  {(totaux.surface * 0.5).toLocaleString()} €
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-red-200 font-bold">
              <tr>
                <td colSpan="2" className="px-2 md:px-3 py-2 border">
                  TOTAL FIXES
                </td>
                <td className="px-2 md:px-3 py-2 border text-right">
                  {totaux.intrantsFixes.toLocaleString()} €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>
    </div>
  );
};

export default Resultats;
