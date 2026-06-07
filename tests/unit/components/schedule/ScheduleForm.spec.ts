import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ScheduleForm from '@/components/schedule/ScheduleForm.vue'

describe('ScheduleForm', () => {
  it('emits trimmed valid schedule input through v-model fields', async () => {
    const wrapper = mount(ScheduleForm, {
      props: {
        initialValues: { tripId: 'trip_1' },
      },
    })

    await wrapper.get('[data-testid="schedule-title-input"]').setValue(' 광화문 방문 ')
    await wrapper.get('[data-testid="schedule-date-input"]').setValue('2026-06-10')
    await wrapper.get('[data-testid="schedule-time-input"]').setValue('10:00')
    await wrapper.get('[data-testid="schedule-location-input"]').setValue(' 광화문 ')
    await wrapper.get('[data-testid="schedule-memo-input"]').setValue(' 입장권 확인 ')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]).toEqual([
      {
        tripId: 'trip_1',
        date: '2026-06-10',
        time: '10:00',
        title: '광화문 방문',
        location: '광화문',
        memo: '입장권 확인',
      },
    ])
  })

  it('shows exact Korean validation and blocks submit', async () => {
    const wrapper = mount(ScheduleForm, {
      props: {
        initialValues: { tripId: 'trip_1' },
      },
    })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('일정 제목을 입력하세요.')
    expect(wrapper.text()).toContain('일정 날짜를 선택하세요.')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('emits cancel for parent-owned form state', async () => {
    const wrapper = mount(ScheduleForm)

    await wrapper.findAll('button')[0].trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
