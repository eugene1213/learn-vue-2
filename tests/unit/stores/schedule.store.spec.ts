import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSchedule, deleteSchedule, getSchedulesByTrip, updateSchedule } from '@/api/schedules.api'
import { useScheduleStore } from '@/stores/schedule.store'
import type { CreateScheduleInput, ScheduleItem } from '@/types/schedule'

vi.mock('@/api/schedules.api', () => ({
  getSchedulesByTrip: vi.fn(),
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  deleteSchedule: vi.fn(),
}))

const scheduleInput: CreateScheduleInput = {
  tripId: 'trip_1',
  date: '2026-06-10',
  time: '10:00',
  title: '광화문 방문',
  location: '광화문',
  memo: '입장권 확인',
}

const scheduleItem: ScheduleItem = {
  ...scheduleInput,
  id: 'schedule_1',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

describe('schedule store', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  it('fetches and filters schedules by trip', async () => {
    vi.mocked(getSchedulesByTrip).mockResolvedValue([scheduleItem])
    const store = useScheduleStore()

    await store.fetchSchedulesByTrip('trip_1')

    expect(getSchedulesByTrip).toHaveBeenCalledWith('trip_1')
    expect(store.getByTripId('trip_1')).toEqual([scheduleItem])
    expect(store.getByTripId('trip_2')).toEqual([])
    expect(store.errorMessage).toBeNull()
  })

  it('sorts schedules by date and time without changing unrelated trips', () => {
    const store = useScheduleStore()
    const laterSchedule: ScheduleItem = { ...scheduleItem, id: 'schedule_2', time: '14:00' }
    const otherTripSchedule: ScheduleItem = { ...scheduleItem, id: 'schedule_3', tripId: 'trip_2', time: '09:00' }
    store.schedules = [laterSchedule, otherTripSchedule, scheduleItem]

    expect(store.sortedByTripId('trip_1')).toEqual([scheduleItem, laterSchedule])
    expect(store.getByTripId('trip_2')).toEqual([otherTripSchedule])
  })

  it('creates, updates, and deletes schedules through the API', async () => {
    vi.mocked(createSchedule).mockResolvedValue(scheduleItem)
    vi.mocked(updateSchedule).mockResolvedValue({ ...scheduleItem, title: '경복궁 방문' })
    vi.mocked(deleteSchedule).mockResolvedValue()
    const store = useScheduleStore()

    await expect(store.createSchedule(scheduleInput)).resolves.toEqual(scheduleItem)
    await expect(store.updateSchedule(scheduleItem.id, { title: '경복궁 방문' })).resolves.toMatchObject({
      title: '경복궁 방문',
    })
    await expect(store.deleteSchedule(scheduleItem.id)).resolves.toBe(true)

    expect(store.schedules).toEqual([])
  })

  it('captures action errors and clears loading', async () => {
    vi.mocked(createSchedule).mockRejectedValue(new Error('일정 저장 실패'))
    const store = useScheduleStore()

    await expect(store.createSchedule(scheduleInput)).resolves.toBeNull()

    expect(store.errorMessage).toBe('일정 저장 실패')
    expect(store.isLoading).toBe(false)
  })
})
