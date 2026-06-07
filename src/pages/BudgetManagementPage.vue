<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BudgetForm from '@/components/budget/BudgetForm.vue'
import BudgetSummary from '@/components/budget/BudgetSummary.vue'
import { useBudgetSummary } from '@/composables/useBudgetSummary'
import { useBudgetStore } from '@/stores/budget.store'
import { useTripStore } from '@/stores/trip.store'
import type { BudgetCategory, BudgetItem, CreateBudgetInput, UpdateBudgetInput } from '@/types/budget'
import type { BudgetFormState } from '@/composables/useBudgetForm'
import { formatCurrency } from '@/utils/currency'

const route = useRoute()
const tripStore = useTripStore()
const budgetStore = useBudgetStore()
const hasLoadedTrip = ref(false)
const isFormOpen = ref(false)
const editingBudget = ref<BudgetItem | null>(null)
const deleteTarget = ref<BudgetItem | null>(null)

const categoryLabels: Record<BudgetCategory, string> = {
  transport: '교통',
  lodging: '숙박',
  food: '식비',
  activity: '액티비티',
  shopping: '쇼핑',
  etc: '기타',
}

const tripId = computed(() => {
  const value = route.params.tripId
  return typeof value === 'string' ? value : ''
})
const trip = computed(() => tripStore.getById(tripId.value))
const budgets = computed(() => budgetStore.getByTripId(tripId.value))
const { tripBudgets } = useBudgetSummary(budgets, tripId)
const formInitialValues = computed<Partial<BudgetFormState>>(() => {
  if (editingBudget.value !== null) {
    return {
      tripId: editingBudget.value.tripId,
      category: editingBudget.value.category,
      title: editingBudget.value.title,
      amount: String(editingBudget.value.amount),
      spentDate: editingBudget.value.spentDate,
      memo: editingBudget.value.memo,
    }
  }

  return { tripId: tripId.value }
})

// key를 바꿔 BudgetForm을 다시 마운트하면 편집/신규 전환 시 useBudgetForm의 reactive 입력값과 검증 오류가 섞이지 않습니다.
const formKey = computed(() => editingBudget.value?.id ?? `new-${tripId.value}-${isFormOpen.value}`)

onMounted(async () => {
  await tripStore.fetchTrips()
  hasLoadedTrip.value = true

  if (trip.value !== null) {
    await budgetStore.fetchBudgetsByTrip(trip.value.id)
  }
})

function openCreateForm() {
  editingBudget.value = null
  isFormOpen.value = true
}

function openEditForm(budget: BudgetItem) {
  editingBudget.value = budget
  isFormOpen.value = true
}

function cancelForm() {
  editingBudget.value = null
  isFormOpen.value = false
}

async function saveBudget(input: CreateBudgetInput) {
  if (editingBudget.value !== null) {
    const updateInput: UpdateBudgetInput = {
      category: input.category,
      title: input.title,
      amount: input.amount,
      spentDate: input.spentDate,
      memo: input.memo,
    }
    const updated = await budgetStore.updateBudget(editingBudget.value.id, updateInput)
    if (updated !== null) {
      cancelForm()
    }
    return
  }

  const created = await budgetStore.createBudget(input)
  if (created !== null) {
    cancelForm()
  }
}

async function confirmDelete() {
  if (deleteTarget.value === null) {
    return
  }

  const deleted = await budgetStore.deleteBudget(deleteTarget.value.id)
  if (deleted) {
    deleteTarget.value = null
  }
}
</script>

<template>
  <section class="budget-management-page" aria-labelledby="budget-management-title">
    <p v-if="tripStore.isLoading" class="budget-management-page__state">여행 정보를 불러오는 중입니다.</p>
    <p v-else-if="tripStore.errorMessage" class="budget-management-page__state budget-management-page__state--error">
      {{ tripStore.errorMessage }}
    </p>

    <BaseCard v-else-if="hasLoadedTrip && trip === null" class="budget-management-page__not-found">
      <h1 id="budget-management-title" class="budget-management-page__title">여행을 찾을 수 없습니다.</h1>
      <p>요청한 여행의 예산 페이지를 열 수 없습니다. 여행 목록에서 다시 선택해주세요.</p>
      <RouterLink to="/trips">여행 목록으로 돌아가기</RouterLink>
    </BaseCard>

    <BaseCard v-else-if="trip !== null">
      <template #header>
        <div class="budget-management-page__header">
          <div>
            <p class="budget-management-page__eyebrow">{{ trip.destination }} 예산</p>
            <h1 id="budget-management-title" class="budget-management-page__title">{{ trip.title }}</h1>
          </div>
          <BaseButton v-if="!isFormOpen" test-id="budget-add-button" @click="openCreateForm">예산 추가</BaseButton>
        </div>
      </template>

      <p v-if="budgetStore.errorMessage" class="budget-management-page__state budget-management-page__state--error">
        {{ budgetStore.errorMessage }}
      </p>

      <BudgetSummary :budgets="budgets" :trip-id="trip.id" />

      <BudgetForm
        v-if="isFormOpen"
        :key="formKey"
        :initial-values="formInitialValues"
        :submit-label="editingBudget === null ? '예산 추가' : '예산 수정'"
        :submitting="budgetStore.isLoading"
        @submit="saveBudget"
        @cancel="cancelForm"
      />

      <div v-else class="budget-management-page__list" data-testid="budget-list">
        <p v-if="tripBudgets.length === 0" class="budget-management-page__empty">등록된 예산 항목이 없습니다.</p>

        <ol v-else class="budget-management-page__items">
          <li
            v-for="budget in tripBudgets"
            :key="budget.id"
            class="budget-management-page__item"
            data-testid="budget-list-item"
          >
            <div class="budget-management-page__category">{{ categoryLabels[budget.category] }}</div>
            <div class="budget-management-page__content">
              <h3>{{ budget.title }}</h3>
              <p>{{ budget.spentDate }}</p>
              <p v-if="budget.memo">{{ budget.memo }}</p>
            </div>
            <strong class="budget-management-page__amount">{{ formatCurrency(budget.amount) }}</strong>
            <div class="budget-management-page__item-actions">
              <BaseButton variant="ghost" size="small" @click="openEditForm(budget)">수정</BaseButton>
              <BaseButton variant="danger" size="small" @click="deleteTarget = budget">삭제</BaseButton>
            </div>
          </li>
        </ol>
      </div>

      <template #footer>
        <RouterLink class="budget-management-page__back-link" :to="`/trips/${trip.id}`">여행 상세로 돌아가기</RouterLink>
      </template>
    </BaseCard>

    <BaseModal :open="deleteTarget !== null" title="예산 삭제" test-id="budget-delete-modal" @close="deleteTarget = null">
      <p class="budget-management-page__modal-text">{{ deleteTarget?.title }} 예산 항목을 삭제하시겠습니까?</p>
      <template #footer>
        <BaseButton variant="secondary" @click="deleteTarget = null">취소</BaseButton>
        <BaseButton variant="danger" :loading="budgetStore.isLoading" @click="confirmDelete">삭제</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.budget-management-page {
  width: min(100%, 980px);
  margin: 0 auto;
}

.budget-management-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;
}

.budget-management-page__eyebrow {
  margin: 0 0 $spacing-2;
  color: $color-primary-dark;
  font-weight: 900;
}

.budget-management-page__title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  letter-spacing: -0.04em;
}

.budget-management-page__state,
.budget-management-page__not-found,
.budget-management-page__modal-text,
.budget-management-page__empty {
  color: $color-muted;
}

.budget-management-page__state,
.budget-management-page__not-found {
  text-align: center;
}

.budget-management-page__state--error {
  color: $color-danger;
}

.budget-management-page__empty {
  margin: 0;
  border: 1px dashed $color-border-strong;
  border-radius: $radius-medium;
  background: $color-surface-muted;
  padding: $spacing-6;
  text-align: center;
}

.budget-management-page__items {
  display: grid;
  gap: $spacing-4;
  margin: 0;
  padding: 0;
  list-style: none;
}

.budget-management-page__item {
  display: grid;
  align-items: center;
  gap: $spacing-4;
  grid-template-columns: 110px minmax(0, 1fr) 140px auto;
  border: 1px solid $color-border;
  border-radius: $radius-medium;
  background: linear-gradient(135deg, $color-surface 0%, $color-surface-muted 100%);
  padding: $spacing-4;
}

.budget-management-page__category {
  border-radius: 999px;
  background: $color-primary-soft;
  color: $color-primary-dark;
  padding: $spacing-2 $spacing-3;
  text-align: center;
  font-weight: 900;
}

.budget-management-page__content h3,
.budget-management-page__content p {
  margin: 0;
}

.budget-management-page__content h3,
.budget-management-page__amount {
  color: $color-text;
  font-weight: 900;
}

.budget-management-page__content p {
  margin-top: $spacing-1;
  color: $color-muted;
}

.budget-management-page__amount {
  text-align: right;
}

.budget-management-page__item-actions {
  display: flex;
  gap: $spacing-2;
}

.budget-management-page__back-link,
.budget-management-page__not-found a {
  color: $color-primary-dark;
  font-weight: 900;
}

@media (max-width: 820px) {
  .budget-management-page__item {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .budget-management-page__amount {
    text-align: left;
  }

  .budget-management-page__item-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 640px) {
  .budget-management-page__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
