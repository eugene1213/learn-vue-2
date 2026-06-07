<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import type { Trip, TripStatus } from '@/types/trip'

const props = defineProps<{
  trip: Trip
}>()

const emit = defineEmits<{
  delete: [trip: Trip]
}>()

const statusLabels: Record<TripStatus, string> = {
  planned: '계획 중',
  ongoing: '여행 중',
  completed: '완료',
}

const tripPeriod = computed(() => `${props.trip.startDate} - ${props.trip.endDate}`)
</script>

<template>
  <BaseCard class="trip-summary-card" test-id="trip-card">
    <template #header>
      <div class="trip-summary-card__header">
        <div>
          <p class="trip-summary-card__destination">{{ trip.destination }}</p>
          <h2 class="trip-summary-card__title">
            <RouterLink class="trip-summary-card__title-link" :to="`/trips/${trip.id}`">
              {{ trip.title }}
            </RouterLink>
          </h2>
        </div>
        <span class="trip-summary-card__status">{{ statusLabels[trip.status] }}</span>
      </div>
    </template>

    <p class="trip-summary-card__period">{{ tripPeriod }}</p>
    <p v-if="trip.description" class="trip-summary-card__description">{{ trip.description }}</p>
    <p v-else class="trip-summary-card__description trip-summary-card__description--empty">
      아직 메모가 없습니다.
    </p>

    <template #footer>
      <div class="trip-summary-card__actions">
        <RouterLink class="trip-summary-card__detail-link" :to="`/trips/${trip.id}`">자세히 보기</RouterLink>
        <BaseButton variant="danger" size="small" @click="emit('delete', trip)">삭제</BaseButton>
      </div>
    </template>
  </BaseCard>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.trip-summary-card {
  overflow: hidden;
}

.trip-summary-card__header,
.trip-summary-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;
}

.trip-summary-card__destination {
  margin: 0 0 $spacing-1;
  color: $color-primary-dark;
  font-weight: 800;
}

.trip-summary-card__title {
  margin: 0;
  font-size: 1.35rem;
}

.trip-summary-card__title-link,
.trip-summary-card__detail-link {
  color: $color-text;
  text-decoration: none;
}

.trip-summary-card__title-link:hover,
.trip-summary-card__detail-link:hover {
  color: $color-primary-dark;
}

.trip-summary-card__status {
  flex: 0 0 auto;
  border-radius: 999px;
  background: $color-success-soft;
  color: $color-success;
  padding: $spacing-1 $spacing-3;
  font-size: 0.85rem;
  font-weight: 800;
}

.trip-summary-card__period,
.trip-summary-card__description {
  margin: 0;
  color: $color-muted;
}

.trip-summary-card__description {
  margin-top: $spacing-3;
}

.trip-summary-card__description--empty {
  color: $color-disabled;
}

.trip-summary-card__detail-link {
  font-weight: 800;
}

@media (max-width: 640px) {
  .trip-summary-card__header,
  .trip-summary-card__actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
