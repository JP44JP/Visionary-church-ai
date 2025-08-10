// Complete Visitor Journey E2E Test
import { test, expect, Page } from '@playwright/test'

test.describe('Complete Visitor Journey', () => {
  let visitorEmail: string
  let visitorName: string

  test.beforeEach(async ({ page }) => {
    // Generate unique visitor data for this test
    const timestamp = Date.now()
    visitorEmail = `visitor${timestamp}@example.com`
    visitorName = `Test Visitor ${timestamp}`
  })

  test('should complete full visitor journey from chat to visit scheduling to follow-up', async ({ page, context }) => {
    // Step 1: Visitor arrives on the church website
    await test.step('Visitor lands on church website', async () => {
      await page.goto('/')
      await expect(page).toHaveTitle(/Test Church/)
      await expect(page.locator('h1')).toContainText('Welcome to Test Church')
    })

    // Step 2: Visitor opens chat widget
    await test.step('Visitor opens chat widget', async () => {
      // Wait for chat widget to be available
      await expect(page.locator('[data-testid="chat-widget-toggle"]')).toBeVisible()
      await page.click('[data-testid="chat-widget-toggle"]')
      
      // Chat widget should open
      await expect(page.locator('[data-testid="chat-widget"]')).toBeVisible()
      await expect(page.locator('text=Chat with Test Church')).toBeVisible()
    })

    // Step 3: Visitor provides their information
    await test.step('Visitor provides contact information', async () => {
      // Fill in visitor information form
      await page.fill('[placeholder="Your name"]', visitorName)
      await page.fill('[placeholder="Your email"]', visitorEmail)
      await page.click('button:text("Start Chat")')
      
      // Wait for chat interface to be ready
      await expect(page.locator('[placeholder="Type your message..."]')).toBeVisible()
    })

    // Step 4: Visitor starts conversation
    await test.step('Visitor initiates conversation', async () => {
      const chatInput = page.locator('[placeholder="Type your message..."]')
      await chatInput.fill('Hello! I\'m new to the area and interested in visiting your church.')
      await chatInput.press('Enter')
      
      // Message should appear in chat
      await expect(page.locator('text=Hello! I\'m new to the area')).toBeVisible()
      
      // AI should respond
      await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible()
      await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible({ timeout: 10000 })
      await expect(page.locator('text=Welcome! We\'d love to have you visit')).toBeVisible({ timeout: 15000 })
    })

    // Step 5: Visitor expresses interest in visiting
    await test.step('Visitor expresses interest in visiting', async () => {
      const chatInput = page.locator('[placeholder="Type your message..."]')
      await chatInput.fill('I would like to schedule a visit. What are your service times?')
      await chatInput.press('Enter')
      
      // AI should provide service information and visit scheduling option
      await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible({ timeout: 10000 })
      await expect(page.locator('text=Sunday service')).toBeVisible({ timeout: 15000 })
      await expect(page.locator('button:text("Schedule a Visit")')).toBeVisible({ timeout: 5000 })
    })

    // Step 6: Visitor schedules a visit
    await test.step('Visitor schedules a visit', async () => {
      await page.click('button:text("Schedule a Visit")')
      
      // Visit planning form should open
      await expect(page.locator('[data-testid="visit-planning-form"]')).toBeVisible()
      await expect(page.locator('text=Schedule Your Visit')).toBeVisible()
      
      // Fill out visit planning form
      await page.selectOption('[name="visitType"]', 'pastoral')
      await page.fill('[name="reason"]', 'I\'m new to the area and looking for a church home.')
      
      // Select preferred date (next Sunday)
      const nextSunday = new Date()
      nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()))
      const dateString = nextSunday.toISOString().split('T')[0]
      await page.fill('[name="preferredDate"]', dateString)
      await page.selectOption('[name="preferredTime"]', '10:00')
      
      // Submit visit request
      await page.click('button:text("Schedule Visit")')
      
      // Confirmation should appear
      await expect(page.locator('text=Visit request submitted')).toBeVisible()
      await expect(page.locator('text=confirmation email')).toBeVisible()
    })

    // Step 7: Visitor receives confirmation email
    await test.step('Visitor receives confirmation email', async () => {
      // In a real test, you might check an email service or database
      // For now, we'll simulate checking the visit was created
      
      // Navigate to admin dashboard (as staff member)
      const adminPage = await context.newPage()
      await adminPage.goto('/auth/login')
      
      // Login as staff member
      await adminPage.fill('[name="email"]', process.env.TEST_STAFF_EMAIL!)
      await adminPage.fill('[name="password"]', process.env.TEST_STAFF_PASSWORD!)
      await adminPage.click('button[type="submit"]')
      
      // Navigate to visits dashboard
      await adminPage.goto('/admin/visits')
      await expect(adminPage.locator('h1:text("Visit Management")')).toBeVisible()
      
      // Find the newly created visit
      await expect(adminPage.locator(`text=${visitorName}`)).toBeVisible()
      await expect(adminPage.locator(`text=${visitorEmail}`)).toBeVisible()
      await expect(adminPage.locator('text=pastoral')).toBeVisible()
      
      await adminPage.close()
    })

    // Step 8: Staff member approves the visit
    await test.step('Staff approves visit and sends confirmation', async () => {
      const adminPage = await context.newPage()
      await adminPage.goto('/auth/login')
      
      // Login as admin
      await adminPage.fill('[name="email"]', process.env.TEST_ADMIN_EMAIL!)
      await adminPage.fill('[name="password"]', process.env.TEST_ADMIN_PASSWORD!)
      await adminPage.click('button[type="submit"]')
      
      // Navigate to visits dashboard
      await adminPage.goto('/admin/visits')
      
      // Find and approve the visit
      const visitRow = adminPage.locator(`tr:has-text("${visitorName}")`)
      await visitRow.locator('button:text("Approve")').click()
      
      // Confirmation dialog should appear
      await expect(adminPage.locator('[data-testid="confirm-dialog"]')).toBeVisible()
      await adminPage.click('button:text("Confirm Approval")')
      
      // Success message should appear
      await expect(adminPage.locator('text=Visit approved')).toBeVisible()
      
      // Visit status should update
      await expect(visitRow.locator('text=Approved')).toBeVisible()
      
      await adminPage.close()
    })

    // Step 9: Visitor attends the service
    await test.step('Visitor attends service (simulated check-in)', async () => {
      const adminPage = await context.newPage()
      await adminPage.goto('/auth/login')
      
      // Login as staff member
      await adminPage.fill('[name="email"]', process.env.TEST_STAFF_EMAIL!)
      await adminPage.fill('[name="password"]', process.env.TEST_STAFF_PASSWORD!)
      await adminPage.click('button[type="submit"]')
      
      // Navigate to check-in interface
      await adminPage.goto('/admin/visits/checkin')
      
      // Search for visitor
      await adminPage.fill('[placeholder="Search visitors..."]', visitorEmail)
      await adminPage.press('[placeholder="Search visitors..."]', 'Enter')
      
      // Check in the visitor
      const visitorCard = adminPage.locator(`[data-testid="visitor-card"]:has-text("${visitorName}")`)
      await expect(visitorCard).toBeVisible()
      await visitorCard.locator('button:text("Check In")').click()
      
      // Check-in confirmation
      await expect(adminPage.locator('text=Visitor checked in successfully')).toBeVisible()
      
      // Mark visit as completed
      await adminPage.goto('/admin/visits')
      const visitRow = adminPage.locator(`tr:has-text("${visitorName}")`)
      await visitRow.locator('button:text("Mark Complete")').click()
      await adminPage.click('button:text("Confirm")')
      
      await expect(visitRow.locator('text=Completed')).toBeVisible()
      
      await adminPage.close()
    })

    // Step 10: Follow-up sequence is triggered
    await test.step('Automated follow-up sequence is triggered', async () => {
      const adminPage = await context.newPage()
      await adminPage.goto('/auth/login')
      
      // Login as admin
      await adminPage.fill('[name="email"]', process.env.TEST_ADMIN_EMAIL!)
      await adminPage.fill('[name="password"]', process.env.TEST_ADMIN_PASSWORD!)
      await adminPage.click('button[type="submit"]')
      
      // Navigate to follow-up sequences
      await adminPage.goto('/admin/sequences')
      
      // Check that visitor was enrolled in follow-up sequence
      await expect(adminPage.locator('h1:text("Follow-up Sequences")')).toBeVisible()
      await adminPage.fill('[placeholder="Search contacts..."]', visitorEmail)
      
      // Visitor should appear in active sequences
      const sequenceRow = adminPage.locator(`tr:has-text("${visitorName}")`)
      await expect(sequenceRow).toBeVisible()
      await expect(sequenceRow.locator('text=First-time Visitor')).toBeVisible()
      await expect(sequenceRow.locator('text=Active')).toBeVisible()
      
      await adminPage.close()
    })

    // Step 11: Visitor receives follow-up email
    await test.step('Visitor receives follow-up communication', async () => {
      // In a real scenario, you would verify email delivery
      // For now, verify that the sequence step was executed
      
      const adminPage = await context.newPage()
      await adminPage.goto('/auth/login')
      
      await adminPage.fill('[name="email"]', process.env.TEST_ADMIN_EMAIL!)
      await adminPage.fill('[name="password"]', process.env.TEST_ADMIN_PASSWORD!)
      await adminPage.click('button[type="submit"]')
      
      // Check sequence execution history
      await adminPage.goto('/admin/sequences/history')
      
      // Find the follow-up email that was sent
      await expect(adminPage.locator(`text=${visitorEmail}`)).toBeVisible()
      await expect(adminPage.locator('text=Welcome follow-up')).toBeVisible()
      await expect(adminPage.locator('text=Delivered')).toBeVisible()
      
      await adminPage.close()
    })

    // Step 12: Visitor responds positively
    await test.step('Visitor responds to follow-up', async () => {
      // Simulate visitor returning to website and re-engaging via chat
      await page.goto('/')
      
      // Open chat widget again
      await page.click('[data-testid="chat-widget-toggle"]')
      await expect(page.locator('[data-testid="chat-widget"]')).toBeVisible()
      
      // Previous conversation should be available
      await expect(page.locator('text=Welcome back!')).toBeVisible({ timeout: 5000 })
      
      // Send positive feedback message
      const chatInput = page.locator('[placeholder="Type your message..."]')
      await chatInput.fill('Thank you for the warm welcome last Sunday! I really enjoyed the service and would like to learn more about getting involved.')
      await chatInput.press('Enter')
      
      // AI should respond with information about getting involved
      await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible({ timeout: 10000 })
      await expect(page.locator('text=wonderful to hear')).toBeVisible({ timeout: 15000 })
    })

    // Step 13: Visitor gets connected with next steps
    await test.step('Visitor gets connected with next steps', async () => {
      // AI should offer connection to specific ministries or next steps
      await expect(page.locator('text=connect you with')).toBeVisible()
      
      // Visitor can request more information
      const chatInput = page.locator('[placeholder="Type your message..."]')
      await chatInput.fill('I\'m interested in your small groups. Can someone contact me about that?')
      await chatInput.press('Enter')
      
      // AI should create a task for staff follow-up
      await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible({ timeout: 10000 })
      await expect(page.locator('text=someone from our small groups team will reach out')).toBeVisible()
    })

    // Step 14: Analytics tracking verification
    await test.step('Verify analytics are properly tracked', async () => {
      const adminPage = await context.newPage()
      await adminPage.goto('/auth/login')
      
      await adminPage.fill('[name="email"]', process.env.TEST_ADMIN_EMAIL!)
      await adminPage.fill('[name="password"]', process.env.TEST_ADMIN_PASSWORD!)
      await adminPage.click('button[type="submit"]')
      
      // Check analytics dashboard
      await adminPage.goto('/admin/analytics')
      
      // Verify visitor journey events were tracked
      await expect(adminPage.locator('text=Visitor Journeys')).toBeVisible()
      
      // Check that our visitor's journey is recorded
      await adminPage.fill('[placeholder="Search visitors..."]', visitorEmail)
      
      // Journey timeline should show all major events
      const timeline = adminPage.locator('[data-testid="visitor-timeline"]')
      await expect(timeline.locator('text=Chat started')).toBeVisible()
      await expect(timeline.locator('text=Visit scheduled')).toBeVisible()
      await expect(timeline.locator('text=Visit completed')).toBeVisible()
      await expect(timeline.locator('text=Follow-up sent')).toBeVisible()
      await expect(timeline.locator('text=Re-engagement')).toBeVisible()
      
      await adminPage.close()
    })
  })

  test('should handle visitor journey interruption and recovery', async ({ page, context }) => {
    // Test scenario where visitor starts journey but abandons it, then returns later
    await test.step('Visitor starts but abandons conversation', async () => {
      await page.goto('/')
      await page.click('[data-testid="chat-widget-toggle"]')
      
      // Start providing information but don't complete
      await page.fill('[placeholder="Your name"]', visitorName)
      await page.fill('[placeholder="Your email"]', visitorEmail)
      // Don't click "Start Chat" - abandon the process
      
      // Close the widget
      await page.click('[data-testid="chat-widget-close"]')
    })

    await test.step('Visitor returns later and completes journey', async () => {
      // Simulate visitor returning (reload page)
      await page.reload()
      
      // Open chat widget again
      await page.click('[data-testid="chat-widget-toggle"]')
      
      // Information should be pre-filled from localStorage
      await expect(page.locator('[placeholder="Your name"]')).toHaveValue(visitorName)
      await expect(page.locator('[placeholder="Your email"]')).toHaveValue(visitorEmail)
      
      // Complete the process this time
      await page.click('button:text("Start Chat")')
      
      // Continue with conversation
      const chatInput = page.locator('[placeholder="Type your message..."]')
      await chatInput.fill('Hi, I was here earlier but got interrupted. I\'m interested in learning more about your church.')
      await chatInput.press('Enter')
      
      // Should receive appropriate response
      await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 15000 })
    })
  })

  test('should handle mobile visitor journey', async ({ page, context }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await test.step('Mobile visitor completes journey', async () => {
      await page.goto('/')
      
      // Mobile-specific chat widget behavior
      await page.click('[data-testid="chat-widget-toggle-mobile"]')
      
      // Chat should open in fullscreen on mobile
      await expect(page.locator('[data-testid="chat-widget-fullscreen"]')).toBeVisible()
      
      // Complete visitor information
      await page.fill('[placeholder="Your name"]', visitorName)
      await page.fill('[placeholder="Your email"]', visitorEmail)
      await page.click('button:text("Start Chat")')
      
      // Mobile chat interface should be optimized
      const chatInput = page.locator('[placeholder="Type your message..."]')
      await expect(chatInput).toBeVisible()
      
      // Send message
      await chatInput.fill('Hello from mobile!')
      await page.click('[data-testid="send-button-mobile"]')
      
      // Response should appear
      await expect(page.locator('text=Hello from mobile!')).toBeVisible()
      await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible({ timeout: 10000 })
    })
  })

  test('should handle visitor with accessibility needs', async ({ page, context }) => {
    await test.step('Keyboard-only navigation through visitor journey', async () => {
      await page.goto('/')
      
      // Navigate to chat widget using keyboard
      await page.keyboard.press('Tab') // Navigate through page elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      // Assuming chat widget toggle is reachable via tab
      await page.keyboard.press('Enter') // Open chat widget
      
      await expect(page.locator('[data-testid="chat-widget"]')).toBeVisible()
      
      // Fill form using keyboard navigation
      await page.keyboard.press('Tab') // Focus on name input
      await page.keyboard.type(visitorName)
      
      await page.keyboard.press('Tab') // Focus on email input
      await page.keyboard.type(visitorEmail)
      
      await page.keyboard.press('Tab') // Focus on start chat button
      await page.keyboard.press('Enter') // Click start chat
      
      // Continue with keyboard navigation
      await page.keyboard.press('Tab') // Focus on message input
      await page.keyboard.type('Hello, I need assistance with accessibility')
      
      await page.keyboard.press('Enter') // Send message
      
      // Verify screen reader announcements
      const liveRegion = page.locator('[aria-live="polite"]')
      await expect(liveRegion).toContainText('Message sent')
    })
  })
})