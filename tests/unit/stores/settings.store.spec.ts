import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getSettings, resetSettings, updateSettings } from '@/api/settings.api'
import { useSettingsStore } from '@/stores/settings.store'
import { defaultSettings, type Settings } from '@/types/settings'

vi.mock('@/api/settings.api', () => ({
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  resetSettings: vi.fn(),
}))

const darkSettings: Settings = {
  currency: 'KRW',
  theme: 'dark',
  enableSampleData: true,
}

describe('settings store', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  it('fetches settings and exposes getters', async () => {
    vi.mocked(getSettings).mockResolvedValue(darkSettings)
    const store = useSettingsStore()

    await store.fetchSettings()

    expect(store.settings).toEqual(darkSettings)
    expect(store.isDarkTheme).toBe(true)
    expect(store.usesSampleData).toBe(true)
  })

  it('updates and resets settings through the API', async () => {
    vi.mocked(updateSettings).mockResolvedValue(darkSettings)
    vi.mocked(resetSettings).mockResolvedValue(defaultSettings)
    const store = useSettingsStore()

    await expect(store.updateSettings({ theme: 'dark', enableSampleData: true })).resolves.toEqual(darkSettings)
    await expect(store.resetSettings()).resolves.toEqual(defaultSettings)

    expect(store.settings).toEqual(defaultSettings)
  })

  it('captures settings errors and clears loading', async () => {
    vi.mocked(resetSettings).mockRejectedValue(new Error('설정 초기화 실패'))
    const store = useSettingsStore()

    await expect(store.resetSettings()).resolves.toBeNull()

    expect(store.errorMessage).toBe('설정 초기화 실패')
    expect(store.isLoading).toBe(false)
  })
})
