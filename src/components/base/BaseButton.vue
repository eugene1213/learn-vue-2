<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'small' | 'medium' | 'large'
type ButtonType = 'button' | 'submit' | 'reset'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    type?: ButtonType
    disabled?: boolean
    loading?: boolean
    testId?: string
  }>(),
  {
    variant: 'primary',
    size: 'medium',
    type: 'button',
    disabled: false,
    loading: false,
    testId: undefined,
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 이 파일에서 배우는 것: variant/size prop으로 UI 규칙을 표준화하고, 유효한 클릭만 emit해 부모 로직을 단순하게 만듭니다.
function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) {
    return
  }

  emit('click', event)
}
</script>

<template>
  <button
    class="base-button"
    :class="[
      `base-button--${variant}`,
      `base-button--${size}`,
      { 'base-button--loading': loading },
    ]"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :data-testid="testId"
    @click="handleClick"
  >
    <span v-if="loading" class="base-button__loader" aria-hidden="true" />
    <span class="base-button__content">
      <slot />
    </span>
  </button>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

// BEM 학습: .base-button은 블록, --primary/--large는 상태·종류를 바꾸는 modifier입니다.
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  border: 1px solid transparent;
  border-radius: $radius-small;
  cursor: pointer;
  font-weight: 700;
  line-height: 1;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 3px solid $color-primary-soft;
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.68;
  }
}

.base-button--primary {
  background: $color-primary;
  color: $color-surface;

  &:hover:not(:disabled) {
    background: $color-primary-dark;
  }
}

.base-button--secondary {
  border-color: $color-border;
  background: $color-surface;
  color: $color-text;
}

.base-button--danger {
  background: $color-danger;
  color: $color-surface;
}

.base-button--ghost {
  background: transparent;
  color: $color-primary-dark;
}

.base-button--small {
  min-height: 34px;
  padding: 0 $spacing-3;
  font-size: 0.875rem;
}

.base-button--medium {
  min-height: 42px;
  padding: 0 $spacing-4;
  font-size: 0.95rem;
}

.base-button--large {
  min-height: 50px;
  padding: 0 $spacing-5;
  font-size: 1rem;
}

.base-button--loading {
  pointer-events: none;
}

.base-button__loader {
  // 요소 학습: __loader는 버튼 블록 내부에서만 쓰이는 작은 로딩 표시입니다.
  width: 0.9em;
  height: 0.9em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 999px;
  animation: base-button-spin 700ms linear infinite;
}

.base-button__content {
  display: inline-flex;
}

@keyframes base-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
