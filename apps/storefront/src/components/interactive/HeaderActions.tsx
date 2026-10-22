import { useState } from 'react'
import { useBag } from '@/lib/bag'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import BagView from './BagView'
export default function HeaderActions() {
  const { items } = useBag()
  const count = items.reduce((sum, s) => sum + s.quantity, 0)
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="header-actions">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="header-button"
            aria-label={`Open bag, ${count} items`}
          >
            Bag <span>({count})</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="bag-sheet">
          <SheetHeader>
            <SheetTitle>Your bag</SheetTitle>
            <SheetDescription>
              Objects you’re considering. Saved in this browser.
            </SheetDescription>
          </SheetHeader>
          <BagView compact />
          <a className="text-link" href="/cart">
            View full bag
          </a>
        </SheetContent>
      </Sheet>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="mobile-menu-button">
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent className="menu-sheet">
          <SheetHeader>
            <SheetTitle>Take a look.</SheetTitle>
            <SheetDescription>Explore form+field</SheetDescription>
          </SheetHeader>
          <nav aria-label="Mobile navigation">
            {[
              ['/', 'Home'],
              ['/shop', 'Objects'],
              ['/about', 'About'],
              ['/support', 'Support'],
              ['/cart', 'Bag'],
            ].map(([url, label]) => (
              <a key={url} href={url} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
