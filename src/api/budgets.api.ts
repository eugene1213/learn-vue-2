import { withApiLatency } from './client'
import { readCollection, storageKeys, writeCollection } from './mockStorage'
import { createApiError } from '@/types/common'
import type { BudgetCategory, BudgetItem, CreateBudgetInput, UpdateBudgetInput } from '@/types/budget'
import { createId } from '@/utils/id'

export function getBudgetsByTrip(tripId: string): Promise<BudgetItem[]> {
  return withApiLatency(() => readBudgets().filter((budget) => budget.tripId === tripId))
}

export function createBudget(input: CreateBudgetInput): Promise<BudgetItem> {
  return withApiLatency(() => {
    const budgets = readBudgets()
    const now = new Date().toISOString()
    const budget: BudgetItem = {
      ...input,
      id: createId('budget'),
      createdAt: now,
      updatedAt: now,
    }

    persistBudgets([...budgets, budget])
    return budget
  })
}

export function updateBudget(id: string, input: UpdateBudgetInput): Promise<BudgetItem> {
  return withApiLatency(() => {
    const budgets = readBudgets()
    const budgetIndex = budgets.findIndex((budget) => budget.id === id)
    if (budgetIndex < 0) {
      throw createApiError('not_found', '수정할 예산 항목을 찾을 수 없습니다.')
    }

    const updatedBudget: BudgetItem = {
      ...budgets[budgetIndex],
      ...input,
      id,
      tripId: budgets[budgetIndex].tripId,
      updatedAt: new Date().toISOString(),
    }
    persistBudgets(budgets.map((budget, index) => (index === budgetIndex ? updatedBudget : budget)))

    return updatedBudget
  })
}

export function deleteBudget(id: string): Promise<void> {
  return withApiLatency(() => {
    persistBudgets(readBudgets().filter((budget) => budget.id !== id))
  })
}

function readBudgets(): BudgetItem[] {
  return readCollection(storageKeys.budgets, isBudgetItem).data
}

function persistBudgets(budgets: readonly BudgetItem[]): void {
  const result = writeCollection(storageKeys.budgets, budgets)
  if (!result.ok && result.error !== null) {
    throw result.error
  }
}

// 예산 금액과 카테고리는 이후 합계 계산의 기반이므로 복원 시 타입을 엄격하게 검증합니다.
function isBudgetItem(value: unknown): value is BudgetItem {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.tripId === 'string' &&
    isBudgetCategory(candidate.category) &&
    typeof candidate.title === 'string' &&
    typeof candidate.amount === 'number' &&
    typeof candidate.spentDate === 'string' &&
    typeof candidate.memo === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  )
}

function isBudgetCategory(value: unknown): value is BudgetCategory {
  return (
    value === 'transport' ||
    value === 'lodging' ||
    value === 'food' ||
    value === 'activity' ||
    value === 'shopping' ||
    value === 'etc'
  )
}
