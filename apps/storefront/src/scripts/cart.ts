export {}
const KEY = 'studio-cart-v1'
type Selection = { id: number; quantity: number }
let selections: Selection[] = []
let storageOK = true
try {
  const parsed = JSON.parse(localStorage.getItem(KEY) || '[]')
  if (Array.isArray(parsed))
    for (const s of parsed.slice(0, 100)) {
      if (
        Number.isSafeInteger(s?.id) &&
        s.id > 0 &&
        Number.isInteger(s.quantity) &&
        s.quantity > 0 &&
        s.quantity <= 99 &&
        !selections.some((v) => v.id === s.id)
      )
        selections.push({ id: s.id, quantity: s.quantity })
    }
} catch {
  storageOK = false
}
const count = () =>
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = `(${selections.reduce((sum, s) => sum + s.quantity, 0)})`
  })
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(selections))
    storageOK = true
  } catch {
    storageOK = false
  }
  count()
}
count()
document
  .querySelectorAll<HTMLFormElement>('[data-add-to-cart]')
  .forEach((form) =>
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      if (!form.reportValidity()) return
      const id = Number(form.dataset.id),
        quantity = Number(new FormData(form).get('quantity'))
      const status = form.querySelector<HTMLElement>('[data-add-status]')!
      const existing = selections.find((s) => s.id === id)
      if (existing && existing.quantity + quantity > 99) {
        status.textContent =
          'You can select up to 99 of each object. Adjust the quantity in your cart.'
        return
      }
      if (!existing && selections.length >= 100) {
        status.textContent =
          'Your cart holds up to 100 different objects. Remove an object before adding another.'
        return
      }
      if (existing)
        existing.quantity = Math.min(99, existing.quantity + quantity)
      else if (selections.length < 100) selections.push({ id, quantity })
      save()
      form.querySelector('[data-add-status]')!.textContent = storageOK
        ? 'Added to your cart.'
        : 'Added for this page. Browser storage is unavailable; selections cannot persist.'
    }),
  )
let generation = 0
let removedSelection: { selection: Selection; index: number } | undefined
const undoPanel = document.querySelector<HTMLElement>('[data-cart-undo]')
const undoButton =
  document.querySelector<HTMLButtonElement>('[data-undo-remove]')
undoButton?.addEventListener('click', () => {
  if (!removedSelection) return
  const { selection, index } = removedSelection
  if (
    !selections.some((item) => item.id === selection.id) &&
    selections.length < 100
  )
    selections.splice(index, 0, selection)
  removedSelection = undefined
  if (undoPanel) undoPanel.hidden = true
  save()
  void render(selection.id)
})
async function render(focusProduct?: number) {
  const root = document.querySelector<HTMLElement>('[data-cart-view]')
  if (!root) return
  const current = ++generation
  const status = root.querySelector<HTMLElement>('[data-cart-status]')!
  const lines = root.querySelector<HTMLElement>('[data-cart-lines]')!
  const summary = root.querySelector<HTMLElement>('[data-cart-summary]')!
  summary.hidden = true
  if (!selections.length) {
    lines.replaceChildren()
    status.textContent =
      'Your cart is empty. Explore the catalogue to find an object.'
    const a = document.createElement('a')
    a.href = '/shop'
    a.textContent = 'Browse objects ↗'
    status.append(' ', a)
    if (document.activeElement === document.body && removedSelection)
      undoButton?.focus()
    return
  }
  status.textContent = 'Refreshing prices and availability…'
  try {
    const res = await fetch('/api/cart', {
      signal: AbortSignal.timeout(10000),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selections),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    if (current !== generation) return
    const active = document.activeElement as HTMLElement | null
    const activeRow = active?.closest<HTMLElement>('[data-cart-id]')
    const focusId =
      focusProduct ?? (activeRow ? Number(activeRow.dataset.cartId) : undefined)
    const focusAction = active?.matches('[data-item-remove]')
      ? '[data-item-remove]'
      : '[data-item-quantity]'
    lines.replaceChildren()
    for (const item of data.lines) {
      const template = document.querySelector<HTMLTemplateElement>(
        '#cart-item-template',
      )!
      const fragment = template.content.cloneNode(true) as DocumentFragment
      const row = fragment.querySelector<HTMLElement>('article')!
      row.dataset.cartId = String(item.id)
      const title = row.querySelector<HTMLElement>('[data-item-title]')!
      title.textContent = item.name
      const link = row.querySelector<HTMLAnchorElement>('[data-item-link]')!
      if (item.url) {
        link.href = item.url
        link.setAttribute('aria-label', `View ${item.name}`)
      }
      const img = row.querySelector<HTMLImageElement>('img')!
      if (item.image?.url) {
        img.src = item.image.url
        img.alt = item.image.alt
      } else img.hidden = true
      row.querySelector('[data-item-availability]')!.textContent =
        item.purchasable
          ? 'Available'
          : `${item.availability || 'No longer available'} · excluded from subtotal`
      row.querySelector('[data-item-price]')!.textContent = item.unitPrice
        ? `${item.unitPrice} each`
        : ''
      row.querySelector('[data-item-total]')!.textContent = item.purchasable
        ? item.lineTotal
        : '—'
      const input = row.querySelector<HTMLInputElement>('input')!
      input.value = String(item.quantity)
      input.setAttribute('aria-label', `Quantity for ${item.name}`)
      const remove = row.querySelector<HTMLButtonElement>('button')!
      remove.setAttribute('aria-label', `Remove ${item.name}`)
      if (root.hasAttribute('data-preview')) {
        row.querySelector('[data-quantity-label]')!.textContent =
          `Quantity: ${item.quantity}`
        remove.remove()
      } else {
        input.addEventListener('change', () => {
          if (!input.reportValidity()) return
          selections = selections.map((s) =>
            s.id === item.id ? { id: s.id, quantity: Number(input.value) } : s,
          )
          save()
          void render()
        })
        remove.addEventListener('click', () => {
          const index = selections.findIndex((s) => s.id === item.id)
          removedSelection = { selection: { ...selections[index] }, index }
          if (undoPanel) {
            undoPanel.hidden = false
            undoPanel.querySelector('[data-undo-message]')!.textContent =
              `${item.name} removed from your cart.`
            undoButton?.focus()
          }
          selections = selections.filter((s) => s.id !== item.id)
          save()
          void render()
        })
      }
      lines.append(fragment)
    }
    if (
      focusId !== undefined &&
      (!document.activeElement || document.activeElement === document.body)
    ) {
      lines
        .querySelector<HTMLElement>(
          `[data-cart-id="${focusId}"] ${focusAction}`,
        )
        ?.focus()
    }
    root.querySelector('[data-subtotal]')!.textContent = data.subtotal
    summary.hidden = !data.lines.some(
      (s: { purchasable: boolean }) => s.purchasable,
    )
    status.textContent = storageOK
      ? `Cart refreshed. Subtotal ${data.subtotal}.`
      : 'Browser storage is unavailable. Changes may not survive refresh.'
  } catch (e) {
    if (current !== generation) return
    lines.replaceChildren()
    status.textContent =
      'Could not refresh your cart. Check that the CMS is running, then retry. Your saved selections have been kept.'
    const retry = document.createElement('button')
    retry.textContent = 'Retry'
    retry.type = 'button'
    retry.addEventListener('click', () => void render())
    status.append(' ', retry)
  }
}
void render()
window.addEventListener('storage', (e) => {
  if (e.key === KEY) location.reload()
})
