/** Medusa v2 amounts are major currency units, unlike legacy Payload paise. */
export function formatCommercePrice(amount: number, currency = 'inr') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency.toUpperCase(), maximumFractionDigits: 2 }).format(amount)
}
