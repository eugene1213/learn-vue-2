<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import ScheduleForm from '@/components/schedule/ScheduleForm.vue'
import ScheduleList from '@/components/schedule/ScheduleList.vue'
import { useScheduleStore } from '@/stores/schedule.store'
import { useTripStore } from '@/stores/trip.store'
import type { ScheduleFormState } from '@/composables/useScheduleForm'
import type { CreateScheduleInput, ScheduleItem, UpdateScheduleInput } from '@/types/schedule'

const route = useRoute()
const tripStore = useTripStore()
const scheduleStore = useScheduleStore()
const hasLoadedTrip = ref(false)
const isFormOpen = ref(false)
const editingSchedule = ref<ScheduleItem | null>(null)
const deleteTarget = ref<ScheduleItem | null>(null)

const tripId = computed(() => {
  const value = route.params.tripId
  return typeof value === 'string' ? value : ''
})
const trip = computed(() => tripStore.getById(tripId.value))
const schedules = computed(() => scheduleStore.getByTripId(tripId.value))
const formInitialValues = computed<Partial<ScheduleFormState>>(() => {
  if (editingSchedule.value !== null) {
    return editingSchedule.value
  }

  return { tripId: tripId.value }
})

// key에 편집 대상과 열림 상태를 포함해 같은 컴포넌트를 재사용해도 composable의 reactive 폼 상태가 이전 입력을 끌고 오지 않게 합니다.
const formKey = computed(() => editingSchedule.value?.id ?? `new-${tripId.value}-${isFormOpen.value}`)

onMounted(async () => {
  await tripStore.fetchTrips()
  hasLoadedTrip.value = true

  if (trip.value !== null) {
    await scheduleStore.fetchSchedulesByTrip(trip.value.id)
  }
})

function openCreateForm() {
  editingSchedule.value = null
  isFormOpen.value = true
}

function openEditForm(schedule: ScheduleItem) {
  editingSchedule.value = schedule
  isFormOpen.value = true
}

function cancelForm() {
  editingSchedule.value = null
  isFormOpen.value = false
}

async function saveSchedule(input: CreateScheduleInput) {
  if (editingSchedule.value !== null) {
    const updateInput: UpdateScheduleInput = {
      date: input.date,
      time: input.time,
      title: input.title,
      location: input.location,
      memo: input.memo,
    }
    const updated = await scheduleStore.updateSchedule(editingSchedule.value.id, updateInput)
    if (updated !== null) {
      cancelForm()
    }
    return
  }

  const created = await scheduleStore.createSchedule(input)
  if (created !== null) {
    cancelForm()
  }
}

async function confirmDelete() {
  if (deleteTarget.value === null) {
    return
  }

  const deleted = await scheduleStore.deleteSchedule(deleteTarget.value.id)
  if (deleted) {
    deleteTarget.value = null
  }
}
</script>

<template>
  <section class="schedule-management-page" aria-labelledby="schedule-management-title">
    <p v-if="tripStore.isLoading" class="schedule-management-page__state">여행 정보를 불러오는 중입니다.</p>
    <p v-else-if="tripStore.errorMessage" class="schedule-management-page__state schedule-management-page__state--error">
      {{ tripStore.errorMessage }}
    </p>

    <BaseCard v-else-if="hasLoadedTrip && trip === null" class="schedule-management-page__not-found">
      <h1 id="schedule-management-title" class="schedule-management-page__title">여행을 찾을 수 없습니다.</h1>
      <p>요청한 여행의 일정 페이지를 열 수 없습니다. 여행 목록에서 다시 선택해주세요.</p>
      <RouterLink to="/trips">여행 목록으로 돌아가기</RouterLink>
    </BaseCard>

    <BaseCard v-else-if="trip !== null">
      <template #header>
        <div class="schedule-management-page__header">
          <div>
            <p class="schedule-management-page__eyebrow">{{ trip.destination }} 일정</p>
            <h1 id="schedule-management-title" class="schedule-management-page__title">{{ trip.title }}</h1>
          </div>
          <BaseButton v-if="!isFormOpen" test-id="schedule-add-button" @click="openCreateForm">일정 추가</BaseButton>
        </div>
      </template>

      <p v-if="scheduleStore.errorMessage" class="schedule-management-page__state schedule-management-page__state--error">
        {{ scheduleStore.errorMessage }}
      </p>

      <ScheduleForm
        v-if="isFormOpen"
        :key="formKey"
        :initial-values="formInitialValues"
        :submit-label="editingSchedule === null ? '일정 추가' : '일정 수정'"
        :submitting="scheduleStore.isLoading"
        @submit="saveSchedule"
        @cancel="cancelForm"
      />

      <ScheduleList v-else :schedules="schedules" @edit="openEditForm" @delete="deleteTarget = $event" />

      <template #footer>
        <RouterLink class="schedule-management-page__back-link" :to="`/trips/${trip.id}`">여행 상세로 돌아가기</RouterLink>
      </template>
    </BaseCard>

    <BaseModal :open="deleteTarget !== null" title="일정 삭제" test-id="schedule-delete-modal" @close="deleteTarget = null">
      <p class="schedule-management-page__modal-text">{{ deleteTarget?.title }} 일정을 삭제하시겠습니까?</p>
      <template #footer>
        <BaseButton variant="secondary" @click="deleteTarget = null">취소</BaseButton>
        <BaseButton variant="danger" :loading="scheduleStore.isLoading" @click="confirmDelete">삭제</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.schedule-management-page {
  width: min(100%, 920px);
  margin: 0 auto;
}

.schedule-management-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;
}

.schedule-management-page__eyebrow {
  margin: 0 0 $spacing-2;
  color: $color-primary-dark;
  font-weight: 900;
}

.schedule-management-page__title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  letter-spacing: -0.04em;
}

.schedule-management-page__state,
.schedule-management-page__not-found,
.schedule-management-page__modal-text {
  color: $color-muted;
}

.schedule-management-page__state,
.schedule-management-page__not-found {
  text-align: center;
}

.schedule-management-page__state--error {
  color: $color-danger;
}

.schedule-management-page__back-link,
.schedule-management-page__not-found a {
  color: $color-primary-dark;
  font-weight: 900;
}

@media (max-width: 640px) {
  .schedule-management-page__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
