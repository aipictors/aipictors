import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import text from "~/assets/terms.md?raw"
import enText from "~/assets/terms-en.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.TERMS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneWeek,
})

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
