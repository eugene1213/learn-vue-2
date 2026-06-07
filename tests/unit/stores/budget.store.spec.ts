import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createBudget, deleteBudget, getBudgetsByTrip, updateBudget } from '@/api/budgets.api'
import { useBudgetStore } from '@/stores/budget.store'
import type { BudgetItem, CreateBudgetInput } from '@/types/budget'

vi.mock('@/api/budgets.api', () => ({
  getBudgetsByTrip: vi.fn(),
  createBudget: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
}))

const budgetInput: CreateBudgetInput = {
  tripId: 'trip_1',
  category: 'lodging',
  title: '호텔',
  amount: 150000,
  spentDate: '2026-06-10',
  memo: '2박',
}

const hotelBudget: BudgetItem = {
  ...budgetInput,
  id: 'budget_1',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

describe('budget store', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  it('fetches budgets and computes totals by trip and category', async () => {
    const foodBudget: BudgetItem = { ...hotelBudget, id: 'budget_2', category: 'food', title: '점심', amount: 12000 }
    vi.mocked(getBudgetsByTrip).mockResolvedValue([hotelBudget, foodBudget])
    const store = useBudgetStore()

    await store.fetchBudgetsByTrip('trip_1')

    expect(store.getByTripId('trip_1')).toEqual([hotelBudget, foodBudget])
    expect(store.totalByTripId('trip_1')).toBe(162000)
    expect(store.categoryTotalsByTripId('trip_1')).toMatchObject({ lodging: 150000, food: 12000 })
    expect(store.errorMessage).toBeNull()
  })

  it('creates, updates, and deletes budgets through the API', async () => {
    vi.mocked(createBudget).mockResolvedValue(hotelBudget)
    vi.mocked(updateBudget).mockResolvedValue({ ...hotelBudget, amount: 160000 })
    vi.mocked(deleteBudget).mockResolvedValue()
    const store = useBudgetStore()

    await expect(store.createBudget(budgetInput)).resolves.toEqual(hotelBudget)
    await expect(store.updateBudget(hotelBudget.id, { amount: 160000 })).resolves.toMatchObject({ amount: 160000 })
    await expect(store.deleteBudget(hotelBudget.id)).resolves.toBe(true)

    expect(store.budgets).toEqual([])
  })

  it('captures API errors without uncaught callers', async () => {
    vi.mocked(getBudgetsByTrip).mockRejectedValue(new Error('예산 조회 실패'))
    const store = useBudgetStore()

    await expect(store.fetchBudgetsByTrip('trip_1')).resolves.toBeUndefined()

    expect(store.errorMessage).toBe('예산 조회 실패')
    expect(store.isLoading).toBe(false)
  })
})
