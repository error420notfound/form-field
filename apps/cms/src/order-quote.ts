export type QuoteLine = { id: number; variantId?: number; resolvedVariantId: number; quantity: number; unitPricePaise: number }
export function quoteMatches(items: { id: number; variantId?: number; quantity: number }[], lines: { id: number; variantId?: number; quantity: number; odooId: number; unitPrice: number }[], quote: unknown): boolean {
  if (!Array.isArray(quote) || quote.length !== items.length || lines.length !== items.length) return false
  return items.every((item, index) => {
    const q = quote[index] as QuoteLine | undefined
    const line = lines[index]
    return !!q && q.id === item.id && q.variantId === item.variantId && q.quantity === item.quantity && q.resolvedVariantId === line.odooId && q.unitPricePaise === line.unitPrice
  })
}
