import { describe, expect, it } from 'vitest'

import router from '@/router'

describe('router', () => {
  it('registers Task 5 trip routes and catch-all route', () => {
    expect(router.resolve('/').name).toBe('home')
    expect(router.resolve('/trips').name).toBe('trips')
    expect(router.resolve('/trips/new').name).toBe('trip-create')
    expect(router.resolve('/trips/trip_1').name).toBe('trip-detail')
    expect(router.resolve('/trips/trip_1/schedule').name).toBe('trip-schedule')
    expect(router.resolve('/trips/trip_1/budget').name).toBe('trip-budget')
    expect(router.resolve('/settings').name).toBe('settings')
    expect(router.resolve('/unknown/path').name).toBe('not-found')
  })
})
