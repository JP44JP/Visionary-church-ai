#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('Setting up test database...')

// Check if Docker is available
try {
  execSync('docker --version', { stdio: 'ignore' })
} catch (error) {
  console.error('Docker is required for test database setup')
  process.exit(1)
}

// Create test database with Docker
const testDbContainer = 'visionarychurch-test-db'
const testRedisContainer = 'visionarychurch-test-redis'

// Stop and remove existing containers if they exist
try {
  execSync(`docker stop ${testDbContainer}`, { stdio: 'ignore' })
  execSync(`docker rm ${testDbContainer}`, { stdio: 'ignore' })
} catch (error) {
  // Container doesn't exist, which is fine
}

try {
  execSync(`docker stop ${testRedisContainer}`, { stdio: 'ignore' })
  execSync(`docker rm ${testRedisContainer}`, { stdio: 'ignore' })
} catch (error) {
  // Container doesn't exist, which is fine
}

// Start PostgreSQL test database
console.log('Starting PostgreSQL test database...')
execSync(`docker run -d --name ${testDbContainer} \\
  -e POSTGRES_DB=visionarychurch_test \\
  -e POSTGRES_USER=test \\
  -e POSTGRES_PASSWORD=test \\
  -p 5433:5432 \\
  postgres:15-alpine`, { stdio: 'inherit' })

// Start Redis test instance
console.log('Starting Redis test instance...')
execSync(`docker run -d --name ${testRedisContainer} \\
  -p 6380:6379 \\
  redis:7-alpine`, { stdio: 'inherit' })

// Wait for databases to be ready
console.log('Waiting for databases to be ready...')
let dbReady = false
let attempts = 0
const maxAttempts = 30

while (!dbReady && attempts < maxAttempts) {
  try {
    execSync('docker exec visionarychurch-test-db pg_isready -U test', { stdio: 'ignore' })
    dbReady = true
  } catch (error) {
    attempts++
    console.log(`Waiting for database... attempt ${attempts}/${maxAttempts}`)
    execSync('sleep 2')
  }
}

if (!dbReady) {
  console.error('Test database failed to start within timeout')
  process.exit(1)
}

// Load database schema
console.log('Loading database schema...')
const schemaFiles = [
  'database-setup.sql',
  'chat-database-extension.sql',
  'follow-up-sequences-database.sql',
  'visit-planning-database.sql'
]

for (const schemaFile of schemaFiles) {
  const filePath = path.join(__dirname, '..', schemaFile)
  if (fs.existsSync(filePath)) {
    try {
      execSync(`docker exec -i ${testDbContainer} psql -U test -d visionarychurch_test < ${filePath}`, { 
        stdio: 'inherit' 
      })
      console.log(`Loaded ${schemaFile}`)
    } catch (error) {
      console.warn(`Warning: Could not load ${schemaFile}: ${error.message}`)
    }
  }
}

// Load migrations
console.log('Loading database migrations...')
const migrationsDir = path.join(__dirname, '..', 'database', 'migrations')
if (fs.existsSync(migrationsDir)) {
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()

  for (const migrationFile of migrationFiles) {
    const filePath = path.join(migrationsDir, migrationFile)
    try {
      execSync(`docker exec -i ${testDbContainer} psql -U test -d visionarychurch_test < ${filePath}`, { 
        stdio: 'inherit' 
      })
      console.log(`Loaded migration ${migrationFile}`)
    } catch (error) {
      console.warn(`Warning: Could not load migration ${migrationFile}: ${error.message}`)
    }
  }
}

// Supabase migrations
const supabaseMigrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
if (fs.existsSync(supabaseMigrationsDir)) {
  const migrationFiles = fs.readdirSync(supabaseMigrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()

  for (const migrationFile of migrationFiles) {
    const filePath = path.join(supabaseMigrationsDir, migrationFile)
    try {
      execSync(`docker exec -i ${testDbContainer} psql -U test -d visionarychurch_test < ${filePath}`, { 
        stdio: 'inherit' 
      })
      console.log(`Loaded Supabase migration ${migrationFile}`)
    } catch (error) {
      console.warn(`Warning: Could not load Supabase migration ${migrationFile}: ${error.message}`)
    }
  }
}

// Create test environment file
console.log('Creating test environment configuration...')
const testEnvContent = `
# Test Environment Configuration
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5433/visionarychurch_test
REDIS_URL=redis://localhost:6380
JWT_SECRET=test-jwt-secret-key-for-testing-only
OPENAI_API_KEY=test-openai-key
SENDGRID_API_KEY=test-sendgrid-key
TWILIO_ACCOUNT_SID=test-twilio-sid
TWILIO_AUTH_TOKEN=test-twilio-token
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-role-key
`

fs.writeFileSync(path.join(__dirname, '..', '.env.test'), testEnvContent.trim())

console.log('✅ Test database setup complete!')
console.log('📊 PostgreSQL: localhost:5433')
console.log('🔴 Redis: localhost:6380')
console.log('⚠️  Remember to run "npm run teardown:test-db" after testing')