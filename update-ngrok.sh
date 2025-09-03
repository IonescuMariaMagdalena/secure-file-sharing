#!/bin/bash

echo "🚀 Starting ngrok + backend with auto-update of .env"

# Pornește ngrok pe 8080 în background
ngrok http 8080 > /dev/null &
NGROK_PID=$!

# Așteaptă să se ridice tunelul
sleep 3

# Ia URL-ul public de la API-ul ngrok local
URL=$(curl -s http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[0].public_url')

if [[ -z "$URL" ]]; then
  echo "❌ Nu am putut obține URL-ul ngrok. Verifică dacă ngrok rulează corect."
  kill $NGROK_PID
  exit 1
fi

echo "🔗 Ngrok URL = $URL"

# Actualizează backend/.env
if grep -q "^PUBLIC_BASE_URL=" backend/.env; then
  sed -i.bak "s|^PUBLIC_BASE_URL=.*|PUBLIC_BASE_URL=$URL|" backend/.env
else
  echo "PUBLIC_BASE_URL=$URL" >> backend/.env
fi

echo "✅ backend/.env actualizat cu PUBLIC_BASE_URL=$URL"

# Pornește backend-ul
cd backend
npm run dev &

# Ține ngrok în viață
wait $NGROK_PID

