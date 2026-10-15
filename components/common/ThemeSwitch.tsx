import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import cn from 'classnames'
import { STRINGS } from '@lib/strings'
import Sun from '@components/icons/Sun'
import Moon from '@components/icons/Moon'
import Monitor from '@components/icons/Monitor'

const OPTIONS = [
  { value: 'system', label: STRINGS.themeSystem, Icon: Monitor },
  { value: 'light', label: STRINGS.themeLight, Icon: Sun },
  { value: 'dark', label: STRINGS.themeDark, Icon: Moon },
]

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="theme-switch" role="group" aria-label="Change theme color">
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            className={cn(
              'theme-switch-btn',
              active && 'theme-switch-btn-active'
            )}
            aria-label={label}
            aria-pressed={active}
            title={label}
            onClick={() => setTheme(value)}
          >
            <Icon width="18" height="18" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}

export default ThemeSwitch
