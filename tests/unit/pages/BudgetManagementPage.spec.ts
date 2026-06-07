import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BudgetManagementPage from '@/pages/BudgetManagementPage.vue'
import type { BudgetItem } from '@/types/budget'
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

const budgetItem: BudgetItem = {
  id: 'budget_1',
  tripId: 'trip_1',
  category: 'lodging',
  title: '호텔',
  amount: 150000,
  spentDate: '2026-06-10',
  memo: '조식 포함',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

const tripStoreMock = vi.hoisted(() => ({
  isLoading: false,
  errorMessage: null as string | null,
  fetchTrips: vi.fn<() => Promise<void>>(),
  getById: vi.fn<(id: string) => Trip | null>(),
}))

const budgetStoreMock = vi.hoisted(() => ({
  isLoading: false,
  errorMessage: null as string | null,
  fetchBudgetsByTrip: vi.fn<(tripId: string) => Promise<void>>(),
  getByTripId: vi.fn<(tripId: string) => BudgetItem[]>(),
  createBudget: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
}))

vi.mock('@/stores/trip.store', () => ({
  useTripStore: () => tripStoreMock,
}))

vi.mock('@/stores/budget.store', () => ({
  useBudgetStore: () => budgetStoreMock,
}))

describe('BudgetManagementPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    tripStoreMock.isLoading = false
    tripStoreMock.errorMessage = null
    tripStoreMock.fetchTrips.mockResolvedValue()
    tripStoreMock.getById.mockReturnValue(seoulTrip)
    budgetStoreMock.isLoading = false
    budgetStoreMock.errorMessage = null
    budgetStoreMock.fetchBudgetsByTrip.mockResolvedValue()
    budgetStoreMock.getByTripId.mockReturnValue([])
    budgetStoreMock.createBudget.mockResolvedValue(budgetItem)
    budgetStoreMock.updateBudget.mockResolvedValue(budgetItem)
    budgetStoreMock.deleteBudget.mockResolvedValue(true)
  })

  it('loads the route trip and shows the zero budget summary', async () => {
    const wrapper = await mountPage('/trips/trip_1/budget')

    expect(tripStoreMock.fetchTrips).toHaveBeenCalled()
    expect(budgetStoreMock.fetchBudgetsByTrip).toHaveBeenCalledWith('trip_1')
    expect(wrapper.text()).toContain('Seoul Weekend')
    expect(wrapper.get('[data-testid="budget-total"]').text()).toBe('0원')
    expect(wrapper.text()).toContain('등록된 예산 항목이 없습니다.')
  })

  it('creates a budget item through the page form', async () => {
    const wrapper = await mountPage('/trips/trip_1/budget')

    await wrapper.get('[data-testid="budget-add-button"]').trigger('click')
    await wrapper.get('[data-testid="budget-title-input"]').setValue('호텔')
    await wrapper.get('[data-testid="budget-category-select"]').setValue('lodging')
    await wrapper.get('[data-testid="budget-amount-input"]').setValue('150000')
    await wrapper.get('[data-testid="budget-date-input"]').setValue('2026-06-10')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(budgetStoreMock.createBudget).toHaveBeenCalledWith({
      tripId: 'trip_1',
      category: 'lodging',
      title: '호텔',
      amount: 150000,
      spentDate: '2026-06-10',
      memo: '',
    })
  })

  it('shows a safe Korean not-found state for invalid trip route', async () => {
    tripStoreMock.getById.mockReturnValue(null)

    const wrapper = await mountPage('/trips/not-found-id/budget')

    expect(budgetStoreMock.fetchBudgetsByTrip).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('여행을 찾을 수 없습니다.')
    expect(wrapper.text()).toContain('여행 목록으로 돌아가기')
  })
})

async function mountPage(path: string) {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/trips', component: { template: '<p>여행 목록</p>' } },
      { path: '/trips/:tripId/budget', component: BudgetManagementPage },
    ],
  })
  await router.push(path)
  await router.isReady()

  const wrapper = mount(BudgetManagementPage, {
    global: {
      plugins: [router],
    },
  })
  await flushPromises()
  return wrapper
}
