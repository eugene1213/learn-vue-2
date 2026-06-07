<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    type?: 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url' | 'date' | 'time'
    placeholder?: string
    error?: string
    help?: string
    disabled?: boolean
    testId?: string
  }>(),
  {
    type: 'text',
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
const inputId = `base-input-${generatedId}`
const helpId = `${inputId}-help`
const errorId = `${inputId}-error`
const describedBy = computed(() => {
  if (props.error) {
    return errorId
  }

  if (props.help) {
    return helpId
  }

  return undefined
})

// 이 파일에서 배우는 것: 부모의 v-model 값은 modelValue prop으로 내려오고, input 변경은 update:modelValue emit으로 올라가 부모 상태를 갱신합니다.
function updateValue(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <label class="base-input" :for="inputId">
    <span class="base-input__label">{{ label }}</span>
    <input
      :id="inputId"
      class="base-input__control"
      :class="{ 'base-input__control--error': error }"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      :aria-describedby="describedBy"
      :data-testid="testId"
      @input="updateValue"
    />
    <span v-if="help && !error" :id="helpId" class="base-input__help">{{ help }}</span>
    <span v-if="error" :id="errorId" class="base-input__error">{{ error }}</span>
  </label>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.base-input {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.base-input__label {
  color: $color-text;
  font-size: 0.92rem;
  font-weight: 700;
}

.base-input__control {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  border: 1px solid $color-border;
  border-radius: $radius-small;
  background: $color-surface;
  color: $color-text;
  padding: 0 $spacing-4;
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

.base-input__control--error {
  border-color: $color-danger;
}

.base-input__help,
.base-input__error {
  font-size: 0.84rem;
}

.base-input__help {
  color: $color-muted;
}

.base-input__error {
  color: $color-danger;
}
</style>
