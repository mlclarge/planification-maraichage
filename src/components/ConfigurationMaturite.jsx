// ConfigurationMaturite.jsx
// ===========================
// Composant pour configurer le niveau de maturité de l'exploitation
// Ce paramètre affecte tous les calculs de rendement (coefficient global)

import React from 'react';
import { NIVEAUX_MATURITE } from '../utils/constantes';
import { TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * Composant de configuration du niveau de maturité
 * Permet à l'utilisateur de définir son niveau d'expérience
 * 
 * @param {string} niveauMaturite - Niveau actuel ('debutant', 'junior', 'expert')
 * @param {Function} setNiveauMaturite - Fonction pour changer le niveau
 * @param {boolean} compact - Mode compact pour intégration dans header (optionnel)
 */
const ConfigurationMaturite = ({ niveauMaturite, setNiveauMaturite, compact = false }) => {
  
  // Mode compact pour affichage dans un header ou sidebar
  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Niveau :</span>
        <select
          value={niveauMaturite}
          onChange={(e) => setNiveauMaturite(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent"
          style={{ 
            backgroundColor: NIVEAUX_MATURITE[niveauMaturite]?.couleur + '20',
            borderColor: NIVEAUX_MATURITE[niveauMaturite]?.couleur
          }}
        >
          {Object.values(NIVEAUX_MATURITE).map((niveau) => (
            <option key={niveau.id} value={niveau.id}>
              {niveau.icone} {niveau.label} ({niveau.periode})
            </option>
          ))}
        </select>
        <span 
          className="px-2 py-1 rounded text-xs font-bold text-white"
          style={{ backgroundColor: NIVEAUX_MATURITE[niveauMaturite]?.couleur }}
        >
          ×{NIVEAUX_MATURITE[niveauMaturite]?.coefficient}
        </span>
      </div>
    );
  }
  
  // Mode complet avec cartes de sélection
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="w-6 h-6 text-green-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Niveau de Maturité de l'Exploitation
          </h2>
          <p className="text-gray-600 text-sm">
            Ce paramètre ajuste les rendements attendus selon votre expérience
          </p>
        </div>
      </div>
      
      {/* Explication */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Pourquoi ce paramètre est important ?</p>
            <p>
              Les rendements des chartes de l'Institut Jardinier Maraîcher sont des 
              <strong> rendements experts</strong> (cibles optimales). Un maraîcher débutant 
              peut s'attendre à 30% de moins, et un junior à 15% de moins. Ce coefficient 
              s'applique à <strong>tous les calculs de planches</strong> de l'application.
            </p>
          </div>
        </div>
      </div>
      
      {/* Cartes de sélection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.values(NIVEAUX_MATURITE).map((niveau) => {
          const isSelected = niveauMaturite === niveau.id;
          
          return (
            <button
              key={niveau.id}
              onClick={() => setNiveauMaturite(niveau.id)}
              className={`
                relative p-5 rounded-xl border-2 transition-all text-left
                ${isSelected 
                  ? 'border-4 shadow-lg scale-[1.02]' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
              style={{
                borderColor: isSelected ? niveau.couleur : undefined,
                backgroundColor: isSelected ? niveau.couleur + '10' : 'white'
              }}
            >
              {/* Badge sélectionné */}
              {isSelected && (
                <div 
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: niveau.couleur }}
                >
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
              
              {/* Icône et titre */}
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-3xl">{niveau.icone}</span>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{niveau.label}</h3>
                  <p className="text-sm text-gray-500">{niveau.periode}</p>
                </div>
              </div>
              
              {/* Coefficient */}
              <div 
                className="inline-block px-3 py-1 rounded-full text-white font-bold text-sm mb-3"
                style={{ backgroundColor: niveau.couleur }}
              >
                Coefficient : ×{niveau.coefficient}
              </div>
              
              {/* Description */}
              <p className="text-sm text-gray-600 mb-3">
                {niveau.description}
              </p>
              
              {/* Impact */}
              <div className="text-xs text-gray-500 bg-gray-100 rounded p-2">
                <strong>Impact :</strong> Rendements {niveau.coefficient === 1 
                  ? 'à 100% des chartes' 
                  : `minorés de ${Math.round((1 - niveau.coefficient) * 100)}%`
                }
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Conseils selon le niveau sélectionné */}
      <div 
        className="rounded-lg p-4 border-2"
        style={{ 
          backgroundColor: NIVEAUX_MATURITE[niveauMaturite]?.couleur + '10',
          borderColor: NIVEAUX_MATURITE[niveauMaturite]?.couleur + '40'
        }}
      >
        <h4 className="font-bold text-gray-900 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Conseils pour le niveau {NIVEAUX_MATURITE[niveauMaturite]?.label}
        </h4>
        <ul className="space-y-2">
          {NIVEAUX_MATURITE[niveauMaturite]?.conseils.map((conseil, index) => (
            <li key={index} className="flex items-start text-sm text-gray-700">
              <span className="mr-2 text-green-600">✓</span>
              {conseil}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Avertissement si débutant */}
      {niveauMaturite === 'debutant' && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Note pour les débutants</p>
              <p>
                Le coefficient de 0.70 peut sembler conservateur, mais il vous protège 
                des déceptions et vous permet de <strong>planifier de manière réaliste</strong>. 
                Si vos résultats sont meilleurs, vous aurez de bonnes surprises ! 
                Après 2-3 saisons, passez au niveau Junior.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Tableau comparatif d'impact */}
      <div className="mt-6">
        <h4 className="font-semibold text-gray-900 mb-3">
          📊 Impact sur quelques cultures (planche de 30m)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left border">Culture</th>
                <th className="px-3 py-2 text-right border">Rendement Charte</th>
                <th className="px-3 py-2 text-right border text-red-600">Débutant (×0.70)</th>
                <th className="px-3 py-2 text-right border text-orange-600">Junior (×0.85)</th>
                <th className="px-3 py-2 text-right border text-green-600">Expert (×1.00)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 border font-medium">🍅 Tomates</td>
                <td className="px-3 py-2 border text-right">917 kg</td>
                <td className="px-3 py-2 border text-right text-red-600 font-bold">642 kg</td>
                <td className="px-3 py-2 border text-right text-orange-600 font-bold">779 kg</td>
                <td className="px-3 py-2 border text-right text-green-600 font-bold">917 kg</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 border font-medium">🥕 Carottes</td>
                <td className="px-3 py-2 border text-right">106 bottes</td>
                <td className="px-3 py-2 border text-right text-red-600 font-bold">74 bottes</td>
                <td className="px-3 py-2 border text-right text-orange-600 font-bold">90 bottes</td>
                <td className="px-3 py-2 border text-right text-green-600 font-bold">106 bottes</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 border font-medium">🥬 Mesclun</td>
                <td className="px-3 py-2 border text-right">78 kg (3 coupes)</td>
                <td className="px-3 py-2 border text-right text-red-600 font-bold">55 kg</td>
                <td className="px-3 py-2 border text-right text-orange-600 font-bold">66 kg</td>
                <td className="px-3 py-2 border text-right text-green-600 font-bold">78 kg</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 border font-medium">🌱 Radis</td>
                <td className="px-3 py-2 border text-right">140 bottes</td>
                <td className="px-3 py-2 border text-right text-red-600 font-bold">98 bottes</td>
                <td className="px-3 py-2 border text-right text-orange-600 font-bold">119 bottes</td>
                <td className="px-3 py-2 border text-right text-green-600 font-bold">140 bottes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationMaturite;
