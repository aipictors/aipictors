import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationWorkLinkButton } from "@/app/[lang]/generation/tasks/_components/generation-work-link-button"
import { GenerationWorkZoomUpButton } from "@/app/[lang]/generation/tasks/_components/generation-work-zoom-up-button"
import { SelectableCardButton } from "@/app/_components/selectable-card-button"
import { AppConfirmDialog } from "@/components/app/app-confirm-dialog"
import { config } from "@/config"
import type { WorkQuery } from "@/graphql/__generated__/graphql"
import { useState } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  work: WorkQuery["work"]
  isPreviewByHover: boolean
}

/**
 * 画像作品カード
 * @returns
 */
export const GenerationWorkCard = (props: Props) => {
  const [isHovered, setIsHovered] = useState(false)

  const context = useGenerationContext()

  const { send } = GenerationConfigContext.useActorRef()

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  console.log(props.work)

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
            context.config.vae ?? context.config.vae,
            props.work.prompt,
            props.work.negativePrompt,
            -1,
            context.config.sizeType,
            context.config.clipSkip,
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
