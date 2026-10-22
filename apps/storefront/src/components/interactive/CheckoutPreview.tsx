import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
export default function CheckoutPreview() {
  return (
    <div
      className="checkout-fields"
      role="group"
      aria-label="Non-submitting address preview"
    >
      <FieldGroup>
        {[
          ['full-name', 'Full name'],
          ['address', 'Address'],
          ['apartment', 'Apartment / building (optional)'],
          ['city', 'City'],
          ['postal-code', 'Postal code'],
          ['state', 'State'],
          ['country', 'Country'],
        ].map(([id, label]) => (
          <Field key={id}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Input
              id={id}
              name={id}
              autoComplete="off"
              inputMode={id === 'postal-code' ? 'numeric' : 'text'}
            />
          </Field>
        ))}
      </FieldGroup>
      <Button disabled size="lg">
        Payment not configured
      </Button>
      <p className="muted">
        Delivery and returns terms are not confirmed.{' '}
        <a href="/support">Practical information</a>.
      </p>
    </div>
  )
}
