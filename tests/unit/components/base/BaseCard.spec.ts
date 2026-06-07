import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BaseCard from '@/components/base/BaseCard.vue'

describe('BaseCard', () => {
  it('renders title, subtitle, default slot, and footer slot', () => {
    const wrapper = mount(BaseCard, {
      props: {
        title: '서울 여행',
        subtitle: '2박 3일',
        testId: 'trip-card',
      },
      slots: {
        default: '<p>본문 내용</p>',
        footer: '<button type="button">자세히 보기</button>',
      },
    })

    expect(wrapper.get('[data-testid="trip-card"]').text()).toContain('서울 여행')
    expect(wrapper.text()).toContain('2박 3일')
    expect(wrapper.text()).toContain('본문 내용')
    expect(wrapper.text()).toContain('자세히 보기')
  })

  it('lets the header slot replace title props', () => {
    const wrapper = mount(BaseCard, {
      props: {
        title: '기본 제목',
      },
      slots: {
        header: '<strong>커스텀 헤더</strong>',
        default: '본문',
      },
    })

    expect(wrapper.text()).toContain('커스텀 헤더')
    expect(wrapper.text()).not.toContain('기본 제목')
  })
})
