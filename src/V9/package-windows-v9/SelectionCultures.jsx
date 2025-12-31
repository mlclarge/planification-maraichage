import React, { useState } from 'react';
import { cultures } from '../data/cultures';
import { Plus, X, Copy, AlertTriangle } from 'lucide-react';
import { calculerBesoinHebdo } from '../data/compositionsPaniers';
// 🆕 NOUVEAU V9 : Import du module de calcul des planches
import { 
  genererPlanComplet, 
  validerPlan 
} from '../utils/calculPlanchesSimultanees';

const SelectionCultures = ({ culturesSelectionnees, setCulturesSelectionnees, jardins, marche }) => {
  // Calcul automatique du nombre de planches recommandées (CONSERVÉ pour compatibilité)
  const calculerPlanchesRecommandees = (culture) => {
    let besoinTotal = 0;
    
    const debut = culture.fenetres.recolte.debut;
    const fin = culture.fenetres.recolte.fin;
    
    for (let semaine = debut; semaine <= fin; semaine++) {
      const besoins = calculerBesoinHebdo(marche, semaine);
      if (besoins[culture.id]) {
        besoinTotal += besoins[culture.id].total;
      }
    }
    
    const rendementParPlanche = culture.rendement.planche30m;
    const rotations = culture.rotationsPossibles || 1;
    
    if (culture.nombreCoupesParCycle) {
      const rendementTotal = culture.rendement.planche30mTotal || (rendementParPlanche * culture.nombreCoupesParCycle);
      return Math.ceil(besoinTotal / (rendementTotal * rotations));
    }
    
    return Math.ceil(besoinTotal / (rendementParPlanche * rotations));
  };

  // 🎯 NOUVEAU V9 : Ajouter une culture avec calcul complet automatique
  const ajouterCulture = (culture) => {
    if (!culturesSelectionnees.find(c => c.id === culture.id)) {
      try {
        // Générer le plan complet automatiquement
        const plan = genererPlanComplet(culture, marche, calculerBesoinHebdo);
        const validation = validerPlan(plan, jardins);
        
        console.log('📊 Plan généré pour', culture.nom, plan);
        
        setCulturesSelectionnees([...culturesSelectionnees, {
          ...culture,
          // 🆕 Nouvelles données du plan
          planComplet: plan,
          validation: validation,
          
          // Pour compatibilité avec code existant
          planchesRecommandees: plan.calcul.planchesSimultanees,
          jardinId: jardins[0]?.id || 1,
          
          // 🆕 Séries générées automatiquement
          series: plan.series.map(s => ({
            id: s.id,
            planchesUtilisees: s.planchesUtilisees,
            semaineDebut: s.semaineRecolteDebut,
            semaineFin: s.semaineRecolteFin,
            semaineSemis: s.semaineSemis,
            semainePlantation: s.semainePlantation,
            duree: s.dureeOccupation
          })),
          
          totalPlanches: plan.calcul.totalPlanchesSaison
        }]);
      } catch (error) {
        console.error('Erreur génération plan:', error);
        // Fallback sur l'ancienne méthode si erreur
        const planchesRecommandees = calculerPlanchesRecommandees(culture);
        const duree = culture.fenetres.recolte.fin - culture.fenetres.recolte.debut;
        
        setCulturesSelectionnees([...culturesSelectionnees, {
          ...culture,
          planchesRecommandees,
          jardinId: jardins[0]?.id || 1,
          series: [{
            id: 1,
            planchesUtilisees: planchesRecommandees,
            semaineDebut: culture.fenetres.recolte.debut,
            semaineFin: culture.fenetres.recolte.fin,
            duree: duree
          }],
          totalPlanches: planchesRecommandees
        }]);
      }
    }
  };

  // NOUVEAU v4 : Ajouter une série à une culture existante
  const ajouterSerie = (cultureId) => {
    setCulturesSelectionnees(cultures => cultures.map(c => {
      if (c.id !== cultureId) return c;
      
      // Récupérer le jardin
      const jardin = jardins.find(j => j.id === c.jardinId);
      if (!jardin) {
        alert('⚠️ Jardin non trouvé');
        return c;
      }
      
      // Vérifier les planches disponibles
      const planchesDisponibles = jardin.nombrePlanches;
      const planchesUtilisees = c.totalPlanches;
      
      if (planchesUtilisees + c.planchesRecommandees > planchesDisponibles) {
        alert(`⚠️ Pas assez de place dans "${jardin.nom}" !\n\nDisponible : ${planchesDisponibles} planches\nDéjà utilisé : ${planchesUtilisees} planches\nBesoin : ${c.planchesRecommandees} planches\n\nLibérez de l'espace ou choisissez un autre jardin.`);
        return c;
      }
      
      // Calculer le décalage pour la nouvelle série
      const derniereSerie = c.series[c.series.length - 1];
      const duree = derniereSerie.semaineFin - derniereSerie.semaineDebut;
      
      // Décalage = 50% de la durée du cycle (rotation optimale)
      const decalage = Math.ceil(duree / 2);
      const nouvelleDebut = derniereSerie.semaineDebut + decalage;
      const nouvelleFin = nouvelleDebut + duree;
      
      // Vérifier si on dépasse la fin de saison
      if (nouvelleFin > 52) {
        alert(`⚠️ Pas assez de temps dans la saison !\n\nLa nouvelle série se terminerait en semaine ${nouvelleFin} (après S52).\n\nRéduisez le nombre de séries ou choisissez une culture plus courte.`);
        return c;
      }
      
      // Créer la nouvelle série
      const nouvelleSerie = {
        id: c.series.length + 1,
        planchesUtilisees: c.planchesRecommandees,
        semaineDebut: nouvelleDebut,
        semaineFin: nouvelleFin,
        duree: duree
      };
      
      return {
        ...c,
        series: [...c.series, nouvelleSerie],
        totalPlanches: c.totalPlanches + nouvelleSerie.planchesUtilisees
      };
    }));
  };

  // NOUVEAU v4 : Supprimer une série
  const supprimerSerie = (cultureId, serieId) => {
    setCulturesSelectionnees(cultures => cultures.map(c => {
      if (c.id !== cultureId) return c;
      
      // Ne pas supprimer s'il ne reste qu'une série
      if (c.series.length === 1) {
        alert('⚠️ Impossible de supprimer la dernière série. Retirez la culture entière si vous souhaitez la supprimer.');
        return c;
      }
      
      const serieASupprimer = c.series.find(s => s.id === serieId);
      const nouvellesSeries = c.series.filter(s => s.id !== serieId);
      
      return {
        ...c,
        series: nouvellesSeries,
        totalPlanches: c.totalPlanches - serieASupprimer.planchesUtilisees
      };
    }));
  };

  // NOUVEAU v4 : Modifier une série
  const modifierSerie = (cultureId, serieId, field, value) => {
    setCulturesSelectionnees(cultures => cultures.map(c => {
      if (c.id !== cultureId) return c;
      
      const nouvellesSeries = c.series.map(s => {
        if (s.id !== serieId) return s;
        
        if (field === 'planchesUtilisees') {
          return { ...s, planchesUtilisees: parseInt(value) || 0 };
        }
        
        return s;
      });
      
      const nouveauTotal = nouvellesSeries.reduce((sum, s) => sum + s.planchesUtilisees, 0);
      
      return {
        ...c,
        series: nouvellesSeries,
        totalPlanches: nouveauTotal
      };
    }));
  };

  const retirerCulture = (id) => {
    setCulturesSelectionnees(culturesSelectionnees.filter(c => c.id !== id));
  };

  const modifierCulture = (id, field, value) => {
    setCulturesSelectionnees(culturesSelectionnees.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  return (
    <div className="space-y-6">
      {/* Sélection */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cultures Disponibles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cultures.map(culture => {
            const isSelected = culturesSelectionnees.find(c => c.id === culture.id);
            if (isSelected) return null;
            
            return (
              <button
                key={culture.id}
                onClick={() => ajouterCulture(culture)}
                className="p-4 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:shadow-lg transition-all text-left bg-gradient-to-br from-white to-gray-50"
              >
                <div className="font-semibold text-gray-900 mb-1">{culture.nom}</div>
                <div className="text-xs text-gray-600">{culture.categorie}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des cultures sélectionnées */}
      {culturesSelectionnees.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
            Cultures Sélectionnées ({culturesSelectionnees.length})
          </h3>
          
          <div className="space-y-6">
            {culturesSelectionnees.map(culture => {
              const jardin = jardins.find(j => j.id === culture.jardinId);
              const planchesDisponibles = jardin ? jardin.nombrePlanches : 0;
              const tauxOccupation = (culture.totalPlanches / planchesDisponibles) * 100;
              
              return (
                <div key={culture.id} className="border-2 border-gray-300 p-5 rounded-lg bg-gradient-to-r from-white to-gray-50">
                  {/* En-tête culture */}
                  <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-gray-200">
                    <div>
                      <h4 className="font-bold text-xl text-gray-900">{culture.nom}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {culture.categorie} • {culture.series.length} série{culture.series.length > 1 ? 's' : ''} • 
                        Total: {culture.totalPlanches} planches
                      </p>
                    </div>
                    <button
                      onClick={() => retirerCulture(culture.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
                      title="Retirer la culture"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Jardin et occupation */}
                  <div className="mb-4 bg-blue-50 p-3 rounded-md border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Jardin assigné :</label>
                      <select
                        value={culture.jardinId}
                        onChange={(e) => modifierCulture(culture.id, 'jardinId', parseInt(e.target.value))}
                        className="px-3 py-1 border-2 border-gray-300 rounded-md font-medium hover:border-blue-500 focus:border-blue-600 transition-colors"
                      >
                        {jardins.map(j => (
                          <option key={j.id} value={j.id}>{j.nom} ({j.nombrePlanches} pl.)</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            tauxOccupation > 100 ? 'bg-red-500' : 
                            tauxOccupation > 80 ? 'bg-orange-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(tauxOccupation, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${
                        tauxOccupation > 100 ? 'text-red-600' : 
                        tauxOccupation > 80 ? 'text-orange-600' : 
                        'text-green-600'
                      }`}>
                        {tauxOccupation.toFixed(0)}%
                      </span>
                    </div>
                    
                    {tauxOccupation > 100 && (
                      <div className="mt-2 flex items-start space-x-2 text-red-700 bg-red-100 p-2 rounded-md">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p className="text-xs">
                          <strong>⚠️ Dépassement:</strong> Vous utilisez plus de planches que disponible dans ce jardin !
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 🆕 NOUVEAU V9 : PLANIFICATION PROFESSIONNELLE */}
                  {culture.planComplet && (
                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md border-2 border-blue-300">
                      <h6 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                        📊 Planification Professionnelle
                      </h6>
                      
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Besoin/semaine:</p>
                          <p className="text-lg font-bold text-blue-600">
                            {culture.planComplet.besoinHebdo.toFixed(1)} kg
                          </p>
                        </div>
                        
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Rendement net/planche:</p>
                          <p className="text-lg font-bold text-green-600">
                            {culture.planComplet.calcul.rendementNet.toFixed(1)} kg
                          </p>
                          <p className="text-xs text-gray-500">(marge -30%)</p>
                        </div>
                        
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">⭐ Planches simultanées:</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {culture.planComplet.resume.planchesSimultanees}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-gray-600">Série:</p>
                          <p className="font-bold text-gray-800">
                            {culture.planComplet.resume.planchesParSerie} planches
                          </p>
                        </div>
                        
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-gray-600">Fréquence:</p>
                          <p className="font-bold text-gray-800">
                            Toutes les {culture.planComplet.resume.frequence} sem.
                          </p>
                        </div>
                        
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-gray-600">Fenêtre récolte:</p>
                          <p className="font-bold text-gray-800">
                            {culture.planComplet.resume.fenetreRecolte} jours
                          </p>
                        </div>
                        
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-gray-600">Total saison:</p>
                          <p className="font-bold text-green-600">
                            {culture.planComplet.resume.totalPlanches} planches
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 🆕 NOUVEAU V9 : PLANNING DE SEMIS ÉCHELONNÉS */}
                  {culture.planComplet && culture.series && (
                    <div className="mt-4 bg-purple-50 p-4 rounded-md border-2 border-purple-300">
                      <h6 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                        📅 Planning de Semis Échelonnés ({culture.series.length} séries)
                      </h6>
                      
                      <div className="space-y-2">
                        {culture.series.map((serie) => (
                          <div key={serie.id} className="bg-white p-3 rounded border border-purple-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-purple-800">Série {serie.id}</span>
                              <span className="text-sm font-semibold text-gray-700">
                                {serie.planchesUtilisees} planches
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-gray-600">Semis :</p>
                                <p className="font-semibold text-gray-800">Semaine {serie.semaineSemis}</p>
                              </div>
                              
                              <div>
                                <p className="text-gray-600">Plantation :</p>
                                <p className="font-semibold text-gray-800">Semaine {serie.semainePlantation}</p>
                              </div>
                              
                              <div>
                                <p className="text-gray-600">Récolte :</p>
                                <p className="font-semibold text-green-600">
                                  Semaines {serie.semaineDebut}-{serie.semaineFin}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-xs text-gray-600">
                              Durée occupation : {serie.duree} semaines
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 🆕 NOUVEAU V9 : BESOINS EN INTRANTS */}
                  {culture.planComplet && (
                    <div className="mt-4 bg-yellow-50 p-4 rounded-md border-2 border-yellow-300">
                      <h6 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                        🌱 Besoins en Intrants pour la Saison
                      </h6>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Plants nécessaires:</p>
                          <p className="text-lg font-bold text-green-600">
                            {culture.planComplet.intrants.plantsNecessaires}
                          </p>
                        </div>
                        
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Plants à préparer:</p>
                          <p className="text-lg font-bold text-blue-600">
                            {culture.planComplet.intrants.plantsAPreparer}
                          </p>
                          <p className="text-xs text-gray-500">(+20% marge)</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Graines à semer:</p>
                          <p className="text-sm font-bold text-gray-800">
                            {culture.planComplet.intrants.grainesASemer}
                            <span className="text-xs text-gray-600 ml-1">
                              ({culture.planComplet.intrants.poidsGraines}g)
                            </span>
                          </p>
                        </div>
                        
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Substrat:</p>
                          <p className="text-sm font-bold text-gray-800">
                            {culture.planComplet.intrants.substratLitres}L
                            <span className="text-xs text-gray-600 ml-1">
                              ({culture.planComplet.intrants.nombreBacs} bacs)
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-green-100 p-2 rounded border border-green-300">
                        <p className="text-sm font-bold text-green-800">
                          Coût estimé : {culture.planComplet.intrants.couts.total} €
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Graines: {culture.planComplet.intrants.couts.graines}€ • 
                          Substrat: {culture.planComplet.intrants.couts.substrat}€
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 🆕 NOUVEAU V9 : ALERTES DE VALIDATION */}
                  {culture.validation && culture.validation.alertes.length > 0 && (
                    <div className="mt-4">
                      {culture.validation.alertes.map((alerte, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-md border-2 mb-2 ${
                            alerte.type === 'erreur' 
                              ? 'bg-red-100 border-red-400 text-red-800'
                              : 'bg-yellow-100 border-yellow-400 text-yellow-800'
                          }`}
                        >
                          <p className="text-sm font-semibold">
                            {alerte.type === 'erreur' ? '❌' : '⚠️'} {alerte.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* NOUVEAU v4 : Liste des séries (conservée pour édition manuelle) */}
                  <div className="mt-4 space-y-3">
                    <h6 className="text-sm font-bold text-gray-800">🔧 Édition Manuelle des Séries</h6>
                    {culture.series.map((serie, index) => (
                      <div key={serie.id} className="bg-white p-4 rounded-md border-2 border-gray-200 hover:border-green-300 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-semibold text-gray-800">
                            Série {serie.id} {index === 0 && '(principale)'}
                          </h5>
                          {culture.series.length > 1 && (
                            <button
                              onClick={() => supprimerSerie(culture.id, serie.id)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                              title="Supprimer cette série"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Planches utilisées
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={serie.planchesUtilisees}
                              onChange={(e) => modifierSerie(culture.id, serie.id, 'planchesUtilisees', e.target.value)}
                              className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-md font-medium focus:border-green-500 transition-colors"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Période
                            </label>
                            <div className="px-2 py-1.5 bg-gray-100 rounded-md text-center font-medium text-sm">
                              S{serie.semaineDebut} → S{serie.semaineFin}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Durée
                            </label>
                            <div className="px-2 py-1.5 bg-purple-100 text-purple-800 rounded-md text-center font-bold text-sm">
                              {serie.duree} sem.
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* NOUVEAU v4 : Bouton ajouter série */}
                  <div className="mt-4 pt-3 border-t-2 border-gray-200">
                    <button
                      onClick={() => ajouterSerie(culture.id)}
                      className="w-full bg-green-100 hover:bg-green-200 text-green-800 py-2.5 px-4 rounded-md font-semibold transition-colors flex items-center justify-center space-x-2 border-2 border-green-300 hover:border-green-400"
                    >
                      <Copy className="w-5 h-5" />
                      <span>➕ Ajouter une série (décalage automatique)</span>
                    </button>
                    
                    <div className="mt-2 bg-blue-50 p-2 rounded-md border border-blue-200">
                      <p className="text-xs text-blue-900">
                        <strong>💡 Info :</strong> Chaque série supplémentaire augmentera votre production et votre CA. 
                        Le décalage est calculé automatiquement pour optimiser la rotation.
                      </p>
                    </div>
                  </div>

                  {/* Récapitulatif production estimée */}
                  <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-md border border-gray-300">
                    <h6 className="text-xs font-bold text-gray-700 mb-2">📊 Production Estimée Totale</h6>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-gray-600">Planches recommandées:</p>
                        <p className="font-bold text-green-600">{culture.planchesRecommandees}</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-gray-600">Planches utilisées:</p>
                        <p className="font-bold text-blue-600">{culture.totalPlanches}</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-gray-600">Nombre de séries:</p>
                        <p className="font-bold text-purple-600">{culture.series.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionCultures;
