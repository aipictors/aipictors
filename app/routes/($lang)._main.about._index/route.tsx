import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.ABOUT, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

/**
 * サイトについて
 */
export default function About() {
  const t = useTranslation()

  return (
    <>
      <div className="flex flex-col">
        <h1 className="font-bold text-2xl">
          {t("本サイトについて", "About This Site")}
        </h1>
        <h2 className="py-2 font-bold text-md">
          {t("当サービスについて", "About Aipictors")}
        </h2>
        <p>
          {t(
            "当サービスはAIで生成されたイラストのコンテンツをテーマにコミュニケーション、創作活動するプラットフォームです。",
            "This service is a platform for communication and creative activities themed around AI-generated illustration content.",
          )}
        </p>
        <h2 className="py-2 font-bold text-md">
          {t("運営会社について", "About the Operating Company")}
        </h2>
        <p>
          {t(
            "Aipictors株式会社が運営しております。お問い合わせは hello@aipictors.com からお願い致します。",
            "Operated by Aipictors Inc. For inquiries, please contact hello@aipictors.com.",
          )}
        </p>
        <h2 className="py-2 font-bold text-md">
          {t("お問い合わせ先", "Contact Information")}
        </h2>
        <Link to="/contact">{t("こちら", "here")}</Link>
        <h2 className="py-2 font-bold text-md">
          {t("プライバシーポリシー", "Privacy Policy")}
        </h2>
        <Link to="/privacy">
          {t(
            "個人情報の利用目的などについて",
            "For purposes of personal information usage, etc.",
          )}
        </Link>
        <h2 className="py-2 font-bold text-md">
          {t("利用規約", "Terms of Service")}
        </h2>
        <p>
          {t(
            "サービスのご利用にあたっては",
            "For using the service, please refer to",
          )}
          <Link to="/terms">{t("こちら", "here")}</Link>
          {t("をご参照ください", ".")}
        </p>
        <h2 className="py-2 font-bold text-md">
          {t("ガイドライン", "Guidelines")}
        </h2>
        <p>
          {t("機能の使い方は", "For how to use the features, please refer to")}
          <Link to="/guideline">{t("こちら", "here")}</Link>
          {t("をご参照ください", ".")}
        </p>
        <h2 className="py-2 font-bold text-md">{t("ロゴ", "Logo")}</h2>
        <p>
          {t(
            "当サービスのロゴをご利用の方は",
            "For those using our service's logo, please refer to",
          )}
          <Link to="https://www.aipictors.com/presskit/">
            {t("こちら", "here")}
          </Link>
          {t("をご参照ください", ".")}
        </p>
      </div>
    </>
  )
}
