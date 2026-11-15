import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import termsMarkdownText from "~/assets/creator-rewards-terms.md?raw"
import termsMarkdownEnText from "~/assets/creator-rewards-terms-en.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.CREATOR_REWARDS_TERMS, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export default function CreatorRewardsTermsPage() {
  const t = useTranslation()
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <AppMarkdown>{t(termsMarkdownText, termsMarkdownEnText)}</AppMarkdown>
    </div>
  )
}
