import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLocation } from "@remix-run/react"
import { lazy, Suspense, useEffect } from "react"
import { ClientOnly } from "remix-utils/client-only"
import { OSHI_DISPLAY_SETTING_PATH } from "~/components/hide-coin-support-button"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { useNavigate } from "~/lib/app/locale-router"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { createMeta } from "~/utils/create-meta"

const SupportReceivedSummaryPage = lazy(async () => {
  const mod = await import(
    "~/routes/($lang).settings.support-received/components/support-received-summary-page"
  )
  return { default: mod.SupportReceivedSummaryPage }
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_SUPPORT, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function SettingSupportReceived() {
  const t = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  // 推しの表示は独立したページに移した。以前の案内（#hide-coin-support）で来た人はそちらへ送る
  // （# はサーバーに届かないのでブラウザで判定する）
  useEffect(() => {
    if (location.hash !== "#hide-coin-support") return
    navigate(OSHI_DISPLAY_SETTING_PATH, { replace: true })
  }, [location.hash, navigate])

  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={t("応援コイン受け取り", "Received support coins")} />
      </div>
      <ClientOnly
        fallback={
          <div className="space-y-4">
            <div className="rounded-xl border p-5 text-sm text-muted-foreground">
              {t("読み込み中...", "Loading...")}
            </div>
          </div>
        }
      >
        {() => (
          <Suspense
            fallback={
              <div className="rounded-xl border p-5 text-sm text-muted-foreground">
                {t("読み込み中...", "Loading...")}
              </div>
            }
          >
            <SupportReceivedSummaryPage />
          </Suspense>
        )}
      </ClientOnly>
    </div>
  )
}