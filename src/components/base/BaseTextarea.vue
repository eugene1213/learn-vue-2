<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    rows?: number
    placeholder?: string
    error?: string
    help?: string
    disabled?: boolean
    testId?: string
  }>(),
  {
    rows: 4,
    placeholder: '',
    error: '',
    help: '',
    disabled: false,
    testId: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const generatedId = useId()
const textareaId = `base-textarea-${generatedId}`
const helpId = `${textareaId}-help`
const errorId = `${textareaId}-error`
const describedBy = computed(() => {
  if (props.error) {
    return errorId
  }

  if (props.help) {
    return helpId
  }

  return undefined
})

// BaseInput과 같은 v-model 패턴을 textarea에 반복해 단일 줄/여러 줄 입력 차이를 비교할 수 있게 합니다.
function updateValue(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <label class="base-textarea" :for="textareaId">
    <span class="base-textarea__label">{{ label }}</span>
    <textarea
      :id="textareaId"
      class="base-textarea__control"
      :class="{ 'base-textarea__control--error': error }"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      :aria-describedby="describedBy"
      :data-testid="testId"
      @input="updateValue"
    />
    <span v-if="help && !error" :id="helpId" class="base-textarea__help">{{ help }}</span>
    <span v-if="error" :id="errorId" class="base-textarea__error">{{ error }}</span>
  </label>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.base-textarea {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.base-textarea__label {
  color: $color-text;
  font-size: 0.92rem;
  font-weight: 700;
}

.base-textarea__control {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  border: 1px solid $color-border;
  border-radius: $radius-small;
  background: $color-surface;
  color: $color-text;
  padding: $spacing-3 $spacing-4;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;

  &:focus {
    border-color: $color-primary;
    box-shadow: 0 0 0 3px $color-primary-soft;
    outline: none;
  }

  &:disabled {
    background: $color-surface-muted;
    color: $color-disabled;
  }
}

.base-textarea__control--error {
  border-color: $color-danger;
}

.base-textarea__help,
.base-textarea__error {
  font-size: 0.84rem;
}

.base-textarea__help {
  color: $color-muted;
}

.base-textarea__error {
  color: $color-danger;
}
</style>
