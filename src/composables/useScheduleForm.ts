import { computed, reactive } from 'vue'

import type { ValidationErrors } from '@/types/common'
import type { CreateScheduleInput, ScheduleValidationField } from '@/types/schedule'

export interface ScheduleFormState {
  tripId: string
  date: string
  time: string
  title: string
  location: string
  memo: string
}

const initialScheduleForm: ScheduleFormState = {
  tripId: '',
  date: '',
  time: '',
  title: '',
  location: '',
  memo: '',
}

export function useScheduleForm(initialValues: Partial<ScheduleFormState> = {}) {
  const form = reactive<ScheduleFormState>({ ...initialScheduleForm, ...initialValues })
  const errors = reactive<ValidationErrors<ScheduleValidationField>>({})

  const isValid = computed(() => Object.keys(errors).length === 0)

  function validate(): boolean {
    clearErrors()

    if (form.title.trim() === '') {
      errors.title = '일정 제목을 입력하세요.'
    }

    if (form.date === '') {
      errors.date = '일정 날짜를 선택하세요.'
    }

    return isValid.value
  }

  function reset(nextValues: Partial<ScheduleFormState> = {}): void {
    Object.assign(form, { ...initialScheduleForm, ...nextValues })
    clearErrors()
  }

  async function submit(onValid: (input: CreateScheduleInput) => Promise<void> | void): Promise<boolean> {
    if (!validate()) {
      return false
    }

    await onValid(toInput())
    return true
  }

  function toInput(): CreateScheduleInput {
    return {
      tripId: form.tripId,
      date: form.date,
      time: form.time,
      title: form.title.trim(),
      location: form.location.trim(),
      memo: form.memo.trim(),
    }
  }

  function clearErrors(): void {
    delete errors.title
    delete errors.date
  }

  // 일정 폼은 특정 여행 화면 안에서만 필요한 임시 상태이므로 전역 Store가 아니라 composable로 관리합니다.
  return {
    form,
    errors,
    isValid,
    validate,
    reset,
    submit,
    toInput,
  }
}
