export class PortalSlotsRegistry {
  private _slots = new Map<symbol, HTMLElement>()
  private _listeners = new Set<() => void>()

  get(id: symbol) {
    return this._slots.get(id)
  }

  set(id: symbol, element: HTMLElement) {
    if (this._slots.has(id)) {
      throw new Error(`Portal slot ${String(id)} already exists`)
    }
    this._slots.set(id, element)
    this.emit()
  }

  delete(id: symbol) {
    this._slots.delete(id)
    this.emit()
  }

  subscribe(listener: () => void) {
    this._listeners.add(listener)
    return () => this._listeners.delete(listener)
  }

  private emit() {
    this._listeners.forEach((listener) => {
      listener()
    })
  }
}
