# Script d'installation automatique V9.0
# Encodage : UTF-8 with BOM

Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation Planification Maraichère V9.0" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Détecter le dossier racine du projet
$projectRoot = (Get-Location).Path -replace '\\package-windows-v9$', ''

if ($projectRoot -eq (Get-Location).Path) {
    Write-Host "ERREUR: Ce script doit être exécuté depuis le dossier package-windows-v9" -ForegroundColor Red
    Write-Host "Usage: cd package-windows-v9 puis .\install.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Dossier projet détecté: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# Vérifier que src/ existe
if (!(Test-Path "$projectRoot\src")) {
    Write-Host "ERREUR: Dossier src/ introuvable" -ForegroundColor Red
    Write-Host "Êtes-vous dans le bon dossier ?" -ForegroundColor Yellow
    exit 1
}

# Étape 1 : Créer src/utils/ si nécessaire
Write-Host "Étape 1/5 : Création du dossier utils..." -ForegroundColor Yellow
if (!(Test-Path "$projectRoot\src\utils")) {
    New-Item -Path "$projectRoot\src\utils" -ItemType Directory | Out-Null
    Write-Host "✅ Dossier src/utils/ créé" -ForegroundColor Green
} else {
    Write-Host "✅ Dossier src/utils/ existe déjà" -ForegroundColor Green
}
Write-Host ""

# Étape 2 : Copier calculPlanchesSimultanees.js
Write-Host "Étape 2/5 : Copie du module de calcul..." -ForegroundColor Yellow
Copy-Item -Path "calculPlanchesSimultanees.js" -Destination "$projectRoot\src\utils\calculPlanchesSimultanees.js" -Force
if (Test-Path "$projectRoot\src\utils\calculPlanchesSimultanees.js") {
    Write-Host "✅ calculPlanchesSimultanees.js copié" -ForegroundColor Green
} else {
    Write-Host "❌ Échec de la copie du module" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Étape 3 : Sauvegarder SelectionCultures.jsx
Write-Host "Étape 3/5 : Sauvegarde de l'ancien fichier..." -ForegroundColor Yellow
if (Test-Path "$projectRoot\src\components\SelectionCultures.jsx") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item -Path "$projectRoot\src\components\SelectionCultures.jsx" -Destination "$projectRoot\src\components\SelectionCultures.jsx.backup_$timestamp" -Force
    Write-Host "✅ Sauvegarde créée : SelectionCultures.jsx.backup_$timestamp" -ForegroundColor Green
} else {
    Write-Host "⚠️  Fichier SelectionCultures.jsx introuvable (première installation ?)" -ForegroundColor Yellow
}
Write-Host ""

# Étape 4 : Copier la nouvelle version
Write-Host "Étape 4/5 : Installation de la nouvelle version (UTF-8 corrigé)..." -ForegroundColor Yellow
Copy-Item -Path "SelectionCultures.jsx" -Destination "$projectRoot\src\components\SelectionCultures.jsx" -Force
if (Test-Path "$projectRoot\src\components\SelectionCultures.jsx") {
    Write-Host "✅ SelectionCultures.jsx installé (encodage UTF-8)" -ForegroundColor Green
} else {
    Write-Host "❌ Échec de l'installation" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Étape 5 : Vérification
Write-Host "Étape 5/5 : Vérification de l'installation..." -ForegroundColor Yellow
$allGood = $true

# Vérifier calculPlanchesSimultanees.js
if (Test-Path "$projectRoot\src\utils\calculPlanchesSimultanees.js") {
    Write-Host "✅ calculPlanchesSimultanees.js présent" -ForegroundColor Green
} else {
    Write-Host "❌ calculPlanchesSimultanees.js manquant" -ForegroundColor Red
    $allGood = $false
}

# Vérifier SelectionCultures.jsx
if (Test-Path "$projectRoot\src\components\SelectionCultures.jsx") {
    $fileSize = (Get-Item "$projectRoot\src\components\SelectionCultures.jsx").Length
    if ($fileSize -gt 25000) {
        Write-Host "✅ SelectionCultures.jsx présent ($fileSize octets)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  SelectionCultures.jsx semble trop petit ($fileSize octets)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ SelectionCultures.jsx manquant" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green

if ($allGood) {
    Write-Host "✅ INSTALLATION TERMINÉE AVEC SUCCÈS !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes :" -ForegroundColor Cyan
    Write-Host "1. Revenir dans le dossier du projet : cd .." -ForegroundColor White
    Write-Host "2. Lancer l'application : npm run dev" -ForegroundColor White
    Write-Host "3. Ouvrir http://localhost:5173" -ForegroundColor White
    Write-Host "4. Tester en ajoutant une culture (ex: Courgettes)" -ForegroundColor White
    Write-Host ""
    Write-Host "Vous devriez voir :" -ForegroundColor Cyan
    Write-Host "  ✅ 'Marché' (pas 'MarchÃ©')" -ForegroundColor White
    Write-Host "  ✅ 'Planches simultanées' affichées" -ForegroundColor White
    Write-Host "  ✅ 'Planning Semis Échelonnés'" -ForegroundColor White
    Write-Host "  ✅ 'Besoins Intrants'" -ForegroundColor White
} else {
    Write-Host "⚠️  INSTALLATION TERMINÉE AVEC AVERTISSEMENTS" -ForegroundColor Yellow
    Write-Host "Vérifiez les messages ci-dessus" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Green
Write-Host ""
