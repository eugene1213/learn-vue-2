<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import TripSummaryCard from '@/components/trip/TripSummaryCard.vue'
import { useTripStore } from '@/stores/trip.store'
import type { Trip } from '@/types/trip'

const tripStore = useTripStore()
const deleteTarget = ref<Trip | null>(null)

onMounted(() => {
  void tripStore.fetchTrips()
})

function requestDelete(trip: Trip) {
  deleteTarget.value = trip
}

function cancelDelete() {
  deleteTarget.value = null
}

async function confirmDelete() {
  if (deleteTarget.value === null) {
    return
  }

  const deleted = await tripStore.deleteTrip(deleteTarget.value.id)
  if (deleted) {
    deleteTarget.value = null
  }
}
</script>

<template>
  <section class="trip-list-page" aria-labelledby="trip-list-title">
    <header class="trip-list-page__header">
      <div>
        <p class="trip-list-page__eyebrow">나의 여행</p>
        <h1 id="trip-list-title" class="trip-list-page__title">여행 목록</h1>
      </div>
      <RouterLink class="trip-list-page__create-link" to="/trips/new" data-testid="trip-create-link">
        새 여행 만들기
      </RouterLink>
    </header>

    <p v-if="tripStore.isLoading" class="trip-list-page__state">여행을 불러오는 중입니다.</p>
    <p v-else-if="tripStore.errorMessage" class="trip-list-page__state trip-list-page__state--error">
      {{ tripStore.errorMessage }}
    </p>
    <div v-else-if="tripStore.trips.length === 0" class="trip-list-page__empty">
      <p>아직 등록된 여행이 없습니다.</p>
      <RouterLink to="/trips/new">첫 여행 등록하기</RouterLink>
    </div>
    <div v-else class="trip-list-page__grid">
      <TripSummaryCard
        v-for="trip in tripStore.trips"
        :key="trip.id"
        :trip="trip"
        @delete="requestDelete"
      />
    </div>

    <BaseModal
      :open="deleteTarget !== null"
      title="여행 삭제"
      test-id="trip-delete-modal"
      @close="cancelDelete"
    >
      <p class="trip-list-page__modal-text">
        {{ deleteTarget?.title }} 여행을 삭제하시겠습니까? 관련 일정과 예산도 함께 정리됩니다.
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="cancelDelete">취소</BaseButton>
        <BaseButton variant="danger" :loading="tripStore.isLoading" @click="confirmDelete">삭제</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.trip-list-page {
  display: grid;
  gap: $spacing-6;
}

.trip-list-page__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: $spacing-4;
}

.trip-list-page__eyebrow {
  margin: 0 0 $spacing-2;
  color: $color-primary-dark;
  font-weight: 900;
}

.trip-list-page__title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.6rem);
  letter-spacing: -0.05em;
}

.trip-list-page__create-link {
  border-radius: 999px;
  background: $color-primary;
  color: $color-surface;
  padding: $spacing-3 $spacing-5;
  font-weight: 900;
  text-decoration: none;
}

.trip-list-page__state,
.trip-list-page__empty {
  border: 1px dashed $color-border-strong;
  border-radius: $radius-large;
  background: rgba(255, 255, 255, 0.72);
  color: $color-muted;
  padding: $spacing-6;
  text-align: center;
}

.trip-list-page__state--error {
  border-color: $color-danger;
  color: $color-danger;
}

.trip-list-page__empty p {
  margin: 0 0 $spacing-3;
}

.trip-list-page__grid {
  display: grid;
  gap: $spacing-5;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.trip-list-page__modal-text {
  margin: 0;
  color: $color-muted;
}

@media (max-width: 640px) {
  .trip-list-page__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
