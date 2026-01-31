import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { EllipsisIcon, RefreshCcwIcon } from "lucide-react"
import { useNavigate, useLocation } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation" // 翻訳対応

type Props = {
  tag: string
}

export function SensitiveTagActionOther (props: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const t = useTranslation()

  // センシティブページかどうかを判定
  const isSensitivePage = location.pathname.includes("/r/")

  // 適切なタグページURLを生成
  const generateTagUrl = () => {
    return isSensitivePage
      ? `/tags/${encodeURIComponent(props.tag)}`
      : `/r/tags/${encodeURIComponent(props.tag)}`
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"} variant="secondary">
          <EllipsisIcon className="w-16" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="relative grid gap-4">
          <Button
            onClick={() => {
              navigate(generateTagUrl())
            }}
            variant={"secondary"}
            className="flex w-full transform cursor-pointer items-center"
          >
            <RefreshCcwIcon className="mr-1 w-3" />
            <p className="text-sm">{t("対象年齢", "Age Restriction")}</p>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
