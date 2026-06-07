import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import TripForm from '@/components/trip/TripForm.vue'

describe('TripForm', () => {
  it('emits trimmed valid trip input through v-model fields', async () => {
    const wrapper = mount(TripForm, {
      props: {
        submitLabel: '여행 만들기',
      },
    })

    await wrapper.get('[data-testid="trip-title-input"]').setValue(' Seoul Weekend ')
    await wrapper.get('[data-testid="trip-destination-input"]').setValue(' 서울 ')
    await wrapper.get('[data-testid="trip-start-date-input"]').setValue('2026-06-10')
    await wrapper.get('[data-testid="trip-end-date-input"]').setValue('2026-06-12')
    await wrapper.get('[data-testid="trip-description-input"]').setValue(' 주말 여행 ')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]).toEqual([
      {
        title: 'Seoul Weekend',
        destination: '서울',
        startDate: '2026-06-10',
        endDate: '2026-06-12',
        description: '주말 여행',
        status: 'planned',
      },
    ])
  })

  it('shows Korean validation and blocks submit when title is empty', async () => {
    const wrapper = mount(TripForm)

    await wrapper.get('[data-testid="trip-destination-input"]').setValue('서울')
    await wrapper.get('[data-testid="trip-start-date-input"]').setValue('2026-06-10')
    await wrapper.get('[data-testid="trip-end-date-input"]').setValue('2026-06-12')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('여행 이름을 입력하세요.')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('emits cancel for parent-owned navigation', async () => {
    const wrapper = mount(TripForm)

    await wrapper.findAll('button')[0].trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
