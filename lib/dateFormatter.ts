const PERSIAN_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  calendar: 'persian',
  month: 'long',
  day: 'numeric',
}

const PERSIAN_DATE_WITH_YEAR_OPTIONS: Intl.DateTimeFormatOptions = {
  ...PERSIAN_DATE_OPTIONS,
  year: 'numeric',
}

export const getFormattedDate = (dateToformat: Date | string | number) => {
  const date = new Date(dateToformat)
  const year = date.getFullYear()
  const actualYear = new Date().getFullYear()

  if (year < actualYear) {
    return date.toLocaleDateString('fa-IR', PERSIAN_DATE_WITH_YEAR_OPTIONS)
  }

  return date.toLocaleDateString('fa-IR', PERSIAN_DATE_OPTIONS)
}
