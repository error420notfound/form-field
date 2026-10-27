import { useEffect, useState, type SubmitEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Profile = { id: number; email: string; name: string; address: string; apartment: string; city: string; postalCode: string; state: string; country: string; odooSyncStatus: string }
type Order = { reference: string; odooReference?: string; status: string; paymentStatus?: string; createdAt: string; subtotal: number; delivery: string; items: { name: string; quantity: number; unitPrice: number }[] }
const fields = [['name', 'Full name'], ['address', 'Address'], ['apartment', 'Apartment / building'], ['city', 'City'], ['postalCode', 'Postal code'], ['state', 'State'], ['country', 'Country']] as const
const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value / 100)
export default function CustomerAccount() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function refresh() {
    const response = await fetch('/api/account', { cache: 'no-store' })
    if (response.status === 401) { setProfile(null); setOrders([]); return }
    if (!response.ok) throw new Error('Account service unavailable.')
    const data = await response.json()
    setProfile(data.customer); setOrders(data.orders)
  }
  useEffect(() => { refresh().catch(() => setMessage('Account service unavailable.')).finally(() => setLoading(false)) }, [])
  async function submit(event: SubmitEvent<HTMLFormElement>, action: 'login' | 'signup' | 'profile') {
    event.preventDefault(); if (busy) return
    const form = new FormData(event.currentTarget)
    const nextProfile = Object.fromEntries(fields.map(([key]) => [key, String(form.get(key) || '')]))
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, email: form.get('email'), password: form.get('password'), profile: nextProfile }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not save.')
      await refresh()
      if (action === 'profile') setMessage(data.customer.odooSyncStatus === 'synced' ? 'Profile saved.' : 'Profile saved. Odoo sync will be retried.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Please try again.') } finally { setBusy(false) }
  }
  async function logout() {
    setBusy(true); setMessage('')
    try { const response = await fetch('/api/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) }); if (!response.ok) throw new Error('Could not sign out.'); setProfile(null); setOrders([]) } catch { setMessage('Could not sign out. Please retry.') } finally { setBusy(false) }
  }
  if (loading) return <p>Loading your account…</p>
  return <div>
    {!profile ? <>
      <p>Sign in to place demo orders and view their status.</p>
      <form className="checkout-fields" onSubmit={e => void submit(e, mode)}>
        {mode === 'signup' && <label>Full name<Input name="name" required maxLength={200} autoComplete="name" /></label>}
        <label>Email<Input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
        <label>Password<Input name="password" type="password" required minLength={10} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        <Button disabled={busy} type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</Button>
      </form>
      <Button type="button" variant="link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage('') }}>{mode === 'login' ? 'Create an account' : 'Already have an account? Sign in'}</Button>
      <p className="muted">Local demo: password reset and email verification are not configured.</p>
    </> : <>
      <p>Signed in as {profile.email}</p>
      <Button type="button" variant="outline" onClick={() => void logout()} disabled={busy}>Sign out</Button>
      <h2>Your details</h2>
      <form className="checkout-fields" key={profile.id} onSubmit={e => void submit(e, 'profile')}>
        {fields.map(([key, label]) => <label key={key}>{label}<Input name={key} defaultValue={profile[key]} required={key === 'name'} maxLength={200} /></label>)}
        <Button disabled={busy} type="submit">Save details</Button>
      </form>
      {profile.odooSyncStatus !== 'synced' && <p>Odoo connection pending. We will retry when you sign in or check out.</p>}
      <h2>Your orders</h2>
      {!orders.length ? <p>You have no account orders yet.</p> : orders.map(order => <article key={order.reference} className="bag-line">
        <div><h3>{order.odooReference || 'Order pending review'}</h3><p>{new Date(order.createdAt).toLocaleDateString('en-IN')} · {order.status}</p><p>Delivery: {order.delivery}</p><p>Payment: {order.paymentStatus === 'simulated-success' ? 'Simulated successful' : 'Pending or unavailable'}</p><ul>{Array.isArray(order.items) && order.items.map((item, i) => <li key={i}>{item.name} × {item.quantity}</li>)}</ul><p>Subtotal: {money(order.subtotal)}</p></div>
      </article>)}
    </>}
    <p role="status">{message}</p>
  </div>
}
