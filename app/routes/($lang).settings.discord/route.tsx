import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { DiscordLinkPage } from "~/routes/($lang).settings.discord/components/discord-link-page"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_DISCORD, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function SettingsDiscordPage() {
  const t = useTranslation()

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={t("Discord 連携", "Discord")} />
      </div>
      <h1 className="hidden font-bold text-2xl md:block">
        {t("Discord 連携", "Discord")}
      </h1>
      <DiscordLinkPage />
    </div>
  )
}
