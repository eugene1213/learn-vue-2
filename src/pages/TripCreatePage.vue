<script setup lang="ts">
import { useRouter } from 'vue-router'

import BaseCard from '@/components/base/BaseCard.vue'
import TripForm from '@/components/trip/TripForm.vue'
import { useTripStore } from '@/stores/trip.store'
import type { CreateTripInput } from '@/types/trip'

const router = useRouter()
const tripStore = useTripStore()

async function createTrip(input: CreateTripInput) {
  const trip = await tripStore.createTrip(input)
  if (trip !== null) {
    await router.push(`/trips/${trip.id}`)
  }
}

function cancelCreate() {
  void router.push('/trips')
}
</script>

<template>
  <section class="trip-create-page" aria-labelledby="trip-create-title">
    <BaseCard>
      <template #header>
        <p class="trip-create-page__eyebrow">새 여행</p>
        <h1 id="trip-create-title" class="trip-create-page__title">여행 등록</h1>
      </template>
      <p v-if="tripStore.errorMessage" class="trip-create-page__error">{{ tripStore.errorMessage }}</p>
      <TripForm submit-label="여행 만들기" :submitting="tripStore.isLoading" @submit="createTrip" @cancel="cancelCreate" />
    </BaseCard>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.trip-create-page {
  width: min(100%, 720px);
  margin: 0 auto;
}

.trip-create-page__eyebrow {
  margin: 0 0 $spacing-2;
  color: $color-primary-dark;
  font-weight: 900;
}

.trip-create-page__title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  letter-spacing: -0.05em;
}

.trip-create-page__error {
  border-radius: $radius-small;
  background: $color-danger-soft;
  color: $color-danger;
  margin: 0 0 $spacing-5;
  padding: $spacing-3 $spacing-4;
}
</style>
