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
  const [quote, setQuote] = useState<{ snapshot: string; subtotal: string; lines: { id: number; variantId?: number; resolvedVariantId: number; quantity: number; unitPricePaise: number; name: string; options: { attribute: string; value: string }[] }[] } | null>(null)
  const [checking, setChecking] = useState(true)
  const [accountError, setAccountError] = useState(false)
  useEffect(() => {
    fetch('/api/account', { cache: 'no-store' }).then(async response => {
      if (response.status === 401) { window.location.replace('/checkout/sign-in'); return }
      if (!response.ok) throw new Error('Account unavailable')
      const data = await response.json(); setAccount(data.customer)
    }).catch(() => setAccountError(true)).finally(() => setChecking(false))
  }, [])
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !items.length) return
    const form = new FormData(event.currentTarget)
    const customer = Object.fromEntries(fields.map(([key]) => [key, String(form.get(key) || '').trim()]))
    if (!quote || quote.snapshot !== JSON.stringify(items)) {
      setBusy(true); setMessage('Refreshing prices and availability…')
      try {
        const response = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items), cache: 'no-store' })
        const data = await response.json()
        if (!response.ok || !Array.isArray(data.lines) || data.lines.length !== items.length || data.lines.some((line: { purchasable: boolean }) => !line.purchasable)) throw new Error('An item is unavailable. Refresh your bag before checkout.')
        setQuote({ snapshot: JSON.stringify(items), subtotal: data.subtotal, lines: data.lines.map((line: { id: number; variantId?: number; resolvedVariantId: number; quantity: number; unitPricePaise: number; name: string; options: { attribute: string; value: string }[] }) => ({ name: line.name, options: line.options, id: line.id, ...(line.variantId !== undefined ? { variantId: line.variantId } : {}), resolvedVariantId: line.resolvedVariantId, quantity: line.quantity, unitPricePaise: line.unitPricePaise })) })
        setMessage('Review the refreshed subtotal, then confirm the demo order.')
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not refresh prices.') }
      finally { setBusy(false) }
      return
    }
    let reference: string
    try {
      reference = sessionStorage.getItem('form-field-pending-order') || crypto.randomUUID()
      sessionStorage.setItem('form-field-pending-order', reference)
    } catch { setMessage('Browser session storage is required to place a demo order.'); return }
    setBusy(true)
    setMessage('Submitting your demo order…')
    try {
      const response = await fetch('/api/demo-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference, customer, items, quote: quote.lines }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not submit the order.')
      sessionStorage.setItem('form-field-order-summary', JSON.stringify(result))
      sessionStorage.removeItem('form-field-pending-order')
      clearBag()
      window.location.assign('/order-confirmation')
    } catch (error) {
      setQuote(null)
      setMessage(error instanceof Error ? error.message : 'Could not confirm the order. Check Payload before trying again.')
      setBusy(false)
    }
  }
  if (checking) return <p>Checking your account…</p>
  if (accountError) return <p>Account service is unavailable. Refresh to try again.</p>
  if (!account) return <p>Taking you to <a href="/checkout/sign-in">sign in</a>…</p>
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
      {quote && quote.snapshot === JSON.stringify(items) && <div aria-label="Refreshed order prices"><p>Review the refreshed prices before confirming.</p><ul>{quote.lines.map((line, index) => <li key={`${line.id}:${line.variantId ?? 'legacy'}:${index}`}>{line.name}{line.options?.length ? ` · ${line.options.map(option => `${option.attribute}: ${option.value}`).join(' · ')}` : ''} × {line.quantity} — {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(line.unitPricePaise / 100)} each</li>)}</ul><p>Refreshed subtotal: <strong>{quote.subtotal}</strong>.</p></div>}
      <Button type="submit" disabled={busy || !items.length} size="lg">{busy ? 'Please wait…' : quote && quote.snapshot === JSON.stringify(items) ? 'Confirm demo order' : 'Review demo order'}</Button>
      <p className="muted">Payment is simulated; no money is collected. Tax and shipping are not calculated.</p>
      <p role="status">{message}</p>
    </form>
  )
}
