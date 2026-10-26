import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { ClientOnly } from "remix-utils/client-only"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { MyUserModels } from "~/routes/($lang).settings.models/components/my-user-models"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_USER_MODELS, undefined, props.params.lang)
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export default function SettingUserModels() {
  const t = useTranslation()

  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={t("自分のモデル", "My models")} />
      </div>
      <div className="hidden space-y-1 md:block">
        <h1 className="font-bold text-xl">{t("自分のモデル", "My models")}</h1>
        <p className="text-muted-foreground text-sm">
          アップロードした LoRA・チェックポイントの管理。公開中のモデルは
          <Link to="/models" className="mx-1 underline">
            みんなのモデル
          </Link>
          に表示されます。
        </p>
      </div>
      <ClientOnly fallback={<div className="min-h-64" />}>
        {() => <MyUserModels />}
      </ClientOnly>
    </div>
  )
}
