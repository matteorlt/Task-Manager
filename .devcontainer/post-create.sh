#!/bin/bash

# Script de post-création pour GitHub Codespaces
# Ce script s'exécute automatiquement après la création du conteneur

echo "🚀 Configuration de l'environnement Task Manager..."

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
sleep 10

# Vérifier que la base de données est accessible
while ! mysqladmin ping -h db -u user -ppassword --silent; do
    echo "⏳ En attente de la base de données..."
    sleep 2
done

echo "✅ Base de données prête !"

# Installer les dépendances du backend
echo "📦 Installation des dépendances backend..."
cd /workspaces/Task-Manager/server
npm install

# Installer les dépendances du frontend
echo "📦 Installation des dépendances frontend..."
cd /workspaces/Task-Manager/client
npm install

# Construire le frontend
echo "🔨 Construction du frontend..."
npm run build

# Retourner au répertoire racine
cd /workspaces/Task-Manager

# Créer un fichier d'information sur l'environnement
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
\`\`\`
EOF

echo "✅ Configuration terminée !"
echo ""
echo "🌐 Votre application Task Manager est maintenant accessible via :"
echo "   Frontend: https://\${CODESPACE_NAME}-8081.\${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
echo "   Backend:  https://\${CODESPACE_NAME}-3000.\${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
echo ""
echo "📋 Consultez le fichier codespaces-info.md pour plus d'informations"
echo ""
echo "🎉 Bon développement !"
