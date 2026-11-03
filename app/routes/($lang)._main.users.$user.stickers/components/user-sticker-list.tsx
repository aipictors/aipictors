import type { SerializeFrom } from "@remix-run/cloudflare"
import { useTranslation } from "~/hooks/use-translation"
import { StickerListSection } from "~/routes/($lang)._main.stickers._index/components/sticker-list-section"
import type { loadUserStickers } from "~/routes/($lang)._main.users.$user.stickers/utils/load-user-stickers"

type Props = {
  data: SerializeFrom<Awaited<ReturnType<typeof loadUserStickers>>>
}

export function UserStickerList(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex min-h-96 w-full flex-col">
      <StickerListSection
        stickers={props.data.stickers}
        count={props.data.stickersCount}
        sort={props.data.sort}
        page={props.data.page}
        emptyMessage={t(
          "公開しているスタンプはありません",
          "No public stickers",
        )}
      />
    </div>
  )
}
