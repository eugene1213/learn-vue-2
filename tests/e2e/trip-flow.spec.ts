import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.clear()
  })
})

test('shows empty trip list state', async ({ page }) => {
  await page.goto('/trips')

  await expect(page.getByText('아직 등록된 여행이 없습니다.')).toBeVisible()
  await expect(page.getByTestId('trip-create-link')).toBeVisible()
  await page.screenshot({ path: '.sisyphus/evidence/task-5-trip-empty.png', fullPage: true })
})

test('rejects empty trip title without creating a trip', async ({ page }) => {
  await page.goto('/trips/new')

  await page.getByTestId('trip-destination-input').fill('서울')
  await page.getByTestId('trip-start-date-input').fill('2026-06-10')
  await page.getByTestId('trip-end-date-input').fill('2026-06-12')
  await page.getByTestId('trip-submit-button').click()

  await expect(page.getByText('여행 이름을 입력하세요.')).toBeVisible()
  await page.screenshot({ path: '.sisyphus/evidence/task-5-trip-validation.png', fullPage: true })
  await page.goto('/trips')
  await expect(page.getByText('아직 등록된 여행이 없습니다.')).toBeVisible()
})

test('creates a trip and preserves it after reload', async ({ page }) => {
  await createSeoulTrip(page)

  await expect(page.getByRole('heading', { name: 'Seoul Weekend' })).toBeVisible()
  await page.screenshot({ path: '.sisyphus/evidence/task-5-trip-create.png', fullPage: true })
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Seoul Weekend' })).toBeVisible()
  await page.screenshot({ path: '.sisyphus/evidence/task-5-trip-reload.png', fullPage: true })
})

test('shows safe Korean not-found state for invalid trip id', async ({ page }) => {
  await page.goto('/trips/not-found-id')

  await expect(page.getByText('여행을 찾을 수 없습니다.')).toBeVisible()
  await expect(page.getByRole('link', { name: '여행 목록으로 돌아가기' })).toBeVisible()
  await page.screenshot({ path: '.sisyphus/evidence/task-5-trip-not-found.png', fullPage: true })
})

test('cancels and confirms trip deletion', async ({ page }) => {
  await createSeoulTrip(page)

  await page.getByRole('button', { name: '삭제' }).click()
  await expect(page.getByTestId('trip-delete-modal')).toBeVisible()
  await page.getByTestId('trip-delete-modal').getByRole('button', { name: '취소' }).click()
  await expect(page.getByRole('heading', { name: 'Seoul Weekend' })).toBeVisible()

  await page.getByRole('button', { name: '삭제' }).click()
  await page.getByTestId('trip-delete-modal').getByRole('button', { name: '삭제' }).click()
  await expect(page).toHaveURL(/\/trips$/)
  await expect(page.getByText('아직 등록된 여행이 없습니다.')).toBeVisible()
  await page.screenshot({ path: '.sisyphus/evidence/task-5-trip-delete.png', fullPage: true })
})

test('adds, edits, cancels delete, and deletes a schedule for a trip', async ({ page }) => {
  await createSeoulTrip(page)
  await page.getByRole('link', { name: '일정 관리 보기' }).click()

  await expect(page.getByRole('heading', { name: 'Seoul Weekend' })).toBeVisible()
  await expect(page.getByText('등록된 일정이 없습니다.')).toBeVisible()

  await page.getByTestId('schedule-add-button').click()
  await page.getByTestId('schedule-submit-button').click()
  await expect(page.getByText('일정 제목을 입력하세요.')).toBeVisible()
  await expect(page.getByText('일정 날짜를 선택하세요.')).toBeVisible()
  await page.getByTestId('schedule-title-input').fill('광화문 방문')
  await page.getByTestId('schedule-date-input').fill('2026-06-10')
  await page.getByTestId('schedule-time-input').fill('10:00')
  await page.getByTestId('schedule-submit-button').click()

  await expect(page.getByText('광화문 방문')).toBeVisible()
  await expect(page.getByText('10:00')).toBeVisible()
  await page.screenshot({ path: '.sisyphus/evidence/task-6-schedule-add.png', fullPage: true })

  await page.getByRole('button', { name: '수정' }).click()
  await page.getByTestId('schedule-title-input').fill('경복궁 방문')
  await page.getByTestId('schedule-submit-button').click()
  await expect(page.getByText('경복궁 방문')).toBeVisible()
  await expect(page.getByText('광화문 방문')).toBeHidden()

  await page.getByRole('button', { name: '삭제' }).click()
  await expect(page.getByTestId('schedule-delete-modal')).toBeVisible()
  await page.getByTestId('schedule-delete-modal').getByRole('button', { name: '취소' }).click()
  await expect(page.getByText('경복궁 방문')).toBeVisible()

  await page.getByRole('button', { name: '삭제' }).click()
  await page.getByTestId('schedule-delete-modal').getByRole('button', { name: '삭제' }).click()
  await expect(page.getByText('등록된 일정이 없습니다.')).toBeVisible()
  await page.getByRole('link', { name: '여행 상세로 돌아가기' }).click()
  await expect(page.getByRole('heading', { name: 'Seoul Weekend' })).toBeVisible()
})

test('shows safe Korean not-found state for invalid schedule trip id', async ({ page }) => {
  await page.goto('/trips/not-found-id/schedule')

  await expect(page.getByText('여행을 찾을 수 없습니다.')).toBeVisible()
  await expect(page.getByRole('link', { name: '여행 목록으로 돌아가기' })).toBeVisible()
  await page.screenshot({ path: '.sisyphus/evidence/task-6-schedule-invalid-trip.png', fullPage: true })
})

test('adds, edits, cancels delete, and deletes a budget item for a trip', async ({ page }) => {
  await createSeoulTrip(page)
  await page.getByRole('link', { name: '예산 관리 보기' }).click()

  await expect(page.getByRole('heading', { name: 'Seoul Weekend' })).toBeVisible()
  await expect(page.getByTestId('budget-total')).toHaveText('0원')
  await expect(page.getByText('등록된 예산 항목이 없습니다.')).toBeVisible()

  await page.getByTestId('budget-add-button').click()
  await page.getByTestId('budget-title-input').fill('호텔')
  await page.getByTestId('budget-category-select').selectOption('lodging')
  await page.getByTestId('budget-amount-input').fill('0')
  await page.getByTestId('budget-date-input').fill('2026-06-10')
  await page.getByTestId('budget-submit-button').click()
  await expect(page.getByText('예산 금액은 1원 이상이어야 합니다.')).toBeVisible()
  await expect(page.getByTestId('budget-total')).toHaveText('0원')
  await page.screenshot({ path: '.sisyphus/evidence/task-7-budget-validation.png', fullPage: true })

  await page.getByTestId('budget-amount-input').fill('150000')
  await page.getByTestId('budget-submit-button').click()
  const budgetItem = page.getByTestId('budget-list-item')
  await expect(budgetItem.getByText('호텔')).toBeVisible()
  await expect(budgetItem.getByText('숙박')).toBeVisible()
  await expect(page.getByTestId('budget-total')).toHaveText('150,000원')
  await expect(page.getByText('150,000원').first()).toBeVisible()
  await page.screenshot({ path: '.sisyphus/evidence/task-7-budget-add.png', fullPage: true })

  await page.getByRole('button', { name: '수정' }).click()
  await page.getByTestId('budget-title-input').fill('호텔 조식 포함')
  await page.getByTestId('budget-amount-input').fill('200000')
  await page.getByTestId('budget-submit-button').click()
  await expect(page.getByText('호텔 조식 포함')).toBeVisible()
  await expect(page.getByText('호텔', { exact: true })).toBeHidden()
  await expect(page.getByTestId('budget-total')).toHaveText('200,000원')

  await page.getByRole('button', { name: '삭제' }).click()
  await expect(page.getByTestId('budget-delete-modal')).toBeVisible()
  await page.getByTestId('budget-delete-modal').getByRole('button', { name: '취소' }).click()
  await expect(page.getByText('호텔 조식 포함')).toBeVisible()

  await page.getByRole('button', { name: '삭제' }).click()
  await page.getByTestId('budget-delete-modal').getByRole('button', { name: '삭제' }).click()
  await expect(page.getByText('등록된 예산 항목이 없습니다.')).toBeVisible()
  await expect(page.getByTestId('budget-total')).toHaveText('0원')
})

test('shows safe Korean not-found state for invalid budget trip id', async ({ page }) => {
  await page.goto('/trips/not-found-id/budget')

  await expect(page.getByText('여행을 찾을 수 없습니다.')).toBeVisible()
  await expect(page.getByRole('link', { name: '여행 목록으로 돌아가기' })).toBeVisible()
  await page.screenshot({ path: '.sisyphus/evidence/task-7-budget-invalid-trip.png', fullPage: true })
})

test('shows safe Korean catch-all page for an invalid route', async ({ page }) => {
  await page.goto('/unknown/mvp-route')

  await expect(page.getByRole('heading', { name: '페이지를 찾을 수 없습니다.' })).toBeVisible()
  await expect(page.getByRole('link', { name: '여행 목록으로 돌아가기' })).toBeVisible()
})

test('completes full MVP flow from trip creation to dashboard summary', async ({ page }) => {
  await page.goto('/trips/new')
  await page.getByTestId('trip-submit-button').click()
  await expect(page.getByText('여행 이름을 입력하세요.')).toBeVisible()

  await page.getByTestId('trip-title-input').fill('Seoul Weekend')
  await page.getByTestId('trip-destination-input').fill('서울')
  await page.getByTestId('trip-start-date-input').fill('2026-06-10')
  await page.getByTestId('trip-end-date-input').fill('2026-06-12')
  await page.getByTestId('trip-description-input').fill('주말 여행')
  await page.getByTestId('trip-submit-button').click()
  await expect(page.getByRole('heading', { name: 'Seoul Weekend' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Seoul Weekend' })).toBeVisible()

  await addGwanghwamunSchedule(page)
  await addHotelBudget(page)
  await page.goto('/')

  await expect(page.getByTestId('dashboard-trip-count')).toContainText('1')
  await expect(page.getByTestId('dashboard-upcoming-count')).toContainText('1')
  await expect(page.getByTestId('dashboard-budget-total')).toContainText('150,000원')
  await expect(page.getByTestId('dashboard-active-trips').getByRole('link', { name: 'Seoul Weekend' })).toBeVisible()
  await expect(page.getByTestId('dashboard-upcoming-list').getByText('광화문 방문')).toBeVisible()
  await page.screenshot({ path: '.sisyphus/evidence/task-9-full-mvp-happy.png', fullPage: true })
})

test('deleting a trip cascades related schedules and budgets in browser storage', async ({ page }) => {
  await createSeoulTrip(page)
  const tripId = currentTripId(page)
  await addGwanghwamunSchedule(page)
  await addHotelBudget(page)

  await page.goto(`/trips/${tripId}`)
  await page.getByRole('button', { name: '삭제' }).click()
  await page.getByTestId('trip-delete-modal').getByRole('button', { name: '삭제' }).click()
  await expect(page).toHaveURL(/\/trips$/)
  await expect(page.getByText('아직 등록된 여행이 없습니다.')).toBeVisible()

  const storageSnapshot = await page.evaluate(() => {
    const readCollection = (key: string): Array<Record<string, unknown>> => {
      const rawValue = window.localStorage.getItem(key)
      if (rawValue === null) {
        return []
      }

      const parsedValue = JSON.parse(rawValue) as unknown
      if (!Array.isArray(parsedValue)) {
        return []
      }

      return parsedValue.filter((value): value is Record<string, unknown> => {
        return typeof value === 'object' && value !== null
      })
    }

    const trips = readCollection('trip-planner:trips:v1')
    const schedules = readCollection('trip-planner:schedules:v1')
    const budgets = readCollection('trip-planner:budgets:v1')

    return {
      tripIds: trips.map((trip) => String(trip.id ?? '')),
      scheduleTripIds: schedules.map((schedule) => String(schedule.tripId ?? '')),
      budgetTripIds: budgets.map((budget) => String(budget.tripId ?? '')),
    }
  })

  expect(storageSnapshot.tripIds).not.toContain(tripId)
  expect(storageSnapshot.scheduleTripIds).not.toContain(tripId)
  expect(storageSnapshot.budgetTripIds).not.toContain(tripId)
  await mkdir('.sisyphus/evidence', { recursive: true })
  await writeFile(
    '.sisyphus/evidence/task-9-delete-cascade.txt',
    [
      `deletedTripId=${tripId}`,
      `remainingTripIds=${storageSnapshot.tripIds.join(',') || '(none)'}`,
      `remainingScheduleTripIds=${storageSnapshot.scheduleTripIds.join(',') || '(none)'}`,
      `remainingBudgetTripIds=${storageSnapshot.budgetTripIds.join(',') || '(none)'}`,
      'result=deleted trip id is absent from trip, schedule, and budget storage records',
    ].join('\n'),
  )
})

test('loads sample dashboard data, persists theme, and resets planner data', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.getByText('여행을 추가하고 일정을 계획해보세요.')).toBeVisible()

  await page.goto('/settings')
  await expect(page.getByTestId('settings-currency')).toHaveText('KRW')
  await page.getByTestId('settings-theme-dark').check()
  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.getByTestId('settings-theme-dark')).toBeChecked()
  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-theme', 'dark')

  await page.getByTestId('settings-sample-data-button').click()
  await expect(page.getByText('샘플 데이터가 추가되었습니다.')).toBeVisible()
  await page.goto('/')
  await expect(page.getByTestId('dashboard-trip-count')).toContainText('1')
  await expect(page.getByTestId('dashboard-upcoming-count')).toContainText('1')
  await expect(page.getByTestId('dashboard-budget-total')).toContainText('150,000원')
  await expect(page.getByRole('link', { name: 'Seoul Weekend' })).toBeVisible()
  await expect(page.getByText('광화문 방문')).toBeVisible()
  await page.screenshot({ path: '.sisyphus/evidence/task-8-dashboard-sample.png', fullPage: true })
  await page.screenshot({ path: '.sisyphus/evidence/task-8-responsive-desktop.png', fullPage: true })

  await page.setViewportSize({ width: 375, height: 900 })
  await page.screenshot({ path: '.sisyphus/evidence/task-8-responsive-mobile.png', fullPage: true })

  await page.goto('/settings')
  await page.getByTestId('settings-reset-data-button').click()
  await expect(page.getByTestId('settings-reset-modal')).toBeVisible()
  await page.getByTestId('settings-reset-confirm-button').click()
  await expect(page.getByText('여행 데이터가 초기화되었습니다.')).toBeVisible()
  await page.goto('/')
  await expect(page.getByText('여행을 추가하고 일정을 계획해보세요.')).toBeVisible()
  await page.screenshot({ path: '.sisyphus/evidence/task-8-settings-reset.png', fullPage: true })
})

async function createSeoulTrip(page: Page) {
  await page.goto('/trips')
  await page.getByTestId('trip-create-link').click()
  await page.getByTestId('trip-title-input').fill('Seoul Weekend')
  await page.getByTestId('trip-destination-input').fill('서울')
  await page.getByTestId('trip-start-date-input').fill('2026-06-10')
  await page.getByTestId('trip-end-date-input').fill('2026-06-12')
  await page.getByTestId('trip-description-input').fill('주말 여행')
  await page.getByTestId('trip-submit-button').click()
  await expect(page.getByRole('heading', { name: 'Seoul Weekend' })).toBeVisible()
}

async function addGwanghwamunSchedule(page: Page) {
  await page.getByRole('link', { name: '일정 관리 보기' }).click()
  await page.getByTestId('schedule-add-button').click()
  await page.getByTestId('schedule-submit-button').click()
  await expect(page.getByText('일정 제목을 입력하세요.')).toBeVisible()
  await expect(page.getByText('일정 날짜를 선택하세요.')).toBeVisible()
  await page.getByTestId('schedule-title-input').fill('광화문 방문')
  await page.getByTestId('schedule-date-input').fill('2026-06-10')
  await page.getByTestId('schedule-time-input').fill('10:00')
  await page.getByTestId('schedule-submit-button').click()
  await expect(page.getByText('광화문 방문')).toBeVisible()
}

async function addHotelBudget(page: Page) {
  await page.getByRole('link', { name: '여행 상세로 돌아가기' }).click()
  await page.getByRole('link', { name: '예산 관리 보기' }).click()
  await page.getByTestId('budget-add-button').click()
  await page.getByTestId('budget-title-input').fill('호텔')
  await page.getByTestId('budget-category-select').selectOption('lodging')
  await page.getByTestId('budget-amount-input').fill('0')
  await page.getByTestId('budget-date-input').fill('2026-06-10')
  await page.getByTestId('budget-submit-button').click()
  await expect(page.getByText('예산 금액은 1원 이상이어야 합니다.')).toBeVisible()
  await page.getByTestId('budget-amount-input').fill('150000')
  await page.getByTestId('budget-submit-button').click()
  await expect(page.getByTestId('budget-list-item').getByText('호텔')).toBeVisible()
  await expect(page.getByTestId('budget-total')).toHaveText('150,000원')
}

function currentTripId(page: Page): string {
  const url = new URL(page.url())
  return url.pathname.split('/').filter(Boolean).at(1) ?? ''
}
