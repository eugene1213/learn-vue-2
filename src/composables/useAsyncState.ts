import { ref } from 'vue'

export function useAsyncState() {
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  async function execute<T>(operation: () => Promise<T>): Promise<T | null> {
    isLoading.value = true
    errorMessage.value = null

    try {
      return await operation()
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : '비동기 작업 중 오류가 발생했습니다.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  function reset(): void {
    isLoading.value = false
    errorMessage.value = null
  }

  // composable은 컴포넌트마다 반복되는 로딩/오류 패턴을 재사용하게 해 Store의 전역 상태와 역할을 분리합니다.
  return {
    isLoading,
    errorMessage,
    execute,
    reset,
  }
}
