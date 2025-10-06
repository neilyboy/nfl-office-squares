#!/bin/sh
set -e

echo "================================"
echo "🚀 NFL Squares - Starting..."
echo "================================"

# Debug: Show environment
echo "📋 DATABASE_URL: ${DATABASE_URL}"
echo "📋 NODE_ENV: ${NODE_ENV}"
echo "================================"

# Wait for database to be ready (if using postgres)
if [ -n "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -q "postgresql"; then
  echo "⏳ Waiting for PostgreSQL to be ready..."
  
  # Wait for postgres with better logic
  timeout=60
  until npx prisma db execute --stdin <<< "SELECT 1" 2>/dev/null || [ $timeout -le 0 ]; do
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
      echo "❌ Database connection timeout after 60 seconds!"
      echo "Trying migrations anyway..."
      break
    fi
    echo "⏳ Still waiting for database... ($timeout seconds left)"
    sleep 1
  done
  
  echo "✅ Database connection established!"
  
  # Run migrations - MUST succeed
  echo "🔄 Running Prisma migrations..."
  if npx prisma migrate deploy; then
    echo "✅ Migrations applied successfully!"
  else
    echo "❌ Migration failed! Exiting..."
    exit 1
  fi
  
  echo "✅ Database setup complete!"
else
  echo "ℹ️  Using SQLite or no DATABASE_URL set"
fi

echo "================================"
echo "🎉 Starting application server..."
echo "================================"
exec "$@"
