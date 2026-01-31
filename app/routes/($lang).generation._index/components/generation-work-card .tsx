import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { GenerationWorkLinkButton } from "~/routes/($lang).generation._index/components/generation-work-link-button"
import { useState } from "react"
import { toast } from "sonner"
import { GenerationWorkZoomUpButton } from "~/routes/($lang).generation._index/components/generation-work-zoom-up-button"
import { type FragmentOf, graphql } from "gql.tada"
import { GenerationUpdateSettingConfirmDialog } from "~/routes/($lang).generation._index/components/generation-update-setting-confirm-dialog"

type Props = {
  work: FragmentOf<typeof GenerationWorkCardFragment>
  isPreviewByHover: boolean
}

/**
 * 画像作品カード
 */
export function GenerationWorkCard (props: Props) {
  const [isHovered, setIsHovered] = useState(false)

  const context = useGenerationContext()

  const { send } = GenerationConfigContext.useActorRef()

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
      <GenerationUpdateSettingConfirmDialog
        title={props.work.title}
        largeThumbnailImageUrl={props.work.largeThumbnailImageURL}
        onRestore={() => {
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
      />
      {/* 拡大ボタン */}
      {isHovered && (
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

export const GenerationWorkCardFragment = graphql(
  `fragment GenerationWorkCard on WorkNode @_unmask {
    id
    title
    steps
    sampler
    scale
    vae
    prompt
    negativePrompt
    largeThumbnailImageURL
  }`,
)
