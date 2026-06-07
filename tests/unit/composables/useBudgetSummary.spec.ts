import { ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { useBudgetSummary } from '@/composables/useBudgetSummary'
import type { BudgetItem } from '@/types/budget'

const hotelBudget: BudgetItem = {
  id: 'budget_1',
  tripId: 'trip_1',
  category: 'lodging',
  title: '호텔',
  amount: 150000,
  spentDate: '2026-06-10',
  memo: '',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

describe('useBudgetSummary', () => {
  it('computes trip total and category totals without mutating source items', () => {
    const budgets = ref<BudgetItem[]>([
      hotelBudget,
      { ...hotelBudget, id: 'budget_2', category: 'food', title: '점심', amount: 12000 },
      { ...hotelBudget, id: 'budget_3', tripId: 'trip_2', category: 'transport', title: '기차', amount: 50000 },
    ])
    const originalBudgets = budgets.value.map((budget) => ({ ...budget }))
    const summary = useBudgetSummary(budgets, 'trip_1')

    expect(summary.tripBudgets.value).toHaveLength(2)
    expect(summary.totalAmount.value).toBe(162000)
    expect(summary.categoryTotals.value).toMatchObject({ lodging: 150000, food: 12000, transport: 0 })
    expect(summary.totalByTrip('trip_2')).toBe(50000)
    expect(summary.categoryTotalsByTrip('trip_2')).toMatchObject({ transport: 50000, lodging: 0 })
    expect(budgets.value).toEqual(originalBudgets)
  })

  it('reacts when the source budget list changes', () => {
    const budgets = ref<BudgetItem[]>([hotelBudget])
    const summary = useBudgetSummary(budgets, 'trip_1')

    budgets.value = [...budgets.value, { ...hotelBudget, id: 'budget_2', category: 'activity', amount: 30000 }]

    expect(summary.totalAmount.value).toBe(180000)
    expect(summary.categoryTotals.value.activity).toBe(30000)
  })
})
