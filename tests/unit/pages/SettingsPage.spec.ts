import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SettingsPage from '@/pages/SettingsPage.vue'
import type { BudgetItem } from '@/types/budget'
import type { ScheduleItem } from '@/types/schedule'
import type { Settings } from '@/types/settings'
import type { Trip } from '@/types/trip'

const sampleTrip: Trip = {
  id: 'trip_sample',
  title: 'Seoul Weekend',
  destination: '서울',
  startDate: '2026-06-10',
  endDate: '2026-06-12',
  description: '샘플 여행',
  status: 'planned',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

const settingsStoreMock = vi.hoisted(() => ({
  settings: { currency: 'KRW', theme: 'light', enableSampleData: false } as Settings,
  isLoading: false,
  fetchSettings: vi.fn<() => Promise<void>>(),
  updateSettings: vi.fn<(input: Partial<Settings>) => Promise<Settings | null>>(),
}))

const tripStoreMock = vi.hoisted(() => ({
  isLoading: false,
  resetTripPlannerData: vi.fn<() => Promise<boolean>>(),
  createTrip: vi.fn<() => Promise<Trip | null>>(),
}))

const scheduleStoreMock = vi.hoisted(() => ({
  isLoading: false,
  clearSchedules: vi.fn<() => void>(),
  createSchedule: vi.fn<() => Promise<ScheduleItem | null>>(),
}))

const budgetStoreMock = vi.hoisted(() => ({
  isLoading: false,
  clearBudgets: vi.fn<() => void>(),
  createBudget: vi.fn<() => Promise<BudgetItem | null>>(),
}))

vi.mock('@/stores/settings.store', () => ({
  useSettingsStore: () => settingsStoreMock,
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

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    settingsStoreMock.settings = { currency: 'KRW', theme: 'light', enableSampleData: false }
    settingsStoreMock.isLoading = false
    settingsStoreMock.fetchSettings.mockResolvedValue()
    settingsStoreMock.updateSettings.mockResolvedValue(settingsStoreMock.settings)
    tripStoreMock.isLoading = false
    tripStoreMock.resetTripPlannerData.mockResolvedValue(true)
    tripStoreMock.createTrip.mockResolvedValue(sampleTrip)
    scheduleStoreMock.isLoading = false
    scheduleStoreMock.clearSchedules.mockReturnValue()
    scheduleStoreMock.createSchedule.mockResolvedValue(null)
    budgetStoreMock.isLoading = false
    budgetStoreMock.clearBudgets.mockReturnValue()
    budgetStoreMock.createBudget.mockResolvedValue(null)
  })

  it('loads settings, displays fixed KRW currency, and persists theme choice through the store', async () => {
    const wrapper = mount(SettingsPage)
    await flushPromises()

    expect(settingsStoreMock.fetchSettings).toHaveBeenCalledOnce()
    expect(wrapper.get('[data-testid="settings-currency"]').text()).toBe('KRW')

    await wrapper.get('[data-testid="settings-theme-dark"]').setValue(true)

    expect(settingsStoreMock.updateSettings).toHaveBeenCalledWith({ theme: 'dark' })
  })

  it('loads sample data through domain stores', async () => {
    const wrapper = mount(SettingsPage)
    await flushPromises()

    await wrapper.get('[data-testid="settings-sample-data-button"]').trigger('click')
    await flushPromises()

    expect(tripStoreMock.resetTripPlannerData).toHaveBeenCalledOnce()
    expect(tripStoreMock.createTrip).toHaveBeenCalledWith(expect.objectContaining({ title: 'Seoul Weekend' }))
    expect(scheduleStoreMock.createSchedule).toHaveBeenCalledWith(expect.objectContaining({ tripId: 'trip_sample' }))
    expect(budgetStoreMock.createBudget).toHaveBeenCalledWith(expect.objectContaining({ amount: 150000 }))
    expect(settingsStoreMock.updateSettings).toHaveBeenCalledWith({ enableSampleData: true })
    expect(wrapper.text()).toContain('샘플 데이터가 추가되었습니다.')
  })

  it('confirms reset and clears local domain store state', async () => {
    const wrapper = mount(SettingsPage)
    await flushPromises()

    await wrapper.get('[data-testid="settings-reset-data-button"]').trigger('click')
    await flushPromises()
    const modal = document.body.querySelector('[data-testid="settings-reset-modal"]')
    expect(modal).not.toBeNull()

    const confirmButton = document.body.querySelector<HTMLButtonElement>('[data-testid="settings-reset-confirm-button"]')
    expect(confirmButton).not.toBeNull()
    confirmButton?.click()
    await flushPromises()

    expect(tripStoreMock.resetTripPlannerData).toHaveBeenCalledOnce()
    expect(scheduleStoreMock.clearSchedules).toHaveBeenCalledOnce()
    expect(budgetStoreMock.clearBudgets).toHaveBeenCalledOnce()
    expect(settingsStoreMock.updateSettings).toHaveBeenCalledWith({ enableSampleData: false })
    expect(wrapper.text()).toContain('여행 데이터가 초기화되었습니다.')
  })
})
