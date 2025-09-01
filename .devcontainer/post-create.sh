#!/bin/bash

# Script de post-création pour GitHub Codespaces (Version simplifiée)
# Ce script s'exécute automatiquement après la création du conteneur

echo "🚀 Configuration de l'environnement Task Manager..."

# Créer le fichier d'information immédiatement
cat > codespaces-info.md << EOF
# 🌐 URLs de votre application Task Manager

## URLs publiques (Codespaces)
- **Frontend (React)** : https://\${CODESPACE_NAME}-8081.\${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}
- **Backend API** : https://\${CODESPACE_NAME}-3000.\${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}
- **Base de données** : \${CODESPACE_NAME}-3306.\${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}:3306

## URLs locales (dans le conteneur)
- Frontend : http://localhost:8081
- Backend : http://localhost:3000
- Base de données : localhost:3306

## 🎯 Pour votre portfolio
Utilisez l'URL du frontend pour intégrer votre application dans votre portfolio :
**https://\${CODESPACE_NAME}-8081.\${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}**

## 📝 Informations de connexion à la base de données
- Host: db (dans le conteneur) ou \${CODESPACE_NAME}-3306.\${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}
- Port: 3306
- Database: task_manager
- Username: user
- Password: password

## 🛠️ Commandes utiles
\`\`\`bash
# Voir les logs des services
docker-compose logs -f

# Redémarrer un service
docker-compose restart server

# Arrêter tous les services
docker-compose down

# Installer les dépendances manuellement si nécessaire
cd /workspaces/Task-Manager/server && npm install
cd /workspaces/Task-Manager/client && npm install
\`\`\`

## ⚠️ Note importante
Si l'application ne démarre pas automatiquement, exécutez manuellement :
\`\`\`bash
cd /workspaces/Task-Manager
docker-compose up -d
\`\`\`
EOF

echo "✅ Fichier d'information créé !"

# Installation des dépendances en arrière-plan (non bloquant)
echo "📦 Installation des dépendances en arrière-plan..."

# Backend
cd /workspaces/Task-Manager/server
npm install &
BACKEND_PID=$!

# Frontend  
cd /workspaces/Task-Manager/client
npm install &
FRONTEND_PID=$!

echo "⏳ Installation en cours... (ne bloquera pas le démarrage)"

# Retourner au répertoire racine
cd /workspaces/Task-Manager

echo "✅ Configuration terminée !"
echo ""
echo "🌐 Votre application Task Manager sera accessible via :"
echo "   Frontend: https://\${CODESPACE_NAME}-8081.\${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
echo "   Backend:  https://\${CODESPACE_NAME}-3000.\${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
echo ""
echo "📋 Consultez le fichier codespaces-info.md pour plus d'informations"
echo ""
echo "🎉 Bon développement !"
