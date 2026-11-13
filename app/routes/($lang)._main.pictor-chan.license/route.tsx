import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  PICTOR_CHAN_CREDIT,
  PICTOR_CHAN_LICENSE_DATE,
  PICTOR_CHAN_LICENSE_EN,
  PICTOR_CHAN_LICENSE_JA,
} from "~/lib/pictor-chan/pictor-chan-license"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  const t = useTranslation()
  return createMeta(
    {
      title: t(
        "ぴくたーちゃんライセンス - 3Dモデルの利用条件",
        "Pictor-chan License - Terms for the 3D model",
      ),
      description: t(
        "Aipictorsの公式マスコット「ぴくたーちゃん」の3Dモデルを、個人・法人、商用・非商用を問わず無償で使える「ぴくたーちゃんライセンス」の全文です。",
        "The full text of the Pictor-chan License, which lets individuals and companies use the 3D model of Aipictors' official mascot Pictor-chan free of charge, commercially or not.",
      ),
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneWeek,
})

/**
 * ぴくたーちゃんライセンス（3D モデルなどの利用条件）
 */
export default function PictorChanLicense() {
  const t = useTranslation()
  const isJa = t("ja", "en") === "ja"
  // 日本語が正文。英語のページでは参考訳を先に出し、正文も続けて載せる
  const texts = isJa
    ? [PICTOR_CHAN_LICENSE_JA]
    : [PICTOR_CHAN_LICENSE_EN, PICTOR_CHAN_LICENSE_JA]

  return (
    <div className="container mx-auto max-w-3xl space-y-8 py-8">
      <nav className="text-muted-foreground text-sm">
        <Link to="/pictor-chan" className="underline">
          {t("ぴくたーちゃん", "Pictor-chan")}
        </Link>
        <span className="mx-2">/</span>
        {t("ライセンス", "License")}
      </nav>

      <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
        <p className="font-bold">{t("かんたんに言うと", "In short")}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            {t(
              "個人でも会社でも、商用でも、無料で使えます。申請はいりません。",
              "Free for individuals and companies, including commercial use. No application needed.",
            )}
          </li>
          <li>
            {t(
              `「${PICTOR_CHAN_CREDIT}」と表記してください。`,
              `Please show the credit "${PICTOR_CHAN_CREDIT}".`,
            )}
          </li>
          <li>
            {t(
              "性的に露骨な表現・過度に暴力的な表現・誹謗中傷・政治や宗教の活動などには使えません。",
              "Not for sexually explicit or excessively violent content, defamation, or political or religious activity.",
            )}
          </li>
          <li>
            {t(
              "モデルそのものを単体で売ることはできません（改変して本ライセンス付きで配布するのは OK）。",
              "You may not sell the model itself as a stand-alone product (redistributing modified versions under this License is fine).",
            )}
          </li>
        </ul>
      </div>

      {texts.map((text) => (
        <article key={text.name} className="space-y-6">
          <h1 className="font-bold text-2xl">{text.name}</h1>
          {text.lead.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed">
              {paragraph}
            </p>
          ))}
          {text.sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="font-bold text-lg">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
      ))}

      <p className="text-muted-foreground text-sm">
        {PICTOR_CHAN_LICENSE_DATE}
        <br />
        {t("Aipictors株式会社", "Aipictors Inc.")}
      </p>
    </div>
  )
}
