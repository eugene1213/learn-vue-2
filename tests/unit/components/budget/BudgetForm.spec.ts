import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BudgetForm from '@/components/budget/BudgetForm.vue'

describe('BudgetForm', () => {
  it('emits trimmed valid budget input through v-model fields', async () => {
    const wrapper = mount(BudgetForm, {
      props: {
        initialValues: { tripId: 'trip_1' },
      },
    })

    await wrapper.get('[data-testid="budget-title-input"]').setValue(' 호텔 ')
    await wrapper.get('[data-testid="budget-category-select"]').setValue('lodging')
    await wrapper.get('[data-testid="budget-amount-input"]').setValue('150000')
    await wrapper.get('[data-testid="budget-date-input"]').setValue('2026-06-10')
    await wrapper.get('[data-testid="budget-memo-input"]').setValue(' 조식 포함 ')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]).toEqual([
      {
        tripId: 'trip_1',
        category: 'lodging',
        title: '호텔',
        amount: 150000,
        spentDate: '2026-06-10',
        memo: '조식 포함',
      },
    ])
  })

  it('shows exact amount validation and blocks submit for non-positive values', async () => {
    const wrapper = mount(BudgetForm, {
      props: {
        initialValues: { tripId: 'trip_1', category: 'lodging', title: '호텔', spentDate: '2026-06-10' },
      },
    })

    await wrapper.get('[data-testid="budget-amount-input"]').setValue('0')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('예산 금액은 1원 이상이어야 합니다.')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('emits cancel for parent-owned form state', async () => {
    const wrapper = mount(BudgetForm)

    await wrapper.findAll('button')[0].trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
