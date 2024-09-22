import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import text from "~/assets/terms.md?raw"
import enText from "~/assets/terms-en.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import { META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.TERMS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  return {}
}

export default function Terms() {
  const t = useTranslation()

  return (
    <>
      <div className="w-full space-y-8 py-8">
        <h1 className="font-bold text-2xl">
          {t("利用規約", "Terms of Service")}
        </h1>
        <AppMarkdown>{t(text, enText)}</AppMarkdown>
      </div>
    </>
  )
}
