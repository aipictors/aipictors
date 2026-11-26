import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import termsMarkdownText from "~/assets/image-generation-terms.md?raw"
import termsMarkdownEnText from "~/assets/image-generation-terms-en.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import { LegalPageNav, LegalPageSummary } from "~/components/legal-page-nav"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.GENERATION_TERMS, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMonth,
})

/**
 * 画像生成機能の利用規約
 */
export default function GenerationTerms() {
  const t = useTranslation()

  return (
    <>
      <div className="w-full space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/generation">
                {t("生成トップ", "Top")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/generation/about">
                {t("生成機能について", "About Image Generation")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/generation/terms">
                {t("利用規約", "Terms of Service")}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="font-bold text-2xl">
          {t("利用規約", "Terms of Service")}
        </h1>
        <LegalPageSummary path="/generation/terms" />
        <AppMarkdown>{t(termsMarkdownText, termsMarkdownEnText)}</AppMarkdown>
        <LegalPageNav currentPath="/generation/terms" />
      </div>
    </>
  )
}
