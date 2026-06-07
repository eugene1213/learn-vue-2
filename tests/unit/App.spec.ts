import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import App from '@/App.vue'
import router from '@/router'

describe('App', () => {
  it('renders the Korean smoke shell', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    expect(wrapper.get('[data-testid="app-title"]').text()).toBe('여행 플래너')
    expect(wrapper.get('[data-testid="app-smoke-text"]').text()).toContain('준비되었습니다')
  })
})
