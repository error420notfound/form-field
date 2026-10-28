export type Ops = { occurredAt?: string; payment?: { paid?: number; refunded?: number }; fulfilment?: string; odooSync?: { observedAt?: string; error?: string | null }; shipment?: { carrier?: string; tracking?: string }; events?: { at: string; description: string }[] }
export type ReportOrder = { id: number | string; reference: string; createdAt: string; status: string; paymentStatus?: string | null; subtotal: number; demoSeed?: string | null; customer: unknown; items: unknown; operations?: unknown }
export function report(orders: ReportOrder[], from: string, to: string) {
  const selected = orders.filter(o => {
    const date = ((o.operations as Ops | null)?.occurredAt || o.createdAt).slice(0, 10)
    return date >= from && date <= to
  })
  let paid = 0, refunded = 0, paidCount = 0
  const days: Record<string, { orders: number; paid: number }> = {}, statuses: Record<string, number> = {}, products: Record<string, number> = {}, customers = new Map<string, number>()
  for (const order of selected) {
    const ops = (order.operations || {}) as Ops
    const date = (ops.occurredAt || order.createdAt).slice(0, 10)
    const payment = Math.max(0, Number(ops.payment?.paid) || 0)
    const refund = Math.max(0, Number(ops.payment?.refunded) || 0)
    paid += payment; refunded += refund; if (payment > 0) paidCount++
    const day = days[date] ||= { orders: 0, paid: 0 }; day.orders++; day.paid += payment - refund
    const status = ops.fulfilment || order.status || 'unknown'; statuses[status] = (statuses[status] || 0) + 1
    const customer = order.customer as { email?: string } | null
    if (customer?.email) { const email = customer.email.trim().toLowerCase(); customers.set(email, (customers.get(email) || 0) + 1) }
    if (Array.isArray(order.items)) for (const item of order.items) if (item && typeof item.name === 'string') products[item.name] = (products[item.name] || 0) + (Number(item.quantity) || 0)
  }
  return { count: selected.length, paid, refunded, net: paid - refunded, average: paidCount ? Math.round((paid - refunded) / paidCount) : 0, paidCount, customers: customers.size, repeatCustomers: [...customers.values()].filter(n => n > 1).length, days: Object.entries(days).sort(([a], [b]) => a.localeCompare(b)), statuses: Object.entries(statuses).sort(), products: Object.entries(products).sort((a, b) => b[1] - a[1]).slice(0, 5) }
}
