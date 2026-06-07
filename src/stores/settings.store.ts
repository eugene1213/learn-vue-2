import { defineStore } from 'pinia'

import { getSettings, resetSettings, updateSettings } from '@/api/settings.api'
import { defaultSettings, type Settings, type UpdateSettingsInput } from '@/types/settings'

interface SettingsState {
  settings: Settings
  isLoading: boolean
  errorMessage: string | null
}

function toStoreErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '설정을 처리하는 중 오류가 발생했습니다.'
}

// 설정 Store는 앱 전체가 공유하는 사용자 설정을 보관하므로 컴포넌트가 API 세부사항을 알 필요가 없게 합니다.
export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    settings: { ...defaultSettings },
    isLoading: false,
    errorMessage: null,
  }),
  getters: {
    isDarkTheme: (state) => state.settings.theme === 'dark',
    usesSampleData: (state) => state.settings.enableSampleData,
  },
  actions: {
    async fetchSettings(): Promise<void> {
      this.isLoading = true
      this.errorMessage = null

      try {
        this.settings = await getSettings()
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
      } finally {
        this.isLoading = false
      }
    },
    async updateSettings(input: UpdateSettingsInput): Promise<Settings | null> {
      this.isLoading = true
      this.errorMessage = null

      try {
        const settings = await updateSettings(input)
        this.settings = settings
        return settings
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
        return null
      } finally {
        this.isLoading = false
      }
    },
    async resetSettings(): Promise<Settings | null> {
      this.isLoading = true
      this.errorMessage = null

      try {
        const settings = await resetSettings()
        this.settings = settings
        return settings
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
        return null
      } finally {
        this.isLoading = false
      }
    },
  },
})
