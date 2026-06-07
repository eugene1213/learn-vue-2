<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useBudgetStore } from '@/stores/budget.store'
import { useScheduleStore } from '@/stores/schedule.store'
import { useSettingsStore } from '@/stores/settings.store'
import { useTripStore } from '@/stores/trip.store'
import type { ThemeMode } from '@/types/settings'

const settingsStore = useSettingsStore()
const tripStore = useTripStore()
const scheduleStore = useScheduleStore()
const budgetStore = useBudgetStore()
const isResetModalOpen = ref(false)
const statusMessage = ref('')

const isBusy = computed(() => settingsStore.isLoading || tripStore.isLoading || scheduleStore.isLoading || budgetStore.isLoading)

onMounted(async () => {
  await settingsStore.fetchSettings()
})

async function changeTheme(theme: ThemeMode) {
  statusMessage.value = ''
  await settingsStore.updateSettings({ theme })
}

async function loadSampleData() {
  statusMessage.value = ''

  // 샘플 데이터도 페이지에서 저장소를 직접 만지지 않고 Store action으로만 구성해 API/Store 경계를 유지합니다.
  const resetSucceeded = await tripStore.resetTripPlannerData()
  scheduleStore.clearSchedules()
  budgetStore.clearBudgets()
  if (!resetSucceeded) {
    statusMessage.value = '샘플 데이터를 준비하지 못했습니다.'
    return
  }

  const trip = await tripStore.createTrip({
    title: 'Seoul Weekend',
    destination: '서울',
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    description: 'Vue 학습을 위한 샘플 주말 여행입니다.',
    status: 'planned',
  })
  if (trip === null) {
    statusMessage.value = '샘플 여행을 만들지 못했습니다.'
    return
  }

  await Promise.all([
    scheduleStore.createSchedule({
      tripId: trip.id,
      date: '2026-06-10',
      time: '10:00',
      title: '광화문 방문',
      location: '광화문',
      memo: '첫 일정 샘플',
    }),
    budgetStore.createBudget({
      tripId: trip.id,
      category: 'lodging',
      title: '호텔',
      amount: 150000,
      spentDate: '2026-06-10',
      memo: '2박 숙박비 샘플',
    }),
  ])
  await settingsStore.updateSettings({ enableSampleData: true })
  statusMessage.value = '샘플 데이터가 추가되었습니다.'
}

async function confirmResetData() {
  statusMessage.value = ''
  const resetSucceeded = await tripStore.resetTripPlannerData()
  if (resetSucceeded) {
    // 여행 삭제 cascade는 API 계층이 처리하고, 화면 메모리 상태는 각 Store가 명시적으로 비워 새로고침 전에도 UI가 즉시 일관되게 보이도록 합니다.
    scheduleStore.clearSchedules()
    budgetStore.clearBudgets()
    await settingsStore.updateSettings({ enableSampleData: false })
    statusMessage.value = '여행 데이터가 초기화되었습니다.'
  } else {
    statusMessage.value = '여행 데이터를 초기화하지 못했습니다.'
  }
  isResetModalOpen.value = false
}
</script>

<template>
  <section class="settings-page" aria-labelledby="settings-title">
    <header class="settings-page__header">
      <p class="settings-page__eyebrow">앱 설정</p>
      <h1 id="settings-title" class="settings-page__title">설정</h1>
      <p class="settings-page__description">학습 MVP 범위에 맞춰 테마, 고정 통화, 샘플 데이터를 관리합니다.</p>
    </header>

    <div class="settings-page__grid">
      <BaseCard title="테마" subtitle="선택한 테마는 새로고침 후에도 유지됩니다.">
        <fieldset class="settings-page__fieldset" data-testid="settings-theme-group">
          <legend class="settings-page__legend">화면 테마</legend>
          <label class="settings-page__option">
            <input
              type="radio"
              name="theme"
              value="light"
              :checked="settingsStore.settings.theme === 'light'"
              data-testid="settings-theme-light"
              @change="changeTheme('light')"
            />
            <span>라이트</span>
          </label>
          <label class="settings-page__option">
            <input
              type="radio"
              name="theme"
              value="dark"
              :checked="settingsStore.settings.theme === 'dark'"
              data-testid="settings-theme-dark"
              @change="changeTheme('dark')"
            />
            <span>다크</span>
          </label>
        </fieldset>
      </BaseCard>

      <BaseCard title="통화" subtitle="이번 MVP는 환율 변환 없이 원화만 표시합니다.">
        <p class="settings-page__currency" data-testid="settings-currency">KRW</p>
      </BaseCard>

      <BaseCard title="샘플 데이터" subtitle="대시보드 학습 흐름을 빠르게 확인할 수 있습니다.">
        <div class="settings-page__actions">
          <BaseButton
            test-id="settings-sample-data-button"
            :loading="isBusy"
            @click="loadSampleData"
          >
            샘플 데이터 불러오기
          </BaseButton>
          <BaseButton
            variant="danger"
            test-id="settings-reset-data-button"
            :disabled="isBusy"
            @click="isResetModalOpen = true"
          >
            여행 데이터 초기화
          </BaseButton>
        </div>
        <p v-if="statusMessage" class="settings-page__status" data-testid="settings-status-message">{{ statusMessage }}</p>
      </BaseCard>
    </div>

    <BaseModal
      :open="isResetModalOpen"
      title="여행 데이터를 초기화할까요?"
      test-id="settings-reset-modal"
      @close="isResetModalOpen = false"
    >
      <p class="settings-page__modal-text">등록된 여행, 일정, 예산 데이터가 모두 삭제됩니다.</p>
      <template #footer>
        <BaseButton variant="secondary" @click="isResetModalOpen = false">취소</BaseButton>
        <BaseButton variant="danger" test-id="settings-reset-confirm-button" @click="confirmResetData">초기화</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.settings-page {
  display: grid;
  gap: $spacing-6;
}

.settings-page__header {
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: $radius-large;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(241, 245, 249, 0.9));
  box-shadow: $shadow-card;
  padding: clamp(28px, 6vw, 56px);
}

.settings-page__eyebrow {
  margin: 0 0 $spacing-2;
  color: $color-primary-dark;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.settings-page__title {
  margin: 0;
  color: $color-text;
  font-size: clamp(2.25rem, 7vw, 4rem);
  letter-spacing: -0.06em;
}

.settings-page__description {
  margin: $spacing-4 0 0;
  color: $color-muted;
}

.settings-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $spacing-4;
}

.settings-page__fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-3;
  margin: 0;
  border: 0;
  padding: 0;
}

.settings-page__legend {
  width: 100%;
  margin-bottom: $spacing-2;
  color: $color-muted;
  font-weight: 800;
}

.settings-page__option {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  border: 1px solid $color-border;
  border-radius: 999px;
  background: $color-surface-muted;
  cursor: pointer;
  padding: $spacing-3 $spacing-4;
  font-weight: 800;
}

.settings-page__currency {
  margin: 0;
  color: $color-primary-dark;
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: -0.05em;
}

.settings-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-3;
}

.settings-page__status,
.settings-page__modal-text {
  margin: $spacing-4 0 0;
  color: $color-muted;
}

@media (max-width: 720px) {
  .settings-page__grid {
    grid-template-columns: 1fr;
  }

  .settings-page__actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
