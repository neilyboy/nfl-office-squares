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
  
  # Check if Prisma binary exists
  if [ -f "node_modules/.bin/prisma" ]; then
    echo "✅ Prisma CLI found at node_modules/.bin/prisma"
  else
    echo "⚠️  Prisma CLI not found at node_modules/.bin/prisma, checking alternatives..."
    ls -la node_modules/.bin/ 2>/dev/null || echo "node_modules/.bin/ doesn't exist"
    ls -la node_modules/prisma/ 2>/dev/null || echo "node_modules/prisma/ doesn't exist"
  fi
  
  # Run migrations - will retry if database isn't quite ready
  echo "🔄 Running Prisma migrations..."
  retries=10
  until node_modules/.bin/prisma migrate deploy || [ $retries -le 0 ]; do
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
