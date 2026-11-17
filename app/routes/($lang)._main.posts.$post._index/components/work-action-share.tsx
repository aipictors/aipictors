import { Share2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { useTranslation } from "~/hooks/use-translation"
import { CopyWorkUrlButton } from "./work-action-copy-url"
import { NoteIntent } from "./work-action-share-note"
import { PinterestIntent } from "./work-action-share-pinterest"
import { XIntent } from "./work-action-share-x"

type Props = {
  title: string
  description: string
  isDisabledShare?: boolean
  id: string
  accessType?: string
  uuid?: string | null
  imageUrl?: string
  isSensitive?: boolean
}

export function SharePopover(props: Props) {
  const t = useTranslation()

  const postPath =
    props.accessType === "LIMITED" && props.uuid ? props.uuid : props.id

  const currentUrl = `https://www.aipictors.com/posts/${postPath}`

  const shareText = t(
    `AIイラスト投稿サイトAipictorsに投稿された作品\n「${props.title}」\n\n${props.description}`,
    `Work posted on AI Illustration Posting Site Aipictors\n"${props.title}"\n\n${props.description}`,
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          aria-label={t("共有", "Share")}
        >
          <Share2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              {t("作品を共有する", "Share work")}
            </h4>
          </div>
          <div className="grid gap-2">
            {/* Copy URL Button */}
            <CopyWorkUrlButton currentUrl={currentUrl} />

            {/* X (旧Twitter) Share Intent */}
            <XIntent
              text={shareText}
              url={currentUrl}
              hashtags={["Aipictors", t("AIイラスト", "AIIllust")]}
            />

            {/* note・Pinterest は成人向けの内容を禁止しているので、センシティブな作品では出さない */}
            {!props.isSensitive && (
              <>
                <NoteIntent url={currentUrl} />
                <PinterestIntent
                  url={currentUrl}
                  imageUrl={props.imageUrl}
                  description={`${props.title} | Aipictors`}
                />
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
