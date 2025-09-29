#!/bin/bash

echo "🔍 Test de l'affichage des photos de profil"
echo "=========================================="

# Vérifier que le serveur est démarré
echo "1. Vérification du serveur..."
if curl -s http://localhost:3000/ > /dev/null; then
    echo "✅ Serveur démarré sur le port 3000"
else
    echo "❌ Serveur non accessible sur le port 3000"
    echo "   Veuillez démarrer le serveur avec: cd server && npm start"
    exit 1
fi

# Vérifier que le dossier uploads existe
echo "2. Vérification du dossier uploads..."
if [ -d "server/uploads/profile-pictures" ]; then
    echo "✅ Dossier uploads/profile-pictures existe"
    echo "   Fichiers présents:"
    ls -la server/uploads/profile-pictures/ | head -5
else
    echo "❌ Dossier uploads/profile-pictures n'existe pas"
    echo "   Création du dossier..."
    mkdir -p server/uploads/profile-pictures
    echo "✅ Dossier créé"
fi

# Vérifier la configuration CORS
echo "3. Vérification de la configuration CORS..."
echo "   ORIGIN autorisé: ${ORIGIN:-http://localhost:8081}"

echo ""
echo "🎯 Instructions pour tester:"
echo "1. Ouvrez http://localhost:8081 dans votre navigateur"
echo "2. Connectez-vous à votre compte"
echo "3. Allez dans la page Profil"
echo "4. Uploadez une photo de profil"
echo "5. Vérifiez que la photo s'affiche dans:"
echo "   - La page Profil (grande photo)"
echo "   - Le header/navigation (petite photo)"
echo ""
echo "🔧 Si les photos ne s'affichent pas:"
echo "1. Vérifiez la console du navigateur pour les erreurs"
echo "2. Vérifiez que REACT_APP_API_URL est correct dans client/.env"
echo "3. Vérifiez que le serveur sert bien les fichiers statiques"
echo ""
echo "📝 URLs à vérifier:"
echo "   - API: http://localhost:3000/api/profile"
echo "   - Upload: http://localhost:3000/uploads/profile-pictures/"
echo "   - Frontend: http://localhost:8081"
