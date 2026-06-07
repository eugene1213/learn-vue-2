<template>
  <BaseCard class="not-found-page">
    <template #header>
      <p class="not-found-page__eyebrow">404</p>
      <h1 class="not-found-page__title">페이지를 찾을 수 없습니다.</h1>
    </template>
    <p>주소를 다시 확인하거나 여행 목록으로 이동해주세요.</p>
    <RouterLink to="/trips">여행 목록으로 돌아가기</RouterLink>
  </BaseCard>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

import BaseCard from '@/components/base/BaseCard.vue'
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.not-found-page {
  width: min(100%, 760px);
  margin: 0 auto;
  text-align: center;
}

.not-found-page__eyebrow {
  margin: 0 0 $spacing-2;
  color: $color-primary-dark;
  font-weight: 900;
}

.not-found-page__title {
  margin: 0;
  letter-spacing: -0.04em;
}
</style>
