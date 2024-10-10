import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Share2 } from "lucide-react"
import { CopyWorkUrlButton } from "~/routes/($lang)._main.posts.$post._index/components/work-action-copy-url"
import { XIntent } from "~/routes/($lang)._main.posts.$post._index/components/work-action-share-x"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  login: string
  name: string
}

export function UserActionShare(props: Props) {
  const t = useTranslation()

  const currentUrl = `${"https://www.aipictors.com/users/"}${props.login}`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"} variant="secondary">
          <Share2 className="w-16" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              {t("マイページを共有する", "Share My Page")}
            </h4>
          </div>
          <div className="grid gap-2">
            <CopyWorkUrlButton currentUrl={currentUrl} />
            <XIntent
              text={`${t("AIイラスト投稿サイトAipictors", "AI Illustration Posting Site Aipictors")} ${props.name}${t("のマイページ", "'s My Page")}\n`}
              url={`${currentUrl}\n`}
              hashtags={["Aipictors", "AIIllust"]}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
