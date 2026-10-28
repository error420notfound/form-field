import { useEffect, useSyncExternalStore } from 'react'
import type { CartView } from './cart'
import type { CartAction } from './policy'

type State = { cart: CartView | null; loading: boolean; pending: boolean; error: string }
const initial: State = { cart: null, loading: true, pending: false, error: '' }
let state = initial
let initialized = false
let request: Promise<void> | null = null
const listeners = new Set<() => void>()
function update(next: Partial<State>) { state = { ...state, ...next }; listeners.forEach(listener => listener()) }
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }

export async function refreshCommerceCart() {
  if (request) return request
  request = (async () => {
    update({ loading: true, error: '' })
    try {
      const result = await fetch('/api/commerce/cart', { cache: 'no-store', credentials: 'same-origin' })
      const data = await result.json()
      if (!result.ok) throw new Error(data.error || 'Your commerce bag is temporarily unavailable.')
      update({ cart: data.cart })
    } catch (error) { update({ error: error instanceof Error ? error.message : 'Please retry.' }) }
    finally { update({ loading: false }); request = null }
  })()
  return request
}
let channel: BroadcastChannel | null = null
function initialize() {
  if (initialized) return
  initialized = true
  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel('ff-commerce-cart-v1')
    channel.onmessage = () => { if (!state.pending) void refreshCommerceCart() }
  }
  window.addEventListener('focus', () => { if (!state.pending) void refreshCommerceCart() })
  void refreshCommerceCart()
}
export function useCommerceCart() {
  useEffect(initialize, [])
  return useSyncExternalStore(subscribe, () => state, () => initial)
}
export async function changeCommerceCart(action: CartAction): Promise<boolean> {
  initialize()
  if (state.pending) return false
  if (request) await request
  if (state.pending) return false
  update({ pending: true, error: '' })
  try {
    const result = await fetch('/api/commerce/cart', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(action) })
    const data = await result.json()
    if (!result.ok) throw new Error(data.error || 'Your bag could not be updated.')
    update({ cart: data.cart })
    channel?.postMessage('changed')
    return true
  } catch (error) {
    update({ error: error instanceof Error ? error.message : 'We could not confirm the change. Refresh before retrying.' })
    return false
  } finally { update({ pending: false }) }
}
