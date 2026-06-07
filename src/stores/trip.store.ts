import { defineStore } from 'pinia'

import { createTrip, deleteTrip, getTrips, resetTripPlannerData, updateTrip } from '@/api/trips.api'
import type { CreateTripInput, Trip, UpdateTripInput } from '@/types/trip'

interface TripState {
  trips: Trip[]
  isLoading: boolean
  errorMessage: string | null
}

function toStoreErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '여행 정보를 처리하는 중 오류가 발생했습니다.'
}

// Store는 여러 페이지가 공유하는 서버/API 기반 전역 상태를 담당하고, 폼 입력값 같은 일회성 상태는 composable에 둡니다.
export const useTripStore = defineStore('trip', {
  state: (): TripState => ({
    trips: [],
    isLoading: false,
    errorMessage: null,
  }),
  getters: {
    tripCount: (state) => state.trips.length,
    plannedTrips: (state) => state.trips.filter((trip) => trip.status === 'planned'),
    getById: (state) => (id: string) => state.trips.find((trip) => trip.id === id) ?? null,
  },
  actions: {
    async fetchTrips(): Promise<void> {
      this.isLoading = true
      this.errorMessage = null

      try {
        this.trips = await getTrips()
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
      } finally {
        this.isLoading = false
      }
    },
    async createTrip(input: CreateTripInput): Promise<Trip | null> {
      this.isLoading = true
      this.errorMessage = null

      try {
        const trip = await createTrip(input)
        this.trips = [...this.trips, trip]
        return trip
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
        return null
      } finally {
        this.isLoading = false
      }
    },
    async updateTrip(id: string, input: UpdateTripInput): Promise<Trip | null> {
      this.isLoading = true
      this.errorMessage = null

      try {
        const trip = await updateTrip(id, input)
        this.trips = this.trips.map((item) => (item.id === id ? trip : item))
        return trip
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
        return null
      } finally {
        this.isLoading = false
      }
    },
    async deleteTrip(id: string): Promise<boolean> {
      this.isLoading = true
      this.errorMessage = null

      try {
        await deleteTrip(id)
        this.trips = this.trips.filter((trip) => trip.id !== id)
        return true
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    async resetTripPlannerData(): Promise<boolean> {
      this.isLoading = true
      this.errorMessage = null

      try {
        await resetTripPlannerData()
        this.trips = []
        return true
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
  },
})
