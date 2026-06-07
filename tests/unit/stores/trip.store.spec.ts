import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createTrip, deleteTrip, getTrips, resetTripPlannerData, updateTrip } from '@/api/trips.api'
import { useTripStore } from '@/stores/trip.store'
import type { CreateTripInput, Trip } from '@/types/trip'

vi.mock('@/api/trips.api', () => ({
  getTrips: vi.fn(),
  createTrip: vi.fn(),
  updateTrip: vi.fn(),
  deleteTrip: vi.fn(),
  resetTripPlannerData: vi.fn(),
}))

const tripInput: CreateTripInput = {
  title: 'Seoul Weekend',
  destination: '서울',
  startDate: '2026-06-10',
  endDate: '2026-06-12',
  description: '주말 여행',
  status: 'planned',
}

const seoulTrip: Trip = {
  ...tripInput,
  id: 'trip_1',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

describe('trip store', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  it('fetches trips through the trip API and clears loading state', async () => {
    vi.mocked(getTrips).mockResolvedValue([seoulTrip])
    const store = useTripStore()

    await store.fetchTrips()

    expect(getTrips).toHaveBeenCalledOnce()
    expect(store.trips).toEqual([seoulTrip])
    expect(store.isLoading).toBe(false)
    expect(store.errorMessage).toBeNull()
    expect(store.tripCount).toBe(1)
    expect(store.getById('trip_1')).toEqual(seoulTrip)
  })

  it('sets loading while fetch is pending', async () => {
    const pendingTrips = createDeferred<Trip[]>()
    vi.mocked(getTrips).mockReturnValue(pendingTrips.promise)
    const store = useTripStore()

    const fetchPromise = store.fetchTrips()

    expect(store.isLoading).toBe(true)
    pendingTrips.resolve([seoulTrip])
    await fetchPromise
    expect(store.isLoading).toBe(false)
  })

  it('creates, updates, and deletes local state after API success', async () => {
    vi.mocked(createTrip).mockResolvedValue(seoulTrip)
    vi.mocked(updateTrip).mockResolvedValue({ ...seoulTrip, title: 'Seoul Spring Weekend' })
    vi.mocked(deleteTrip).mockResolvedValue()
    const store = useTripStore()

    await expect(store.createTrip(tripInput)).resolves.toEqual(seoulTrip)
    await expect(store.updateTrip(seoulTrip.id, { title: 'Seoul Spring Weekend' })).resolves.toMatchObject({
      title: 'Seoul Spring Weekend',
    })
    await expect(store.deleteTrip(seoulTrip.id)).resolves.toBe(true)

    expect(createTrip).toHaveBeenCalledWith(tripInput)
    expect(updateTrip).toHaveBeenCalledWith(seoulTrip.id, { title: 'Seoul Spring Weekend' })
    expect(deleteTrip).toHaveBeenCalledWith(seoulTrip.id)
    expect(store.trips).toEqual([])
  })

  it('captures API errors without throwing to UI callers', async () => {
    vi.mocked(getTrips).mockRejectedValue(new Error('API 실패'))
    const store = useTripStore()

    await expect(store.fetchTrips()).resolves.toBeUndefined()

    expect(store.errorMessage).toBe('API 실패')
    expect(store.isLoading).toBe(false)
  })

  it('resets all persisted planner data and clears trip state', async () => {
    vi.mocked(resetTripPlannerData).mockResolvedValue()
    const store = useTripStore()
    store.trips = [seoulTrip]

    await expect(store.resetTripPlannerData()).resolves.toBe(true)

    expect(resetTripPlannerData).toHaveBeenCalledOnce()
    expect(store.trips).toEqual([])
  })
})

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve
  })

  return { promise, resolve }
}
