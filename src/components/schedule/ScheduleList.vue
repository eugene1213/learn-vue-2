<script setup lang="ts">
import { computed } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import type { ScheduleItem } from '@/types/schedule'

const props = defineProps<{
  schedules: ScheduleItem[]
}>()

const emit = defineEmits<{
  edit: [schedule: ScheduleItem]
  delete: [schedule: ScheduleItem]
}>()

const sortedSchedules = computed(() =>
  [...props.schedules].sort((left, right) => `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`)),
)

function displayTime(time: string) {
  return time === '' ? '시간 미정' : time
}
</script>

<template>
  <div class="schedule-list" data-testid="schedule-list">
    <p v-if="sortedSchedules.length === 0" class="schedule-list__empty">등록된 일정이 없습니다.</p>

    <ol v-else class="schedule-list__items">
      <li
        v-for="schedule in sortedSchedules"
        :key="schedule.id"
        class="schedule-list__item"
        data-testid="schedule-list-item"
      >
        <div class="schedule-list__date-box">
          <span class="schedule-list__date">{{ schedule.date }}</span>
          <span class="schedule-list__time">{{ displayTime(schedule.time) }}</span>
        </div>

        <div class="schedule-list__content">
          <h3 class="schedule-list__title">{{ schedule.title }}</h3>
          <p v-if="schedule.location" class="schedule-list__meta">{{ schedule.location }}</p>
          <p v-if="schedule.memo" class="schedule-list__memo">{{ schedule.memo }}</p>
        </div>

        <div class="schedule-list__actions">
          <BaseButton variant="ghost" size="small" @click="emit('edit', schedule)">수정</BaseButton>
          <BaseButton variant="danger" size="small" @click="emit('delete', schedule)">삭제</BaseButton>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.schedule-list__empty {
  margin: 0;
  border: 1px dashed $color-border-strong;
  border-radius: $radius-medium;
  background: $color-surface-muted;
  color: $color-muted;
  padding: $spacing-6;
  text-align: center;
}

.schedule-list__items {
  display: grid;
  gap: $spacing-4;
  margin: 0;
  padding: 0;
  list-style: none;
}

.schedule-list__item {
  display: grid;
  align-items: center;
  gap: $spacing-4;
  grid-template-columns: 150px minmax(0, 1fr) auto;
  border: 1px solid $color-border;
  border-radius: $radius-medium;
  background: linear-gradient(135deg, $color-surface 0%, $color-surface-muted 100%);
  padding: $spacing-4;
}

.schedule-list__date-box {
  display: grid;
  gap: $spacing-1;
  border-radius: $radius-small;
  background: $color-primary-soft;
  color: $color-primary-dark;
  padding: $spacing-3;
}

.schedule-list__date,
.schedule-list__title {
  font-weight: 900;
}

.schedule-list__time {
  font-size: 0.9rem;
  font-weight: 700;
}

.schedule-list__title,
.schedule-list__meta,
.schedule-list__memo {
  margin: 0;
}

.schedule-list__title {
  color: $color-text;
  font-size: 1.1rem;
}

.schedule-list__meta,
.schedule-list__memo {
  margin-top: $spacing-1;
  color: $color-muted;
}

.schedule-list__actions {
  display: flex;
  gap: $spacing-2;
}

@media (max-width: 720px) {
  .schedule-list__item {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .schedule-list__actions {
    justify-content: flex-end;
  }
}
</style>
