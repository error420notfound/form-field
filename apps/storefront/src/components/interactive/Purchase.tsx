import { useState } from 'react'
import { addToBag, useBag } from '@/lib/bag'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
export default function Purchase({ id, name }: { id: number; name: string }) {
  useBag()
  const [quantity, setQuantity] = useState(1),
    [status, setStatus] = useState('')
  return (
    <form
      className="purchase-form"
      onSubmit={(e) => {
        e.preventDefault()
        if (e.currentTarget.reportValidity())
          setStatus(`${name}: ${addToBag(id, quantity)} Quantity ${quantity}.`)
      }}
    >
      <Field>
        <FieldLabel htmlFor={`quantity-${id}`}>Quantity</FieldLabel>
        <Input
          id={`quantity-${id}`}
          name="quantity"
          type="number"
          min="1"
          max="99"
          required
          step="1"
          inputMode="numeric"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </Field>
      <Button type="submit" size="lg">
        Add to bag
      </Button>
      <p role="status" className="purchase-feedback">
        {status}
      </p>
    </form>
  )
}
