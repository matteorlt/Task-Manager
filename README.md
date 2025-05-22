# Application de Gestion de Tâches

Une application web complète de gestion de tâches, d'événements et de collaboration, construite avec React (frontend) et Node.js/Express (backend).

---

## Fonctionnalités

- 🔐 **Authentification sécurisée** (Inscription, Connexion, Déconnexion)
- ✅ **Gestion des tâches**
  - Création, modification, suppression de tâches
  - Catégorisation, priorisation, suivi d'état (À faire, En cours, Terminé)
- 📅 **Gestion des événements**
  - Création, modification, suppression d'événements
  - Vue calendrier interactive
  - Événements sur une ou plusieurs journées
- 👤 **Profil utilisateur**
  - Modification des informations personnelles
  - **Upload, affichage et suppression de la photo de profil**
- 📩 **Système d'invitations**
  - Envoi d'invitations à des utilisateurs pour participer à des événements
  - Sélection dynamique de l'événement lors de l'invitation (liste déroulante alimentée par l'API)
- 🖼️ **Gestion avancée des images**
  - Upload sécurisé de la photo de profil (taille max 5 Mo, formats JPG/PNG/GIF)
  - Affichage de la photo dans le profil et dans la barre de navigation
- 🌙 **Thème clair/sombre** (toggle instantané)
- 🔔 **Notifications** (invitations reçues, actions importantes)
- 🔒 **Sécurité**
  - Authentification JWT
  - Middleware d'authentification sur toutes les routes sensibles
  - CORS configuré pour séparer front et back

---

## Modifications et améliorations récentes

- **Correction CORS** : le backend autorise désormais le frontend sur le port 3001 (`origin: 'http://localhost:3001'`).
- **Gestion robuste de l'URL des images** : affichage garanti même sans fichier `.env` côté front.
- **Sélection dynamique des événements dans les invitations** :  
  - Récupération des événements via l'API avec le token d'authentification.
  - Correction du fetch pour utiliser l'URL complète et le header Authorization.
- **Correction du bug d'affichage de la photo de profil** :  
  - L'URL de l'image est désormais toujours correcte, même en environnement multi-port.
- **Gestion des erreurs améliorée** (affichage des messages d'erreur dans les formulaires).
- **Vérification de la présence d'événements avant affichage dans le select**.
- **Ajout de logs pour le debug et la traçabilité**.

---

## Technologies Utilisées

### IA Utilisée
- Cursor
- GPT-4o

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- React Router
- React Big Calendar

### Backend
- Node.js + Express + TypeScript
- MySQL
- JWT, Bcrypt

---

## Prérequis

- Node.js (v14+)
- MySQL (v8+)
- npm ou yarn

---

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
   - Créer un fichier `.env` dans `server` :
     ```
     PORT=3000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=VOTRE_MDP
     DB_NAME=task_manager
     JWT_SECRET=VOTRE_SECRET
     ```
   - Créer la base de données et exécuter le script SQL dans `server/src/database/schema.sql`

3. **Configuration du Frontend**
   ```bash
   cd ../client
   npm install
   ```
   - (Optionnel) Pour le développement, tu peux ajouter dans `client/package.json` :
     ```json
     "proxy": "http://localhost:3000"
     ```

---

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

- Frontend : [http://localhost:3001](http://localhost:3001)
- Backend/API : [http://localhost:3000](http://localhost:3000)

---

## Structure du Projet

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── store/         # Redux
│   │   └── ...
│   └── ...
│
└── server/                # Backend Node.js
    ├── src/
    │   ├── controllers/   # Contrôleurs
    │   ├── routes/        # Routes API
    │   ├── middleware/    # Middleware
    │   ├── config/        # Configuration
    │   └── database/      # Scripts SQL
    └── ...
```

---

## API Endpoints principaux

- **/api/auth/** : Authentification (register, login, logout, verify)
- **/api/tasks/** : Gestion des tâches
- **/api/events/** : Gestion des événements (protégé par JWT)
- **/api/profile/** : Gestion du profil utilisateur (infos, photo)
- **/api/invitations/** : Gestion des invitations (envoi, acceptation, refus)

---

## Contribution

1. Fork le projet
2. Crée une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit tes changements (`git commit -m 'feat: ma fonctionnalité'`)
4. Push sur ta branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvre une Pull Request

---

## Licence

MIT

---

## Contact

- [@matteo-rlt](https://www.linkedin.com/in/matteo-rlt/)  
- rannouletexiermatteo@gmail.com  
- [https://github.com/matteorlt/Task-Manager](https://github.com/matteorlt/Task-Manager)

---
