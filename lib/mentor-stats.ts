export function formatMentoringTime(value: number | string | null | undefined) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return `${new Intl.NumberFormat('en-US').format(value)} mins`
  }

  if (typeof value === 'string') {
    const normalized = value.trim()
    if (!normalized) {
      return '0 mins'
    }

    const numericValue = Number(normalized.replace(/,/g, ''))
    if (Number.isFinite(numericValue) && numericValue >= 0) {
      return `${new Intl.NumberFormat('en-US').format(numericValue)} mins`
    }

    return normalized
  }

  return '0 mins'
}
