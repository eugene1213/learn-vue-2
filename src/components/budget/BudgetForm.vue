<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import { useBudgetForm, type BudgetFormState } from '@/composables/useBudgetForm'
import { budgetCategories, type BudgetCategory, type CreateBudgetInput } from '@/types/budget'

const categoryLabels: Record<BudgetCategory, string> = {
  transport: '교통',
  lodging: '숙박',
  food: '식비',
  activity: '액티비티',
  shopping: '쇼핑',
  etc: '기타',
}

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<BudgetFormState>
    submitLabel?: string
    cancelLabel?: string
    submitting?: boolean
  }>(),
  {
    initialValues: () => ({}),
    submitLabel: '예산 저장',
    cancelLabel: '취소',
    submitting: false,
  },
)

const emit = defineEmits<{
  submit: [input: CreateBudgetInput]
  cancel: []
}>()

const { form, errors, submit } = useBudgetForm(props.initialValues)

async function handleSubmit() {
  await submit((input) => {
    emit('submit', input)
  })
}
</script>

<template>
  <form class="budget-form" @submit.prevent="handleSubmit">
    <BaseInput
      v-model="form.title"
      label="예산 항목명"
      placeholder="예: 호텔"
      :error="errors.title"
      test-id="budget-title-input"
    />

    <label class="budget-form__field">
      <span class="budget-form__label">카테고리</span>
      <select
        v-model="form.category"
        class="budget-form__select"
        :class="{ 'budget-form__select--error': errors.category }"
        :aria-invalid="Boolean(errors.category)"
        data-testid="budget-category-select"
      >
        <option value="">카테고리를 선택하세요</option>
        <option v-for="category in budgetCategories" :key="category" :value="category">
          {{ categoryLabels[category] }}
        </option>
      </select>
      <span v-if="errors.category" class="budget-form__error">{{ errors.category }}</span>
    </label>

    <div class="budget-form__money-grid">
      <BaseInput
        v-model="form.amount"
        type="number"
        label="금액"
        placeholder="150000"
        :error="errors.amount"
        test-id="budget-amount-input"
      />
      <BaseInput
        v-model="form.spentDate"
        type="date"
        label="지출 날짜"
        :error="errors.spentDate"
        test-id="budget-date-input"
      />
    </div>

    <BaseTextarea
      v-model="form.memo"
      label="메모"
      placeholder="예약 번호, 결제 수단, 포함 내역 등을 적어보세요."
      help="선택 입력입니다."
      test-id="budget-memo-input"
    />

    <div class="budget-form__actions">
      <BaseButton variant="secondary" type="button" @click="emit('cancel')">
        {{ cancelLabel }}
      </BaseButton>
      <BaseButton type="submit" :loading="submitting" test-id="budget-submit-button">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.budget-form {
  display: grid;
  gap: $spacing-5;
}

.budget-form__money-grid {
  display: grid;
  gap: $spacing-4;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.budget-form__field {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.budget-form__label {
  color: $color-text;
  font-size: 0.92rem;
  font-weight: 700;
}

.budget-form__select {
  min-height: 44px;
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
}

.budget-form__select--error {
  border-color: $color-danger;
}

.budget-form__error {
  color: $color-danger;
  font-size: 0.84rem;
}

.budget-form__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: $spacing-3;
}

@media (max-width: 640px) {
  .budget-form__money-grid {
    grid-template-columns: 1fr;
  }

  .budget-form__actions {
    justify-content: stretch;
  }
}
</style>
