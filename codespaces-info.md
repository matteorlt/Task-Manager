# 🌐 URLs de votre application Task Manager

## URLs publiques (Codespaces)
- **Frontend (React)** : https://orange-fiesta-r4w79xj6pw9626pw-8081.app.github.dev
- **Backend API** : https://orange-fiesta-r4w79xj6pw9626pw-3000.app.github.dev
- **Base de données** : orange-fiesta-r4w79xj6pw9626pw-3306.app.github.dev:3306

## URLs locales (dans le conteneur)
- Frontend : http://localhost:8081
- Backend : http://localhost:3000
- Base de données : localhost:3306

## 🎯 Pour votre portfolio
Utilisez l'URL du frontend pour intégrer votre application dans votre portfolio :
**https://orange-fiesta-r4w79xj6pw9626pw-8081.app.github.dev**

## 📝 Informations de connexion à la base de données
- Host: db (dans le conteneur) ou orange-fiesta-r4w79xj6pw9626pw-3306.app.github.dev
- Port: 3306
- Database: task_manager
- Username: user
- Password: password

## 🛠️ Commandes utiles
```bash
# Voir les logs des services
docker compose logs -f

# Redémarrer un service
docker compose restart server

# Arrêter tous les services
docker compose down

# Voir le statut des conteneurs
docker compose ps
```

## ✅ Statut actuel
- ✅ Base de données : Démarrée et saine
- ✅ Backend : Démarré sur le port 3000
- ✅ Frontend : Démarré sur le port 8081
- ✅ Configuration CORS : Corrigée

## 🎉 Votre application est prête !
Votre Task Manager est maintenant accessible publiquement et peut être intégré dans votre portfolio !
