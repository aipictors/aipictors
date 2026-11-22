import {
  CheckIcon,
  ChevronDownIcon,
  ImageOffIcon,
  PlusIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Slider } from "~/components/ui/slider"
import { useUserModel } from "~/components/user-models/use-user-models"
import { useTranslation } from "~/hooks/use-translation"
import { parseUserLoraName } from "~/lib/user-models/generation"
import { loraFamilyLabel } from "~/lib/user-models/lora-compat"
import { cn } from "~/lib/utils"
import {
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
import {
  type SelectedLoraCompat,
  useLoraCompatibility,
} from "~/routes/($lang).generation._index/hooks/use-lora-compatibility"
import { toResizedImageUrl } from "~/utils/resized-image-url"

type ItemProps = {
  name: string
  thumbnailUrl: string | null
  source: string
  compat?: SelectedLoraCompat
  value: number
  onChange(value: number): void
  onDelete(): void
}

function LoraItem(props: ItemProps) {
  const t = useTranslation()
  const isUnusable = props.compat?.isUsable === false
  return (
    <li
      className={cn(
        "rounded-lg border bg-background p-2 pr-1.5",
        isUnusable && "border-amber-500/60 bg-amber-500/5",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
          {props.thumbnailUrl ? (
            <img
              src={toResizedImageUrl(props.thumbnailUrl, 96)}
              alt=""
              className="size-full object-cover"
              draggable={false}
            />
          ) : (
            <span className="flex size-full items-center justify-center text-muted-foreground">
              <ImageOffIcon className="size-4" />
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="truncate font-semibold text-sm leading-5"
            title={props.name}
          >
            {props.name}
          </p>
          <p className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground leading-4">
            <span>{props.source}</span>
            {props.compat?.label && (
              <span
                className={cn(
                  "rounded bg-muted px-1 font-medium text-foreground/80",
                  isUnusable &&
                    "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                )}
              >
                {t(`${props.compat.label}用`, `For ${props.compat.label}`)}
              </span>
            )}
          </p>
          {isUnusable && (
            <p className="mt-0.5 flex items-center gap-1 font-medium text-[11px] text-amber-700 leading-4 dark:text-amber-300">
              <TriangleAlertIcon className="size-3 shrink-0" />
              {t("今のモデルでは効きません", "Won't work with this model")}
            </p>
          )}
          <div className="mt-1 flex items-center gap-2">
            <Slider
              aria-label={t("ウェイト", "Weight")}
              value={[props.value]}
              min={-1}
              max={1}
              step={0.05}
              onValueChange={(value) => props.onChange(value[0])}
              className="flex-1"
            />
            <input
              type="number"
              value={Number.isNaN(props.value) ? "" : props.value.toFixed(2)}
              min={-1}
              max={1}
              step={0.05}
              onChange={(event) => {
                const value = Number(event.target.value)
                if (!Number.isNaN(value)) {
                  props.onChange(Math.min(1, Math.max(-1, value)))
                }
              }}
              className="h-7 w-16 rounded-md border bg-background px-2 text-right font-medium text-xs tabular-nums outline-none focus:border-ring"
              aria-label={t("ウェイト", "Weight")}
            />
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="size-7 shrink-0 rounded-full text-muted-foreground"
          onClick={props.onDelete}
          aria-label={t(`${props.name}を外す`, `Remove ${props.name}`)}
        >
          <XIcon className="size-3.5" />
        </Button>
      </div>
    </li>
  )
}

/**
 * みんなのモデルの LoRA（名前とサムネイルは API から）
 */
function UserLoraItem(
  props: Omit<ItemProps, "thumbnailUrl" | "source"> & {
    id: string
  },
) {
  const t = useTranslation()
  const { data } = useUserModel(props.id)
  return (
    <LoraItem
      {...props}
      name={data?.name ?? props.name}
      thumbnailUrl={data?.thumbnailUrl ?? null}
      source={t("みんなのモデル", "Community")}
    />
  )
}

/**
 * 生成画面の LoRA 欄（選択中の LoRA とウェイト、ライブラリから追加）
 */
export function GenerationLoraSection() {
  const t = useTranslation()
  const context = useGenerationContext()
  const library = useModelLibraryLauncher()
  const compat = useLoraCompatibility()

  const selected = context.promptLoraModels.map((text) => {
    const [name, value] = text.split(":")
    const parsed = Number.parseFloat(value)
    return { name, value: Number.isNaN(parsed) ? 1 : parsed }
  })

  const max = context.availableLoraModelsCount
  const isFull = selected.length >= max

  const openLibrary = () => {
    library.open({ kind: "LORA" })
  }

  return (
    <section className="space-y-2.5">
      <ConfigSectionHeader
        title="LoRA"
        tooltip={t(
          "LoRA には SD1.5 用と SDXL 系（SDXL・Illustrious・NoobAI・Pony）用があり、同じ種類のモデルでだけ効きます。",
          "LoRAs are made for SD1.5 or the SDXL family (SDXL, Illustrious, NoobAI, Pony) and only work with the same type of model.",
        )}
        aside={
          <span
            className={cn(
              "tabular-nums",
              isFull && "font-semibold text-foreground",
            )}
          >
            {selected.length} / {max}
          </span>
        }
      />

      {selected.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          {compat.checkpointFamily === "NONE"
            ? t(
                "今のモデルは LoRA に対応していません",
                "This model doesn't support LoRA",
              )
            : compat.checkpointFamily !== null
              ? t(
                  `画風やキャラクターを足せます（今のモデルには ${loraFamilyLabel(compat.checkpointFamily)} 用の LoRA が効きます）`,
                  `Add styles or characters (this model works with ${loraFamilyLabel(compat.checkpointFamily)} LoRAs)`,
                )
              : t("画風やキャラクターを足せます", "Add styles or characters")}
        </p>
      ) : (
        <ul className="space-y-2">
          {selected.map((lora) => {
            const userId = parseUserLoraName(lora.name)
            const onChange = (value: number) =>
              context.updateLoraModel(lora.name, value)
            const onDelete = () => context.changeLoraModel(lora.name)
            const loraCompat = compat.selected.find(
              (item) => item.name === lora.name,
            )
            if (userId) {
              return (
                <UserLoraItem
                  key={lora.name}
                  id={userId}
                  name={lora.name}
                  compat={loraCompat}
                  value={lora.value}
                  onChange={onChange}
                  onDelete={onDelete}
                />
              )
            }
            const official = context.imageLoraModels.find(
              (model) => model.name === lora.name,
            )
            return (
              <LoraItem
                key={lora.name}
                name={lora.name}
                thumbnailUrl={official?.thumbnailImageURL ?? null}
                source={official?.genre || t("公式", "Official")}
                compat={loraCompat}
                value={lora.value}
                onChange={onChange}
                onDelete={onDelete}
              />
            )
          })}
        </ul>
      )}

      {selected.length > 0 && <LoraCompatPanel compat={compat} />}

      <ConfigWideButton
        onClick={openLibrary}
        onMouseEnter={preloadModelLibrary}
        onFocus={preloadModelLibrary}
      >
        <PlusIcon />
        {t("LoRAを追加", "Add LoRA")}
      </ConfigWideButton>
    </section>
  )
}

/**
 * 選択中の LoRA に合うモデル。効かない LoRA があるときは目立たせて、すぐ切り替えられるようにする
 */
function LoraCompatPanel(props: {
  compat: ReturnType<typeof useLoraCompatibility>
}) {
  const t = useTranslation()
  const context = useGenerationContext()
  const library = useModelLibraryLauncher()
  const [isExpanded, setIsExpanded] = useState(false)

  const { compat } = props
  const hasUnusable = compat.unusable.length > 0
  const models = compat.recommendedModels.slice(0, hasUnusable ? 6 : 8)

  const grid = models.length > 0 && (
    <ConfigThumbGrid>
      {models.map((model) => (
        <ConfigThumbTile
          key={model.id}
          imageUrl={model.thumbnailImageURL ?? null}
          label={model.displayName ?? model.name}
          title={model.displayName ?? model.name}
          isSelected={context.config.modelId === model.id}
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
  )

  if (hasUnusable) {
    const names = compat.unusable
      .map((lora) => `「${lora.displayName}」`)
      .join("")
    const target = compat.targetFamily
      ? loraFamilyLabel(compat.targetFamily)
      : null
    return (
      <div className="space-y-2 rounded-lg border border-amber-500/50 bg-amber-500/5 p-2.5">
        <p className="flex items-start gap-1.5 text-xs leading-5">
          <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
          <span>
            {compat.checkpointFamily === "NONE"
              ? t(
                  `今のモデル（${compat.checkpointName}）は LoRA に対応していないため、${names}は生成に反映されません。`,
                  `The current model (${compat.checkpointName}) doesn't support LoRA, so ${names} won't be applied.`,
                )
              : t(
                  `${names}は${target ?? "別の種類"}用のため、今のモデル（${compat.checkpointName}）では効きません。`,
                  `${names} is made for ${target ?? "another type"}, so it won't work with the current model (${compat.checkpointName}).`,
                )}
          </span>
        </p>
        {grid && (
          <div className="space-y-1.5">
            <p className="font-semibold text-xs">
              {t(
                `${target ?? ""}のモデルに切り替える`,
                `Switch to a ${target ?? ""} model`,
              )}
            </p>
            {grid}
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            for (const lora of compat.unusable) {
              context.changeLoraModel(lora.name)
            }
          }}
          className="text-muted-foreground text-xs underline-offset-4 hover:text-foreground hover:underline"
        >
          {t(
            "効かない LoRA を外して、今のモデルで生成する",
            "Remove these LoRAs and keep this model",
          )}
        </button>
      </div>
    )
  }

  if (compat.checkpointFamily === null || models.length === 0) return null

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-1.5 text-left text-muted-foreground text-xs hover:text-foreground"
      >
        <CheckIcon className="size-3.5 shrink-0 text-emerald-500" />
        <span className="flex-1">
          {t("今のモデルで使えます", "Works with the current model")}
        </span>
        <span className="flex items-center gap-0.5">
          {t("このLoRAに合うモデル", "Models for this LoRA")}
          <ChevronDownIcon
            className={cn(
              "size-3.5 transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </span>
      </button>
      {isExpanded && grid}
    </div>
  )
}
