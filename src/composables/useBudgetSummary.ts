import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { budgetCategories, type BudgetCategory, type BudgetItem } from '@/types/budget'

function emptyCategoryTotals(): Record<BudgetCategory, number> {
  return budgetCategories.reduce<Record<BudgetCategory, number>>(
    (totals, category) => ({ ...totals, [category]: 0 }),
    { transport: 0, lodging: 0, food: 0, activity: 0, shopping: 0, etc: 0 },
  )
}

// 이 파일에서 배우는 것: MaybeRefOrGetter와 computed를 함께 쓰면 배열/Ref/Getter 입력 모두에서 반응형 합계를 만들 수 있습니다.
export function useBudgetSummary(
  budgets: MaybeRefOrGetter<readonly BudgetItem[]>,
  tripId: MaybeRefOrGetter<string> = '',
) {
  const tripBudgets = computed(() => {
    const currentTripId = toValue(tripId)
    const sourceBudgets = toValue(budgets)
    return currentTripId === '' ? [...sourceBudgets] : sourceBudgets.filter((budget) => budget.tripId === currentTripId)
  })

  const totalAmount = computed(() => tripBudgets.value.reduce((total, budget) => total + budget.amount, 0))

  const categoryTotals = computed(() => {
    return tripBudgets.value.reduce<Record<BudgetCategory, number>>((totals, budget) => {
      return { ...totals, [budget.category]: totals[budget.category] + budget.amount }
    }, emptyCategoryTotals())
  })

  function totalByTrip(targetTripId: string): number {
    return toValue(budgets)
      .filter((budget) => budget.tripId === targetTripId)
      .reduce((total, budget) => total + budget.amount, 0)
  }

  function categoryTotalsByTrip(targetTripId: string): Record<BudgetCategory, number> {
    return toValue(budgets)
      .filter((budget) => budget.tripId === targetTripId)
      .reduce<Record<BudgetCategory, number>>((totals, budget) => {
        return { ...totals, [budget.category]: totals[budget.category] + budget.amount }
      }, emptyCategoryTotals())
  }

  // computed 합계는 원본 예산 배열을 변경하지 않아 Store 상태와 화면 표시 계산을 안전하게 분리합니다.
  return {
    tripBudgets,
    totalAmount,
    categoryTotals,
    totalByTrip,
    categoryTotalsByTrip,
  }
}
