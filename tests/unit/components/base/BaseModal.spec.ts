import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import BaseModal from '@/components/base/BaseModal.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('BaseModal', () => {
  it('renders title and default/footer slots when open', () => {
    mount(BaseModal, {
      attachTo: document.body,
      props: {
        open: true,
        title: '삭제 확인',
        testId: 'confirm-modal',
      },
      slots: {
        default: '<p>정말 삭제할까요?</p>',
        footer: '<button type="button">취소</button>',
      },
    })

    expect(document.body.textContent).toContain('삭제 확인')
    expect(document.body.textContent).toContain('정말 삭제할까요?')
    expect(document.body.textContent).toContain('취소')
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
    expect(document.body.querySelector('[data-testid="confirm-modal"]')).not.toBeNull()
  })

  it('emits close from close button, overlay, and escape key', async () => {
    const wrapper = mount(BaseModal, {
      attachTo: document.body,
      props: {
        open: true,
        title: '닫기 테스트',
        testId: 'close-modal',
      },
    })

    document
      .querySelector('.base-modal__close')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    document
      .querySelector('.base-modal__overlay')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.emitted('close')).toHaveLength(3)
  })

  it('does not render dialog when closed', () => {
    mount(BaseModal, {
      attachTo: document.body,
      props: {
        open: false,
        title: '닫힘',
      },
    })

    expect(document.body.textContent).not.toContain('닫힘')
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  })
})
