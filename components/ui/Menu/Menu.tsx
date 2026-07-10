import { useLayoutEffect, useRef, useState } from 'react'
import { useMenuContext } from './use-menu-context'
import cn from 'classnames'
import { useIsMobile } from '@lib/hooks/use-media-queries'
import s from './Menu.module.css'
import { Portal } from '../Portal'
import { getPopoverPosition } from '@lib/getPopoverPosition'
import { STRINGS } from '@lib/strings'

type Props = {
  children: React.ReactNode
  title: string
  align?: 'start' | 'end' | 'center'
}

const Menu = ({ children, title, align = 'end' }: Props) => {
  const { isVisible, toggle, menuWrapperRef } = useMenuContext()
  const menuRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  )

  const isMobile = useIsMobile()

  useLayoutEffect(() => {
    if (!isVisible || isMobile) {
      setCoords(null)
      return
    }

    const updatePosition = () => {
      const trigger = menuWrapperRef.current
      const menu = menuRef.current
      if (!trigger || !menu) return

      const triggerRect = trigger.getBoundingClientRect()
      const menuRect = menu.getBoundingClientRect()

      setCoords(
        getPopoverPosition(triggerRect, {
          menuWidth: menuRect.width,
          menuHeight: menuRect.height,
          align,
        })
      )
    }

    updatePosition()

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isVisible, isMobile, menuWrapperRef, align])

  if (!isVisible) return null

  if (isMobile) {
    return (
      <Portal id="drawer">
        <div
          className={cn(s.mobileMenu, 'animate-fade-in')}
          aria-labelledby="menuTitleId"
        >
          <div className={cn(s.mobileContent, 'animate-slide-up')}>
            <p
              className={cn(s.mobileTitle, 'menu-mobile-title')}
              id="menuTitleId"
            >
              {title}
            </p>
            <ul
              className={s.mobileList}
              role="menu"
              tabIndex={-1}
              aria-labelledby="menuTitleId"
            >
              {children}
            </ul>
          </div>

          <button onClick={toggle} className={s.closeBtn}>
            {STRINGS.close}
          </button>
        </div>
      </Portal>
    )
  }

  return (
    <Portal id="menu">
      <div
        ref={menuRef}
        className={cn(s.menu, !coords && s.menuMeasuring)}
        aria-labelledby="menuTitleId"
        style={
          coords
            ? { top: `${coords.top}px`, left: `${coords.left}px` }
            : undefined
        }
      >
        <p
          className="px-6 mt-1 mx-0 mb-2 font-bold text-sm text-primary"
          id="menuTitleId"
        >
          {title}
        </p>
        <ul
          role="menu"
          tabIndex={-1}
          className="w-full m-0 p-0 flex flex-col rounded-2xl"
          aria-labelledby="menuTitleId"
        >
          {children}
        </ul>
      </div>
    </Portal>
  )
}

export default Menu
