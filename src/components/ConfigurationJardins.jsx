// ConfigurationJardins.jsx V21 - Avec bouton DUPLIQUER
// 🆕 V21 : Bouton dupliquer pour améliorer l'UX

import React, { useState } from 'react';
import { Home, Plus, Trash2, ChevronDown, Copy } from 'lucide-react';

const ConfigurationJardins = ({ jardins, setJardins }) => {
  const [accordeonsOuverts, setAccordeonsOuverts] = useState({});
  
  const toggleAccordeon = (id) => {
    setAccordeonsOuverts(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const handleChange = (id, field, value) => {
    setJardins(jardins.map(j => 
      j.id === id ? { ...j, [field]: field === 'nombrePlanches' || field === 'longueurPlanche' ? parseFloat(value) || 0 : value } : j
    ));
  };

  const ajouterJardin = () => {
    const nouvelId = Math.max(...jardins.map(j => j.id), 0) + 1;
    setJardins([...jardins, {
      id: nouvelId,
      nom: `Jardin ${nouvelId}`,
      nombrePlanches: 10,
      longueurPlanche: 15,
      couleur: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
    }]);
    setAccordeonsOuverts(prev => ({ ...prev, [nouvelId]: true }));
  };

  // 🆕 V21 : Fonction de duplication
  const dupliquerJardin = (jardinSource) => {
    const nouvelId = Math.max(...jardins.map(j => j.id), 0) + 1;
    const nouveauJardin = {
      ...jardinSource,
      id: nouvelId,
      nom: `${jardinSource.nom} (copie)`,
      // Générer une couleur légèrement différente
      couleur: ajusterCouleur(jardinSource.couleur)
    };
    setJardins([...jardins, nouveauJardin]);
    setAccordeonsOuverts(prev => ({ ...prev, [nouvelId]: true }));
    
    // Scroll vers le nouveau jardin après un court délai
    setTimeout(() => {
      const element = document.getElementById(`jardin-${nouvelId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Fonction pour ajuster légèrement une couleur (pour la copie)
  const ajusterCouleur = (couleurHex) => {
    // Convertir hex en RGB
    const r = parseInt(couleurHex.slice(1, 3), 16);
    const g = parseInt(couleurHex.slice(3, 5), 16);
    const b = parseInt(couleurHex.slice(5, 7), 16);
    
    // Ajuster légèrement (décaler la teinte)
    const newR = Math.min(255, Math.max(0, r + 30));
    const newG = Math.min(255, Math.max(0, g - 20));
    const newB = Math.min(255, Math.max(0, b + 10));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const supprimerJardin = (id) => {
    if (jardins.length > 1) {
      setJardins(jardins.filter(j => j.id !== id));
    } else if (jardins.length === 1) {
      // Dernier jardin : on le supprime quand même (V21: pas de jardins par défaut)
      setJardins([]);
    }
  };

  const totalPlanches = jardins.reduce((sum, j) => sum + j.nombrePlanches, 0);
  const surfaceTotale = jardins.reduce((sum, j) => sum + (j.nombrePlanches * j.longueurPlanche * 0.8), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Home className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Configuration des Jardins</h2>
          </div>
          <button 
            onClick={ajouterJardin} 
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 shadow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Ajouter un jardin</span>
          </button>
        </div>

        {/* 🆕 V21 : Message si aucun jardin */}
        {jardins.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🏡</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun jardin configuré</h3>
            <p className="text-gray-500 mb-6">
              Commencez par ajouter vos parcelles et planches de culture.
            </p>
            <button 
              onClick={ajouterJardin}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer mon premier jardin
            </button>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <div className="text-3xl mb-1">🏡</div>
                <div className="text-2xl font-bold">{jardins.length}</div>
                <div className="text-purple-100 text-xs">Jardins</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                <div className="text-3xl mb-1">📏</div>
                <div className="text-2xl font-bold">{totalPlanches}</div>
                <div className="text-green-100 text-xs">Planches</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <div className="text-3xl mb-1">🌱</div>
                <div className="text-2xl font-bold">{surfaceTotale.toFixed(0)}</div>
                <div className="text-blue-100 text-xs">m² cultivés</div>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-4 text-white shadow-lg">
                <div className="text-3xl mb-1">🌟</div>
                <div className="text-2xl font-bold">{(surfaceTotale * 35).toFixed(0)}€</div>
                <div className="text-orange-100 text-xs">CA Junior</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl p-4 text-white shadow-lg">
                <div className="text-3xl mb-1">🏆</div>
                <div className="text-2xl font-bold">{(surfaceTotale * 55).toFixed(0)}€</div>
                <div className="text-yellow-100 text-xs">CA Expert</div>
              </div>
            </div>
            <p className="text-gray-600 text-sm">💡 Organisez vos planches en jardins (rotation, type, localisation)</p>
          </>
        )}
      </div>

      {/* Liste jardins avec accordéons */}
      {jardins.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Vos Jardins ({jardins.length})</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => { const o = {}; jardins.forEach(j => o[j.id] = true); setAccordeonsOuverts(o); }} 
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                📂 Tout ouvrir
              </button>
              <button 
                onClick={() => setAccordeonsOuverts({})} 
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                📁 Tout fermer
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {jardins.map((jardin) => {
              const surface = jardin.nombrePlanches * jardin.longueurPlanche * 0.8;
              const isOpen = accordeonsOuverts[jardin.id];
              
              return (
                <div 
                  key={jardin.id} 
                  id={`jardin-${jardin.id}`}
                  className="border-2 rounded-xl overflow-hidden transition-all" 
                  style={{ borderColor: jardin.couleur + '80' }}
                >
                  {/* Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between" 
                    style={{ backgroundColor: jardin.couleur + '10' }} 
                    onClick={() => toggleAccordeon(jardin.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow" 
                        style={{ backgroundColor: jardin.couleur }}
                      >
                        {jardin.nom.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{jardin.nom}</h4>
                        <p className="text-sm text-gray-500">
                          {jardin.nombrePlanches} pl. × {jardin.longueurPlanche}m • {surface.toFixed(0)} m²
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span 
                        className="px-3 py-1 bg-white rounded-full text-sm font-bold shadow-sm" 
                        style={{ color: jardin.couleur }}
                      >
                        {(surface * 35).toFixed(0)}€
                      </span>
                      <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  
                  {/* Contenu */}
                  {isOpen && (
                    <div className="p-4 border-t bg-white" style={{ borderColor: jardin.couleur + '30' }}>
                      <div className="mb-4">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Nom du jardin</label>
                        <input 
                          type="text" 
                          value={jardin.nom} 
                          onChange={(e) => handleChange(jardin.id, 'nom', e.target.value)} 
                          onClick={(e) => e.stopPropagation()} 
                          className="text-lg font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full focus:border-green-500 focus:outline-none" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Nombre de planches</label>
                          <div className="flex items-center justify-center space-x-3">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleChange(jardin.id, 'nombrePlanches', Math.max(0, jardin.nombrePlanches - 1)); }} 
                              className="w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600 font-bold text-xl shadow transition-colors"
                            >
                              −
                            </button>
                            <input 
                              type="number" 
                              min="0" 
                              value={jardin.nombrePlanches} 
                              onChange={(e) => handleChange(jardin.id, 'nombrePlanches', e.target.value)} 
                              onClick={(e) => e.stopPropagation()} 
                              className="w-20 text-center text-2xl font-bold border-0 bg-transparent focus:outline-none" 
                            />
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleChange(jardin.id, 'nombrePlanches', jardin.nombrePlanches + 1); }} 
                              className="w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 font-bold text-xl shadow transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Longueur planches</label>
                          <div className="flex space-x-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleChange(jardin.id, 'longueurPlanche', 15); }} 
                              className={`flex-1 py-2 rounded-lg font-bold transition-all ${jardin.longueurPlanche === 15 ? 'bg-green-600 text-white shadow' : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-400'}`}
                            >
                              15m
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleChange(jardin.id, 'longueurPlanche', 30); }} 
                              className={`flex-1 py-2 rounded-lg font-bold transition-all ${jardin.longueurPlanche === 30 ? 'bg-green-600 text-white shadow' : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-400'}`}
                            >
                              30m
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border">
                        <div className="flex space-x-4 text-center">
                          <div>
                            <div className="text-xl font-bold text-green-600">{surface.toFixed(0)}</div>
                            <div className="text-xs text-gray-600">m²</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-blue-600">{jardin.nombrePlanches * jardin.longueurPlanche}</div>
                            <div className="text-xs text-gray-600">ml</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-purple-600">{(surface * 35).toFixed(0)}€</div>
                            <div className="text-xs text-gray-600">CA Junior</div>
                          </div>
                        </div>
                        
                        {/* 🆕 V21 : Boutons d'action avec DUPLIQUER */}
                        <div className="flex items-center space-x-2">
                          <input 
                            type="color" 
                            value={jardin.couleur} 
                            onChange={(e) => handleChange(jardin.id, 'couleur', e.target.value)} 
                            onClick={(e) => e.stopPropagation()} 
                            className="w-10 h-10 rounded-full cursor-pointer border-2 border-white shadow" 
                            title="Changer la couleur"
                          />
                          
                          {/* 🆕 V21 : Bouton DUPLIQUER */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); dupliquerJardin(jardin); }} 
                            className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 flex items-center justify-center transition-colors"
                            title="Dupliquer ce jardin"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          
                          {/* Bouton Supprimer */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); supprimerJardin(jardin.id); }} 
                            className="w-10 h-10 bg-red-100 text-red-600 rounded-full hover:bg-red-200 flex items-center justify-center transition-colors"
                            title="Supprimer ce jardin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* 🆕 V21 : Bouton ajouter en bas de liste pour meilleure UX */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button 
              onClick={ajouterJardin}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all flex items-center justify-center font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un autre jardin
            </button>
          </div>
        </div>
      )}

      {/* Paliers */}
      {jardins.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Paliers de Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">⚠️</span>
                <h4 className="font-bold text-red-800">Minimum: 15 €/m²</h4>
              </div>
              <p className="text-xs text-red-700">Seuil de viabilité</p>
              <div className="mt-2 text-lg font-bold text-red-800">{(surfaceTotale * 15).toFixed(0)} €</div>
            </div>
            <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">🌟</span>
                <h4 className="font-bold text-orange-800">Junior: 35 €/m²</h4>
              </div>
              <p className="text-xs text-orange-700">Cible 1ère année</p>
              <div className="mt-2 text-lg font-bold text-orange-800">{(surfaceTotale * 35).toFixed(0)} €</div>
            </div>
            <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">🏆</span>
                <h4 className="font-bold text-yellow-800">Expert: 55 €/m²</h4>
              </div>
              <p className="text-xs text-yellow-700">Objectif 3-5 ans</p>
              <div className="mt-2 text-lg font-bold text-yellow-800">{(surfaceTotale * 55).toFixed(0)} €</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationJardins;
