// Resultats_v21_responsive.jsx - AVEC LISTE LÉGUMES DANS CA PLANIFIÉ
// 🆕 V21 : Affiche la liste des légumes avec leur CA dans le bloc "CA Planifié"
// 🎯 L'utilisateur voit directement quelles cultures contribuent au CA
// 📱 V21.1 : Optimisations responsive mobile

import React, { useMemo, useState } from 'react';
import { 
  DollarSign, TrendingUp, Package, Users, Clock, AlertCircle, 
  CheckCircle, TrendingDown, Briefcase, Building2, ChevronDown,
  Info, HelpCircle, ArrowRight, ShoppingCart, Leaf, AlertTriangle,
  BarChart3, Target, Wallet, Factory, Store, Lightbulb
} from 'lucide-react';
import { calculerIntrants, calculerBesoinHebdo } from '../data/compositionsPaniers';
import { SAISON, estDansSaison, NIVEAUX_MATURITE } from '../utils/constantes';
import { calculerEconomieIntercalage } from '../utils/calculPlanchesSimultanees';

// Prix contextuels par niveau de marché (€/kg ou €/botte)
const prixContextuels = {
  bas: { tomate: 2.90, courgette: 2.00, concombre: 3.75, aubergine: 3.50, haricot: 10.00, mesclun: 14.00, verdurette: 12.00, carotte: 1.80, betterave: 2.50, radis: 6.00, basilic: 30.00 },
  moyen: { tomate: 3.80, courgette: 3.00, concombre: 5.00, aubergine: 4.50, haricot: 13.00, mesclun: 18.00, verdurette: 16.00, carotte: 2.50, betterave: 3.50, radis: 8.33, basilic: 40.00 },
  haut: { tomate: 4.80, courgette: 4.50, concombre: 6.25, aubergine: 6.00, haricot: 16.00, mesclun: 24.00, verdurette: 22.00, carotte: 3.20, betterave: 4.50, radis: 10.67, basilic: 50.00 }
};

// Prix des paniers AMAP
const PRIX_PANIERS = {
  petit: 15,
  moyen: 25,
  grand: 35
};

const Resultats = ({ marche, jardins, culturesSelectionnees, niveauMaturite = 'debutant', longueurPlanche = 15 }) => {
  const [afficherTableauIntrants, setAfficherTableauIntrants] = useState(true);
  const [nombreSalaries, setNombreSalaries] = useState(1);
  const [salaireAnnuel, setSalaireAnnuel] = useState(24000);
  const [niveauRentabilite, setNiveauRentabilite] = useState('operationnelle');
  const [showExplicationCA, setShowExplicationCA] = useState(true);
  const [showTableauCA, setShowTableauCA] = useState(false);
  
  // 🆕 V19 : Accordéons avec logique corrigée
  const [accordeons, setAccordeons] = useState({});
  const toggle = (id) => setAccordeons(prev => ({ ...prev, [id]: prev[id] === true ? false : true }));
  const isOpen = (id, defaultOpen = false) => accordeons[id] === true || (accordeons[id] === undefined && defaultOpen);

  // 🆕 V19 : Boutons tout ouvrir/fermer CORRIGÉS
  const ouvrirTout = () => {
    setAccordeons({
      recap: true, global: true, tableauCA: true, niveau: true, 
      rentabilite: true, comparaison: true, salaires: true, 
      kpis: true, temps: true, intrants: true, fixes: true, mo: true
    });
  };
  
  const fermerTout = () => {
    setAccordeons({
      recap: false, global: false, tableauCA: false, niveau: false, 
      rentabilite: false, comparaison: false, salaires: false, 
      kpis: false, temps: false, intrants: false, fixes: false, mo: false
    });
  };

  // Config niveau maturité
  const niveauConfig = NIVEAUX_MATURITE[niveauMaturite] || NIVEAUX_MATURITE.debutant;

  // Composant Accordéon
  const Section = ({ id, title, icon, children, defaultOpen = false, badge = null, color = 'gray' }) => {
    const open = isOpen(id, defaultOpen);
    const colors = {
      gray: 'border-gray-200 bg-gray-50',
      green: 'border-green-300 bg-green-50',
      blue: 'border-blue-300 bg-blue-50',
      purple: 'border-purple-300 bg-purple-50',
      orange: 'border-orange-300 bg-orange-50',
      red: 'border-red-300 bg-red-50',
      indigo: 'border-indigo-300 bg-indigo-50'
    };
    return (
      <div className={`border-2 rounded-xl overflow-hidden mb-4 ${colors[color]}`}>
        <button onClick={() => toggle(id)} className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-white/50 transition-colors text-left">
          <span className="font-bold text-base md:text-lg text-gray-900 flex items-center">
            <span className="mr-2 text-lg md:text-xl">{icon}</span>
            <span className="line-clamp-1">{title}</span>
          </span>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {badge && <span className="text-xs bg-white px-2 py-1 rounded font-medium hidden sm:inline">{badge}</span>}
            <ChevronDown className={`w-5 h-5 md:w-6 md:h-6 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
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
    
    const caHebdoAMAP = nbPetit * PRIX_PANIERS.petit + nbMoyen * PRIX_PANIERS.moyen + nbGrand * PRIX_PANIERS.grand;
    const caHebdoMarche = marche.marche * PRIX_PANIERS.moyen;
    const caHebdoRestaurant = marche.restaurant * PRIX_PANIERS.grand;
    
    return {
      hebdo: {
        amap: caHebdoAMAP,
        marche: caHebdoMarche,
        restaurant: caHebdoRestaurant,
        total: caHebdoAMAP + caHebdoMarche + caHebdoRestaurant
      },
      saison: {
        amap: caHebdoAMAP * nbSemaines,
        marche: caHebdoMarche * nbSemaines,
        restaurant: caHebdoRestaurant * nbSemaines,
        total: (caHebdoAMAP + caHebdoMarche + caHebdoRestaurant) * nbSemaines
      },
      detail: { nbPetit, nbMoyen, nbGrand }
    };
  }, [marche]);

  // 2. CA PLANIFIÉ (Production réelle × Prix) - Basé sur les cultures planifiées
  const caPlanifie = useMemo(() => {
    const demandeSaison = {};
    for (let semaine = SAISON.debut; semaine <= SAISON.fin; semaine++) {
      const besoins = calculerBesoinHebdo(marche, semaine);
      Object.keys(besoins).forEach(legume => {
        if (!demandeSaison[legume]) demandeSaison[legume] = 0;
        demandeSaison[legume] += besoins[legume].total;
      });
    }

    const parCulture = culturesSelectionnees.map(culture => {
      const planchesSaison = (culture.series || []).filter(serie => {
        const d = serie.semaineDebut || serie.semaineRecolteDebut;
        const f = serie.semaineFin || serie.semaineRecolteFin;
        return d >= SAISON.debut - 4 && f <= SAISON.fin + 2;
      }).reduce((sum, s) => sum + (s.planchesUtilisees || 1), 0);
      
      const rendementBase = culture.rendement?.[`planche${longueurPlanche}m`] || culture.rendement?.planche30m || 100;
      const coefficient = niveauConfig.coefficient || 0.7;
      const productionSaison = planchesSaison * rendementBase * coefficient;
      
      const prixUnitaire = culture.prix?.unitaire || prixContextuels.moyen[culture.id] || 3;
      const demandeLegume = demandeSaison[culture.id] || 0;
      const productionVendable = Math.min(productionSaison, demandeLegume);
      const surplus = Math.max(0, productionSaison - demandeLegume);
      const caSaison = productionVendable * prixUnitaire;

      return {
        id: culture.id,
        nom: culture.nom,
        icone: culture.icone,
        planchesSaison,
        productionSaison,
        productionVendable,
        demandeLegume,
        surplus,
        caSaison,
        prixUnitaire,
        rendementBase,
        coefficient
      };
    });

    const total = parCulture.reduce((sum, c) => sum + c.caSaison, 0);
    const surplusTotalKg = parCulture.reduce((sum, c) => sum + c.surplus, 0);

    return { parCulture, total, surplusTotalKg };
  }, [culturesSelectionnees, marche, niveauConfig, longueurPlanche]);

  // 3. TOTAUX FINANCIERS
  const totaux = useMemo(() => {
    const surface = jardins.reduce((sum, j) => sum + (j.nombrePlanches * j.longueurPlanche * 0.8), 0);
    const planches = jardins.reduce((sum, j) => sum + j.nombrePlanches, 0);
    const intrants = calculerIntrants(surface);
    const heures = surface * 1.23;
    
    return {
      surface,
      planches,
      ca: caPlanifie.total,
      intrantsVariables: intrants.total || surface * 1.23,
      intrantsFixes: surface * 2.87,
      mainOeuvre: heures * 28,
      heures
    };
  }, [jardins, caPlanifie]);

  // Salaires
  const coutSalairesTotal = nombreSalaries * salaireAnnuel;
  const chargesSociales = Math.round(coutSalairesTotal * 0.45);
  const coutTotalSalaires = coutSalairesTotal + chargesSociales;
  
  // Marges
  const margeOperationnelle = totaux.ca - totaux.intrantsVariables - totaux.mainOeuvre - coutTotalSalaires;
  const margeComplete = margeOperationnelle - totaux.intrantsFixes;
  const isRentableOperationnel = margeOperationnelle >= 0;
  const isRentableComplet = margeComplete >= 0;

  // ETP
  const heuresAnnuelles = 1820;
  const etp = totaux.heures / heuresAnnuelles;

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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Résultats Financiers</h1>
              <p className="text-xs md:text-sm text-gray-500">Analyse de rentabilité V21</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={ouvrirTout} className="px-3 py-2 text-xs md:text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Tout ouvrir
            </button>
            <button onClick={fermerTout} className="px-3 py-2 text-xs md:text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Tout fermer
            </button>
          </div>
        </div>
        
        {/* KPIs rapides - 📱 Responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
          <div className="bg-green-50 p-2 md:p-3 rounded-lg border border-green-200 text-center">
            <p className="text-xs text-gray-600">CA Planifié</p>
            <p className="text-lg md:text-xl font-bold text-green-600">{totaux.ca.toLocaleString()} €</p>
          </div>
          <div className="bg-blue-50 p-2 md:p-3 rounded-lg border border-blue-200 text-center">
            <p className="text-xs text-gray-600">CA Commercial</p>
            <p className="text-lg md:text-xl font-bold text-blue-600">{caCommercial.saison.total.toLocaleString()} €</p>
          </div>
          <div className={`p-2 md:p-3 rounded-lg border text-center ${isRentableOperationnel ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-xs text-gray-600">Marge Opérat.</p>
            <p className={`text-lg md:text-xl font-bold ${isRentableOperationnel ? 'text-emerald-600' : 'text-red-600'}`}>
              {margeOperationnelle.toLocaleString()} €
            </p>
          </div>
          <div className={`p-2 md:p-3 rounded-lg border text-center ${isRentableComplet ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-xs text-gray-600">Marge Complète</p>
            <p className={`text-lg md:text-xl font-bold ${isRentableComplet ? 'text-emerald-600' : 'text-red-600'}`}>
              {margeComplete.toLocaleString()} €
            </p>
          </div>
        </div>
      </div>

      {/* 1. Récapitulatif des 3 CA */}
      <Section id="recap" title="Les 3 Chiffres d'Affaires" icon="💰" defaultOpen={true} color="green">
        <div className="space-y-4">
          {/* CA Commercial */}
          <div className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h4 className="font-bold text-blue-900 flex items-center">
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                CA Commercial (Demande clients)
              </h4>
              <span className="text-xl md:text-2xl font-bold text-blue-600">{caCommercial.saison.total.toLocaleString()} €</span>
            </div>
            <p className="text-xs md:text-sm text-blue-700 mb-2">
              Ce que les clients paient pour les paniers et ventes sur 21 semaines.
            </p>
            {/* 📱 Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs md:text-sm">
              <div className="bg-white p-2 rounded">AMAP: {caCommercial.saison.amap.toLocaleString()} €</div>
              <div className="bg-white p-2 rounded">Marché: {caCommercial.saison.marche.toLocaleString()} €</div>
              <div className="bg-white p-2 rounded">Resto: {caCommercial.saison.restaurant.toLocaleString()} €</div>
            </div>
          </div>

          {/* CA Planifié */}
          <div className="p-3 md:p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h4 className="font-bold text-green-900 flex items-center">
                <Leaf className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                CA Planifié (Production réelle)
              </h4>
              <span className="text-xl md:text-2xl font-bold text-green-600">{caPlanifie.total.toLocaleString()} €</span>
            </div>
            <p className="text-xs md:text-sm text-green-700 mb-2">
              Ce que vos cultures planifiées peuvent réellement générer (plafonné à la demande).
            </p>
            
            {/* 🆕 V21 : Liste des légumes avec CA - 📱 Responsive */}
            {caPlanifie.parCulture.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-green-800 mb-2">Détail par culture :</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {caPlanifie.parCulture
                    .filter(c => c.caSaison > 0)
                    .sort((a, b) => b.caSaison - a.caSaison)
                    .slice(0, 8)
                    .map(culture => (
                      <div key={culture.id} className="flex items-center justify-between bg-white p-2 rounded text-xs md:text-sm">
                        <span className="flex items-center">
                          <span className="mr-1">{culture.icone}</span>
                          <span className="truncate max-w-[100px] sm:max-w-none">{culture.nom}</span>
                        </span>
                        <span className="font-bold text-green-600 ml-2">{culture.caSaison.toLocaleString()} €</span>
                      </div>
                    ))}
                </div>
                {caPlanifie.parCulture.filter(c => c.caSaison > 0).length > 8 && (
                  <p className="text-xs text-gray-500 mt-2">
                    ... et {caPlanifie.parCulture.filter(c => c.caSaison > 0).length - 8} autres cultures
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Surplus */}
          {caPlanifie.surplusTotalKg > 0 && (
            <div className="p-3 md:p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h4 className="font-bold text-orange-900 flex items-center">
                  <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Surplus (Production > Demande)
                </h4>
                <span className="text-lg md:text-xl font-bold text-orange-600">{caPlanifie.surplusTotalKg.toFixed(0)} kg</span>
              </div>
              <p className="text-xs md:text-sm text-orange-700">
                Production excédentaire non valorisée dans le CA planifié.
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* 4. Calcul de Rentabilité */}
      <Section id="rentabilite" title="Calcul de Rentabilité" icon="🧮" color="indigo" defaultOpen={true}>
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setNiveauRentabilite('operationnelle')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              niveauRentabilite === 'operationnelle' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-1" />
            Opérationnelle
          </button>
          <button
            onClick={() => setNiveauRentabilite('complete')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              niveauRentabilite === 'complete' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-1" />
            Complète
          </button>
        </div>
        
        <div className="space-y-2 text-sm md:text-base">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">CA Planifié (Saison)</span>
            <span className="font-bold text-green-600">{totaux.ca.toLocaleString()} €</span>
          </div>
          <div className="flex justify-between"><span>- Intrants variables:</span><span className="text-orange-600">-{totaux.intrantsVariables.toLocaleString()} €</span></div>
          {niveauRentabilite === 'complete' && (
            <div className="flex justify-between"><span>- Intrants fixes (amort.):</span><span className="text-red-600">-{totaux.intrantsFixes.toLocaleString()} €</span></div>
          )}
          <div className="flex justify-between"><span>- Main d'œuvre:</span><span className="text-orange-600">-{totaux.mainOeuvre.toLocaleString()} €</span></div>
          <div className="flex justify-between"><span>- Salaires + charges:</span><span className="text-orange-600">-{coutTotalSalaires.toLocaleString()} €</span></div>
          <div className="flex justify-between pt-2 border-t-2">
            <span className="font-bold">Marge:</span>
            <span className={`font-bold text-lg md:text-xl ${(niveauRentabilite === 'operationnelle' ? margeOperationnelle : margeComplete) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(niveauRentabilite === 'operationnelle' ? margeOperationnelle : margeComplete).toLocaleString()} €
            </span>
          </div>
        </div>
      </Section>

      {/* 5. Comparaison des Deux Niveaux - 📱 Responsive table */}
      <Section id="comparaison" title="Comparaison des Deux Niveaux" icon="📊" color="gray">
        <div className="overflow-x-auto -mx-3 md:mx-0">
          <table className="w-full text-sm min-w-[300px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 md:px-3 py-2 text-left">Niveau</th>
                <th className="px-2 md:px-3 py-2 text-right">Marge</th>
                <th className="px-2 md:px-3 py-2 text-center">Rentable?</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-2 md:px-3 py-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-1 md:mr-2 text-blue-600 flex-shrink-0" />
                  <span className="truncate">Opérationnelle</span>
                </td>
                <td className="px-2 md:px-3 py-2 text-right font-bold">{margeOperationnelle.toLocaleString()} €</td>
                <td className="px-2 md:px-3 py-2 text-center text-xl">{isRentableOperationnel ? '✅' : '⛔'}</td>
              </tr>
              <tr className="border-t">
                <td className="px-2 md:px-3 py-2 flex items-center">
                  <Building2 className="w-4 h-4 mr-1 md:mr-2 text-purple-600 flex-shrink-0" />
                  <span className="truncate">Complète</span>
                </td>
                <td className="px-2 md:px-3 py-2 text-right font-bold">{margeComplete.toLocaleString()} €</td>
                <td className="px-2 md:px-3 py-2 text-center text-xl">{isRentableComplet ? '✅' : '⛔'}</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="px-2 md:px-3 py-2 font-bold">Différence</td>
                <td className="px-2 md:px-3 py-2 text-right font-bold text-red-600">{(margeOperationnelle - margeComplete).toLocaleString()} €</td>
                <td className="px-2 md:px-3 py-2 text-center text-xs">= Amortissements</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* 6. Configuration des Salaires - 📱 Responsive grid */}
      <Section id="salaires" title="Configuration des Salaires" icon="👥" color="blue">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de salariés</label>
            <input 
              type="number" 
              min="0" 
              max="10" 
              value={nombreSalaries} 
              onChange={(e) => setNombreSalaries(parseInt(e.target.value) || 0)} 
              className="w-full px-3 py-2 border-2 rounded min-h-[44px]" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Salaire annuel brut (€)</label>
            <input 
              type="number" 
              min="0" 
              step="1000" 
              value={salaireAnnuel} 
              onChange={(e) => setSalaireAnnuel(parseInt(e.target.value) || 0)} 
              className="w-full px-3 py-2 border-2 rounded min-h-[44px]" 
            />
          </div>
        </div>
        {/* 📱 Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
          <div className="bg-blue-50 p-2 md:p-3 rounded border">
            <p className="text-xs">Salaires bruts</p>
            <p className="text-base md:text-lg font-bold text-blue-600">{coutSalairesTotal.toLocaleString()} €</p>
          </div>
          <div className="bg-orange-50 p-2 md:p-3 rounded border">
            <p className="text-xs">Charges (45%)</p>
            <p className="text-base md:text-lg font-bold text-orange-600">{chargesSociales.toLocaleString()} €</p>
          </div>
          <div className="bg-purple-50 p-2 md:p-3 rounded border">
            <p className="text-xs">Coût total</p>
            <p className="text-base md:text-lg font-bold text-purple-600">{coutTotalSalaires.toLocaleString()} €</p>
          </div>
        </div>
      </Section>

      {/* 7. Main d'œuvre - 📱 Responsive table */}
      <Section id="mo" title="Main d'œuvre (valorisée à 28 €/h)" icon="👷" badge={`${totaux.mainOeuvre.toLocaleString()} €`} color="blue">
        <div className="overflow-x-auto -mx-3 md:mx-0">
          <table className="w-full text-sm border-collapse min-w-[320px]">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-2 md:px-3 py-2 border text-left">Tâche</th>
                <th className="px-2 md:px-3 py-2 border text-right">%</th>
                <th className="px-2 md:px-3 py-2 border text-right">Heures</th>
                <th className="px-2 md:px-3 py-2 border text-right">Coût</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Récolte</td>
                <td className="px-2 md:px-3 py-2 border text-right">60%</td>
                <td className="px-2 md:px-3 py-2 border text-right">{(totaux.heures * 0.60).toFixed(0)} h</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">{(totaux.heures * 0.60 * 28).toLocaleString()} €</td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Entretien</td>
                <td className="px-2 md:px-3 py-2 border text-right">30%</td>
                <td className="px-2 md:px-3 py-2 border text-right">{(totaux.heures * 0.30).toFixed(0)} h</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">{(totaux.heures * 0.30 * 28).toLocaleString()} €</td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Implantation</td>
                <td className="px-2 md:px-3 py-2 border text-right">10%</td>
                <td className="px-2 md:px-3 py-2 border text-right">{(totaux.heures * 0.10).toFixed(0)} h</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">{(totaux.heures * 0.10 * 28).toLocaleString()} €</td>
              </tr>
            </tbody>
            <tfoot className="bg-blue-200 font-bold">
              <tr>
                <td colSpan="2" className="px-2 md:px-3 py-2 border">TOTAL</td>
                <td className="px-2 md:px-3 py-2 border text-right">{totaux.heures.toFixed(0)} h</td>
                <td className="px-2 md:px-3 py-2 border text-right">{totaux.mainOeuvre.toLocaleString()} €</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>

      {/* 8. Temps de Travail et ETP - 📱 Responsive grid */}
      <Section id="temps" title="Temps de Travail et ETP" icon="⏰" color="purple">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
          <div className="bg-purple-50 p-2 md:p-3 rounded border">
            <p className="text-xs md:text-sm">Heures Totales</p>
            <p className="text-xl md:text-2xl font-bold text-purple-600">{totaux.heures.toFixed(0)} h</p>
            <p className="text-xs text-gray-500">{(totaux.heures / 52).toFixed(1)} h/sem</p>
          </div>
          <div className="bg-blue-50 p-2 md:p-3 rounded border">
            <p className="text-xs md:text-sm">ETP</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600">{etp.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Base 1820h/an</p>
          </div>
          <div className="bg-green-50 p-2 md:p-3 rounded border">
            <p className="text-xs md:text-sm">Taux temps</p>
            <p className="text-xl md:text-2xl font-bold text-green-600">{((totaux.heures / heuresAnnuelles) * 100).toFixed(0)} %</p>
            <p className="text-xs text-gray-500">d'un temps plein</p>
          </div>
        </div>
      </Section>

      {/* 9. Détail Intrants par Poste - 📱 Responsive table */}
      <Section id="intrants" title="Détail Intrants par Poste" icon="🌱" badge={`${totaux.intrantsVariables.toLocaleString()} €`} color="orange">
        <div className="overflow-x-auto -mx-3 md:mx-0">
          <table className="w-full text-sm border-collapse min-w-[300px]">
            <thead className="bg-orange-100">
              <tr>
                <th className="px-2 md:px-3 py-2 border text-left">Poste</th>
                <th className="px-2 md:px-3 py-2 border text-right">€/m²</th>
                <th className="px-2 md:px-3 py-2 border text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Fertilisation (compost, engrais)</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.65</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">{(totaux.surface * 0.65).toLocaleString()} €</td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Semences et plants</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.42</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">{(totaux.surface * 0.42).toLocaleString()} €</td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Protection (bio, filets)</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.16</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">{(totaux.surface * 0.16).toLocaleString()} €</td>
              </tr>
            </tbody>
            <tfoot className="bg-orange-200 font-bold">
              <tr>
                <td colSpan="2" className="px-2 md:px-3 py-2 border">TOTAL VARIABLES</td>
                <td className="px-2 md:px-3 py-2 border text-right">{totaux.intrantsVariables.toLocaleString()} €</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>

      {/* 10. Intrants Fixes - Amortissements - 📱 Responsive table */}
      <Section id="fixes" title="Intrants Fixes - Amortissements (€/m²)" icon="🗃️" badge={`${totaux.intrantsFixes.toLocaleString()} €`} color="red">
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
                <td className="px-2 md:px-3 py-2 border">Matériel (outils, machines)</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.55</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">{(totaux.surface * 0.55).toLocaleString()} €</td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Serres et bâches</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.37</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">{(totaux.surface * 0.37).toLocaleString()} €</td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Irrigation</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.15</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">{(totaux.surface * 0.15).toLocaleString()} €</td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Véhicule livraison</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.70</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">{(totaux.surface * 0.70).toLocaleString()} €</td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Matériel vente</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.40</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">{(totaux.surface * 0.40).toLocaleString()} €</td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Énergie/carburants</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.20</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">{(totaux.surface * 0.20).toLocaleString()} €</td>
              </tr>
              <tr>
                <td className="px-2 md:px-3 py-2 border">Frais administratifs</td>
                <td className="px-2 md:px-3 py-2 border text-right">0.50</td>
                <td className="px-2 md:px-3 py-2 border text-right font-bold">{(totaux.surface * 0.50).toLocaleString()} €</td>
              </tr>
            </tbody>
            <tfoot className="bg-red-200 font-bold">
              <tr>
                <td colSpan="2" className="px-2 md:px-3 py-2 border">TOTAL FIXES</td>
                <td className="px-2 md:px-3 py-2 border text-right">{totaux.intrantsFixes.toLocaleString()} €</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>
    </div>
  );
};

export default Resultats;
