import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createSchedule, deleteSchedule, getSchedulesByTrip, updateSchedule } from '@/api/schedules.api'
import { storageKeys } from '@/api/mockStorage'

describe('schedules api', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to an empty list when schedule JSON is malformed', async () => {
    localStorage.setItem(storageKeys.schedules, '{bad json')

    await expect(getSchedulesByTrip('trip_1')).resolves.toEqual([])
  })

  it('creates, updates, and deletes schedules by trip', async () => {
    const createdSchedule = await createSchedule({
      tripId: 'trip_1',
      date: '2026-06-12',
      time: '09:00',
      title: '카페 방문',
      location: '성수',
      memo: '예약 확인',
    })

    await expect(getSchedulesByTrip('trip_1')).resolves.toEqual([createdSchedule])

    const updatedSchedule = await updateSchedule(createdSchedule.id, { title: '카페와 전시 방문' })
    expect(updatedSchedule.title).toBe('카페와 전시 방문')
    await expect(getSchedulesByTrip('trip_1')).resolves.toEqual([updatedSchedule])

    await deleteSchedule(createdSchedule.id)
    await expect(getSchedulesByTrip('trip_1')).resolves.toEqual([])
  })

  it('rejects with a typed storage error when creating a schedule cannot write', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })

    await expect(
      createSchedule({
        tripId: 'trip_1',
        date: '2026-06-12',
        time: '09:00',
        title: '카페 방문',
        location: '성수',
        memo: '예약 확인',
      }),
    ).rejects.toMatchObject({
      code: 'storage_write_failed',
      message: '브라우저 저장소 용량 또는 권한 문제로 저장에 실패했습니다.',
    })
  })
})
