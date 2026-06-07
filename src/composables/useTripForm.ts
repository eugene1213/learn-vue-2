import { computed, reactive } from 'vue'

import type { ValidationErrors } from '@/types/common'
import type { CreateTripInput, TripStatus, TripValidationField } from '@/types/trip'

export interface TripFormState {
  title: string
  destination: string
  startDate: string
  endDate: string
  description: string
  status: TripStatus
}

const initialTripForm: TripFormState = {
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  description: '',
  status: 'planned',
}

export function useTripForm(initialValues: Partial<TripFormState> = {}) {
  const form = reactive<TripFormState>({ ...initialTripForm, ...initialValues })
  const errors = reactive<ValidationErrors<TripValidationField>>({})

  const isValid = computed(() => Object.keys(errors).length === 0)

  function validate(): boolean {
    clearErrors()

    if (form.title.trim() === '') {
      errors.title = '여행 이름을 입력하세요.'
    }

    if (form.destination.trim() === '') {
      errors.destination = '여행지를 입력하세요.'
    }

    if (form.startDate === '') {
      errors.startDate = '시작일을 선택하세요.'
    }

    if (form.endDate === '') {
      errors.endDate = '종료일을 선택하세요.'
    }

    if (form.startDate !== '' && form.endDate !== '' && form.startDate > form.endDate) {
      errors.startDate = '시작일은 종료일보다 늦을 수 없습니다.'
    }

    return isValid.value
  }

  function reset(nextValues: Partial<TripFormState> = {}): void {
    Object.assign(form, { ...initialTripForm, ...nextValues })
    clearErrors()
  }

  async function submit(onValid: (input: CreateTripInput) => Promise<void> | void): Promise<boolean> {
    if (!validate()) {
      return false
    }

    await onValid(toInput())
    return true
  }

  function toInput(): CreateTripInput {
    return {
      title: form.title.trim(),
      destination: form.destination.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description.trim(),
      status: form.status,
    }
  }

  function clearErrors(): void {
    delete errors.title
    delete errors.destination
    delete errors.startDate
    delete errors.endDate
  }

  // 폼 composable은 reactive 입력값과 검증 규칙을 캡슐화해 Store가 화면별 입력 상태까지 알 필요 없게 만듭니다.
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
