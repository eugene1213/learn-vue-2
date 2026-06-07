import { defineStore } from 'pinia'

import { createSchedule, deleteSchedule, getSchedulesByTrip, updateSchedule } from '@/api/schedules.api'
import type { CreateScheduleInput, ScheduleItem, UpdateScheduleInput } from '@/types/schedule'

interface ScheduleState {
  schedules: ScheduleItem[]
  isLoading: boolean
  errorMessage: string | null
}

function toStoreErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '일정 정보를 처리하는 중 오류가 발생했습니다.'
}

// 일정 Store는 API에서 가져온 전역 목록을 보관하고, 특정 화면의 필터/입력 검증은 composable과 getter로 분리합니다.
export const useScheduleStore = defineStore('schedule', {
  state: (): ScheduleState => ({
    schedules: [],
    isLoading: false,
    errorMessage: null,
  }),
  getters: {
    getByTripId: (state) => (tripId: string) => state.schedules.filter((schedule) => schedule.tripId === tripId),
    sortedByTripId: (state) => (tripId: string) =>
      [...state.schedules]
        .filter((schedule) => schedule.tripId === tripId)
        .sort((left, right) => `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`)),
  },
  actions: {
    async fetchSchedulesByTrip(tripId: string): Promise<void> {
      this.isLoading = true
      this.errorMessage = null

      try {
        const schedules = await getSchedulesByTrip(tripId)
        const otherSchedules = this.schedules.filter((schedule) => schedule.tripId !== tripId)
        this.schedules = [...otherSchedules, ...schedules]
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
      } finally {
        this.isLoading = false
      }
    },
    async createSchedule(input: CreateScheduleInput): Promise<ScheduleItem | null> {
      this.isLoading = true
      this.errorMessage = null

      try {
        const schedule = await createSchedule(input)
        this.schedules = [...this.schedules, schedule]
        return schedule
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
        return null
      } finally {
        this.isLoading = false
      }
    },
    async updateSchedule(id: string, input: UpdateScheduleInput): Promise<ScheduleItem | null> {
      this.isLoading = true
      this.errorMessage = null

      try {
        const schedule = await updateSchedule(id, input)
        this.schedules = this.schedules.map((item) => (item.id === id ? schedule : item))
        return schedule
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
        return null
      } finally {
        this.isLoading = false
      }
    },
    async deleteSchedule(id: string): Promise<boolean> {
      this.isLoading = true
      this.errorMessage = null

      try {
        await deleteSchedule(id)
        this.schedules = this.schedules.filter((schedule) => schedule.id !== id)
        return true
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    clearSchedules(): void {
      this.schedules = []
      this.errorMessage = null
    },
  },
})
