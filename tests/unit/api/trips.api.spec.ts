import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createBudget, getBudgetsByTrip } from '@/api/budgets.api'
import { createSchedule, getSchedulesByTrip } from '@/api/schedules.api'
import { storageKeys } from '@/api/mockStorage'
import { createTrip, deleteTrip, getTrips, updateTrip } from '@/api/trips.api'
import type { CreateTripInput, Trip } from '@/types/trip'

const seoulTripInput: CreateTripInput = {
  title: 'Seoul Weekend',
  destination: 'Seoul',
  startDate: '2026-06-12',
  endDate: '2026-06-14',
  description: '주말 서울 여행',
  status: 'planned',
}

describe('trips api', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an empty list when trip storage is empty', async () => {
    await expect(getTrips()).resolves.toEqual([])
  })

  it('reads valid trip storage', async () => {
    const storedTrip: Trip = {
      ...seoulTripInput,
      id: 'trip_stored',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    }
    localStorage.setItem(storageKeys.trips, JSON.stringify([storedTrip]))

    await expect(getTrips()).resolves.toEqual([storedTrip])
  })

  it('falls back to an empty list when trip JSON is malformed', async () => {
    localStorage.setItem(storageKeys.trips, '{bad json')

    await expect(getTrips()).resolves.toEqual([])
  })

  it('falls back to an empty list when storage access is unavailable', async () => {
    vi.spyOn(globalThis, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('storage access blocked')
    })

    await expect(getTrips()).resolves.toEqual([])
  })

  it('rejects with a typed storage error when creating a trip cannot write', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })

    await expect(createTrip(seoulTripInput)).rejects.toMatchObject({
      code: 'storage_write_failed',
      message: '브라우저 저장소 용량 또는 권한 문제로 저장에 실패했습니다.',
    })
  })

  it('creates, updates, and deletes a trip', async () => {
    const createdTrip = await createTrip(seoulTripInput)

    expect(createdTrip.id).toContain('trip_')
    expect(createdTrip.title).toBe('Seoul Weekend')
    await expect(getTrips()).resolves.toEqual([createdTrip])

    const updatedTrip = await updateTrip(createdTrip.id, { title: 'Seoul Spring Weekend' })
    expect(updatedTrip.title).toBe('Seoul Spring Weekend')
    await expect(getTrips()).resolves.toEqual([updatedTrip])

    await deleteTrip(createdTrip.id)
    await expect(getTrips()).resolves.toEqual([])
  })

  it('deleting a trip cascades related schedules and budgets only', async () => {
    const targetTrip = await createTrip(seoulTripInput)
    const otherTrip = await createTrip({
      ...seoulTripInput,
      title: 'Busan Weekend',
      destination: 'Busan',
    })

    const targetSchedule = await createSchedule({
      tripId: targetTrip.id,
      date: '2026-06-12',
      time: '10:00',
      title: '경복궁 산책',
      location: '경복궁',
      memo: '입장권 확인',
    })
    const otherSchedule = await createSchedule({
      tripId: otherTrip.id,
      date: '2026-06-13',
      time: '11:00',
      title: '해운대 산책',
      location: '해운대',
      memo: '',
    })
    const targetBudget = await createBudget({
      tripId: targetTrip.id,
      category: 'activity',
      title: '입장권',
      amount: 3000,
      spentDate: '2026-06-12',
      memo: '',
    })
    const otherBudget = await createBudget({
      tripId: otherTrip.id,
      category: 'food',
      title: '점심',
      amount: 12000,
      spentDate: '2026-06-13',
      memo: '',
    })

    await deleteTrip(targetTrip.id)

    await expect(getSchedulesByTrip(targetTrip.id)).resolves.toEqual([])
    await expect(getBudgetsByTrip(targetTrip.id)).resolves.toEqual([])
    await expect(getSchedulesByTrip(otherTrip.id)).resolves.toEqual([otherSchedule])
    await expect(getBudgetsByTrip(otherTrip.id)).resolves.toEqual([otherBudget])
    expect(targetSchedule.tripId).toBe(targetTrip.id)
    expect(targetBudget.tripId).toBe(targetTrip.id)
  })
})
