import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Suspense } from "react"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { MyStickersList } from "~/routes/($lang).settings.sticker/components/my-stickers-list"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_STICKERS, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export default function SettingSticker() {
  const t = useTranslation()

  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={t("スタンプ一覧", "Stickers")} />
      </div>
      <div className="space-y-4">
        <Suspense
          fallback={
            <div className="flex min-h-96 items-center justify-center">
              <div className="text-sm text-gray-500">
                {t("読み込み中...", "Loading...")}
              </div>
            </div>
          }
        >
          <MyStickersList />
        </Suspense>
      </div>
    </div>
  )
}
