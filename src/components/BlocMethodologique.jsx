// BlocMethodologique.jsx - Explication du calcul des planches
// 🎓 Transparence sur la méthodologie pour l'utilisateur

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, ChevronDown, ChevronRight, Calculator, 
  Leaf, TrendingUp, RefreshCw, Info, Award
} from 'lucide-react';
import { NIVEAUX_MATURITE } from '../utils/constantes';

const BlocMethodologique = ({ niveauMaturite = 'debutant', exemplesCultures = [] }) => {
  // Mémoriser si l'utilisateur a déjà vu le bloc (fermer par défaut ensuite)
  const [isOpen, setIsOpen] = useState(() => {
    const hasSeenBefore = localStorage.getItem('methodologie_vue');
    return !hasSeenBefore; // Ouvert par défaut la première fois
  });

  // Marquer comme vu quand fermé pour la première fois
  useEffect(() => {
    if (!isOpen) {
      localStorage.setItem('methodologie_vue', 'true');
    }
  }, [isOpen]);

  const niveauConfig = NIVEAUX_MATURITE[niveauMaturite] || NIVEAUX_MATURITE.debutant;
  const coefficient = niveauConfig.coefficient;

  // Exemple de calcul avec les tomates
  const exempleTomate = {
    besoin: 1500,
    rendementCharte: 917,
    rendementAjuste: Math.round(917 * coefficient),
    rotations: 1,
    planchesCalculees: Math.ceil(1500 / (917 * coefficient * 1))
  };

  // Exemple avec les radis (rotation rapide)
  const exempleRadis = {
    besoin: 800,
    rendementCharte: 150, // bottes
    rendementAjuste: Math.round(150 * coefficient),
    rotations: 4,
    planchesCalculees: Math.ceil(800 / (150 * coefficient * 4))
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
      {/* En-tête cliquable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800">
              📐 Comment sont calculées les planches ?
            </h3>
            <p className="text-sm text-gray-500">
              Comprendre la méthodologie de calcul
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isOpen && (
            <span className="text-xs text-gray-400 hidden sm:inline">
              Cliquez pour développer
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Contenu développé */}
      {isOpen && (
        <div className="px-5 pb-5 border-t border-gray-100">
          
          {/* Introduction */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <Info className="w-4 h-4 inline mr-2" />
              Le nombre de planches nécessaires pour chaque culture est calculé automatiquement 
              en fonction de <strong>4 facteurs</strong> clés. Voici comment ça fonctionne :
            </p>
          </div>

          {/* Les 4 facteurs */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Facteur 1 : Besoin */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">1</span>
                <h4 className="font-semibold text-gray-800">Votre BESOIN (kg ou bottes)</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Calculé depuis l'onglet <strong>Marché</strong>. C'est la quantité totale de légumes 
                nécessaire pour remplir tous vos paniers sur la saison (21 semaines).
              </p>
              <div className="text-xs bg-white p-2 rounded border border-gray-200 font-mono">
                Exemple : 25 AMAP + 20 marché = {exempleTomate.besoin} kg de tomates/saison
              </div>
            </div>

            {/* Facteur 2 : Rendement */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</span>
                <h4 className="font-semibold text-gray-800">Le RENDEMENT par planche</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Issu des <strong>chartes de l'Institut Jardinier Maraîcher</strong>. 
                C'est ce qu'un expert peut récolter sur une planche de 30m.
              </p>
              <div className="text-xs bg-white p-2 rounded border border-gray-200 font-mono">
                Exemple : Tomates = {exempleTomate.rendementCharte} kg / planche 30m (référence)
              </div>
            </div>

            {/* Facteur 3 : Niveau */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">3</span>
                <h4 className="font-semibold text-gray-800">Votre NIVEAU de maturité</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Ajuste le rendement selon votre expérience. Un débutant ne peut pas 
                atteindre les rendements d'un expert dès la première année.
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-xs">
                  <span>🌱</span>
                  <span className="text-gray-600">Débutant: ×0.70</span>
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <span>🌿</span>
                  <span className="text-gray-600">Junior: ×0.85</span>
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <span>🌳</span>
                  <span className="text-gray-600">Expert: ×1.00</span>
                </div>
              </div>
              <div className="mt-2 p-2 rounded text-xs font-medium"
                style={{ 
                  backgroundColor: niveauConfig.couleur + '20',
                  color: niveauConfig.couleur
                }}
              >
                Votre niveau : {niveauConfig.icone} {niveauConfig.label} → Rendement × {coefficient}
              </div>
            </div>

            {/* Facteur 4 : Rotations */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">4</span>
                <h4 className="font-semibold text-gray-800">Les ROTATIONS possibles</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Combien de cycles de culture peut-on faire sur une même planche 
                pendant la saison ? Les cultures rapides permettent plusieurs récoltes.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  🏠 Tomates: 1 cycle
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  🔄 Courgettes: 2 cycles
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  ⚡ Radis: 4 cycles
                </span>
              </div>
            </div>
          </div>

          {/* Formule */}
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-indigo-800">LA FORMULE</h4>
            </div>
            <div className="bg-white p-4 rounded-lg border border-indigo-200 text-center">
              <p className="font-mono text-lg text-gray-800">
                <span className="text-green-600">Planches</span> = 
                <span className="text-blue-600"> Besoin</span> ÷ 
                (<span className="text-purple-600">Rendement</span> × 
                <span className="text-orange-600">Coefficient</span> × 
                <span className="text-pink-600">Rotations</span>)
              </p>
            </div>
          </div>

          {/* Exemples concrets */}
          <div className="mt-6">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Exemples Concrets (niveau {niveauConfig.label})
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exemple Tomates */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-800 mb-2">🍅 Tomates (cycle long)</h5>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    Besoin : <strong>{exempleTomate.besoin} kg</strong>
                  </p>
                  <p className="text-gray-700">
                    Rendement charte : {exempleTomate.rendementCharte} kg × {coefficient} = <strong>{exempleTomate.rendementAjuste} kg</strong>
                  </p>
                  <p className="text-gray-700">
                    Rotations : <strong>{exempleTomate.rotations} cycle</strong>
                  </p>
                  <div className="mt-2 p-2 bg-white rounded border border-red-200">
                    <p className="font-mono text-sm">
                      {exempleTomate.besoin} ÷ ({exempleTomate.rendementAjuste} × {exempleTomate.rotations}) = <strong className="text-red-600">{exempleTomate.planchesCalculees} planches</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Exemple Radis */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-800 mb-2">🥕 Radis (cycle rapide)</h5>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    Besoin : <strong>{exempleRadis.besoin} bottes</strong>
                  </p>
                  <p className="text-gray-700">
                    Rendement charte : {exempleRadis.rendementCharte} bt × {coefficient} = <strong>{exempleRadis.rendementAjuste} bt</strong>
                  </p>
                  <p className="text-gray-700">
                    Rotations : <strong>{exempleRadis.rotations} cycles</strong> (on peut replanter 4 fois !)
                  </p>
                  <div className="mt-2 p-2 bg-white rounded border border-green-200">
                    <p className="font-mono text-sm">
                      {exempleRadis.besoin} ÷ ({exempleRadis.rendementAjuste} × {exempleRadis.rotations}) = <strong className="text-green-600">{exempleRadis.planchesCalculees} planches</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Astuce */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>💡 Astuce :</strong> Les cultures à rotations multiples (radis, mesclun) sont plus 
              "rentables" en termes de planches car une seule planche produit plusieurs fois. 
              C'est pourquoi le mode Bio-Intensif privilégie l'intercalage de ces cultures rapides !
            </p>
          </div>

          {/* Lien vers la source */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Méthodologie basée sur les chartes de l'Institut Jardinier Maraîcher (IJM) 🇨🇦
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlocMethodologique;
