import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BudgetSummary from '@/components/budget/BudgetSummary.vue'
import type { BudgetItem } from '@/types/budget'

const budgets: BudgetItem[] = [
  {
    id: 'budget_1',
    tripId: 'trip_1',
    category: 'lodging',
    title: '호텔',
    amount: 150000,
    spentDate: '2026-06-10',
    memo: '',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'budget_2',
    tripId: 'trip_1',
    category: 'food',
    title: '저녁',
    amount: 35000,
    spentDate: '2026-06-10',
    memo: '',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'budget_3',
    tripId: 'trip_2',
    category: 'transport',
    title: '기차',
    amount: 70000,
    spentDate: '2026-06-11',
    memo: '',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
]

describe('BudgetSummary', () => {
  it('renders total and category totals for the selected trip without mutating source items', () => {
    const originalOrder = budgets.map((budget) => budget.id)
    const wrapper = mount(BudgetSummary, {
      props: {
        budgets,
        tripId: 'trip_1',
      },
    })

    expect(wrapper.get('[data-testid="budget-total"]').text()).toBe('185,000원')
    expect(wrapper.text()).toContain('숙박')
    expect(wrapper.text()).toContain('150,000원')
    expect(wrapper.text()).toContain('식비')
    expect(wrapper.text()).toContain('35,000원')
    expect(wrapper.text()).toContain('교통')
    expect(wrapper.text()).toContain('0원')
    expect(budgets.map((budget) => budget.id)).toEqual(originalOrder)
  })
})
