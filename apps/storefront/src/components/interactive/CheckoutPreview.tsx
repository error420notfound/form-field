import { useEffect, useState, type SubmitEvent } from 'react'
import { useBag, clearBag } from '@/lib/bag'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const fields = [
  ['name', 'Full name', 'text'], ['email', 'Email', 'email'],
  ['address', 'Address', 'text'], ['apartment', 'Apartment / building (optional)', 'text'],
  ['city', 'City', 'text'], ['postalCode', 'Postal code', 'text'],
  ['state', 'State', 'text'], ['country', 'Country', 'text'],
] as const

export default function CheckoutPreview() {
  const { items } = useBag()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [account, setAccount] = useState<Record<string, string> | null>(null)
  const [checking, setChecking] = useState(true)
  const [accountError, setAccountError] = useState(false)
  useEffect(() => {
    fetch('/api/account', { cache: 'no-store' }).then(async response => {
      if (response.status === 401) return
      if (!response.ok) throw new Error('Account unavailable')
      const data = await response.json(); setAccount(data.customer)
    }).catch(() => setAccountError(true)).finally(() => setChecking(false))
  }, [])
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !items.length) return
    const form = new FormData(event.currentTarget)
    const customer = Object.fromEntries(fields.map(([key]) => [key, String(form.get(key) || '').trim()]))
    let reference: string
    try {
      reference = sessionStorage.getItem('form-field-pending-order') || crypto.randomUUID()
      sessionStorage.setItem('form-field-pending-order', reference)
    } catch { setMessage('Browser session storage is required to place a demo order.'); return }
    setBusy(true)
    setMessage('Submitting your demo order…')
    try {
      const response = await fetch('/api/demo-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference, customer, items }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not submit the order.')
      sessionStorage.setItem('form-field-order-summary', JSON.stringify(result))
      sessionStorage.removeItem('form-field-pending-order')
      clearBag()
      window.location.assign('/order-confirmation')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not confirm the order. Check Payload before trying again.')
      setBusy(false)
    }
  }
  if (checking) return <p>Checking your account…</p>
  if (accountError) return <p>Account service is unavailable. Refresh to try again.</p>
  if (!account) return <p>Please <a href="/account">sign in or create an account</a> before checkout.</p>
  return (
    <form className="checkout-fields" onSubmit={submit}>
      <FieldGroup>
        {fields.map(([id, label, type]) => (
          <Field key={id}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Input id={id} name={id} type={type} defaultValue={account[id] || ''} readOnly={id === 'email'} required={id !== 'apartment'} maxLength={200} disabled={busy} />
          </Field>
        ))}
      </FieldGroup>
      <p><strong>Payment method:</strong> Demo payment</p>
      <Button type="submit" disabled={busy || !items.length} size="lg">{busy ? 'Submitting…' : 'Place demo order'}</Button>
      <p className="muted">Payment is simulated; no money is collected. Tax and shipping are not calculated.</p>
      <p role="status">{message}</p>
    </form>
  )
}
