#!/bin/sh
set -e

echo "Running TypeORM migrations..."
npx typeorm migration:run -d dist/database/data-source.js

echo "Starting backend..."
exec node dist/main.js
