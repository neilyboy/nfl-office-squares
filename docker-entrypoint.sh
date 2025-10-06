#!/bin/sh
set -e

echo "🚀 Starting NFL Squares Application..."

# Wait for database to be ready (if using postgres)
if [ -n "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -q "postgresql"; then
  echo "⏳ Waiting for PostgreSQL..."
  timeout=30
  while ! npx prisma db push --skip-generate 2>/dev/null; do
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
      echo "❌ Database connection timeout!"
      exit 1
    fi
    echo "⏳ Still waiting for database... ($timeout seconds left)"
    sleep 1
  done
  echo "✅ Database is ready!"

  # Run migrations
  echo "🔄 Running database migrations..."
  npx prisma migrate deploy || echo "⚠️  No migrations to run or error occurred"

  echo "✅ Database setup complete!"
fi

echo "🎉 Starting application server..."
exec "$@"
