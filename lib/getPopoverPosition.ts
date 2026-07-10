const VIEWPORT_PADDING = 12
const MENU_GAP = 8

type Options = {
  menuWidth: number
  menuHeight: number
  align?: 'start' | 'end' | 'center'
}

export type PopoverCoords = {
  top: number
  left: number
}

export function getPopoverPosition(
  triggerRect: DOMRect,
  { menuWidth, menuHeight, align = 'end' }: Options
): PopoverCoords {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const isRTL = document.documentElement.dir === 'rtl'

  let left: number

  if (align === 'center') {
    left = triggerRect.left + (triggerRect.width - menuWidth) / 2
  } else if (align === 'start') {
    left = isRTL ? triggerRect.right - menuWidth : triggerRect.left
  } else {
    left = isRTL ? triggerRect.left : triggerRect.right - menuWidth
  }

  let top = triggerRect.bottom + MENU_GAP

  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING
  }

  if (left + menuWidth > viewportWidth - VIEWPORT_PADDING) {
    left = viewportWidth - menuWidth - VIEWPORT_PADDING
  }

  if (top + menuHeight > viewportHeight - VIEWPORT_PADDING) {
    top = triggerRect.top - menuHeight - MENU_GAP
  }

  if (top < VIEWPORT_PADDING) {
    top = VIEWPORT_PADDING
  }

  return { top, left }
}
