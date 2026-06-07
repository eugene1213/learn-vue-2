import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createBudget, deleteBudget, getBudgetsByTrip, updateBudget } from '@/api/budgets.api'
import { storageKeys } from '@/api/mockStorage'

describe('budgets api', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to an empty list when budget JSON is malformed', async () => {
    localStorage.setItem(storageKeys.budgets, '{bad json')

    await expect(getBudgetsByTrip('trip_1')).resolves.toEqual([])
  })

  it('creates, updates, and deletes budgets by trip', async () => {
    const createdBudget = await createBudget({
      tripId: 'trip_1',
      category: 'food',
      title: '저녁 식사',
      amount: 25000,
      spentDate: '2026-06-12',
      memo: '한식',
    })

    await expect(getBudgetsByTrip('trip_1')).resolves.toEqual([createdBudget])

    const updatedBudget = await updateBudget(createdBudget.id, { amount: 28000 })
    expect(updatedBudget.amount).toBe(28000)
    await expect(getBudgetsByTrip('trip_1')).resolves.toEqual([updatedBudget])

    await deleteBudget(createdBudget.id)
    await expect(getBudgetsByTrip('trip_1')).resolves.toEqual([])
  })

  it('rejects with a typed storage error when creating a budget cannot write', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })

    await expect(
      createBudget({
        tripId: 'trip_1',
        category: 'food',
        title: '저녁 식사',
        amount: 25000,
        spentDate: '2026-06-12',
        memo: '한식',
      }),
    ).rejects.toMatchObject({
      code: 'storage_write_failed',
      message: '브라우저 저장소 용량 또는 권한 문제로 저장에 실패했습니다.',
    })
  })
})
