import { products, media, type Product } from './cms'
import themeManifest from '../data/themes.json'
import blue from '../data/diode-blue.json'
import yellow from '../data/acid-yellow.json'
export type ThemeId = 'neutral' | 'blue' | 'yellow'
export const themes: ThemeId[] = ['neutral', 'blue', 'yellow']
export const themeFor = (value: unknown): ThemeId => {
  if (themes.includes(value as ThemeId)) {
    if (
      (value === 'blue' &&
        blue.color.hex !== themeManifest.themes.blue.sourceHex) ||
      (value === 'yellow' &&
        yellow.color.hex !== themeManifest.themes.yellow.sourceHex)
    ) {
      console.error(
        'Editorial validation: pinned palette mismatch; using neutral.',
      )
      return 'neutral'
    }
    return value as ThemeId
  }
  if (value)
    console.error(
      `Editorial validation: unknown theme ${String(value)}; using neutral.`,
    )
  return 'neutral'
}
export { canPurchase } from './purchase-policy'
export async function catalogue() {
  const items = await products()
  return items.sort(
    (a, b) =>
      (a.editorialOrder ?? 100) - (b.editorialOrder ?? 100) ||
      a.name.localeCompare(b.name),
  )
}
export const descriptor = (p: Product) => p.descriptor || p.shortDescription
export const art = (p: Product, wide = false) => {
  const supplied = media(p.gallery?.[0])
  if (supplied && !supplied.placeholder) return null
  const key = (
    {
      'pourframe-review': 'pourframe',
      'lighting-review': 'lighting',
      'macro-keypad-review': 'keypad',
      'thermal-printer-review': 'printer',
    } as Record<string, string>
  )[p.slug]
  return key
    ? `/images/${key}${wide && ['pourframe', 'lighting'].includes(key) ? '-wide' : ''}.webp`
    : null
}
