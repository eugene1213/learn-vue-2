<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import TripForm from '@/components/trip/TripForm.vue'
import { useTripStore } from '@/stores/trip.store'
import type { CreateTripInput, TripStatus } from '@/types/trip'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()
const isEditing = ref(false)
const isDeleteOpen = ref(false)

const statusLabels: Record<TripStatus, string> = {
  planned: '계획 중',
  ongoing: '여행 중',
  completed: '완료',
}

const tripId = computed(() => {
  const value = route.params.tripId
  return typeof value === 'string' ? value : ''
})
const trip = computed(() => tripStore.getById(tripId.value))
const hasLoaded = computed(() => !tripStore.isLoading)

onMounted(() => {
  void tripStore.fetchTrips()
})

async function updateTrip(input: CreateTripInput) {
  if (trip.value === null) {
    return
  }

  const updated = await tripStore.updateTrip(trip.value.id, input)
  if (updated !== null) {
    isEditing.value = false
  }
}

function cancelEdit() {
  isEditing.value = false
}

async function confirmDelete() {
  if (trip.value === null) {
    return
  }

  const deleted = await tripStore.deleteTrip(trip.value.id)
  if (deleted) {
    isDeleteOpen.value = false
    await router.push('/trips')
  }
}
</script>

<template>
  <section class="trip-detail-page" aria-labelledby="trip-detail-title">
    <p v-if="tripStore.isLoading" class="trip-detail-page__state">여행을 불러오는 중입니다.</p>
    <p v-else-if="tripStore.errorMessage" class="trip-detail-page__state trip-detail-page__state--error">
      {{ tripStore.errorMessage }}
    </p>
    <BaseCard v-else-if="hasLoaded && trip === null" class="trip-detail-page__not-found">
      <h1 id="trip-detail-title" class="trip-detail-page__title">여행을 찾을 수 없습니다.</h1>
      <p>요청한 여행이 없거나 이미 삭제되었습니다. 여행 목록에서 다시 선택해주세요.</p>
      <RouterLink to="/trips">여행 목록으로 돌아가기</RouterLink>
    </BaseCard>
    <BaseCard v-else-if="trip !== null">
      <template #header>
        <div class="trip-detail-page__header">
          <div>
            <p class="trip-detail-page__eyebrow">{{ trip.destination }}</p>
            <h1 id="trip-detail-title" class="trip-detail-page__title">{{ trip.title }}</h1>
          </div>
          <span class="trip-detail-page__status">{{ statusLabels[trip.status] }}</span>
        </div>
      </template>

      <TripForm
        v-if="isEditing"
        :key="trip.id"
        :initial-values="trip"
        submit-label="수정 완료"
        :submitting="tripStore.isLoading"
        @submit="updateTrip"
        @cancel="cancelEdit"
      />

      <div v-else class="trip-detail-page__content">
        <dl class="trip-detail-page__facts">
          <div>
            <dt>일정</dt>
            <dd>{{ trip.startDate }} - {{ trip.endDate }}</dd>
          </div>
          <div>
            <dt>상태</dt>
            <dd>{{ statusLabels[trip.status] }}</dd>
          </div>
        </dl>
        <p v-if="trip.description" class="trip-detail-page__description">{{ trip.description }}</p>
        <p v-else class="trip-detail-page__description trip-detail-page__description--empty">
          아직 작성된 메모가 없습니다.
        </p>
        <div class="trip-detail-page__links">
          <RouterLink :to="`/trips/${trip.id}/schedule`">일정 관리 보기</RouterLink>
          <RouterLink :to="`/trips/${trip.id}/budget`">예산 관리 보기</RouterLink>
        </div>
      </div>

      <template #footer>
        <div class="trip-detail-page__actions">
          <RouterLink class="trip-detail-page__back-link" to="/trips">목록으로</RouterLink>
          <div class="trip-detail-page__button-group">
            <BaseButton v-if="!isEditing" variant="secondary" @click="isEditing = true">수정</BaseButton>
            <BaseButton v-if="!isEditing" variant="danger" @click="isDeleteOpen = true">삭제</BaseButton>
          </div>
        </div>
      </template>
    </BaseCard>

    <BaseModal :open="isDeleteOpen" title="여행 삭제" test-id="trip-delete-modal" @close="isDeleteOpen = false">
      <p class="trip-detail-page__modal-text">{{ trip?.title }} 여행을 삭제하시겠습니까?</p>
      <template #footer>
        <BaseButton variant="secondary" @click="isDeleteOpen = false">취소</BaseButton>
        <BaseButton variant="danger" :loading="tripStore.isLoading" @click="confirmDelete">삭제</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.trip-detail-page {
  width: min(100%, 820px);
  margin: 0 auto;
}

.trip-detail-page__header,
.trip-detail-page__actions,
.trip-detail-page__links,
.trip-detail-page__button-group {
  display: flex;
  align-items: center;
  gap: $spacing-4;
}

.trip-detail-page__header,
.trip-detail-page__actions {
  justify-content: space-between;
}

.trip-detail-page__eyebrow {
  margin: 0 0 $spacing-2;
  color: $color-primary-dark;
  font-weight: 900;
}

.trip-detail-page__title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  letter-spacing: -0.05em;
}

.trip-detail-page__status {
  border-radius: 999px;
  background: $color-success-soft;
  color: $color-success;
  padding: $spacing-2 $spacing-4;
  font-weight: 900;
}

.trip-detail-page__content {
  display: grid;
  gap: $spacing-5;
}

.trip-detail-page__facts {
  display: grid;
  gap: $spacing-4;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
}

.trip-detail-page__facts div {
  border-radius: $radius-medium;
  background: $color-surface-muted;
  padding: $spacing-4;
}

.trip-detail-page__facts dt {
  color: $color-muted;
  font-size: 0.9rem;
  font-weight: 800;
}

.trip-detail-page__facts dd {
  margin: $spacing-1 0 0;
  color: $color-text;
  font-weight: 900;
}

.trip-detail-page__description,
.trip-detail-page__modal-text,
.trip-detail-page__state,
.trip-detail-page__not-found p {
  color: $color-muted;
}

.trip-detail-page__description--empty {
  color: $color-disabled;
}

.trip-detail-page__links {
  flex-wrap: wrap;
}

.trip-detail-page__links a,
.trip-detail-page__back-link,
.trip-detail-page__not-found a {
  color: $color-primary-dark;
  font-weight: 900;
}

.trip-detail-page__state,
.trip-detail-page__not-found {
  text-align: center;
}

.trip-detail-page__state--error {
  color: $color-danger;
}

@media (max-width: 640px) {
  .trip-detail-page__header,
  .trip-detail-page__actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .trip-detail-page__facts {
    grid-template-columns: 1fr;
  }
}
</style>
