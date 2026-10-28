import { useState } from 'react'
import type { CommerceProductView } from '@/lib/commerce/products'
import { formatCommercePrice } from '@/lib/commerce/format'
import { changeCommerceCart, refreshCommerceCart, useCommerceCart } from '@/lib/commerce/browser-cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CommercePurchase({ productId, commerce, disabled = false }: { productId: number; commerce: CommerceProductView; disabled?: boolean }) {
  const { pending, loading, error } = useCommerceCart()
  const [variantId, setVariantId] = useState(commerce.variants.length === 1 ? commerce.variants[0].id : '')
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const variant = commerce.variants.find(item => item.id === variantId)
  return <form className="purchase-form commerce-purchase" onSubmit={async event => {
    event.preventDefault()
    setMessage('')
    if (!disabled && variant?.available && event.currentTarget.reportValidity()) {
      const added = await changeCommerceCart({ action: 'add', productId, variantId, quantity })
      if (added) setMessage('Added to your commerce bag.')
    }
  }}>
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={`commerce-variant-${productId}`}>Configuration</FieldLabel>
        <select id={`commerce-variant-${productId}`} value={variantId} required disabled={disabled || loading || pending} onChange={event => { setVariantId(event.target.value); setMessage('') }}>
          <option value="" disabled>Choose a configuration</option>
          {commerce.variants.map(item => <option key={item.id} value={item.id} disabled={!item.available}>{item.title}{item.amount === null ? ' · Price unavailable' : ` · ${formatCommercePrice(item.amount)}`}{!item.available ? ' · Unavailable' : ''}</option>)}
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor={`commerce-quantity-${productId}`}>Quantity</FieldLabel>
        <Input id={`commerce-quantity-${productId}`} type="number" min={1} max={99} step={1} required value={quantity} disabled={disabled || loading || pending} onChange={event => setQuantity(Number(event.target.value))} />
      </Field>
    </FieldGroup>
    {variant ? <p>{variant.amount === null ? 'Price unavailable' : formatCommercePrice(variant.amount)} · {variant.available ? 'Available' : 'Unavailable'}{variant.sku ? ` · SKU ${variant.sku}` : ''}</p> : null}
    <Button type="submit" size="lg" disabled={disabled || loading || pending || !variant?.available}>{pending ? 'Updating bag…' : 'Add to commerce bag'}</Button>
    <p role="status" className="purchase-feedback">{message}</p>
    {error ? <Alert><AlertDescription>{error}<Button type="button" variant="outline" disabled={pending || loading} onClick={() => void refreshCommerceCart()}>Refresh bag</Button></AlertDescription></Alert> : null}
    <a className="text-link" href="/commerce/cart">View commerce bag</a>
    <p className="muted">Saved separately from the demo bag. Checkout is being prepared.</p>
  </form>
}
