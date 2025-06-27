Write-Host "🚀 Démarrage de Task Manager avec Docker..." -ForegroundColor Green

# Arrêter les conteneurs existants
Write-Host "🛑 Arrêt des conteneurs existants..." -ForegroundColor Yellow
docker-compose down

# Supprimer les images existantes pour forcer un rebuild
Write-Host "🧹 Nettoyage des images existantes..." -ForegroundColor Yellow
docker-compose down --rmi all

# Construire et démarrer les conteneurs
Write-Host "🔨 Construction et démarrage des conteneurs..." -ForegroundColor Yellow
docker-compose up --build -d

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier le statut des conteneurs
Write-Host "📊 Statut des conteneurs:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "✅ Application démarrée avec succès!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:8081" -ForegroundColor White
Write-Host "🔧 Backend API: http://localhost:3000" -ForegroundColor White
Write-Host "🗄️  Base de données: localhost:3306" -ForegroundColor White
Write-Host ""
Write-Host "📝 Logs en temps réel: docker-compose logs -f" -ForegroundColor Gray
Write-Host "🛑 Pour arrêter: docker-compose down" -ForegroundColor Gray 