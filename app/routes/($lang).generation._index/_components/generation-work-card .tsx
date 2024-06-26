import { AppConfirmDialog } from "@/_components/app/app-confirm-dialog"
import { SelectableCardButton } from "@/_components/selectable-card-button"
import { config } from "@/config"
import { GenerationConfigContext } from "@/routes/($lang).generation._index/_contexts/generation-config-context"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { GenerationWorkLinkButton } from "@/routes/($lang).generation._index/_components/generation-work-link-button"
import { useState } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"
import { GenerationWorkZoomUpButton } from "@/routes/($lang).generation._index/_components/generation-work-zoom-up-button"

type Props = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  work: any //NonNullable<WorkQuery["work"]>
  isPreviewByHover: boolean
}

/**
 * 画像作品カード
 */
export const GenerationWorkCard = (props: Props) => {
  const [isHovered, setIsHovered] = useState(false)

  const context = useGenerationContext()

  const { send } = GenerationConfigContext.useActorRef()

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <div
      className="relative grid h-full overflow-hidden rounded bg-card p-0"
      onMouseEnter={() => {
        if (props.isPreviewByHover) {
          context.updatePreviewImageURL(props.work.largeThumbnailImageURL)
          send({ type: "OPEN_WORK_PREVIEW" })
        }
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        if (props.isPreviewByHover) {
          context.updatePreviewImageURL(null)
          send({ type: "CLOSE" })
        }
        setIsHovered(false)
      }}
    >
      <AppConfirmDialog
        title={"確認"}
        description={"選択した作品で復元しますか？"}
        onNext={() => {
          context.updateSettings(
            context.config.modelId,
            props.work.steps ?? context.config.steps,
            context.config.modelType,
            props.work.sampler ?? context.config.sampler,
            props.work.scale ?? context.config.scale,
            props.work.vae ?? context.config.vae,
            props.work.prompt,
            props.work.negativePrompt,
            -1,
            context.config.sizeType,
            context.config.clipSkip,
            null,
            null,
            null,
            null,
          )
          toast("設定を復元しました")
        }}
        onCancel={() => {}}
      >
        <SelectableCardButton
          onClick={() => {}}
          isSelected={false}
          isDisabled={true}
        >
          <img src={props.work.largeThumbnailImageURL} alt={props.work.title} />
        </SelectableCardButton>
      </AppConfirmDialog>
      {/* 拡大ボタン */}
      {isDesktop && isHovered && (
        <GenerationWorkZoomUpButton
          imageUrl={props.work.largeThumbnailImageURL}
          setIsHovered={setIsHovered}
        />
      )}
      {/* 作品リンクボタン */}
      <GenerationWorkLinkButton
        id={props.work.id}
        setIsHovered={setIsHovered}
      />
    </div>
  )
}
