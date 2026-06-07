import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BaseButton from '@/components/base/BaseButton.vue'

describe('BaseButton', () => {
  it('renders slot text and variant props', () => {
    const wrapper = mount(BaseButton, {
      props: {
        variant: 'secondary',
        size: 'large',
        testId: 'save-button',
      },
      slots: {
        default: '저장하기',
      },
    })

    expect(wrapper.get('[data-testid="save-button"]').text()).toBe('저장하기')
    expect(wrapper.classes()).toContain('base-button--secondary')
    expect(wrapper.classes()).toContain('base-button--large')
  })

  it('emits click only when interactive', async () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: '클릭',
      },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)

    await wrapper.setProps({ disabled: true })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)

    await wrapper.setProps({ disabled: false, loading: true })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
