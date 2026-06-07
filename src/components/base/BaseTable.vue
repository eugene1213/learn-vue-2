<script setup lang="ts">
import type { BaseTableColumn } from './baseTable.types'

withDefaults(
  defineProps<{
    columns: BaseTableColumn[]
    rows: Record<string, unknown>[]
    emptyText?: string
    caption?: string
    testId?: string
  }>(),
  {
    emptyText: '표시할 항목이 없습니다.',
    caption: '',
    testId: undefined,
  },
)

// 이 파일에서 배우는 것: unknown 데이터를 화면에 바로 넣지 않고 문자열로 정규화해 표 기본 렌더링을 안전하게 만듭니다.
function cellText(value: unknown) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}
</script>

<template>
  <div class="base-table" :data-testid="testId">
    <!-- scoped slot 학습: 셀/액션 영역을 부모가 바꿀 수 있도록 row, column, value를 slot prop으로 전달합니다. -->
    <table class="base-table__table">
      <caption v-if="caption" class="base-table__caption">
        {{ caption }}
      </caption>
      <thead class="base-table__head">
        <tr class="base-table__row">
          <th
            v-for="column in columns"
            :key="column.key"
            class="base-table__heading"
            :class="`base-table__heading--${column.align ?? 'left'}`"
            scope="col"
          >
            {{ column.label }}
          </th>
          <th v-if="$slots.actions" class="base-table__heading base-table__heading--right" scope="col">
            작업
          </th>
        </tr>
      </thead>
      <tbody class="base-table__body">
        <tr v-if="rows.length === 0" class="base-table__row">
          <td class="base-table__empty" :colspan="columns.length + ($slots.actions ? 1 : 0)">
            <slot name="empty">{{ emptyText }}</slot>
          </td>
        </tr>
        <tr v-for="(row, rowIndex) in rows" v-else :key="rowIndex" class="base-table__row">
          <td
            v-for="column in columns"
            :key="column.key"
            class="base-table__cell"
            :class="`base-table__cell--${column.align ?? 'left'}`"
          >
            <slot name="cell" :row="row" :column="column" :value="row[column.key]">
              {{ cellText(row[column.key]) }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="base-table__cell base-table__cell--right">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.base-table {
  width: 100%;
  overflow-x: auto;
  border: 1px solid $color-border;
  border-radius: $radius-medium;
  background: $color-surface;
}

.base-table__table {
  width: 100%;
  border-collapse: collapse;
}

.base-table__caption {
  padding: $spacing-3 $spacing-4;
  color: $color-muted;
  text-align: left;
}

.base-table__head {
  background: $color-surface-muted;
}

.base-table__heading,
.base-table__cell,
.base-table__empty {
  padding: $spacing-3 $spacing-4;
  border-bottom: 1px solid $color-border;
  color: $color-text;
  vertical-align: middle;
}

.base-table__heading {
  font-size: 0.85rem;
  font-weight: 800;
}

.base-table__cell {
  font-size: 0.95rem;
}

.base-table__heading--left,
.base-table__cell--left {
  text-align: left;
}

.base-table__heading--center,
.base-table__cell--center {
  text-align: center;
}

.base-table__heading--right,
.base-table__cell--right {
  text-align: right;
}

.base-table__empty {
  color: $color-muted;
  text-align: center;
}

.base-table__body .base-table__row:last-child .base-table__cell,
.base-table__body .base-table__row:last-child .base-table__empty {
  border-bottom: 0;
}
</style>
