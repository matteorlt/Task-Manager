Write-Host "🔍 Test de l'affichage des photos de profil" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Vérifier que le serveur est démarré
Write-Host "1. Vérification du serveur..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Serveur démarré sur le port 3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Serveur non accessible sur le port 3000" -ForegroundColor Red
    Write-Host "   Veuillez démarrer le serveur avec: cd server && npm start" -ForegroundColor Yellow
    exit 1
}

# Vérifier que le dossier uploads existe
Write-Host "2. Vérification du dossier uploads..." -ForegroundColor Yellow
if (Test-Path "server/uploads/profile-pictures") {
    Write-Host "✅ Dossier uploads/profile-pictures existe" -ForegroundColor Green
    Write-Host "   Fichiers présents:" -ForegroundColor Cyan
    Get-ChildItem "server/uploads/profile-pictures" | Select-Object -First 5 | Format-Table Name, Length, LastWriteTime
} else {
    Write-Host "❌ Dossier uploads/profile-pictures n'existe pas" -ForegroundColor Red
    Write-Host "   Création du dossier..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "server/uploads/profile-pictures" -Force
    Write-Host "✅ Dossier créé" -ForegroundColor Green
}

# Vérifier la configuration CORS
Write-Host "3. Vérification de la configuration CORS..." -ForegroundColor Yellow
$origin = $env:ORIGIN
if (-not $origin) { $origin = "http://localhost:8081" }
Write-Host "   ORIGIN autorisé: $origin" -ForegroundColor Cyan

Write-Host ""
Write-Host "🎯 Instructions pour tester:" -ForegroundColor Green
Write-Host "1. Ouvrez http://localhost:8081 dans votre navigateur" -ForegroundColor White
Write-Host "2. Connectez-vous à votre compte" -ForegroundColor White
Write-Host "3. Allez dans la page Profil" -ForegroundColor White
Write-Host "4. Uploadez une photo de profil" -ForegroundColor White
Write-Host "5. Vérifiez que la photo s'affiche dans:" -ForegroundColor White
Write-Host "   - La page Profil (grande photo)" -ForegroundColor White
Write-Host "   - Le header/navigation (petite photo)" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Si les photos ne s'affichent pas:" -ForegroundColor Yellow
Write-Host "1. Vérifiez la console du navigateur pour les erreurs" -ForegroundColor White
Write-Host "2. Vérifiez que REACT_APP_API_URL est correct dans client/.env" -ForegroundColor White
Write-Host "3. Vérifiez que le serveur sert bien les fichiers statiques" -ForegroundColor White
Write-Host ""
Write-Host "📝 URLs à vérifier:" -ForegroundColor Cyan
Write-Host "   - API: http://localhost:3000/api/profile" -ForegroundColor White
Write-Host "   - Upload: http://localhost:3000/uploads/profile-pictures/" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:8081" -ForegroundColor White
