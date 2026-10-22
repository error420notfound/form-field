import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
type Image = { src: string; alt: string; placeholder?: boolean }
export default function Gallery({
  images,
  name,
}: {
  images: Image[]
  name: string
}) {
  const [index, setIndex] = useState(0)
  if (!images.length) return <p>Product imagery to follow.</p>
  const current = images[index]
  const move = (delta: number) =>
    setIndex((i) => (i + delta + images.length) % images.length)
  return (
    <div className="gallery">
      <Dialog>
        <DialogTrigger
          className="gallery-trigger"
          aria-label={`Expand image of ${name}`}
        >
          <img
            src={current.src}
            alt={current.alt}
            width="1536"
            height="1024"
            fetchPriority="high"
          />
          <span className="gallery-hint">View image</span>
        </DialogTrigger>
        <DialogContent
          className="gallery-dialog"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') move(1)
            if (e.key === 'ArrowLeft') move(-1)
          }}
        >
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
            <DialogDescription>
              {current.placeholder
                ? 'Illustrative placeholder. This is not an actual product design.'
                : current.alt}
            </DialogDescription>
          </DialogHeader>
          <img src={current.src} alt={current.alt} width="1536" height="1024" />
          {images.length > 1 && (
            <div className="gallery-navigation">
              <Button variant="outline" onClick={() => move(-1)}>
                Previous image
              </Button>
              <span role="status">
                {index + 1} / {images.length}
              </span>
              <Button variant="outline" onClick={() => move(1)}>
                Next image
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {current.placeholder && (
        <p className="media-caption">
          Illustrative placeholder · Not an actual product design
        </p>
      )}
      {images.length > 1 && (
        <div className="thumbnails">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              aria-label={`View image ${i + 1}`}
              aria-pressed={index === i}
              onClick={() => setIndex(i)}
            >
              <img src={image.src} alt="" width="80" height="60" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
