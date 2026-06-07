import axios from 'axios'

import { createApiError, type ApiError } from '@/types/common'

export const apiClient = axios.create({
  baseURL: '/',
  timeout: 5_000,
})

export const mockApiLatencyMs = 150

// 실제 서버가 없어도 API 경계를 Promise로 유지하면, 이후 Axios 백엔드로 교체할 때 호출부를 바꾸지 않아도 됩니다.
export async function withApiLatency<T>(operation: () => T | Promise<T>): Promise<T> {
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, mockApiLatencyMs)
  })

  return operation()
}

export function toApiError(error: unknown, fallbackMessage: string): ApiError {
  if (isApiError(error)) {
    return error
  }

  return createApiError('storage_write_failed', fallbackMessage, error)
}

function isApiError(error: unknown): error is ApiError {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  return 'code' in error && 'message' in error
}
