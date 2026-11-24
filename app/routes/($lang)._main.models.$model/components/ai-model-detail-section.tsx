import { ExternalLinkIcon, InfoIcon, LightbulbIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import type { ModelDetail } from "~/lib/model-details/model-detail"

type Props = {
  /** 見出しに出すモデル名 */
  name: string
  detail: ModelDetail
}

/**
 * 生成機のモデルの紹介（どんな絵が得意か・作者・ベースモデル・ライセンス・推奨設定と出典）
 */
export function AiModelDetailSection(props: Props) {
  const t = useTranslation()

  const text = t.isEnglish ? props.detail.en : props.detail.ja

  const rows = [
    { label: t("作者", "Creator"), value: props.detail.creator },
    { label: t("ベースモデル", "Base model"), value: props.detail.baseModel },
    { label: t("バージョン", "Version"), value: props.detail.versionName },
    { label: t("公開日", "Published"), value: props.detail.publishedAt },
    { label: t("ライセンス", "License"), value: props.detail.license },
  ].filter(
    (row): row is { label: string; value: string } =>
      typeof row.value === "string" && row.value.trim().length > 0,
  )

  const links = [
    ...(props.detail.source.url
      ? [{ label: props.detail.source.label, url: props.detail.source.url }]
      : []),
    ...props.detail.links,
  ]

  return (
    <section className="flex flex-col gap-4 rounded-2xl border p-4 md:p-5">
      <h2 className="flex items-center gap-1.5 font-bold text-base md:text-lg">
        <InfoIcon className="size-5 text-muted-foreground" />
        {t(`${props.name}について`, `About ${props.name}`)}
      </h2>
      {text.summary.length > 0 && (
        <p className="whitespace-pre-line text-sm leading-relaxed">
          {text.summary}
        </p>
      )}
      {text.features.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-sm">{t("特徴", "Highlights")}</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
            {text.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
      {text.tips.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-xl bg-muted/50 p-3">
          <h3 className="flex items-center gap-1 font-bold text-sm">
            <LightbulbIcon className="size-4 text-amber-500" />
            {t("使い方のコツ・推奨設定", "Tips & recommended settings")}
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
            {text.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
      {props.detail.triggerWords.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-sm">
            {t("トリガーワード", "Trigger words")}
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {props.detail.triggerWords.map((word) => (
              <li key={word}>
                <code className="rounded-md border bg-muted px-2 py-0.5 text-xs">
                  {word}
                </code>
              </li>
            ))}
          </ul>
        </div>
      )}
      {rows.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="break-all">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {links.length > 0 && (
        <div className="flex flex-col gap-1 border-t pt-3">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
                >
                  {t(`${link.label}で見る`, `View on ${link.label}`)}
                  <ExternalLinkIcon className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
          {props.detail.source.kind !== "aipictors" && (
            <p className="text-muted-foreground text-xs">
              {t(
                `紹介文は${props.detail.source.label}などで公開されている情報をもとに、Aipictors がまとめたものです。利用条件は配布元のライセンスをご確認ください。`,
                `Summarized by Aipictors from information published on ${props.detail.source.label} and other sources. Check the original license for terms of use.`,
              )}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
