<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import { useBudgetStore } from '@/stores/budget.store'
import { useScheduleStore } from '@/stores/schedule.store'
import { useTripStore } from '@/stores/trip.store'
import type { ScheduleItem } from '@/types/schedule'
import type { Trip } from '@/types/trip'
import { formatCurrency } from '@/utils/currency'

const tripStore = useTripStore()
const scheduleStore = useScheduleStore()
const budgetStore = useBudgetStore()

const today = new Date().toISOString().slice(0, 10)

const isLoading = computed(() => tripStore.isLoading || scheduleStore.isLoading || budgetStore.isLoading)
const hasTrips = computed(() => tripStore.trips.length > 0)
const totalBudget = computed(() => budgetStore.budgets.reduce((total, budget) => total + budget.amount, 0))
const upcomingSchedules = computed(() => {
  return [...scheduleStore.schedules]
    .filter((schedule) => schedule.date >= today)
    .sort((left, right) => `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`))
})
const activeTrips = computed(() => {
  return tripStore.trips.filter((trip) => trip.status === 'ongoing' || (trip.startDate <= today && trip.endDate >= today))
})
const currentTrips = computed(() => (activeTrips.value.length > 0 ? activeTrips.value : tripStore.trips.slice(0, 3)))

onMounted(async () => {
  await tripStore.fetchTrips()

  // 페이지는 API를 직접 호출하지 않고 Store action만 조합합니다. 여러 여행의 부가 데이터를 병렬로 읽어 API 계층 분리와 화면 성능을 함께 학습합니다.
  await Promise.all(
    tripStore.trips.map(async (trip) => {
      await Promise.all([scheduleStore.fetchSchedulesByTrip(trip.id), budgetStore.fetchBudgetsByTrip(trip.id)])
    }),
  )
})

function tripTitle(tripId: string): string {
  return tripStore.getById(tripId)?.title ?? '알 수 없는 여행'
}

function tripBudget(trip: Trip): string {
  return formatCurrency(budgetStore.totalByTripId(trip.id))
}

function scheduleMeta(schedule: ScheduleItem): string {
  const time = schedule.time ? ` ${schedule.time}` : ''
  return `${schedule.date}${time} · ${tripTitle(schedule.tripId)}`
}
</script>

<template>
  <section class="dashboard-page" aria-labelledby="dashboard-title">
    <div class="dashboard-page__hero">
      <p class="dashboard-page__eyebrow">나의 여행 현황</p>
      <h1 id="dashboard-title" class="dashboard-page__title">여행 플래너</h1>
      <p class="dashboard-page__description" data-testid="app-smoke-text">
        Vue 3 여행 계획 앱이 준비되었습니다. 등록한 여행, 다가오는 일정, 예산 합계를 한눈에 확인하세요.
      </p>
    </div>

    <BaseCard v-if="!isLoading && !hasTrips" class="dashboard-page__empty" test-id="dashboard-empty-state">
      <p class="dashboard-page__empty-text">여행을 추가하고 일정을 계획해보세요.</p>
      <RouterLink to="/trips/new" data-testid="dashboard-create-trip-link">
        <BaseButton size="large">새 여행 만들기</BaseButton>
      </RouterLink>
    </BaseCard>

    <div v-else class="dashboard-page__content">
      <div class="dashboard-page__metrics" aria-label="여행 요약">
        <BaseCard title="전체 여행" test-id="dashboard-trip-count">
          <strong class="dashboard-page__metric-value">{{ tripStore.tripCount }}</strong>
          <span class="dashboard-page__metric-label">개 여행</span>
        </BaseCard>
        <BaseCard title="다가오는 일정" test-id="dashboard-upcoming-count">
          <strong class="dashboard-page__metric-value">{{ upcomingSchedules.length }}</strong>
          <span class="dashboard-page__metric-label">개 일정</span>
        </BaseCard>
        <BaseCard title="총 예산" test-id="dashboard-budget-total">
          <strong class="dashboard-page__metric-value">{{ formatCurrency(totalBudget) }}</strong>
          <span class="dashboard-page__metric-label">KRW 기준</span>
        </BaseCard>
      </div>

      <div class="dashboard-page__grid">
        <BaseCard title="현재 집중할 여행" subtitle="진행 중인 여행이 없으면 최근 등록 여행을 보여줍니다.">
          <ul class="dashboard-page__list" data-testid="dashboard-active-trips">
            <li v-for="trip in currentTrips" :key="trip.id" class="dashboard-page__trip-item">
              <RouterLink class="dashboard-page__item-title" :to="`/trips/${trip.id}`">{{ trip.title }}</RouterLink>
              <span class="dashboard-page__item-meta">{{ trip.destination }} · {{ trip.startDate }} ~ {{ trip.endDate }}</span>
              <span class="dashboard-page__item-budget">{{ tripBudget(trip) }}</span>
            </li>
          </ul>
        </BaseCard>

        <BaseCard title="다가오는 일정" subtitle="날짜와 시간순으로 정렬됩니다.">
          <ul v-if="upcomingSchedules.length > 0" class="dashboard-page__list" data-testid="dashboard-upcoming-list">
            <li v-for="schedule in upcomingSchedules.slice(0, 5)" :key="schedule.id" class="dashboard-page__schedule-item">
              <span class="dashboard-page__item-title">{{ schedule.title }}</span>
              <span class="dashboard-page__item-meta">{{ scheduleMeta(schedule) }}</span>
            </li>
          </ul>
          <p v-else class="dashboard-page__muted">다가오는 일정이 없습니다.</p>
        </BaseCard>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.dashboard-page {
  display: grid;
  gap: $spacing-6;
}

.dashboard-page__hero {
  overflow: hidden;
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: $radius-large;
  background:
    radial-gradient(circle at 88% 16%, rgba(21, 128, 61, 0.16), transparent 15rem),
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(219, 234, 254, 0.74));
  box-shadow: $shadow-card;
  padding: clamp(28px, 6vw, 64px);
}

.dashboard-page__eyebrow {
  margin: 0 0 $spacing-3;
  color: $color-primary-dark;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.dashboard-page__title {
  margin: 0;
  color: $color-text;
  font-size: clamp(2.5rem, 8vw, 5rem);
  letter-spacing: -0.07em;
  line-height: 0.95;
}

.dashboard-page__description {
  max-width: 620px;
  margin: $spacing-5 0 0;
  color: $color-muted;
  font-size: clamp(1rem, 2vw, 1.2rem);
}

.dashboard-page__empty {
  width: min(100%, 680px);
  margin: 0 auto;
  text-align: center;
}

.dashboard-page__empty-text {
  margin: 0 0 $spacing-5;
  color: $color-text;
  font-size: 1.25rem;
  font-weight: 800;
}

.dashboard-page__content,
.dashboard-page__list {
  display: grid;
  gap: $spacing-4;
}

.dashboard-page__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: $spacing-4;
}

.dashboard-page__metric-value {
  display: block;
  color: $color-text;
  font-size: clamp(2rem, 5vw, 3.25rem);
  letter-spacing: -0.06em;
  line-height: 1;
}

.dashboard-page__metric-label,
.dashboard-page__item-meta,
.dashboard-page__muted {
  color: $color-muted;
}

.dashboard-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: $spacing-4;
}

.dashboard-page__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.dashboard-page__trip-item,
.dashboard-page__schedule-item {
  display: grid;
  gap: $spacing-1;
  border: 1px solid $color-border;
  border-radius: $radius-small;
  background: $color-surface-muted;
  padding: $spacing-4;
}

.dashboard-page__item-title {
  color: $color-text;
  font-weight: 900;
  text-decoration: none;
}

.dashboard-page__item-budget {
  color: $color-primary-dark;
  font-weight: 900;
}

.dashboard-page__muted {
  margin: 0;
}

@media (max-width: 720px) {
  .dashboard-page__metrics,
  .dashboard-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
