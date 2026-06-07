export function formatKrw(amount: number): string {
  return `${new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(amount)}원`
}

export function formatCurrency(amount: number): string {
  return formatKrw(amount)
}

export function isPositiveKrwAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0
}
