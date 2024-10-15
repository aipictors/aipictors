import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { AppPageHeader } from "~/components/app/app-page-header"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { PlusForm } from "~/routes/($lang)._main.plus._index/components/plus-form"
import { PlusNoteList } from "~/routes/($lang)._main.plus._index/components/plus-note-list"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.PLUS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.short,
})

/**
 * サブスク
 */
export default function Plus() {
  const t = useTranslation()

  return (
    <>
      <AppPageHeader
        title={t("Aipictors +", "Aipictors +")}
        description={t(
          "Aipictors+に加入してサービス内で特典を受けることができます。",
          "Join Aipictors+ to enjoy benefits within the service.",
        )}
      />
      <PlusForm />
      <div>
        <p>
          {t(
            "この度はAipictorsをご利用いただき、誠にありがとうございます。",
            "Thank you for using Aipictors.",
          )}
        </p>
      </div>
      <div className="space-y-2">
        <p className="font-bold text-lg">{t("注意事項", "Important Notes")}</p>
        <PlusNoteList />
      </div>
    </>
  )
}
