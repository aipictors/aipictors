import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationWorkZoomUpButton } from "@/app/[lang]/generation/tasks/_components/generation-work-zoom-up-button"
import { SelectableCardButton } from "@/app/_components/selectable-card-button"
import { config } from "@/config"
import type {
  WorkNode,
  WorkQuery,
  WorksQuery,
} from "@/graphql/__generated__/graphql"
import { useState } from "react"
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
          context.updatePreviewTaskId(props.work.imageURL)
          send({ type: "OPEN_HISTORY_PREVIEW" })
        }
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        context.updatePreviewTaskId(null)
        send({ type: "CLOSE" })
        setIsHovered(false)
      }}
    >
      <SelectableCardButton
        onClick={() => {}}
        isSelected={false}
        isDisabled={false}
      >
        <img src={props.work.largeThumbnailImageURL} alt={props.work.title} />
      </SelectableCardButton>
      {/* 拡大ボタン */}
      {isDesktop && isHovered && (
        <GenerationWorkZoomUpButton
          imageUrl={props.work.largeThumbnailImageURL}
          setIsHovered={setIsHovered}
        />
      )}
    </div>
  )
}
