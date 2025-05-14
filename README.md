# Application de Gestion de Tâches

Une application web complète de gestion de tâches et d'événements, construite avec React (frontend) et Node.js/Express (backend).

## Fonctionnalités

- 🔐 **Authentification** (Inscription, Connexion, Déconnexion)
- ✅ **Gestion des tâches**
  - Création, modification, suppression de tâches
  - Catégorisation et priorisation
  - Suivi de l'état (À faire, En cours, Terminé)
- 📅 **Gestion des événements**
  - Création et gestion d'événements
  - Vue calendrier
  - Événements sur une journée ou plusieurs jours
- 👤 **Profil utilisateur**
  - Gestion des informations personnelles
  - Tableau de bord personnalisé

## Technologies Utilisées

### IA Utilisée
- Cursor
- GPT 4o

### Frontend
- React avec TypeScript
- Redux Toolkit pour la gestion d'état
- Material-UI pour l'interface utilisateur
- React Router pour la navigation
- React Big Calendar pour la vue calendrier

### Backend
- Node.js avec Express
- TypeScript
- MySQL pour la base de données
- JWT pour l'authentification
- Bcrypt pour le hachage des mots de passe

## Prérequis

- Node.js (v14 ou supérieur)
- MySQL (v8 ou supérieur)
- npm ou yarn

## Installation

1. **Cloner le repository**
```bash
git clone https://github.com/matteorlt/Task-Manager
cd Task-Manager
```

2. **Configuration du Backend**
```bash
cd server
npm install
```

3. **Configuration de la Base de Données**
- Créer une base de données MySQL
- Exécuter le script SQL dans `server/src/database/schema.sql`
- Créer un fichier `.env` dans le dossier `server` avec les variables suivantes :
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=task_manager
JWT_SECRET=votre_secret_jwt
```

4. **Configuration du Frontend**
```bash
cd client
npm install
```

## Démarrage

1. **Démarrer le Backend**
```bash
cd server
npm run dev
```

2. **Démarrer le Frontend**
```bash
cd client
npm start
```

L'application sera accessible à l'adresse `http://localhost:3000`

## Structure du Projet

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── store/        # Configuration Redux
│   │   └── ...
│   └── ...
│
└── server/                # Backend Node.js
    ├── src/
    │   ├── controllers/  # Contrôleurs
    │   ├── routes/       # Routes API
    │   ├── middleware/   # Middleware
    │   ├── config/       # Configuration
    │   └── database/     # Scripts SQL
    └── ...
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion

### Tâches
- `GET /api/tasks` - Liste des tâches
- `POST /api/tasks` - Créer une tâche
- `PUT /api/tasks/:id` - Modifier une tâche
- `DELETE /api/tasks/:id` - Supprimer une tâche

### Événements
- `GET /api/events` - Liste des événements
- `POST /api/events` - Créer un événement
- `PUT /api/events/:id` - Modifier un événement
- `DELETE /api/events/:id` - Supprimer un événement

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Contact

Linkedin et Mail - [@matteo-rlt](https://www.linkedin.com/in/matteo-rlt/) - rannouletexiermatteo@gmail.com

Lien du projet: [https://github.com/matteorlt/Task-Manager](https://github.com/matteorlt/Task-Manager) 
