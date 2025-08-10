// Global teardown for Playwright E2E tests
import { FullConfig } from '@playwright/test'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test environment teardown...')

  // Clean up test data
  try {
    console.log('🗑️  Cleaning up test data...')
    await cleanupTestData()
  } catch (error) {
    console.warn('Warning: Failed to clean up test data:', error)
  }

  // Stop test database
  try {
    console.log('🛑 Stopping test database...')
    execSync('npm run teardown:test-db', { stdio: 'inherit' })
  } catch (error) {
    console.warn('Warning: Failed to stop test database:', error)
  }

  // Clean up test artifacts
  try {
    console.log('📁 Cleaning up test artifacts...')
    await cleanupTestArtifacts()
  } catch (error) {
    console.warn('Warning: Failed to clean up test artifacts:', error)
  }

  // Generate test report summary
  try {
    console.log('📊 Generating test report summary...')
    await generateTestSummary()
  } catch (error) {
    console.warn('Warning: Failed to generate test summary:', error)
  }

  console.log('✅ E2E test environment teardown complete!')
}

async function cleanupTestData() {
  // Clean up any test data that might have been created during tests
  // This ensures a clean state for the next test run
  
  const testDataDirs = [
    'test-uploads',
    'test-exports',
    'test-reports'
  ]

  for (const dir of testDataDirs) {
    const fullPath = path.join(process.cwd(), dir)
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true })
      console.log(`Removed test directory: ${dir}`)
    }
  }

  // Clear any test environment variables
  delete process.env.TEST_ADMIN_EMAIL
  delete process.env.TEST_ADMIN_PASSWORD
  delete process.env.TEST_STAFF_EMAIL
  delete process.env.TEST_STAFF_PASSWORD
  delete process.env.TEST_VISITOR_EMAIL
  delete process.env.TEST_VISITOR_PASSWORD
}

async function cleanupTestArtifacts() {
  const artifactDirs = [
    'test-results/playwright',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces'
  ]

  // Only clean up artifacts in CI or when explicitly requested
  if (process.env.CI || process.env.CLEANUP_ARTIFACTS === 'true') {
    for (const dir of artifactDirs) {
      const fullPath = path.join(process.cwd(), dir)
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath)
        // Keep only the most recent artifacts
        files.sort((a, b) => {
          const aTime = fs.statSync(path.join(fullPath, a)).mtime.getTime()
          const bTime = fs.statSync(path.join(fullPath, b)).mtime.getTime()
          return bTime - aTime
        })

        // Remove all but the 5 most recent files
        files.slice(5).forEach(file => {
          fs.rmSync(path.join(fullPath, file), { force: true })
        })
      }
    }
  }
}

async function generateTestSummary() {
  const summaryPath = path.join(process.cwd(), 'test-results', 'e2e-summary.json')
  
  if (!fs.existsSync(summaryPath)) {
    return
  }

  try {
    const results = fs.readFileSync(summaryPath, 'utf8')
    const summary = JSON.parse(results)
    
    console.log('\n📈 E2E Test Summary:')
    console.log(`✅ Passed: ${summary.passed || 0}`)
    console.log(`❌ Failed: ${summary.failed || 0}`)
    console.log(`⏭️  Skipped: ${summary.skipped || 0}`)
    console.log(`⏱️  Total Duration: ${formatDuration(summary.duration || 0)}`)
    
    if (summary.failed > 0) {
      console.log('\n❌ Failed Tests:')
      summary.failedTests?.forEach((test: any) => {
        console.log(`  - ${test.title}: ${test.error}`)
      })
    }

    // Performance metrics
    if (summary.performance) {
      console.log('\n⚡ Performance Metrics:')
      console.log(`Average Page Load: ${summary.performance.avgPageLoad}ms`)
      console.log(`Average API Response: ${summary.performance.avgApiResponse}ms`)
      console.log(`Largest Contentful Paint: ${summary.performance.avgLCP}ms`)
    }

    // Accessibility metrics
    if (summary.accessibility) {
      console.log('\n♿ Accessibility Metrics:')
      console.log(`Pages Scanned: ${summary.accessibility.pagesScanned}`)
      console.log(`Issues Found: ${summary.accessibility.issuesFound}`)
      console.log(`Average Score: ${summary.accessibility.avgScore}/100`)
    }

  } catch (error) {
    console.warn('Could not parse test summary:', error)
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

export default globalTeardown