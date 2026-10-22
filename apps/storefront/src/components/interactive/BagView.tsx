import { useEffect, useRef, useState } from 'react'
import { useBag, updateQuantity, removeFromBag, restoreToBag } from '@/lib/bag'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
type Line = {
  id: number
  quantity: number
  name: string
  url?: string
  image?: { url: string; alt: string }
  purchasable: boolean
  availability?: string
  unitPrice?: string
  lineTotal?: string
}
type Result = { lines: Line[]; subtotal: string }
export default function BagView({
  preview = false,
  compact = false,
}: {
  preview?: boolean
  compact?: boolean
}) {
  const { items, storageOK } = useBag()
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState(false),
    [retry, setRetry] = useState(0),
    [loading, setLoading] = useState(false)
  const [removed, setRemoved] = useState<ReturnType<typeof removeFromBag>>()
  const undoRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!items.length) {
      setResult(null)
      setLoading(false)
      setError(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    const timer = setTimeout(() => controller.abort(), 10000)
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Refresh failed')
        const data = (await response.json()) as Result
        if (!controller.signal.aborted) setResult(data)
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
        else if (!cancelled) setError(true)
      })
      .finally(() => {
        clearTimeout(timer)
        if (!cancelled) setLoading(false)
      })
    let cancelled = false
    return () => {
      cancelled = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [items, retry])
  const valid =
    !loading && !error && result?.lines.some((line) => line.purchasable)
  return (
    <div
      className={`bag-view ${compact ? 'bag-view--compact' : ''}`}
      aria-busy={loading}
    >
      {!storageOK && (
        <Alert>
          <AlertDescription>
            Browser storage is unavailable. Your changes may not survive a
            refresh.
          </AlertDescription>
        </Alert>
      )}
      {removed && (
        <div className="bag-undo">
          <p role="status">Object removed from your bag.</p>
          <Button
            ref={undoRef}
            variant="link"
            onClick={() => {
              restoreToBag(removed)
              setRemoved(undefined)
            }}
          >
            Undo removal
          </Button>
        </div>
      )}
      {!items.length ? (
        <Empty className="bag-empty">
          <EmptyHeader>
            <EmptyTitle>A little room for something considered.</EmptyTitle>
            <EmptyDescription>Your bag is empty.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <a href="/shop">Browse objects</a>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          {loading && (
            <p role="status" className="bag-status">
              Refreshing prices and availability…
            </p>
          )}
          {loading && !result && <Skeleton className="h-28 w-full" />}
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>
                Could not refresh your bag. Your saved selections have been
                kept.
                <Button
                  variant="outline"
                  onClick={() => setRetry((r) => r + 1)}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            result && (
              <div className="bag-lines">
                {result.lines.map((line) => (
                  <article className="bag-line" key={line.id}>
                    {line.image?.url && (
                      <a href={line.url}>
                        <img
                          src={line.image.url}
                          alt={line.image.alt}
                          width="120"
                          height="120"
                        />
                      </a>
                    )}
                    <div className="bag-line-copy">
                      <h3>
                        {line.url ? (
                          <a href={line.url}>{line.name}</a>
                        ) : (
                          line.name
                        )}
                      </h3>
                      <p className="muted">
                        {line.purchasable
                          ? 'Available'
                          : `${line.availability || 'No longer available'} · excluded from subtotal`}
                      </p>
                      {line.unitPrice && <p>{line.unitPrice} each</p>}
                      {preview ? (
                        <p>Quantity: {line.quantity}</p>
                      ) : (
                        <div className="bag-line-controls">
                          <label>
                            Quantity
                            <Input
                              type="number"
                              inputMode="numeric"
                              min="1"
                              max="99"
                              step="1"
                              required
                              aria-label={`Quantity for ${line.name}`}
                              value={
                                items.find((s) => s.id === line.id)?.quantity ??
                                line.quantity
                              }
                              onChange={(e) => {
                                if (e.target.validity.valid)
                                  updateQuantity(
                                    line.id,
                                    Number(e.target.value),
                                  )
                              }}
                            />
                          </label>
                          <Button
                            variant="link"
                            aria-label={`Remove ${line.name}`}
                            onClick={() => {
                              setRemoved(removeFromBag(line.id))
                              requestAnimationFrame(() =>
                                undoRef.current?.focus(),
                              )
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                    <strong>{line.purchasable ? line.lineTotal : '—'}</strong>
                  </article>
                ))}
              </div>
            )
          )}
          {valid && (
            <div className="bag-summary">
              <div>
                <span>Subtotal</span>
                <strong>{result?.subtotal}</strong>
              </div>
              <p className="muted">
                Local preview. Tax, shipping and payment are not configured.
                This is not a final payable total.
              </p>
              {!preview && (
                <Button asChild>
                  <a href="/checkout">Continue to checkout preview</a>
                </Button>
              )}
            </div>
          )}
          {!loading && !error && result && (
            <p role="status" className="sr-only">
              Bag refreshed. Subtotal {result.subtotal}.
            </p>
          )}
        </>
      )}
    </div>
  )
}
