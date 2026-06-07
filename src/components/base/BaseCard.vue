<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    testId?: string
  }>(),
  {
    title: '',
    subtitle: '',
    testId: undefined,
  },
)
</script>

<template>
  <article class="base-card" :data-testid="testId">
    <!-- 이 파일에서 배우는 것: 기본 title/subtitle prop을 제공하면서도 header/body/footer slot으로 카드 구성을 확장할 수 있습니다. -->
    <header v-if="title || subtitle || $slots.header" class="base-card__header">
      <slot name="header">
        <h3 v-if="title" class="base-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="base-card__subtitle">{{ subtitle }}</p>
      </slot>
    </header>

    <div class="base-card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </footer>
  </article>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

// BEM 학습: .base-card 블록 안에서 __header, __body, __footer 요소가 카드 구조를 나눕니다.
.base-card {
  border: 1px solid $color-border;
  border-radius: $radius-medium;
  background: $color-surface;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}

.base-card__header,
.base-card__body,
.base-card__footer {
  padding: $spacing-5;
}

.base-card__header {
  border-bottom: 1px solid $color-border;
}

.base-card__title {
  margin: 0;
  color: $color-text;
  font-size: 1.1rem;
}

.base-card__subtitle {
  margin: $spacing-1 0 0;
  color: $color-muted;
}

.base-card__footer {
  border-top: 1px solid $color-border;
}
</style>
