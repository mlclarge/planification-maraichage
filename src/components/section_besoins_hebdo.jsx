      {/* 🆕 NOUVEAU : Production Hebdomadaire par Légume (unités réelles) */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">🥕</span>
          Production Hebdomadaire par Légume (unités réelles)
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          Quantités moyennes hebdomadaires calculées sur la période de récolte de chaque légume. Les unités correspondent aux formats de vente : kg pour les légumes pesés, bottes pour les légumes-racines fraîches, pièces pour les fruits-légumes à l'unité.
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
                  let total = 0;
                  let count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const besoins = calculerBesoinHebdo(marcheValide, s);
                    if (besoins.tomate && besoins.tomate.total > 0) {
                      total += besoins.tomate.total;
                      count++;
                    }
                  }
                  return count > 0 ? (total / count).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">kg/semaine</p>
              <p className="text-xs text-gray-600 mt-1">≈ {(((() => {
                let total = 0;
                let count = 0;
                for (let s = 18; s <= 38; s++) {
                  const besoins = calculerBesoinHebdo(marcheValide, s);
                  if (besoins.tomate && besoins.tomate.total > 0) {
                    total += besoins.tomate.total;
                    count++;
                  }
                }
                return count > 0 ? total / count : 0;
              })()) * 20).toFixed(0)} kg</p>
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
                  let total = 0;
                  let count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const besoins = calculerBesoinHebdo(marcheValide, s);
                    if (besoins.courgette && besoins.courgette.total > 0) {
                      total += besoins.courgette.total;
                      count++;
                    }
                  }
                  return count > 0 ? (total / count).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">kg/semaine</p>
              <p className="text-xs text-gray-600 mt-1">≈ {(((() => {
                let total = 0;
                let count = 0;
                for (let s = 18; s <= 38; s++) {
                  const besoins = calculerBesoinHebdo(marcheValide, s);
                  if (besoins.courgette && besoins.courgette.total > 0) {
                    total += besoins.courgette.total;
                    count++;
                  }
                }
                return count > 0 ? total / count : 0;
              })()) * 20).toFixed(0)} kg</p>
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
                  let total = 0;
                  let count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const besoins = calculerBesoinHebdo(marcheValide, s);
                    if (besoins.concombre && besoins.concombre.total > 0) {
                      total += besoins.concombre.total;
                      count++;
                    }
                  }
                  return count > 0 ? ((total / count) / 0.4).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">pièces/semaine</p>
              <p className="text-xs text-gray-600 mt-1">≈ {(((() => {
                let total = 0;
                let count = 0;
                for (let s = 18; s <= 38; s++) {
                  const besoins = calculerBesoinHebdo(marcheValide, s);
                  if (besoins.concombre && besoins.concombre.total > 0) {
                    total += besoins.concombre.total;
                    count++;
                  }
                }
                return count > 0 ? total / count : 0;
              })()) * 20).toFixed(0)} kg</p>
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
                  let total = 0;
                  let count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const besoins = calculerBesoinHebdo(marcheValide, s);
                    if (besoins.aubergine && besoins.aubergine.total > 0) {
                      total += besoins.aubergine.total;
                      count++;
                    }
                  }
                  return count > 0 ? (total / count).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">kg/semaine</p>
              <p className="text-xs text-gray-600 mt-1">≈ {(((() => {
                let total = 0;
                let count = 0;
                for (let s = 18; s <= 38; s++) {
                  const besoins = calculerBesoinHebdo(marcheValide, s);
                  if (besoins.aubergine && besoins.aubergine.total > 0) {
                    total += besoins.aubergine.total;
                    count++;
                  }
                }
                return count > 0 ? total / count : 0;
              })()) * 20).toFixed(0)} kg</p>
            </div>
          </div>

          {/* Haricots */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🫘</span>
              <h4 className="font-bold text-gray-800">Haricots (grimpants)</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">
                {(() => {
                  let total = 0;
                  let count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const besoins = calculerBesoinHebdo(marcheValide, s);
                    if (besoins.haricot && besoins.haricot.total > 0) {
                      total += besoins.haricot.total;
                      count++;
                    }
                  }
                  return count > 0 ? (total / count).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">kg/semaine</p>
              <p className="text-xs text-gray-600 mt-1">≈ {(((() => {
                let total = 0;
                let count = 0;
                for (let s = 18; s <= 38; s++) {
                  const besoins = calculerBesoinHebdo(marcheValide, s);
                  if (besoins.haricot && besoins.haricot.total > 0) {
                    total += besoins.haricot.total;
                    count++;
                  }
                }
                return count > 0 ? total / count : 0;
              })()) * 20).toFixed(0)} kg</p>
            </div>
          </div>

          {/* Mesclun */}
          <div className="bg-gradient-to-br from-lime-50 to-lime-100 rounded-lg p-4 border-2 border-lime-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🥗</span>
              <h4 className="font-bold text-gray-800">Mesclun (Salanova)</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-lime-600">
                {(() => {
                  let total = 0;
                  let count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const besoins = calculerBesoinHebdo(marcheValide, s);
                    if (besoins.mesclun && besoins.mesclun.total > 0) {
                      total += besoins.mesclun.total;
                      count++;
                    }
                  }
                  return count > 0 ? (total / count).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">kg/semaine</p>
              <p className="text-xs text-gray-600 mt-1">≈ {(((() => {
                let total = 0;
                let count = 0;
                for (let s = 18; s <= 38; s++) {
                  const besoins = calculerBesoinHebdo(marcheValide, s);
                  if (besoins.mesclun && besoins.mesclun.total > 0) {
                    total += besoins.mesclun.total;
                    count++;
                  }
                }
                return count > 0 ? total / count : 0;
              })()) * 20).toFixed(0)} kg</p>
            </div>
          </div>

          {/* Verdurettes */}
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border-2 border-teal-200">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🌿</span>
              <h4 className="font-bold text-gray-800">Verdurettes (Roquette/Tatsoi)</h4>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-teal-600">
                {(() => {
                  let total = 0;
                  let count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const besoins = calculerBesoinHebdo(marcheValide, s);
                    if (besoins.verdurette && besoins.verdurette.total > 0) {
                      total += besoins.verdurette.total;
                      count++;
                    }
                  }
                  return count > 0 ? (total / count).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">kg/semaine</p>
              <p className="text-xs text-gray-600 mt-1">≈ {(((() => {
                let total = 0;
                let count = 0;
                for (let s = 18; s <= 38; s++) {
                  const besoins = calculerBesoinHebdo(marcheValide, s);
                  if (besoins.verdurette && besoins.verdurette.total > 0) {
                    total += besoins.verdurette.total;
                    count++;
                  }
                }
                return count > 0 ? total / count : 0;
              })()) * 20).toFixed(0)} kg</p>
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
                  let total = 0;
                  let count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const besoins = calculerBesoinHebdo(marcheValide, s);
                    if (besoins.carotte && besoins.carotte.total > 0) {
                      total += besoins.carotte.total;
                      count++;
                    }
                  }
                  return count > 0 ? ((total / count) / 0.8).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">bottes/semaine</p>
              <p className="text-xs text-gray-600 mt-1">≈ {(((() => {
                let total = 0;
                let count = 0;
                for (let s = 18; s <= 38; s++) {
                  const besoins = calculerBesoinHebdo(marcheValide, s);
                  if (besoins.carotte && besoins.carotte.total > 0) {
                    total += besoins.carotte.total;
                    count++;
                  }
                }
                return count > 0 ? total / count : 0;
              })()) * 20).toFixed(0)} kg</p>
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
                  let total = 0;
                  let count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const besoins = calculerBesoinHebdo(marcheValide, s);
                    if (besoins.betterave && besoins.betterave.total > 0) {
                      total += besoins.betterave.total;
                      count++;
                    }
                  }
                  return count > 0 ? ((total / count) / 0.6).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">bottes/semaine</p>
              <p className="text-xs text-gray-600 mt-1">≈ {(((() => {
                let total = 0;
                let count = 0;
                for (let s = 18; s <= 38; s++) {
                  const besoins = calculerBesoinHebdo(marcheValide, s);
                  if (besoins.betterave && besoins.betterave.total > 0) {
                    total += besoins.betterave.total;
                    count++;
                  }
                }
                return count > 0 ? total / count : 0;
              })()) * 20).toFixed(0)} kg</p>
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
                  let total = 0;
                  let count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const besoins = calculerBesoinHebdo(marcheValide, s);
                    if (besoins.radis && besoins.radis.total > 0) {
                      total += besoins.radis.total;
                      count++;
                    }
                  }
                  return count > 0 ? ((total / count) / 0.3).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">bottes/semaine</p>
              <p className="text-xs text-gray-600 mt-1">≈ {(((() => {
                let total = 0;
                let count = 0;
                for (let s = 18; s <= 38; s++) {
                  const besoins = calculerBesoinHebdo(marcheValide, s);
                  if (besoins.radis && besoins.radis.total > 0) {
                    total += besoins.radis.total;
                    count++;
                  }
                }
                return count > 0 ? total / count : 0;
              })()) * 20).toFixed(0)} kg</p>
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
                  let total = 0;
                  let count = 0;
                  for (let s = 18; s <= 38; s++) {
                    const besoins = calculerBesoinHebdo(marcheValide, s);
                    if (besoins.basilic && besoins.basilic.total > 0) {
                      total += besoins.basilic.total;
                      count++;
                    }
                  }
                  return count > 0 ? ((total / count) / 0.05).toFixed(0) : 0;
                })()}
              </p>
              <p className="text-sm text-gray-700">bottes/semaine</p>
              <p className="text-xs text-gray-600 mt-1">≈ {(((() => {
                let total = 0;
                let count = 0;
                for (let s = 18; s <= 38; s++) {
                  const besoins = calculerBesoinHebdo(marcheValide, s);
                  if (besoins.basilic && besoins.basilic.total > 0) {
                    total += besoins.basilic.total;
                    count++;
                  }
                }
                return count > 0 ? total / count : 0;
              })()) * 20).toFixed(0)} kg</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Lecture du tableau :</strong> Les calculs grisés "Hors saison" indiquent que le légume n'est pas disponible à cette période selon les fenêtres de culture du Sud-Ouest France. Les unités correspondent aux formats de vente : <strong>kg</strong> pour les légumes pesés, <strong>bottes</strong> pour les légumes-racines fraîches, <strong>pièces</strong> pour les fruits-légumes à l'unité.
          </p>
        </div>
      </div>

