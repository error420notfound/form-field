import { useEffect, useState } from 'react'
import { useBag } from '@/lib/bag'

export default function AddedSummary({ id, variantId }: { id: number; variantId?: number }) {
  const { items } = useBag()
  const [line, setLine] = useState<{ name: string; image?: { url: string; alt: string }; options?: { attribute: string; value: string }[] } | null>(null)
  useEffect(() => {
    const selected = items.find(item => item.id === id && (variantId === undefined || item.variantId === variantId))
    if (!selected) { setLine(null); return }
    const controller = new AbortController()
    fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([selected]), signal: controller.signal }).then(response => response.ok ? response.json() : null).then(data => { if (!controller.signal.aborted) setLine(data?.lines?.[0] || null) }).catch(() => { if (!controller.signal.aborted) setLine(null) })
    return () => controller.abort()
  }, [id, variantId, items])
  return <div className="added-bar"><div className="added-selection">{line?.image?.url && <img src={line.image.url} alt={line.image.alt} />}<div><p className="config-eyebrow">{line ? 'Added to your bag' : 'Your bag'}</p><strong>{line?.name || 'Review your selections'}</strong>{!!line?.options?.length && <p>{line.options.map(option => option.value).join(' · ')}</p>}</div></div><a className="config-add" href="/cart">Review bag</a></div>
}
