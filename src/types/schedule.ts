import type { TimestampedRecord } from './common'

export interface ScheduleItem extends TimestampedRecord {
  tripId: string
  date: string
  time: string
  title: string
  location: string
  memo: string
}

export type CreateScheduleInput = Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateScheduleInput = Partial<Omit<CreateScheduleInput, 'tripId'>>

export type ScheduleValidationField = 'title' | 'date'

// 일정은 여행에 종속된 데이터이므로 tripId를 필수 계약으로 두어 삭제 cascade를 단순하고 안전하게 만듭니다.
