#!/bin/sh
set -e

# Aplica las migraciones pendientes antes de levantar el servidor. Es idempotente
# (alembic no reaplica lo ya aplicado), así que es seguro correrlo en cada arranque.
echo "Aplicando migraciones de Alembic..."
alembic upgrade head

echo "Iniciando servidor..."
exec "$@"
