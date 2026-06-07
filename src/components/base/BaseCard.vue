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
    <!-- slot 학습: 기본 헤더 props를 제공하면서도 부모가 필요하면 header slot으로 전체 영역을 교체할 수 있습니다. -->
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
