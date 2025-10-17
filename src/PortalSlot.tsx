import type { PropsWithChildren } from 'react'
import {
  useContext,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from 'react'
import { createPortal } from 'react-dom'

import { PortalSlotsContext } from './PortalSlotsProvider'

function usePortalSlots() {
  const context = useContext(PortalSlotsContext)
  if (!context) {
    throw new Error('usePortalSlots must be used within a PortalSlotsProvider')
  }
  return context
}

export function PortalSlot(name = 'portal') {
  const id = Symbol(name)

  const Slot = function Slot({
    children,
    className = '',
  }: PropsWithChildren<{ className?: string }>) {
    const slotRef = useRef<HTMLDivElement>(null)
    const portalSlots = usePortalSlots()

    useLayoutEffect(() => {
      const slot = slotRef.current
      if (!slot) return

      portalSlots.set(id, slot)
      return () => {
        portalSlots.delete(id)
      }
    }, [portalSlots])

    return (
      <div className={`portal-slotportal-slot-${name} ${className}`.trim()} ref={slotRef}>
        {children}
      </div>
    )
  }

  const Portal = function Portal({ children }: PropsWithChildren) {
    const portalSlots = usePortalSlots()
    const slot = useSyncExternalStore(
      portalSlots.subscribe.bind(portalSlots),
      () => portalSlots.get(id),
      () => undefined
    )
  
    if (!slot) return null
    return createPortal(children, slot)
  }

  return Object.assign(Portal, { Slot })
}
