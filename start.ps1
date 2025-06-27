Write-Host "Demarrage de Task Manager avec Docker..." -ForegroundColor Green

# Arreter les conteneurs existants
Write-Host "Arret des conteneurs existants..." -ForegroundColor Yellow
docker-compose down

# Supprimer les images existantes pour forcer un rebuild
Write-Host "Nettoyage des images existantes..." -ForegroundColor Yellow
docker-compose down --rmi all

# Construire et demarrer les conteneurs
Write-Host "Construction et demarrage des conteneurs..." -ForegroundColor Yellow
docker-compose up --build -d

# Attendre que les services soient prets
Write-Host "Attente du demarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verifier le statut des conteneurs
Write-Host "Statut des conteneurs:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "Application demarree avec succes!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:8081" -ForegroundColor White
Write-Host "Backend API: http://localhost:3000" -ForegroundColor White
Write-Host "Base de donnees: localhost:3306" -ForegroundColor White
Write-Host ""
Write-Host "Logs en temps reel: docker-compose logs -f" -ForegroundColor Gray
Write-Host "Pour arreter: docker-compose down" -ForegroundColor Gray 