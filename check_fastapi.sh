#!/bin/bash

echo "Vérification du port 8000 (écoute locale)..."
if ss -tuln | grep -q ':8000 '; then
  echo "✅ Le port 8000 est ouvert en écoute."
else
  echo "❌ Le port 8000 n'est pas ouvert ou FastAPI n'est pas lancé."
  exit 1
fi

echo "Test d'accès HTTP local à FastAPI..."
if curl -s http://localhost:8000 | grep -qiE 'fastapi|openapi|swagger'; then
  echo "✅ FastAPI répond bien sur http://localhost:8000"
else
  echo "❌ FastAPI ne répond pas sur http://localhost:8000"
  exit 2
fi

echo "Test d'accès HTTP depuis l'extérieur (remplacez IP si besoin)..."
if curl -s http://78.138.58.199:8000 | grep -qiE 'fastapi|openapi|swagger'; then
  echo "✅ FastAPI est accessible depuis l'extérieur sur http://78.138.58.199:8000"
else
  echo \"❌ FastAPI n'est PAS accessible depuis l'extérieur (vérifiez le pare-feu et la config réseau)\"
  exit 3
fi