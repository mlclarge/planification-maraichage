// ExportExcel_v21.jsx - EXPORT COMPLET DE TOUS LES ONGLETS
// 🆕 V21 : Marché, Jardins, Simulateur, Cultures, Planification, Tâches, Résultats
// 🎯 15+ feuilles Excel avec toutes les données de l'application

import React, { useState, useMemo } from 'react';
import { Download, FileSpreadsheet, CheckCircle, AlertCircle, ChevronDown, Loader } from 'lucide-react';
import { calculerIntrants, calculerBesoinHebdo } from '../data/compositionsPaniers';
import { SAISON, NIVEAUX_MATURITE } from '../utils/constantes';

// Prix contextuels par niveau de marché (€/kg ou €/botte)
const prixContextuels = {
  bas: { tomate: 2.90, courgette: 2.00, concombre: 3.75, aubergine: 3.50, haricot: 10.00, mesclun: 14.00, verdurette: 12.00, carotte: 1.80, betterave: 2.50, radis: 6.00, basilic: 30.00 },
  moyen: { tomate: 3.80, courgette: 3.00, concombre: 5.00, aubergine: 4.50, haricot: 13.00, mesclun: 18.00, verdurette: 16.00, carotte: 2.50, betterave: 3.50, radis: 8.33, basilic: 40.00 },
  haut: { tomate: 4.80, courgette: 4.50, concombre: 6.25, aubergine: 6.00, haricot: 16.00, mesclun: 24.00, verdurette: 22.00, carotte: 3.20, betterave: 4.50, radis: 10.67, basilic: 50.00 }
};

// Prix des paniers AMAP
const PRIX_PANIERS = { petit: 15, moyen: 25, grand: 35 };

const ExportExcel = ({ marche, jardins, culturesSelectionnees, niveauMaturite = 'debutant', fournitures = null }) => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [accordeons, setAccordeons] = useState({ contenu: true });
  
  const toggle = (id) => setAccordeons(prev => ({ ...prev, [id]: !prev[id] }));

  // Fonction pour tronquer les textes longs (limite Excel = 32767)
  const truncate = (str, max = 32000) => {
    if (!str) return '';
    const s = String(str);
    return s.length > max ? s.substring(0, max) + '...[TRONQUÉ]' : s;
  };

  // Config niveau maturité
  const niveauConfig = NIVEAUX_MATURITE[niveauMaturite] || NIVEAUX_MATURITE.debutant;

  // ═══════════════════════════════════════════════════════════════════════════
  // CALCULS PRÉPARATOIRES
  // ═══════════════════════════════════════════════════════════════════════════

  const calculs = useMemo(() => {
    const surfaceTotale = jardins.reduce((sum, j) => sum + (j.nombrePlanches * j.longueurPlanche * 0.8), 0);
    const totalPlanchesDisponibles = jardins.reduce((sum, j) => sum + j.nombrePlanches, 0);
    const totalPlanchesUtilisees = culturesSelectionnees.reduce((sum, c) => sum + (c.totalPlanches || 0), 0);
    const totalSeries = culturesSelectionnees.reduce((sum, c) => sum + (c.series?.length || 0), 0);

    // CA Commercial (paniers)
    const caHebdoAMAP = 
      Math.round(marche.amap * marche.tauxPetit) * PRIX_PANIERS.petit +
      Math.round(marche.amap * marche.tauxMoyen) * PRIX_PANIERS.moyen +
      Math.round(marche.amap * marche.tauxGrand) * PRIX_PANIERS.grand;
    const caHebdoMarche = marche.marche * PRIX_PANIERS.moyen;
    const caHebdoRestaurant = marche.restaurant * PRIX_PANIERS.grand;
    const caCommercialSaison = (caHebdoAMAP + caHebdoMarche + caHebdoRestaurant) * (SAISON.fin - SAISON.debut + 1);

    // Demande par légume sur la saison
    const demandeSaison = {};
    for (let semaine = SAISON.debut; semaine <= SAISON.fin; semaine++) {
      const besoins = calculerBesoinHebdo(marche, semaine);
      Object.keys(besoins).forEach(legume => {
        if (!demandeSaison[legume]) demandeSaison[legume] = 0;
        demandeSaison[legume] += besoins[legume].total;
      });
    }

    // Récapitulatif par culture avec CA plafonné
    const recapCultures = culturesSelectionnees.map(culture => {
      const planchesSaison = (culture.series || []).filter(serie => {
        const d = serie.semaineDebut || serie.semaineRecolteDebut || serie.dates?.recolteDebut;
        const f = serie.semaineFin || serie.semaineRecolteFin || serie.dates?.recolteFin;
        return d >= SAISON.debut && f <= SAISON.fin + 4;
      }).reduce((sum, s) => sum + (s.planchesUtilisees || 1), 0);
      
      const rendementBase = culture.rendement?.planche30m || 100;
      const coefficient = niveauConfig.coefficient || 0.7;
      const productionSaison = planchesSaison * rendementBase * coefficient;
      
      const prixUnitaire = culture.prix?.unitaire || prixContextuels.moyen[culture.id] || 3;
      const demandeLegume = demandeSaison[culture.id] || 0;
      const productionVendable = Math.min(productionSaison, demandeLegume);
      const surplus = Math.max(0, productionSaison - demandeLegume);
      const caSaison = productionVendable * prixUnitaire;
      const caTheorique = productionSaison * prixUnitaire;

      return {
        id: culture.id,
        nom: culture.nom,
        categorie: culture.categorie,
        icone: culture.icone,
        planchesSaison,
        productionSaison,
        productionVendable,
        demandeLegume,
        surplus,
        caSaison,
        caTheorique,
        prixUnitaire,
        rendementBase,
        coefficient
      };
    });

    const caPlanifieSaison = recapCultures.reduce((sum, c) => sum + c.caSaison, 0);
    const caTheoriqueSaison = recapCultures.reduce((sum, c) => sum + c.caTheorique, 0);
    const surplusTotalKg = recapCultures.reduce((sum, c) => sum + c.surplus, 0);
    const surplusTotalEuros = caTheoriqueSaison - caPlanifieSaison;

    // Intrants
    const intrants = calculerIntrants(surfaceTotale);
    const heures = surfaceTotale * 1.23;

    return {
      surfaceTotale,
      totalPlanchesDisponibles,
      totalPlanchesUtilisees,
      totalSeries,
      caHebdoAMAP,
      caHebdoMarche,
      caHebdoRestaurant,
      caCommercialSaison,
      caPlanifieSaison,
      caTheoriqueSaison,
      surplusTotalKg,
      surplusTotalEuros,
      recapCultures,
      demandeSaison,
      intrants,
      heures
    };
  }, [marche, jardins, culturesSelectionnees, niveauConfig]);

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORT EXCEL
  // ═══════════════════════════════════════════════════════════════════════════

  const exportToExcel = async () => {
    setExporting(true);
    setError(null);
    setProgress(0);

    try {
      const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
      const wb = XLSX.utils.book_new();

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 1 : SYNTHÈSE GLOBALE
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(5);
      const syntheseData = [
        ['SYNTHÈSE PLANIFICATION MARAÎCHÈRE BIO-INTENSIVE'],
        ['Export généré le', new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR')],
        ['Niveau de maturité', `${niveauConfig.label} (×${niveauConfig.coefficient})`],
        [],
        ['═══ CAPACITÉ ═══'],
        ['Jardins', jardins.length],
        ['Planches disponibles', calculs.totalPlanchesDisponibles],
        ['Planches utilisées', calculs.totalPlanchesUtilisees],
        ['Taux utilisation', `${calculs.totalPlanchesDisponibles > 0 ? ((calculs.totalPlanchesUtilisees / calculs.totalPlanchesDisponibles) * 100).toFixed(0) : 0}%`],
        ['Surface cultivée (m²)', calculs.surfaceTotale.toFixed(0)],
        [],
        ['═══ CULTURES ═══'],
        ['Cultures sélectionnées', culturesSelectionnees.length],
        ['Séries totales', calculs.totalSeries],
        [],
        ['═══ CHIFFRE D\'AFFAIRES ═══'],
        ['CA Commercial (demande clients)', `${calculs.caCommercialSaison.toLocaleString()} €`],
        ['CA Planifié (production vendable)', `${calculs.caPlanifieSaison.toLocaleString()} €`],
        ['CA Théorique (si tout vendu)', `${calculs.caTheoriqueSaison.toLocaleString()} €`],
        ['Surplus invendable', `${calculs.surplusTotalEuros.toLocaleString()} € (${calculs.surplusTotalKg.toFixed(0)} kg)`],
        ['Taux couverture', `${calculs.caCommercialSaison > 0 ? ((calculs.caPlanifieSaison / calculs.caCommercialSaison) * 100).toFixed(0) : 0}%`],
        [],
        ['═══ INDICATEURS ═══'],
        ['CA/m²', `${calculs.surfaceTotale > 0 ? (calculs.caPlanifieSaison / calculs.surfaceTotale).toFixed(2) : 0} €`],
        ['CA/planche', `${calculs.totalPlanchesUtilisees > 0 ? (calculs.caPlanifieSaison / calculs.totalPlanchesUtilisees).toFixed(0) : 0} €`],
        ['Heures travail estimées', calculs.heures.toFixed(0)],
        ['ETP (base 1820h)', (calculs.heures / 1820).toFixed(2)]
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(syntheseData), '📊 Synthèse');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 2 : ONGLET MARCHÉ
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(10);
      const marcheData = [
        ['CONFIGURATION MARCHÉ'],
        [],
        ['═══ PANIERS AMAP ═══'],
        ['Nombre total paniers', marche.amap],
        ['Répartition petits (33%)', Math.round(marche.amap * marche.tauxPetit), 'paniers', `× ${PRIX_PANIERS.petit}€ = ${Math.round(marche.amap * marche.tauxPetit) * PRIX_PANIERS.petit}€/sem`],
        ['Répartition moyens (33%)', Math.round(marche.amap * marche.tauxMoyen), 'paniers', `× ${PRIX_PANIERS.moyen}€ = ${Math.round(marche.amap * marche.tauxMoyen) * PRIX_PANIERS.moyen}€/sem`],
        ['Répartition grands (34%)', Math.round(marche.amap * marche.tauxGrand), 'paniers', `× ${PRIX_PANIERS.grand}€ = ${Math.round(marche.amap * marche.tauxGrand) * PRIX_PANIERS.grand}€/sem`],
        ['CA AMAP hebdo', `${calculs.caHebdoAMAP} €`],
        [],
        ['═══ VENTES MARCHÉ ═══'],
        ['Unités vendues/semaine', marche.marche],
        ['Prix moyen unitaire', `${PRIX_PANIERS.moyen} €`],
        ['CA Marché hebdo', `${calculs.caHebdoMarche} €`],
        [],
        ['═══ RESTAURANTS ═══'],
        ['Unités vendues/semaine', marche.restaurant],
        ['Prix moyen unitaire', `${PRIX_PANIERS.grand} €`],
        ['CA Restaurant hebdo', `${calculs.caHebdoRestaurant} €`],
        [],
        ['═══ TOTAUX ═══'],
        ['CA Hebdomadaire Total', `${calculs.caHebdoAMAP + calculs.caHebdoMarche + calculs.caHebdoRestaurant} €`],
        ['Durée saison', `${SAISON.fin - SAISON.debut + 1} semaines (S${SAISON.debut} à S${SAISON.fin})`],
        ['CA Saison Commercial', `${calculs.caCommercialSaison.toLocaleString()} €`]
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(marcheData), '🛒 Marché');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 3 : ONGLET JARDINS
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(15);
      const jardinsData = [
        ['CONFIGURATION JARDINS'],
        [],
        ['Nom', 'Planches', 'Longueur (m)', 'Largeur (m)', 'Surface (m²)', 'Mètres linéaires', 'CA Junior (35€/m²)', 'CA Expert (55€/m²)', 'Couleur']
      ];
      jardins.forEach(j => {
        const surf = j.nombrePlanches * j.longueurPlanche * 0.8;
        const ml = j.nombrePlanches * j.longueurPlanche;
        jardinsData.push([
          j.nom, 
          j.nombrePlanches, 
          j.longueurPlanche, 
          0.8, 
          surf.toFixed(0), 
          ml,
          (surf * 35).toFixed(0), 
          (surf * 55).toFixed(0),
          j.couleur
        ]);
      });
      jardinsData.push([]);
      jardinsData.push([
        'TOTAL', 
        calculs.totalPlanchesDisponibles, 
        '', 
        '', 
        calculs.surfaceTotale.toFixed(0), 
        jardins.reduce((s, j) => s + j.nombrePlanches * j.longueurPlanche, 0),
        (calculs.surfaceTotale * 35).toFixed(0), 
        (calculs.surfaceTotale * 55).toFixed(0),
        ''
      ]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(jardinsData), '🏡 Jardins');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 4 : ONGLET SIMULATEUR - SCÉNARIOS
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(20);
      const scenariosData = [
        ['SIMULATEUR - SCÉNARIOS'],
        [],
        ['Niveau de maturité actuel', niveauConfig.label, `Coefficient: ×${niveauConfig.coefficient}`],
        [],
        ['═══ SCÉNARIOS VIABLES ═══'],
        ['Scénario', 'Capacité utilisée', 'AMAP', 'Marché', 'Restaurant', 'Planches', 'CA Estimé'],
        ['🛡️ Prudent (80%)', '80%', Math.round(marche.amap * 0.8), Math.round(marche.marche * 0.8), Math.round(marche.restaurant * 0.8), Math.floor(calculs.totalPlanchesDisponibles * 0.8), `${Math.round(calculs.caCommercialSaison * 0.8).toLocaleString()} €`],
        ['⚖️ Équilibré (90%)', '90%', Math.round(marche.amap * 0.9), Math.round(marche.marche * 0.9), Math.round(marche.restaurant * 0.9), Math.floor(calculs.totalPlanchesDisponibles * 0.9), `${Math.round(calculs.caCommercialSaison * 0.9).toLocaleString()} €`],
        ['🚀 Ambitieux (100%)', '100%', marche.amap, marche.marche, marche.restaurant, calculs.totalPlanchesDisponibles, `${calculs.caCommercialSaison.toLocaleString()} €`],
        ['📊 Configuration actuelle', `${calculs.totalPlanchesDisponibles > 0 ? Math.round((calculs.totalPlanchesUtilisees / calculs.totalPlanchesDisponibles) * 100) : 0}%`, marche.amap, marche.marche, marche.restaurant, calculs.totalPlanchesUtilisees, `${calculs.caPlanifieSaison.toLocaleString()} €`],
        [],
        ['═══ NIVEAUX DE MATURITÉ ═══'],
        ['Niveau', 'Coefficient', 'Description'],
        ['🌱 Débutant', '×0.70', '1ère année - Apprentissage'],
        ['🌿 Junior', '×0.85', '2-3 ans - Maîtrise en cours'],
        ['🌳 Expert', '×1.00', '4+ ans - Pleine maîtrise']
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(scenariosData), '⚖️ Simulateur');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 5 : FOURNITURES & INTRANTS
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(25);
      const fournituresData = [
        ['FOURNITURES & INTRANTS'],
        [],
        ['═══ RÉCAPITULATIF PAR CATÉGORIE ═══'],
        ['Catégorie', 'Montant (€)'],
        ['🌱 Semences & Plants', fournitures?.totaux?.semences?.toFixed(0) || 'N/A'],
        ['🧪 Fertilisation', fournitures?.totaux?.fertilisation?.toFixed(0) || 'N/A'],
        ['🛡️ Protection & Couverture', fournitures?.totaux?.protection?.toFixed(0) || 'N/A'],
        ['🐛 Bio-traitement', fournitures?.totaux?.biotraitement?.toFixed(0) || 'N/A'],
        ['TOTAL FOURNITURES', fournitures?.totaux?.total?.toFixed(0) || 'N/A'],
        [],
        ['═══ DÉTAIL PAR CULTURE ═══'],
        ['Culture', 'Planches', 'Semences (€)', 'Fertilisation (€)', 'Protection (€)', 'Bio-trait. (€)', 'Total (€)']
      ];
      if (fournitures?.parCulture) {
        Object.entries(fournitures.parCulture).forEach(([id, data]) => {
          fournituresData.push([
            data.nom,
            data.planches,
            data.semences?.ajuste?.toFixed(1) || 0,
            data.fertilisation?.ajuste?.toFixed(1) || 0,
            data.protection?.ajuste?.toFixed(1) || 0,
            data.biotraitement?.ajuste?.toFixed(1) || 0,
            data.total?.toFixed(0) || 0
          ]);
        });
      }
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(fournituresData), '📦 Fournitures');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 6 : ONGLET CULTURES - LISTE
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(30);
      const culturesData = [
        ['CULTURES SÉLECTIONNÉES'],
        [],
        ['Légume', 'Catégorie', 'Type cycle', 'Jardin(s)', 'Méthode', 'Planches sim.', 'Séries', 'Total planches', 'Délai intercal.', 'Prix (€/unité)', 'Rendement (kg/pl 30m)']
      ];
      culturesSelectionnees.forEach(c => {
        const jardin = jardins.find(j => j.id === c.jardinId);
        const typeCycle = c.planComplet?.calcul?.typeCycle || 'N/A';
        culturesData.push([
          c.nom, 
          c.categorie || 'N/A', 
          typeCycle,
          jardin?.nom || (c.repartition ? 'Multi-jardins' : 'N/A'), 
          c.methode || 'Pépinière',
          c.planchesRecommandees || c.planComplet?.calcul?.planchesSimultanees || 0,
          c.series?.length || 0, 
          c.totalPlanches || 0, 
          c.delaiIntercalaire || 1,
          c.prix?.unitaire || 0, 
          c.rendement?.planche30m || 0
        ]);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(culturesData), '🌱 Cultures');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 7 : CULTURES - CA & ÉCONOMIE
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(35);
      const caCulturesData = [
        ['DÉTAILS ÉCONOMIQUES PAR CULTURE'],
        [],
        ['Légume', 'Planches', 'Production (kg)', 'Demande (kg)', 'Vendable (kg)', 'Surplus (kg)', 'Prix (€/kg)', 'CA Planifié (€)', 'CA Théorique (€)', 'Perte surplus (€)', '% du CA total']
      ];
      calculs.recapCultures.sort((a, b) => b.caSaison - a.caSaison).forEach(c => {
        caCulturesData.push([
          c.nom,
          c.planchesSaison,
          c.productionSaison.toFixed(1),
          c.demandeLegume.toFixed(1),
          c.productionVendable.toFixed(1),
          c.surplus.toFixed(1),
          c.prixUnitaire.toFixed(2),
          c.caSaison.toFixed(0),
          c.caTheorique.toFixed(0),
          (c.caTheorique - c.caSaison).toFixed(0),
          calculs.caPlanifieSaison > 0 ? ((c.caSaison / calculs.caPlanifieSaison) * 100).toFixed(1) + '%' : '0%'
        ]);
      });
      caCulturesData.push([]);
      caCulturesData.push([
        'TOTAL',
        calculs.recapCultures.reduce((s, c) => s + c.planchesSaison, 0),
        calculs.recapCultures.reduce((s, c) => s + c.productionSaison, 0).toFixed(1),
        '',
        calculs.recapCultures.reduce((s, c) => s + c.productionVendable, 0).toFixed(1),
        calculs.surplusTotalKg.toFixed(1),
        '',
        calculs.caPlanifieSaison.toFixed(0),
        calculs.caTheoriqueSaison.toFixed(0),
        calculs.surplusTotalEuros.toFixed(0),
        '100%'
      ]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(caCulturesData), '💰 CA Cultures');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 8 : ONGLET PLANIFICATION - PLANNING DÉTAILLÉ
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(45);
      const planningData = [
        ['PLANNING DÉTAILLÉ PAR CULTURE'],
        []
      ];
      culturesSelectionnees.forEach(culture => {
        planningData.push([]);
        planningData.push([`══ ${culture.nom.toUpperCase()} ══`, '', '', '', '', '', '', '']);
        planningData.push(['Série', 'Planche', 'Nb Planches', 'Semis (S)', 'Plantation (S)', 'Récolte début (S)', 'Récolte fin (S)', 'Durée occupation (sem)']);
        if (culture.series?.length > 0) {
          culture.series.forEach((serie, idx) => {
            const semis = serie.semaineSemis || serie.dates?.semis || 'N/A';
            const plantation = serie.semainePlantation || serie.dates?.plantation || 'N/A';
            const recolteDebut = serie.semaineRecolteDebut || serie.dates?.recolteDebut || serie.semaineDebut || 'N/A';
            const recolteFin = serie.semaineRecolteFin || serie.dates?.recolteFin || serie.semaineFin || 'N/A';
            const duree = serie.dureeOccupation || serie.duree || 'N/A';
            
            planningData.push([
              `Série ${idx + 1}`, 
              serie.plancheId || `Pl.${idx + 1}`, 
              serie.planchesUtilisees || 1,
              semis,
              plantation,
              recolteDebut,
              recolteFin,
              duree
            ]);
          });
        } else {
          planningData.push(['Aucune série planifiée', '', '', '', '', '', '', '']);
        }
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(planningData), '📅 Planning');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 9 : CALENDRIER GANTT (Occupation par semaine)
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(55);
      const ganttHeader = ['Semaine', 'Date 2025'];
      culturesSelectionnees.forEach(c => ganttHeader.push(c.nom));
      const ganttData = [['CALENDRIER OCCUPATION (GANTT)'], [], ganttHeader];
      
      // Mapping semaines → dates approximatives
      const semaineToDate = (s) => {
        const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const m = Math.floor((s - 1) / 4.33);
        return mois[Math.min(11, Math.max(0, m))];
      };

      for (let semaine = 1; semaine <= 52; semaine++) {
        const row = [`S${semaine}`, semaineToDate(semaine)];
        culturesSelectionnees.forEach(culture => {
          let occupation = '';
          culture.series?.forEach((serie, idx) => {
            const debut = serie.semainePlantation || serie.semaineDebut || 0;
            const fin = (serie.semaineRecolteFin || serie.semaineFin || 0);
            if (semaine >= debut && semaine <= fin) {
              occupation = `Pl.${idx + 1}`;
            }
          });
          row.push(occupation);
        });
        ganttData.push(row);
      }
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ganttData), '📊 Gantt');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 10 : ONGLET TÂCHES - CALENDRIER DES INTERVENTIONS
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(65);
      const tachesData = [
        ['CALENDRIER DES TÂCHES'],
        [],
        ['Semaine', 'Culture', 'Type tâche', 'Détail', 'Planches concernées']
      ];
      
      culturesSelectionnees.forEach(culture => {
        culture.series?.forEach((serie, idx) => {
          const semis = serie.semaineSemis || serie.dates?.semis;
          const plantation = serie.semainePlantation || serie.dates?.plantation;
          const recolteDebut = serie.semaineRecolteDebut || serie.dates?.recolteDebut;
          const recolteFin = serie.semaineRecolteFin || serie.dates?.recolteFin;
          
          if (semis) {
            tachesData.push([`S${semis}`, culture.nom, '🌱 Semis', `Série ${idx + 1}`, serie.planchesUtilisees || 1]);
          }
          if (plantation) {
            tachesData.push([`S${plantation}`, culture.nom, '🪴 Plantation', `Série ${idx + 1}`, serie.planchesUtilisees || 1]);
          }
          if (recolteDebut) {
            tachesData.push([`S${recolteDebut}`, culture.nom, '🥬 Début récolte', `Série ${idx + 1}`, serie.planchesUtilisees || 1]);
          }
          if (recolteFin) {
            tachesData.push([`S${recolteFin}`, culture.nom, '✅ Fin récolte', `Série ${idx + 1}`, serie.planchesUtilisees || 1]);
          }
        });
      });
      
      // Trier par semaine
      const headerTaches = tachesData.slice(0, 3);
      const bodyTaches = tachesData.slice(3).sort((a, b) => {
        const sA = parseInt(a[0].replace('S', '')) || 0;
        const sB = parseInt(b[0].replace('S', '')) || 0;
        return sA - sB;
      });
      const tachesDataSorted = [...headerTaches, ...bodyTaches];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tachesDataSorted), '📋 Tâches');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 11 : BESOINS HEBDO PAR LÉGUME
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(70);
      const legumes = Object.keys(calculs.demandeSaison);
      const besoinsHeader = ['Semaine', ...legumes, 'Total (kg)'];
      const besoinsData = [['BESOINS HEBDOMADAIRES PAR LÉGUME (kg)'], [], besoinsHeader];
      
      for (let semaine = SAISON.debut; semaine <= SAISON.fin; semaine++) {
        const besoins = calculerBesoinHebdo(marche, semaine);
        const row = [`S${semaine}`];
        let totalSem = 0;
        legumes.forEach(leg => {
          const val = besoins[leg]?.total || 0;
          row.push(val.toFixed(1));
          totalSem += val;
        });
        row.push(totalSem.toFixed(1));
        besoinsData.push(row);
      }
      besoinsData.push([]);
      const totalRow = ['TOTAL SAISON'];
      let grandTotal = 0;
      legumes.forEach(leg => {
        totalRow.push(calculs.demandeSaison[leg]?.toFixed(1) || '0');
        grandTotal += calculs.demandeSaison[leg] || 0;
      });
      totalRow.push(grandTotal.toFixed(1));
      besoinsData.push(totalRow);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(besoinsData), '📦 Besoins Hebdo');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 12 : ONGLET RÉSULTATS - CA DÉTAILLÉ
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(75);
      const resultatsCAData = [
        ['RÉSULTATS - ANALYSE DES CA'],
        [],
        ['═══ COMPARAISON DES CA ═══'],
        ['Type de CA', 'Montant (€)', 'Description'],
        ['CA Commercial', calculs.caCommercialSaison.toLocaleString(), 'Ce que les clients vont payer (paniers × prix)'],
        ['CA Planifié', calculs.caPlanifieSaison.toLocaleString(), 'Ce que vos planches vont réellement produire (plafonné à la demande)'],
        ['CA Théorique', calculs.caTheoriqueSaison.toLocaleString(), 'Si vous vendiez toute la production'],
        ['Écart (surplus)', calculs.surplusTotalEuros.toLocaleString(), `${calculs.surplusTotalKg.toFixed(0)} kg de production invendable`],
        [],
        ['═══ TAUX DE COUVERTURE ═══'],
        ['Indicateur', 'Valeur'],
        ['Taux couverture demande', `${calculs.caCommercialSaison > 0 ? ((calculs.caPlanifieSaison / calculs.caCommercialSaison) * 100).toFixed(0) : 0}%`],
        ['Surplus en % production', `${calculs.caTheoriqueSaison > 0 ? ((calculs.surplusTotalEuros / calculs.caTheoriqueSaison) * 100).toFixed(0) : 0}%`],
        [],
        ['═══ DÉTAIL CA COMMERCIAL ═══'],
        ['Canal', 'Hebdo (€)', 'Saison (€)', '% du total'],
        ['AMAP', calculs.caHebdoAMAP, calculs.caHebdoAMAP * (SAISON.fin - SAISON.debut + 1), `${calculs.caCommercialSaison > 0 ? ((calculs.caHebdoAMAP * 21 / calculs.caCommercialSaison) * 100).toFixed(0) : 0}%`],
        ['Marché', calculs.caHebdoMarche, calculs.caHebdoMarche * (SAISON.fin - SAISON.debut + 1), `${calculs.caCommercialSaison > 0 ? ((calculs.caHebdoMarche * 21 / calculs.caCommercialSaison) * 100).toFixed(0) : 0}%`],
        ['Restaurant', calculs.caHebdoRestaurant, calculs.caHebdoRestaurant * (SAISON.fin - SAISON.debut + 1), `${calculs.caCommercialSaison > 0 ? ((calculs.caHebdoRestaurant * 21 / calculs.caCommercialSaison) * 100).toFixed(0) : 0}%`]
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resultatsCAData), '💵 Résultats CA');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 13 : RÉSULTATS - INTRANTS
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(80);
      const intrantsVarTotal = calculs.surfaceTotale * 1.23;
      const intrantsFixTotal = calculs.surfaceTotale * 2.87;
      const mainOeuvreTotal = calculs.heures * 28;
      
      const intrantsData = [
        ['RÉSULTATS - INTRANTS & CHARGES'],
        [],
        ['═══ INTRANTS VARIABLES ═══'],
        ['Poste', '€/m²', 'Total (€)'],
        ['Fertilisation (compost, amendements)', 0.65, (calculs.surfaceTotale * 0.65).toFixed(0)],
        ['Semences et plants', 0.42, (calculs.surfaceTotale * 0.42).toFixed(0)],
        ['Protection bio', 0.16, (calculs.surfaceTotale * 0.16).toFixed(0)],
        ['SOUS-TOTAL VARIABLES', 1.23, intrantsVarTotal.toFixed(0)],
        [],
        ['═══ INTRANTS FIXES (Amortissements) ═══'],
        ['Poste', '€/m²', 'Total (€)'],
        ['Matériel (motoculteur, outils)', 0.55, (calculs.surfaceTotale * 0.55).toFixed(0)],
        ['Serres et bâches', 0.37, (calculs.surfaceTotale * 0.37).toFixed(0)],
        ['Irrigation', 0.15, (calculs.surfaceTotale * 0.15).toFixed(0)],
        ['Véhicule livraison', 0.70, (calculs.surfaceTotale * 0.70).toFixed(0)],
        ['Matériel vente', 0.40, (calculs.surfaceTotale * 0.40).toFixed(0)],
        ['Énergie/carburants', 0.20, (calculs.surfaceTotale * 0.20).toFixed(0)],
        ['Frais administratifs', 0.50, (calculs.surfaceTotale * 0.50).toFixed(0)],
        ['SOUS-TOTAL FIXES', 2.87, intrantsFixTotal.toFixed(0)],
        [],
        ['═══ MAIN D\'ŒUVRE ═══'],
        ['Poste', 'Heures', 'Coût (€) à 28€/h'],
        ['Récolte (60%)', (calculs.heures * 0.6).toFixed(0), (calculs.heures * 0.6 * 28).toFixed(0)],
        ['Entretien (30%)', (calculs.heures * 0.3).toFixed(0), (calculs.heures * 0.3 * 28).toFixed(0)],
        ['Implantation (10%)', (calculs.heures * 0.1).toFixed(0), (calculs.heures * 0.1 * 28).toFixed(0)],
        ['SOUS-TOTAL MAIN D\'ŒUVRE', calculs.heures.toFixed(0), mainOeuvreTotal.toFixed(0)],
        [],
        ['═══ TOTAL CHARGES ═══'],
        ['Catégorie', 'Montant (€)'],
        ['Intrants variables', intrantsVarTotal.toFixed(0)],
        ['Intrants fixes', intrantsFixTotal.toFixed(0)],
        ['Main d\'œuvre', mainOeuvreTotal.toFixed(0)],
        ['TOTAL CHARGES', (intrantsVarTotal + intrantsFixTotal + mainOeuvreTotal).toFixed(0)]
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(intrantsData), '📊 Intrants');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 14 : RÉSULTATS - RENTABILITÉ
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(85);
      const margeOperationnelle = calculs.caPlanifieSaison - intrantsVarTotal - mainOeuvreTotal;
      const margeComplete = calculs.caPlanifieSaison - intrantsVarTotal - intrantsFixTotal - mainOeuvreTotal;
      
      const rentabiliteData = [
        ['RÉSULTATS - RENTABILITÉ'],
        [],
        ['═══ COMPTE DE RÉSULTAT SIMPLIFIÉ ═══'],
        ['Poste', 'Montant (€)'],
        ['CA Planifié (Produits)', calculs.caPlanifieSaison.toFixed(0)],
        ['- Intrants variables', `-${intrantsVarTotal.toFixed(0)}`],
        ['- Main d\'œuvre', `-${mainOeuvreTotal.toFixed(0)}`],
        ['= MARGE OPÉRATIONNELLE', margeOperationnelle.toFixed(0)],
        ['- Intrants fixes (amortissements)', `-${intrantsFixTotal.toFixed(0)}`],
        ['= MARGE COMPLÈTE', margeComplete.toFixed(0)],
        [],
        ['═══ INDICATEURS DE RENTABILITÉ ═══'],
        ['Indicateur', 'Valeur', 'Interprétation'],
        ['Taux marge opérationnelle', `${calculs.caPlanifieSaison > 0 ? ((margeOperationnelle / calculs.caPlanifieSaison) * 100).toFixed(0) : 0}%`, margeOperationnelle > 0 ? '✅ Rentable' : '❌ Non rentable'],
        ['Taux marge complète', `${calculs.caPlanifieSaison > 0 ? ((margeComplete / calculs.caPlanifieSaison) * 100).toFixed(0) : 0}%`, margeComplete > 0 ? '✅ Rentable' : '❌ Non rentable'],
        ['CA/m²', `${calculs.surfaceTotale > 0 ? (calculs.caPlanifieSaison / calculs.surfaceTotale).toFixed(2) : 0} €`, calculs.surfaceTotale > 0 && calculs.caPlanifieSaison / calculs.surfaceTotale >= 35 ? '✅ Objectif atteint' : '⚠️ En dessous objectif 35€/m²'],
        ['CA/heure', `${calculs.heures > 0 ? (calculs.caPlanifieSaison / calculs.heures).toFixed(2) : 0} €`, ''],
        ['CA/planche', `${calculs.totalPlanchesUtilisees > 0 ? (calculs.caPlanifieSaison / calculs.totalPlanchesUtilisees).toFixed(0) : 0} €`, ''],
        [],
        ['═══ ÉQUIVALENT TEMPS PLEIN ═══'],
        ['Indicateur', 'Valeur'],
        ['Heures totales estimées', calculs.heures.toFixed(0)],
        ['Base annuelle (ETP)', '1820 h'],
        ['ETP nécessaires', (calculs.heures / 1820).toFixed(2)]
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rentabiliteData), '📈 Rentabilité');

      // ═══════════════════════════════════════════════════════════════════════
      // FEUILLE 15 : DONNÉES JSON BRUTES
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(95);
      const donneesData = [
        ['DONNÉES BRUTES JSON (pour réimport ou analyse)'],
        ['⚠️ Données tronquées si > 32000 caractères'],
        [],
        ['Type', 'JSON'],
        ['Marché', truncate(JSON.stringify(marche))],
        ['Jardins', truncate(JSON.stringify(jardins))],
        ['Niveau maturité', niveauMaturite]
      ];
      culturesSelectionnees.forEach((c, i) => {
        donneesData.push([`Culture ${i + 1}: ${c.nom}`, truncate(JSON.stringify(c), 30000)]);
      });
      if (fournitures) {
        donneesData.push(['Fournitures', truncate(JSON.stringify(fournitures), 30000)]);
      }
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(donneesData), '🗃️ Données JSON');

      // ═══════════════════════════════════════════════════════════════════════
      // GÉNÉRATION DU FICHIER
      // ═══════════════════════════════════════════════════════════════════════
      setProgress(100);
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Planification_Maraichere_V21_${date}.xlsx`);
      
      setExporting(false);
    } catch (err) {
      console.error('Erreur export Excel:', err);
      setError(err.message);
      setExporting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPOSANT SECTION
  // ═══════════════════════════════════════════════════════════════════════════

  const Section = ({ id, title, icon, children }) => (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <button onClick={() => toggle(id)} className="w-full p-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors">
        <span className="font-bold flex items-center"><span className="mr-2">{icon}</span>{title}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${accordeons[id] ? 'rotate-180' : ''}`} />
      </button>
      {accordeons[id] && <div className="p-4 bg-white">{children}</div>}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <FileSpreadsheet className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Export Excel Complet</h2>
            <p className="text-sm text-gray-500">V21 - Toutes les données de tous les onglets</p>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
            <div className="text-2xl font-bold text-green-600">{jardins.length}</div>
            <div className="text-xs text-gray-600">Jardins</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{calculs.totalPlanchesDisponibles}</div>
            <div className="text-xs text-gray-600">Planches</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{culturesSelectionnees.length}</div>
            <div className="text-xs text-gray-600">Cultures</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{calculs.totalSeries}</div>
            <div className="text-xs text-gray-600">Séries</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-600">{calculs.caPlanifieSaison.toLocaleString()}</div>
            <div className="text-xs text-gray-600">CA Planifié (€)</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
            <div><p className="font-bold text-red-900">Erreur</p><p className="text-sm text-red-700">{error}</p></div>
          </div>
        )}

        {/* Barre de progression */}
        {exporting && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Génération en cours...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={exportToExcel}
          disabled={exporting || culturesSelectionnees.length === 0}
          className={`w-full flex items-center justify-center py-4 px-6 rounded-lg font-bold text-lg mb-6 transition-all ${
            exporting || culturesSelectionnees.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg'
          }`}
        >
          {exporting ? (
            <>
              <Loader className="w-6 h-6 mr-3 animate-spin" />
              Export en cours ({progress}%)...
            </>
          ) : (
            <>
              <Download className="w-6 h-6 mr-3" />
              Télécharger Excel (15 feuilles)
            </>
          )}
        </button>

        {culturesSelectionnees.length === 0 && (
          <p className="text-center text-orange-600 mb-4 text-sm">⚠️ Ajoutez au moins une culture pour exporter</p>
        )}

        <Section id="contenu" title="Contenu de l'export (15 feuilles)" icon="📋">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="font-semibold text-gray-700 mb-2">📊 Synthèse</div>
              <div className="pl-3 text-gray-600">• Synthèse globale</div>
              
              <div className="font-semibold text-gray-700 mt-3 mb-2">🛒 Onglet Marché</div>
              <div className="pl-3 text-gray-600">• Configuration marché (AMAP, ventes, resto)</div>
              
              <div className="font-semibold text-gray-700 mt-3 mb-2">🏡 Onglet Jardins</div>
              <div className="pl-3 text-gray-600">• Configuration jardins (surfaces, CA)</div>
              
              <div className="font-semibold text-gray-700 mt-3 mb-2">⚖️ Onglet Simulateur</div>
              <div className="pl-3 text-gray-600">• Scénarios viables</div>
              <div className="pl-3 text-gray-600">• Fournitures & intrants</div>
              
              <div className="font-semibold text-gray-700 mt-3 mb-2">🌱 Onglet Cultures</div>
              <div className="pl-3 text-gray-600">• Liste cultures sélectionnées</div>
              <div className="pl-3 text-gray-600">• CA & économie par culture</div>
            </div>
            
            <div className="space-y-1">
              <div className="font-semibold text-gray-700 mb-2">📅 Onglet Planification</div>
              <div className="pl-3 text-gray-600">• Planning détaillé par série</div>
              <div className="pl-3 text-gray-600">• Calendrier Gantt (52 semaines)</div>
              
              <div className="font-semibold text-gray-700 mt-3 mb-2">📋 Onglet Tâches</div>
              <div className="pl-3 text-gray-600">• Calendrier des interventions</div>
              <div className="pl-3 text-gray-600">• Besoins hebdo par légume</div>
              
              <div className="font-semibold text-gray-700 mt-3 mb-2">📈 Onglet Résultats</div>
              <div className="pl-3 text-gray-600">• Analyse des CA (Commercial, Planifié, Surplus)</div>
              <div className="pl-3 text-gray-600">• Intrants & charges</div>
              <div className="pl-3 text-gray-600">• Rentabilité</div>
              
              <div className="font-semibold text-gray-700 mt-3 mb-2">🗃️ Données</div>
              <div className="pl-3 text-gray-600">• JSON brut (pour réimport)</div>
            </div>
          </div>
        </Section>

        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-sm text-green-800">
          <p className="font-semibold mb-1">💡 Export V21 Complet</p>
          <p>Ce fichier Excel contient <strong>toutes les données</strong> de votre planification : marché, jardins, simulateur, cultures, planning, tâches, résultats financiers et données JSON pour réimport.</p>
        </div>
      </div>
    </div>
  );
};

export default ExportExcel;
