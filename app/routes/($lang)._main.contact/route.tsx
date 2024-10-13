import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.CONTACT, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export default function Contact() {
  const t = useTranslation()

  return (
    <>
      <div className="w-full space-y-8 py-8">
        <h1 className="font-bold text-2xl">
          {t("お問い合わせ", "Contact Us")}
        </h1>
        <h2 className="font-bold text-md">
          {t("運営への問い合わせ", "Contact to the management")}
        </h2>
        <Link to="/support/chat">
          {t("チャットで問い合わせる", "Contact via Chat")}
        </Link>
        <h2 className="font-bold text-md">
          {t("法人に関するお問い合わせ", "Corporate Inquiries")}
        </h2>
        {"hello@aipictors.com"}
      </div>
    </>
  )
}
