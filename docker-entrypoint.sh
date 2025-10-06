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
  
  # Simple wait - just sleep to let postgres finish starting
  # Docker compose already has depends_on with health check
  echo "⏳ Giving database a few seconds to initialize..."
  sleep 5
  
  echo "✅ Database should be ready (health check passed)!"
  
  # Run migrations - will retry if database isn't quite ready
  echo "🔄 Running Prisma migrations..."
  retries=10
  until npx prisma migrate deploy || [ $retries -le 0 ]; do
    retries=$((retries - 1))
    echo "⚠️  Migration attempt failed, retrying... ($retries attempts left)"
    sleep 2
  done
  
  if [ $retries -le 0 ]; then
    echo "❌ Migration failed after all retries! Exiting..."
    exit 1
  fi
  
  echo "✅ Migrations applied successfully!"
  echo "✅ Database setup complete!"
else
  echo "ℹ️  Using SQLite or no DATABASE_URL set"
fi

echo "================================"
echo "🎉 Starting application server..."
echo "================================"
exec "$@"
