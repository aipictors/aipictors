import { SmileIcon } from "lucide-react"
import { lazy, Suspense, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

const EmojiPickerInner = lazy(() =>
  import("~/components/emoji-picker-inner").then((m) => ({
    default: m.EmojiPickerInner,
  })),
)

type Props = {
  onSelect(emoji: string): void
  disabled?: boolean
}

export function EmojiPickerPopover(props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={props.disabled}
          variant="secondary"
          size="icon"
          type="button"
        >
          <SmileIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-none p-0 shadow-xl"
        side="top"
        align="end"
      >
        <Suspense
          fallback={
            <div className="flex size-[352px] items-center justify-center">
              <SmileIcon className="size-8 animate-pulse text-muted-foreground" />
            </div>
          }
        >
          <EmojiPickerInner
            onSelect={(emoji) => {
              props.onSelect(emoji)
              setIsOpen(false)
            }}
          />
        </Suspense>
      </PopoverContent>
    </Popover>
  )
}
