import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { lazy, Suspense } from "react"
import { ClientOnly } from "remix-utils/client-only"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
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