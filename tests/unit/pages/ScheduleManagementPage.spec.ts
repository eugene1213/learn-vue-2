import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ScheduleManagementPage from '@/pages/ScheduleManagementPage.vue'
import type { ScheduleItem } from '@/types/schedule'
import type { Trip } from '@/types/trip'

const seoulTrip: Trip = {
  id: 'trip_1',
  title: 'Seoul Weekend',
  destination: '서울',
  startDate: '2026-06-10',
  endDate: '2026-06-12',
  description: '주말 여행',
  status: 'planned',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

const scheduleItem: ScheduleItem = {
  id: 'schedule_1',
  tripId: 'trip_1',
  date: '2026-06-10',
  time: '10:00',
  title: '광화문 방문',
  location: '광화문',
  memo: '입장권 확인',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

const tripStoreMock = vi.hoisted(() => ({
  isLoading: false,
  errorMessage: null as string | null,
  fetchTrips: vi.fn<() => Promise<void>>(),
  getById: vi.fn<(id: string) => Trip | null>(),
}))

const scheduleStoreMock = vi.hoisted(() => ({
  isLoading: false,
  errorMessage: null as string | null,
  fetchSchedulesByTrip: vi.fn<(tripId: string) => Promise<void>>(),
  getByTripId: vi.fn<(tripId: string) => ScheduleItem[]>(),
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  deleteSchedule: vi.fn(),
}))

vi.mock('@/stores/trip.store', () => ({
  useTripStore: () => tripStoreMock,
}))

vi.mock('@/stores/schedule.store', () => ({
  useScheduleStore: () => scheduleStoreMock,
}))

describe('ScheduleManagementPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    tripStoreMock.isLoading = false
    tripStoreMock.errorMessage = null
    tripStoreMock.fetchTrips.mockResolvedValue()
    tripStoreMock.getById.mockReturnValue(seoulTrip)
    scheduleStoreMock.isLoading = false
    scheduleStoreMock.errorMessage = null
    scheduleStoreMock.fetchSchedulesByTrip.mockResolvedValue()
    scheduleStoreMock.getByTripId.mockReturnValue([])
    scheduleStoreMock.createSchedule.mockResolvedValue(scheduleItem)
    scheduleStoreMock.updateSchedule.mockResolvedValue(scheduleItem)
    scheduleStoreMock.deleteSchedule.mockResolvedValue(true)
  })

  it('loads the route trip and shows the empty schedule state', async () => {
    const wrapper = await mountPage('/trips/trip_1/schedule')

    expect(tripStoreMock.fetchTrips).toHaveBeenCalled()
    expect(scheduleStoreMock.fetchSchedulesByTrip).toHaveBeenCalledWith('trip_1')
    expect(wrapper.text()).toContain('Seoul Weekend')
    expect(wrapper.text()).toContain('등록된 일정이 없습니다.')
  })

  it('shows a safe Korean not-found state for invalid trip route', async () => {
    tripStoreMock.getById.mockReturnValue(null)

    const wrapper = await mountPage('/trips/not-found-id/schedule')

    expect(scheduleStoreMock.fetchSchedulesByTrip).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('여행을 찾을 수 없습니다.')
    expect(wrapper.text()).toContain('여행 목록으로 돌아가기')
  })
})

async function mountPage(path: string) {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/trips', component: { template: '<p>여행 목록</p>' } },
      { path: '/trips/:tripId/schedule', component: ScheduleManagementPage },
    ],
  })
  await router.push(path)
  await router.isReady()

  const wrapper = mount(ScheduleManagementPage, {
    global: {
      plugins: [router],
    },
  })
  await flushPromises()
  return wrapper
}
