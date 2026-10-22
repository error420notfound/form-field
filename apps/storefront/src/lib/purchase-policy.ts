export type PurchaseCandidate = {
  price?: number | null
  availability: string
  purchaseEligible?: boolean | null
  reviewOnly?: boolean | null
}
/** Unknown prices and local review concepts are never purchasable. Zero is a supplied price. */
export function canPurchase(p: PurchaseCandidate): boolean {
  return (
    !p.reviewOnly &&
    p.purchaseEligible !== false &&
    p.availability === 'available' &&
    typeof p.price === 'number' &&
    Number.isSafeInteger(p.price) &&
    p.price >= 0
  )
}
