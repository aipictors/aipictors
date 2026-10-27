import { Link, useNavigate } from "@remix-run/react"
import { useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangleIcon,
  CalendarIcon,
  ChevronRightIcon,
  CopyIcon,
  ExternalLinkIcon,
  FlagIcon,
  HardDriveIcon,
  ImageOffIcon,
  Loader2Icon,
  PencilIcon,
  PlayIcon,
  Trash2Icon,
  WandSparklesIcon,
} from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Button } from "~/components/ui/button"
import {
  userModelsQueryKeys,
  useUserModel,
} from "~/components/user-models/use-user-models"
import { UserModelAuthor } from "~/components/user-models/user-model-author"
import { UserModelCard } from "~/components/user-models/user-model-card"
import {
  UserModelBaseBadge,
  UserModelKindBadge,
  UserModelRatingBadge,
} from "~/components/user-models/user-model-badges"
import { UserModelDeleteDialog } from "~/components/user-models/user-model-delete-dialog"
import { UserModelEditDialog } from "~/components/user-models/user-model-edit-dialog"
import { UserModelReportDialog } from "~/components/user-models/user-model-report-dialog"
import { AuthContext } from "~/contexts/auth-context"
import {
  baseModelLabel,
  kindLabel,
  ratingLabel,
} from "~/lib/user-models/constants"
import {
  formatBytes,
  formatCount,
  normalizeLoraWeight,
  splitTriggerWords,
  toUserLoraName,
} from "~/lib/user-models/generation"
import {
  licenseNoteText,
  unsupportedBaseNoteText,
} from "~/lib/user-models/import-utils"
import type { UserModel } from "~/lib/user-models/types"
import { cn } from "~/lib/utils"
import { toDateText } from "~/utils/to-date-text"

type Props = {
  id: string
  initialModel: UserModel | null
  /** 同じ系統・種類のモデル（サーバーで取得） */
  relatedModels?: UserModel[]
}

const copyText = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast(`${label}をコピーしました`)
  } catch {
    toast("コピーできませんでした")
  }
}

const sourceSiteName = (url: string): string => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "")
    return /^civitai\./.test(host) ? "Civitai" : host
  } catch {
    return url
  }
}

/**
 * URL から取り込んだモデルの出典（元のモデル・作者）とライセンス・系統の注意書き
 */
function UserModelSource(props: { model: UserModel }) {
  const { model } = props
  const licenseNote = licenseNoteText(model.sourceLicenseAllowsOtherServices)
  const baseNote = unsupportedBaseNoteText(
    model.baseModel,
    model.sourceBaseModel,
  )
  if (!model.sourceUrl && !baseNote) return null
  return (
    <div className="space-y-2 rounded-xl border bg-muted/30 px-3.5 py-3 text-xs leading-relaxed">
      {model.sourceUrl && (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">元のモデル</dt>
          <dd>
            <a
              href={model.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              {sourceSiteName(model.sourceUrl)} で見る
              <ExternalLinkIcon className="size-3" />
            </a>
          </dd>
          {model.sourceCreator && (
            <>
              <dt className="text-muted-foreground">作者</dt>
              <dd className="truncate font-medium">{model.sourceCreator}</dd>
            </>
          )}
        </dl>
      )}
      {licenseNote && (
        <p className="flex gap-1.5 text-amber-700 dark:text-amber-400">
          <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
          {licenseNote}
        </p>
      )}
      {baseNote && (
        <p className="flex gap-1.5 text-amber-700 dark:text-amber-400">
          <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
          {baseNote}
        </p>
      )}
    </div>
  )
}

function StatItem(props: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-muted/60 px-3 py-2.5">
      <span className="flex items-center gap-1 text-muted-foreground text-xs">
        {props.icon}
        {props.label}
      </span>
      <span className="font-semibold text-sm tabular-nums">{props.value}</span>
    </div>
  )
}

/**
 * みんなのモデルの詳細
 */
export function UserModelDetail(props: Props) {
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const query = useUserModel(props.id)
  const model = query.data ?? props.initialModel

  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  if (!model) {
    if (query.isLoading) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      )
    }
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
        <ImageOffIcon className="size-10 text-muted-foreground" />
        <p className="font-semibold">モデルが見つかりませんでした</p>
        <p className="text-muted-foreground text-sm">
          {query.error instanceof Error
            ? query.error.message
            : "削除されたか、URL が間違っている可能性があります"}
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/models">モデル一覧へ</Link>
        </Button>
      </div>
    )
  }

  const isOwner = authContext.isLoggedIn && authContext.userId === model.userId
  const images = Array.from(
    new Set(
      [model.thumbnailUrl, ...model.sampleImageUrls].filter(
        (url): url is string => typeof url === "string" && url.length > 0,
      ),
    ),
  )
  const mainImage = activeImage ?? images[0] ?? null
  const triggerWords = splitTriggerWords(model.triggerWords)
  const weight = normalizeLoraWeight(model.recommendedWeight)
  const isReady = model.status === "READY"

  const loraTag = `<lora:${toUserLoraName(model.id)}:${weight}>`

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-xl) px-3 py-4 md:px-6 md:py-6">
      <nav
        aria-label="パンくずリスト"
        className="mb-4 flex items-center gap-1 overflow-x-auto whitespace-nowrap text-muted-foreground text-xs"
      >
        <Link to="/" className="hover:text-foreground">
          ホーム
        </Link>
        <ChevronRightIcon className="size-3 shrink-0" />
        <Link to="/models" className="hover:text-foreground">
          モデル
        </Link>
        <ChevronRightIcon className="size-3 shrink-0" />
        <span className="truncate text-foreground">{model.name}</span>
      </nav>

      {model.status !== "READY" && (
        <div
          className={cn(
            "mb-4 flex items-start gap-2 rounded-xl border p-3 text-sm",
            model.status === "DISABLED"
              ? "border-destructive/40 bg-destructive/5"
              : "border-amber-500/40 bg-amber-500/5",
          )}
        >
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
          <div>
            {model.status === "UPLOADING" && model.importStatus && (
              <p>
                {model.sourceUrl ? sourceSiteName(model.sourceUrl) : "URL"}{" "}
                から取り込み中です。完了すると生成に使えるようになります（大きなモデルは少し時間がかかります）
              </p>
            )}
            {model.status === "UPLOADING" && !model.importStatus && (
              <p>
                アップロードが完了していません。
                <Link to="/models/upload" className="font-medium underline">
                  同じファイルを選び直すと続きから再開できます
                </Link>
              </p>
            )}
            {model.status === "DISABLED" && (
              <p>
                このモデルは現在無効になっています。ファイルの検証に失敗したか、利用規約に沿わない内容として非公開になった可能性があります。
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        {/* 画像 */}
        <div className="flex flex-col gap-3">
          <div className="relative flex aspect-[4/5] max-h-[78vh] w-full items-center justify-center overflow-hidden rounded-2xl border bg-muted md:aspect-[4/3]">
            {mainImage ? (
              <>
                <img
                  src={mainImage}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-2xl"
                />
                <img
                  src={mainImage}
                  alt={`${model.name}のサンプル画像`}
                  fetchPriority="high"
                  className="relative max-h-full max-w-full object-contain"
                />
              </>
            ) : (
              <ImageOffIcon className="size-10 text-muted-foreground" />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  className={cn(
                    "size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity",
                    url === mainImage
                      ? "border-primary"
                      : "border-transparent opacity-70 hover:opacity-100",
                  )}
                  aria-label="サンプル画像を表示"
                >
                  <img
                    src={url}
                    alt={`${model.name}のサンプル画像`}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          {model.description && (
            <section className="mt-2 hidden rounded-2xl border p-5 lg:block">
              <h2 className="mb-2 font-semibold">説明</h2>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {model.description}
              </p>
            </section>
          )}
        </div>

        {/* 情報 */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <UserModelKindBadge kind={model.kind} />
              <UserModelBaseBadge
                baseModel={model.baseModel}
                className="bg-secondary text-secondary-foreground"
              />
              <UserModelRatingBadge rating={model.rating} />
            </div>
            <h1 className="break-words font-bold text-2xl leading-tight tracking-tight">
              {model.name}
            </h1>
            <UserModelAuthor
              userId={model.userId}
              user={model.user}
              size="md"
              linked
            />
            <UserModelSource model={model} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatItem
              icon={<PlayIcon className="size-3" />}
              label="使用回数"
              value={formatCount(model.useCount)}
            />
            <StatItem
              icon={<HardDriveIcon className="size-3" />}
              label="サイズ"
              value={formatBytes(model.sizeBytes)}
            />
            <StatItem
              icon={<CalendarIcon className="size-3" />}
              label="公開日"
              value={
                model.createdAt
                  ? toDateText(model.createdAt).replace(/^\d{4}年/, "")
                  : "-"
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              asChild={isReady}
              size="lg"
              disabled={!isReady}
              className="h-12 rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 font-bold text-base text-white shadow-lg hover:opacity-95"
            >
              {isReady ? (
                <Link to={`/generation?userModel=${model.id}`}>
                  <WandSparklesIcon className="mr-2 size-5" />
                  このモデルで生成
                </Link>
              ) : (
                <span>まだ生成に使えません</span>
              )}
            </Button>
            {model.kind === "LORA" && (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => copyText(loraTag, "LoRA タグ")}
              >
                <CopyIcon className="mr-1.5 size-4" />
                <code className="truncate text-xs">{loraTag}</code>
              </Button>
            )}
          </div>

          <dl className="divide-y rounded-2xl border text-sm">
            {triggerWords.length > 0 && (
              <div className="space-y-2 p-4">
                <dt className="flex items-center justify-between text-muted-foreground text-xs">
                  トリガーワード
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() =>
                      copyText(triggerWords.join(", "), "トリガーワード")
                    }
                  >
                    すべてコピー
                  </button>
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {triggerWords.map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => copyText(word, `「${word}」`)}
                      className="rounded-md bg-secondary px-2 py-1 font-mono text-xs hover:bg-secondary/70"
                    >
                      {word}
                    </button>
                  ))}
                </dd>
              </div>
            )}
            {model.kind === "LORA" && (
              <div className="flex items-center justify-between p-4">
                <dt className="text-muted-foreground text-xs">推奨ウェイト</dt>
                <dd className="font-semibold tabular-nums">{weight}</dd>
              </div>
            )}
            <div className="flex items-center justify-between p-4">
              <dt className="text-muted-foreground text-xs">ベースモデル</dt>
              <dd className="font-semibold">
                {model.baseModel === "OTHER" && model.sourceBaseModel
                  ? `その他（${model.sourceBaseModel}）`
                  : baseModelLabel(model.baseModel)}
              </dd>
            </div>
            <div className="flex items-center justify-between p-4">
              <dt className="text-muted-foreground text-xs">年齢区分</dt>
              <dd className="font-semibold">{ratingLabel(model.rating)}</dd>
            </div>
            {model.tags.length > 0 && (
              <div className="space-y-2 p-4">
                <dt className="text-muted-foreground text-xs">タグ</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {model.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/models?q=${encodeURIComponent(tag)}`}
                      className="rounded-full border px-2.5 py-0.5 text-xs hover:bg-secondary"
                    >
                      #{tag}
                    </Link>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          {model.description && (
            <section className="rounded-2xl border p-4 lg:hidden">
              <h2 className="mb-2 font-semibold text-sm">説明</h2>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {model.description}
              </p>
            </section>
          )}

          {isOwner && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1 rounded-xl"
                onClick={() => setIsEditOpen(true)}
              >
                <PencilIcon className="mr-1.5 size-4" />
                編集
              </Button>
              <Button
                variant="ghost"
                className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2Icon className="mr-1.5 size-4" />
                削除
              </Button>
            </div>
          )}

          {!isOwner && (
            <div className="flex justify-end">
              {authContext.isLoggedIn ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setIsReportOpen(true)}
                >
                  <FlagIcon className="mr-1 size-3.5" />
                  通報
                </Button>
              ) : (
                <LoginDialogButton
                  description="モデルを通報するにはログインしてください"
                  triggerChildren={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      disabled={authContext.isLoading}
                    >
                      <FlagIcon className="mr-1 size-3.5" />
                      通報
                    </Button>
                  }
                />
              )}
            </div>
          )}
        </aside>
      </div>

      <section
        aria-labelledby="model-about-heading"
        className="mt-10 rounded-2xl border bg-muted/30 p-5 md:p-7"
      >
        <h2 id="model-about-heading" className="mb-2 font-bold text-lg">
          {model.name}について
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {`${model.name}は${
            model.baseModel === "OTHER" && model.sourceBaseModel
              ? model.sourceBaseModel
              : baseModelLabel(model.baseModel)
          }向けの${kindLabel(model.kind)}です。`}
          {triggerWords.length > 0 &&
            `トリガーワード「${triggerWords.slice(0, 5).join("」「")}」をプロンプトに入れて使います。`}
          {model.kind === "LORA" && `推奨ウェイトは${weight}です。`}
          {`Aipictors の画像生成で「このモデルで生成」を押すとそのまま使えます${
            model.useCount > 0
              ? `（これまでに${formatCount(model.useCount)}回使われています）`
              : ""
          }。`}
          {model.sourceUrl &&
            `元のモデルは${sourceSiteName(model.sourceUrl)}で公開されています${
              model.sourceCreator ? `（作者: ${model.sourceCreator}）` : ""
            }。`}
        </p>
      </section>

      {(props.relatedModels?.length ?? 0) > 0 && (
        <section aria-labelledby="related-models-heading" className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 id="related-models-heading" className="font-bold text-lg">
              {baseModelLabel(model.baseModel)}の{kindLabel(model.kind)}をもっと見る
            </h2>
            <Link
              to={`/models?kind=${model.kind}&base=${model.baseModel}`}
              className="shrink-0 text-primary text-sm hover:underline"
            >
              すべて見る
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {props.relatedModels?.map((related) => (
              <UserModelCard key={related.id} model={related} blurSensitive />
            ))}
          </div>
        </section>
      )}

      {!isOwner && authContext.isLoggedIn && (
        <UserModelReportDialog
          model={model}
          isOpen={isReportOpen}
          onOpenChange={setIsReportOpen}
        />
      )}

      {isOwner && (
        <>
          <UserModelEditDialog
            model={model}
            isOpen={isEditOpen}
            onOpenChange={setIsEditOpen}
            onUpdated={(updated) => {
              queryClient.setQueryData(
                userModelsQueryKeys.detail(model.id),
                updated,
              )
            }}
          />
          <UserModelDeleteDialog
            model={model}
            isOpen={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onDeleted={() => navigate("/models/library?section=mine")}
          />
        </>
      )}
    </div>
  )
}
