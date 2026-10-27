import { useEffect, useState } from 'react'
type Summary = { odooReference: string; paymentStatus?: string; lines: { name: string; quantity: number; unitPrice: number }[]; subtotal: number }
const money = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100)
export default function OrderConfirmation() {
  const [summary, setSummary] = useState<Summary | null>(null)
  useEffect(() => {
    try { const raw = sessionStorage.getItem('form-field-order-summary'); if (raw) setSummary(JSON.parse(raw)) } catch { /* no local summary */ }
  }, [])
  if (!summary) return <p>No recent demo order summary is available in this browser session.</p>
  return <div>
    <p>Odoo order: <strong>{summary.odooReference}</strong></p>
    <ul>{summary.lines.map((line, i) => <li key={i}>{line.name} × {line.quantity} — {money(line.unitPrice * line.quantity)}</li>)}</ul>
    <p>Subtotal: <strong>{money(summary.subtotal)}</strong></p>
    {summary.paymentStatus === 'simulated-success' && <p>Demo payment: <strong>Simulated successful</strong></p>}
    <p>No payment was collected. Tax and shipping were not calculated.</p>
    <a href="/shop">Continue browsing</a>
  </div>
}
