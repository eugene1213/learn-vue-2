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

// 이 파일에서 배우는 것: 일정 Store는 여행별 목록을 캐시하고, getter에서 필터링/정렬해 화면 컴포넌트의 계산 부담을 줄입니다.
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
