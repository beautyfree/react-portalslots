import { createContext, type PropsWithChildren, useMemo } from 'react'
import { PortalSlotsRegistry } from './PortalSlotsRegistry'

export const PortalSlotsContext = createContext<PortalSlotsRegistry | null>(null)

export function PortalSlotsProvider({ children }: PropsWithChildren) {
  const registry = useMemo(() => new PortalSlotsRegistry(), [])
  return <PortalSlotsContext.Provider value={registry}>{children}</PortalSlotsContext.Provider>
}
