#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")"
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker no está instalado. En Ubuntu 22.04/24.04 ejecutá primero: sudo bash scripts/install-docker-ubuntu.sh"
  exit 1
fi
if [ ! -f .env ]; then
  cp backend/.env.example .env
  SECRET="$(openssl rand -hex 32)"
  MONGO_PASS="$(openssl rand -hex 24)"
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$SECRET|" .env
  cat >> .env <<EOF
MONGO_ROOT_USER=sixseven
MONGO_ROOT_PASSWORD=$MONGO_PASS
EOF
  echo "Creé .env con secretos aleatorios. Revisá CORS_ORIGINS y credenciales R2 antes de exponer el servicio."
fi
docker compose up -d --build
echo "Despliegue iniciado. Comprobación local: curl http://127.0.0.1:4000/health"