export type CurrencyCode = 'KRW'
export type ThemeMode = 'light' | 'dark'

export interface Settings {
  currency: CurrencyCode
  theme: ThemeMode
  enableSampleData: boolean
}

export type UpdateSettingsInput = Partial<Settings>

// 설정 타입은 현재 MVP의 범위를 의도적으로 KRW 단일 통화로 제한해 환율 같은 비목표 기능이 섞이지 않게 합니다.
export const defaultSettings: Settings = {
  currency: 'KRW',
  theme: 'light',
  enableSampleData: false,
}
