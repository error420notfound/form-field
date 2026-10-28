import { useEffect, useState } from 'react'
import { addToBag, useBag } from '@/lib/bag'

type Image = { src: string; alt: string }
type Option = { attributeId: number; attribute: string; valueId: number; value: string; color?: string }
type Variant = { id: number; price: number; quantity: number; options: Option[] }
type Payload = { linked: boolean; anchorId?: number; variants?: Variant[] }
type Props = { id: number; slug: string; name: string; description: string; gallery: Image[]; variantImages: (Image & { variantId: number })[]; demo: boolean; facts: { label: string; value: string }[] }
const formatPrice = (p: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p / 100)
const demoVariants: Variant[] = [
  ...['Silver', 'Starlight', 'Rose pink', 'Space grey'].map((value, i) => ({ id: i + 1, price: 0, quantity: 1, options: [{ attributeId: 1, attribute: 'Model', valueId: 11, value: 'Tabletop' }, { attributeId: 2, attribute: 'Colour', valueId: i + 21, value }] })),
  ...['Silver', 'Space grey'].map((value, i) => ({ id: i + 5, price: 0, quantity: 1, options: [{ attributeId: 1, attribute: 'Model', valueId: 12, value: 'Wall-mounted' }, { attributeId: 2, attribute: 'Colour', valueId: i ? 24 : 21, value }] })),
]
export default function Configurator({ id, slug, name, description, gallery, variantImages, demo, facts }: Props) {
  const { items } = useBag()
  const [data, setData] = useState<Payload | null>(demo ? { linked: true, variants: demoVariants, anchorId: 1 } : null)
  const [selectedId, setSelectedId] = useState<number | null>(demo ? 1 : null)
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
  const [error, setError] = useState(''), [status, setStatus] = useState(''), [busy, setBusy] = useState(false), [retry, setRetry] = useState(0)
  useEffect(() => {
    if (demo) return
    const controller = new AbortController()
    setError(''); setData(null)
    fetch(`/api/configurations?id=${id}`, { signal: controller.signal, cache: 'no-store' }).then(async response => {
      if (!response.ok) { const result = await response.json(); throw new Error(result.error || 'Could not load configurations. Please try again.') }
      return response.json() as Promise<Payload>
    }).then(value => { setData(value); setSelectedId(value.variants?.find(v => v.id === value.anchorId && v.quantity > 0)?.id ?? value.variants?.find(v => v.quantity > 0)?.id ?? value.variants?.find(v => v.id === value.anchorId)?.id ?? value.variants?.[0]?.id ?? null) }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Could not load configurations.') })
    return () => controller.abort()
  }, [id, demo, retry])
  const variants = data?.variants || []
  const selected = variants.find(v => v.id === selectedId)
  const groups = Array.from(new Map(variants.flatMap(v => v.options.map(o => [o.attributeId, o.attribute] as const))).entries())
  const chosenImage = (galleryIndex !== null ? gallery[galleryIndex] : undefined) || (demo && selected?.options.some(o => o.value === 'Wall-mounted') ? gallery[3] : undefined) || variantImages.find(image => image.variantId === selectedId) || gallery[0]
  function choose(attributeId: number, valueId: number) {
    const candidates = variants.filter(v => v.quantity > 0 && v.options.some(o => o.attributeId === attributeId && o.valueId === valueId))
    const preserving = candidates.find(v => selected?.options.every(o => o.attributeId === attributeId || v.options.some(x => x.attributeId === o.attributeId && x.valueId === o.valueId)))
    setSelectedId((preserving || candidates[0])?.id ?? null); setGalleryIndex(null); setStatus('')
  }
  async function add() {
    if (!selected || demo || busy) return
    setBusy(true); setStatus('Checking availability…')
    try {
      const existing = items.find(item => item.id === id && item.variantId === selected.id)
      if (existing && existing.quantity >= 99) throw new Error('You can select up to 99 of each configuration.')
      const candidate = existing ? items.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { id, variantId: selected.id, quantity: 1 }]
      const response = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(candidate), cache: 'no-store' })
      const result = await response.json()
      const line = result.lines?.find((item: { id: number; variantId?: number }) => item.id === id && item.variantId === selected.id)
      if (!response.ok || !line?.purchasable) throw new Error('This configuration is no longer available. Refresh and choose again.')
      if (line.unitPricePaise !== selected.price) { setRetry(n => n + 1); throw new Error('The price changed. Review the updated price before adding.') }
      const message = addToBag(id, 1, selected.id)
      setStatus(message)
      if (message === 'Added to your bag.') window.location.assign(`/products/${encodeURIComponent(slug)}/added?variant=${selected.id}`)
    } catch (e) { setStatus(e instanceof Error ? e.message : 'Could not verify availability.') }
    finally { setBusy(false) }
  }
  return <section className="config-page">
    <div className="config-heading"><a className="text-link" href={`/products/${slug}`}>← Back to the story</a><p className="config-eyebrow">{demo ? 'Local demonstration · Apple HomeView' : 'Your selection'}</p><h1>{demo ? 'Explore' : 'Configure'} {name}<span className="brand-dot">.</span></h1><p>{description}</p></div>
    <div className="config-layout"><div className="config-visual">{chosenImage ? <img src={chosenImage.src} alt={chosenImage.alt} width="1600" height="1100" /> : <p>Product imagery to follow.</p>}{gallery.length > 1 && <div className="config-gallery" role="group" aria-label="Product image views">{gallery.map((image, index) => <button key={image.src} type="button" aria-label={`View image ${index + 1}: ${image.alt}`} aria-pressed={galleryIndex === index || (galleryIndex === null && chosenImage === image)} onClick={() => setGalleryIndex(index)}><img src={image.src} alt="" width="80" height="60" /></button>)}</div>}{demo && <p className="config-caption">Representative imagery · colours and views are illustrative of the supplied Apple material.</p>}</div>
      <div className="config-options">{!data && !error && <p role="status">Loading configurations…</p>}{error && <div role="alert"><p>{error}</p><button className="config-secondary" onClick={() => setRetry(n => n + 1)}>Try again</button></div>}{data && !data.linked && <p>Configurations are not yet available for this object.</p>}{data?.linked && !variants.length && <p>No configurations are currently available.</p>}{data?.linked && variants.length > 0 && !selected && <p>All configurations are currently out of stock.</p>}
        {groups.length > 1 && <p className="config-hint">Changing one choice may update another to a valid combination.</p>}
        {groups.map(([groupId, label]) => {
          const options = Array.from(new Map(variants.flatMap(v => v.options.filter(o => o.attributeId === groupId).map(o => [o.valueId, o] as const))).values())
          const current = selected?.options.find(o => o.attributeId === groupId)
          return <fieldset key={groupId}><legend>{label}. <span>Choose what works for you.</span></legend><div className="config-choice-list">{options.map(o => { const available = variants.some(v => v.quantity > 0 && v.options.some(x => x.attributeId === groupId && x.valueId === o.valueId)); return <label key={o.valueId} className="config-choice"><input type="radio" name={`attribute-${groupId}`} value={o.valueId} checked={current?.valueId === o.valueId} disabled={!available} onChange={() => choose(groupId, o.valueId)} />{o.color && <span className="config-swatch" style={{ backgroundColor: o.color }} aria-hidden="true" />}<span>{o.value}{!available && ' · Unavailable'}</span></label> })}</div></fieldset>
        })}
        {data?.linked && !groups.length && variants.length > 0 && <fieldset><legend>Configuration</legend><p>Standard</p></fieldset>}
        {selected && <div className="config-summary" aria-live="polite"><p className="config-selection">{name}{selected.options.length ? ` · ${selected.options.map(o => o.value).join(' · ')}` : ''}</p>{demo ? <p>This is a local, non-purchasable preview. The wall-mounted model is a separate product.</p> : <><p className="config-price">{formatPrice(selected.price)}</p><p>{selected.quantity > 0 ? 'Available' : 'Out of stock'}</p></>}<button className="config-add" disabled={demo || busy || selected.quantity <= 0} onClick={add}>{demo ? 'Not available to purchase' : busy ? 'Checking…' : 'Add to bag'}</button><p role="status">{status}</p>{!demo && status.startsWith('Added') && <a className="text-link" href="/cart">View bag</a>}</div>}
      </div></div>
    <section className="config-details"><h2>Product information<span className="brand-dot">.</span></h2><div><p>{description}</p>{facts.length > 0 && <dl className="specifications">{facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>}{demo && <p>Apple HomeView imagery and descriptions are supplied reference material for a local prototype. Product claims have not been independently verified.</p>}</div></section>
  </section>
}
