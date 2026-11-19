import { ImageOffIcon, PlusIcon, XIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Slider } from "~/components/ui/slider"
import { useUserModel } from "~/components/user-models/use-user-models"
import { useTranslation } from "~/hooks/use-translation"
import { parseUserLoraName } from "~/lib/user-models/generation"
import { cn } from "~/lib/utils"
import {
  ConfigSectionHeader,
  ConfigWideButton,
} from "~/routes/($lang).generation._index/components/config-view/generation-config-parts"
import {
  preloadModelLibrary,
  useModelLibraryLauncher,
} from "~/routes/($lang).generation._index/components/config-view/generation-model-library-provider"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { toResizedImageUrl } from "~/utils/resized-image-url"

type ItemProps = {
  name: string
  thumbnailUrl: string | null
  source: string
  value: number
  onChange(value: number): void
  onDelete(): void
}

function LoraItem(props: ItemProps) {
  const t = useTranslation()
  return (
    <li className="rounded-lg border bg-background p-2 pr-1.5">
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
          <p className="text-[11px] text-muted-foreground leading-4">
            {props.source}
          </p>
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
  const { data } = useUserModel(props.id)
  return (
    <LoraItem
      {...props}
      name={data?.name ?? props.name}
      thumbnailUrl={data?.thumbnailUrl ?? null}
      source="みんなのモデル"
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
          {t("画風やキャラクターを足せます", "Add styles or characters")}
        </p>
      ) : (
        <ul className="space-y-2">
          {selected.map((lora) => {
            const userId = parseUserLoraName(lora.name)
            const onChange = (value: number) =>
              context.updateLoraModel(lora.name, value)
            const onDelete = () => context.changeLoraModel(lora.name)
            if (userId) {
              return (
                <UserLoraItem
                  key={lora.name}
                  id={userId}
                  name={lora.name}
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
                value={lora.value}
                onChange={onChange}
                onDelete={onDelete}
              />
            )
          })}
        </ul>
      )}

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
