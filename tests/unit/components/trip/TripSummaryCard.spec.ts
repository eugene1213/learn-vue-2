import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { describe, expect, it } from 'vitest'

import TripSummaryCard from '@/components/trip/TripSummaryCard.vue'
import type { Trip } from '@/types/trip'

const seoulTrip: Trip = {
  id: 'trip_1',
  title: 'Seoul Weekend',
  destination: '서울',
  startDate: '2026-06-10',
  endDate: '2026-06-12',
  description: '주말 여행',
  status: 'planned',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [{ path: '/trips/:tripId', component: { render: () => h('div') } }],
  })
}

describe('TripSummaryCard', () => {
  it('renders trip summary and links to detail route', async () => {
    const router = createTestRouter()
    router.push('/trips')
    await router.isReady()

    const wrapper = mount(TripSummaryCard, {
      props: { trip: seoulTrip },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.get('[data-testid="trip-card"]').text()).toContain('Seoul Weekend')
    expect(wrapper.text()).toContain('2026-06-10 - 2026-06-12')
    expect(wrapper.get('a').attributes('href')).toBe('/trips/trip_1')
  })

  it('emits delete request with the trip payload', async () => {
    const router = createTestRouter()
    router.push('/trips')
    await router.isReady()

    const wrapper = mount(TripSummaryCard, {
      props: { trip: seoulTrip },
      global: {
        plugins: [router],
      },
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('delete')?.[0]).toEqual([seoulTrip])
  })
})
