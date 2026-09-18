#!/bin/sh
set -e

# Aplica las migraciones pendientes antes de levantar el servidor. Es idempotente
# (alembic no reaplica lo ya aplicado), así que es seguro correrlo en cada arranque.
echo "Aplicando migraciones de Alembic..."
alembic upgrade head

echo "Iniciando servidor..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}