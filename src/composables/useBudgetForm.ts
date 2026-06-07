import { computed, reactive } from 'vue'

import type { BudgetCategory, BudgetValidationField, CreateBudgetInput } from '@/types/budget'
import type { ValidationErrors } from '@/types/common'

export interface BudgetFormState {
  tripId: string
  category: BudgetCategory | ''
  title: string
  amount: string
  spentDate: string
  memo: string
}

const initialBudgetForm: BudgetFormState = {
  tripId: '',
  category: '',
  title: '',
  amount: '',
  spentDate: '',
  memo: '',
}

export function useBudgetForm(initialValues: Partial<BudgetFormState> = {}) {
  const form = reactive<BudgetFormState>({ ...initialBudgetForm, ...initialValues })
  const errors = reactive<ValidationErrors<BudgetValidationField>>({})

  const parsedAmount = computed(() => Number(form.amount))
  const isValid = computed(() => Object.keys(errors).length === 0)

  function validate(): boolean {
    clearErrors()

    if (form.title.trim() === '') {
      errors.title = '예산 항목명을 입력하세요.'
    }

    if (form.category === '') {
      errors.category = '예산 카테고리를 선택하세요.'
    }

    if (form.spentDate === '') {
      errors.spentDate = '지출 날짜를 선택하세요.'
    }

    if (!Number.isInteger(parsedAmount.value) || parsedAmount.value < 1) {
      errors.amount = '예산 금액은 1원 이상이어야 합니다.'
    }

    return isValid.value
  }

  function reset(nextValues: Partial<BudgetFormState> = {}): void {
    Object.assign(form, { ...initialBudgetForm, ...nextValues })
    clearErrors()
  }

  async function submit(onValid: (input: CreateBudgetInput) => Promise<void> | void): Promise<boolean> {
    if (!validate()) {
      return false
    }

    await onValid(toInput())
    return true
  }

  function toInput(): CreateBudgetInput {
    if (form.category === '') {
      throw new Error('예산 카테고리를 선택하세요.')
    }

    return {
      tripId: form.tripId,
      category: form.category,
      title: form.title.trim(),
      amount: parsedAmount.value,
      spentDate: form.spentDate,
      memo: form.memo.trim(),
    }
  }

  function clearErrors(): void {
    delete errors.title
    delete errors.category
    delete errors.amount
    delete errors.spentDate
  }

  // 금액 입력은 문자열로 받고 검증 후 숫자로 변환해, 화면 입력 상태와 도메인 저장 타입을 명확히 분리합니다.
  return {
    form,
    errors,
    parsedAmount,
    isValid,
    validate,
    reset,
    submit,
    toInput,
  }
}
