import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  InfoIcon,
  LightbulbIcon,
  WandSparklesIcon,
} from "lucide-react"
import { useState } from "react"
import { Badge } from "~/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import type { LoraDetail } from "~/lib/lora-details/lora-detail"
import { officialLoraFamily } from "~/lib/user-models/lora-compat"

export type OfficialLoraSummary = {
  name: string
  displayName: string
  enDisplayName: string
  imageUrl: string | null
  genre: string | null
}

type Props = {
  /** 生成機の公式 LoRA（DB の一覧にあるもの） */
  lora: {
    name: string
    description: string
    thumbnailImageURL: string | null
    genre: string | null
  } | null
  /** Civitai の情報をもとにした紹介。無い LoRA もある */
  detail: LoraDetail | null
  related: OfficialLoraSummary[]
}

const formatWeight = (value: number) =>
  Number.isInteger(value) ? value.toFixed(1) : String(value)

/**
 * 公式 LoRA のページ（作例・紹介・トリガーワード・推奨の強さ・生成ボタン）
 */
export function OfficialLoraArticle(props: Props) {
  const t = useTranslation()

  const name = props.detail?.name ?? props.lora?.name ?? ""
  const text = props.detail
    ? t.isEnglish
      ? props.detail.en
      : props.detail.ja
    : null
  const title = text?.displayName ?? name
  const description = text?.description ?? props.lora?.description ?? ""
  const family = officialLoraFamily(name)
  const familyLabel = family === "SDXL" ? "SDXL" : "SD1.5"

  const images =
    props.detail && props.detail.images.length > 0
      ? props.detail.images
      : props.lora?.thumbnailImageURL
        ? [props.lora.thumbnailImageURL]
        : []

  const weight = props.detail?.weight.recommended ?? 1
  const loraTag = `<lora:${name}:${formatWeight(weight)}>`
  const triggerWords = props.detail?.triggerWords ?? []
  const promptExample = [loraTag, ...triggerWords].join(", ")

  const [isCopied, setIsCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptExample)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    } catch {
      // コピーできない環境では何もしない
    }
  }

  const rows = props.detail
    ? [
        { label: t("作者", "Creator"), value: props.detail.creator },
        {
          label: t("ベースモデル", "Base model"),
          value: props.detail.baseModel,
        },
        { label: t("バージョン", "Version"), value: props.detail.versionName },
        { label: t("公開日", "Published"), value: props.detail.publishedAt },
        { label: t("利用条件", "License"), value: text?.license },
      ].filter(
        (row): row is { label: string; value: string } =>
          typeof row.value === "string" && row.value.trim().length > 0,
      )
    : []

  const weightRange =
    props.detail &&
    props.detail.weight.min !== null &&
    props.detail.weight.max !== null
      ? `${formatWeight(props.detail.weight.min)} 〜 ${formatWeight(props.detail.weight.max)}`
      : null

  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-2 py-4 md:px-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">{t("ホーム", "Home")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/models/library">
                {t("モデルライブラリ", "Model library")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="break-all">{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-4 md:flex-row md:items-start">
        {images[0] && (
          <img
            src={images[0]}
            alt={title}
            className="aspect-square w-full rounded-2xl object-cover md:w-72"
            loading="eager"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{t("公式 LoRA", "Official LoRA")}</Badge>
            <Badge variant="outline">{familyLabel}</Badge>
            {props.detail && props.detail.baseModel !== "SDXL 1.0" && (
              <Badge variant="outline">{props.detail.baseModel}</Badge>
            )}
            {props.lora?.genre && (
              <Badge variant="outline">{props.lora.genre}</Badge>
            )}
          </div>
          <h1 className="break-all font-bold text-xl md:text-2xl">{title}</h1>
          {description.length > 0 && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          )}
          <div className="flex flex-col gap-1.5 rounded-xl border p-3">
            <span className="text-muted-foreground text-xs">
              {t("プロンプトに入れる例", "Add this to your prompt")}
            </span>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 break-all text-sm">
                {promptExample}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCopy}
                aria-label={t("コピー", "Copy")}
              >
                {isCopied ? (
                  <CheckIcon className="size-4" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
              </Button>
            </div>
            {weightRange && (
              <span className="text-muted-foreground text-xs">
                {t(
                  `強さの目安: ${weightRange}（おすすめ ${formatWeight(weight)}）`,
                  `Strength: ${weightRange} (recommended ${formatWeight(weight)})`,
                )}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to={`/generation?lora=${encodeURIComponent(name)}`}>
                <WandSparklesIcon className="mr-2 size-4" />
                {t("この LoRA で生成", "Generate with this LoRA")}
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/models/library">
                {t("ほかの LoRA を探す", "Browse more LoRAs")}
              </Link>
            </Button>
          </div>
          {family === "SDXL" && (
            <p className="text-muted-foreground text-xs">
              {t(
                "SDXL 系（SDXL・Illustrious・NoobAI など）のモデルで効きます。SD1.5・SD2 や Z-Image などのモデルでは反映されません。",
                "Works with SDXL-family models (SDXL, Illustrious, NoobAI and more). It has no effect on SD1.5/SD2 or DiT models such as Z-Image.",
              )}
            </p>
          )}
        </div>
      </header>

      {images.length > 1 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-base">{t("作例", "Examples")}</h2>
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {images.map((url) => (
              <li key={url}>
                <img
                  src={url}
                  alt={title}
                  className="aspect-[3/4] w-full rounded-xl object-cover"
                  loading="lazy"
                />
              </li>
            ))}
          </ul>
          {props.detail && (
            <p className="text-muted-foreground text-xs">
              {props.detail.imagesByAipictors
                ? t(
                    "作例は Aipictors の生成機でこの LoRA を使って生成した画像です。",
                    "Example images were generated with this LoRA on Aipictors.",
                  )
                : t(
                    "作例は配布元（Civitai）で公開されている画像です。",
                    "Example images are from the original page on Civitai.",
                  )}
            </p>
          )}
        </section>
      )}

      {props.detail && text && (
        <section className="flex flex-col gap-4 rounded-2xl border p-4 md:p-5">
          <h2 className="flex items-center gap-1.5 font-bold text-base md:text-lg">
            <InfoIcon className="size-5 text-muted-foreground" />
            {t(`${title}について`, `About ${title}`)}
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
                {t("使い方のコツ", "Tips")}
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
                {text.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
          {triggerWords.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <h3 className="font-bold text-sm">
                {t("トリガーワード", "Trigger words")}
              </h3>
              <ul className="flex flex-wrap gap-1.5">
                {triggerWords.map((word) => (
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
          <div className="flex flex-col gap-1 border-t pt-3">
            <a
              href={props.detail.source.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex w-fit items-center gap-1 text-sm underline underline-offset-2 hover:text-foreground"
            >
              {t(
                `${props.detail.source.label}で見る`,
                `View on ${props.detail.source.label}`,
              )}
              <ExternalLinkIcon className="size-3.5" />
            </a>
            <p className="text-muted-foreground text-xs">
              {t(
                `紹介文は${props.detail.source.label}で公開されている情報をもとに、Aipictors がまとめたものです。LoRA の権利は作者にあります。`,
                `Summarized by Aipictors from information published on ${props.detail.source.label}. All rights to the LoRA belong to its creator.`,
              )}
            </p>
          </div>
        </section>
      )}

      {props.related.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-base">
            {t("ほかの公式 LoRA", "More official LoRAs")}
          </h2>
          <ul className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {props.related.map((item) => (
              <li key={item.name}>
                <Link
                  to={`/models/lora/${encodeURIComponent(item.name)}`}
                  className="flex flex-col gap-1"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.displayName}
                      className="aspect-square w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="aspect-square w-full rounded-xl bg-muted" />
                  )}
                  <span className="line-clamp-2 text-xs">
                    {t(item.displayName, item.enDisplayName)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
