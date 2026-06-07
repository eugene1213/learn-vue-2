const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isIsoDate(value: string): boolean {
  if (!isoDatePattern.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00.000Z`)
  return date.toISOString().slice(0, 10) === value
}

export function compareIsoDates(left: string, right: string): number {
  return left.localeCompare(right)
}

export function isDateRangeValid(startDate: string, endDate: string): boolean {
  return isIsoDate(startDate) && isIsoDate(endDate) && compareIsoDates(startDate, endDate) <= 0
}
