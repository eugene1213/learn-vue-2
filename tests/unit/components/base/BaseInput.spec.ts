import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BaseInput from '@/components/base/BaseInput.vue'

describe('BaseInput', () => {
  it('renders label, help text, and accessible association', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: 'A',
        label: '여행 이름',
        help: '짧고 기억하기 쉽게 입력하세요.',
        testId: 'trip-title-input',
      },
    })

    const input = wrapper.get('input')

    expect(wrapper.text()).toContain('여행 이름')
    expect(wrapper.text()).toContain('짧고 기억하기 쉽게 입력하세요.')
    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))
    expect(wrapper.get('[data-testid="trip-title-input"]').element).toBe(input.element)
  })

  it('emits update:modelValue when the user types', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: 'A',
        label: '여행 이름',
      },
    })

    await wrapper.get('input').setValue('B')

    expect(wrapper.emitted('update:modelValue')).toEqual([['B']])
  })

  it('renders Korean error text with invalid state', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        label: '여행 이름',
        error: '여행 이름을 입력하세요.',
      },
    })

    expect(wrapper.text()).toContain('여행 이름을 입력하세요.')
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('input').attributes('aria-describedby')).toContain('error')
  })
})
