import { describe, expect, it, vi } from 'vitest'

import { useBudgetForm } from '@/composables/useBudgetForm'

describe('useBudgetForm', () => {
  it('validates required fields and positive integer amount with Korean messages', () => {
    const { form, errors, validate } = useBudgetForm({ amount: '0' })

    expect(validate()).toBe(false)
    expect(errors.title).toBe('예산 항목명을 입력하세요.')
    expect(errors.category).toBe('예산 카테고리를 선택하세요.')
    expect(errors.spentDate).toBe('지출 날짜를 선택하세요.')
    expect(errors.amount).toBe('예산 금액은 1원 이상이어야 합니다.')

    form.amount = '1.5'
    expect(validate()).toBe(false)
    expect(errors.amount).toBe('예산 금액은 1원 이상이어야 합니다.')
  })

  it('submits valid budget input and resets state', async () => {
    const { form, parsedAmount, submit, reset } = useBudgetForm({
      tripId: 'trip_1',
      category: 'lodging',
      title: ' 호텔 ',
      amount: '150000',
      spentDate: '2026-06-10',
      memo: ' 2박 ',
    })
    const onValid = vi.fn()

    expect(parsedAmount.value).toBe(150000)
    await expect(submit(onValid)).resolves.toBe(true)

    expect(onValid).toHaveBeenCalledWith({
      tripId: 'trip_1',
      category: 'lodging',
      title: '호텔',
      amount: 150000,
      spentDate: '2026-06-10',
      memo: '2박',
    })

    reset({ tripId: 'trip_1' })
    expect(form.tripId).toBe('trip_1')
    expect(form.amount).toBe('')
  })
})
