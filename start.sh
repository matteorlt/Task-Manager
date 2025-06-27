#!/bin/bash

echo "🚀 Démarrage de Task Manager avec Docker..."

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

# Supprimer les images existantes pour forcer un rebuild
echo "🧹 Nettoyage des images existantes..."
docker-compose down --rmi all

# Construire et démarrer les conteneurs
echo "🔨 Construction et démarrage des conteneurs..."
docker-compose up --build -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier le statut des conteneurs
echo "📊 Statut des conteneurs:"
docker-compose ps

echo ""
echo "✅ Application démarrée avec succès!"
echo "🌐 Frontend: http://localhost:8081"
echo "🔧 Backend API: http://localhost:3000"
echo "🗄️  Base de données: localhost:3306"
echo ""
echo "📝 Logs en temps réel: docker-compose logs -f"
echo "🛑 Pour arrêter: docker-compose down" 