import { describe, expect, it } from 'vitest'

import { useAsyncState } from '@/composables/useAsyncState'

describe('useAsyncState', () => {
  it('tracks loading state around successful async operations', async () => {
    const { execute, isLoading, errorMessage } = useAsyncState()
    const pendingValue = createDeferred<string>()

    const resultPromise = execute(() => pendingValue.promise)

    expect(isLoading.value).toBe(true)
    expect(errorMessage.value).toBeNull()

    pendingValue.resolve('성공')
    await expect(resultPromise).resolves.toBe('성공')
    expect(isLoading.value).toBe(false)
  })

  it('captures async errors and can reset state', async () => {
    const { execute, isLoading, errorMessage, reset } = useAsyncState()

    await expect(execute(() => Promise.reject(new Error('요청 실패')))).resolves.toBeNull()

    expect(errorMessage.value).toBe('요청 실패')
    expect(isLoading.value).toBe(false)

    reset()
    expect(errorMessage.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })
})

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve
  })

  return { promise, resolve }
}
