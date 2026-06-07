import { createApiError, type ApiError } from '@/types/common'
import { defaultSettings, type Settings } from '@/types/settings'

export const storageKeys = {
  trips: 'trip-planner:trips:v1',
  schedules: 'trip-planner:schedules:v1',
  budgets: 'trip-planner:budgets:v1',
  settings: 'trip-planner:settings:v1',
} as const

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys]

export interface StorageReadResult<T> {
  data: T
  error: ApiError | null
}

export interface StorageWriteResult {
  ok: boolean
  error: ApiError | null
}

// 이 파일에서 배우는 것: localStorage 직접 접근을 한곳에 모아 저장소 오류/파싱 오류를 API 계층에서 일관되게 처리합니다.
export function readCollection<T>(key: StorageKey, isItem: (value: unknown) => value is T): StorageReadResult<T[]> {
  const storage = getStorage()
  if (storage === null) {
    return {
      data: [],
      error: createApiError('storage_unavailable', '브라우저 저장소를 사용할 수 없어 빈 목록을 사용합니다.'),
    }
  }

  try {
    const rawValue = storage.getItem(key)
    if (rawValue === null) {
      return { data: [], error: null }
    }

    const parsedValue = JSON.parse(rawValue) as unknown
    if (!Array.isArray(parsedValue) || !parsedValue.every(isItem)) {
      return {
        data: [],
        error: createApiError('storage_parse_failed', '저장된 목록 형식이 올바르지 않아 빈 목록을 사용합니다.'),
      }
    }

    return { data: parsedValue, error: null }
  } catch (error: unknown) {
    return {
      data: [],
      error: createApiError('storage_parse_failed', '저장된 JSON을 읽을 수 없어 빈 목록을 사용합니다.', error),
    }
  }
}

export function writeCollection<T>(key: StorageKey, items: readonly T[]): StorageWriteResult {
  return writeJson(key, items)
}

export function readSettings(): StorageReadResult<Settings> {
  const storage = getStorage()
  if (storage === null) {
    return {
      data: defaultSettings,
      error: createApiError('storage_unavailable', '브라우저 저장소를 사용할 수 없어 기본 설정을 사용합니다.'),
    }
  }

  try {
    const rawValue = storage.getItem(storageKeys.settings)
    if (rawValue === null) {
      return { data: defaultSettings, error: null }
    }

    const parsedValue = JSON.parse(rawValue) as unknown
    if (!isSettings(parsedValue)) {
      return {
        data: defaultSettings,
        error: createApiError('storage_parse_failed', '저장된 설정 형식이 올바르지 않아 기본 설정을 사용합니다.'),
      }
    }

    return { data: parsedValue, error: null }
  } catch (error: unknown) {
    return {
      data: defaultSettings,
      error: createApiError('storage_parse_failed', '저장된 설정 JSON을 읽을 수 없어 기본 설정을 사용합니다.', error),
    }
  }
}

export function writeSettings(settings: Settings): StorageWriteResult {
  return writeJson(storageKeys.settings, settings)
}

export function removeStoredValue(key: StorageKey): StorageWriteResult {
  const storage = getStorage()
  if (storage === null) {
    return {
      ok: false,
      error: createApiError('storage_unavailable', '브라우저 저장소를 사용할 수 없어 삭제할 수 없습니다.'),
    }
  }

  try {
    storage.removeItem(key)
    return { ok: true, error: null }
  } catch (error: unknown) {
    return {
      ok: false,
      error: createApiError('storage_write_failed', '브라우저 저장소 삭제에 실패했습니다.', error),
    }
  }
}

function writeJson<T>(key: StorageKey, value: T): StorageWriteResult {
  const storage = getStorage()
  if (storage === null) {
    return {
      ok: false,
      error: createApiError('storage_unavailable', '브라우저 저장소를 사용할 수 없어 저장할 수 없습니다.'),
    }
  }

  try {
    storage.setItem(key, JSON.stringify(value))
    return { ok: true, error: null }
  } catch (error: unknown) {
    return {
      ok: false,
      error: createApiError('storage_write_failed', '브라우저 저장소 용량 또는 권한 문제로 저장에 실패했습니다.', error),
    }
  }
}

function getStorage(): Storage | null {
  try {
    return globalThis.localStorage
  } catch (error: unknown) {
    void error
    return null
  }
}

function isSettings(value: unknown): value is Settings {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<Settings>
  return candidate.currency === 'KRW' && isTheme(candidate.theme) && typeof candidate.enableSampleData === 'boolean'
}

function isTheme(value: unknown): value is Settings['theme'] {
  return value === 'light' || value === 'dark'
}
