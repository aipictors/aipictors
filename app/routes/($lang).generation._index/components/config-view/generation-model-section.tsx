import {
  CrownIcon,
  FolderCogIcon,
  ImageOffIcon,
  ImagesIcon,
  LayoutGridIcon,
  LockIcon,
  PlusIcon,
  XIcon,
} from "lucide-react"
import { CoinIcon } from "~/components/coin-icon"
import { officialBaseModel } from "~/components/model-library/model-library-utils"
import { Button } from "~/components/ui/button"
import {
  formatPickupWeek,
  useUserModelPickup,
} from "~/components/user-models/user-model-pickup-banner"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { baseModelLabel } from "~/lib/user-models/constants"
import { cn } from "~/lib/utils"
import {
  isLiteOnlyModel,
  isNoQueueModel,
  isStandardOnlyModel,
  modelCoinCost,
} from "~/routes/($lang).generation._index/components/config-view/config-model-button"
import {
  ConfigHeaderAction,
  ConfigSectionHeader,
  ConfigThumbGrid,
  ConfigThumbTile,
  ConfigWideButton,
} from "~/routes/($lang).generation._index/components/config-view/generation-config-parts"
import {
  preloadModelLibrary,
  useModelLibraryLauncher,
} from "~/routes/($lang).generation._index/components/config-view/generation-model-library-provider"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"
import { toResizedImageUrl } from "~/utils/resized-image-url"

type Props = {
  onClickSearchModelWorks(id: string, name: string): void
}

/**
 * v2 などのバージョンは残したままアンダーバー以降の詳細を省く
 */
const trimModelName = (input: string) => {
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
 * 生成画面のモデル欄（選択中のモデル、すぐ選べるモデルのタイル、モデル一覧・管理・アップロード）
 */
export function GenerationModelSection(props: Props) {
  const t = useTranslation()
  const context = useGenerationContext()
  const userModelSelection = useUserModelSelection()
  const library = useModelLibraryLauncher()
  const { data: pickupData } = useUserModelPickup()

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

  // 週替わりのピックアップ（押すと選択される。選択中なら選択中のタイルに印を付ける）
  const pickup = pickupData ?? null
  const isPickupSelected =
    pickup !== null && userCheckpoint?.id === pickup.model.id
  const pickupTitle = pickup
    ? `${t("今週のピックアップモデル", "Model of the week")} ${formatPickupWeek(pickup)}: ${pickup.model.name}`
    : undefined

  return (
    <section className="space-y-2.5">
      <ConfigSectionHeader title={t("モデル", "Model")}>
        <ConfigHeaderAction
          onMouseEnter={preloadModelLibrary}
          onFocus={preloadModelLibrary}
          onClick={() => library.open({ section: "mine" })}
        >
          <FolderCogIcon />
          {t("モデルを管理", "Manage")}
        </ConfigHeaderAction>
        <ConfigHeaderAction
          onMouseEnter={preloadModelLibrary}
          onFocus={preloadModelLibrary}
          onClick={() =>
            library.open({ section: "mine", startWithUpload: true })
          }
        >
          <PlusIcon />
          {t("アップロード", "Upload")}
        </ConfigHeaderAction>
      </ConfigSectionHeader>

      {/* 選択中のモデル */}
      <div className="flex items-center gap-3 rounded-lg border bg-background p-2">
        <button
          type="button"
          onClick={openLibrary}
          onMouseEnter={preloadModelLibrary}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-label={t("モデルを変更", "Change model")}
        >
          <span className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
            {thumbnailUrl ? (
              <img
                src={toResizedImageUrl(thumbnailUrl, 96)}
                alt=""
                className="size-full object-cover"
                draggable={false}
              />
            ) : (
              <span className="flex size-full items-center justify-center text-muted-foreground">
                <ImageOffIcon className="size-5" />
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="block truncate font-semibold text-sm leading-5"
              title={name}
            >
              {name}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-1">
              <Tag>
                {userCheckpoint
                  ? t("みんなのモデル", "Community")
                  : t("公式", "Official")}
              </Tag>
              {isPickupSelected && (
                <Tag className="text-fuchsia-700 dark:text-fuchsia-300">
                  <CrownIcon className="size-3" />
                  {t("ピックアップ", "Pickup")}
                </Tag>
              )}
              {baseLabel && <Tag>{baseLabel}</Tag>}
              {!userCheckpoint && (
                <Tag>
                  <CoinIcon className="size-3" />
                  {coinCost}
                </Tag>
              )}
              {isLiteOnly && (
                <Tag>
                  <LockIcon className="size-3" />
                  {isStandardOnlyModel(officialModel?.name)
                    ? t("STANDARD以上", "STANDARD+")
                    : t("LITE以上", "LITE+")}
                </Tag>
              )}
              {isNoQueue && <Tag>{t("待ち人数なし", "No queue")}</Tag>}
            </span>
          </span>
        </button>
        {userCheckpoint ? (
          <Button
            size="icon"
            variant="ghost"
            className="size-8 shrink-0 rounded-full text-muted-foreground"
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
              className="size-8 shrink-0 rounded-full text-muted-foreground"
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
      </div>

      {isLiteOnly && (
        <p className="text-muted-foreground text-xs">
          {t(
            "Nano Banana はLite以上、Nano Banana 2 はStandard以上限定です",
            "Nano Banana requires Lite or above, Nano Banana 2 requires Standard or above",
          )}
        </p>
      )}

      {/* すぐ選べるモデル（選択中・今週のピックアップ・最近） */}
      {(recentModels.length > 0 || (pickup && !isPickupSelected)) && (
        <ConfigThumbGrid>
          <ConfigThumbTile
            imageUrl={thumbnailUrl}
            label={name}
            isSelected
            badge={isPickupSelected ? "PICKUP" : undefined}
            title={isPickupSelected ? pickupTitle : name}
            onClick={openLibrary}
            onMouseEnter={preloadModelLibrary}
          />
          {pickup && !isPickupSelected && (
            <ConfigThumbTile
              imageUrl={pickup.model.thumbnailUrl}
              label={pickup.model.name}
              badge="PICKUP"
              title={pickupTitle}
              render={(className, content) => (
                <Link
                  to={`/generation?userModel=${pickup.model.id}`}
                  className={className}
                >
                  {content}
                </Link>
              )}
            />
          )}
          {recentModels.map((model) => (
            <ConfigThumbTile
              key={model.id}
              imageUrl={model.thumbnailImageURL ?? null}
              label={trimModelName(model.displayName ?? model.name)}
              title={`${t("最近", "Recent")}: ${model.displayName ?? model.name}`}
              onClick={() =>
                library.selectOfficialModel(
                  model.id,
                  model.type,
                  model.prompts.join(","),
                )
              }
            />
          ))}
        </ConfigThumbGrid>
      )}

      <ConfigWideButton
        onClick={openLibrary}
        onMouseEnter={preloadModelLibrary}
        onFocus={preloadModelLibrary}
      >
        <LayoutGridIcon />
        {t("すべてのモデルを見る", "See all models")}
      </ConfigWideButton>
    </section>
  )
}
