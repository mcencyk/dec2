import { useState } from 'react'
import { createPortal } from 'react-dom'
import React, { type ReactElement } from 'react'

interface TooltipProps {
  text: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: ReactElement<any>
  side?: 'top' | 'bottom'
}

export function Tooltip({ text, children, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  const child = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      children.props.onMouseEnter?.(e)
      const r = e.currentTarget.getBoundingClientRect()
      setCoords({
        x: r.left + r.width / 2,
        y: side === 'top' ? r.top - 6 : r.bottom + 6,
      })
      setVisible(true)
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      children.props.onMouseLeave?.(e)
      setVisible(false)
    },
  })

  return (
    <>
      {child}
      {createPortal(
        <div
          style={{
            position: 'fixed',
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            transform: side === 'top'
              ? 'translateX(-50%) translateY(-100%)'
              : 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 9999,
            background: '#000',
            color: '#fff',
            fontSize: '12px',
            lineHeight: '16px',
            padding: '6px 8px',
            borderRadius: '8px',
            whiteSpace: 'nowrap',
            fontFamily: 'Geist Variable, sans-serif',
            opacity: visible ? 1 : 0,
            transition: 'opacity 120ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {text}
        </div>,
        document.body,
      )}
    </>
  )
}
