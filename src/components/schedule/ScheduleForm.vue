<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import { useScheduleForm, type ScheduleFormState } from '@/composables/useScheduleForm'
import type { CreateScheduleInput } from '@/types/schedule'

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<ScheduleFormState>
    submitLabel?: string
    cancelLabel?: string
    submitting?: boolean
  }>(),
  {
    initialValues: () => ({}),
    submitLabel: '일정 저장',
    cancelLabel: '취소',
    submitting: false,
  },
)

const emit = defineEmits<{
  submit: [input: CreateScheduleInput]
  cancel: []
}>()

const { form, errors, submit } = useScheduleForm(props.initialValues)

async function handleSubmit() {
  await submit((input) => {
    emit('submit', input)
  })
}
</script>

<template>
  <form class="schedule-form" @submit.prevent="handleSubmit">
    <BaseInput
      v-model="form.title"
      label="일정 제목"
      placeholder="예: 광화문 방문"
      :error="errors.title"
      test-id="schedule-title-input"
    />

    <div class="schedule-form__time-grid">
      <BaseInput
        v-model="form.date"
        type="date"
        label="날짜"
        :error="errors.date"
        test-id="schedule-date-input"
      />
      <BaseInput v-model="form.time" type="time" label="시간" test-id="schedule-time-input" />
    </div>

    <BaseInput
      v-model="form.location"
      label="장소"
      placeholder="예: 광화문 광장"
      help="선택 입력입니다."
      test-id="schedule-location-input"
    />

    <BaseTextarea
      v-model="form.memo"
      label="메모"
      placeholder="준비물, 예약 정보, 함께할 사람 등을 적어보세요."
      help="선택 입력입니다."
      test-id="schedule-memo-input"
    />

    <div class="schedule-form__actions">
      <BaseButton variant="secondary" type="button" @click="emit('cancel')">
        {{ cancelLabel }}
      </BaseButton>
      <BaseButton type="submit" :loading="submitting" test-id="schedule-submit-button">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.schedule-form {
  display: grid;
  gap: $spacing-5;
}

.schedule-form__time-grid {
  display: grid;
  gap: $spacing-4;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.schedule-form__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: $spacing-3;
}

@media (max-width: 640px) {
  .schedule-form__time-grid {
    grid-template-columns: 1fr;
  }

  .schedule-form__actions {
    justify-content: stretch;
  }
}
</style>
