import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BaseTable from '@/components/base/BaseTable.vue'
import type { BaseTableColumn } from '@/components/base/baseTable.types'

const columns: BaseTableColumn[] = [
  { key: 'title', label: '제목' },
  { key: 'amount', label: '금액', align: 'right' },
]

describe('BaseTable', () => {
  it('renders columns, rows, and action slot', () => {
    const rows: Record<string, unknown>[] = [{ title: '항공권', amount: 120000 }]
    const wrapper = mount(BaseTable, {
      props: {
        columns,
        rows,
        caption: '예산 목록',
        testId: 'budget-table',
      },
      slots: {
        actions: '<button type="button">수정</button>',
      },
    })

    expect(wrapper.get('[data-testid="budget-table"]').text()).toContain('예산 목록')
    expect(wrapper.text()).toContain('제목')
    expect(wrapper.text()).toContain('항공권')
    expect(wrapper.text()).toContain('120000')
    expect(wrapper.text()).toContain('수정')
  })

  it('renders empty state with default or custom empty slot', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns,
        rows: [],
        emptyText: '등록된 항목이 없습니다.',
      },
    })

    expect(wrapper.text()).toContain('등록된 항목이 없습니다.')

    const custom = mount(BaseTable, {
      props: {
        columns,
        rows: [],
      },
      slots: {
        empty: '<strong>직접 만든 빈 상태</strong>',
      },
    })

    expect(custom.text()).toContain('직접 만든 빈 상태')
  })

  it('allows custom cell rendering through scoped slot', () => {
    const rows: Record<string, unknown>[] = [{ title: '숙소', amount: 250000 }]
    const wrapper = mount(BaseTable, {
      props: {
        columns,
        rows,
      },
      slots: {
        cell: '<template #cell="slotProps">{{ slotProps.column.key }}: {{ slotProps.value }}</template>',
      },
    })

    expect(wrapper.text()).toContain('title: 숙소')
    expect(wrapper.text()).toContain('amount: 250000')
  })
})
