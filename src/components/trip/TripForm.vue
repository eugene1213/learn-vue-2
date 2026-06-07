<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import { useTripForm, type TripFormState } from '@/composables/useTripForm'
import { tripStatuses } from '@/types/trip'
import type { CreateTripInput, TripStatus } from '@/types/trip'

const statusLabels: Record<TripStatus, string> = {
  planned: '계획 중',
  ongoing: '여행 중',
  completed: '완료',
}

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<TripFormState>
    submitLabel?: string
    cancelLabel?: string
    submitting?: boolean
  }>(),
  {
    initialValues: () => ({}),
    submitLabel: '저장하기',
    cancelLabel: '취소',
    submitting: false,
  },
)

const emit = defineEmits<{
  submit: [input: CreateTripInput]
  cancel: []
}>()

const { form, errors, submit } = useTripForm(props.initialValues)

async function handleSubmit() {
  await submit((input) => {
    emit('submit', input)
  })
}
</script>

<template>
  <form class="trip-form" @submit.prevent="handleSubmit">
    <BaseInput
      v-model="form.title"
      label="여행 이름"
      placeholder="예: Seoul Weekend"
      :error="errors.title"
      test-id="trip-title-input"
    />
    <BaseInput
      v-model="form.destination"
      label="여행지"
      placeholder="예: 서울"
      :error="errors.destination"
      test-id="trip-destination-input"
    />

    <div class="trip-form__dates">
      <BaseInput
        v-model="form.startDate"
        type="date"
        label="시작일"
        :error="errors.startDate"
        test-id="trip-start-date-input"
      />
      <BaseInput
        v-model="form.endDate"
        type="date"
        label="종료일"
        :error="errors.endDate"
        test-id="trip-end-date-input"
      />
    </div>

    <label class="trip-form__field">
      <span class="trip-form__label">상태</span>
      <select v-model="form.status" class="trip-form__select" data-testid="trip-status-select">
        <option v-for="status in tripStatuses" :key="status" :value="status">
          {{ statusLabels[status] }}
        </option>
      </select>
    </label>

    <BaseTextarea
      v-model="form.description"
      label="메모"
      placeholder="이 여행에서 꼭 기억하고 싶은 내용을 적어보세요."
      help="선택 입력입니다."
      test-id="trip-description-input"
    />

    <div class="trip-form__actions">
      <BaseButton variant="secondary" type="button" @click="emit('cancel')">
        {{ cancelLabel }}
      </BaseButton>
      <BaseButton type="submit" :loading="submitting" test-id="trip-submit-button">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.trip-form {
  display: grid;
  gap: $spacing-5;
}

.trip-form__dates {
  display: grid;
  gap: $spacing-4;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.trip-form__field {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.trip-form__label {
  color: $color-text;
  font-size: 0.92rem;
  font-weight: 700;
}

.trip-form__select {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  border: 1px solid $color-border;
  border-radius: $radius-small;
  background: $color-surface;
  color: $color-text;
  padding: 0 $spacing-4;
}

.trip-form__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: $spacing-3;
}

@media (max-width: 640px) {
  .trip-form__dates {
    grid-template-columns: 1fr;
  }

  .trip-form__actions {
    justify-content: stretch;
  }
}
</style>
