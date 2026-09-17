import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import text from "~/assets/r18-terms.md?raw"
import enText from "~/assets/r18-terms-en.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/metadata"

export const meta: MetaFunction = ({ data }) => {
  return createMeta(META.R18_TERMS, data?.meta)
}

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": config.cacheControl.short,
  }
}

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { lang } = context

  return {
    meta: {
      title: lang === "en" ? "R18 Content Terms" : "R18コンテンツ利用規約",
      description:
        lang === "en"
          ? "Additional rules for posting and publishing R18/R18G content on Aipictors"
          : "AipictorsでR18/R18Gコンテンツを投稿・公開する際の追加ルール",
    },
  }
}

export default function R18TermsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("R18コンテンツ利用規約", "R18 Content Terms")}</CardTitle>
          <p className="text-muted-foreground text-sm">
            {t(
              "このページは、R18 / R18G作品の投稿・公開時に適用される追加ルールです。",
              "This page contains additional rules for posting and publishing R18 / R18G works.",
            )}
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <AppMarkdown>{t(text, enText)}</AppMarkdown>
        </CardContent>
      </Card>
    </div>
  )
}
