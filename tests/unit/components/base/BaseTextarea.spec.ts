import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BaseTextarea from '@/components/base/BaseTextarea.vue'

describe('BaseTextarea', () => {
  it('renders multiline label/help and disabled state', () => {
    const wrapper = mount(BaseTextarea, {
      props: {
        modelValue: '메모',
        label: '여행 메모',
        help: '자유롭게 적어보세요.',
        disabled: true,
        testId: 'trip-memo-input',
      },
    })

    expect(wrapper.text()).toContain('여행 메모')
    expect(wrapper.text()).toContain('자유롭게 적어보세요.')
    expect(wrapper.get('[data-testid="trip-memo-input"]').attributes('disabled')).toBeDefined()
  })

  it('emits update:modelValue for textarea edits', async () => {
    const wrapper = mount(BaseTextarea, {
      props: {
        modelValue: 'A',
        label: '설명',
      },
    })

    await wrapper.get('textarea').setValue('B')

    expect(wrapper.emitted('update:modelValue')).toEqual([['B']])
  })

  it('shows error text instead of help when error is present', () => {
    const wrapper = mount(BaseTextarea, {
      props: {
        modelValue: '',
        label: '설명',
        help: '선택 입력입니다.',
        error: '설명을 확인하세요.',
      },
    })

    expect(wrapper.text()).toContain('설명을 확인하세요.')
    expect(wrapper.text()).not.toContain('선택 입력입니다.')
    expect(wrapper.get('textarea').attributes('aria-invalid')).toBe('true')
  })
})
