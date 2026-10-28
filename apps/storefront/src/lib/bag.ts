import { useEffect, useSyncExternalStore } from 'react'
export type Selection = { id: number; quantity: number; variantId?: number }
const same = (a: Selection, b: Pick<Selection, 'id' | 'variantId'>) => a.id === b.id && (a.variantId ?? null) === (b.variantId ?? null)
const KEY = 'studio-cart-v1'
const EMPTY: Selection[] = []
let selections: Selection[] = EMPTY
let initialized = false
let storageOK = true
const listeners = new Set<() => void>()
function notify() {
  listeners.forEach((fn) => fn())
}
function parse(raw: string | null): Selection[] {
  const result: Selection[] = []
  const value: unknown = JSON.parse(raw || '[]')
  if (Array.isArray(value))
    for (const s of value.slice(0, 100)) {
      if (
        Number.isSafeInteger(s?.id) &&
        s.id > 0 &&
        Number.isInteger(s.quantity) &&
        s.quantity > 0 &&
        s.quantity <= 99 &&
        (s.variantId === undefined || (Number.isSafeInteger(s.variantId) && s.variantId > 0)) &&
        !result.some((v) => same(v, s))
      )
        result.push({ id: s.id, quantity: s.quantity, ...(s.variantId ? { variantId: s.variantId } : {}) })
    }
  return result
}
function initialize() {
  if (initialized) return
  initialized = true
  try {
    selections = parse(localStorage.getItem(KEY))
  } catch {
    selections = []
    storageOK = false
  }
  window.addEventListener('storage', (e) => {
    if (e.key === KEY || e.key === null) {
      try {
        selections = parse(e.newValue)
        storageOK = true
      } catch {
        storageOK = false
      }
      notify()
    }
  })
  notify()
}
function save(next: Selection[]) {
  selections = next
  try {
    localStorage.setItem(KEY, JSON.stringify(selections))
    storageOK = true
  } catch {
    storageOK = false
  }
  notify()
}
export function useBag() {
  useEffect(initialize, [])
  const items = useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    () => selections,
    () => EMPTY,
  )
  return { items, storageOK }
}
export function addToBag(id: number, quantity: number, variantId?: number) {
  initialize()
  if (
    !Number.isSafeInteger(id) ||
    id < 1 ||
    (variantId !== undefined && (!Number.isSafeInteger(variantId) || variantId < 1)) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 99
  )
    return 'Choose a quantity from 1 to 99.'
  const existing = selections.find((s) => same(s, { id, variantId }))
  if (existing && existing.quantity + quantity > 99)
    return 'You can select up to 99 of each object. Adjust the quantity in your bag.'
  if (!existing && selections.length >= 100)
    return 'Your bag holds up to 100 different objects.'
  save(
    existing
      ? selections.map((s) =>
          same(s, { id, variantId }) ? { ...s, quantity: s.quantity + quantity } : s,
        )
      : [...selections, { id, quantity, ...(variantId ? { variantId } : {}) }],
  )
  return storageOK
    ? 'Added to your bag.'
    : 'Added for this page. Browser storage is unavailable; selections cannot persist.'
}
export function updateQuantity(id: number, quantity: number, variantId?: number) {
  if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 99)
    save(selections.map((s) => (same(s, { id, variantId }) ? { ...s, quantity } : s)))
}
export function removeFromBag(id: number, variantId?: number) {
  const found = selections.find((s) => same(s, { id, variantId }))
  const index = selections.findIndex((s) => same(s, { id, variantId }))
  save(selections.filter((s) => !same(s, { id, variantId })))
  return found ? { selection: found, index } : undefined
}
export function clearBag() {
  initialize()
  save([])
}
export function restoreToBag(removed: { selection: Selection; index: number }) {
  if (
    !selections.some((s) => same(s, removed.selection)) &&
    selections.length < 100
  ) {
    const next = [...selections]
    next.splice(removed.index, 0, removed.selection)
    save(next)
  }
}

/** Upgrade product-only lines once the server resolves the linked variant. */
export function resolveLegacySelections(snapshot: Selection[], resolved: { id: number; variantId?: number; resolvedVariantId?: number }[]) {
  if (JSON.stringify(snapshot) !== JSON.stringify(selections)) return
  let changed = false
  const next = [...selections]
  for (const line of resolved) {
    if (line.variantId !== undefined || !line.resolvedVariantId) continue
    const index = next.findIndex(item => item.id === line.id && item.variantId === undefined)
    if (index < 0) continue
    const target = next.findIndex(item => item.id === line.id && item.variantId === line.resolvedVariantId)
    if (target >= 0) {
      const sum = next[target].quantity + next[index].quantity
      if (sum > 99) continue
      next[target] = { ...next[target], quantity: sum }
      next.splice(index, 1)
    } else next[index] = { ...next[index], variantId: line.resolvedVariantId }
    changed = true
  }
  if (changed) save(next)
}
