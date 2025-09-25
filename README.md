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

## 🐳 Démarrage Rapide avec Docker (Local)

### Prérequis
- Docker et Docker Compose installés

### Installation et démarrage

1. **Cloner le repository**
   ```bash
   git clone https://github.com/matteorlt/Task-Manager
   cd Task-Manager
   ```

2. **Démarrer avec Docker**
   
   **Sur Windows (PowerShell) :**
   ```powershell
   .\start.ps1
   ```
   
   **Sur Linux/Mac :**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   
   **Ou manuellement :**
   ```bash
   docker-compose up --build -d
   ```

3. **Accéder à l'application**
   - 🌐 Frontend : [http://localhost:8081](http://localhost:8081)
   - 🔧 Backend API : [http://localhost:3000](http://localhost:3000)
   - 🗄️ Base de données : localhost:3306

### Commandes Docker utiles

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Arrêter l'application
docker-compose down

# Redémarrer un service spécifique
docker-compose restart server

# Voir le statut des conteneurs
docker-compose ps
```

---

## 🛠️ Installation Manuelle (Développement)

### Prérequis
- Node.js (v14+)
- MySQL (v8+)
- npm ou yarn

### Installation

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

### Démarrage

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

### Infrastructure
- Docker & Docker Compose
- Nginx (reverse proxy)
- MySQL 8.0
- **GitHub Codespaces** (déploiement cloud)

---

## Structure du Projet

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── store/         # Redux
│   │   └── ...
│   ├── dockerfile         # Configuration Docker
│   ├── nginx.conf         # Configuration Nginx
│   └── ...
│
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── controllers/   # Contrôleurs
│   │   ├── routes/        # Routes API
│   │   ├── middleware/    # Middleware
│   │   ├── config/        # Configuration
│   │   └── database/      # Scripts SQL
│   ├── dockerfile         # Configuration Docker
│   └── ...
│
├── db_init/               # Scripts d'initialisation DB
├── .devcontainer/         # Configuration GitHub Codespaces
│   ├── devcontainer.json  # Configuration principale
│   ├── docker-compose.yml # Services pour Codespaces
│   └── post-create.sh     # Script d'initialisation
├── docker-compose.yml     # Configuration Docker Compose
├── start.sh              # Script de démarrage (Linux/Mac)
├── start.ps1             # Script de démarrage (Windows)
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

## Tests

### Côté serveur (Jest + ts-jest + Supertest)

- Installation: `cd server && npm ci`
- Lancer tous les tests: `npm test`
- Couverture: `npm run test:coverage`

Notes:
- Les tests d'intégration mockent la base (`src/config/database`) et, selon les suites, l'auth middleware.
- Le serveur ne se met pas à écouter en `NODE_ENV=test`.

### Côté client (CRA + Testing Library)

- Installation: `cd client && npm ci`
- Lancer tous les tests: `npm test`

## Intégration continue (GitHub Actions)

Un workflow CI (`.github/workflows/ci.yml`) installe, build et exécute les tests du serveur et du client.

### Ce que fait la CI
- Installe les dépendances du serveur et du client
- Build le serveur (`npm run build`)
- Exécute les tests serveur (`npm test`) avec Jest/ts-jest/Supertest
- Build le client (CRA) avec `CI=false` pour ne pas bloquer sur de simples warnings
- Exécute les tests client (Testing Library)

### Quand la CI s’exécute
- À chaque push sur `master` (et PR depuis n’importe quelle branche)
- Manuellement depuis l’onglet Actions (Run workflow)

### Variables et services
- Node 18 via `actions/setup-node`
- Service MySQL 8 (pré-provisionné pour usages futurs). Les tests serveur mockent la base; aucune migration n’est requise pour passer au vert.

Pour les détails, voir le fichier `.github/workflows/ci.yml` dans le repo.

Consulte également le guide de contribution et les règles du projet dans `CONTRIBUTING.md` (à lire AVANT toute contribution).
