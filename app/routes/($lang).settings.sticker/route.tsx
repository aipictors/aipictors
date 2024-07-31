import { MyStickersList } from "~/routes/($lang).settings.sticker/components/my-stickers-list"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"

export default function SettingSticker() {
  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={"スタンプ一覧"} />
      </div>
      <div className="space-y-4">
        <MyStickersList />
      </div>
    </div>
  )
}
