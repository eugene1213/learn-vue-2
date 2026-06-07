import type { TimestampedRecord } from './common'

export type TripStatus = 'planned' | 'ongoing' | 'completed'

export interface Trip extends TimestampedRecord {
  title: string
  destination: string
  startDate: string
  endDate: string
  description: string
  status: TripStatus
}

export type CreateTripInput = Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateTripInput = Partial<CreateTripInput>

export type TripValidationField = 'title' | 'destination' | 'startDate' | 'endDate'

// 도메인 타입은 저장소 구조와 화면 폼 구조의 기준점입니다. 이 파일을 바꾸면 API와 store도 함께 검토해야 합니다.
export const tripStatuses: readonly TripStatus[] = ['planned', 'ongoing', 'completed']
