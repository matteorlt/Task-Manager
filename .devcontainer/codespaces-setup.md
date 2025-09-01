# 🚀 Configuration GitHub Codespaces pour Task Manager

## 📋 Vue d'ensemble

Cette configuration permet de lancer votre application Task Manager complète dans GitHub Codespaces avec :
- ✅ Frontend React (port 8081)
- ✅ Backend Node.js/Express (port 3000) 
- ✅ Base de données MySQL (port 3306)
- ✅ URLs publiques automatiques pour votre portfolio

## 🌐 URLs publiques générées automatiquement

Quand vous lancez votre Codespace, vous obtiendrez automatiquement :

- **Frontend** : `https://[CODESPACE_NAME]-8081.[GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN]`
- **Backend API** : `https://[CODESPACE_NAME]-3000.[GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN]`
- **Base de données** : `[CODESPACE_NAME]-3306.[GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN]:3306`

## 🎯 Pour votre portfolio

L'URL du frontend sera automatiquement configurée et accessible publiquement. Vous pouvez l'utiliser directement dans votre portfolio !

## 🛠️ Comment utiliser

1. **Créer un Codespace** :
   - Allez sur votre repository GitHub
   - Cliquez sur le bouton "Code" → "Codespaces" → "Create codespace on main"

2. **Attendre l'initialisation** :
   - Le script `post-create.sh` s'exécute automatiquement
   - Installation des dépendances
   - Démarrage des services
   - Configuration des URLs

3. **Accéder à votre application** :
   - L'URL du frontend s'ouvrira automatiquement
   - Ou consultez le fichier `codespaces-info.md` généré

## 🔧 Configuration technique

### Ports exposés
- **8081** : Frontend React (Nginx)
- **3000** : Backend API (Node.js/Express)
- **3306** : MySQL Database

### Variables d'environnement
- `REACT_APP_API_URL` : URL du backend (configurée automatiquement)
- `DB_HOST` : db (nom du service Docker)
- `JWT_SECRET` : Secret JWT pour l'authentification

### Services Docker
- `devcontainer` : Environnement de développement principal
- `db` : Base de données MySQL 8.0
- `server` : Backend Node.js/Express
- `client` : Frontend React (construit et servi par Nginx)

## 📝 Commandes utiles dans Codespaces

```bash
# Voir les logs des services
docker-compose logs -f

# Redémarrer un service spécifique
docker-compose restart server

# Voir le statut des conteneurs
docker-compose ps

# Accéder à la base de données
mysql -h db -u user -ppassword task_manager
```

## 🔒 Sécurité

- Les URLs sont générées automatiquement et sont uniques à votre Codespace
- La base de données utilise des credentials par défaut (à changer en production)
- JWT secret configuré pour Codespaces

## 🚨 Dépannage

Si l'application ne démarre pas :

1. Vérifiez les logs : `docker-compose logs`
2. Redémarrez les services : `docker-compose restart`
3. Vérifiez que tous les ports sont bien exposés dans l'onglet "Ports" de VS Code

## 📞 Support

En cas de problème, consultez :
- Le fichier `codespaces-info.md` généré automatiquement
- Les logs Docker : `docker-compose logs -f`
- La documentation GitHub Codespaces
