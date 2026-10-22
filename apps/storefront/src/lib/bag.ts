import { useEffect, useSyncExternalStore } from 'react'
export type Selection = { id: number; quantity: number }
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
        !result.some((v) => v.id === s.id)
      )
        result.push({ id: s.id, quantity: s.quantity })
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
export function addToBag(id: number, quantity: number) {
  initialize()
  if (
    !Number.isSafeInteger(id) ||
    id < 1 ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 99
  )
    return 'Choose a quantity from 1 to 99.'
  const existing = selections.find((s) => s.id === id)
  if (existing && existing.quantity + quantity > 99)
    return 'You can select up to 99 of each object. Adjust the quantity in your bag.'
  if (!existing && selections.length >= 100)
    return 'Your bag holds up to 100 different objects.'
  save(
    existing
      ? selections.map((s) =>
          s.id === id ? { id, quantity: s.quantity + quantity } : s,
        )
      : [...selections, { id, quantity }],
  )
  return storageOK
    ? 'Added to your bag.'
    : 'Added for this page. Browser storage is unavailable; selections cannot persist.'
}
export function updateQuantity(id: number, quantity: number) {
  if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 99)
    save(selections.map((s) => (s.id === id ? { id, quantity } : s)))
}
export function removeFromBag(id: number) {
  const found = selections.find((s) => s.id === id)
  const index = selections.findIndex((s) => s.id === id)
  save(selections.filter((s) => s.id !== id))
  return found ? { selection: found, index } : undefined
}
export function restoreToBag(removed: { selection: Selection; index: number }) {
  if (
    !selections.some((s) => s.id === removed.selection.id) &&
    selections.length < 100
  ) {
    const next = [...selections]
    next.splice(removed.index, 0, removed.selection)
    save(next)
  }
}
