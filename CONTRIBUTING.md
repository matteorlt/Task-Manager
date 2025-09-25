# Contribuer à Task-Manager

Merci de votre intérêt ! Merci de lire ce guide AVANT toute contribution.

## Branches et workflow Git
- Créez une branche depuis `master` pour chaque fonctionnalité/bugfix
- Nommez vos branches clairement: `feat/...`, `fix/...`, `chore/...`, `test/...`
- Ouvrez une Pull Request (PR) vers `master` avec une description concise

## Commits
- Utilisez des messages explicites et concis
- Préfixes recommandés: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`

## Qualité du code
- TypeScript strict côté serveur et client
- Pas de variables/imports inutilisés (lint propres)
- Écrire du code lisible (noms explicites, early returns, gestion d’erreurs)

## Tests
- Serveur: Jest + ts-jest + Supertest
  - Ajoutez des tests d’intégration pour les nouvelles routes/contrôleurs
  - Mockez la DB avec des doubles (`src/config/database`) si besoin
- Client: Testing Library (React)
  - Ajoutez des tests pour les composants/pages modifiés
- Les tests doivent passer en local: `cd server && npm test`, `cd client && npm test`

## CI (à lire)
- La CI se lance sur chaque push/PR vers `master` et peut être lancée manuellement
- Le workflow `ci.yml`:
  - installe deps (npm install), build serveur, lance tests serveur
  - build client avec `CI=false` pour ne pas bloquer sur de simples warnings
  - lance tests client
- Faites en sorte que la CI soit verte avant de demander une review

## Style
- Respecter la structure existante
- Pas de reformatage massif non lié à votre change
- Pas de TODO en commentaire: implémentez ou créez une issue

## Sécurité & secrets
- Ne commitez JAMAIS de secrets (.env, clés, tokens)
- Variables sensibles via `.env` en local et secrets GitHub en CI si nécessaire

## SQL et base de données
- Si vous touchez au schéma, mettez à jour `db_init/` et documentez la procédure

Merci ! Ouvrez une issue si quelque chose n’est pas clair.


