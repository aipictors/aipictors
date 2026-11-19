import { useState } from "react"
import { BookOpenTextIcon, ImagesIcon, WandSparklesIcon } from "lucide-react"
import { Link } from "~/lib/app/locale-router"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

/** 画像生成で使えるモデルの情報（モデルの説明や種類） */
export type AiModelGenerationInfo = {
  id: string
  displayName: string
  explanation: string
  type: string
  style: IntrospectionEnum<"ImageStyle">
  thumbnailImageURL: string | null
}

type Props = {
  name: string
  thumbnailImageURL: string | null
  /** 今の条件（年齢区分・プロンプト有）の作品数 */
  worksCount: number
  isSensitive: boolean
  generation: AiModelGenerationInfo | null
  /** このモデルでよく使われる呪文のまとめ */
  promptHubPath: string | null
}

/**
 * モデルの作品一覧の見出し（パンくず・モデルの情報・生成ボタン）
 */
export function AiModelHeader(props: Props) {
  const t = useTranslation()

  const [isExplanationOpen, setIsExplanationOpen] = useState(false)

  const explanation = props.generation?.explanation.trim() ?? ""

  const thumbnailImageURL =
    props.generation?.thumbnailImageURL ?? props.thumbnailImageURL

  return (
    <header className="flex flex-col gap-3">
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
              <Link to="/models">{t("モデル一覧", "Models")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-48 truncate">
              {props.name}
              {props.isSensitive && " (R18)"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <section className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-br from-sky-500/10 via-violet-500/5 to-transparent p-4 md:flex-row md:items-center md:gap-5 md:p-5">
        <div className="flex min-w-0 flex-1 gap-4">
          {thumbnailImageURL && (
            <img
              src={thumbnailImageURL}
              alt={t(`${props.name}のサムネイル`, `${props.name} thumbnail`)}
              width={96}
              height={96}
              decoding="async"
              className="size-20 shrink-0 rounded-xl border object-cover md:size-24"
            />
          )}
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {props.generation && (
                <Badge variant="secondary">{props.generation.type}</Badge>
              )}
              {props.generation && (
                <Badge variant="outline">
                  {props.generation.style === "REAL"
                    ? t("リアル", "Real")
                    : props.generation.style === "SEMI_REAL"
                      ? t("セミリアル", "Semi-real")
                      : t("イラスト", "Illustration")}
                </Badge>
              )}
              {props.isSensitive && <Badge variant="destructive">R18</Badge>}
            </div>
            <h1 className="break-all font-bold text-xl leading-tight md:text-2xl">
              {props.name}
              <span className="ml-2 font-medium text-base text-muted-foreground md:text-lg">
                {t("の作品一覧", "works")}
              </span>
            </h1>
            <p className="flex items-center gap-1 text-muted-foreground text-sm">
              <ImagesIcon className="size-4" />
              {t(
                `${props.worksCount.toLocaleString()}件の作品`,
                `${props.worksCount.toLocaleString()} works`,
              )}
            </p>
            {explanation.length > 0 && (
              <div className="text-sm leading-relaxed">
                <p className={isExplanationOpen ? "" : "line-clamp-2"}>
                  {explanation}
                </p>
                {explanation.length > 60 && (
                  <button
                    type="button"
                    className="text-muted-foreground text-xs underline underline-offset-2 hover:text-foreground"
                    onClick={() => setIsExplanationOpen((value) => !value)}
                  >
                    {isExplanationOpen
                      ? t("閉じる", "Show less")
                      : t("続きを読む", "Read more")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {(props.generation || props.promptHubPath) && (
          <div className="flex shrink-0 gap-2 md:flex-col">
            {props.generation && (
              <Button asChild className="flex-1 rounded-full px-3 md:flex-none">
                <Link to={`/generation?model=${props.generation.id}`}>
                  <WandSparklesIcon className="mr-1.5 size-4" />
                  {t("このモデルで生成", "Generate with this model")}
                </Link>
              </Button>
            )}
            {props.promptHubPath && (
              <Button
                asChild
                variant="outline"
                className="flex-1 rounded-full px-3 md:flex-none"
              >
                <Link to={props.promptHubPath}>
                  <BookOpenTextIcon className="mr-1.5 size-4" />
                  {t("よく使われる呪文", "Popular prompts")}
                </Link>
              </Button>
            )}
          </div>
        )}
      </section>
    </header>
  )
}
