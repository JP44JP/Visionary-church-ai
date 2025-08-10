#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('Tearing down test database...')

const testDbContainer = 'visionarychurch-test-db'
const testRedisContainer = 'visionarychurch-test-redis'

// Stop and remove PostgreSQL container
try {
  console.log('Stopping PostgreSQL test database...')
  execSync(`docker stop ${testDbContainer}`, { stdio: 'inherit' })
  execSync(`docker rm ${testDbContainer}`, { stdio: 'inherit' })
  console.log('✅ PostgreSQL test database stopped')
} catch (error) {
  console.warn('⚠️  PostgreSQL test database was not running')
}

// Stop and remove Redis container
try {
  console.log('Stopping Redis test instance...')
  execSync(`docker stop ${testRedisContainer}`, { stdio: 'inherit' })
  execSync(`docker rm ${testRedisContainer}`, { stdio: 'inherit' })
  console.log('✅ Redis test instance stopped')
} catch (error) {
  console.warn('⚠️  Redis test instance was not running')
}

// Remove test environment file
const testEnvPath = path.join(__dirname, '..', '.env.test')
if (fs.existsSync(testEnvPath)) {
  fs.unlinkSync(testEnvPath)
  console.log('✅ Test environment file removed')
}

// Clean up test results
const testResultsDir = path.join(__dirname, '..', 'test-results')
if (fs.existsSync(testResultsDir)) {
  try {
    execSync(`rm -rf ${testResultsDir}`, { stdio: 'inherit' })
    console.log('✅ Test results cleaned up')
  } catch (error) {
    console.warn('⚠️  Could not clean up test results directory')
  }
}

// Clean up coverage directory
const coverageDir = path.join(__dirname, '..', 'coverage')
if (fs.existsSync(coverageDir)) {
  try {
    execSync(`rm -rf ${coverageDir}`, { stdio: 'inherit' })
    console.log('✅ Coverage reports cleaned up')
  } catch (error) {
    console.warn('⚠️  Could not clean up coverage directory')
  }
}

console.log('🧹 Test database teardown complete!')