export type ApiErrorCode = 'storage_unavailable' | 'storage_parse_failed' | 'storage_write_failed' | 'not_found'

export interface ApiError {
  code: ApiErrorCode
  message: string
  cause?: unknown
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError }

export interface ValidationError {
  field: string
  message: string
}

export type ValidationErrors<TField extends string> = Partial<Record<TField, string>>

export interface TimestampedRecord {
  id: string
  createdAt: string
  updatedAt: string
}

// API와 화면 사이의 실패 모양을 고정해 두면, 이후 Pinia와 컴포넌트는 unknown 예외를 직접 다루지 않아도 됩니다.
export function createApiError(code: ApiErrorCode, message: string, cause?: unknown): ApiError {
  return { code, message, cause }
}
