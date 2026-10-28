import type { Product } from './cms'
import { canPurchase } from './purchase-policy'

/** Use the editor's order when present; otherwise use the catalogue's order. */
export function selectUpsellCandidates(products: Product[], sourceIds: number[], excludedIds: number[]): Product[] {
  const byId = new Map(products.map(product => [product.id, product]))
  const configured = sourceIds.flatMap(id => byId.get(id)?.upsellProducts || [])
  const ids = configured.length
    ? configured.map(item => typeof item === 'number' ? item : item.id)
    : products.map(product => product.id)
  const excluded = new Set([...sourceIds, ...excludedIds])
  const seen = new Set<number>()
  return ids.flatMap(id => {
    if (seen.has(id) || excluded.has(id)) return []
    seen.add(id)
    const product = byId.get(id)
    return product && canPurchase(product) ? [product] : []
  })
}
