import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import cn from 'classnames'
import { STRINGS } from '@lib/strings'

const OPTIONS = [
  { value: 'system', label: STRINGS.themeSystem },
  { value: 'light', label: STRINGS.themeLight },
  { value: 'dark', label: STRINGS.themeDark },
]

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="theme-switch" role="group" aria-label="Change theme color">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            'filter-chip',
            theme === option.value && 'filter-chip-active'
          )}
          aria-pressed={theme === option.value}
          onClick={() => setTheme(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeSwitch
