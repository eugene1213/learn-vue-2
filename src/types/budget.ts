import type { TimestampedRecord } from './common'

export type BudgetCategory = 'transport' | 'lodging' | 'food' | 'activity' | 'shopping' | 'etc'

export interface BudgetItem extends TimestampedRecord {
  tripId: string
  category: BudgetCategory
  title: string
  amount: number
  spentDate: string
  memo: string
}

export type CreateBudgetInput = Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateBudgetInput = Partial<Omit<CreateBudgetInput, 'tripId'>>

export type BudgetValidationField = 'category' | 'title' | 'amount' | 'spentDate'

// 카테고리 union은 예산 요약과 필터 UI가 문자열 오타 없이 같은 선택지를 공유하도록 합니다.
export const budgetCategories: readonly BudgetCategory[] = [
  'transport',
  'lodging',
  'food',
  'activity',
  'shopping',
  'etc',
]
