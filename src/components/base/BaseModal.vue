<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    closeOnOverlay?: boolean
    closeOnEscape?: boolean
    testId?: string
  }>(),
  {
    closeOnOverlay: true,
    closeOnEscape: true,
    testId: undefined,
  },
)

const emit = defineEmits<{
  close: []
}>()

function requestClose() {
  emit('close')
}

function closeFromOverlay() {
  if (props.closeOnOverlay) {
    requestClose()
  }
}

function handleEscape(event: KeyboardEvent) {
  if (props.open && props.closeOnEscape && event.key === 'Escape') {
    requestClose()
  }
}

// watch 학습: 모달이 열려 있을 때만 전역 키보드 이벤트를 연결해 컴포넌트 생명주기와 부작용을 함께 보여줍니다.
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      return
    }

    window.removeEventListener('keydown', handleEscape)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="base-modal__overlay"
      :data-testid="testId"
      @click.self="closeFromOverlay"
    >
      <section class="base-modal" role="dialog" aria-modal="true" :aria-labelledby="`${testId ?? 'base-modal'}-title`">
        <header class="base-modal__header">
          <h2 :id="`${testId ?? 'base-modal'}-title`" class="base-modal__title">{{ title }}</h2>
          <button class="base-modal__close" type="button" aria-label="모달 닫기" @click="requestClose">
            ×
          </button>
        </header>

        <div class="base-modal__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="base-modal__footer">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.base-modal__overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  background: $color-overlay;
  padding: $spacing-6;
}

.base-modal {
  width: min(100%, 560px);
  border-radius: $radius-large;
  background: $color-surface;
  box-shadow: $shadow-modal;
}

.base-modal__header,
.base-modal__footer {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-5 $spacing-6;
}

.base-modal__header {
  justify-content: space-between;
  border-bottom: 1px solid $color-border;
}

.base-modal__title {
  margin: 0;
  color: $color-text;
  font-size: 1.25rem;
}

.base-modal__close {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid $color-border;
  border-radius: 999px;
  background: $color-surface;
  color: $color-muted;
  cursor: pointer;
  font-size: 1.4rem;
  line-height: 1;

  &:focus-visible {
    outline: 3px solid $color-primary-soft;
    outline-offset: 2px;
  }
}

.base-modal__body {
  padding: $spacing-6;
}

.base-modal__footer {
  justify-content: flex-end;
  border-top: 1px solid $color-border;
}

@media (max-width: 640px) {
  .base-modal__overlay {
    align-items: flex-end;
    padding: $spacing-3;
  }

  .base-modal {
    border-radius: $radius-medium;
  }
}
</style>
