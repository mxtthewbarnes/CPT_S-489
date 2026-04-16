const schoolPalette = {
  WSU: '#981e32',
  UW: '#4b2e83',
  Oregon: '#154733',
  UCLA: '#2774ae',
  'Arizona State': '#8c1d40',
  'Notre Dame': '#0c2340',
  Michigan: '#00274c',
  Stanford: '#8c1515',
  Cal: '#003262',
  default: '#555',
}

export function getSchoolColor(school) {
  return schoolPalette[school] || schoolPalette.default
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'TBD'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value))
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
