import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { EllipsisIcon } from "lucide-react"
import { useLocation } from "@remix-run/react"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"

type Props = {
  tag: string
}

export function TagActionOther (props: Props) {
  const location = useLocation()

  // センシティブページかどうかを判定
  const isSensitivePage = location.pathname.includes("/r/")

  // 適切なタグページURLを生成
  const generateTagUrl = (isSensitive: boolean) => {
    return isSensitive
      ? `/r/tags/${encodeURIComponent(props.tag)}`
      : `/tags/${encodeURIComponent(props.tag)}`
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"} variant="secondary">
          <EllipsisIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <SensitiveToggle
            variant="compact"
            targetUrl={generateTagUrl(!isSensitivePage)}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
