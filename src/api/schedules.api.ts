import { withApiLatency } from './client'
import { readCollection, storageKeys, writeCollection } from './mockStorage'
import { createApiError } from '@/types/common'
import type { CreateScheduleInput, ScheduleItem, UpdateScheduleInput } from '@/types/schedule'
import { createId } from '@/utils/id'

export function getSchedulesByTrip(tripId: string): Promise<ScheduleItem[]> {
  return withApiLatency(() => readSchedules().filter((schedule) => schedule.tripId === tripId))
}

export function createSchedule(input: CreateScheduleInput): Promise<ScheduleItem> {
  return withApiLatency(() => {
    const schedules = readSchedules()
    const now = new Date().toISOString()
    const schedule: ScheduleItem = {
      ...input,
      id: createId('schedule'),
      createdAt: now,
      updatedAt: now,
    }

    persistSchedules([...schedules, schedule])
    return schedule
  })
}

export function updateSchedule(id: string, input: UpdateScheduleInput): Promise<ScheduleItem> {
  return withApiLatency(() => {
    const schedules = readSchedules()
    const scheduleIndex = schedules.findIndex((schedule) => schedule.id === id)
    if (scheduleIndex < 0) {
      throw createApiError('not_found', '수정할 일정을 찾을 수 없습니다.')
    }

    const updatedSchedule: ScheduleItem = {
      ...schedules[scheduleIndex],
      ...input,
      id,
      tripId: schedules[scheduleIndex].tripId,
      updatedAt: new Date().toISOString(),
    }
    persistSchedules(schedules.map((schedule, index) => (index === scheduleIndex ? updatedSchedule : schedule)))

    return updatedSchedule
  })
}

export function deleteSchedule(id: string): Promise<void> {
  return withApiLatency(() => {
    persistSchedules(readSchedules().filter((schedule) => schedule.id !== id))
  })
}

function readSchedules(): ScheduleItem[] {
  return readCollection(storageKeys.schedules, isScheduleItem).data
}

function persistSchedules(schedules: readonly ScheduleItem[]): void {
  const result = writeCollection(storageKeys.schedules, schedules)
  if (!result.ok && result.error !== null) {
    throw result.error
  }
}

// 저장소에서 복원한 값은 unknown으로 보고 필드별로 좁혀야 strict TypeScript의 장점이 유지됩니다.
function isScheduleItem(value: unknown): value is ScheduleItem {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.tripId === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.time === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.location === 'string' &&
    typeof candidate.memo === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  )
}
