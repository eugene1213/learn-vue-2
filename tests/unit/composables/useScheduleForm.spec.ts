import { describe, expect, it, vi } from 'vitest'

import { useScheduleForm } from '@/composables/useScheduleForm'

describe('useScheduleForm', () => {
  it('validates title and date with exact Korean messages', () => {
    const { errors, validate } = useScheduleForm()

    expect(validate()).toBe(false)
    expect(errors.title).toBe('일정 제목을 입력하세요.')
    expect(errors.date).toBe('일정 날짜를 선택하세요.')
  })

  it('submits valid schedule input and resets state', async () => {
    const { form, submit, reset } = useScheduleForm({
      tripId: 'trip_1',
      date: '2026-06-10',
      time: '10:00',
      title: ' 광화문 방문 ',
      location: ' 광화문 ',
      memo: ' 입장권 확인 ',
    })
    const onValid = vi.fn()

    await expect(submit(onValid)).resolves.toBe(true)

    expect(onValid).toHaveBeenCalledWith({
      tripId: 'trip_1',
      date: '2026-06-10',
      time: '10:00',
      title: '광화문 방문',
      location: '광화문',
      memo: '입장권 확인',
    })

    reset({ tripId: 'trip_1' })
    expect(form.tripId).toBe('trip_1')
    expect(form.title).toBe('')
  })
})
