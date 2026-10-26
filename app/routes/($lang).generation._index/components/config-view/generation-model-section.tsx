import {
  FolderCogIcon,
  ImageOffIcon,
  ImagesIcon,
  PlusIcon,
  XIcon,
} from "lucide-react"
import { CoinIcon } from "~/components/coin-icon"
import { officialBaseModel } from "~/components/model-library/model-library-utils"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { baseModelLabel } from "~/lib/user-models/constants"
import { cn } from "~/lib/utils"
import {
  isLiteOnlyModel,
  isNoQueueModel,
  modelCoinCost,
} from "~/routes/($lang).generation._index/components/config-view/config-model-button"
import {
  preloadModelLibrary,
  useModelLibraryLauncher,
} from "~/routes/($lang).generation._index/components/config-view/generation-model-library-provider"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"

type Props = {
  onClickSearchModelWorks(id: string, name: string): void
}

/**
 * v2 などのバージョンは残したままアンダーバー以降の詳細を省く
 */
export const trimModelName = (input: string) => {
  if (input === "blue_pencil-v10") {
    return "blue_pencil"
  }
  if (input === "lametta_v1745_fp16") {
    return "lametta"
  }
  const suffix = input.match(/_v\d+.*$/)?.[0]
  const underscoreIndex = input.indexOf("_")
  if (underscoreIndex !== -1) {
    return input.substring(0, underscoreIndex) + (suffix ?? "")
  }
  return input
}

export function SectionHeader(props: {
  title: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-2">
      <h3 className="font-semibold text-sm">{props.title}</h3>
      {props.children && (
        <div className="-mr-2 flex items-center">{props.children}</div>
      )}
    </div>
  )
}

function Tag(props: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-medium text-[11px] text-muted-foreground leading-none",
        props.className,
      )}
    >
      {props.children}
    </span>
  )
}

/**
 * 生成画面のモデル欄（選択中のモデルと変更・管理・アップロード）
 */
export function GenerationModelSection(props: Props) {
  const t = useTranslation()
  const context = useGenerationContext()
  const userModelSelection = useUserModelSelection()
  const library = useModelLibraryLauncher()

  const userCheckpoint = userModelSelection.checkpoint
  const officialModel = context.imageModels.find(
    (model) => model.id === context.config.modelId,
  )

  const name = userCheckpoint
    ? userCheckpoint.name
    : trimModelName(officialModel?.displayName ?? officialModel?.name ?? "")
  const thumbnailUrl = userCheckpoint
    ? userCheckpoint.thumbnailUrl
    : (officialModel?.thumbnailImageURL ?? null)
  const officialBase = officialModel ? officialBaseModel(officialModel) : null
  const baseLabel = userCheckpoint
    ? baseModelLabel(userCheckpoint.baseModel)
    : officialBase
      ? baseModelLabel(officialBase)
      : (officialModel?.type ?? null)

  const coinCost = modelCoinCost(officialModel?.name)
  const isNoQueue =
    !userCheckpoint && isNoQueueModel(officialModel?.name, officialModel?.type)
  const isLiteOnly = !userCheckpoint && isLiteOnlyModel(officialModel?.name)

  // 最近使った公式モデル（選択中以外を少しだけ）
  const recentModels = context.config.modelIds
    .map((id) => context.imageModels.find((model) => model.id === String(id)))
    .filter(
      (model): model is (typeof context.imageModels)[number] =>
        model !== undefined &&
        (userCheckpoint !== null || model.id !== context.config.modelId),
    )
    .slice(0, 4)

  const openLibrary = () => {
    library.open({ kind: "CHECKPOINT" })
  }

  return (
    <section className="space-y-2">
      <SectionHeader title={t("モデル", "Model")}>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1 px-2 text-muted-foreground text-xs hover:text-foreground"
          onMouseEnter={preloadModelLibrary}
          onFocus={preloadModelLibrary}
          onClick={() => library.open({ section: "mine" })}
        >
          <FolderCogIcon className="size-3.5" />
          {t("モデルを管理", "Manage")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1 px-2 text-primary text-xs hover:text-primary"
          onMouseEnter={preloadModelLibrary}
          onFocus={preloadModelLibrary}
          onClick={() =>
            library.open({ section: "mine", startWithUpload: true })
          }
        >
          <PlusIcon className="size-3.5" />
          {t("アップロード", "Upload")}
        </Button>
      </SectionHeader>

      <div className="flex items-center gap-3 rounded-xl border bg-background p-2 pr-2.5">
        <button
          type="button"
          onClick={openLibrary}
          onMouseEnter={preloadModelLibrary}
          className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted"
          aria-label={t("モデルを変更", "Change model")}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=""
              className="size-full object-cover"
              draggable={false}
            />
          ) : (
            <span className="flex size-full items-center justify-center text-muted-foreground">
              <ImageOffIcon className="size-5" />
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-sm leading-5" title={name}>
            {name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <Tag
              className={cn(
                userCheckpoint &&
                  "bg-violet-500/10 text-violet-700 dark:text-violet-300",
              )}
            >
              {userCheckpoint
                ? t("みんなのモデル", "Community")
                : t("公式", "Official")}
            </Tag>
            {baseLabel && <Tag>{baseLabel}</Tag>}
            {!userCheckpoint && (
              <Tag className="text-sky-700 dark:text-sky-300">
                <CoinIcon className="size-3" />
                {coinCost}
              </Tag>
            )}
            {isLiteOnly && (
              <Tag className="bg-amber-500/10 text-amber-700 dark:text-amber-400">
                {t("LITE以上", "LITE+")}
              </Tag>
            )}
            {isNoQueue && <Tag>{t("待ち人数なし", "No queue")}</Tag>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {userCheckpoint ? (
            <Button
              size="icon"
              variant="ghost"
              className="size-8 rounded-full text-muted-foreground"
              onClick={() => userModelSelection.clearCheckpoint()}
              aria-label={t("公式モデルに戻す", "Back to official model")}
              title={t("公式モデルに戻す", "Back to official model")}
            >
              <XIcon className="size-4" />
            </Button>
          ) : (
            officialModel && (
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded-full text-muted-foreground"
                onClick={() =>
                  props.onClickSearchModelWorks(
                    officialModel.id,
                    officialModel.displayName ?? "",
                  )
                }
                aria-label={t("このモデルの作品", "Works with this model")}
                title={t("このモデルの作品", "Works with this model")}
              >
                <ImagesIcon className="size-4" />
              </Button>
            )
          )}
          <Button
            size="sm"
            variant="secondary"
            className="h-8 rounded-full px-3.5"
            onClick={openLibrary}
            onMouseEnter={preloadModelLibrary}
          >
            {t("変更", "Change")}
          </Button>
        </div>
      </div>

      {isLiteOnly && (
        <p className="text-muted-foreground text-xs">
          {t(
            "Nano Banana / Nano Banana 2 はLite以上限定です（Liteは1日3回まで）",
            "Nano Banana / Nano Banana 2 require Lite or above (Lite: 3/day)",
          )}
        </p>
      )}

      {recentModels.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-muted-foreground text-xs">
            {t("最近", "Recent")}
          </span>
          <div className="flex min-w-0 gap-1.5 overflow-x-auto">
            {recentModels.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() =>
                  library.selectOfficialModel(
                    model.id,
                    model.type,
                    model.prompts.join(","),
                  )
                }
                className="flex h-8 max-w-40 shrink-0 items-center gap-1.5 rounded-full border bg-background py-0.5 pr-3 pl-0.5 text-xs transition-colors hover:bg-muted"
                title={model.displayName ?? model.name}
              >
                {model.thumbnailImageURL ? (
                  <img
                    src={model.thumbnailImageURL}
                    alt=""
                    className="size-6 shrink-0 rounded-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <span className="size-6 shrink-0 rounded-full bg-muted" />
                )}
                <span className="truncate">
                  {trimModelName(model.displayName ?? model.name)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
