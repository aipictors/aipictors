import { MyStickersList } from "@/routes/($lang).settings.sticker/components/my-stickers-list"

export default function SettingSticker() {
  return (
    <div className="w-full space-y-8">
      <h1 className="font-bold text-2xl">{"スタンプ一覧"}</h1>
      <p>{"スタンプを管理できます。"}</p>
      <div className="space-y-4">
        <MyStickersList />
      </div>
    </div>
  )
}
