import { AppPage } from "@/_components/app/app-page"

/**
 * ダウンロードしたスタンプの一覧
 */
export default function Sticker() {
  return (
    <AppPage>
      <div className="flex w-full max-w-lg flex-col space-y-8 p-4">
        <p className="font-bold text-2xl">{"DL済みスタンプ"}</p>
      </div>
    </AppPage>
  )
}
