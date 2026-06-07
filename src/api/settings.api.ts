import { withApiLatency } from './client'
import { removeStoredValue, readSettings, storageKeys, writeSettings } from './mockStorage'
import { defaultSettings, type Settings, type UpdateSettingsInput } from '@/types/settings'

export function getSettings(): Promise<Settings> {
  return withApiLatency(() => readSettings().data)
}

export function updateSettings(input: UpdateSettingsInput): Promise<Settings> {
  return withApiLatency(() => {
    const nextSettings: Settings = {
      ...readSettings().data,
      ...input,
    }
    const result = writeSettings(nextSettings)
    if (!result.ok && result.error !== null) {
      throw result.error
    }

    return nextSettings
  })
}

export function resetSettings(): Promise<Settings> {
  return withApiLatency(() => {
    const result = removeStoredValue(storageKeys.settings)
    if (!result.ok && result.error !== null) {
      throw result.error
    }

    return defaultSettings
  })
}

// 설정 API도 Promise 경계를 유지해 실제 서버 설정 저장소로 바뀌어도 호출부의 async 흐름을 그대로 둡니다.
