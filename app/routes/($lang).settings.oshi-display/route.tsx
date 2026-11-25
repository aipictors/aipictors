import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { HandCoins } from "lucide-react"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { HideCoinSupportSetting } from "~/routes/($lang).settings/components/hide-coin-support-setting"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_OSHI_DISPLAY, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

/**
 * 推しの表示（推し・推しランキングを自分の画面に出さない設定）
 * 以前は「応援コイン受け取り」の中にあり見つけにくかったので、独立したページにした
 */
export default function SettingOshiDisplay() {
  const t = useTranslation()

  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={t("推しの表示", "Oshi display")} />
      </div>
      <HideCoinSupportSetting id="hide-coin-support" />
      <p className="flex items-center gap-1.5 px-1 text-muted-foreground text-xs">
        <HandCoins className="size-3.5 shrink-0" aria-hidden />
        <span>
          {t(
            "推しを受け付けるかどうかは",
            "Whether you accept Oshi is set in",
          )}{" "}
          <Link
            to="/settings/support-received#receive-setting"
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("応援コイン受け取り", "Received Support Coins")}
          </Link>
          {t(" で設定します", "")}
        </span>
      </p>
    </div>
  )
}
