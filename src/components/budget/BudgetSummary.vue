<script setup lang="ts">
import { computed } from 'vue'

import { useBudgetSummary } from '@/composables/useBudgetSummary'
import { budgetCategories, type BudgetCategory, type BudgetItem } from '@/types/budget'
import { formatCurrency } from '@/utils/currency'

const props = defineProps<{
  budgets: BudgetItem[]
  tripId: string
}>()

const categoryLabels: Record<BudgetCategory, string> = {
  transport: '교통',
  lodging: '숙박',
  food: '식비',
  activity: '액티비티',
  shopping: '쇼핑',
  etc: '기타',
}

const { totalAmount, categoryTotals } = useBudgetSummary(
  () => props.budgets,
  () => props.tripId,
)

const categoryRows = computed(() =>
  budgetCategories.map((category) => ({
    category,
    label: categoryLabels[category],
    amount: categoryTotals.value[category],
  })),
)
</script>

<template>
  <section class="budget-summary" aria-label="예산 요약">
    <div class="budget-summary__total-card">
      <span class="budget-summary__label">총 예산</span>
      <strong class="budget-summary__total" data-testid="budget-total">{{ formatCurrency(totalAmount) }}</strong>
    </div>

    <dl class="budget-summary__categories">
      <div v-for="row in categoryRows" :key="row.category" class="budget-summary__category">
        <dt>{{ row.label }}</dt>
        <dd>{{ formatCurrency(row.amount) }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.budget-summary {
  display: grid;
  gap: $spacing-4;
  margin-bottom: $spacing-6;
}

.budget-summary__total-card {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: $spacing-4;
  border: 1px solid $color-border;
  border-radius: $radius-large;
  background:
    linear-gradient(135deg, rgba($color-primary, 0.13), transparent 55%),
    $color-surface-muted;
  padding: $spacing-5;
}

.budget-summary__label {
  color: $color-muted;
  font-weight: 800;
}

.budget-summary__total {
  color: $color-primary-dark;
  font-size: clamp(1.8rem, 5vw, 3rem);
  letter-spacing: -0.05em;
}

.budget-summary__categories {
  display: grid;
  gap: $spacing-3;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
}

.budget-summary__category {
  border: 1px solid $color-border;
  border-radius: $radius-medium;
  background: $color-surface;
  padding: $spacing-4;
}

.budget-summary__category dt {
  color: $color-muted;
  font-size: 0.88rem;
  font-weight: 800;
}

.budget-summary__category dd {
  margin: $spacing-1 0 0;
  color: $color-text;
  font-weight: 900;
}

@media (max-width: 720px) {
  .budget-summary__total-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .budget-summary__categories {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 460px) {
  .budget-summary__categories {
    grid-template-columns: 1fr;
  }
}
</style>
