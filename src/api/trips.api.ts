import { withApiLatency } from './client'
import { readCollection, storageKeys, writeCollection } from './mockStorage'
import { createApiError } from '@/types/common'
import type { BudgetItem } from '@/types/budget'
import type { ScheduleItem } from '@/types/schedule'
import type { CreateTripInput, Trip, TripStatus, UpdateTripInput } from '@/types/trip'
import { createId } from '@/utils/id'

export function getTrips(): Promise<Trip[]> {
  return withApiLatency(() => readTrips())
}

export function getTripById(id: string): Promise<Trip | null> {
  return withApiLatency(() => readTrips().find((trip) => trip.id === id) ?? null)
}

export function createTrip(input: CreateTripInput): Promise<Trip> {
  return withApiLatency(() => {
    const trips = readTrips()
    const now = new Date().toISOString()
    const trip: Trip = {
      ...input,
      id: createId('trip'),
      createdAt: now,
      updatedAt: now,
    }

    persistTrips([...trips, trip])
    return trip
  })
}

export function updateTrip(id: string, input: UpdateTripInput): Promise<Trip> {
  return withApiLatency(() => {
    const trips = readTrips()
    const tripIndex = trips.findIndex((trip) => trip.id === id)
    if (tripIndex < 0) {
      throw createApiError('not_found', '수정할 여행을 찾을 수 없습니다.')
    }

    const updatedTrip: Trip = {
      ...trips[tripIndex],
      ...input,
      id,
      updatedAt: new Date().toISOString(),
    }
    const nextTrips = trips.map((trip, index) => (index === tripIndex ? updatedTrip : trip))
    persistTrips(nextTrips)

    return updatedTrip
  })
}

export function deleteTrip(id: string): Promise<void> {
  return withApiLatency(() => {
    persistTrips(readTrips().filter((trip) => trip.id !== id))
    persistSchedules(readSchedules().filter((schedule) => schedule.tripId !== id))
    persistBudgets(readBudgets().filter((budget) => budget.tripId !== id))
  })
}

export function resetTripPlannerData(): Promise<void> {
  return withApiLatency(() => {
    persistTrips([])
    persistSchedules([])
    persistBudgets([])
  })
}

function readTrips(): Trip[] {
  return readCollection(storageKeys.trips, isTrip).data
}

function persistTrips(trips: readonly Trip[]): void {
  const result = writeCollection(storageKeys.trips, trips)
  if (!result.ok && result.error !== null) {
    throw result.error
  }
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

function readBudgets(): BudgetItem[] {
  return readCollection(storageKeys.budgets, isBudgetItem).data
}

function persistBudgets(budgets: readonly BudgetItem[]): void {
  const result = writeCollection(storageKeys.budgets, budgets)
  if (!result.ok && result.error !== null) {
    throw result.error
  }
}

// API 파일의 타입 가드는 저장된 JSON을 신뢰하지 않고 도메인 계약에 맞는 값만 통과시키는 학습용 안전장치입니다.
function isTrip(value: unknown): value is Trip {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.destination === 'string' &&
    typeof value.startDate === 'string' &&
    typeof value.endDate === 'string' &&
    typeof value.description === 'string' &&
    isTripStatus(value.status) &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

function isScheduleItem(value: unknown): value is ScheduleItem {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.tripId === 'string' &&
    typeof value.date === 'string' &&
    typeof value.time === 'string' &&
    typeof value.title === 'string' &&
    typeof value.location === 'string' &&
    typeof value.memo === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

function isBudgetItem(value: unknown): value is BudgetItem {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.tripId === 'string' &&
    isBudgetCategory(value.category) &&
    typeof value.title === 'string' &&
    typeof value.amount === 'number' &&
    typeof value.spentDate === 'string' &&
    typeof value.memo === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTripStatus(value: unknown): value is TripStatus {
  return value === 'planned' || value === 'ongoing' || value === 'completed'
}

function isBudgetCategory(value: unknown): value is BudgetItem['category'] {
  return (
    value === 'transport' ||
    value === 'lodging' ||
    value === 'food' ||
    value === 'activity' ||
    value === 'shopping' ||
    value === 'etc'
  )
}
