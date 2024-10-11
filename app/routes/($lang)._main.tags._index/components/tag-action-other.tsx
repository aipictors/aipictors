import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { EllipsisIcon, RefreshCcwIcon } from "lucide-react"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { useNavigate } from "react-router"
import { useTranslation } from "~/hooks/use-translation" // 翻訳対応

type Props = {
  isSensitive: boolean
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
          {!props.isSensitive ? (
            <AppConfirmDialog
              title={t("確認", "Confirmation")}
              description={t(
                "センシティブな作品を表示します、あなたは18歳以上ですか？",
                "Sensitive content will be displayed. Are you 18 or older?",
              )}
              onNext={() => {
                navigate(`/r/tags/${props.tag}`)
              }}
              cookieKey={"check-sensitive-ranking"}
              onCancel={() => {}}
            >
              <Button
                variant={"secondary"}
                className="flex w-full transform cursor-pointer items-center"
              >
                <RefreshCcwIcon className="mr-1 w-3" />
                <p className="text-sm">{t("対象年齢", "Age Restriction")}</p>
              </Button>
            </AppConfirmDialog>
          ) : (
            <Button
              onClick={() => {
                navigate(`/tags/${props.tag}`)
              }}
              variant={"secondary"}
              className="flex w-full transform cursor-pointer items-center"
            >
              <RefreshCcwIcon className="mr-1 w-3" />
              <p className="text-sm">{t("対象年齢", "Age Restriction")}</p>
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
