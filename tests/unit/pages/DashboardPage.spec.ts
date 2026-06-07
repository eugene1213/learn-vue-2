import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import DashboardPage from '@/pages/DashboardPage.vue'
import type { BudgetItem } from '@/types/budget'
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

const budgetItem: BudgetItem = {
  id: 'budget_1',
  tripId: 'trip_1',
  category: 'lodging',
  title: '호텔',
  amount: 150000,
  spentDate: '2026-06-10',
  memo: '2박',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

const tripStoreMock = vi.hoisted(() => ({
  trips: [] as Trip[],
  isLoading: false,
  tripCount: 0,
  fetchTrips: vi.fn<() => Promise<void>>(),
  getById: vi.fn<(id: string) => Trip | null>(),
}))

const scheduleStoreMock = vi.hoisted(() => ({
  schedules: [] as ScheduleItem[],
  isLoading: false,
  fetchSchedulesByTrip: vi.fn<(tripId: string) => Promise<void>>(),
}))

const budgetStoreMock = vi.hoisted(() => ({
  budgets: [] as BudgetItem[],
  isLoading: false,
  fetchBudgetsByTrip: vi.fn<(tripId: string) => Promise<void>>(),
  totalByTripId: vi.fn<(tripId: string) => number>(),
}))

vi.mock('@/stores/trip.store', () => ({
  useTripStore: () => tripStoreMock,
}))

vi.mock('@/stores/schedule.store', () => ({
  useScheduleStore: () => scheduleStoreMock,
}))

vi.mock('@/stores/budget.store', () => ({
  useBudgetStore: () => budgetStoreMock,
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    tripStoreMock.trips = []
    tripStoreMock.isLoading = false
    tripStoreMock.tripCount = 0
    tripStoreMock.fetchTrips.mockResolvedValue()
    tripStoreMock.getById.mockReturnValue(null)
    scheduleStoreMock.schedules = []
    scheduleStoreMock.isLoading = false
    scheduleStoreMock.fetchSchedulesByTrip.mockResolvedValue()
    budgetStoreMock.budgets = []
    budgetStoreMock.isLoading = false
    budgetStoreMock.fetchBudgetsByTrip.mockResolvedValue()
    budgetStoreMock.totalByTripId.mockReturnValue(0)
  })

  it('shows the exact empty dashboard message and create CTA', async () => {
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('여행을 추가하고 일정을 계획해보세요.')
    expect(wrapper.get('[data-testid="dashboard-create-trip-link"]').attributes('href')).toBe('/trips/new')
  })

  it('loads trip-related schedules and budgets and renders dashboard totals', async () => {
    tripStoreMock.trips = [seoulTrip]
    tripStoreMock.tripCount = 1
    tripStoreMock.getById.mockReturnValue(seoulTrip)
    scheduleStoreMock.schedules = [scheduleItem]
    budgetStoreMock.budgets = [budgetItem]
    budgetStoreMock.totalByTripId.mockReturnValue(150000)

    const wrapper = await mountPage()

    expect(scheduleStoreMock.fetchSchedulesByTrip).toHaveBeenCalledWith('trip_1')
    expect(budgetStoreMock.fetchBudgetsByTrip).toHaveBeenCalledWith('trip_1')
    expect(wrapper.get('[data-testid="dashboard-trip-count"]').text()).toContain('1')
    expect(wrapper.get('[data-testid="dashboard-upcoming-count"]').text()).toContain('1')
    expect(wrapper.get('[data-testid="dashboard-budget-total"]').text()).toContain('150,000원')
    expect(wrapper.text()).toContain('광화문 방문')
  })
})

async function mountPage() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: DashboardPage },
      { path: '/trips/new', component: { template: '<p>새 여행</p>' } },
      { path: '/trips/:tripId', component: { template: '<p>여행 상세</p>' } },
    ],
  })
  await router.push('/')
  await router.isReady()

  const wrapper = mount(DashboardPage, {
    global: {
      plugins: [router],
    },
  })
  await flushPromises()
  return wrapper
}
