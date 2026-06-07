import { defineStore } from 'pinia'

import { createBudget, deleteBudget, getBudgetsByTrip, updateBudget } from '@/api/budgets.api'
import { budgetCategories, type BudgetCategory, type BudgetItem, type CreateBudgetInput, type UpdateBudgetInput } from '@/types/budget'

interface BudgetState {
  budgets: BudgetItem[]
  isLoading: boolean
  errorMessage: string | null
}

function toStoreErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '예산 정보를 처리하는 중 오류가 발생했습니다.'
}

function createEmptyCategoryTotals(): Record<BudgetCategory, number> {
  return budgetCategories.reduce<Record<BudgetCategory, number>>(
    (totals, category) => ({ ...totals, [category]: 0 }),
    { transport: 0, lodging: 0, food: 0, activity: 0, shopping: 0, etc: 0 },
  )
}

// 이 파일에서 배우는 것: 예산 Store는 CRUD 상태를 관리하고, getter로 여행별 합계와 카테고리별 합계를 파생시킵니다.
export const useBudgetStore = defineStore('budget', {
  state: (): BudgetState => ({
    budgets: [],
    isLoading: false,
    errorMessage: null,
  }),
  getters: {
    getByTripId: (state) => (tripId: string) => state.budgets.filter((budget) => budget.tripId === tripId),
    totalByTripId: (state) => (tripId: string) =>
      state.budgets.filter((budget) => budget.tripId === tripId).reduce((total, budget) => total + budget.amount, 0),
    categoryTotalsByTripId: (state) => (tripId: string) =>
      state.budgets
        .filter((budget) => budget.tripId === tripId)
        .reduce<Record<BudgetCategory, number>>((totals, budget) => {
          return { ...totals, [budget.category]: totals[budget.category] + budget.amount }
        }, createEmptyCategoryTotals()),
  },
  actions: {
    async fetchBudgetsByTrip(tripId: string): Promise<void> {
      this.isLoading = true
      this.errorMessage = null

      try {
        const budgets = await getBudgetsByTrip(tripId)
        const otherBudgets = this.budgets.filter((budget) => budget.tripId !== tripId)
        this.budgets = [...otherBudgets, ...budgets]
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
      } finally {
        this.isLoading = false
      }
    },
    async createBudget(input: CreateBudgetInput): Promise<BudgetItem | null> {
      this.isLoading = true
      this.errorMessage = null

      try {
        const budget = await createBudget(input)
        this.budgets = [...this.budgets, budget]
        return budget
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
        return null
      } finally {
        this.isLoading = false
      }
    },
    async updateBudget(id: string, input: UpdateBudgetInput): Promise<BudgetItem | null> {
      this.isLoading = true
      this.errorMessage = null

      try {
        const budget = await updateBudget(id, input)
        this.budgets = this.budgets.map((item) => (item.id === id ? budget : item))
        return budget
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
        return null
      } finally {
        this.isLoading = false
      }
    },
    async deleteBudget(id: string): Promise<boolean> {
      this.isLoading = true
      this.errorMessage = null

      try {
        await deleteBudget(id)
        this.budgets = this.budgets.filter((budget) => budget.id !== id)
        return true
      } catch (error: unknown) {
        this.errorMessage = toStoreErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    clearBudgets(): void {
      this.budgets = []
      this.errorMessage = null
    },
  },
})
