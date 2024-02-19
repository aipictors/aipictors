import { SelectableCardButton } from "@/app/[lang]/generation/_components/selectable-card-button"
import { InProgressGenerationCard } from "@/app/[lang]/generation/tasks/_components/in-progress-generation-card"
import { PrivateImage } from "@/app/_components/private-image"

type Props = {
  taskId: string
  taskNanoid: string | null
  token: string | null
  isSelected?: boolean
  progress?: number
  remainingSeconds?: number
  onClick?(): void
  onCancel?(): void
}

/**
 * 画像生成の履歴
 * @returns
 */
export const GenerationResultCard = (props: Props) => {
  if (props.token == null || props.taskNanoid == null) {
    return (
      <InProgressGenerationCard
        remainingSeconds={props.remainingSeconds}
        onCancel={props.onCancel}
      />
    )
  }

  return (
    <SelectableCardButton onClick={props.onClick} isSelected={props.isSelected}>
      <PrivateImage
        className={`generation-image-${props.taskNanoid}`}
        taskId={props.taskId}
        token={props.token}
        alt={"-"}
      />
    </SelectableCardButton>
  )
}
