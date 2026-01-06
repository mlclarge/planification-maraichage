import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Users, Store, AlertCircle, CheckCircle, Minus, Plus, ChevronDown } from 'lucide-react';
import { calculerBesoinHebdo } from '../data/compositionsPaniers';

const ConfigurationMarche = ({ marche, setMarche, marcheValide, setMarcheValide }) => {
  const [afficherTableau, setAfficherTableau] = useState(false);
  
  // 📱 Détection mobile et accordéons repliés par défaut
  const [isMobile, setIsMobile] = useState(false);
  const [accordeons, setAccordeons] = useState({
    amap: true,
    marche: true,
    resume: true,
    production: true
  });
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) {
        setAccordeons({
          amap: false,
          marche: false,
          resume: false,
          production: false
        });
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const toggleAccordeon = (id) => {
    setAccordeons(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChange = (field, value) => {
    setMarche(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  // 📱 Composant Stepper pour mobile (boutons +/-)
  const MobileStepper = ({ value, onChange, min = 0, max = 999, step = 1, color = 'green' }) => {
    const colorClasses = {
      green: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
      blue: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
    };
    
    const increment = () => onChange(Math.min(max, (value || 0) + step));
    const decrement = () => onChange(Math.max(min, (value || 0) - step));
    
    const displayValue = value === 0 ? '' : value;
    
    const handleInputChange = (e) => {
      const val = e.target.value;
      onChange(val === '' ? 0 : (parseInt(val) || 0));
    };

    return (
      <div className="flex items-center justify-center space-x-2 sm:hidden">
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
          className="w-20 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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

  // Détecter si des modifications sont en attente
  const hasChanges = JSON.stringify(marche) !== JSON.stringify(marcheValide);

  // Fonction de validation
  const handleValider = () => {
    setMarcheValide({ ...marche });
    alert('✅ Marché validé ! Les calculs des cultures et résultats ont été mis à jour.');
  };

  // Calculer la production hebdomadaire sur 52 semaines
  const productionHebdo = useMemo(() => {
    const production = [];
    for (let semaine = 1; semaine <= 52; semaine++) {
      const besoins = calculerBesoinHebdo(marcheValide, semaine);
      production.push({
        semaine,
        ...Object.keys(besoins).reduce((acc, legume) => {
          acc[legume] = besoins[legume].total;
          return acc;
        }, {})
      });
    }
    return production;
  }, [marcheValide]);

  const totalPaniers = marche.amap + marche.marche;
  const besoinHebdomadaireKg = 
    (marche.amap * marche.tauxPetit * 3) +
    (marche.amap * marche.tauxMoyen * 5) +
    (marche.amap * marche.tauxGrand * 7) +
    (marche.marche * 3.75) +
    (marche.restaurant * 10);

  // 🆕 GRILLES DE PRIX CONTEXTUELLES
  const prixContextuels = {
    bas: {
      tomate: 2.90,
      courgette: 2.00,
      concombre: 3.75,
      aubergine: 3.50,
      haricot: 10.00,
      mesclun: 14.00,
      verdurette: 12.00,
      carotte: 1.80,
      betterave: 2.50,
      radis: 6.00,
      basilic: 30.00
    },
    moyen: {
      tomate: 3.80,
      courgette: 3.00,
      concombre: 5.00,
      aubergine: 4.50,
      haricot: 13.00,
      mesclun: 18.00,
      verdurette: 16.00,
      carotte: 2.50,
      betterave: 3.50,
      radis: 8.33,
      basilic: 40.00
    },
    haut: {
      tomate: 4.80,
      courgette: 4.50,
      concombre: 6.25,
      aubergine: 6.00,
      haricot: 16.00,
      mesclun: 24.00,
      verdurette: 22.00,
      carotte: 3.20,
      betterave: 4.50,
      radis: 10.67,
      basilic: 50.00
    }
  };

  // 🆕 CALCULER 3 CA SELON CONTEXTE
  const calculerCA = (contexte) => {
    let ca = 0;
    for (let semaine = 18; semaine <= 38; semaine++) {
      const besoins = calculerBesoinHebdo(marcheValide, semaine);
      Object.keys(besoins).forEach(legume => {
        if (prixContextuels[contexte][legume]) {
          ca += besoins[legume].total * prixContextuels[contexte][legume];
        }
      });
    }
    return ca;
  };

  // 🔧 V25 : CA Bas supprimé (on garde CA Moyen et CA Haut)
  const caMoyen = useMemo(() => calculerCA('moyen'), [marcheValide]);
  const caHaut = useMemo(() => calculerCA('haut'), [marcheValide]);

  return (
    <div className="space-y-6">
      {/* 📱 Alerte de modifications en attente - STICKY sur mobile */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-50 sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:z-auto">
          <div className="bg-orange-50 border-t-4 sm:border-2 border-orange-500 sm:rounded-lg p-4 sm:p-6 shadow-lg">
            <div className="flex items-center sm:items-start space-x-3 sm:space-x-4">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base sm:text-xl font-bold text-orange-900 mb-1 sm:mb-2">
                  ⚠️ Modifications Non Validées
                </h3>
                <p className="hidden sm:block text-orange-800 mb-4">
                  Vous avez modifié les paramètres du marché mais ces changements n'ont pas encore été appliqués. 
                  Les calculs des cultures et résultats utilisent toujours l'ancienne configuration.
                </p>
                <button
                  onClick={handleValider}
                  className="w-full bg-orange-600 text-white py-3 px-4 sm:px-6 rounded-md font-bold text-base sm:text-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2 shadow-md"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Valider et Recalculer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 📱 Spacer quand le bloc sticky est affiché sur mobile */}
      {hasChanges && <div className="h-28 sm:hidden"></div>}

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <ShoppingCart className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Configuration du Marché
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AMAP - 📱 Accordéon sur mobile */}
          <div className="bg-green-50 rounded-lg border border-green-200 overflow-hidden">
            <button 
              onClick={() => toggleAccordeon('amap')}
              className="w-full p-5 flex items-center justify-between hover:bg-green-100/50 transition-colors text-left"
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-lg text-gray-800">AMAP</h3>
                <span className="text-sm text-green-600 font-bold">({marche.amap})</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform sm:hidden ${accordeons.amap ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`${accordeons.amap ? 'block' : 'hidden sm:block'} px-5 pb-5 space-y-4`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de paniers hebdomadaires
                </label>
                {/* Desktop : input classique */}
                <input
                  type="number"
                  min="0"
                  value={marche.amap === 0 ? '' : marche.amap}
                  onChange={(e) => handleChange('amap', e.target.value)}
                  placeholder="0"
                  className="hidden sm:block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {/* 📱 Mobile : stepper +/- */}
                <MobileStepper
                  value={marche.amap}
                  onChange={(val) => setMarche(prev => ({ ...prev, amap: val }))}
                  color="green"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Petits (3kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={marche.tauxPetit}
                      onChange={(e) => handleChange('tauxPetit', e.target.value)}
                      className="w-full px-2 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500"
                    />
                    <span className="absolute right-2 top-2 text-gray-500 text-xs">
                      {(marche.tauxPetit * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Moyens (5kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={marche.tauxMoyen}
                      onChange={(e) => handleChange('tauxMoyen', e.target.value)}
                      className="w-full px-2 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500"
                    />
                    <span className="absolute right-2 top-2 text-gray-500 text-xs">
                      {(marche.tauxMoyen * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Grands (7kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={marche.tauxGrand}
                      onChange={(e) => handleChange('tauxGrand', e.target.value)}
                      className="w-full px-2 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500"
                    />
                    <span className="absolute right-2 top-2 text-gray-500 text-xs">
                      {(marche.tauxGrand * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded p-3 border border-green-300">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Paniers petits:</span>
                  <span className="font-medium">{(marche.amap * marche.tauxPetit).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Paniers moyens:</span>
                  <span className="font-medium">{(marche.amap * marche.tauxMoyen).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                  <span className="text-gray-600">Paniers grands:</span>
                  <span className="font-medium">{(marche.amap * marche.tauxGrand).toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Marché de plein vent - 📱 Accordéon sur mobile */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
            <button 
              onClick={() => toggleAccordeon('marche')}
              className="w-full p-5 flex items-center justify-between hover:bg-blue-100/50 transition-colors text-left"
            >
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg text-gray-800">Marché de Plein Vent</h3>
                <span className="text-sm text-blue-600 font-bold">({marche.marche + marche.restaurant})</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform sm:hidden ${accordeons.marche ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`${accordeons.marche ? 'block' : 'hidden sm:block'} px-5 pb-5 space-y-4`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de clients hebdomadaires estimés
                </label>
                {/* Desktop : input classique */}
                <input
                  type="number"
                  min="0"
                  value={marche.marche === 0 ? '' : marche.marche}
                  onChange={(e) => handleChange('marche', e.target.value)}
                  placeholder="0"
                  className="hidden sm:block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {/* 📱 Mobile : stepper +/- */}
                <MobileStepper
                  value={marche.marche}
                  onChange={(val) => setMarche(prev => ({ ...prev, marche: val }))}
                  color="blue"
                />
              </div>

              <div className="bg-white rounded p-4 border border-blue-300">
                <p className="text-xs text-gray-600 mb-2">
                  Estimation basée sur 3.75 kg par client moyen
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Volume hebdomadaire estimé:</span>
                  <span className="font-bold text-blue-700">
                    {(marche.marche * 3.75).toFixed(1)} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Restaurants */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <h4 className="font-medium text-gray-800 mb-3">Restauration</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de restaurants
                </label>
                {/* Desktop : input classique */}
                <input
                  type="number"
                  min="0"
                  value={marche.restaurant === 0 ? '' : marche.restaurant}
                  onChange={(e) => handleChange('restaurant', e.target.value)}
                  placeholder="0"
                  className="hidden sm:block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {/* 📱 Mobile : stepper +/- */}
                <MobileStepper
                  value={marche.restaurant}
                  onChange={(val) => setMarche(prev => ({ ...prev, restaurant: val }))}
                  color="blue"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Estimation: 10 kg par restaurant par semaine
              </p>
            </div>
          </div>
        </div>

        {/* Résumé global avec 3 CA - 📱 Accordéon sur mobile */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-gray-300 overflow-hidden">
          <button 
            onClick={() => toggleAccordeon('resume')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-colors text-left"
          >
            <h3 className="font-bold text-lg text-gray-900">📊 Résumé de la Demande</h3>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform sm:hidden ${accordeons.resume ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`${accordeons.resume ? 'block' : 'hidden sm:block'} p-6 pt-0`}>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Total Paniers/Clients</p>
              <p className="text-2xl font-bold text-green-600">{totalPaniers}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Besoin Hebdo (kg)</p>
              <p className="text-2xl font-bold text-blue-600">{besoinHebdomadaireKg.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Besoin Mensuel (kg)</p>
              <p className="text-2xl font-bold text-purple-600">
                {(besoinHebdomadaireKg * 4.33).toFixed(0)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Besoin Saison (21 sem)</p>
              <p className="text-2xl font-bold text-orange-600">
                {(besoinHebdomadaireKg * 21).toFixed(0)}
              </p>
            </div>
            {/* 🆕 2 CA CONTEXTUELS - V25 : CA Bas supprimé */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 shadow-lg">
              <p className="text-xs text-orange-100 mb-1 font-semibold">CA Moyen</p>
              <p className="text-2xl font-bold text-white">{caMoyen.toFixed(0)} €</p>
              <p className="text-xs text-orange-100">Marché Standard</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 shadow-lg">
              <p className="text-xs text-green-100 mb-1 font-semibold">CA Haut</p>
              <p className="text-2xl font-bold text-white">{caHaut.toFixed(0)} €</p>
              <p className="text-xs text-green-100">Primeur/Resto</p>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* 🥕 Production Hebdomadaire par Légume - 📱 Accordéon sur mobile */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <button 
          onClick={() => toggleAccordeon('production')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="text-2xl mr-2">🥕</span>
            Production Hebdomadaire par Légume
          </h3>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform sm:hidden ${accordeons.production ? 'rotate-180' : ''}`} />
        </button>
        
        <div className={`${accordeons.production ? 'block' : 'hidden sm:block'} px-6 pb-6`}>
        <p className="text-sm text-gray-600 mb-6">
          Quantités moyennes hebdomadaires calculées sur la période de récolte de chaque légume.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tomates */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border-2 border-red-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🍅</span>
              <h4 className="font-bold text-gray-800">Tomates</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-red-600">
                {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.tomate?.total > 0) { total += b.tomate.total; count++; }
                  }
                  return count > 0 ? (total/count).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">kg/semaine</p>
              <p className="text-xs text-gray-600 mt-1">
                ≈ {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.tomate?.total > 0) { total += b.tomate.total; count++; }
                  }
                  return count > 0 ? ((total/count)*20).toFixed(0) : 0;
                })()} kg
              </p>
            </div>
          </div>

          {/* Courgettes */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🥒</span>
              <h4 className="font-bold text-gray-800">Courgettes</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">
                {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.courgette?.total > 0) { total += b.courgette.total; count++; }
                  }
                  return count > 0 ? (total/count).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">kg/semaine</p>
              <p className="text-xs text-gray-600 mt-1">
                ≈ {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.courgette?.total > 0) { total += b.courgette.total; count++; }
                  }
                  return count > 0 ? ((total/count)*20).toFixed(0) : 0;
                })()} kg
              </p>
            </div>
          </div>

          {/* Concombres */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🥒</span>
              <h4 className="font-bold text-gray-800">Concombres</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">
                {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.concombre?.total > 0) { total += b.concombre.total; count++; }
                  }
                  return count > 0 ? ((total/count)/0.4).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">pièces/semaine</p>
              <p className="text-xs text-gray-600 mt-1">
                ≈ {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.concombre?.total > 0) { total += b.concombre.total; count++; }
                  }
                  return count > 0 ? ((total/count)*20).toFixed(0) : 0;
                })()} kg
              </p>
            </div>
          </div>

          {/* Aubergines */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🍆</span>
              <h4 className="font-bold text-gray-800">Aubergines</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600">
                {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.aubergine?.total > 0) { total += b.aubergine.total; count++; }
                  }
                  return count > 0 ? (total/count).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">kg/semaine</p>
              <p className="text-xs text-gray-600 mt-1">
                ≈ {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.aubergine?.total > 0) { total += b.aubergine.total; count++; }
                  }
                  return count > 0 ? ((total/count)*20).toFixed(0) : 0;
                })()} kg
              </p>
            </div>
          </div>

          {/* Haricots */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🫘</span>
              <h4 className="font-bold text-gray-800">Haricots</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">
                {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.haricot?.total > 0) { total += b.haricot.total; count++; }
                  }
                  return count > 0 ? (total/count).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">kg/semaine</p>
              <p className="text-xs text-gray-600 mt-1">
                ≈ {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.haricot?.total > 0) { total += b.haricot.total; count++; }
                  }
                  return count > 0 ? ((total/count)*20).toFixed(0) : 0;
                })()} kg
              </p>
            </div>
          </div>

          {/* Mesclun */}
          <div className="bg-gradient-to-br from-lime-50 to-lime-100 rounded-lg p-4 border-2 border-lime-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🥗</span>
              <h4 className="font-bold text-gray-800">Mesclun</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-lime-600">
                {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.mesclun?.total > 0) { total += b.mesclun.total; count++; }
                  }
                  return count > 0 ? (total/count).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">kg/semaine</p>
              <p className="text-xs text-gray-600 mt-1">
                ≈ {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.mesclun?.total > 0) { total += b.mesclun.total; count++; }
                  }
                  return count > 0 ? ((total/count)*20).toFixed(0) : 0;
                })()} kg
              </p>
            </div>
          </div>

          {/* Verdurettes */}
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border-2 border-teal-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🌿</span>
              <h4 className="font-bold text-gray-800">Verdurettes</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-teal-600">
                {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.verdurette?.total > 0) { total += b.verdurette.total; count++; }
                  }
                  return count > 0 ? (total/count).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">kg/semaine</p>
              <p className="text-xs text-gray-600 mt-1">
                ≈ {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.verdurette?.total > 0) { total += b.verdurette.total; count++; }
                  }
                  return count > 0 ? ((total/count)*20).toFixed(0) : 0;
                })()} kg
              </p>
            </div>
          </div>

          {/* Carottes */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-2 border-orange-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🥕</span>
              <h4 className="font-bold text-gray-800">Carottes</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-600">
                {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.carotte?.total > 0) { total += b.carotte.total; count++; }
                  }
                  return count > 0 ? ((total/count)/0.8).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">bottes/semaine</p>
              <p className="text-xs text-gray-600 mt-1">
                ≈ {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.carotte?.total > 0) { total += b.carotte.total; count++; }
                  }
                  return count > 0 ? ((total/count)*20).toFixed(0) : 0;
                })()} kg
              </p>
            </div>
          </div>

          {/* Betteraves */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border-2 border-red-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🫒</span>
              <h4 className="font-bold text-gray-800">Betteraves</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-red-600">
                {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.betterave?.total > 0) { total += b.betterave.total; count++; }
                  }
                  return count > 0 ? ((total/count)/0.6).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">bottes/semaine</p>
              <p className="text-xs text-gray-600 mt-1">
                ≈ {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.betterave?.total > 0) { total += b.betterave.total; count++; }
                  }
                  return count > 0 ? ((total/count)*20).toFixed(0) : 0;
                })()} kg
              </p>
            </div>
          </div>

          {/* Radis */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border-2 border-pink-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🌱</span>
              <h4 className="font-bold text-gray-800">Radis</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-pink-600">
                {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.radis?.total > 0) { total += b.radis.total; count++; }
                  }
                  return count > 0 ? ((total/count)/0.3).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">bottes/semaine</p>
              <p className="text-xs text-gray-600 mt-1">
                ≈ {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.radis?.total > 0) { total += b.radis.total; count++; }
                  }
                  return count > 0 ? ((total/count)*20).toFixed(0) : 0;
                })()} kg
              </p>
            </div>
          </div>

          {/* Basilic */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🌿</span>
              <h4 className="font-bold text-gray-800">Basilic</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">
                {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.basilic?.total > 0) { total += b.basilic.total; count++; }
                  }
                  return count > 0 ? ((total/count)/0.05).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">bottes/semaine</p>
              <p className="text-xs text-gray-600 mt-1">
                ≈ {(() => {
                  let total = 0, count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const b = calculerBesoinHebdo(marcheValide, s);
                    if (b.basilic?.total > 0) { total += b.basilic.total; count++; }
                  }
                  return count > 0 ? ((total/count)*20).toFixed(0) : 0;
                })()} kg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🆕 Tableau horizontal compact avec TOTAL SAISON */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-gray-900 flex items-center">
            <span className="mr-2">📊</span>
            {afficherTableau ? 'Masquer' : 'Afficher'} Production Hebdomadaire (52 semaines)
          </h4>
          <button
            onClick={() => setAfficherTableau(!afficherTableau)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            {afficherTableau ? '📕 Masquer Détails' : '📖 Afficher Détails'}
          </button>
        </div>

        {/* Tableau horizontal compact - TOUJOURS VISIBLE */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse bg-white rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border text-left font-semibold text-xs">Semaine</th>
                <th className="px-4 py-2 border text-center font-semibold text-xs">🍅<br/>Tomates</th>
                <th className="px-4 py-2 border text-center font-semibold text-xs">🥒<br/>Courgettes</th>
                <th className="px-4 py-2 border text-center font-semibold text-xs">🥒<br/>Concombres</th>
                <th className="px-4 py-2 border text-center font-semibold text-xs">🍆<br/>Aubergines</th>
                <th className="px-4 py-2 border text-center font-semibold text-xs">🫘<br/>Haricots</th>
                <th className="px-4 py-2 border text-center font-semibold text-xs">🥗<br/>Mesclun</th>
                <th className="px-4 py-2 border text-center font-semibold text-xs">🌿<br/>Verdurettes</th>
                <th className="px-4 py-2 border text-center font-semibold text-xs">🥕<br/>Carottes</th>
                <th className="px-4 py-2 border text-center font-semibold text-xs">🫒<br/>Betteraves</th>
                <th className="px-4 py-2 border text-center font-semibold text-xs">🌱<br/>Radis</th>
                <th className="px-4 py-2 border text-center font-semibold text-xs">🌿<br/>Basilic</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 border font-medium text-gray-700">S52</td>
                <td className="px-4 py-2 border text-center text-gray-500 text-xs">Hors saison</td>
                <td className="px-4 py-2 border text-center text-gray-500 text-xs">Hors saison</td>
                <td className="px-4 py-2 border text-center text-gray-500 text-xs">Hors saison</td>
                <td className="px-4 py-2 border text-center text-gray-500 text-xs">Hors saison</td>
                <td className="px-4 py-2 border text-center text-gray-500 text-xs">Hors saison</td>
                <td className="px-4 py-2 border text-center text-gray-500 text-xs">Hors saison</td>
                <td className="px-4 py-2 border text-center text-gray-500 text-xs">Hors saison</td>
                <td className="px-4 py-2 border text-center text-gray-500 text-xs">Hors saison</td>
                <td className="px-4 py-2 border text-center text-gray-500 text-xs">Hors saison</td>
                <td className="px-4 py-2 border text-center text-gray-500 text-xs">Hors saison</td>
                <td className="px-4 py-2 border text-center text-gray-500 text-xs">Hors saison</td>
              </tr>
            </tbody>
            <tfoot className="bg-gradient-to-r from-green-100 to-green-200 font-bold">
              <tr>
                <td className="px-4 py-3 border text-left text-green-900">
                  TOTAL<br/>SAISON
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="text-xl text-green-700">
                    {productionHebdo.reduce((sum, s) => sum + (s.tomate || 0), 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">kg</div>
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="text-xl text-green-700">
                    {productionHebdo.reduce((sum, s) => sum + (s.courgette || 0), 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">kg</div>
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="text-xl text-green-700">
                    {productionHebdo.reduce((sum, s) => sum + (s.concombre || 0), 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">kg</div>
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="text-xl text-green-700">
                    {productionHebdo.reduce((sum, s) => sum + (s.aubergine || 0), 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">kg</div>
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="text-xl text-green-700">
                    {productionHebdo.reduce((sum, s) => sum + (s.haricot || 0), 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">kg</div>
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="text-xl text-green-700">
                    {productionHebdo.reduce((sum, s) => sum + (s.mesclun || 0), 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">kg</div>
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="text-xl text-green-700">
                    {productionHebdo.reduce((sum, s) => sum + (s.verdurette || 0), 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">kg</div>
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="text-xl text-green-700">
                    {productionHebdo.reduce((sum, s) => sum + (s.carotte || 0), 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">kg</div>
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="text-xl text-green-700">
                    {productionHebdo.reduce((sum, s) => sum + (s.betterave || 0), 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">kg</div>
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="text-xl text-green-700">
                    {productionHebdo.reduce((sum, s) => sum + (s.radis || 0), 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">kg</div>
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="text-xl text-green-700">
                    {productionHebdo.reduce((sum, s) => sum + (s.basilic || 0), 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">kg</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="text-xs text-blue-700">
          <p>
            💡 <strong>Lecture du tableau :</strong> Les calculs grisés "Hors saison" indiquent que le légume n'est pas disponible à cette période selon les fenêtres de culture du Sud-Ouest France.
          </p>
        </div>

        {/* Tableau détaillé 52 semaines - CONDITIONNEL */}
        {afficherTableau && (
          <div className="mt-4 overflow-x-auto border-t-2 border-blue-300 pt-4">
            <h5 className="text-md font-bold text-gray-900 mb-3">📋 Détail des 52 Semaines</h5>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="sticky left-0 bg-gray-100 px-3 py-2 border text-left font-semibold">Sem.</th>
                  <th className="px-3 py-2 border text-right font-semibold">Tomate</th>
                  <th className="px-3 py-2 border text-right font-semibold">Courgette</th>
                  <th className="px-3 py-2 border text-right font-semibold">Concombre</th>
                  <th className="px-3 py-2 border text-right font-semibold">Aubergine</th>
                  <th className="px-3 py-2 border text-right font-semibold">Haricot</th>
                  <th className="px-3 py-2 border text-right font-semibold">Mesclun</th>
                  <th className="px-3 py-2 border text-right font-semibold">Verdurette</th>
                  <th className="px-3 py-2 border text-right font-semibold">Carotte</th>
                  <th className="px-3 py-2 border text-right font-semibold">Betterave</th>
                  <th className="px-3 py-2 border text-right font-semibold">Radis</th>
                  <th className="px-3 py-2 border text-right font-semibold">Basilic</th>
                </tr>
              </thead>
              <tbody>
                {productionHebdo.map((semaine, index) => (
                  <tr 
                    key={semaine.semaine}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="sticky left-0 bg-inherit px-3 py-2 border font-medium">
                      S{semaine.semaine}
                    </td>
                    <td className="px-3 py-2 border text-right">{semaine.tomate?.toFixed(1) || '0.0'}</td>
                    <td className="px-3 py-2 border text-right">{semaine.courgette?.toFixed(1) || '0.0'}</td>
                    <td className="px-3 py-2 border text-right">{semaine.concombre?.toFixed(1) || '0.0'}</td>
                    <td className="px-3 py-2 border text-right">{semaine.aubergine?.toFixed(1) || '0.0'}</td>
                    <td className="px-3 py-2 border text-right">{semaine.haricot?.toFixed(1) || '0.0'}</td>
                    <td className="px-3 py-2 border text-right">{semaine.mesclun?.toFixed(1) || '0.0'}</td>
                    <td className="px-3 py-2 border text-right">{semaine.verdurette?.toFixed(1) || '0.0'}</td>
                    <td className="px-3 py-2 border text-right">{semaine.carotte?.toFixed(1) || '0.0'}</td>
                    <td className="px-3 py-2 border text-right">{semaine.betterave?.toFixed(1) || '0.0'}</td>
                    <td className="px-3 py-2 border text-right">{semaine.radis?.toFixed(1) || '0.0'}</td>
                    <td className="px-3 py-2 border text-right">{semaine.basilic?.toFixed(1) || '0.0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationMarche;
