import { useState } from 'react'
import type { CartView } from '@/lib/commerce/cart'
import { changeCommerceCart, refreshCommerceCart, useCommerceCart } from '@/lib/commerce/browser-cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'

function Line({ item, pending }: { item: CartView['items'][number]; pending: boolean }) {
  const [quantity, setQuantity] = useState(item.quantity)
  return <article className="commerce-line">
    <div><h2>{item.name}</h2><p className="muted">{item.variant}</p><p>{item.unitPrice} each · {item.total}</p></div>
    <form className="commerce-line-controls" onSubmit={async event => {
      event.preventDefault()
      if (event.currentTarget.reportValidity()) await changeCommerceCart({ action: 'update', lineId: item.id, quantity })
    }}>
      <Field><FieldLabel htmlFor={`quantity-${item.id}`}>Quantity for {item.name}</FieldLabel><Input id={`quantity-${item.id}`} type="number" required min={1} max={99} step={1} value={quantity} disabled={pending} onChange={event => setQuantity(Number(event.target.value))} /></Field>
      <Button type="submit" variant="outline" disabled={pending || quantity === item.quantity}>Update</Button>
      <Button type="button" variant="ghost" disabled={pending} onClick={() => void changeCommerceCart({ action: 'remove', lineId: item.id })}>Remove</Button>
    </form>
  </article>
}
export default function CommerceBag() {
  const { cart, loading, pending, error } = useCommerceCart()
  return <div className="commerce-bag" aria-busy={loading || pending}>
    <p role="status" aria-live="polite">{loading ? 'Refreshing commerce bag…' : pending ? 'Updating commerce bag…' : `${cart?.count || 0} items in your commerce bag.`}</p>
    {error ? <Alert><AlertDescription>{error} Any totals shown may be out of date.<Button variant="outline" disabled={loading || pending} onClick={() => void refreshCommerceCart()}>Refresh bag</Button></AlertDescription></Alert> : null}
    {loading && !cart ? <Skeleton className="h-24 w-full" /> : cart?.items.length ? <>
      {cart.items.map(item => <Line key={`${item.id}:${item.quantity}`} item={item} pending={pending || loading} />)}
      <dl className="commerce-totals">
        <div><dt>Items subtotal</dt><dd>{cart.subtotal}</dd></div>
        <div><dt>Discount</dt><dd>{cart.discount}</dd></div>
        <div><dt>Tax currently calculated</dt><dd>{cart.tax}</dd></div>
        <div><dt>Shipping currently calculated</dt><dd>{cart.shipping}</dd></div>
        <div><dt>Current total</dt><dd>{cart.total}</dd></div>
      </dl>
      <p className="muted">Shipping and tax depend on checkout details. These are the current bag totals, not a final order quote.</p>
    </> : !loading && !error ? <Empty><EmptyHeader><EmptyTitle>Your commerce bag is empty.</EmptyTitle><EmptyDescription>Choose a configuration on a commerce-enabled object to add it here.</EmptyDescription></EmptyHeader><a className="text-link" href="/shop">Explore objects</a></Empty> : null}
    <p>Checkout is being prepared. No order or payment is created from this bag.</p>
    <a className="text-link" href="/cart">View separate demo bag</a>
  </div>
}
