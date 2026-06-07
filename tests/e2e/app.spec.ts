import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.clear()
  })
})

test('shows the Korean app smoke text on the home route', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('app-title')).toHaveText('여행 플래너')
  await expect(page.getByTestId('app-smoke-text')).toContainText(
    'Vue 3 여행 계획 앱이 준비되었습니다.',
  )
})
