import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import policyMarkdownText from "~/assets/fan-works-policy.md?raw"
import policyMarkdownEnText from "~/assets/fan-works-policy-en.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import { LegalPageNav } from "~/components/legal-page-nav"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.FAN_WORKS_POLICY, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

/**
 * 二次創作と収益化についての運営の考え方（否定・禁止はしない・お金が動くのはオリジナル作品だけ・権利者のガイドラインの確認は投稿者の責任）
 */
export default function FanWorksPolicyPage() {
  const t = useTranslation()

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="space-y-3">
        <h1 className="font-bold text-3xl tracking-tight">
          {t(
            "二次創作と収益化についての運営の考え方",
            "Fan works and earnings: our position",
          )}
        </h1>
        <p className="text-muted-foreground leading-7">
          {t(
            "二次創作の投稿や、推し・クリエイター報酬との関係について、運営の立場をまとめています。",
            "How Aipictors treats fan works, and how they relate to support and Creator Rewards.",
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("要点", "In short")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-7">
          <p>
            {t(
              "・二次創作を否定しません。投稿を一律に禁止することもありません。",
              "- We do not reject fan works, and do not ban them across the board.",
            )}
          </p>
          <p>
            {t(
              "・権利者さんと作者さんへの配慮として、お金が動くのはオリジナル作品だけです。作品ページからのプレミアムコインでの推しとクリエイター報酬は、「オリジナル」などのタグが付いた作品が対象です。プロフィールからの推し（作者への推し）はプレミアムコインでもできます。フリーコインの推しは、どの作品にも送れます。",
              '- Out of consideration for rights holders and creators, money only moves for original works. Premium Coin support from work pages and Creator Rewards apply to works tagged "Original" or similar. Support from a profile (to the creator) can also use Premium Coins. Free Coin support can go to any work.',
            )}
          </p>
          <p>
            {t(
              "・二次創作をしてよいかは権利者が決めます。ガイドラインを確認して従うのは投稿者の責任です。",
              "- Rights holders decide whether fan works are allowed. Checking and following their guidelines is the poster's responsibility.",
            )}
          </p>
          <p>
            {t(
              "・推しを使うことや、特定の考え方への同調を求めることはありません。苦手なものは設定で表示しないようにできます。",
              "- You are never expected to use Oshi or to share any view. You can hide what you don't want to see in settings.",
            )}
          </p>
        </CardContent>
      </Card>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <AppMarkdown isDemotedHeading>
          {t(policyMarkdownText, policyMarkdownEnText)}
        </AppMarkdown>
      </div>

      <LegalPageNav currentPath="/fan-works-policy" />
    </div>
  )
}
