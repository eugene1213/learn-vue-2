import { describe, expect, it, vi } from 'vitest'

import { useTripForm } from '@/composables/useTripForm'

describe('useTripForm', () => {
  it('validates required fields and date order with Korean messages', () => {
    const { form, errors, validate } = useTripForm()

    expect(validate()).toBe(false)
    expect(errors.title).toBe('여행 이름을 입력하세요.')
    expect(errors.destination).toBe('여행지를 입력하세요.')

    form.title = 'Seoul Weekend'
    form.destination = '서울'
    form.startDate = '2026-06-10'
    form.endDate = '2026-06-01'

    expect(validate()).toBe(false)
    expect(errors.startDate).toBe('시작일은 종료일보다 늦을 수 없습니다.')
  })

  it('submits trimmed valid input and resets form state', async () => {
    const { form, errors, submit, reset, toInput } = useTripForm({
      title: ' Seoul Weekend ',
      destination: ' 서울 ',
      startDate: '2026-06-10',
      endDate: '2026-06-12',
      description: ' 주말 여행 ',
    })
    const onValid = vi.fn()

    await expect(submit(onValid)).resolves.toBe(true)

    expect(onValid).toHaveBeenCalledWith({
      title: 'Seoul Weekend',
      destination: '서울',
      startDate: '2026-06-10',
      endDate: '2026-06-12',
      description: '주말 여행',
      status: 'planned',
    })
    expect(toInput().title).toBe('Seoul Weekend')

    reset({ destination: '부산' })
    expect(form.title).toBe('')
    expect(form.destination).toBe('부산')
    expect(errors.title).toBeUndefined()
  })
})
