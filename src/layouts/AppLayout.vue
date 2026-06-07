<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useSettingsStore } from '@/stores/settings.store'

const settingsStore = useSettingsStore()
// 이 파일에서 배우는 것: 전역 설정 Store 값을 computed/class binding으로 연결해 테마가 화면 전체에 반영되는 흐름입니다.
const themeClass = computed(() => `app-layout--${settingsStore.settings.theme}`)

onMounted(async () => {
  await settingsStore.fetchSettings()
})
</script>

<template>
  <div class="app-layout" :class="themeClass" data-testid="app-shell" :data-theme="settingsStore.settings.theme">
    <header class="app-layout__header">
      <RouterLink class="app-layout__brand" to="/" data-testid="app-title">
        여행 플래너
      </RouterLink>
      <nav class="app-layout__nav" aria-label="주요 메뉴">
        <RouterLink class="app-layout__nav-link" to="/">홈</RouterLink>
        <RouterLink class="app-layout__nav-link" to="/trips">여행</RouterLink>
        <RouterLink class="app-layout__nav-link" to="/settings">설정</RouterLink>
      </nav>
    </header>

    <main class="app-layout__main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

// 테마 modifier 예시: 기본 .app-layout 블록에 --dark를 붙여 같은 구조의 색상만 전환합니다.
.app-layout {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 34rem),
    $color-page;
}

.app-layout--dark {
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.22), transparent 34rem),
    #111827;
}

.app-layout--dark .app-layout__header {
  border-bottom-color: rgba(71, 85, 105, 0.7);
  background: rgba(15, 23, 42, 0.9);
}

.app-layout--dark .app-layout__brand {
  color: #f8fafc;
}

.app-layout--dark .app-layout__nav-link {
  color: #cbd5e1;
}

.app-layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;
  border-bottom: 1px solid rgba(217, 226, 239, 0.86);
  background: rgba(255, 255, 255, 0.9);
  padding: $spacing-4 clamp($spacing-4, 5vw, 56px);
  backdrop-filter: blur(14px);
}

.app-layout__brand {
  color: $color-text;
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  text-decoration: none;
}

.app-layout__nav {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
}

.app-layout__nav-link {
  border-radius: 999px;
  color: $color-muted;
  padding: $spacing-2 $spacing-4;
  text-decoration: none;
  transition:
    background-color 160ms ease,
    color 160ms ease;

  &:hover,
  &.router-link-active {
    background: $color-primary-soft;
    color: $color-primary-dark;
  }
}

.app-layout__main {
  width: min(100% - 32px, 1080px);
  margin: 0 auto;
  padding: clamp($spacing-6, 5vw, 56px) 0;
}

@media (max-width: 640px) {
  // 반응형 패턴: 헤더의 flex 방향만 바꿔 모바일에서도 내비게이션을 자연스럽게 줄바꿈합니다.
  .app-layout__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
