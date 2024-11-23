import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { EllipsisIcon } from "lucide-react"
import { useNavigate } from "react-router";
import { useTranslation } from "~/hooks/use-translation" // 翻訳対応
import { SensitiveTagConfirmDialog } from "~/routes/($lang)._main.tags._index/components/sensitive-tag-confirm-dialog"

type Props = {
  tag: string
}

export function TagActionOther(props: Props) {
  const navigate = useNavigate()
  const t = useTranslation()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"} variant="secondary">
          <EllipsisIcon className="w-16" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="relative grid gap-4">
          <SensitiveTagConfirmDialog tag={props.tag} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
