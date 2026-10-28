import { useEffect, useState } from 'react'
import { addToBag, useBag } from '@/lib/bag'

type Option = { attributeId: number; attribute: string; valueId: number; value: string; color?: string }
type Variant = { id: number; price: number; quantity: number; options: Option[] }
type Product = { id: number; name: string; slug: string; description: string; image: { url: string; alt: string }; variantImages: { id: number; image: { url: string; alt: string } }[] }
type Offer = Product & { variants: Variant[]; anchorId: number | undefined }
const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value / 100)

function OfferCard({ offer }: { offer: Offer }) {
  const { items } = useBag()
  const [selectedId, setSelectedId] = useState(() => offer.variants.find(v => v.id === offer.anchorId && v.quantity > 0)?.id ?? offer.variants.find(v => v.quantity > 0)?.id)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const selected = offer.variants.find(v => v.id === selectedId)
  const groups = Array.from(new Map(offer.variants.flatMap(v => v.options.map(o => [o.attributeId, o.attribute] as const))).entries())
  const image = offer.variantImages.find(item => item.id === selectedId)?.image || offer.image
  function choose(attributeId: number, valueId: number) {
    const choices = offer.variants.filter(v => v.quantity > 0 && v.options.some(o => o.attributeId === attributeId && o.valueId === valueId))
    const sameOthers = choices.find(v => selected?.options.every(o => o.attributeId === attributeId || v.options.some(x => x.attributeId === o.attributeId && x.valueId === o.valueId)))
    setSelectedId((sameOthers || choices[0])?.id)
    setMessage('')
  }
  async function add() {
    if (!selected || busy) return
    setBusy(true); setMessage('Checking availability…')
    try {
      const existing = items.find(item => item.id === offer.id && item.variantId === selected.id)
      if (existing && existing.quantity >= 99) throw new Error('You can select up to 99 of each configuration.')
      const candidate = existing ? items.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { id: offer.id, variantId: selected.id, quantity: 1 }]
      const response = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(candidate), cache: 'no-store' })
      const data = await response.json()
      const line = data.lines?.find((item: { id: number; variantId?: number }) => item.id === offer.id && item.variantId === selected.id)
      if (!response.ok || !line?.purchasable) throw new Error('This selection is no longer available. Please try another.')
      if (line.unitPricePaise !== selected.price) throw new Error('The price has changed. Refresh this page to review the updated price.')
      const result = addToBag(offer.id, 1, selected.id)
      if (result !== 'Added to your bag.') throw new Error(result)
      window.location.assign('/cart')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not add this object.') }
    finally { setBusy(false) }
  }
  return <article className="upsell-card">
    <a href={`/products/${offer.slug}`} className="upsell-image">{image.url ? <img src={image.url} alt={image.alt} /> : <span>Image unavailable</span>}</a>
    <div className="upsell-card-content"><h3><a href={`/products/${offer.slug}`}>{offer.name}</a></h3><p>{offer.description}</p>
      {groups.map(([id, name]) => {
        const options = Array.from(new Map(offer.variants.flatMap(v => v.options.filter(o => o.attributeId === id).map(o => [o.valueId, o] as const))).values())
        const current = selected?.options.find(o => o.attributeId === id)
        if (/size/i.test(name)) return <label className="upsell-select" key={id}>{name}<select value={current?.valueId ?? ''} onChange={event => choose(id, Number(event.target.value))}>{options.map(option => <option key={option.valueId} value={option.valueId} disabled={!offer.variants.some(v => v.quantity > 0 && v.options.some(o => o.attributeId === id && o.valueId === option.valueId))}>{option.value}</option>)}</select></label>
        return <fieldset className="upsell-options" key={id}><legend>{name}{current ? ` · ${current.value}` : ''}</legend><div>{options.map(option => <label key={option.valueId}><input type="radio" name={`upsell-${offer.id}-${id}`} checked={current?.valueId === option.valueId} disabled={!offer.variants.some(v => v.quantity > 0 && v.options.some(o => o.attributeId === id && o.valueId === option.valueId))} onChange={() => choose(id, option.valueId)} />{option.color && <span className="upsell-swatch" style={{ backgroundColor: option.color }} aria-hidden="true" />}<span>{option.value}</span></label>)}</div></fieldset>
      })}
      {groups.length > 1 && <p className="muted">Changing a choice may update other options to an available combination.</p>}
      {selected && <p className="upsell-price">{money(selected.price)}</p>}
      <button className="config-add" type="button" disabled={!selected || selected.quantity <= 0 || busy} onClick={() => void add()}>{busy ? 'Checking…' : 'Add to bag'}</button><p role="status">{message}</p>
    </div>
  </article>
}

export default function UpsellRecommendations({ sourceId }: { sourceId?: number }) {
  const { items } = useBag()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const ids = Array.from(new Set(items.map(item => item.id)))
  const sourceIds = sourceId ? [sourceId] : ids
  const requestKey = JSON.stringify({ sourceIds, excludedIds: ids })
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true); setError(''); setOffers([])
      try {
        const response = await fetch('/api/upsells', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: requestKey, signal: controller.signal })
        if (!response.ok) throw new Error('Recommendations are temporarily unavailable.')
        const { candidates } = await response.json() as { candidates: Product[] }
        const available: Offer[] = []
        let failed = false
        for (let index = 0; index < candidates.length && available.length < 3; index += 6) {
          const configurations = await Promise.all(candidates.slice(index, index + 6).map(async product => {
            try {
              const result = await fetch(`/api/configurations?id=${product.id}`, { signal: controller.signal, cache: 'no-store' })
              if (!result.ok) { if (result.status >= 500) failed = true; return null }
              const data = await result.json() as { linked: boolean; variants?: Variant[]; anchorId?: number }
              return data.linked && data.variants?.some(variant => variant.quantity > 0) ? { ...product, variants: data.variants, anchorId: data.anchorId } : null
            } catch { if (!controller.signal.aborted) failed = true; return null }
          }))
          available.push(...configurations.filter((offer): offer is Offer => offer !== null))
        }
        if (!controller.signal.aborted) {
          setOffers(available.slice(0, 3))
          if (!available.length && failed) setError('Recommendations are temporarily unavailable.')
        }
      } catch { if (!controller.signal.aborted) setError('Recommendations are temporarily unavailable.') }
      finally { if (!controller.signal.aborted) setLoading(false) }
    }
    if (sourceIds.length) void load(); else { setOffers([]); setLoading(false) }
    return () => controller.abort()
  }, [requestKey])
  if (!loading && !error && !offers.length) return null
  return <section className="upsell-section" aria-label="Product recommendations"><div className="upsell-heading"><p className="config-eyebrow">Consider these too</p><h2>You may also like<span className="brand-dot">.</span></h2></div>{loading ? <p role="status">Finding available objects…</p> : error ? <p role="status">{error}</p> : <div className="upsell-grid">{offers.map(offer => <OfferCard key={offer.id} offer={offer} />)}</div>}</section>
}
