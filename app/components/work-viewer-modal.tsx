import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "~/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "~/lib/utils"
import type { FragmentOf } from "gql.tada"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  startIndex: number
  onClose: () => void
}

export function WorkViewerModal({ works, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex)
  const work = works[index]

  const prev = () => setIndex((i) => (i ? i - 1 : works.length - 1))
  const next = () => setIndex((i) => (i + 1) % works.length)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-[90vw] p-0">
        <div className="relative flex flex-1 items-center justify-center bg-black">
          <img
            src={work.largeThumbnailImageURL}
            alt={work.title}
            className="max-h-[90vh] max-w-full object-contain"
          />
          <Button
            onClick={prev}
            className="-translate-y-1/2 absolute top-1/2 left-2 rounded-full bg-white/20 p-2 backdrop-blur-md"
          >
            <ChevronLeft />
          </Button>
          <Button
            onClick={next}
            className="-translate-y-1/2 absolute top-1/2 right-2 rounded-full bg-white/20 p-2 backdrop-blur-md"
          >
            <ChevronRight />
          </Button>
          <Button
            onClick={onClose}
            className="absolute top-2 right-2 rounded-full bg-white/20 p-1 backdrop-blur-md"
          >
            <X />
          </Button>
        </div>

        <div className="hidden w-24 overflow-y-auto border-l md:block">
          {works.map((w, i) => (
            <Button
              key={w.id}
              onClick={() => setIndex(i)}
              className={cn(
                "mb-1 w-full p-1",
                i === index && "bg-primary/20 ring-2 ring-primary",
              )}
            >
              <img
                src={w.smallThumbnailImageURL}
                alt={w.title}
                className="h-20 w-full object-cover"
              />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
