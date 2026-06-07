import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ScheduleList from '@/components/schedule/ScheduleList.vue'
import type { ScheduleItem } from '@/types/schedule'

const baseSchedule: ScheduleItem = {
  id: 'schedule_1',
  tripId: 'trip_1',
  date: '2026-06-10',
  time: '10:00',
  title: '광화문 방문',
  location: '광화문',
  memo: '입장권 확인',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

describe('ScheduleList', () => {
  it('shows the Korean empty state when no schedules exist', () => {
    const wrapper = mount(ScheduleList, {
      props: {
        schedules: [],
      },
    })

    expect(wrapper.text()).toContain('등록된 일정이 없습니다.')
  })

  it('sorts schedules by date and time before rendering', () => {
    const wrapper = mount(ScheduleList, {
      props: {
        schedules: [
          { ...baseSchedule, id: 'schedule_3', date: '2026-06-11', time: '09:00', title: '늦은 일정' },
          { ...baseSchedule, id: 'schedule_2', date: '2026-06-10', time: '08:00', title: '아침 일정' },
          baseSchedule,
        ],
      },
    })

    const rows = wrapper.findAll('[data-testid="schedule-list-item"]')
    expect(rows.map((row) => row.text())).toEqual([
      expect.stringContaining('아침 일정'),
      expect.stringContaining('광화문 방문'),
      expect.stringContaining('늦은 일정'),
    ])
  })

  it('emits edit and delete requests with the selected schedule', async () => {
    const wrapper = mount(ScheduleList, {
      props: {
        schedules: [baseSchedule],
      },
    })

    await wrapper.get('button').trigger('click')
    await wrapper.findAll('button')[1].trigger('click')

    expect(wrapper.emitted('edit')?.[0]).toEqual([baseSchedule])
    expect(wrapper.emitted('delete')?.[0]).toEqual([baseSchedule])
  })
})
