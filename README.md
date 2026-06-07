# 여행 플래너 Vue 학습 앱

Vue 3와 TypeScript를 처음 배우는 사람을 위한 **여행 계획 MVP**입니다. 사용자는 한국어 화면에서 여행을 만들고, 여행별 일정과 예산을 관리하며, 간단한 설정을 바꿔볼 수 있습니다. 데이터는 실제 서버가 아니라 브라우저 `localStorage`를 사용하는 mock API에 저장됩니다.

이 README는 현재 구현된 MVP만 설명합니다. 없는 기능을 상상해서 붙이기보다, 지금 코드에서 배울 수 있는 구조와 흐름을 이해하는 데 초점을 둡니다.

## 기술 스택

- **Vue 3**: Single File Component와 `<script setup>` 기반 화면 구성
- **TypeScript**: 도메인 타입, API 입력 타입, Store 상태 타입을 명시
- **Pinia**: 여행/일정/예산/설정 전역 상태 관리
- **Vue Router**: 대시보드, 여행 목록, 여행 상세, 일정, 예산, 설정 페이지 라우팅
- **Axios**: API 클라이언트 학습용 의존성. 현재 MVP의 mock API는 `withApiLatency`로 비동기 API 흐름을 흉내 냅니다.
- **SCSS**: 변수, mixin, scoped style, BEM 네이밍 학습
- **Vite + Vitest + Playwright**: 개발 서버, 단위 테스트, E2E 테스트, 빌드 검증

## 현재 구현된 기능

- 대시보드에서 전체 여행 수, 다가오는 일정 수, 총 예산 확인
- 여행 목록 조회, 여행 생성, 여행 수정, 여행 삭제
- 여행 상세 페이지에서 여행 정보와 관련 화면으로 이동
- 여행별 일정 목록 조회, 생성, 수정, 삭제
- 여행별 예산 목록 조회, 생성, 수정, 삭제, 합계 계산
- 설정 화면에서 앱 설정 조회/수정/초기화
- 없는 경로에 대한 Not Found 페이지

## 폴더 구조

```txt
src/
  api/                 mock API 계층. 화면과 저장소 사이의 비동기 경계
    client.ts          API 지연 시간 흉내를 내는 공통 함수
    mockStorage.ts     localStorage 직접 접근을 모아둔 유일한 파일
    trips.api.ts       여행 CRUD와 관련 일정/예산 정리
    schedules.api.ts   여행별 일정 CRUD
    budgets.api.ts     여행별 예산 CRUD
    settings.api.ts    설정 조회/수정/초기화
  assets/styles/       전역 SCSS, 변수, mixin, 레이아웃 스타일
  components/
    base/              BaseButton, BaseInput, BaseModal, BaseTable 등 공통 UI
    trip/              여행 카드와 여행 폼
    schedule/          일정 폼과 일정 목록
    budget/            예산 폼과 예산 요약
  composables/         폼 상태, 검증, 비동기 상태, 예산 요약 재사용 로직
  layouts/             앱 공통 헤더와 RouterView 배치
  pages/               라우터가 직접 보여주는 페이지 컴포넌트
  router/              URL과 페이지 연결
  stores/              Pinia 전역 상태와 API 호출 action
  types/               Trip, Schedule, Budget, Settings 등 도메인 타입
  utils/               날짜, 통화, ID 생성 같은 작은 순수 함수
```

## 학습 커리큘럼 매핑

| 학습 주제 | 코드 위치 | 이 앱에서 보는 포인트 |
| --- | --- | --- |
| Vue SFC와 `<script setup>` | `src/pages/*.vue`, `src/components/**/*.vue` | 한 파일 안에서 script/template/style을 함께 읽는 방식 |
| Props와 Emit | `components/trip/TripForm.vue`, `components/base/BaseInput.vue` | 부모가 값을 내려주고 자식이 이벤트로 변경 요청을 올리는 흐름 |
| `v-model` 커스텀 컴포넌트 | `components/base/BaseInput.vue` | `modelValue` prop과 `update:modelValue` emit의 연결 |
| Composition API | `composables/useTripForm.ts`, `useScheduleForm.ts`, `useBudgetForm.ts` | 폼 상태와 검증 로직을 컴포넌트 밖으로 분리 |
| Pinia Store | `stores/trip.store.ts`, `schedule.store.ts`, `budget.store.ts`, `settings.store.ts` | API 결과, 로딩 상태, 오류 메시지, getter/action 관리 |
| Vue Router | `router/index.ts` | URL별 페이지 연결과 여행 ID 파라미터 사용 |
| Mock API 계층 | `api/*.api.ts`, `api/mockStorage.ts` | 실제 서버 없이도 Promise 기반 CRUD 흐름 학습 |
| TypeScript 타입 좁히기 | `api/trips.api.ts`, `api/schedules.api.ts`, `api/budgets.api.ts` | 저장된 JSON을 `unknown`으로 보고 타입 가드로 검증 |
| SCSS/BEM | 각 `.vue`의 `<style scoped lang="scss">` | 블록, 요소, modifier와 디자인 토큰 사용 |
| 테스트/검증 명령 | `package.json` | 타입 검사, lint, 단위 테스트, E2E 테스트, 빌드 흐름 |

## API → Store → Page 아키텍처

이 앱의 데이터 흐름은 의도적으로 아래 순서를 따릅니다.

```txt
Page Component
  → Pinia Store action
    → src/api/*.api.ts
      → src/api/mockStorage.ts
        → browser localStorage
```

예를 들어 여행 목록 페이지는 `getTrips()`를 직접 부르지 않고 `tripStore.fetchTrips()`를 호출합니다. Store action이 API를 호출하고, 성공하면 `trips` 상태를 갱신하며, 실패하면 `errorMessage`를 채웁니다. 페이지는 그 결과인 `tripStore.trips`, `tripStore.isLoading`, `tripStore.errorMessage`만 보고 화면을 그립니다.

### 왜 페이지가 API를 직접 호출하지 않나요?

초보 프로젝트에서도 이 분리는 중요합니다.

1. **화면은 화면 역할에 집중**합니다. 페이지는 “언제 불러오고 무엇을 보여줄지”에 집중하고, 저장 방식은 알 필요가 없습니다.
2. **로딩/오류 처리가 한곳에 모입니다.** 여러 페이지가 같은 데이터를 쓸 때 각 페이지마다 `try/catch`와 상태 변수를 반복하지 않아도 됩니다.
3. **데이터가 여러 화면에서 공유됩니다.** 대시보드, 목록, 상세 페이지가 같은 여행 Store를 보면 화면 간 상태가 더 예측 가능합니다.
4. **나중에 API 구현이 바뀌어도 영향이 작습니다.** 현재는 mock API와 `localStorage`를 쓰지만, Store 바깥의 페이지 코드를 크게 바꾸지 않고 API 계층을 교체하는 연습을 할 수 있습니다.
5. **테스트와 학습 경계가 명확합니다.** API, Store, Page를 따로 읽고 검증할 수 있어 “어디에서 무엇을 책임지는지”가 분명해집니다.

## BaseInput `v-model` 흐름

`BaseInput.vue`는 커스텀 컴포넌트에서 `v-model`이 어떻게 작동하는지 보여주는 핵심 예제입니다.

부모 컴포넌트에서는 이렇게 씁니다.

```vue
<BaseInput v-model="form.title" label="여행 이름" />
```

Vue는 이 코드를 개념적으로 아래처럼 해석합니다.

```vue
<BaseInput
  :model-value="form.title"
  @update:model-value="form.title = $event"
/>
```

`BaseInput.vue` 내부 흐름은 다음과 같습니다.

1. `defineProps`로 `modelValue: string`을 받습니다.
2. 실제 `<input>`의 `:value`에 `modelValue`를 연결합니다.
3. 사용자가 입력하면 `@input="updateValue"`가 실행됩니다.
4. `updateValue`는 입력값을 읽어서 `emit('update:modelValue', value)`를 호출합니다.
5. 부모의 `form.title`이 갱신되고, 갱신된 값이 다시 `modelValue`로 내려옵니다.

이 구조는 “부모 상태가 원본이고, 자식은 변경 요청만 보낸다”는 단방향 데이터 흐름을 연습하게 해줍니다.

## SCSS와 BEM 학습 포인트

- `src/assets/styles/_variables.scss`는 색상, 그림자, 둥근 모서리, 간격을 디자인 토큰으로 모읍니다.
- 각 컴포넌트는 `<style scoped lang="scss">`로 자기 스타일 범위를 좁힙니다.
- 클래스 이름은 BEM 규칙을 따릅니다.
  - Block: `.app-layout`, `.base-input`, `.trip-form`
  - Element: `.app-layout__header`, `.base-input__control`, `.trip-form__actions`
  - Modifier: `.app-layout--dark`, `.base-input__control--error`, `.trip-list-page__state--error`
- SCSS nesting은 `&:focus`, `&:disabled`처럼 상태 스타일을 가까운 곳에 묶는 데 사용합니다.
- 반응형 처리는 각 컴포넌트의 하단 `@media`에서 레이아웃만 작게 조정하는 방식으로 배웁니다.

## 프로젝트 규칙과 제약

- API 호출은 **반드시 `src/api` 아래 모듈에만** 둡니다.
- `localStorage` 직접 접근은 **반드시 `src/api/mockStorage.ts`에서만** 합니다.
- 페이지와 컴포넌트는 API 모듈을 직접 호출하지 않고 Store action을 사용합니다.
- TypeScript는 strict 스타일을 유지합니다.
  - `any` 사용 금지
  - `as any` 사용 금지
  - `// @ts-ignore` 사용 금지
  - 외부/저장소 데이터는 `unknown`으로 받은 뒤 타입 가드로 좁히기
- SCSS 클래스는 BEM 방식으로 작성합니다.
- 현재 MVP는 브라우저 저장소 기반 학습 앱입니다. 서버 저장이나 외부 서비스 연동을 전제로 설명하지 않습니다.

## 프로젝트 명령어

```bash
npm install
npm run dev
npm run type-check
npm run lint
npm run test:unit
npm run test:e2e
npm run build
```

명령어별 의미는 다음과 같습니다.

- `npm install`: 의존성을 설치합니다.
- `npm run dev`: Vite 개발 서버를 실행합니다.
- `npm run type-check`: Vue와 TypeScript 타입 오류를 검사합니다.
- `npm run lint`: ESLint 규칙을 검사합니다.
- `npm run test:unit`: Vitest 단위 테스트를 실행합니다.
- `npm run test:e2e`: Playwright E2E 테스트를 실행합니다.
- `npm run build`: 타입 검사 후 프로덕션 빌드를 만듭니다.

처음 학습할 때는 `src/router/index.ts`에서 어떤 페이지가 있는지 확인한 뒤, 해당 페이지가 어떤 Store를 쓰는지 따라가고, 마지막으로 Store가 어떤 API 함수를 호출하는지 읽어보면 전체 구조를 가장 빠르게 이해할 수 있습니다.
